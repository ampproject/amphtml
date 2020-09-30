//
// Copyright 2020 The AMP HTML Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the license.
//
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
#ifndef AMPVALIDATOR__ERROR_FORMATTER_H_
#define AMPVALIDATOR__ERROR_FORMATTER_H_

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

#endif  // AMPVALIDATOR__ERROR_FORMATTER_H_
