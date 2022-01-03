#ifndef CPP_ENGINE_KEYFRAMES_PARSE_CSS_H_
#define CPP_ENGINE_KEYFRAMES_PARSE_CSS_H_

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
// The draft specification for Keyframes is located here:
// https://github.com/ampproject/amphtml/issues/9625
//
namespace amp::validator::parse_css {
// Validates the provided |stylesheet|, emitting into |errors|.
void ValidateKeyframesCss(
    const htmlparser::css::Stylesheet& stylesheet,
    std::vector<std::unique_ptr<htmlparser::css::ErrorToken>>* errors);
}  // namespace amp::validator::parse_css

#endif  // CPP_ENGINE_KEYFRAMES_PARSE_CSS_H_
