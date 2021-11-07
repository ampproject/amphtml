// To regenerate states.h file, run:
//
// blaze clean
// bazel build htmlparser/bin:statetablegen
// bazel-bin/htmlparser/bin/statetablegen --input_grammar=url
//                            or
// bazel-bin/htmlparser/bin/statetablegen --input_grammar=json

#include <iostream>

#include "absl/flags/flag.h"
#include "absl/flags/parse.h"
#include "grammar/tablebuilder.h"

ABSL_FLAG(std::string, input_grammar, "", "Options: url, json");


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

  htmlparser::grammar::TableBuilder builder(input_grammar,
                                            {.output_file_path = output_file,
                                             .ifdef_guard = ifdef_guard,
                                             .cpp_namespace = cpp_namespace});

  if (!builder.ParseRulesAndGenerateTable()) {
    std::cerr << "Table generation failed.\n";
    return -1;
  }
}
