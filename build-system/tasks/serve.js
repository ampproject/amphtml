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

var argv = require('minimist')(process.argv.slice(2));
var gulp = require('gulp-help')(require('gulp'));
var util = require('gulp-util');
var webserver = require('gulp-webserver');
var app = require('../server').app;

var port = argv.port || process.env.PORT || 8000;
var useHttps = argv.https != undefined;

/**
 * Starts a simple http server at the repository root
 */
function serve() {
  var server = gulp.src(process.cwd())
      .pipe(webserver({
        port,
        host: '0.0.0.0',
        directoryListing: true,
        https: useHttps,
        middleware: [app]
      }));

  util.log(util.colors.yellow('Run `gulp build` then go to '
      + getHost() + '/examples/article.amp.max.html'
  ));
  return server;
}

gulp.task(
    'serve',
    'Serves content in root dir over ' + getHost() + '/',
    serve,
    {
      options: {
        'port': '  Specifies alternative port (default: 8000)',
        'https': '  Use HTTPS server (default: false)'
      }
    }
);

function getHost() {
  return (useHttps ? 'https' : 'http') + '://localhost:' + port;
}
