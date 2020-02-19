#include "url.h"

namespace htmlparser {

std::string_view URL::ProtocolStrict(std::string_view url) {
  for (int i = 0; i < url.size(); ++i) {
    char c = url[i];
    if (c == ':') {  // Protocol terminator.
      return url.substr(0, i);
    } else if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') ||
               (i > 0 && (('0' <= c && c <= '9') ||
                          c == '+' ||c == '-' || c == '.'))) {
      // Valid character, don't need to do anything.
    } else {
      return "";  // Invalid character for protocol, so give up.
    }
  }
  return "";  // No protocol found.
}

}  // namespace htmlparser
