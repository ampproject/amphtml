#include <filesystem>
#include <fstream>
#include <memory>

#include "cpp/engine/validator_pb.h"
#include "gtest/gtest.h"
#include "absl/container/flat_hash_map.h"
#include "absl/container/flat_hash_set.h"
#include "absl/status/status.h"
#include "absl/strings/cord.h"
#include "absl/strings/escaping.h"
#include "absl/strings/match.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/str_join.h"
#include "absl/strings/str_replace.h"
#include "absl/strings/str_split.h"
#include "cpp/engine/testing-utils.h"
#include "cpp/engine/validator.h"
#include "cpp/htmlparser/css/parse-css.pb.h"
#include "cpp/htmlparser/logging.h"
#include "validator.pb.h"
#include "re2/re2.h"

using absl::StartsWith;
using absl::StrAppend;
using absl::StrCat;
using absl::StrReplaceAll;
using amp::validator::AtRuleSpec;
using amp::validator::AttrList;
using amp::validator::AttrSpec;
using amp::validator::CdataSpec;
using amp::validator::ErrorFormat;
using amp::validator::ErrorSpecificity;
using amp::validator::HtmlFormat;
using amp::validator::PropertySpec;
using amp::validator::PropertySpecList;
using amp::validator::ReferencePoint;
using amp::validator::TagSpec;
using amp::validator::ValidationError;
using amp::validator::ValidationResult;
using amp::validator::ValidatorRules;
using amp::validator::testing::RenderInlineResult;
using amp::validator::testing::RenderResult;
using amp::validator::testing::TestCase;
using amp::validator::testing::TestCases;

namespace fs = std::filesystem;

namespace amp::validator {
namespace {

TestCase FindOrDie(std::map<std::string, TestCase> cases,
                   std::string case_filename) {
  auto iter = cases.find(case_filename);
  CHECK(iter != cases.end()) << case_filename << " not found.";
  return iter->second;
}

#define EXPECT_NULL(p) EXPECT_TRUE((p) == nullptr)
#define EXPECT_NOT_NULL(p) EXPECT_FALSE((p) == nullptr)

void MaybeGenerateFailuresFor(const std::string& actual,
                              const std::string& expected,
                              const std::string& test_case_output_file) {
  if (actual == expected) return;
  std::string out_file =
      StrReplaceAll(test_case_output_file,
                    {{"external/validator/testdata/", "validator/testdata/"},
                     {"external/amphtml-extensions/", "extensions/"}});
  ADD_FAILURE_AT(out_file.c_str(), 1)
      << "Please use the following command to overwrite the output file by the "
         "actual output of AMP validator.\n"
      << "echo " << absl::Base64Escape(actual) << " | base64 --decode > "
      << out_file;
}

TEST(ValidatorTest, Testdata_ValidatorTest_TestCases) {
  for (const auto& entry : TestCases()) {
    const TestCase& test_case = entry.second;
    ValidationResult result = amp::validator::Validate(test_case.input_content,
                                                       test_case.html_format);
    std::string output;
    output = RenderInlineResult(
        /*filename=*/test_case.name, test_case.input_content, result);

    MaybeGenerateFailuresFor(output, test_case.output_content,
                             test_case.output_file);
  }
}

std::string FirstNLines(const std::string& str, int n) {
  std::vector<std::string> lines = absl::StrSplit(str, '\n');
  lines.resize(n);
  return StrCat(absl::StrJoin(lines, "\n"));
}

TEST(ValidatorTest, TestVariousMaxErrorsSettings) {
  TestCase test_case =
      FindOrDie(TestCases(), "feature_tests/several_errors.html");

  // Recompute the expected output, only without inline rendering.
  {
    ValidationResult result = amp::validator::Validate(test_case.input_content,
                                                       test_case.html_format);
    test_case.output_content = RenderResult(
        /*filename=*/test_case.name, result);
  }

  struct MaxErrorsAndOutput {
    int32_t max_errors;
    std::string output;
  };

  for (const auto& entry : std::vector<MaxErrorsAndOutput>{
           {0, "FAIL"},
           {1, FirstNLines(test_case.output_content, 2)},
           {3, FirstNLines(test_case.output_content, 4)},
           {7, FirstNLines(test_case.output_content, 8)},
           {100, test_case.output_content},
           {-1, test_case.output_content}}) {
    ValidationResult result = amp::validator::Validate(test_case.input_content,
                                                       test_case.html_format,
                                                       entry.max_errors);
    std::string output = RenderResult(
        /*filename=*/test_case.name, result);
    SCOPED_TRACE(StrCat("max_errors=", entry.max_errors));
    MaybeGenerateFailuresFor(output, entry.output, test_case.name);
  }
}

TEST(ValidatorTest, TestExitEarlyNotAmp) {
  // This test looks at a non-amp page and sets a max-errors other than -1.
  // This triggers early exit code when we encounter an html tag that doesn't
  // have an AMP identifier in it, so we only get one output error even
  // though there would normally be ~7 due to missing required elements.
  TestCase test_case =
      FindOrDie(TestCases(), "feature_tests/not_amp.html");
  ValidationResult result = amp::validator::Validate(test_case.input_content,
                                                     test_case.html_format,
                                                     100000000);

  EXPECT_EQ(1, result.errors_size());
  EXPECT_EQ(ValidationResult::FAIL, result.status());
}

TEST(ValidatorTest, TestExitEarlyManufacturedHtml) {
  // This test is similar to TestExitEarlyNotAmp above, except checks that
  // the exit early path doesn't occur if the HTML tag is manufactured,
  // instead of explicit.
  TestCase test_case =
      FindOrDie(TestCases(), "feature_tests/unprintable_chars.html");
  ValidationResult result = amp::validator::Validate(test_case.input_content,
                                                     test_case.html_format,
                                                     100000000);
  EXPECT_GT(result.errors_size(), 1);
  EXPECT_EQ(ValidationResult::FAIL, result.status());
}

TEST(ValidatorTest, TestValidationResultTransformerVersion) {
  TestCase test_case = FindOrDie(
      TestCases(), "transformed_feature_tests/minimum_valid_amp.html");
  ValidationResult result = amp::validator::Validate(test_case.input_content,
                                                     test_case.html_format);
  EXPECT_EQ(result.transformer_version(), 1);
}

std::string RepeatString(const std::string& blob, int n_times) {
  std::string output;
  for (int i = 0; i < n_times; ++i) StrAppend(&output, blob);
  return output;
}

std::string TestWithDocSize(absl::string_view test_content,
                            absl::string_view body) {
  return StrReplaceAll(test_content, {{"replace_body", body}});
}

TEST(ValidatorTest, TestDocSizeAmpEmail) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "amp4email_feature_tests/doc_size.html");

  // We use a blob of length 20 (both bytes and chars) to make it easy to
  // construct body of any length that we want. Note that the minimally valid
  // AMP4EMAIL test case used here is 1100 bytes. Take that into account when
  // changing the thresholds.
  const std::string valid_body_content = "<b>Hello, World</b>\n";
  ASSERT_EQ(20, valid_body_content.length());

