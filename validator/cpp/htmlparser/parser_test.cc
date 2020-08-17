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

#include "parser.h"

#include "gtest/gtest.h"
#include "absl/flags/declare.h"
#include "absl/flags/flag.h"
#include "atom.h"
#include "atomutil.h"
#include "node.h"
#include "renderer.h"
#include "token.h"

ABSL_DECLARE_FLAG(uint32_t, htmlparser_max_nodes_depth_count);

// For operator""s.
using namespace std::string_literals;

#define EXPECT_NOT_NULL(p) EXPECT_TRUE((p) != nullptr)
#define EXPECT_NULL(p) EXPECT_FALSE((p) != nullptr)

// Tests manufactured tags functions.
TEST(ParserTest, ParseManufacturedTags) {
  htmlparser::Parser parser("<html><div>Hello</div></html>");
  auto doc = parser.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_FALSE(parser.Accounting().has_manufactured_html);
  EXPECT_TRUE(parser.Accounting().has_manufactured_head);
  EXPECT_TRUE(parser.Accounting().has_manufactured_body);

  htmlparser::Parser parser2("<html><head></head><div>Hello</div></html>");
  doc = parser2.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_FALSE(parser2.Accounting().has_manufactured_html);
  EXPECT_FALSE(parser2.Accounting().has_manufactured_head);
  EXPECT_TRUE(parser2.Accounting().has_manufactured_body);

  htmlparser::Parser parser3("<html><head></head><body><div>Hello</div>"
                             "</body></html>");
  doc = parser3.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_FALSE(parser3.Accounting().has_manufactured_html);
  EXPECT_FALSE(parser3.Accounting().has_manufactured_head);
  EXPECT_FALSE(parser3.Accounting().has_manufactured_body);

  // Missing end (closing) tags does not amount to manufactured tags.
  htmlparser::Parser parser4("<html><head><body><div>Hello</div>");
  doc = parser4.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_FALSE(parser4.Accounting().has_manufactured_html);
  EXPECT_FALSE(parser4.Accounting().has_manufactured_head);
  EXPECT_FALSE(parser4.Accounting().has_manufactured_body);

  htmlparser::Parser parser5("hello");
  doc = parser5.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_TRUE(parser5.Accounting().has_manufactured_html);
  EXPECT_TRUE(parser5.Accounting().has_manufactured_head);
  EXPECT_TRUE(parser5.Accounting().has_manufactured_body);
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_EQ(doc->RootNode()->FirstChild()->DataAtom(),
            htmlparser::Atom::HTML);
  EXPECT_TRUE(doc->RootNode()->FirstChild()->IsManufactured());

  htmlparser::Parser parser6("");
  doc = parser6.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_TRUE(parser6.Accounting().has_manufactured_html);
  EXPECT_TRUE(parser6.Accounting().has_manufactured_head);
  EXPECT_TRUE(parser6.Accounting().has_manufactured_body);
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_EQ(doc->RootNode()->FirstChild()->DataAtom(),
            htmlparser::Atom::HTML);
  EXPECT_TRUE(doc->RootNode()->FirstChild()->IsManufactured());
}

