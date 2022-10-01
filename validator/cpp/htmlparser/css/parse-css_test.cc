#include "cpp/htmlparser/css/parse-css.h"

#include <memory>
#include <vector>

#include <gmock/gmock.h>
#include "gtest/gtest.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_join.h"
#include "cpp/htmlparser/css/parse-css.pb.h"
#include "cpp/htmlparser/logging.h"
#include "cpp/htmlparser/strings.h"

using std::unique_ptr;
using std::vector;

// Helper routine for implementing json serialization.
template <class T>
std::string JsonFromList(const vector<unique_ptr<T>>& list) {
  htmlparser::json::JsonArray array;
  for (const auto& element : list) {
    if (element)
      array.Append(element->ToJson());
    else
      array.Append("null");
  }
  return array.ToString();
}

namespace htmlparser::css {
namespace {

TEST(ParseCssTest, StripVendorPrefix) {
  // char*
  EXPECT_EQ("foo", StripVendorPrefix("-moz-foo"));
  EXPECT_EQ("foo", StripVendorPrefix("-ms-foo"));
  EXPECT_EQ("foo", StripVendorPrefix("-o-foo"));
  EXPECT_EQ("foo", StripVendorPrefix("-webkit-foo"));
  EXPECT_EQ("foo", StripVendorPrefix("foo"));
  EXPECT_EQ("webkit", StripVendorPrefix("webkit"));
  EXPECT_EQ("-webkit", StripVendorPrefix("-webkit"));
  EXPECT_EQ("foo-foo", StripVendorPrefix("foo-foo"));
  EXPECT_EQ("-d-foo-foo", StripVendorPrefix("-d-foo-foo"));
  EXPECT_EQ("-foo", StripVendorPrefix("-foo"));

  // std::string.
  std::string param("-moz-foo");
  EXPECT_EQ("foo", StripVendorPrefix(param));

  // std::string_view.
  std::string_view param_std_view("-moz-foo");
  EXPECT_EQ("foo", StripVendorPrefix(param_std_view));

  // absl::string_view
  absl::string_view param_absl_view("-moz-foo");
  EXPECT_EQ("foo", StripVendorPrefix(param_absl_view));

  // Any other type, won't compile.
  // std::vector<std::string> vec;
  // EXPECT_EQ("foo", StripVendorPrefix(vec));
  // EXPECT_EQ("foo", StripVendorPrefix(100));
}

TEST(ParseCssTest, Tokenize_GeneratesTokensForSimpleExample) {
  vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints("foo { bar: baz; }");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"IDENT","line":1,"col":0,"value":"foo"},{"tokentype":"WHITESPACE","line":1,"col":3},{"tokentype":"OPEN_CURLY","line":1,"col":4},{"tokentype":"WHITESPACE","line":1,"col":5},{"tokentype":"IDENT","line":1,"col":6,"value":"bar"},{"tokentype":"COLON","line":1,"col":9},{"tokentype":"WHITESPACE","line":1,"col":10},{"tokentype":"IDENT","line":1,"col":11,"value":"baz"},{"tokentype":"SEMICOLON","line":1,"col":14},{"tokentype":"WHITESPACE","line":1,"col":15},{"tokentype":"CLOSE_CURLY","line":1,"col":16},{"tokentype":"EOF_TOKEN","line":1,"col":17}])");
  EXPECT_EQ(0, errors.size());
  // Also keeps track of positions / offsets for each token into the
  // original css.
  ASSERT_EQ(12, tokens.size());
  EXPECT_EQ(0, tokens[0]->pos());
  EXPECT_EQ(3, tokens[1]->pos());
  EXPECT_EQ(4, tokens[2]->pos());
  EXPECT_EQ(5, tokens[3]->pos());
  EXPECT_EQ(6, tokens[4]->pos());
  EXPECT_EQ(9, tokens[5]->pos());
  EXPECT_EQ(10, tokens[6]->pos());
  EXPECT_EQ(11, tokens[7]->pos());
  EXPECT_EQ(14, tokens[8]->pos());
  EXPECT_EQ(15, tokens[9]->pos());
  EXPECT_EQ(16, tokens[10]->pos());
  EXPECT_EQ(17, tokens[11]->pos());
}

TEST(ParseCssTest, Tokenize_TokenizesWithParseErrors) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(" \"\n \"");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"WHITESPACE","line":1,"col":0},{"tokentype":"WHITESPACE","line":1,"col":2},{"tokentype":"STRING","line":2,"col":1,"value":""},{"tokentype":"EOF_TOKEN","line":2,"col":2}])");

  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":1,"code":"CSS_SYNTAX_UNTERMINATED_STRING","params":["style"]}])");
}

TEST(ParseCssTest, Tokenize_ProvidesErrorsWithLineColOffsets) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "line 1 \"unterminated\n"
      "line 2 \"unterminated\n");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":7,"code":"CSS_SYNTAX_UNTERMINATED_STRING","params":["style"]},{"tokentype":"ERROR","line":2,"col":7,"code":"CSS_SYNTAX_UNTERMINATED_STRING","params":["style"]}])");
  errors.clear();
  tokens = Tokenize(&css, /*line=*/5, /*col=*/5, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":5,"col":12,"code":"CSS_SYNTAX_UNTERMINATED_STRING","params":["style"]},{"tokentype":"ERROR","line":6,"col":7,"code":"CSS_SYNTAX_UNTERMINATED_STRING","params":["style"]}])");
}

TEST(ParseCssTest, Tokenize_DealsWStrayBackslashesUnterminatedCommentsBadUrls) {
  std::string_view inputcss = "a trailing \\\nbackslash";
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(inputcss);
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":11,"code":"CSS_SYNTAX_STRAY_TRAILING_BACKSLASH","params":["style"]}])");
  errors.clear();
  css = htmlparser::Strings::Utf8ToCodepoints("h1 {color: red; } /*");
  tokens = Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":17,"code":"CSS_SYNTAX_UNTERMINATED_COMMENT","params":["style"]}])");
  errors.clear();
  css = htmlparser::Strings::Utf8ToCodepoints("oh hi url(foo\"bar)");
  tokens = Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":6,"code":"CSS_SYNTAX_BAD_URL","params":["style"]}])");
}

CssParsingConfig AmpCssParsingConfig() {
  CssParsingConfig config;
  config.at_rule_spec["font-face"] = BlockType::PARSE_AS_DECLARATIONS;
  config.at_rule_spec["media"] = BlockType::PARSE_AS_RULES;
  config.default_spec = BlockType::PARSE_AS_IGNORE;
  return config;
}

class LogRulePositions : public RuleVisitor {
 public:
  explicit LogRulePositions(std::string* out) : out_(out) {}

  void VisitStylesheet(const Stylesheet& stylesheet) override {
    absl::StrAppend(out_, "Stylesheet pos=", stylesheet.pos(), "\n");
  }

  void LeaveStylesheet(const Stylesheet& stylesheet) override {
    absl::StrAppend(out_, "Leaving Stylesheet pos=", stylesheet.pos(), "\n");
  }

  void VisitAtRule(const AtRule& at_rule) override {
    absl::StrAppend(out_, "AtRule name=", at_rule.name(),
                    " pos=", at_rule.pos(), "\n");
  }

  void LeaveAtRule(const AtRule& at_rule) override {
    absl::StrAppend(out_, "Leaving AtRule name=", at_rule.name(),
                    " pos=", at_rule.pos(), "\n");
  }

  void VisitQualifiedRule(const QualifiedRule& qualified_rule) override {
    absl::StrAppend(out_, "QualifiedRule pos=", qualified_rule.pos(), "\n");
  }

  void LeaveQualifiedRule(const QualifiedRule& qualified_rule) override {
    absl::StrAppend(out_, "Leaving QualifiedRule pos=", qualified_rule.pos(),
                    "\n");
  }

  void VisitDeclaration(const Declaration& declaration) override {
    absl::StrAppend(out_, "Declaration pos=", declaration.pos(), "\n");
  }

  void LeaveDeclaration(const Declaration& declaration) override {
    absl::StrAppend(out_, "Leaving Declaration pos=", declaration.pos(), "\n");
  }

 private:
  std::string* out_;
};

