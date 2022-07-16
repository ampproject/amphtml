// A binary which runs the validator over golden test input files and overwrites
// all output files. It is useful to update a bunch of test and then inspect
// the diff.

#include <fstream>

#include "absl/strings/str_replace.h"
#include "cpp/engine/testing-utils.h"
#include "cpp/engine/validator.h"

namespace amp::validator {
namespace {

void UpdateTests() {
  for (const auto& entry : testing::TestCases()) {
    const testing::TestCase& test_case = entry.second;
    ValidationResult result =
        Validate(test_case.input_content, test_case.html_format);
    std::string output_content = testing::RenderInlineResult(
        test_case.name, test_case.input_content, result);
    const std::string output_filename = absl::StrReplaceAll(
        test_case.output_file,
        {{"external/validator/testdata/", "validator/testdata/"},
         {"external/amphtml-extensions/", "extensions/"}});
    if (output_content == test_case.output_content) {
      std::cout << "Unchanged validation: " << output_filename << std::endl;
    } else {
      std::cout << "Updating validation: " << output_filename << std::endl;
      std::ofstream output_stream;
      output_stream.open(output_filename);
      output_stream << output_content;
      output_stream.close();
    }
  }
}

}  // namespace
}  // namespace amp::validator

int main(int argc, char* argv[]) {
  amp::validator::UpdateTests();
  return 0;
}
