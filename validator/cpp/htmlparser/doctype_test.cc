#include "cpp/htmlparser/doctype.h"
#include "cpp/htmlparser/node.h"

#include "gtest/gtest.h"

using htmlparser::Node;
using htmlparser::NodeType;

TEST(DoctypeTest, ParseTest) {
  // <!doctype html> The only valid html5 doctype.
  Node doctype_node(NodeType::DOCTYPE_NODE);
  bool quirks_mode = htmlparser::ParseDoctype("html", &doctype_node);
  EXPECT_FALSE(quirks_mode);
  EXPECT_EQ(doctype_node.Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node.Data(), "html");

  Node doctype_node2(NodeType::DOCTYPE_NODE);
  bool quirks_mode2 = htmlparser::ParseDoctype(
      "HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" "
      "\"http://www.w3.org/TR/html4/strict.dtd\"", &doctype_node2);
  EXPECT_TRUE(quirks_mode2);
  EXPECT_EQ(doctype_node2.Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_FALSE(doctype_node2.Attributes().empty());
  EXPECT_EQ(doctype_node2.Attributes().size(), 2);
  EXPECT_EQ(doctype_node2.Attributes()[0].key, "public");
  EXPECT_EQ(doctype_node2.Attributes()[0].value, "-//W3C//DTD HTML 4.01//EN");
  EXPECT_EQ(doctype_node2.Attributes()[1].key, "system");
  EXPECT_EQ(doctype_node2.Attributes()[1].value,
         "http://www.w3.org/TR/html4/strict.dtd");
  EXPECT_EQ(doctype_node2.Data(), "html");

  Node doctype_node3(NodeType::DOCTYPE_NODE);
  bool quirks_mode3 = htmlparser::ParseDoctype("html foo bar", &doctype_node3);
  EXPECT_TRUE(quirks_mode3);
  EXPECT_EQ(doctype_node3.Type(), htmlparser::NodeType::DOCTYPE_NODE);

  // Spaces OK.
  Node doctype_node4(NodeType::DOCTYPE_NODE);
  bool quirks_mode4 = htmlparser::ParseDoctype("            html           ",
                                               &doctype_node4);
  EXPECT_FALSE(quirks_mode4);
  EXPECT_EQ(doctype_node4.Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node4.Data(), "html");
  EXPECT_TRUE(doctype_node4.Attributes().empty());

  // Case sensitivity OK.
  Node doctype_node5(NodeType::DOCTYPE_NODE);
  bool quirks_mode5 = htmlparser::ParseDoctype("            HTML           ",
                                               &doctype_node5);
  EXPECT_FALSE(quirks_mode5);
  EXPECT_EQ(doctype_node5.Type(), htmlparser::NodeType::DOCTYPE_NODE);
  EXPECT_EQ(doctype_node5.Data(), "html");
  EXPECT_TRUE(doctype_node5.Attributes().empty());

  Node doctype_node6(NodeType::DOCTYPE_NODE);
  bool quirks_mode6 = htmlparser::ParseDoctype("lang=\"en\" html",
                                               &doctype_node6);
  EXPECT_TRUE(quirks_mode6);

  Node doctype_node7(NodeType::DOCTYPE_NODE);
  bool quirks_mode7 = htmlparser::ParseDoctype("html lang=\"en\"",
                                               &doctype_node7);
  EXPECT_TRUE(quirks_mode7);

  Node doctype_node8(NodeType::DOCTYPE_NODE);
  bool quirks_mode8 = htmlparser::ParseDoctype("html lang='en'",
                                               &doctype_node8);
  EXPECT_TRUE(quirks_mode8);

  // lang attribute with no value.
  Node doctype_node9(NodeType::DOCTYPE_NODE);
  bool quirks_mode9 = htmlparser::ParseDoctype("html lang",
                                               &doctype_node9);
  EXPECT_TRUE(quirks_mode9);

  // attribute value without quote.
  Node doctype_node10(NodeType::DOCTYPE_NODE);
  bool quirks_mode10 = htmlparser::ParseDoctype("html lang=en",
                                                &doctype_node10);
  EXPECT_TRUE(quirks_mode10);

  // Spaces and new lines.
  Node doctype_node11(NodeType::DOCTYPE_NODE);
  bool quirks_mode11  =
      htmlparser::ParseDoctype(R"DOCTYPE(          html                 lang             =
                          "en")DOCTYPE", &doctype_node11);
  EXPECT_TRUE(quirks_mode11);

  // With self closing slash.
  Node doctype_node12(NodeType::DOCTYPE_NODE);
  bool quirks_mode12 = htmlparser::ParseDoctype("html lang /", &doctype_node12);
  EXPECT_TRUE(quirks_mode12);

  Node doctype_node13(NodeType::DOCTYPE_NODE);
  bool quirks_mode13 = htmlparser::ParseDoctype("html lang=en /////////////",
                                                &doctype_node13);
  EXPECT_TRUE(quirks_mode13);
}
