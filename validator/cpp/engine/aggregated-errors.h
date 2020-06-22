// This library is part of the AMP Validator, but kept in a separate
// C++ library since this code isn't executed in Goldmine/indexing and
// hence doesn't need to be part of the validator revisioning process.
// It is tested with validator_test.cc and update-tests.cc.
//
// This library provides a mapping from validator errors to "aggregated"
// validator errors, for use by Google Search Console.
//
// For a more detailed description, see:
// http://g3doc/third_party/ampvalidator/g3doc/aggregated-errors.md

#ifndef AMPVALIDATOR__AGGREGATED_ERRORS_H_
#define AMPVALIDATOR__AGGREGATED_ERRORS_H_

#include "aggregated-errors.proto.h"
#include "../../validator.proto.h"

namespace amp::validator {

// Computes the |aggregated_error| for this validation |error| or returns
// an empty error with code set to DO_NOT_AGGREGATE if this error should not be
// aggregated.
amp::validator::AggregatedError AggregateError(
    const amp::validator::ValidationError& error);

std::string FormatAggregatedError(const amp::validator::AggregatedError& error);

}  // namespace amp::validator

#endif  // AMPVALIDATOR__AGGREGATED_ERRORS_H_
