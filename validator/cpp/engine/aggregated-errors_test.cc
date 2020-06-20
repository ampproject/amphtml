#include "aggregated-errors.h"

#include <map>

#include "file/base/helpers.h"
#include "file/base/options.h"
#include "quality/dni/validator/validator.h"
#include "validator_pb.h"
#include "gtest/gtest.h"
#include "absl/strings/str_cat.h"
#include "../../validator.proto.h"

namespace amp::validator {

namespace internal {
// Implementations in aggregated-errors.cc
const AggregatedErrorCodeMap& SingletonAggregatedErrorCodeMap();
}  // namespace internal

namespace {
// Returns a map from aggregated error code to error format for all aggregated
// errors.
std::map<AggregatedError::Code, std::string> AggregatedFormatByCode() {
  std::map<AggregatedError::Code, std::string> aggregated_format_by_code;
  for (const AggregatedErrorCodeFormat& format :
       internal::SingletonAggregatedErrorCodeMap()
           .aggregated_error_code_format())
    aggregated_format_by_code[format.code()] = format.format();
  return aggregated_format_by_code;
}

// Returns a map from validator error code to error format for all validator
// errors.
std::map<ValidationError::Code, std::string> ValidatorFormatByCode() {
  std::map<ValidationError::Code, std::string> validator_format_by_code;
  ValidatorRules rules;
  CHECK(rules.ParseFromArray(
      amp::validator::data::kValidatorProtoBytes,
      amp::validator::data::kValidatorProtoBytesSize));
  for (const ErrorFormat& error_format : rules.error_formats())
    validator_format_by_code[error_format.code()] = error_format.format();

  return validator_format_by_code;
}

// This method attempts to count the number of parameters in |format_string|,
// assuming that there are no gaps (ie: "%1 %3"). It doesn't account for
// escaping completely (ex: "%%3"), but is quick and dirty enough for a test.
int NumParameters(const std::string& format_string) {
  for (int ii = 1;; ++ii)
    if (format_string.find(absl::StrCat("%", ii)) == std::string::npos)
      return ii - 1;
}

TEST(AggregationRules, CorrectNumberOfParameters) {
  std::map<AggregatedError::Code, std::string> aggregated_format_by_code =
      AggregatedFormatByCode();
  std::map<ValidationError::Code, std::string> validator_format_by_code =
      ValidatorFormatByCode();

  for (const AggregationRule& rule :
       internal::SingletonAggregatedErrorCodeMap().aggregation_rule()) {
    if (!rule.has_aggregated_code()) {
      // If we aren't aggregating, we need not specify copy parameters.
      EXPECT_EQ(0, rule.copy_param_size());
      continue;
    }
    std::string validator_format =
        validator_format_by_code[rule.validator_code()];
    std::string aggregate_format =
        aggregated_format_by_code[rule.aggregated_code()];
    // Check that the number of params is in the aggregated format is what's
    // left over after dropping params from the validator format.
    EXPECT_EQ(NumParameters(aggregate_format), rule.copy_param_size())
        << rule.DebugString() << std::endl
        << aggregate_format << std::endl;
    EXPECT_GE(NumParameters(validator_format), rule.copy_param_size())
        << rule.DebugString() << std::endl
        << validator_format << std::endl;
  }
}

// Verifies that there is at least a zero-parameter rule for every validator
// error enum.
TEST(AggregationRules, EveryValidatorErrorIsMapped) {
  for (auto validator_pair : ValidatorFormatByCode()) {
    ValidationError::Code validator_code = validator_pair.first;
    bool has_matching_rule = false;
    for (const AggregationRule& rule :
         internal::SingletonAggregatedErrorCodeMap().aggregation_rule()) {
      if (rule.validator_code() == validator_code && rule.param_size() == 0) {
        has_matching_rule = true;
        break;
      }
    }
    EXPECT_TRUE(has_matching_rule) << validator_code;
  }
}

TEST(AggregationRules, CopiedParamsInOrder) {
  for (const AggregationRule& rule :
       internal::SingletonAggregatedErrorCodeMap().aggregation_rule()) {
    int last_copy_param = 0;
    for (int copy_param : rule.copy_param())
      CHECK_GT(copy_param, last_copy_param) << rule.DebugString();
  }
}

// "The tag 'font' is disallowed." doesn't aggregate.
TEST(AggregateError, DoesntAggregateFontTag) {
  ValidationError error;
  error.set_code(ValidationError::DISALLOWED_TAG);
  error.add_params("font");

  AggregatedError aggregated = AggregateError(error);
  EXPECT_EQ(AggregatedError::DO_NOT_AGGREGATE, aggregated.code());
}

// "The tag 'foo' is disallowed." aggregates to ANY_DISALLOWED_TAG.
TEST(AggregateError, AggregatesFooTag) {
  ValidationError error;
  error.set_code(ValidationError::DISALLOWED_TAG);
  error.add_params("foo");

  AggregatedError aggregated = AggregateError(error);
  EXPECT_EQ(AggregatedError::ANY_DISALLOWED_TAG, aggregated.code());
}

// "The tag 'foo' is disallowed." aggregates to a formatted string of
// "Disallowed tag present."
TEST(AggregateError, AggregatedFormatTest) {
  ValidationError error;
  error.set_code(ValidationError::DISALLOWED_TAG);
  error.add_params("foo");
  AggregatedError aggregated = AggregateError(error);
  EXPECT_NE(AggregatedError::UNKNOWN_CODE, aggregated.code());
  EXPECT_EQ("Disallowed tag present.", FormatAggregatedError(aggregated));
}

// A slightly more interesting case,
// "Invalid URL protocol '%3' for attribute '%1' in tag '%2'."
TEST(AggregateError, AggregatedProtocolCase) {
  ValidationError error;
  error.set_code(ValidationError::INVALID_URL_PROTOCOL);
  error.add_params("src");
  error.add_params("img");
  error.add_params("http:");

  AggregatedError aggregated = AggregateError(error);
  EXPECT_NE(AggregatedError::UNKNOWN_CODE, aggregated.code());
  // Note here, that the output format only has one variable and it's the
  // 3rd parameter from the original error.
  EXPECT_EQ("Invalid URL protocol in attribute 'src' of tag 'img'.",
            FormatAggregatedError(aggregated));
}

// This case demonstrates that we can make an error more descriptive even.
TEST(AggregateError, AggregatedCdataMissing) {
  ValidationError error;
  error.set_code(ValidationError::MANDATORY_CDATA_MISSING_OR_INCORRECT);
  error.add_params("head > style[amp-boilerplate]");

  AggregatedError aggregated = AggregateError(error);
  EXPECT_EQ(
      "The 'amp-boilerplate' tags on this page are malformed. "
      "(see https://www.ampproject.org/docs/fundamentals/spec/"
      "amp-boilerplate)",
      FormatAggregatedError(aggregated));
}

// This case demonstrates regex matching of the parameter value.
TEST(AggregateError, AggregateOnParameterRegex) {
  ValidationError error;
  error.set_code(ValidationError::WRONG_PARENT_TAG);
  error.add_params("amp-analytics extension .js script");
  error.add_params("body");
  error.add_params("head");

  AggregatedError aggregated = AggregateError(error);
  ASSERT_EQ(AggregatedError::SCRIPT_DISALLOWED_IN_BODY, aggregated.code());
  EXPECT_EQ("Custom JavaScript is not allowed.",
            FormatAggregatedError(aggregated));
}

// The next two test cases demonstrate the two mechanisms that can add
// documentation_url's to the AggregatedError.
TEST(AggregateError, AddsDocumentationUrl) {
  ValidationError error;
  error.set_code(ValidationError::WRONG_PARENT_TAG);
  error.add_params("style amp-custom");
  error.add_params("body");
  error.add_params("head");

  AggregatedError aggregated = AggregateError(error);
  ASSERT_EQ(AggregatedError::STYLE_DISALLOWED_IN_BODY, aggregated.code());
  EXPECT_EQ(
      "Only amp-boilerplate and amp-custom 'style' tags are allowed, "
      "and only in the document head. "
      "(see https://www.ampproject.org/docs/design/responsive/style_pages)",
      FormatAggregatedError(aggregated));
}
TEST(AggregateError, CopiesSpecUrlToDocumentationUrl) {
  ValidationError error;
  error.set_code(ValidationError::WRONG_PARENT_TAG);
  error.add_params("amp-sidebar");
  error.add_params("div");
  error.add_params("body");
  error.set_spec_url(
      "https://www.ampproject.org/docs/reference/components/amp-sidebar");

  AggregatedError aggregated = AggregateError(error);
  ASSERT_EQ(AggregatedError::WRONG_PARENT_TAG, aggregated.code());
  EXPECT_EQ(
      "The parent tag of tag 'amp-sidebar' must be 'body'. (see "
      "https://www.ampproject.org/docs/reference/components/amp-sidebar)",
      FormatAggregatedError(aggregated));
}

}  // namespace
}  // namespace amp::validator
