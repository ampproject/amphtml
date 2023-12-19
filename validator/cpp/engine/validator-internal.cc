#include <algorithm>
#include <fstream>
#include <map>
#include <memory>
#include <string>
#include <unordered_map>
#include <unordered_set>

#include "google/protobuf/repeated_field.h"
#include "absl/algorithm/container.h"
#include "absl/base/thread_annotations.h"
#include "absl/container/flat_hash_map.h"
#include "absl/container/flat_hash_set.h"
#include "absl/container/node_hash_map.h"
#include "absl/container/node_hash_set.h"
#include "absl/flags/flag.h"
#include "absl/memory/memory.h"
#include "absl/status/status.h"
#include "absl/strings/cord.h"
#include "absl/strings/match.h"
#include "absl/strings/numbers.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_join.h"
#include "absl/strings/string_view.h"
#include "absl/strings/strip.h"
#include "absl/strings/substitute.h"
#include "absl/synchronization/mutex.h"
#include "cpp/engine/keyframes-parse-css.h"
#include "cpp/engine/parse-layout.h"
#include "cpp/engine/parse-srcset.h"
#include "cpp/engine/parse-viewport.h"
#include "cpp/engine/type-identifier.h"
#include "cpp/engine/utf8-util.h"
#include "cpp/engine/validator_pb.h"
#include "cpp/htmlparser/atom.h"
#include "cpp/htmlparser/atomutil.h"
#include "cpp/htmlparser/css/amp4ads-parse-css.h"
#include "cpp/htmlparser/css/parse-css.h"
#include "cpp/htmlparser/css/parse-css.pb.h"
#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/elements.h"
#include "cpp/htmlparser/logging.h"
#include "cpp/htmlparser/node.h"
#include "cpp/htmlparser/parser.h"
#include "cpp/htmlparser/strings.h"
#include "cpp/htmlparser/url.h"
#include "cpp/htmlparser/validators/json.h"
#include "validator.pb.h"
#include "re2/re2.h"  // NOLINT(build/deprecated)

using absl::AsciiStrToLower;
using absl::AsciiStrToUpper;
using absl::ByAnyChar;
using absl::c_copy;
using absl::c_find;
using absl::c_linear_search;
using absl::EndsWith;
using absl::EqualsIgnoreCase;
using absl::flat_hash_map;
using absl::flat_hash_set;
using absl::GetFlag;
using absl::InvalidArgumentError;
using absl::make_unique;
using absl::node_hash_set;
using absl::OkStatus;
using absl::StartsWith;
using absl::Status;
using absl::StrAppend;
using absl::StrCat;
using absl::StrContains;
using absl::string_view;
using absl::StrJoin;
using absl::StrSplit;
using amp::validator::parse_layout::CssLength;
using htmlparser::URL;
using htmlparser::css::BlockType;
using htmlparser::css::CssParsingConfig;
using google::protobuf::RepeatedPtrField;
using std::pair;
using std::set;
using std::shared_ptr;
using std::unique_ptr;
using std::unordered_map;
using std::unordered_set;
using std::vector;

ABSL_FLAG(int, max_node_recursion_depth, 200,
          "Maximum recursion depth of nodes, if stack of nodes grow beyond this"
          "validator will stop parsing with FAIL result");

namespace amp::validator {

// Standard and Nomodule JavaScript:
// v0.js
// v0/amp-ad-0.1.js
static const LazyRE2 kStandardScriptPathRe = {
    R"re((v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\.js)re"};

// LTS and Nomodule LTS JavaScript:
// lts/v0.js
// lts/v0/amp-ad-0.1.js
static const LazyRE2 kLtsScriptPathRe = {
    R"re(lts/(v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\.js)re"};

// Module JavaScript:
// v0.mjs
// v0/amp-ad-0.1.mjs
static const LazyRE2 kModuleScriptPathRe = {
    R"re((v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\.mjs)re"};

// Module LTS JavaScript:
// lts/v0.mjs
// lts/v0/amp-ad-0.1.mjs
static const LazyRE2 kModuleLtsScriptPathRe = {
    R"re(lts/(v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\.mjs)re"};

// Runtime JavaScript:
// v0.js
// v0.mjs
// v0.mjs?f=sxg
// lts/v0.js
// lts/v0.js?f=sxg
// lts/v0.mjs
static const LazyRE2 kRuntimeScriptPathRe = {
    R"re((lts/)?v0\.m?js(\?f=sxg)?)re"};

static const LazyRE2 kExtensionPathRe = {
    R"re((?:lts/)?v0/(amp-[a-z0-9-]*)-([a-z0-9.]*)\.(?:m)?js(?:\?f=sxg)?)re"};

// Generates a htmlparser::css::CssParsingConfig.
CssParsingConfig GenCssParsingConfig() {
  CssParsingConfig config;
  // If other @ rule types are added to the rules, their block parsing types
  // will need to be added here as well.
  config.at_rule_spec["font-face"] = BlockType::PARSE_AS_DECLARATIONS;
  config.at_rule_spec["keyframes"] = BlockType::PARSE_AS_RULES;
  config.at_rule_spec["media"] = BlockType::PARSE_AS_RULES;
  config.at_rule_spec["page"] = BlockType::PARSE_AS_DECLARATIONS;
  config.at_rule_spec["supports"] = BlockType::PARSE_AS_RULES;
  config.at_rule_spec["-moz-document"] = BlockType::PARSE_AS_RULES;
  // Note that ignoring still generates an error.
  config.default_spec = BlockType::PARSE_AS_IGNORE;
  return config;
}

namespace {

#define CHECK_NOTNULL(x) (x)

// Sorts and eliminates duplicates in |v|.
template <typename T>
void SortAndUniquify(vector<T>* v) {
  std::stable_sort(v->begin(), v->end());
  v->erase(std::unique(v->begin(), v->end()), v->end());
}

// Computes the difference set |left| - |right|, assuming |left| and
// |right| are sorted and uniquified.
template <typename T>
vector<T> Diff(const vector<T>& left, const vector<T>& right) {
  vector<T> diff;
  std::set_difference(left.begin(), left.end(), right.begin(), right.end(),
                      inserter(diff, diff.begin()));
  return diff;
}

// A line / column pair.
class LineCol {
 public:
  LineCol(int line, int col) : line_(line), col_(col) {}
  int line() const { return line_; }
  int col() const { return col_; }
  void set_line(int line) { line_ = line; }
  void set_col(int col) { col_ = col; }

 private:
  int line_;
  int col_;
};

ValidationError PopulateError(ValidationError::Severity severity,
                              ValidationError::Code code, LineCol line_col,
                              const vector<std::string>& params,
                              const std::string& spec_url) {
  ValidationError error;
  error.set_severity(severity);
  error.set_code(code);
  for (const std::string& param : params) {
    error.add_params(param);
  }
  error.set_line(line_col.line());
  error.set_col(line_col.col());
  if (!spec_url.empty()) error.set_spec_url(spec_url);
  return error;
}

class ParsedTagSpec;

std::string TagSpecName(const TagSpec& spec);
std::string TagDescriptiveName(const TagSpec& spec);
std::string TagSpecUrl(const TagSpec& spec);
std::string TagSpecUrl(const ParsedTagSpec& parsed_tag_spec);

// Whether a spec is used based on the given type identifiers and if those
// type identifiers appear in enabled_by or disabled_by.
bool IsUsedForTypeIdentifiers(const vector<TypeIdentifier>& type_identifiers,
                              const vector<TypeIdentifier>& enabled_bys,
                              const vector<TypeIdentifier>& disabled_bys) {
  if (!enabled_bys.empty()) {
    for (auto& enabled_by : enabled_bys) {
      // Is enabled by a given type identifier, use.
      if (c_find(type_identifiers, enabled_by) != type_identifiers.end())
        return true;
    }
    // Is not enabled for these type identifiers, do not use.
    return false;
  } else if (!disabled_bys.empty()) {
    for (auto& disabled_by : disabled_bys) {
      // Is disabled by a given type identifier, do not use.
      if (c_find(type_identifiers, disabled_by) != type_identifiers.end())
        return false;
    }
    // Is not disabled for these type identifiers, use.
    return true;
  }
  // Is not enabled nor disabled for any type identifiers, use.
  return true;
}

// A vector of these is returned by ParsedHtmlTag::Attributes().
class ParsedHtmlTagAttr {
 public:
  const std::string& name() const { return attr_name_; }
  const std::string& value() const { return attr_value_; }

  ParsedHtmlTagAttr(ParsedHtmlTagAttr&&) = default;
  ParsedHtmlTagAttr(const ParsedHtmlTagAttr&) = default;
  ParsedHtmlTagAttr& operator=(const ParsedHtmlTagAttr&) = default;

 private:
  friend class ParsedHtmlTag;
  ParsedHtmlTagAttr(const std::string& name, const std::string& value)
      : attr_name_(AsciiStrToLower(name)), attr_value_(value) {}

  std::string attr_name_;   // Stored lower-cased, regardless of original case.
  std::string attr_value_;  // Stored unescaped.
};                          // class ParsedHtmlTagAttr

// If any script in the page uses a specific release version, then all scripts
// must use that specific release version. This is used to record the first seen
// script tag and ensure all following script tags follow the convention set by
// it.
enum ScriptReleaseVersion {
  UNKNOWN,
  STANDARD,
  LTS,
  MODULE_NOMODULE,
  MODULE_NOMODULE_LTS
};

std::string ScriptReleaseVersionToString(ScriptReleaseVersion version) {
  switch (version) {
    case ScriptReleaseVersion::UNKNOWN:
      return "unknown";
    case ScriptReleaseVersion::STANDARD:
      return "standard";
    case ScriptReleaseVersion::LTS:
      return "LTS";
    case ScriptReleaseVersion::MODULE_NOMODULE:
      return "module/nomodule";
    case ScriptReleaseVersion::MODULE_NOMODULE_LTS:
      return "module/nomodule LTS";
  }
  return "";
}

inline constexpr string_view kAmpProjectDomain = "https://cdn.ampproject.org/";

struct ScriptTag {
  std::string extension_name;
  std::string extension_version;
  std::string path;
  bool is_amp_domain = false;
  bool is_extension = false;
  bool is_runtime = false;
  bool has_valid_path = false;
  ScriptReleaseVersion release_version = ScriptReleaseVersion::UNKNOWN;
};

ScriptTag ParseScriptTag(htmlparser::Node* node) {
  ScriptTag script_tag;
  bool has_async_attr = false;
  bool has_module_attr = false;
  bool has_nomodule_attr = false;
  string_view src;

  for (const auto& attr : node->Attributes()) {
    std::string attr_name = attr.KeyPart();
    if (attr_name == "async") {
      has_async_attr = true;
    } else if ((attr_name == "custom-element") ||
               (attr_name == "custom-template") ||
               (attr_name == "host-service")) {
      script_tag.is_extension = true;
    } else if (attr_name == "nomodule") {
      has_nomodule_attr = true;
    } else if (attr_name == "src") {
      src = attr.value;
    } else if ((attr_name == "type") && (attr.value == "module")) {
      has_module_attr = true;
    }
  }

  if (src.empty()) {
    return script_tag;
  }

  std::string src_str{src};
  // Determine if this has a valid AMP domain and separate the path from the
  // attribute 'src'. Consumes the domain making src just the path.
  if (absl::ConsumePrefix(&src, kAmpProjectDomain)) {
    script_tag.is_amp_domain = true;
    script_tag.path = src_str;
  } else {
    script_tag.is_amp_domain = false;
    htmlparser::URL url(src_str);
    // Error cases, early exit:
    if (!url.is_valid()) return script_tag;
    if (!url.has_protocol()) return script_tag;
    if (url.protocol() != "https" && url.protocol() != "http")
      return script_tag;
    if (url.hostname().empty()) return script_tag;

    src = url.path_params_fragment().data();
    // Trim the "/" prefix as this is what kExtensionPathRe expects.
    if (!src.empty() && src[0] == '/') src = src.substr(1);
    std::string src_str{src};
    script_tag.path = src_str;
  }

  // Only look at script tags that have attribute 'async'.
  if (has_async_attr) {
    // Determine if this is the AMP Runtime.
    if (!script_tag.is_extension &&
        RE2::FullMatch(src, *kRuntimeScriptPathRe)) {
      script_tag.is_runtime = true;
      script_tag.has_valid_path = true;
    }

    // For AMP Extensions, validate path and extract name and version.
    if (script_tag.is_extension &&
        RE2::FullMatch(src, *kExtensionPathRe, &script_tag.extension_name,
                       &script_tag.extension_version)) {
      script_tag.has_valid_path = true;
    }

    // Determine the release version (LTS, module, standard, etc).
    if ((has_module_attr && RE2::FullMatch(src, *kModuleLtsScriptPathRe)) ||
        (has_nomodule_attr && RE2::FullMatch(src, *kLtsScriptPathRe))) {
      script_tag.release_version = ScriptReleaseVersion::MODULE_NOMODULE_LTS;
    } else if ((has_module_attr &&
                RE2::FullMatch(src, *kModuleScriptPathRe)) ||
               (has_nomodule_attr &&
                RE2::FullMatch(src, *kStandardScriptPathRe))) {
      script_tag.release_version = ScriptReleaseVersion::MODULE_NOMODULE;
    } else if (RE2::FullMatch(src, *kLtsScriptPathRe)) {
      script_tag.release_version = ScriptReleaseVersion::LTS;
    } else if (RE2::FullMatch(src, *kStandardScriptPathRe)) {
      script_tag.release_version = ScriptReleaseVersion::STANDARD;
    }
  }
  return script_tag;
}

class ParsedHtmlTag {
 public:
  explicit ParsedHtmlTag(htmlparser::Node* node) : node_(node) {
    if (node->Type() == htmlparser::NodeType::DOCTYPE_NODE) {
      if (node->Data() == "html") {
        node_->AddAttribute({.key = "html", .value = ""});
      }

      node_->SetData("!DOCTYPE");
      lower_tag_name_ = "!doctype";
      upper_tag_name_ = "!DOCTYPE";
    } else {
      std::string tagname =
          htmlparser::AtomUtil::ToString(node_->DataAtom(), node_->Data());
      lower_tag_name_ = AsciiStrToLower(tagname);
      upper_tag_name_ = AsciiStrToUpper(tagname);
    }
    node_->SortAttributes(false);
    for (const auto& attr : node_->Attributes()) {
      attributes_.push_back(ParsedHtmlTagAttr{attr.KeyPart(), attr.value});
    }
    if (node_->DataAtom() == htmlparser::Atom::SCRIPT)
      script_tag_ = ParseScriptTag(node);
  }

  // New Methods
  const std::string& LowerName() const { return lower_tag_name_; }

  const std::string& UpperName() const { return upper_tag_name_; }

  std::optional<std::string> HasDuplicateAttrs() const {
    // Attributes were sorted in constructor.
    std::string last_attr_name;
    std::string last_attr_value;
    for (const auto& attr_it : node_->Attributes()) {
      if (EqualsIgnoreCase(last_attr_name, attr_it.KeyPart()) &&
          last_attr_value != attr_it.value) {
        return attr_it.KeyPart();
      }
      last_attr_name = attr_it.KeyPart();
      last_attr_value = attr_it.value;
    }
    return std::nullopt;
  }

  bool IsManufacturedBodyTag() const {
    return node_->DataAtom() == htmlparser::Atom::BODY &&
           node_->IsManufactured();
  }

  bool IsManufacturedHtmlTag() const {
    return node_->DataAtom() == htmlparser::Atom::HTML &&
           node_->IsManufactured();
  }

  bool IsEmpty() const { return node_->Data().empty(); }

  bool IsExtensionScript() const { return script_tag_.is_extension; }

  bool IsAmpDomain() const { return script_tag_.is_amp_domain; }

  bool IsAmpRuntimeScript() const { return script_tag_.is_runtime; }

  std::string GetExtensionName() const { return script_tag_.extension_name; }

  std::string GetExtensionVersion() const {
    return script_tag_.extension_version;
  }

  ScriptReleaseVersion GetScriptReleaseVersion() const {
    return script_tag_.release_version;
  }

  std::string GetAmpScriptPath() const { return script_tag_.path; }

  bool HasValidAmpScriptPath() const { return script_tag_.has_valid_path; }

  const vector<ParsedHtmlTagAttr>& Attributes() const { return attributes_; }

  std::optional<string_view> GetAttr(string_view attr_name) const {
    // Since tags don't have lots of attrs, linear search is probably ok.
    for (const auto& attr : attributes_) {
      if (attr.name() == attr_name) return attr.value();
    }
    return std::nullopt;
  }

  // Simplification of AppendTagToString.
  std::string ToString() const {
    // TODO: This need some work. Make it work for text node, comment node etc.
    if (node_->Type() == htmlparser::NodeType::ELEMENT_NODE) {
      return "<" +
             htmlparser::AtomUtil::ToString(node_->DataAtom(), node_->Data()) +
             ">";
    }

    return "";
  }

 private:
  htmlparser::Node* node_;
  std::string lower_tag_name_;
  std::string upper_tag_name_;
  ScriptTag script_tag_;
  vector<ParsedHtmlTagAttr> attributes_;
  ParsedHtmlTag(const ParsedHtmlTag&) = delete;
  ParsedHtmlTag operator=(const ParsedHtmlTag&) = delete;
};

class ParsedUrlSpec {
 public:
  // In the Javascript version of the code, |spec| may be null. In
  // C++, it's never null but it could be UrlSpec::default_instance().
  explicit ParsedUrlSpec(const UrlSpec* spec)
      : spec_(spec),
        allowed_protocols_(spec->protocol().begin(), spec->protocol().end()) {}

  bool IsAllowedProtocol(const std::string& protocol) const {
    return allowed_protocols_.find(protocol) != allowed_protocols_.end();
  }

  const UrlSpec* spec() const { return spec_; }

 private:
  const UrlSpec* spec_;
  node_hash_set<std::string> allowed_protocols_;
};

// ParsedAttrTriggerSpec is used by ParsedAttrSpec to determine which
// attributes also require another attribute for some given set of
// conditions.
// (e.g. attr name: "on" if_value_regex: "tap:.*" also_require_attr: "role")
class ParsedAttrTriggerSpec {
 public:
  explicit ParsedAttrTriggerSpec(const AttrSpec* attr_spec)
      : spec_(&attr_spec->trigger()), attr_name_(attr_spec->name()) {
    if (spec_->has_if_value_regex())
      if_value_regex_ = make_unique<RE2>(spec_->if_value_regex());
  }

  bool has_if_value_regex() const { return if_value_regex_ != nullptr; }
  // You must check has_if_value_regex() before accessing.
  const RE2& if_value_regex() const { return *if_value_regex_; }

  const std::string& attr_name() const { return attr_name_; }
  const AttrTriggerSpec& spec() const { return *spec_; }

 private:
  const AttrTriggerSpec* spec_;
  const std::string attr_name_;
  unique_ptr<RE2> if_value_regex_;
};

// This wrapper class provides access to an AttrSpec and
// an attribute id which is unique within its context
// (e.g., it's unique within the ParsedTagSpec).
class ParsedAttrSpec {
 public:
  ParsedAttrSpec(const AttrSpec* spec, int32_t id)
      : spec_(spec),
        id_(id),
        trigger_spec_(spec),
        value_url_spec_(&spec_->value_url()) {
    // Store the enum of the AttrSpec's type identifiers.
    for (const std::string& disabled_by : spec_->disabled_by()) {
      disabled_by_.push_back(GetTypeIdentifier(disabled_by));
    }
    for (const std::string& enabled_by : spec_->enabled_by()) {
      enabled_by_.push_back(GetTypeIdentifier(enabled_by));
    }
    if (spec_->has_value_regex())
      value_regex_ = make_unique<RE2>(spec_->value_regex());
    if (spec_->has_value_regex_casei()) {
      RE2::Options options;
      options.set_case_sensitive(false);
      value_regex_ = make_unique<RE2>(spec_->value_regex_casei(), options);
    }
    if (spec_->has_disallowed_value_regex()) {
      RE2::Options options;
      options.set_case_sensitive(false);
      disallowed_value_regex_ =
          make_unique<RE2>(spec_->disallowed_value_regex(), options);
    }
    for (auto& css_declaration : spec_->css_declaration()) {
      css_declaration_by_name_[css_declaration.name()] = &css_declaration;
    }
    for (int ii = 0; ii < spec_->value_properties().properties_size(); ++ii) {
      const PropertySpec& property_spec =
          spec_->value_properties().properties(ii);
      value_property_by_name_[property_spec.name()] = &property_spec;
      if (property_spec.mandatory())
        mandatory_value_properties_.push_back(&property_spec);
    }
    // Sort by address to make diffing more efficient.
    SortAndUniquify(&mandatory_value_properties_);
  }
  ParsedAttrSpec(ParsedAttrSpec&& other) = default;

  // A unique id for the given context (e.g., unique within a given
  // ParsedTagSpec).
  int32_t id() const { return id_; }
  const AttrSpec& spec() const { return *spec_; }

  bool has_value_regex() const { return value_regex_ != nullptr; }
  // You must check has_value_regex() before accessing.
  const RE2& value_regex() const { return *value_regex_; }

  bool has_disallowed_value_regex() const {
    return disallowed_value_regex_ != nullptr;
  }

  // You must check has_disallowed_value_regex() before accessing.
  const RE2& disallowed_value_regex() const { return *disallowed_value_regex_; }

  const ParsedAttrTriggerSpec& trigger_spec() const { return trigger_spec_; }

  const ParsedUrlSpec& value_url_spec() const { return value_url_spec_; }

  const unordered_map<std::string, const PropertySpec*>&
  value_property_by_name() const {
    return value_property_by_name_;
  }

  const unordered_map<std::string, const CssDeclaration*>&
  css_declaration_by_name() const {
    return css_declaration_by_name_;
  }

  const vector<const PropertySpec*>& mandatory_value_properties() const {
    return mandatory_value_properties_;
  }

  // Whether this attr spec should be used for the given type identifiers based
  // on the AttrSpec's disabled_by or enabled_by fields.
  bool IsUsedForTypeIdentifiers(
      const vector<TypeIdentifier>& type_identifiers) const {
    return ::amp::validator::IsUsedForTypeIdentifiers(
        type_identifiers, enabled_by_, disabled_by_);
  }

 private:
  const AttrSpec* spec_;
  int32_t id_;
  unique_ptr<RE2> value_regex_;
  unique_ptr<RE2> disallowed_value_regex_;
  // Name lookup for spec().value_properties().properties().
  unordered_map<std::string, const PropertySpec*> value_property_by_name_;
  // Name lookup for spec().css_declaration().
  unordered_map<std::string, const CssDeclaration*> css_declaration_by_name_;
  // The mandatory spec().value_properties().properties().
  vector<const PropertySpec*> mandatory_value_properties_;
  vector<TypeIdentifier> disabled_by_;
  vector<TypeIdentifier> enabled_by_;
  ParsedAttrTriggerSpec trigger_spec_;
  ParsedUrlSpec value_url_spec_;
  ParsedAttrSpec(const ParsedAttrSpec&) = delete;
  ParsedAttrSpec& operator=(const ParsedAttrSpec&) = delete;
};

// A parsed ReferencePoint, that is, the tag_spec_id field provides the
// id for the ParsedTagSpec with point->tag_spec_name().
struct ParsedReferencePoint {
  const ReferencePoint* point;
  int32_t tag_spec_id;
};

// Holds the reference points for a particular parent tag spec, including
// their resolved tagspec ids. This class is a container of
// |ParsedReferencePoint| for convenient iteration.
class ParsedReferencePoints {
 public:
  ParsedReferencePoints() : parent_(nullptr) {}
  ParsedReferencePoints(
      const TagSpec& parent,
      const unordered_map<std::string, int32_t>& tag_spec_ids_by_tag_spec_name)
      : parent_(&parent) {
    for (const ReferencePoint& p : parent.reference_points()) {
      auto iter = tag_spec_ids_by_tag_spec_name.find(p.tag_spec_name());
      CHECK(iter != tag_spec_ids_by_tag_spec_name.end());
      parsed_.emplace_back(ParsedReferencePoint{&p, iter->second});
    }
  }

  bool empty() const { return parsed_.empty(); }

  int32_t size() const { return parsed_.size(); }

  vector<ParsedReferencePoint>::const_iterator begin() const {
    return parsed_.begin();
  }

  vector<ParsedReferencePoint>::const_iterator end() const {
    return parsed_.end();
  }

  // The spec URL for the parsed tag spec which declared these
  // reference points.
  std::string parent_spec_url() const { return TagSpecUrl(*parent_); }

  // The tag spec name for the tag spec which declared these reference points.
  std::string parent_tag_spec_name() const { return TagSpecName(*parent_); }

 private:
  const TagSpec* parent_;
  vector<ParsedReferencePoint> parsed_;
};

class ParsedDocSpec {
 public:
  explicit ParsedDocSpec(const DocSpec& spec) : spec_(spec) {
    // Store the enum of the TagSpec's type identifiers.
    for (const std::string& disabled_by : spec.disabled_by()) {
      disabled_by_.push_back(GetTypeIdentifier(disabled_by));
    }
    for (const std::string& enabled_by : spec.enabled_by()) {
      enabled_by_.push_back(GetTypeIdentifier(enabled_by));
    }
  }

  const DocSpec& spec() const { return spec_; }

  const vector<TypeIdentifier>& disabled_by() const { return disabled_by_; }

  const vector<TypeIdentifier>& enabled_by() const { return enabled_by_; }

 private:
  const DocSpec& spec_;
  vector<TypeIdentifier> disabled_by_;
  vector<TypeIdentifier> enabled_by_;
};

class ParsedDocCssSpec {
 public:
  ParsedDocCssSpec(const DocCssSpec& spec,
                   const RepeatedPtrField<DeclarationList>& decl_lists)
      : spec_(spec) {
    // Store the enum of the TagSpec's type identifiers.
    for (const std::string& disabled_by : spec.disabled_by()) {
      disabled_by_.push_back(GetTypeIdentifier(disabled_by));
    }
    for (const std::string& enabled_by : spec.enabled_by()) {
      enabled_by_.push_back(GetTypeIdentifier(enabled_by));
    }
    for (const CssDeclaration& declaration : spec.declaration()) {
      css_declaration_by_name_[declaration.name()] = &declaration;
      css_declaration_svg_by_name_[declaration.name()] = &declaration;
    }
    for (const CssDeclaration& declaration : spec.declaration_svg()) {
      css_declaration_svg_by_name_[declaration.name()] = &declaration;
    }
    // Expand the list of declarations tracked by this spec by merging in any
    // declarations mentioned in declaration_lists referenced by this spec. This
    // mechanism reduces redundancy in the lists themselves, making rules more
    // readable.
    for (const std::string& decl_list_name : spec.declaration_list()) {
      for (const DeclarationList& decl_list : decl_lists) {
        if (decl_list.name() == decl_list_name) {
          for (const CssDeclaration& declaration : decl_list.declaration()) {
            css_declaration_by_name_[declaration.name()] = &declaration;
            css_declaration_svg_by_name_[declaration.name()] = &declaration;
          }
        }
      }
    }
    for (const std::string& decl_list_name : spec.declaration_list_svg()) {
      for (const DeclarationList& decl_list : decl_lists) {
        if (decl_list.name() == decl_list_name) {
          for (const CssDeclaration& declaration : decl_list.declaration()) {
            css_declaration_svg_by_name_[declaration.name()] = &declaration;
          }
        }
      }
    }
    image_url_spec_ = make_unique<ParsedUrlSpec>(&spec.image_url_spec());
    font_url_spec_ = make_unique<ParsedUrlSpec>(&spec.font_url_spec());
  }

  const DocCssSpec& spec() const { return spec_; }

  const vector<TypeIdentifier>& disabled_by() const { return disabled_by_; }

  const vector<TypeIdentifier>& enabled_by() const { return enabled_by_; }

  // Returns the CssDeclaration rules for a matching css declaration name, if
  // is found, else null.
  const CssDeclaration* CssDeclarationByName(string_view candidate) const {
    std::string decl_key = AsciiStrToLower(candidate);
    if (spec_.expand_vendor_prefixes())
      decl_key =
          std::string(htmlparser::css::StripVendorPrefix(decl_key).data());
    auto iter = css_declaration_by_name_.find(decl_key);
    if (iter != css_declaration_by_name_.end()) return iter->second;
    return nullptr;
  }

  // Returns the CssDeclaration rules for a matching css declaration name in SVG
  // scope, if is found, else null.
  const CssDeclaration* CssDeclarationSvgByName(string_view candidate) const {
    std::string decl_key = AsciiStrToLower(candidate);
    if (spec_.expand_vendor_prefixes())
      decl_key =
          std::string(htmlparser::css::StripVendorPrefix(decl_key).data());
    auto iter = css_declaration_svg_by_name_.find(decl_key);
    if (iter != css_declaration_svg_by_name_.end()) return iter->second;
    return nullptr;
  }

  const ParsedUrlSpec& image_url_spec() const { return *image_url_spec_; }

  const ParsedUrlSpec& font_url_spec() const { return *font_url_spec_; }

 private:
  const DocCssSpec& spec_;
  vector<TypeIdentifier> disabled_by_;
  vector<TypeIdentifier> enabled_by_;
  // Allows lookup by declaration name.
  unordered_map<std::string, const CssDeclaration*> css_declaration_by_name_;
  unordered_map<std::string, const CssDeclaration*>
      css_declaration_svg_by_name_;
  unique_ptr<ParsedUrlSpec> image_url_spec_;
  unique_ptr<ParsedUrlSpec> font_url_spec_;
};

// TagSpecs specify attributes that are valid for a particular tag.
// They can also reference lists of attributes (AttrLists), thereby
// sharing those definitions. This abstraction instantiates
// ParsedAttrSpec for each AttrSpec (from validator-*.protoascii, our
// specification file) exactly once. To accomplish that, it keeps
// around the attr lists with ParsedAttrSpec instances.
class ParsedAttrSpecs {
 public:
  explicit ParsedAttrSpecs(const RepeatedPtrField<AttrList>& attr_lists) {
    for (const AttrList& attr_list : attr_lists) {
      vector<const ParsedAttrSpec*>* parsed_attr_list =
          &attr_lists_by_name_[attr_list.name()];
      for (const AttrSpec& attr_spec : attr_list.attrs()) {
        parsed_attr_specs_.emplace_back(
            make_unique<ParsedAttrSpec>(&attr_spec, parsed_attr_specs_.size()));
        parsed_attr_list->push_back(parsed_attr_specs_.back().get());
      }
    }
  }

