#include "cpp/htmlparser/error.h"

namespace htmlparser {

std::optional<Error> error(const std::string& error_msg) {
  Error err{0, error_msg};
  return err;
}

}  // namespace htmlparser