  // 200000 bytes in the tested document.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesTest]");
    std::string body = RepeatString(valid_body_content, /*n_times=*/9974);
    std::string test_html = TestWithDocSize(test_case.input_content, body);
    EXPECT_EQ(200000, test_html.length());
    EXPECT_EQ(
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL).status(),
        ValidationResult::PASS)
        << "test case " << test_case_name;
  }

  // 200001 bytes in the tested document.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneTest]");
    std::string body =
        StrCat(RepeatString(valid_body_content, /*n_times=*/9974), " ");
    std::string test_html = TestWithDocSize(test_case.input_content, body);
    EXPECT_EQ(200001, test_html.length());
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":9993:6 "
        "Document exceeded 200000 bytes limit. Actual size 200001 bytes. "
        "(see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "email-spec/amp-email-format/?format=email)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

std::string TestWithScript(const std::string& test_content,
                           const std::string& inline_script) {
  return StrReplaceAll(test_content,
                       {{"replace_inline_script", inline_script}});
}

TEST(ValidatorTest, TestScriptLengthAmp) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "feature_tests/inline_script_length.html");
  const std::string test_template = test_case.input_content;

  // This string is 10 bytes of inline script.
  const std::string inline_10_bytes = "alert('');";
  ASSERT_EQ(10, inline_10_bytes.length());

  // 10000 bytes of inline script.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesInlineTest]");
    std::string inline_script = RepeatString(inline_10_bytes, /*n_times=*/1000);
    EXPECT_EQ(10000, inline_script.length());
    std::string test_html =
        TestWithScript(test_case.input_content, inline_script);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 10001 bytes of inline script.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneInlineTest]");
    std::string inline_script =
        StrCat(RepeatString(inline_10_bytes, /*n_times=*/1000), " ");
    EXPECT_EQ(10001, inline_script.length());
    std::string test_html =
        TestWithScript(test_case.input_content, inline_script);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":20:2 The inline script is 10001 bytes, which exceeds the limit of "
        "10000 bytes. (see https://amp.dev/documentation/components/"
        "amp-script/#faq)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

std::string TestWithCSS(const std::string& test_content,
                        const std::string& stylesheet,
                        const std::string& inline_style) {
  return StrReplaceAll(StrReplaceAll(test_content,
                                     {{".replace_amp_custom {}",
                                       stylesheet}}),
                       {{"replace_inline_style", inline_style}});
}

