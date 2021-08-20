// Defines various logging macros. This is temporary and will be replaced by a
// stable logging library.

#ifndef HTMLPARSER__LOGGING_H_
#define HTMLPARSER__LOGGING_H_

#include <cstdlib>
#include <iostream>

#define CHECK(condition, message)                                        \
  do {                                                                   \
    if (!(condition)) {                                                  \
      std::cerr << "CHECK(`" #condition "`) failed in " << __FILE__      \
                << " line " << __LINE__ << ": " << message << std::endl; \
      abort();                                                           \
    }                                                                    \
  } while (false)

#endif  // HTMLPARSER__LOGGING_H_