  // Collect the ParsedAttrSpec pointers for a given |tagspec|.
  // There are four ways to specify attributes:
  // (1) implicitly by a tag spec, if the tag spec has the amp_layout field
  // set - in this case, the AMP_LAYOUT_ATTRS are assumed;
  // (2) within a TagSpec::attrs;
  // (3) via TagSpec::attr_lists which references lists by key;
  // (4) within the $GLOBAL_ATTRS TagSpec::attr_list.
  // It's possible to provide multiple
  // specifications for the same attribute name, but for any given tag only
  // one such specification can be active. The precedence is (1), (2), (3), (4).
  // If tagspec.explicit_attrs_only is true then only collect the attributes
  // from (2) and (3).
  Status GetAttrsFor(const TagSpec& tagspec,
                     vector<const ParsedAttrSpec*>* attrs) {
    // We implement precedence by collecting attributes from (1), (2),
    // (3), (4) in this order and avoiding to override attributes with
    // a name already seen.
    node_hash_set<std::string> names_seen;
    // (1) layout attrs (except when explicit_attrs_only is true).
    if (!tagspec.explicit_attrs_only() && tagspec.has_amp_layout() &&
        tagspec.tag_name() != "$REFERENCE_POINT") {
      auto it = attr_lists_by_name_.find("$AMP_LAYOUT_ATTRS");
      if (it != attr_lists_by_name_.end()) {
        for (const ParsedAttrSpec* p : it->second)
          if (names_seen.insert(p->spec().name()).second) attrs->push_back(p);
      }
    }
    // (2) attributes specified within |tagspec|.
    for (const AttrSpec& s : tagspec.attrs())
      if (names_seen.insert(s.name()).second) {
        parsed_attr_specs_.emplace_back(
            make_unique<ParsedAttrSpec>(&s, parsed_attr_specs_.size()));
        attrs->push_back(parsed_attr_specs_.back().get());
      }
    // (3) attributes specified via reference to an attr_list.
    for (const std::string& key : tagspec.attr_lists()) {
      auto it = attr_lists_by_name_.find(key);
      if (it == attr_lists_by_name_.end()) {
        return InvalidArgumentError(
            StrCat("invalid rules - referenced attr_lists entry not found: '",
                   key, "'"));
      }
      for (const ParsedAttrSpec* p : it->second)
        if (names_seen.insert(p->spec().name()).second) attrs->push_back(p);
    }
    // (4) attributes specified in the global_attr list (except when
    // explicit_attrs_only is true).
    if (!tagspec.explicit_attrs_only() &&
        tagspec.tag_name() != "$REFERENCE_POINT") {
      auto it = attr_lists_by_name_.find("$GLOBAL_ATTRS");
      if (it == attr_lists_by_name_.end()) return OkStatus();
      for (const ParsedAttrSpec* p : it->second)
        if (names_seen.insert(p->spec().name()).second) attrs->push_back(p);
    }
    return OkStatus();
  }

  const ParsedAttrSpec& GetById(int32_t id) const {
    return *parsed_attr_specs_[id];
  }

 private:
  vector<unique_ptr<ParsedAttrSpec>> parsed_attr_specs_;
  unordered_map<std::string, vector<const ParsedAttrSpec*>> attr_lists_by_name_;
};

// Instances of this class precompute the regular expressions for a particular
// Cdata specification.
class ParsedCdataSpec {
 public:
  explicit ParsedCdataSpec(const TagSpec* parent_tag_spec)
      : spec_(&CHECK_NOTNULL(parent_tag_spec)->cdata()),
        parent_tag_spec_(parent_tag_spec),
        css_parsing_config_(GenCssParsingConfig()) {
    RE2::Options options;
    options.set_case_sensitive(false);
    for (const auto& denylist : spec_->disallowed_cdata_regex()) {
      denylists_with_error_msgs_.emplace_back(
          make_unique<RE2>(denylist.regex(), options),
          denylist.error_message());
    }
    for (const std::string& declaration : spec_->css_spec().declaration()) {
      allowed_declarations_.emplace_back(declaration);
    }
    if (spec_->has_cdata_regex()) {
      cdata_regex_ = make_unique<RE2>(spec_->cdata_regex());
    }
    if (spec_->has_css_spec()) {
      for (const AtRuleSpec& at_rule_spec : spec_->css_spec().at_rule_spec())
        allowed_at_rules_.insert(at_rule_spec.name());
    }
  }

  const CdataSpec& Spec() const { return *spec_; }
  const TagSpec& ParentTagSpec() const { return *parent_tag_spec_; }

  const vector<pair<unique_ptr<RE2>, std::string>>& DenylistsWithErrorMsgs()
      const {
    return denylists_with_error_msgs_;
  }
  // Be sure to check Spec().has_cdata_regex() before accessing.
  const RE2& CdataRegex() const { return *cdata_regex_; }

  const CssParsingConfig& css_parsing_config() const {
    return css_parsing_config_;
  }

  bool IsAtRuleValid(string_view at_rule_name) const {
    // This should never be called unless there is a CSS spec during
    // construction, which verifies that there is at least a default value.
    if (!spec_->has_css_spec()) {
      DLOG(FATAL) << "IsAtRuleValid called for non-css cdata spec: "
                  << at_rule_name;
      return false;
    }
    // "-moz-document" is specified in the list of allowed rules with an
    // explicit vendor prefix. The idea here is that only this specific vendor
    // prefix is allowed, not "-ms-document" or even "document". We first search
    // the allowed list for the seen `at_rule_name` with stripped vendor prefix,
    // then if not found, we search again without sripping the vendor prefix.
    if (allowed_at_rules_.find(std::string(htmlparser::css::StripVendorPrefix(
            at_rule_name))) != allowed_at_rules_.end())
      return true;
    return allowed_at_rules_.find(std::string(at_rule_name)) !=
           allowed_at_rules_.end();
  }

  bool IsDeclarationValid(string_view declaration_name) const {
    // This should never be called unless there is a CSS spec during
    // construction, which verifies that there is at least a default value.
    if (!spec_->has_css_spec()) {
      DLOG(FATAL) << "IsDeclarationValid called for non-css cdata spec: "
                  << declaration_name;
      return false;
    }

    if (allowed_declarations_.empty()) return true;

    // Note: declarations are case-sensitive, so we should not adjust case
    // before looking up in allowed list.
    return c_linear_search(
        allowed_declarations_,
        htmlparser::css::StripVendorPrefix(declaration_name));
  }

  std::string AllowedDeclarationsString() const {
    if (allowed_declarations_.size() > 5) return "";
    return StrCat("['", StrJoin(allowed_declarations_, "', '"), "']");
  }

 private:
  const CdataSpec* spec_;
  const TagSpec* parent_tag_spec_;
  const CssParsingConfig css_parsing_config_;
  unique_ptr<RE2> cdata_regex_;
  vector<pair<unique_ptr<RE2>, std::string>> denylists_with_error_msgs_;
  node_hash_set<std::string> allowed_at_rules_;
  vector<std::string> allowed_declarations_;
};

// A DispatchKey represents a tuple of 1-3 strings:
// - attribute name
// - attribute value (optional)
// - mandatory parent html tag (optional)
// A Dispatch key can be generated from some validator TagSpecs. One dispatch
// key per attribute can be generated from any HTML tag. If one of the dispatch
// keys for an HTML tag matches that of a TagSpec, we validate that HTML tag
// against only this one TagSpec. Otherwise, this TagSpec is not eligible for
// validation against this HTML tag.
std::string DispatchKey(AttrSpec::DispatchKeyType dispatch_key_type,
                        const std::string& attr_name,
                        const std::string& attr_value,
                        const std::string& mandatory_parent) {
  // Constructing a string using foo("\0") constructs an empty string, since
  // the char array is considered null-terminated.
  const std::string sep("\0", 1);
  CHECK_EQ(1, sep.length());

  switch (dispatch_key_type) {
    case AttrSpec::NONE_DISPATCH:
      LOG(FATAL) << dispatch_key_type;
    case AttrSpec::NAME_DISPATCH:
      return attr_name;
    case AttrSpec::NAME_VALUE_DISPATCH:
      return StrCat(attr_name, sep, attr_value);
    case AttrSpec::NAME_VALUE_PARENT_DISPATCH:
      return StrCat(attr_name, sep, attr_value, sep, mandatory_parent);
  }
}

class CdataMatcher;
class ChildTagMatcher;
class ParsedValidatorRules;
class ReferencePointMatcher;

// We only track (that is, add them to Context.RecordTagspecValidated) validated
// tagspecs as necessary. That is, if it's needed for document scope validation:
// - Mandatory tags
// - Unique tags
// - Tags (identified by their tag_spec_name) that are required by other tags.
enum RecordValidated { NEVER, ALWAYS, IF_PASSING };
RecordValidated ShouldRecordTagspecValidated(
    const TagSpec& tag,
    const unordered_set<std::string>& tag_spec_names_to_track) {
  // Always update from TagSpec if the tag is passing. If it's failing we
  // typically want to update from the best match as it can satisfy
  // requirements which otherwise can confuse the user later. The exception is
  // tagspecs which introduce requirements but satisfy none, such as unique.
  // https://github.com/ampproject/amphtml/issues/24359

  // Mandatory and tagSpecIdsToTrack only satisfy requirements, making the
  // output less verbose even if the tag is failing.
  if (tag.mandatory() || tag_spec_names_to_track.count(TagSpecName(tag)))
    return ALWAYS;
  // Unique and similar can introduce requirements, ie: there cannot be
  // another such tag. We don't want to introduce requirements for failing
  // tags.
  if (tag.unique() || tag.unique_warning() || !tag.requires_condition().empty())
    return IF_PASSING;
  return NEVER;
}

// This wrapper class provides access to a TagSpec and a tag id
// which is unique within its context, the ParsedValidatorRules.
class ParsedTagSpec {
 public:
  ParsedTagSpec(
      ParsedAttrSpecs* parsed_attr_specs,
      const unordered_map<std::string, int32_t>& tag_spec_ids_by_tag_spec_name,
      RecordValidated should_record_tagspec_validated, const TagSpec* spec,
      int32_t id)
      : spec_(spec),
        id_(id),
        reference_points_(*spec, tag_spec_ids_by_tag_spec_name),
        is_reference_point_(spec->tag_name() == "$REFERENCE_POINT"),
        parsed_cdata_spec_(spec),
        should_record_tagspec_validated_(should_record_tagspec_validated) {
    vector<const ParsedAttrSpec*> attrs;
    if (auto status = parsed_attr_specs->GetAttrsFor(*spec, &attrs);
        !status.ok()) {
      status_ = status;
      return;
    }

    // Store the enum of the TagSpec's type identifiers.
    for (const std::string& disabled_by : spec->disabled_by()) {
      disabled_by_.push_back(GetTypeIdentifier(disabled_by));
    }
    for (const std::string& enabled_by : spec->enabled_by()) {
      enabled_by_.push_back(GetTypeIdentifier(enabled_by));
    }

    // Organize the attribute specs to make validation of a tag efficient.
    // Since the rules are instantiated statically (see GetRules in this file),
    // the constructor only runs once per tag specification in
    // the validator.protoascii file. All methods other than the constructor
    // are deliberately made const.
    for (const ParsedAttrSpec* parsed_attr_spec : attrs) {
      if (parsed_attr_spec->spec().mandatory())
        mandatory_attr_ids_.push_back(parsed_attr_spec->id());
      if (parsed_attr_spec->spec().has_mandatory_oneof())
        mandatory_oneofs_.push_back(parsed_attr_spec->spec().mandatory_oneof());
      if (parsed_attr_spec->spec().has_mandatory_anyof())
        mandatory_anyofs_.push_back(parsed_attr_spec->spec().mandatory_anyof());
      attr_ids_by_name_[parsed_attr_spec->spec().name()] =
          parsed_attr_spec->id();
      for (const std::string& name :
           parsed_attr_spec->spec().alternative_names())
        attr_ids_by_name_.emplace(std::make_pair(name, parsed_attr_spec->id()));
      if (parsed_attr_spec->spec().dispatch_key() != AttrSpec::NONE_DISPATCH)
        dispatch_key_attr_specs_.push_back(parsed_attr_spec);
      if (parsed_attr_spec->spec().implicit())
        implicit_attrspecs_.insert(parsed_attr_spec->id());
      if (parsed_attr_spec->spec().name() == "type" &&
          parsed_attr_spec->spec().value_casei_size() > 0) {
        for (const std::string& v : parsed_attr_spec->spec().value_casei()) {
          if (EqualsIgnoreCase("application/json", v)) {
            is_type_json_ = true;
            break;
          }
        }
      }
      if (parsed_attr_spec->spec().has_value_url()) contains_url_ = true;
      if (!parsed_attr_spec->spec().requires_extension().empty())
        attrs_can_satisfy_extension_ = true;
    }
    SortAndUniquify(&mandatory_oneofs_);
    SortAndUniquify(&mandatory_anyofs_);
    SortAndUniquify(&mandatory_attr_ids_);
    c_copy(spec->requires_extension(), std::back_inserter(requires_extension_));
    c_copy(spec->requires_condition(), std::back_inserter(requires_condition_));
    c_copy(spec->excludes_condition(), std::back_inserter(excludes_condition_));
    for (const std::string& tag_spec_name : spec->also_requires_tag_warning()) {
      auto iter = tag_spec_ids_by_tag_spec_name.find(tag_spec_name);
      CHECK(iter != tag_spec_ids_by_tag_spec_name.end());
      also_requires_tag_warnings_.push_back(iter->second);
    }
  }
  ParsedTagSpec(ParsedTagSpec&& other) = default;

  Status status() const { return status_; }

  int32_t id() const { return id_; }
  const TagSpec& spec() const { return *spec_; }
  const ParsedCdataSpec& parsed_cdata_spec() const {
    return parsed_cdata_spec_;
  }

  // If tag has a cdata spec, returns a CdataMatcher, else nullptr.
  unique_ptr<CdataMatcher> cdata_matcher(const LineCol& line_col) const {
    if (spec().has_cdata())
      return make_unique<CdataMatcher>(&parsed_cdata_spec_, line_col);
    return nullptr;
  }

  // If tag has a child_tag spec, returns a ChildTagMatcher, else nullptr.
  unique_ptr<ChildTagMatcher> child_tag_matcher(const LineCol& line_col) const {
    if (spec().has_child_tags())
      return make_unique<ChildTagMatcher>(&spec(), line_col);
    return nullptr;
  }

  // If tag has a reference point spec, returns a ReferencePointMatcher,
  // else nullptr.
  unique_ptr<ReferencePointMatcher> reference_point_matcher(
      const ParsedValidatorRules& rules, const LineCol& line_col) const {
    if (has_reference_points())
      return make_unique<ReferencePointMatcher>(&rules, &reference_points(),
                                                line_col);
    return nullptr;
  }

  bool ContainsUrl() const { return contains_url_; }

  // Whether this tag spec should be used for the given type identifiers based
  // on the TagSpec's disabled_by or enabled_by fields.
  bool IsUsedForTypeIdentifiers(
      const vector<TypeIdentifier>& type_identifiers) const {
    return ::amp::validator::IsUsedForTypeIdentifiers(
        type_identifiers, enabled_by_, disabled_by_);
  }

  // A dispatch key is a combination of attribute name, attribute value and/or
  // tag parent. If multiple TagSpecs have the same dispatch key, then the
  // TagSpec with the first instance of that dispatch key is used. When an
  // encountered tag matches this dispatch key, it is validated first against
  // that first TagSpec in order to improve validation performance and error
  // message selection. Not all TagSpecs have a dispatch key. GetDispatchKeys
  // returns unique dispatch keys for the TagSpec, if any. If the attribute
  // value is used (either value or value_casei), uses the first value from the
  // protoascii.
  std::vector<std::string> GetDispatchKeys() const {
    std::vector<std::string> out;
    out.reserve(dispatch_key_attr_specs_.size());
    for (const auto* dispatch_key_attr_spec : dispatch_key_attr_specs_) {
      const ParsedAttrSpec& parsed_attr_spec = *dispatch_key_attr_spec;
      out.push_back(
          DispatchKey(parsed_attr_spec.spec().dispatch_key(),
                      parsed_attr_spec.spec().name(),
                      parsed_attr_spec.spec().value_size() > 0
                          ? AsciiStrToLower(parsed_attr_spec.spec().value(0))
                          : (parsed_attr_spec.spec().value_casei_size() > 0
                                 ? parsed_attr_spec.spec().value_casei(0)
                                 : ""),
                      spec_->mandatory_parent()));
    }
    return out;
  }

  const vector<int32_t>& AlsoRequiresTagWarnings() const {
    return also_requires_tag_warnings_;
  }
  const vector<std::string>& Requires() const { return requires_condition_; }
  const vector<std::string>& Excludes() const { return excludes_condition_; }

  // Whether or not the tag should be recorded via
  // Context->RecordTagspecValidated if it was validated
  // successfully. For performance, this is only done for tags that
  // are mandatory, unique, or possibly required by some other tag.
  RecordValidated ShouldRecordTagspecValidated() const {
    return should_record_tagspec_validated_;
  }

  bool is_reference_point() const { return is_reference_point_; }

  bool is_type_json() const { return is_type_json_; }

  bool has_reference_points() const { return !reference_points_.empty(); }

  const ParsedReferencePoints& reference_points() const {
    return reference_points_;
  }

  const bool AttrsCanSatisfyExtension() const {
    return attrs_can_satisfy_extension_;
  }

  const bool HasAttrWithName(const std::string& name) const {
    return attr_ids_by_name_.find(name) != attr_ids_by_name_.end();
  }

  const set<int32_t>& implicit_attrspecs() const { return implicit_attrspecs_; }

  const unordered_map<std::string, int32_t>& attr_ids_by_name() const {
    return attr_ids_by_name_;
  }

  const vector<std::string>& mandatory_oneofs() const {
    return mandatory_oneofs_;
  }

  const vector<std::string>& mandatory_anyofs() const {
    return mandatory_anyofs_;
  }

  vector<int32_t> mandatory_attr_ids() const { return mandatory_attr_ids_; }

 private:
  Status status_;
  const TagSpec* spec_;
  int32_t id_;
  ParsedReferencePoints reference_points_;
  bool is_reference_point_;
  bool is_type_json_ = false;
  bool contains_url_ = false;
  unordered_map<std::string, int32_t> attr_ids_by_name_;
  vector<TypeIdentifier> disabled_by_;
  vector<TypeIdentifier> enabled_by_;
  vector<int32_t> mandatory_attr_ids_;
  vector<std::string> mandatory_oneofs_;
  vector<std::string> mandatory_anyofs_;
  ParsedCdataSpec parsed_cdata_spec_;
  RecordValidated should_record_tagspec_validated_;
  bool attrs_can_satisfy_extension_ = false;
  vector<std::string> requires_condition_;
  vector<std::string> excludes_condition_;
  vector<std::string> requires_extension_;
  vector<int32_t> also_requires_tag_warnings_;
  set<int32_t> implicit_attrspecs_;
  vector<const ParsedAttrSpec*> dispatch_key_attr_specs_;
  ParsedTagSpec(const ParsedTagSpec&) = delete;
  ParsedTagSpec& operator=(const ParsedTagSpec&) = delete;
};  // class ParsedTagSpec

// For uniquely identifying a tag spec, we either find the spec_name in the tag
// spec or fall back to the tag_name.
std::string TagSpecName(const TagSpec& spec) {
  return spec.has_spec_name() ? spec.spec_name()
                              : AsciiStrToLower(spec.tag_name());
}

// For creating error messages, we either find the descriptive_name in the tag
// spec or fall back to the tag_name.
std::string TagDescriptiveName(const TagSpec& spec) {
  return spec.has_descriptive_name() ? spec.descriptive_name()
                                     : AsciiStrToLower(spec.tag_name());
}

// We either find the spec_url in the tag spec, or fall back to the extension
// spec URL if available.
std::string TagSpecUrl(const TagSpec& spec) {
  if (spec.has_spec_url()) return spec.spec_url();

  const std::string extension_spec_url_prefix =
      "https://amp.dev/documentation/components/";
  if (spec.has_extension_spec() && spec.extension_spec().has_name())
    return StrCat(extension_spec_url_prefix, spec.extension_spec().name());
  if (spec.requires_extension_size() > 0)
    // Return the first |requires_extension|, which should be the most
    // representative.
    return StrCat(extension_spec_url_prefix, spec.requires_extension(0));

  return "";
}

// Variant that accepts a ParsedTagSpec.
// TODO: Find a better mechanism for this in the future.
std::string TagSpecUrl(const ParsedTagSpec& parsed_tag_spec) {
  return TagSpecUrl(parsed_tag_spec.spec());
}

class Context;

// The child tag matcher evaluates ChildTagSpec. The constructor
// provides the enclosing TagSpec for the parent tag so that we can
// produce error messages mentioning the parent.
class ChildTagMatcher {
 public:
  explicit ChildTagMatcher(const TagSpec* parent_spec, const LineCol& line_col)
      : parent_spec_(parent_spec), line_col_(line_col) {
    CHECK(parent_spec->has_child_tags());
  }

  void MatchChildTagName(const ParsedHtmlTag& encountered_tag,
                         const Context& context,
                         ValidationResult* result) const;
  void ExitTag(const Context& context, ValidationResult* result) const;

 private:
  const TagSpec* parent_spec_;
  LineCol line_col_;
};

// A TagSpecDispatch stores mappings for all of the TagSpecs involved for a
// single Tag. There are two non-overlapping sets of TagSpecs here. The first is
// a mapping of DispatchKeys (see DispatchKey comment for more details) and the
// second is a list of all remaining non-dispatchable tagspecs.
class TagSpecDispatch {
 public:
  void RegisterDispatchKey(const std::string& dispatch_key,
                           int32_t tag_spec_id) {
    // Multiple TagSpecs may have the same dispatch key. These are added in the
    // order in which they are found.
    tagspecs_by_dispatch_[dispatch_key].push_back(tag_spec_id);
  }
  void RegisterTagSpec(int32_t tag_spec_id) {
    all_tag_specs_.push_back(tag_spec_id);
  }

  bool empty() const { return !HasDispatchKeys() && !HasTagSpecs(); }

  bool HasDispatchKeys() const { return !tagspecs_by_dispatch_.empty(); }

  // Looks up a dispatch key as previously registered, returning the
  // corresponding tag_spec_ids which are ordered by their specificity of match
  // (e.g. Name/Value/Parent, then Name/Value, and then Name).
  vector<int32_t> MatchingDispatchKey(const std::string& attr_name,
                                      const std::string& attr_value,
                                      const std::string& parent) const {
    if (!HasDispatchKeys()) return {};

    vector<int32_t> tag_spec_ids;
    // Try first to find a key with the given parent.
    const std::string dispatch_key = DispatchKey(
        AttrSpec::NAME_VALUE_PARENT_DISPATCH, attr_name, attr_value, parent);
    auto match = tagspecs_by_dispatch_.find(dispatch_key);
    if (match != tagspecs_by_dispatch_.end())
      tag_spec_ids.insert(tag_spec_ids.end(), match->second.begin(),
                          match->second.end());

    // Try next to find a key that allows any parent.
    const std::string no_parent_key =
        DispatchKey(AttrSpec::NAME_VALUE_DISPATCH, attr_name, attr_value, "");
    auto no_parent_match = tagspecs_by_dispatch_.find(no_parent_key);
    if (no_parent_match != tagspecs_by_dispatch_.end())
      tag_spec_ids.insert(tag_spec_ids.end(), no_parent_match->second.begin(),
                          no_parent_match->second.end());

    // Try last to find a key that matches this attribute name.
    const std::string no_value_key =
        DispatchKey(AttrSpec::NAME_DISPATCH, attr_name, "", "");
    auto no_value_match = tagspecs_by_dispatch_.find(no_value_key);
    if (no_value_match != tagspecs_by_dispatch_.end())
      tag_spec_ids.insert(tag_spec_ids.end(), no_value_match->second.begin(),
                          no_value_match->second.end());

    // Special case for foo=foo. We consider this a match for a dispatch key of
    // foo="" or just <tag foo>.
    DCHECK(!attr_name.empty());
    if (attr_name == attr_value) {
      auto more_tag_spec_ids = MatchingDispatchKey(attr_name, "", parent);
      tag_spec_ids.insert(tag_spec_ids.end(), more_tag_spec_ids.begin(),
                          more_tag_spec_ids.end());
    }

    return tag_spec_ids;
  }

  bool HasTagSpecs() const { return !all_tag_specs_.empty(); }
  const vector<int>& AllTagSpecs() const { return all_tag_specs_; }

 private:
  unordered_map<std::string /*dispatch key*/,
                vector<int32_t> /* tag_spec_ids */>
      tagspecs_by_dispatch_;
  vector<int32_t> all_tag_specs_;
};

// This wrapper class provides access to the validation rules.
class ParsedValidatorRules {
 public:
  struct ErrorCodeMetaData {
    int32_t specificity = 0;
  };

  ParsedValidatorRules(const HtmlFormat::Code html_format);

  Status LoadRules(ValidatorRules* rules) const;

  Status CheckIntertags() const;

  void FilterRules(const ValidatorRules& all_rules,
                   ValidatorRules* filtered_rules) const;

  void ExpandModuleExtensionSpec(TagSpec* tagspec,
                                 const string_view spec_name) const;
  void ExpandNomoduleExtensionSpec(TagSpec* tagspec,
                                   const string_view spec_name) const;
  void ExpandExtensionSpec(ValidatorRules* rules) const;

  // Returns true iff `tagspec` is usable for the HTML Format these rules are
  // built for.
  bool IsTagSpecCorrectHtmlFormat(const TagSpec& tagspec) const;

  // Returns true iff `spec` is usable for the HTML Format these rules are built
  // for.
  bool IsDocSpecCorrectHtmlFormat(const DocSpec& spec) const;

  // Returns true iff `spec` is usable for the HTML Format these rules are built
  // for.
  bool IsDocCssSpecCorrectHtmlFormat(const DocCssSpec& spec) const;

  Status status() const;

  const ParsedTagSpec* GetAuthorStylesheetTagSpec() const;

  bool IsTypeIdentifier(const std::string& maybe_type_identifier) const {
    return GetTypeIdentifier(maybe_type_identifier) != TypeIdentifier::kUnknown;
  }

  void ValidateTypeIdentifiers(const ParsedHtmlTag& html_tag,
                               const vector<TypeIdentifier> format_identifiers,
                               Context* context,
                               ValidationResult* result) const;

  void ValidateHtmlTag(const ParsedHtmlTag& html_tag, Context* context,
                       ValidationResult* result) const;

  void ValidateManufacturedBody(Context* context,
                                ValidationResult* result) const;

  int32_t Specificity(ValidationError::Code code) const;

  int32_t MaxSpecificity(const RepeatedPtrField<ValidationError>& errors) const;

  // Returns true iff resultA is a better result than resultB.
  bool BetterValidationResultThan(const ValidationResult& resultA,
                                  const ValidationResult& resultB) const;

  bool HasValidatedAlternativeTagSpec(Context* context,
                                      const std::string& ext_name) const;

  void MaybeEmitMandatoryTagValidationErrors(Context* context,
                                             ValidationResult* result) const;

  void MaybeEmitRequiresOrExcludesValidationErrors(
      Context* context, ValidationResult* result) const;

  void MaybeEmitMandatoryAlternativesSatisfiedErrors(
      Context* context, ValidationResult* result) const;

  void MaybeEmitDocSizeErrors(Context* context, ValidationResult* result) const;

  void MaybeEmitCssLengthErrors(Context* context,
                                ValidationResult* result) const;

  void MaybeEmitValueSetMismatchErrors(Context* context,
                                       ValidationResult* result) const;

  void MaybeEmitGlobalTagValidationErrors(Context* context,
                                          ValidationResult* result) const;

  const set<std::string>& IntertagsToValidate() const;

  // A few pass through methods for accessing top-level proto rules fields.
  const std::string& template_spec_url() const {
    return rules_.template_spec_url();
  }
  const std::string& styles_spec_url() const {
    return rules_.styles_spec_url();
  }
  const vector<ParsedDocSpec>& doc() const { return parsed_doc_; }
  const RepeatedPtrField<DescendantTagList>& descendant_tag_list() const {
    return rules_.descendant_tag_list();
  }
  const vector<ParsedDocCssSpec>& css() const { return parsed_css_; }

  const ParsedTagSpec* GetTagSpec(int id) const { return &tagspec_by_id_[id]; }

  const TagSpecDispatch& DispatchForTagName(const std::string& tagname) const {
    auto iter = tagspecs_by_tagname_.find(tagname);
    if (iter == tagspecs_by_tagname_.end()) {
      return empty_dispatch_;
    }

    return iter->second;
  }

  const ValidatorRules& rules() const { return rules_; }

  const ParsedAttrSpecs& parsed_attr_specs() const {
    return *parsed_attr_specs_;
  }

  const HtmlFormat::Code html_format() const { return html_format_; }

 private:
  Status status_;
  ValidatorRules rules_;
  HtmlFormat::Code html_format_;
  vector<ParsedTagSpec> tagspec_by_id_;
  absl::node_hash_map<std::string, TagSpecDispatch> tagspecs_by_tagname_;
  absl::node_hash_map<std::string, vector<int32_t>>
      ext_tag_spec_ids_by_ext_name_;
  TagSpecDispatch empty_dispatch_;
  vector<int32_t> mandatory_tagspecs_;
  vector<ErrorCodeMetaData> error_codes_;
  unique_ptr<ParsedAttrSpecs> parsed_attr_specs_;
  vector<ParsedDocSpec> parsed_doc_;
  vector<ParsedDocCssSpec> parsed_css_;
  std::set<std::string> tags_with_cdata_;
  ParsedValidatorRules(const ParsedValidatorRules&) = delete;
  ParsedValidatorRules& operator=(const ParsedValidatorRules&) = delete;
};  // class ParsedValidatorRules

// Return type tuple for ValidateTag.
struct ValidateTagResult {
  ValidationResult validation_result;
  const ParsedTagSpec* best_match_tag_spec = nullptr;
  bool dev_mode_suppress = false;
  // If the tagspec determined that there were CSS bytes in the given tag's
  // style attributes, these values get added to per-document limits for
  // determining if the overall CSS limits have been exceeded.
  int inline_style_css_bytes = 0;

  bool IsPassing() const {
    return validation_result.status() == ValidationResult::PASS;
  }
};

// A tag may initialize this ReferencePointMatcher with its reference points.
// Then, the matcher will be invoked for each child tag via ::Match,
// and eventually it will be invoked upon exiting the parent tag.
class ReferencePointMatcher {
 public:
  explicit ReferencePointMatcher(
      const ParsedValidatorRules* parsed_rules,
      const ParsedReferencePoints* parsed_reference_points,
      const LineCol& line_col)
      // These checks are only used in initialization.
      : parsed_rules_(CHECK_NOTNULL(parsed_rules)),
        parsed_reference_points_(CHECK_NOTNULL(parsed_reference_points)),
        line_col_(line_col) {
    CHECK(!parsed_reference_points->empty());
  }

  // This method gets invoked when matching a child tag of the parent
  // that is specifying / requiring the reference points.  So
  // effectively, this method will try through the specified reference
  // points to see if any match.
  ValidateTagResult ValidateTag(const ParsedHtmlTag& encountered_tag,
                                const Context& context) const;

  // This method is invoked with the reference point which matched a tag just
  // processed. It updates reference_points_matched_ to track which children
  // have matched this reference point.
  void RecordMatch(const ParsedTagSpec& reference_point);

  // This method gets invoked when we're done with processing all the
  // child tags, so now we can determine whether any reference points
  // remain unsatisfied or duplicate.
  void ExitParentTag(const Context& context, ValidationResult* result) const;

 private:
  const ParsedValidatorRules* parsed_rules_;
  const ParsedReferencePoints* parsed_reference_points_;
  LineCol line_col_;
  vector<int32_t> reference_points_matched_;
};

class CdataMatcher;

// Instances of this class specify which tag names (|tag|)
// are allowed for descendant tags of a particular tag (|tag_name|).
class DescendantConstraints {
 public:
  DescendantConstraints(const std::string& tag_name,
                        const vector<std::string>& allowed_tags)
      : tag_name_(AsciiStrToUpper(tag_name)),
        allowed_tags_(allowed_tags.begin(), allowed_tags.end()) {}

  const std::string& tag_name() const { return tag_name_; }

  const vector<std::string>& allowed_tags() const { return allowed_tags_; }

