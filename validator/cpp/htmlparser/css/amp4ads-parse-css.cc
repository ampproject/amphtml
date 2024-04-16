#include "cpp/htmlparser/css/amp4ads-parse-css.h"

#include "absl/memory/memory.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_join.h"
#include "cpp/htmlparser/css/parse-css.h"
#include "re2/re2.h"

using absl::make_unique;
using std::string_view;
using amp::validator::ValidationError;
using std::unique_ptr;

namespace htmlparser::css {
namespace {

// Fills an ErrorToken with the provided position, code, and params.
unique_ptr<ErrorToken> CreateParseErrorTokenAt(
    const Token& position_token, ValidationError::Code code,
    const std::vector<std::string>& params) {
  auto token = make_unique<ErrorToken>(code, params);
  position_token.CopyStartPositionTo(token.get());
  return token;
}

// For a list of |tokens|, if the first non-whitespace token is an identifier,
// returns its string value. Otherwise, returns the empty string.
std::string FirstIdent(const std::vector<unique_ptr<Token>>& tokens) {
  if (tokens.empty()) return "";
  if (tokens[0]->Type() == TokenType::IDENT) return tokens[0]->StringValue();
  if (tokens.size() >= 2 && tokens[0]->Type() == TokenType::WHITESPACE &&
      tokens[1]->Type() == TokenType::IDENT)
    return tokens[1]->StringValue();
  return "";
}

class Amp4AdsVisitor : public RuleVisitor {
 public:
  explicit Amp4AdsVisitor(std::vector<unique_ptr<ErrorToken>>* errors)
      : in_keyframes_(nullptr), errors_(errors) {}

  void VisitDeclaration(const Declaration& declaration) override {
    // position:fixed and position:sticky are disallowed.
    if (declaration.name() != "position") return;
    std::string ident = FirstIdent(declaration.value());
    if (ident == "fixed" || ident == "sticky") {
      errors_->emplace_back(CreateParseErrorTokenAt(
          declaration, ValidationError::CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE,
          {"style", "position", ident}));
    }
  }

  void VisitQualifiedRule(const QualifiedRule& qualified_rule) override {
    for (const unique_ptr<Declaration>& decl : qualified_rule.declarations()) {
      auto name = StripVendorPrefix(decl->name());

      // The name of the property may identify a transition. The only
      // properties that may be transitioned are opacity and transform.
      if (name == "transition") {
        std::string transitioned_property = FirstIdent(decl->value());
        auto transitioned_property_stripped =
            StripVendorPrefix(transitioned_property);

        if (transitioned_property_stripped != "opacity" &&
            transitioned_property_stripped != "transform") {
          errors_->emplace_back(CreateParseErrorTokenAt(
              *decl,
              ValidationError::CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE_WITH_HINT,
              {"style", "transition", transitioned_property,
               "['opacity', 'transform']"}));
        }
      }
      // This is the @keyframes variant for identifying transitions;
      // the only properties that may be specified within a transition
      // are opacity, transform, and animation-timing-function.
      if (in_keyframes_ && name != "transform" && name != "opacity" &&
          name != "animation-timing-function") {
        errors_->emplace_back(CreateParseErrorTokenAt(
            *decl,
            ValidationError::CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE,
            {"style", decl->name(), in_keyframes_->name(),
             "['animation-timing-function', 'opacity', 'transform']"}));
      }
    }
  }

  void VisitAtRule(const AtRule& at_rule) override {
    if (StripVendorPrefix(at_rule.name()) == "keyframes")
      in_keyframes_ = &at_rule;
    else
      in_keyframes_ = nullptr;
  }

  void LeaveAtRule(const AtRule& at_rule) override { in_keyframes_ = nullptr; }

 private:
  const AtRule* in_keyframes_;
  std::vector<unique_ptr<ErrorToken>>* errors_;
};
}  // namespace

void ValidateAmp4AdsCss(const Stylesheet& stylesheet,
                        std::vector<unique_ptr<ErrorToken>>* errors) {
  Amp4AdsVisitor visitor(errors);
  stylesheet.Accept(&visitor);
}
}  // namespace htmlparser::css
