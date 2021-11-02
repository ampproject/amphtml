goog.module('amp.validator.validatorInBrowser');

const VALIDATOR_DEPRECATED =
    'ERROR: The native JavaScript AMPHTML Validator (validator.js) has been ' +
    'turned down. If you are seeing this error, update your tooling to ' +
    'instead load the API compatible WebAssembly AMPHTML Validator ' +
    '(validator_wasm.js) instead.';

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
 * Checks if the given URL is an AMP cache URL.
 * @param {string} url ignored.
 * @return {boolean}
 */
const isAmpCacheUrl = function(url) {
  return url.toLowerCase().indexOf('cdn.ampproject.org') !==
      -1;  // lgtm [js/incomplete-url-substring-sanitization]
};
exports.isAmpCacheUrl = isAmpCacheUrl;
goog.exportSymbol('amp.validator.isAmpCacheUrl', isAmpCacheUrl);

/**
 * DEPRECATED. This now always returns ValidationResult set to FAIL.
 *
 * @param {!Document=} opt_doc ignored.
 * @return {!Object}
 */
const validateInBrowser = function(opt_doc) {
  console.log(VALIDATOR_DEPRECATED);
  return validationResult;
};
exports.validateInBrowser = validateInBrowser;
goog.exportSymbol('amp.validator.validateInBrowser', validateInBrowser);

/**
 * DEPRECATED. This now always returns an error message stating this is
 * deprecated and to use validator_wasm.js instead.
 *
 * @param {string} url ignored.
 * @param {!Document=} opt_doc ignored.
 */
const validateUrlAndLog = function(url, opt_doc) {
  console.log(VALIDATOR_DEPRECATED);
};
exports.validateUrlAndLog = validateUrlAndLog;
goog.exportSymbol('amp.validator.validateUrlAndLog', validateUrlAndLog);
