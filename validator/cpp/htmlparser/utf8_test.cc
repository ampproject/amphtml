#include "cpp/htmlparser/utf8.h"

#include "gtest/gtest.h"

TEST(UTF8Test, AsciiCharsTest) {
  for (uint8_t i = 'a'; i <= 'z'; ++i) {
    EXPECT_TRUE(IS_ASCII(i));
    EXPECT_FALSE(IS_DIGIT(i));
    EXPECT_TRUE(IS_ALPHABET(i));
  }
  for (uint8_t i = 'A'; i <= 'Z'; ++i) {
    EXPECT_TRUE(IS_ASCII(i));
    EXPECT_FALSE(IS_DIGIT(i));
    EXPECT_TRUE(IS_ALPHABET(i));
  }
  for (uint8_t i = '0'; i <= '9'; ++i) {
    EXPECT_TRUE(IS_ASCII(i));
    EXPECT_TRUE(IS_DIGIT(i));
    EXPECT_FALSE(IS_ALPHABET(i));
  }
}

TEST(UTF8Test, DecodeUtf8SymbolTest) {
  EXPECT_EQ(TO_CODEPOINT(0xf0, 0x9d, 0x8c, 0x86), 119558);
  EXPECT_EQ(TO_CODEPOINT(0xe2, 0x8c, 0x98), 9112);
  EXPECT_EQ(TO_CODEPOINT(0xc5, 0x9a), 346);
}

TEST(UTF8Test, ReadContinuationByteTest) {
  // First two bits 010... not a continuation byte.
  EXPECT_EQ(0, READ_TRAIL_BYTE(0b11000001));
  // Mask first two valid continuation bits.
  EXPECT_EQ(0b00111111, READ_TRAIL_BYTE(0b10111111));
}

TEST(UTF8Test, IsTrailByteTest) {
  EXPECT_TRUE(IS_UTF8_TRAIL_BYTE(0x9d));
  EXPECT_TRUE(IS_UTF8_TRAIL_BYTE(0x8c));
  EXPECT_TRUE(IS_UTF8_TRAIL_BYTE(0x86));
  EXPECT_TRUE(IS_UTF8_TRAIL_BYTE(0x98));
  EXPECT_TRUE(IS_UTF8_TRAIL_BYTE(0x9a));
  EXPECT_FALSE(IS_UTF8_TRAIL_BYTE(0xf0));
  EXPECT_FALSE(IS_UTF8_TRAIL_BYTE(0xe2));
  EXPECT_FALSE(IS_UTF8_TRAIL_BYTE(0xc5));
}

TEST(UTF8Test, IsLeadingByteTest) {
  // Invalid bytes.
  for (uint8_t i = 0; i < 194; ++i) {
    EXPECT_FALSE(IS_UTF8_LEAD_BYTE(i));
  }

  // Valid 0xc2..0xf4.
  for (uint8_t i = 0xc2; i < 0xf5; ++i) {
    EXPECT_TRUE(IS_UTF8_LEAD_BYTE(i));
  }

  // Invalid bytes 0xf5 to 0xff.
  for (uint8_t i = 245; i <= 254; ++i) {
    EXPECT_FALSE(IS_UTF8_LEAD_BYTE(i));
  }

  EXPECT_FALSE(IS_UTF8_LEAD_BYTE(255));
}

TEST(UTF8Test, CodePointByteSequenceCountTest) {
  EXPECT_EQ(0, LEAD_BYTE_TRAIL_COUNT('a'));
  EXPECT_EQ(1, LEAD_BYTE_TRAIL_COUNT(0xc5));
  EXPECT_EQ(2, LEAD_BYTE_TRAIL_COUNT(0xe2));
  EXPECT_EQ(3, LEAD_BYTE_TRAIL_COUNT(0xf0));

  // c2..df, 1 subsequent byte.
  for (uint8_t i = 0xc2; i <= 0xdf; ++i) {
    EXPECT_EQ(1, LEAD_BYTE_TRAIL_COUNT(i));
  }

  // e0..ef, 2 subsequent bytes.
  for (uint8_t i = 0xe0; i <= 0xef; ++i) {
    EXPECT_EQ(2, LEAD_BYTE_TRAIL_COUNT(i));
  }

  // f0..f4, 3 subsequent bytes.
  for (uint8_t i = 0xf0; i <= 0xf4; ++i) {
    EXPECT_EQ(3, LEAD_BYTE_TRAIL_COUNT(i));
  }
}

