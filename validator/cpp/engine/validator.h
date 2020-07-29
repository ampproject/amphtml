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
// Usage:
//   - Familiarize with ValidationResult fields in validator.proto.
//
//   - For AMP html:
//     auto result = amp::validator::Validate(my_html,
//                       amp::validator::HtmlFormat::AMP);
//
//   - For other AMP html formats:
//     auto result = amp::validator::Validate(my_email_html,
//                       amp::validator::HtmlFormat::AMP4_EMAIL);
//
//   - To limit the number of errors, provide the extra optional parameter.
//     auto result = amp::validator::Validate(my_html,
//                       amp::validator::HtmlFormat::AMP, 10);
//
//     Above call will return upto 10 errors only.
//
//   - See scripts/basic_validator_example.cc for a working example.

#ifndef AMPVALIDATOR__VALIDATOR_H_
#define AMPVALIDATOR__VALIDATOR_H_

#include "validator.proto.h"
#include "../../validator.proto.h"

namespace amp::validator {

ValidationResult Validate(std::string_view html,
                          HtmlFormat_Code html_format = HtmlFormat::AMP,
                          int max_errors = -1);

ValidatorInfo Info();

}  // namespace amp::validator

#endif  // AMPVALIDATOR__VALIDATOR_H_
