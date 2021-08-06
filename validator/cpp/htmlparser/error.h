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
