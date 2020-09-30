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

#include "parse-layout-sizes.h"

#include <gmock/gmock.h>
#include "gtest/gtest.h"

using std::vector;
using testing::ContainerEq;

namespace amp::validator::parse_layout_sizes {
::std::ostream& operator<<(::std::ostream& os, const CssSize& candidate) {
  return os << "size='" << candidate.size << "' media='" << candidate.media
            << "' is_default='" << candidate.is_default << "'";
}

namespace {
// Shortcut for matching against a vector<CssSize>.
::testing::Matcher<vector<CssSize>> EqCandidates(
    const vector<CssSize>& candidates) {
  return ::testing::MatcherCast<vector<CssSize>>(ContainerEq(candidates));
}

TEST(ParseLayoutSizes, CssSizes) {
  CssSizes parsed("(min-width: 320px) 320px, 100vw");
  EXPECT_TRUE(parsed.is_set);
  EXPECT_TRUE(parsed.is_valid);
  std::vector<CssSize> expected;
  CssSize size_with_media;
  size_with_media.size = "320px";
  size_with_media.media = "(min-width: 320px)";
  expected.push_back(size_with_media);
  CssSize default_size;
  default_size.size = "100vw";
  default_size.is_default = true;
  expected.push_back(default_size);
  EXPECT_THAT(parsed.sizes, EqCandidates(expected));
}

TEST(ParseLayoutSizes, CssSizesWithFunction) {
  CssSizes parsed("(min-width: 320px) 320px, calc(50vw + 10px)");
  EXPECT_TRUE(parsed.is_set);
  EXPECT_TRUE(parsed.is_valid);
  std::vector<CssSize> expected;
  CssSize size_with_media;
  size_with_media.size = "320px";
  size_with_media.media = "(min-width: 320px)";
  expected.push_back(size_with_media);
  CssSize default_size;
  default_size.size = "calc(50vw + 10px)";
  default_size.is_default = true;
  expected.push_back(default_size);
  EXPECT_THAT(parsed.sizes, EqCandidates(expected));
}

TEST(ParseLayoutSizes, CssSizesEmpty) {
  CssSizes parsed("");
  EXPECT_FALSE(parsed.is_set);
  EXPECT_FALSE(parsed.is_valid);
  EXPECT_THAT(parsed.sizes, EqCandidates({}));
}

TEST(ParseLayoutSizes, CssSizesInvalidCharacters) {
  CssSizes parsed("(min-width: 320px) 320@, 100!");
  EXPECT_TRUE(parsed.is_set);
  EXPECT_FALSE(parsed.is_valid);
  EXPECT_THAT(parsed.sizes, EqCandidates({}));
}

TEST(ParseLayoutSizes, CssSizesInvalidComment) {
  CssSizes parsed("(min-width:240px)/*,*/ 240px, 100vw");
  EXPECT_TRUE(parsed.is_set);
  EXPECT_FALSE(parsed.is_valid);
  EXPECT_THAT(parsed.sizes, EqCandidates({}));
  CssSizes parsed_too("/*,*/ 100px");
  EXPECT_TRUE(parsed_too.is_set);
  EXPECT_FALSE(parsed_too.is_valid);
  EXPECT_THAT(parsed_too.sizes, EqCandidates({}));
}

// TODO: Uncomment this test after parsing media condition fully.
/*
TEST(ParseLayoutSizes, CssSizesInvalidHtmlTags) {
  CssSizes parsed("(min-width:240px)</style><script>alert(1);</script> 240px"
                  ", 100vw");
  EXPECT_TRUE(parsed.is_set);
  EXPECT_FALSE(parsed.is_valid);
}
*/

TEST(ParseLayoutSizes, CssSizesHandlesLeadingTrailingWhitespace) {
  CssSizes parsed("   ( min-width : 320px )  320px ,  100vw   ");
  EXPECT_TRUE(parsed.is_set);
  EXPECT_TRUE(parsed.is_valid);
  std::vector<CssSize> expected;
  CssSize size_with_media;
  size_with_media.size = "320px";
  size_with_media.media = "( min-width : 320px )";
  expected.push_back(size_with_media);
  CssSize default_size;
  default_size.size = "100vw";
  default_size.is_default = true;
  expected.push_back(default_size);
  EXPECT_THAT(parsed.sizes, EqCandidates(expected));
}

}  // namespace
}  // namespace amp::validator::parse_layout_sizes
