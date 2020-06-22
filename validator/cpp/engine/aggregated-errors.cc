#include "aggregated-errors.h"

#include <string>

#include "base/logging.h"
#include "file/base/helpers.h"
#include "file/base/options.h"
#include "aggregated_errors_pb.h"
#include "absl/strings/substitute.h"
#include "util/regexp/re2/re2.h"
#include "util/utf8/public/unilib_utf8_utils.h"

using amp::validator::AggregatedError;
using amp::validator::ValidationError;

namespace amp::validator {

// Also referenced in aggregated-errors_test.cc
namespace internal {

const AggregatedErrorCodeMap& SingletonAggregatedErrorCodeMap() {
  static const AggregatedErrorCodeMap* formats = []() {
    auto* formats = new AggregatedErrorCodeMap;
    CHECK(formats->ParseFromArray(
        amp::validator::data::kAggregatedErrorsProtoBytes,
        amp::validator::data::kAggregatedErrorsProtoBytesSize))
        << "panic - could not load embedded error code formats";
    return formats;
  }();
  return *formats;
}

}  // namespace internal

namespace {

int CharLenAtIndex(const std::string& str, int pos) {
  return UniLib::OneCharLen(&str[pos]);
}

// Replaces any adjacent UTF-8 encoded characters within |in| that are
// whitespace with a single space (' ').
std::string CollapseWhitespace(const std::string& in) {
  static LazyRE2 match_whitespace_re = {"\\s+"};
  std::string out(in);
  RE2::GlobalReplace(&out, *match_whitespace_re, " ");
  return out;
}

// Returns true if |error| matches the given AggregationRule |rule|.
bool ErrorMatchesRule(const ValidationError& error,
                      const AggregationRule& rule) {
  CHECK(rule.has_validator_code()) << rule.DebugString();
  if (rule.validator_code() != error.code()) return false;

  // We must match all requirements. If there are no requirements, we fall
  // through and automatically match.
  for (const ParamMatchRule& param_rule : rule.param()) {
    CHECK_GE(error.params().size(), param_rule.param_index())
        << "Not enough parameters: " << rule.DebugString();
    // Param indexes are 1-based whereas the array is 0-based.
    const std::string& param = error.params(param_rule.param_index() - 1);
    if (param_rule.has_param_value()) {
      if (param != param_rule.param_value()) return false;
    } else if (param_rule.has_param_regex()) {
      // TODO(gregable): For performance, we should precompile these
      // regular expressions.
      if (!RE2::FullMatch(param, param_rule.param_regex())) return false;
    }
  }

  return true;
}

// Applies the aggregation |rule| to the given |error| by setting the
// aggregation error code and copying the correct subset of parameters.
// Does *not* validate that the rule matches the given ValidationError.
AggregatedError ApplyRule(const ValidationError& error,
                          const AggregationRule& rule) {
  AggregatedError aggregate_error;
  aggregate_error.set_code(rule.aggregated_code());
  // Don't copy any other fields for non-aggregated cases.
  if (aggregate_error.code() == AggregatedError::DO_NOT_AGGREGATE)
    return aggregate_error;

  // Copy parameters over, dropping some if necessary.
  for (int copy_param_idx : rule.copy_param()) {
    if (error.params_size() < copy_param_idx) {
      LOG_EVERY_N_SEC(ERROR, 300)
          << "Missing parameters" << rule.DebugString() << std::endl
          << error.DebugString();
      continue;
    }
    aggregate_error.add_params(error.params(copy_param_idx - 1));
  }

  if (rule.copy_spec_url() && error.has_spec_url())
    aggregate_error.set_documentation_url(error.spec_url());
  if (rule.has_documentation_url())
    aggregate_error.set_documentation_url(rule.documentation_url());

  return aggregate_error;
}

}  // namespace

AggregatedError AggregateError(const ValidationError& error) {
  // TODO(gregable): The rules should be preprocessed into a map from
  // validator code to related rules, rather than looping over the full list
  // on every pass.
  for (const AggregationRule& rule :
       internal::SingletonAggregatedErrorCodeMap().aggregation_rule()) {
    if (ErrorMatchesRule(error, rule)) return ApplyRule(error, rule);
  }

  DLOG(FATAL) << "No matching rule found for error. " << error.DebugString();

  // If we haven't found an aggregation for this error, return unknown. We
  // should always have one rule for each error, so this indicates an internal
  // error. It likely means that this binary is too old. There is a test that
  // catches this.
  return AggregatedError();
}

// TODO(gregable): Dedupe this code with the same in error-formatter.cc
std::string FormatAggregatedError(
    const amp::validator::AggregatedError& error) {
  for (const AggregatedErrorCodeFormat& format :
       internal::SingletonAggregatedErrorCodeMap()
           .aggregated_error_code_format()) {
    if (format.code() != error.code()) continue;
    std::string message;
    std::string error_format = format.format();
    for (int ii = 0, char_len = CharLenAtIndex(error_format, ii);
         ii < error_format.size(); ii += char_len) {
      if (char_len > 1) {  // multibyte can't be a parameter
        message.append(error_format, ii, char_len);
        continue;
      }
      if (error_format[ii] != '%') {  // not a parameter
        message += error_format[ii];
        continue;
      }
      ii += char_len;
      if (ii == error_format.size()) {
        message += '%';
        break;
      }
      char_len = CharLenAtIndex(error_format, ii);
      if (char_len > 1) {  // multibyte can't be a parameter
        message += '%';
        message.append(error_format, ii, char_len);
        continue;
      }
      if (error_format[ii] == '%') {  // poor man's escaping (%% -> %).
        message += '%';
        continue;
      }
      int param = error_format[ii] - '0';
      // While the specified param in the error_format string is 1-based,
      // the index into the params is 0-based.
      --param;
      if (param >= 0 && param < error.params_size()) {  // bounds check
        message.append(CollapseWhitespace(error.params(param)));
        continue;
      } else {
        // This should never happen in actual code. We put it here so we have
        // some way of noticing these issues in tests.
        message.append("(invalid param)");
      }
      message += '%';
      message += error_format[ii];
    }
    if (error.has_documentation_url())
      absl::SubstituteAndAppend(&message, " (see $0)",
                                error.documentation_url());
    return message;
  }

  LOG(FATAL) << "No format found for code: " << error.code();
}

}  // namespace amp::validator
