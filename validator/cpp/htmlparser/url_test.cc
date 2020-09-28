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

#include "url.h"
#include "gtest/gtest.h"

namespace htmlparser {

TEST(URLTest, ProtocolStrictTest) {
  std::string url("http://www.google.com");
  EXPECT_EQ(URL::ProtocolStrict(url), "http");

  url = "ftp://server1.google.com";
  EXPECT_EQ(URL::ProtocolStrict(url), "ftp");

  url = "/hello.html";
  EXPECT_TRUE(URL::ProtocolStrict(url).empty());

  url = "://google.com";
  EXPECT_TRUE(URL::ProtocolStrict(url).empty());
}

TEST(URLTest, BasicTests) {
  EXPECT_TRUE(URL("http://abc.com/").is_valid());
  EXPECT_TRUE(URL("https://abc.com/").is_valid());
  EXPECT_TRUE(URL("ftp://abc.com/").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3::abcd]/").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3::abcd]/foobar").is_valid());
  EXPECT_TRUE(URL("ftp://foo.com").is_valid());
  EXPECT_TRUE(URL("HTTp://abc.com").is_valid());
  EXPECT_TRUE(URL("HTTPs://[1:2:3::abcd]").is_valid());

  // 0080 is a valid port number, browsers ignore leading zeros.
  EXPECT_TRUE(URL("http://google.com:0080/").is_valid());
  // IPv4
  EXPECT_TRUE(URL("http://1.2.3.4").is_valid());
  EXPECT_TRUE(URL("http://100.254.200.199:80").is_valid());

  URL url("http://www.google.com/");
  EXPECT_TRUE(url.has_protocol());
  EXPECT_TRUE(url.is_valid());
  EXPECT_EQ(url.protocol(), "http");
  EXPECT_EQ(url.hostname(), "www.google.com");
  EXPECT_EQ(url.port(), 80);

  URL https_url("https://www.google.com/");
  EXPECT_TRUE(https_url.has_protocol());
  EXPECT_TRUE(https_url.is_valid());
  EXPECT_EQ(https_url.protocol(), "https");
  EXPECT_EQ(https_url.hostname(), "www.google.com");
  EXPECT_EQ(https_url.port(), 443);

  URL ftp_url("ftp://www.google.com/");
  EXPECT_TRUE(ftp_url.has_protocol());
  EXPECT_TRUE(ftp_url.is_valid());
  EXPECT_EQ(ftp_url.protocol(), "ftp");
  EXPECT_EQ(ftp_url.hostname(), "www.google.com");

  URL sftp_url("sftp://www.google.com/");
  EXPECT_TRUE(sftp_url.has_protocol());
  EXPECT_TRUE(sftp_url.is_valid());
  EXPECT_EQ(sftp_url.protocol(), "sftp");
  EXPECT_EQ(sftp_url.hostname(), "www.google.com");

  URL space_url("    http://www.google.com/");
  EXPECT_TRUE(space_url.has_protocol());
  EXPECT_TRUE(space_url.is_valid());
  EXPECT_EQ(space_url.protocol(), "http");
  EXPECT_EQ(space_url.hostname(), "www.google.com");

  // Invalid char.
  URL invalid_protocol("h||p://www.google.com");
  EXPECT_FALSE(invalid_protocol.has_protocol());
  EXPECT_TRUE(invalid_protocol.is_valid());
  EXPECT_EQ(invalid_protocol.protocol(),
            "https" /* default to https */);

  URL invalid_protocol2("foo bar:baz");
  EXPECT_FALSE(invalid_protocol2.has_protocol());
  EXPECT_TRUE(invalid_protocol2.is_valid());
  EXPECT_EQ(invalid_protocol2.protocol(),
            "https" /* default to https */);

  // Unrecognized protocol.
  URL unrecognized("telnet://1.2.3.4");
  EXPECT_TRUE(unrecognized.has_protocol());
  EXPECT_TRUE(unrecognized.is_valid());
  EXPECT_EQ(unrecognized.protocol(), "telnet");
  EXPECT_EQ(url.hostname(), "www.google.com");

  URL port_url("http://www.google.com:8080/");
  EXPECT_TRUE(port_url.has_protocol());
  EXPECT_TRUE(port_url.is_valid());
  EXPECT_EQ(port_url.protocol(), "http");
  EXPECT_EQ(port_url.hostname(), "www.google.com");
  EXPECT_EQ(port_url.port(), 8080);

  URL port_url2("http://www.google.com:0080/foo:8080");
  EXPECT_EQ(port_url2.port(), 80);

  // Invalid port.
  URL invalid_port("http://www.google.com:99999/foo");
  EXPECT_FALSE(invalid_port.is_valid());

  // Username
  URL username("http://foo:bar@www.google.com:8080/bio.html");
  EXPECT_TRUE(username.is_valid());
  EXPECT_EQ(username.login(), "foo:bar");

  URL username2("http://foo@www.google.com:8080/bio.html");
  EXPECT_EQ(username2.login(), "foo");

  // IPV6.
  URL ipv6("http://[::2]/foo");
  EXPECT_TRUE(ipv6.is_valid());
  EXPECT_EQ(ipv6.hostname(), "::2");

  URL ipv62("http://foo:bar@[1:2:3::4]:8080/foo");
  EXPECT_TRUE(ipv62.is_valid());
  EXPECT_EQ(ipv62.hostname(), "1:2:3::4");
  EXPECT_EQ(ipv62.protocol(), "http");
  EXPECT_EQ(ipv62.login(), "foo:bar");
  EXPECT_EQ(ipv62.port(), 8080);

  // Invalid ipv6.
  URL invalidipv6("http://[12345]/foo");
  EXPECT_FALSE(invalidipv6.is_valid());

  // Encoded hostname.
  URL encoded("http://%77%77w%2e%67o%6f%67%6c%65%2e%63%6f%6d/");
  EXPECT_TRUE(encoded.is_valid());

  // Invalid characters in hostname.
  EXPECT_FALSE(URL("http://example!.com/").is_valid());
  EXPECT_FALSE(URL("http://example\x10.com/").is_valid());
  EXPECT_FALSE(URL("http://example.com&/").is_valid());
  // 0xff  - Invalid single byte unsigned char.
  EXPECT_FALSE(URL("http://example-%ff.com/").is_valid());

  // Accepts utf-8 chars in hostname.
  EXPECT_TRUE(URL("http://⚡.com").is_valid());
  EXPECT_TRUE(URL("http://⚡").is_valid());


  // Empty host is invalid.
  EXPECT_FALSE(URL("http:///").is_valid());
}

