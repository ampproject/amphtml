goog.module('amp.validator');

const VALIDATOR_DEPRECATED =
    'The native JavaScript AMPHTML Validator (validator.js) has been turned ' +
    'down. If you are seeing this error, update your tooling to instead ' +
    'load the API compatible WebAssembly AMPHTML Validator ' +
    '(validator_wasm.js) instead.';

const errorCategoryCode = {
  UNKNOWN: 'UNKNOWN',
};

const htmlFormatCode = {
  UNKNOWN_CODE: 'UNKNOWN_CODE',
};

const validationErrorCode = {
  UNKNOWN_CODE: 'UNKNOWN_CODE',
};

const validationErrorSeverity = {
  ERROR: 'ERROR',
};

const validationError = {
  'severity': validationErrorSeverity,
  'code': validationErrorCode,
  'line': 1,
  'col': 0,
  'specUrl': '',
  'params': [],
  'category': null,
  'dataAmpReportTestValue': null,
};

const validationResultStatus = {
  FAIL: 'FAIL',
};

const validationResult = {
  'status': validationResultStatus,
  'errors': [validationError],
  'validatorRevision': -1,
  'specFileRevision': -1,
  'transformedVersion': 0,
  'typeIdentifier': [],
  'valueSetProvisions': [],
  'valueSetRequirements': [],
};

/**
 * DEPRECATED. This now always returns false.
 *
 * @param {!Object} error ignored.
 * @return {boolean}
 */
const isSeverityWarning = function(error) {
  console.log('ERROR: ' + VALIDATOR_DEPRECATED);
  return false;
};
exports.isSeverityWarning = isSeverityWarning;

/**
 * DEPRECATED. This now always returns an error message stating this is
 * deprecated and to use validator_wasm.js instead.
 *
 * @nocollapse
 * @param {string} inputDocContents ignored.
 * @param {string=} opt_htmlFormat the allowed format ignored.
 * @return {!Object} Validation Result (status and errors)
 */
const validateString = function(inputDocContents, opt_htmlFormat) {
  console.log('ERROR: ' + VALIDATOR_DEPRECATED);
  return validationResult;
};
exports.validateString = validateString;

/**
 * DEPRECATED. This now always returns an error message stating this is
 * deprecated and to use validator_wasm.js instead.
 *
 * @param {!Object} error ignored.
 * @return {string}
 */
const renderErrorMessage = function(error) {
  return VALIDATOR_DEPRECATED;
};
exports.renderErrorMessage = renderErrorMessage;

/**
 * DEPRECATED. This now always returns an error message stating this is
 * deprecated and to use validator_wasm.js instead.
 *
 * @param {!Object} validationResult ignored.
 * @param {string} filename to use in rendering error messages ignored.
 * @return {!Array<string>}
 */
const renderValidationResult = function(validationResult, filename) {
  return [VALIDATOR_DEPRECATED];
};
exports.renderValidationResult = renderValidationResult;

/**
 * DEPRECATED.
 *
 * @param {!Object} error ignored.
 * @return {!Object}
 */
const categorizeError = function(error) {
  console.log('ERROR: ' + VALIDATOR_DEPRECATED);
  return errorCategoryCode;
};
exports.categorizeError = categorizeError;

/**
 * DEPRECATED. This now doesn't do anything to the input.
 *
 * @param {!Object} result ignored.
 */
const annotateWithErrorCategories = function(result) {
  console.log('ERROR: ' + VALIDATOR_DEPRECATED);
};
exports.annotateWithErrorCategories = annotateWithErrorCategories;

// These are DEPRECATED. Please use validator_wasm.js instead.
goog.exportSymbol('amp.validator.ErrorCategory.Code', {
  errorCategoryCode,
});
goog.exportSymbol('amp.validator.HtmlFormat.Code', {
  htmlFormatCode,
});
goog.exportSymbol('amp.validator.validateString', validateString);
goog.exportSymbol('amp.validator.ValidationError', validationError);
goog.exportSymbol('amp.validator.ValidationError.Code', validationErrorCode);
goog.exportSymbol(
    'amp.validator.ValidationError.Severity', validationErrorSeverity);
goog.exportSymbol('amp.validator.ValidationResult', validationResult);
goog.exportSymbol(
    'amp.validator.ValidationResult.Status', validationResultStatus);
goog.exportSymbol('amp.validator.renderErrorMessage', renderErrorMessage);
goog.exportSymbol(
    'amp.validator.renderValidationResult', renderValidationResult);
goog.exportSymbol('amp.validator.categorizeError', categorizeError);
goog.exportSymbol(
    'amp.validator.annotateWithErrorCategories', annotateWithErrorCategories);
goog.exportSymbol('amp.validator.isSeverityWarning', isSeverityWarning);
