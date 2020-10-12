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

#ifndef AMPVALIDATOR__KEYFRAMES_PARSE_CSS_H_
#define AMPVALIDATOR__KEYFRAMES_PARSE_CSS_H_

#include <string>
#include <vector>

#include "css/parse-css.h"
//
// This is *not* meant to be a public API.
//
// We are just separating this functionality into its own library
// which is called from validator.cc. The format for calling this
// will change, especially once we allow more generic configuration
// for these checks.
//
// The draft specification for Keyframes is located here:
// https://github.com/ampproject/amphtml/issues/9625
//
namespace amp::validator::parse_css {
// Validates the provided |stylesheet|, emitting into |errors|.
void ValidateKeyframesCss(
    const htmlparser::css::Stylesheet& stylesheet,
    std::vector<std::unique_ptr<htmlparser::css::ErrorToken>>* errors);
}  // namespace amp::validator::parse_css

#endif  // AMPVALIDATOR__KEYFRAMES_PARSE_CSS_H_
