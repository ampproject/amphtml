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

#include "doctype.h"

#include "gtest/gtest.h"

TEST(DoctypeTest, ParseTest) {
  // <!doctype html> The only valid html5 doctype.
  auto [doctype_node, quirks_mode] = htmlparser::ParseDoctype("html");
  EXPECT_FALSE(quirks_mode);
  EXPECT_EQ(doctype_node->Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node->Data(), "html");

  auto [doctype_node2, quirks_mode2] = htmlparser::ParseDoctype(
      "HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" "
      "\"http://www.w3.org/TR/html4/strict.dtd\"");
  EXPECT_TRUE(quirks_mode2);
  EXPECT_EQ(doctype_node2->Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_FALSE(doctype_node2->Attributes().empty());
  EXPECT_EQ(doctype_node2->Attributes().size(), 2);
  EXPECT_EQ(doctype_node2->Attributes()[0].key, "public");
  EXPECT_EQ(doctype_node2->Attributes()[0].value, "-//W3C//DTD HTML 4.01//EN");
  EXPECT_EQ(doctype_node2->Attributes()[1].key, "system");
  EXPECT_EQ(doctype_node2->Attributes()[1].value,
         "http://www.w3.org/TR/html4/strict.dtd");
  EXPECT_EQ(doctype_node2->Data(), "html");

  auto [doctype_node3, quirks_mode3] = htmlparser::ParseDoctype("html foo bar");
  EXPECT_TRUE(quirks_mode3);
  EXPECT_EQ(doctype_node3->Type(), htmlparser::NodeType::DOCTYPE_NODE);

  // Spaces OK.
  auto [doctype_node4, quirks_mode4] =
      htmlparser::ParseDoctype("            html           ");
  EXPECT_FALSE(quirks_mode4);
  EXPECT_EQ(doctype_node4->Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node4->Data(), "html");
  EXPECT_TRUE(doctype_node4->Attributes().empty());

  // Case sensitivity OK.
  auto [doctype_node5, quirks_mode5] =
      htmlparser::ParseDoctype("            HTML           ");
  EXPECT_FALSE(quirks_mode5);
  EXPECT_EQ(doctype_node5->Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node5->Data(), "html");
  EXPECT_TRUE(doctype_node5->Attributes().empty());

  auto [doctype_node6, quirks_mode6] =
      htmlparser::ParseDoctype("lang=\"en\" html");
  EXPECT_FALSE(quirks_mode6);

  auto [doctype_node7, quirks_mode7] =
      htmlparser::ParseDoctype("html lang=\"en\"");
  EXPECT_FALSE(quirks_mode7);

  auto [doctype_node8, quirks_mode8] =
      htmlparser::ParseDoctype("html lang='en'");
  EXPECT_FALSE(quirks_mode8);

  // lang attribute with no value.
  auto [doctype_node9, quirks_mode9] = htmlparser::ParseDoctype("html lang");
  EXPECT_FALSE(quirks_mode9);

  // attribute value without quote.
  auto [doctype_node10, quirks_mode10] =
      htmlparser::ParseDoctype("html lang=en");
  EXPECT_FALSE(quirks_mode10);

  // Spaces and new lines.
  auto [doctype_node11, quirks_mode11]  =
      htmlparser::ParseDoctype(R"DOCTYPE(          html                 lang             =
                          "en")DOCTYPE");
  EXPECT_FALSE(quirks_mode11);

  // With self closing slash.
  auto [doctype_node12, quirks_mode12] =
      htmlparser::ParseDoctype("html lang /");
  EXPECT_FALSE(quirks_mode12);

  auto [doctype_node13, quirks_mode13] =
      htmlparser::ParseDoctype("html lang=en /////////////");
  EXPECT_FALSE(quirks_mode13);
}
