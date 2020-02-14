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

#ifndef HTMLPARSER__NODE_H_
#define HTMLPARSER__NODE_H_

#include <deque>
#include <memory>
#include <optional>
#include <string>
#include <string_view>
#include <tuple>
#include <utility>
#include <vector>

#include "htmlparser/atom.h"
#include "htmlparser/error.h"
#include "htmlparser/token.h"

namespace htmlparser {

class Parser;
class Node;

using NodePtr = std::shared_ptr<Node>;

enum class NodeType {
  ERROR_NODE,
  TEXT_NODE,
  DOCUMENT_NODE,
  ELEMENT_NODE,
  COMMENT_NODE,
  DOCTYPE_NODE,
  SCOPE_MARKER_NODE,
};

// A Node consists of a NodeType and some Data (tag name for element nodes,
// content for text) and is part of a tree of Nodes. Element nodes may also
// have a Namespace and contain a slice of Attributes. Data is unescaped, so
// that it looks like "a<b" rather than "a&lt;b". For element nodes, DataAtom
// is the atom for Data, or Atom::UNKNOWN if Data is not a known tag name.
//
// An empty Namespace implies a "http://www.w3.org/1999/xhtml" namespace.
// Similarly, "math" is short for "http://www.w3.org/1998/Math/MathML", and
// "svg" is short for "http://www.w3.org/2000/svg".
//
// OWNERSHIP NOTES:
//  - All nodes are created as a shared object using make_node helper method,
//    with initial refcount to 1. As a general rule, user must ensure a node has
//    a reference (refcount > 0) in order to keep it alive. For instance, a
//    simple task of removing a child from one parent and attaching it to other
//    should be done in the following manner.
//      { // scope starts.
//        // Ensures the child node is not destroyed.
//        NodePtr tmp = some_child_node();  // refcount = 2.
//        root->RemoveChild(tmp);  // refcount = 1.
//        // Increases the refcount back to 2.
//        new_parent->AppendChild(tmp);
//      }  // refcount = 1.
//
//    If a node is created but not attached to any parent or sibling, or
//    subsequently removed (for ex: RemoveChild) etc, it will be
//    destructed by runtime after it leaves the scope that reduces the refcount
//    to 0.
//
// - A node can be parent-less. node->Parent() can be null.
//
// - In order to prevent cyclic references, node has following ownership rules:
//   1) The document node (root) is owned by the parser. Destroying the root
//      node will result in destruction of entire document tree.
//   2) For child nodes: First child is owned by parent.
//                       Subsequent child is owned by previous sibling.
//                       All other references to nodes are weak references only.
//
//             +------+
//         +---+ HTML |
//         |   +------+
//         v
//        Own
//         +
//         |
//     +---v--+                  +------+
//     | HEAD +------->Own+------> BODY |
//     +---+--+                  +------+
//         |
//         v
//        Own
//         +
//         |
//     +---+---+
//     | TITLE |
//     +-------+
//
// In the above example: HTML owns HEAD, HEAD owns TITLE and BODY. If HEAD is
// removed, BODY's ownership is granted to HTML while title is deleted.
class Node : public std::enable_shared_from_this<Node> {
 public:
  static NodePtr make_node(NodeType node_type, Atom atom = Atom::UNKNOWN) {
    NodePtr node = std::make_shared<Node>(node_type);
    node->atom_ = atom;
    return node;
  }

  // Use Node::make_node.
  explicit Node(NodeType node_type);

  // Allows move.
  Node(Node&&) = default;
  Node& operator=(Node&&) = default;

  // Disallow copy and assign.
  Node(const Node&) = delete;
  void operator=(const Node&) = delete;

  void SetData(std::string_view data);
  void AddAttribute(const Attribute& attr);
  // Sorts the attributes of this node.
  void SortAttributes(bool remove_duplicates = false);

  // Updates child nodes line and column numbers relative to the given node.
  // This does not change order or parent/child relationship of this or child
  // nodes in the tree.
  // Generally, treat this as a private function. Part of public interface for
  // some specific sceanrios:
  // A) Unit testing.
  // B) When parsing a fragment.
  // C) Custom error/warning reporting.
  void UpdateChildNodesPositions(NodePtr relative_node);

  NodeType Type() const { return node_type_; }
  std::string_view Data() const { return data_; }
  Atom DataAtom() const { return atom_; }
  std::string_view NameSpace() const { return name_space_; }
  // Returns nullopt if ParseOptions.store_node_offsets is not set.
  std::optional<LineCol> PositionInHtmlSrc() const {
    return position_in_html_src_;
  }

  const std::vector<Attribute>& Attributes() const { return attributes_; }
  NodePtr Parent() { return parent_.lock(); }
  NodePtr FirstChild() { return first_child_; }
  NodePtr LastChild() { return last_child_.lock(); }
  NodePtr PrevSibling() { return prev_sibling_.lock(); }
  NodePtr NextSibling() { return next_sibling_; }

