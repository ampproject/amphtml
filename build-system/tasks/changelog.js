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

var argv = require('minimist')(process.argv.slice(2));
var assert = require('assert');
var BBPromise = require('bluebird');
var config = require('../config');
var extend = require('util')._extend;
var git = require('gulp-git');
var gulp = require('gulp-help')(require('gulp'));
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
  var version = argv.version;
  var versionErrMsg = 'No version option passed';

  if (!version) {
    util.log(util.colors.red(versionErrMsg));
    throw new Error(versionErrMsg);
  }

  var gitMetadata = {};
  return getLastGitTag()
      .then(onGitTagSuccess.bind(null, gitMetadata))
      .then(getGitLog)
      .then(onGitLogSuccess.bind(null, gitMetadata))
      .then(fetchGithubMetadata)
      .then(buildChangelog.bind(null, gitMetadata))
      .then(function(gitMetadata) {
        util.log(util.colors.blue('\n' + gitMetadata.changelog));
        return submitReleaseNotes(version, gitMetadata.changelog);
      })
      .catch(errHandler);
}

function submitReleaseNotes(version, changelog) {
  assert(typeof version == 'number', 'version should be a number. ' + version);
  var options = {
    url: 'https://api.github.com/repos/ampproject/amphtml/releases',
    method: 'POST',
    headers: {
      'User-Agent': 'amp-changelog-gulp-task',
      'Accept': 'application/vnd.github.v3+json'
    },
    json: true,
    body: {
      'tag_name': String(version),
      'target_commitish': 'release',
      'name': String(version),
      'body': changelog,
      'draft': true,
      'prerelease': false
    }
  };

  if (GITHUB_ACCESS_TOKEN) {
    options.qs = {
      access_token: GITHUB_ACCESS_TOKEN
    }
  }

  return request(options).then(function() {
    util.log(util.colors.green('Release Notes submitted'));
  });
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

function getLastGitTag() {
  var options = {
    args: 'describe --abbrev=0 --tags'
  };
  return gitExec(options).then(function(tag) {
    if (typeof tag == 'string') {
      return tag.replace(/\n/, '');
    }
    throw new Error('No tag found.');
  });
}

function getGitLog(tag) {
  var options = {
    args: 'log release...' + tag + ' --pretty=format:%s --merges'
  };
  return gitExec(options).then(function(log) {
    if (!log) {
      throw new Error('No log found from log master...' + tag + ' --merges');
    }
    return log;
  });
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
    assert(typeof body.url == 'string', 'should have url string. ' + res.body);
    var url = body.url.split('/');
    var pr = url[url.length - 1];
    return body.title + ' (#' + pr + ')';
  });
}

function getPullRequestFiles(title, filesOption) {
  return request(filesOption).then(function(res) {
    var body = JSON.parse(res.body);

    assert(Array.isArray(body) && body.length > 0,
        'Pull request response must not be empty. ' + res.body);
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
  if (!tag) {
    throw new Error('Could not find latest tag.');
  }

  gitMetadata.tag = tag;
  util.log(util.colors.green('Prevous Tag: ' + tag));
  return tag;
}

function onGitLogSuccess(gitMetadata, logs) {
  var commits = logs.split('\n');
  assert(typeof logs == 'string', 'git log should be a string.\n' + logs);
  return commits
    .filter(function(commit) {
      // filter non Pull request merges
      return commit.indexOf('Merge pull') == 0;
    })
    .map(function(commit) {
      // We only need the PR id
      var id = commit.split(' ')[3].slice(1);
      var value = parseInt(id, 10);
      assert(value > 0, 'Should be an integer greater than 0. ' + value);
      return id;
    });
}

function errHandler(err) {
  var msg = err;
  if (err.message) {
    msg = err.message;
  }
  util.log(util.colors.red(msg));
  return err;
}

gulp.task('changelog', 'Create github release draft', changelog, {
  options: {
    version: '  Label to be used for this tag release'
  }
});