TEST(ValidatorTest, TestCssLengthAmp) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "feature_tests/css_length.html");
  const std::string test_template = test_case.input_content;

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const std::string valid_style_blob = "h1{top:0}\n";
  ASSERT_EQ(10, valid_style_blob.length());
  // This string is 10 bytes of inline style inside a B tag.
  const std::string inline_10_bytes = "<b style='width:1px;'></b>";

  // 75000 bytes in the author stylesheet and 0 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesTest]");
    std::string stylesheet = RepeatString(valid_style_blob, /*n_times=*/7500);
    EXPECT_EQ(75000, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75001 bytes in the author stylesheet and 0 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneTest]");
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7500), " ");
    EXPECT_EQ(75001, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":13:2 The author stylesheet specified in tag 'style amp-custom' is "
        "too long - document contains 75001 bytes whereas the limit is 75000 "
        "bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75002 bytes, but 74999 characters in stylesheet and 0 bytes inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[UTF8Test]");
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7499), "h1{top:😺}");
    EXPECT_EQ(75002, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":13:2 The author stylesheet specified in tag 'style amp-custom' is "
        "too long - document contains 75002 bytes whereas the limit is 75000 "
        "bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 75000 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesInlineTest]");
    std::string inline_style = RepeatString(inline_10_bytes, /*n_times=*/7500);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 75010 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneInlineTest]");
    std::string inline_style =
        StrCat(RepeatString(inline_10_bytes, /*n_times=*/7501), " ");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":21:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75010 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75000 bytes in the author stylesheet and 10 bytes of inline style.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[CombinedMaxBytesTest]");
    std::string stylesheet = RepeatString(valid_style_blob, /*n_times=*/7500);
    EXPECT_EQ(75000, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, inline_10_bytes);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":7521:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75010 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 1000 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[AllowedInlineTest]");
    std::string inline_style = StrCat(
        "<b style='", RepeatString("width:1px;", /*n_times=*/100), "'></b>");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 1001 bytes of single inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[AllowedInlineTest2]");
    std::string inline_style =
        StrCat("<div style='", RepeatString("width:1px;", /*n_times=*/100), " ",
               "'></b>");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output =
        StrCat("FAIL\n", test_case_name,
               ":19:2 The inline style specified in tag 'div' is too long - "
               "it contains 1001 bytes whereas the limit is 1000 bytes. "
               "(see https://amp.dev/documentation/guides-and-tutorials/learn/"
               "spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

TEST(ValidatorTest, TestCssLengthAmpEmail) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "amp4email_feature_tests/css_length.html");
  const std::string test_template = test_case.input_content;

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const std::string valid_style_blob = "h1{top:0}\n";
  ASSERT_EQ(10, valid_style_blob.length());
  // This string is 10 bytes of inline style inside a B tag.
  const std::string inline_10_bytes = "<b style='width:1px;'></b>";

  // 75000 bytes in the author stylesheet and 0 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesTest]");
    std::string stylesheet = RepeatString(valid_style_blob, /*n_times=*/7500);
    EXPECT_EQ(75000, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "PASS\n", test_case_name,
        ":8:0 Tag 'html' marked with attribute 'amp4email' is missing the "
        "corresponding attribute 'data-css-strict' for enabling strict "
        "CSS validation. This may become an error in the future. "
        "(see https://github.com/ampproject/amphtml/issues/32587)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75001 bytes in the author stylesheet and 0 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneTest]");
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7500), " ");
    EXPECT_EQ(75001, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":8:0 Tag 'html' marked with attribute 'amp4email' is missing the "
        "corresponding attribute 'data-css-strict' for enabling strict "
        "CSS validation. This may become an error in the future. "
        "(see https://github.com/ampproject/amphtml/issues/32587)\n",
        test_case_name,
        ":13:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 75001 bytes whereas the "
        "limit is 75000 "
        "bytes. (see https://amp.dev/documentation/guides-and-tutorials/email/learn/"
        "spec/amphtml#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 75000 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesInlineTest]");
    std::string inline_style = RepeatString(inline_10_bytes, /*n_times=*/7500);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "PASS\n", test_case_name,
        ":8:0 Tag 'html' marked with attribute 'amp4email' is missing the "
        "corresponding attribute 'data-css-strict' for enabling strict "
        "CSS validation. This may become an error in the future. "
        "(see https://github.com/ampproject/amphtml/issues/32587)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 75010 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneInlineTest]");
    std::string inline_style =
        StrCat(RepeatString(inline_10_bytes, /*n_times=*/7501), " ");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    // TODO(b/153099987): This should not pass as we have more than 75,000 bytes
    // of inline style. Right now, it is a warning until we have sorted out how
    // to make the transition.
    std::string expected_output = StrCat(
        "PASS\n", test_case_name,
        ":8:0 Tag 'html' marked with attribute 'amp4email' is missing the "
        "corresponding attribute 'data-css-strict' for enabling strict "
        "CSS validation. This may become an error in the future. "
        "(see https://github.com/ampproject/amphtml/issues/32587)\n",
        test_case_name,
        ":19:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75010 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/email/learn/spec/amphtml#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75000 bytes in the author stylesheet and 14 bytes of inline style.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[CombinedMaxBytesTest]");
    std::string stylesheet = RepeatString(valid_style_blob, /*n_times=*/7500);
    EXPECT_EQ(75000, stylesheet.length());
    std::string test_html = TestWithCSS(test_case.input_content, stylesheet,
                                        "<b style='display:block;'></b>");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    // TODO(b/153099987): This should not pass as we have more than 75,000 bytes
    // of inline style. Right now, it is a warning until we have sorted out how
    // to make the transition.
    std::string expected_output = StrCat(
        "PASS\n", test_case_name,
        ":8:0 Tag 'html' marked with attribute 'amp4email' is missing the "
        "corresponding attribute 'data-css-strict' for enabling strict "
        "CSS validation. This may become an error in the future. "
        "(see https://github.com/ampproject/amphtml/issues/32587)\n",
        test_case_name,
        ":7519:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75014 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/email/learn/spec/amphtml#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 1000 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[AllowedInlineTest]");
    std::string inline_style = StrCat(
        "<b style='", RepeatString("width:1px;", /*n_times=*/100), "'></b>");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "PASS\n", test_case_name,
        ":8:0 Tag 'html' marked with attribute 'amp4email' is missing the "
        "corresponding attribute 'data-css-strict' for enabling strict "
        "CSS validation. This may become an error in the future. "
        "(see https://github.com/ampproject/amphtml/issues/32587)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 1001 bytes of single inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[AllowedInlineTest2]");
    std::string inline_style =
        StrCat("<div style='", RepeatString("width:1px;", /*n_times=*/100), " ",
               "'></b>");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    // TODO(b/153679479): Email per-inline-style limits are currently enforced
    // only as a warning due to this bug until we sort out what the correct
    // value should be.
    std::string expected_output = StrCat(
        "PASS\n", test_case_name,
        ":8:0 Tag 'html' marked with attribute 'amp4email' is missing the "
        "corresponding attribute 'data-css-strict' for enabling strict "
        "CSS validation. This may become an error in the future. "
        "(see https://github.com/ampproject/amphtml/issues/32587)\n",
        test_case_name,
        ":17:2 The inline style specified in tag 'div' is too long - it "
        "contains 1001 bytes whereas the limit is 1000 bytes. (see "
        "https://amp.dev/documentation/guides-and-tutorials/email/learn/spec/"
        "amphtml#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

TEST(ValidatorTest, TestCssLengthAmpEmailStrict) {
  const TestCase& test_case = FindOrDie(
      TestCases(), "amp4email_feature_tests/css_length_strict.html");
  const std::string test_template = test_case.input_content;

  // We use a blob of length 20 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const std::string valid_style_blob = "h1 {color: hotpink}\n";
  ASSERT_EQ(20, valid_style_blob.length());
  // This string is 10 bytes of inline style inside a B tag.
  const std::string inline_10_bytes = "<b style='width:1px;'></b>";

  // 75000 bytes in the author stylesheet and 0 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesTest]");
    std::string stylesheet = RepeatString(valid_style_blob, /*n_times=*/3750);
    EXPECT_EQ(75000, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75001 bytes in the author stylesheet and 0 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneTest]");
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/3750), " ");
    EXPECT_EQ(75001, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":13:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 75001 bytes whereas the "
        "limit is 75000 "
        "bytes. (see https://amp.dev/documentation/guides-and-tutorials/email/learn/"
        "spec/amphtml#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 75000 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesInlineTest]");
    std::string inline_style = RepeatString(inline_10_bytes, /*n_times=*/7500);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 75010 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneInlineTest]");
    std::string inline_style = RepeatString(inline_10_bytes, /*n_times=*/7501);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":19:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75010 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/email/learn/spec/amphtml#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75000 bytes in the author stylesheet and 14 bytes of inline style.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[CombinedMaxBytesTest]");
    std::string stylesheet = RepeatString(valid_style_blob, /*n_times=*/3750);
    EXPECT_EQ(75000, stylesheet.length());
    std::string test_html = TestWithCSS(test_case.input_content, stylesheet,
                                        "<b style='display:block;'></b>");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":3769:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75014 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/email/learn/spec/amphtml#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 1000 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[AllowedInlineTest]");
    std::string inline_style = StrCat(
        "<b style='", RepeatString("width:1px;", /*n_times=*/100), "'></b>");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 1001 bytes of single inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[AllowedInlineTest2]");
    std::string inline_style =
        StrCat("<div style='", RepeatString("width:1px;", /*n_times=*/100), " ",
               "'></b>");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output =
        StrCat("FAIL\n", test_case_name,
               ":17:2 The inline style specified in tag 'div' is too long - it "
               "contains 1001 bytes whereas the limit is 1000 bytes. (see "
               "https://amp.dev/documentation/guides-and-tutorials/email/learn/spec/"
               "amphtml#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

TEST(ValidatorTest, TestCssLengthAmpAds) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "amp4ads_feature_tests/css_length.html");
  const std::string test_template = test_case.input_content;

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const std::string valid_style_blob = "h1{top:0}\n";
  ASSERT_EQ(10, valid_style_blob.length());
  // This string is 10 bytes of inline style inside a B tag.
  const std::string inline_10_bytes = "<b style='width:1px;'></b>";

  // 20001 bytes in the author stylesheet and 0 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneTest]");
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/2000), " ");
    EXPECT_EQ(20001, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4ADS));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":14:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 20001 bytes whereas the "
        "limit is 20000 "
        "bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 100,000 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesInlineTest]");
    std::string inline_style = RepeatString(inline_10_bytes, /*n_times=*/10000);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4ADS));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 20,000 bytes in the author stylesheet and 14 bytes of inline style.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[CombinedMaxBytesTest]");
    std::string stylesheet = RepeatString(valid_style_blob, /*n_times=*/2000);
    EXPECT_EQ(20000, stylesheet.length());
    std::string test_html = TestWithCSS(test_case.input_content, stylesheet,
                                        "<b style='display:block;'></b>");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4ADS));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 2,000 bytes of single inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[AllowedInlineTest]");
    std::string inline_style = StrCat(
        "<b style='", RepeatString("width:1px;", /*n_times=*/200), "'></b>");
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html, HtmlFormat::AMP4ADS));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

