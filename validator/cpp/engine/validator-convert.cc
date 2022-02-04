#include <filesystem>
#include <fstream>
#include <string>

#include "google/protobuf/text_format.h"

#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/fileutil.h"
#include "cpp/htmlparser/logging.h"

#include "validator.pb.h"

using google::protobuf::TextFormat;

namespace fs = std::filesystem;

int main(int argc, char* argv[]) {
  fs::path text_proto_path = argv[1];
  fs::path output_file = argv[2];
  CHECK(fs::exists(text_proto_path)) << text_proto_path << " proto not found.";
  std::string text_proto = htmlparser::FileUtil::FileContents(argv[1]);
  CHECK(!text_proto.empty()) << text_proto_path << " read failed.";
  amp::validator::ValidatorRules rules;
  TextFormat::ParseFromString(text_proto, &rules);
  std::ofstream ofs(argv[2], std::ofstream::out);
  htmlparser::defer(ofs.close());
  rules.SerializeToOstream(&ofs);
  return 0;
}
