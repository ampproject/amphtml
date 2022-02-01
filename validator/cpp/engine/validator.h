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

#ifndef CPP_ENGINE_VALIDATOR_H_
#define CPP_ENGINE_VALIDATOR_H_

#include "cpp/htmlparser/css/parse-css.h"
#include "cpp/htmlparser/document.h"
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
htmlparser::css::CssParsingConfig GenCssParsingConfig();

}  // namespace amp::validator

#endif  // CPP_ENGINE_VALIDATOR_H_
