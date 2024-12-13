#include "cpp/htmlparser/css/amp4ads-parse-css.h"

#include <gmock/gmock.h>
#include "gtest/gtest.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_join.h"
#include "absl/strings/string_view.h"
#include "cpp/htmlparser/css/parse-css.h"
#include "cpp/htmlparser/strings.h"

using std::unique_ptr;
using testing::ElementsAre;

namespace htmlparser::css {
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

CssParsingConfig A4aCssParsingConfig() {
  CssParsingConfig config;
  config.at_rule_spec["font-face"] = BlockType::PARSE_AS_DECLARATIONS;
  config.at_rule_spec["media"] = BlockType::PARSE_AS_RULES;
  config.at_rule_spec["keyframes"] = BlockType::PARSE_AS_RULES;
  config.default_spec = BlockType::PARSE_AS_IGNORE;
  return config;
}

TEST(Amp4AdsParseCssTest, AmpAnimateExample_Good) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".amp-animate .box { "
      "  transform: rotate(180deg); transition: transform 2s; "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"DELIM","line":1,"col":0,"value":"."},{"tokentype":"IDENT","line":1,"col":1,"value":"amp-animate"},{"tokentype":"WHITESPACE","line":1,"col":12},{"tokentype":"DELIM","line":1,"col":13,"value":"."},{"tokentype":"IDENT","line":1,"col":14,"value":"box"},{"tokentype":"WHITESPACE","line":1,"col":17},{"tokentype":"EOF_TOKEN","line":1,"col":18}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":22,"name":"transform","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":32},{"tokentype":"FUNCTION_TOKEN","line":1,"col":33,"value":"rotate"},{"tokentype":"DIMENSION","line":1,"col":40,"repr":"180","type":"integer","unit":"deg","value":180.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":46},{"tokentype":"EOF_TOKEN","line":1,"col":47}]},{"tokentype":"DECLARATION","line":1,"col":49,"name":"transition","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":60},{"tokentype":"IDENT","line":1,"col":61,"value":"transform"},{"tokentype":"WHITESPACE","line":1,"col":70},{"tokentype":"DIMENSION","line":1,"col":71,"repr":"2","type":"integer","unit":"s","value":2.000000},{"tokentype":"EOF_TOKEN","line":1,"col":73}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":76}})");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}

TEST(Amp4AdsParseCssTest, AmpAnimateExample_Good_VendorPrefixed) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".amp-animate .box { "
      "  -moz-transform: rotate(180deg); -webkit-transition: -o-transform 2s; "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}

TEST(Amp4AdsParseCssTest,
     AmpAnimateExample_Bad_PositionFixedAndPositionStickyAreDisallowed) {
  std::vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints(
          ".box { position: fixed; position:sticky; }");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"DELIM","line":1,"col":0,"value":"."},{"tokentype":"IDENT","line":1,"col":1,"value":"box"},{"tokentype":"WHITESPACE","line":1,"col":4},{"tokentype":"EOF_TOKEN","line":1,"col":5}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":7,"name":"position","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":16},{"tokentype":"IDENT","line":1,"col":17,"value":"fixed"},{"tokentype":"EOF_TOKEN","line":1,"col":22}]},{"tokentype":"DECLARATION","line":1,"col":24,"name":"position","important":false,"value":[{"tokentype":"IDENT","line":1,"col":33,"value":"sticky"},{"tokentype":"EOF_TOKEN","line":1,"col":39}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":42}})");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":7,"code":"CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE","params":["style","position","fixed"]},{"tokentype":"ERROR","line":1,"col":24,"code":"CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE","params":["style","position","sticky"]}])");
}