// Various line column recording tests.
TEST(ParserTest, LineColTest) {
  int num_callbacks = 0;
  std::string html = R"HTML(<html>
  <head></head>
  <body>
    <div>Hello</div>

    <img>

    <a></a>)HTML";
  htmlparser::Parser parser(
      html,
      {.scripting = true,
       .frameset_ok = true,
       .record_node_offsets = false,
       .record_attribute_offsets = false,
       .on_node_callback = [&](htmlparser::Node* n,
                               htmlparser::Token t) {
         switch (t.atom) {
           case htmlparser::Atom::HTML: {
             EXPECT_EQ(1, t.position_in_html_src.first);
             break;
           }
           case htmlparser::Atom::HEAD: {
             EXPECT_EQ(2, t.position_in_html_src.first);
             break;
           }
           case htmlparser::Atom::BODY: {
             EXPECT_EQ(3, t.position_in_html_src.first);
             break;
           }
           case htmlparser::Atom::DIV: {
             EXPECT_EQ(4, t.position_in_html_src.first);
             EXPECT_EQ(5, t.position_in_html_src.second);
             break;
           }
           case htmlparser::Atom::IMG: {
             EXPECT_EQ(6, t.position_in_html_src.first);
             break;
           }
           case htmlparser::Atom::A: {
             EXPECT_EQ(8, t.position_in_html_src.first);
             break;
           }
           default:
             EXPECT_EQ(htmlparser::AtomUtil::ToString(
                 t.atom) + " was unexecpted.", "");
         }
         num_callbacks++;
       }
      });
  auto doc = parser.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  EXPECT_EQ(num_callbacks, 6 /* html, head, body, div, img, a */);

  num_callbacks = 0;
  html = R"HTML(<html>
<body>
  <div id=mydiv class=foo>Hello</div>
  <img
    src="inside quote <html>">




         <span

           id="myspan"
               class="s">s</span>)HTML";
  htmlparser::Parser parser2(
      html,
      {.scripting = true,
        .frameset_ok = true,
        // For tests we rely on callbacks.
        .record_node_offsets = false,
        .record_attribute_offsets = false,
        .on_node_callback = [&](htmlparser::Node* n,
                                htmlparser::Token t) {
          switch (t.atom) {
            case htmlparser::Atom::HTML: {
              EXPECT_EQ(1, t.position_in_html_src.first);
              EXPECT_EQ(1, t.position_in_html_src.second);
              break;
            }
            case htmlparser::Atom::HEAD: {
              // Since this is manufactured, its implied
              // location in html source is same as body.
              EXPECT_EQ(2, t.position_in_html_src.first);
              EXPECT_EQ(1, t.position_in_html_src.second);
              break;
            }
            case htmlparser::Atom::BODY: {
              EXPECT_EQ(2, t.position_in_html_src.first);
              EXPECT_EQ(1, t.position_in_html_src.second);
              break;
            }
            case htmlparser::Atom::DIV: {
              EXPECT_EQ(3, t.position_in_html_src.first);
              EXPECT_EQ(3, t.position_in_html_src.second);

              // Attributes.
              EXPECT_EQ(2, t.attributes.size());
              EXPECT_EQ("id", t.attributes[0].key);
              EXPECT_EQ("mydiv", t.attributes[0].value);

              EXPECT_EQ("class", t.attributes[1].key);
              EXPECT_EQ("foo", t.attributes[1].value);

              EXPECT_TRUE(
                  t.attributes[0]
                  .position_in_html_src.has_value());
              htmlparser::LineCol pos = t.attributes[0]
                  .position_in_html_src.value();
              // Both attributes are in same line.
              EXPECT_EQ(3, pos.first);
              EXPECT_EQ(8, pos.second);
              EXPECT_TRUE(
                  t.attributes[1]
                  .position_in_html_src.has_value());
              htmlparser::LineCol pos2 = t.attributes[1]
                  .position_in_html_src.value();
              EXPECT_EQ(3, pos2.first);
              EXPECT_EQ(17, pos2.second);
              break;
            }
            case htmlparser::Atom::IMG: {
              EXPECT_EQ(4, t.position_in_html_src.first);
              EXPECT_EQ(3, t.position_in_html_src.second);

              // Attributes
              EXPECT_EQ(1, t.attributes.size());
              EXPECT_EQ("src", t.attributes[0].key);
              EXPECT_EQ("inside quote <html>",
                        t.attributes[0].value);
              // Attribute is in next line.
              EXPECT_EQ(5, t.attributes[0]
                        .position_in_html_src.value()
                        .first);
              EXPECT_EQ(5, t.attributes[0]
                        .position_in_html_src.value()
                        .second);
              break;
            }
            case htmlparser::Atom::SPAN: {
              EXPECT_EQ(10, t.position_in_html_src.first);
              EXPECT_EQ(10,
                        t.position_in_html_src.second);
              // Attributes.
              EXPECT_EQ(2, t.attributes.size());
              EXPECT_EQ("id", t.attributes[0].key);
              EXPECT_EQ("myspan", t.attributes[0].value);
              htmlparser::LineCol pos = t.attributes[0]
                  .position_in_html_src.value();
              EXPECT_EQ(12, pos.first);
              EXPECT_EQ(12, pos.second);
              htmlparser::LineCol pos2 = t.attributes[1]
                  .position_in_html_src.value();
              EXPECT_EQ("class", t.attributes[1].key);
              EXPECT_EQ("s", t.attributes[1].value);
              EXPECT_EQ(13, pos2.first);
              EXPECT_EQ(16, pos2.second);
              break;
            }
            default:
              EXPECT_EQ(htmlparser::AtomUtil::ToString(
                  t.atom) + " was unexecpted.", "");
          }
          num_callbacks++;
        }
      });
  EXPECT_NOT_NULL(parser2.Parse());
  EXPECT_EQ(num_callbacks, 6  /* html, head, body, div, img, span */);
}

