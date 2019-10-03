/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
const connect = require('gulp-connect');
const deglob = require('globs-to-files');
const header = require('connect-header');
const log = require('fancy-log');
const morgan = require('morgan');
const watch = require('gulp-watch');
const {
  lazyBuildExtensions,
  lazyBuildJs,
  preBuildCoreRuntime,
  preBuildSomeExtensions,
} = require('../server/lazy-build');
const {createCtrlcHandler} = require('../common/ctrlcHandler');
const {cyan, green} = require('ansi-colors');
const {getServeMode} = require('../server/app-utils');

// Used for logging during server start / stop.
let url = '';

const serverFiles = deglob.sync(['build-system/server/**']);

/**
 * Logs the server's mode (based on command line arguments).
 */
function logServeMode() {
  switch (getServeMode()) {
    case 'compiled':
      log(green('Serving'), cyan('minified'), green('JS'));
      break;
    case 'cdn':
      log(green('Serving'), cyan('current prod'), green('JS'));
      break;
    case 'rtv':
      log(green('Serving JS from RTV'), cyan(`${argv.rtv}`));
      break;
    default:
      log(green('Serving'), cyan('unminified'), green('JS'));
  }
}

/**
 * Returns a list of middleware handler functions to use while serving
 * @return {!Array<function()>}
 */
function getMiddleware() {
  const middleware = [require('../server/app')]; // Lazy-required to enable live-reload
  if (!argv.quiet) {
    middleware.push(morgan('dev'));
  }
  if (argv.cache) {
    middleware.push(header({'cache-control': 'max-age=600'}));
  }
  if (!argv._.includes('serve') && !argv.eager_build) {
    middleware.push(lazyBuildExtensions);
    middleware.push(lazyBuildJs);
  }
  return middleware;
}

/**
 * Launches a server and waits for it to fully start up
 * @param {?Object} extraOptions
 */
async function startServer(extraOptions = {}) {
  let started;
  const startedPromise = new Promise(resolve => {
    started = resolve;
  });
  const options = Object.assign(
    {
      name: 'AMP Dev Server',
      root: process.cwd(),
      host: argv.host || 'localhost',
      port: argv.port || 8000,
      https: argv.https,
      preferHttp1: true,
      silent: true,
      middleware: getMiddleware,
    },
    extraOptions
  );
  connect.server(options, started);
  await startedPromise;
  url = `http${options.https ? 's' : ''}://${options.host}:${options.port}`;
  log(green('Started'), cyan(options.name), green('at'), cyan(url));
}

/**
 * Clears server files from the require cache to allow for in-process server
 * live-reload.
 */
function resetServerFiles() {
  for (const serverFile in serverFiles) {
    delete require.cache[serverFiles[serverFile]];
  }
}

/**
 * Stops the currently running server
 */
function stopServer() {
  connect.serverClose();
  log(green('Stopped server at'), cyan(url));
}

/**
 * Closes the existing server and restarts it
 */
function restartServer() {
  stopServer();
  resetServerFiles();
  startServer();
}

/**
 * Initiates pre-build steps requested via command line args.
 */
function initiatePreBuildSteps() {
  if (!argv._.includes('serve') && !argv.eager_build) {
    preBuildCoreRuntime();
    if (argv.extensions || argv.extensions_from) {
      preBuildSomeExtensions();
    }
  }
}

/**
 * Starts a webserver at the repository root to serve built files.
 */
async function serve() {
  createCtrlcHandler('serve');
  logServeMode();
  watch(serverFiles, restartServer);
  await startServer();
  initiatePreBuildSteps();
}

module.exports = {
  serve,
  startServer,
  stopServer,
};

serve.description = 'Starts a webserver at the project root directory';
serve.flags = {
  'host': '  Hostname or IP address to bind to (default: localhost)',
  'port': '  Specifies alternative port (default: 8000)',
  'https': '  Use HTTPS server',
  'quiet': "  Run in quiet mode and don't log HTTP requests",
  'cache': '  Make local resources cacheable by the browser',
  'no_caching_extensions': '  Disable caching for extensions',
  'compiled': '  Serve minified JS',
  'cdn': '  Serve current prod JS',
  'rtv': '  Serve JS from the RTV provided',
};
