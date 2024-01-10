#include "cpp/engine/parse-srcset.h"

#include <vector>

#include <gmock/gmock.h>
#include "gtest/gtest.h"

using std::vector;
using testing::ContainerEq;

namespace amp::validator::parse_srcset {
::std::ostream& operator<<(::std::ostream& os,
                           const ImageCandidate& candidate) {
  return os << "url='" << candidate.url << "' width_or_pixel_density='"
            << candidate.width_or_pixel_density << "'";
}

namespace {
// Shortcut for matching against a vector<ImageCandidate>.
::testing::Matcher<vector<ImageCandidate>> EqCandidates(
    const vector<ImageCandidate>& candidates) {
  return ::testing::MatcherCast<vector<ImageCandidate>>(
      ContainerEq(candidates));
}

// Most test cases copied from
// https://github.com/ampproject/amphtml/blob/main/test/functional/test-srcset.js
TEST(ParseSrcsetTest, SingleUrl) {
  SrcsetParsingResult result = ParseSourceSet("image");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image", "1x"}}));
}

TEST(ParseSrcsetTest, SingleUrlAndWidthOrPixelDensity) {
  SrcsetParsingResult result = ParseSourceSet("image 100w");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image", "100w"}}));

  result = ParseSourceSet("image 2x");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image", "2x"}}));
}

TEST(ParseSrcsetTest, WhitespaceAroundUrl) {
  SrcsetParsingResult result = ParseSourceSet(" \t\n image \n\t\t ");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image", "1x"}}));
}

TEST(ParseSrcsetTest, IgnoreEmptySource) {
  SrcsetParsingResult result = ParseSourceSet(" \n image \n, ");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image", "1x"}}));

  result = ParseSourceSet(" , \n image \n, ");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image", "1x"}}));
}

TEST(ParseSrcsetTest, MultipleSources) {
  SrcsetParsingResult result =
      ParseSourceSet("image1 2x, image2, image3 3x, image4 4x");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image1", "2x"},
                                                  {"image2", "1x"},
                                                  {"image3", "3x"},
                                                  {"image4", "4x"}}));

  result = ParseSourceSet(" \n image 2x \n\t, image2 \n ");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image", "2x"}, {"image2", "1x"}}));
}

TEST(ParseSrcsetTest, MultipleSourcesAndDuplicateWidth) {
  SrcsetParsingResult result =
      ParseSourceSet("image1 10w, image2 100w, image3 1000w, image4 10w");
  EXPECT_FALSE(result.success);
}

TEST(ParseSrcsetTest, MultipleSourcesAndWidth) {
  SrcsetParsingResult result =
      ParseSourceSet(" \n image-100 100w\n, image 10w");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image-100", "100w"}, {"image", "10w"}}));
}

TEST(ParseSrcsetTest, MultipleSourcesAndPixelDensity) {
  SrcsetParsingResult result = ParseSourceSet(" \n image-x1.5 1.5x\n, image");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image-x1.5", "1.5x"}, {"image", "1x"}}));
}

TEST(ParseSrcsetTest, CommasInURLs) {
  SrcsetParsingResult result =
      ParseSourceSet(" \n image,1 100w\n , \n image,2 50w \n");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,1", "100w"}, {"image,2", "50w"}}));

  result = ParseSourceSet(" \n image,100w 100w\n , \n image,20w 50w \n");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,100w", "100w"}, {"image,20w", "50w"}}));

  result = ParseSourceSet(" \n image,2 2x\n , \n image,1");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,2", "2x"}, {"image,1", "1x"}}));

  result = ParseSourceSet(" \n image,2 2x\n , \n image,1x");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,2", "2x"}, {"image,1x", "1x"}}));

  result = ParseSourceSet(" \n image,2 , \n  image,1 2x\n");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,2", "1x"}, {"image,1", "2x"}}));

  result = ParseSourceSet(" \n image,1x , \n  image,2x 2x\n");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,1x", "1x"}, {"image,2x", "2x"}}));

  result = ParseSourceSet(" \n image,1 \n ");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image,1", "1x"}}));

  result = ParseSourceSet(" \n image,1x \n ");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image,1x", "1x"}}));
}

TEST(ParseSrcsetTest, LeadingAndTrailingCommasAndCommasInUrl) {
  // Leading and trailing commas are OK, as are commas in side URls.
  // This example only looks a little strange because the ParseSourceSet
  // function does not further validate the URL.
  SrcsetParsingResult result = ParseSourceSet(",image1,100w,image2,50w,");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image1,100w,image2,50w", "1x"}}));

  // This is a more typical-looking example, with leading and trailing commas.
  result = ParseSourceSet(",example.com/,/,/,/,50w,");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"example.com/,/,/,/,50w", "1x"}}));
}

