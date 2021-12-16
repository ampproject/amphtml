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

#define CHECK(condition) Checker(condition)
#define CHECK_GE(val1, val2) Checker(val1 >= val2)
#define CHECK_LT(val1, val2) Checker(val1 < val2)

#define DCHECK(condition) Checker(true)
#define DCHECK_EQ(val1, val2) Checker(true)
#define DCHECK_GE(val1, val2) Checker(true)
#define DLOG(level) Checker(true)

#endif  // CPP_HTMLPARSER_GLOG_POLYFILL_H_
