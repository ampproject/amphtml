#include "cpp/engine/keyframes-parse-css.h"

#include "absl/memory/memory.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/string_view.h"

using absl::make_unique;
using amp::validator::ValidationError;
using htmlparser::css::AtRule;
using htmlparser::css::ErrorToken;
using htmlparser::css::QualifiedRule;
using htmlparser::css::RuleVisitor;
using htmlparser::css::Token;
using std::unique_ptr;
using std::vector;

namespace amp::validator::parse_css {
namespace {
// Fills an ErrorToken with the provided position, code, and params.
unique_ptr<ErrorToken> CreateParseErrorTokenAt(
    const Token& position_token, ValidationError::Code code,
    const std::vector<std::string>& params) {
  auto token = make_unique<ErrorToken>(code, params);
  position_token.CopyStartPositionTo(token.get());
  return token;
}

class KeyframesVisitor : public RuleVisitor {
 public:
  explicit KeyframesVisitor(std::vector<unique_ptr<ErrorToken>>* errors)
      : errors_(errors) {}

  // This is allowed:
  //   @keyframes anim1 { 100% {visibility: visible;} }
  // But these are not allowed:
  //   @media (min-width: 300px) { 100% {transform: translateX(-100%);} }
  //   amp-img { opacity: 0 }
  void VisitQualifiedRule(const QualifiedRule& qualified_rule) override {
    if (!parent_is_keyframes_at_rule_) {
      errors_->emplace_back(CreateParseErrorTokenAt(
          qualified_rule,
          ValidationError::
              CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME,
          {"style", qualified_rule.RuleName()}));
      return;
    }
    if (!qualified_rule.declarations().empty()) return;
    errors_->emplace_back(CreateParseErrorTokenAt(
        qualified_rule,
        ValidationError::CSS_SYNTAX_QUALIFIED_RULE_HAS_NO_DECLARATIONS,
        {"style", qualified_rule.RuleName()}));
  }

  void VisitAtRule(const AtRule& at_rule) override {
    // TODO: Move this to protoascii.
    if (at_rule.name() == "keyframes" || at_rule.name() == "-moz-keyframes" ||
        at_rule.name() == "-o-keyframes" ||
        at_rule.name() == "-webkit-keyframes") {
      if (parent_is_keyframes_at_rule_) {
        errors_->emplace_back(CreateParseErrorTokenAt(
            at_rule,
            ValidationError::CSS_SYNTAX_DISALLOWED_KEYFRAME_INSIDE_KEYFRAME,
            {"style"}));
      }
      parent_is_keyframes_at_rule_ = true;
    }
  }

  void LeaveAtRule(const AtRule& at_rule) override {
    parent_is_keyframes_at_rule_ = false;
  }

 private:
  std::vector<unique_ptr<ErrorToken>>* errors_;
  bool parent_is_keyframes_at_rule_ = false;
};
}  // namespace

void ValidateKeyframesCss(const htmlparser::css::Stylesheet& stylesheet,
                          std::vector<unique_ptr<ErrorToken>>* errors) {
  KeyframesVisitor visitor(errors);
  stylesheet.Accept(&visitor);
}
}  // namespace amp::validator::parse_css
