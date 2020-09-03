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

// Runs webkit html5 test datasets and validates parser.

#include <array>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

#include "gtest/gtest.h"
#include "atomutil.h"
#include "defer.h"
#include "fileutil.h"
#include "node.h"
#include "parser.h"
#include "renderer.h"
#include "strings.h"
#include "testconstants.h"
#include "tokenizer.h"

using namespace htmlparser;

// Represents a single test case.
struct TestCaseData {
  std::string text;
  std::string want;
  std::string context;
  bool error;

  // For debugging and test failure logs.
  std::string ToString() {
    std::stringstream ss;
    ss << "Original: \n";
    ss << "-----\n";
    ss << text;
    ss << "Parsed: \n";
    ss << "-----\n";
    ss << want;
    ss << "Context: \n";
    ss << "-----\n";
    ss << context;
    return ss.str();
  }
};

// Reads the file stream until any of the char in stop_chars is encountered.
// Returns string of all the characters being read (including stop_char).
// Returns false if error encountered during read operation.
// If EOF is encountered without seeing any stop_chars, all the characters
// are copied to buffer as if EOF is one of the stop_chars.
std::string ReadUntil(std::ifstream* fd, const std::string& stop_chars) {
  if (!fd->good()) return "";

  std::stringbuf buffer;
  while (!fd->eof()) {
    char c = fd->get();
    // We also want stop char, so that data can be accumulated as is including
    // line breaks etc.
    buffer.sputc(c);
    if (stop_chars.find(c) != std::string::npos) break;
  }
  return buffer.str();
}

TestCaseData ReadParseTest(std::ifstream* fd) {
  TestCaseData test_case;
  std::string line = ReadUntil(fd, "\n");

  // Read raw html text that this test is going to parse.
  if (line != "#data\n") {
    return {"", "", "", true};
  }

  // Accumulate all data until the beginning of next marker.
  std::stringbuf text_buffer;
  while (fd->peek() != '#') {
    line = ReadUntil(fd, "\n");
    text_buffer.sputn(line.c_str(), line.size());
  }

  line = ReadUntil(fd, "\n");
  if (line != "#errors\n") {
    return {"", "", "", true};
  }

  // Accumulate all data until the beginning of next marker.
  while (fd->peek() != '#') {
    line = ReadUntil(fd, "\n");
    // Ignore these lines.
  }

  line = ReadUntil(fd, "\n");
  std::stringbuf context_buffer;
  // This is optional, do not error if empty.
  if (line == "#document-fragment\n") {
    // Following line represents document fragment.
    line = ReadUntil(fd, "\n");
    context_buffer.sputn(line.c_str(), line.size());
    line = ReadUntil(fd, "\n");
  }

  if (line != "#document\n") {
    return {"", "", "", true};
  }

  bool in_quote = false;
  std::stringbuf want_buffer;
  while (fd->peek() != '#') {
    line = ReadUntil(fd, "\n");
    std::string trimmed(line);
    Strings::Trim(&trimmed, "| \n");
    if (trimmed.size() > 0) {
      if (line.front() == '|' && trimmed.front() == '"') {
        in_quote = true;
      }
      if (trimmed.back() == '"' &&
          !(line.front() == '|' && trimmed.size() == 1)) {
        in_quote = false;
      }
    }
    if (line.empty() || (line.size() == 1 &&
                         line.front() == '\n' &&
                         !in_quote)) {
      break;
    }
    want_buffer.sputn(line.c_str(), line.size());
  }

  std::string text = text_buffer.str();
  if (!text.empty() && text.back() == '\n') {
    text.erase(text.end() - 1);
  }

  std::string context = context_buffer.str();
  if (!context.empty() && context.back() == '\n') {
    context.erase(context.end() - 1);
  }

  return {text, want_buffer.str(), context, false};
}

void DumpIndent(std::stringbuf* buffer, int level) {
  buffer->sputn("| ", 2 /* size */);
  for (int i = 0; i < level; ++i) {
    buffer->sputn("  ", 2);
  }
}

