#include "cpp/engine/parse-layout-sizes.h"

#include "absl/strings/str_split.h"
#include "absl/strings/string_view.h"
#include "cpp/htmlparser/strings.h"
#include "re2/re2.h"  // NOLINT(build/deprecated)

using absl::string_view;
using absl::StrSplit;
using std::vector;

namespace amp::validator::parse_layout_sizes {
namespace {
// Given the index for where to divide between size source and maybe a media
// condition, update the given CssSize object with those values.
CssSize ExtractCssSizeFromCandidate(int32_t divider_index,
                                    const string_view candidate) {
  CssSize size;
  if (divider_index >= 0) {
    // Found size and media.
    size.size =
        candidate.substr(divider_index + 1, candidate.size() - divider_index);
    size.media = candidate.substr(0, divider_index);
  } else {
    // Found only size which is the default size.
    size.size = candidate;
    size.is_default = true;
  }
  htmlparser::Strings::Trim(&size.size);
  htmlparser::Strings::Trim(&size.media);
  return size;
}
// Given a candidate that is a function (e.g. calc(10vw + 10px)) find the
// opening param and return it's index within candidate.
int32_t GetIndexOfOpeningParamForFunction(const string_view candidate) {
  int32_t num_parens = 1;
  int32_t index = candidate.size() - 2;
  for (; index >= 0; index--) {
    const char32_t c = candidate[index];
    if (c == '(') {
      // Found an opening param.
      num_parens--;
    } else if (c == ')') {
      // // Found a closing param.
      num_parens++;
    }
    if (num_parens == 0) {
      // Break when these params are closed, now at beginning of the
      // function "math" but not the name of the function.
      break;
    }
  }
  return index;
}
// These are the allowed characters within the source size value (CssSize.size)
// when it is not a function.
bool IsAllowedCharacter(char32_t c) {
  return (c == '%' || c == '-' || c == '_' || (c >= 'a' && c <= 'z') ||
          (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9'));
}
}  // namespace

CssSizes::CssSizes(string_view input) : is_set(false), is_valid(false) {
  static const RE2* kValidSize =
      new RE2("^\\d+(\\.\\d+)?(px|em|rem|vh|vw|vmin|vmax|%)$");
  // If there isn't any data, exit.
  if (input.empty()) return;
  is_set = true;
  vector<string_view> candidates = StrSplit(input, ',');
  for (auto candidate : candidates) {
    htmlparser::Strings::Trim(&candidate);
    // Skip empty candidates
    if (candidate.empty()) continue;
    int32_t divider_index;
    bool is_size_a_function = false;
    // Process candidate from the end of string to the front.
    if (candidate.back() == ')') {
      is_size_a_function = true;
      divider_index = GetIndexOfOpeningParamForFunction(candidate);
      // Find the beginning of the function's name.
      const int32_t function_end_index = divider_index - 1;
      if (divider_index > 0) {
        divider_index--;
        for (; divider_index >= 0; divider_index--) {
          const char32_t c = candidate[divider_index];
          if (!IsAllowedCharacter(c)) break;
        }
      }
      // If there isn't a function name, exit.
      if (divider_index >= function_end_index) return;
    } else {
      divider_index = candidate.size() - 2;
      for (; divider_index >= 0; divider_index--) {
        const char32_t c = candidate[divider_index];
        if (!IsAllowedCharacter(c)) break;
      }
    }
    CssSize size = ExtractCssSizeFromCandidate(divider_index, candidate);
    // TODO: validate the media condition.
    // Verify size is valid if not a function.
    // TODO: validate the size when it is a function.
    if (!is_size_a_function && !RE2::PartialMatch(size.size, *kValidSize))
      return;
    sizes.push_back(size);
  }
  // If sizes are parsed and found, set as valid.
  if (!sizes.empty()) is_valid = true;
}

}  // namespace amp::validator::parse_layout_sizes