TEST(ParseCssTest, ParseAStylesheet_ParsesRGBValues) {
  vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints("foo { bar: rgb(255, 0, 127); }");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"IDENT","line":1,"col":0,"value":"foo"},{"tokentype":"WHITESPACE","line":1,"col":3},{"tokentype":"EOF_TOKEN","line":1,"col":4}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":6,"name":"bar","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":10},{"tokentype":"FUNCTION_TOKEN","line":1,"col":11,"value":"rgb"},{"tokentype":"NUMBER","line":1,"col":15,"repr":"255","type":"integer","value":255.000000},{"tokentype":"COMMA","line":1,"col":18},{"tokentype":"WHITESPACE","line":1,"col":19},{"tokentype":"NUMBER","line":1,"col":20,"repr":"0","type":"integer","value":0.000000},{"tokentype":"COMMA","line":1,"col":21},{"tokentype":"WHITESPACE","line":1,"col":22},{"tokentype":"NUMBER","line":1,"col":23,"repr":"127","type":"integer","value":127.000000},{"tokentype":"CLOSE_PAREN","line":1,"col":26},{"tokentype":"EOF_TOKEN","line":1,"col":27}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":30}})");

  // Some assertions about the positions of the nodes, which we
  // keep track of as well. This also tests the visitor pattern implementation.
  std::string log;
  LogRulePositions visitor(&log);
  stylesheet->Accept(&visitor);
  EXPECT_EQ(
      "Stylesheet pos=0\n"
      "QualifiedRule pos=0\n"
      "Declaration pos=6\n"
      "Leaving Declaration pos=6\n"
      "Leaving QualifiedRule pos=0\n"
      "Leaving Stylesheet pos=0\n",
      log);
}

TEST(ParseCssTest, ParseAStylesheet_ParsesAHashReference) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints("#foo {}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"HASH","line":1,"col":0,"value":"foo","type":"id"},{"tokentype":"WHITESPACE","line":1,"col":4},{"tokentype":"EOF_TOKEN","line":1,"col":5}],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":7}})");
}

TEST(ParseCssTest, ParseAStylesheet_ParsesAnAtMediaRule) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints("@media {}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"AT_RULE","line":1,"col":0,"name":"media","prelude":[{"tokentype":"WHITESPACE","line":1,"col":6},{"tokentype":"EOF_TOKEN","line":1,"col":7}],"rules":[],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":9}})");
  EXPECT_EQ(0, errors.size());
}

TEST(ParseCssTest, ParseAStylesheet_ParsesNestedMediaRulesAndDeclarations) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "h1 { color: red; }\n"
      "@media print {\n"
      "  @media print {\n"
      "    h2.bar { size: 4px; }\n"
      "  }\n"
      "}\n"
      "@font-face {\n"
      "  font-family: 'MyFont';\n"
      "  src: url('foo.ttf');\n"
      "}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"IDENT","line":1,"col":0,"value":"h1"},{"tokentype":"WHITESPACE","line":1,"col":2},{"tokentype":"OPEN_CURLY","line":1,"col":3},{"tokentype":"WHITESPACE","line":1,"col":4},{"tokentype":"IDENT","line":1,"col":5,"value":"color"},{"tokentype":"COLON","line":1,"col":10},{"tokentype":"WHITESPACE","line":1,"col":11},{"tokentype":"IDENT","line":1,"col":12,"value":"red"},{"tokentype":"SEMICOLON","line":1,"col":15},{"tokentype":"WHITESPACE","line":1,"col":16},{"tokentype":"CLOSE_CURLY","line":1,"col":17},{"tokentype":"WHITESPACE","line":1,"col":18},{"tokentype":"AT_KEYWORD","line":2,"col":0,"value":"media"},{"tokentype":"WHITESPACE","line":2,"col":6},{"tokentype":"IDENT","line":2,"col":7,"value":"print"},{"tokentype":"WHITESPACE","line":2,"col":12},{"tokentype":"OPEN_CURLY","line":2,"col":13},{"tokentype":"WHITESPACE","line":2,"col":14},{"tokentype":"AT_KEYWORD","line":3,"col":2,"value":"media"},{"tokentype":"WHITESPACE","line":3,"col":8},{"tokentype":"IDENT","line":3,"col":9,"value":"print"},{"tokentype":"WHITESPACE","line":3,"col":14},{"tokentype":"OPEN_CURLY","line":3,"col":15},{"tokentype":"WHITESPACE","line":3,"col":16},{"tokentype":"IDENT","line":4,"col":4,"value":"h2"},{"tokentype":"DELIM","line":4,"col":6,"value":"."},{"tokentype":"IDENT","line":4,"col":7,"value":"bar"},{"tokentype":"WHITESPACE","line":4,"col":10},{"tokentype":"OPEN_CURLY","line":4,"col":11},{"tokentype":"WHITESPACE","line":4,"col":12},{"tokentype":"IDENT","line":4,"col":13,"value":"size"},{"tokentype":"COLON","line":4,"col":17},{"tokentype":"WHITESPACE","line":4,"col":18},{"tokentype":"DIMENSION","line":4,"col":19,"repr":"4","type":"integer","unit":"px","value":4.000000},{"tokentype":"SEMICOLON","line":4,"col":22},{"tokentype":"WHITESPACE","line":4,"col":23},{"tokentype":"CLOSE_CURLY","line":4,"col":24},{"tokentype":"WHITESPACE","line":4,"col":25},{"tokentype":"CLOSE_CURLY","line":5,"col":2},{"tokentype":"WHITESPACE","line":5,"col":3},{"tokentype":"CLOSE_CURLY","line":6,"col":0},{"tokentype":"WHITESPACE","line":6,"col":1},{"tokentype":"AT_KEYWORD","line":7,"col":0,"value":"font-face"},{"tokentype":"WHITESPACE","line":7,"col":10},{"tokentype":"OPEN_CURLY","line":7,"col":11},{"tokentype":"WHITESPACE","line":7,"col":12},{"tokentype":"IDENT","line":8,"col":2,"value":"font-family"},{"tokentype":"COLON","line":8,"col":13},{"tokentype":"WHITESPACE","line":8,"col":14},{"tokentype":"STRING","line":8,"col":15,"value":"MyFont"},{"tokentype":"SEMICOLON","line":8,"col":23},{"tokentype":"WHITESPACE","line":8,"col":24},{"tokentype":"IDENT","line":9,"col":2,"value":"src"},{"tokentype":"COLON","line":9,"col":5},{"tokentype":"WHITESPACE","line":9,"col":6},{"tokentype":"FUNCTION_TOKEN","line":9,"col":7,"value":"url"},{"tokentype":"STRING","line":9,"col":11,"value":"foo.ttf"},{"tokentype":"CLOSE_PAREN","line":9,"col":20},{"tokentype":"SEMICOLON","line":9,"col":21},{"tokentype":"WHITESPACE","line":9,"col":22},{"tokentype":"CLOSE_CURLY","line":10,"col":0},{"tokentype":"EOF_TOKEN","line":10,"col":1}])");
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"IDENT","line":1,"col":0,"value":"h1"},{"tokentype":"WHITESPACE","line":1,"col":2},{"tokentype":"EOF_TOKEN","line":1,"col":3}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":5,"name":"color","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":11},{"tokentype":"IDENT","line":1,"col":12,"value":"red"},{"tokentype":"EOF_TOKEN","line":1,"col":15}]}]},{"tokentype":"AT_RULE","line":2,"col":0,"name":"media","prelude":[{"tokentype":"WHITESPACE","line":2,"col":6},{"tokentype":"IDENT","line":2,"col":7,"value":"print"},{"tokentype":"WHITESPACE","line":2,"col":12},{"tokentype":"EOF_TOKEN","line":2,"col":13}],"rules":[{"tokentype":"AT_RULE","line":3,"col":2,"name":"media","prelude":[{"tokentype":"WHITESPACE","line":3,"col":8},{"tokentype":"IDENT","line":3,"col":9,"value":"print"},{"tokentype":"WHITESPACE","line":3,"col":14},{"tokentype":"EOF_TOKEN","line":3,"col":15}],"rules":[{"tokentype":"QUALIFIED_RULE","line":4,"col":4,"prelude":[{"tokentype":"IDENT","line":4,"col":4,"value":"h2"},{"tokentype":"DELIM","line":4,"col":6,"value":"."},{"tokentype":"IDENT","line":4,"col":7,"value":"bar"},{"tokentype":"WHITESPACE","line":4,"col":10},{"tokentype":"EOF_TOKEN","line":4,"col":11}],"declarations":[{"tokentype":"DECLARATION","line":4,"col":13,"name":"size","important":false,"value":[{"tokentype":"WHITESPACE","line":4,"col":18},{"tokentype":"DIMENSION","line":4,"col":19,"repr":"4","type":"integer","unit":"px","value":4.000000},{"tokentype":"EOF_TOKEN","line":4,"col":22}]}]}],"declarations":[]}],"declarations":[]},{"tokentype":"AT_RULE","line":7,"col":0,"name":"font-face","prelude":[{"tokentype":"WHITESPACE","line":7,"col":10},{"tokentype":"EOF_TOKEN","line":7,"col":11}],"rules":[],"declarations":[{"tokentype":"DECLARATION","line":8,"col":2,"name":"font-family","important":false,"value":[{"tokentype":"WHITESPACE","line":8,"col":14},{"tokentype":"STRING","line":8,"col":15,"value":"MyFont"},{"tokentype":"EOF_TOKEN","line":8,"col":23}]},{"tokentype":"DECLARATION","line":9,"col":2,"name":"src","important":false,"value":[{"tokentype":"WHITESPACE","line":9,"col":6},{"tokentype":"FUNCTION_TOKEN","line":9,"col":7,"value":"url"},{"tokentype":"STRING","line":9,"col":11,"value":"foo.ttf"},{"tokentype":"CLOSE_PAREN","line":9,"col":20},{"tokentype":"EOF_TOKEN","line":9,"col":21}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":10,"col":1}})");
  EXPECT_EQ(0, errors.size());
}

