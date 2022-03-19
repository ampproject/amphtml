#ifndef CPP_ENGINE_WASM_VALIDATOR_INNER_WRAPPER_H_
#define CPP_ENGINE_WASM_VALIDATOR_INNER_WRAPPER_H_

#include <string>

#include "validator.pb.h"

namespace amp::validator {

// Validates an AMP document, and returns validation result. The return value is
// a base64-encoded protobuf message.
std::string ValidateString(std::string html, std::string html_format_name,
                           int max_errors);

// Renders a validation error. The input is a base64-encoded protobuf struct
// amp.validator.ValidationError.
std::string RenderErrorMessage(std::string error_base64);

// Renders the validation result with the input contents. The parameter
// `validation_result_base64` is the base64-encoded protobuf ValidationResult.
std::string RenderInlineResult(std::string validation_result_base64,
                               std::string filename,
                               std::string input_contents);

}  // namespace amp::validator

#endif  // CPP_ENGINE_WASM_VALIDATOR_INNER_WRAPPER_H_
