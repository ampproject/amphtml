#ifndef CPP_ENGINE_UTF8_UTIL_H_
#define CPP_ENGINE_UTF8_UTIL_H_

#include <string>
#include <vector>
#include "absl/strings/string_view.h"

namespace amp::validator::utf8_util {

// Returns the UTF16 string length of a UTF8 string buffer. Javascript encodes
// strings as UTF16, which results in different string lengths from UTF8 or byte
// lengths. UTF16 represents astral symbols as 2 surrogate pairs, with a length
// two. Note that this requires that the input is a well formed UTF8 string.
int64_t Utf16StrLen(absl::string_view buf_utf8);

// Given a string |buf_utf8| stored as UTF8 characters, compute the
// byte offset into this string provided a |utf16_offset|.
// Returns -1 if |utf16_offset| is out of range.
int64_t Utf16OffsetToByteOffset(absl::string_view buf_utf8,
                                int64_t utf16_offset);

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

#endif  // CPP_ENGINE_UTF8_UTIL_H_
