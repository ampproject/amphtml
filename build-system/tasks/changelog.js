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
 * of pull requests using the github API, from `branch` up to the last git tag.
 * Only includes pull requests that have code changes and not only markdown,
 * json, and yaml changes.
 */

var BBPromise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
var assert = require('assert');
var child_process = require('child_process');
var config = require('../config');
var extend = require('util')._extend;
var git = require('gulp-git');
var gulp = require('gulp-help')(require('gulp'));
var request = BBPromise.promisify(require('request'));
var util = require('gulp-util');

var GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
var exec = BBPromise.promisify(child_process.exec);
var gitExec = BBPromise.promisify(git.exec);

var branch = argv.branch || 'canary';
var isDryrun = argv.dryrun;


function changelog() {
  if (!GITHUB_ACCESS_TOKEN) {
    util.log(util.colors.red('Warning! You have not set the ' +
        'GITHUB_ACCESS_TOKEN env var. Aborting "changelog" task.'));
    util.log(util.colors.green('See https://help.github.com/articles/' +
        'creating-an-access-token-for-command-line-use/ ' +
        'for instructions on how to create a github access token. We only ' +
        'need `public_repo` scope.'));
    return;
  }

  return getGitMetadata();
}

function getGitMetadata() {
  if (!argv.version) {
    throw new Error('no version value passed in. See --version flag option.');
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
        if (isDryrun) {
          return;
        }
        return getCurrentSha().then(
          submitReleaseNotes.bind(null, argv.version, gitMetadata.changelog)
        );
      })
      .catch(errHandler);
}

function submitReleaseNotes(version, changelog, sha) {
  var name = String(version);
  var options = {
    url: 'https://api.github.com/repos/ampproject/amphtml/releases',
    method: 'POST',
    headers: {
      'User-Agent': 'amp-changelog-gulp-task',
      'Accept': 'application/vnd.github.v3+json'
    },
    json: true,
    body: {
      'tag_name': name,
      'target_commitish': sha,
      'name': name,
      'body': changelog,
      'draft': true,
      'prerelease': true
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

function getCurrentSha() {
  return gitExec({ args: 'rev-parse HEAD' }).then(function(sha) {
    return sha.trim();
  });
}

function buildChangelog(gitMetadata, githubMetadata) {
  var changelog = `## Version: ${argv.version}\n\n`;
  // append all titles
  changelog += githubMetadata
      .filter(function(data) {
        return !data.filenames.every(function(filename) {
          return config.changelogIgnoreFileTypes.test(filename);
        });
      })
      .map(function(data) {
        return '  - ' + data.title.trim();
      }).join('\n');
  changelog += '\n\n## Breakdown by component\n\n';
  var sections = buildSections(githubMetadata);

  Object.keys(sections).sort().forEach(function(section) {
    changelog += `### ${section}\n\n`;
    var uniqueItems = sections[section].filter(function(title, idx) {
      return sections[section].indexOf(title) == idx;
    });
    changelog += uniqueItems.join('');
    changelog += '\n';
  });

  gitMetadata.changelog = changelog;
  return gitMetadata;
}

/**
 * @param {!Array<PullRequestMetedata>} githubMetadata
 * @return {!Object}
 */
function buildSections(githubMetadata) {
  var sections = {};
  githubMetadata.forEach(function(pr) {
    var hasNonDocChange = !pr.filenames.every(function(filename) {
      return config.changelogIgnoreFileTypes.test(filename);
    });
    var listItem = `  - ${pr.title.trim()}\n`;

    if (hasNonDocChange) {
      changelog += listItem;
    }

    pr.filenames.forEach(function(filename) {
      var section;
      var body = '';
      var path = filename.split('/');
      var isExtensionChange = path[0] == 'extensions';
      var isBuiltinChange = path[0] == 'builtins';
      var isAdsChange = path[0] == 'ads';
      // TODO: figure out how to break down validator changes since
      // it is usually a big PR with a number of commits, and the commit
      // message is what is useful for a changelog.
      var isValidatorChange = path[0] == 'validator';

      if (isExtensionChange) {
        section = path[1];
      } else if (isBuiltinChange && isJs(path[1])) {
        // builtins files dont have a nested per component folder.
        section = path[1].replace(/\.js$/, '');
      } else if (isAdsChange && isJs(path[1])) {
        section = 'ads';
      } else if (isValidatorChange) {
        section = 'validator';
      }

      if (section) {
        if (!sections[section]) {
          sections[section] = [];
        }
        // if its the validator section, read the body of the PR
        // and format it correctly under the bullet list.
        if (section == 'validator') {
          body = `\n    ${pr.body.split('\n').join('\n    ')}`;
        }
        sections[section].push(listItem + body);
      }
    });
  });
  return sections;
}

/**
 * Get the latest git tag from either a normal release or from a canary release.
 * @return {!Promise<string>}
 */
function getLastGitTag() {
  var options = {
    args: `describe --abbrev=0 --first-parent --tags ${branch}`
  };
  return gitExec(options).then(function(tag) {
    return tag.trim();
  });
}

/**
 * @param {string} tag
 * @return {!Promise<string>}
 */
function getGitLog(tag) {
  var options = {
    args: 'log ' + branch + '...' + tag +
        ' --pretty=format:%s --merges --first-parent'
  };
  return gitExec(options).then(function(log) {
    if (!log) {
      throw new Error('No log found "git log ' + branch +
          '...' + tag + '".\nIs it possible that there is no delta?\n' +
          'Make sure to fetch and rebase (or reset --hard) the latest ' +
          'from remote upstream.');
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

    return getPullRequestMetadata(prOption).then(function(title) {
      var filesOption = extend({}, prOption);
      filesOption.url += '/files';
      return getPullRequestFiles(title, filesOption);
    });
  });

  return BBPromise/*OK*/.all(requests);
}

function getPullRequestMetadata(prOption) {
  return request(prOption).then(function(res) {
    var body = JSON.parse(res.body);
    assert(typeof body.url == 'string', 'should have url string. ' + res.body);
    var url = body.url.split('/');
    var pr = url[url.length - 1];
    return {
      title: body.title + ' (#' + pr + ')',
      body: body.body
    };
  });
}

function getPullRequestFiles(prMetadata, filesOption) {
  return request(filesOption).then(function(res) {
    var body = JSON.parse(res.body);

    assert(Array.isArray(body) && body.length > 0,
        'Pull request response must not be empty. ' + res.body);
    var filenames = body.map(function(file) {
      return file.filename;
    });

    return {
      body: prMetadata.body,
      title: prMetadata.title,
      filenames: filenames
    };
  });
}

function onGitTagSuccess(gitMetadata, tag) {
  if (!tag) {
    throw new Error('Could not find latest ' + branch + ' tag.');
  }

  gitMetadata.tag = tag;
  util.log(util.colors.green('Current latest tag: ' + tag));
  return tag;
}

function onGitLogSuccess(gitMetadata, logs) {
  var commits = logs.split('\n');
  assert(typeof logs == 'string', 'git log should be a string.\n' + logs);
  return commits
    .filter(function(commit) {
      // Filter non Pull request merges.
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
  throw err;
}

/**
 * Checks if string ends with ".js"
 * @param {string} str
 * @return {boolean}
 */
function isJs(str) {
  return str./*OK*/endsWith('.js');
}

gulp.task('changelog', 'Create github release draft', changelog, {
  options: {
    dryrun: '  Generate changelog but dont push it out',
    type: '  Pass in "canary" to generate a canary changelog',
    version: '  The git tag and github release label',
  }
});
