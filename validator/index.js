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
const https = require('https');
const http = require('http');
const program = require('commander');
const vm = require('vm');

/**
 * If the provided fileOrUrl start with 'http://' or 'https://', downloads
 * with the http or https module, otherwise reads the file with the file module.
 * Or, if the provided fileOrUrl is '-', reads from stdin.
 * Then, calls onSuccess with the data, or onFailure with the error message.
 * This method will check the HTTP status code as well and generate
 * brief error messages if it's not 200.
 * @param {!string} fileOrUrl
 * @param {!function(string)} onSuccess
 * @param {!function(string)} onFailure
 */
function readFileOrDownload(fileOrUrl, onSuccess, onFailure) {
  const digestChunksFrom = function(response) {
    const chunks = [];
    response.setEncoding('utf8');
    response.on('data', function(chunk) { chunks.push(chunk); });
    response.on('end', function() { onSuccess(chunks.join('')); });
  };
  if (fileOrUrl === '-') {
    digestChunksFrom(process.stdin);
    process.stdin.resume();
    return;
  }
  if (fileOrUrl.startsWith('http://') || fileOrUrl.startsWith('https://')) {
    const clientModule = fileOrUrl.startsWith('http://') ? http : https;
    const req = clientModule.get(fileOrUrl, (response) => {
      if (response.statusCode !== 200) {
        onFailure('HTTP ' + res.statusCode);
        return;
      }
      digestChunksFrom(response);
    });
    req.on('error', (e) => { onFailure(e.message); });
    return;
  }
  fs.readFile(fileOrUrl, 'utf8', (err, data) => {
    if (err) {
      onFailure(err.message);
    } else {
      onSuccess(data);
    }
  });
}

/**
 * Retrieves the provided files and validates them, emitting PASS or
 * error messages. If any of the files generates an error, the exit
 * code of the program is set to 1.
 * @param {!Array<string>} filesToProcess
 */
function validateFiles(filesToProcess) {
  for (const fileName of filesToProcess) {
    readFileOrDownload(
        fileName,
        (contents) => {
          const validationResult = amp.validator.validateString(contents);
          // TODO(powdercloud): compare with
          // amp.validator.ValidationResult.Status.PASS instead once exported.
          if (validationResult.status === 'PASS') {
            console.log(fileName + ': PASS');
          } else {
            for (const error of validationResult.errors) {
              let msg = fileName + ':' + error.line + ':' + error.col;
              msg += ' ' + amp.validator.renderErrorMessage(error);
              if (error.specUrl) {
                msg += ' (see ' + error.specUrl + ')';
              }
              // TODO(powdercloud): compare with
              // amp.validator.ValidationError.Severity.ERROR instead once
              // exported.
              if (error.severity === 'ERROR') {
                console.error(msg);
                process.exitCode = 1;
              } else {
                console.warn(msg);
              }
            }
          }
        },
        (errorMessage) => {
          console.error(fileName + ': Unable to fetch - ' + errorMessage);
          process.exitCode = 1;
        });
  }
}

/**
 * Main entry point into the command line tool. This is called from index.js.
 */
function main() {
  program.version('0.1.0')
      .usage('[options] <fileOrUrlOrMinus ...>')
      .option(
          '--validator_js <fileOrUrl>',
          'The Validator Javascript. Latest published version by ' +
              'default, or dist/validator_minified.js (built with ' +
              'build.py) for development.',
          'https://cdn.ampproject.org/v0/validator.js')
      .parse(process.argv);
  if (program.args.length == 0) {
    program.outputHelp();
    process.exit(1);
  }
  readFileOrDownload(
      program.validator_js,
      (validatorScript) => {
        vm.runInThisContext(validatorScript);
        validateFiles(program.args);
      },
      (errorMessage) => {
        console.error('Could not fetch validator.js: ' + errorMessage);
        process.exitCode = 1;
      });
}

if (require.main === module) {
  main();
}
