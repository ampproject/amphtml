#include "cpp/htmlparser/entity.h"

#include "gtest/gtest.h"

// Just one test to ensure table mapping is correct.
TEST(CasetableTest, TestTableMappingIsCorrect) {
  // Two codepoints. [8764, 8402].
  EXPECT_EQ(htmlparser::EntityLookup("nvsim;"), "\xe2\x88\xbc\xe2\x83\x92");
  // Single codepoint. [120170]
  EXPECT_EQ(htmlparser::EntityLookup("yopf;"), "\xf0\x9d\x95\xaa");

  // Ascii code point. [35].
  EXPECT_EQ(htmlparser::EntityLookup("num;"), "\x23");

  // With and without semi-colons.
  EXPECT_EQ(htmlparser::EntityLookup("AElig"), "\xc3\x86");
  EXPECT_EQ(htmlparser::EntityLookup("AElig;"), "\xc3\x86");
}
