#ifndef HTMLPARSER__ERROR_H_
#define HTMLPARSER__ERROR_H_

#include <optional>
#include <string>

namespace htmlparser {

struct Error {
  int error_code = 0;
  std::string error_msg;
};

std::optional<Error> error(const std::string& error_msg);

}  // namespace htmlparser

#endif  // HTMLPARSER__ERROR_H_
