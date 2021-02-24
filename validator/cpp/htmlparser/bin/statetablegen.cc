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
//
// blaze clean
// bazel build htmlparser/bin:statetablegen
// bazel-bin/htmlparser/bin/statetablegen --input_grammar=url
//                            or
// bazel-bin/htmlparser/bin/statetablegen --input_grammar=json

#include <iostream>

#include "glog/logging.h"
#include "absl/flags/flag.h"
#include "absl/flags/parse.h"
#include "grammar/tablebuilder.h"

ABSL_FLAG(std::string, input_grammar, "", "Options: url, json");

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
  absl::ParseCommandLine(argc, argv);
  std::string grammar = absl::GetFlag(FLAGS_input_grammar);

  std::string input_grammar;
  std::string cpp_namespace;
  std::string ifdef_guard;
  std::string output_file;
  if (grammar == "json") {
    input_grammar = "data/jsongrammar.txt";
    cpp_namespace = "htmlparser::json";
    ifdef_guard = "HTMLPARSER__JSON_STATES_H_";
    output_file = "json/states.h";
  } else {
    std::cerr << "Invalid -input_grammar value: " << grammar;
    return -1;
  }

  htmlparser::grammar::TableBuilder builder(
      input_grammar,
      {.output_file_path = output_file,
       .license_header = kLicenseHeader.data(),
       .ifdef_guard = ifdef_guard,
       .cpp_namespace = cpp_namespace});

  if (!builder.ParseRulesAndGenerateTable()) {
    std::cerr << "Table generation failed.\n";
    return -1;
  }
}