TEST(ParseSrcsetTest, NoWhitespace) {
  SrcsetParsingResult result = ParseSourceSet("image 100w,image 50w");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image", "100w"}, {"image", "50w"}}));

  result = ParseSourceSet("image,1 100w,image,2 50w");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,1", "100w"}, {"image,2", "50w"}}));

  result = ParseSourceSet("image,1 2x,image,2");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,1", "2x"}, {"image,2", "1x"}}));

  result = ParseSourceSet("image,2 2x");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image,2", "2x"}}));

  result = ParseSourceSet("image,1");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image,1", "1x"}}));
}

TEST(ParseSrcsetTest, SpecialCharsInUrl) {
  SrcsetParsingResult result =
      ParseSourceSet(" \n http://im-a+ge;1?&2#3 100w\n , \n image;2 50w \n");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(
      result.srcset_images,
      EqCandidates({{"http://im-a+ge;1?&2#3", "100w"}, {"image;2", "50w"}}));
}

TEST(ParseSrcsetTest, AcceptFalseCognitivesInUrl) {
  SrcsetParsingResult result =
      ParseSourceSet(" \n image,100w 100w\n , \n image,20x 50w \n");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,100w", "100w"}, {"image,20x", "50w"}}));

  result = ParseSourceSet(" \n image,1x 2x\n , \n image,2x");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images,
              EqCandidates({{"image,1x", "2x"}, {"image,2x", "1x"}}));

  result = ParseSourceSet(" \n image,1x \n ");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image,1x", "1x"}}));

  result = ParseSourceSet(" \n image,1w \n ");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image,1w", "1x"}}));
}

TEST(ParseSrcsetTest, MiscExamples) {
  SrcsetParsingResult result = ParseSourceSet(
      "image-1x.png 1x, image-2x.png 2x, image-3x.png 3x, image-4x.png 4x");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image-1x.png", "1x"},
                                                  {"image-2x.png", "2x"},
                                                  {"image-3x.png", "3x"},
                                                  {"image-4x.png", "4x"}}));

  result = ParseSourceSet("image,one.png");
  EXPECT_TRUE(result.success);
  EXPECT_THAT(result.srcset_images, EqCandidates({{"image,one.png", "1x"}}));
}

TEST(ParseSrcsetTest, UrlsWithSpacesRejected) {
  SrcsetParsingResult result = ParseSourceSet("image 1x png 1x");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image 1x png 1x, image-2x.png 2x");
  EXPECT_FALSE(result.success);
}

TEST(ParseSrcsetTest, NegativeWidthOrPixelDensityRejected) {
  SrcsetParsingResult result = ParseSourceSet("image.png -1x");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 1x, image2.png -2x");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png -480w");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 1x, image2.png -100w");
  EXPECT_FALSE(result.success);
}

TEST(ParseSrcsetTest, ZeroWidthOrPixelDensityRejected) {
  SrcsetParsingResult result = ParseSourceSet("image.png 0x");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 1x, image2.png 0.0x");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 0w");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 1x, image2.png 000w");
  EXPECT_FALSE(result.success);
}

TEST(ParseSrcsetTest, EmptySrcsetRejected) {
  SrcsetParsingResult result = ParseSourceSet("");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet(" \n\t\f\r");
  EXPECT_FALSE(result.success);
}

TEST(ParseSrcsetTest, DecimalWidthsRejected) {
  SrcsetParsingResult result = ParseSourceSet("image.png 500.0w");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 1.5w");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 0.1w");
  EXPECT_FALSE(result.success);
}

TEST(ParseSrcsetTest, InvalidPixelValuesOrDimensionsRejected) {
  SrcsetParsingResult result = ParseSourceSet("image.png 500px");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 2 x");
  EXPECT_FALSE(result.success);
  result = ParseSourceSet("image.png 1kw");
  EXPECT_FALSE(result.success);
}

TEST(ParseSrcsetTest, InvalidTextAfterValidSrcsetRejected) {
  SrcsetParsingResult result = ParseSourceSet("image1, image2, ,,,");
  EXPECT_FALSE(result.success);
}

TEST(ParseSrcsetTest, NoCommaBetweenCandidateStringsRejected) {
  SrcsetParsingResult result = ParseSourceSet("image1 100w image2 50w");
  EXPECT_FALSE(result.success);
}
}  // namespace
}  // namespace amp::validator::parse_srcset
