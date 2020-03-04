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

#include "url.h"

namespace htmlparser {

std::string_view URL::ProtocolStrict(std::string_view url) {
  for (int i = 0; i < url.size(); ++i) {
    char c = url[i];
    if (c == ':') {  // Protocol terminator.
      return url.substr(0, i);
    } else if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') ||
               (i > 0 && (('0' <= c && c <= '9') ||
                          c == '+' ||c == '-' || c == '.'))) {
      // Valid character, don't need to do anything.
    } else {
      return "";  // Invalid character for protocol, so give up.
    }
  }
  return "";  // No protocol found.
}

}  // namespace htmlparser
