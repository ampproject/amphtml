/**
 * @license
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the license.
 */

'use strict';

const amphtmlValidator = require('amphtml-validator');
const colors = require('ansi-colors');
const log = require('fancy-log');
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
            log(colors.red(err.message));
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
    logger = log;
  }

  function collectResults(file, encoding, callback) {
    if (!file.isNull() && file.ampValidationResult) {
      results.push(file);
    }
    return callback(null, file);
  }

  function formatResults(callback) {
    logger.log('AMP Validation results:\n\n' +
        results.map(printResult).join('\n'));
    return callback();
  }

  function printResult(file) {
    const validationResult = file.ampValidationResult;
    let report = file.relative + ': ';
    if (validationResult.status === STATUS_PASS) {
      report += colors.green(validationResult.status);
      report += '\n Important: Valid AMP pages should also be tested for '
          + 'proper CORS handling when served from an AMP cache. For details '
          + 'please see '
          + 'https://www.ampproject.org/docs/fundamentals/amp-cors-requests';
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
