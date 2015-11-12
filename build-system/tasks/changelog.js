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

/**
 * @fileoverview Creates a gulp task that fetches the titles and files
 * of pull requests using the github API, from master up to the last git tag.
 * Only includes pull requests that have code changes and not only markdown,
 * json, and yaml changes.
 */

var BBPromise = require('bluebird');
var config = require('../config');
var extend = require('util')._extend;
var git = require('gulp-git');
var gulp = require('gulp');
var request = BBPromise.promisify(require('request'));
var util = require('gulp-util');

var GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
var gitExec = BBPromise.promisify(git.exec);


function changelog() {
  if (!GITHUB_ACCESS_TOKEN) {
    util.log(util.colors.red('Warning! You have not set the ' +
        'GITHUB_ACCESS_TOKEN env var. This task might hit the default ' +
        'rate limit set by github (60).'));
    util.log(util.colors.green('See https://help.github.com/articles/' +
        'creating-an-access-token-for-command-line-use/ ' +
        'for instructions on how to create a github access token. We only ' +
        'need `public_repo` scope.'));
  }

  return getGitMetadata();
}

function getGitMetadata() {
  var gitMetadata = {};
  return getGitTag(gitMetadata)
      .then(onGitTagSuccess.bind(null, gitMetadata))
      .then(getGitLog)
      .then(onGitLogSuccess.bind(null, gitMetadata))
      .then(fetchGithubMetadata)
      .then(buildChangelog.bind(null, gitMetadata))
      .then(function(gitMetadata) {
        // output to the console so that an external script
        // can read the information.
        console/*OK*/.log(gitMetadata.changelog);
      })
      .catch(errHandler);
}

function buildChangelog(gitMetadata, githubMetadata) {
  var titles = githubMetadata
      .filter(function(data) {
        return !data.filenames.every(function(filename) {
          return config.changelogIgnoreFileTypes.test(filename);
        });
      })
      .map(function(data) {
        return '  - ' + data.title.trim();
      }).join('\n');
  gitMetadata.changelog = titles;
  return gitMetadata;
}

function getGitTag() {
  var options = {
    args: 'describe --abbrev=0 --tags'
  };
  return gitExec(options);
}

function getGitLog(tag) {
  var options = {
    args: 'log master...' + tag + ' --pretty=format:%s --merges'
  };
  return gitExec(options);
}

function fetchGithubMetadata(ids) {
  var options = {
    url: 'https://api.github.com/repos/ampproject/amphtml/pulls/',
    headers: {
      'User-Agent': 'amp-changelog-gulp-task'
    }
  };

  if (GITHUB_ACCESS_TOKEN) {
    options.qs = {
      access_token: GITHUB_ACCESS_TOKEN
    }
  }

  // NOTE: (erwinm) not sure if theres a better way to do this, we're
  // doing n + 1 fetches here since we can't batch things up.
  var requests = ids.map(function(id) {
    var prOption = extend({}, options);
    prOption.url += id;

    return getPullRequestTitle(prOption).then(function(title) {
      var filesOption = extend({}, prOption);
      filesOption.url += '/files';
      return getPullRequestFiles(title, filesOption);
    });
  });

  return BBPromise/*OK*/.all(requests);
}

function getPullRequestTitle(prOption) {
  return request(prOption).then(function(res) {
    var body = JSON.parse(res.body);
    return body.title;
  });
}

function getPullRequestFiles(title, filesOption) {
  return request(filesOption).then(function(res) {
    var body = JSON.parse(res.body);

    if (!body || !Array.isArray(body)) {
      throw new Error('Could not get Pull Request Files.');
    }
    var filenames = body.map(function(file) {
      return file.filename;
    });

    return {
      title: title,
      filenames: filenames
    };
  });
}

function onGitTagSuccess(gitMetadata, tag) {
  tag = tag.replace(/\n/, '');

  if (!tag) {
    throw new Error('Could not find latest tag.');
  }

  gitMetadata.tag = tag;
  util.log(util.colors.green('Prevous Tag: ' + tag));
  return tag;
}

function onGitLogSuccess(gitMetadata, logs) {
  var commits = logs.split('\n');
  return commits.map(function(commit) {
    return commit.split(' ')[3].slice(1);
  });
}

function errHandler(err) {
  util.log(util.colors.red(err));
  return err;
}

gulp.task('changelog', changelog);