TEST(ParserTest, LineBreakAtPeekableCharacter) {
  int num_callbacks = 0;
  std::string html = R"HTML(<html>
  <head>
  <title>H</title>
  </head>
  <body
    id=bd>Hi</body></html>)HTML";
  htmlparser::Parser parser(
      html,
      {.scripting = true,
        .frameset_ok = true,
        .record_node_offsets = false,
        .record_attribute_offsets = false,
        .on_node_callback = [&](htmlparser::Node* n,
                                htmlparser::Token t) {
          num_callbacks++;
          auto pos = t.position_in_html_src;
          switch (t.atom) {
            case htmlparser::Atom::HTML: {
              EXPECT_EQ(1, pos.first);
              EXPECT_EQ(1, pos.second);
              break;
            }
            case htmlparser::Atom::HEAD: {
              EXPECT_EQ(2, pos.first);
              EXPECT_EQ(3, pos.second);
              break;
            }
            case htmlparser::Atom::TITLE: {
              EXPECT_EQ(3, pos.first);
              EXPECT_EQ(3, pos.second);
              break;
            }
            case htmlparser::Atom::BODY: {
              EXPECT_EQ(5, pos.first);
              EXPECT_EQ(3, pos.second);
              EXPECT_EQ(1, t.attributes.size());
              auto attrpos = t.attributes[0]
                  .position_in_html_src.value();
              EXPECT_EQ(6, attrpos.first);
              EXPECT_EQ(5, attrpos.second);
              break;
            }
            default:
              break;
          }
        }
      });
  EXPECT_NOT_NULL(parser.Parse());
  EXPECT_EQ(num_callbacks, 4);
}

// Tests duplicate body tags are ignored but their attributes copied to original
// body tag.
TEST(ParserTest, SubsequentyBodyTagAttributesCopied) {
  std::string html = ("<html>\n<body id=\"bdy\">\n<div>hello</div></body>"s
                      "<body class=\"bd-cls\"><div>world</div></body></html>");
  htmlparser::Parser parser(html);
  auto doc = parser.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf buf;
  htmlparser::Renderer::Render(doc->RootNode(), &buf);
  EXPECT_EQ(buf.str(),
            "<html><head></head><body id=\"bdy\" class=\"bd-cls\">\n"
            "<div>hello</div><div>world</div></body></html>");
}

// Tests whitespaces are restored in the rendered html.
TEST(ParserTest, WhitespaceTest) {
  std::string html = ("<html>\n<body id=\"bdy\">\n                    "
                      "<div>hello</div>                        </body>"s
                      "<body class=\"bd-cls\"><div>world</div></body></html>");
  htmlparser::Parser parser(html);
  auto doc = parser.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf buf;
  htmlparser::Renderer::Render(doc->RootNode(), &buf);
  EXPECT_EQ(buf.str(),
            "<html><head></head><body id=\"bdy\" class=\"bd-cls\">\n"
            "                    <div>hello</div>                        "
            "<div>world</div></body>"
            "</html>");
}

