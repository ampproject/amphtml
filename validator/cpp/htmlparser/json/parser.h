#ifndef HTMLPARSER__JSON_PARSER_H_
#define HTMLPARSER__JSON_PARSER_H_

#include <string_view>
#include <optional>
#include <utility>

namespace htmlparser::json {

using LineCol = std::pair<int, int>;

class JSONParser {
 public:
  // Validates that a json string is valid json as per json syntax grammer.
  // If invalid, returns false along with line/col pair.
  static std::pair<bool, LineCol> Validate(std::string_view json);
};

}  // namespace htmlparser::json


#endif  // HTMLPARSER__JSON_PARSER_H_
