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
var gls = require('gulp-live-server');
var path = require('path');
var util = require('gulp-util');

var port = argv.port || process.env.PORT || 8000;

/**
 * Starts a simple http server at the repository root
 */
function serve() {
  var serverScript = path.join(__dirname, '../server.js')
  var server = gls.new([serverScript, (argv.path || '/'), port]);
  server.start();
  util.log(util.colors.yellow(
    'Run `gulp build` then go to http://localhost:' + port + '/examples.build/article.amp.max.html'
  ));
}

gulp.task('serve', 'Serves content in root dir over http://localhost:' +
  port + '/', serve, {
    options: {
      'port': '  Specifies alternative port to use instead of default (8000)'
    }
  }
);
