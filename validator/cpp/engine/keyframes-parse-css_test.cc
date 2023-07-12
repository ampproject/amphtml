#include "cpp/engine/keyframes-parse-css.h"

#include <gmock/gmock.h>
#include "gtest/gtest.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/string_view.h"
#include "cpp/htmlparser/css/parse-css.h"
#include "cpp/htmlparser/strings.h"

using htmlparser::css::BlockType;
using htmlparser::css::CssParsingConfig;
using htmlparser::css::ErrorToken;
using htmlparser::css::Stylesheet;
using htmlparser::css::Token;
using std::unique_ptr;

namespace amp::validator::parse_css {
namespace {

template <class T>
std::string JsonFromList(const std::vector<std::unique_ptr<T>>& list) {
  htmlparser::json::JsonArray array;
  for (const auto& element : list) {
    if (element)
      array.Append(element->ToJson());
    else
      array.Append("null");
  }
  return array.ToString();
}

CssParsingConfig KeyframesCssParsingConfig() {
  CssParsingConfig config;
  config.at_rule_spec["keyframes"] = BlockType::PARSE_AS_RULES;
  config.at_rule_spec["media"] = BlockType::PARSE_AS_RULES;
  config.at_rule_spec["supports"] = BlockType::PARSE_AS_RULES;
  config.default_spec = BlockType::PARSE_AS_IGNORE;
  return config;
}

TEST(KeyframesParseCssTest, Good) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@keyframes anim1 {"
      "0% {transform: translateX(-100%);}"
      "100% {transform: translateX(100%);}"
      "}"
      "@-webkit-keyframes anim1 {"
      "0% {transform: translateX(-100%);}"
      "100% {transform: translateX(100%);}"
      "}"
      "@media (min-width: 300px) {"
      "@keyframes anim1 {"
      "0% {transform: translateX(-200%);}"
      "100% {transform: translateX(200%);}"
      "}"
      "}"
      "@supports (offset-distance: 0) {"
      "@keyframes anim1 {"
      "0% {offset-distance: 0}"
      "100% {offset-distance: 100%}"
      "}"
      "}"
      "@media (min-width: 300px) {"
      "@supports (offset-distance: 0) {"
      "@keyframes anim1 {"
      "0% {offset-distance: 0}"
      "100% {offset-distance: 100%}"
      "}"
      "}"
      "}"
      "@supports (offset-distance: 0) {"
      "@media (min-width: 300px) {"
      "@keyframes anim1 {"
      "0% {transform: translateX(-200%);}"
      "100% {transform: translateX(200%);}"
      "}"
      "}"
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, KeyframesCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateKeyframesCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}  // Good

TEST(KeyframesParseCssTest, Good_Stylesheet) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@keyframes anim1 {"
      "0% {transform: translateX(-100%);}"
      "100% {transform: translateX(100%);}"
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, KeyframesCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(),
            R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"AT_RULE","line":1,"col":0,"name":"keyframes","prelude":[{"tokentype":"WHITESPACE","line":1,"col":10},{"tokentype":"IDENT","line":1,"col":11,"value":"anim1"},{"tokentype":"WHITESPACE","line":1,"col":16},{"tokentype":"EOF_TOKEN","line":1,"col":17}],"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":18,"prelude":[{"tokentype":"PERCENTAGE","line":1,"col":18,"repr":"0","value":0.000000},{"tokentype":"WHITESPACE","line":1,"col":20},{"tokentype":"EOF_TOKEN","line":1,"col":21}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":22,"name":"transform","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":32},{"tokentype":"FUNCTION_TOKEN","line":1,"col":33,"value":"translateX"},{"tokentype":"PERCENTAGE","line":1,"col":44,"repr":"-100","value":-100.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":49},{"tokentype":"EOF_TOKEN","line":1,"col":50}]}]},{"tokentype":"QUALIFIED_RULE","line":1,"col":52,"prelude":[{"tokentype":"PERCENTAGE","line":1,"col":52,"repr":"100","value":100.000000},{"tokentype":"WHITESPACE","line":1,"col":56},{"tokentype":"EOF_TOKEN","line":1,"col":57}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":58,"name":"transform","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":68},{"tokentype":"FUNCTION_TOKEN","line":1,"col":69,"value":"translateX"},{"tokentype":"PERCENTAGE","line":1,"col":80,"repr":"100","value":100.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":84},{"tokentype":"EOF_TOKEN","line":1,"col":85}]}]}],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":88}})");
}  // Good_Stylesheet

