'use strict';

const amphtmlValidator = require('amphtml-validator');
const colors = require('kleur/colors');
const through = require('through2');

const PLUGIN_NAME = 'gulp-amphtml-validator';
const PluginError = require('plugin-error');

const STATUS_FAIL = 'FAIL';
const STATUS_PASS = 'PASS';
const STATUS_UNKNOWN = 'UNKNOWN';

/**
 * Validates AMP files and attaches the validation result to the file object.
 *
 * @param {?Object} validator - amphtml validator
 * @return {!stream} gulp file stream
 */
module.exports.validate = function(validator) {

  if (!validator) {
    validator = amphtmlValidator;
  }

  function runValidation(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME,
          'Streams not supported!'));
    }
    if (file.isBuffer()) {
      validator.getInstance()
          .then(function(validatorInstance) {
            const inputString = file.contents.toString();
            file.ampValidationResult =
                validatorInstance.validateString(inputString);
            return callback(null, file);
          })
          .catch(function(err) {
          // This happens if the validator download failed. We don't fail the
          // build, but map the exception to an validation error instead. This
          // makes it possible to configure via failAfterError whether this
          // should fail the build or not.
            console.log(colors.red(err.message));
            file.ampValidationResult = {
              status: STATUS_UNKNOWN,
            };
            return callback(null, file);
          });
    }
  }
  return through.obj(runValidation);
};

/**
 * Formats and prints the validation results to the console.
 *
 * @param {?Object} logger - logger used for printing the results (optional)
 * @return {!stream} gulp file stream
 */
module.exports.format = function(logger) {

  const results = [];
  if (!logger) {
    logger = console.log;
  }

  function collectResults(file, encoding, callback) {
    if (!file.isNull() && file.ampValidationResult) {
      results.push(file);
    }
    return callback(null, file);
  }

  function formatResults(callback) {
    logger.info('AMP Validation results:\n\n' +
        results.map(printResult).join('\n'));
    return callback();
  }

  function printResult(file) {
    const validationResult = file.ampValidationResult;
    let report = file.relative + ': ';
    if (validationResult.status === STATUS_PASS) {
      report += colors.green(validationResult.status);
      report += '\nReview our \'publishing checklist\' to ensure '
          + 'successful AMP document distribution. '
          + 'See https://go.amp.dev/publishing-checklist';
    } else if (validationResult.status === STATUS_UNKNOWN) {
      report += colors.red(validationResult.status);
    } else {
      report += colors.red(validationResult.status);
      for (let ii = 0; ii < validationResult.errors.length; ii++) {
        const error = validationResult.errors[ii];
        let msg = file.relative + ':' + error.line + ':' + error.col + ' ' +
          colors.red(error.message);
        if (error.specUrl) {
          msg += ' (see ' + error.specUrl + ')';
        }
        report += '\n' + msg;
      }
    }
    return report;
  }

  return through.obj(collectResults, formatResults);
};

/**
 * Fail when the stream ends if for any AMP validation results,
 * isFailure(ampValidationResult) returns true.
 *
 * @param {function(amphtmlValidator.ValidationResult): boolean} isFailure
 * @return {!stream} gulp file stream
 */
function failAfter(isFailure) {
  let failedFiles = 0;

  function collectFailedFiles(file, encoding, callback) {
    if (file.isNull() || !file.ampValidationResult) {
      return callback(null, file);
    }
    if (isFailure(file.ampValidationResult)) {
      failedFiles++;
    }
    return callback(null, file);
  }

  function failOnError(callback) {
    if (failedFiles > 0) {
      this.emit('error', new PluginError(PLUGIN_NAME,
          '\nAMPHTML Validation failed for ' + failedFiles + ' files.'));
    }
    callback();
  }

  return through.obj(collectFailedFiles, failOnError);
}

/**
 * Fail when the stream ends if any AMP validation error(s) occurred.
 *
 * @return {!stream} gulp file stream
 */
module.exports.failAfterError = function() {
  return failAfter(function(ampValidationResult) {
    return ampValidationResult.status === STATUS_FAIL ||
        ampValidationResult.status === STATUS_UNKNOWN;
  });
};

/**
 * Fail when the stream ends if any AMP validation warning(s) or
 * error(s) occurred.
 *
 * @return {!stream} gulp file stream
 */
module.exports.failAfterWarningOrError = function() {
  return failAfter(function(ampValidationResult) {
    return ampValidationResult.errors.length > 0 ||
        ampValidationResult.status === STATUS_FAIL ||
        ampValidationResult.status === STATUS_UNKNOWN;
  });
};