// Similar to TestTransformedAmpCssLengthWithUrls, but for non-transformed AMP,
// to show that behavior should differ from non-transformed in that URLs are not
// counted towards the URL length, unless they are data: urls.
TEST(ValidatorTest, TestCssLengthWithUrls) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "feature_tests/css_length.html");
  const std::string test_template = test_case.input_content;

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const std::string valid_style_blob = "h1{top:0}\n";
  ASSERT_EQ(10, valid_style_blob.length());

  // 75010 bytes in the author stylesheet, but includes a URL of 19 bytes.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[MaxBytesWithUrlTest]");
    std::string url = "http://example.com/";
    ASSERT_EQ(19, url.length());
    std::string css_with_url = StrCat("a{b:url('", url, "')");
    ASSERT_EQ(30, css_with_url.length());
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7498), css_with_url);
    // 10 bytes over, 19 of which are the URL.
    EXPECT_EQ(75010, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");

    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":13:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 75010 bytes whereas the limit is "
        "75000 bytes. (see https://amp.dev/documentation/guides-and-tutorials/"
        "learn/spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75010 bytes in the stylesheet, but includes a relative URL of 19 bytes.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[MaxBytesRelativeUrlTest]");
    std::string url = "a-relative-url.html";
    ASSERT_EQ(19, url.length());
    std::string css_with_url = StrCat("a{b:url('", url, "')");
    ASSERT_EQ(30, css_with_url.length());
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7498), css_with_url);
    // 10 bytes over, 19 of which are the URL.
    EXPECT_EQ(75010, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":13:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 75010 bytes whereas the limit is "
        "75000 bytes. (see https://amp.dev/documentation/guides-and-tutorials/"
        "learn/spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75010 bytes in the stylesheet, but includes a data URL of 19 bytes.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[MaxBytesDataUrlTest]");
    std::string url = "data:nineteen-bytes";
    ASSERT_EQ(19, url.length());
    std::string css_with_url = StrCat("a{b:url('", url, "')");
    ASSERT_EQ(30, css_with_url.length());
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7498), css_with_url);
    // 10 bytes over, 19 of which are the URL.
    EXPECT_EQ(75010, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":13:2 The author stylesheet specified in tag 'style amp-custom' is "
        "too long - document contains 75010 bytes whereas the limit is 75000 "
        "bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the stylesheet, 75009 bytes inline style with a relative URL.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[ExtraInlineBytesUrlTest]");
    // This string is 33 bytes of inline style inside a B tag.
    const std::string inline_33_bytes =
        "<b style=\"color: url('a-relative-url.html')\"></b>";
    // 2273 x 33 = 75009
    std::string inline_style = RepeatString(inline_33_bytes, /*n_times=*/2273);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":21:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75009 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)");

    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the stylesheet, 75009 bytes inline style with a data URL.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[ExtraInlineBytesUrlTest]");
    // This string is 33 bytes of inline style inside a B tag.
    const std::string inline_33_bytes =
        "<b style=\"color: url('data:nineteen-bytes')\"></b>";
    // 2273 x 33 = 75009
    std::string inline_style = RepeatString(inline_33_bytes, /*n_times=*/2273);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":21:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75009 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

TEST(ValidatorTest, TestTransformedAmpCssLengthWithUrls) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "transformed_feature_tests/css_length.html");
  const std::string test_template = test_case.input_content;

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const std::string valid_style_blob = "h1{top:0}\n";
  ASSERT_EQ(10, valid_style_blob.length());

  // 75010 bytes in the stylesheet, but includes an absolute URL of 19 bytes.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[MaxBytesWithUrlTest]");
    std::string url = "http://example.com/";
    ASSERT_EQ(19, url.length());
    std::string css_with_url = StrCat("a{b:url('", url, "')");
    ASSERT_EQ(30, css_with_url.length());
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7498), css_with_url);
    // 10 bytes over, 19 of which are the URL.
    EXPECT_EQ(75010, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75010 bytes in stylesheet, but includes a relative URL of 19 bytes.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[MaxBytesRelativeUrlTest]");
    std::string url = "a-relative-url.html";
    ASSERT_EQ(19, url.length());
    std::string css_with_url = StrCat("a{b:url('", url, "')");
    ASSERT_EQ(30, css_with_url.length());
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7498), css_with_url);
    // 10 bytes over, 19 of which are the URL.
    EXPECT_EQ(75010, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75010 bytes in the stylesheet, but includes a data URL of 19 bytes.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[MaxBytesDataUrlTest]");
    std::string url = "data:nineteen-bytes";
    ASSERT_EQ(19, url.length());
    std::string css_with_url = StrCat("a{b:url('", url, "')");
    ASSERT_EQ(30, css_with_url.length());
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7498), css_with_url);
    // 10 bytes over, 19 of which are the URL.
    EXPECT_EQ(75010, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":14:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 75010 bytes whereas "
        "the limit is 75000 bytes. (see "
        "https://amp.dev/documentation/guides-and-tutorials/learn/"
        "spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the stylesheet, 112530 bytes inline style with a relative URL.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[ExtraInlineBytesUrlTest]");
    // This string is 33 bytes of inline style inside a B tag.
    const std::string inline_33_bytes =
        "<b style=\"color: url('a-relative-url.html')\"></b>";
    // 3410 x 33 = 112530
    std::string inline_style = RepeatString(inline_33_bytes, /*n_times=*/3510);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = "PASS";
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the stylesheet, 112530 bytes inline style with a data URL.
  {
    std::string test_case_name =
        StrCat(test_case.name, "[ExtraInlineBytesUrlTest]");
    // This string is 33 bytes of inline style inside a B tag.
    const std::string inline_33_bytes =
        "<b style=\"color: url('data:nineteen-bytes')\"></b>";
    // 3410 x 33 = 112530
    std::string inline_style = RepeatString(inline_33_bytes, /*n_times=*/3410);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":21:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains "
        "112530 bytes whereas the limit is 112500 bytes. (see "
        "https://amp.dev/documentation/guides-and-tutorials/learn/spec/"
        "amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

TEST(ValidatorTest, ConsidersDifferentNewlines) {
  // In this test, we are looking to see if the sequences '\n', '\r', and
  // '\n\r' are all treated as a single newline. For our purposes we don't
  // care about validation at all, only the line number. We'll inspect the
  // first validation error to learn what it's line number is.
  {
    std::string test_html = "\ninvalid doc";
    std::string output = RenderResult(
        /*filename=*/"newline_test",
        amp::validator::Validate(test_html));
    EXPECT_TRUE(StartsWith(output, "FAIL\nnewline_test:1:0")) << output;
  }
  {
    std::string test_html = "\rinvalid doc";
    std::string output = RenderResult(
        /*filename=*/"newline_test",
        amp::validator::Validate(test_html));
    EXPECT_TRUE(StartsWith(output, "FAIL\nnewline_test:1:0")) << output;
  }
  {
    // Strangely the parse master will remove a leading \r\n from the document.
    // This is a problem, but only a minor one hopefully. I don't know why this
    // happens. To make this test still show what we want, I added a space
    // before the newline which avoids this issue.
    std::string test_html = " \r\ninvalid doc";
    std::string output = RenderResult(
        /*filename=*/"newline_test",
        amp::validator::Validate(test_html));
    EXPECT_TRUE(StartsWith(output, "FAIL\nnewline_test:1:1")) << output;
  }
}

// This test is a precaution for if/when amp-access is added to amp4ads.
// If amp-access is added for amp4ads then the reserializer also needs to be
// updated to mark the JSON offsets for it as it currently doesn't do this.
TEST(ValidatorTest, Amp4AdsAmpAccess) {
  ValidatorRules rules;
  CHECK(rules.ParseFromArray(
      amp::validator::data::kValidatorProtoBytes,
      amp::validator::data::kValidatorProtoBytesSize));
  for (const TagSpec& tag_spec : rules.tags()) {
    if ((tag_spec.tag_name() == "SCRIPT") &&
        (tag_spec.spec_name() == "amp-access extension .json script")) {
      for (const auto& html_format : tag_spec.html_format()) {
        EXPECT_NE(html_format, HtmlFormat::AMP4ADS);
      }
    }
  }
}

// This text uses `\xe2\x80\x90` as a hyphon in the amp-boilerplate attribute.
// This renders as a hyphen glyph, but should not be treated as such.
TEST(ValidatorTest, InvalidHyphenCharacter) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "feature_tests/minimum_valid_amp.html");
  std::string bad_html = StrReplaceAll(test_case.input_content,
                {{"amp-boilerplate", "amp\xE2\x80\x90 boilerplate"}});
  ValidationResult result = amp::validator::Validate(bad_html,
                                                     HtmlFormat::AMP);
  EXPECT_EQ(ValidationResult::FAIL, result.status());
}

