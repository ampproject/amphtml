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
