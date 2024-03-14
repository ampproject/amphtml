#include "cpp/htmlparser/parser.h"

#include "fuzztest/fuzztest.h"

// Fuzz the parsing logic. Any non-crash is a success for the fuzzer.
void FuzzParser(std::string raw_html) {
  htmlparser::Parser parser(raw_html);
  parser.Parse();
}

FUZZ_TEST(CC_FUZZING, FuzzParser);
