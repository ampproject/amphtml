#include "url.h"

#include "gtest/gtest.h"

TEST(URLTest, ProtocolStrictTest) {
  std::string url("http://www.google.com");
  EXPECT_EQ(htmlparser::URL::ProtocolStrict(url), "http");

  url = "ftp://server1.google.com";
  EXPECT_EQ(htmlparser::URL::ProtocolStrict(url), "ftp");

  url = "/hello.html";
  EXPECT_TRUE(htmlparser::URL::ProtocolStrict(url).empty());

  url = "://google.com";
  EXPECT_TRUE(htmlparser::URL::ProtocolStrict(url).empty());
}
