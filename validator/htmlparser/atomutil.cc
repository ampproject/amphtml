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

#include "atomutil.h"

#include "hash.h"

namespace htmlparser {

Atom AtomUtil::ToAtom(const std::string& s) {
  if (s.empty() || s.size() > kMaxAtomLength) {
    return Atom::UNKNOWN;
  }

  uint32_t hash = Hash::FNVHash(s, kInitialHashValue);
  uint32_t table_index = hash & (kNamesHashTable.size() - 1);
  uint32_t atom_value = kNamesHashTable[table_index];
  int atom_len = atom_value & 0xff;
  if (atom_len == s.size() && ToString(atom_value) == s) {
    return CastToAtom(atom_value);
  }

  table_index = (hash >> 16) & (kNamesHashTable.size() - 1);
  atom_value = kNamesHashTable[table_index];
  atom_len = atom_value & 0xff;
  if (atom_len == s.size() && ToString(atom_value).compare(s) == 0) {
    return CastToAtom(atom_value);
  }

  return Atom::UNKNOWN;
}

std::string AtomUtil::ToString(Atom a, std::string_view unknown_tag_name) {
  if (a == Atom::UNKNOWN) return std::string(unknown_tag_name);
  uint32_t start = static_cast<uint32_t>(a) >> 8;
  uint32_t n = static_cast<uint32_t>(a) & 0xff;
  if ((start + n) > kAtomText.size()) {
    return std::string(unknown_tag_name);
  }
  return std::string(kAtomText.substr(start, n));
}

}  // namespace htmlparser
