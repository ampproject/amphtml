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

const through = require('through2');
const gutil = require('gulp-util');
const amphtmlValidator = require('amphtml-validator');

const PLUGIN_NAME = 'gulp-amphtml-validator';
const PluginError = gutil.PluginError;

/**
 * Validates AMP files and attaches the validation result to the file object.
 *
 * @param {Object} validator - amphtml validator
 * @returns {stream} gulp file stream
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
      const context = this;
      validator.getInstance()
        .then(function(validatorInstance) {
          const inputString = file.contents.toString();
          file.ampValidationResult = validatorInstance.validateString(inputString);
          return callback(null, file);
        })
        .done(function(result) {
          if (result instanceof Error) {
            context.emit('error', new PluginError(PLUGIN_NAME,
              '\nAMPHTML Validator failed with exception: ' + e));
          }
        });
    }
  }
  return through.obj(runValidation);
};

/**
 * Formats and prints the validation results to the console.
 *
 * @param {Object} logger - logger used for printing the results (optional)
 * @returns {stream} gulp file stream
 */
module.exports.format = function(logger) {

  const results = [];
  if (!logger) {
    logger = gutil;
  }

  function collectResults(file, encoding, callback) {
    if (!file.isNull() && file.ampValidationResult) {
      results.push(file);
    }
    return callback(null, file);
  }

  function formatResults(callback) {
    results.forEach(printResult);
    return callback();
  }

  function printResult(file) {
    const validationResult = file.ampValidationResult;
    let report = '';
    if (validationResult.status === 'PASS') {
      report += gutil.colors.green(validationResult.status);
    } else {
      report += gutil.colors.red(validationResult.status);
    }
    report += ' ' + file.relative;
    for (let ii = 0; ii < validationResult.errors.length; ii++) {
      const error = validationResult.errors[ii];
      let msg = 'line ' + error.line + ', col ' + error.col + ': ' +
        error.message;
      if (error.specUrl !== null) {
        msg += ' (see ' + error.specUrl + ')';
      }
      report += '\n' + msg;
    }
    logger.log(report);
  }

  return through.obj(collectResults, formatResults);
};

/**
 * Fail when the stream ends if any AMP validation error(s) occurred.
 *
 * @returns {stream} gulp file stream
 */
module.exports.failAfterError = function() {

  const failedFiles = [];

  function collectFailedFiles(file, encoding, callback) {
    if (file.isNull() || !file.ampValidationResult) {
      return callback(null, file);
    }
    if (file.ampValidationResult.status === 'FAIL') {
      failedFiles.push(file.relative);
    }
    return callback(null, file);
  }

  function failOnError(callback) {
    if (failedFiles.length > 0) {
      this.emit('error', new PluginError(PLUGIN_NAME,
        '\nAMPHTML Validation failed for: \n\n' + failedFiles.join('\n')));
    }
    callback();
  }

  return through.obj(collectFailedFiles, failOnError);
};
