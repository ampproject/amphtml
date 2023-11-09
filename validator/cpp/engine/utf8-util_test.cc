#include "cpp/engine/utf8-util.h"

#include "gtest/gtest.h"
#include "cpp/htmlparser/strings.h"

using ::testing::Eq;

namespace amp::validator::utf8_util {
namespace {

TEST(Utf8UtilTest, Utf16StrLen) {
  // This string, in javascript is length 23:
  // "Iñtërnâtiônàlizætiøn⚡💩".length === 23
  // It's 34 bytes long and 22 utf-8 characters long. Javascript uses UTF16
  // strings and string lengths.
  // The chars in Iñtërnâtiônàlizætiøn vary between 1 and 2 byte lengths, all
  // javascript 1-char lengths. The ⚡ is a 3-byte length character, with a
  // 1-char javascript length. Finally the 💩 is a 4-byte length character with
  // a 2-char javascript length.
  EXPECT_EQ(Utf16StrLen("Iñtërnâtiônàlizætiøn☃💩"), 23);
}

TEST(Utf8UtilTest, Utf16OffsetToByteOffset) {
  std::string example = "Iñtërnâtiônàlizætiøn☃💩";
  // Same string as for Utr16StrLen above. It's 27 bytes long, and
  // Utf16StrLen reports 23. So if we pass 23 into here as offset, we get the
  // length of the string in bytes.
  EXPECT_EQ(34, example.size());
  EXPECT_EQ(example.size(), Utf16OffsetToByteOffset(example, 23));
  EXPECT_EQ(-1, Utf16OffsetToByteOffset(example, 24));   // out of range
  EXPECT_EQ(-1, Utf16OffsetToByteOffset(example, 230));  // out of range
}

TEST(CodePointTraverser, TraversesCodePoints) {
  std::vector<char32_t> ascii =
      htmlparser::Strings::Utf8ToCodepoints("Iñtërnâtiônàlizætiøn☃💩");
  CodePointTraverser traverser(&ascii);
  for (int i = 0; i < 22; ++i) {
    traverser.TraverseTo(i);
    EXPECT_EQ(i, traverser.UTF16Position());
  }
  traverser.TraverseTo(22);
  EXPECT_EQ(23, traverser.UTF16Position());
}
}  // namespace
}  // namespace amp::validator::utf8_util
