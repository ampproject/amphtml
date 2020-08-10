//
// Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

#ifndef HTMLPARSER__DOCUMENT_H_
#define HTMLPARSER__DOCUMENT_H_

#include <memory>
#include <vector>

#include "allocator.h"
#include "node.h"
#include "token.h"

namespace htmlparser {

class Parser;
class ParseOptions;

// The document class is a wrapper for the DOM tree exposed with RootNode().
// All the nodes inside the document are owned by document. The nodes are
// destroyed when Document objects goes out of scope or deleted.
class Document {
 public:
  ~Document() = default;

  // Returns the root node of a DOM tree. Node* owned by document.
  Node* RootNode() const { return root_node_; }

  // Returns list of nodes parsed as a document fragment. All the Nodes are
  // owned by the document.
  const std::vector<Node*> FragmentNodes() const { return fragment_nodes_; }

 private:
  // Can only be constructed by Parser, a friend class.
  Document();

  // Creates a new node. The node is owned by Document and is destroyed when
  // document is destructed.
  Node* NewNode(NodeType node_type, Atom atom = Atom::UNKNOWN);

  // Returns a new node with the same type, data and attributes.
  // The clone has no parent, no siblings and no children.
  // The node is owned by the document and is destroyed when document is
  // destructed.
  Node* CloneNode(const Node* from);

  // The node allocator.
  std::unique_ptr<Allocator<Node>> node_allocator_;

  Node* root_node_;
  std::vector<Node*> fragment_nodes_{};

  friend class Parser;
  friend std::unique_ptr<Document> Parse(std::string_view html);
  friend std::unique_ptr<Document> ParseWithOptions(
      std::string_view html, const ParseOptions& options);
  friend std::unique_ptr<Document> ParseFragment(std::string_view html,
                                                 Node* fragment_parent);
  friend std::unique_ptr<Document> ParseFragmentWithOptions(
      const std::string_view html,
      const ParseOptions& options,
      Node* fragment_parent);
};

}  // namespace htmlparser


#endif  // HTMLPARSER__DOCUMENT_H_
