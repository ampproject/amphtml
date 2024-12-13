#include "cpp/htmlparser/node.h"

#include <algorithm>
#include <functional>
#include <sstream>

#include "absl/strings/str_join.h"
#include "absl/strings/string_view.h"
#include "cpp/htmlparser/atomutil.h"
#include "cpp/htmlparser/elements.h"
#include "cpp/htmlparser/logging.h"

namespace htmlparser {

Node::Node(NodeType node_type, Atom atom, std::string name_space) :
    node_type_(node_type), atom_(atom), name_space_(name_space) {}

void Node::SetData(std::string_view data) {
  data_ = data;
}

void Node::AddAttribute(const Attribute& attr) {
  attributes_.push_back(attr);
}

void Node::SortAttributes(bool remove_duplicates) {
  std::stable_sort(attributes_.begin(), attributes_.end(),
            [](const Attribute& left, const Attribute& right) -> bool {
              return left.KeyPart() < right.KeyPart();
            });
  if (remove_duplicates) DropDuplicateAttributes();
}

void Node::DropDuplicateAttributes() {
  auto remove_attributes = [&](auto first, auto last) {
    for (; first != last; ++first) {
      last = std::remove_if(std::next(first), last, [first](const auto& attr) {
        return first->KeyPart() == attr.KeyPart();
      });
    }
    return last;
  };
  attributes_.erase(remove_attributes(attributes_.begin(), attributes_.end()),
                    attributes_.end());
}

bool Node::IsSpecialElement() const {
  if (name_space_ == "" || name_space_ == "html") {
    return std::find(kSpecialElements.begin(),
                     kSpecialElements.end(),
                     atom_) != kSpecialElements.end();
  } else if (name_space_ == "math") {
    if (atom_ == Atom::MI ||
        atom_ == Atom::MO ||
        atom_ == Atom::MN ||
        atom_ == Atom::MS ||
        atom_ == Atom::MTEXT ||
        atom_ == Atom::ANNOTATION_XML) {
      return true;
    }
  } else if (name_space_ == "svg") {
    if (atom_ == Atom::FOREIGN_OBJECT ||
        atom_ == Atom::DESC ||
        atom_ == Atom::TITLE) {
      return true;
    }
  }
  return false;
}

bool Node::InsertBefore(Node* new_child, Node* old_child) {
  // Checks if it new_child is already attached.
  if (new_child->Parent() ||
      new_child->PrevSibling() ||
      new_child->NextSibling()) {
    return false;
  }

  Node* prev = nullptr;
  Node* next = nullptr;
  if (old_child) {
    prev = old_child->PrevSibling();
    next = old_child;
  } else {
    prev = LastChild();
  }
  if (prev) {
    prev->next_sibling_ = new_child;
  } else {
    first_child_ = new_child;
  }

  if (next) {
    next->prev_sibling_ = new_child;
  } else {
    last_child_ = new_child;
  }

  new_child->parent_ = this;
  new_child->prev_sibling_ = prev;
  new_child->next_sibling_ = next;

  return true;
}

bool Node::AppendChild(Node* new_child) {
  CHECK(!(new_child->Parent() || new_child->PrevSibling() ||
          new_child->NextSibling()))
      << "html: AppendChild called for an attached child Node.";

  Node* last = LastChild();
  if (last) {
    last->next_sibling_ = new_child;
  } else {
    first_child_ = new_child;
  }
  last_child_ = new_child;
  new_child->parent_ = this;
  new_child->prev_sibling_ = last;

  return true;
}

Node* Node::RemoveChild(Node* c) {
  // Remove child called for a non-child node.
  CHECK(c->parent_ == this) << "html: RemoveChild called for a non-child Node";

  if (first_child_ == c) {
    first_child_ = c->next_sibling_;
  }

  if (c->next_sibling_) {
    c->NextSibling()->prev_sibling_ = c->prev_sibling_;
  }

  if (last_child_ == c) {
    last_child_ = c->prev_sibling_;
  }

  if (c->prev_sibling_) {
    c->prev_sibling_->next_sibling_ = c->next_sibling_;
  }

  c->parent_ = nullptr;
  c->prev_sibling_ = nullptr;
  c->next_sibling_ = nullptr;
  return c;
}

void Node::ReparentChildrenTo(Node* destination) {
  while (true) {
    Node* child = first_child_;
    if (!child) break;
    destination->AppendChild(RemoveChild(child));
  }
}

Node* NodeStack::Pop() {
  if (stack_.size() > 0) {
    Node* node = stack_.back();
    stack_.pop_back();
    return node;
  }
  return nullptr;
}

void NodeStack::Pop(int count) {
  if (stack_.empty()) return;

  int sz = stack_.size();
  if (count >= sz) {
    stack_.clear();
  }
  stack_.erase(stack_.end() - count, stack_.end());
}

Node* NodeStack::Top() {
  if (stack_.size() > 0) return stack_.at(stack_.size() - 1);
  return nullptr;
}

int NodeStack::Index(Node* node) {
  for (int i = stack_.size() - 1; i >= 0; --i) {
    Node* other = stack_[i];
    if (other == node) {
      return i;
    }
  }

  return -1;
}

bool NodeStack::Contains(Atom atom) {
  for (Node* n : stack_) {
    if (n->atom_ == atom && n->name_space_.empty()) return true;
  }
  return false;
}

void NodeStack::Push(Node* node) {
  stack_.push_back(node);
}

void NodeStack::Insert(int index, Node* node) {
  stack_.insert(stack_.begin() + index, node);
}

void NodeStack::Replace(int i, Node* node) {
  if (i > stack_.size() - 1) return;
  stack_[i] = node;
}

void NodeStack::Remove(Node* node) {
  for (auto it = stack_.begin(); it != stack_.end(); ++it) {
    if (*it == node) {
      stack_.erase(it);
      return;
    }
  }
}

namespace {

std::optional<Error> CheckTreeConsistencyInternal(Node* node, int depth) {
  if (depth == 0x1e4) {
    return error("html: tree looks like it contains a cycle");
  }

  auto err = CheckNodeConsistency(node);
  if (err) {
    return err;
  }

  for (Node* c = node->FirstChild(); c; c = c->NextSibling()) {
    auto err = CheckTreeConsistencyInternal(c, depth+1);
    if (err) {
      return err;
    }
  }

  return std::nullopt;
}

}  // namespace

std::optional<Error> CheckTreeConsistency(Node* node) {
  return CheckTreeConsistencyInternal(node, 0);
}

std::optional<Error> CheckNodeConsistency(Node* node) {
  if (!node) return std::nullopt;

  int num_parents = 0;

  for (Node* parent = node->Parent(); parent; parent = parent->Parent()) {
    num_parents++;
    if (num_parents == 0x1e4) {
      return error("html: parent list looks like an infinite loop");
    }
  }

  int num_forwards = 0;
  for (Node* c = node->FirstChild(); c; c = c->NextSibling()) {
    num_forwards++;
    if (num_forwards == 0x1e6) {
      return error("html: forward list of children looks like an infinite "
                   "loop");
    }
    if (c->Parent() != node) {
      return error("html: inconsistent child/parent relationship");
    }
  }

  int num_backwards = 0;
  for (Node* c = node->LastChild(); c; c = c->PrevSibling()) {
    num_backwards++;
    if (num_backwards == 0x1e6) {
      return error("html: backward list of children looks like an infinite "
                   "loop");
    }
    if (c->Parent() != node) {
      return error("html: inconsistent child/parent relationship");
    }
  }

  if (node->Parent()) {
    if (node->Parent() == node) {
      return error("html: inconsistent parent relationship");
    }
    if (node->Parent() == node->FirstChild()) {
      return error("html: inconsistent parent/first relationship");
    }
    if (node->Parent() == node->LastChild()) {
      return error("html: inconsistent parent/last relationship");
    }
    if (node->Parent() == node->PrevSibling()) {
      return error("html: inconsistent parent/prev relationship");
    }
    if (node->Parent() == node->NextSibling()) {
      return error("html: inconsistent parent/next relationship");
    }

    bool parent_has_n_as_a_child = false;
    for (Node* c = node->Parent()->FirstChild(); c; c = c->NextSibling()) {
      if (c == node) {
        parent_has_n_as_a_child = true;
        break;
      }
    }
    if (!parent_has_n_as_a_child) {
      return error("html: inconsistent parent/child relationship");
    }
  }

  if (node->PrevSibling() && node->PrevSibling()->NextSibling() != node) {
    return error("html: inconsistent prev/next relationship");
  }
  if (node->NextSibling() && node->NextSibling()->PrevSibling() != node) {
    return error("html: inconsistent next/prev relationship");
  }
  if ((node->FirstChild() == nullptr) != (node->LastChild() == nullptr)) {
    return error("html: inconsistent first/last relationship");
  }
  if (node->FirstChild() && node->FirstChild() == node->LastChild()) {
    // We have a sole child.
    if (node->FirstChild()->PrevSibling() ||
        node->FirstChild()->NextSibling()) {
      return error("html: inconsistent sold child's sibling relationship");
    }
  }

  // Sorted inserts and no duplicates.
  std::vector<Node*> seen;
  Node* last = nullptr;
  for (Node* c = node->FirstChild(); c; c = c->NextSibling()) {
    auto insert_position = std::lower_bound(seen.begin(),
                                            seen.end(),
                                            c);
    if (insert_position != seen.end() && *insert_position == c) {
      return error("html: inconsistent repeated child");
    }

    seen.insert(insert_position, c);
    last = c;
  }

  if (last != node->LastChild()) {
    return error("html: inconsistent last relationship");
  }

  Node* first = nullptr;
  for (Node* c = node->LastChild(); c; c = c->PrevSibling()) {
    auto iter = std::lower_bound(seen.begin(),
                                 seen.end(),
                                 c);
    if (iter == seen.end() || *iter != c) {
      return error("html: inconsistent missing child");
    }
    seen.erase(iter);
    first = c;
  }
  if (first != node->FirstChild()) {
    return error("html: inconsistent first relationship");
  }

  if (!seen.empty()) {
    return error("html: inconsistent forwards/backwards child list");
  }

  return std::nullopt;
}

bool Node::IsBlockElementNode() {
  return std::find(kBlockElements.begin(),
                   kBlockElements.end(),
                   atom_) != kBlockElements.end();
}

std::string Node::InnerText() const {
  static std::function<void(const Node*, std::vector<absl::string_view>&)>
      output =
          [](const Node* node, std::vector<absl::string_view>& output_content) {
            switch (node->Type()) {
              case NodeType::TEXT_NODE: {
                output_content.push_back(absl::string_view(
                    node->Data().data(), node->Data().size()));
                return;
              }
              case NodeType::COMMENT_NODE: {
                // Ignore comments.
                return;
              }
              default:
                break;
            }

            for (Node* child = node->FirstChild(); child;
                 child = child->NextSibling()) {
              output(child, output_content);
            }
          };

  std::vector<absl::string_view> buffer;
  output(this, buffer);

  return absl::StrJoin(buffer, " ");
}

void Node::UpdateChildNodesPositions(Node* relative_node) {
  // Cannot proceed if relative node has no positional information.
  if (!relative_node->LineColInHtmlSrc().has_value()) return;

  auto [r_line, r_col] = relative_node->LineColInHtmlSrc().value();

  // Update the positions of this node.
  if (line_col_in_html_src_.has_value()) {
    auto [line, col] = line_col_in_html_src_.value();
    int effective_col = line == 1 ?
        r_col + col + AtomUtil::ToString(
            relative_node->DataAtom()).size() + 1 /* closing > */ : col;
    line_col_in_html_src_ = LineCol({line + r_line - 1, effective_col});
  }

  // Update the positions of this node's children.
  for (auto c = FirstChild(); c; c = c->NextSibling()) {
    c->UpdateChildNodesPositions(relative_node);
  }
}

std::string Node::DebugString() {
  std::ostringstream ost;
  switch (node_type_) {
    case NodeType::ELEMENT_NODE:
      ost << "<" << AtomUtil::ToString(atom_) << ">";
      break;
    case NodeType::TEXT_NODE:
      ost << "TEXT[" << data_.size() << "]";
      break;
    case NodeType::COMMENT_NODE:
      ost << "COMMENT[" << data_.size() << "]";
      break;
    default:
      // Ignores doctype, error, document node types.
      break;
  }

  if (line_col_in_html_src_.has_value()) {
    ost << line_col_in_html_src_.value().first << ":"
        << line_col_in_html_src_.value().second;
  }
  ost << "\n";

  return ost.str();
}

}  // namespace htmlparser