// Checks that `type_identifiers` contains no duplicate items, and checks that
// every item of `type_identifiers` is in `valid_type_identifiers`.
void TypeIdentifiersAreValidAndUnique(
    const absl::flat_hash_set<std::string_view>& valid_type_identifiers,
    const google::protobuf::RepeatedPtrField<std::string>& type_identifiers,
    std::string_view field_name, std::string_view spec_type,
    std::string_view spec_name) {
  absl::flat_hash_set<std::string_view> encountered_type_identifiers;
  for (const std::string& type_identifier : type_identifiers) {
    EXPECT_TRUE(valid_type_identifiers.contains(type_identifier))
        << spec_type << " '" << spec_name << "' has " << field_name
        << " set to an invalid type identifier: '" << type_identifier << "'";
    EXPECT_FALSE(encountered_type_identifiers.contains(type_identifier))
        << spec_type << " '" << spec_name << "' has duplicate " << field_name
        << ": '" << type_identifier << "'";
    encountered_type_identifiers.insert(type_identifier);
  }
}

// Helper for ValidatorRulesMakeSense.
template <typename T>
void TypeIdentifiersShouldMakeSense(const T& spec, std::string_view spec_type,
                                    std::string_view spec_name) {
  absl::flat_hash_set<std::string_view> valid_type_identifiers = {
      "amp", "amp4ads", "amp4email", "transformed", "data-css-strict",
  };
  EXPECT_FALSE(spec.enabled_by_size() > 0 && spec.disabled_by_size() > 0)
      << spec_type << " '" << spec_name
      << "'  has both enabled_by and disabled_by set, but it must be one or "
         "the other, not both.";
  TypeIdentifiersAreValidAndUnique(valid_type_identifiers, spec.enabled_by(),
                                   "enabled_by", spec_type, spec_name);
  TypeIdentifiersAreValidAndUnique(valid_type_identifiers, spec.disabled_by(),
                                   "disabled_by", spec_type, spec_name);
}

