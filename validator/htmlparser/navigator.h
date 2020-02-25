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

// A node navigator to navigate an HTML element tree.

#ifndef HTMLPARSER__NAVIGATOR_H_
#define HTMLPARSER__NAVIGATOR_H_

#include <string>

#include "node.h"

namespace htmlparser {

class NodeNavigator {
 public:
  // Creates a navigation model for a node as a root.
  explicit NodeNavigator(Node* node);

  Node* Current();
  NodeType Type();
  std::string LocalName();
  std::string Prefix();
  std::string Value();
  void MoveToRoot();
  bool MoveToParent();
  bool MoveToChild();
  bool MoveToFirst();
  bool MoveToNext();
  bool MoveToPrevious();
  // Moves the node to the same position as current node of other navigator.
  bool MoveTo(const NodeNavigator& other);
  NodeNavigator Clone();

 private:
  // The root node.
  Node* root_;

  // The current node at a particular navigation stage.
  Node* current_;
};

}  // namespace htmlparser

#endif  // HTMLPARSER__NAVIGATOR_H_
