#include "cpp/engine/utf8-util.h"

#include "absl/strings/string_view.h"
#include "cpp/htmlparser/logging.h"
#include "cpp/htmlparser/strings.h"

using absl::string_view;
using std::vector;

namespace amp::validator::utf8_util {

int64_t Utf16StrLen(string_view buf_utf8) {
  int64_t utf16_str_len = 0;
  for (int i = 0; i < buf_utf8.size(); ++i) {
    // Javascript counts strings as UTF-16 characters. 1, 2, and 3-byte UTF-8
    // characters are length 1 in UTF-16 whereas 4-byte UTF-8 characters are
    // length 2.
    //
    // This little formula works on UTF-8 byte headers. We know that the
    // first byte in a UTF-8 char encodes the length of the character in
    // bits as a header of 1's followed by a single 0. The later bytes in
    // the character all start with the bits '10'.
    // https://en.wikipedia.org/wiki/UTF-8#Description
    //
    // First, we right shift the least significant 3 bits and mask out the
    // last bit. This gives us the 000XXXX0 which can range between 0 and 30.
    // 0x95005555 is essentially a lookup table, which we shift by that the
    // lookup key in 000XXXX0 and then keep only the bottom two bits by
    // masking by 3.
    // 0x95005555 = 10010101000000000101010101010101
    // 0x95005555 >> 00011110 (30) & 3 = 10  // 4-byte header
    // 0x95005555 >> 00011100 (28) & 3 = 01  // 3-byte header
    // 0x95005555 >> 00011010 (26) & 3 = 01  // 2-byte header
    // 0x95005555 >> 00011000 (24) & 3 = 01  // 2-byte header
    // 0x95005555 >> 00010110 (22) & 3 = 00  // non-leading byte
    // 0x95005555 >> 00010100 (20) & 3 = 00  // non-leading byte
    // 0x95005555 >> 00010010 (18) & 3 = 00  // non-leading byte
    // 0x95005555 >> 00010000 (16) & 3 = 00  // non-leading byte
    // 0x95005555 >> 00001110 (14) & 3 = 01  // 1 byte ascii
    // 0x95005555 >> 00001100 (12) & 3 = 01  // 1 byte ascii
    // 0x95005555 >> 00001010 (10) & 3 = 01  // 1 byte ascii
    // 0x95005555 >> 00001000 (8)  & 3 = 01  // 1 byte ascii
    // 0x95005555 >> 00000110 (6)  & 3 = 01  // 1 byte ascii
    // 0x95005555 >> 00000100 (4)  & 3 = 01  // 1 byte ascii
    // 0x95005555 >> 00000010 (2)  & 3 = 01  // 1 byte ascii
    // 0x95005555 >> 00000000 (0)  & 3 = 01  // 1 byte ascii
    utf16_str_len += ((0x95005555) >> ((buf_utf8[i] >> 3) & 30)) & 3;
  }
  return utf16_str_len;
}

int64_t Utf16OffsetToByteOffset(string_view buf_utf8, int64_t utf16_offset) {
  int64_t utf16_str_len = 0;
  int byte_pos = 0;
  while (utf16_str_len < utf16_offset) {
    if (byte_pos >= static_cast<int64_t>(buf_utf8.size())) return -1;
    const int utf8_char_len =
        htmlparser::Strings::CodePointByteSequenceCount(buf_utf8[byte_pos]);
    if (utf8_char_len == 4)  // 4 byte UTF8 char -> 2 byte UTF16 char
      utf16_str_len += 2;
    else  // 1,2,3 byte UTF8 char -> 1 byte UTF16 char
      ++utf16_str_len;
    byte_pos += utf8_char_len;
  }
  return byte_pos;
}

//
// Implementation of CodePointTraverser
//
CodePointTraverser::CodePointTraverser(const vector<char32_t>* const codes)
    : codes_(codes) {}

void CodePointTraverser::TraverseTo(int traverse_to) {
  CHECK_GE(traverse_to, codepoint_idx_);
  while (codepoint_idx_ < traverse_to) {
    CHECK_LT(codepoint_idx_, codes_->size());
    utf16_idx_ += ((*codes_)[codepoint_idx_] >= 0x00010000 ? 2 : 1);
    codepoint_idx_++;
  }
}

int CodePointTraverser::UTF16Position() const { return utf16_idx_; }
}  // namespace amp::validator::utf8_util
