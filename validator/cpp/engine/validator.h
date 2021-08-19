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

#include "document.h"
#include "validator.pb.h"

namespace amp::validator {

ValidationResult Validate(const htmlparser::Document& document,
                          HtmlFormat_Code html_format = HtmlFormat::AMP,
                          int max_errors = -1);

ValidationResult Validate(std::string_view html,
                          HtmlFormat_Code html_format = HtmlFormat::AMP,
                          int max_errors = -1);

int RulesSpecVersion();
int ValidatorVersion();

}  // namespace amp::validator

#endif  // AMPVALIDATOR__VALIDATOR_H_