TEST(ParseCssTest, ParseAStylesheet_GeneratesErrorsNotAssertionsForInvalidCss) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "#foo { foo.bar {} }\n"       // qual. rule inside declarations
      "@font-face { @media {} }\n"  // @rule inside declarations
      "@media { @gregable }\n"      // unrecognized @rule, ignored
      "color: red;\n");             // declaration outside qualified rule.
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":7,"code":"CSS_SYNTAX_INCOMPLETE_DECLARATION","params":["style"]},{"tokentype":"ERROR","line":2,"col":13,"code":"CSS_SYNTAX_INVALID_AT_RULE","params":["style","media"]},{"tokentype":"ERROR","line":4,"col":0,"code":"CSS_SYNTAX_EOF_IN_PRELUDE_OF_QUALIFIED_RULE","params":["style"]}])");
}

TEST(ParseCssTest, ParseAStylesheet_GeneratesErrorsBasedOnTheGrammar) {
  // @gregable is not supported by the grammar.
  vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints("@gregable {}\n.foo{prop}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":2,"col":5,"code":"CSS_SYNTAX_INCOMPLETE_DECLARATION","params":["style"]}])");
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"AT_RULE","line":1,"col":0,"name":"gregable","prelude":[{"tokentype":"WHITESPACE","line":1,"col":9},{"tokentype":"EOF_TOKEN","line":1,"col":10}],"rules":[],"declarations":[]},{"tokentype":"QUALIFIED_RULE","line":2,"col":0,"prelude":[{"tokentype":"DELIM","line":2,"col":0,"value":"."},{"tokentype":"IDENT","line":2,"col":1,"value":"foo"},{"tokentype":"EOF_TOKEN","line":2,"col":4}],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":2,"col":10}})");
}

TEST(ParseCssTest, ParseAStylesheet_HandlesANestedMediaRuleWithDeclarations) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@media print {\n"
      "/* hide navigation controls when printing */\n"
      "#navigation { display: none }\n"
      "@media (max-width: 12cm) {\n"
      "  /* keep notes in flow when printing to narrow pages */\n"
      "  .note { float: none }\n"
      "}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"AT_RULE","line":1,"col":0,"name":"media","prelude":[{"tokentype":"WHITESPACE","line":1,"col":6},{"tokentype":"IDENT","line":1,"col":7,"value":"print"},{"tokentype":"WHITESPACE","line":1,"col":12},{"tokentype":"EOF_TOKEN","line":1,"col":13}],"rules":[{"tokentype":"QUALIFIED_RULE","line":3,"col":0,"prelude":[{"tokentype":"HASH","line":3,"col":0,"value":"navigation","type":"id"},{"tokentype":"WHITESPACE","line":3,"col":11},{"tokentype":"EOF_TOKEN","line":3,"col":12}],"declarations":[{"tokentype":"DECLARATION","line":3,"col":14,"name":"display","important":false,"value":[{"tokentype":"WHITESPACE","line":3,"col":22},{"tokentype":"IDENT","line":3,"col":23,"value":"none"},{"tokentype":"WHITESPACE","line":3,"col":27},{"tokentype":"EOF_TOKEN","line":3,"col":28}]}]},{"tokentype":"AT_RULE","line":4,"col":0,"name":"media","prelude":[{"tokentype":"WHITESPACE","line":4,"col":6},{"tokentype":"OPEN_PAREN","line":4,"col":7},{"tokentype":"IDENT","line":4,"col":8,"value":"max-width"},{"tokentype":"COLON","line":4,"col":17},{"tokentype":"WHITESPACE","line":4,"col":18},{"tokentype":"DIMENSION","line":4,"col":19,"repr":"12","type":"integer","unit":"cm","value":12.000000},{"tokentype":"CLOSE_PAREN","line":4,"col":23},{"tokentype":"WHITESPACE","line":4,"col":24},{"tokentype":"EOF_TOKEN","line":4,"col":25}],"rules":[{"tokentype":"QUALIFIED_RULE","line":6,"col":2,"prelude":[{"tokentype":"DELIM","line":6,"col":2,"value":"."},{"tokentype":"IDENT","line":6,"col":3,"value":"note"},{"tokentype":"WHITESPACE","line":6,"col":7},{"tokentype":"EOF_TOKEN","line":6,"col":8}],"declarations":[{"tokentype":"DECLARATION","line":6,"col":10,"name":"float","important":false,"value":[{"tokentype":"WHITESPACE","line":6,"col":16},{"tokentype":"IDENT","line":6,"col":17,"value":"none"},{"tokentype":"WHITESPACE","line":6,"col":21},{"tokentype":"EOF_TOKEN","line":6,"col":22}]}]}],"declarations":[]}],"declarations":[]}],"eof":{"tokentype":"EOF_TOKEN","line":7,"col":1}})");
  EXPECT_EQ(0, errors.size());
}

TEST(ParseCssTest,
     ParseAStylesheet_HandlesSelectorsButDoesNotParseThemInDetailYet) {
  vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints(" h1 { color: blue; } ");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":1,"prelude":[{"tokentype":"IDENT","line":1,"col":1,"value":"h1"},{"tokentype":"WHITESPACE","line":1,"col":3},{"tokentype":"EOF_TOKEN","line":1,"col":4}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":6,"name":"color","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":12},{"tokentype":"IDENT","line":1,"col":13,"value":"blue"},{"tokentype":"EOF_TOKEN","line":1,"col":17}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":21}})");
  EXPECT_EQ(0, errors.size());
}

TEST(ParseCssTest, GnarlyNestingDoesNotCrash) {
  // The input is  "a {{{{{{{{{{{{" with a lot more {'s.
  std::string gnarly = "a ";
  for (int i = 0; i < 50000; ++i) gnarly += '{';

  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(gnarly);
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  // At the time of implementing this test, it produced 1,923 errors.
  // Essentially it reaches a maximum stack depth, unrolls, then descends again.
  // This is a pathological case, we don't care much what the errors look like
  // as long as a) there is at least one error and b) it doesn't crash.
  EXPECT_GT(errors.size(), 1);
}

// This test verifies that a declaration ending in `!important` is treated by
// parsing out the `!important` marker and setting that as a special value in
// the declaration. In particular, we are looking for:
// 1) rules[0].declarations[0].important is true.
// 2) rules[0].declarations[0].value does not contain the tokens corresponding
//    to `!important`.
TEST(ParseCssTest, Important) {
  vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints("b { color:red !important }");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"IDENT","line":1,"col":0,"value":"b"},{"tokentype":"WHITESPACE","line":1,"col":1},{"tokentype":"EOF_TOKEN","line":1,"col":2}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":4,"name":"color","important":true,"value":[{"tokentype":"IDENT","line":1,"col":10,"value":"red"},{"tokentype":"WHITESPACE","line":1,"col":13},{"tokentype":"EOF_TOKEN","line":1,"col":25}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":26}})");
}

