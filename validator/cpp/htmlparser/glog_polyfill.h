#ifndef CPP_HTMLPARSER_GLOG_POLYFILL_H_
#define CPP_HTMLPARSER_GLOG_POLYFILL_H_

#include <cstdlib>

class Checker {
 public:
  Checker(bool condition) : condition_(condition) {}
  ~Checker() {
    if (!condition_) {
      abort();
    }
  }
  template <typename T>
  Checker& operator<<(T s) {
    return *this;
  }

 private:
  bool condition_;
};

// Using the same value as `absl::LogSeverity`
const int INFO = 0;
const int WARNING = 1;
const int ERROR = 2;
const int FATAL = 3;

#define CHECK(condition) Checker(condition)
#define CHECK_EQ(val1, val2) Checker((val1) == (val2))
#define CHECK_GE(val1, val2) Checker((val1) >= (val2))
#define CHECK_LT(val1, val2) Checker((val1) < (val2))
#define CHECK_NE(val1, val2) Checker((val1) != (val2))
#define LOG(level) Checker((level) < FATAL)

#define DCHECK(condition) Checker(true)
#define DCHECK_EQ(val1, val2) Checker(true)
#define DCHECK_GE(val1, val2) Checker(true)
#define DLOG(level) Checker(true)

#endif  // CPP_HTMLPARSER_GLOG_POLYFILL_H_
