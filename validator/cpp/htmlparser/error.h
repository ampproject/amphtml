#ifndef CPP_HTMLPARSER_ERROR_H_
#define CPP_HTMLPARSER_ERROR_H_

#include <optional>
#include <string>

namespace htmlparser {

struct Error {
  int error_code = 0;
  std::string error_msg;
};

std::optional<Error> error(const std::string& error_msg);

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_ERROR_H_
