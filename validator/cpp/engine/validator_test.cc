#include <filesystem>
#include <fstream>
#include <memory>

#include "glog/logging.h"
#include "validator_pb.h"
namespace protocolbuffer = google::protobuf;

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

void MaybeGenerateFailuresFor(const std::string& output,
                              const std::string& expected,
                              const std::string& test_case_name) {
  if (output == expected) return;
  auto path = fs::path(test_case_name);
  path.replace_extension(".out");
  std::string out_file = path.string();
  ADD_FAILURE_AT(out_file.c_str(), 1) << "expected:\n"
                                      << expected << "\nsaw:\n"
                                      << output;
}

TEST(ValidatorTest, Testdata_ValidatorTest_TestCases) {
  for (const auto& entry : TestCases()) {
    const TestCase& test_case = entry.second;
    ValidationResult result = amp::validator::Validate(test_case.input_content,
                                                       test_case.html_format);
    std::string output;
    output = RenderInlineResult(
        /*filename=*/test_case.name, test_case.input_content,
        /*include_revisions=*/false, result);

    // If this fails, then an integrate command into a branch probably
    // went wrong.
    EXPECT_LE(55, result.spec_file_revision());
    MaybeGenerateFailuresFor(output, test_case.output_content, test_case.name);
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
        /*filename=*/test_case.name, /*include_revisions=*/false, result);
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
        /*filename=*/test_case.name, /*include_revisions=*/false, result);
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

  // 100000 bytes in the tested document.
  {
    std::string test_case_name = StrCat(test_case.name, "[MaxBytesTest]");
    std::string body = RepeatString(valid_body_content, /*n_times=*/4945);
    std::string test_html = TestWithDocSize(test_case.input_content, body);
    EXPECT_EQ(100000, test_html.length());
    EXPECT_EQ(
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL).status(),
        ValidationResult::PASS)
        << "test case " << test_case_name;
  }

  // 100001 bytes in the tested document.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneTest]");
    std::string body =
        StrCat(RepeatString(valid_body_content, /*n_times=*/4945), " ");
    std::string test_html = TestWithDocSize(test_case.input_content, body);
    EXPECT_EQ(100001, test_html.length());
    std::string output = RenderResult(
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":4978:6 "
        "Document exceeded 100000 bytes limit. Actual size 100001 bytes. "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":35:2 The inline script is 10001 bytes, which exceeds the limit of "
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
  const std::string valid_style_blob = "h1 {a: b}\n";
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":28:2 The author stylesheet specified in tag 'style amp-custom' is "
        "too long - document contains 75001 bytes whereas the limit is 75000 "
        "bytes. (see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "spec/amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 75002 bytes, but 74999 characters in stylesheet and 0 bytes inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[UTF8Test]");
    std::string stylesheet =
        StrCat(RepeatString(valid_style_blob, /*n_times=*/7499), "h1 {a: 😺}");
    EXPECT_EQ(75002, stylesheet.length());
    std::string test_html =
        TestWithCSS(test_case.input_content, stylesheet, "");
    std::string output = RenderResult(
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":28:2 The author stylesheet specified in tag 'style amp-custom' is "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":36:6 The author stylesheet specified in tag 'style amp-custom' "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":7536:6 The author stylesheet specified in tag 'style amp-custom' "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output =
        StrCat("FAIL\n", test_case_name,
               ":34:2 The inline style specified in tag 'div' is too long - "
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
  const std::string valid_style_blob = "h1 {a: b}\n";
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":28:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 75001 bytes whereas the "
        "limit is 75000 "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    // TODO(b/135278314): This test should pass but does not due to the doc
    // byte size limit of 100k. When AMP Email increases limit to 200k then
    // this test will go back to PASS.
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":34:6 Document exceeded 100000 bytes limit. Actual size 196140 bytes. "
        "(see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "email-spec/amp-email-format/?format=email)");
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    // TODO(b/153099987): This should not pass as we have more than 75,000 bytes
    // of inline style. Right now, it is a warning until we have sorted out how
    // to make the transition.
    // TODO(b/135278314): This test has a 100k error but should not once
    // AMP Email increases the doc byte size limit to 200k.
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":34:6 Document exceeded 100000 bytes limit. Actual size 196167 bytes. "
        "(see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "email-spec/amp-email-format/?format=email)\n",
        test_case_name,
        ":34:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75010 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)");
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    // TODO(b/153099987): This should not pass as we have more than 75,000 bytes
    // of inline style. Right now, it is a warning until we have sorted out how
    // to make the transition.
    std::string expected_output = StrCat(
        "PASS\n", test_case_name,
        ":7534:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75014 "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    // TODO(b/153679479): Email per-inline-style limits are currently enforced
    // only as a warning due to this bug until we sort out what the correct
    // value should be.
    std::string expected_output =
        StrCat("PASS\n", test_case_name,
               ":32:2 The inline style specified in tag 'div' is too long - it "
               "contains 1001 bytes whereas the limit is 1000 bytes. (see "
               "https://amp.dev/documentation/guides-and-tutorials/learn/spec/"
               "amphtml/#maximum-size)");
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":28:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 75001 bytes whereas the "
        "limit is 75000 "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":34:6 Document exceeded 100000 bytes limit. Actual size 196156 bytes. "
        "(see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "email-spec/amp-email-format/?format=email)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }

  // 0 bytes in the author stylesheet and 75010 bytes of inline style.
  {
    std::string test_case_name = StrCat(test_case.name, "[OffByOneInlineTest]");
    std::string inline_style = RepeatString(inline_10_bytes, /*n_times=*/7501);
    std::string test_html =
        TestWithCSS(test_case.input_content, "", inline_style);
    std::string output = RenderResult(
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":34:6 Document exceeded 100000 bytes limit. Actual size 196182 bytes. "
        "(see https://amp.dev/documentation/guides-and-tutorials/learn/"
        "email-spec/amp-email-format/?format=email)\n",
        test_case_name,
        ":34:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75010 "
        "bytes whereas the limit is 75000 bytes. (see https://amp.dev/"
        "documentation/guides-and-tutorials/learn/spec/amphtml/#maximum-size)");
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":3784:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains 75014 "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4EMAIL));
    std::string expected_output =
        StrCat("FAIL\n", test_case_name,
               ":32:2 The inline style specified in tag 'div' is too long - it "
               "contains 1001 bytes whereas the limit is 1000 bytes. (see "
               "https://amp.dev/documentation/guides-and-tutorials/learn/spec/"
               "amphtml/#maximum-size)");
    EXPECT_EQ(expected_output, output) << "test case " << test_case_name;
  }
}