TEST(URLTest, IPv6Urls) {
  // Checks all compression scenarios.
  EXPECT_TRUE(URL("http://[1::a]").is_valid());
  EXPECT_TRUE(URL("http://[1::ab]").is_valid());
  EXPECT_TRUE(URL("http://[1::abc]").is_valid());
  EXPECT_TRUE(URL("http://[1::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[1::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[11::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[111::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[1111::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[1:2::a]").is_valid());
  EXPECT_TRUE(URL("http://[1:2::ab]").is_valid());
  EXPECT_TRUE(URL("http://[1:2::abc]").is_valid());
  EXPECT_TRUE(URL("http://[1:2::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3::a]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3::ab]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3::abc]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4::a]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4::ab]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4::abc]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4:5::a]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4:5::ab]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4:5::abc]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4:5::abcd]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4:5:6::a]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4:5:6::ab]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4:5:6::abc]").is_valid());
  EXPECT_TRUE(URL("http://[1:2:3:4:5:6::abcd]").is_valid());

  // Illegal characeters.
  EXPECT_FALSE(URL("http://[abcd:123_:abcd::]").is_valid());
  EXPECT_FALSE(URL("http://[abcd:123O:abcd::]").is_valid());
  // Two compression not valid.
  EXPECT_FALSE(URL("http://[a:b::c::d:e:f]").is_valid());
  // Non hexadecimal character.
  EXPECT_FALSE(URL("http://[xyz::abcd:0a]").is_valid());
  // More than 4 bytes.
  EXPECT_FALSE(URL("http://[abcd:1234:abcde::]").is_valid());

  // Empty ipv6. atleast [::] needed.
  EXPECT_FALSE(URL("http://[]").is_valid());
  EXPECT_TRUE(URL("http://[::]").is_valid());
}

TEST(URLTest, PortNumbers) {
  // Port number with userinfo field.
  EXPECT_TRUE(URL("http://foo:bar@www.google.com:65535/").is_valid());
  EXPECT_TRUE(URL("http://foo:@www.google.com:65535/").is_valid());
  EXPECT_TRUE(URL("http://foo@www.google.com:65535/").is_valid());

  // Port number > 65535.
  EXPECT_FALSE(URL("http://www.google.com:100000/").is_valid());
  EXPECT_FALSE(URL("http://www.google.com:65536/").is_valid());
  EXPECT_FALSE(URL("http://foo:bar@www.google.com:65536/").is_valid());
  EXPECT_FALSE(URL("http://foo:@www.google.com:65536/").is_valid());
  EXPECT_FALSE(URL("http://foo@www.google.com:65536/").is_valid());

  // Empty port.
  URL url("https://www.google.com:/");
  EXPECT_TRUE(url.is_valid());
  EXPECT_EQ(url.port(), 443);
}

TEST(URLTest, UserInfoFields) {
  EXPECT_TRUE(URL("http://foo:bar@google.com").is_valid());

  // Can contain any character including space.
  EXPECT_TRUE(URL("http://foo bar:baz@google.com").is_valid());

  // Both userinfo and port.
  EXPECT_TRUE(URL("http://foo:bar@google.com:9000/").is_valid());
  // Empty password in userinfo.
  EXPECT_TRUE(URL("http://foo:@google.com:12345/").is_valid());
  EXPECT_TRUE(URL("http://foo@google.com:12345/").is_valid());
}

}  // namespace htmlparser
