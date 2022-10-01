#ifndef CPP_ENGINE_TESTING_UTILS_H_
#define CPP_ENGINE_TESTING_UTILS_H_

#include <map>

#include "validator.pb.h"

namespace amp::validator::testing {

// An end-to-end test case. This is also used to test the serializer.
struct TestCase {
  std::string name;
  std::string input_file;
  std::string output_file;
  std::string input_content;
  std::string output_content;
  ::amp::validator::HtmlFormat::Code html_format;
};


// Emits message, spec url, and category.
std::string RenderError(const amp::validator::ValidationError& error);

// Emits:
// - overall status
// - filename, line, col, rendered error for each error
std::string RenderResult(const std::string& filename,
                         const amp::validator::ValidationResult& result);
// Like RenderResult, except inlines any error messages into the input document.
std::string RenderInlineResult(const std::string& filename,
                               const std::string& filecontents,
                               const amp::validator::ValidationResult& result);

// Returns the test cases that are available to this test binary.
const std::map<std::string, TestCase>& TestCases();

}  // namespace amp::validator::testing


#endif  // CPP_ENGINE_TESTING_UTILS_H_
