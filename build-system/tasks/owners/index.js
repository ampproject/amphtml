/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
var child_process = require('child_process');
var BBPromise = require('bluebird');
var fs = BBPromise.promisifyAll(require('fs'));
var glob = BBPromise.promisify(require('glob'));
var exec = BBPromise.promisify(child_process.exec);

var pathGlobs = [
  'extensions/*',
  'src',
  'build-system',
  'ads',
  'third_party',
  'tools',
  'validator',
  '3p',
  'css'
];

function getFolders(pathGlobs) {
  return BBPromise.map(pathGlobs, pathGlob => glob(pathGlob))
      .then(paths => [].concat.apply([], paths))
      .filter(path => fs.statAsync(path).then(stat => stat.isDirectory()));
}

function getCommitCount(path) {
  return exec(`git log --follow --format='%an' ${path} | sort | uniq -c`)
      .then((counts) => {
        return counts.split('\n').map(x => x.trim()).filter(x => !!x)
            .map(x => {
              var line = x.split(' ');
              return { author: line[1], commits: Number(line[0]), path: path };
            });
      });
}

function getOwners(candidates) {
  var cur, i;
  var owners = [];
  var max = null;

  for (i = 0; i < candidates.length; i++) {
    cur = candidates[i];
    if (max === null) {
      max = cur;
      continue;
    }
    if (cur.commits > max.commits) {
      max = cur;
      continue;
    }
  }

  var maxCommit = max.commits;
  var diff;
  for (i = 0; i < candidates.length; i++) {
    cur = candidates[i];
    diff = Math.floor((maxCommit - cur.commits) / maxCommit * 100);
    // diff tolerance of number of commits
    if (diff <= 50) {
      owners.push(cur.author);
    }
  }
  return owners;
}

function createOwners() {
  return getFolders(pathGlobs).map(path => {
    return getCommitCount(path);
  }).then(paths => {
    return paths.map((pathCommiters) => {
      console.log(`${pathCommiters[0].path} ${getOwners(pathCommiters)}`);
    });
  });
}

gulp.task('create-owners', 'create yaml owners file', createOwners);
