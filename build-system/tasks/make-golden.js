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
var exec = require('child_process').exec;
var gulp = require('gulp');
var util = require('gulp-util');


function makeGolden(cb) {
  var path = argv.path;
  var host = argv.host || 'http://localhost:8000';
  var output = argv.output;
  var device = argv.device || 'iPhone6+';

  // ex. `gulp make-golden --path=examples.build/everything.amp.max.html
  // --host=http://localhost:8000 --output=everything.png`
  exec('phantomjs --ssl-protocol=any --ignore-ssl-errors=true ' +
       '--load-images=true ' +
      'testing/screenshots/make-screenshot.js ' +
      '"' + host + '" ' +
      '"' + path + '" ' +
      '"' + output + '" ' +
      '"' + device + '" ',
      function(err, stdout, stderr) {
        if (err != null) {
          util.log(util.colors.red('exec error: ' + err));
        }
        cb();
      });
}


gulp.task('make-golden', makeGolden);
