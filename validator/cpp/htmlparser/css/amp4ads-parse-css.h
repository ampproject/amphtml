#ifndef CPP_HTMLPARSER_CSS_AMP4ADS_PARSE_CSS_H_
#define CPP_HTMLPARSER_CSS_AMP4ADS_PARSE_CSS_H_

#include <string>
#include <vector>
#include "cpp/htmlparser/css/parse-css.h"
//
// This is *not* meant to be a public API.
//
// We are just separating this functionality into its own library
// which is called from validator.cc. The format for calling this
// will change, especially once we allow more generic configuration
// for these checks.
//
// The draft specification for A4A is located here:
// https://github.com/ampproject/amphtml/blob/main/extensions/amp-a4a/amp-a4a-format.md
//

namespace htmlparser::css {
// Validates the provided |stylesheet|, emitting into |errors|.
void ValidateAmp4AdsCss(const Stylesheet& stylesheet,
                        std::vector<std::unique_ptr<ErrorToken>>* errors);
}  // namespace htmlparser::css

#endif  // CPP_HTMLPARSER_CSS_AMP4ADS_PARSE_CSS_H_
