#include "cpp/htmlparser/validators/supported_media_query.h"

#include "gtest/gtest.h"

namespace htmlparser::css {
namespace {

std::pair<bool, LineCol> V(std::string_view s) {
  return Validate(s);
}

TEST(SupportedMediaQueryParserTest, InValidQuerySingleExpression) {
  auto r = V("all");
  // ------------^  incomplete query.
  EXPECT_FALSE(r.first);

  // Error line column.
  // Error at the end of line.
  EXPECT_EQ(r.second.second, 3);

  r = V("only icreen and (min-width: )");
  // ---------^  misspelled screen.
  EXPECT_FALSE(r.first);
  EXPECT_EQ(r.second.second, 6  /* only i... */);

  r = V("all (min-width: )");
  // -------^   missing and.
  EXPECT_FALSE(r.first);
  EXPECT_EQ(r.second.second, 5  /* missing and */);

  r = V("only screen and (min-width: 200        )");
  // -----------------------------------^  no unit.
  EXPECT_FALSE(r.first);
  EXPECT_EQ(r.second.second, 32 /* missing unit (px, in etc.) suffix */);

  r = V("all screen and (min-width: 200px)");
  // --------^  all screen invalid.
  EXPECT_FALSE(r.first);
  EXPECT_EQ(r.second.second, 5 /* Invalid screen after all */);

  r = V("all and (min: 200px)");
  // ----------------^  min what?.
  EXPECT_FALSE(r.first);
  EXPECT_EQ(r.second.second, 13 /* min is invalid expecting min-width etc. */);

  r = V("all and (min-width: 200px and max-width: 200px)");
  // ------------------------------^  only single expression inside parenthesis.
  EXPECT_FALSE(r.first);
  EXPECT_EQ(r.second.second, 27 /* invalid second 'and' operator */);

  // Multiline.
  r = V(R"(only screen and
  (max-width: 300px) and
  (min-height: 400px) and
  (aspect-ratio: 9/6) and
  (no-such-field: 200px))");  // No such expression.
  EXPECT_FALSE(r.first);
  EXPECT_EQ(r.second.first, 4 /* line */);
  EXPECT_EQ(r.second.second, 4 /* col */);

  // Invalid values.
  // Invalid 2.0f value.
  EXPECT_FALSE(V("all and (max-width: 2.0f)").first);
  // Corrected above.
  EXPECT_TRUE(V("all and (max-width: 200px)").first);

  // No NULL value for pointer.
  EXPECT_FALSE(V("all and (pointer: NULL)").first);
  // Corrected above.
  EXPECT_TRUE(V("all and (pointer: none)").first);

  // Ratios.
  EXPECT_FALSE(V("all and (aspect-ratio: 200px)").first);
  // Corrected above.
  EXPECT_TRUE(V("all and (aspect-ratio: 9/6)").first);

  // Invalid pointer value, allowed values are fine, coarse and none.
  EXPECT_FALSE(V("all and (pointer: beautiful)").first);
  // Corrected above.
  EXPECT_TRUE(V("all and (pointer: coarse)").first);

  // No max-pointer, max-hover, min-pointer, min-hover.
  EXPECT_FALSE(V("all and (max-pointer: none)").first);
  EXPECT_FALSE(V("all and (min-pointer: none)").first);
  EXPECT_FALSE(V("all and (max-hover: none)").first);
  EXPECT_FALSE(V("all and (min-hover: none)").first);

  // Just min/max is invalid.
  EXPECT_FALSE(V("all and (min: 200px)").first);
  EXPECT_FALSE(V("all and (min-: 200px)").first);
  EXPECT_FALSE(V("all and (max: 200px)").first);
  EXPECT_FALSE(V("all and (max-: 200px)").first);

  // Invalid chars anywhere.
  EXPECT_FALSE(V("all and '(min-height: 200px)'").first);
  // ---------------------^   Single quotes not allowed.
  EXPECT_TRUE(V("all and (min-height: 200px)").first);

  EXPECT_FALSE(V("all and \"(min-height: 200px)\"").first);
  // ---------------------^   Double quotes not allowed.
  EXPECT_TRUE(V("all and (min-height: 200px)").first);

  EXPECT_FALSE(V("all and (min height: 200px)").first);
  // -------------------------^ Space instead of hyphen.
  EXPECT_TRUE(V("all and (min-height: 200px)").first);

  // Supported min/max expressions.
  EXPECT_TRUE(V("all and (min-width: 200px)").first);
  EXPECT_TRUE(V("all and (min-height: 200px)").first);
  EXPECT_TRUE(V("all and (min-device-height: 5in)").first);
  EXPECT_TRUE(V("all and (min-device-width: 3in)").first);
  EXPECT_TRUE(V("all and (min-device-aspect-ratio: 3/2)").first);
  EXPECT_TRUE(V("all and (max-width: 200px)").first);
  EXPECT_TRUE(V("all and (max-height: 200px)").first);
  EXPECT_TRUE(V("all and (max-device-height: 5in)").first);
  EXPECT_TRUE(V("all and (max-device-width: 3in)").first);
  EXPECT_TRUE(V("all and (max-device-aspect-ratio: 3/2)").first);

  // All of the above valid expressions without min/max.
  EXPECT_TRUE(V("all and (width: 200px)").first);
  EXPECT_TRUE(V("all and (height: 200px)").first);
  EXPECT_TRUE(V("all and (device-height: 5in)").first);
  EXPECT_TRUE(V("all and (device-width: 3in)").first);
  EXPECT_TRUE(V("all and (device-aspect-ratio: 3/2)").first);
  EXPECT_TRUE(V("all and (width: 200px)").first);
  EXPECT_TRUE(V("all and (height: 200px)").first);
  EXPECT_TRUE(V("all and (device-height: 5in)").first);
  EXPECT_TRUE(V("all and (device-width: 3in)").first);
}

TEST(SupportedMediaQueryParserTest, ValidQuerySingleExpressionPixelUnits) {
  // Width.
  EXPECT_TRUE(V("all and (max-width: 200px)").first);
  EXPECT_TRUE(V("only screen and (max-width: 200px)").first);
  EXPECT_TRUE(V("screen and (max-width: 200px)").first);

  EXPECT_TRUE(V("all and (min-width: 200px)").first);
  EXPECT_TRUE(V("only screen and (min-width: 200px)").first);
  EXPECT_TRUE(V("screen and (min-width: 200px)").first);

  EXPECT_TRUE(V("all and (width: 200px)").first);
  EXPECT_TRUE(V("only screen and (width: 200px)").first);
  EXPECT_TRUE(V("screen and (min-width: 200px)").first);

  // Height.
  EXPECT_TRUE(V("all and (max-height: 200px)").first);
  EXPECT_TRUE(V("only screen and (max-height: 200px)").first);
  EXPECT_TRUE(V("screen and (max-height: 200px)").first);

  EXPECT_TRUE(V("all and (min-height: 200px)").first);
  EXPECT_TRUE(V("only screen and (min-height: 200px)").first);
  EXPECT_TRUE(V("screen and (min-height: 200px)").first);

  EXPECT_TRUE(V("all and (height: 200px)").first);
  EXPECT_TRUE(V("only screen and (height: 200px)").first);
  EXPECT_TRUE(V("screen and (height: 200px)").first);

  // Aspect ratio.
  EXPECT_TRUE(V("all and (max-aspect-ratio: 3/2)").first);
  EXPECT_TRUE(V("only screen and (max-aspect-ratio: 3/2)").first);
  EXPECT_TRUE(V("screen and (max-aspect-ratio: 3/2)").first);

  EXPECT_TRUE(V("all and (min-aspect-ratio: 100/50)").first);
  EXPECT_TRUE(V("only screen and (min-aspect-ratio: 200/50)").first);
  EXPECT_TRUE(V("screen and (min-aspect-ratio: 200/50)").first);

  EXPECT_TRUE(V("all and (aspect-ratio: 200/100)").first);
  EXPECT_TRUE(V("only screen and (aspect-ratio: 200/50)").first);
  EXPECT_TRUE(V("screen and (aspect-ratio: 200/50)").first);

  // Device aspect ratio.
  EXPECT_TRUE(V("all and (max-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (max-device-aspect-ratio: 18/4)").first);
  EXPECT_TRUE(V("screen and (max-device-aspect-ratio: 18/4)").first);

  EXPECT_TRUE(V("all and (min-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (min-device-aspect-ratio: 100/50)").first);
  EXPECT_TRUE(V("screen and (min-device-aspect-ratio: 100/50)").first);

  EXPECT_TRUE(V("all and (device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (device-aspect-ratio: 9/6)").first);

  // Device width.
  EXPECT_TRUE(V("all and (max-device-width: 200px)").first);
  EXPECT_TRUE(V("only screen and (max-device-width: 200px)").first);
  EXPECT_TRUE(V("screen and (max-device-width: 200px)").first);

  EXPECT_TRUE(V("all and (min-device-width: 200px)").first);
  EXPECT_TRUE(V("only screen and (min-device-width: 200px)").first);
  EXPECT_TRUE(V("screen and (min-device-width: 200px)").first);

  EXPECT_TRUE(V("all and (device-width: 200px)").first);
  EXPECT_TRUE(V("only screen and (device-width: 200px)").first);
  EXPECT_TRUE(V("screen and (device-width: 200px)").first);

  // Device height.
  EXPECT_TRUE(V("all and (max-device-height: 200px)").first);
  EXPECT_TRUE(V("only screen and (max-device-height: 200px)").first);
  EXPECT_TRUE(V("screen and (max-device-height: 200px)").first);

  EXPECT_TRUE(V("all and (min-device-height: 200px)").first);
  EXPECT_TRUE(V("only screen and (min-device-height: 200px)").first);
  EXPECT_TRUE(V("screen and (min-device-height: 200px)").first);

  EXPECT_TRUE(V("all and (device-height: 200px)").first);
  EXPECT_TRUE(V("only screen and (device-height: 200px)").first);
  EXPECT_TRUE(V("screen and (device-height: 200px)").first);
}

TEST(SupportedMediaQueryParserTest, ValidQuerySingleExpressionInchUnits) {
  // Width.
  EXPECT_TRUE(V("all and (max-width: 200in)").first);
  EXPECT_TRUE(V("only screen and (max-width: 200in)").first);
  EXPECT_TRUE(V("screen and (max-width: 200in)").first);

  EXPECT_TRUE(V("all and (min-width: 200in)").first);
  EXPECT_TRUE(V("only screen and (min-width: 200in)").first);
  EXPECT_TRUE(V("screen and (min-width: 200in)").first);

  EXPECT_TRUE(V("all and (width: 200in)").first);
  EXPECT_TRUE(V("only screen and (width: 200in)").first);
  EXPECT_TRUE(V("screen and (width: 200in)").first);

  // Height.
  EXPECT_TRUE(V("all and (max-height: 200in)").first);
  EXPECT_TRUE(V("only screen and (max-height: 200in)").first);
  EXPECT_TRUE(V("screen and (max-height: 200in)").first);

  EXPECT_TRUE(V("all and (min-height: 200in)").first);
  EXPECT_TRUE(V("only screen and (min-height: 200in)").first);
  EXPECT_TRUE(V("screen and (min-height: 200in)").first);

  EXPECT_TRUE(V("all and (height: 200in)").first);
  EXPECT_TRUE(V("only screen and (height: 200in)").first);
  EXPECT_TRUE(V("screen and (height: 200in)").first);

  // Aspect ratio.
  EXPECT_TRUE(V("all and (max-aspect-ratio: 80/50)").first);
  EXPECT_TRUE(V("only screen and (max-aspect-ratio: 60/30)").first);
  EXPECT_TRUE(V("screen and (max-aspect-ratio: 60/30)").first);

  EXPECT_TRUE(V("all and (min-aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("only screen and (min-aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("screen and (min-aspect-ratio: 9/7)").first);

  EXPECT_TRUE(V("all and (aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("only screen and (aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("screen and (aspect-ratio: 9/7)").first);

  // Device aspect ratio.
  EXPECT_TRUE(V("all and (max-device-aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("only screen and (max-device-aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("screen and (max-device-aspect-ratio: 9/7)").first);

  EXPECT_TRUE(V("all and (min-device-aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("only screen and (min-device-aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("screen and (min-device-aspect-ratio: 9/7)").first);

  EXPECT_TRUE(V("all and (device-aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("only screen and (device-aspect-ratio: 9/7)").first);
  EXPECT_TRUE(V("screen and (device-aspect-ratio: 9/7)").first);

  // Device width.
  EXPECT_TRUE(V("all and (max-device-width: 200in)").first);
  EXPECT_TRUE(V("only screen and (max-device-width: 200in)").first);
  EXPECT_TRUE(V("screen and (max-device-width: 200in)").first);

  EXPECT_TRUE(V("all and (min-device-width: 200in)").first);
  EXPECT_TRUE(V("only screen and (min-device-width: 200in)").first);
  EXPECT_TRUE(V("screen and (min-device-width: 200in)").first);

  EXPECT_TRUE(V("all and (device-width: 200in)").first);
  EXPECT_TRUE(V("only screen and (device-width: 200in)").first);
  EXPECT_TRUE(V("screen and (device-width: 200in)").first);

  // Device height.
  EXPECT_TRUE(V("all and (max-device-height: 200in)").first);
  EXPECT_TRUE(V("only screen and (max-device-height: 200in)").first);
  EXPECT_TRUE(V("screen and (max-device-height: 200in)").first);

  EXPECT_TRUE(V("all and (min-device-height: 200in)").first);
  EXPECT_TRUE(V("only screen and (min-device-height: 200in)").first);
  EXPECT_TRUE(V("screen and (min-device-height: 200in)").first);

  EXPECT_TRUE(V("all and (device-height: 200in)").first);
  EXPECT_TRUE(V("only screen and (device-height: 200in)").first);
  EXPECT_TRUE(V("screen and (device-height: 200in)").first);
}

TEST(SupportedMediaQueryParserTest, ValidQuerySingleExpressionEmUnits) {
  // Width.
  EXPECT_TRUE(V("all and (max-width: 200em)").first);
  EXPECT_TRUE(V("only screen and (max-width: 200em)").first);
  EXPECT_TRUE(V("screen and (max-width: 200em)").first);

  EXPECT_TRUE(V("all and (min-width: 200em)").first);
  EXPECT_TRUE(V("only screen and (min-width: 200em)").first);

  EXPECT_TRUE(V("all and (width: 200em)").first);
  EXPECT_TRUE(V("only screen and (width: 200em)").first);
  EXPECT_TRUE(V("screen and (min-width: 200em)").first);

  // Height.
  EXPECT_TRUE(V("all and (max-height: 200em)").first);
  EXPECT_TRUE(V("only screen and (max-height: 200em)").first);
  EXPECT_TRUE(V("screen and (max-height: 200em)").first);

  EXPECT_TRUE(V("all and (min-height: 200em)").first);
  EXPECT_TRUE(V("only screen and (min-height: 200em)").first);
  EXPECT_TRUE(V("screen and (min-height: 200em)").first);

  EXPECT_TRUE(V("all and (height: 200em)").first);
  EXPECT_TRUE(V("only screen and (height: 200em)").first);
  EXPECT_TRUE(V("screen and (height: 200em)").first);

  // Aspect ratio.
  EXPECT_TRUE(V("all and (max-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (max-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (max-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (min-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (min-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (min-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (aspect-ratio: 9/6)").first);

  // Device aspect ratio.
  EXPECT_TRUE(V("all and (max-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (max-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (max-device-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (min-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (min-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (min-device-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (device-aspect-ratio: 9/6)").first);

  // Device width.
  EXPECT_TRUE(V("all and (max-device-width: 200em)").first);
  EXPECT_TRUE(V("only screen and (max-device-width: 200em)").first);
  EXPECT_TRUE(V("screen and (max-device-width: 200em)").first);

  EXPECT_TRUE(V("all and (min-device-width: 200em)").first);
  EXPECT_TRUE(V("only screen and (min-device-width: 200em)").first);
  EXPECT_TRUE(V("screen and (min-device-width: 200em)").first);

  EXPECT_TRUE(V("all and (device-width: 200em)").first);
  EXPECT_TRUE(V("only screen and (device-width: 200em)").first);
  EXPECT_TRUE(V("screen and (device-width: 200em)").first);

  // Device height.
  EXPECT_TRUE(V("all and (max-device-height: 200em)").first);
  EXPECT_TRUE(V("only screen and (max-device-height: 200em)").first);
  EXPECT_TRUE(V("screen and (max-device-height: 200em)").first);

  EXPECT_TRUE(V("all and (min-device-height: 200em)").first);
  EXPECT_TRUE(V("only screen and (min-device-height: 200em)").first);
  EXPECT_TRUE(V("screen and (min-device-height: 200em)").first);

  EXPECT_TRUE(V("all and (device-height: 200em)").first);
  EXPECT_TRUE(V("only screen and (device-height: 200em)").first);
  EXPECT_TRUE(V("screen and (device-height: 200em)").first);
}

TEST(SupportedMediaQueryParserTest, ValidQuerySingleExpressionPTUnits) {
  // Width.
  EXPECT_TRUE(V("all and (max-width: 200pt)").first);
  EXPECT_TRUE(V("only screen and (max-width: 200pt)").first);
  EXPECT_TRUE(V("screen and (max-width: 200pt)").first);

  EXPECT_TRUE(V("all and (min-width: 200pt)").first);
  EXPECT_TRUE(V("only screen and (min-width: 200pt)").first);
  EXPECT_TRUE(V("screen and (min-width: 200pt)").first);

  EXPECT_TRUE(V("all and (width: 200pt)").first);
  EXPECT_TRUE(V("only screen and (width: 200pt)").first);
  EXPECT_TRUE(V("screen and (width: 200pt)").first);

  // Height.
  EXPECT_TRUE(V("all and (max-height: 200pt)").first);
  EXPECT_TRUE(V("only screen and (max-height: 200pt)").first);
  EXPECT_TRUE(V("screen and (max-height: 200pt)").first);

  EXPECT_TRUE(V("all and (min-height: 200pt)").first);
  EXPECT_TRUE(V("only screen and (min-height: 200pt)").first);
  EXPECT_TRUE(V("screen and (min-height: 200pt)").first);

  EXPECT_TRUE(V("all and (height: 200pt)").first);
  EXPECT_TRUE(V("only screen and (height: 200pt)").first);
  EXPECT_TRUE(V("screen and (height: 200pt)").first);

  // Aspect ratio.
  EXPECT_TRUE(V("all and (max-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (max-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (max-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (min-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (min-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (min-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (aspect-ratio: 9/6)").first);

  // Device aspect ratio.
  EXPECT_TRUE(V("all and (max-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (max-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (max-device-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (min-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (min-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (min-device-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (device-aspect-ratio: 9/6)").first);

  // Device width.
  EXPECT_TRUE(V("all and (max-device-width: 200pt)").first);
  EXPECT_TRUE(V("only screen and (max-device-width: 200pt)").first);
  EXPECT_TRUE(V("screen and (max-device-width: 200pt)").first);

  EXPECT_TRUE(V("all and (min-device-width: 200pt)").first);
  EXPECT_TRUE(V("only screen and (min-device-width: 200pt)").first);
  EXPECT_TRUE(V("screen and (min-device-width: 200pt)").first);

  EXPECT_TRUE(V("all and (device-width: 200pt)").first);
  EXPECT_TRUE(V("only screen and (device-width: 200pt)").first);
  EXPECT_TRUE(V("screen and (device-width: 200pt)").first);

  // Device height.
  EXPECT_TRUE(V("all and (max-device-height: 200pt)").first);
  EXPECT_TRUE(V("only screen and (max-device-height: 200pt)").first);
  EXPECT_TRUE(V("screen and (max-device-height: 200pt)").first);

  EXPECT_TRUE(V("all and (min-device-height: 200pt)").first);
  EXPECT_TRUE(V("only screen and (min-device-height: 200pt)").first);
  EXPECT_TRUE(V("screen and (min-device-height: 200pt)").first);

  EXPECT_TRUE(V("all and (device-height: 200pt)").first);
  EXPECT_TRUE(V("only screen and (device-height: 200pt)").first);
  EXPECT_TRUE(V("screen and (device-height: 200pt)").first);
}

TEST(SupportedMediaQueryParserTest, ValidQuerySingleExpressionCMUnits) {
  // Width.
  EXPECT_TRUE(V("all and (max-width: 200cm)").first);
  EXPECT_TRUE(V("only screen and (max-width: 200cm)").first);
  EXPECT_TRUE(V("screen and (max-width: 200cm)").first);

  EXPECT_TRUE(V("all and (min-width: 200cm)").first);
  EXPECT_TRUE(V("only screen and (min-width: 200cm)").first);
  EXPECT_TRUE(V("screen and (min-width: 200cm)").first);

  EXPECT_TRUE(V("all and (width: 200cm)").first);
  EXPECT_TRUE(V("only screen and (width: 200cm)").first);
  EXPECT_TRUE(V("screen and (width: 200cm)").first);

  // Height.
  EXPECT_TRUE(V("all and (max-height: 200cm)").first);
  EXPECT_TRUE(V("only screen and (max-height: 200cm)").first);
  EXPECT_TRUE(V("screen and (max-height: 200cm)").first);

  EXPECT_TRUE(V("all and (min-height: 200cm)").first);
  EXPECT_TRUE(V("only screen and (min-height: 200cm)").first);
  EXPECT_TRUE(V("screen and (min-height: 200cm)").first);

  EXPECT_TRUE(V("all and (height: 200cm)").first);
  EXPECT_TRUE(V("only screen and (height: 200cm)").first);
  EXPECT_TRUE(V("screen and (height: 200cm)").first);

  // Aspect ratio.
  EXPECT_TRUE(V("all and (max-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (max-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (max-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (min-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (min-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (min-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (aspect-ratio: 9/6)").first);

  // Device aspect ratio.
  EXPECT_TRUE(V("all and (max-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (max-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (max-device-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (min-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (min-device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (min-device-aspect-ratio: 9/6)").first);

  EXPECT_TRUE(V("all and (device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (device-aspect-ratio: 9/6)").first);

  // Device width.
  EXPECT_TRUE(V("all and (max-device-width: 200cm)").first);
  EXPECT_TRUE(V("only screen and (max-device-width: 200cm)").first);
  EXPECT_TRUE(V("screen and (max-device-width: 200cm)").first);

  EXPECT_TRUE(V("all and (min-device-width: 200cm)").first);
  EXPECT_TRUE(V("only screen and (min-device-width: 200cm)").first);
  EXPECT_TRUE(V("screen and (min-device-width: 200cm)").first);

  EXPECT_TRUE(V("all and (device-width: 200cm)").first);
  EXPECT_TRUE(V("only screen and (device-width: 200cm)").first);
  EXPECT_TRUE(V("screen and (device-width: 200cm)").first);

  // Device height.
  EXPECT_TRUE(V("all and (max-device-height: 200cm)").first);
  EXPECT_TRUE(V("only screen and (max-device-height: 200cm)").first);
  EXPECT_TRUE(V("screen and (max-device-height: 200cm)").first);

  EXPECT_TRUE(V("all and (min-device-height: 200cm)").first);
  EXPECT_TRUE(V("only screen and (min-device-height: 200cm)").first);
  EXPECT_TRUE(V("screen and (min-device-height: 200cm)").first);

  EXPECT_TRUE(V("all and (device-height: 200cm)").first);
  EXPECT_TRUE(V("only screen and (device-height: 200cm)").first);
  EXPECT_TRUE(V("screen and (device-height: 200cm)").first);
}

TEST(SupportedMediaQueryParserTest, ValidQueryMultipleExpressions) {
  EXPECT_TRUE(V("all and (device-width: 200px) "
                "and (device-height: 400px) "
                "and (pointer: none) "
                "and (max-device-width: 300px)").first);
  EXPECT_TRUE(V("only screen and (device-width: 200px) "
                "and (device-height: 400px) "
                "and (pointer: coarse) "
                "and (max-device-width: 300px)").first);
  EXPECT_TRUE(V("screen and (device-width: 200px) "
                "and (device-height: 400px) "
                "and (max-device-width: 300px)").first);

  EXPECT_TRUE(V("all and (device-width: 200in) "
                "and (device-height: 400in) "
                "and (pointer:      fine       ) "
                "and (hover: none) "
                "and (max-device-width: 300in)").first);
  EXPECT_TRUE(V("only screen and (device-width: 200in) "
                "and (device-height: 400in) "
                "and (max-device-width: 300in)").first);
  EXPECT_TRUE(V("screen and (device-width: 200in) "
                "and (device-height: 400in) "
                "and (hover: hover) "
                "and (max-device-width: 300in)").first);

  // Multiple spaces ok.
  EXPECT_TRUE(V("all and           (device-width: 200in) "
                "and (device-height: 400in)\t\t\t "
                "and        (max-device-width: 300in)\t\t \n").first);
  EXPECT_TRUE(V("only screen and           (device-width: 200in) "
                "and (device-height: 400in)\t\t\t "
                "and (max-device-width: 300in)\t\t \n").first);
  EXPECT_TRUE(V("screen "
                "and           (device-width: 200in) "
                "and (device-height: 400in)\t\t\t "
                "and (max-device-width: 300in)\t\t \n").first);
}

TEST(SupportedMediaQueryParserTest, ValidQueryRatio) {
  EXPECT_TRUE(V("all and (aspect-ratio    : 1900/300)").first);
  EXPECT_TRUE(V("only screen and (aspect-ratio    : 1900/300)").first);
  EXPECT_TRUE(V("screen and (aspect-ratio    : 1900/300)").first);
  EXPECT_TRUE(V("all and (aspect-ratio: 9/6) and "
                "(device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("only screen and (aspect-ratio: 9/6) and "
                "(device-aspect-ratio: 9/6)").first);
  EXPECT_TRUE(V("screen and (aspect-ratio: 9/6) and "
                "(device-aspect-ratio: 9/6)").first);

  // Aspect ratio must be ratio, not length.
  EXPECT_FALSE(V("all and (aspect-ratio: 200px)").first);
}

TEST(SupportedMediaQueryParserTest, MultiLine) {
  EXPECT_TRUE(V(R"(all and
  (max-width: 200px) and
  (max-height: 500px) and
  (aspect-ratio: 9/6) and
  (device-width: 8in) and
  (device-height: 16in))").first);

  EXPECT_TRUE(V(R"(only screen and
  (max-width: 200px) and
  (max-height: 500px) and
  (aspect-ratio: 9/6) and
  (device-width: 8in) and
  (device-height: 16in))").first);

  EXPECT_TRUE(V(R"(screen and
  (max-width: 200px) and
  (max-height: 500px) and
  (aspect-ratio: 9/6) and
  (device-width: 8in) and
  (device-height: 16in))").first);
}

}  // namespace

}  // namespace htmlparser::css
