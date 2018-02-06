/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const BBPromise = require('bluebird');
const colors = require('ansi-colors');
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const request = BBPromise.promisify(require('request'));
const srcGlobs = require('../config').presubmitGlobs;
const through2 = require('through2');

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

/** @type {!Object<string, !Promise<number>>} */
const issueCache = Object.create(null);


/**
 * Test if a file's contents contains closed TODOs.
 *
 * @param {!File} file file is a vinyl file object
 * @return {Promise<number>} Number of found closed TODOs.
 */
function findClosedTodosInFile(file) {
  const contents = file.contents.toString();
  const todos = contents.match(/TODO\([^\)]*\)/g);
  if (!todos || todos.length == 0) {
    return Promise.resolve(0);
  }

  const promises = [];
  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i];
    const parts = /TODO\([^\)]*\#(\d*)\)/.exec(todo);
    const issueId = parts ? parts[1] : null;
    if (!issueId) {
      continue;
    }
    promises.push(reportClosedIssue(file, issueId, todo));
  }

  if (promises.length == 0) {
    return Promise.resolve(0);
  }
  return Promise.all(promises).then(results => {
    return results.reduce(function(acc, v) {
      return acc + v;
    }, 0);
  }).catch(function(error) {
    log(colors.red('Failed in', file.path, error, error.stack));
    return 0;
  });
}


/**
 * @param {!File} file file is a vinyl file object
 * @param {string} issueId
 * @param {string} todo
 * @return {!Promise<number>}
 */
function reportClosedIssue(file, issueId, todo) {
  if (issueCache[issueId] !== undefined) {
    return issueCache[issueId];
  }
  return issueCache[issueId] = githubRequest('/issues/' + issueId)
      .then(response => {
        const issue = JSON.parse(response.body);
        const value = issue.state == 'closed' ? 1 : 0;
        if (value) {
          log(colors.red(todo, 'in', file.path));
        }
        return value;
      });
}


/**
 * @param {string} path
 * @param {string=} opt_method
 * @param {*} opt_data
 * @return {!Promise<*>}
 */
function githubRequest(path, opt_method, opt_data) {
  const options = {
    url: 'https://api.github.com/repos/ampproject/amphtml' + path,
    headers: {
      'User-Agent': 'amp-changelog-gulp-task',
      'Accept': 'application/vnd.github.v3+json',
    },
    qs: {
      'access_token': GITHUB_ACCESS_TOKEN,
    },
  };
  if (opt_method) {
    options.method = opt_method;
  }
  if (opt_data) {
    options.json = true;
    options.body = opt_data;
  }
  return request(options);
}


/**
 * todos:find-closed task.
 */
function findClosedTodosTask() {
  let foundCount = 0;
  return gulp.src(srcGlobs)
      .pipe(through2.obj(function(file, enc, cb) {
        findClosedTodosInFile(file).then(function(count) {
          foundCount += count;
          cb();
        });
      }))
      .on('end', function() {
        if (foundCount > 0) {
          log(colors.red('Found closed TODOs: ', foundCount));
          process.exit(1);
        }
      });
}


gulp.task('todos:find-closed', 'Find closed TODOs', findClosedTodosTask);
