//
// Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

#include "casetable.h"

#include "gtest/gtest.h"
#include "strings.h"

// Just one test to ensure table mapping is correct.
TEST(CasetableTest, TestTableMappingIsCorrect) {
  std::string_view upper_char = "Ỷ";
  std::string_view lower_char = "ỷ";

  char32_t decoded_upper = htmlparser::Strings::DecodeUtf8Symbol(
      &upper_char).value();
  char32_t decoded_lower = htmlparser::Strings::DecodeUtf8Symbol(
      &lower_char).value();

  // Checks upper to lower table.
  EXPECT_EQ(
      htmlparser::ToLowerChar(decoded_upper), decoded_lower);

  // Checks lower to upper table.
  EXPECT_EQ(
      htmlparser::ToUpperChar(decoded_lower), decoded_upper);

  // Checks ascii works as expected.
  EXPECT_EQ(htmlparser::ToLowerChar('A'), 'a');
  EXPECT_EQ(htmlparser::ToLowerChar('Z'), 'z');
  EXPECT_EQ(htmlparser::ToUpperChar('a'), 'A');
  EXPECT_EQ(htmlparser::ToUpperChar('z'), 'Z');

  // Non case chars unchanged.
  EXPECT_EQ(htmlparser::ToLowerChar('-'), '-');
  EXPECT_EQ(htmlparser::ToUpperChar('#'), '#');
}
