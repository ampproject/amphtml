#include "cpp/htmlparser/node.h"

#include "gtest/gtest.h"
#include "cpp/htmlparser/atom.h"
#include "cpp/htmlparser/document.h"
#include "cpp/htmlparser/parser.h"
#include "cpp/htmlparser/renderer.h"

using htmlparser::Atom;
using htmlparser::Attribute;
using htmlparser::Node;
using htmlparser::NodeStack;
using htmlparser::NodeType;
using htmlparser::Parse;
using htmlparser::RenderError;
using htmlparser::Renderer;

// For operator""s.
using namespace std::string_literals;

TEST(NodeTest, BasicStackFunctionality) {
  NodeStack stack;
  // Push three nodes.
  auto n1 = std::unique_ptr<Node>(new Node(NodeType::TEXT_NODE));
  auto n2 = std::unique_ptr<Node>(new Node(NodeType::COMMENT_NODE));
  auto n3 = std::unique_ptr<Node>(new Node(NodeType::ELEMENT_NODE));
  stack.Push(n1.get());
  stack.Push(n2.get());
  stack.Push(n3.get());

  EXPECT_EQ(3, stack.size());
  EXPECT_EQ(stack.Top()->Type(), NodeType::ELEMENT_NODE);
  EXPECT_EQ(stack.Pop()->Type(), NodeType::ELEMENT_NODE);
  EXPECT_EQ(2, stack.size());
  EXPECT_EQ(stack.Top()->Type(), NodeType::COMMENT_NODE);

  // Push three ElementNodes.
  auto e1 = std::unique_ptr<Node>(new Node(NodeType::ELEMENT_NODE));
  auto e2 = std::unique_ptr<Node>(new Node(NodeType::ELEMENT_NODE));
  auto e3 = std::unique_ptr<Node>(new Node(NodeType::ELEMENT_NODE));
  stack.Push(e1.get());
  stack.Push(e2.get());
  stack.Push(e3.get());

  // Pop last 2.
  stack.Pop(2);
  EXPECT_EQ(3, stack.size());

  // Insert two nodes at middle and end.
  auto n4 = std::unique_ptr<Node>(new Node(NodeType::DOCTYPE_NODE));
  stack.Insert(1, n4.get());
  auto n5 = std::unique_ptr<Node>(new Node(NodeType::DOCUMENT_NODE));
  stack.Insert(stack.size() - 1, n5.get());

  EXPECT_EQ(5, stack.size());
  EXPECT_EQ(stack.at(1)->Type(), NodeType::DOCTYPE_NODE);
  EXPECT_EQ(stack.at(stack.size() - 2)->Type(), NodeType::DOCUMENT_NODE);

  auto n6 = std::unique_ptr<Node>(new Node(NodeType::ERROR_NODE));
  stack.Replace(1, n6.get());
  // No change in size.
  EXPECT_EQ(5, stack.size());
  EXPECT_EQ(stack.at(1)->Type(), NodeType::ERROR_NODE);
}

TEST(NodeTest, NodeInnerText) {
  auto doc = Parse(
      "<html><body><div>Hello world<div>foo bar</div></div>"
      "<h1>foo baz</h1></body></html>");
  EXPECT_EQ(doc->RootNode()->InnerText(), "Hello world foo bar foo baz");

  auto doc2 = Parse(
      "<html><body><div>Hello\n world\n<div>foo bar</div></div>"
      "<h1>foo baz</h1></body></html>"s);
  EXPECT_EQ(doc2->RootNode()->InnerText(), "Hello\n world\n foo bar foo baz");
}

// To test node operations doesn't cause memory leaks, Run:
// $ blaze build :node_test
// $ valgrind ../bazel-bin/htmlparser/node-test
TEST(NodeTest, NodeRemoveChild) {
  auto doc = Parse(
      "<html><head><title>Foo</title></head>"
      "<body><div>Hello</div></body></html>");

  EXPECT_FALSE(CheckNodeConsistency(doc->RootNode()).has_value());

  // Body is next sibling of head.
  EXPECT_EQ(
      doc->RootNode()->FirstChild()->FirstChild()->NextSibling()->DataAtom(),
            htmlparser::Atom::BODY);
  //               html           head         body

  // Remove head.
  Node* c = doc->RootNode()->FirstChild()->FirstChild();
  doc->RootNode()->FirstChild()->RemoveChild(c);
  std::stringbuf buf;
  EXPECT_EQ(Renderer::Render(doc->RootNode(), &buf), RenderError::NO_ERROR);
  EXPECT_EQ(buf.str(),
            "<html><body><div>Hello</div></body></html>");

  // Body is now first child of html.
  EXPECT_EQ(doc->RootNode()->FirstChild()->FirstChild()->DataAtom(),
            htmlparser::Atom::BODY);
  EXPECT_FALSE(CheckNodeConsistency(doc->RootNode()).has_value());
}

TEST(NodeTest, NodeAppendChild) {
  auto doc = Parse(
      "<html><head></head><body><div>Hello</div></body></html>");
  EXPECT_FALSE(CheckNodeConsistency(doc->RootNode()).has_value());
  Node newDiv(NodeType::ELEMENT_NODE, Atom::DIV);
  Node textContent(NodeType::TEXT_NODE);
  textContent.SetData("World");
  newDiv.AppendChild(&textContent);
  doc->RootNode()->FirstChild()->FirstChild()->NextSibling()->AppendChild(
      &newDiv);
  //      html          head          body
  std::stringbuf buf;
  EXPECT_EQ(Renderer::Render(doc->RootNode(), &buf), RenderError::NO_ERROR);
  EXPECT_EQ(buf.str(),
            "<html><head></head><body><div>Hello</div><div>World</div></body>"
            "</html>");
  EXPECT_FALSE(CheckNodeConsistency(doc->RootNode()).has_value());
}

