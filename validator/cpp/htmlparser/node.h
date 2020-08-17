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

#include "atom.h"
#include "error.h"
#include "token.h"

namespace htmlparser {

class Parser;

enum class NodeType {
  ERROR_NODE,
  TEXT_NODE,
  DOCUMENT_NODE,
  ELEMENT_NODE,
  COMMENT_NODE,
  DOCTYPE_NODE,
  SCOPE_MARKER_NODE,
};

// A Node consists of a NodeType and data (for text and comment node).
// A node is a member of a tree of Nodes. Element nodes may also
// have a Namespace and contain a slice of Attributes. Data is unescaped, so
// that it looks like "a<b" rather than "a&lt;b". For element nodes, DataAtom
// is the atom for Data, or Atom::UNKNOWN if Data is not a known tag name.
//
// An empty Namespace implies a "http://www.w3.org/1999/xhtml" namespace.
// Similarly, "math" is short for "http://www.w3.org/1998/Math/MathML", and
// "svg" is short for "http://www.w3.org/2000/svg".
class Node {
 public:
  Node(NodeType node_type, Atom atom = Atom::UNKNOWN);
  ~Node() = default;

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
  void UpdateChildNodesPositions(Node* relative_node);

  NodeType Type() const { return node_type_; }
  std::string_view Data() const { return data_; }
  Atom DataAtom() const { return atom_; }
  std::string_view NameSpace() const { return name_space_; }
  // Returns nullopt if ParseOptions.store_node_offsets is not set.
  std::optional<LineCol> PositionInHtmlSrc() const {
    return position_in_html_src_;
  }

  const std::vector<Attribute>& Attributes() const { return attributes_; }
  Node* Parent() const { return parent_; }
  Node* FirstChild() const { return first_child_; }
  Node* LastChild() const { return last_child_; }
  Node* PrevSibling() const { return prev_sibling_; }
  Node* NextSibling() const { return next_sibling_; }

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
  bool InsertBefore(Node* new_child, Node* old_child);

  // AppendChild adds new_child as a child of this node.
  //
  // Returns false if new_child is already has a parent or siblings.
  bool AppendChild(Node* new_child);

  // RemoveChild removes child_node if it is a child of this node.
  // Afterwards, child_node will have no parent and no siblings.
  Node* RemoveChild(Node* child_node);

  // Reparents all the child nodes of this node to the destination node.
  void ReparentChildrenTo(Node* destination);

  // Returns true if node element is html block element.
  // This doesn't take into account CSS style which can override this behavior,
  // example <div style="display:inline">
  bool IsBlockElementNode();

  // Similar to javascript's innerText. (Strips HTML).
  // Except: All elements are treated as inline elements. No new lines are
  // inserted for block elements. <div>hello</div><div>world</div> returns
  // 'hello world' not hello\nworld.
  std::string InnerText() const;

  // True, if this node is manufactured by parser as per HTML5 specification.
  // Currently, this applies only to HTML, HEAD and BODY tags.
  // TODO: Implement this for all manufactured tags.
  bool IsManufactured() const {
    return is_manufactured_;
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
  std::vector<Attribute> attributes_{};
  Node* first_child_ = nullptr;
  Node* next_sibling_ = nullptr;

  // Not owned.
  Node* parent_ = nullptr;
  Node* last_child_ = nullptr;
  Node* prev_sibling_ = nullptr;
  bool is_manufactured_{false};

#ifdef HTMLPARSER_NODE_DEBUG
  int64_t recursive_counter_ = 0;
#endif

  friend class Document;
  friend class NodeStack;
  friend class Parser;
};

class NodeStack {
 public:
  // Pops the stack.
  Node* Pop();
  // Pops n (count) elements off the stack.
  // if count is greater than the number of elements in the stack, entire stack
  // is cleared.
  void Pop(int count);

  // Returns the most recently pushed node, or nullptr if stack is empty.
  Node* Top();

  // Allows iterator like access to elements in stack_.
  // Since this is a stack. It returns reverse iterator.
  std::deque<Node*>::const_reverse_iterator begin() {
    return stack_.rbegin();
  }

  std::deque<Node*>::const_reverse_iterator begin() const {
    return stack_.rbegin();
  }

  std::deque<Node*>::const_reverse_iterator end() {
    return stack_.rend();
  }

  std::deque<Node*>::const_reverse_iterator end() const {
    return stack_.rend();
  }

  // Returns the index of the top-most occurrence of a node in the stack, or -1
  // if node is not present.
  int Index(Node* node);

  // Whether stack contains any node representing atom.
  bool Contains(Atom atom);

  // Inserts inserts a node at the given index.
  void Insert(int index, Node* node);

  // Replaces (old) node at the given index, with the given (new) node.
  // The index begins at the end of the deque (since it is a stack).
  void Replace(int index, Node* node);

  void Push(Node* node);

  // Removes a node from the stack. It is a no-op if node is not present.
  void Remove(Node* node);

  int size() const { return stack_.size(); }

  Node* at(int index) const { return stack_.at(index); }

 private:
  std::deque<Node*> stack_;
};

// The following two functions can be used by client's if they want to
// test consistency of the nodes built manually, or by the Parser.
// However, consider these as private. Should be used only by tests and not
// in production.
// ---------------------------------------------------------------------------
//
// Checks that a node and its descendants are all consistent in their
// parent/child/sibling relationships.
std::optional<Error> CheckTreeConsistency(Node* node);

// Checks that a node's parent/child/sibling relationships are consistent.
std::optional<Error> CheckNodeConsistency(Node* node);

}  // namespace htmlparser

#endif  // HTMLPARSER__NODE_H_
