#include <filesystem>
#include <fstream>
#include <string>

#include "google/protobuf/text_format.h"

#include "absl/strings/str_cat.h"
#include "defer.h"
#include "fileutil.h"
#include "logging.h"
#include "../../validator.pb.h"

using google::protobuf::TextFormat;

namespace fs = std::filesystem;

int main(int argc, char* argv[]) {
  fs::path text_proto_path = argv[1];
  fs::path output_file = argv[2];
  CHECKORDIE(fs::exists(text_proto_path),
             absl::StrCat(argv[1], " proto not found."));
  std::string text_proto = htmlparser::FileUtil::FileContents(argv[1]);
  CHECKORDIE(!text_proto.empty(), absl::StrCat(argv[1], " read failed."));
  amp::validator::ValidatorRules rules;
  TextFormat::ParseFromString(text_proto, &rules);
  std::ofstream ofs(argv[2], std::ofstream::out);
  htmlparser::defer(ofs.close());
  rules.SerializeToOstream(&ofs);
  return 0;
}
