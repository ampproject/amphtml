#include "cpp/engine/parse-viewport.h"

#include <gmock/gmock.h>
#include "gtest/gtest.h"

using ::testing::Eq;

namespace amp::validator::parse_viewport {
namespace {
TEST(ParseViewportTest, ParsesHelloMessage) {
  std::map<std::string, std::string> parsed = ParseContent("message=hello");
  std::map<std::string, std::string> expected = {{"message", "hello"}};
  EXPECT_THAT(parsed, Eq(expected));
}

TEST(ParseViewportTest, ViewPortInAmpSpec) {
  auto parsed = ParseContent("width=device-width,minimum-scale=1");
  std::map<std::string, std::string> expected = {{"width", "device-width"},
                                                 {"minimum-scale", "1"}};
  EXPECT_THAT(parsed, Eq(expected));
}

TEST(ParseViewportTest, WhiteSpaceAndSemicolonAndIgnoredParts) {
  auto parsed = ParseContent("a= b, foo =1 ; bang=ba;dang;oh=yes,oops=ws o=i");
  std::map<std::string, std::string> expected = {{"a", "b"},    {"bang", "ba"},
                                                 {"foo", "1"},  {"o", "i"},
                                                 {"oh", "yes"}, {"oops", "ws"}};
  EXPECT_THAT(parsed, Eq(expected));
}

TEST(ParseViewportTest, MoreWhiteSpace) {
  auto parsed = ParseContent("a= b\rc\n= d");
  std::map<std::string, std::string> expected = {{"a", "b"}, {"c", "d"}};
  EXPECT_THAT(parsed, Eq(expected));
}

TEST(ParseViewportTest, LowerCasesKeysButNotValues) {
  auto parsed = ParseContent("UpperCaseKey=UpperCaseValue, ALLCAPS=FOO");
  std::map<std::string, std::string> expected = {
      {"uppercasekey", "UpperCaseValue"}, {"allcaps", "FOO"}};
  EXPECT_THAT(parsed, Eq(expected));
}
}  // namespace
}  // namespace amp::validator::parse_viewport
