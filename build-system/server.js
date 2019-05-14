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

/**
 * @fileoverview Creates an http server to handle static
 * files and list directories for use with the gulp live server
 */
const app = require('./app');
const colors = require('ansi-colors');
const gulp = require('gulp-help')(require('gulp'));
const isRunning = require('is-running');
const log = require('fancy-log');
const morgan = require('morgan');
const webserver = require('gulp-webserver');

const {
  SERVE_HOST: host,
  SERVE_PORT: port,
  SERVE_PROCESS_ID: gulpProcess,
} = process.env;

const useHttps = process.env.SERVE_USEHTTPS == 'true';
const quiet = process.env.SERVE_QUIET == 'true';
const sendCachingHeaders = process.env.SERVE_CACHING_HEADERS == 'true';
const noCachingExtensions = process.env.SERVE_EXTENSIONS_WITHOUT_CACHING ==
    'true';
const header = require('connect-header');

// Exit if the port is in use.
process.on('uncaughtException', function(err) {
  if (err.errno === 'EADDRINUSE') {
    log(colors.red('ERROR:'), 'Port', colors.cyan(port),
        'in use, shutting down server');
  } else {
    log(colors.red(err));
  }
  process.kill(gulpProcess, 'SIGINT');
  process.exit(1);
});

// Exit in the event of a crash in the parent gulp process.
setInterval(function() {
  if (!isRunning(gulpProcess)) {
    process.exit(1);
  }
}, 1000);

const middleware = [];
if (!quiet) {
  middleware.push(morgan('dev'));
}
middleware.push(app);
if (sendCachingHeaders) {
  middleware.push(header({
    'cache-control': ' max-age=600',
  }));
}

if (noCachingExtensions) {
  middleware.push(function(req, res, next) {
    if (req.url.startsWith('/dist/v0/amp-')) {
      log('Skipping caching for ', req.url);
      res.header('Cache-Control', 'no-store');
    }
    next();
  });
}

// Start gulp webserver
gulp.src(process.cwd())
    .pipe(webserver({
      port,
      host,
      directoryListing: true,
      https: useHttps,
      middleware,
    }));
