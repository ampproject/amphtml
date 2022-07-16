// AMP Validator client library to validate if given html is a valid AMP
// document.
//
// A utility for formatting AMP Validator errors. This is useful
// because ValidationError proto messages only carry an error code and
// parameters; so to assemble messages one needs to use the appropriate
// format string from third_party/javascript/amp_validator/validator.protoascii,
// then call the ErrorFormatter::ApplyFormat function.
//
// A Java port is available: java/com/google/amp/validator/ErrorFormatter.java.
#ifndef CPP_ENGINE_ERROR_FORMATTER_H_
#define CPP_ENGINE_ERROR_FORMATTER_H_

#include <string>

#include "validator.pb.h"

namespace amp::validator {
// TODO(johannes): Port more of
// java/com/google/amp/validator/ErrorFormatter.java.
class ErrorFormatter {
 public:
  // Applies the |format| string to the |error.params|, to make a
  // formatted error message. Within the format string, %[1-9] are the
  // parameters, %% is interpreted as %.
  static std::string ApplyFormat(const std::string& format,
                                 const ValidationError& error);

  // Provided a ValidationError instance, looks up the appropriate
  // format string based on the code and applies it to the params,
  // to make a formatted message. |error| is the error for which to
  // compute the formatted message. Returns a formatted error message
  // or the empty string if anything goes wrong.
  static std::string FormattedMessageFor(const ValidationError& error);

 private:
  ErrorFormatter(const ErrorFormatter&) = delete;
  ErrorFormatter& operator=(const ErrorFormatter&) = delete;
};
}  // namespace amp::validator

#endif  // CPP_ENGINE_ERROR_FORMATTER_H_
