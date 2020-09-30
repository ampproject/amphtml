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
#ifndef AMPVALIDATOR__TESTING_UTILS_H_
#define AMPVALIDATOR__TESTING_UTILS_H_

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
// - validator and spec file revision iff |include_revions|.
std::string RenderResult(const std::string& filename, bool include_revisions,
                         const amp::validator::ValidationResult& result);
// Like RenderResult, except inlines any error messages into the input document.
std::string RenderInlineResult(const std::string& filename,
                               const std::string& filecontents,
                               bool include_revisions,
                               const amp::validator::ValidationResult& result);

// Returns the test cases that are available to this test binary.
const std::map<std::string, TestCase>& TestCases();

}  // namespace amp::validator::testing


#endif  // AMPVALIDATOR__TESTING_UTILS_H_
