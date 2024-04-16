// Executes a block of code (lambda) after the function returns, or a block
// ends.
// Useful for multiple (and nested) returns inside a function.
//
// Usage:
// In the following example fd file descriptor is closed after MyFunction
// returns from any location.
//
// void MyObject::MyFunction() {
//   fd = open(...);
//   other_fd = open(...);
//   stream = open(...);
//   counter = 0;
//
//   defer(fd.close());
//   // Can include multiple statements.
//   defer({
//     other_fd.close();
//     stream.close();
//     counter++;
//   });
//
//   // do something with above descriptor.
// . if (condition) {
//     return;
// . } else {
// .   for (..) {
//         if (other_condition) return;
// .   }
// .   return;
// }
//
// defer() converts the block into lambda and captures all the variables in
// current block by reference. So instead of writing the following:
// defer([&]() {
//   delete mylocal_fd;
//   fd_counter++;
// });
//
// one can write:
// defer({
//   delete mylocal_fd;
//   fd_counter++;
// });

#ifndef CPP_HTMLPARSER_DEFER_H_
#define CPP_HTMLPARSER_DEFER_H_

#include <functional>

namespace htmlparser {

#define DEFER_CONCAT_(a, b) a ## b
#define DEFER_CONCAT(a, b) DEFER_CONCAT_(a, b)

class Defer {
 public:
  template<typename Callable>
  Defer(Callable&& defer_call) : defer_call_(std::forward<Callable>(
      defer_call)) {}

  Defer(Defer&& other) : defer_call_(std::move(other.defer_call_)) {
    other.defer_call_ = nullptr;
  }

  ~Defer() {
    if (defer_call_) defer_call_();
  }

 private:
  Defer(const Defer&) = delete;
  void operator=(const Defer&) = delete;

  std::function<void(void)> defer_call_;
};

// Define a defer() keyword, whose behavior is similar to golang.
#define defer(fn) Defer DEFER_CONCAT(__defer__, __LINE__) = [&] ( ) { fn ; }

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_DEFER_H_