std::optional<Error> DumpLevel(Node* node, std::stringbuf* buffer,
                               int level) {
  DumpIndent(buffer, level);
  level++;
  switch (node->Type()) {
    case NodeType::ERROR_NODE:
      return error("unexpected ErrorNode");
      break;
    case NodeType::DOCUMENT_NODE:
      return error("unexpected DocumentNode");
      break;
    case NodeType::ELEMENT_NODE: {
      std::string tag_name = node->DataAtom() == Atom::UNKNOWN ?
          node->Data().data() : AtomUtil::ToString(node->DataAtom());
      if (!node->NameSpace().empty()) {
        buffer->sputc('<');
        buffer->sputn(node->NameSpace().data(), node->NameSpace().size());
        buffer->sputc(' ');
        buffer->sputn(tag_name.c_str(), tag_name.size());
        buffer->sputc('>');
      } else {
        buffer->sputc('<');
        buffer->sputn(tag_name.c_str(), tag_name.size());
        buffer->sputc('>');
      }
      std::vector<Attribute> attributes;
      attributes.assign(node->Attributes().begin(),
                        node->Attributes().end());
      std::sort(attributes.begin(), attributes.end(),
                [&](Attribute& a1, Attribute& a2) {
        if (a1.name_space != a2.name_space) {
          return a1.name_space < a2.name_space;
        }
        return a1.key < a2.key;
      });
      for (const auto& attr : attributes) {
        std::string ns = attr.name_space;
        std::string k = attr.key;
        std::string v = attr.value;
        buffer->sputc('\n');
        DumpIndent(buffer, level);
        if (ns != "") {
          buffer->sputn(ns.c_str(), ns.size());
          buffer->sputc(' ');
          buffer->sputn(k.c_str(), k.size());
          buffer->sputc('=');
          buffer->sputc('"');
          buffer->sputn(v.c_str(), v.size());
          buffer->sputc('"');
        } else {
          buffer->sputn(k.c_str(), k.size());
          buffer->sputc('=');
          buffer->sputc('"');
          buffer->sputn(v.c_str(), v.size());
          buffer->sputc('"');
        }
      }
      if (node->NameSpace().empty() && node->DataAtom() == Atom::TEMPLATE) {
        buffer->sputc('\n');
        DumpIndent(buffer, level);
        level++;
        buffer->sputn("content", 7);
      }
      break;
    }
    case NodeType::TEXT_NODE:
      buffer->sputc('"');
      buffer->sputn(node->Data().data(), node->Data().size());
      buffer->sputc('"');
      break;
    case NodeType::COMMENT_NODE: {
      buffer->sputn("<!-- ", 5);
      buffer->sputn(node->Data().data(), node->Data().size());
      buffer->sputn(" -->", 4);
      break;
    }
    case NodeType::DOCTYPE_NODE: {
      buffer->sputn("<!DOCTYPE ", 10);
      buffer->sputn(node->Data().data(), node->Data().size());
      if (!node->Attributes().empty()) {
        std::string p;
        std::string s;
        for (const auto& attr : node->Attributes()) {
          if (attr.key == "public") p = attr.value;
          else if (attr.key == "system") s = attr.value;
        }
        if (!p.empty() || !s.empty()) {
          buffer->sputn(" \"", 2);
          buffer->sputn(p.c_str(), p.size());
          buffer->sputn("\" \"", 3);
          buffer->sputn(s.c_str(), s.size());
          buffer->sputc('"');
        }
      }
      buffer->sputc('>');
      break;
    }
    case NodeType::SCOPE_MARKER_NODE:
      return error("unexpected ScopeMarkerNode");
    default:
      return error("unknown node type");
  }
  buffer->sputc('\n');
  for (Node* c = node->FirstChild(); c; c = c->NextSibling()) {
    auto err = DumpLevel(c, buffer, level);
    if (err) {
      return err;
    }
  }
  return std::nullopt;
}

std::optional<Error> Dump(Node* node, std::stringbuf* buffer) {
  if (!node || !(node->FirstChild())) {
    return std::nullopt;
  }

  int level = 0;
  for (Node* c = node->FirstChild(); c; c = c->NextSibling()) {
    auto err = DumpLevel(c, buffer, level);
    if (err) {
      return err;
    }
  }

  return std::nullopt;
}

TEST(HTMLDatasetTest, WebkitData) {
  // Files excluded from testing due to remaining TODOs in the parser.
  std::vector<std::string> files_excluded_from_test = {
          "testdata/tree-construction/"
          "adoption01.dat",
          "testdata/tree-construction/"
          "foreign-fragment.dat",
  };
  int num_test_cases = 0;
  for (auto pattern : htmlparser::testing::kTestDataDirs) {
    std::string full_path =
        pattern.data();
    std::vector<std::string> filenames;
    EXPECT_TRUE(FileUtil::Glob(full_path, &filenames))
        << "Error opening files: " << pattern;
    for (auto& path : filenames) {
      // Skip test files that should be excluded from testing.
      if (std::find(files_excluded_from_test.begin(),
                    files_excluded_from_test.end(),
                    path) != files_excluded_from_test.end())
        continue;
      std::cerr << "Processing testdata: " << path << std::endl;
      std::ifstream fd(path);
      defer(fd.close());
      EXPECT_TRUE(fd.good()) << "Error opening file path: " << path;

      ParseOptions options = {
        .scripting = true,
        .frameset_ok = true,
        .allow_deprecated_tags = true
      };

      while (!fd.eof()) {
        TestCaseData test_case{ReadParseTest(&fd)};
        if (test_case.error) break;

        std::string html = test_case.text;
        if (!test_case.context.empty()) {
          Atom context_atom = AtomUtil::ToAtom(test_case.context);
          auto context_node = std::unique_ptr<Node>(
              new Node(NodeType::ELEMENT_NODE, context_atom));
          if (context_atom == Atom::UNKNOWN) {
            context_node->SetData(test_case.context);
          }
          auto document =  ParseFragmentWithOptions(html, options,
                                                    context_node.get());
          auto nodes = document->FragmentNodes();
          auto doc = std::unique_ptr<Node>(new Node(NodeType::DOCUMENT_NODE));
          for (Node* node : nodes) {
            doc->AppendChild(node);
          }
          auto err = CheckTreeConsistency(doc.get());
          EXPECT_FALSE(err) << err.value().error_msg;
          std::stringbuf output_buffer;
          Dump(doc.get(), &output_buffer);
          std::string output = output_buffer.str();
          EXPECT_EQ(output, test_case.want) << test_case.ToString();
          num_test_cases++;
        } else {
          auto doc = ParseWithOptions(html, options);
          auto err = CheckTreeConsistency(doc->RootNode());
          EXPECT_FALSE(err) << err.value().error_msg;
          std::stringbuf output_buffer;
          Dump(doc->RootNode(), &output_buffer);
          std::string output = output_buffer.str();
          EXPECT_EQ(output, test_case.want) << test_case.ToString();
          num_test_cases++;
        }
      }
    }
  }

  // Hardcoded, whenever dataset changes. Ensures no new tests are added, or
  // old tests removed, without maintainers knowledge.
  EXPECT_EQ(794, num_test_cases);
};
