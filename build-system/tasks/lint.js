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
var config = require('../config');
var eslint = require('gulp-eslint');
var exec = require('child_process').exec;
var gulp = require('gulp-help')(require('gulp'));
var lazypipe = require('lazypipe');
var util = require('gulp-util');
var watch = require('gulp-watch');

var isWatching = (argv.watch || argv.w) || false;

var options = {
  fix: false,
  plugins: ['eslint-plugin-google-camelcase'],
  "ecmaFeatures": {
    "modules": true,
    "arrowFunctions": true,
    "blockBindings": true,
    "forOf": false,
    "destructuring": false
  },
};

var watcher = lazypipe().pipe(watch, config.lintGlobs);

/**
 * Run the eslinter on the src javascript and log the output
 * @return {!Stream} Readable stream
 */
function lint() {
  var errorsFound = false;
  var stream = gulp.src(config.lintGlobs);

  if (isWatching) {
    stream = stream.pipe(watcher());
  }

  return stream.pipe(eslint(options))
    .pipe(eslint.formatEach('stylish', function(msg) {
      errorsFound = true;
      util.log(util.colors.red(msg));
    }))
    .on('end', function() {
      if (errorsFound) {
        util.log(util.colors.blue('Run `gulp lint-fix` to automatically ' +
            'fix some of these lint warnings/errors. This is a destructive ' +
            'operation (operates on the file system) so please make sure ' +
            'you commit before running.'));
        process.exit(1);
      }
    });
}

function lintFix(done) {
  // Temporary until we figure out gulp-eslint fix and destination write.
  exec('node_modules/eslint/bin/eslint.js ' +
      '{src,3p,ads,builtins,extensions,testing,test}/**/*.js gulpfile.js ' +
      '-c .eslintrc --fix --plugin google-camelcase',
      function(err, stdout, stderr) {
        if (err) {
          util.log(util.colors.red(err.message));
        }
        done();
      });
}

gulp.task('lint', 'Validates against Google Closure Linter', lint,
{
  options: {
    'watch': '  Watches for changes in files, validates against the linter'
  }
});
gulp.task('lint-fix', 'Auto fixes some simple lint errors', lintFix);
