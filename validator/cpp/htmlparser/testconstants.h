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

#ifndef HTMLPARSER__TESTCONSTANTS_H_
#define HTMLPARSER__TESTCONSTANTS_H_

#include <array>
#include <string_view>

namespace htmlparser {

namespace testing {

inline constexpr std::array<std::string_view, 2> kTestDataDirs{
    "testdata/tree-construction/*.dat",
    "testdata/go/*.dat",
};

}  // namespace testing
}  // namespace htmlparser

#endif  // HTMLPARSER__TESTCONSTANTS_H_
