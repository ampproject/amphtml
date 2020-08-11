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

#include "navigator.h"

namespace htmlparser {

NodeNavigator::NodeNavigator(Node* node) : root_(node), current_(node) {
}

Node* NodeNavigator::Current() {
  return current_;
}

NodeType NodeNavigator::Type() {
  return current_->Type();
}

std::string NodeNavigator::LocalName() {
  return std::string(current_->Data());
}

std::string NodeNavigator::Prefix() {
 return "";
}

std::string NodeNavigator::Value() {
  switch (current_->Type()) {
    case NodeType::COMMENT_NODE: {
      return std::string(current_->Data());
    }
    case NodeType::ELEMENT_NODE: {
      return current_->InnerText();
    }
    case NodeType::TEXT_NODE: {
      return std::string(current_->Data());
    }
    default:
      break;
  }

  return "";
}

NodeNavigator NodeNavigator::Clone() {
  NodeNavigator other(current_);
  other.root_ = root_;
  other.current_ = current_;
  return other;
}

void NodeNavigator::MoveToRoot() {
  current_ = root_;
}

bool NodeNavigator::MoveToParent() {
  Node* parent = current_->Parent();
  if (parent) {
    current_ = parent;
    return true;
  }

  return false;
}

bool NodeNavigator::MoveToChild() {
  Node* child = current_->FirstChild();
  if (child) {
    current_ = child;
    return true;
  }

  return false;
}

bool NodeNavigator::MoveToFirst() {
  Node* previous_sibling = current_->PrevSibling();
  if (!previous_sibling) {
    return false;
  }

  while (previous_sibling) {
    current_= previous_sibling;
    previous_sibling = current_->PrevSibling();
  }

  return true;
}

bool NodeNavigator::MoveToNext() {
  Node* sibling = current_->NextSibling();
  if (sibling) {
    current_ = sibling;
    return true;
  }

  return false;
}

bool NodeNavigator::MoveToPrevious() {
  Node* sibling = current_->PrevSibling();
  if (sibling) {
    current_ = sibling;
    return true;
  }

  return false;
}

// Moves the navigator to the same position as the specified navigator.
bool NodeNavigator::MoveTo(const NodeNavigator& other) {
  // They must belong to the same root.
  if (root_ != other.root_) return false;

  current_ = other.current_;
  return true;
}

}  // namespace htmlparser
