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

const app = require('../app');
const argv = require('minimist')(process.argv.slice(2));
const connect = require('gulp-connect');
const header = require('connect-header');
const log = require('fancy-log');
const morgan = require('morgan');
const watch = require('gulp-watch');
const {
  lazyBuildExtensions,
  lazyBuildJs,
  preBuildCoreRuntime,
  preBuildSomeExtensions,
} = require('../lazy-build');
const {createCtrlcHandler} = require('../ctrlcHandler');
const {cyan, green} = require('ansi-colors');
const {isRtvMode} = require('../app-utils');

// TODO(ampproject): Consolidate these into a single directory.
const serverFiles = [
  'build-system/app.js',
  'build-system/recaptcha-router.js',
  'build-system/routes/analytics.js',
  'build-system/app-index/*',
];

/**
 * Determines the server's mode based on command line arguments.
 */
function setServeMode() {
  if (argv.compiled) {
    process.env.SERVE_MODE = 'compiled';
    log(green('Serving'), cyan('minified JS'));
  } else if (argv.cdn) {
    process.env.SERVE_MODE = 'cdn';
    log(green('Serving'), cyan('current prod JS'));
  } else if (argv.rtv_serve_mode) {
    const rtv = argv.rtv_serve_mode;
    if (isRtvMode(rtv)) {
      process.env.SERVE_MODE = rtv;
      log(green('Serving'), cyan(`RTV ${rtv} JS`));
    } else {
      throw new Error(`Invalid rtv_serve_mode: ${rtv}`);
    }
  } else {
    process.env.SERVE_MODE = 'default';
    log(green('Serving'), cyan('unminified JS'));
  }
}

/**
 * Returns a list of middleware handler functions to use while serving
 * @return {!Array<function()>}
 */
function getMiddleware() {
  const middleware = [app];
  if (!argv.quiet) {
    middleware.push(morgan('dev'));
  }
  if (argv.cache) {
    middleware.push(header({'cache-control': 'max-age=600'}));
  } else if (argv.nocache) {
    middleware.push(header({'cache-control': 'no-store'}));
  }
  if (argv.lazy_build) {
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
      root: process.cwd(),
      host: argv.host || 'localhost',
      port: argv.port || 8000,
      https: argv.https,
      silent: true,
      middleware: getMiddleware,
    },
    extraOptions
  );
  connect.server(options, started);
  await startedPromise;
  log(
    green('Started server at'),
    cyan(`http${options.https ? 's' : ''}://${options.host}:${options.port}`)
  );
}

/**
 * Stops the currently running server
 */
function stopServer() {
  connect.serverClose();
  log(green('Stopped server'));
}

/**
 * Closes the existing server and restarts it
 */
function restartServer() {
  stopServer();
  startServer();
}

/**
 * Initiates pre-build steps requested via command line args.
 */
function initiatePreBuildSteps() {
  if (argv.lazy_build) {
    preBuildCoreRuntime();
    if (argv.extensions || argv.extensions_from) {
      preBuildSomeExtensions(argv);
    }
  }
}

/**
 * Starts a webserver at the repository root to serve built files.
 */
async function serve() {
  createCtrlcHandler('serve');
  setServeMode();
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
  'nocache': '  Disable caching for all requests',
};