// Tests non ascii whitespace like &#160; are not converted to whitespace char.
TEST(ParserTest, NonAsciiWhitespaceNotTransformed) {
  std::string html = ("<!DOCTYPE html><meta charset=\"utf-8\"><a href=\""
                      "https://s3.amazonaws.com/amaltas.backup/"
                      "white&#160;space.txt\">Whitespace in the link</a>"
                      "\xc2\xa0 \xc2\xa0 \xc2\xa0");
  htmlparser::Parser parser(html);
  auto doc = parser.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf buf;
  htmlparser::Renderer::Render(doc->RootNode(), &buf);
  EXPECT_EQ(buf.str(),
            "<!DOCTYPE html><html><head><meta charset=\"utf-8\">"
            "</head><body><a href=\"https://s3.amazonaws.com/amaltas.backup"
            "/white\xc2\xa0space.txt\">Whitespace in the link</a>"
            "\xc2\xa0 \xc2\xa0 \xc2\xa0</body></html>");
}

// Tests unicode whitespace is not treated as ascii whitespace where only
// whitespace char is needed for example separator between tag name and
// attributes.
TEST(ParserTest, OnlyAsciiWhitespaceInHTMLTags) {
  std::string html = ("<!DOCTYPE html><meta charset=\"utf-8\">"
                      "<a\xc2\xa0href=\""
                      //   ^---------------- This should be \x20 (ascii space).
                      "https://s3.amazonaws.com/amaltas.backup/"
                      "white&#160;space.txt\">Whitespace in the link</a>");
  htmlparser::Parser parser(html);
  auto doc = parser.Parse();
  EXPECT_NOT_NULL(doc);
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf buf;
  htmlparser::Renderer::Render(doc->RootNode(), &buf);
  // HTML parser did the right thing. Stuffed everything in <body> as if
  // <a<space>href is a text.
  EXPECT_EQ(buf.str(),
            "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body>"
            "<a\xC2\xA0href=\"https: s3.amazonaws.com amaltas.backup white"
            "&#160;space.txt\">Whitespace in the link</a\xC2\xA0href="
            "\"https:></body></html>");
}

// Accounting tests.
TEST(ParserTest, ParserAccounting) {
  std::string all_good = R"HTML(<!doctype html>
<html>
  <head>
    <title>hello</title>
  </head>
  <body>
    <div>hi</div>
  </body>
</html>)HTML";

  htmlparser::Parser p1(all_good);
  auto doc = p1.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  htmlparser::ParseAccounting act = p1.Accounting();
  EXPECT_FALSE(act.has_manufactured_html);
  EXPECT_FALSE(act.has_manufactured_head);
  EXPECT_FALSE(act.has_manufactured_body);
  EXPECT_FALSE(act.duplicate_html_elements);
  EXPECT_FALSE(act.duplicate_body_elements);
  EXPECT_FALSE(act.duplicate_html_element_location.has_value());
  EXPECT_FALSE(act.duplicate_body_element_location.has_value());

  std::string implied_html = R"HTML(<!doctype html>
  <head>
    <title>hello</title>
  </head>
  <body>
    <div>hi</div>
  </body>)HTML";

  htmlparser::Parser p2(implied_html);
  doc = p2.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  act = p2.Accounting();
  EXPECT_TRUE(act.has_manufactured_html);
  EXPECT_FALSE(act.has_manufactured_head);
  EXPECT_FALSE(act.has_manufactured_body);
  EXPECT_FALSE(act.duplicate_html_elements);
  EXPECT_FALSE(act.duplicate_body_elements);
  EXPECT_FALSE(act.duplicate_html_element_location.has_value());
  EXPECT_FALSE(act.duplicate_body_element_location.has_value());

  std::string implied_body = R"HTML(<!doctype html>
<html>
  <head>
    <title>hello</title>
  </head>
    <div>hi</div>
