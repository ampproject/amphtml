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

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const program = require('commander');
const vm = require('vm');
const url = require('url');
const util = require('util');

/**
 * Convenience function to detect whether an argument is a URL. If not,
 * it may be a local file.
 * @param {!string} url
 * @returns {!boolean}
 */
function isHttpOrHttpsUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Creates a promise which reads from a file.
 * @param {!string} name
 * @returns {!Promise<!string>}
 */
function readFromFile(name) {
  return new Promise(function(resolve, reject) {
    fs.readFile(name, 'utf8', (err, data) => {
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
    const chunks = [];
    readable.setEncoding('utf8');
    readable.on('data', (chunk) => { chunks.push(chunk); });
    readable.on('end', () => { resolve(chunks.join('')); });
    readable.on('error', (error) => {
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
  return readFromReadable('stdin', process.stdin).then((data) => {
    process.stdin.resume();
    return data;
  });
}

/**
 * Creates a promise which reads from a URL or more precisely, fetches
 * the contents located at the URL by using the 'http' or 'https' module.
 * Any HTTP status other than 200 is interpreted as an error.
 * @param {!string} url
 * @returns {!Promise<!string>}
 */
function readFromUrl(url) {
  return new Promise(function(resolve, reject) {
           const clientModule = url.startsWith('http://') ? http : https;
           const req = clientModule.request(url, (response) => {
             if (response.statusCode != 200) {
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
           req.on('error', (error) => {  // E.g., DNS resolution errors.
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
 */
class ValidationResult {
  constructor() {
    /**
     * Possible values are 'UNKNOWN', 'PASS', and 'FAIL'.
     * @type {!string}
     */
    this.status = 'UNKNOWN';
    /** @type {!Array<!ValidationError>} */
    this.errors = [];
  }
}

/**
 * Each validation error describes a specific problem in a validated
 * document. This class corresponds to the ValidationError message in
 * validator.proto in this directory.
 * @export
 */
class ValidationError {
  constructor() {
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
}

/**
 * The validator instance is a proxy object to a precompiled
 * validator.js script - in practice the script was either downloaded
 * from 'https://cdn.ampproject.org/v0/validator.js' or read from a
 * local file.
 */
class Validator {
  /**
   * @param {!string} scriptContents
   * @throws {!Error}
   */
  constructor(scriptContents) {
    // The 'sandbox' is a Javascript object (dictionary) which holds
    // the results of evaluating the validatorJs / scriptContents, so
    // basically, it holds functions, prototypes, etc. As a
    // side-effect of evaluating, the VM will compile this code and
    // it's worth holding onto it. Hence, this validate function is
    // reached via 2 codepaths - either the sandbox came from the
    // cache, precompiledByValidatorJs - or we just constructed it
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
   * @param {!string} inputString
   * @returns {!ValidationResult}
   * @export
   */
  validateString(inputString) {
    const internalResult =
        this.sandbox.amp.validator.validateString(inputString);
    const result = new ValidationResult();
    result.status = internalResult.status;
    for (const internalError of internalResult.errors) {
      const error = new ValidationError();
      error.severity = internalError.severity;
      error.line = internalError.line;
      error.col = internalError.col;
      error.message =
          this.sandbox.amp.validator.renderErrorMessage(internalError);
      error.specUrl = internalError.specUrl;
      error.code = internalError.code;
      error.params = internalError.params;
      error.category =
          this.sandbox.amp.validator.categorizeError(internalError);
      result.errors.push(error);
    }
    return result;
  }
}

/**
 * A global static map used by the getInstance function to avoid loading
 * AMP Validators more than once.
 * @type {!Object<string, Validator>}
 */
const instanceByValidatorJs = {};

/**
 * @param {string=} opt_validatorJs
 * @returns {!Promise<Validator>}
 * @export
 */
function getInstance(opt_validatorJs) {
  const validatorJs =
      opt_validatorJs || 'https://cdn.ampproject.org/v0/validator.js';
  if (instanceByValidatorJs.hasOwnProperty(validatorJs)) {
    return Promise.resolve(instanceByValidatorJs[validatorJs]);
  }
  const validatorJsPromise =
      (isHttpOrHttpsUrl(validatorJs) ? readFromUrl : readFromFile)(validatorJs);
  return validatorJsPromise.then((scriptContents) => {
    let instance;
    try {
      instance = new Validator(scriptContents);
    } catch (error) {
      // It may be useful to cache errors and exceptions encountered
      // here, but for now we don't do this for e.g. http errors when
      // fetching the validator, so we shouldn't do it for syntax
      // errors etc. either (which lead to the constructor throwing an error).
      throw error;
    }
    instanceByValidatorJs[validatorJs] = instance;
    return instance;
  });
}
exports.getInstance = getInstance;

/**
 * Maps from file extension to a mime-type.
 * @param {!string} extension
 * @returns {!string}
 */
function extToMime(extension) {
  if (extension === '.html') {
    return 'text/html';
  } else if (extension === '.js') {
    return 'text/javascript';
  } else if (extension === '.css') {
    return 'text/css';
  }
  return 'text/plain';
}

/**
 * Serves a web UI for validation.
 * @param {!number} port
 * @param {!string} validatorScript
 */
function serve(port, validatorScript) {
  // By default, validatorScript will point at the latest published validator,
  // a https:// URL. So in that case, we'll just use it. But if it's a file,
  // then we need to also serve the file. So, we load it into RAM and make it
  // available as /validator.js.
  let validatorScriptContents = '';
  if (!validatorScript.startsWith('http://') &&
      !validatorScript.startsWith('https://')) {
    validatorScriptContents = fs.readFileSync(validatorScript, 'utf-8');
    validatorScript = '/validator.js';
  }
  http.createServer((request, response) => {
        if (request.method !== 'GET') {
          return;
        }
        //
        // Handle '/'.
        //
        if (request.url === '/') {
          response.writeHead(200, {'Content-Type': 'text/html'});
          const contents = fs.readFileSync(
              path.join(__dirname, 'webui/index.html'), 'utf-8');
          if ('https://cdn.ampproject.org/v0/validator.js' == validatorScript) {
            response.end(contents);
            return;
          }
          response.end(contents.replace(
              new RegExp(
                  'https://cdn\\.ampproject\\.org/v0/validator\\.js', 'g'),
              validatorScript));
          return;
        }
        //
        // Handle '/validator.js'.
        //
        if (request.url === '/validator.js') {
          response.writeHead(200, {'Content-Type': 'text/javascript'});
          response.end(validatorScriptContents);
          return;
        }
        //
        // Handle '/amp_favicon.png'
        //
        if (request.url == '/amp_favicon.png') {
          const contents = fs.readFileSync(
              path.join(__dirname, 'webui/amp_favicon.png'), 'binary');
          response.writeHead(200, {'Content-Type': 'image/png'});
          response.end(contents, 'binary');
          return;
        }
        //
        // Handle fetch?, a request to fetch an arbitrary doc from the
        // internet. It presents the results as JSON.
        //
        if (request.url.startsWith('/fetch?')) {
          const parsedUrl = url.parse(request.url, true);
          const urlToFetch = parsedUrl['query']['url'];
          if (!urlToFetch.startsWith('https://') &&
              !urlToFetch.startsWith('http://')) {
            response.writeHead(400, {'Content-Type': 'text/plain'});
            response.end('Bad request.');
            return;
          }
          readFromUrl(urlToFetch)
              .then((contents) => {
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify({'Contents': contents}));
              })
              .catch((error) => {
                response.writeHead(502, {'Content-Type': 'text/plain'});
                response.end('Bad gateway (' + error.message + ').');
              });
          return;
        }
        // Look up any other resources relative to node_modules.
        const relative_path = request.url.substr(1);  // Strip leading '/'.
        const node_modules_path =
            path.join(__dirname, 'node_modules', relative_path);

        // Only serve .js .html .css below node_modules.
        if (path.resolve(node_modules_path)
                .startsWith(path.resolve(__dirname)) &&
            ['.js', '.html', '.css'].indexOf(path.extname(node_modules_path)) !=
                -1) {
          try {
            const contents = fs.readFileSync(node_modules_path, 'utf-8');
            response.writeHead(
                200,
                {'Content-Type': extToMime(path.extname(node_modules_path))});
            response.end(contents);
          } catch (error) {
            // Fall through for 404 below.
          }
        }
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Not found.');
      })
      .listen(port);
  console.log('Serving at http://127.0.0.1:' + port + '/');
}

/**
 * Logs a validation result to the console using console.log, console.warn,
 * and console.error as is appropriate.
 * @param {!string} filename
 * @param {!ValidationResult} validationResult
 */
function logValidationResult(filename, validationResult) {
  if (validationResult.status === 'PASS') {
    console.log(filename + ': PASS');
  }
  for (const error of validationResult.errors) {
    let msg =
        filename + ':' + error.line + ':' + error.col + ' ' + error.message;
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
  program.version('0.1.0')
      .usage(
          '<fileOrUrlOrMinus...>\n\n' +
          '  By default, validates the files or urls provided as arguments.\n' +
          '  If "-" is specified, reads from stdin instead.\n' +
          '  Note the --validator_js option for selecting the Validator to\n' +
          '  run.')
      .option(
          '--validator_js <fileOrUrl>', 'The Validator Javascript. \n' +
              '  Latest published version by default, or \n' +
              '  dist/validator_minified.js (built with build.py) \n' +
              '  for development.',
          'https://cdn.ampproject.org/v0/validator.js');

  program.command('* <fileOrUrlOrMinus...>')
      .description('Validates list of files or urls (default).')
      .action((fileOrUrlOrMinus) => {
        if (fileOrUrlOrMinus.length == 0) {
          program.outputHelp();
          process.exit(1);
        }
        for (const item of fileOrUrlOrMinus) {
          let input;
          if (item === '-') {
            input = readFromStdin();
          } else if (isHttpOrHttpsUrl(item)) {
            input = readFromUrl(item);
          } else {
            input = readFromFile(item);
          }
          input
              .then((data) => {
                getInstance(program.validator_js)
                    .then((validator) => {
                      const validationResult = validator.validateString(data);
                      logValidationResult(item, validationResult);
                      if (validationResult.status !== 'PASS') {
                        process.exitCode = 1;
                      }
                    })
                    .catch((error) => {
                      console.error(error.message);
                      process.exitCode = 1;
                    });

              })
              .catch((error) => {
                console.error(error.message);
                process.exitCode = 1;
              });
        }
      });

  program.command('webui')
      .description('Serves a web UI for validation.')
      .option(
          '--port <number>', 'Port number',
          (arg) => {
            const n = parseInt(arg);
            return isNaN(n) ? null : n;
          },
          8765)
      .action((options) => { serve(options.port, program.validator_js); });

  program.parse(process.argv);
  if (program.args == 0) {
    program.outputHelp();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