 private:
  const std::string tag_name_;
  const vector<std::string> allowed_tags_;
  DescendantConstraints(const DescendantConstraints&) = delete;
  DescendantConstraints& operator=(const DescendantConstraints&) = delete;
};

// This abstraction keeps track of the tag names and ChildTagMatchers
// as we enter / exit tags in the document. Closing tags is tricky:
// - In addition, we assume that all end tags are optional and we close,
//   that is, pop off tags our stack, lazily as we encounter parent closing
//   tags. This part differs slightly from the behavior per spec: instead of
//   closing an <option> tag when a following <option> tag is seen, we close
//   it when the parent closing tag (in practice <select>) is encountered.
class TagStack {
 private:
  struct StackEntry {
    std::string tag_name;  // Always uppercase, per EnterTag().
    // tag_spec and reference_point are the ParsedTagSpecs that best matched
    // the stack entry. May be null. May not fully match.
    const ParsedTagSpec* tag_spec = nullptr;
    const ParsedTagSpec* reference_point = nullptr;

    bool has_descendant_constraint_lists;
    int32_t num_children;
    std::string only_child_tag_name;
    LineCol only_child_line_col;
    std::string last_child_tag_name;
    std::string last_child_url;
    LineCol last_child_line_col;
    unique_ptr<CdataMatcher> cdata_matcher;
    unique_ptr<ChildTagMatcher> child_tag_matcher;
    unique_ptr<ReferencePointMatcher> reference_point_matcher;
    bool dev_mode = false;

    explicit StackEntry(const std::string& name)
        : tag_name(name),
          has_descendant_constraint_lists(false),
          num_children(0),
          only_child_line_col(LineCol(-1, -1)),
          last_child_line_col(LineCol(-1, -1)) {}
  };

 public:
  TagStack() {
    // We always have one element on the stack. This simplifies certain checks,
    // for example, allowing us to guarantee we can always return a value for
    // parentStackEntry().
    stack_.emplace_back(StackEntry("$ROOT"));
  }

  // Enter a tag, opening a scope for child tags.
  void EnterTag(const ParsedHtmlTag& tag,
                const ValidateTagResult& reference_point_result,
                const ValidateTagResult& tag_result) {
    StackEntry stack_entry(tag.UpperName());
    stack_entry.reference_point = reference_point_result.best_match_tag_spec;
    stack_entry.tag_spec = tag_result.best_match_tag_spec;
    stack_.emplace_back(std::move(stack_entry));
  }

  // Upon exiting a tag, validation for the current matcher is triggered,
  // e.g. for checking that the tag had some specified number of children.
  void ExitTag(const std::string& upper_tag_name, const Context& context,
               ValidationResult* result) {
    // We look for |tag_name| from the end. If we can find it, we pop
    // everything from thereon off the stack.
    for (int idx = stack_.size() - 1; idx >= 0; idx--) {
      if (stack_[idx].tag_name == upper_tag_name) {
        while (stack_.size() > idx) PopFromStack(context, result);
        return;
      }
    }
  }

  // This method is called when we're done with the
  // document. Normally, the parser should actually close the tags,
  // but just in case it doesn't this easy-enough method will take care of it.
  void ExitRemainingTags(const Context& context, ValidationResult* result) {
    while (!stack_.empty()) PopFromStack(context, result);
  }

  // Update tagstack state after validating an encountered tag. Called with the
  // best matching specs, even if not a match.
  void UpdateFromTagResults(const ParsedHtmlTag& encountered_tag,
                            const ValidateTagResult& reference_point_result,
                            const ValidateTagResult& tag_result,
                            const ParsedValidatorRules& rules,
                            const LineCol& line_col) {
    // Keep track of the number of direct children this tag has, even as we
    // pop in and out of them on the stack.
    MutableParentStackEntry()->num_children++;

    // Record in the parent element that a reference point has been satisfied,
    // even if the reference point didn't match completely.
    if (reference_point_result.best_match_tag_spec) {
      const ParsedTagSpec* parsed_ref_point =
          reference_point_result.best_match_tag_spec;
      CHECK_NOTNULL(MutableParentReferencePointMatcher())
          ->RecordMatch(*parsed_ref_point);
    }

    // The following only add new constraints, not new allowances, so
    // only add the constraints if the validation passed.
    if (tag_result.IsPassing()) {
      const ParsedTagSpec* parsed_tag_spec = tag_result.best_match_tag_spec;
      const TagSpec& tag_spec = parsed_tag_spec->spec();
      // Record that this tag must not have any siblings.
      if (tag_spec.siblings_disallowed()) {
        TellParentNoSiblingsAllowed(tag_spec.tag_name(), line_col);
      }

      // Record that this tag must be the last child of its parent.
      if (tag_spec.mandatory_last_child()) {
        TellParentImTheLastChild(TagSpecName(tag_spec), TagSpecUrl(tag_spec),
                                 line_col);
      }
    }

    // Add the tag to the stack, and then update the stack entry.
    EnterTag(encountered_tag, reference_point_result, tag_result);

    UpdateStackEntryFromTagResult(reference_point_result, rules, line_col);
    UpdateStackEntryFromTagResult(tag_result, rules, line_col);
  }

  // Methods to set various matchers for the tag currently on the stack.
  void SetChildTagMatcher(unique_ptr<ChildTagMatcher> matcher) {
    if (matcher) stack_.back().child_tag_matcher = std::move(matcher);
  }
  void SetCdataMatcher(unique_ptr<CdataMatcher> matcher) {
    if (matcher) stack_.back().cdata_matcher = std::move(matcher);
  }
  void SetReferencePointMatcher(unique_ptr<ReferencePointMatcher> matcher) {
    if (matcher) stack_.back().reference_point_matcher = std::move(matcher);
  }
  void SetDevMode() { stack_.back().dev_mode = true; }

  const CdataMatcher* const cdata_matcher() const {
    return stack_.back().cdata_matcher.get();
  }

  ReferencePointMatcher* MutableParentReferencePointMatcher() {
    return MutableParentStackEntry()->reference_point_matcher.get();
  }

  // This method is called as we're visiting a tag; so the matcher we
  // need here is the one provided/specified for the tag parent.
  void MatchChildTagName(const ParsedHtmlTag& encountered_tag,
                         const Context& context,
                         ValidationResult* result) const {
    if (ParentStackEntry().child_tag_matcher)
      ParentStackEntry().child_tag_matcher->MatchChildTagName(encountered_tag,
                                                              context, result);
  }

  // For tags without parent tags, the return value is "$ROOT".
  const std::string& ParentTagName() const {
    return ParentStackEntry().tag_name;
  }

  // Returns the spec_name if one exists, otherwise the tag_name.
  const std::string& ParentTagSpecName() const {
    if (ParentStackEntry().tag_spec &&
        ParentStackEntry().tag_spec->spec().has_spec_name())
      return ParentStackEntry().tag_spec->spec().spec_name();
    return ParentStackEntry().tag_name;
  }

  // Returns true if the current tag has ancestor with the given tag name or
  // spec_name.
  bool HasAncestor(const std::string& ancestor) const {
    // Skip the first element, which is "$ROOT".
    for (int i = 1; i < stack_.size(); ++i) {
      if (stack_[i].tag_name == ancestor) return true;
      if (stack_[i].tag_spec && stack_[i].tag_spec->spec().has_spec_name() &&
          stack_[i].tag_spec->spec().spec_name() == ancestor)
        return true;
    }
    return false;
  }

  bool HasAncestorMarker(const AncestorMarker::Marker query) const {
    CHECK_NE(AncestorMarker::UNKNOWN, query);
    // Skip the first element, which is "$ROOT".
    for (int i = 1; i < stack_.size(); ++i) {
      if (!stack_[i].tag_spec) continue;
      const TagSpec& spec = stack_[i].tag_spec->spec();
      if (!spec.has_mark_descendants()) continue;
      for (int j = 0; j < spec.mark_descendants().marker_size(); ++j) {
        if (spec.mark_descendants().marker(j) == query) return true;
      }
    }
    return false;
  }

  void SetDescendantConstraintList(const ParsedTagSpec& parsed_tag_spec,
                                   const ParsedValidatorRules& rules) {
    if (!parsed_tag_spec.spec().has_descendant_tag_list()) return;

    vector<std::string> allowed_descendants_for_this_tag;
    for (const DescendantTagList& descendant_tag_list :
         rules.descendant_tag_list()) {
      // Get the list matching this tag's descendant list name.
      if (parsed_tag_spec.spec().descendant_tag_list() ==
          descendant_tag_list.name()) {
        allowed_descendants_for_this_tag.insert(
            allowed_descendants_for_this_tag.end(),
            descendant_tag_list.tag().begin(), descendant_tag_list.tag().end());
      }
    }

    allowed_descendants_list_.emplace_back(make_unique<DescendantConstraints>(
        TagSpecName(parsed_tag_spec.spec()), allowed_descendants_for_this_tag));
    stack_.back().has_descendant_constraint_lists = true;
  }

  const vector<unique_ptr<DescendantConstraints>>& allowed_descendants_list()
      const {
    return allowed_descendants_list_;
  }

  int32_t ParentChildCount() const { return ParentStackEntry().num_children; }

  bool IsDevMode() const {
    // We always recursively set dev mode to true on stack elements as we march
    // down the stack, so we need only check the leaf node on the tree.
    // Skip the first element, which is "$ROOT".
    return ParentStackEntry().dev_mode;
  }

  void TellParentNoSiblingsAllowed(const std::string& tag_name,
                                   const LineCol& line_col) {
    MutableParentStackEntry()->only_child_tag_name = tag_name;
    MutableParentStackEntry()->only_child_line_col = line_col;
  }

  LineCol ParentOnlyChildErrorLineCol() const {
    return ParentStackEntry().only_child_line_col;
  }

  std::string ParentOnlyChildTagName() const {
    return ParentStackEntry().only_child_tag_name;
  }

  bool ParentHasChildWithNoSiblingRule() const {
    return ParentOnlyChildTagName().length() > 0;
  }

  void TellParentImTheLastChild(const std::string& tag_name,
                                const std::string& url,
                                const LineCol& line_col) {
    MutableParentStackEntry()->last_child_tag_name = tag_name;
    MutableParentStackEntry()->last_child_line_col = line_col;
    MutableParentStackEntry()->last_child_url = url;
  }

  LineCol ParentLastChildErrorLineCol() const {
    return ParentStackEntry().last_child_line_col;
  }

  std::string ParentLastChildTagName() const {
    return ParentStackEntry().last_child_tag_name;
  }

  std::string ParentLastChildUrl() const {
    return ParentStackEntry().last_child_url;
  }

  bool ParentHasChildWithLastChildRule() const {
    return ParentLastChildTagName().length() > 0;
  }

  bool CountDocCssBytes() const {
    return (ParentStackEntry().tag_spec &&
            ParentStackEntry().tag_spec->spec().has_cdata() &&
            ParentStackEntry().tag_spec->spec().cdata().doc_css_bytes());
  }

 private:
  const StackEntry& ParentStackEntry() const {
    // There should always be a root entry whose parent shouldn't be accessed,
    // until the document is exited.
    CHECK_GE(stack_.size(), 1);
    return stack_.back();
  }

  StackEntry* MutableParentStackEntry() {
    // There should always be a root entry whose parent shouldn't be accessed,
    // until the document is exited.
    CHECK_GE(stack_.size(), 1);
    return &stack_.back();
  }

  void UnsetDescendantConstraintList() {
    if (stack_.back().has_descendant_constraint_lists) {
      allowed_descendants_list_.pop_back();
    }
  }

  // Pops the current tag off the stack, calling ExitTag() on any child
  // tag matchers found at that element.
  void PopFromStack(const Context& context, ValidationResult* result) {
    UnsetDescendantConstraintList();

    StackEntry* to_pop = &stack_.back();
    if (to_pop->child_tag_matcher)
      to_pop->child_tag_matcher->ExitTag(context, result);

    if (to_pop->reference_point_matcher)
      to_pop->reference_point_matcher->ExitParentTag(context, result);

    stack_.pop_back();
  }

  // Given a ValidateTagResult, update the tag stack entry at the top of the
  // tag stack to add any constraints from the spec.
  void UpdateStackEntryFromTagResult(const ValidateTagResult& result,
                                     const ParsedValidatorRules& rules,
                                     const LineCol& line_col) {
    if (result.dev_mode_suppress) SetDevMode();
    if (!result.best_match_tag_spec) return;
    const ParsedTagSpec& parsed_tag_spec = *result.best_match_tag_spec;

    SetReferencePointMatcher(
        parsed_tag_spec.reference_point_matcher(rules, line_col));

    // The following only add new constraints, not new allowances, so
    // only add the constraints if the validation passed.
    if (result.IsPassing()) {
      SetChildTagMatcher(parsed_tag_spec.child_tag_matcher(line_col));
      SetCdataMatcher(parsed_tag_spec.cdata_matcher(line_col));
      SetDescendantConstraintList(parsed_tag_spec, rules);
    }
  }

  vector<StackEntry> stack_;

  vector<unique_ptr<DescendantConstraints>> allowed_descendants_list_;
};

// CdataMatcher maintains a constraint to check which an opening tag
// introduces: a tag's cdata matches constraints set by it's cdata
// spec. Unfortunately we need to defer such checking and can't
// handle it while the opening tag is being processed.
class CdataMatcher {
 public:
  // Constructs a CdataMatcher for the |parsed_cdata_spec| which will be
  // satisfied only if it sees a matching cdata std::string.
  explicit CdataMatcher(const ParsedCdataSpec* parsed_cdata_spec,
                        const LineCol& line_col);

  // Matches |cdata| against what this CdataMatcher expects.
  void Match(string_view cdata, Context* context,
             ValidationResult* result) const;

 private:
  // Matches the provided cdata against a CSS specification. Helper
  // routine for match (see above). |url_bytes| contains the number of bytes
  // in the CSS string which were measured as URLs. In some validation types,
  // these bytes are not counted against byte limits.
  void MatchCss(string_view cdata, const CssSpec& css_spec, int* url_bytes,
                Context* context, ValidationResult* result) const;

  // Matches the provided stylesheet against a MediaQuery specification.
  // Helper routine for MatchCss.
  void MatchMediaQuery(
      const htmlparser::css::Stylesheet& stylesheet, const MediaQuerySpec& spec,
      vector<unique_ptr<htmlparser::css::ErrorToken>>* error_buffer) const;

  // Matches the provided stylesheet against a SelectorSpec.
  // Helper routine for MatchCss.
  void MatchSelectors(
      const htmlparser::css::Stylesheet& stylesheet, const SelectorSpec& spec,
      vector<unique_ptr<htmlparser::css::ErrorToken>>* error_buffer) const;
  const ParsedCdataSpec* parsed_cdata_spec_;
  LineCol line_col_;
  CdataMatcher(const CdataMatcher&) = delete;
  CdataMatcher& operator=(const CdataMatcher&) = delete;
};

// The extensions context keeps track of the extensions that the validator has
// seen, as well as which have been used, which are required to be used, etc.
class ExtensionsContext {
 public:
  ExtensionsContext() {
    // AMP-AD is exempted to not require the respective extension javascript
    // file for historical reasons. We still need to mark that the extension is
    // used if we see the tags.
    extensions_loaded_.insert("amp-ad");
  }

  // Returns false if the named extension has not yet been loaded. Note that
  // this assumes that all extensions will be loaded in the document earlier
  // than their first usage. This is true for <amp-foo> tags, since the
  // extension must be loaded in the head and <amp-foo> tags are not supported
  // in the head as per HTML spec.
  bool IsExtensionLoaded(const std::string& extension) const {
    return extensions_loaded_.find(extension) != extensions_loaded_.end();
  }

  // Record a possible error to report regarding required extensions once
  // we have collected all extensions in the document.
  void RecordFutureErrorsIfMissing(const ParsedTagSpec& parsed_tag_spec,
                                   const LineCol& line_col) {
    const TagSpec& tag_spec = parsed_tag_spec.spec();
    for (const std::string& required_extension :
         tag_spec.requires_extension()) {
      if (!IsExtensionLoaded(required_extension)) {
        ExtensionMissingError err;
        err.missing_extension = required_extension;
        err.maybe_error = PopulateError(
            ValidationError::ERROR, ValidationError::MISSING_REQUIRED_EXTENSION,
            line_col, {TagDescriptiveName(tag_spec), required_extension},
            TagSpecUrl(tag_spec));
        extension_missing_errors_.emplace_back(err);
      }
    }
  }

  // Returns a vector of errors accrued while processing the
  // <head> for tags requiring an extension which was not found.
  // Destructive: calling a second time will return an empty vector.
  vector<ValidationError> MissingExtensionErrors() {
    vector<ValidationError> out;
    for (ExtensionMissingError& err : extension_missing_errors_) {
      if (!IsExtensionLoaded(err.missing_extension))
        out.emplace_back(std::move(err.maybe_error));
    }
    extension_missing_errors_.clear();
    return out;
  }

  void RecordUsedExtensions(const RepeatedPtrField<std::string>& extensions) {
    c_copy(extensions, std::inserter(extensions_used_, extensions_used_.end()));
  }

  vector<std::string> UnusedExtensionsRequired() const {
    vector<std::string> unused;
    absl::c_set_difference(extensions_unused_required_, extensions_used_,
                           std::back_inserter(unused));
    return unused;
  }

  // Update ExtensionContext state when we encounter an amp extension or tag
  // using an extension.
  void UpdateFromTagResult(const ValidateTagResult& result) {
    if (!result.best_match_tag_spec) return;
    const ParsedTagSpec& parsed_tag_spec = *result.best_match_tag_spec;
    const TagSpec& tag_spec = parsed_tag_spec.spec();

    // Keep track of which extensions are loaded.
    if (tag_spec.has_extension_spec()) {
      const ExtensionSpec& extension_spec = tag_spec.extension_spec();
      // Record that we have encountered an extension 'load' tag. This will
      // look like <script custom-element=amp-foo ...> or similar.
      extensions_loaded_.insert(extension_spec.name());
      switch (extension_spec.requires_usage()) {
        case ExtensionSpec::ERROR:
          // Record that a loaded extension indicates a new requirement:
          // namely that some tag must make use of this extension.
          extensions_unused_required_.insert(extension_spec.name());
          break;
        case ExtensionSpec::EXEMPTED:
        case ExtensionSpec::NONE:
          // This extension does not have usage demonstrated by a tag, for
          // example: amp-dynamic-css-classes.
          break;
      }
    }

    // Record presence of a tag, such as <amp-foo> which requires the usage
    // of an amp extension.
    RecordUsedExtensions(tag_spec.requires_extension());
  }

 private:
  // |extensions_loaded_| tracks the valid <script> tags loading
  // amp extensions which were seen in the document's head. Most extensions
  // are also added to |extensions_unused_required_| when encountered in the
  // head. When a tag is seen later in the document which makes use of an
  // extension, that extension is recorded in |extensions_used_|.
  set<std::string> extensions_loaded_;
  set<std::string> extensions_unused_required_;
  set<std::string> extensions_used_;

  // Pairs of (extension name, ValidatorError) collected while parsing the
  // document head. Once the body is reached, for each pair whose extension
  // hasn't been loaded, we output the matching error.
  struct ExtensionMissingError {
    std::string missing_extension;
    ValidationError maybe_error;
  };
  vector<ExtensionMissingError> extension_missing_errors_;
};  // ExtensionsContext

struct ValueSetProvision {
 public:
  explicit ValueSetProvision(const amp::validator::ValueSetProvision& proto)
      : set(proto.set()), value(proto.value()) {}

  friend bool operator==(const ValueSetProvision& lhs,
                         const ValueSetProvision& rhs) {
    return lhs.set == rhs.set && lhs.value == rhs.value;
  }

  template <typename H>
  friend H AbslHashValue(H h, const ValueSetProvision& v) {
    return H::combine(std::move(h), v.set, v.value);
  }

  AttrSpec::ValueSet set;
  std::string value;
};

// The context keeps track of the line / column that the validator is
// in, as well as the mandatory and unique tag specs that have already
// been validated. So, this constitutes the mutable state for the
// validator except for the validation result itself.
//
// For initial construction, |document_token_start| can be nullptr;
// when a document is being parsed, this should point at the beginning
// of it.
class Context {
 public:
  explicit Context(const ParsedValidatorRules* rules, int max_errors)
      : rules_(rules),
        max_errors_(max_errors),
        line_col_(1, 0),
        encountered_body_line_col_(1, 0) {}

  void StartDocument(const char* document_token_start) {
    current_token_start_ = document_token_start;
  }

  struct ResultProgress {
    bool complete;
    bool wants_more_errors;
  };

  ResultProgress Progress(const ValidationResult& result) const {
    // If max_errors is set to -1, it means that we want to keep going no
    // matter what, because there may be more errors. The validator constructor
    // doesn't allow values less than -1 but we do here just to be safer.
    if (max_errors_ <= -1)
      return {/*complete=*/false, /*wants_more_errors=*/true};
    // For max_errors set to 0, if a status is FAIL that means we're done.
    if (max_errors_ == 0)
      return {/*complete=*/result.status() == ValidationResult::FAIL,
              /*wants_more_errors=*/false};
    // For max_errors > 0, we want to keep adding errors if we're below
    // max_errors. But note that some of them (or all of them!) may be warnings,
    // so whether or not we're complete is still dependent on whether the
    // status is FAIL.
    bool wants_more_errors = result.errors_size() < max_errors_ && !exit_early_;
    return {/*complete=*/(result.status() == ValidationResult::FAIL &&
                          !wants_more_errors),
            /*wants_more_errors=*/wants_more_errors};
  }

  // Instructs the validator to consider itself done. Note that if max_errors
  // is set to -1 (all errors), this setting is ignored as the validator will
  // always return incomplete in that case.
  void SetExitEarly() { exit_early_ = true; }

  // For each tag that the htmlparser processes, we compute the line/column
  // information by counting the newline characters. Prior to calling the
  // function, |current_token_start_| actually points at the start of the
  // previous token, so effectively the body of AdvanceTo restores the invariant
  // of |current_token_start_| pointing at the current token.
  void AdvanceTo(const char* token_start) {
    if (!current_token_start_) {
      DLOG(FATAL) << "Must call StartDocument first";
      return;
    }
    const char* pos = current_token_start_;
    while (pos < token_start) {
      if (*pos == '\n') {  // \n (Unix newline)
        line_col_ = LineCol(line_col_.line() + 1, 0);
        pos++;
        continue;
      }
      if (*pos == '\r') {  // // \r (MacOS9 newline) and \r\n (Windows)
        if (((pos + 1) < token_start) && (*(pos + 1) == '\n')) pos++;
        line_col_ = LineCol(line_col_.line() + 1, 0);
        pos++;
        continue;
      }
      // Any character that's not some form of newline.
      pos += htmlparser::Strings::CodePointByteSequenceCount(*pos);
      if (*pos != '\0')  // Don't advance past the end of the document.
        line_col_.set_col(line_col_.col() + 1);
    }
    current_token_start_ = pos;
  }

  void SetLineCol(int line_no, int col_no) {
    line_col_ = LineCol(line_no, col_no);
  }

  void AddError(ValidationError error, ValidationResult* result) const {
    ResultProgress progress = Progress(*result);
    if (progress.complete) {
      if (result->status() != ValidationResult::FAIL) {
        result->set_status(ValidationResult::FAIL);
        DLOG(FATAL) << "Document Progress complete early but not status FAIL";
      }
      return;
    }
    // If any of the errors amount to more than a WARNING, validation fails.
    if (error.severity() != ValidationError::WARNING) {
      result->set_status(ValidationResult::FAIL);
    }
    if (progress.wants_more_errors) result->add_errors()->Swap(&error);
  }

  void AddWarning(ValidationError::Code code, LineCol line_col,
                  const vector<std::string>& params,
                  const std::string& spec_url, ValidationResult* result) const {
    AddError(PopulateError(ValidationError::WARNING, code, line_col, params,
                           spec_url),
             result);
  }

  void AddError(ValidationError::Code code, LineCol line_col,
                const vector<std::string>& params, const std::string& spec_url,
                ValidationResult* result) const {
    AddError(
        PopulateError(ValidationError::ERROR, code, line_col, params, spec_url),
        result);
  }

  // Given the tag_result from validating a single tag, update the overall
  // result as well as the Context state to affect later validation.
  void UpdateFromTagResults(const ParsedHtmlTag& encountered_tag,
                            const ValidateTagResult& reference_point_result,
                            const ValidateTagResult& tag_result) {
    tag_stack_.UpdateFromTagResults(encountered_tag, reference_point_result,
                                    tag_result, rules(), line_col());

    RecordAttrRequiresExtension(encountered_tag, reference_point_result);
    RecordAttrRequiresExtension(encountered_tag, tag_result);
    UpdateFromTagResult(reference_point_result);
    UpdateFromTagResult(tag_result);
    RecordScriptReleaseVersionFromTagResult(encountered_tag);
    AddInlineStyleByteSize(tag_result.inline_style_css_bytes);
  }

  const set<std::string>& ConditionsSatisfied() const {
    return conditions_satisfied_;
  }

  // Returns true iff the current context has observed a tag which contains
  // an URL. This is set by calling MarkUrlSeen above.
  bool HasSeenUrl() const { return first_url_seen_tag_ != nullptr; }

  // The TagSpecName of the first seen URL. Do not call unless HasSeenUrl
  // returns true.
  std::string FirstSeenUrlTagName() const {
    return TagSpecName(*first_url_seen_tag_);
  }

  const set<int32_t>& TagspecsValidated() const { return tagspecs_validated_; }

  const set<std::string>& MandatoryAlternativesSatisfied() const {
    return mandatory_alternatives_satisfied_;
  }

  const ParsedValidatorRules& rules() const { return *rules_; }

  const TagStack& tag_stack() const { return tag_stack_; }

  TagStack* mutable_tag_stack() { return &tag_stack_; }

  ExtensionsContext* mutable_extensions() { return &extensions_; }
  const ExtensionsContext& extensions() const { return extensions_; }

  LineCol line_col() const { return line_col_; }

  void RecordBodyTag(const ParsedHtmlTag& body_tag) {
    encountered_body_line_col_ = line_col();
    encountered_body_tag_ = body_tag.ToString();
  }

  LineCol encountered_body_line_col() const {
    return encountered_body_line_col_;
  }

  const std::string& encountered_body_tag() const {
    return encountered_body_tag_;
  }

  // Merges |to_merge| into |merged|, keeping at most options().max_errors()
  // errors or all errors if options().max_errors() is -1.
  void MergeRespectingMaxErrors(const ValidationResult& to_merge,
                                ValidationResult* merged) const {
    // Copy status only if fail. Failing is a terminal state
    if (to_merge.status() == ValidationResult::FAIL)
      merged->set_status(ValidationResult::FAIL);
    for (int i = 0; i < to_merge.errors_size(); ++i)
      AddError(to_merge.errors(i), merged);
  }

  void SetDocByteSize(int32_t byte_size) { doc_byte_size_ = byte_size; }

  const int32_t& doc_byte_size() const { return doc_byte_size_; }

  // These methods keep track of how much of the document is used towards
  // CSS style elements, via <style amp-custom> and inline styles (style
  // attribute on any tag).
  void AddStyleTagByteSize(int32_t byte_size) {
    style_tag_byte_size_ += byte_size;
  }

  void AddInlineStyleByteSize(int32_t byte_size) {
    inline_style_byte_size_ += byte_size;
  }

  const int32_t& style_tag_byte_size() const { return style_tag_byte_size_; }

  const int32_t& inline_style_byte_size() const {
    return inline_style_byte_size_;
  }

  void RecordTypeIdentifier(TypeIdentifier type_identifier) {
    type_identifiers_.push_back(type_identifier);
  }

  const vector<TypeIdentifier>& type_identifiers() const {
    return type_identifiers_;
  }
  // Returns true iff |spec| should be used for the type identifiers recorded
  // in this context, as seen in the document so far. If called before type
  // identifiers have been recorded, will always return false.
  bool IsDocSpecValidForTypeIdentifiers(const ParsedDocSpec& spec) const {
    return ::amp::validator::IsUsedForTypeIdentifiers(
        type_identifiers(), spec.enabled_by(), spec.disabled_by());
  }

  // Returns the first (there should at most one) DocSpec which matches both
  // the html format and type identifiers recorded so far in this context. If
  // called before identifiers have been recorded, it may return an incorrect
  // selection. Returns nullopt if no match.
  std::optional<const ParsedDocSpec*> MatchingDocSpec() const {
    // The specs are usually already filtered by HTML format, so this loop
    // should be very short, often 1.
    std::optional<const ParsedDocSpec*> out = std::nullopt;
    for (const ParsedDocSpec& spec : rules().doc()) {
      if (rules().IsDocSpecCorrectHtmlFormat(spec.spec()) &&
          IsDocSpecValidForTypeIdentifiers(spec)) {
        DCHECK(!out.has_value())
            << "Panic: Two DocSpec's match the same document.";
        return &spec;
      }
    }
    // Some simple tests load a tiny rules file to test one feature of the code.
    // These tests won't have any DocSpec rules defined. This is OK. The DLOG
    // is to verify that a particular format hasn't been ignored in the real
    // rule set.
    if (!rules().doc().empty()) {
      DLOG(FATAL) << "Panic: No ParsedDocSpec for this document setting "
                  << rules().html_format();
    }
    return std::nullopt;
  }

  // Returns true iff |spec| should be used for the type identifiers recorded
  // in this context, as seen in the document so far. If called before type
  // identifiers have been recorded, will always return false.
  bool IsDocCssSpecValidForTypeIdentifiers(const ParsedDocCssSpec& spec) const {
    return ::amp::validator::IsUsedForTypeIdentifiers(
        type_identifiers(), spec.enabled_by(), spec.disabled_by());
  }

  // Returns the first (there should at most one) DocCssSpec which matches both
  // the html format and type identifiers recorded so far in this context. If
  // called before identifiers have been recorded, it may return an incorrect
  // selection. Returns nullopt if no match.
  std::optional<const ParsedDocCssSpec*> MatchingDocCssSpec() const {
    // The specs are usually already filtered by HTML format, so this loop
    // should be very short, often 1.
    std::optional<const ParsedDocCssSpec*> out = std::nullopt;
    for (const ParsedDocCssSpec& spec : rules().css()) {
      if (rules().IsDocCssSpecCorrectHtmlFormat(spec.spec()) &&
          IsDocCssSpecValidForTypeIdentifiers(spec)) {
        DCHECK(!out.has_value())
            << "Panic: Two DocCssSpec's match the same document.";
        return &spec;
      }
    }
    // Some simple tests load a tiny rules file to test one feature of the code.
    // These tests won't have any DocCssSpec rules defined. This is OK. The DLOG
    // is to verify that a particular format hasn't been ignored in the real
    // rule set.
    if (!rules().css().empty()) {
      DLOG(FATAL) << "Panic: No ParsedCssSpec for this document setting "
                  << rules().html_format();
    }
    return std::nullopt;
  }

  const bool is_transformed() const {
    return c_find(type_identifiers_, TypeIdentifier::kTransformed) !=
           type_identifiers_.end();
  }

  const bool is_dev_mode() const {
    return c_find(type_identifiers_, TypeIdentifier::kDevMode) !=
           type_identifiers_.end();
  }

  const flat_hash_set<ValueSetProvision>& value_sets_provided() const {
    return value_sets_provided_;
  }

  const flat_hash_map<ValueSetProvision, std::vector<ValidationError>>&
  value_sets_required() const {
    return value_sets_required_;
  }

