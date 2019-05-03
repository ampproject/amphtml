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

const argv = require('minimist')(process.argv.slice(2));
const BBPromise = require('bluebird');
const colors = require('ansi-colors');
const fs = require('fs-extra');
const git = require('gulp-git');
const log = require('fancy-log');
const request = BBPromise.promisify(require('request'));

const {GITHUB_ACCESS_TOKEN} = process.env;
const gitExec = BBPromise.promisify(git.exec);

const isDryrun = argv.dryrun;
const verbose = (argv.verbose || argv.v);

const LABELS = {
  'canary': 'PR use: In Canary',
  'prod': 'PR use: In Production',
};


/**
 * @param {string} type Either of "canary" or "prod".
 * @param {string} dir Working dir.
 * @return {!Promise}
 */
function releaseTagFor(type, dir) {
  log('Tag release for: ', type);
  let promise = Promise.resolve();
  const ampDir = dir + '/amphtml';

  // Fetch tag.
  let tag;
  promise = promise.then(function() {
    return githubRequest('/releases');
  }).then(res => {
    const array = JSON.parse(res.body);
    for (let i = 0; i < array.length; i++) {
      const release = array[i];
      const releaseType = release.prerelease ? 'canary' : 'prod';
      if (releaseType == type) {
        tag = release.tag_name;
        break;
      }
    }
  });

  // Checkout tag.
  promise = promise.then(function() {
    log('Git tag: ', tag);
    return gitExec({
      cwd: ampDir,
      args: 'checkout ' + tag,
    });
  });

  // Log.
  const pullRequests = [];
  promise = promise.then(function() {
    const date = new Date();
    date.setDate(date.getDate() - 15);
    const dateIso = date.toISOString().split('T')[0];
    return gitExec({
      cwd: ampDir,
      args: 'log --pretty=oneline --since=' + dateIso,
    });
  }).then(function(output) {
    const lines = output.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const paren = line.lastIndexOf('(');
      line = paren != -1 ? line.substring(paren) : '';
      if (!line) {
        continue;
      }
      const match = line.match(/\(\#(\d+)\)/);
      if (match && match[1]) {
        pullRequests.push(match[1]);
      }
    }
  });

  // Update.
  const label = LABELS[type];
  promise = promise.then(function() {
    log('Update ' + pullRequests.length + ' pull requests');
    const updates = [];
    pullRequests.forEach(function(pullRequest) {
      updates.push(applyLabel(pullRequest, label));
    });
    return Promise.all(updates);
  });

  return promise.then(function() {
    log(colors.green('Tag release for ' + type + ' done.'));
  });
}

/**
 * @param {string} pullRequest
 * @param {string} label
 * @return {!Promise}
 */
function applyLabel(pullRequest, label) {
  if (verbose && isDryrun) {
    log('Apply label ' + label + ' for #' + pullRequest);
  }
  if (isDryrun) {
    return Promise.resolve();
  }
  return githubRequest(
      '/issues/' + pullRequest + '/labels',
      'POST',
      [label]).then(function() {
    if (verbose) {
      log(colors.green(
          'Label applied ' + label + ' for #' + pullRequest));
    }
  });
}

/**
 * @param {string} dir Working dir.
 * @return {!Promise}
 */
function gitFetch(dir) {
  const ampDir = dir + '/amphtml';
  let clonePromise;
  if (fs.existsSync(ampDir)) {
    clonePromise = Promise.resolve();
  } else {
    clonePromise = gitExec({
      cwd: dir,
      args: 'clone https://github.com/ampproject/amphtml.git',
    });
  }
  return clonePromise.then(function() {
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
 * @return {!Promise}
 */
function releaseTag() {
  let promise = Promise.resolve();

  const dir = 'build/tagging';
  log('Work dir: ', dir);
  fs.mkdirpSync(dir);
  promise = promise.then(function() {
    return gitFetch(dir);
  });

  const type = argv.type || 'all';
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

module.exports = {
  releaseTag,
};

releaseTag.description = 'Tag the releases in pull requests';
releaseTag.flags = {
  dryrun: '  Generate update log but dont push it out',
  type: '  Either of "canary", "prod" or "all". Default is "all".',
};
