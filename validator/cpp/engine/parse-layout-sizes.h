#ifndef CPP_ENGINE_PARSE_LAYOUT_SIZES_H_
#define CPP_ENGINE_PARSE_LAYOUT_SIZES_H_

#include <vector>

#include "absl/strings/string_view.h"

namespace amp::validator::parse_layout_sizes {

// WARNING: This code is still in development and not ready to be used.

// This is a single representation for the CssSizes object.
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

#endif  // CPP_ENGINE_PARSE_LAYOUT_SIZES_H_
