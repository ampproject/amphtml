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

#include "htmlparser/doctype.h"

#include "gtest/gtest.h"

TEST(DoctypeTest, ParseTest) {
  // <!doctype html> The only valid html5 doctype.
  auto parsed_doctype = htmlparser::ParseDoctype("html");
  auto doctype_node = std::get<0>(parsed_doctype);
  bool quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);
  EXPECT_EQ(doctype_node->Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node->Data(), "html");

  parsed_doctype = htmlparser::ParseDoctype(
      "HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" "
      "\"http://www.w3.org/TR/html4/strict.dtd\"");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_TRUE(quirks_mode);
  EXPECT_EQ(doctype_node->Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_FALSE(doctype_node->Attributes().empty());
  EXPECT_EQ(doctype_node->Attributes().size(), 2);
  EXPECT_EQ(doctype_node->Attributes()[0].key, "public");
  EXPECT_EQ(doctype_node->Attributes()[0].value, "-//W3C//DTD HTML 4.01//EN");
  EXPECT_EQ(doctype_node->Attributes()[1].key, "system");
  EXPECT_EQ(doctype_node->Attributes()[1].value,
         "http://www.w3.org/TR/html4/strict.dtd");
  EXPECT_EQ(doctype_node->Data(), "html");

  parsed_doctype = htmlparser::ParseDoctype("html foo bar");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_TRUE(quirks_mode);
  EXPECT_EQ(doctype_node->Type(), htmlparser::NodeType::DOCTYPE_NODE);

  // Spaces OK.
  parsed_doctype = htmlparser::ParseDoctype("            html           ");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);
  EXPECT_EQ(doctype_node->Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node->Data(), "html");
  EXPECT_TRUE(doctype_node->Attributes().empty());

  // Case sensitivity OK.
  parsed_doctype = htmlparser::ParseDoctype("            HTML           ");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);
  EXPECT_EQ(doctype_node->Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node->Data(), "html");
  EXPECT_TRUE(doctype_node->Attributes().empty());

  parsed_doctype = htmlparser::ParseDoctype("lang=\"en\" html");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);

  parsed_doctype = htmlparser::ParseDoctype("html lang=\"en\"");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);

  parsed_doctype = htmlparser::ParseDoctype("html lang='en'");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);

  // lang attribute with no value.
  parsed_doctype = htmlparser::ParseDoctype("html lang");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);

  // attribute value without quote.
  parsed_doctype = htmlparser::ParseDoctype("html lang=en");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);

  // Spaces and new lines.
  parsed_doctype = htmlparser::ParseDoctype(R"DOCTYPE(          html                 lang             =
                          "en")DOCTYPE");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);

  // With self closing slash.
  parsed_doctype = htmlparser::ParseDoctype("html lang /");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);

  parsed_doctype = htmlparser::ParseDoctype("html lang=en /////////////");
  doctype_node = std::get<0>(parsed_doctype);
  quirks_mode = std::get<1>(parsed_doctype);
  EXPECT_FALSE(quirks_mode);
}
