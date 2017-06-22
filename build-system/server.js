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
const app = require(require.resolve('./app.js'));
const isRunning = require('is-running');
const gulp = require('gulp-help')(require('gulp'));
const morgan = require('morgan');
const util = require('gulp-util');
const webserver = require('gulp-webserver');

const host = process.env.SERVE_HOST;
const port = process.env.SERVE_PORT;
const useHttps = process.env.SERVE_USEHTTPS == 'true' ? true : false;
const gulpProcess = process.env.SERVE_PROCESS_ID;

// Exit in the event of a crash in the parent gulp process.
setInterval(function() {
  if (!isRunning(gulpProcess)) {
    util.log(util.colors.red('Gulp process terminated, shutting down server'));
    process.exit(1);
  }
}, 1000);

// Start gulp webserver
gulp.src(process.cwd())
  .pipe(webserver({
    port,
    host,
    directoryListing: true,
    https: useHttps,
    middleware: [morgan('dev'), app],
  }));

