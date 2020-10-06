//
// Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

// To regenerate states.h file, run:
// blaze clean (necessary to take into account txt file changes)
// bazel build htmlparser/bin:jsongrammargen
// bazel-bin/htmlparser/bin/jsongrammargen

#include <iostream>

#include "grammar/tablebuilder.h"

constexpr std::string_view kLicenseHeader = R"LICENSETXT(//
// Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
//)LICENSETXT";


int main(int argc, char** argv) {
  htmlparser::grammar::TableBuilder builder(
      "data/jsongrammar.txt",
      {.output_file_path = "json/states.h",
       .license_header = kLicenseHeader.data(),
       .ifdef_guard = "HTMLPARSER__JSON_STATES_H_",
       .cpp_namespace = "htmlparser::json"});

  if (!builder.ParseRulesAndGenerateTable()) {
    std::cerr << "Table generation failed.\n";
    return -1;
  }
}