TEST(ParseCssTest, ParseAStyleSheet_ImagesAndFonts) {
  // This example is lifted from pcu_request_flow_test.cc; it snapshots
  // our view of a CSS stylesheet with urls for images and fonts.
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".a { color:red; background-image:url(4.png) }"
      ".b { color:black; background-image:url('http://a.com/b.png') } "
      "@font-face {font-family: 'Medium';src: url('http://a.com/1.woff') "
      "format('woff'),url('http://b.com/1.ttf') format('truetype'),"
      "src:url('') format('embedded-opentype');}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(stylesheet->ToJson().ToString(), R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"DELIM","line":1,"col":0,"value":"."},{"tokentype":"IDENT","line":1,"col":1,"value":"a"},{"tokentype":"WHITESPACE","line":1,"col":2},{"tokentype":"EOF_TOKEN","line":1,"col":3}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":5,"name":"color","important":false,"value":[{"tokentype":"IDENT","line":1,"col":11,"value":"red"},{"tokentype":"EOF_TOKEN","line":1,"col":14}]},{"tokentype":"DECLARATION","line":1,"col":16,"name":"background-image","important":false,"value":[{"tokentype":"URL","line":1,"col":33,"value":"4.png"},{"tokentype":"WHITESPACE","line":1,"col":43},{"tokentype":"EOF_TOKEN","line":1,"col":44}]}]},{"tokentype":"QUALIFIED_RULE","line":1,"col":45,"prelude":[{"tokentype":"DELIM","line":1,"col":45,"value":"."},{"tokentype":"IDENT","line":1,"col":46,"value":"b"},{"tokentype":"WHITESPACE","line":1,"col":47},{"tokentype":"EOF_TOKEN","line":1,"col":48}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":50,"name":"color","important":false,"value":[{"tokentype":"IDENT","line":1,"col":56,"value":"black"},{"tokentype":"EOF_TOKEN","line":1,"col":61}]},{"tokentype":"DECLARATION","line":1,"col":63,"name":"background-image","important":false,"value":[{"tokentype":"FUNCTION_TOKEN","line":1,"col":80,"value":"url"},{"tokentype":"STRING","line":1,"col":84,"value":"http://a.com/b.png"},{"tokentype":"CLOSE_PAREN","line":1,"col":104},{"tokentype":"WHITESPACE","line":1,"col":105},{"tokentype":"EOF_TOKEN","line":1,"col":106}]}]},{"tokentype":"AT_RULE","line":1,"col":108,"name":"font-face","prelude":[{"tokentype":"WHITESPACE","line":1,"col":118},{"tokentype":"EOF_TOKEN","line":1,"col":119}],"rules":[],"declarations":[{"tokentype":"DECLARATION","line":1,"col":120,"name":"font-family","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":132},{"tokentype":"STRING","line":1,"col":133,"value":"Medium"},{"tokentype":"EOF_TOKEN","line":1,"col":141}]},{"tokentype":"DECLARATION","line":1,"col":142,"name":"src","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":146},{"tokentype":"FUNCTION_TOKEN","line":1,"col":147,"value":"url"},{"tokentype":"STRING","line":1,"col":151,"value":"http://a.com/1.woff"},{"tokentype":"CLOSE_PAREN","line":1,"col":172},{"tokentype":"WHITESPACE","line":1,"col":173},{"tokentype":"FUNCTION_TOKEN","line":1,"col":174,"value":"format"},{"tokentype":"STRING","line":1,"col":181,"value":"woff"},{"tokentype":"CLOSE_PAREN","line":1,"col":187},{"tokentype":"COMMA","line":1,"col":188},{"tokentype":"FUNCTION_TOKEN","line":1,"col":189,"value":"url"},{"tokentype":"STRING","line":1,"col":193,"value":"http://b.com/1.ttf"},{"tokentype":"CLOSE_PAREN","line":1,"col":213},{"tokentype":"WHITESPACE","line":1,"col":214},{"tokentype":"FUNCTION_TOKEN","line":1,"col":215,"value":"format"},{"tokentype":"STRING","line":1,"col":222,"value":"truetype"},{"tokentype":"CLOSE_PAREN","line":1,"col":232},{"tokentype":"COMMA","line":1,"col":233},{"tokentype":"IDENT","line":1,"col":234,"value":"src"},{"tokentype":"COLON","line":1,"col":237},{"tokentype":"FUNCTION_TOKEN","line":1,"col":238,"value":"url"},{"tokentype":"STRING","line":1,"col":242,"value":""},{"tokentype":"CLOSE_PAREN","line":1,"col":244},{"tokentype":"WHITESPACE","line":1,"col":245},{"tokentype":"FUNCTION_TOKEN","line":1,"col":246,"value":"format"},{"tokentype":"STRING","line":1,"col":253,"value":"embedded-opentype"},{"tokentype":"CLOSE_PAREN","line":1,"col":272},{"tokentype":"EOF_TOKEN","line":1,"col":273}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":275}})");
  EXPECT_EQ(0, errors.size());
}

TEST(ParseCssTest, ParseAStyleSheet_NastyEscaping) {
  // This particular example triggered a crash bug when calling
  // TokenStream::Release while being past the end of the stream (now fixed).
  // Note that the URL function in the stylesheet in this test is not correct;
  // after the string http://esc.com/'\\ there are some stray tokens. This is
  // difficult to read in the C++ source due to the double escaping, but the
  // parser deals with it OK.
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".a { background-image:url(\"http://esc.com/'\\\\\"/c.png\") } ");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(R"({"tokentype":"STYLESHEET","line":1,"col":0,"rules":[{"tokentype":"QUALIFIED_RULE","line":1,"col":0,"prelude":[{"tokentype":"DELIM","line":1,"col":0,"value":"."},{"tokentype":"IDENT","line":1,"col":1,"value":"a"},{"tokentype":"WHITESPACE","line":1,"col":2},{"tokentype":"EOF_TOKEN","line":1,"col":3}],"declarations":[{"tokentype":"DECLARATION","line":1,"col":5,"name":"background-image","important":false,"value":[{"tokentype":"FUNCTION_TOKEN","line":1,"col":22,"value":"url"},{"tokentype":"STRING","line":1,"col":26,"value":"http://esc.com/'\"},{"tokentype":"DELIM","line":1,"col":46,"value":"/"},{"tokentype":"IDENT","line":1,"col":47,"value":"c"},{"tokentype":"DELIM","line":1,"col":48,"value":"."},{"tokentype":"IDENT","line":1,"col":49,"value":"png"},{"tokentype":"STRING","line":1,"col":52,"value":") } "},{"tokentype":"EOF_TOKEN","line":1,"col":57},{"tokentype":"EOF_TOKEN","line":1,"col":57}]}]}],"eof":{"tokentype":"EOF_TOKEN","line":1,"col":57}})",
            stylesheet->ToJson().ToString());
}

// Tests that font urls are parsed with font-face atRuleScope.
TEST(ParseCssTest, ExtractUrls_FindsFontInFontFace) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@font-face {font-family: 'Foo'; src: url('http://foo.com/bar.ttf');}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  vector<unique_ptr<ParsedCssUrl>> parsed_urls;
  ExtractUrls(*stylesheet, &parsed_urls, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(JsonFromList(parsed_urls), R"([{"tokentype":"PARSED_CSS_URL","line":1,"col":37,"endPos":66,"utf8Url":"http://foo.com/bar.ttf","atRuleScope":"font-face"}])");
}

// Tests that image URLs are parsed with empty atRuleScope; also tests
// that unicode escapes (in this case \000026) within the URL are decoded.
TEST(ParseCssTest, ExtractUrls_SupportsImageUrlWithUnicode) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "body{background-image: url('http://a.com/b/c=d\\000026e=f_g*h');}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  vector<unique_ptr<ParsedCssUrl>> parsed_urls;
  ExtractUrls(*stylesheet, &parsed_urls, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(JsonFromList(parsed_urls), R"([{"tokentype":"PARSED_CSS_URL","line":1,"col":23,"endPos":62,"utf8Url":"http://a.com/b/c=d&e=f_g*h","atRuleScope":""}])");
}

// This example is taken from pcu_request_flow_test.cc and contains both
// image urls, other urls (fonts) and segments in between which
// show the need to emit byte segments and after the url segments.
TEST(ParseCssTest, ExtractUrls_LongerExample) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".a { color:red; background-image:url(4.png) }"
      ".b { color:black; background-image:url('http://a.com/b.png') } "
      "@font-face {font-family: 'Medium';src: url('http://a.com/1.woff') "
      "format('woff'),url('http://b.com/1.ttf') format('truetype'),"
      "src:url('') format('embedded-opentype');}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  vector<unique_ptr<ParsedCssUrl>> parsed_urls;
  ExtractUrls(*stylesheet, &parsed_urls, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(JsonFromList(parsed_urls), R"([{"tokentype":"PARSED_CSS_URL","line":1,"col":33,"endPos":43,"utf8Url":"4.png","atRuleScope":""},{"tokentype":"PARSED_CSS_URL","line":1,"col":80,"endPos":105,"utf8Url":"http://a.com/b.png","atRuleScope":""},{"tokentype":"PARSED_CSS_URL","line":1,"col":147,"endPos":173,"utf8Url":"http://a.com/1.woff","atRuleScope":"font-face"},{"tokentype":"PARSED_CSS_URL","line":1,"col":189,"endPos":214,"utf8Url":"http://b.com/1.ttf","atRuleScope":"font-face"},{"tokentype":"PARSED_CSS_URL","line":1,"col":238,"endPos":245,"utf8Url":"","atRuleScope":"font-face"}])");
}

// Windows newlines present extra challenges for position information.
TEST(ParseCssTest, ExtractUrls_WithWindowsNewlines) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      ".a \r\n{ color:red; background-image:url(4.png) }\r\n"
      ".b { color:black; \r\nbackground-image:url('http://a.com/b.png') }");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  vector<unique_ptr<ParsedCssUrl>> parsed_urls;
  ExtractUrls(*stylesheet, &parsed_urls, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(JsonFromList(parsed_urls), R"([{"tokentype":"PARSED_CSS_URL","line":2,"col":30,"endPos":44,"utf8Url":"4.png","atRuleScope":""},{"tokentype":"PARSED_CSS_URL","line":4,"col":17,"endPos":108,"utf8Url":"http://a.com/b.png","atRuleScope":""}])");
}

// This example parses as CSS without errors, however once the URL
// with parameters is extracted, we recognize that the arguments to
// the url function are invalid. See also http://b/27327161.
TEST(ParseCssTest, ExtractUrls_InvalidArgumentsInsideUrlFunctionYieldsError) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(R""(
    @font-face {
      font-family: 'Roboto', sans-serif;
      src: url('<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700' rel='stylesheet' type='text/css'>');
    }
  )"");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  vector<unique_ptr<ParsedCssUrl>> parsed_urls;
  ExtractUrls(*stylesheet, &parsed_urls, &errors);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":4,"col":11,"code":"CSS_SYNTAX_BAD_URL","params":["style"]}])");
  EXPECT_EQ(JsonFromList(parsed_urls), "[]");
}

TEST(ParseCssTest, ParseMediaQueries_SemicolonTerminatedQuery) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints("@media ;");
  vector<unique_ptr<ErrorToken>> parse_errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &parse_errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &parse_errors);
  EXPECT_EQ(JsonFromList(parse_errors), "[]");

  std::vector<unique_ptr<ErrorToken>> media_errors;
  std::vector<unique_ptr<Token>> media_types, media_features;
  ParseMediaQueries(*stylesheet, &media_types, &media_features, &media_errors);
  EXPECT_EQ(media_errors.size(), 0);
}

