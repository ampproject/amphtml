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

/**
 * @fileoverview Creates an http server to handle static
 * files and list directories for use with the gulp live server
 */
var argv = require('minimist')(process.argv.slice(2));
var app = require(require.resolve('./app.js'));
var webserver = require('gulp-webserver');
var gulp = require('gulp-help')(require('gulp'));
var morgan = require('morgan');
var host = argv.host || 'localhost';
var port = argv.port || process.env.PORT || 8000;
var useHttps = argv.https != undefined;

// Start gulp webserver
gulp.src(process.cwd())
  .pipe(webserver({
    port,
    host,
    directoryListing: true,
    https: useHttps,
    middleware: [morgan('dev'), app],
  }));

