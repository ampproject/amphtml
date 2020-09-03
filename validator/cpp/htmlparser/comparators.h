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

// Comparators for calling standard algorithms on various containers.

#ifndef HTMLPARSER__COMPARATORS_H_
#define HTMLPARSER__COMPARATORS_H_

#include <utility>

namespace htmlparser {

// Comparator for performining binary search on list/array of std::pair(s).
template <typename K, typename V>
struct PairComparator {
  bool operator()(const std::pair<K, V>& left,
                  const K& right) const {
    return left.first < right;
  }

  bool operator()(const K& left,
                  const std::pair<K, V>& right) const {
    return left < right.first;
  }
};

}  // namespace htmlparser

#endif  // HTMLPARSER__COMPARATORS_H_