  // Section 12.2.4.2 of the HTML5 specification says "The following elements
  // have varying levels of special parsing rules".
  // https://html.spec.whatwg.org/multipage/syntax.html#the-stack-of-open-elements
  // For the list of such elements see elements.h:kIsSpecialElement.
  bool IsSpecialElement() const;

  // InsertBefore inserts new_child as a child of this node, immediately before
  // old_child in the sequence of this node's children.
  // old_child may be null, in which case new_child is appended to the end of
  // this node's children.
  //
  // Returns false if new_child already has a parent or siblings.
  bool InsertBefore(NodePtr new_child, NodePtr old_child);

  // AppendChild adds new_child as a child of this node.
  //
  // Returns false if new_child is already has a parent or siblings.
  bool AppendChild(NodePtr new_child);

  // RemoveChild removes child_node if it is a child of this node.
  // Afterwards, child_node will have no parent and no siblings.
  //
  // Returns false if child_node's parent is not this node.
  bool RemoveChild(NodePtr child_node);

  // Returns a new node with the same type, data and attributes.
  // The clone has no parent, no siblings and no children.
  NodePtr Clone() const;

  // Reparents all the child nodes of this node to the destination node.
  void ReparentChildrenTo(NodePtr destination);

  // Returns true if node element is html block element.
  // This doesn't take into account CSS style which can override this behavior,
  // example <div style="display:inline">
  bool IsBlockElementNode();

  // Similar to javascript's innerText. (Strips HTML).
  // Except: All elements are treated as inline elements. No new lines are
  // inserted for block elements. <div>hello</div><div>world</div> returns
  // 'hello world' not hello\nworld.
  std::string InnerText();

  // True, if this node is manufactured by parser as per HTML5 specification.
  // Currently, this applies only to HTML, HEAD and BODY tags.
  // TODO(amaltas): Implement this for all manufactured tags.
  bool IsManufactured() const {
    return is_manufactured_;
  }

  bool operator==(const Node& other) {
    return this == std::addressof(other);
  }

  bool operator==(NodePtr other) {
    return other && shared_from_this() == other;
  }

  bool operator!=(const Node& other) {
    return this != std::addressof(other);
  }

  bool operator!=(NodePtr other) {
    return other && shared_from_this() != other;
  }

  // Debug/Logging utils.
  // Outputs node debug info.
  std::string DebugString();

 private:
  void SetManufactured(bool is_manufactured) {
    is_manufactured_ = is_manufactured;
  }

  NodeType node_type_;
  Atom atom_;
  std::string data_;
  std::string name_space_;
  // Position at which this node appears in HTML source.
  std::optional<LineCol> position_in_html_src_;
  // TODO(amaltas): Convert this to contain shared_ptr<Attribute> to avoid
  // copying.
  std::vector<Attribute> attributes_;
  std::weak_ptr<Node> parent_;
  NodePtr first_child_;
  std::weak_ptr<Node> last_child_;
  std::weak_ptr<Node> prev_sibling_;
  NodePtr next_sibling_;
  bool is_manufactured_{false};
  friend class NodeStack;
  friend class Parser;
};

class NodeStack {
 public:
  // Pops the stack.
  NodePtr Pop();
  // Pops n (count) elements off the stack.
  // if count is greater than the number of elements in the stack, entire stack
  // is cleared.
  void Pop(int count);

  // Returns the most recently pushed node, or nullptr if stack is empty.
  NodePtr Top();

  // Allows iterator like access to elements in stack_.
  // Since this is a stack. It returns reverse iterator.
  std::deque<NodePtr>::const_reverse_iterator begin() {
    return stack_.rbegin();
  }

  std::deque<NodePtr>::const_reverse_iterator begin() const {
    return stack_.rbegin();
  }

  std::deque<NodePtr>::const_reverse_iterator end() {
    return stack_.rend();
  }

  std::deque<NodePtr>::const_reverse_iterator end() const {
    return stack_.rend();
  }

  // Returns the index of the top-most occurrence of a node in the stack, or -1
  // if node is not present.
  int Index(NodePtr node);

  // Whether stack contains any node representing atom.
  bool Contains(Atom atom);

  // Inserts inserts a node at the given index.
  void Insert(int index, NodePtr node);

  // Replaces (old) node at the given index, with the given (new) node.
  // The index begins at the end of the deque (since it is a stack).
  void Replace(int index, NodePtr node);

  void Push(NodePtr node);

  // Removes a node from the stack. It is a no-op if node is not present.
  void Remove(NodePtr node);

  int size() const { return stack_.size(); }

  NodePtr at(int index) const { return stack_.at(index); }

 private:
  std::deque<NodePtr> stack_;
};

// The following two functions can be used by client's if they want to
// test consistency of the nodes built manually, or by the Parser.
// However, consider these as private. Should be used only by tests and not
// in production.
// ---------------------------------------------------------------------------
//
// Checks that a node and its descendants are all consistent in their
// parent/child/sibling relationships.
std::optional<Error> CheckTreeConsistency(NodePtr node);

// Checks that a node's parent/child/sibling relationships are consistent.
std::optional<Error> CheckNodeConsistency(NodePtr node);

}  // namespace htmlparser

#endif  // HTMLPARSER__NODE_H_
