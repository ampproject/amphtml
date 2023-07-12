#ifndef CPP_ENGINE_PARSE_SRCSET_H_
#define CPP_ENGINE_PARSE_SRCSET_H_

#include <string>
#include <vector>

#include "absl/strings/string_view.h"
#include "validator.pb.h"
#include "re2/re2.h"

namespace amp::validator::parse_srcset {

// Defined at https://w3c.github.io/html/single-page.html#image-candidate-string
struct ImageCandidate {
  // ParseSourceSet does not validate that this field is a valid url.  It does,
  // however, guarantee that this field will not be empty.
  std::string url;
  // Either the width or pixel density, e.g. "2x" or "640w". Can also be empty.
  std::string width_or_pixel_density;

  bool operator==(const ImageCandidate& other) const {
    return url == other.url &&
           width_or_pixel_density == other.width_or_pixel_density;
  }
};

struct SrcsetParsingResult {
  // Whether the parser succeeded in parsing the srcset.
  bool success;
  // If there was an error during parsing, which error was it.
  amp::validator::ValidationError::Code error_code;
  // The set of ImageCandidates that were parsed from srcset.
  std::vector<ImageCandidate> srcset_images;
};

// Parse the srcset attribute as specified at
// https://html.spec.whatwg.org/multipage/embedded-content.html#the-picture-element
// This function will not verify whether urls are valid. However, it does check
// that a valid srcset attribute has one or more image candidate strings - so
// if the function return value indicates |success==true|, then |srcset_images|
// will be non-empty.
//
// Returns SrcsetParsingResult.
SrcsetParsingResult ParseSourceSet(
    re2::StringPiece srcset
);

}  // namespace amp::validator::parse_srcset

#endif  // CPP_ENGINE_PARSE_SRCSET_H_
