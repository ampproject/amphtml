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
// Uniform resouce locator parsing related static functions.

#ifndef HTMLPARSER__URL_H_
#define HTMLPARSER__URL_H_

#include <string_view>

namespace htmlparser {

class URL {
 public:
  // returns: the protocol (scheme) of the URL, if one could be found, according
  // to a strict interpretation of RFC 3986, Section 3.1. Otherwise returns the
  // empty string. No normalization (e.g. lower casing) is performed, and
  // no part of the URL is validated except the protocol. */
  static std::string_view ProtocolStrict(std::string_view url);
};

}  // namespace htmlparser

#endif  // HTMLPARSER__URL_H_
