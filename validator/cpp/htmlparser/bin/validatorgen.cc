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

#include <iostream>

#include "glog/logging.h"
#include "absl/flags/flag.h"
#include "absl/flags/parse.h"
#include "cpp/htmlparser/grammar/tablebuilder.h"

ABSL_FLAG(std::string, input_grammar, "", "Options: supported-media, json");

int main(int argc, char** argv) {
  absl::ParseCommandLine(argc, argv);
  std::string grammar = absl::GetFlag(FLAGS_input_grammar);

  std::string input_grammar;
  std::string cpp_namespace;
  std::string output_file;
  char termination_sentinel;
  std::string ifdef_guard;
  if (grammar == "json") {
    input_grammar = "cpp/htmlparser/data/jsongrammar.txt";
    cpp_namespace = "htmlparser::json";
    output_file = "cpp/htmlparser/validators/json.h";
    termination_sentinel = ' ';
    ifdef_guard = "CPP_HTMLPARSER_VALIDATORS_JSON_H_";
  } else if (grammar == "ipaddress") {
    input_grammar = "cpp/htmlparser/data/ipaddressgrammar.txt";
    cpp_namespace = "htmlparser::ipaddress";
    output_file = "cpp/htmlparser/validators/ipaddress.h";
    termination_sentinel = ' ';
    ifdef_guard = "CPP_HTMLPARSER_VALIDATORS_IPADDRESS_H_";
  } else if (grammar == "supported-media") {
    input_grammar = "cpp/htmlparser/data/supportedmediagrammar.txt";
    cpp_namespace = "htmlparser::css";
    output_file = "cpp/htmlparser/validators/supported_media_query.h";
    termination_sentinel = '\0';
    ifdef_guard = "CPP_HTMLPARSER_VALIDATORS_SUPPORTED_MEDIA_QUERY_H_";
  } else {
    std::cerr << "Invalid -input_grammar value: " << grammar;
    return -1;
  }

  htmlparser::grammar::TableBuilder builder(
      input_grammar,
      {.output_file_path = output_file,
       .ifdef_guard = ifdef_guard,
       .cpp_namespace = cpp_namespace,
       .termination_sentinel = termination_sentinel});

  if (!builder.ParseRulesAndGenerateTable()) {
    std::cerr << "Table generation failed.\n";
    return -1;
  }
}