  ScriptReleaseVersion script_release_version() const {
    return script_release_version_;
  }

 private:
  // Given a tag result, update the Context state to affect
  // later validation. Does not handle updating the tag stack.
  void UpdateFromTagResult(const ValidateTagResult& result) {
    if (!result.best_match_tag_spec) return;
    const ParsedTagSpec& parsed_tag_spec = *result.best_match_tag_spec;

    extensions_.UpdateFromTagResult(result);
    // If this requires an extension and we are still in the document head,
    // record that we may still need to emit a missing extension error at
    // the end of the document head. We do this even for a tag failing
    // validation since extensions are based on the tag name, and we're still
    // pretty confident the user forgot to include the extension.
    if (tag_stack_.HasAncestor("HEAD"))
      extensions_.RecordFutureErrorsIfMissing(parsed_tag_spec, line_col());
    // We also want to satisfy conditions, to reduce errors seen elsewhere in
    // the doc.
    SatisfyConditionsFromTagSpec(parsed_tag_spec);
    SatisfyMandatoryAlternativesFromTagSpec(parsed_tag_spec);
    RecordValidatedFromTagSpec(result.IsPassing(), parsed_tag_spec);

    const auto& validation_result = result.validation_result;
    for (const auto& provision : validation_result.value_set_provisions())
      value_sets_provided_.insert(ValueSetProvision(provision));
    for (const auto& requirement : validation_result.value_set_requirements()) {
      if (!requirement.has_provision()) continue;
      value_sets_required_[ValueSetProvision(requirement.provision())]
          .push_back(requirement.error_if_unsatisfied());
    }

    if (result.IsPassing()) {
      // If the tag spec didn't match, we don't know that the tag actually
      // contained a URL, so no need to complain about it.
      MarkUrlSeenFromMatchingTagSpec(parsed_tag_spec);
    }
  }

  void RecordScriptReleaseVersionFromTagResult(
      const ParsedHtmlTag& parsed_tag) {
    if (script_release_version() == ScriptReleaseVersion::UNKNOWN &&
        (parsed_tag.IsExtensionScript() || parsed_tag.IsAmpRuntimeScript())) {
      script_release_version_ = parsed_tag.GetScriptReleaseVersion();
    }
  }

  // Record when an encountered tag's attribute that requires an extension
  // that it also satisfies that the required extension is used.
  void RecordAttrRequiresExtension(const ParsedHtmlTag& encountered_tag,
                                   const ValidateTagResult& tag_result) {
    if (!tag_result.best_match_tag_spec) return;
    const ParsedTagSpec* parsed_tag_spec = tag_result.best_match_tag_spec;
    if (!parsed_tag_spec->AttrsCanSatisfyExtension()) return;
    const unordered_map<std::string, int32_t>& attr_ids_by_name =
        parsed_tag_spec->attr_ids_by_name();
    ExtensionsContext* extensions_ctx = mutable_extensions();
    for (const ParsedHtmlTagAttr& attr : encountered_tag.Attributes()) {
      auto jt = attr_ids_by_name.find(attr.name());
      if (jt != attr_ids_by_name.end()) {
        const ParsedAttrSpec& parsed_attr_spec =
            rules_->parsed_attr_specs().GetById(jt->second);
        if (!parsed_attr_spec.spec().requires_extension().empty())
          extensions_ctx->RecordUsedExtensions(
              parsed_attr_spec.spec().requires_extension());
      }
    }
  }

  // Record document-level conditions which have been satisfied by the tag spec.
  void SatisfyConditionsFromTagSpec(const ParsedTagSpec& parsed_tag_spec) {
    c_copy(parsed_tag_spec.spec().satisfies_condition(),
           std::inserter(conditions_satisfied_, conditions_satisfied_.end()));
  }

  // Records that a Tag was seen which contains an URL. Used to note issues
  // with <base href> occurring in the document after an URL.
  void MarkUrlSeenFromMatchingTagSpec(const ParsedTagSpec& parsed_tag_spec) {
    if (parsed_tag_spec.ContainsUrl() && !HasSeenUrl())
      first_url_seen_tag_ = &parsed_tag_spec.spec();
  }

  // Record that this document contains a tag matching a particular tag spec.
  void RecordValidatedFromTagSpec(bool is_passing,
                                  const ParsedTagSpec& parsed_tag_spec) {
    if (parsed_tag_spec.ShouldRecordTagspecValidated() == ALWAYS)
      tagspecs_validated_.insert(parsed_tag_spec.id());
    else if (is_passing &&
             parsed_tag_spec.ShouldRecordTagspecValidated() == IF_PASSING)
      tagspecs_validated_.insert(parsed_tag_spec.id());
  }

  // Record that this document contains a tag which is a member of
  // a list of mandatory alternatives.
  void SatisfyMandatoryAlternativesFromTagSpec(
      const ParsedTagSpec& parsed_tag_spec) {
    if (parsed_tag_spec.spec().has_mandatory_alternatives())
      mandatory_alternatives_satisfied_.insert(
          parsed_tag_spec.spec().mandatory_alternatives());
  }

  const ParsedValidatorRules* rules_;
  int max_errors_ = -1;
  const char* current_token_start_;
  LineCol line_col_;

  ExtensionsContext extensions_;
  TagStack tag_stack_;

  // The remaining variables hold state about the global document determined
  // during validation.

  // First tagspec seen (matched) which contains an URL.
  const TagSpec* first_url_seen_tag_ = nullptr;
  // Here we record when we encounter a body tag, because we will only
  // see a single one per document - that's what Html5Lexer does. When we're
  // done with the document we compare it with Lexer::GetBodyTag, which has
  // a merged view of all the attributes of body tags within the doc.
  LineCol encountered_body_line_col_;
  std::string encountered_body_tag_;
  set<std::string> mandatory_alternatives_satisfied_;
  set<std::string> conditions_satisfied_;
  set<int32_t> tagspecs_validated_;
  int32_t doc_byte_size_ = 0;
  int32_t style_tag_byte_size_ = 0;
  int32_t inline_style_byte_size_ = 0;
  bool exit_early_ = false;
  vector<TypeIdentifier> type_identifiers_;
  flat_hash_set<ValueSetProvision> value_sets_provided_;
  flat_hash_map<ValueSetProvision, std::vector<ValidationError>>
      value_sets_required_;
  // Flag for if an LTS script is present.
  ScriptReleaseVersion script_release_version_ = ScriptReleaseVersion::UNKNOWN;
};

//
// Implementation of ChildTagMatcher
//

void ChildTagMatcher::MatchChildTagName(const ParsedHtmlTag& encountered_tag,
                                        const Context& context,
                                        ValidationResult* result) const {
  const ChildTagSpec& child_tags = parent_spec_->child_tags();
  // Enforce child_tag_name_oneof: If at least one tag name is specified, then
  // the child tags of the parent tag must have one of the provided tag names.
  if (child_tags.child_tag_name_oneof_size() > 0) {
    const RepeatedPtrField<std::string>& names =
        child_tags.child_tag_name_oneof();
    if (!c_linear_search(names, encountered_tag.UpperName())) {
      std::string allowed_names = StrCat("['", StrJoin(names, "', '"), "']");
      context.AddError(
          ValidationError::DISALLOWED_CHILD_TAG_NAME, context.line_col(),
          /*params=*/
          {encountered_tag.LowerName(), TagDescriptiveName(*parent_spec_),
           AsciiStrToLower(allowed_names)},
          TagSpecUrl(*parent_spec_), result);
    }
  }
  // Enforce first_child_tag_name_oneof: If at least one tag name is specified,
  // then the first child of the parent tag must have one of the provided names.
  if (child_tags.first_child_tag_name_oneof_size() > 0 &&
      context.tag_stack().ParentChildCount() == 0) {
    const RepeatedPtrField<std::string>& names =
        child_tags.first_child_tag_name_oneof();
    if (!c_linear_search(names, encountered_tag.UpperName())) {
      std::string allowed_names = StrCat("['", StrJoin(names, "', '"), "']");
      context.AddError(
          ValidationError::DISALLOWED_FIRST_CHILD_TAG_NAME, context.line_col(),
          /*params=*/
          {encountered_tag.LowerName(), TagDescriptiveName(*parent_spec_),
           AsciiStrToLower(allowed_names)},
          TagSpecUrl(*parent_spec_), result);
    }
  }
}

void ChildTagMatcher::ExitTag(const Context& context,
                              ValidationResult* result) const {
  int expected_num_child_tags =
      parent_spec_->child_tags().mandatory_num_child_tags();
  if (expected_num_child_tags != -1 &&
      expected_num_child_tags != context.tag_stack().ParentChildCount()) {
    context.AddError(
        ValidationError::INCORRECT_NUM_CHILD_TAGS, line_col_,
        /*params=*/
        {TagDescriptiveName(*parent_spec_), StrCat(expected_num_child_tags),
         StrCat(context.tag_stack().ParentChildCount())},
        TagSpecUrl(*parent_spec_), result);
  }

  int expected_min_num_child_tags =
      parent_spec_->child_tags().mandatory_min_num_child_tags();

  if (expected_min_num_child_tags != -1 &&
      context.tag_stack().ParentChildCount() < expected_min_num_child_tags) {
    context.AddError(
        ValidationError::INCORRECT_MIN_NUM_CHILD_TAGS, line_col_,
        /*params=*/
        {TagDescriptiveName(*parent_spec_), StrCat(expected_min_num_child_tags),
         StrCat(context.tag_stack().ParentChildCount())},
        TagSpecUrl(*parent_spec_), result);
  }
}

class UrlErrorInAttrAdapter {
 public:
  explicit UrlErrorInAttrAdapter(const std::string* attr_name)
      : attr_name_(attr_name) {}

  void MissingUrl(const Context& context, const TagSpec& tag_spec,
                  ValidationResult* result) const {
    context.AddError(ValidationError::MISSING_URL, context.line_col(),
                     /*params=*/{*attr_name_, TagDescriptiveName(tag_spec)},
                     TagSpecUrl(tag_spec), result);
  }

  void InvalidUrl(const Context& context, const std::string& url,
                  const TagSpec& tag_spec, ValidationResult* result) const {
    context.AddError(
        ValidationError::INVALID_URL, context.line_col(),
        /*params=*/{*attr_name_, TagDescriptiveName(tag_spec), url},
        TagSpecUrl(tag_spec), result);
  }

  void InvalidUrlProtocol(const Context& context, const std::string& url,
                          const std::string& protocol, const TagSpec& tag_spec,
                          ValidationResult* result) const {
    context.AddError(
        ValidationError::INVALID_URL_PROTOCOL, context.line_col(),
        /*params=*/{*attr_name_, TagDescriptiveName(tag_spec), protocol},
        TagSpecUrl(tag_spec), result);
  }

  void DisallowedRelativeUrl(const Context& context, const std::string& url,
                             const TagSpec& tag_spec,
                             ValidationResult* result) const {
    context.AddError(
        ValidationError::DISALLOWED_RELATIVE_URL, context.line_col(),
        /*params=*/{*attr_name_, TagDescriptiveName(tag_spec), url},
        TagSpecUrl(tag_spec), result);
  }

 private:
  const std::string* attr_name_;
};

class UrlErrorInStylesheetAdapter {
 public:
  explicit UrlErrorInStylesheetAdapter(LineCol line_col)
      : line_col_(line_col) {}

  void MissingUrl(const Context& context, const TagSpec& tag_spec,
                  ValidationResult* result) const {
    context.AddError(ValidationError::CSS_SYNTAX_MISSING_URL, line_col_,
                     /*params=*/{TagDescriptiveName(tag_spec)},
                     TagSpecUrl(tag_spec), result);
  }

  void InvalidUrl(const Context& context, const std::string& url,
                  const TagSpec& tag_spec, ValidationResult* result) const {
    context.AddError(ValidationError::CSS_SYNTAX_INVALID_URL, line_col_,
                     /*params=*/{TagDescriptiveName(tag_spec), url},
                     TagSpecUrl(tag_spec), result);
  }

  void InvalidUrlProtocol(const Context& context, const std::string& url,
                          const std::string& protocol, const TagSpec& tag_spec,
                          ValidationResult* result) const {
    context.AddError(ValidationError::CSS_SYNTAX_INVALID_URL_PROTOCOL,
                     line_col_,
                     /*params=*/{TagDescriptiveName(tag_spec), protocol},
                     TagSpecUrl(tag_spec), result);
  }

  void DisallowedRelativeUrl(const Context& context, const std::string& url,
                             const TagSpec& tag_spec,
                             ValidationResult* result) const {
    context.AddError(ValidationError::CSS_SYNTAX_DISALLOWED_RELATIVE_URL,
                     line_col_,
                     /*params=*/{TagDescriptiveName(tag_spec), url},
                     TagSpecUrl(tag_spec), result);
  }

 private:
  LineCol line_col_;
};

// Returns the protocol of the input URL. Assumes https if relative. Accepts
// both the original URL string and a parsed URL produced from it, to avoid
// reparsing.
std::string UrlProtocol(const std::string& url, const URL& parsed_url) {
  // This RE is based on closure/uri/utils.js, goog.uri.utils.splitRe_.
  // It appears to be more aggressive in extracting a protocol than url.h.
  // Older versions of IE ignore whitespace in URL protocols, so we
  // should as well when extracting it - missing a 'javascript:' or
  // similar things would open up those users with very old browsers
  // to XSS and other nastiness.
  // TODO: This has some false positives. Instead, we should rewrite all URLs
  // in the reserializer, which would make relative URLs into absolute URLs
  // and avoid the risk here. At that time, we could remove this.
  static LazyRE2 protocol_re = {"([^:/?#.]+):.*"};

  std::string protocol;
  // First, try the regex based protocol extraction and match lower-casing
  // and leading whitespace to what Javascript does. Only if this doesn't
  // work, fall back to the url.h variant (which will default the protocol
  // to https based on the base_url above).
  if (RE2::FullMatch(url, *protocol_re, &protocol)) {
    AsciiStrToLower(&protocol);
    absl::StripLeadingAsciiWhitespace(&protocol);
  } else {
    protocol = parsed_url.protocol();  // already lowercased by URL from url.h.
  }

  return protocol;
}

template <typename ErrorAdapter>
void ValidateUrlAndProtocol(const ParsedUrlSpec& parsed_url_spec,
                            const ErrorAdapter& adapter, const Context& context,
                            const std::string& url, const TagSpec& tag_spec,
                            ValidationResult* result) {
  const UrlSpec* spec = parsed_url_spec.spec();
  // includes non-breaking space
  static LazyRE2 only_whitespace_re = {"[\\s\xc2\xa0]*"};

  if (RE2::FullMatch(url, *only_whitespace_re) && !spec->allow_empty()) {
    adapter.MissingUrl(context, tag_spec, result);
    return;
  }

  htmlparser::URL parsed_url(url);

  if (!parsed_url.is_valid()) {
    adapter.InvalidUrl(context, url, tag_spec, result);
    return;
  }
  std::string protocol = UrlProtocol(url, parsed_url);
  if (!protocol.empty() && !parsed_url_spec.IsAllowedProtocol(protocol)) {
    adapter.InvalidUrlProtocol(context, url, protocol, tag_spec, result);
    return;
  }
  // Check the URL to see if it does not have a valid protocol and
  // therefore is a relative URL given the previous checks above.
  if (!spec->allow_relative() && !parsed_url.has_protocol()) {
    adapter.DisallowedRelativeUrl(context, url, tag_spec, result);
    return;
  }
}

bool IsDataUrl(const std::string& url) {
  URL parsed_url(url);
  if (!parsed_url.is_valid()) return false;

  return UrlProtocol(url, parsed_url) == "data";
}

CdataMatcher::CdataMatcher(const ParsedCdataSpec* parsed_cdata_spec,
                           const LineCol& line_col)
    : parsed_cdata_spec_(parsed_cdata_spec), line_col_(line_col) {}

class InvalidRuleVisitor : public htmlparser::css::RuleVisitor {
 public:
  InvalidRuleVisitor(const ParsedCdataSpec* cdata_spec, Context* context,
                     ValidationResult* result)
      : cdata_spec_(cdata_spec), context_(context), result_(result) {}

  void VisitAtRule(const htmlparser::css::AtRule& at_rule) override {
    if (!cdata_spec_->IsAtRuleValid(at_rule.name())) {
      context_->AddError(
          ValidationError::CSS_SYNTAX_INVALID_AT_RULE,
          LineCol(at_rule.line(), at_rule.col()),
          /*params=*/
          {TagDescriptiveName(cdata_spec_->ParentTagSpec()), at_rule.name()},
          /*spec_url=*/"", result_);
    }
  }

  void VisitDeclaration(
      const htmlparser::css::Declaration& declaration) override {
    if (!cdata_spec_->IsDeclarationValid(declaration.name())) {
      std::string allowed_declarations_str =
          cdata_spec_->AllowedDeclarationsString();
      if (allowed_declarations_str.empty()) {
        context_->AddError(ValidationError::CSS_SYNTAX_INVALID_PROPERTY_NOLIST,
                           LineCol(declaration.line(), declaration.col()),
                           /*params=*/
                           {TagDescriptiveName(cdata_spec_->ParentTagSpec()),
                            declaration.name()},
                           /*spec_url=*/"", result_);

      } else {
        context_->AddError(
            ValidationError::CSS_SYNTAX_INVALID_PROPERTY,
            LineCol(declaration.line(), declaration.col()),
            /*params=*/
            {TagDescriptiveName(cdata_spec_->ParentTagSpec()),
             declaration.name(), cdata_spec_->AllowedDeclarationsString()},
            /*spec_url=*/"", result_);
      }
    }
  }

 private:
  const ParsedCdataSpec* cdata_spec_;
  Context* context_;
  ValidationResult* result_;
};

class InvalidDeclVisitor : public htmlparser::css::RuleVisitor {
 public:
  InvalidDeclVisitor(const ParsedDocCssSpec& css_spec, Context* context,
                     const std::string& tag_descriptive_name,
                     ValidationResult* result)
      : css_spec_(css_spec),
        context_(context),
        tag_descriptive_name_(tag_descriptive_name),
        result_(result) {}

  void VisitDeclaration(
      const htmlparser::css::Declaration& declaration) override {
    const CssDeclaration* css_declaration =
        css_spec_.CssDeclarationByName(declaration.name());
    if (!css_declaration) {
      context_->AddError(ValidationError::CSS_SYNTAX_INVALID_PROPERTY_NOLIST,
                         LineCol(declaration.line(), declaration.col()),
                         /*params=*/
                         {tag_descriptive_name_, declaration.name()},
                         css_spec_.spec().spec_url(), result_);
      // Don't emit additional errors for this declaration.
      return;
    }
    if (css_declaration->value_casei_size() > 0) {
      bool has_valid_value = false;
      const std::string first_ident = declaration.FirstIdent();
      for (auto& value : css_declaration->value_casei()) {
        if (EqualsIgnoreCase(first_ident, value)) {
          has_valid_value = true;
          break;
        }
      }
      if (!has_valid_value) {
        // Declaration value not allowed.
        context_->AddError(
            ValidationError::CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
            LineCol(declaration.line(), declaration.col()),
            /*params=*/
            {tag_descriptive_name_, declaration.name(), first_ident},
            css_spec_.spec().spec_url(), result_);
      }
    } else if (css_declaration->has_value_regex_casei()) {
      RE2::Options options;
      options.set_case_sensitive(false);
      RE2 pattern(css_declaration->value_regex_casei(), options);
      const std::string first_ident = declaration.FirstIdent();
      if (!RE2::FullMatch(first_ident, pattern)) {
        context_->AddError(
            ValidationError::CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
            LineCol(declaration.line(), declaration.col()),
            /*params=*/
            {tag_descriptive_name_, declaration.name(), first_ident},
            css_spec_.spec().spec_url(), result_);
      }
    }
  }

 private:
  const ParsedDocCssSpec& css_spec_;
  Context* context_;
  const std::string tag_descriptive_name_;
  ValidationResult* result_;
};

void CdataMatcher::Match(string_view cdata, Context* context,
                         ValidationResult* result) const {
  if (!parsed_cdata_spec_) return;
  if (context->Progress(*result).complete) return;

  const CdataSpec& cdata_spec = parsed_cdata_spec_->Spec();

  int url_bytes = 0;

  // The mandatory_cdata, cdata_regex, and css_spec fields are treated
  // like a oneof, but we're not using oneof because it's a feature
  // that was added after protobuf 2.5.0 (which our open-source
  // version uses).
  // begin oneof {

  // Mandatory CDATA exact match
  if (cdata_spec.has_mandatory_cdata()) {
    if (cdata_spec.mandatory_cdata() != cdata) {
      context->AddError(
          ValidationError::MANDATORY_CDATA_MISSING_OR_INCORRECT,
          context->line_col(),
          /*params=*/{TagDescriptiveName(parsed_cdata_spec_->ParentTagSpec())},
          TagSpecUrl(parsed_cdata_spec_->ParentTagSpec()), result);
    }
    // We return early if the cdata has an exact match rule. The
    // spec shouldn't have an exact match rule that doesn't validate.
    return;
  } else if (cdata_spec.has_cdata_regex()) {
    if (!RE2::FullMatch(cdata, parsed_cdata_spec_->CdataRegex())) {
      context->AddError(
          ValidationError::MANDATORY_CDATA_MISSING_OR_INCORRECT,
          context->line_col(),
          /*params=*/{TagDescriptiveName(parsed_cdata_spec_->ParentTagSpec())},
          TagSpecUrl(parsed_cdata_spec_->ParentTagSpec()), result);
      return;
    }
  } else if (cdata_spec.has_css_spec()) {
    MatchCss(cdata, cdata_spec.css_spec(), &url_bytes, context, result);
  } else if (cdata_spec.whitespace_only()) {
    static LazyRE2 ws_only = {"^\\s*$"};
    if (!RE2::FullMatch(cdata, *ws_only)) {
      context->AddError(
          ValidationError::NON_WHITESPACE_CDATA_ENCOUNTERED,
          context->line_col(),
          /*params=*/
          {TagDescriptiveName(parsed_cdata_spec_->ParentTagSpec())},
          TagSpecUrl(parsed_cdata_spec_->ParentTagSpec()), result);
    }
  }
  // } end oneof

  std::optional<const ParsedDocCssSpec*> maybe_doc_css_spec =
      context->MatchingDocCssSpec();
  int adjusted_cdata_length = cdata.length();
  if (maybe_doc_css_spec && !(**maybe_doc_css_spec).spec().url_bytes_included())
    adjusted_cdata_length -= url_bytes;

  // Max CDATA Byte Length, specific to this CDATA (not the document limit).
  if (cdata_spec.has_max_bytes() &&
      adjusted_cdata_length > cdata_spec.max_bytes()) {
    if (parsed_cdata_spec_->ParentTagSpec().tag_name() == "SCRIPT") {
      context->AddError(
          ValidationError::INLINE_SCRIPT_TOO_LONG, context->line_col(),
          /*params=*/
          {StrCat(cdata.length()), StrCat(cdata_spec.max_bytes())},
          cdata_spec.max_bytes_spec_url(), result);
    } else {
      context->AddError(
          ValidationError::STYLESHEET_TOO_LONG, context->line_col(),
          /*params=*/
          {TagDescriptiveName(parsed_cdata_spec_->ParentTagSpec()),
           StrCat(cdata.length()), StrCat(cdata_spec.max_bytes())},
          cdata_spec.max_bytes_spec_url(), result);
    }
    return;
  }

  // Record <style amp-custom> byte size
  if (context->tag_stack().CountDocCssBytes()) {
    // This is safe from multiple TagSpecs executing on the same Tag, because
    // CDATA matching only happens once the TagSpec matches otherwise. It's not
    // of the TagSpec selection algorithm.
    context->AddStyleTagByteSize(adjusted_cdata_length);
  }

  if (context->Progress(*result).complete) return;
  // Evaluate the denylisted CDATA Regular Expressions
  for (const auto& entry : parsed_cdata_spec_->DenylistsWithErrorMsgs()) {
    if (context->Progress(*result).complete) return;
    if (RE2::PartialMatch(cdata, *entry.first))
      context->AddError(
          ValidationError::CDATA_VIOLATES_DENYLIST, context->line_col(),
          /*params=*/
          {TagDescriptiveName(parsed_cdata_spec_->ParentTagSpec()),
           entry.second},
          TagSpecUrl(parsed_cdata_spec_->ParentTagSpec()), result);
  }
}

namespace {
unique_ptr<htmlparser::css::ErrorToken> CreateParseErrorTokenAt(
    const htmlparser::css::Token& position_token, ValidationError::Code code,
    const std::vector<std::string>& params) {
  auto token = make_unique<htmlparser::css::ErrorToken>(code, params);
  position_token.CopyStartPositionTo(token.get());
  return token;
}

}  // namespace

// Matches the provided stylesheet against a CSS media query specification.
void CdataMatcher::MatchMediaQuery(
    const htmlparser::css::Stylesheet& stylesheet, const MediaQuerySpec& spec,
    vector<unique_ptr<htmlparser::css::ErrorToken>>* error_buffer) const {
  vector<std::unique_ptr<htmlparser::css::Token>> seen_media_types;
  vector<std::unique_ptr<htmlparser::css::Token>> seen_media_features;
  htmlparser::css::ParseMediaQueries(
      /*stylesheet*/ stylesheet,
      /*media_types*/ &seen_media_types,
      /*media_features*/ &seen_media_features,
      /*errors*/ error_buffer);

  for (const auto& token : seen_media_types) {
    // Make a copy first otherwise the later string_view gets clobbered.
    std::string seen_media_type = AsciiStrToLower(token->StringValue());
    auto stripped_media_type =
        htmlparser::css::StripVendorPrefix(seen_media_type);
    if (!c_linear_search(spec.type(), stripped_media_type)) {
      error_buffer->emplace_back(CreateParseErrorTokenAt(
          *token, ValidationError::CSS_SYNTAX_DISALLOWED_MEDIA_TYPE,
          /*params=*/{"", token->StringValue()}));
    }
  }
  for (const auto& token : seen_media_features) {
    // Make a copy first otherwise the later string_view gets clobbered.
    std::string seen_media_feature = AsciiStrToLower(token->StringValue());
    auto stripped_media_feature = htmlparser::css::StripMinMaxPrefix(
        htmlparser::css::StripVendorPrefix(seen_media_feature).data());
    if (!c_linear_search(spec.feature(), stripped_media_feature)) {
      error_buffer->emplace_back(CreateParseErrorTokenAt(
          *token, ValidationError::CSS_SYNTAX_DISALLOWED_MEDIA_FEATURE,
          /*params=*/{"", token->StringValue()}));
    }
  }
}

class SelectorSpecVisitor : public htmlparser::css::SelectorVisitor {
 public:
  SelectorSpecVisitor(
      const SelectorSpec& selector_spec,
      vector<unique_ptr<htmlparser::css::ErrorToken>>* error_buffer)
      : SelectorVisitor(error_buffer),
        selector_spec_(selector_spec),
        error_buffer_(error_buffer) {}

  void VisitAttrSelector(
      const htmlparser::css::AttrSelector& selector) override {
    for (const std::string& allowed_name : selector_spec_.attribute_name()) {
      if (allowed_name == "*" || allowed_name == selector.attr_name()) return;
    }
    error_buffer_->emplace_back(CreateParseErrorTokenAt(
        selector, ValidationError::CSS_SYNTAX_DISALLOWED_ATTR_SELECTOR,
        /*params=*/{"", selector.attr_name()}));
  }

  void VisitPseudoSelector(
      const htmlparser::css::PseudoSelector& selector) override {
    if (selector.is_pseudo_class()) {
      for (const std::string& allowed_pseudo_class :
           selector_spec_.pseudo_class()) {
        if (allowed_pseudo_class == "*" ||
            allowed_pseudo_class == selector.name())
          return;
      }
      error_buffer_->emplace_back(CreateParseErrorTokenAt(
          selector, ValidationError::CSS_SYNTAX_DISALLOWED_PSEUDO_CLASS,
          /*params=*/{"", selector.name()}));
    }
    if (selector.is_pseudo_element()) {
      for (const std::string& allowed_pseudo_element :
           selector_spec_.pseudo_element()) {
        if (allowed_pseudo_element == "*" ||
            allowed_pseudo_element == selector.name())
          return;
      }
      error_buffer_->emplace_back(CreateParseErrorTokenAt(
          selector, ValidationError::CSS_SYNTAX_DISALLOWED_PSEUDO_ELEMENT,
          /*params=*/{"", selector.name()}));
    }
  }

