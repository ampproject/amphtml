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

var gulp = require('gulp');
var util = require('gulp-util');

// Directories to check for presubmit checks.
var srcGlobs = [
  '**/*.{css,js,html,md}',
  '!{node_modules,dist,dist.ads}/**/*.*',
  '!build-system/tasks/presubmit-checks.js',
  '!build/polyfills.js',
  '!gulpfile.js'
];

// Terms that must not appear in our source files.
var forbiddenTerms = {
  'DO NOT SUBMIT': '',
  'describe\\.only': '',
  'it\\.only': '',
  'XXX': '',
  'console\\.\\w+\\(': 'If you run against this, use console/*OK*/.log to ' +
      'whitelist a legit case.',
  '\\.innerHTML': '',
  '\\.outerHTML': '',
  '\\.postMessage': '',
  'cookie': '',
  'eval\\(': '',
  'localStorage': '',
  'sessionStorage': '',
  'indexedDB': '',
  'openDatabase': '',
  'requestFileSystem': '',
  '\\.scrollTop': '',
  'webkitRequestFileSystem': '',
};

var forbiddenTermsKeys = Object.keys(forbiddenTerms);

function hasAnyTerms(file) {
  var content = file.contents.toString();
  return forbiddenTermsKeys.map(function(term) {
    var fix;
    // we can't optimize building the `RegExp` objects early unless we build
    // another mapping of term -> regexp object to be able to get back to the
    // original term to get the possible fix value. This is ok as the
    // presubmit doesn't have to be blazing fast and this is most likely
    // negligible.
    var matches = content.match(new RegExp(term));
    if (matches) {
      util.log(util.colors.red('Found: "' + matches[0] + '" in ' + file.path));
      fix = forbiddenTerms[term];
      if (fix) {
        util.log(util.colors.blue(fix));
      }
      util.log(util.colors.blue('=========='));
      return true;
    }
    return false;
  }).some(function(hasAnyTerm) {
    return hasAnyTerm;
  });
}

function checkForbiddenTerms() {
  var errorsFound = false;
  return gulp.src(srcGlobs)
    .pipe(util.buffer(function(err, files) {
      errorsFound = files.map(hasAnyTerms).some(function(errorFound) {
        return errorFound;
      });
    }))
    .on('end', function() {
      if (errorsFound) {
        util.log(util.colors.blue(
            'Please remove these usages or consult with the AMP team.'));
        process.exit(1);
      }
    });
}

gulp.task('presubmit', checkForbiddenTerms);
