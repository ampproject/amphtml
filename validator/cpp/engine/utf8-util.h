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

#ifndef AMPVALIDATOR__UTF8_UTIL_H_
#define AMPVALIDATOR__UTF8_UTIL_H_

#include <string>
#include <vector>

#include "absl/strings/cord.h"
#include "absl/strings/string_view.h"

namespace amp::validator::utf8_util {

// Returns the UTF16 string length of a UTF8 string buffer. Javascript encodes
// strings as UTF16, which results in different string lengths from UTF8 or byte
// lengths. UTF16 represents astral symbols as 2 surrogate pairs, with a length
// two. Note that this requires that the input is a well formed UTF8 string.
int64 Utf16StrLen(absl::string_view buf_utf8);
int64 Utf16StrLen(const absl::Cord& cord);

// Given a string |buf_utf8| stored as UTF8 characters, compute the
// byte offset into this string provided a |utf16_offset|.
// Returns -1 if |utf16_offset| is out of range.
int64 Utf16OffsetToByteOffset(absl::string_view buf_utf8, int64 utf16_offset);

// Simple class which lets us walk a vector of codepoints and tracking the
// indexes of those codepoints in UTF16 string space in parallel.
class CodePointTraverser {
 public:
  // |codes| must outlive CodePointTraverser.
  explicit CodePointTraverser(const std::vector<char32_t>* const codes);

  void TraverseTo(int traverse_to);
  int UTF16Position() const;

 private:
  int codepoint_idx_ = 0;
  int utf16_idx_ = 0;
  const std::vector<char32_t>* const codes_;
};

}  // namespace amp::validator::utf8_util

#endif  // AMPVALIDATOR__UTF8_UTIL_H_
