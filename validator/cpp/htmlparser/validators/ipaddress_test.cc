#include "cpp/htmlparser/validators/ipaddress.h"
#include "gtest/gtest.h"

namespace htmlparser::ipaddress {

std::pair<bool, LineCol> V(std::string_view s) {
  return Validate(s);
}

TEST(ParserTest, ValidIPs) {
  EXPECT_TRUE(V("[1:2:3::abcd]").first);

  // Octal IPv4
  EXPECT_TRUE(V("010.010.010.010").first);  // 8.8.8.8
  EXPECT_TRUE(V("010.010.010.010").first);  // 8.8.8.8:1000
  EXPECT_TRUE(V("0376.0376.0376.0376").first);  // 254.254.254.254
  // First two octal and next two decimal.
  EXPECT_TRUE(V("010.010.8.8").first);
  EXPECT_TRUE(V("010.010.192.8").first);
  EXPECT_TRUE(V("1.2.3.4").first);
  EXPECT_TRUE(V("100.254.200.199").first);
  EXPECT_TRUE(V("1.2.3.4").first);
  EXPECT_TRUE(V("100.254.200.199").first);
  // Octal IPv4
  EXPECT_TRUE(V("010.010.010.010").first);  // 8.8.8.8
  EXPECT_TRUE(V("010.010.010.010:1000").first);  // 8.8.8.8:1000
  // First two octal and next two decimal.
  EXPECT_TRUE(V("010.010.8.8").first);
  EXPECT_TRUE(V("010.010.192.8").first);
  EXPECT_TRUE(V("1.2.3.4").first);
  EXPECT_TRUE(V("100.254.200.199").first);
  // Octal IPv4
  EXPECT_TRUE(V("010.010.010.010").first);  // 8.8.8.8
  EXPECT_TRUE(V("010.010.010.010:1000").first);  // 8.8.8.8:1000
  EXPECT_TRUE(V("0376.0376.0376.0376").first);  // 254.254.254.254
  // First two octal and next two decimal.
  EXPECT_TRUE(V("010.010.8.8").first);
  EXPECT_TRUE(V("010.010.192.8").first);

  // IPv6
  EXPECT_TRUE(
      V("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:17000").first);
  EXPECT_TRUE(V("[a:b:c:d:e:f:1:2]").first);
  EXPECT_TRUE(V("[a:b::c:d:e:f]").first);
  EXPECT_TRUE(V("[a::]").first);
  EXPECT_TRUE(V("[a::b]").first);
  EXPECT_TRUE(V("[a:b:c::]").first);
  EXPECT_TRUE(V("[abcd:1234:8901:26dd:a94d:0000:0:0d]").first);
  EXPECT_TRUE(V("[::a]").first);
  // Same as above, uncompressed.
  EXPECT_TRUE(V("[0:0:0:0:0:0:0:a]").first);
  // Same as above, all 4 zerofill.
  EXPECT_TRUE(V("[0000:0000:0000:0000:0000:0000:0000:a]").first);
  // Empty OK.
  EXPECT_TRUE(V("[::]").first);
  EXPECT_TRUE(V("[::1]").first);

  // Less than 8 groups in case of compressions.
  EXPECT_TRUE(V("[a::b:c:d:e:f:1234]").first);

  // IPV6 hostname and port.
  EXPECT_TRUE(V("[a:b:c:d::e]:80").first);

  // IPV6 with zone identifier.
  EXPECT_TRUE(V("[1:2:3:4:5:6:7:8%eth0]").first);
  EXPECT_TRUE(V("[1:2:3:4:5:6:7:8%anything]").first);
  EXPECT_TRUE(V("[1::2000%32]").first);
  EXPECT_TRUE(V("[1:2::2000%32]").first);
  EXPECT_TRUE(V("[1:2:3::2000%32]").first);
  EXPECT_TRUE(V("[1:2:3:4::2000%32]").first);
  EXPECT_TRUE(V("[1:2:3:4:5::2000%32]").first);
  EXPECT_TRUE(V("[1:2:3:4:5:6::2000%32]").first);

  // Checks IPV6 closes in all compression scenarios.
  EXPECT_TRUE(V("[1::a]").first);
  EXPECT_TRUE(V("[1::ab]").first);
  EXPECT_TRUE(V("[1::abc]").first);
  EXPECT_TRUE(V("[1::abcd]").first);
  EXPECT_TRUE(V("[1::abcd]").first);
  EXPECT_TRUE(V("[11::abcd]").first);
  EXPECT_TRUE(V("[111::abcd]").first);
  EXPECT_TRUE(V("[1111::abcd]").first);
  EXPECT_TRUE(V("[1:2::a]").first);
  EXPECT_TRUE(V("[1:2::ab]").first);
  EXPECT_TRUE(V("[1:2::abc]").first);
  EXPECT_TRUE(V("[1:2::abcd]").first);
  EXPECT_TRUE(V("[1:2:3::a]").first);
  EXPECT_TRUE(V("[1:2:3::ab]").first);
  EXPECT_TRUE(V("[1:2:3::abc]").first);
  EXPECT_TRUE(V("[1:2:3::abcd]").first);
  EXPECT_TRUE(V("[1:2:3:4::a]").first);
  EXPECT_TRUE(V("[1:2:3:4::ab]").first);
  EXPECT_TRUE(V("[1:2:3:4::abc]").first);
  EXPECT_TRUE(V("[1:2:3:4::abcd]").first);
  EXPECT_TRUE(V("[1:2:3:4:5::a]").first);
  EXPECT_TRUE(V("[1:2:3:4:5::ab]").first);
  EXPECT_TRUE(V("[1:2:3:4:5::abc]").first);
  EXPECT_TRUE(V("[1:2:3:4:5::abcd]").first);
  EXPECT_TRUE(V("[1:2:3:4:5:6::a]").first);
  EXPECT_TRUE(V("[1:2:3:4:5:6::ab]").first);
  EXPECT_TRUE(V("[1:2:3:4:5:6::abc]").first);
  EXPECT_TRUE(V("[1:2:3:4:5:6::abcd]").first);
}

TEST(ParserTest, InValidURLs) {
  // Two compression not valid.
  EXPECT_FALSE(V("[a:b::c::d:e:f]").first);
  // Non hexadecimal character.
  EXPECT_FALSE(V("[xyz::abcd:0a]").first);
  // Error occurred on 0th line and 1st column.
  EXPECT_EQ(V("[xyz::abcd:0a]").second.first, 0);
  EXPECT_EQ(V("[xyz::abcd:0a]").second.second, 2 /* x */);
  // More than 4 bytes.
  EXPECT_FALSE(V("[abcd:1234:abcde::]").first);
  // Illegal characters.
  EXPECT_FALSE(V("[abcd:1234:abcd#::]").first);
  EXPECT_FALSE(V("[abcd:123_:abcd::]").first);
  EXPECT_FALSE(V("[abcd:123O:abcd::]").first);

  // max 8 groups.
  EXPECT_FALSE(V("[a:b:c:d:e:f:1:2:3]").first);
  // Less than 8 in case of compression.
  EXPECT_FALSE(V("[a:b:c:d:e::f:1:2]").first);

  // Closed with wrong character.
  EXPECT_FALSE(V("[a:::b:c}").first);

  // Not closed.
  EXPECT_FALSE(V("[a:::b:c").first);
  // Column number is also reported. Error occurred on 0th line and 7th column.
  EXPECT_EQ(V("[a::b:c").second.first, 0);
  EXPECT_EQ(V("[a::b:c").second.second, 7 /* missing closing ] */);

  // Invalid octal IPs.
  // 038 = 256.
  EXPECT_FALSE(V("038.010.010.010").first);
  EXPECT_FALSE(V("010.038.010.010").first);
  EXPECT_FALSE(V("010.010.038.010").first);
  EXPECT_FALSE(V("010.010.010.038").first);
  EXPECT_FALSE(V("038.10.10.10").first);
  EXPECT_FALSE(V("10.038.10.10").first);
  EXPECT_FALSE(V("10.10.038.10").first);
  EXPECT_FALSE(V("10.10.10.038").first);
}

}  // namespace htmlparser::ipaddress
