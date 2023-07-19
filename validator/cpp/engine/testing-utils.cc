// AMP Validator client library to validate if given html is a valid AMP
// document.

#include <filesystem>

#include "cpp/htmlparser/logging.h"
#include "cpp/engine/testing-utils.h"
#include "cpp/engine/error-formatter.h"
#include "absl/strings/substitute.h"
#include "absl/strings/str_cat.h"
#include "cpp/htmlparser/fileutil.h"
#include "cpp/htmlparser/strings.h"
#include "absl/strings/ascii.h"
#include "absl/strings/strip.h"

namespace fs = std::filesystem;

namespace amp::validator::testing {

namespace {
std::string RelativeToTestdataOrExtensions(const std::string& test_file) {
  int idx = test_file.find("testdata/");
  if (idx != std::string::npos)
    return test_file.substr(idx + std::string("testdata/").size());
  idx = test_file.find("extensions/");
  if (idx == std::string::npos) return test_file;
  return test_file.substr(idx + std::string("extensions/").size());
}
}  // namespace

std::string RenderError(const ValidationError& error) {
  std::string out = ErrorFormatter::FormattedMessageFor(error);
  if (error.has_spec_url())
    absl::SubstituteAndAppend(&out, " (see $0)", error.spec_url());
  return out;
}

std::string RenderErrorWithPosition(const std::string& filename,
                                    const ValidationError& error) {
  // Filename, line, column, message, spec url.
  return absl::Substitute("$0:$1:$2 $3", filename, error.line(), error.col(),
                          RenderError(error));
}

std::string RenderResult(const std::string& filename,
                         const ValidationResult& result) {
  std::string out;
  absl::StrAppend(&out, ValidationResult::Status_Name(result.status()));
  for (const ValidationError& error : result.errors()) {
    absl::StrAppend(&out, "\n", RenderErrorWithPosition(filename, error));
  }
  return out;
}

std::string RenderInlineResult(const std::string& filename,
                               const std::string& filecontents,
                               const ValidationResult& result) {
  std::string out;
  absl::StrAppend(&out, ValidationResult::Status_Name(result.status()));
  std::vector<std::string> lines = absl::StrSplit(filecontents, '\n');
  int lines_emitted = 0;
  for (const ValidationError& error : result.errors()) {
    // Emit all input lines up to and including the line containing the error,
    // prefexed with "|  " (or just "|" if the line is empty").
    while (lines_emitted < error.line() && lines_emitted < lines.size()) {
      absl::StrAppend(&out, "\n|");
      if (!lines[lines_emitted].empty()) {
        absl::SubstituteAndAppend(&out, "  $0", lines[lines_emitted]);
      }
      lines_emitted++;
    }
    // Emit a carat showing the column of the following error.
    absl::StrAppend(&out, "\n>>");
    for (int i = 0; i < error.col() + 1; ++i) absl::StrAppend(&out, " ");
    absl::StrAppend(&out, "^~~~~~~~~\n");
    absl::StrAppend(&out, RenderErrorWithPosition(filename, error));
  }
  while (lines_emitted < lines.size()) {
    absl::StrAppend(&out, "\n|");
    if (!lines[lines_emitted].empty()) {
      absl::SubstituteAndAppend(&out, "  $0", lines[lines_emitted]);
    }
    lines_emitted++;
  }
  return out;
}

const std::map<std::string, TestCase>& TestCases() {
  static const std::map<std::string, TestCase>* const test_cases = [] {
    std::vector<std::string> tl;
    std::vector<TestCase> cases;
    std::vector<std::string> html_files;
    CHECK(htmlparser::FileUtil::Glob(
           "testdata/*/*.html",
           &html_files)) << "Test cases file pattern not found.";
    CHECK(htmlparser::FileUtil::Glob(
           "external/amphtml-extensions/*/*/test/*.html",
            &html_files)) << "Test cases file pattern not found.";

    CHECK(!html_files.empty()) << "Validator test cases are empty. Will not proceed.";
    
    std::sort(html_files.begin(), html_files.end());
    for (const std::string& html_file : html_files) {
      if (html_file.find("/js_only/") != std::string::npos) continue;

      TestCase test_case;
      if (html_file.find("/amp4ads_feature_tests/") != std::string::npos ||
          html_file.find("/validator-amp4ads-") != std::string::npos) {
        test_case.html_format = HtmlFormat::AMP4ADS;
      } else if (html_file.find("/amp4email_feature_tests/") !=
                     std::string::npos ||
                 html_file.find("/validator-amp4email-") != std::string::npos) {
        test_case.html_format = HtmlFormat::AMP4EMAIL;
      } else {
        test_case.html_format = HtmlFormat::AMP;
      }

      test_case.input_file = html_file;
      test_case.name = RelativeToTestdataOrExtensions(html_file);
      test_case.input_content = htmlparser::FileUtil::FileContents(html_file);
      // Note that javascript trim doesn't trim newlines
      absl::StripTrailingAsciiWhitespace(&test_case.input_content);
      htmlparser::Strings::StripTrailingNewline(&test_case.input_content);
      fs::path html_file_path = html_file;
      fs::path output_file_path = html_file_path.parent_path();
      output_file_path += "/";
      output_file_path += html_file_path.stem();
      output_file_path += ".out";
      // Special case where cpp engine output differs from javascript.
      fs::path cpp_only_out_file_path = output_file_path;
      cpp_only_out_file_path += ".cpponly";
      if (fs::exists(cpp_only_out_file_path)) {
        test_case.output_file = cpp_only_out_file_path.string();
      } else {
        test_case.output_file = output_file_path.string();
      }
      test_case.output_content =
          htmlparser::FileUtil::FileContents(test_case.output_file);
      htmlparser::Strings::StripTrailingNewline(&test_case.output_content);
      cases.emplace_back(std::move(test_case));
    }
    std::map<std::string, TestCase>* test_cases_by_name =
        new std::map<std::string, TestCase>;
    for (const TestCase& t : cases)
      CHECK(test_cases_by_name->emplace(t.name, t).second)
          << "duplicate name: " << t.name;
    return test_cases_by_name;
  }();

  return *test_cases;
}

}  // namespace amp::validator::testing