TEST(UTF8Test, CodePointNumBytesTest) {
  EXPECT_EQ(1, CODE_POINT_NUM_BYTES('a'));
  EXPECT_EQ(2, CODE_POINT_NUM_BYTES(346 /*"Ś"*/));
  EXPECT_EQ(3, CODE_POINT_NUM_BYTES(9112));
  EXPECT_EQ(4, CODE_POINT_NUM_BYTES(119558 /*"𝌆"*/));
}

TEST(UTF8Test, 3ByteSequenceValidityTest) {
  // Lead byte 0xc2..0xdf.
  for (uint8_t i = 0xc2; i <= 0xdf; ++i) {
    // Not a trail byte.
    for (uint8_t j = 0; j < 0x80; ++j) {
      EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
    for (uint8_t j = 0xbf + 1; j < 0xff; ++j) {
      EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
    EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, 0xff));

    // Valid range.
    for (uint8_t j = 0x80; j <= 0xbf; ++j) {
      EXPECT_TRUE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
  }

  // Lead byte 0xe0.
  // Not a trail byte.
  uint8_t i = 0xe0;
  for (uint8_t j = 0; j < 0xa0; ++j) {
    EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
  }
  for (uint8_t j = 0xa0; j <= 0xbf; ++j) {
    EXPECT_TRUE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
  }
  // Bytes > 0xbf is invalid.
  for (uint8_t j = 0xbf + 1; j < 0xff; ++j) {
    EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
  }
  EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, 0xff));

  // Lead byte 0xe1..0xec.
  for (uint8_t i = 0xe1; i <= 0xec; ++i) {
    // Not a trail byte.
    for (uint8_t j = 0; j < 0x80; ++j) {
      EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
    for (uint8_t j = 0xbf + 1; j < 0xff; ++j) {
      EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
    EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, 0xff));

    // Valid range.
    for (uint8_t j = 0x80; j <= 0xbf; ++j) {
      EXPECT_TRUE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
  }

  // Lead byte 0xed.
  i = 0xed;
  // Not a trail byte.
  for (uint8_t j = 0; j < 0x80; ++j) {
    EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
  }
  for (uint8_t j = 0xbf + 1; j < 0xff; ++j) {
    EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
  }
  EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, 0xff));

  // Valid range.
  for (uint8_t j = 0x80; j <= 0x9f; ++j) {
    EXPECT_TRUE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
  }
  // Invalid range. 0xa0..0xbf.
  for (uint8_t j = 0xa0; j <= 0xbf; ++j) {
    EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
  }

  // Lead byte 0xee..0xef.
  for (uint8_t i = 0xee; i <= 0xef; ++i) {
    // Not a trail byte.
    for (uint8_t j = 0; j < 0x80; ++j) {
      EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
    for (uint8_t j = 0xbf + 1; j < 0xff; ++j) {
      EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
    EXPECT_FALSE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, 0xff));

    // Valid range.
    for (uint8_t j = 0x80; j <= 0xbf; ++j) {
      EXPECT_TRUE(IS_UTF8_TRAIL_2ND_BYTE_VALID(i, j));
    }
  }
}

TEST(UTF8Test, 4ByteSequenceValidityTest) {
  // Not a 4 byte sequence lead byte.
  for (uint8_t i = 0; i < 0xf0; ++i) {
    for (uint8_t j = 0; j < 0xff; ++j) {
      EXPECT_FALSE(IS_UTF8_TRAIL_3RD_BYTE_VALID(i, j));
    }
  }

  // 4byte lead byte 0xf1..0xf3
  for (uint8_t i = 0xf1; i <= 0xf3; ++i) {
    // Invalid trail byte.
    for (uint8_t j = 0; j < 0x80; ++j) {
      EXPECT_FALSE(IS_UTF8_TRAIL_3RD_BYTE_VALID(i, j));
    }
    // Valid trail byte.
    for (uint8_t j = 0x80; j <= 0xbf; ++j) {
      EXPECT_TRUE(IS_UTF8_TRAIL_3RD_BYTE_VALID(i, j));
    }
  }
}