TEST(ParseCssTest, ParseMediaQueries_IncludesFunction) {
  // https://github.com/ampproject/amphtml/issues/35793
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "@media (min-width: calc(840px - 48px));");
  vector<unique_ptr<ErrorToken>> parse_errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &parse_errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &parse_errors);
  EXPECT_EQ(JsonFromList(parse_errors), "[]");

  std::vector<unique_ptr<ErrorToken>> media_errors;
  std::vector<unique_ptr<Token>> media_types, media_features;
  ParseMediaQueries(*stylesheet, &media_types, &media_features, &media_errors);
  EXPECT_EQ(media_errors.size(), 0);
}

unique_ptr<Stylesheet> MediaQueryStyleSheet(const std::string& media_query) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      absl::StrCat("@media ", media_query, " {}"));
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  return stylesheet;
}

TEST(ParseCssTest, ParseMediaQueries_TestErrorPosition) {
  std::vector<unique_ptr<ErrorToken>> errors;
  std::vector<unique_ptr<Token>> media_types, media_features;
  ParseMediaQueries(*MediaQueryStyleSheet("screen,"), &media_types,
                    &media_features, &errors);
  EXPECT_EQ(errors.size(), 1);
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":0,"code":"CSS_SYNTAX_MALFORMED_MEDIA_QUERY","params":["style"]}])");
}

TEST(ParseCssTest, ParseMediaQueries_ErrorParseCases) {
  vector<std::string> error_cases = {
      "screen, ",
      "screen and",
      "screen (",
      "((min-width:500px)",
      "(min-width:500px))",
      "((min-width:500px))",
      "not only screen and (color)",
      "(example, all), speech",
      "&test, screen",
      "all and(color)",
  };
  for (const std::string& error_case : error_cases) {
    std::vector<unique_ptr<ErrorToken>> errors;
    std::vector<unique_ptr<Token>> media_types, media_features;
    ParseMediaQueries(*MediaQueryStyleSheet(error_case), &media_types,
                      &media_features, &errors);
    EXPECT_EQ(errors.size(), 1) << error_case;
  }
}

TEST(ParseCssTest, ParseMediaQueries_SuccessfulParseCases) {
  vector<std::string> cases = {
      "screen, braille, hologram, greetingcard",
      "screen and (color), projection and (color)",
      "all and (min-width:500px)",
      "all and (min-width: 500px)",
      "(min-width:500px)",
      "not screen and (color)",
      "only screen and (color)",
      "NOT screen AND (color)",
      "screen \t \n , \t \n braille",
  };
  for (const std::string& testcase : cases) {
    std::vector<unique_ptr<ErrorToken>> errors;
    std::vector<unique_ptr<Token>> media_types, media_features;
    ParseMediaQueries(*MediaQueryStyleSheet(testcase), &media_types,
                      &media_features, &errors);
    EXPECT_EQ(errors.size(), 0) << testcase;
  }
}

TEST(ParseCssTest, ParseMediaQueries_ExtractsTypesAndFeatures) {
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> media_types, media_features;
  ParseMediaQueries(*MediaQueryStyleSheet("screen and (color)"), &media_types,
                    &media_features, &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(JsonFromList(media_types), R"([{"tokentype":"IDENT","line":1,"col":7,"value":"screen"}])");
  EXPECT_EQ(JsonFromList(media_features), R"([{"tokentype":"IDENT","line":1,"col":19,"value":"color"}])");
}

TEST(ParseCssTest, ParseMediaQueries_ExtractsTypesAndFeaturesCases) {
  vector<vector<std::string>> cases = {
      // Query,              Types,    Features
      {"screen and (color)", "screen", "color"},
      {"screen and (color), braille", "screen,braille", "color"},
      {"screen and (min-width: 50px) and (max-width:51px)", "screen",
       "min-width,max-width"},
      {"(color) and (max-width:abc)", "", "color,max-width"},
      {"only screen", "screen", ""},
      {"not screen", "screen", ""},
      {"screen, not braille", "screen,braille", ""},
      {"SCREEN AND (COLOR)", "SCREEN", "COLOR"},
  };
  for (const vector<std::string>& testcase : cases) {
    ASSERT_EQ(3, testcase.size());
    std::string query = testcase[0];
    std::string expected_types = testcase[1];
    std::string expected_features = testcase[2];

    std::vector<unique_ptr<ErrorToken>> errors;
    std::vector<unique_ptr<Token>> media_types, media_features;
    ParseMediaQueries(*MediaQueryStyleSheet(query), &media_types,
                      &media_features, &errors);
    EXPECT_EQ(errors.size(), 0) << query;

    std::string seen_types, seen_features;
    for (const unique_ptr<Token>& type_token : media_types) {
      if (!seen_types.empty()) absl::StrAppend(&seen_types, ",");
      absl::StrAppend(&seen_types, type_token->StringValue());
    }
    EXPECT_EQ(expected_types, seen_types) << query;
    for (const unique_ptr<Token>& feature_token : media_features) {
      if (!seen_features.empty()) absl::StrAppend(&seen_features, ",");
      absl::StrAppend(&seen_features, feature_token->StringValue());
    }
    EXPECT_EQ(expected_features, seen_features) << query;
  }
}

TEST(ParseCssTest, ParseInlineStyle_EmptySuccessful) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints("");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  vector<unique_ptr<Declaration>> declarations =
      ParseInlineStyle(&tokens, &errors);
  EXPECT_EQ(0, errors.size());
  EXPECT_EQ(JsonFromList(declarations), "[]");
}

TEST(ParseCssTest, ParseInlineStyle_Successful) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(
      "display: block;"
      "lemur:;"
      "animation:-amp-start 8s steps(1,end) 0s 1 normal both;");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  vector<unique_ptr<Declaration>> declarations =
      ParseInlineStyle(&tokens, &errors);
  EXPECT_EQ(0, errors.size());
  EXPECT_EQ(JsonFromList(declarations), R"([{"tokentype":"DECLARATION","line":1,"col":0,"name":"display","important":false,"value":[{"tokentype":"WHITESPACE","line":1,"col":8},{"tokentype":"IDENT","line":1,"col":9,"value":"block"},{"tokentype":"EOF_TOKEN","line":1,"col":14}]},{"tokentype":"DECLARATION","line":1,"col":15,"name":"lemur","important":false,"value":[{"tokentype":"EOF_TOKEN","line":1,"col":21}]},{"tokentype":"DECLARATION","line":1,"col":22,"name":"animation","important":false,"value":[{"tokentype":"IDENT","line":1,"col":32,"value":"-amp-start"},{"tokentype":"WHITESPACE","line":1,"col":42},{"tokentype":"DIMENSION","line":1,"col":43,"repr":"8","type":"integer","unit":"s","value":8.000000},{"tokentype":"WHITESPACE","line":1,"col":45},{"tokentype":"FUNCTION_TOKEN","line":1,"col":46,"value":"steps"},{"tokentype":"NUMBER","line":1,"col":52,"repr":"1","type":"integer","value":1.000000},{"tokentype":"COMMA","line":1,"col":53},{"tokentype":"IDENT","line":1,"col":54,"value":"end"},{"tokentype":"CLOSE_PAREN","line":1,"col":57},{"tokentype":"WHITESPACE","line":1,"col":58},{"tokentype":"DIMENSION","line":1,"col":59,"repr":"0","type":"integer","unit":"s","value":0.000000},{"tokentype":"WHITESPACE","line":1,"col":61},{"tokentype":"NUMBER","line":1,"col":62,"repr":"1","type":"integer","value":1.000000},{"tokentype":"WHITESPACE","line":1,"col":63},{"tokentype":"IDENT","line":1,"col":64,"value":"normal"},{"tokentype":"WHITESPACE","line":1,"col":70},{"tokentype":"IDENT","line":1,"col":71,"value":"both"},{"tokentype":"EOF_TOKEN","line":1,"col":75}]}])");
}

