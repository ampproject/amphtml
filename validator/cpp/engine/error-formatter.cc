// AMP Validator client library to validate if given html is a valid AMP
// document.
//
#include "cpp/engine/error-formatter.h"

#include "cpp/engine/validator_pb.h"
#include "cpp/htmlparser/logging.h"
#include "cpp/htmlparser/strings.h"
#include "validator.pb.h"
#include "re2/re2.h"  // NOLINT(build/deprecated)

namespace amp::validator {
namespace {
int CharLenAtIndex(const std::string& str, int pos) {
  return htmlparser::Strings::CodePointByteSequenceCount(str.at(pos));
}

// Replaces any adjacent UTF-8 encoded characters within |in| that are
// whitespace with a single space (' ').
std::string CollapseWhitespace(const std::string& in) {
  static LazyRE2 match_whitespace_re = {"\\s+"};
  std::string out(in);
  RE2::GlobalReplace(&out, *match_whitespace_re, " ");
  return out;
}
}  // namespace

std::string ErrorFormatter::ApplyFormat(const std::string& format,
                                        const ValidationError& error) {
  std::string message;
  int max_param_id = -1;
  for (int ii = 0, char_len = CharLenAtIndex(format, ii); ii < format.size();
       ii += char_len) {
    if (char_len > 1) {  // multibyte can't be a parameter
      message.append(format, ii, char_len);
      continue;
    }
    if (format[ii] != '%') {  // not a parameter
      message += format[ii];
      continue;
    }
    ii += char_len;
    if (ii == format.size()) {
      message += '%';
      break;
    }
    char_len = CharLenAtIndex(format, ii);
    if (char_len > 1) {  // multibyte can't be a parameter
      message += '%';
      message.append(format, ii, char_len);
      continue;
    }
    if (format[ii] == '%') {  // poor man's escaping (%% -> %).
      message += '%';
      continue;
    }
    int param = format[ii] - '0';
    // While the specified param in the format string is 1-based, the index
    // into the params is 0-based.
    --param;
    if (param >= 0 && param < error.params_size()) {  // bounds check
      message.append(CollapseWhitespace(error.params(param)));
      max_param_id = std::max(max_param_id, param);
      continue;
    } else {
      // This should never happen in actual code. We put it here so we have
      // some way of noticing these issues in tests.
      message.append("(invalid param)");
    }
    message += '%';
    message += format[ii];
  }
  if (max_param_id != error.params_size() - 1)
    // This should never happen in actual code. We put it here so we have
    // some way of noticing these issues in tests.
    message.append("(unused param)");

  return message;
}

std::string ErrorFormatter::FormattedMessageFor(const ValidationError& error) {
  static const std::vector<std::string>* format_by_code = []() {
    ValidatorRules rules;
    CHECK(rules.ParseFromArray(
        amp::validator::data::kValidatorProtoBytes,
        amp::validator::data::kValidatorProtoBytesSize));
    std::vector<std::string> format_by_code(ValidationError::Code_MAX + 1);
    for (const ErrorFormat& error_format : rules.error_formats())
      format_by_code[error_format.code()] = error_format.format();
    return new const std::vector<std::string>(std::move(format_by_code));
  }();
  if (error.code() < 0 || error.code() >= format_by_code->size()) {
    return "";
  }
  return ErrorFormatter::ApplyFormat((*format_by_code)[error.code()], error);
}
}  // namespace amp::validator