TEST(Amp4AdsParseCssTest,
     AmpAnimateExample_Good_NonAnimationPropertyInAnimation) {
  // The non-animation property (in this case color) is allowed in an
  // animation selector.
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".amp-animate .box { "
      "    color: red; "
      "    transform: rotate(180deg);"
      "    transition: transform 2s;"
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"DELIM","line":1,"col":0,"value":"."},{"tokentype":"IDENT","line":1,"col":1,"value":"amp-animate"},{"tokentype":"WHITESPACE","line":1,"col":12},{"tokentype":"DELIM","line":1,"col":13,"value":"."},{"tokentype":"IDENT","line":1,"col":14,"value":"box"},{"tokentype":"WHITESPACE","line":1,"col":17},{"tokentype":"EOF_TOKEN","line":1,"col":18}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":24,"name":"color","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":30},{"tokentype":"IDENT","line":1,"col":31,"value":"red"},{"tokentype":"EOF_TOKEN","line":1,"col":34}]},{"tokentype":"DECLARATION","line":1,"col":40,"name":"transform","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":50},{"tokentype":"FUNCTION_TOKEN","line":1,"col":51,"value":"rotate"},{"tokentype":"DIMENSION","line":1,"col":58,"repr":"180","type":"integer","unit":"deg","value":180.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":64},{"tokentype":"EOF_TOKEN","line":1,"col":65}]},{"tokentype":"DECLARATION","line":1,"col":70,"name":"transition","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":81},{"tokentype":"IDENT","line":1,"col":82,"value":"transform"},{"tokentype":"WHITESPACE","line":1,"col":91},{"tokentype":"DIMENSION","line":1,"col":92,"repr":"2","type":"integer","unit":"s","value":2.000000},{"tokentype":"EOF_TOKEN","line":1,"col":94}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":96}})");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}

TEST(Amp4AdsParseCssTest,
     AmpAnimateExample_Good_NonAnimationPropertyInAnimation_VendorPrefixed) {
  // The non-animation property (in this case color) is allowed in an
  // animation selector.
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".amp-animate .box { "
      "    color: red; "
      "    -o-transform: rotate(180deg);"
      "    -ms-transition: -webkit-transform 2s;"
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}

TEST(Amp4AdsParseCssTest, AmpAnimateExample_Good_MissingContextClass) {
  // It is no longer an error without .amp-animate.
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".box { "
      "    transform: rotate(180deg); "
      "    transition: transform 2s; "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"DELIM","line":1,"col":0,"value":"."},{"tokentype":"IDENT","line":1,"col":1,"value":"box"},{"tokentype":"WHITESPACE","line":1,"col":4},{"tokentype":"EOF_TOKEN","line":1,"col":5}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":11,"name":"transform","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":21},{"tokentype":"FUNCTION_TOKEN","line":1,"col":22,"value":"rotate"},{"tokentype":"DIMENSION","line":1,"col":29,"repr":"180","type":"integer","unit":"deg","value":180.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":35},{"tokentype":"EOF_TOKEN","line":1,"col":36}]},{"tokentype":"DECLARATION","line":1,"col":42,"name":"transition","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":53},{"tokentype":"IDENT","line":1,"col":54,"value":"transform"},{"tokentype":"WHITESPACE","line":1,"col":63},{"tokentype":"DIMENSION","line":1,"col":64,"repr":"2","type":"integer","unit":"s","value":2.000000},{"tokentype":"EOF_TOKEN","line":1,"col":66}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":69}})");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}

TEST(Amp4AdsParseCssTest,
     AmpAnimateExample_Bad_OnlyOpacityAndTransformMayBeTransitioned) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".amp-animate .box { "
      "    transition: background-color 2s; "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":24,"code":"CSS_SYNTAX_DISALLOWED_PROPERTY_VALUE_WITH_HINT","params":["style","transition","background-color","['opacity', 'transform']"]}])");
}