</html>)HTML";

  htmlparser::Parser p3(implied_body);
  doc = p3.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  act = p3.Accounting();
  EXPECT_FALSE(act.has_manufactured_html);
  EXPECT_FALSE(act.has_manufactured_head);
  EXPECT_TRUE(act.has_manufactured_body);
  EXPECT_FALSE(act.duplicate_html_elements);
  EXPECT_FALSE(act.duplicate_body_elements);
  EXPECT_FALSE(act.duplicate_html_element_location.has_value());
  EXPECT_FALSE(act.duplicate_body_element_location.has_value());

  std::string implied_head = R"HTML(<!doctype html>
<html>
  <title>hello</title>
  <body>
    <div>hi</div>
  </body>
</html>)HTML";

  htmlparser::Parser p4(implied_head);
  doc = p4.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  act = p4.Accounting();
  EXPECT_FALSE(act.has_manufactured_html);
  EXPECT_TRUE(act.has_manufactured_head);
  EXPECT_FALSE(act.has_manufactured_body);
  EXPECT_FALSE(act.duplicate_html_elements);
  EXPECT_FALSE(act.duplicate_body_elements);
  EXPECT_FALSE(act.duplicate_html_element_location.has_value());
  EXPECT_FALSE(act.duplicate_body_element_location.has_value());

  std::string second_html = R"HTML(<!doctype html>
<html>
  <head>
    <title>hello</title>
  </head>
<html>
  <body>
    <div>hi</div>
  </body>
</html>
</html>)HTML";

  htmlparser::Parser p5(second_html);
  doc = p5.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  act = p5.Accounting();
  EXPECT_FALSE(act.has_manufactured_html);
  EXPECT_FALSE(act.has_manufactured_head);
  EXPECT_FALSE(act.has_manufactured_body);
  EXPECT_TRUE(act.duplicate_html_elements);
  EXPECT_TRUE(act.duplicate_html_element_location.has_value());
  EXPECT_EQ(act.duplicate_html_element_location.value().first, 6);
  EXPECT_EQ(act.duplicate_html_element_location.value().second, 1);
  EXPECT_FALSE(act.duplicate_body_elements);
  EXPECT_FALSE(act.duplicate_body_element_location.has_value());

  std::string second_body = R"HTML(<!doctype html>
<html>
  <head>
    <title>hello</title>
  </head>
  <body id="foo">
    <div>hi</div>
  </body>
  <body class="bar"></body>
</html>)HTML";

  htmlparser::Parser p6(second_body);
  doc = p6.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  act = p6.Accounting();
  EXPECT_FALSE(act.has_manufactured_html);
  EXPECT_FALSE(act.has_manufactured_head);
  EXPECT_FALSE(act.has_manufactured_body);
  EXPECT_FALSE(act.duplicate_html_elements);
  EXPECT_FALSE(act.duplicate_html_element_location.has_value());
  EXPECT_TRUE(act.duplicate_body_elements);
  EXPECT_TRUE(act.duplicate_body_element_location.has_value());
  EXPECT_EQ(act.duplicate_body_element_location.value().first, 9);
  EXPECT_EQ(act.duplicate_body_element_location.value().second, 3);

  std::string second_body_implicit = R"HTML(<!doctype html>
<html>
  <head>
    <title>hello</title>
  </head>
  <div>hello</div>  <!-- This will manufacture <body> -->
  <body id="foo">   <!-- Not treated as duplicate -->
    <div>hi</div>
  </body>
</html>)HTML";

  htmlparser::Parser p6a(second_body_implicit);
  doc = p6a.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  act = p6a.Accounting();
  EXPECT_FALSE(act.has_manufactured_html);
  EXPECT_FALSE(act.has_manufactured_head);
  EXPECT_TRUE(act.has_manufactured_body);
  EXPECT_FALSE(act.duplicate_html_elements);
  EXPECT_FALSE(act.duplicate_html_element_location.has_value());
  EXPECT_FALSE(act.duplicate_body_elements);
  EXPECT_FALSE(act.duplicate_body_element_location.has_value());

  std::string second_body_after_manufactured = R"HTML(<!doctype html>