TEST(ParseCssTest, ParseInlineStyle_GeneratesInvalidAtRuleError) {
  vector<std::string> testcases = {
      "@font-face",
      "@media",
      "@lemur",
  };
  for (const std::string& testcase : testcases) {
    vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(testcase);
    vector<unique_ptr<ErrorToken>> errors;
    vector<unique_ptr<Token>> tokens =
        Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
    vector<unique_ptr<Declaration>> declarations =
        ParseInlineStyle(&tokens, &errors);
    EXPECT_EQ(1, errors.size()) << testcase;
  }
}

TEST(ParseCssTest, ParseInlineStyle_GeneratesIncompleteDeclarationError) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints("lemur");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  vector<unique_ptr<Declaration>> declarations =
      ParseInlineStyle(&tokens, &errors);
  EXPECT_EQ(1, errors.size());
  EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":0,"code":"CSS_SYNTAX_INCOMPLETE_DECLARATION","params":["style"]}])");
}

TEST(ParseCssTest, ParseInlineStyle_GeneratesInvalidDeclarationError) {
  vector<std::string> testcases = {
      "{}", ":b;", "<!--", "<!--f:b;", "-->f:b;",
  };
  for (const std::string& testcase : testcases) {
    vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(testcase);
    vector<unique_ptr<ErrorToken>> errors;
    vector<unique_ptr<Token>> tokens =
        Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
    vector<unique_ptr<Declaration>> declarations =
        ParseInlineStyle(&tokens, &errors);
    EXPECT_EQ(1, errors.size()) << testcase;
    EXPECT_EQ(JsonFromList(errors), R"([{"tokentype":"ERROR","line":1,"col":0,"code":"CSS_SYNTAX_INVALID_DECLARATION","params":["style"]}])") << testcase;
  }
}

vector<unique_ptr<Token>> ParseSelectorForTest(const std::string& selector) {
  vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints(absl::StrCat(selector, "{}"));
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> sheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  EXPECT_EQ(1, sheet->rules().size());
  Rule* rule = (*sheet->mutable_rules()).front().get();
  CHECK(TokenType::QUALIFIED_RULE == rule->Type());
  QualifiedRule* qualified = static_cast<QualifiedRule*>(rule);
  vector<unique_ptr<Token>> selector_tokens;
  qualified->mutable_prelude()->swap(selector_tokens);
  return selector_tokens;
}

//
// Below this line: unittests for selector parsing.
//
TEST(ParseCssTest, ParseATypeSelector) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest("*");
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"DELIM","line":1,"col":0,"value":"*"},{"tokentype":"EOF_TOKEN","line":1,"col":1}])");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  unique_ptr<TypeSelector> type_selector = ParseATypeSelector(&token_stream);
  EXPECT_EQ("*", type_selector->ToString());

  token_stream = TokenStream(ParseSelectorForTest("*|*"));
  token_stream.Consume();
  type_selector = ParseATypeSelector(&token_stream);
  EXPECT_EQ("*|*", type_selector->ToString());

  token_stream = TokenStream(ParseSelectorForTest("*|E"));
  token_stream.Consume();
  type_selector = ParseATypeSelector(&token_stream);
  EXPECT_EQ("*|E", type_selector->ToString());

  token_stream = TokenStream(ParseSelectorForTest("svg|E"));
  token_stream.Consume();
  type_selector = ParseATypeSelector(&token_stream);
  EXPECT_EQ("svg|E", type_selector->ToString());

  token_stream = TokenStream(ParseSelectorForTest("svg|*"));
  token_stream.Consume();
  type_selector = ParseATypeSelector(&token_stream);
  EXPECT_EQ("svg|*", type_selector->ToString());

  token_stream = TokenStream(ParseSelectorForTest("|E"));
  token_stream.Consume();
  type_selector = ParseATypeSelector(&token_stream);
  EXPECT_EQ("|E", type_selector->ToString());
}

TEST(ParseCssTest, ParseAnIdSelector) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest("#hello-world");
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"HASH","line":1,"col":0,"value":"hello-world","type":"id"},{"tokentype":"EOF_TOKEN","line":1,"col":12}])");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  unique_ptr<IdSelector> id_selector = ParseAnIdSelector(&token_stream);
  EXPECT_EQ("#hello-world", id_selector->ToString());
  EXPECT_EQ(1, id_selector->line());
  EXPECT_EQ(0, id_selector->col());
}

TEST(ParseCssTest, ParseAClassSelector) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest(".hello-world");
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"DELIM","line":1,"col":0,"value":"."},{"tokentype":"IDENT","line":1,"col":1,"value":"hello-world"},{"tokentype":"EOF_TOKEN","line":1,"col":12}])");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  unique_ptr<ClassSelector> class_selector = ParseAClassSelector(&token_stream);
  EXPECT_EQ(".hello-world", class_selector->ToString());
  EXPECT_EQ(1, class_selector->line());
  EXPECT_EQ(0, class_selector->col());
}

TEST(ParseCssTest, ParseASimpleSelectorSequence) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest("a|b#c");
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"IDENT","line":1,"col":0,"value":"a"},{"tokentype":"DELIM","line":1,"col":1,"value":"|"},{"tokentype":"IDENT","line":1,"col":2,"value":"b"},{"tokentype":"HASH","line":1,"col":3,"value":"c","type":"id"},{"tokentype":"EOF_TOKEN","line":1,"col":5}])");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  ErrorTokenOr<SimpleSelectorSequence> maybe_sequence =
      ParseASimpleSelectorSequence(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<SimpleSelectorSequence>>(
      maybe_sequence));
  unique_ptr<SimpleSelectorSequence> sequence =
      std::move(std::get<unique_ptr<SimpleSelectorSequence>>(maybe_sequence));
  EXPECT_EQ(sequence->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"namespacePrefix":"a","elementName":"b","pos":0,"endPos":3},"otherSelectors":[{"tokentype":"ID_SELECTOR","line":1,"col":3,"value":"c","endPos":5}]})");

  tokens = ParseSelectorForTest("a|foo#bar.baz");
  token_stream = TokenStream(std::move(tokens));
  token_stream.Consume();
  maybe_sequence = ParseASimpleSelectorSequence(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<SimpleSelectorSequence>>(
      maybe_sequence));
  sequence =
      std::move(std::get<unique_ptr<SimpleSelectorSequence>>(maybe_sequence));
  EXPECT_EQ(sequence->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"namespacePrefix":"a","elementName":"foo","pos":0,"endPos":5},"otherSelectors":[{"tokentype":"ID_SELECTOR","line":1,"col":5,"value":"bar","endPos":9},{"tokentype":"CLASS_SELECTOR","line":1,"col":9,"value":"baz","endPos":13}]})");

  tokens = ParseSelectorForTest(R"(a[*|b="c"])");
  token_stream = TokenStream(std::move(tokens));
  token_stream.Consume();
  maybe_sequence = ParseASimpleSelectorSequence(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<SimpleSelectorSequence>>(
      maybe_sequence));
  sequence =
      std::move(std::get<unique_ptr<SimpleSelectorSequence>>(maybe_sequence));
  EXPECT_EQ(sequence->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"a","pos":0,"endPos":1},"otherSelectors":[{"tokentype":"ATTR_SELECTOR","line":1,"col":1,"namespacePrefix":"*","attrName":"b","matchOperator":"=","value":"c","valueStartPos":6,"valueEndPos":9}]})");

  tokens = ParseSelectorForTest(R"(a[b|c="d"])");
  token_stream = TokenStream(std::move(tokens));
  token_stream.Consume();
  maybe_sequence = ParseASimpleSelectorSequence(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<SimpleSelectorSequence>>(
      maybe_sequence));
  sequence =
      std::move(std::get<unique_ptr<SimpleSelectorSequence>>(maybe_sequence));
  EXPECT_EQ(sequence->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"a","pos":0,"endPos":1},"otherSelectors":[{"tokentype":"ATTR_SELECTOR","line":1,"col":1,"namespacePrefix":"b","attrName":"c","matchOperator":"=","value":"d","valueStartPos":6,"valueEndPos":9}]})");

  // For this selector, the universal selector '*' is implied as its
  // type selector. The fact that it's implied results in both its pos
  // and its endPos being 0, since there is no corresponding input.
  tokens = ParseSelectorForTest("#foo");
  token_stream = TokenStream(std::move(tokens));
  token_stream.Consume();
  maybe_sequence = ParseASimpleSelectorSequence(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<SimpleSelectorSequence>>(
      maybe_sequence));
  sequence =
      std::move(std::get<unique_ptr<SimpleSelectorSequence>>(maybe_sequence));
  EXPECT_EQ(sequence->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"*","pos":0,"endPos":0},"otherSelectors":[{"tokentype":"ID_SELECTOR","line":1,"col":0,"value":"foo","endPos":4}]})");
}

