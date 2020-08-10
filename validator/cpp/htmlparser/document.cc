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

#include "document.h"

namespace htmlparser {

constexpr std::size_t kNodeAllocatorBlockSize = 256 << 10;  // 256k.

Document::Document() :
    node_allocator_(new Allocator<Node>(kNodeAllocatorBlockSize)),
    root_node_(NewNode(NodeType::DOCUMENT_NODE)) {}

Node* Document::NewNode(NodeType node_type, Atom atom) {
  return node_allocator_->Construct(node_type, atom);
}

Node* Document::CloneNode(const Node* from) {
  Node* clone = NewNode(from->Type());
  clone->atom_ = from->atom_;
  clone->data_ = from->data_;
  std::copy(from->Attributes().begin(), from->Attributes().end(),
            std::back_inserter(clone->attributes_));
  return clone;
}

}  // namespace htmlparser