TEST(ValidatorTest, TestCssLengthAmpAds) {
  const TestCase& test_case =
      FindOrDie(TestCases(), "amp4ads_feature_tests/css_length.html");
  const std::string test_template = test_case.input_content;

  // We use a blob of length 10 (both bytes and chars) to make it easy to
  // construct stylesheets of any length that we want.
  const std::string valid_style_blob = "h1 {a: b}\n";
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html, HtmlFormat::AMP4ADS));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":29:2 The author stylesheet specified in tag 'style amp-custom' "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
  const std::string valid_style_blob = "h1 {a: b}\n";
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":28:2 The author stylesheet specified in tag 'style amp-custom' "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":28:2 The author stylesheet specified in tag 'style amp-custom' "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":28:2 The author stylesheet specified in tag 'style amp-custom' is "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":36:6 The author stylesheet specified in tag 'style amp-custom' "
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":36:6 The author stylesheet specified in tag 'style amp-custom' "
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
  const std::string valid_style_blob = "h1 {a: b}\n";
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":29:2 The author stylesheet specified in tag 'style amp-custom' "
        "is too long - document contains 75010 bytes whereas "
        "the limit is 75000 bytes. (see "
        "https://amp.dev/documentation/guides-and-tutorials/learn/"
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = "PASS";
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
        /*filename=*/test_case_name, /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    std::string expected_output = StrCat(
        "FAIL\n", test_case_name,
        ":36:6 The author stylesheet specified in tag 'style amp-custom' "
        "and the combined inline styles is too large - document contains "
        "75009 bytes whereas the limit is 75000 bytes. (see "
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
        /*filename=*/"newline_test", /*include_revisions*/ false,
        amp::validator::Validate(test_html));
    EXPECT_TRUE(StartsWith(output, "FAIL\nnewline_test:1:0")) << output;
  }
  {
    std::string test_html = "\rinvalid doc";
    std::string output = RenderResult(
        /*filename=*/"newline_test", /*include_revisions*/ false,
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
        /*filename=*/"newline_test", /*include_revisions*/ false,
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

}  // namespace
}  // namespace amp::validator