TEST(ParseCssTest, ParseASelector) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest("foo bar \n baz");
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"IDENT","line":1,"col":0,"value":"foo"},{"tokentype":"WHITESPACE","line":1,"col":3},{"tokentype":"IDENT","line":1,"col":4,"value":"bar"},{"tokentype":"WHITESPACE","line":1,"col":7},{"tokentype":"IDENT","line":2,"col":1,"value":"baz"},{"tokentype":"EOF_TOKEN","line":2,"col":4}])");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  ErrorTokenOr<Selector> maybe_selector = ParseASelector(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<Selector>>(maybe_selector));
  unique_ptr<Selector> selector =
      std::move(std::get<unique_ptr<Selector>>(maybe_selector));
  EXPECT_EQ(selector->ToJson().ToString(), R"({"tokentype":"COMBINATOR","line":1,"col":7,"combinatorType":"DESCENDANT","left":{"tokentype":"COMBINATOR","line":1,"col":3,"combinatorType":"DESCENDANT","left":{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"foo","pos":0,"endPos":3},"otherSelectors":[]},"right":{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":4,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":4,"elementName":"bar","pos":4,"endPos":7},"otherSelectors":[]}},"right":{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":2,"col":1,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":2,"col":1,"elementName":"baz","pos":10,"endPos":13},"otherSelectors":[]}})");
}

TEST(ParseCssTest, ParsesASelectorsGroup) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest("foo, bar \n, baz");
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"IDENT","line":1,"col":0,"value":"foo"},{"tokentype":"COMMA","line":1,"col":3},{"tokentype":"WHITESPACE","line":1,"col":4},{"tokentype":"IDENT","line":1,"col":5,"value":"bar"},{"tokentype":"WHITESPACE","line":1,"col":8},{"tokentype":"COMMA","line":2,"col":0},{"tokentype":"WHITESPACE","line":2,"col":1},{"tokentype":"IDENT","line":2,"col":2,"value":"baz"},{"tokentype":"EOF_TOKEN","line":2,"col":5}])");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  ErrorTokenOr<Selector> maybe_selector = ParseASelectorsGroup(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<Selector>>(maybe_selector));
  unique_ptr<Selector> selector =
      std::move(std::get<unique_ptr<Selector>>(maybe_selector));
  EXPECT_EQ(selector->ToJson().ToString(), R"({"tokentype":"SELECTORS_GROUP","line":1,"col":0,"elements":[{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"foo","pos":0,"endPos":3},"otherSelectors":[]},{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":5,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":5,"elementName":"bar","pos":5,"endPos":8},"otherSelectors":[]},{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":2,"col":2,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":2,"col":2,"elementName":"baz","pos":12,"endPos":15},"otherSelectors":[]}]})");
}

TEST(ParseCssTest, ParseASelectorsGroupWithAnAttribMatch) {
  vector<unique_ptr<Token>> tokens =
      ParseSelectorForTest("a[href=\"http://www.w3.org/\"]");
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"IDENT","line":1,"col":0,"value":"a"},{"tokentype":"OPEN_SQUARE","line":1,"col":1},{"tokentype":"IDENT","line":1,"col":2,"value":"href"},{"tokentype":"DELIM","line":1,"col":6,"value":"="},{"tokentype":"STRING","line":1,"col":7,"value":"http://www.w3.org/"},{"tokentype":"CLOSE_SQUARE","line":1,"col":27},{"tokentype":"EOF_TOKEN","line":1,"col":28}])");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  ErrorTokenOr<Selector> maybe_selector = ParseASelectorsGroup(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<Selector>>(maybe_selector));
  unique_ptr<Selector> selector =
      std::move(std::get<unique_ptr<Selector>>(maybe_selector));
  EXPECT_EQ(selector->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"a","pos":0,"endPos":1},"otherSelectors":[{"tokentype":"ATTR_SELECTOR","line":1,"col":1,"attrName":"href","matchOperator":"=","value":"http://www.w3.org/","valueStartPos":7,"valueEndPos":27}]})");
}

TEST(ParseCssTest, ParseASelectorsGroupWithMoreAttribMatches) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest(
      "elem[attr1=\"v1\"][attr2=value2\n]"
      "[attr3~=\"foo\"][attr4|=\"bar\"][attr5|= \"baz\"][attr6 $=boo]"
      "[ attr7*=bang ][attr8]");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  ErrorTokenOr<Selector> maybe_selector = ParseASelectorsGroup(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<Selector>>(maybe_selector));
  unique_ptr<Selector> selector =
      std::move(std::get<unique_ptr<Selector>>(maybe_selector));
  EXPECT_EQ(selector->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"elem","pos":0,"endPos":4},"otherSelectors":[{"tokentype":"ATTR_SELECTOR","line":1,"col":4,"attrName":"attr1","matchOperator":"=","value":"v1","valueStartPos":11,"valueEndPos":15},{"tokentype":"ATTR_SELECTOR","line":1,"col":16,"attrName":"attr2","matchOperator":"=","value":"value2","valueStartPos":23,"valueEndPos":29},{"tokentype":"ATTR_SELECTOR","line":2,"col":1,"attrName":"attr3","matchOperator":"~=","value":"foo","valueStartPos":39,"valueEndPos":44},{"tokentype":"ATTR_SELECTOR","line":2,"col":15,"attrName":"attr4","matchOperator":"|=","value":"bar","valueStartPos":53,"valueEndPos":58},{"tokentype":"ATTR_SELECTOR","line":2,"col":29,"attrName":"attr5","matchOperator":"|=","value":"baz","valueStartPos":68,"valueEndPos":73},{"tokentype":"ATTR_SELECTOR","line":2,"col":44,"attrName":"attr6","matchOperator":"$=","value":"boo","valueStartPos":83,"valueEndPos":86},{"tokentype":"ATTR_SELECTOR","line":2,"col":57,"attrName":"attr7","matchOperator":"*=","value":"bang","valueStartPos":96,"valueEndPos":100},{"tokentype":"ATTR_SELECTOR","line":2,"col":72,"attrName":"attr8","matchOperator":"","value":"","valueStartPos":-1,"valueEndPos":-1}]})");
}

TEST(ParseCssTest, ParseASelectorsGroupWithPseudoClass) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest("a::b:lang(fr-be)");
  EXPECT_EQ(JsonFromList(tokens), R"([{"tokentype":"IDENT","line":1,"col":0,"value":"a"},{"tokentype":"COLON","line":1,"col":1},{"tokentype":"COLON","line":1,"col":2},{"tokentype":"IDENT","line":1,"col":3,"value":"b"},{"tokentype":"COLON","line":1,"col":4},{"tokentype":"FUNCTION_TOKEN","line":1,"col":5,"value":"lang"},{"tokentype":"IDENT","line":1,"col":10,"value":"fr-be"},{"tokentype":"CLOSE_PAREN","line":1,"col":15},{"tokentype":"EOF_TOKEN","line":1,"col":16}])");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  ErrorTokenOr<Selector> maybe_selector = ParseASelectorsGroup(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<Selector>>(maybe_selector));
  unique_ptr<Selector> selector =
      std::move(std::get<unique_ptr<Selector>>(maybe_selector));
  EXPECT_EQ(selector->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"a","pos":0,"endPos":1},"otherSelectors":[{"tokentype":"PSEUDO_SELECTOR","line":1,"col":1,"isClass":false,"name":"b"},{"tokentype":"PSEUDO_SELECTOR","line":1,"col":4,"isClass":true,"name":"lang","func":[{"tokentype":"FUNCTION_TOKEN","line":1,"col":5,"value":"lang"},{"tokentype":"IDENT","line":1,"col":10,"value":"fr-be"},{"tokentype":"EOF_TOKEN","line":1,"col":15}]}]})");
}