 private:
  const SelectorSpec& selector_spec_;
  vector<unique_ptr<htmlparser::css::ErrorToken>>* error_buffer_;
};

void CdataMatcher::MatchSelectors(
    const htmlparser::css::Stylesheet& stylesheet, const SelectorSpec& spec,
    vector<unique_ptr<htmlparser::css::ErrorToken>>* error_buffer) const {
  SelectorSpecVisitor visitor(spec, error_buffer);
  stylesheet.Accept(&visitor);
}

void CdataMatcher::MatchCss(string_view cdata, const CssSpec& css_spec,
                            int* url_bytes, Context* context,
                            ValidationResult* result) const {
  vector<unique_ptr<htmlparser::css::ErrorToken>> css_errors;
  vector<unique_ptr<htmlparser::css::ErrorToken>> css_warnings;
  vector<char32_t> codepoints =
      htmlparser::Strings::Utf8ToCodepoints(cdata.data());
  vector<unique_ptr<htmlparser::css::Token>> tokens = htmlparser::css::Tokenize(
      &codepoints, line_col_.line(), line_col_.col(), &css_errors);
  unique_ptr<htmlparser::css::Stylesheet> stylesheet =
      htmlparser::css::ParseAStylesheet(
          &tokens, parsed_cdata_spec_->css_parsing_config(), &css_errors);

  std::optional<const ParsedDocCssSpec*> maybe_doc_css_spec =
      context->MatchingDocCssSpec();

  // We extract the urls from the stylesheet. As a side-effect, this can
  // generate errors for url(...) functions with invalid parameters.
  vector<unique_ptr<htmlparser::css::ParsedCssUrl>> parsed_urls;
  htmlparser::css::ExtractUrls(*stylesheet, &parsed_urls, &css_errors);

  // Similarly, we extract query types and features from @media rules.
  for (const AtRuleSpec& at_rule_spec : css_spec.at_rule_spec()) {
    if (!at_rule_spec.has_media_query_spec()) continue;
    DCHECK_EQ(at_rule_spec.name(), "media")
        << "Only 'media' AT rules should have a MediaQuerySpec";
    const MediaQuerySpec& media_query_spec = at_rule_spec.media_query_spec();
    auto* error_buffer =
        media_query_spec.issues_as_error() ? &css_errors : &css_warnings;
    MatchMediaQuery(*stylesheet, at_rule_spec.media_query_spec(), error_buffer);
    // There will be at most one @media at_rule_spec.
    break;
  }

  if (css_spec.has_selector_spec()) {
    const SelectorSpec& selector_spec = css_spec.selector_spec();
    MatchSelectors(*stylesheet, selector_spec, &css_errors);
  }

  if (css_spec.validate_amp4ads()) {
    htmlparser::css::ValidateAmp4AdsCss(*stylesheet, &css_errors);
  }
  if (css_spec.validate_keyframes()) {
    amp::validator::parse_css::ValidateKeyframesCss(*stylesheet, &css_errors);
  }

  // Add errors then warnings:
  for (const unique_ptr<htmlparser::css::ErrorToken>& error_token :
       css_errors) {
    // Override the first parameter with the name of this style tag.
    vector<std::string> params = error_token->params();
    params[0] = TagDescriptiveName(parsed_cdata_spec_->ParentTagSpec());
    context->AddError(error_token->code(),
                      LineCol(error_token->line(), error_token->col()), params,
                      /*spec_url=*/"", result);
  }
  for (const unique_ptr<htmlparser::css::ErrorToken>& error_token :
       css_warnings) {
    // Override the first parameter with the name of this style tag.
    vector<std::string> params = error_token->params();
    params[0] = TagDescriptiveName(parsed_cdata_spec_->ParentTagSpec());
    context->AddWarning(error_token->code(),
                        LineCol(error_token->line(), error_token->col()),
                        params, /*spec_url=*/"", result);
  }

  // If `!important` is not allowed, record instances as errors.
  if (!css_spec.allow_important()) {
    vector<const htmlparser::css::Declaration*> important;
    htmlparser::css::ExtractImportantDeclarations(*stylesheet, &important);
    for (const htmlparser::css::Declaration* decl : important) {
      context->AddError(ValidationError::CSS_SYNTAX_DISALLOWED_IMPORTANT,
                        LineCol(decl->important_line(), decl->important_col()),
                        /*params=*/{}, context->rules().styles_spec_url(),
                        result);
    }
  }

  // Validate all url() functions found in the CSS against the document-level
  // image and font url specs.
  *url_bytes = 0;
  for (const auto& url : parsed_urls) {
    // Some CSS specs can choose to not count URLs against the byte limit, but
    // data URLs are always counted (or in other words, they aren't considered
    // URLs).
    if (!IsDataUrl(url->utf8_url())) *url_bytes += url->utf8_url().length();
    if (maybe_doc_css_spec) {
      const ParsedDocCssSpec& doc_css_spec = **maybe_doc_css_spec;
      ValidateUrlAndProtocol(
          ((url->at_rule_scope() == "font-face")
               ? doc_css_spec.font_url_spec()
               : doc_css_spec.image_url_spec()),
          UrlErrorInStylesheetAdapter(LineCol(url->line(), url->col())),
          *context, url->utf8_url(), parsed_cdata_spec_->ParentTagSpec(),
          result);
    }
  }
  // Validate the allowed CSS AT rules (eg: `@media`).
  InvalidRuleVisitor visitor(parsed_cdata_spec_, context, result);
  stylesheet->Accept(&visitor);

  // Validate the allowed CSS declarations (eg: `background-color`)
  if (maybe_doc_css_spec &&
      !(**maybe_doc_css_spec).spec().allow_all_declaration_in_style()) {
    InvalidDeclVisitor visitor(
        **maybe_doc_css_spec, context,
        TagDescriptiveName(parsed_cdata_spec_->ParentTagSpec()), result);
    stylesheet->Accept(&visitor);
  }
}

void ValidateAttrValueUrl(const ParsedAttrSpec& parsed_attr_spec,
                          const Context& context, const std::string& attr_name,
                          const std::string& attr_value,
                          const TagSpec& tag_spec, ValidationResult* result) {
  vector<std::string> maybe_urls;
  if (attr_name != "srcset") {
    maybe_urls.push_back(attr_value);
  } else {
    if (attr_value.empty()) {
      context.AddError(ValidationError::MISSING_URL, context.line_col(),
                       /*params=*/{attr_name, TagDescriptiveName(tag_spec)},
                       TagSpecUrl(tag_spec), result);
      return;
    }
    const amp::validator::parse_srcset::SrcsetParsingResult parse_result =
        amp::validator::parse_srcset::ParseSourceSet(attr_value);
    if (!parse_result.success) {
      // DUPLICATE_DIMENSION only needs two parameters, it does not report on
      // the attribute value.
      if (parse_result.error_code == ValidationError::DUPLICATE_DIMENSION)
        context.AddError(parse_result.error_code, context.line_col(),
                         /*params=*/{attr_name, TagDescriptiveName(tag_spec)},
                         TagSpecUrl(tag_spec), result);
      else
        context.AddError(
            parse_result.error_code, context.line_col(),
            /*params=*/{attr_name, TagDescriptiveName(tag_spec), attr_value},
            TagSpecUrl(tag_spec), result);
      return;
    }
    for (const amp::validator::parse_srcset::ImageCandidate& image :
         parse_result.srcset_images)
      maybe_urls.push_back(image.url);
  }
  if (maybe_urls.empty()) {
    context.AddError(ValidationError::MISSING_URL, context.line_col(),
                     /*params=*/{attr_name, TagDescriptiveName(tag_spec)},
                     TagSpecUrl(tag_spec), result);
    return;
  }
  SortAndUniquify(&maybe_urls);
  UrlErrorInAttrAdapter adapter(&attr_name);
  for (const std::string& maybe_url : maybe_urls) {
    ValidateUrlAndProtocol(parsed_attr_spec.value_url_spec(), adapter, context,
                           maybe_url, tag_spec, result);
    if (result->status() == ValidationResult::FAIL) return;
  }
}

void ValidateAttrValueProperties(const ParsedAttrSpec& parsed_attr_spec,
                                 const Context& context,
                                 const std::string& attr_name,
                                 const std::string& attr_value,
                                 const TagSpec& tag_spec,
                                 ValidationResult* result) {
  vector<const PropertySpec*> mandatory_value_properties_seen;
  const unordered_map<std::string, const PropertySpec*>&
      value_property_by_name = parsed_attr_spec.value_property_by_name();
  for (const auto& property :
       amp::validator::parse_viewport::ParseContent(attr_value)) {
    const std::string& name = property.first;
    const std::string& value = property.second;
    auto it = value_property_by_name.find(name);
    if (it == value_property_by_name.end()) {
      context.AddError(
          ValidationError::DISALLOWED_PROPERTY_IN_ATTR_VALUE,
          context.line_col(),
          /*params=*/{name, attr_name, TagDescriptiveName(tag_spec)},
          TagSpecUrl(tag_spec), result);
      continue;
    }
    const PropertySpec* property_spec = it->second;
    mandatory_value_properties_seen.push_back(property_spec);

    // The value and value_double fields are treated like a oneof,
    // but we're not using oneof because it's a feature that was added
    // after protobuf 2.5.0 (which our open-source version uses).
    // begin oneof {
    if (property_spec->has_value()) {
      if (property_spec->value() !=
          AsciiStrToLower(absl::StripAsciiWhitespace(value))) {
        context.AddError(
            ValidationError::INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            context.line_col(),
            /*params=*/{name, attr_name, TagDescriptiveName(tag_spec), value},
            TagSpecUrl(tag_spec), result);
      }
    } else if (property_spec->has_value_double()) {
      double d;
      if (!absl::SimpleAtod(value, &d) || d != property_spec->value_double()) {
        context.AddError(
            ValidationError::INVALID_PROPERTY_VALUE_IN_ATTR_VALUE,
            context.line_col(),
            /*params=*/{name, attr_name, TagDescriptiveName(tag_spec), value},
            TagSpecUrl(tag_spec), result);
      }
    }
    // } end oneof
  }
  SortAndUniquify(&mandatory_value_properties_seen);
  vector<const PropertySpec*> not_seen =
      Diff(parsed_attr_spec.mandatory_value_properties(),
           mandatory_value_properties_seen);

  // To reduce churn emit errors sorted by names instead of memory addresses.
  std::stable_sort(not_seen.begin(), not_seen.end(),
            [](const PropertySpec* lhs, const PropertySpec* rhs) {
              return lhs->name() < rhs->name();
            });

  for (const PropertySpec* spec : not_seen) {
    context.AddError(
        ValidationError::MANDATORY_PROPERTY_MISSING_FROM_ATTR_VALUE,
        context.line_col(),
        /*params=*/{spec->name(), attr_name, TagDescriptiveName(tag_spec)},
        TagSpecUrl(tag_spec), result);
  }
}

// This is the main validation procedure for attributes, operating with a
// ParsedAttrSpec instance.
void ValidateNonTemplateAttrValueAgainstSpec(
    const ParsedAttrSpec& parsed_attr_spec, const Context& context,
    const std::string& attr_name, const std::string& attr_value,
    const TagSpec& tag_spec, ValidationResult* result) {
  const AttrSpec& spec = parsed_attr_spec.spec();
  if (spec.has_add_value_to_set()) {
    auto* provision = result->add_value_set_provisions();
    provision->set_set(spec.add_value_to_set());
    provision->set_value(attr_value);
  }
  if (spec.has_value_oneof_set()) {
    auto* requirement = result->add_value_set_requirements();
    requirement->mutable_provision()->set_set(spec.value_oneof_set());
    requirement->mutable_provision()->set_value(attr_value);
    *requirement->mutable_error_if_unsatisfied() =
        PopulateError(ValidationError::ERROR,
                      ValidationError::VALUE_SET_MISMATCH, context.line_col(),
                      /*params=*/{attr_name, TagDescriptiveName(tag_spec)},
                      TagSpecUrl(tag_spec));
  }
  // The value, value_regex, and value_properties fields are treated
  // like a oneof, but we're not using oneof because it's a feature
  // that was added after protobuf 2.5.0 (which our open-source version uses).
  // begin oneof {
  if (spec.value_size() > 0) {
    for (const std::string& v : spec.value()) {
      if (attr_value == v) return;
      // Allow spec's with value: "" to also be equal to their attribute name
      // (e.g. script's spec: async has value: "" so both async and
      // async="async" is okay in a script tag).
      if (v.empty() && (attr_value == attr_name)) return;
    }
    context.AddError(
        ValidationError::INVALID_ATTR_VALUE, context.line_col(),
        /*params=*/{attr_name, TagDescriptiveName(tag_spec), attr_value},
        TagSpecUrl(tag_spec), result);
  } else if (spec.value_casei_size() > 0) {
    for (const std::string& v : spec.value_casei()) {
      if (EqualsIgnoreCase(attr_value, v)) return;
    }
    context.AddError(
        ValidationError::INVALID_ATTR_VALUE, context.line_col(),
        /*params=*/{attr_name, TagDescriptiveName(tag_spec), attr_value},
        TagSpecUrl(tag_spec), result);
  } else if (parsed_attr_spec.has_value_regex()) {
    if (!RE2::FullMatch(attr_value, parsed_attr_spec.value_regex())) {
      context.AddError(
          ValidationError::INVALID_ATTR_VALUE, context.line_col(),
          /*params=*/{attr_name, TagDescriptiveName(tag_spec), attr_value},
          TagSpecUrl(tag_spec), result);
    }
  } else if (spec.has_value_url()) {
    ValidateAttrValueUrl(parsed_attr_spec, context, attr_name, attr_value,
                         tag_spec, result);
  } else if (spec.has_value_properties()) {
    ValidateAttrValueProperties(parsed_attr_spec, context, attr_name,
                                attr_value, tag_spec, result);
  }
  // } end oneof
}

bool AttrValueHasTemplateSyntax(string_view value) {
  // Mustache (https://mustache.github.io/mustache.5.html), our template
  // system, supports replacement tags that start with {{ and end with }}.
  // We relax attribute value rules if the value contains this syntax
  // as we will validate the post-processed tag instead.
  static LazyRE2 mustache_tag = {"{{.*}}"};
  return RE2::PartialMatch(value, *mustache_tag);
}

bool AttrValueHasUnescapedTemplateSyntax(string_view value) {
  // Mustache (https://mustache.github.io/mustache.5.html), our template
  // system, supports unescaped variables of one of these formats:
  // {{{unescaped}}} or {{{&unescaped}}} and there can be whitespace after
  // the 2nd '{'. We disallow these in attribute Values.
  static LazyRE2 unescaped_open_tag = {"{{\\s*[&{]"};
  return RE2::PartialMatch(value, *unescaped_open_tag);
}

bool AttrValueHasPartialsTemplateSyntax(string_view value) {
  // Mustache (https://mustache.github.io/mustache.5.html), our template
  // system, supports 'partials' which include other Mustache templates
  // in the format of {{>partial}} and there can be whitespace after the {{.
  // We disallow partials in attribute values.
  static LazyRE2 open_partial_tag = {"{{\\s*>"};
  return RE2::PartialMatch(value, *open_partial_tag);
}

// Validates whether the parent tag satisfied the spec (e.g., some
// tags can only appear in head).
void ValidateParentTag(const ParsedTagSpec& parsed_tag_spec,
                       const Context& context, ValidationResult* result) {
  const TagSpec& spec = parsed_tag_spec.spec();
  if (spec.has_mandatory_parent() &&
      (spec.mandatory_parent() != context.tag_stack().ParentTagName()) &&
      (spec.mandatory_parent() != context.tag_stack().ParentTagSpecName())) {
    // Output a parent/child error using CSS Child Selector syntax which is
    // both succinct and should be well understood by web developers.
    context.AddError(ValidationError::WRONG_PARENT_TAG, context.line_col(),
                     /*params=*/
                     {TagDescriptiveName(spec),
                      AsciiStrToLower(context.tag_stack().ParentTagName()),
                      AsciiStrToLower(spec.mandatory_parent())},
                     TagSpecUrl(spec), result);
  }
}

// Validates that this tag is an allowed descendant tag type.
void ValidateDescendantTags(const ParsedHtmlTag& encountered_tag,
                            const ParsedTagSpec& parsed_tag_spec,
                            const Context& context, ValidationResult* result) {
  const TagStack& tag_stack = context.tag_stack();

  int32_t allowed_descendants_lists =
      tag_stack.allowed_descendants_list().size();

  for (int32_t ii = 0; ii < allowed_descendants_lists; ++ii) {
    const vector<std::string>& allowed_descendant_tags =
        tag_stack.allowed_descendants_list()[ii]->allowed_tags();

    // If the tag we're validating is not allowed for a specific ancestor,
    // then throw an error.
    if (!c_linear_search(allowed_descendant_tags,
                         encountered_tag.UpperName())) {
      context.AddError(
          ValidationError::DISALLOWED_TAG_ANCESTOR, context.line_col(),
          /*params=*/
          {encountered_tag.LowerName(),
           AsciiStrToLower(
               tag_stack.allowed_descendants_list()[ii]->tag_name())},
          TagSpecUrl(parsed_tag_spec), result);
    }
  }
}

void ValidateNoSiblingsAllowedTags(const ParsedHtmlTag& tag,
                                   const ParsedTagSpec& parsed_tag_spec,
                                   const Context& context,
                                   ValidationResult* result) {
  const TagSpec& tag_spec = parsed_tag_spec.spec();

  if (tag_spec.siblings_disallowed() &&
      context.tag_stack().ParentChildCount() > 0) {
    context.AddError(
        ValidationError::TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS, context.line_col(),
        /*params=*/
        {tag.LowerName(), AsciiStrToLower(context.tag_stack().ParentTagName())},
        TagSpecUrl(tag_spec), result);
  }

  if (context.tag_stack().ParentHasChildWithNoSiblingRule() &&
      context.tag_stack().ParentChildCount() > 0) {
    context.AddError(
        ValidationError::TAG_NOT_ALLOWED_TO_HAVE_SIBLINGS,
        context.tag_stack().ParentOnlyChildErrorLineCol(),
        /*params=*/
        {AsciiStrToLower(context.tag_stack().ParentOnlyChildTagName()),
         AsciiStrToLower(context.tag_stack().ParentTagName())},
        TagSpecUrl(tag_spec), result);
  }
}

// Validates if the 'last child' rule exists.
void ValidateLastChildTags(const Context& context, ValidationResult* result) {
  if (context.tag_stack().ParentHasChildWithLastChildRule()) {
    context.AddError(
        ValidationError::MANDATORY_LAST_CHILD_TAG,
        context.tag_stack().ParentLastChildErrorLineCol(),
        /*params=*/
        {AsciiStrToLower(context.tag_stack().ParentLastChildTagName()),
         AsciiStrToLower(context.tag_stack().ParentTagName())},
        context.tag_stack().ParentLastChildUrl(), result);
  }
}

// If this tag requires an extension and we have processed all extensions,
// report an error if that extension has not been loaded.
void ValidateRequiredExtensions(const ParsedTagSpec& parsed_tag_spec,
                                const Context& context,
                                ValidationResult* result) {
  const TagSpec& tag_spec = parsed_tag_spec.spec();
  const ExtensionsContext& extensions_ctx = context.extensions();
  for (const std::string& required_extension : tag_spec.requires_extension()) {
    if (!extensions_ctx.IsExtensionLoaded(required_extension)) {
      context.AddError(
          ValidationError::MISSING_REQUIRED_EXTENSION, context.line_col(),
          /*params=*/{TagDescriptiveName(tag_spec), required_extension},
          TagSpecUrl(parsed_tag_spec), result);
    }
  }
}

// If this attribute requires an extension and we have processed all extensions,
// report an error if that extension has not been loaded.
void ValidateAttrRequiredExtensions(const ParsedAttrSpec& parsed_attr_spec,
                                    const Context& context,
                                    ValidationResult* result) {
  const AttrSpec& attr_spec = parsed_attr_spec.spec();
  const ExtensionsContext& extensions_ctx = context.extensions();
  for (const std::string& required_extension : attr_spec.requires_extension()) {
    if (!extensions_ctx.IsExtensionLoaded(required_extension)) {
      context.AddError(ValidationError::ATTR_MISSING_REQUIRED_EXTENSION,
                       context.line_col(),
                       /*params=*/{attr_spec.name(), required_extension},
                       /*spec_url=*/"", result);
    }
  }
}

// Check for duplicates of tags that should be unique, reporting errors for the
// second instance of each unique tag.
void ValidateUniqueness(const ParsedTagSpec& parsed_tag_spec,
                        const Context& context, ValidationResult* result) {
  const TagSpec& tag_spec = parsed_tag_spec.spec();
  if (tag_spec.unique() &&
      context.TagspecsValidated().count(parsed_tag_spec.id())) {
    context.AddError(ValidationError::DUPLICATE_UNIQUE_TAG, context.line_col(),
                     /*params=*/{TagDescriptiveName(parsed_tag_spec.spec())},
                     TagSpecUrl(parsed_tag_spec), result);
  }
}

// Considering that reference points could be defined by both reference
// points and regular tag specs, check that we don't have matchers assigned
// from both, there can be only one.
void CheckForReferencePointCollision(const ParsedTagSpec* ref_point_spec,
                                     const ParsedTagSpec* tag_spec,
                                     const Context& context,
                                     ValidationResult* result) {
  if (!ref_point_spec || !ref_point_spec->has_reference_points()) return;
  if (!tag_spec || !tag_spec->has_reference_points()) return;

  context.AddError(
      ValidationError::TAG_REFERENCE_POINT_CONFLICT, context.line_col(),
      /*params=*/
      {TagDescriptiveName(tag_spec->spec()),
       ref_point_spec->reference_points().parent_tag_spec_name()},
      ref_point_spec->reference_points().parent_spec_url(), result);
}

// Validates if the tag ancestors satisfied the spec.
void ValidateAncestorTags(const ParsedTagSpec& parsed_tag_spec,
                          const Context& context, ValidationResult* result) {
  const TagSpec& spec = parsed_tag_spec.spec();
  if (spec.has_mandatory_ancestor()) {
    const std::string& mandatory_ancestor = spec.mandatory_ancestor();
    if (!context.tag_stack().HasAncestor(mandatory_ancestor)) {
      if (spec.has_mandatory_ancestor_suggested_alternative()) {
        const std::string alt_tag =
            AsciiStrToLower(spec.mandatory_ancestor_suggested_alternative());
        context.AddError(ValidationError::MANDATORY_TAG_ANCESTOR_WITH_HINT,
                         context.line_col(),
                         /*params=*/
                         {TagDescriptiveName(spec),
                          AsciiStrToLower(mandatory_ancestor), alt_tag},
                         TagSpecUrl(spec), result);
      } else {
        context.AddError(
            ValidationError::MANDATORY_TAG_ANCESTOR, context.line_col(),
            /*params=*/
            {TagDescriptiveName(spec), AsciiStrToLower(mandatory_ancestor)},
            TagSpecUrl(spec), result);
      }
      return;
    }
  }
  for (const std::string& disallowed_ancestor : spec.disallowed_ancestor()) {
    if (context.tag_stack().HasAncestor(disallowed_ancestor)) {
      context.AddError(
          ValidationError::DISALLOWED_TAG_ANCESTOR, context.line_col(),
          /*params=*/
          {TagDescriptiveName(spec), AsciiStrToLower(disallowed_ancestor)},
          TagSpecUrl(spec), result);
      return;
    }
  }
}

// Helper method for ValidateLayout.
// Validates the server-side rendering related attributes for the given layout.
void ValidateSsrLayout(const TagSpec& spec,
                       const ParsedHtmlTag& encountered_tag,
                       const AmpLayout::Layout& input_layout,
                       const CssLength input_width,
                       const CssLength input_height,
                       const string_view sizes_attr,
                       const string_view heights_attr, const Context& context,
                       ValidationResult* result) {
  // Only applies to transformed AMP and custom elements (<amp-...>).
  if (!context.is_transformed() ||
      !StartsWith(encountered_tag.LowerName(), "amp-"))
    return;

  // calculate effective ssr layout
  CssLength width =
      CalculateWidth(input_layout, input_width, encountered_tag.UpperName());
  CssLength height =
      CalculateHeight(input_layout, input_height, encountered_tag.UpperName());
  AmpLayout::Layout layout =
      CalculateLayout(input_layout, width, height,
                      sizes_attr.data() != nullptr && !sizes_attr.empty(),
                      heights_attr.data() != nullptr && !heights_attr.empty());

  // class attribute
  auto class_attr = encountered_tag.GetAttr("class");
  if (class_attr && !class_attr.value().empty()) {
    // i-amphtml-layout-{layout_name}
    vector<std::string> valid_internal_classes = {
        amp::validator::parse_layout::GetLayoutClass(layout)};
    if (amp::validator::parse_layout::IsLayoutSizeDefined(layout))
      // i-amphtml-layout-size-defined
      valid_internal_classes.push_back(
          amp::validator::parse_layout::GetLayoutSizeDefinedClass());
    if (amp::validator::parse_layout::IsLayoutAwaitingSize(layout))
      // i-amphtml-layout-awaiting-size
      valid_internal_classes.push_back(
          amp::validator::parse_layout::GetLayoutAwaitingSizeClass());
    for (const string_view class_token :
         StrSplit(class_attr.value(), ByAnyChar("\t\n\f\r "))) {
      if (StartsWith(class_token, "i-amphtml-") &&
          c_find(valid_internal_classes, class_token) ==
              valid_internal_classes.end()) {
        context.AddError(ValidationError::INVALID_ATTR_VALUE,
                         context.line_col(),
                         /*params=*/
                         {"class", TagDescriptiveName(spec),
                          std::string(class_attr.value())},
                         TagSpecUrl(spec), result);
        continue;
      }
    }
  }

  // i-amphtml-layout attribute
  auto ssr_attr = encountered_tag.GetAttr("i-amphtml-layout");
  if (ssr_attr && !ssr_attr.value().empty()) {
    const std::string layout_name =
        amp::validator::parse_layout::GetLayoutName(layout);
    if (!EqualsIgnoreCase(layout_name, ssr_attr.value())) {
      context.AddError(ValidationError::ATTR_VALUE_REQUIRED_BY_LAYOUT,
                       context.line_col(),
                       /*params=*/
                       {std::string(ssr_attr.value()), "i-amphtml-layout",
                        TagDescriptiveName(spec),
                        AmpLayout::Layout_Name(layout), layout_name},
                       TagSpecUrl(spec), result);
    }
  }
}

// Helper method for ValidateAttributes.
// Validates the layout for the given tag. This involves checking
// the layout, width, height, sizes attributes with AMP specific logic.
void ValidateLayout(const ParsedTagSpec& parsed_tag_spec,
                    const Context& context,
                    const ParsedHtmlTag& encountered_tag,
                    ValidationResult* result) {
  const TagSpec& spec = parsed_tag_spec.spec();
  string_view layout_attr =
      encountered_tag.GetAttr("layout").value_or(string_view());
  string_view width_attr =
      encountered_tag.GetAttr("width").value_or(string_view());
  string_view height_attr =
      encountered_tag.GetAttr("height").value_or(string_view());
  string_view sizes_attr =
      encountered_tag.GetAttr("sizes").value_or(string_view());
  string_view heights_attr =
      encountered_tag.GetAttr("heights").value_or(string_view());

  // We disable validating layout for tags where one of the layout attributes
  // contains mustache syntax.
  bool has_template_ancestor = context.tag_stack().HasAncestor("TEMPLATE");
  if (has_template_ancestor && (AttrValueHasTemplateSyntax(layout_attr) ||
                                AttrValueHasTemplateSyntax(width_attr) ||
                                AttrValueHasTemplateSyntax(height_attr) ||
                                AttrValueHasTemplateSyntax(sizes_attr) ||
                                AttrValueHasTemplateSyntax(heights_attr)))
    return;

  // Parse the input layout attributes which we found for this tag.
  const AmpLayout::Layout input_layout =
      amp::validator::parse_layout::ParseLayout(layout_attr);
  if (layout_attr.data() && input_layout == AmpLayout::UNKNOWN) {
    context.AddError(
        ValidationError::INVALID_ATTR_VALUE, context.line_col(),
        /*params=*/
        {"layout", TagDescriptiveName(spec), std::string(layout_attr)},
        TagSpecUrl(spec), result);
    return;
  }
  const CssLength input_width(width_attr, /*allow_auto=*/true,
                              /*allow_fluid=*/input_layout == AmpLayout::FLUID);
  if (!input_width.is_valid) {
    context.AddError(
        ValidationError::INVALID_ATTR_VALUE, context.line_col(),
        /*params=*/{"width", TagDescriptiveName(spec), std::string(width_attr)},
        TagSpecUrl(spec), result);
    return;
  }
  const CssLength input_height(
      height_attr, /*allow_auto=*/true,
      /*allow_fluid=*/input_layout == AmpLayout::FLUID);
  if (!input_height.is_valid) {
    context.AddError(
        ValidationError::INVALID_ATTR_VALUE, context.line_col(),
        /*params=*/
        {"height", TagDescriptiveName(spec), std::string(height_attr)},
        TagSpecUrl(spec), result);
    return;
  }

  // Now calculate the effective layout attributes.
  const CssLength width = amp::validator::parse_layout::CalculateWidth(
      spec.amp_layout(), input_layout, input_width);
  const CssLength height = amp::validator::parse_layout::CalculateHeight(
      spec.amp_layout(), input_layout, input_height);
  const AmpLayout::Layout layout =
      amp::validator::parse_layout::CalculateLayout(
          input_layout, width, height,
          sizes_attr.data() != nullptr && !sizes_attr.empty(),
          heights_attr.data() != nullptr && !heights_attr.empty());

  // Validate for transformed AMP the server-side rendering layout.
  ValidateSsrLayout(spec, encountered_tag, input_layout, input_width,
                    input_height, sizes_attr, heights_attr, context, result);

  // Only FLEX_ITEM allows for height to be set to auto.
  if (height.is_auto && layout != AmpLayout::FLEX_ITEM) {
    context.AddError(
        ValidationError::INVALID_ATTR_VALUE, context.line_col(),
        /*params=*/
        {"height", TagDescriptiveName(spec), std::string(height_attr)},
        TagSpecUrl(spec), result);
    return;
  }

  // Does the tag support the computed layout?
  const auto& supported_layouts = spec.amp_layout().supported_layouts();
  if (std::find(supported_layouts.begin(), supported_layouts.end(), layout) ==
      supported_layouts.end()) {
    ValidationError::Code code =
        (layout_attr.empty()) ? ValidationError::IMPLIED_LAYOUT_INVALID
                              : ValidationError::SPECIFIED_LAYOUT_INVALID;
    // Special case. If no layout related attributes were provided, this implies
    // the CONTAINER layout. However, telling the user that the implied layout
    // is unsupported for this tag is confusing if all they need is to provide
    // width and height, for example, the common case of creating
    // an AMP-IMG without specifying dimensions. In this case, we emit a
    // less correct, but simpler error message that could be more useful to
    // the average user.
    if (code == ValidationError::IMPLIED_LAYOUT_INVALID &&
        layout == AmpLayout::CONTAINER &&
        std::find(supported_layouts.begin(), supported_layouts.end(),
                  AmpLayout::RESPONSIVE) != supported_layouts.end()) {
      context.AddError(
          ValidationError::MISSING_LAYOUT_ATTRIBUTES, context.line_col(),
          /*params=*/{TagDescriptiveName(spec)}, TagSpecUrl(spec), result);
      return;
    }

    context.AddError(
        code, context.line_col(),
        /*params=*/{AmpLayout::Layout_Name(layout), TagDescriptiveName(spec)},
        TagSpecUrl(spec), result);
    return;
  }
  // FIXED, FIXED_HEIGHT, INTRINSIC and RESPONSIVE must have height set.
  if ((layout == AmpLayout::FIXED || layout == AmpLayout::FIXED_HEIGHT ||
       layout == AmpLayout::INTRINSIC || layout == AmpLayout::RESPONSIVE) &&
      !height.is_set) {
    context.AddError(ValidationError::MANDATORY_ATTR_MISSING,
                     context.line_col(), {"height", TagDescriptiveName(spec)},
                     TagSpecUrl(spec), result);
    return;
  }
  // For FIXED_HEIGHT if width is set it must be auto.
  if (layout == AmpLayout::FIXED_HEIGHT && width.is_set && !width.is_auto) {
    context.AddError(ValidationError::ATTR_VALUE_REQUIRED_BY_LAYOUT,
                     context.line_col(),
                     /*params=*/
                     {std::string(width_attr), "width",
                      TagDescriptiveName(spec), "FIXED_HEIGHT", "auto"},
                     TagSpecUrl(spec), result);
    return;
  }
  // FIXED, INTRINSIC, RESPONSIVE must have width set and not be auto.
  if (layout == AmpLayout::FIXED || layout == AmpLayout::INTRINSIC ||
      layout == AmpLayout::RESPONSIVE) {
    if (!width.is_set) {
      context.AddError(ValidationError::MANDATORY_ATTR_MISSING,
                       context.line_col(),
                       /*params=*/{"width", TagDescriptiveName(spec)},
                       TagSpecUrl(spec), result);
      return;
    } else if (width.is_auto) {
      context.AddError(ValidationError::INVALID_ATTR_VALUE, context.line_col(),
                       /*params=*/{"width", TagDescriptiveName(spec), "auto"},
                       TagSpecUrl(spec), result);
      return;
    }
  }
  // INTRINSIC, RESPONSIVE must have same units for height and width.
  if ((layout == AmpLayout::INTRINSIC || layout == AmpLayout::RESPONSIVE) &&
      width.unit != height.unit) {
    context.AddError(ValidationError::INCONSISTENT_UNITS_FOR_WIDTH_AND_HEIGHT,
                     context.line_col(),
                     /*params=*/
                     {TagDescriptiveName(spec), std::string(width.unit),
                      std::string(height.unit)},
                     TagSpecUrl(spec), result);
    return;
  }
  // RESPONSIVE only allows heights attribute.
  if (!heights_attr.empty() && layout != AmpLayout::RESPONSIVE) {
    ValidationError::Code code =
        (layout_attr.empty())
            ? ValidationError::ATTR_DISALLOWED_BY_IMPLIED_LAYOUT
            : ValidationError::ATTR_DISALLOWED_BY_SPECIFIED_LAYOUT;
    context.AddError(
        code, context.line_col(),
        /*params=*/
        {"heights", TagDescriptiveName(spec), AmpLayout::Layout_Name(layout)},
        TagSpecUrl(spec), result);
    return;
  }
}

// Helper method for ValidateAttributes, for when an attribute is encountered
// which is not specified by the validator.protoascii specification.
// Return value indicates success / validation failure.
void ValidateAttrNotFoundInSpec(const ParsedTagSpec& parsed_tag_spec,
                                const Context& context,
                                const std::string& attr_name,
                                ValidationResult* result) {
  // For now, we just skip data- attributes in the validator, because
  // our schema doesn't capture which ones would be ok or not. E.g.
  // in practice, some type of ad or perhaps other custom elements
  // require particular data attributes.
  // http://www.w3.org/TR/html5/single-page.html#attr-data-*
  // http://w3c.github.io/aria-in-html/
  // However, to avoid parsing differences, we restrict the set of allowed
  // characters in the document.
  // If explicit_attrs_only is true then do not allow data- attributes by
  // default. They must be explicitly added to the tag_spec.
  static LazyRE2 data_attr_re = {"data-[A-Za-z0-9-_:.]*"};
  if (!parsed_tag_spec.spec().explicit_attrs_only() &&
      (RE2::FullMatch(attr_name, *data_attr_re)))
    return;
  // Specific exemption lists. The Guardian has this utf-8 string which should
  // be 'data-cards', but contains some non-printable characters.
  // Example:
  // https://amp.theguardian.com/voluntary-sector-network/2016/sep/09/social-media-charity-leaders-brexit-vote
  if (attr_name == "data-\342\200\213c\342\200\213ards") return;

  // PopSugar has this typo, clearly missing an = sign.
  // Example:
  // https://www.popsugar.de/beauty/Farbige-Eyeliner-und-Lidstriche-39645924/amp
  if (attr_name == "data-action\"fastclick\"") return;

  // At this point, it's an error either way, but we try to give a
  // more specific error in the case of Mustache template characters.
  if (attr_name.find("{{") != std::string::npos) {
    const std::string& template_spec_url = context.rules().template_spec_url();
    context.AddError(
        ValidationError::TEMPLATE_IN_ATTR_NAME, context.line_col(),
        /* params */ {attr_name, TagDescriptiveName(parsed_tag_spec.spec())},
        template_spec_url, result);
  } else {
    context.AddError(
        ValidationError::DISALLOWED_ATTR, context.line_col(),
        /*params=*/{attr_name, TagDescriptiveName(parsed_tag_spec.spec())},
        TagSpecUrl(parsed_tag_spec), result);
  }
}

// Helper method for ValidateAttributes.
// Specific checks for attribute values descending from a <template> tag.
void ValidateAttrValueBelowTemplateTag(const ParsedTagSpec& parsed_tag_spec,
                                       const Context& context,
                                       const std::string& attr_name,
                                       const std::string& attr_value,
                                       ValidationResult* result) {
  const std::string& tag_spec_name = TagDescriptiveName(parsed_tag_spec.spec());
  const std::string& template_spec_url = context.rules().template_spec_url();
  if (AttrValueHasUnescapedTemplateSyntax(attr_value)) {
    context.AddError(ValidationError::UNESCAPED_TEMPLATE_IN_ATTR_VALUE,
                     context.line_col(),
                     /*params=*/{attr_name, tag_spec_name, attr_value},
                     template_spec_url, result);
  } else if (AttrValueHasPartialsTemplateSyntax(attr_value)) {
    context.AddError(ValidationError::TEMPLATE_PARTIAL_IN_ATTR_VALUE,
                     context.line_col(),
                     /*params=*/{attr_name, tag_spec_name, attr_value},
                     template_spec_url, result);
  }
}

// Determines the name of the attribute whose value is the name of the
// extension. Typically, this will return 'custom-element'.
const std::string GetExtensionNameAttribute(
    const ExtensionSpec& extension_spec) {
  switch (extension_spec.extension_type()) {
    case ExtensionSpec::CUSTOM_TEMPLATE:
      return "custom-template";
    case ExtensionSpec::HOST_SERVICE:
      return "host-service";
    default:
      return "custom-element";
  }
}

// Validates whether an encountered attribute is validated by an ExtensionSpec.
// ExtensionSpec's validate the 'custom-element', 'custom-template', and
// 'host-service' attributes. If an error is found, it is added to the
// |result|. The return value indicates whether or not the provided attribute
// is explained by this validation function.
bool ValidateAttrInExtension(const TagSpec& tag_spec,
                             const std::string& attr_name,
                             const std::string& attr_value) {
  // The only callpoint for this method is guarded by this same condition.
  CHECK(tag_spec.has_extension_spec());

  const auto& extension_spec = tag_spec.extension_spec();
  // TagSpecs with extensions will only be evaluated if their dispatch_key
  // matches, which is based on this custom-element/custom-template/host-service
  // field attribute value. The dispatch key matching is case-insensitive for
  // faster lookups, so it still possible for the attribute value to not match
  // if it contains upper-case letters.
  if (GetExtensionNameAttribute(extension_spec) == attr_name) {
    if (extension_spec.name() != attr_value) {
      return false;
    }
    return true;
  }
  return false;
}

// Validates that the reserved `i-amphtml-` prefix is not used in a class token.
void ValidateClassAttr(const ParsedHtmlTagAttr& class_attr,
                       const TagSpec& tag_spec, const Context& context,
                       ValidationResult* result) {
  for (const string_view class_token :
       StrSplit(class_attr.value(), ByAnyChar("\t\n\f\r "))) {
    if (StartsWith(class_token, "i-amphtml-")) {
      context.AddError(
          ValidationError::INVALID_ATTR_VALUE, context.line_col(),
          /*params=*/
          {class_attr.name(), TagDescriptiveName(tag_spec), class_attr.value()},
          "https://amp.dev/documentation/guides-and-tutorials/develop/"
          "style_and_layout/style_pages/#disallowed-styles",
          result);
      break;
    }
  }
}

// Validates the 'src' attribute for AMP JavaScript (Runtime and Extensions)
// script tags. This validates:
//   - the script is using an AMP domain
//   - the script path is valid (for extensions only, runtime uses attrspec)
//   - that the same script release version is used for all script sources
void ValidateAmpScriptSrcAttr(const ParsedHtmlTag& tag,
                              const std::string& attr_value,
                              const TagSpec& tag_spec, const Context& context,
                              ValidationResult* result) {
  if (!tag.IsAmpDomain()) {
    bool is_amp_format =
        c_find(context.type_identifiers(), TypeIdentifier::kAmp) !=
        context.type_identifiers().end();
    if (!is_amp_format || context.is_transformed()) {
      context.AddError(ValidationError::DISALLOWED_AMP_DOMAIN,
                       context.line_col(),
                       /*params=*/{}, /*spec_url=*/"", result);
    }
  }

  if (tag.IsExtensionScript() && tag_spec.has_extension_spec()) {
    const ExtensionSpec& extension_spec = tag_spec.extension_spec();
    const std::string& extension_name = tag.GetExtensionName();
    const std::string& extension_version = tag.GetExtensionVersion();

    // If the path is invalid, then do not evaluate further.
    if (!tag.HasValidAmpScriptPath()) {
      // If path is not empty use invalid path error, otherwise use the invalid
      // attribute value error. This is to avoid errors saying "has a path ''".
      if (!tag.GetAmpScriptPath().empty()) {
        context.AddError(
            ValidationError::INVALID_EXTENSION_PATH, context.line_col(),
            /*params=*/{extension_spec.name(), tag.GetAmpScriptPath()},
            /*spec_url=*/TagSpecUrl(tag_spec), result);
      } else {
        context.AddError(
            ValidationError::INVALID_ATTR_VALUE, context.line_col(),
            /*params=*/{"src", TagDescriptiveName(tag_spec), attr_value},
            TagSpecUrl(tag_spec), result);
      }
      return;
    }

    if (extension_name == extension_spec.name()) {
      // Validate deprecated version.
      if (c_linear_search(extension_spec.deprecated_version(),
                          extension_version)) {
        context.AddWarning(
            ValidationError::WARNING_EXTENSION_DEPRECATED_VERSION,
            context.line_col(),
            /*params=*/{extension_spec.name(), extension_version},
            TagSpecUrl(tag_spec), result);
      }

      // Validate version.
      if (!c_linear_search(extension_spec.version(), extension_version)) {
        context.AddError(ValidationError::INVALID_EXTENSION_VERSION,
                         context.line_col(),
                         /*params=*/{extension_spec.name(), extension_version},
                         TagSpecUrl(tag_spec), result);
      }
    } else {
      // Extension name does not match extension spec name.
      context.AddError(
          ValidationError::INVALID_ATTR_VALUE, context.line_col(),
          /*params=*/{"src", TagDescriptiveName(tag_spec), attr_value},
          TagSpecUrl(tag_spec), result);
    }
  }

  // Only evaluate the script tag's release version if the first script tag's
  // release version is not UNKNOWN.
  if (context.script_release_version() != ScriptReleaseVersion::UNKNOWN) {
    const ScriptReleaseVersion script_release_version =
        tag.GetScriptReleaseVersion();
    if (context.script_release_version() != script_release_version) {
      const std::string spec_name = tag_spec.has_extension_spec()
                                        ? tag_spec.extension_spec().name()
                                        : tag_spec.spec_name();
      switch (context.script_release_version()) {
        case ScriptReleaseVersion::LTS:
          context.AddError(
              ValidationError::INCORRECT_SCRIPT_RELEASE_VERSION,
              context.line_col(),
              /*params=*/
              {spec_name, ScriptReleaseVersionToString(script_release_version),
               ScriptReleaseVersionToString(context.script_release_version())},
              "https://amp.dev/documentation/guides-and-tutorials/learn/spec/"
              "amphtml#required-markup",
              result);
          break;
        case ScriptReleaseVersion::MODULE_NOMODULE:
          context.AddError(
              ValidationError::INCORRECT_SCRIPT_RELEASE_VERSION,
              context.line_col(),
              /*params=*/
              {spec_name, ScriptReleaseVersionToString(script_release_version),
               ScriptReleaseVersionToString(context.script_release_version())},
              "https://amp.dev/documentation/guides-and-tutorials/learn/spec/"
              "amphtml#required-markup",
              result);
          break;
        case ScriptReleaseVersion::MODULE_NOMODULE_LTS:
          context.AddError(
              ValidationError::INCORRECT_SCRIPT_RELEASE_VERSION,
              context.line_col(),
              /*params=*/
              {spec_name, ScriptReleaseVersionToString(script_release_version),
               ScriptReleaseVersionToString(context.script_release_version())},
              "https://amp.dev/documentation/guides-and-tutorials/learn/spec/"
              "amphtml#required-markup",
              result);
          break;
        case ScriptReleaseVersion::STANDARD:
          context.AddError(
              ValidationError::INCORRECT_SCRIPT_RELEASE_VERSION,
              context.line_col(),
              /*params=*/
              {spec_name, ScriptReleaseVersionToString(script_release_version),
               ScriptReleaseVersionToString(context.script_release_version())},
              "https://amp.dev/documentation/guides-and-tutorials/learn/spec/"
              "amphtml#required-markup",
              result);
          break;
        default:
          break;
      }
    }
  }
}

// Helper method for ValidateAttributes.
void ValidateAttrCss(const ParsedAttrSpec& parsed_attr_spec,
                     const Context& context, const TagSpec& tag_spec,
                     const std::string& attr_name,
                     const std::string& attr_value, ValidateTagResult* result) {
  // Track the number of CSS bytes. If this tagspec is selected as the best
  // match, this byte count will be added to the overall document inline style
  // byte count for determining if that byte count has been exceeded.
  result->inline_style_css_bytes = attr_value.length();

  vector<unique_ptr<htmlparser::css::ErrorToken>> css_errors;
  vector<char32_t> codepoints =
      htmlparser::Strings::Utf8ToCodepoints(attr_value);
  // The line/col we are passing in here is not the actual starting point in the
  // text for the attribute string. It's the start point for the tag. This means
  // that any line/col values for tokens are also similarly offset incorrectly.
  // For error messages, this means we just use the line/col of the tag instead
  // of the token so as to minimize confusion. This could be improved further.
  vector<unique_ptr<htmlparser::css::Token>> tokens =
      htmlparser::css::Tokenize(&codepoints, context.line_col().line(),
                                context.line_col().col(), &css_errors);
  vector<unique_ptr<htmlparser::css::Declaration>> declarations =
      htmlparser::css::ParseInlineStyle(&tokens, &css_errors);
  const std::string tag_description = TagDescriptiveName(tag_spec);
  for (const unique_ptr<htmlparser::css::ErrorToken>& error_token :
       css_errors) {
    // Override the first parameter with the name of the tag.
    vector<std::string> params = error_token->params();
    params[0] = tag_description;
    context.AddError(error_token->code(),
                     LineCol(error_token->line(), error_token->col()), params,
                     /*spec_url=*/"", &result->validation_result);
  }

  // If there were errors parsing, exit from validating further.
  if (!css_errors.empty()) return;

  if (auto maybe_spec = context.MatchingDocCssSpec(); maybe_spec) {
    const ParsedDocCssSpec& spec = **maybe_spec;
    // Determine if we've exceeded the maximum bytes per inline style
    // requirements.
    if (spec.spec().has_max_bytes_per_inline_style() &&
        attr_value.size() > spec.spec().max_bytes_per_inline_style()) {
      if (spec.spec().max_bytes_is_warning()) {
        context.AddWarning(ValidationError::INLINE_STYLE_TOO_LONG,
                           context.line_col(), /*params=*/
                           {tag_description, StrCat(attr_value.size()),
                            StrCat(spec.spec().max_bytes_per_inline_style())},
                           spec.spec().max_bytes_spec_url(),
                           &result->validation_result);
      } else {
        context.AddError(ValidationError::INLINE_STYLE_TOO_LONG,
                         context.line_col(), /*params=*/
                         {tag_description, StrCat(attr_value.size()),
                          StrCat(spec.spec().max_bytes_per_inline_style())},
                         spec.spec().max_bytes_spec_url(),
                         &result->validation_result);
      }
    }

    // Allowed declarations vary by context. SVG has its own set of CSS
    // declarations not supported generally in HTML.
    bool is_svg = parsed_attr_spec.spec().value_doc_svg_css();
    auto CssDeclarationByName = [is_svg, &spec](string_view name) {
      if (is_svg) {
        return spec.CssDeclarationSvgByName(name);
      } else {
        return spec.CssDeclarationByName(name);
      }
    };

    // Loop over the declarations found in the document, verify that they are
    // in the allowed list for this DocCssSpec, and have allowed values if
    // relevant.
    for (auto& declaration : declarations) {
      // Validate declarations only when they are not all allowed.
      if (!spec.spec().allow_all_declaration_in_style()) {
        const CssDeclaration* css_declaration =
            CssDeclarationByName(declaration->name());
        // If there is no matching declaration in the rules, then this
        // declaration is not allowed.
        if (!css_declaration) {
          context.AddError(
              ValidationError::DISALLOWED_PROPERTY_IN_ATTR_VALUE,
              context.line_col(),
              /*params=*/{declaration->name(), attr_name, tag_description},
              /*spec_url=*/context.rules().styles_spec_url(),
              &result->validation_result);
          // Don't emit additional errors for this declaration.
          continue;
        } else if (css_declaration->value_casei_size() > 0) {
          bool has_valid_value = false;
          const std::string first_ident = declaration->FirstIdent();
          for (auto& value : css_declaration->value_casei()) {
            if (EqualsIgnoreCase(first_ident, value)) {
              has_valid_value = true;
              break;
            }
          }
          if (!has_valid_value) {
            // Declaration value not allowed.
            context.AddError(
                ValidationError::CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
                context.line_col(),
                /*params=*/{tag_description, declaration->name(), first_ident},
                /*spec_url=*/context.rules().styles_spec_url(),
                &result->validation_result);
          }
        } else if (css_declaration->has_value_regex_casei()) {
          RE2::Options options;
          options.set_case_sensitive(false);
          RE2 pattern(css_declaration->value_regex_casei(), options);
          const std::string first_ident = declaration->FirstIdent();
          if (!RE2::FullMatch(first_ident, pattern)) {
            context.AddError(
                ValidationError::CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
                context.line_col(),
                /*params=*/{tag_description, declaration->name(), first_ident},
                /*spec_url=*/context.rules().styles_spec_url(),
                &result->validation_result);
          }
        }
      }
      if (StrContains(declaration->name(), "i-amphtml-")) {
        context.AddError(
            ValidationError::DISALLOWED_PROPERTY_IN_ATTR_VALUE,
            context.line_col(),
            /*params=*/{declaration->name(), attr_name, tag_description},
            /*spec_url=*/context.rules().styles_spec_url(),
            &result->validation_result);
        // Don't emit additional errors for this declaration.
        continue;
      }
      if (!spec.spec().allow_important()) {
        if (declaration->important()) {
          context.AddError(ValidationError::CSS_SYNTAX_DISALLOWED_IMPORTANT,
                           context.line_col(),
                           /*params=*/{}, context.rules().styles_spec_url(),
                           &result->validation_result);
        }
      }
      vector<unique_ptr<htmlparser::css::ParsedCssUrl>> parsed_urls;
      vector<unique_ptr<htmlparser::css::ErrorToken>> url_errors;
      htmlparser::css::ExtractUrls(*declaration, &parsed_urls, &url_errors);
      // We may have found new errors when parsing URLs. Emit those:
      for (const unique_ptr<htmlparser::css::ErrorToken>& error_token :
           url_errors) {
        // Override the first parameter with the name of the tag.
        vector<std::string> params = error_token->params();
        params[0] = tag_description;
        context.AddError(error_token->code(), context.line_col(), params,
                         /*spec_url=*/"", &result->validation_result);
      }
      if (!url_errors.empty()) continue;
      for (const auto& url : parsed_urls) {
        // Validate that the URL itself matches the spec.
        // Only image specs apply for inline styles. Fonts are only defined in
        // @font-face rules which we require a full stylesheet to define.
        if (spec.spec().has_image_url_spec()) {
          ValidateUrlAndProtocol(
              spec.image_url_spec(),
              UrlErrorInStylesheetAdapter(context.line_col()), context,
              url->utf8_url(), tag_spec, &result->validation_result);
        }
        // Subtract off URL lengths from doc-level inline style bytes, if
        // specified by the DocCssSpec.
        if (!spec.spec().url_bytes_included() && !IsDataUrl(url->utf8_url()))
          result->inline_style_css_bytes -= url->utf8_url().length();
      }
      DCHECK_GE(result->inline_style_css_bytes, 0);
    }
  }
}

// Helper method for ValidateAttributes.
void ValidateAttrDeclaration(const ParsedAttrSpec& parsed_attr_spec,
                             const Context& context,
                             const std::string& tag_spec_name,
                             const std::string& attr_name,
                             const std::string& attr_value,
                             ValidationResult* result) {
  vector<unique_ptr<htmlparser::css::ErrorToken>> css_errors;
  vector<char32_t> codepoints =
      htmlparser::Strings::Utf8ToCodepoints(attr_value);
  // The line/col we are passing in here is not the actual start point in the
  // text for the attribute string. It's the start point for the tag. This means
  // that any line/col values for tokens are also similarly offset incorrectly.
  // For error messages, this means we just use the line/col of the tag instead
  // of the token so as to minimize confusion. This could be improved further.
  vector<unique_ptr<htmlparser::css::Token>> tokens =
      htmlparser::css::Tokenize(&codepoints, context.line_col().line(),
                                context.line_col().col(), &css_errors);
  vector<unique_ptr<htmlparser::css::Declaration>> declarations =
      htmlparser::css::ParseInlineStyle(&tokens, &css_errors);
  for (const unique_ptr<htmlparser::css::ErrorToken>& error_token :
       css_errors) {
    // Override the first parameter with the name of the tag.
    vector<std::string> params = error_token->params();
    params[0] = tag_spec_name;
    context.AddError(error_token->code(), context.line_col(), params,
                     /*spec_url=*/"", result);
  }

  // If there were errors parsing, exit from validating further.
  if (!css_errors.empty()) return;

  const unordered_map<std::string, const CssDeclaration*>&
      css_declaration_by_name = parsed_attr_spec.css_declaration_by_name();

  for (auto& declaration : declarations) {
    auto iter = css_declaration_by_name.find(
        std::string(htmlparser::css::StripVendorPrefix(
            AsciiStrToLower(declaration->name()))));
    const CssDeclaration* css_declaration =
        iter != css_declaration_by_name.end() ? iter->second : nullptr;
    if (!css_declaration) {
      // Declaration not allowed.
      context.AddError(
          ValidationError::DISALLOWED_PROPERTY_IN_ATTR_VALUE,
          context.line_col(),
          /*params=*/{declaration->name(), attr_name, tag_spec_name},
          /*spec_url=*/context.rules().styles_spec_url(), result);
    } else if (css_declaration->value_casei_size() > 0) {
      bool has_valid_value = false;
      const std::string first_ident = declaration->FirstIdent();
      for (auto& value : css_declaration->value_casei()) {
        if (EqualsIgnoreCase(first_ident, value)) {
          has_valid_value = true;
          break;
        }
      }
      if (!has_valid_value) {
        // Declaration value not allowed.
        context.AddError(
            ValidationError::CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
            context.line_col(),
            /*params=*/{tag_spec_name, declaration->name(), first_ident},
            /*spec_url=*/context.rules().styles_spec_url(), result);
      }
    } else if (css_declaration->has_value_regex_casei()) {
      RE2::Options options;
      options.set_case_sensitive(false);
      RE2 pattern(css_declaration->value_regex_casei(), options);
      const std::string first_ident = declaration->FirstIdent();
      if (!RE2::FullMatch(first_ident, pattern)) {
        context.AddError(
            ValidationError::CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
            context.line_col(),
            /*params=*/{tag_spec_name, declaration->name(), first_ident},
            /*spec_url=*/context.rules().styles_spec_url(), result);
      }
    }
  }
}

// Returns true if errors reported on this tag should be suppressed, due to
// data-ampdevmode annotations.
bool ShouldSuppressDevModeErrors(const ParsedHtmlTag& encountered_tag,
                                 const Context& context) {
  if (!context.is_dev_mode()) return false;
  // Cannot suppress errors on HTML tag. The "data-ampdevmode" here is a
  // type identifier. Suppressing errors here would suppress all errors since
  // HTML is the root of the document.
  if (encountered_tag.UpperName() == "HTML") return false;
  for (const ParsedHtmlTagAttr& attr : encountered_tag.Attributes()) {
    if (attr.name() == "data-ampdevmode") return true;
  }
  return context.tag_stack().IsDevMode();
}

// Validates whether the attributes set on |encountered_tag| conform to this
// tag specification. All mandatory attributes must appear. Only attributes
// explicitly mentioned by this tag spec may appear.
// Sets result->validation_result.status to FAIL if unsuccessful.
void ValidateAttributes(const ParsedTagSpec& parsed_tag_spec,
                        const ParsedTagSpec* best_match_reference_point,
                        const Context& context,
                        const ParsedHtmlTag& encountered_tag,
                        ValidateTagResult* result) {
  const TagSpec& spec = parsed_tag_spec.spec();
  if (spec.has_amp_layout()) {
    ValidateLayout(parsed_tag_spec, context, encountered_tag,
                   &result->validation_result);
  }
  // For extension TagSpecs, we track if we've validated a src attribute.
  // We must have done so for the extension to be valid.
  bool seen_extension_src_attr = false;
  bool has_template_ancestor = context.tag_stack().HasAncestor("TEMPLATE");
  bool is_html_tag = encountered_tag.UpperName() == "HTML";
  vector<int32_t> mandatory_attrs_seen;
  set<std::string_view> attr_seen;
  set<std::string_view> mandatory_oneofs_seen;
  set<std::string_view> mandatory_anyofs_seen;
  vector<const ParsedAttrTriggerSpec*> parsed_trigger_specs;
  set<int32_t> attrspecs_validated;
  const unordered_map<std::string, int32_t>& attr_ids_by_name =
      parsed_tag_spec.attr_ids_by_name();

  for (const ParsedHtmlTagAttr& attr : encountered_tag.Attributes()) {
    if (!attr_seen.insert(attr.name()).second) {
      continue;
    }

    if (context.is_transformed()) {
      // For transformed AMP, `i-amphtml-layout` is handled within
      // ValidateSsrLayout, called by ValidateLayout above.
      if (attr.name() == "i-amphtml-layout") continue;
    } else if (attr.name() == "class") {
      // For non-transformed AMP, `class` must not contain 'i-amphtml-' prefix.
      ValidateClassAttr(attr, spec, context, &result->validation_result);
    }
    // If 'src' attribute and an extension or runtime script, then validate the
    // 'src' attribute by calling this method.
    if (attr.name() == "src" && (encountered_tag.IsExtensionScript() ||
                                 encountered_tag.IsAmpRuntimeScript())) {
      ValidateAmpScriptSrcAttr(encountered_tag, attr.value(), spec, context,
                               &result->validation_result);
      if (encountered_tag.IsExtensionScript()) {
        seen_extension_src_attr = true;
        // Extension TagSpecs do not have an explicit 'src' attribute, while
        // Runtime TagSpecs do. For Extension TagSpecs, continue.
        continue;
      }
    }

    auto jt = attr_ids_by_name.find(attr.name());
    if (jt == attr_ids_by_name.end()) {
      // The HTML tag specifies type identifiers which are validated in
      // ValidateHtmlTag(), so we skip them here.
      if (is_html_tag && context.rules().IsTypeIdentifier(attr.name()))
        continue;
      // While validating a reference point, we skip attributes that
      // we don't have a spec for. They will be validated when the
      // TagSpec itself gets validated.
      if (parsed_tag_spec.is_reference_point()) continue;
      // On the other hand, if we did just validate a reference point for
      // this tag, we check whether that reference point covers the attribute.
      if (best_match_reference_point &&
          best_match_reference_point->HasAttrWithName(attr.name()))
        continue;
      // If |spec| is an extension, then we ad-hoc validate 'custom-element',
      // 'custom-template', and 'host-service' attributes by calling this
      // method.
      if (spec.has_extension_spec() &&
          ValidateAttrInExtension(spec, attr.name(), attr.value()))
        continue;

      ValidateAttrNotFoundInSpec(parsed_tag_spec, context, attr.name(),
                                 &result->validation_result);
      if (result->validation_result.status() == ValidationResult::FAIL)
        continue;
      if (has_template_ancestor) {
        ValidateAttrValueBelowTemplateTag(parsed_tag_spec, context, attr.name(),
                                          attr.value(),
                                          &result->validation_result);
        if (result->validation_result.status() == ValidationResult::FAIL)
          continue;
      }
      continue;
    }
    if (has_template_ancestor) {
      ValidateAttrValueBelowTemplateTag(parsed_tag_spec, context, attr.name(),
                                        attr.value(),
                                        &result->validation_result);
      if (result->validation_result.status() == ValidationResult::FAIL)
        continue;
    }
    const ParsedAttrSpec& parsed_attr_spec =
        context.rules().parsed_attr_specs().GetById(jt->second);
    // If this attribute isn't used for these type identifiers, then error.
    if (!parsed_attr_spec.IsUsedForTypeIdentifiers(
            context.type_identifiers())) {
      context.AddError(ValidationError::DISALLOWED_ATTR, context.line_col(),
                       /*params=*/{attr.name(), TagDescriptiveName(spec)},
                       TagSpecUrl(spec), &result->validation_result);
      continue;
    }
    if (parsed_attr_spec.spec().has_deprecation()) {
      context.AddWarning(ValidationError::DEPRECATED_ATTR, context.line_col(),
                         /*params=*/
                         {attr.name(), TagDescriptiveName(spec),
                          parsed_attr_spec.spec().deprecation()},
                         parsed_attr_spec.spec().deprecation_url(),
                         &result->validation_result);
      // Deprecation is only a warning, so we don't return.
    }
    if (!parsed_attr_spec.spec().requires_extension().empty()) {
      ValidateAttrRequiredExtensions(parsed_attr_spec, context,
                                     &result->validation_result);
    }
    if (parsed_attr_spec.spec().value_doc_css() ||
        parsed_attr_spec.spec().value_doc_svg_css()) {
      ValidateAttrCss(parsed_attr_spec, context, spec, attr.name(),
                      attr.value(), result);
    } else if (!parsed_attr_spec.spec().css_declaration().empty()) {
      ValidateAttrDeclaration(parsed_attr_spec, context,
                              TagDescriptiveName(spec), attr.name(),
                              attr.value(), &result->validation_result);
    }
    // Skip attribute value requirements if the value will be modified by
    // mustache first.
    if (!has_template_ancestor || !AttrValueHasTemplateSyntax(attr.value())) {
      ValidateNonTemplateAttrValueAgainstSpec(parsed_attr_spec, context,
                                              attr.name(), attr.value(), spec,
                                              &result->validation_result);
      if (result->validation_result.status() == ValidationResult::FAIL)
        continue;
    }
    if (parsed_attr_spec.has_disallowed_value_regex()) {
      if (RE2::PartialMatch(attr.value(),
                            parsed_attr_spec.disallowed_value_regex())) {
        context.AddError(
            ValidationError::INVALID_ATTR_VALUE, context.line_col(),
            /*params=*/{attr.name(), TagDescriptiveName(spec), attr.value()},
            TagSpecUrl(spec), &result->validation_result);
        continue;
      }
    }
    if (spec.tag_name() == "BASE" && attr.name() == "href" &&
        context.HasSeenUrl()) {
      context.AddError(ValidationError::BASE_TAG_MUST_PRECEED_ALL_URLS,
                       context.line_col(),
                       /*params=*/{context.FirstSeenUrlTagName()},
                       TagSpecUrl(spec), &result->validation_result);
      continue;
    }
    if (parsed_attr_spec.spec().mandatory())
      mandatory_attrs_seen.push_back(parsed_attr_spec.id());
    // The "at most 1" part of mandatory_oneof: mandatory_oneof
    // wants exactly one of the alternatives, so here
    // we check whether we already saw another alternative
    if (parsed_attr_spec.spec().has_mandatory_oneof()) {
      if (mandatory_oneofs_seen.count(
              parsed_attr_spec.spec().mandatory_oneof()) > 0) {
        context.AddError(ValidationError::MUTUALLY_EXCLUSIVE_ATTRS,
                         context.line_col(),
                         /*params=*/
                         {TagDescriptiveName(spec),
                          parsed_attr_spec.spec().mandatory_oneof()},
                         TagSpecUrl(spec), &result->validation_result);
        continue;
      }
      mandatory_oneofs_seen.insert(parsed_attr_spec.spec().mandatory_oneof());
    }
    if (parsed_attr_spec.spec().has_mandatory_anyof()) {
      mandatory_anyofs_seen.insert(parsed_attr_spec.spec().mandatory_anyof());
    }
    // Validate that any ancestor marks are set.
    if (parsed_attr_spec.spec().has_requires_ancestor()) {
      const auto& markers = parsed_attr_spec.spec().requires_ancestor();
      bool matches_marker = false;
      for (int i = 0; i < markers.marker_size(); ++i) {
        if (context.tag_stack().HasAncestorMarker(markers.marker(i))) {
          matches_marker = true;
          break;
        }
      }
      if (!matches_marker) {
        // TODO: This error message should somehow indicate the
        // condition under which this attribute would have been allowed.
        context.AddError(ValidationError::DISALLOWED_ATTR, context.line_col(),
                         /*params=*/{attr.name(), TagDescriptiveName(spec)},
                         TagSpecUrl(spec), &result->validation_result);
        continue;
      }
    }
    // If the trigger does not have an if_value_regex, then proceed to add the
    // spec. If it does have an if_value_regex, then test the regex to see
    // if it should add the spec.
    if (parsed_attr_spec.spec().has_trigger() &&
        (!parsed_attr_spec.trigger_spec().has_if_value_regex() ||
         (parsed_attr_spec.trigger_spec().has_if_value_regex() &&
          RE2::FullMatch(attr.value(),
                         parsed_attr_spec.trigger_spec().if_value_regex())))) {
      parsed_trigger_specs.push_back(&parsed_attr_spec.trigger_spec());
    }
    attrspecs_validated.insert(parsed_attr_spec.id());
  }
  if (result->validation_result.status() == ValidationResult::FAIL) return;
  // The "exactly 1" part of mandatory_oneof: If none of the
  // alternatives were present, we report that an attribute is missing.
  const vector<std::string>& mandatory_oneofs =
      parsed_tag_spec.mandatory_oneofs();
  for (int ii = 0; ii < mandatory_oneofs.size(); ++ii) {
    if (mandatory_oneofs_seen.count(mandatory_oneofs[ii]) == 0) {
      context.AddError(
          ValidationError::MANDATORY_ONEOF_ATTR_MISSING, context.line_col(),
          /*params=*/{TagDescriptiveName(spec), mandatory_oneofs[ii]},
          TagSpecUrl(spec), &result->validation_result);
    }
  }
  // The "at least 1" part of mandatory_anyof: If none of the
  // alternatives were present, we report that an attribute is missing.
  const vector<std::string>& mandatory_anyofs =
      parsed_tag_spec.mandatory_anyofs();
  for (int ii = 0; ii < mandatory_anyofs.size(); ++ii) {
    if (mandatory_anyofs_seen.count(mandatory_anyofs[ii]) == 0) {
      context.AddError(
          ValidationError::MANDATORY_ANYOF_ATTR_MISSING, context.line_col(),
          /*params=*/{TagDescriptiveName(spec), mandatory_anyofs[ii]},
          TagSpecUrl(spec), &result->validation_result);
    }
  }
  for (const ParsedAttrTriggerSpec* trigger_spec : parsed_trigger_specs) {
    for (const std::string& also_requires_attr :
         trigger_spec->spec().also_requires_attr()) {
      auto it = attr_ids_by_name.find(also_requires_attr);
      if (it != attr_ids_by_name.end()) {
        const int32_t also_requires_attr_id = it->second;
        // If a tag has implicit attributes, we then consider these attributes
        // as validated. E.g. tag 'a' has implicit attributes 'role' and
        // 'tabindex'.
        if (attrspecs_validated.count(also_requires_attr_id) == 0 &&
            parsed_tag_spec.implicit_attrspecs().count(also_requires_attr_id) ==
                0) {
          const ParsedAttrSpec& also_requires_attr_spec =
              context.rules().parsed_attr_specs().GetById(
                  also_requires_attr_id);
          context.AddError(
              ValidationError::ATTR_REQUIRED_BUT_MISSING, context.line_col(),
              /*params=*/
              {also_requires_attr_spec.spec().name(), TagDescriptiveName(spec),
               trigger_spec->attr_name()},
              TagSpecUrl(spec), &result->validation_result);
        }
      }
    }
  }
  SortAndUniquify(&mandatory_attrs_seen);
  const vector<int32_t>& mandatory_attr_ids =
      parsed_tag_spec.mandatory_attr_ids();
  if (mandatory_attrs_seen == mandatory_attr_ids) return;
  vector<int> diff = Diff(mandatory_attr_ids, mandatory_attrs_seen);
  vector<std::string> missing_attrs;
  for (const int32_t attr_id : diff) {
    const std::string& attr_name =
        context.rules().parsed_attr_specs().GetById(attr_id).spec().name();
    missing_attrs.push_back(attr_name);
  }
  // Sort this list for stability across implementations.
  std::stable_sort(missing_attrs.begin(), missing_attrs.end());
  for (const std::string& missing_attr : missing_attrs) {
    context.AddError(ValidationError::MANDATORY_ATTR_MISSING,
                     context.line_col(),
                     /*params=*/{missing_attr, TagDescriptiveName(spec)},
                     TagSpecUrl(spec), &result->validation_result);
  }
  // Extension specs mandate the 'src' attribute.
  if (spec.has_extension_spec() && !seen_extension_src_attr) {
    context.AddError(ValidationError::MANDATORY_ATTR_MISSING,
                     context.line_col(),
                     /*params=*/{"src", TagDescriptiveName(spec)},
                     TagSpecUrl(spec), &result->validation_result);
  }
}

const set<std::string>& ProxyKnowsIntertagsToValidate() {
  static const set<std::string>* tags = [] {
    return new set<std::string>({"AMP-TIMEAGO", "SCRIPT", "STYLE"});
  }();
  return *tags;
}

ParsedValidatorRules::ParsedValidatorRules(HtmlFormat::Code html_format)
    : html_format_(html_format) {
  ValidatorRules all_rules;
  status_ = LoadRules(&all_rules);
  if (!status_.ok()) return;
  FilterRules(all_rules, &rules_);
  ExpandExtensionSpec(&rules_);
  for (int ii = 0; ii < rules_.tags_size(); ++ii) {
    const TagSpec& tag = rules_.tags(ii);
    if (tag.has_cdata()) {
      tags_with_cdata_.insert(tag.tag_name());
    }
    if (tag.has_extension_spec()) {
      ext_tag_spec_ids_by_ext_name_[tag.extension_spec().name()].push_back(ii);
    }
  }
  status_ = CheckIntertags();
  if (!status_.ok()) return;

  parsed_attr_specs_ = make_unique<ParsedAttrSpecs>(rules_.attr_lists());

  for (const DocSpec& spec : rules_.doc()) {
    parsed_doc_.emplace_back(spec);
  }

  for (const DocCssSpec& css_spec : rules_.css()) {
    parsed_css_.emplace_back(css_spec, rules_.declaration_list());
  }

  // In validator.protoascii, tagspecs can identify other tagspecs
  // that are required by referencing their spec_name field (or
  // tag_name, if spec_name is not set). To implement this
  // efficiently we map these TagSpecName() values to the int32_t ids
  // of the corresponding tagspecs and compute
  // |tag_spec_names_to_track| to identify those tagspecs that are
  // referenced by others via "also_requires_tag".  The ParsedTagSpec
  // constructor completes this translation to ids.
  unordered_map<std::string, int32_t> tag_spec_ids_by_tag_spec_name;
  unordered_set<std::string> tag_spec_names_to_track;
  for (int ii = 0; ii < rules_.tags_size(); ++ii) {
    const TagSpec& tag = rules_.tags(ii);
    // This check only occurs during initialization.
    CHECK(tag_spec_ids_by_tag_spec_name
              .insert(std::make_pair(TagSpecName(tag), ii))
              .second)
        << TagSpecName(tag);
    if (!tag.also_requires_tag_warning().empty())
      tag_spec_names_to_track.insert(TagSpecName(tag));
    c_copy(
        tag.also_requires_tag_warning(),
        std::inserter(tag_spec_names_to_track, tag_spec_names_to_track.end()));
  }
  for (int ii = 0; ii < rules_.tags_size(); ++ii) {
    const TagSpec& tag = rules_.tags(ii);
    tagspec_by_id_.emplace_back(
        parsed_attr_specs_.get(), tag_spec_ids_by_tag_spec_name,
        ShouldRecordTagspecValidated(tag, tag_spec_names_to_track), &tag, ii);
    const ParsedTagSpec& parsed_tag_spec = tagspec_by_id_.back();
    if (!parsed_tag_spec.status().ok()) {
      status_ = parsed_tag_spec.status();
      if (!status_.ok()) return;
    }
    if (!parsed_tag_spec.is_reference_point()) {
      auto& tagspec_dispatch =
          tagspecs_by_tagname_[parsed_tag_spec.spec().tag_name()];
      std::vector<std::string> dispatch_keys =
          parsed_tag_spec.GetDispatchKeys();
      if (!dispatch_keys.empty()) {
        for (const std::string& dispatch_key : dispatch_keys)
          tagspec_dispatch.RegisterDispatchKey(dispatch_key, ii);
      } else if (tag.has_extension_spec()) {
        tagspec_dispatch.RegisterDispatchKey(
            DispatchKey(AttrSpec::NAME_VALUE_DISPATCH,
                        GetExtensionNameAttribute(tag.extension_spec()),
                        tag.extension_spec().name(), ""),
            ii);
      } else {
        tagspec_dispatch.RegisterTagSpec(ii);
      }
    }
    if (parsed_tag_spec.spec().mandatory()) mandatory_tagspecs_.push_back(ii);
  }
  std::stable_sort(mandatory_tagspecs_.begin(), mandatory_tagspecs_.end());

  error_codes_.resize(ValidationError::Code_MAX + 1);
  for (const ErrorSpecificity& error_specificity : rules_.error_specificity()) {
    // Guard against new specfiles being digested by old binaries.
    // TODO: Consider a more comprehensive fix, e.g. baking
    // the specificity stuff in separately from the configurable part like
    // with code generation.
    if (error_specificity.code() >= 0 &&
        error_specificity.code() < error_codes_.size()) {
      error_codes_[error_specificity.code()].specificity =
          error_specificity.specificity();
    }
  }
}

// Loads validator rules into the |rules_| proto, stub or actual (embedded).
// Returns false on any failure, setting status_ to the relevant error.
Status ParsedValidatorRules::LoadRules(ValidatorRules* rules) const {
  if (!rules->ParseFromArray(amp::validator::data::kValidatorProtoBytes,
                             amp::validator::data::kValidatorProtoBytesSize)) {
    return InvalidArgumentError("Parsing embedded proto failed");
  }
  return OkStatus();
}

Status ParsedValidatorRules::CheckIntertags() const {
  // TagSpecs which have cdata to validate must also be registered in the
  // static list of parser tags to make cdata callbacks for. This check
  // verifies that the lists match up.
  const set<std::string>& proxy_intertags = ProxyKnowsIntertagsToValidate();
  for (const std::string& tag : IntertagsToValidate()) {
    if (proxy_intertags.find(tag) == proxy_intertags.end()) {
      // If this fails we need to add to ProxyKnowsIntertagsToValidate.
      return InvalidArgumentError(StrCat("invalid rules - missing from ",
                                         "ProxyKnowsIntertagsToValidate: '",
                                         tag, "'"));
    }
  }
  return OkStatus();
}

// Filters |all_rules|, leaving only those which match the html_format of
// this ParsedValidatorRules object.
void ParsedValidatorRules::FilterRules(const ValidatorRules& all_rules,
                                       ValidatorRules* filtered_rules) const {
  *filtered_rules = all_rules;
  filtered_rules->clear_tags();
  for (const TagSpec& tagspec : all_rules.tags()) {
    if (IsTagSpecCorrectHtmlFormat(tagspec))
      *filtered_rules->mutable_tags()->Add() = tagspec;
  }
  filtered_rules->clear_doc();
  for (const DocSpec& spec : all_rules.doc()) {
    if (IsDocSpecCorrectHtmlFormat(spec))
      *filtered_rules->mutable_doc()->Add() = spec;
  }
  filtered_rules->clear_css();
  for (const DocCssSpec& doc_css : all_rules.css()) {
    if (IsDocCssSpecCorrectHtmlFormat(doc_css))
      *filtered_rules->mutable_css()->Add() = doc_css;
  }
}

// For every tagspec that contains an ExtensionSpec, add module specific
// requirements for that tagspec that will be added to ValidatorRules.
void ParsedValidatorRules::ExpandModuleExtensionSpec(
    TagSpec* tagspec, const string_view spec_name) const {
  tagspec->set_spec_name(StrCat(spec_name, " module extension script"));
  tagspec->set_descriptive_name(tagspec->spec_name());
  tagspec->add_satisfies_condition(tagspec->spec_name());
  tagspec->add_requires_condition(
      StrCat(spec_name, " nomodule extension script"));
  AttrSpec* attr = tagspec->add_attrs();
  attr->set_name("crossorigin");
  attr->add_value("anonymous");
  attr->set_mandatory(true);
  attr = tagspec->add_attrs();
  attr->set_name("type");
  attr->add_value("module");
  attr->set_mandatory(true);
}

// For every tagspec that contains an ExtensionSpec, add nomodule specific
// requirements for that tagspec that will be added to ValidatorRules.
void ParsedValidatorRules::ExpandNomoduleExtensionSpec(
    TagSpec* tagspec, const string_view spec_name) const {
  tagspec->set_spec_name(StrCat(spec_name, " nomodule extension script"));
  tagspec->set_descriptive_name(tagspec->spec_name());
  tagspec->add_satisfies_condition(tagspec->spec_name());
  tagspec->add_requires_condition(
      StrCat(spec_name, " module extension script"));
  AttrSpec* attr = tagspec->add_attrs();
  attr->set_name("nomodule");
  attr->add_value("");
  attr->set_mandatory(true);
}

// For every tagspec that contains an ExtensionSpec, we add several TagSpec
// fields corresponding to the data found in the ExtensionSpec.
void ParsedValidatorRules::ExpandExtensionSpec(ValidatorRules* rules) const {
  vector<TagSpec> new_tagspecs;
  for (int ii = 0; ii < rules->tags_size(); ++ii) {
    TagSpec* tagspec = rules->mutable_tags(ii);
    if (!tagspec->has_extension_spec()) continue;
    const ExtensionSpec& extension_spec = tagspec->extension_spec();
    std::string base_spec_name = extension_spec.name();
    if (extension_spec.has_version_name())
      base_spec_name =
          StrCat(extension_spec.name(), " ", extension_spec.version_name());
    if (!tagspec->has_spec_name())
      tagspec->set_spec_name(StrCat(base_spec_name, " extension script"));
    if (!tagspec->has_descriptive_name())
      tagspec->set_descriptive_name(tagspec->spec_name());
    tagspec->set_mandatory_parent("HEAD");
    // This is satisfied by any of the `v0.js` variants:
    tagspec->add_requires_condition("amphtml javascript runtime (v0.js)");

    if (extension_spec.deprecated_allow_duplicates()) {
      tagspec->set_unique_warning(true);
    } else {
      tagspec->set_unique(true);
    }

    // Disallow any contents in the script cdata.
    tagspec->mutable_cdata()->set_whitespace_only(true);

    // Add module/nomodule tagspecs for AMP ExtensionSpec tagspecs.
    const auto& html_formats = tagspec->html_format();
    if (std::find(html_formats.begin(), html_formats.end(), HtmlFormat::AMP) !=
        html_formats.end()) {
      TagSpec basic_tagspec = *tagspec;
      basic_tagspec.clear_html_format();
      basic_tagspec.add_html_format(HtmlFormat::AMP);
      basic_tagspec.clear_enabled_by();
      basic_tagspec.add_enabled_by("transformed");

      // Expand module script tagspec.
      TagSpec module_tagspec = basic_tagspec;
      ExpandModuleExtensionSpec(&module_tagspec, base_spec_name);
      new_tagspecs.push_back(module_tagspec);
      // Expand nomodule script tagspec.
      TagSpec nomodule_tagspec = basic_tagspec;
      ExpandNomoduleExtensionSpec(&nomodule_tagspec, base_spec_name);
      new_tagspecs.push_back(nomodule_tagspec);
    }
  }
  // Add module and nomodule tagspecs.
  for (TagSpec new_tagspec : new_tagspecs) {
    rules->mutable_tags()->Add(std::move(new_tagspec));
  }
}

// True iff tagspec's html_format matches the validator html_format.
bool ParsedValidatorRules::IsTagSpecCorrectHtmlFormat(
    const TagSpec& tagspec) const {
  const auto& formats = tagspec.html_format();
  return std::find(formats.begin(), formats.end(), html_format_) !=
         formats.end();
}

// True iff `spec`'s html_format matches the validator html_format.
bool ParsedValidatorRules::IsDocSpecCorrectHtmlFormat(
    const DocSpec& spec) const {
  const auto& formats = spec.html_format();
  return std::find(formats.begin(), formats.end(), html_format_) !=
         formats.end();
}

// True iff `spec`'s html_format matches the validator html_format.
bool ParsedValidatorRules::IsDocCssSpecCorrectHtmlFormat(
    const DocCssSpec& spec) const {
  const auto& formats = spec.html_format();
  return std::find(formats.begin(), formats.end(), html_format_) !=
         formats.end();
}

Status ParsedValidatorRules::status() const { return status_; }

const ParsedTagSpec* ParsedValidatorRules::GetAuthorStylesheetTagSpec() const {
  const TagSpecDispatch& tagspec_dispatch = DispatchForTagName("STYLE");
  if (tagspec_dispatch.empty()) return nullptr;
  for (int32_t tag_id : tagspec_dispatch.AllTagSpecs()) {
    const ParsedTagSpec* parsed_tag_spec = GetTagSpec(tag_id);
    if (parsed_tag_spec->spec().named_id() == TagSpec::STYLE_AMP_CUSTOM)
      return parsed_tag_spec;
  }
  return nullptr;
}

// Validates type identifiers within a set of attributes, adding
// ValidationErrors as necessary, and sets type identifiers on
// ValidationResult.type_identifier.
void ParsedValidatorRules::ValidateTypeIdentifiers(
    const ParsedHtmlTag& html_tag,
    const vector<TypeIdentifier> format_identifiers, Context* context,
    ValidationResult* result) const {
  CHECK_NE(0, format_identifiers.size());
  bool has_mandatory_type_identifier = false;
  bool has_email_type_identifier = false;
  bool has_css_strict_type_identifier = false;
  // The named values should match up to `self` and AMP caches listed at
  // https://cdn.ampproject.org/caches.json
  static LazyRE2 transformed_value_regex = {"^(bing|google|self);v=(\\d+)$"};
  for (const ParsedHtmlTagAttr& attr : html_tag.Attributes()) {
    // Verify this attribute is a type identifier. Other attributes are
    // validated in ValidateAttributes.
    if (IsTypeIdentifier(attr.name())) {
      TypeIdentifier type_identifier = GetTypeIdentifier(attr.name());
      // Verify this type identifier is allowed for this format.
      if (c_find(format_identifiers, type_identifier) !=
          format_identifiers.end()) {
        // Only add a type identifier once even if there are more than one
        // representation (e.g.  "⚡" and "amp" in the same doc).
        if (c_find(result->type_identifier(),
                   TypeIdentifierToString(type_identifier)) ==
            result->type_identifier().end()) {
          result->add_type_identifier(TypeIdentifierToString(type_identifier));
          context->RecordTypeIdentifier(type_identifier);
        }
        // These type identifiers are not considered mandatory unlike
        // other type identifiers.
        if (type_identifier != TypeIdentifier::kTransformed &&
            type_identifier != TypeIdentifier::kDevMode &&
            type_identifier != TypeIdentifier::kCssStrict)
          has_mandatory_type_identifier = true;
        // The type identifier "transformed" has restrictions on its value.
        if (type_identifier == TypeIdentifier::kTransformed) {
          std::string name;
          std::string version;
          if (RE2::FullMatch(attr.value(), *transformed_value_regex, &name,
                             &version)) {
            int32_t transformer_version;
            if (absl::SimpleAtoi(version, &transformer_version)) {
              result->set_transformer_version(transformer_version);
            }
          } else {
            context->AddError(ValidationError::INVALID_ATTR_VALUE,
                              context->line_col(),
                              /*params=*/{attr.name(), "html", attr.value()},
                              "https://amp.dev/documentation/"
                              "guides-and-tutorials/learn/spec/"
                              "amphtml#required-markup",
                              result);
          }
        }
        if (type_identifier == TypeIdentifier::kDevMode) {
          // https://github.com/ampproject/amphtml/issues/20974
          // We always emit an error for this type identifier, but it suppresses
          // other errors later in the document.
          context->AddError(ValidationError::DEV_MODE_ONLY, context->line_col(),
                            /*params=*/{}, /*url*/ "", result);
        }
        if (type_identifier == TypeIdentifier::kEmail)
          has_email_type_identifier = true;
        if (type_identifier == TypeIdentifier::kCssStrict)
          has_css_strict_type_identifier = true;
      } else {
        context->AddError(
            ValidationError::DISALLOWED_ATTR, context->line_col(),
            /*params=*/{attr.name(), "html"},
            "https://amp.dev/documentation/guides-and-tutorials/learn/"
            "spec/amphtml#required-markup",
            result);
      }
    }
  }
  // If AMP Email format and not set to data-css-strict, then issue a warning
  // that not having data-css-strict is deprecated. See b/179798751.
  if (has_email_type_identifier && !has_css_strict_type_identifier) {
    context->AddWarning(
        ValidationError::AMP_EMAIL_MISSING_STRICT_CSS_ATTR, context->line_col(),
        /*params=*/{},
        /*spec_url=*/"https://github.com/ampproject/amphtml/issues/32587",
        result);
  }
  if (!has_mandatory_type_identifier) {
    // Missing mandatory type identifier (any AMP variant but "transformed").
    context->AddError(
        ValidationError::MANDATORY_ATTR_MISSING, context->line_col(),
        /*params=*/
        {TypeIdentifierToBoltString(format_identifiers[0]), "html"},
        "https://amp.dev/documentation/guides-and-tutorials/learn/"
        "spec/amphtml#required-markup",
        result);
    // The lack of a type_identifier indicates that this document isn't even
    // trying to be AMP, so we will not keep trying to validate it beyond
    // this error. Only trick is to make sure we don't exit early due to
    // manufactured HTML tags.
    if (!html_tag.IsManufacturedHtmlTag()) context->SetExitEarly();
  }
}

// Validates the HTML tag for type identifiers.
void ParsedValidatorRules::ValidateHtmlTag(const ParsedHtmlTag& html_tag,
                                           Context* context,
                                           ValidationResult* result) const {
  CHECK_EQ(html_tag.UpperName(), "HTML")
      << "Validating HTML Tag when not parsing an HTML Tag.";

  switch (html_format_) {
    case HtmlFormat::AMP:
      ValidateTypeIdentifiers(
          html_tag,
          {TypeIdentifier::kAmp, TypeIdentifier::kTransformed,
           TypeIdentifier::kDevMode},
          context, result);
      break;
    case HtmlFormat::AMP4ADS:
      ValidateTypeIdentifiers(html_tag,
                              {TypeIdentifier::kAds, TypeIdentifier::kDevMode},
                              context, result);
      break;
    case HtmlFormat::AMP4EMAIL:
      ValidateTypeIdentifiers(html_tag,
                              {TypeIdentifier::kEmail, TypeIdentifier::kDevMode,
                               TypeIdentifier::kCssStrict},
                              context, result);
      break;
    default:
      // This should never happen as validator must be called with a valid
      // HtmlFormat. Add error anyhow.
      context->AddError(
          ValidationError::MANDATORY_ATTR_MISSING, context->line_col(),
          /*params=*/{"⚡, ⚡4ads, or ⚡4email", "html"},
          "https://amp.dev/documentation/guides-and-tutorials/learn/"
          "spec/amphtml#required-markup",
          result);
  }
}

// Call for HTMLParser to inform the validator that it is manufacturing a
// <body> tag not actually found on the page. This will be followed by a
// ValidateTag() with the actual body tag in question.
void ParsedValidatorRules::ValidateManufacturedBody(
    Context* context, ValidationResult* result) const {
  context->AddError(ValidationError::DISALLOWED_MANUFACTURED_BODY,
                    context->line_col(), /*params=*/{}, /*spec_url=*/"",
                    result);
}

int32_t ParsedValidatorRules::Specificity(ValidationError::Code code) const {
  return error_codes_[code].specificity;
}

// A helper function which allows us to compare two candidate results
// in ParsedValidatorRules::ValidateTag to report the results which
// have the most specific errors.
int32_t ParsedValidatorRules::MaxSpecificity(
    const RepeatedPtrField<ValidationError>& errors) const {
  int32_t max_specificity = 0;
  for (const ValidationError& error : errors) {
    max_specificity = std::max(max_specificity, Specificity(error.code()));
  }
  return max_specificity;
}

namespace {
bool BetterValidationResultStatusThan(ValidationResult::Status statusA,
                                      ValidationResult::Status statusB) {
  // Equal, so not better than.
  if (statusA == statusB) return false;

  // PASS > FAIL > UNKNOWN
  if (statusA == ValidationResult::PASS) return true;
  if (statusB == ValidationResult::PASS) return false;
  if (statusA == ValidationResult::FAIL) return true;
  CHECK_EQ(statusA, ValidationResult::UNKNOWN);
  return false;  // statusA == UNKNOWN
}

// Returns true if the error codes in errorsB are a subset of the error codes in
// errorsA.
bool IsErrorSubset(const RepeatedPtrField<ValidationError>& errorsA,
                   const RepeatedPtrField<ValidationError>& errorsB) {
  set<ValidationError::Code> codesA;
  for (const ValidationError& error : errorsA) codesA.insert(error.code());
  set<ValidationError::Code> codesB;
  for (const ValidationError& error : errorsB) codesB.insert(error.code());

  // Every code in B is also in A. If they are the same, not a subset.
  return absl::c_includes(codesA, codesB) && codesA.size() > codesB.size();
}

}  // namespace

// Used for comparing ValidationResults for a single tag, produced by multiple
// tag specs. We prefer passing, fewer, and more specific error messages.
bool ParsedValidatorRules::BetterValidationResultThan(
    const ValidationResult& resultA, const ValidationResult& resultB) const {
  if (resultA.status() != resultB.status())
    return BetterValidationResultStatusThan(resultA.status(), resultB.status());

  // If one of the error sets by error.code is a subset of the other
  // error set's error.codes, use the subset one. It's essentially saying, if
  // you fix these errors that we both complain about, then you'd be passing
  // for my tagspec, but not the other one, regardless of specificity.
  if (IsErrorSubset(resultB.errors(), resultA.errors())) return true;
  if (IsErrorSubset(resultA.errors(), resultB.errors())) return false;

  // Prefer the most specific error found in either set.
  if (MaxSpecificity(resultA.errors()) > MaxSpecificity(resultB.errors()))
    return true;
  if (MaxSpecificity(resultB.errors()) > MaxSpecificity(resultA.errors()))
    return false;

  // Prefer the attempt with the fewest errors, if the most specific errors
  // are the same.
  if (resultA.errors_size() < resultB.errors_size()) return true;
  if (resultB.errors_size() < resultA.errors_size()) return false;

  // Equal, so not better than.
  return false;
}

// Emits errors for tags that are specified to be mandatory.
void ParsedValidatorRules::MaybeEmitMandatoryTagValidationErrors(
    Context* context, ValidationResult* result) const {
  for (int32_t tag_spec_id : mandatory_tagspecs_) {
    const ParsedTagSpec* parsed_tag_spec = GetTagSpec(tag_spec_id);
    // Skip TagSpecs that aren't used for these type identifiers.
    if (!parsed_tag_spec->IsUsedForTypeIdentifiers(context->type_identifiers()))
      continue;
    if (context->TagspecsValidated().count(tag_spec_id) == 0) {
      const TagSpec& spec = parsed_tag_spec->spec();
      context->AddError(ValidationError::MANDATORY_TAG_MISSING,
                        context->line_col(), {TagDescriptiveName(spec)},
                        TagSpecUrl(spec), result);
      if (context->Progress(*result).complete) return;
    }
  }
}

// Returns true if one of the alternative_tag_spec_ids has been validated.
bool ParsedValidatorRules::HasValidatedAlternativeTagSpec(
    Context* context, const std::string& ext_name) const {
  auto it = ext_tag_spec_ids_by_ext_name_.find(ext_name);
  if (it != ext_tag_spec_ids_by_ext_name_.end()) {
    for (int32_t alternative_tag_spec_id : it->second) {
      if (context->TagspecsValidated().count(alternative_tag_spec_id) > 0)
        return true;
    }
  }
  return false;
}

// Emits errors for tags that specify that another tag is also required or
// a condition is required to be satisfied.
void ParsedValidatorRules::MaybeEmitRequiresOrExcludesValidationErrors(
    Context* context, ValidationResult* result) const {
  for (int32_t tag_spec_id : context->TagspecsValidated()) {
    const ParsedTagSpec* parsed_tag_spec = GetTagSpec(tag_spec_id);
    // Skip TagSpecs that aren't used for these type identifiers.
    if (!parsed_tag_spec->IsUsedForTypeIdentifiers(context->type_identifiers()))
      continue;
    for (const std::string& condition : parsed_tag_spec->Requires()) {
      if (context->ConditionsSatisfied().count(condition) == 0) {
        context->AddError(
            ValidationError::TAG_REQUIRED_BY_MISSING, context->line_col(),
            /*params=*/{condition, TagDescriptiveName(parsed_tag_spec->spec())},
            TagSpecUrl(*parsed_tag_spec), result);
        if (context->Progress(*result).complete) return;
      }
    }
    for (const std::string& condition : parsed_tag_spec->Excludes()) {
      if (context->ConditionsSatisfied().count(condition) > 0) {
        context->AddError(
            ValidationError::TAG_EXCLUDED_BY_TAG, context->line_col(),
            /*params=*/{TagDescriptiveName(parsed_tag_spec->spec()), condition},
            TagSpecUrl(*parsed_tag_spec), result);
        if (context->Progress(*result).complete) return;
      }
    }
    for (int32_t tag_spec_id : parsed_tag_spec->AlsoRequiresTagWarnings()) {
      if (context->TagspecsValidated().count(tag_spec_id) == 0) {
        const ParsedTagSpec* also_requires_tagspec = GetTagSpec(tag_spec_id);
        // If there is an alternative tagspec for extension script tagspecs
        // that has been validated, then move on to the next
        // also_requires_tag_warning.
        if (also_requires_tagspec->spec().has_extension_spec() &&
            HasValidatedAlternativeTagSpec(
                context, also_requires_tagspec->spec().extension_spec().name()))
          continue;
        context->AddWarning(ValidationError::WARNING_TAG_REQUIRED_BY_MISSING,
                            context->line_col(),
                            /*params=*/
                            {TagDescriptiveName(also_requires_tagspec->spec()),
                             TagDescriptiveName(parsed_tag_spec->spec())},
                            TagSpecUrl(*parsed_tag_spec), result);
        if (context->Progress(*result).complete) return;
      }
    }
  }

  ExtensionsContext* extensions_ctx = context->mutable_extensions();
  vector<std::string> unused_required =
      extensions_ctx->UnusedExtensionsRequired();
  for (const std::string& unused_extension_name : unused_required) {
    context->AddError(ValidationError::EXTENSION_UNUSED, context->line_col(),
                      /*params=*/{unused_extension_name},
                      /*spec_url=*/"", result);
    if (context->Progress(*result).complete) return;
  }
}

// Emits errors for tags that are specified as mandatory alternatives.
void ParsedValidatorRules::MaybeEmitMandatoryAlternativesSatisfiedErrors(
    Context* context, ValidationResult* result) const {
  const set<std::string>& mandatory_alternatives_satisfied =
      context->MandatoryAlternativesSatisfied();
  std::map<std::string, std::string> spec_url_by_mandatory_alternatives;
  for (const TagSpec& spec : rules_.tags()) {
    if (!spec.has_mandatory_alternatives()) continue;
    if (mandatory_alternatives_satisfied.count(spec.mandatory_alternatives()) ==
        0) {
      spec_url_by_mandatory_alternatives[spec.mandatory_alternatives()] =
          TagSpecUrl(spec);
    }
  }
  for (const auto& entry : spec_url_by_mandatory_alternatives) {
    context->AddError(ValidationError::MANDATORY_TAG_MISSING,
                      context->line_col(),
                      /*params=*/{entry.first},
                      /*spec_url*/ entry.second, result);
    if (context->Progress(*result).complete) return;
  }
}

// Emits errors for doc size limitations across entire document.
void ParsedValidatorRules::MaybeEmitDocSizeErrors(
    Context* context, ValidationResult* result) const {
  if (auto maybe_doc_spec = context->MatchingDocSpec(); maybe_doc_spec) {
    const ParsedDocSpec& doc_spec = **maybe_doc_spec;
    const int32_t bytes_used = context->doc_byte_size();
    if (doc_spec.spec().has_max_bytes() && doc_spec.spec().max_bytes() != -2 &&
        bytes_used > doc_spec.spec().max_bytes()) {
      context->AddError(
          ValidationError::DOCUMENT_SIZE_LIMIT_EXCEEDED, context->line_col(),
          /*params=*/
          {StrCat(doc_spec.spec().max_bytes()), StrCat(bytes_used)},
          /*spec_url=*/doc_spec.spec().max_bytes_spec_url(), result);
    }
  }
}

// Emits errors for css size limitations across entire document.
void ParsedValidatorRules::MaybeEmitCssLengthErrors(
    Context* context, ValidationResult* result) const {
  const int32_t bytes_used =
      context->inline_style_byte_size() + context->style_tag_byte_size();

  if (auto maybe_doc_css_spec = context->MatchingDocCssSpec();
      maybe_doc_css_spec) {
    const ParsedDocCssSpec& doc_css_spec = **maybe_doc_css_spec;
    if (doc_css_spec.spec().has_max_bytes() &&
        bytes_used > doc_css_spec.spec().max_bytes()) {
      if (doc_css_spec.spec().max_bytes_is_warning()) {
        context->AddWarning(
            ValidationError::STYLESHEET_AND_INLINE_STYLE_TOO_LONG,
            context->line_col(),
            /*params=*/
            {StrCat(bytes_used), StrCat(doc_css_spec.spec().max_bytes())},
            /*spec_url=*/doc_css_spec.spec().max_bytes_spec_url(), result);
      } else {
        context->AddError(
            ValidationError::STYLESHEET_AND_INLINE_STYLE_TOO_LONG,
            context->line_col(),
            /*params=*/
            {StrCat(bytes_used), StrCat(doc_css_spec.spec().max_bytes())},
            /*spec_url=*/doc_css_spec.spec().max_bytes_spec_url(), result);
      }
    }
  }
}

// Emits errors for mismatch between add_value_to_set (provisions) and
// value_oneof_set (requirements).
void ParsedValidatorRules::MaybeEmitValueSetMismatchErrors(
    Context* context, ValidationResult* result) const {
  const auto& provided = context->value_sets_provided();
  for (const auto& requirement : context->value_sets_required()) {
    if (provided.find(requirement.first) == provided.end()) {
      for (const auto& error : requirement.second)
        context->AddError(error, result);
    }
  }
}

// Emits any validation errors which require a global view
// (mandatory tags, tags required by other tags, mandatory alternatives).
void ParsedValidatorRules::MaybeEmitGlobalTagValidationErrors(
    Context* context, ValidationResult* result) const {
  if (context->Progress(*result).complete) return;
  MaybeEmitMandatoryTagValidationErrors(context, result);
  if (context->Progress(*result).complete) return;
  MaybeEmitRequiresOrExcludesValidationErrors(context, result);
  if (context->Progress(*result).complete) return;
  MaybeEmitMandatoryAlternativesSatisfiedErrors(context, result);
  if (context->Progress(*result).complete) return;
  MaybeEmitDocSizeErrors(context, result);
  if (context->Progress(*result).complete) return;
  MaybeEmitCssLengthErrors(context, result);
  if (context->Progress(*result).complete) return;
  MaybeEmitValueSetMismatchErrors(context, result);
}

// The htmlparser requires that we register a handler for each tag
// for which we'd like to see CDATA - those are called the "intertags".
// In our case, it's simply the rules which specify the
// TagSpec::mandatory_cdata field.
const set<std::string>& ParsedValidatorRules::IntertagsToValidate() const {
  return tags_with_cdata_;
}

// Validates the provided |encountered_tag| with respect to a single tag spec.
ValidateTagResult ValidateTagAgainstSpec(
    const ParsedTagSpec& parsed_tag_spec,
    const ParsedTagSpec* best_match_reference_point, const Context& context,
    const ParsedHtmlTag& encountered_tag) {
  ValidateTagResult attempt;
  attempt.validation_result.set_status(ValidationResult::PASS);
  ValidateParentTag(parsed_tag_spec, context, &attempt.validation_result);
  ValidateAncestorTags(parsed_tag_spec, context, &attempt.validation_result);
  // Some parent tag specs also define allowed child tag names for the first
  // child or all children. Validate that we aren't violating any of those
  // rules either.
  context.tag_stack().MatchChildTagName(encountered_tag, context,
                                        &attempt.validation_result);
  // Only validate attributes if we haven't yet found any errors. The
  // Parent/Ancestor errors are informative without adding additional errors
  // about attributes.
  if (attempt.validation_result.status() == ValidationResult::PASS) {
    ValidateAttributes(parsed_tag_spec, best_match_reference_point, context,
                       encountered_tag, &attempt);
  }
  // Only validate that this is a valid descendant if it's not already invalid.
  if (attempt.validation_result.status() == ValidationResult::PASS) {
    ValidateDescendantTags(encountered_tag, parsed_tag_spec, context,
                           &attempt.validation_result);
  }
  ValidateNoSiblingsAllowedTags(encountered_tag, parsed_tag_spec, context,
                                &attempt.validation_result);
  ValidateLastChildTags(context, &attempt.validation_result);
  // If we haven't reached the body element yet, we may not have seen the
  // necessary extension. That case is handled elsewhere.
  if (context.tag_stack().HasAncestor("BODY")) {
    ValidateRequiredExtensions(parsed_tag_spec, context,
                               &attempt.validation_result);
  }
  // Only validate uniqueness if we haven't yet found any errors, as it's
  // likely that this is not the correct tagspec if we have.
  if (attempt.validation_result.status() == ValidationResult::PASS) {
    ValidateUniqueness(parsed_tag_spec, context, &attempt.validation_result);
  }

  // Append some warnings, only if no errors.
  if (attempt.validation_result.status() == ValidationResult::PASS) {
    const TagSpec& tag_spec = parsed_tag_spec.spec();
    if (tag_spec.has_deprecation()) {
      context.AddWarning(
          ValidationError::DEPRECATED_TAG, context.line_col(),
          /*params=*/{TagDescriptiveName(tag_spec), tag_spec.deprecation()},
          tag_spec.deprecation_url(), &attempt.validation_result);
    }
    if (tag_spec.unique_warning() &&
        context.TagspecsValidated().count(parsed_tag_spec.id())) {
      context.AddWarning(ValidationError::DUPLICATE_UNIQUE_TAG_WARNING,
                         context.line_col(),
                         /*params=*/{TagDescriptiveName(tag_spec)},
                         TagSpecUrl(tag_spec), &attempt.validation_result);
    }
  }
  return attempt;
}

// Validates the provided |encountered_tag| with respect to the tag
// specifications in the validator's rules, returning a ValidationResult
// with errors for this tag and a PASS or FAIL status. At least one
// specification must validate, or the result/ will have status FAIL.
// Also passes back a reference to the tag spec which matched, if a match
// was found.
// Context is not mutated; instead, pending mutations are stored in the return
// value, and are merged only if the tag spec is applied (pending some reference
// point stuff).
ValidateTagResult ValidateTag(const ParsedHtmlTag& encountered_tag,
                              const ParsedTagSpec* best_match_reference_point,
                              const Context& context) {
  const TagSpecDispatch& tagspec_dispatch =
      context.rules().DispatchForTagName(encountered_tag.UpperName());
  // Filter TagSpecDispatch.AllTagSpecs by type identifiers.
  vector<const ParsedTagSpec*> filtered_tag_specs;
  for (int32_t tag_id : tagspec_dispatch.AllTagSpecs()) {
    const ParsedTagSpec* parsed_tag_spec = context.rules().GetTagSpec(tag_id);
    // Keep TagSpecs that are used for these type identifiers.
    if (parsed_tag_spec->IsUsedForTypeIdentifiers(context.type_identifiers()))
      filtered_tag_specs.push_back(parsed_tag_spec);
  }
  // If there are no dispatch keys matching the tag name, ex: tag name is
  // "foo", set a disallowed tag error.
  if (!tagspec_dispatch.HasDispatchKeys() && filtered_tag_specs.empty()) {
    std::string spec_url;
    // Special case the spec_url for font tags to be slightly more useful.
    if (encountered_tag.LowerName() == "font")
      spec_url = context.rules().styles_spec_url();
    ValidateTagResult ret;
    context.AddError(ValidationError::DISALLOWED_TAG, context.line_col(),
                     /*params=*/{encountered_tag.LowerName()}, spec_url,
                     &ret.validation_result);
    return ret;
  }
  // At this point, we have dispatch keys, tagspecs, or both.
  // The strategy is to look for a matching dispatch key first. A matching
  // dispatch key does not guarantee that the dispatched tagspec will also
  // match. If we find a matching dispatch key, we immediately return the
  // result for that tagspec, success or fail.
  // If we don't find a matching dispatch key, we must try all of the
  // tagspecs to see if any of them match. If there are no tagspecs, we want
  // to return a GENERAL_DISALLOWED_TAG error.
  //
  // Calling HasDispatchKeys here is only an optimization to skip the loop
  // over encountered attributes in the case where we have no dispatches.
  if (tagspec_dispatch.HasDispatchKeys()) {
    for (const ParsedHtmlTagAttr& attr : encountered_tag.Attributes()) {
      vector<int32_t> tag_spec_ids = tagspec_dispatch.MatchingDispatchKey(
          attr.name(),
          // Attribute values are case-sensitive by default, but we
          // match dispatch keys in a case-insensitive manner and then
          // validate using whatever the tagspec requests.
          AsciiStrToLower(attr.value()), context.tag_stack().ParentTagName());
      ValidateTagResult ret;
      for (int32_t tag_spec_id : tag_spec_ids) {
        const ParsedTagSpec* parsed_tag_spec =
            context.rules().GetTagSpec(tag_spec_id);
        // Skip TagSpecs that aren't used for these type identifiers.
        if (!parsed_tag_spec->IsUsedForTypeIdentifiers(
                context.type_identifiers()))
          continue;
        ValidateTagResult attempt =
            ValidateTagAgainstSpec(*parsed_tag_spec, best_match_reference_point,
                                   context, encountered_tag);
        if (context.rules().BetterValidationResultThan(
                attempt.validation_result, ret.validation_result)) {
          attempt.best_match_tag_spec = parsed_tag_spec;
          ret = std::move(attempt);
          // Exit early on success
          if (ret.IsPassing()) return ret;
        }
      }
      if (ret.validation_result.status() != ValidationResult::UNKNOWN)
        return ret;
    }
  }

  // None of the dispatch tagspecs matched and passed. If there are no
  // non-dispatch tagspecs, consider this a 'generally' disallowed tag,
  // which gives an error that reads "tag foo is disallowed except in
  // specific forms".
  if (filtered_tag_specs.empty()) {
    ValidateTagResult ret;
    if (encountered_tag.LowerName() == "script") {
      // Special case for <script> tags to produce better error messages.
      context.AddError(ValidationError::DISALLOWED_SCRIPT_TAG,
                       context.line_col(),
                       /*params=*/{}, context.rules().rules().script_spec_url(),
                       &ret.validation_result);
    } else {
      context.AddError(ValidationError::GENERAL_DISALLOWED_TAG,
                       context.line_col(),
                       /*params=*/{encountered_tag.LowerName()},
                       /*spec_url=*/"", &ret.validation_result);
    }
    return ret;
  }
  // Validate against all remaining tagspecs. Each tagspec will produce a
  // different set of errors. Even if none of them match, we only want to
  // return errors from a single tagspec, not all of them. We keep around
  // the 'best' attempt until we have found a matching TagSpec or have
  // tried them all.
  ValidateTagResult ret;
  for (const ParsedTagSpec* parsed_tag_spec : filtered_tag_specs) {
    ValidateTagResult attempt = ValidateTagAgainstSpec(
        *parsed_tag_spec, best_match_reference_point, context, encountered_tag);
    if (context.rules().BetterValidationResultThan(attempt.validation_result,
                                                   ret.validation_result)) {
      attempt.best_match_tag_spec = parsed_tag_spec;
      ret = std::move(attempt);
      // Exit early on success
      if (ret.IsPassing()) return ret;
    }
  }
  return ret;
}

ValidateTagResult ReferencePointMatcher::ValidateTag(
    const ParsedHtmlTag& encountered_tag, const Context& context) const {
  // Look for a matching reference point, if we find one, record and exit.
  ValidateTagResult result_for_best_attempt;
  for (const ParsedReferencePoint& p : *parsed_reference_points_) {
    const ParsedTagSpec* parsed_tag_spec =
        parsed_rules_->GetTagSpec(p.tag_spec_id);
    // Skip TagSpecs that aren't used for these type identifiers.
    if (!parsed_tag_spec->IsUsedForTypeIdentifiers(context.type_identifiers()))
      continue;
    ValidateTagResult attempt = ValidateTagAgainstSpec(
        *parsed_tag_spec, /*best_match_reference_point=*/nullptr, context,
        encountered_tag);
    if (context.rules().BetterValidationResultThan(
            attempt.validation_result,
            result_for_best_attempt.validation_result)) {
      result_for_best_attempt = std::move(attempt);
      if (result_for_best_attempt.IsPassing()) {
        result_for_best_attempt.best_match_tag_spec = parsed_tag_spec;
        return result_for_best_attempt;
      }
    }
  }

  // This check cannot fail as a successful validation above exits early.
  CHECK_EQ(ValidationResult::FAIL,
           result_for_best_attempt.validation_result.status())
      << "Validating against spec when matching spec already found.";

  // Special case: only one reference point defined - emit a singular
  // error message *and* merge in the errors from the best attempt above.
  if (parsed_reference_points_->size() == 1) {
    context.AddError(
        ValidationError::CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT_SINGULAR,
        context.line_col(),
        {encountered_tag.LowerName(),
         parsed_reference_points_->parent_tag_spec_name(),
         parsed_reference_points_->begin()->point->tag_spec_name()},
        parsed_reference_points_->parent_spec_url(),
        &result_for_best_attempt.validation_result);
    return result_for_best_attempt;
  }

  // General case: more than one reference point defined. Emit a plural
  // message with the acceptable reference points listed.
  std::string acceptable;
  for (const ParsedReferencePoint& p : *parsed_reference_points_) {
    if (!acceptable.empty()) StrAppend(&acceptable, ", ");
    StrAppend(&acceptable, p.point->tag_spec_name());
  }
  ValidateTagResult result_for_multiple_attempts;
  context.AddError(
      ValidationError::CHILD_TAG_DOES_NOT_SATISFY_REFERENCE_POINT,
      context.line_col(),
      {encountered_tag.LowerName(),
       parsed_reference_points_->parent_tag_spec_name(), acceptable},
      parsed_reference_points_->parent_spec_url(),
      &result_for_multiple_attempts.validation_result);
  return result_for_multiple_attempts;
}

void ReferencePointMatcher::RecordMatch(const ParsedTagSpec& reference_point) {
  reference_points_matched_.push_back(reference_point.id());
}

void ReferencePointMatcher::ExitParentTag(const Context& context,
                                          ValidationResult* result) const {
  absl::node_hash_map<int32_t, int32_t> reference_point_by_count;
  for (int32_t r : reference_points_matched_) ++reference_point_by_count[r];
  for (const ParsedReferencePoint& p : *parsed_reference_points_) {
    if (p.point->mandatory() && reference_point_by_count.find(p.tag_spec_id) ==
                                    reference_point_by_count.end()) {
      context.AddError(ValidationError::MANDATORY_REFERENCE_POINT_MISSING,
                       line_col_,
                       {p.point->tag_spec_name(),
                        parsed_reference_points_->parent_tag_spec_name()},
                       parsed_reference_points_->parent_spec_url(), result);
    }
    if (p.point->unique()) {
      auto it = reference_point_by_count.find(p.tag_spec_id);
      if (it != reference_point_by_count.end() && it->second != 1) {
        context.AddError(ValidationError::DUPLICATE_REFERENCE_POINT, line_col_,
                         {p.point->tag_spec_name(),
                          parsed_reference_points_->parent_tag_spec_name()},
                         parsed_reference_points_->parent_spec_url(), result);
      }
    }
  }
}

// Makes Singleton ParsedValidatorRules non destructible.
// TSAN throw race condition errors when ~ParsedValidatorRules destructor is
// called.
template <typename T>
class NoDestructor {
 public:
  template <typename... Ts>
  NoDestructor(Ts&&... args) : t_(new (&space_) T(std::forward<Ts>(args)...)) {}

