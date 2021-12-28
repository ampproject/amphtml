#ifndef CPP_HTMLPARSER_ITERATOR_H_
#define CPP_HTMLPARSER_ITERATOR_H_

#include <iterator>
#include <stack>

#include "cpp/htmlparser/node.h"

namespace htmlparser {

class Document;

// A forward iterator that facilitates iterating dom tree (through root node),
// in depth first traversal.
//
// Example usage:
// auto doc = parser.Parse(html);
// for (auto iter = doc.begin(); iter != doc.end(); ++iter) {
//   ProcessNode(*iter);
// }
//
// The above dom without NodeIterator require a lot of boiler plate code like
// defining a stack class and data structure, knowledge of Node data structure.
//
// Clients should not access this class directly but get handle from Document
// object.
// auto iter = doc.begin();
// auto const_iter = doc.cbegin();
template <bool Const>
class NodeIterator {
 public:
  // Member typdefs required by std::iterator_traits
  // Not the correct type, and not used anyway.
  using difference_type = std::ptrdiff_t;
  using value_type = Node;
  using pointer = std::conditional_t<Const, const Node*, Node*>;
  using reference = std::conditional_t<Const, const Node&, Node&>;
  using iterator_category = std::forward_iterator_tag;

  reference operator*() const { return *current_node_; }
  pointer operator->() const { return current_node_; }

  // Prefix increment.
  auto& operator++() {
    if (current_node_->FirstChild()) {
      if (current_node_->NextSibling()) {
        stack_.push(current_node_->NextSibling());
      }
      current_node_ = current_node_->FirstChild();
    } else {
      current_node_ = current_node_->NextSibling();
    }

    if (!current_node_) {
      if (!stack_.empty()) {
        current_node_ = stack_.top();
        stack_.pop();
      }
    }

    return *this;
  }

  // Postfix increment.
  auto operator++(int) {
    auto result = *this; ++*this; return result;
  }

  template<bool R>
  bool operator==(const NodeIterator<R>& rhs) const {
    return current_node_ == rhs.current_node_;
  }

  template<bool R>
  bool operator!=(const NodeIterator<R>& rhs) const {
    return current_node_ != rhs.current_node_;
  }

  operator NodeIterator<true>() const {
    return NodeIterator<true>{current_node_};
  }

 private:
  explicit NodeIterator(Node* node) : current_node_(node) {}

  friend class Document;
  friend class NodeIterator<!Const>;
  using node_pointer = std::conditional_t<Const, const Node*, Node*>;
  node_pointer current_node_;
  // Facilitates depth first traversal.
  std::stack<Node*> stack_;
};

}  // namespace htmlparser


#endif  // CPP_HTMLPARSER_ITERATOR_H_
