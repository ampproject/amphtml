#ifndef CPP_ENGINE_PARSE_VIEWPORT_H_
#define CPP_ENGINE_PARSE_VIEWPORT_H_

#include <map>
#include <string>

namespace amp::validator::parse_viewport {
// Parses |content| using the algorithm described at
// https://drafts.csswg.org/css-device-adapt/#parsing-algorithm.
// This algorithm was originally written down to parse the content
// of a viewport meta tag, like
// <meta name='viewport' content='a=b,c=d'>
// but can be useful for parsing other lists of key/value pairs as well.
//
// The keys returned by this function are lower-cased,
// to make it easy to implement case-insensitive lookup.
// The values returned by this function remain as is.
std::map<std::string, std::string> ParseContent(const std::string& content);
}  // namespace amp::validator::parse_viewport

#endif  // CPP_ENGINE_PARSE_VIEWPORT_H_
