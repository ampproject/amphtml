#ifndef CPP_HTMLPARSER_UTF8_H_
#define CPP_HTMLPARSER_UTF8_H_

#include <array>

namespace htmlparser {

// Is this an ascii character, that is byte is code-point in itself.
// (0..0x7f).
#define IS_ASCII(c) (c & 0x80) == 0

// Is this ascii char and a digit.
#define IS_DIGIT(c) (static_cast<uint8_t>(c - 0x30) < 0xa)

#define IS_ALPHABET(c) \
  ((static_cast<uint8_t>(c - 0x41) < 0x1a) || \
   (static_cast<uint8_t>(c - 0x61) < 0x1a))

// Is this code point a Unicode non-character
#define IS_CODEPOINT_NONCHAR(c) \
    ((c) >= 0xfdd0 && \
     ((c) <= 0fdef || ((c) & 0xfffe) == 0xfffe) && (c) <= 0x10ffff)

#define IS_CODEPOINT_CHAR(c) \
    (static_cast<uint32_t>(c) < 0Xd800 || \
        (0Xdfff < c && c <= 0x10ffff && !IS_UNICODE_NONCHAR(c)))

// Counts number of continuation bytes for this codepoint.
#define NUM_TRAIL_BYTES(c) \
    (IS_LEAD_BYTE(c) ? \
        ((static_cast<uint8_t>(c) >= 0xe0) + \
         (static_cast<uint8_t>(c) >= 0xf0) + 1) \
        : 0)

#define LEAD_BYTE_TRAIL_COUNT(c) \
    ((static_cast<uint8_t>(c) >= 0xc2) + \
     (static_cast<uint8_t>(c) >= 0xe0) + \
     (static_cast<uint8_t>(c) >= 0xf0))

#define CODE_POINT_NUM_BYTES(c) \
    (static_cast<uint32_t>(c) <= 0x7f ? 1 : \
        (static_cast<uint32_t>(c) <= 0x7ff ? 2 : \
            (static_cast<uint32_t>(c) <= 0xd7ff ? 3 : \
                (static_cast<uint32_t>(c) <= 0xdfff || \
                 static_cast<uint32_t>(c) > 0x10ffff ? 0 : \
                    (static_cast<uint32_t>(c) <= 0xffff ? 3 : 4) \
                ) \
            ) \
        ) \
    )

#define READ_TRAIL_BYTE(c) \
  (((static_cast<uint8_t>(c) & 0xc0) == 0x80) ? \
        (c) & 0x3f : 0)

// Valid utf-8 byte sequences and their validity macros.
// Ref: Table 3.7 in https://www.unicode.org/versions/Unicode14.0.0/ch03.pdf
// +-------------------+------------+-------------+------------+-------------+
// | Code Points       | First Byte | Second Byte | Third Byte | Fourth Byte |
// +-------------------+------------+-------------+------------+-------------+
// | U+0000..U+007F    |   00..7F   |             |            |             |
// +-------------------+------------+-------------+------------+-------------+
// | U+0080..U+07FF    |   C2..DF   |   80..BF    |            |             |
// +-------------------+------------+-------------+------------+-------------+
// | U+0800..U+0FFF    |   E0       |   A0..BF    |  80..BF    |             |
// +-------------------+------------+-------------+------------+-------------+
// | U+1000..U+CFFF    |   E1..EC   |   80..BF    |  80..BF    |             |
// +-------------------+------------+-------------+------------+-------------+
// | U+D000..U+D7FF    |   ED       |   80..9F    |  80..BF    |             |
// +-------------------+------------+-------------+------------+-------------+
// | U+E000..U+FFFF    |   EE..EF   |   80..BF    |  80..BF    |             |
// +-------------------+------------+-------------+------------+-------------+
// | U+10000..U+3FFFF  |   F0       |   90..BF    |  80..BF    |    80..BF   |
// +-------------------+------------+-------------+------------+-------------+
// | U+40000..U+FFFFF  |   F1..F3   |   80..BF    |  80..BF    |    80..BF   |
// +-------------------+------------+-------------+------------+-------------+
// | U+100000..U+10FFFF|   F4       |   80..8F    |  80..BF    |    80..BF   |
// +-------------------+------------+-------------+------------+-------------+

static constexpr std::array<uint8_t, 16> k3ByteTrailByteValidity {
  0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
  0x10, 0x30, 0x30
};

static constexpr std::array<uint8_t, 16> k4ByteTrailByteValidity {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1E, 0x0F, 0x0F, 0x0F, 0x00,
  0x00, 0x00, 0x00
};

// Is utf-8 lead byte (0xc2..0xf4).
#define IS_UTF8_LEAD_BYTE(c) (static_cast<uint8_t>(c - 0xc2) <= 0x32)

// Is utf-8 trail byte (0x80..0xBF).
#define IS_UTF8_TRAIL_BYTE(c) (static_cast<int8_t>(c) < -0x40)

// Is utf-8 trail second byte valid.
#define IS_UTF8_TRAIL_2ND_BYTE_VALID(lead_byte, trail_byte) \
    lead_byte < 0xe0 ? \
      IS_UTF8_TRAIL_BYTE(trail_byte) : \
      htmlparser::k3ByteTrailByteValidity[lead_byte & 0xf] & \
      (1 << (static_cast<uint8_t>(trail_byte) >> 5))

#define IS_UTF8_TRAIL_3RD_BYTE_VALID(lead_byte, trail_byte) \
  lead_byte >= 0xf0 ? \
  htmlparser::k4ByteTrailByteValidity[static_cast<uint8_t>(trail_byte) >> 4] & \
  (1 << (lead_byte & 7)) : 0

#define _DECODE_UTF8_2(c1, c2) \
  ((c1 & 0b11111) << 6) | READ_TRAIL_BYTE(c2)

#define _DECODE_UTF8_3(c1, c2, c3) \
  ((c1 & 0b1111) << 12) | (c2 << 6) | c3

#define _DECODE_UTF8_4(c1, c2, c3, c4) \
  ((c1 & 0b111) << 18) | \
    (READ_TRAIL_BYTE(c2) << 12) | \
      (READ_TRAIL_BYTE(c3) << 6) | \
        READ_TRAIL_BYTE(c4)

#define _DECODE_UTF8_X(x, A, B, C, D, FUNC, ...) FUNC

#define TO_CODEPOINT(...) \
  _DECODE_UTF8_X(, ##__VA_ARGS__, \
    _DECODE_UTF8_4(__VA_ARGS__), \
      _DECODE_UTF8_3(__VA_ARGS__), \
        _DECODE_UTF8_2(__VA_ARGS__))

// (U+d800..U+dfff).
#define IS_SURROGATE(c) (((c) & 0xfffff800) == 0xd800)

}  // namespace htmlparser


#endif  // CPP_HTMLPARSER_UTF8_H_
