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

#include "entity.h"

#include "gtest/gtest.h"

// Just one test to ensure table mapping is correct.
TEST(CasetableTest, TestTableMappingIsCorrect) {
  // Two codepoints. [8764, 8402].
  EXPECT_EQ(htmlparser::EntityLookup("nvsim;"), "\xe2\x88\xbc\xe2\x83\x92");
  // Single codepoint. [120170]
  EXPECT_EQ(htmlparser::EntityLookup("yopf;"), "\xf0\x9d\x95\xaa");

  // Ascii code point. [35].
  EXPECT_EQ(htmlparser::EntityLookup("num;"), "\x23");

  // With and without semi-colons.
  EXPECT_EQ(htmlparser::EntityLookup("AElig"), "\xc3\x86");
  EXPECT_EQ(htmlparser::EntityLookup("AElig;"), "\xc3\x86");
}