<html>
  <head>
    <title>hello</title>
  </head>
  hello  <!-- Body manufactured here -->
  <body id="foo">  <!-- Not treated as duplicate -->
    <div>hi</div>
    <body>One more body</body>  <!-- Treated as duplicate. -->
  </body>
</html>)HTML";

  htmlparser::Parser p6b(second_body_after_manufactured);
  doc = p6b.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  act = p6b.Accounting();
  EXPECT_FALSE(act.has_manufactured_html);
  EXPECT_FALSE(act.has_manufactured_head);
  EXPECT_TRUE(act.has_manufactured_body);
  EXPECT_FALSE(act.duplicate_html_elements);
  EXPECT_FALSE(act.duplicate_html_element_location.has_value());
  EXPECT_TRUE(act.duplicate_body_elements);
  EXPECT_TRUE(act.duplicate_body_element_location.has_value());

  std::string second_body_after_body_close = R"HTML(<!doctype html>
<html>
  <head>
    <title>hello</title>
  </head>
  hello  <!-- Body manufactured here -->
  <body id="foo">  <!-- Not treated as duplicate -->
    <div>hi</div>
  </body>
  <body>One more body</body>  <!-- Treated as duplicate. -->
</html>)HTML";

  htmlparser::Parser p6c(second_body_after_body_close);
  doc = p6c.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  act = p6c.Accounting();
  EXPECT_FALSE(act.has_manufactured_html);
  EXPECT_FALSE(act.has_manufactured_head);
  EXPECT_TRUE(act.has_manufactured_body);
  EXPECT_FALSE(act.duplicate_html_elements);
  EXPECT_FALSE(act.duplicate_html_element_location.has_value());
  EXPECT_TRUE(act.duplicate_body_elements);
  EXPECT_TRUE(act.duplicate_body_element_location.has_value());

  std::string template_html = R"HTML(<html>
