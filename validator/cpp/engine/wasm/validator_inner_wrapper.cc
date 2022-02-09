#include "cpp/engine/wasm/validator_inner_wrapper.h"

#include <string_view>

#include "absl/strings/escaping.h"
#include "cpp/engine/error-formatter.h"
#include "cpp/engine/testing-utils.h"
#include "cpp/engine/validator.h"
#include "validator.pb.h"

namespace amp::validator {

std::string ValidateString(std::string html, std::string html_format_name,
                           int max_errors) {
  HtmlFormat::Code html_format_code;
  HtmlFormat::Code_Parse(html_format_name, &html_format_code);
  auto validation_result =
      Validate(std::string_view(html), html_format_code, max_errors);
  return absl::Base64Escape(validation_result.SerializeAsString());
}

std::string RenderErrorMessage(std::string error_base64) {
  std::string error_binary;
  absl::Base64Unescape(error_base64, &error_binary);
  ValidationError error;
  error.ParseFromString(error_binary);
  return ErrorFormatter::FormattedMessageFor(error);
}

std::string RenderInlineResult(std::string validation_result_base64,
                               std::string filename,
                               std::string input_contents) {
  std::string validation_result_binary;
  absl::Base64Unescape(validation_result_base64, &validation_result_binary);
  ValidationResult validation_result;
  validation_result.ParseFromString(validation_result_binary);
  return testing::RenderInlineResult(filename, input_contents,
                                     validation_result);
}

}  // namespace amp::validator
