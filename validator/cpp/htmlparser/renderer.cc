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

#include <algorithm>

#include "atomutil.h"
#include "elements.h"
#include "renderer.h"
#include "strings.h"

namespace htmlparser {

namespace {

inline void WriteToBuffer(const std::string& str, std::stringbuf* buf) {
  buf->sputn(str.c_str(), str.size());
}

// Writes str surrounded by quotes to buf. Normally it will use double quotes,
// but if str contains a double quote, it will use single quotes.
// It is used for writing the identifiers in a doctype declaration.
// In valid HTML, they can't contains both types of quotes.
inline void WriteQuoted(const std::string& str, std::stringbuf* buf) {
  char quote = '"';
  if (str.find("\"") != std::string::npos) {
    quote = '\'';
  }

  buf->sputc(quote);
  WriteToBuffer(str, buf);
  buf->sputc(quote);
}
}  // namespace.

RenderError Renderer::Render(Node* node, std::stringbuf* buf) {
  switch (node->Type()) {
    case NodeType::ERROR_NODE:
      return RenderError::ERROR_NODE_NO_RENDER;
    case NodeType::TEXT_NODE:
      Strings::Escape(node->Data().data(), buf);
      return RenderError::NO_ERROR;
    case NodeType::DOCUMENT_NODE:
      for (Node* c = node->FirstChild(); c; c = c->NextSibling()) {
        auto err = Render(c, buf);
        if (err != RenderError::NO_ERROR) {
          return  err;
        }
      }
      return RenderError::NO_ERROR;
    case NodeType::ELEMENT_NODE:
      // No-op.
      break;
    case NodeType::COMMENT_NODE:
      WriteToBuffer("<!--", buf);
      WriteToBuffer(node->Data().data(), buf);
      WriteToBuffer("-->", buf);
      return RenderError::NO_ERROR;
    case NodeType::DOCTYPE_NODE: {
      WriteToBuffer("<!DOCTYPE ", buf);
      WriteToBuffer(node->Data().data(), buf);
      std::string p;
      std::string s;
      for (auto& attr : node->Attributes()) {
        std::string key = attr.key;
        std::string value = attr.value;
        if (key == "public") {
          p = value;
        } else if (key == "system") {
          s = value;
        }
      }
      if (!p.empty()) {
        WriteToBuffer(" PUBLIC ", buf);
        WriteQuoted(p, buf);
        if (!s.empty()) {
          buf->sputc(' ');
          WriteQuoted(s, buf);
        }
      } else if (!s.empty()) {
        WriteToBuffer(" SYSTEM ", buf);
        WriteQuoted(s, buf);
      }
      buf->sputc('>');
      return RenderError::NO_ERROR;
    }
    default:
      return RenderError::UNKNOWN_NODE_TYPE;
  }

  // Render the <xxx> opening tag.
  buf->sputc('<');
  WriteToBuffer(node->DataAtom() == Atom::UNKNOWN ?
                node->Data().data() : AtomUtil::ToString(node->DataAtom()),
                buf);
  for (auto& attr : node->Attributes()) {
    std::string ns = attr.name_space;
    std::string k = attr.key;
    std::string v = attr.value;
    buf->sputc(' ');
    if (!ns.empty()) {
      WriteToBuffer(ns, buf);
      buf->sputc(':');
    }
    WriteToBuffer(k, buf);
    if (!v.empty()) {
      WriteToBuffer("=\"", buf);
      Strings::Escape(v, buf);
      buf->sputc('"');
    }
  }

  if (auto ve = std::find(kVoidElements.begin(),
                          kVoidElements.end(),
                          node->DataAtom());
      ve != kVoidElements.end()) {
    if (node->FirstChild()) {
      return RenderError::VOID_ELEMENT_CHILD_NODE;
    }
    WriteToBuffer(">", buf);
    return RenderError::NO_ERROR;
  }

  buf->sputc('>');

  // Add initial newline where there is danger of a newline being ignored.
  if (Node* c = node->FirstChild();
      c && c->Type() == NodeType::TEXT_NODE && Strings::StartsWith(
      c->Data(), "\n")) {
    if (node->DataAtom() == Atom::PRE ||
        node->DataAtom() == Atom::LISTING ||
        node->DataAtom() == Atom::TEXTAREA) {
      buf->sputc('\n');
    }
  }

  // Render any child nodes.
  if (std::find(kRawTextNodes.begin(),
                kRawTextNodes.end(),
                node->DataAtom()) != kRawTextNodes.end()) {
    for (Node* c = node->FirstChild(); c; c = c->NextSibling()) {
      if (c->Type() == NodeType::TEXT_NODE) {
        WriteToBuffer(c->Data().data(), buf);
      } else {
        auto err = Render(c, buf);
        if (err != RenderError::NO_ERROR) {
          return err;
        }
      }
    }
    if (node->DataAtom() == Atom::PLAINTEXT) {
      // Don't render anything else. <plaintext> must be the last element
      // in the file, with no closing tag.
      return RenderError::PLAIN_TEXT_ABORT;
    }
  } else {
    for (Node* c = node->FirstChild(); c; c = c->NextSibling()) {
      auto err = Render(c, buf);
      if (err != RenderError::NO_ERROR) {
        return err;
      }
    }
  }

  // Render the </xxx> closing tag.
  WriteToBuffer("</", buf);
  WriteToBuffer(node->DataAtom() == Atom::UNKNOWN ?
                node->Data().data() : AtomUtil::ToString(node->DataAtom()),
                buf);
  buf->sputc('>');

  return RenderError::NO_ERROR;
}

}  // namespace htmlparser.