TEST(KeyframesParseCssTest, Good_Allowed_At_Rules) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@keyframes anim1 {}"
      "@-webkit-keyframes anim1 {}"
      "@media (min-width: 300px) {}"
      "@supports (offset-distance: 0) {}"
      "@media (min-width: 300px) {}"
      "@supports (offset-distance: 0) {}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, KeyframesCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateKeyframesCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}  // Good_Allowed_At_Rules

TEST(KeyframesParseCssTest, Bad_NotAtRule) {
  std::vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints("amp-img {}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, KeyframesCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");

  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"IDENT","line":1,"col":0,"value":"amp-img"},{"tokentype":"WHITESPACE","line":1,"col":7},{"tokentype":"EOF_TOKEN","line":1,"col":8}],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":10}})");

  ValidateKeyframesCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":0,"code":"CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME","params":["style","amp-img"]}])");
}  // Bad_NotAtRule

TEST(KeyframesParseCssTest, Bad_NonKeyFrameWithDeclarations) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@media (min-width: 300px) {"
      "100% {offset-distance: 100%}"
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, KeyframesCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");

  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"AT_RULE","line":1,"col":0,"name":"media","prelude":[{"tokentype":"WHITESPACE","line":1,"col":6},{"tokentype":"OPEN_PAREN","line":1,"col":7},{"tokentype":"IDENT","line":1,"col":8,"value":"min-width"},{"tokentype":"COLON","line":1,"col":17},{"tokentype":"WHITESPACE","line":1,"col":18},{"tokentype":"DIMENSION","line":1,"col":19,"repr":"300","type":"integer","unit":"px","value":300.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":24},{"tokentype":"WHITESPACE","line":1,"col":25},{"tokentype":"EOF_TOKEN","line":1,"col":26}],"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":27,"prelude":[{"tokentype":"PERCENTAGE","line":1,"col":27,"repr":"100","value":100.000000},{"tokentype":"WHITESPACE","line":1,"col":31},{"tokentype":"EOF_TOKEN","line":1,"col":32}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":33,"name":"offset-distance","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":49},{"tokentype":"PERCENTAGE","line":1,"col":50,"repr":"100","value":100.000000},{"tokentype":"EOF_TOKEN","line":1,"col":54}]}]}],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":56}})");

  ValidateKeyframesCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":27,"code":"CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME","params":["style","100"]}])");
}  // Bad_NonKeyFrameWithDeclarations

TEST(KeyframesParseCssTest, TestCorrectPreludeConcatenation) {
  std::vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints("a.underlined {}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, KeyframesCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"IDENT","line":1,"col":0,"value":"a"},{"tokentype":"DELIM","line":1,"col":1,"value":"."},{"tokentype":"IDENT","line":1,"col":2,"value":"underlined"},{"tokentype":"WHITESPACE","line":1,"col":12},{"tokentype":"EOF_TOKEN","line":1,"col":13}],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":15}})");
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateKeyframesCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":0,"code":"CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME","params":["style","a.underlined"]}])");
}  // TestCorrectPreludeConcatenation

TEST(KeyframesParseCssTest, Bad_QualifiedRuleNotInsideAtRule) {
  std::vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints("a { color: red }");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, KeyframesCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateKeyframesCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":0,"code":"CSS_SYNTAX_DISALLOWED_QUALIFIED_RULE_MUST_BE_INSIDE_KEYFRAME","params":["style","a"]}])");
}  // Bad_QualifiedRuleNotInsideAtRule

TEST(KeyframesParseCssTest, Bad_QualifiedRuleKeyframeInsideKeyframe) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@keyframes anim2 {"
      "@keyframes anim1 {"
      "100% {visibility: visible}"
      "}"
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, KeyframesCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateKeyframesCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":18,"code":"CSS_SYNTAX_DISALLOWED_KEYFRAME_INSIDE_KEYFRAME","params":["style"]}])");
}  // Bad_QualifiedRuleKeyframeInsideKeyframe

}  // namespace
}  // namespace amp::validator::parse_css
