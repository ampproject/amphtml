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

var find = require('find-in-files').find;

// Directories to check for presubmit checks.
var srcDirectories = [
  './ads',
  './build-system',
  './css',
  './examples',
  './spec',
  './src',
  './test',
  './testing',
];

// Terms that must not appear in our source files.
var forbiddenTerms = [
  'DO' + ' NOT SUBMIT',
  'X' + 'XX',
  // If you run against this, use console/*OK*/.log to whitelist a legit
  // case.
  'console\\.\\w+\\(',
];

function checkForbiddenTerms() {
  var promises = [];
  srcDirectories.forEach(function(dir) {
    forbiddenTerms.forEach(function(term) {
      promises.push(checkForbiddenTerm(dir, term));
    });
  });
  Promise.all(promises).then(function(bools) {
    if (bools.filter(function(bool) { return bool }).length) {
      process.exit(1);
    } else {
      process.exit();
    }
  });
}

/**
 * @param {string} directory
 * @param {string} term
 * @return {!Promise<boolean>} True if a forbidden term was found.
 */
function checkForbiddenTerm(directory, term) {
  return find(term, directory, /(\.js|\.css|\.html|\.md)$/).then(
      function(results) {
        var found = false;
        for (var result in results) {
          var res = results[result];
          console/*OK*/.error(
              'Found "' + res.matches[0] + '" ' + res.count
              + ' times in "' + result + '"'
          );
          found = true;
        }
        return found;
      });
}

exports.run = function() {
  checkForbiddenTerms();
};