  const T* Get() const { return t_; }

 private:
  alignas(T) unsigned char space_[sizeof(T)];
  const T* t_;
};

class ParsedValidatorRulesProvider {
 public:
  static const ParsedValidatorRules* Get(HtmlFormat::Code format) {
    switch (format) {
      case HtmlFormat::AMP4ADS: {
        static const NoDestructor<ParsedValidatorRules> rules(
            HtmlFormat::AMP4ADS);
        return rules.Get();
      }
      case HtmlFormat::AMP4EMAIL: {
        static const NoDestructor<ParsedValidatorRules> rules(
            HtmlFormat::AMP4EMAIL);
        return rules.Get();
      }
      default: {
        static const NoDestructor<ParsedValidatorRules> rules(HtmlFormat::AMP);
        return rules.Get();
      }
    }
  }
};

class Validator {
 public:
  Validator(const ParsedValidatorRules* rules, int max_errors = -1)
      : rules_(rules), max_errors_(max_errors), context_(rules_, max_errors_) {}

  ValidationResult Validate(const htmlparser::Document& doc) {
    doc_metadata_ = doc.Metadata();
    UpdateLineColumnIndex(doc.RootNode());
    // The validation check for document size can't be done here since
    // the Type Identifiers on the html tag have not been parsed yet and
    // we wouldn't know which rule to apply. It's set to the context
    // so that when those things are known it can be checked.
    context_.SetDocByteSize(doc_metadata_.html_src_bytes);
    ValidateNode(doc.RootNode());
    auto [current_line_no, current_col_no] =
        doc_metadata_.document_end_location;
    context_.SetLineCol(current_line_no, current_col_no > 0 ? current_col_no - 1
                                                            : current_col_no);
    EndDocument();
    return result_;
  }