TEST(ValidatorTest, RulesMakeSense) {
  ValidatorRules rules;
  rules.ParseFromArray(amp::validator::data::kValidatorProtoBytes,
                       amp::validator::data::kValidatorProtoBytesSize);
  EXPECT_GE(rules.tags_size(), 0) << "tags not defined";
  EXPECT_TRUE(rules.has_template_spec_url());

  // For verifying that all ReferencePoint::tag_spec_names will resolve to a
  // generated.TagSpec that's marked REFERENCE_POINT.
  absl::flat_hash_set<std::string_view> all_reference_points;
  for (const TagSpec& tag_spec : rules.tags()) {
    all_reference_points.insert(tag_spec.spec_name());
  }

  absl::flat_hash_set<std::string> encountered_spec_name;
  absl::flat_hash_set<int> encountered_name_id;
  absl::flat_hash_set<std::string_view> encountered_tag_without_spec_name;
  const RE2 tag_name_regex("(!DOCTYPE|O:P|[A-Z0-9-]+|\\$REFERENCE_POINT)");
  const RE2 disallowed_ancestor_regex("[A-Z0-9-]+");

  for (const TagSpec& tag_spec : rules.tags()) {
    // Helper for message output, set a tagspec_name in this order:
    // 1. tagSpec.specName, 2. tagSpec.tagName, 3. UNKNOWN_TAGSPEC.
    std::string_view tag_spec_name;
    if (tag_spec.has_spec_name()) {
      tag_spec_name = tag_spec.spec_name();
    } else if (tag_spec.has_tag_name()) {
      tag_spec_name = tag_spec.tag_name();
    } else {
      tag_spec_name = "UNKNOWN_TAGSPEC";
    }

    EXPECT_GT(tag_spec.html_format_size(), 0)
        << tag_spec_name << " must have at least one htmlFormat set";

    auto html_format = tag_spec.html_format();
    EXPECT_EQ(std::find(html_format.cbegin(), html_format.cend(),
                        HtmlFormat::UNKNOWN_CODE),
              html_format.cend())
        << "tagSpec.htmlFormat should never contain UNKNOWN_CODE"
        << ":\n" << tag_spec.DebugString();

    EXPECT_TRUE(tag_spec.has_tag_name());
    EXPECT_TRUE(RE2::PartialMatch(tag_spec.tag_name(), tag_name_regex));

    // spec_name can't be empty and must be unique.
    if (tag_spec.has_spec_name()) {
      const std::string spec_name = tag_spec.spec_name();
      EXPECT_FALSE(encountered_spec_name.contains(spec_name));
      encountered_spec_name.insert(spec_name);
    } else if (tag_spec.has_extension_spec()) {
      const std::string spec_name = tag_spec.extension_spec().name() + ' ' +
                                    tag_spec.extension_spec().version_name() +
                                    " extension script";
      EXPECT_FALSE(encountered_spec_name.contains(spec_name));
      encountered_spec_name.insert(spec_name);
    } else {
      const std::string_view tag_name = tag_spec.tag_name();
      EXPECT_FALSE(encountered_tag_without_spec_name.contains(tag_name));
      encountered_tag_without_spec_name.insert(tag_name);
    }

    if (tag_spec.tag_name() == "$REFERENCE_POINT") {
      EXPECT_TRUE(tag_spec.has_descriptive_name())
          << tag_spec_name
          << " needs a descriptive_name because it is a reference point";
    }
    if (tag_spec.enabled_by_size() > 0 || tag_spec.disabled_by_size() > 0) {
      TypeIdentifiersShouldMakeSense(tag_spec, "tag_spec", tag_spec_name);
    }
    if (tag_spec.has_named_id() &&
        tag_spec.named_id() != TagSpec_NamedId_NOT_SET) {
      EXPECT_FALSE(encountered_name_id.contains(tag_spec.named_id()));
      encountered_name_id.insert(tag_spec.named_id());
    }
    // Verify AMP4ADS extensions are approved.
    if (absl::StartsWith(tag_spec.tag_name(), "SCRIPT") &&
        tag_spec.has_extension_spec() &&
        absl::c_linear_search(tag_spec.html_format(),
                              HtmlFormat_Code_AMP4ADS)) {
      // AMP4ADS format lists approved extensions.
      // https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/amp-a4a-format.md#amp-extensions-and-builtins
      // Changes to the following map must be approved by the Ads Working
      // Group, @wg-monetization.
      const absl::flat_hash_map<absl::string_view,
                                absl::flat_hash_set<absl::string_view>>
          approved_amp4ads_extensions = {
              {"amp-accordion", {"0.1", "latest"}},
              {"amp-ad-exit", {"0.1", "latest"}},
              {"amp-analytics", {"0.1", "latest"}},
              {"amp-anim", {"0.1", "latest"}},
              {"amp-animation", {"0.1", "latest"}},
              {"amp-audio", {"0.1", "latest"}},
              {"amp-bind", {"0.1", "latest"}},
              {"amp-carousel", {"0.1", "0.2", "latest"}},
              {"amp-fit-text", {"0.1", "latest"}},
              {"amp-font", {"0.1", "latest"}},
              {"amp-form", {"0.1", "latest"}},
              {"amp-gwd-animation", {"0.1", "latest"}},
              {"amp-img", {"0.1", "latest"}},
              {"amp-layout", {"0.1", "latest"}},
              {"amp-lightbox", {"0.1", "latest"}},
              {"amp-mraid", {"0.1", "latest"}},
              {"amp-mustache", {"0.1", "0.2", "latest"}},
              {"amp-pixel", {"0.1", "latest"}},
              {"amp-position-observer", {"0.1", "latest"}},
              {"amp-selector", {"0.1", "latest"}},
              {"amp-social-share", {"0.1", "latest"}},
              {"amp-video", {"0.1", "latest"}},
          };
      const absl::string_view extension_name = tag_spec.extension_spec().name();
      ASSERT_TRUE(approved_amp4ads_extensions.contains(extension_name))
          << extension_name
          << " has html_format either explicitly or implicitly"
          << " set for AMP4ADS but " << extension_name << " is not approved"
          << " for AMP4ADS";
      const absl::flat_hash_set<absl::string_view>& approved_versions =
          approved_amp4ads_extensions.at(extension_name);
      for (const std::string& version : tag_spec.extension_spec().version()) {
        EXPECT_TRUE(approved_versions.contains(version))
            << extension_name
            << " has html_format either explicitly or implicitly set"
               " for AMP4ADS but "
            << extension_name << " version " << version
            << " is not approved for AMP4ADS. If this version is intended"
               " for AMP4ADS please get approval from @wg-monetization and then"
               " update this test. Otherwise remove the version for"
               " AMP4ADS from the tagspec";
      }
    }
    // Verify AMP4EMAIL extensions and their usage are approved.
    if (absl::StartsWith(tag_spec.tag_name(), "AMP-") &&
        absl::c_linear_search(tag_spec.html_format(),
                              HtmlFormat_Code::HtmlFormat_Code_AMP4EMAIL)) {
      // AMP4EMAIL format lists approved extensions.
      // Changes to the following map must be approved by the AMP4Email
      // Working Group, @wg-amp4email.
      const absl::flat_hash_map<absl::string_view,
                                absl::flat_hash_set<absl::string_view>>
          approved_amp4email_extensions = {
              {"AMP-ACCORDION", {"0.1"}}, {"AMP-AUTOCOMPLETE", {"0.1"}},
              {"AMP-ANIM", {"0.1"}},      {"AMP-BIND-MACRO", {"0.1"}},
              {"AMP-CAROUSEL", {"0.1"}},  {"AMP-FIT-TEXT", {"0.1"}},
              {"AMP-IMG", {"0.1"}},       {"AMP-IMAGE-LIGHTBOX", {"0.1"}},
              {"AMP-LAYOUT", {"0.1"}},    {"AMP-LIGHTBOX", {"0.1"}},
              {"AMP-LIST", {"0.1"}},      {"AMP-SELECTOR", {"0.1"}},
              {"AMP-SIDEBAR", {"0.1"}},   {"AMP-STATE", {"0.1"}},
              {"AMP-TIMEAGO", {"0.1"}},
          };
      ASSERT_TRUE(approved_amp4email_extensions.contains(tag_spec.tag_name()))
          << tag_spec.tag_name()
          << " has html_format either explicitly or implicitly"
             " set for AMP4EMAIL but "
          << tag_spec.tag_name() << " is not approved for AMP4EMAIL";
      const absl::flat_hash_set<absl::string_view>& approved_versions =
          approved_amp4email_extensions.at(tag_spec.tag_name());
      // Extension is approved. Verify extension version is approved.
      // Only care about SCRIPT tags since only those are versioned.
      if (absl::StartsWith(tag_spec.tag_name(), "SCRIPT") &&
          tag_spec.has_extension_spec()) {
        const absl::string_view extension_name =
            tag_spec.extension_spec().name();
        for (const std::string& version : tag_spec.extension_spec().version()) {
          EXPECT_TRUE(approved_versions.contains(version))
              << extension_name
              << " has html_format either explicitly or implicitly"
                 " set for AMP4EMAIL but "
              << extension_name << " version " << version
              << " is not approved for AMP4EMAIL. If this version is "
                 "intended"
                 " for AMP4EMAIL please get approval from @wg-amp4email and"
                 " then update this test. Otherwise remove the version for"
                 " AMP4EMAIL from the tagspec";
        }
      }
    }

    for (const std::string& disallowed_ancestor :
         tag_spec.disallowed_ancestor()) {
      EXPECT_TRUE(
          RE2::PartialMatch(disallowed_ancestor, disallowed_ancestor_regex))
          << "disallowed_ancestor defined and not equal to mandatory parent";
      if (tag_spec.has_mandatory_parent()) {
        EXPECT_NE(disallowed_ancestor, tag_spec.mandatory_parent())
            << "Can't disallow an ancestor and require the same parent";
      }
    }

    EXPECT_FALSE(tag_spec.unique() && tag_spec.unique_warning())
        << "unique and unique_warning can not be defined at the same time";

    if (tag_spec.explicit_attrs_only()) {
      EXPECT_FALSE(tag_spec.has_amp_layout())
          << "'" << tag_spec_name
          << "' has explicit_attrs_only set to true and must not have any "
             "amp_layouts";
    }

    // attr_specs within tag.
    absl::flat_hash_set<std::string_view> encountered_attr_name;
    for (const AttrSpec& attr_spec : tag_spec.attrs()) {
      const std::string_view attr_name = attr_spec.name();
      EXPECT_FALSE(encountered_attr_name.contains(attr_name))
          << "attr_name within tag_spec '" << tag_spec_name
          << "' should be unique";
      encountered_attr_name.insert(attr_name);

      // Transformed AMP does not allow `nonce` attributes, so it must have
      // disabled_by: "transformed" on the attrSpec or the tagSpec. Since this
      // attribute does not have an attrSpec then it must be on the tagSpec.
      // Verify that it is set on the tagSpec.
      if (attr_name == "nonce" &&
          absl::c_linear_search(tag_spec.html_format(),
                                HtmlFormat_Code::HtmlFormat_Code_AMP)) {
        EXPECT_TRUE(
            absl::c_linear_search(tag_spec.disabled_by(), "transformed"))
            << tag_spec_name
            << R"( nonce attributes must have `disabled_by: "transformed"`)";
      }
      if (attr_spec.enabled_by_size() > 0 || attr_spec.disabled_by_size() > 0) {
        TypeIdentifiersShouldMakeSense(attr_spec, "attr_spec",
                                       attr_spec.name());
      }

      // Special check that every <script> tag with a src attribute has a
      // allowlist check on the attribute value.
      if (tag_spec.tag_name() == "SCRIPT" && attr_spec.name() == "src") {
        EXPECT_TRUE(attr_spec.value_size() > 0 || attr_spec.has_value_regex())
            << tag_spec.tag_name()
            << " <script> tag with a src attribute need an allowlist check";
      }

      if (tag_spec.has_extension_spec()) {
        const ExtensionSpec& extension_spec = tag_spec.extension_spec();
        const RE2 version_regexp("^(latest|[0-9]+[.][0-9]+)$");
        EXPECT_TRUE(extension_spec.has_name())
            << "extension must have a name field value";
        // AMP4EMAIL extensions must support at least one version.
        if (absl::c_linear_search(tag_spec.html_format(),
                                  HtmlFormat_Code::HtmlFormat_Code_AMP4EMAIL)) {
          EXPECT_GT(extension_spec.version_size(), 0)
              << "extension " << extension_spec.name()
              << " must have at least one version";
        }
        for (const std::string& version_string : extension_spec.version()) {
          EXPECT_TRUE(RE2::PartialMatch(version_string, version_regexp))
              << "extension " << extension_spec.name()
              << " versions must be 'latest' or a numeric value";
        }
        for (const std::string& version_string :
             extension_spec.deprecated_version()) {
          EXPECT_TRUE(RE2::PartialMatch(version_string, version_regexp))
              << "extension " << extension_spec.name()
              << " versions must be 'latest' or a numeric value";
          EXPECT_TRUE(
              absl::c_linear_search(extension_spec.version(), version_string))
              << "extension " << extension_spec.name()
              << " deprecated_version must be a subset of version";
        }
        ASSERT_EQ(tag_spec.attr_lists_size(), 1);
        EXPECT_EQ(tag_spec.attr_lists(0), "common-extension-attrs");
      }
      if (tag_spec.has_cdata()) {
        bool useful_cdata_spec = false;
        EXPECT_GE(tag_spec.cdata().max_bytes(), -2);
        if (tag_spec.cdata().max_bytes() == -1) {
          useful_cdata_spec = true;
        }
        if (tag_spec.cdata().max_bytes() >= 0) {
          useful_cdata_spec = true;
          EXPECT_TRUE(tag_spec.cdata().has_max_bytes_spec_url())
              << "max_bytes >= 0 must have max_bytes_spec_url defined";
        }
        for (const DisallowedCDataRegex& disallowed_cdata_regex :
             tag_spec.cdata().disallowed_cdata_regex()) {
          useful_cdata_spec = true;
          EXPECT_TRUE(disallowed_cdata_regex.has_regex());
          EXPECT_TRUE(RE2(disallowed_cdata_regex.regex()).ok())
              << "disallowed_cdata_regex is not a valid regex";
          EXPECT_TRUE(disallowed_cdata_regex.has_error_message());
        }

        if (tag_spec.cdata().has_css_spec()) {
          useful_cdata_spec = true;
          absl::flat_hash_set<std::string_view> encountered_at_rule_spec_name;
          const RE2 at_rule_spec_regex("[a-z-_]*");
          const std::unordered_map<std::string,
                                   htmlparser::css::BlockType::Code>
              parsing_spec = GenCssParsingConfig().at_rule_spec;
          for (const AtRuleSpec& at_rule_spec :
               tag_spec.cdata().css_spec().at_rule_spec()) {
            EXPECT_TRUE(RE2::FullMatch(at_rule_spec.name(), at_rule_spec_regex))
                << "at_rule_spec must be lower case alphabetic";
            EXPECT_NE(parsing_spec.find(at_rule_spec.name()),
                      parsing_spec.cend())
                << "at_rule_spec must have matching css parsing spec. You "
                   "probably need to update the mapping in GenCssParsingConfig "
                   "to add support for your new at rule";
            if (at_rule_spec.has_media_query_spec()) {
              EXPECT_EQ(at_rule_spec.name(), "media")
                  << "only media atrule contains mediaQuerySpec";
            }
            EXPECT_FALSE(
                encountered_at_rule_spec_name.contains(at_rule_spec.name()));
            encountered_at_rule_spec_name.insert(at_rule_spec.name());
          }
        }
        if (tag_spec.tag_name() == "SCRIPT" || tag_spec.tag_name() == "STYLE") {
          EXPECT_TRUE(tag_spec.cdata().disallowed_cdata_regex_size() > 0 ||
                      tag_spec.cdata().has_cdata_regex() ||
                      tag_spec.cdata().has_mandatory_cdata() ||
                      tag_spec.cdata().max_bytes() == -1 ||
                      tag_spec.cdata().has_whitespace_only() ||
                      tag_spec.cdata().css_spec().validate_keyframes())
              << "script and style tags must have cdata rules";
        }
        // We want to be certain not to allow SCRIPT tagspecs which don't either
        // define a src attribute OR define a JSON, OCTET-STREAM, or TEXT/PLAIN
        // type. Note that OCTET-STREAM scripts can only be used during SwG
        // Encryption (go/swg-encryption).
        if (tag_spec.tag_name() == "SCRIPT") {
          bool has_src = false;
          bool has_json = false;
          bool has_text_plain = false;
          bool has_octet_stream = false;
          bool has_ciphertext = false;
          bool has_amp_onerror = false;
          bool has_amp_story_dvh_polyfill = false;
          for (const AttrSpec& attr_spec : tag_spec.attrs()) {
            if (attr_spec.name() == "src") {
              has_src = true;
            }
            if (attr_spec.name() == "ciphertext") {
              has_ciphertext = true;
            }
            if (attr_spec.name() == "type" &&
                attr_spec.value_casei_size() > 0) {
              for (const std::string& value : attr_spec.value_casei()) {
                if (value == "application/ld+json" ||
                    value == "application/json") {
                  has_json = true;
                }
                if (value == "application/octet-stream") {
                  has_octet_stream = true;
                }
                if (value == "text/plain") {
                  has_text_plain = true;
                }
              }
            }
            if (attr_spec.name() == "amp-onerror") {
              has_amp_onerror = true;
            }
            if (attr_spec.name() == "amp-story-dvh-polyfill") {
              has_amp_story_dvh_polyfill = true;
            }
          }
          EXPECT_TRUE(has_src || has_json || has_text_plain ||
                      (has_octet_stream && has_ciphertext) || has_amp_onerror ||
                      has_amp_story_dvh_polyfill)
              << "script tags must have either a src attribute or type json, "
                 "octet-stream (during SwG encryption), or text/plain";
        }
        if (tag_spec.cdata().has_cdata_regex() ||
            tag_spec.cdata().has_mandatory_cdata() ||
            tag_spec.cdata().has_whitespace_only()) {
          useful_cdata_spec = true;
        }
        EXPECT_TRUE(useful_cdata_spec) << "Tag spec '" << tag_spec_name
                                       << "' must define a useful cdata spec";
        EXPECT_TRUE(RE2(tag_spec.cdata().cdata_regex()).ok());
        for (const ReferencePoint& reference_point :
             tag_spec.reference_points()) {
          EXPECT_TRUE(
              all_reference_points.contains(reference_point.tag_spec_name()))
              << "reference_point '" << reference_point.tag_spec_name()
              << "' is not defined";
        }
      }
    }

    for (const auto& attr_spec : tag_spec.attrs()) {
      EXPECT_TRUE(attr_spec.has_name()) << attr_spec.DebugString();
      // Attribute Spec names are matched against lowercased attributes,
      // so the rules *must* also be lower case or non-cased.
      EXPECT_TRUE(RE2::FullMatch(attr_spec.name(), RE2("[^A-Z]+")))
          << attr_spec.DebugString();
      EXPECT_NE(attr_spec.name(), "[style]") << attr_spec.DebugString();
      if (attr_spec.has_value_url()) {
        for (const std::string& protocol : attr_spec.value_url().protocol()) {
          // UrlSpec protocol is matched against lowercased protocol names,
          // so the rules *must* also be lower case.
          EXPECT_TRUE(RE2::FullMatch(protocol, RE2("[a-z+-]+"))) << protocol;
        }
        if (!absl::StartsWith(attr_spec.name(), "data-") &&
            !absl::c_linear_search(
                tag_spec.html_format(),
                HtmlFormat_Code::HtmlFormat_Code_AMP4EMAIL)) {
          for (const std::string& protocol : attr_spec.value_url().protocol()) {
            if (protocol == "http" &&
                attr_spec.value_url().has_allow_relative()) {
              EXPECT_TRUE(attr_spec.value_url().allow_relative())
                  << attr_spec.value_url().DebugString();
            }
          }
        }
      }
      if (attr_spec.has_value_regex()) {
        EXPECT_TRUE(RE2(attr_spec.value_regex()).ok())
            << attr_spec.DebugString();
      }
      if (attr_spec.has_value_regex_casei()) {
        EXPECT_TRUE(RE2(attr_spec.value_regex_casei()).ok())
            << attr_spec.DebugString();
      }
      if (attr_spec.has_disallowed_value_regex()) {
        EXPECT_TRUE(RE2(attr_spec.disallowed_value_regex()).ok())
            << attr_spec.DebugString();
      }
      if (attr_spec.has_value_url()) {
        EXPECT_GT(attr_spec.value_url().protocol().size(), 0)
            << "value_url must have at least one protocol\n"
            << attr_spec.DebugString();
      }
      int num_values = 0;
      if (!attr_spec.value().empty()) {
        num_values += 1;
      }
      if (!attr_spec.value_casei().empty()) {
        num_values += 1;
      }
      if (attr_spec.has_value_regex()) {
        num_values += 1;
      }
      if (attr_spec.has_value_regex_casei()) {
        num_values += 1;
      }
      if (attr_spec.has_value_url()) {
        num_values += 1;
      }
      if (attr_spec.has_value_properties()) {
        num_values += 1;
      }
      EXPECT_LT(num_values, 2) << "attr_spec should only have one value set";
      if (attr_spec.name() == "id" && num_values == 0) {
        EXPECT_TRUE(attr_spec.has_disallowed_value_regex())
            << "'id' attribute must have 'disallowed_value_regex' set\n"
            << attr_spec.DebugString();
      }
      if (attr_spec.name() == "name" && num_values == 0) {
        EXPECT_TRUE(attr_spec.has_disallowed_value_regex())
            << "'name' attribute must have 'disallowed_value_regex' set\n"
            << attr_spec.DebugString();
      }
      if (attr_spec.has_deprecation()) {
        EXPECT_TRUE(attr_spec.has_deprecation_url());
      }
      if (attr_spec.has_deprecation_url()) {
        EXPECT_TRUE(attr_spec.has_deprecation());
      }
      if (attr_spec.has_dispatch_key()) {
        EXPECT_TRUE(attr_spec.mandatory() || attr_spec.has_mandatory_oneof());
      }
      if (attr_spec.has_value_properties()) {
        absl::flat_hash_set<std::string_view> encountered_property_spec_names;
        for (const PropertySpec& property_spec :
             attr_spec.value_properties().properties()) {
          EXPECT_FALSE(
              encountered_property_spec_names.contains(property_spec.name()))
              << "value_properties within attr_spec '" << attr_spec.name()
              << "' should be unique";
          encountered_property_spec_names.insert(property_spec.name());
        }
      }
      // Transformed AMP does not allow `nonce` attributes, so it must have
      // disabled_by: "transformed".
      if (attr_spec.name() == "nonce" &&
          absl::c_linear_search(tag_spec.html_format(), HtmlFormat_Code_AMP)) {
        EXPECT_TRUE(
            absl::c_linear_search(attr_spec.disabled_by(), "transformed"));
      }
    }
  }

  // satisfies needs to match up with requires and excludes
  absl::flat_hash_set<std::string> all_satisfies;
  absl::flat_hash_set<std::string> all_requires_and_excludes;
  for (const TagSpec& tag_spec : rules.tags()) {
    all_satisfies.insert(tag_spec.satisfies_condition().cbegin(),
                         tag_spec.satisfies_condition().cend());
    all_requires_and_excludes.insert(tag_spec.requires_condition().cbegin(),
                                     tag_spec.requires_condition().cend());
    all_requires_and_excludes.insert(tag_spec.excludes_condition().cbegin(),
                                     tag_spec.excludes_condition().cend());
  }
  for (const std::string& satisfy : all_satisfies) {
    EXPECT_TRUE(all_requires_and_excludes.contains(satisfy)) << satisfy;
  }
  for (const std::string& require_or_exclude : all_requires_and_excludes) {
    EXPECT_TRUE(all_satisfies.contains(require_or_exclude))
        << require_or_exclude;
  }

  absl::flat_hash_set<ValidationError_Code> encountered_error_specificity_code;
  for (const ErrorSpecificity& error_specificity : rules.error_specificity()) {
    EXPECT_FALSE(
        encountered_error_specificity_code.contains(error_specificity.code()))
        << "Error specificity code should be unique "
        << error_specificity.code();
    encountered_error_specificity_code.insert(error_specificity.code());
  }

  absl::flat_hash_set<ValidationError_Code> encountered_error_format_code;
  for (const ErrorFormat& error_format : rules.error_formats()) {
    EXPECT_FALSE(
        encountered_error_format_code.contains(error_format.code()))
        << "Error format code should be unique " << error_format.code();
    encountered_error_format_code.insert(error_format.code());
  }
}

}  // namespace
}  // namespace amp::validator