TEST(Amp4AdsParseCssTest, KeyframesExample_Good) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@keyframes turn { "
      "  from { transform: rotate(180deg); } "
      "  to { transform: rotate(90deg); } "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"AT_RULE","line":1,"col":0,"name":"keyframes","prelude":[{"tokentype":"WHITESPACE","line":1,"col":10},{"tokentype":"IDENT","line":1,"col":11,"value":"turn"},{"tokentype":"WHITESPACE","line":1,"col":15},{"tokentype":"EOF_TOKEN","line":1,"col":16}],"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":20,"prelude":[{"tokentype":"IDENT","line":1,"col":20,"value":"from"},{"tokentype":"WHITESPACE","line":1,"col":24},{"tokentype":"EOF_TOKEN","line":1,"col":25}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":27,"name":"transform","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":37},{"tokentype":"FUNCTION_TOKEN","line":1,"col":38,"value":"rotate"},{"tokentype":"DIMENSION","line":1,"col":45,"repr":"180","type":"integer","unit":"deg","value":180.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":51},{"tokentype":"EOF_TOKEN","line":1,"col":52}]}]},{"tokentype":"QUALIFIED_RULE","line":1,"col":58,"prelude":[{"tokentype":"IDENT","line":1,"col":58,"value":"to"},{"tokentype":"WHITESPACE","line":1,"col":60},{"tokentype":"EOF_TOKEN","line":1,"col":61}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":63,"name":"transform","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":73},{"tokentype":"FUNCTION_TOKEN","line":1,"col":74,"value":"rotate"},{"tokentype":"DIMENSION","line":1,"col":81,"repr":"90","type":"integer","unit":"deg","value":90.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":86},{"tokentype":"EOF_TOKEN","line":1,"col":87}]}]}],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":92}})");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}

TEST(Amp4AdsParseCssTest, KeyframesExample_Good_VendorPrefixed) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@-moz-keyframes turn { "
      "  from { -webkit-transform: rotate(180deg); } "
      "  to { -o-transform: rotate(90deg); } "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}

TEST(Amp4AdsParseCssTest, KeyframesExample_Good_AnimationTimingFunction) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@-moz-keyframes turn { "
      "  from { transform: rotate(180deg); "
      "         animation-timing-function: linear; } "
      "  to { transform: rotate(90deg); } "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
}

TEST(Amp4AdsParseCssTest,
     KeyframesExample_Bad_OnlyOpacityAndTransformMayBeTransitioned) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@keyframes slidein { "
      "  from { margin-left:100%; width:300%; } "
      "  to { margin-left:0%; width:100%; } "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":30,"code":"CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE","params":["style","margin-left","keyframes","['animation-timing-function', 'opacity', 'transform']"]},{"tokentype":"ERROR","line":1,"col":48,"code":"CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE","params":["style","width","keyframes","['animation-timing-function', 'opacity', 'transform']"]},{"tokentype":"ERROR","line":1,"col":69,"code":"CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE","params":["style","margin-left","keyframes","['animation-timing-function', 'opacity', 'transform']"]},{"tokentype":"ERROR","line":1,"col":85,"code":"CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE","params":["style","width","keyframes","['animation-timing-function', 'opacity', 'transform']"]}])");
}

TEST(Amp4AdsParseCssTest,
     KeyframesExample_Bad_OnlyOpacityAndTransformMayBeTransitioned_VendorPfx) {
  std::vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@-moz-keyframes slidein { "
      "  from { margin-left:100%; width:300%; } "
      "  to { margin-left:0%; width:100%; } "
      "}");
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, A4aCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  ValidateAmp4AdsCss(*stylesheet, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":35,"code":"CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE","params":["style","margin-left","-moz-keyframes","['animation-timing-function', 'opacity', 'transform']"]},{"tokentype":"ERROR","line":1,"col":53,"code":"CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE","params":["style","width","-moz-keyframes","['animation-timing-function', 'opacity', 'transform']"]},{"tokentype":"ERROR","line":1,"col":74,"code":"CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE","params":["style","margin-left","-moz-keyframes","['animation-timing-function', 'opacity', 'transform']"]},{"tokentype":"ERROR","line":1,"col":90,"code":"CSS_SYNTAX_PROPERTY_DISALLOWED_WITHIN_AT_RULE","params":["style","width","-moz-keyframes","['animation-timing-function', 'opacity', 'transform']"]}])");
}

}  // namespace
}  // namespace htmlparser::css
