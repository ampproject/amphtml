#include "cpp/htmlparser/casetable.h"

#include "gtest/gtest.h"
#include "cpp/htmlparser/strings.h"

// Just one test to ensure table mapping is correct.
TEST(CasetableTest, TestTableMappingIsCorrect) {
  std::string_view upper_char = "Ỷ";
  std::string_view lower_char = "ỷ";

  char32_t decoded_upper = htmlparser::Strings::DecodeUtf8Symbol(
      &upper_char).value();
  char32_t decoded_lower = htmlparser::Strings::DecodeUtf8Symbol(
      &lower_char).value();

  // Checks upper to lower table.
  EXPECT_EQ(
      htmlparser::ToLowerChar(decoded_upper), decoded_lower);

  // Checks lower to upper table.
  EXPECT_EQ(
      htmlparser::ToUpperChar(decoded_lower), decoded_upper);

  // Checks ascii works as expected.
  EXPECT_EQ(htmlparser::ToLowerChar('A'), 'a');
  EXPECT_EQ(htmlparser::ToLowerChar('Z'), 'z');
  EXPECT_EQ(htmlparser::ToUpperChar('a'), 'A');
  EXPECT_EQ(htmlparser::ToUpperChar('z'), 'Z');

  // Non case chars unchanged.
  EXPECT_EQ(htmlparser::ToLowerChar('-'), '-');
  EXPECT_EQ(htmlparser::ToUpperChar('#'), '#');
}
