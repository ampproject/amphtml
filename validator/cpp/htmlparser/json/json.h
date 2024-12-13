#ifndef CPP_HTMLPARSER_JSON_JSON_H_
#define CPP_HTMLPARSER_JSON_JSON_H_

#include <memory>
#include <string_view>

#include "cpp/htmlparser/json/types.h"

namespace htmlparser::json {

struct ParseOptions {
  // If true, parses the string values as references to the input json string in
  // the form of string_view, i.e. no new memory is allocated for the string.
  // Use this option only if the following conditions are true:
  // A) The original json string outlives the parsed JsonObject.
  // B) The JsonObject is quickly disposed off by converting it to other format,
  //    thereby copying the fields.
  bool use_string_references = false;
};

std::unique_ptr<JsonObject> Parse(std::string_view json_str,
                                  ParseOptions options = {
                                      .use_string_references = false});

}  // namespace htmlparser::json

#endif  // CPP_HTMLPARSER_JSON_JSON_H_
