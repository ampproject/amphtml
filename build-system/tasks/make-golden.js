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
var clone = require('gulp-clone');
var exec = require('child_process').exec;
var gExec = require('gulp-exec');
var gulp = require('gulp');
var merge = require('merge-stream');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var through = require('through2');
var util = require('gulp-util');
var del = require('del');


function makeGolden(cb) {
  var host = 'http://localhost:8000';
  var device = 'iPhone6+';

  gulp.src('build/screenshots/**/*.png')
  .pipe(through.obj(function(file, enc, cb) {
  var path = file.path.replace(new RegExp('^' + file.cwd, 'i'), '');
  var output = path.replace(/\.png$/, '-tmp.png');
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
        cb(null, file);
      });
  }));
}


function moveImages() {
  return gulp.src('screenshots/**/*.png')
      .pipe(gulp.dest('build/screenshots'));
}

function cleanImages() {
  return del(['build/screenshots']);
}


gulp.task('clean-images', cleanImages);
gulp.task('move-images', moveImages);
gulp.task('make-golden', makeGolden);
gulp.task('image-report', function() {
  runSequence('clean-images', 'move-images', 'make-golden');
});