  ValidationResult Validate(std::string_view html) {
    Clear();
    htmlparser::ParseOptions options{
        .scripting = true,
        .frameset_ok = true,
        .record_node_offsets = true,
        .record_attribute_offsets = true,
    };
    auto parser = std::make_unique<htmlparser::Parser>(html, options);
    auto doc = parser->Parse();
    // Currently parser returns nullptr only if document is too complex.
    // NOTE: If htmlparser starts returning null document for other reasons, we
    // must add new error types here.
    if (!doc || !doc->status().ok()) {
      context_.AddError(ValidationError::DOCUMENT_TOO_COMPLEX, LineCol(1, 0),
                        {}, "", &result_);
      return result_;
    }

    return Validate(*doc);
  }

  // Updates context's line column index using the current node's position.
  inline void UpdateLineColumnIndex(htmlparser::Node* node) {
    auto node_line_col = node->LineColInHtmlSrc();
    if (node_line_col.has_value()) {
      auto [line_no, col_no] = node_line_col.value();
      context_.SetLineCol(line_no >= 0 ? line_no : line_no + 1,
                          col_no > 0 ? col_no - 1 : col_no);
    }
  }

  // May return false if validation fails due to DOCUMENT_TOO_COMPLEX error.
  bool ValidateNode(htmlparser::Node* node, int stack_size = 1) {
    if (stack_size > GetFlag(FLAGS_max_node_recursion_depth)) {
      context_.AddError(ValidationError::DOCUMENT_TOO_COMPLEX,
                        context_.encountered_body_line_col(),
                        /*params=*/{"BODY"},
                        /*spec_url=*/"", &result_);
      return false;
    }

    ParsedHtmlTag parsed_tag{node};

    switch (node->Type()) {
      case htmlparser::NodeType::ERROR_NODE:
        // TODO: Set error here.
        break;
      case htmlparser::NodeType::DOCUMENT_NODE:
        for (htmlparser::Node* c = node->FirstChild(); c;
             c = c->NextSibling()) {
          UpdateLineColumnIndex(c);
          if (!ValidateNode(c, ++stack_size)) {
            return false;
          }
          --stack_size;
        }
        return true;
      case htmlparser::NodeType::COMMENT_NODE:
        if (node->IsManufactured()) {
          UpdateLineColumnIndex(node);
          context_.AddError(ValidationError::DISALLOWED_TAG,
                            LineCol(node->LineColInHtmlSrc()->first + 1,
                                    node->LineColInHtmlSrc()->second),
                            /*params=*/{"<?"}, /*spec_url=*/"", &result_);
        }
        return true;
      case htmlparser::NodeType::DOCTYPE_NODE:
        if (doc_metadata_.quirks_mode) {
          LineCol linecol(1, 0);
          auto lc = node->LineColInHtmlSrc();
          if (lc.has_value()) {
            auto [line, col] = lc.value();
            linecol = LineCol(line, col > 0 ? col - 1 : col);
          }
          context_.AddError(ValidationError::INVALID_DOCTYPE_HTML, linecol,
                            /*params=*/{},
                            "https://amp.dev/documentation/"
                            "guides-and-tutorials/start/create/basic_markup/",
                            &result_);
        }
        // Process doctype node as if it is valid.
        StartTag(parsed_tag);
        return true;
      case htmlparser::NodeType::ELEMENT_NODE:
        break;
      case htmlparser::NodeType::TEXT_NODE:
        return true;
      default:
        return true;
    }

    StartTag(parsed_tag);
    std::string upper_tag_name = AsciiStrToUpper(
        htmlparser::AtomUtil::ToString(node->DataAtom(), node->Data()));

    const auto& tags_with_cdata = rules_->IntertagsToValidate();
    bool has_template_ancestor = context_.tag_stack().HasAncestor("TEMPLATE");
    if (tags_with_cdata.find(upper_tag_name) != tags_with_cdata.end()) {
      if (node->FirstChild() &&
          node->FirstChild()->Type() == htmlparser::NodeType::TEXT_NODE) {
        for (auto& attr : node->Attributes()) {
          if (!has_template_ancestor &&
              htmlparser::Strings::EqualFold(attr.key, "type") &&
              (htmlparser::Strings::EqualFold(attr.value, "application/json") ||
               htmlparser::Strings::EqualFold(attr.value,
                                              "application/ld+json"))) {
            if (auto v = htmlparser::json::Validate(
                    node->FirstChild()->Data());
                !v.first) {
              std::pair<int, int> json_linecol{0, 0};
              std::pair<int, int> script_linecol{0, 0};
              if (auto pos = node->LineColInHtmlSrc(); pos.has_value()) {
                script_linecol = {pos.value().first, pos.value().second};
              }
              if (auto pos = node->FirstChild()->LineColInHtmlSrc();
                  pos.has_value()) {
                json_linecol = {pos.value().first, pos.value().second};
              }
              context_.AddWarning(
                  ValidationError::INVALID_JSON_CDATA,
                  LineCol(script_linecol.first + v.second.first,
                          // Combine both the html string column offset and the
                          // json string column offset if the json string is
                          // the first line.
                          // Eg: <script>{"foo": error}... here column offset is
                          // "<script>".size() + column number of json error.
                          v.second.first == 0
                              ? json_linecol.second + v.second.second - 1
                              : v.second.second - 1),
                  /*params=*/{},
                  /*spec_url=*/"", &result_);
            }
          }
        }
        const CdataMatcher* cdata_matcher =
            context_.tag_stack().cdata_matcher();
        if (cdata_matcher) {
          cdata_matcher->Match(string_view(node->FirstChild()->Data().data(),
                                           node->FirstChild()->Data().size()),
                               &context_, &result_);
        }
      }
    }

    if (std::find(htmlparser::kVoidElements.begin(),
                  htmlparser::kVoidElements.end(),
                  node->DataAtom()) != htmlparser::kVoidElements.end()) {
      stack_size--;
      EndTag(upper_tag_name);
      return true;
    }

    for (htmlparser::Node* c = node->FirstChild(); c;) {
      auto next = c->NextSibling();
      UpdateLineColumnIndex(c);
      if (!ValidateNode(c, ++stack_size)) return false;
      --stack_size;

      // For user agents with scripting enabled (99% cases) noscript is parsed
      // as text and ignored. That is noscript element contents are not
      // evaluated or made part of the DOM.
      // htmlparser parses AMP documents with the same behavior, i.e scripting
      // enabled.
      //
      // To parse the content of noscript, reparse the noscript element contents
      // and populate it in the DOM.
      if (node->DataAtom() == htmlparser::Atom::NOSCRIPT &&
          c->Type() == htmlparser::NodeType::TEXT_NODE) {
        auto dummy_node = std::make_unique<htmlparser::Node>(
            htmlparser::NodeType::ELEMENT_NODE, htmlparser::Atom::BODY);
        auto doc = htmlparser::ParseFragment(c->Data(), dummy_node.get());
        if (doc && doc->status().ok()) {
          // Append all the nodes to the original <noscript> parent.
          for (htmlparser::Node* cn : doc->FragmentNodes()) {
            cn->UpdateChildNodesPositions(node);
            UpdateLineColumnIndex(cn);
            ValidateNode(cn, ++stack_size);
            --stack_size;
          }
          node->RemoveChild(c);
        }
      }
      c = next;
    }

    EndTag(AsciiStrToUpper(
        htmlparser::AtomUtil::ToString(node->DataAtom(), node->Data())));
    return true;
  }