<head>
<title>foo</title>
</head>
<body>
<template type="amp-mustache">
<p {{#bluetheme}}class=foo{{/bluetheme}}>
<script {{#fastrender}}async{{/fastrender}} src="big.js"></script>
<div data-{{variable}}="hello">hello world</div>
<img {{#border}}class=border src=foo.png>
</template>
</body>
</html>)HTML";

  htmlparser::Parser p7(template_html);
  doc = p7.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf output_buf;
  htmlparser::Renderer::Render(doc->RootNode(), &output_buf);
  EXPECT_EQ(output_buf.str(), R"HTML(<html><head>
<title>foo</title>
</head>
<body>
<template type="amp-mustache">
<p {{#bluetheme}}class="foo{{/bluetheme}}">
<script {{#fastrender}}async{{/fastrender}} src="big.js"></script>
</p><div data-{{variable}}="hello">hello world</div>
<img {{#border}}class="border" src="foo.png">
</template>

</body></html>)HTML");
}

TEST(ParserTest, WhitespaceBeforeHeadIgnoredAfterBodyAppendedToBody) {
  // The spaces before html and head will be ignored.
  std::string html = R"HTML(                        <!doctype html><html>
                                      <head>
<title>foo</title>
</head>
  <body>
    <template type="amp-mustache">
      <p {{#bluetheme}}class=foo{{/bluetheme}}>
<script {{#fastrender}}async{{/fastrender}} src="big.js"></script>
<div data-{{variable}}="hello">hello world</div>
<img {{#border}}class=border src=foo.png>
</template>
</body>
                                                     s
</html>)HTML";
// Extra whitespace and s character after </body> will be appended to body.

  htmlparser::Parser p(html, {.record_node_offsets = true});
  auto doc = p.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf output_buf;
  htmlparser::Renderer::Render(doc->RootNode(), &output_buf);
  EXPECT_EQ(output_buf.str(), R"HTML(<!DOCTYPE html><html><head>
<title>foo</title>
</head>
  <body>
    <template type="amp-mustache">
      <p {{#bluetheme}}class="foo{{/bluetheme}}">
<script {{#fastrender}}async{{/fastrender}} src="big.js"></script>
</p><div data-{{variable}}="hello">hello world</div>
<img {{#border}}class="border" src="foo.png">
</template>

                                                     s
</body></html>)HTML");

// Two newlines before </body>. One after </body> close and one before </html>
// close.

  html = R"HTML(<!-- comment 1 -->
  <!-- comment 2 -->
  <!doctype html>                        <html>
                                      <head>
<title>foo</title>
</head>
  <body>
    <template type="amp-mustache">
      <p {{#bluetheme}}class=foo{{/bluetheme}}>
<script {{#fastrender}}async{{/fastrender}} src="big.js"></script>
<div data-{{variable}}="hello">hello world</div>
<img {{#border}}class=border src=foo.png>
</template></body></html>)HTML";  // No space after body close.

  htmlparser::Parser p2(html, {.record_node_offsets = true});
  doc = p2.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf output_buf2;
  htmlparser::Renderer::Render(doc->RootNode(), &output_buf2);
  EXPECT_EQ(output_buf2.str(), R"HTML(<!-- comment 1 --><!-- comment 2 --><!DOCTYPE html><html><head>
<title>foo</title>
</head>
  <body>
    <template type="amp-mustache">
      <p {{#bluetheme}}class="foo{{/bluetheme}}">
<script {{#fastrender}}async{{/fastrender}} src="big.js"></script>
</p><div data-{{variable}}="hello">hello world</div>
<img {{#border}}class="border" src="foo.png">
</template></body></html>)HTML");  // No spaces after body close.
}

TEST(ParserTest, ImageVsImg) {
  std::string html = R"HTML(<html><head></head><body>
  <img src="foo1.png">
  <image src="foo2.png">
  <svg>
    <image src="foo3.png"></image>
  </svg>
  </body></html>)HTML";

  htmlparser::Parser p(html);
  auto doc = p.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf buf;
  htmlparser::Renderer::Render(doc->RootNode(), &buf);
  EXPECT_EQ(buf.str(), R"HTML(<html><head></head><body>
  <img src="foo1.png">
  <img src="foo2.png">
  <svg>
    <image src="foo3.png"></image>
  </svg>
  </body></html>)HTML");
}

TEST(ParserTest, VoidElementsParsedCorrectly) {
  std::string html = R"HTML(<html><head></head><body>
  <img src="foo.png" /></body></html>)HTML";

  htmlparser::Parser p(html);
  auto doc = p.Parse();
  EXPECT_NOT_NULL(doc->RootNode());
  std::stringbuf buf;
  htmlparser::Renderer::Render(doc->RootNode(), &buf);
  EXPECT_EQ(buf.str(), R"HTML(<html><head></head><body>
  <img src="foo.png"></body></html>)HTML");
}

TEST(ParserTest, DocumentComplexityTest) {
  ::absl::SetFlag(&FLAGS_htmlparser_max_nodes_depth_count, 4);

  // Document parsing failed, body contains 4 deeply nested nodes..
  htmlparser::Parser p(
      "<html><body><a><b><c><m></m></c></b></a></body></html>");
  EXPECT_NULL(p.Parse());

  // Document parsed, open elements stack less than 4.
  htmlparser::Parser p2("<html><body><a><b>foo</b></a></body></html>");
  EXPECT_NOT_NULL(p2.Parse());

  // Child nodes closing reduces the stack size. So maximum open nodes in the
  // following document is 4.
  htmlparser::Parser p3("<html><body><a>"
                        "<b>foo</b><b>foo</b><b>foo</b><b>foo</b><b>foo</b>"
                        "<b>foo</b><b>foo</b><b>foo</b><b>foo</b><b>foo</b>"
                        "</a></body></html>");
  EXPECT_NOT_NULL(p3.Parse());
}
