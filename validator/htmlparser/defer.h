//
// Copyright 2019 The AMP HTML Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the license.
//

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

#ifndef HTMLPARSER__DEFER_H_
#define HTMLPARSER__DEFER_H_

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

#endif  // HTMLPARSER__DEFER_H_
