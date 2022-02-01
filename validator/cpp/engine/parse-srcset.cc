#include "cpp/engine/parse-srcset.h"

#include <unordered_set>
#include <vector>

#include "absl/strings/string_view.h"
#include "re2/re2.h"

using amp::validator::ValidationError;
using std::unordered_set;
using std::vector;

namespace amp::validator::parse_srcset {
// If parsing fails, returns false in SrcsetParsingResult.status.
SrcsetParsingResult ParseSourceSet(
    re2::StringPiece srcset
) {
  // Regex for leading spaces, followed by an optional comma and whitespace,
  // followed by an URL*, followed by an optional space, followed by an
  // optional width or pixel density**, followed by spaces, followed by an
  // optional comma and whitespace.
  //
  // URL*: matches non-space, non-empty string which neither ends nor begins
  // with a comma. The set of space characters in the srcset attribute is
  // defined to include only ascii characters, so using \s, which is an
  // ascii only character set, is fine. See
  // https://html.spec.whatwg.org/multipage/infrastructure.html#space-character.
  //
  // Optional width or pixel density**: Matches the empty string or (one or
  // more spaces + a non empty string containing no space or commas).
  // Doesn't capture the initial space.
  //
  // \s*                       Match, but don't capture leading spaces.
  // (?:,\s*)?                 Optionally match comma and trailing space,
  //                           but don't capture comma.
  // ([^,\s]\S*[^,\s])         Match something like "google.com/favicon.ico"
  //                           but not ",google.com/favicon.ico,".
  // \s*                       Match, but don't capture spaces.
  // (                         Match the width or density descriptor...
  // \s*                       Match, but don't capture space
  // (                         Match the width or density descriptor...
  //   [1-9]\d*[wx]            which is a non-zero integer followed by a w
  //                           or an x ...
  //   |                       or ...
  //   [1-9]\d*\.\d+x          a decimal with its whole-number part greater
  //                           than zero and followed by an x ...
  //   |                       or ...
  //   0\.\d*[1-9]\d*x         a decimal with its fractional part greater
  //                           than zero and followed by an x ...
  // )?                        and make it optional.
  // \s*                       Match, but don't capture space.
  // (?:(,)\s*)?               Optionally match comma and trailing space,
  //                           capturing comma.
  static LazyRE2 image_candidate_regex = {
      "\\s*"
      "(?:,\\s*)?"
      "([^,\\s]\\S*[^,\\s])"
      "\\s*"
      "("
      "[1-9]\\d*[wx]"
      "|"
      "[1-9]\\d*\\.\\d+x"
      "|"
      "0\\.\\d*[1-9]\\d*x"
      ")?"
      "\\s*"
      "(?:(,)\\s*)?"};

  vector<ImageCandidate> candidates;
  std::string url, width_or_pixel_density, comma;
  unordered_set<std::string> seen_width_or_pixel_density;
  while (RE2::Consume(&srcset, *image_candidate_regex, &url,
                      &width_or_pixel_density, &comma)) {
    if (width_or_pixel_density.empty()) width_or_pixel_density = "1x";
    // Duplicate width or pixel density in srcset.
    if (!seen_width_or_pixel_density.insert(width_or_pixel_density).second)
      return SrcsetParsingResult{
          /*success=*/false,
          /*error_code=*/ValidationError::DUPLICATE_DIMENSION,
          /*srcset_images=*/candidates};
    candidates.push_back({url, width_or_pixel_density});
    // If no more srcset, break.
    if (srcset.empty()) break;
    // More srcset, comma expected as separator for image candidates.
    if (comma.empty())
      return SrcsetParsingResult{
          /*success=*/false,
          /*error_code=*/ValidationError::INVALID_ATTR_VALUE,
          /*srcset_images=*/candidates};
  }
  // Regex didn't consume all of the srcset string.
  if (!srcset.empty())
    return SrcsetParsingResult{
        /*success=*/false,
        /*error_code=*/ValidationError::INVALID_ATTR_VALUE,
        /*srcset_images=*/candidates};
  // Must have at least one image candidate.
  return SrcsetParsingResult{/*success=*/!candidates.empty(),
                             /*error_code=*/ValidationError::INVALID_ATTR_VALUE,
                             /*srcset_images=*/candidates};
}
}  // namespace amp::validator::parse_srcset
