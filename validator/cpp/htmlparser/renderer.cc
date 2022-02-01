#include "cpp/htmlparser/renderer.h"

#include <algorithm>
#include <sstream>
#include <stack>
#include <tuple>

#include "cpp/htmlparser/atomutil.h"
#include "cpp/htmlparser/elements.h"
#include "cpp/htmlparser/strings.h"

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
  if (str.find('\"') != std::string::npos) {
    quote = '\'';
  }

  buf->sputc(quote);
  WriteToBuffer(str, buf);
  buf->sputc(quote);
}

// A stack structure that keeps track of the depth-first traversal of the
// elements tree that still need to be rendered.
class RenderStack {
 public:
  struct RenderTask {
    RenderTask(Node* node_, bool is_closing_tag_, bool is_raw_text_)
        : node(node_),
          is_closing_tag(is_closing_tag_),
          is_raw_text(is_raw_text_) {}
    Node* node;
    // Marks that this task is for the closing tag of node.
    bool is_closing_tag;
    // Used for TEXT_NODEs contained inside a RawText node.
    bool is_raw_text;
  };

  bool IsEmpty() const { return tasks_.empty(); }

  void PushRenderNode(Node* render_node) {
    tasks_.emplace(render_node, /*is_closing_tag=*/false,
                   /*is_raw_text=*/false);
  }

  void PushRenderCloseNode(Node* render_node) {
    tasks_.emplace(render_node, /*is_closing_tag=*/true, /*is_raw_text=*/false);
  }

  void PushRenderRawTextNode(Node* render_node) {
    tasks_.emplace(render_node, /*is_closing_tag=*/false, /*is_raw_text=*/true);
  }

  RenderTask Pop() {
    RenderTask task = tasks_.top();
    tasks_.pop();
    return task;
  }

 private:
  std::stack<RenderTask> tasks_;
};

RenderError RenderElementNode(Node* node, bool is_closing_tag,
                              RenderStack* render_tasks, std::stringbuf* buf) {
  if (is_closing_tag) {
    // Render the </xxx> closing tag.
    WriteToBuffer("</", buf);
    WriteToBuffer(node->DataAtom() == Atom::UNKNOWN
                      ? node->Data().data()
                      : AtomUtil::ToString(node->DataAtom()),
                  buf);
    buf->sputc('>');
    return RenderError::NO_ERROR;
  }
  // Render the <xxx> opening tag.
  buf->sputc('<');
  WriteToBuffer(node->DataAtom() == Atom::UNKNOWN
                    ? node->Data().data()
                    : AtomUtil::ToString(node->DataAtom()),
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

  if (auto ve = std::find(kVoidElements.begin(), kVoidElements.end(),
                          node->DataAtom());
      ve != kVoidElements.end()) {
    if (node->FirstChild()) {
      return RenderError::VOID_ELEMENT_CHILD_NODE;
    }
    WriteToBuffer(">", buf);
    return RenderError::NO_ERROR;
  } else {
    // Push the closing tag ahead of any children nodes, as tasks are processed
    // in reverse order.
    render_tasks->PushRenderCloseNode(node);
  }

  buf->sputc('>');

  // Add initial newline where there is danger of a newline being ignored.
  if (Node* c = node->FirstChild(); c && c->Type() == NodeType::TEXT_NODE &&
                                    Strings::StartsWith(c->Data(), "\n")) {
    if (node->DataAtom() == Atom::PRE || node->DataAtom() == Atom::LISTING ||
        node->DataAtom() == Atom::TEXTAREA) {
      buf->sputc('\n');
    }
  }

  // Render any child nodes.
  if (std::find(kRawTextNodes.begin(), kRawTextNodes.end(), node->DataAtom()) !=
      kRawTextNodes.end()) {
    for (Node* c = node->LastChild(); c != nullptr; c = c->PrevSibling()) {
      if (c->Type() == NodeType::TEXT_NODE) {
        render_tasks->PushRenderRawTextNode(c);
      } else {
        render_tasks->PushRenderNode(c);
      }
    }
    if (node->DataAtom() == Atom::PLAINTEXT) {
      // Don't render anything else. <plaintext> must be the last element
      // in the file, with no closing tag.
      return RenderError::PLAIN_TEXT_ABORT;
    }
  } else {
    for (Node* c = node->LastChild(); c != nullptr; c = c->PrevSibling()) {
      render_tasks->PushRenderNode(c);
    }
  }

  return RenderError::NO_ERROR;
}

}  // namespace.

RenderError Renderer::Render(Node* node, std::stringbuf* buf) {
  RenderStack render_tasks;
  render_tasks.PushRenderNode(node);
  while (!render_tasks.IsEmpty()) {
    RenderStack::RenderTask task = render_tasks.Pop();
    Node* node = task.node;

    switch (node->Type()) {
      case NodeType::ERROR_NODE:
        return RenderError::ERROR_NODE_NO_RENDER;
      case NodeType::TEXT_NODE:
        if (task.is_raw_text) {
          WriteToBuffer(node->Data().data(), buf);
        } else {
          Strings::Escape(node->Data().data(), buf);
        }
        break;
      case NodeType::DOCUMENT_NODE:
        for (Node* c = node->LastChild(); c != nullptr; c = c->PrevSibling()) {
          render_tasks.PushRenderNode(c);
        }
        break;
      case NodeType::ELEMENT_NODE: {
        auto err =
            RenderElementNode(node, task.is_closing_tag, &render_tasks, buf);
        if (err != RenderError::NO_ERROR) {
          return err;
        }
      } break;
      case NodeType::COMMENT_NODE:
        WriteToBuffer("<!--", buf);
        WriteToBuffer(node->Data().data(), buf);
        WriteToBuffer("-->", buf);
        break;
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
        break;
      }
      default:
        return RenderError::UNKNOWN_NODE_TYPE;
    }
  }
  return RenderError::NO_ERROR;
}

}  // namespace htmlparser.
