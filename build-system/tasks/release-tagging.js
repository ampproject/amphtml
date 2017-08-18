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

var BBPromise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
var assert = require('assert');
var child_process = require('child_process');
var config = require('../config');
var extend = require('util')._extend;
var fs = require('fs-extra');
var git = require('gulp-git');
var gulp = require('gulp-help')(require('gulp'));
var request = BBPromise.promisify(require('request'));
var util = require('gulp-util');

var GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
var exec = BBPromise.promisify(child_process.exec);
var gitExec = BBPromise.promisify(git.exec);

var isDryrun = argv.dryrun;
var verbose = (argv.verbose || argv.v);

var LABELS = {
  'canary': 'PR use: In Canary',
  'prod': 'PR use: In Production',
};


/**
 * @param {string} type Either of "canary" or "prod".
 * @param {string} dir Working dir.
 * @return {!Promise}
 */
function releaseTagFor(type, dir) {
  util.log('Tag release for: ', type);
  var promise = Promise.resolve();
  var ampDir = dir + '/amphtml';

  // Fetch tag.
  var tag;
  promise = promise.then(function() {
    return githubRequest('/releases');
  }).then(res => {
    var array = JSON.parse(res.body);
    for (var i = 0; i < array.length; i++) {
      var release = array[i];
      var releaseType = release.prerelease ? 'canary' : 'prod';
      if (releaseType == type) {
        tag = release.tag_name;
        break;
      }
    }
  });

  // Checkout tag.
  promise = promise.then(function() {
    util.log('Git tag: ', tag);
    return gitExec({
      cwd: ampDir,
      args: 'checkout ' + tag,
    });
  });

  // Log.
  var pullRequests = [];
  promise = promise.then(function() {
    var date = new Date();
    date.setDate(date.getDate() - 15);
    var dateIso = date.toISOString().split('T')[0];
    return gitExec({
      cwd: ampDir,
      args: 'log --pretty=oneline --since=' + dateIso,
    });
  }).then(function(output) {
    var lines = output.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var paren = line.lastIndexOf('(');
      line = paren != -1 ? line.substring(paren) : '';
      if (!line) {
        continue;
      }
      var match = line.match(/\(\#(\d+)\)/);
      if (match && match[1]) {
        pullRequests.push(match[1]);
      }
    }
  });

  // Update.
  var label = LABELS[type];
  promise = promise.then(function() {
    util.log('Update ' + pullRequests.length + ' pull requests');
    var updates = [];
    pullRequests.forEach(function(pullRequest) {
      updates.push(applyLabel(pullRequest, label));
    });
    return Promise.all(updates);
  });

  return promise.then(function() {
    util.log(util.colors.green('Tag release for ' + type + ' done.'));
  });
}

/**
 * @param {string} pullRequest
 * @param {string} label
 * @return {!Promise}
 */
function applyLabel(pullRequest, label) {
  if (verbose && isDryrun) {
    util.log('Apply label ' + label + ' for #' + pullRequest);
  }
  if (isDryrun) {
    return Promise.resolve();
  }
  return githubRequest(
      '/issues/' + pullRequest + '/labels',
      'POST',
      [label]).then(function() {
        if (verbose) {
          util.log(util.colors.green(
              'Label applied ' + label + ' for #' + pullRequest));
        }
      });
}

/**
 * @param {string} dir Working dir.
 * @return {!Promise}
 */
function gitFetch(dir) {
  var ampDir = dir + '/amphtml';
  var clonePromise;
  if (fs.existsSync(ampDir)) {
    clonePromise = Promise.resolve();
  } else {
    clonePromise = gitExec({
      cwd: dir,
      args: 'clone https://github.com/ampproject/amphtml.git',
    });
  }
  return clonePromise.then(function(arg) {
    return gitExec({
      cwd: ampDir,
      args: 'fetch --tags',
    });
  });
}

/**
 * @param {string} path
 * @param {string=} opt_method
 * @param {*} opt_data
 * @return {!Promise<*>}
 */
function githubRequest(path, opt_method, opt_data) {
  var options = {
    url: 'https://api.github.com/repos/ampproject/amphtml' + path,
    headers: {
      'User-Agent': 'amp-changelog-gulp-task',
      'Accept': 'application/vnd.github.v3+json'
    },
    qs: {
      access_token: GITHUB_ACCESS_TOKEN
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
 * @return {!Promise}
 */
function releaseTag() {
  var promise = Promise.resolve();

  var dir = 'build/tagging';
  util.log('Work dir: ', dir);
  fs.mkdirpSync(dir);
  promise = promise.then(function() {
    return gitFetch(dir);
  });

  var type = argv.type || 'all';
  if (type == 'all' || type == 'canary') {
    promise = promise.then(function() {
      return releaseTagFor('canary', dir);
    });
  }
  if (type == 'all' || type == 'prod') {
    promise = promise.then(function() {
      return releaseTagFor('prod', dir);
    });
  }
  return promise;
}


gulp.task('release:tag', 'Tag the releases in pull requests', releaseTag, {
  options: {
    dryrun: '  Generate update log but dont push it out',
    type: '  Either of "canary", "prod" or "all". Default is "all".',
  }
});
