/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * limitations under the License.
 */

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const colors = require('ansi-colors');
const config = require('../../config');
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const mocha = require('gulp-mocha');
const sleep = require('sleep-promise');
const tryConnect = require('try-net-connect');
const {execScriptAsync} = require('../../exec');

const HOST = 'localhost';
const PORT = 8000;
const WEBSERVER_TIMEOUT_RETRIES = 10;

let webServerProcess_;
/**
 * Launches a background AMP webserver for unminified js using gulp.
 *
 * Waits until the server is up and reachable, and ties its lifecycle to this
 * process's lifecycle.
 *
 * @return {!Promise} a Promise that resolves when the web server is launched
 *     and reachable.
 */
async function launchWebServer() {
  webServerProcess_ = execScriptAsync(
      `gulp serve --host ${HOST} --port ${PORT}
      ${argv.quiet ? '--quiet' : ''}`);

  webServerProcess_.on('close', code => {
    code = code || 0;
    if (code != 0) {
      log('fatal', colors.cyan("'serve'"),
          `errored with code ${code}. Cannot continue with e2e tests`);
    }
  });

  let resolver, rejecter;
  const deferred = new Promise((resolverIn, rejecterIn) => {
    resolver = resolverIn;
    rejecter = rejecterIn;
  });
  tryConnect({
    host: HOST,
    port: PORT,
    retries: WEBSERVER_TIMEOUT_RETRIES, // retry timeout defaults to 1 sec
  }).on('connected', () => {
    return resolver(webServerProcess_);
  }).on('timeout', rejecter);
  return deferred;
}

async function cleanUp_() {
  if (webServerProcess_ && !webServerProcess_.killed) {
    // Explicitly exit the webserver.
    webServerProcess_.kill('SIGKILL');
    // The child node process has an asynchronous stdout. See #10409.
    await sleep(100);
  }
}

async function e2e() {
  try {
    await launchWebServer();
  } catch (reason) {
    log('fatal', `Failed to start a web server: ${reason}`);
  }

  return gulp.src(config.e2eTestPaths, {read: false})
      .pipe(mocha({
        require: [
          '@babel/register',
          '../../../build-system/tasks/e2e/helper',
        ],
      })
          // stop serving on localhost:8000
          .once('end', () => {
            console.log('end event was hit');
            cleanUp_();
          })
      );
}

gulp.task('e2e', 'Runs e2e tests', ['serve'], e2e, {
  options: {
    'quiet': '  Do not log HTTP requests (default: false)',
  },
});