TEST(ParseCssTest, ParseASelectorsGroupWithANegation) {
  // This test records the status quo with respect to negation:
  // We allow it, but don't currently parse the inside of it, we just
  // mirror it over into the 'func' field of the pseudo selector.
  vector<unique_ptr<Token>> tokens =
      ParseSelectorForTest("html|*:not(:link):not(:visited)");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  ErrorTokenOr<Selector> maybe_selector = ParseASelectorsGroup(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<Selector>>(maybe_selector));
  unique_ptr<Selector> selector =
      std::move(std::get<unique_ptr<Selector>>(maybe_selector));
  EXPECT_EQ(selector->ToJson().ToString(), R"({"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"namespacePrefix":"html","elementName":"*","pos":0,"endPos":6},"otherSelectors":[{"tokentype":"PSEUDO_SELECTOR","line":1,"col":6,"isClass":true,"name":"not","func":[{"tokentype":"FUNCTION_TOKEN","line":1,"col":7,"value":"not"},{"tokentype":"COLON","line":1,"col":11},{"tokentype":"IDENT","line":1,"col":12,"value":"link"},{"tokentype":"EOF_TOKEN","line":1,"col":16}]},{"tokentype":"PSEUDO_SELECTOR","line":1,"col":17,"isClass":true,"name":"not","func":[{"tokentype":"FUNCTION_TOKEN","line":1,"col":18,"value":"not"},{"tokentype":"COLON","line":1,"col":22},{"tokentype":"IDENT","line":1,"col":23,"value":"visited"},{"tokentype":"EOF_TOKEN","line":1,"col":30}]}]})");
}

TEST(ParseCssTest, ParseSelectors_ReportsErrorForUnparsedRemainderOfInput) {
  vector<unique_ptr<Token>> tokens = ParseSelectorForTest("foo bar 9");
  TokenStream token_stream(std::move(tokens));
  token_stream.Consume();
  ErrorTokenOr<Selector> maybe_selector = ParseASelectorsGroup(&token_stream);
  ASSERT_TRUE(std::holds_alternative<unique_ptr<ErrorToken>>(maybe_selector));
  unique_ptr<ErrorToken> error =
      std::move(std::get<unique_ptr<ErrorToken>>(maybe_selector));
  EXPECT_EQ(error->ToJson().ToString(), R"({"tokentype":"ERROR","line":1,"col":8,"code":"CSS_SYNTAX_UNPARSED_INPUT_REMAINS_IN_SELECTOR","params":["style"]})");
}

TEST(ParseCssTest, SelectorParserRecordsOneParsingError) {
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints("/*error*/ {}");
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(0, errors.size());
  SelectorVisitor visitor(&errors);
  stylesheet->Accept(&visitor);
  EXPECT_EQ(1, errors.size());
}

class CollectCombinatorNodes : public SelectorVisitor {
 public:
  CollectCombinatorNodes() : SelectorVisitor(&errors_) {}
  vector<unique_ptr<Token>> combinators_;
  vector<unique_ptr<ErrorToken>> errors_;

  void VisitCombinator(const Combinator& combinator) override {
    combinators_.push_back(combinator.Clone());
  }
};

TEST(ParseCssTest, SelectorParserImplementsVisitorPattern) {
  vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints("a > b c + d ~ e {}");
  CollectCombinatorNodes visitor;
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  stylesheet->Accept(&visitor);
  EXPECT_EQ(4, visitor.combinators_.size());
  Combinator* combinator =
      static_cast<Combinator*>(visitor.combinators_[0].get());
  EXPECT_EQ("GENERAL_SIBLING",
            CombinatorType::Code_Name(combinator->combinator_type()));
  EXPECT_EQ(1, visitor.combinators_[0]->line());
  EXPECT_EQ(12, visitor.combinators_[0]->col());

  // The combinator #2 is the (in) famous whitespace operator.
  EXPECT_EQ(visitor.combinators_[2]->ToJson().ToString(),
            R"({"tokentype":"COMBINATOR","line":1,"col":5,"combinatorType":"DESCENDANT","left":{"tokentype":"COMBINATOR","line":1,"col":2,"combinatorType":"CHILD","left":{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":0,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":0,"elementName":"a","pos":0,"endPos":1},"otherSelectors":[]},"right":{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":4,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":4,"elementName":"b","pos":4,"endPos":5},"otherSelectors":[]}},"right":{"tokentype":"SIMPLE_SELECTOR_SEQUENCE","line":1,"col":6,"typeSelector":{"tokentype":"TYPE_SELECTOR","line":1,"col":6,"elementName":"c","pos":6,"endPos":7},"otherSelectors":[]}})");
}

// Collects type selectors that match a body tag.
class CollectBodyTypeSelectors : public SelectorVisitor {
 public:
  CollectBodyTypeSelectors() : SelectorVisitor(&errors_) {}
  vector<unique_ptr<Token>> body_selectors_;
  vector<unique_ptr<ErrorToken>> errors_;

  void VisitTypeSelector(const TypeSelector& selector) override {
    if (selector.element_name() == "body" &&
        (selector.namespace_prefix() == nullptr ||
         *selector.namespace_prefix() == "*"))
      body_selectors_.push_back(selector.Clone());
  }
};

TEST(ParseCssTest, ExtractBodySelectorPositions) {
  std::string selector_str(
      "body[data-foo=bar] "  // pos: 0 end_pos: 4
      "*|body#gnarly "       // pos: 19: end_pos: 25
      "a[body=foo].body "    // no match
      "body[bar] "           // pos: 50 end_pos: 54
      "a,body,div "          // pos: 62 end_pos: 66
      ":not(body) "          // no match
      "body > div "          // pos: 82 end_pos: 86
      "svg|body {}");        // no match due to filtering in VisitTypeSelector
  vector<char32_t> css = htmlparser::Strings::Utf8ToCodepoints(selector_str);
  CollectBodyTypeSelectors visitor;
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  unique_ptr<Stylesheet> stylesheet =
      ParseAStylesheet(&tokens, AmpCssParsingConfig(), &errors);
  EXPECT_EQ(JsonFromList(errors), "[]");
  stylesheet->Accept(&visitor);

  vector<std::pair<int, int>> positions;
  for (const unique_ptr<Token>& sp : visitor.body_selectors_) {
    TypeSelector* s = static_cast<TypeSelector*>(sp.get());
    positions.emplace_back(s->pos(), s->end_pos());
  }

  vector<std::pair<int, int>> expected = {
      {0, 4}, {19, 25}, {50, 54}, {62, 66}, {82, 86}};
  std::sort(positions.begin(), positions.end());
  EXPECT_EQ(expected, positions);
  for (const std::pair<int, int>& segment : positions) {
    int length = segment.second - segment.first;
    if (length == 4) {
      EXPECT_EQ("body", selector_str.substr(segment.first, length));
      continue;
    }
    EXPECT_EQ(6, length);
    EXPECT_EQ("*|body", selector_str.substr(segment.first, length));
  }
}  // namespace

TEST(ParseCssTest, CloneToken) {
  IdentToken identtoken("body");
  EXPECT_EQ("body", identtoken.StringValue());

  unique_ptr<Token> clone = identtoken.Clone();
  EXPECT_EQ("body", clone->StringValue());
}

TEST(ParseCssTest, CloneTypeSelectorWithDefaultNamespace) {
  TypeSelector type_selector(/*namespace_prefix=*/nullptr, "div");
  EXPECT_EQ("div", type_selector.ToString());

  unique_ptr<Token> clone = type_selector.Clone();
  TypeSelector* type_clone = dynamic_cast<TypeSelector*>(clone.get());
  EXPECT_EQ("div", type_clone->ToString());
}

TEST(ParseCssTest, CloneAttrSelectorWithDefaultNamespace) {
  const std::string kExpectedJson = R"({"tokentype":"ATTR_SELECTOR","line":1,"col":0,"attrName":"attr","matchOperator":"=","value":"val","valueStartPos":-1,"valueEndPos":-1})";

  AttrSelector attr_selector(/*namespace_prefix=*/nullptr, "attr", "=", "val");
  EXPECT_EQ(attr_selector.ToJson().ToString(), kExpectedJson);

  unique_ptr<Token> clone = attr_selector.Clone();
  AttrSelector* attr_clone = dynamic_cast<AttrSelector*>(clone.get());
  EXPECT_EQ(attr_clone->ToJson().ToString(), kExpectedJson);
}

TEST(ParseCssTest, DeclarationToString) {
  const std::string input_declarations = absl::StrCat(
      "display: block;"
      "lemur:;"
      "animation:-amp-start 8s steps(1,end) 0s 1 normal both;"
      "font-family: 'GoogleFont';"
      "background-image: url(lemur.png);"
      "src: background-image: url('http://example.com/lemur.png');");
  vector<char32_t> css =
      htmlparser::Strings::Utf8ToCodepoints(input_declarations);
  vector<unique_ptr<ErrorToken>> errors;
  vector<unique_ptr<Token>> tokens =
      Tokenize(&css, /*line=*/1, /*col=*/0, &errors);
  vector<unique_ptr<Declaration>> declarations =
      ParseInlineStyle(&tokens, &errors);
  std::string output_declarations;
  for (const auto& declaration : declarations) {
    absl::StrAppend(&output_declarations, declaration->ToString());
  }
  EXPECT_EQ(0, errors.size());
  EXPECT_EQ(input_declarations, output_declarations);
}

}  // namespace
}  // namespace htmlparser::css
