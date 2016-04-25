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
        onFailure('HTTP ' + response.statusCode);
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
 * Maps from file extension to a mime-type.
 * @param {!string} extension
 * @returns {!string}
 */
function extToMime(extension) {
  if (extension === 'html') {
    return 'text/html';
  } else if (extension === 'js') {
    return 'text/javascript';
  } else if (extension === 'css') {
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
          const html = contents.replace(new RegExp(
              '\\$\\$VALIDATOR_SCRIPT\\$\\$', 'g'), validatorScript);
          response.end(html);
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
        // Handle '/cm/*', that is, CodeMirror (editor control).
        //
        if (request.url.startsWith('/cm/')) {
          const parsed = request.url.match(/\/cm\/([a-z0-9\/_-]*\.(js|css))$/);
          if (parsed === null) {
            response.writeHead(400, {'Content-Type': 'text/plain'});
            response.end('Bad request.');
            return;
          }
          const contents = fs.readFileSync(
              path.join(__dirname, 'node_modules/codemirror', parsed[1]),
              'utf-8');
          response.writeHead(200, {'Content-Type': extToMime(parsed[2])});
          response.end(contents);
          return;
        }
        //
        // Handle '/py/*', that is, Polymer (HTML Components library).
        //
        if (request.url.startsWith('/pm/')) {
          console.log('request.url = ' + request.url);
          const parsed = request.url.match(/\/pm\/([a-zA-Z0-9\/_-]*\.(html))$/);
          if (parsed === null) {
            response.writeHead(400, {'Content-Type': 'text/plain'});
            response.end('Bad request.');
            return;
          }
          const contents = fs.readFileSync(
              path.join(__dirname, 'node_modules/@polymer', parsed[1]),
              'utf-8');
          response.writeHead(200, {'Content-Type': extToMime(parsed[2])});
          response.end(contents);
          return;
        }
        //
        // Handle '/webcomponents-lite.js'
        //
        if (request.url == "/webcomponents-lite.js") {
          const contents = fs.readFileSync(
              path.join(__dirname, 'node_modules/webcomponents-lite/' +
                  'webcomponents-lite.js'), 'utf-8');
          response.writeHead(200, {'Content-Type': 'text/javascript'});
          response.end(contents);
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
          readFileOrDownload(
              urlToFetch,
              (contents) => {
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify({'contents': contents}));
              },
              (errorMessage) => {
                response.writeHead(502, {'Content-Type': 'text/plain'});
                response.end('Bad gateway (' + errorMessage + ').');
              });
          return;
        }
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Not found.');
      })
      .listen(port);
  console.log('Serving at http://127.0.0.1:' + port + '/');
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
      .action((validateOrUrlOrMinus) => {
        if (validateOrUrlOrMinus.length == 0) {
          program.outputHelp();
          process.exit(1);
        }
        readFileOrDownload(
            program.validator_js,
            (validatorScript) => {
              vm.runInThisContext(validatorScript);
              validateFiles(validateOrUrlOrMinus);
            },
            (errorMessage) => {
              console.error('Could not fetch validator.js: ' + errorMessage);
              process.exitCode = 1;
            });
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
