//
// Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

#ifndef HTMLPARSER__HASH_H_
#define HTMLPARSER__HASH_H_

#include <string_view>

namespace htmlparser {

// Source: https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function
class Hash {
 public:
  static uint32_t FNVHash(std::string_view s, uint32_t h = 2166136261) {
    for (unsigned char c : s) {
      h ^= c;
      h *= 16777619;  // FNV prime.
    }
    return h;
  }

  static uint64_t FNVHash64(std::string_view s,
                            uint64_t h = 14695981039346656037u) {
    for (unsigned char c : s) {
      h ^= c;
      h *= 1099511628211;  // FNV prime.
    }
    return h;
  }

  // FNV-1a. Alternate. Same as above except the order of XOR and multiply
  // is reversed.
  static uint64_t FNV_AHash64(std::string_view s,
                              uint64_t h = 14695981039346656037u) {
    for (unsigned char c : s) {
      h *= 1099511628211;  // FNV prime.
      h ^= c;
    }
    return h;
  }

 private:
  // No objects of this class.
  Hash() = delete;
};

}  // namespace htmlparser

#endif  // HTMLPARSER__HASH_H_
