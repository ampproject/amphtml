// Converts between different representations of the validator rules.
//
// Example usage:
//
// Generating Javascript for Closure compiler:
// bazel-bin/cpp/engine/validator-convert \
//     --textproto_in.file=third_party/javascript/amp_validator/validator-main.protoascii \
//     --json_out.file=rules.js
//
// Generating just JSON:
// bazel-bin/cpp/engine/validator-convert \
//     --textproto_in.file=third_party/javascript/amp_validator/validator-main.protoascii \
//     --json_out.file=rules.js --json_out.mode=JSON_ONLY
//
// Generating binary proto for MPM:
// bazel-bin/cpp/engine/validator-convert \
//     --textproto_in.file=third_party/javascript/amp_validator/validator-main.protoascii \
//     --pb_out.file=rules.pb

#include <string>

#include "base/logging.h"
#include "file/base/helpers.h"
#include "file/base/options.h"
#include "net/proto2/contrib/protoflags/protoflags.h"
#include "net/proto2/util/public/json_format.h"
#include "validator-convert.proto.h"
#include "absl/strings/str_cat.h"
#include "../../validator.proto.h"

using amp::validator::ValidatorRules;
using proto2::contrib::protoflags::InitGoogleAndParse;

namespace amp::validator {
void WriteJsonOut(const ValidatorRules& rules, const JsonOutConfig& config) {
  std::string out;
  if (config.mode() == JsonOutConfig::WITH_CLOSURE)
    absl::StrAppend(&out,
                    "goog.provide('amp.validator.rules');\n"
                    "amp.validator.rules = ");
  proto2::util::JsonFormat formatter(
      proto2::util::JsonFormat::ADD_WHITESPACE |
      proto2::util::JsonFormat::DONT_QUOTE_FIELD_NAMES |
      proto2::util::JsonFormat::SYMBOLIC_ENUMS |
      proto2::util::JsonFormat::USE_JSON_OPT_PARAMETERS |
      proto2::util::JsonFormat::LOWER_CAMELCASE_FIELD_NAMES);
  formatter.PrintToString(rules, &out);
  if (config.mode() == JsonOutConfig::WITH_CLOSURE)
    absl::StrAppend(&out, ";\n");
  CHECK_OK(file::SetContents(config.file(), out, file::Defaults()));
}

void WritePbOut(const ValidatorRules& rules, const PbOutConfig& config) {
  CHECK_OK(file::SetBinaryProto(config.file(), rules, file::Defaults()));
}

void Convert(const ValidatorConvertConfig& config) {
  ValidatorRules rules;
  CHECK(config.has_textproto_in()) << "must set in";
  CHECK_OK(file::GetTextProto(config.textproto_in().file(), &rules,
                              file::Defaults()));
  switch (config.out_case()) {
    case ValidatorConvertConfig::kJsonOut:
      WriteJsonOut(rules, config.json_out());
      break;
    case ValidatorConvertConfig::kPbOut:
      WritePbOut(rules, config.pb_out());
      break;
    case ValidatorConvertConfig::OUT_NOT_SET:
      LOG(FATAL) << "must set out";
  }
}
}  // namespace amp::validator

int main(int argc, char* argv[]) {
  auto config = InitGoogleAndParse<amp::validator::ValidatorConvertConfig>(
      argv[0], &argc, &argv, true);
  Convert(config);
  return 0;
}
