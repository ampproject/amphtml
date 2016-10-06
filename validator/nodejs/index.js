#!/usr/bin/env node
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

var Promise = require('promise');
var colors = require('colors');
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var program = require('commander');
var querystring = require('querystring');
var url = require('url');
var util = require('util');
var vm = require('vm');

var VERSION = '0.1.0';
var DEFAULT_USER_AGENT = 'amphtml-validator';

/**
 * Determines if str begins with prefix.
 * @param {!string} str
 * @param {!string} prefix
 * @returns {!boolean}
 */
function hasPrefix(str, prefix) {
  return str.indexOf(prefix) == 0;
}

/**
 * Convenience function to detect whether an argument is a URL. If not,
 * it may be a local file.
 * @param {!string} url
 * @returns {!boolean}
 */
function isHttpOrHttpsUrl(url) {
  return hasPrefix(url, 'http://') || hasPrefix(url, 'https://');
}

/**
 * Creates a promise which reads from a file.
 * @param {!string} name
 * @returns {!Promise<!string>}
 */
function readFromFile(name) {
  return new Promise(function(resolve, reject) {
    fs.readFile(name, 'utf8', function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Creates a promise which reads from a stream.
 * @param {!string} name
 * @param {!stream.Readable} readable
 * @returns {!Promise<!string>}
 */
function readFromReadable(name, readable) {
  return new Promise(function(resolve, reject) {
    var chunks = [];
    readable.setEncoding('utf8');
    readable.on('data', function(chunk) {
      chunks.push(chunk);
    });
    readable.on('end', function() {
      resolve(chunks.join(''));
    });
    readable.on('error', function(error) {
      reject(new Error('Could not read from ' + name + ' - ' + error.message));
    });
  });
}

/**
 * Creates a promise which reads from standard input. Even though it would
 * be easy to make a function that just returns the data, we return a promise
 * for consistency with readFromUrl and readFromFile.
 * @returns {!Promise<!string>}
 */
function readFromStdin() {
  return readFromReadable('stdin', process.stdin).then(function(data) {
    process.stdin.resume();
    return data;
  });
}

/**
 * Creates a promise which reads from a URL or more precisely, fetches
 * the contents located at the URL by using the 'http' or 'https' module.
 * Any HTTP status other than 200 is interpreted as an error.
 * @param {!string} url
 * @param {!string} userAgent
 * @returns {!Promise<!string>}
 */
function readFromUrl(url, userAgent) {
  return new Promise(function(resolve, reject) {
           var clientModule = hasPrefix(url, 'http://') ? http : https;
           var req = clientModule.request(url, function(response) {
             if (response.statusCode !== 200) {
               // https://nodejs.org/api/http.html says: "[...] However, if
               // you add a 'response' event handler, then you must consume
               // the data from the response object, either by calling
               // response.read() whenever there is a 'readable' event, or by
               // adding a 'data' handler, or by calling the .resume()
               // method."
               response.resume();
               reject(new Error(
                   'Unable to fetch ' + url + ' - HTTP Status ' +
                   response.statusCode));
             } else {
               resolve(response);
             }
           });
           req.setHeader('User-Agent', userAgent);
           req.on('error', function(error) {  // E.g., DNS resolution errors.
             reject(
                 new Error('Unable to fetch ' + url + ' - ' + error.message));
           });
           req.end();
         })
      .then(readFromReadable.bind(null, url));
}

/**
 * ValidationResult is the record computed by the validator for each
 * document. It contains an overall status (PASS/FAIL) and the list of
 * errors, if any. This class corresponds to the ValidationResult
 * message in validator.proto in this directory.
 * @export
 * @constructor
 */
function ValidationResult() {
  /**
   * Possible values are 'UNKNOWN', 'PASS', and 'FAIL'.
   * @type {!string}
   */
  this.status = 'UNKNOWN';
  /** @type {!Array<!ValidationError>} */
  this.errors = [];
}

/**
 * Each validation error describes a specific problem in a validated
 * document. This class corresponds to the ValidationError message in
 * validator.proto in this directory.
 * @export
 * @constructor
 */
function ValidationError() {
  /**
   * The severity of the error - possible values are 'UNKNOWN_SEVERITY',
   * 'ERROR', and 'WARNING'.
   */
  this.severity = 'UNKNOWN_SEVERITY';
  /**
   * The line number at which the error was seen (1 is the first line).
   */
  this.line = 1;
  /**
   * The column number at which the error was seen (0 is the first column).
   */
  this.col = 0;
  /**
   * A human-readable error message for the validation error.
   * If you find yourself trying to write a parser against this string
   * to scrape out some detail, consider looking at the code and params
   * fields below.
   * @type {!string}
   */
  this.message = '';
  /**
   * The spec URL is often added by the validator to provide additional
   * context for the error. In a user interface this would be shown
   * as a "Learn more" link.
   * @type {!string}
   */
  this.specUrl = null;
  /**
   * Categorizes error messages into higher-level groups. This makes it
   * easier to create error statistics across a site and give advice based
   * on the most common problems for a set of pages.
   * See the ErrorCategory.Code enum in validator.proto for possible values.
   * @type {!string}
   */
  this.category = 'UNKNOWN';
  /**
   * This field is only useful when scripting against the validator,
   * it should not be displayed in a user interface as it adds nothing
   * for humans to read over the message field (see above).
   * Possible values are the codes listed in ValidationError.Code - see
   * validator.proto. Examples: 'UNKNOWN_CODE', 'MANDATORY_TAG_MISSING',
   * 'TAG_REQUIRED_BY_MISSING'. For each of these codes there is a
   * format string in validator-main.protoascii (look for error_formats),
   * which is used to assemble the message from the strings in params.
   * @type {!string}
   */
  this.code = 'UNKNOWN_CODE';
  /**
   * This field is only useful when scripting against the validator,
   * it should not be displayed in a user interface as it adds nothing
   * for humans to read over the message field (see above).
   * @type {!Array<!string>}
   */
  this.params = [];
}

/**
 * The validator instance is a proxy object to a precompiled
 * validator.js script - in practice the script was either downloaded
 * from 'https://cdn.ampproject.org/v0/validator.js' or read from a
 * local file.
 * @param {!string} scriptContents
 * @throws {!Error}
 * @constructor
 */
function Validator(scriptContents) {
  // The 'sandbox' is a Javascript object (dictionary) which holds
  // the results of evaluating the validatorJs / scriptContents, so
  // basically, it holds functions, prototypes, etc. As a
  // side-effect of evaluating, the VM will compile this code and
  // it's worth holding onto it. Hence, this validate function is
  // reached via 2 codepaths - either the sandbox came from the
  // cache, precompiledByValidatorJs - or we just varructed it
  // after downloading and evaluating the script. The API is fancier
  // here, vm.Script / vm.createContext / vm.runInContext and all
  // that, but it's quite similar to a Javascript eval.
  this.sandbox = vm.createContext();
  try {
    new vm.Script(scriptContents).runInContext(this.sandbox);
  } catch (error) {
    throw new Error('Could not instantiate validator.js - ' + error.message);
  }
}

/**
 * Validates the provided inputString; the htmlFormat can be 'AMP' or
 * 'AMP4ADS'; it defaults to 'AMP' if not specified.
 * @param {!string} inputString
 * @param {string=} htmlFormat
 * @returns {!ValidationResult}
 * @export
 */
Validator.prototype.validateString = function(inputString, htmlFormat) {
  var internalResult =
      this.sandbox.amp.validator.validateString(inputString, htmlFormat);
  var result = new ValidationResult();
  result.status = internalResult.status;
  for (var ii = 0; ii < internalResult.errors.length; ii++) {
    var internalError = internalResult.errors[ii];
    var error = new ValidationError();
    error.severity = internalError.severity;
    error.line = internalError.line;
    error.col = internalError.col;
    error.message =
        this.sandbox.amp.validator.renderErrorMessage(internalError);
    error.specUrl = internalError.specUrl;
    error.code = internalError.code;
    error.params = internalError.params;
    error.category = this.sandbox.amp.validator.categorizeError(internalError);
    result.errors.push(error);
  }
  return result;
};

/**
 * A global static map used by the getInstance function to avoid loading
 * AMP Validators more than once.
 * @type {!Object<string, Validator>}
 */
var instanceByValidatorJs = {};

/**
 * @param {string=} opt_validatorJs
 * @param {string=} opt_userAgent
 * @returns {!Promise<Validator>}
 * @export
 */
function getInstance(opt_validatorJs, opt_userAgent) {
  var validatorJs =
      opt_validatorJs || 'https://cdn.ampproject.org/v0/validator.js';
  var userAgent =
      opt_userAgent || DEFAULT_USER_AGENT;
  if (instanceByValidatorJs.hasOwnProperty(validatorJs)) {
    return Promise.resolve(instanceByValidatorJs[validatorJs]);
  }
  var validatorJsPromise = isHttpOrHttpsUrl(validatorJs) ?
      readFromUrl(validatorJs, userAgent) :
      readFromFile(validatorJs);
  return validatorJsPromise.then(function(scriptContents) {
    var instance;
    try {
      instance = new Validator(scriptContents);
    } catch (error) {
      // It may be useful to cache errors and exceptions encountered
      // here, but for now we don't do this for e.g. http errors when
      // fetching the validator, so we shouldn't do it for syntax
      // errors etc. either (which lead to the varructor throwing an error).
      throw error;
    }
    instanceByValidatorJs[validatorJs] = instance;
    return instance;
  });
}
exports.getInstance = getInstance;

/**
 * Logs a validation result to the console using console.log, console.warn,
 * and console.error as is appropriate.
 * @param {!string} filename
 * @param {!ValidationResult} validationResult
 * @param {boolean} color
 */
function logValidationResult(filename, validationResult, color) {
  if (validationResult.status === 'PASS') {
    console.log(filename + ': ' + (color ? colors.green('PASS') : 'PASS'));
  }
  for (var ii = 0; ii < validationResult.errors.length; ii++) {
    var error = validationResult.errors[ii];
    var msg = filename + ':' + error.line + ':' + error.col + ' ';
    if (color) {
      msg += (error.severity === 'ERROR' ? colors.red : colors.magenta)(
          error.message);
    } else {
      msg += error.message;
    }
    if (error.specUrl) {
      msg += ' (see ' + error.specUrl + ')';
    }
    if (error.severity === 'ERROR') {
      console.error(msg);
    } else {
      console.warn(msg);
    }
  }
}

/**
 * Main entry point into the command line tool.
 */
function main() {
  program.version(VERSION)
      .usage(
          '[options] <fileOrUrlOrMinus...>\n\n' +
          '  Validates the files or urls provided as arguments. If "-" is ' +
          '  specified, reads from stdin instead.')
      .option(
          '--validator_js <fileOrUrl>', 'The Validator Javascript.\n' +
              '  Latest published version by default, or\n' +
              '  dist/validator_minified.js (built with build.py)\n' +
              '  for development.',
          'https://cdn.ampproject.org/v0/validator.js')
      .option(
          '--user-agent <userAgent>', 'User agent string to use in requests.',
          DEFAULT_USER_AGENT)
      .option(
          '--html_format <AMP|AMP4ADS>', 'The input format to be validated.\n' +
              '  AMP by default. AMP4ADS is a format for ads creatives that is\n' +
              '  still in draft; this requires specifying \n' +
              '  https://cdn.ampproject.org/v0/validator-canary.js as validator.js.',
          'AMP')
      .option(
          '--format <color|text|json>', 'How to format the output.\n' +
              '  "color" displays errors/warnings/success in\n' +
              '          red/orange/green.\n' +
              '  "text"  avoids color (e.g., useful in terminals not\n' +
              '          supporting color).\n' +
              '  "json"  emits json corresponding to the ValidationResult\n' +
              '          message in validator.proto.',
          'color')
      .parse(process.argv);
  if (program.args.length === 0) {
    program.outputHelp();
    process.exit(1);
  }
  if (program.html_format !== 'AMP' && program.html_format !== 'AMP4ADS') {
    console.error('--html_format must be set to "AMP" or "AMP4ADS".');
    process.exit(1);
  }
  if (program.format !== 'color' && program.format !== 'text' &&
      program.format !== 'json') {
    console.error('--format must be set to "color", "text", or "json".');
    process.exit(1);
  }
  var inputs = [];
  for (var ii = 0; ii < program.args.length; ii++) {
    var item = program.args[ii];
    if (item === '-') {
      inputs.push(readFromStdin());
    } else if (isHttpOrHttpsUrl(item)) {
      inputs.push(readFromUrl(item, program.userAgent));
    } else {
      inputs.push(readFromFile(item));
    }
  }
  getInstance(program.validator_js, program.userAgent)
      .then(function(validator) {
        Promise.all(inputs)
            .then(function(resolvedInputs) {
              var jsonOut = {};
              for (var ii = 0; ii < resolvedInputs.length; ii++) {
                var validationResult = validator.validateString(
                    resolvedInputs[ii], program.html_format);
                if (program.format === 'json') {
                  jsonOut[program.args[ii]] = validationResult;
                } else {
                  logValidationResult(
                      program.args[ii], validationResult,
                      program.format === 'color' ? true : false);
                }
                if (validationResult.status !== 'PASS') {
                  process.exitCode = 1;
                }
              }
              if (program.format === 'json') {
                console.log(JSON.stringify(jsonOut));
              }
            })
            .catch(function(error) {
              console.error(
                  program.format == 'color' ? colors.red(error.message) :
                                              error.message);
              process.exitCode = 1;
            });
      })
      .catch(function(error) {
        console.error(
            program.format == 'color' ? colors.red(error.message) :
                                        error.message);
        process.exitCode = 1;
      });
}

if (require.main === module) {
  main();
}
