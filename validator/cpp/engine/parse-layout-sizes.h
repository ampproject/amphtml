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

#ifndef AMPVALIDATOR__PARSE_LAYOUT_SIZES_H_
#define AMPVALIDATOR__PARSE_LAYOUT_SIZES_H_

#include <vector>

#include "absl/strings/string_view.h"

namespace amp::validator::parse_layout_sizes {

// WARNING: This code is still in development and not ready to be used.

// This is a single represenation for the CssSizes object.
// It consists of at least a valid size and a possible media condition.
// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
struct CssSize {
  // The source size value (e.g. 320px or calc(50vw + 10px).
  absl::string_view size;
  // The media condition (e.g. (min-width: 320px)).
  absl::string_view media;
  // Whether this is the default size (the last in a sizes attribute value).
  bool is_default = false;

  bool operator==(const CssSize& other) const {
    return size == other.size && media == other.media &&
           is_default == other.is_default;
  }
};

// Parses the sizes attribute which is a part of AMP layout. Sizes consist of
// at least one default size without a media condition and possibly zero or more
// with both a media condition and a size.
// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
struct CssSizes {
  // Whether the attribute value is set.
  bool is_set = false;
  // Whether the attribute value is valid after attempting to parse.
  bool is_valid = false;
  // The collection of one or more source sizes. See CssSize.
  std::vector<CssSize> sizes;
  // Parses a given |input| value.
  explicit CssSizes(absl::string_view input);
};

}  // namespace amp::validator::parse_layout_sizes

#endif  // AMPVALIDATOR__PARSE_LAYOUT_SIZES_H_
