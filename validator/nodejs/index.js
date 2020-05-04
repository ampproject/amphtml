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

const colors = require('colors/safe');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const program = require('commander');
const Promise = require('promise');
const querystring = require('querystring');
const url = require('url');
const util = require('util');
const vm = require('vm');

const DEFAULT_USER_AGENT = 'amphtml-validator';

/**
 * Determines if str begins with prefix.
 * @param {string} str
 * @param {string} prefix
 * @return {boolean}
 */
function hasPrefix(str, prefix) {
  return str.indexOf(prefix) == 0;
}

/**
 * Convenience function to detect whether an argument is a URL. If not,
 * it may be a local file.
 * @param {string} url
 * @return {boolean}
 */
function isHttpOrHttpsUrl(url) {
  return hasPrefix(url, 'http://') || hasPrefix(url, 'https://');
}

/**
 * Creates a promise which reads from a file.
 * @param {string} name
 * @return {Promise<string>}
 */
function readFromFile(name) {
  return new Promise(function(resolve, reject) {
    fs.readFile(name, 'utf8', function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.trim());
      }
    });
  });
}

/**
 * Creates a promise which reads from a stream.
 * @param {string} name
 * @param {!stream.Readable} readable
 * @return {Promise<string>}
 */
function readFromReadable(name, readable) {
  return new Promise(function(resolve, reject) {
    const chunks = [];
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
 * @return {Promise<string>}
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
 * @param {string} url
 * @param {string} userAgent
 * @return {Promise<string>}
 */
function readFromUrl(url, userAgent) {
  return new Promise(function(resolve, reject) {
    const clientModule = hasPrefix(url, 'http://') ? http : https;
    const req = clientModule.request(url, function(response) {
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
    req.on('error', function(error) { // E.g., DNS resolution errors.
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
   * @type {string}
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
   * @type {string}
   */
  this.message = '';
  /**
   * The spec URL is often added by the validator to provide additional
   * context for the error. In a user interface this would be shown
   * as a "Learn more" link.
   * @type {string}
   */
  this.specUrl = null;
  /**
   * This field is only useful when scripting against the validator,
   * it should not be displayed in a user interface as it adds nothing
   * for humans to read over the message field (see above).
   * Possible values are the codes listed in ValidationError.Code - see
   * validator.proto. Examples: 'UNKNOWN_CODE', 'MANDATORY_TAG_MISSING',
   * 'TAG_REQUIRED_BY_MISSING'. For each of these codes there is a
   * format string in validator-main.protoascii (look for error_formats),
   * which is used to assemble the message from the strings in params.
   * @type {string}
   */
  this.code = 'UNKNOWN_CODE';
  /**
   * This field is only useful when scripting against the validator,
   * it should not be displayed in a user interface as it adds nothing
   * for humans to read over the message field (see above).
   * @type {!Array<string>}
   */
  this.params = [];
}

/**
 * The validator instance is a proxy object to a precompiled
 * validator.js script - in practice the script was either downloaded
 * from 'https://cdn.ampproject.org/v0/validator.js' or read from a
 * local file.
 * @param {string} scriptContents
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
 * @param {string} inputString
 * @param {string=} htmlFormat
 * @return {!ValidationResult}
 * @export
 */
Validator.prototype.validateString = function(inputString, htmlFormat) {
  const internalResult =
      this.sandbox.amp.validator.validateString(inputString, htmlFormat);
  const result = new ValidationResult();
  result.status = internalResult.status;
  for (let ii = 0; ii < internalResult.errors.length; ii++) {
    const internalError = internalResult.errors[ii];
    const error = new ValidationError();
    error.severity = internalError.severity;
    error.line = internalError.line;
    error.col = internalError.col;
    error.message =
        this.sandbox.amp.validator.renderErrorMessage(internalError);
    error.specUrl = internalError.specUrl;
    error.code = internalError.code;
    error.params = internalError.params;
    result.errors.push(error);
  }
  return result;
};

/**
 * A global static map used by the getInstance function to avoid loading
 * AMP Validators more than once.
 * @type {!Object<string, Validator>}
 */
const instanceByValidatorJs = {};

/**
 * Provided a URL or a filename from which to fetch the validator.js
 * file, fetches, instantiates, and caches the validator instance
 * asynchronously.  If you prefer to implement your own fetching /
 * caching logic, you may want to consider newInstance() instead,
 * which is synchronous and much simpler.
 *
 * @param {string=} opt_validatorJs
 * @param {string=} opt_userAgent
 * @return {!Promise<Validator>}
 * @export
 */
function getInstance(opt_validatorJs, opt_userAgent) {
  const validatorJs =
      opt_validatorJs || 'https://cdn.ampproject.org/v0/validator.js';
  const userAgent = opt_userAgent || DEFAULT_USER_AGENT;
  if (instanceByValidatorJs.hasOwnProperty(validatorJs)) {
    return Promise.resolve(instanceByValidatorJs[validatorJs]);
  }
  const validatorJsPromise = isHttpOrHttpsUrl(validatorJs) ?
    readFromUrl(validatorJs, userAgent) :
    readFromFile(validatorJs);
  return validatorJsPromise.then(function(scriptContents) {
    let instance;
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
 * Provided the contents of the validator.js file, e.g. as downloaded from
 * 'https://cdn.ampproject.org/v0/validator.js', returns a new validator
 * instance. The tradeoff between this function and getInstance() is that this
 * function is synchronous but requires the contents of the validator.js
 * file as a parameter, while getInstance is asynchronous, fetches files
 * from disk or the web, and caches them.
 *
 * @param {string} validatorJsContents
 * @return {!Validator}
 * @export
 */
function newInstance(validatorJsContents) {
  return new Validator(validatorJsContents);
}
exports.newInstance = newInstance;

// A note on emitting output to the console and process exit status:
// Node.js prior to 0.11.8 did not support process.exitCode
// (https://nodejs.org/api/process.html#process_process_exitcode), which
// makes it difficult to emit output and errors from multiple callbacks
// and set the appropriate exit code. We use the following workaround:
// process.<<stream>>(<<some output>>, function() { process.exit(<<code>>); });
// This will flush the appropriate stream (stdout or stderr) and then
// exit with the provided code. For now, this makes the CLI work with
// Node.js versions as old as v0.10.25.

/**
 * Logs a validation result to the console using process.stdout and
 * process.stderr as is appropriate.
 * @param {string} filename
 * @param {!ValidationResult} validationResult
 * @param {boolean} color
 */
function logValidationResult(filename, validationResult, color) {
  if (validationResult.status === 'PASS') {
    process.stdout.write(
        filename + ': ' + (color ? colors.green('PASS') : 'PASS') + '\n');
  }
  for (let ii = 0; ii < validationResult.errors.length; ii++) {
    const error = validationResult.errors[ii];
    let msg = filename + ':' + error.line + ':' + error.col + ' ';
    if (color) {
      msg += (error.severity === 'ERROR' ? colors.red : colors.magenta)(
          error.message);
    } else {
      msg += error.message;
    }
    if (error.specUrl) {
      msg += ' (see ' + error.specUrl + ')';
    }
    // TODO(powdercloud): Should we distinguish error.severity === 'WARNING' ?
    process.stderr.write(msg + '\n');
  }
}

/**
 * Main entry point into the command line tool.
 */
function main() {
  program
      .usage(
          '[options] <fileOrUrlOrMinus...>\n\n' +
          '  Validates the files or urls provided as arguments. If "-" is\n' +
          '  specified, reads from stdin instead.')
      .option(
          '--validator_js <fileOrUrl>',
          'The Validator Javascript.\n' +
              '  Latest published version by default, or\n' +
              '  dist/validator_minified.js (built with build.py)\n' +
              '  for development.',
          'https://cdn.ampproject.org/v0/validator.js')
      .option(
          '--user-agent <userAgent>', 'User agent string to use in requests.',
          DEFAULT_USER_AGENT)
      .option(
          '--html_format <AMP|AMP4ADS|AMP4EMAIL|ACTIONS>',
          'The input format to be validated.\n' +
              '  AMP by default.',
          'AMP')
      .option(
          '--format <color|text|json>',
          'How to format the output.\n' +
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
  if (program.html_format !== 'AMP' && program.html_format !== 'AMP4ADS' &&
      program.html_format !== 'AMP4EMAIL' &&
      program.html_format !== 'ACTIONS') {
    process.stderr.write(
        '--html_format must be set to "AMP", "AMP4ADS", "AMP4EMAIL", or ' +
            '"ACTIONS.\n',
        function() {
          process.exit(1);
        });
  }
  if (program.format !== 'color' && program.format !== 'text' &&
      program.format !== 'json') {
    process.stderr.write(
        '--format must be set to "color", "text", or "json".\n', function() {
          process.exit(1);
        });
  }
  const inputs = [];
  for (let ii = 0; ii < program.args.length; ii++) {
    const item = program.args[ii];
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
              const jsonOut = {};
              let hasError = false;
              for (let ii = 0; ii < resolvedInputs.length; ii++) {
                const validationResult = validator.validateString(
                    resolvedInputs[ii], program.html_format);
                if (program.format === 'json') {
                  jsonOut[program.args[ii]] = validationResult;
                } else {
                  logValidationResult(
                      program.args[ii], validationResult,
                      program.format === 'color' ? true : false);
                }
                if (validationResult.status !== 'PASS') {
                  hasError = true;
                }
              }
              if (program.format === 'json') {
                process.stdout.write(
                    JSON.stringify(jsonOut) + '\n', function() {
                      process.exit(hasError ? 1 : 0);
                    });
              } else if (hasError) {
                process.stderr.write('', function() {
                  process.exit(1);
                });
              } else {
                process.stdout.write('', function() {
                  process.exit(0);
                });
              }
            })
            .catch(function(error) {
              process.stderr.write(
                  (program.format == 'color' ? colors.red(error.message) :
                    error.message) +
                      '\n',
                  function() {
                    process.exit(1);
                  });
            });
      })
      .catch(function(error) {
        process.stderr.write(
            (program.format == 'color' ? colors.red(error.message) :
              error.message) +
                '\n',
            function() {
              process.exit(1);
            });
      });
}

if (require.main === module) {
  main();
}
