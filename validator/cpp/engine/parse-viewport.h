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

#ifndef AMPVALIDATOR__PARSE_VIEWPORT_H_
#define AMPVALIDATOR__PARSE_VIEWPORT_H_

#include <map>
#include <string>

namespace amp::validator::parse_viewport {
// Parses |content| using the algorithm described at
// https://drafts.csswg.org/css-device-adapt/#parsing-algorithm.
// This algorithm was originally written down to parse the content
// of a viewport meta tag, like
// <meta name='viewport' content='a=b,c=d'>
// but can be useful for parsing other lists of key/value pairs as well.
//
// The keys returned by this function are lower-cased,
// to make it easy to implement case-insensitive lookup.
// The values returned by this function remain as is.
std::map<std::string, std::string> ParseContent(const std::string& content);
}  // namespace amp::validator::parse_viewport

#endif  // AMPVALIDATOR__PARSE_VIEWPORT_H_
