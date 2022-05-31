#include "cpp/engine/parse-layout.h"

#include "gtest/gtest.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/string_view.h"

using amp::validator::AmpLayout;

namespace amp::validator::parse_layout {
namespace {

TEST(ParseLayout, BasicCssLength) {
  CssLength parsed("10.1em", /*allow_auto=*/false, /*allow_fluid=*/false);
  EXPECT_TRUE(parsed.is_set);
  EXPECT_TRUE(parsed.is_valid);
  EXPECT_EQ(10.1, parsed.numeral);
  EXPECT_EQ("em", parsed.unit);
  EXPECT_FALSE(parsed.is_auto);
}

TEST(ParseLayout, SupportsSeveralUnits) {
  for (const char* allowed_unit : {"px", "em", "rem", "vh", "vmin", "vmax"}) {
    SCOPED_TRACE(absl::StrCat("allowed_unit: ", allowed_unit));
    std::string example = absl::StrCat("10", allowed_unit);
    CssLength parsed(example, /*allow_auto=*/false, /*allow_fluid=*/false);
    EXPECT_TRUE(parsed.is_set);
    EXPECT_TRUE(parsed.is_valid);
    EXPECT_EQ(10, parsed.numeral);
    EXPECT_EQ(allowed_unit, parsed.unit);
    EXPECT_FALSE(parsed.is_auto);
  }
}

TEST(ParseLayout, EmptyUnitIsPx) {
  CssLength parsed("10", /*allow_auto=*/false, /*allow_fluid=*/false);
  EXPECT_TRUE(parsed.is_set);
  EXPECT_TRUE(parsed.is_valid);
  EXPECT_EQ(10, parsed.numeral);
  EXPECT_EQ("px", parsed.unit);
  EXPECT_FALSE(parsed.is_auto);
}

TEST(ParseLayout, NullPtrInCssLengthIsValid) {
  // This means the attribute value is not set.
  CssLength parsed(absl::string_view(), /*allow_auto=*/false,
                   /*allow_fluid=*/false);
  EXPECT_FALSE(parsed.is_set);
  EXPECT_TRUE(parsed.is_valid);
  EXPECT_EQ("px", parsed.unit);
  EXPECT_FALSE(parsed.is_auto);
}

TEST(ParseLayout, EmptyStringInCssLengthIsInvalid) {
  // This means the attribute value is empty.
  CssLength parsed("", /*allow_auto=*/false, /*allow_fluid=*/false);
  EXPECT_FALSE(parsed.is_valid);
}

TEST(ParseLayout, OtherGarbageInCssLengthIsInvalid) {
  EXPECT_FALSE(CssLength("100%",
                         /*allow_auto=*/false, /*allow_fluid=*/false)
                   .is_valid);
  EXPECT_FALSE(CssLength("not a number",
                         /*allow_auto=*/false, /*allow_fluid=*/false)
                   .is_valid);
  EXPECT_FALSE(CssLength("1.1.1",
                         /*allow_auto=*/false, /*allow_fluid=*/false)
                   .is_valid);
  EXPECT_FALSE(CssLength("5inches",
                         /*allow_auto=*/false, /*allow_fluid=*/false)
                   .is_valid);
  EXPECT_FALSE(CssLength("fahrenheit",
                         /*allow_auto=*/false, /*allow_fluid=*/false)
                   .is_valid);
  EXPECT_FALSE(CssLength("px",
                         /*allow_auto=*/false, /*allow_fluid=*/false)
                   .is_valid);
  EXPECT_FALSE(CssLength("ix unciae",  // Screen size in ancient Rome.
                         /*allow_auto=*/false, /*allow_fluid=*/false)
                   .is_valid);
}

TEST(ParseLayout, CssLengthRecognizesAutoIfAllowAuto) {
  {  // allow_auto = false with input != auto
    CssLength parsed("1", /*allow_auto=*/false, /*allow_fluid=*/false);
    EXPECT_TRUE(parsed.is_valid);
    EXPECT_FALSE(parsed.is_auto);
  }
  {  // allow_auto = true with input != auto
    CssLength parsed("1", /*allow_auto=*/true, /*allow_fluid=*/false);
    EXPECT_TRUE(parsed.is_valid);
    EXPECT_FALSE(parsed.is_auto);
  }
  {  // allow_auto = false with input = auto
    CssLength parsed("auto", /*allow_auto=*/false, /*allow_fluid=*/false);
    EXPECT_FALSE(parsed.is_valid);
  }
  {  // allow_auto = true with input = auto
    CssLength parsed("auto", /*allow_auto=*/true, /*allow_fluid=*/false);
    EXPECT_TRUE(parsed.is_valid);
    EXPECT_TRUE(parsed.is_auto);
  }
}

TEST(ParseLayout, CssLengthRecognizesFluidIfAllowFluid) {
  {  // allow_fluid = false with input != fluid
    CssLength parsed("1", /*allow_auto=*/false, /*allow_fluid=*/false);
    EXPECT_TRUE(parsed.is_valid);
    EXPECT_FALSE(parsed.is_fluid);
  }
  {  // allow_fluid = true with input != fluid
    CssLength parsed("1", /*allow_auto=*/false, /*allow_fluid=*/true);
    EXPECT_TRUE(parsed.is_valid);
    EXPECT_FALSE(parsed.is_fluid);
  }
  {  // allow_fluid = false with input = fluid
    CssLength parsed("fluid", /*allow_auto=*/false, /*allow_fluid=*/false);
    EXPECT_FALSE(parsed.is_valid);
  }
  {  // allow_fluid = true with input = fluid
    CssLength parsed("fluid", /*allow_auto=*/false, /*allow_fluid=*/true);
    EXPECT_TRUE(parsed.is_valid);
    EXPECT_TRUE(parsed.is_fluid);
  }
}

TEST(ParseLayout, CalculateHeightAmpAnalytics) {
  CssLength expected_output("1", /*allow_auto=*/false, /*allow_fluid=*/false);
  CssLength output =
      CalculateHeight(AmpLayout::FIXED,
                      CssLength(absl::string_view(), /*allow_auto=*/false,
                                /*allow_fluid=*/false),
                      "AMP-ANALYTICS");
  EXPECT_EQ(expected_output.numeral, output.numeral);
  EXPECT_EQ(expected_output.unit, output.unit);
}

TEST(ParseLayout, CalculateWidthAmpAnalytics) {
  CssLength expected_output("1", /*allow_auto=*/false, /*allow_fluid=*/false);
  CssLength output =
      CalculateWidth(AmpLayout::FIXED,
                     CssLength(absl::string_view(), /*allow_auto=*/false,
                               /*allow_fluid=*/false),
                     "AMP-ANALYTICS");
  EXPECT_EQ(expected_output.numeral, output.numeral);
  EXPECT_EQ(expected_output.unit, output.unit);
}

TEST(ParseLayout, CalculateHeightAmpPixel) {
  CssLength expected_output("1", /*allow_auto=*/false, /*allow_fluid=*/false);
  CssLength output =
      CalculateHeight(AmpLayout::FIXED,
                      CssLength(absl::string_view(), /*allow_auto=*/false,
                                /*allow_fluid=*/false),
                      "AMP-PIXEL");
  EXPECT_EQ(expected_output.numeral, output.numeral);
  EXPECT_EQ(expected_output.unit, output.unit);
}

TEST(ParseLayout, CalculateWidthAmpPixel) {
  CssLength expected_output("1", /*allow_auto=*/false, /*allow_fluid=*/false);
  CssLength output =
      CalculateWidth(AmpLayout::FIXED,
                     CssLength(absl::string_view(), /*allow_auto=*/false,
                               /*allow_fluid=*/false),
                     "AMP-PIXEL");
  EXPECT_EQ(expected_output.numeral, output.numeral);
  EXPECT_EQ(expected_output.unit, output.unit);
}

TEST(ParseLayout, CalculateHeightAmpSocialShare) {
  CssLength expected_output("44", /*allow_auto=*/false, /*allow_fluid=*/false);
  CssLength output =
      CalculateHeight(AmpLayout::FIXED,
                      CssLength(absl::string_view(), /*allow_auto=*/false,
                                /*allow_fluid=*/false),
                      "AMP-SOCIAL-SHARE");
  EXPECT_EQ(expected_output.numeral, output.numeral);
  EXPECT_EQ(expected_output.unit, output.unit);
}

TEST(ParseLayout, CalculateWidthAmpSocialShare) {
  CssLength expected_output("60", /*allow_auto=*/false, /*allow_fluid=*/false);
  CssLength output =
      CalculateWidth(AmpLayout::FIXED,
                     CssLength(absl::string_view(), /*allow_auto=*/false,
                               /*allow_fluid=*/false),
                     "AMP-SOCIAL-SHARE");
  EXPECT_EQ(expected_output.numeral, output.numeral);
  EXPECT_EQ(expected_output.unit, output.unit);
}

TEST(ParseLayout, CalculateHeightCustomElement) {
  CssLength expected_output("720", /*allow_auto=*/false, /*allow_fluid=*/false);
  CssLength output = CalculateHeight(
      AmpLayout::FIXED,
      CssLength("720", /*allow_auto=*/false, /*allow_fluid=*/false),
      "AMP-YOUTUBE");
  EXPECT_EQ(expected_output.numeral, output.numeral);
  EXPECT_EQ(expected_output.unit, output.unit);
}

TEST(ParseLayout, CalculateWidthCustomElement) {
  CssLength expected_output("480", /*allow_auto=*/false, /*allow_fluid=*/false);
  CssLength output = CalculateWidth(
      AmpLayout::FIXED,
      CssLength("480", /*allow_auto=*/false, /*allow_fluid=*/false),
      "AMP-YOUTUBE");
  EXPECT_EQ(expected_output.numeral, output.numeral);
  EXPECT_EQ(expected_output.unit, output.unit);
}

TEST(ParseLayout, GetCssLengthStyle) {
  CssLength empty_unit_is_px("30", /*allow_auto=*/false, /*allow_fluid=*/false);
  EXPECT_EQ(GetCssLengthStyle(empty_unit_is_px, "height"), "height:30px;");
  CssLength em_unit("10.1em", /*allow_auto=*/false, /*allow_fluid=*/false);
  EXPECT_EQ(GetCssLengthStyle(em_unit, "width"), "width:10.1em;");
  CssLength is_auto("auto", /*allow_auto=*/true, /*allow_fluid=*/false);
  EXPECT_EQ(GetCssLengthStyle(is_auto, "width"), "width:auto;");
  CssLength no_value(absl::string_view(), /*allow_auto=*/false,
                     /*allow_fluid=*/false);
  EXPECT_EQ(GetCssLengthStyle(no_value, "height"), "");
}

TEST(ParseLayout, GetLayoutClass) {
  EXPECT_EQ(GetLayoutClass(AmpLayout::FIXED_HEIGHT),
            "i-amphtml-layout-fixed-height");
  EXPECT_EQ(GetLayoutClass(AmpLayout::RESPONSIVE),
            "i-amphtml-layout-responsive");
  EXPECT_EQ(GetLayoutClass(AmpLayout::UNKNOWN), "");
}

TEST(ParseLayout, GetLayoutName) {
  EXPECT_EQ(GetLayoutName(AmpLayout::FIXED_HEIGHT), "fixed-height");
  EXPECT_EQ(GetLayoutName(AmpLayout::RESPONSIVE), "responsive");
  EXPECT_EQ(GetLayoutName(AmpLayout::UNKNOWN), "");
}

TEST(ParseLayout, IsLayoutSizeDefined) {
  EXPECT_TRUE(IsLayoutSizeDefined(AmpLayout::FILL));
  EXPECT_FALSE(IsLayoutSizeDefined(AmpLayout::CONTAINER));
  EXPECT_FALSE(IsLayoutSizeDefined(AmpLayout::UNKNOWN));
}

}  // namespace
}  // namespace amp::validator::parse_layout
