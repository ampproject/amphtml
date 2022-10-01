#include "cpp/htmlparser/css/parse-css-urls.h"

#include <ostream>

#include <gmock/gmock.h>
#include "gtest/gtest.h"
#include "absl/strings/str_cat.h"
#include "cpp/htmlparser/strings.h"

using testing::Eq;
using testing::Pointwise;

namespace htmlparser::css::url {

std::string CssSegment_Type_Name(url::CssSegment::Type type) {
  switch (type) {
    case url::CssSegment::BYTES:
      return "BYTES";
    case url::CssSegment::IMAGE_URL:
      return "IMAGE_URL";
    case url::CssSegment::OTHER_URL:
      return "OTHER_URL";
  }
}

// This is so that gunit/gmock print reasonable errors in case a
// CssSegmentEq match fails.
::std::ostream& operator<<(::std::ostream& os, const url::CssSegment& segment) {
  std::string seg_str = segment.utf8_data;
  htmlparser::Strings::Replace(&seg_str, "\"", "\\\"");
  return os << "{url::CssSegment::"
            << CssSegment_Type_Name(segment.type) << ", \""
            << seg_str;
}

namespace {
// Compares two url::CssSegment instances by comparing their fields.
MATCHER(CssSegmentEq, "") {
  return testing::get<0>(arg).type == testing::get<1>(arg).type &&
         testing::get<0>(arg).utf8_data == testing::get<1>(arg).utf8_data;
}

// Tests that parsing errors are reported as status.
TEST(TransformCssTest, SegmentCss_ReportsParsingErrors) {
  std::vector<url::CssSegment> segments;
  // There are not many cases that can produce an error in tokenization only.
  // Parsing has a few error cases, but they don't trigger for our purposes.
  EXPECT_FALSE(SegmentCss("invalid css escape: \\\n", &segments));
}

// This is a test case that matches a production segfault.
TEST(TransformCssTest, SegmentCss_ParsesFontFaceDoesntCrash) {
  std::vector<url::CssSegment> segments;
  EXPECT_TRUE(SegmentCss(
      "@font-face { {",
      &segments));
}

// Tests that URLs inside @font-face are parsed as OTHER_URL.
TEST(TransformCssTest, SegmentCss_ParsesFontFaceAsOtherUrl) {
  std::vector<url::CssSegment> segments;
  EXPECT_TRUE(SegmentCss(
      "@font-face {font-family: 'Foo'; src: url('http://foo.com/bar.ttf');}",
      &segments));
  EXPECT_THAT(segments,
              Pointwise(CssSegmentEq(),
                        std::vector<url::CssSegment>{
                            {url::CssSegment::BYTES,
                             "@font-face {font-family: 'Foo'; src: "},
                            {url::CssSegment::OTHER_URL,
                              "http://foo.com/bar.ttf"},
                            {url::CssSegment::BYTES, ";}"}}));
}

// Tests that image URLs are parsed as IMAGE_URL; also tests
// that unicode escapes (in this case \000026) within the URL are decoded.
TEST(TransformCssTest, SegmentCss_SupportsImageUrlWithUnicode) {
  std::vector<url::CssSegment> segments;
  EXPECT_TRUE(SegmentCss(
      "body{background-image: url('http://a.com/b/c=d\\000026e=f_g*h');}",
      &segments));
  EXPECT_THAT(
      segments,
      Pointwise(CssSegmentEq(),
                std::vector<url::CssSegment>{
                    {url::CssSegment::BYTES, "body{background-image: "},
                    {url::CssSegment::IMAGE_URL, "http://a.com/b/c=d&e=f_g*h"},
                    {url::CssSegment::BYTES, ";}"}}));
}

TEST(TransformCssTest, SegmentCss_LongerExample) {
  // This example is taken from pcu_request_flow_test.cc and contains both
  // image urls, other urls (fonts) and segments in between which
  // show the need to emit byte segments and after the url segments.
  std::vector<url::CssSegment> segments;
  EXPECT_TRUE(SegmentCss(
      ".a { color:red; background-image:url(4.png) }"
      ".b { color:black; background-image:url('http://a.com/b.png') } "
      "@font-face {font-family: 'Medium';src: url('http://a.com/1.woff') "
      "format('woff'),url('http://b.com/1.ttf') format('truetype'),"
      "src:url('') format('embedded-opentype');}",
      &segments));
  EXPECT_THAT(
      segments,
      Pointwise(
          CssSegmentEq(),
          std::vector<url::CssSegment>{
              {url::CssSegment::BYTES, ".a { color:red; background-image:"},
              {url::CssSegment::IMAGE_URL, "4.png"},
              {url::CssSegment::BYTES, " }.b { color:black; background-image:"},
              {url::CssSegment::IMAGE_URL, "http://a.com/b.png"},
              {url::CssSegment::BYTES,
                " } @font-face {font-family: 'Medium';src: "},
              {url::CssSegment::OTHER_URL, "http://a.com/1.woff"},
              {url::CssSegment::BYTES, " format('woff'),"},
              {url::CssSegment::OTHER_URL, "http://b.com/1.ttf"},
              {url::CssSegment::BYTES, " format('truetype'),src:"},
              {url::CssSegment::OTHER_URL, ""},
              {url::CssSegment::BYTES, " format('embedded-opentype');}"}}));
}

TEST(TransformCssTest, SegmentCss_WithWindowsNewlines) {
  // Example with newlines \r\n as MS Windows likes to put them. Not
  // processing such newlines properly lead to http://b/27231295.
  // This library normalizes the newlines using
  // quality_dni::parse_css_urls:Preprocess.
  std::vector<url::CssSegment> segments;
  EXPECT_TRUE(SegmentCss(
      ".a \r\n{ color:red; background-image:url(4.png) }\r\n"
      ".b { color:black; \r\nbackground-image:url('http://a.com/b.png') }",
      &segments));
  EXPECT_THAT(
      segments,
      Pointwise(
          CssSegmentEq(),
          std::vector<url::CssSegment>{
              {url::CssSegment::BYTES, ".a \n{ color:red; background-image:"},
              {url::CssSegment::IMAGE_URL, "4.png"},
              {url::CssSegment::BYTES,
                " }\n.b { color:black; \nbackground-image:"},
              {url::CssSegment::IMAGE_URL, "http://a.com/b.png"},
              {url::CssSegment::BYTES, " }"}}));
}

}  // namespace
}  // namespace htmlparser::css::url