TEST(NodeTest, NodeInsertBefore) {
  auto doc = Parse(
      "<html><head></head><body><div>World</div></body></html>");
  EXPECT_FALSE(CheckNodeConsistency(doc->RootNode()).has_value());
  Node newDiv(NodeType::ELEMENT_NODE, Atom::DIV);
  Node textContent(NodeType::TEXT_NODE);
  textContent.SetData("Hello");
  newDiv.AppendChild(&textContent);
  doc->RootNode()->FirstChild()->FirstChild()->NextSibling()->InsertBefore(
      &newDiv, doc->RootNode()->FirstChild()->FirstChild()->NextSibling()
      ->FirstChild());
  //                   <html>     <head>        <body>         <div>
  std::stringbuf buf;
  EXPECT_EQ(Renderer::Render(doc->RootNode(), &buf), RenderError::NO_ERROR);
  EXPECT_EQ(buf.str(),
            "<html><head></head><body><div>Hello</div><div>World</div></body>"
            "</html>");
  EXPECT_FALSE(CheckNodeConsistency(doc->RootNode()).has_value());
}

TEST(NodeTest, NodeReparentChildren) {
  auto doc = Parse(
      "<html><head></head><body><div>Hello</div><div>World</div></body>"
      "</html>");
  EXPECT_FALSE(CheckNodeConsistency(doc->RootNode()).has_value());

  // Move contents of body to head.
  doc->RootNode()->FirstChild()->FirstChild()->NextSibling()
      ->ReparentChildrenTo(doc->RootNode()->FirstChild()->FirstChild());
  std::stringbuf buf;
  EXPECT_EQ(Renderer::Render(doc->RootNode(), &buf), RenderError::NO_ERROR);
  EXPECT_EQ(
      doc->RootNode()->FirstChild()->FirstChild()->FirstChild()->DataAtom(),
          htmlparser::Atom::DIV);
  EXPECT_EQ(buf.str(),
            "<html><head><div>Hello</div><div>World</div></head><body></body>"
            "</html>");
  EXPECT_FALSE(CheckNodeConsistency(doc->RootNode()).has_value());
}

TEST(NodeTest, AttributeTest) {
  Node div(NodeType::ELEMENT_NODE, Atom::DIV);
  Attribute attr_a{.name_space = "", .key = "class", .value = "foo"};
  Attribute attr_b{.name_space = "", .key = "id", .value = "myDiv"};
  Attribute attr_c{.name_space = "", .key = "class", .value = "bar"};

  div.AddAttribute(attr_a);
  div.AddAttribute(attr_b);
  div.AddAttribute(attr_c);

  // Before sorting, order as inserted.
  EXPECT_EQ(div.Attributes()[0].key, "class");
  EXPECT_EQ(div.Attributes()[0].value, "foo");
  EXPECT_EQ(div.Attributes()[1].key, "id");
  EXPECT_EQ(div.Attributes()[1].value, "myDiv");
  EXPECT_EQ(div.Attributes()[2].key, "class");
  EXPECT_EQ(div.Attributes()[2].value, "bar");

  // After sorting.
  div.SortAttributes();
  EXPECT_EQ(div.Attributes().size(), 3);
  EXPECT_EQ(div.Attributes()[0].key, "class");
  EXPECT_EQ(div.Attributes()[0].value, "foo");  // Values not sorted.
  EXPECT_EQ(div.Attributes()[1].key, "class");
  EXPECT_EQ(div.Attributes()[1].value, "bar");
  EXPECT_EQ(div.Attributes()[2].key, "id");
  EXPECT_EQ(div.Attributes()[2].value, "myDiv");

  // Sort and remove duplicates.
  div.SortAttributes(true);
  EXPECT_EQ(div.Attributes().size(), 2);
  EXPECT_EQ(div.Attributes()[0].key, "class");
  EXPECT_EQ(div.Attributes()[0].value, "foo");
  EXPECT_EQ(div.Attributes()[1].key, "id");
  EXPECT_EQ(div.Attributes()[1].value, "myDiv");

  // Namespace.
  Attribute attr_ns{.name_space = "amp", .key = "class", .value = "last"};
  div.AddAttribute(attr_ns);
  div.SortAttributes();
  EXPECT_EQ(div.Attributes()[0].KeyPart(), "amp:class");
  EXPECT_EQ(div.Attributes()[0].value, "last");

  // Case sensitivity.
  Attribute attr_D{.name_space = "", .key = "CLASS", .value = "FOO"};
  div.AddAttribute(attr_D);
  div.SortAttributes();
  EXPECT_EQ(div.Attributes()[0].key, "CLASS");
  EXPECT_EQ(div.Attributes()[0].value, "FOO");
}

TEST(NodeType, DropDuplicateAttributes) {
  Node div(NodeType::ELEMENT_NODE, Atom::DIV);
  Attribute attr_a{.name_space = "", .key = "class", .value = "foo"};
  Attribute attr_b{.name_space = "", .key = "id", .value = "myDiv"};
  Attribute attr_c{.name_space = "", .key = "class", .value = "bar"};
  Attribute attr_d{.name_space = "", .key = "class", .value = "baz"};

  div.AddAttribute(attr_a);
  div.AddAttribute(attr_b);
  div.AddAttribute(attr_c);
  div.AddAttribute(attr_d);
  div.DropDuplicateAttributes();
  EXPECT_EQ(div.Attributes().size(), 2);
  EXPECT_EQ(div.Attributes()[0].key, "class");
  EXPECT_EQ(div.Attributes()[0].value, "foo");
  EXPECT_EQ(div.Attributes()[1].key, "id");
  EXPECT_EQ(div.Attributes()[1].value, "myDiv");
}