  const ValidationResult& Result() const { return result_; }

  // While the validator instance is tied forever to a given htmlparser
  // and seemingly not reusable, the htmlparser can be used
  // to parse multiple documents, so in case a new document arrives
  // we clear out the state.
  void Clear() {
    result_.Clear();
    context_ = Context(rules_, max_errors_);
  }

  // While parsing the document HEAD, we may accumulate errors which depend
  // on seeing later extension <script> tags
  void EmitMissingExtensionErrors() {
    vector<ValidationError> errors =
        context_.mutable_extensions()->MissingExtensionErrors();
    for (int i = 0; i < errors.size(); ++i) {
      context_.AddError(std::move(errors[i]), &result_);
      if (context_.Progress(result_).complete) return;
    }
  }

  void StartTag(const ParsedHtmlTag& encountered_tag) {
    if (encountered_tag.UpperName() == "HTML")
      rules_->ValidateHtmlTag(encountered_tag, &context_, &result_);

    if (encountered_tag.IsManufacturedBodyTag())
      rules_->ValidateManufacturedBody(&context_, &result_);

    // Duplicate attribute names can cause validation failures.
    if (auto duplicate_attribute = encountered_tag.HasDuplicateAttrs();
        duplicate_attribute.has_value()) {
      context_.AddWarning(ValidationError::DUPLICATE_ATTRIBUTE,
                          context_.line_col(),
                          {encountered_tag.LowerName(), *duplicate_attribute},
                          /*spec_url=*/"", &result_);
    }

    if (encountered_tag.UpperName() == "BODY") {
      EmitMissingExtensionErrors();
      if (context_.Progress(result_).complete) return;
      context_.RecordBodyTag(encountered_tag);
    }

    // If there is a reference point matcher on the stack, validate against
    // that first.
    ValidateTagResult result_for_reference_point;
    ReferencePointMatcher* reference_point_matcher =
        context_.mutable_tag_stack()->MutableParentReferencePointMatcher();
    // We must match the reference point before the TagSpec, as otherwise we
    // will end up with "unexplained" attributes during tagspec matching
    // which the reference point takes care of.
    if (reference_point_matcher) {
      result_for_reference_point =
          reference_point_matcher->ValidateTag(encountered_tag, context_);
    }

    // Validate against the set of tag specs.
    ValidateTagResult result_for_tag =
        ValidateTag(encountered_tag,
                    result_for_reference_point.best_match_tag_spec, context_);
    // Suppress errors in dev-mode.
    result_for_tag.dev_mode_suppress =
        ShouldSuppressDevModeErrors(encountered_tag, context_);
    // Only merge in the reference point errors into the final result if the
    // tag otherwise passes one of the TagSpecs. Otherwise, we end up with
    // unnecessarily verbose errors.
    if (reference_point_matcher &&
        result_for_tag.validation_result.status() == ValidationResult::PASS &&
        !result_for_tag.dev_mode_suppress) {
      context_.MergeRespectingMaxErrors(
          result_for_reference_point.validation_result, &result_);
    }
    CheckForReferencePointCollision(
        result_for_reference_point.best_match_tag_spec,
        result_for_tag.best_match_tag_spec, context_,
        &result_for_tag.validation_result);
    if (!result_for_tag.dev_mode_suppress)
      context_.MergeRespectingMaxErrors(result_for_tag.validation_result,
                                        &result_);

    context_.UpdateFromTagResults(encountered_tag, result_for_reference_point,
                                  result_for_tag);
  }

  void EndTag(const std::string& encountered_tag) {
    context_.mutable_tag_stack()->ExitTag(encountered_tag, context_, &result_);
  }

  void EndDocument() {
    if (context_.Progress(result_).complete) return;
    // It's not clear whether the following is necessary as the htmlparser may
    // close the tags automatically. But we do it anyway, for paranoia.
    context_.mutable_tag_stack()->ExitRemainingTags(context_, &result_);
    rules_->MaybeEmitGlobalTagValidationErrors(&context_, &result_);

    if (result_.status() == ValidationResult::UNKNOWN)
      result_.set_status(ValidationResult::PASS);

    // b/168027048: Temporary workaround for rare parsing issue resulting in
    // negative column numbers. Remove this loop after the issue is resolved.
    for (auto it = result_.mutable_errors()->begin();
         it != result_.mutable_errors()->end(); ++it) {
      ValidationError& error = *it;
      if (error.col() < 0) error.set_col(0);
    }

    // As some errors can be inserted out of order, sort errors at the
    // end based on their line/col numbers.
    std::stable_sort(
        result_.mutable_errors()->begin(), result_.mutable_errors()->end(),
        [](const ValidationError& lhs, const ValidationError& rhs) {
          if (lhs.line() != rhs.line()) return lhs.line() < rhs.line();
          return lhs.col() < rhs.col();
        });
  }

 private:
  const ParsedValidatorRules* rules_;
  int max_errors_ = -1;
  Context context_;
  htmlparser::DocumentMetadata doc_metadata_;
  ValidationResult result_;
  Validator(const Validator&) = delete;
  Validator& operator=(const Validator&) = delete;
};

}  // namespace

ValidationResult Validate(std::string_view html, HtmlFormat_Code html_format,
                          int max_errors) {
  Validator validator(ParsedValidatorRulesProvider::Get(html_format),
                      max_errors);
  return validator.Validate(html);
}

ValidationResult Validate(const htmlparser::Document& doc,
                          HtmlFormat_Code html_format, int max_errors) {
  Validator validator(ParsedValidatorRulesProvider::Get(html_format),
                      max_errors);
  return validator.Validate(doc);
}

}  // namespace amp::validator
