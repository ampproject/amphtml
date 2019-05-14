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
'use strict';

/**
 * @fileoverview Creates a gulp task that fetches the titles and files
 * of pull requests using the github API, from `branch` up to the last git tag.
 * Only includes pull requests that have code changes and not only markdown,
 * json, and yaml changes.
 */

const argv = require('minimist')(process.argv.slice(2));
const assert = require('assert');
const BBPromise = require('bluebird');
const childProcess = require('child_process');
const colors = require('ansi-colors');
const config = require('../config');
const extend = require('util')._extend;
const git = require('gulp-git');
const log = require('fancy-log');
const request = BBPromise.promisify(require('request'));

const {GITHUB_ACCESS_TOKEN} = process.env;
const exec = BBPromise.promisify(childProcess.exec);
const gitExec = BBPromise.promisify(git.exec);

const {branch: overrideBranch, dryrun: isDryrun} = argv;

const pullOptions = {
  url: 'https://api.github.com/repos/ampproject/amphtml/pulls',
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json',
  },
};
const latestReleaseOptions = {
  url: 'https://api.github.com/repos/ampproject/amphtml/releases/latest',
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json',
  },
};

if (GITHUB_ACCESS_TOKEN) {
  pullOptions.qs = {
    'access_token': GITHUB_ACCESS_TOKEN,
  };
}

if (GITHUB_ACCESS_TOKEN) {
  latestReleaseOptions.qs = {
    'access_token': GITHUB_ACCESS_TOKEN,
  };
}

/**
 * @typedef {{
 *  logs: !Array<!LogMetadataDef>,
 *  tag: (string|undefined),
 *  changelog: (string|undefined),
 *  baseTag: (string|undefined),
 *  branch: (string|undefined)
 * }}
 */
let GitMetadataDef;

/**
 * @typedef {{
 *   title: string,
 *   sha: string,
 *   pr: (PrMetadata|undefined)
 * }}
 */
let LogMetadataDef;

/**
 * @typedef {{
 *   id: number,
 *   title: string,
 *   body: string,
 *   merge_commit_sha: string,
 *   url: string,
 *   filenames: !Array<string>
 * }}
 */
let PrMetadataDef;

async function changelog() {
  if (!GITHUB_ACCESS_TOKEN) {
    log(colors.red('Warning! You have not set the ' +
        'GITHUB_ACCESS_TOKEN env var. Aborting "changelog" task.'));
    log(colors.green('See https://help.github.com/articles/' +
        'creating-an-access-token-for-command-line-use/ ' +
        'for instructions on how to create a github access token. We only ' +
        'need `public_repo` scope.'));
    return;
  }

  return getGitMetadata();
}

/**
 * @return {!Promise}
 */
function getGitMetadata() {
  if (!argv.tag) {
    throw new Error('no tag value passed in. See --tag flag option.');
  }

  const gitMetadata = {
    logs: [],
    tag: undefined,
    baseTag: undefined,
    branch: undefined,
  };
  return getLastProdReleasedGitTag(gitMetadata)
      .then(getCurrentBranchName)
      .then(getGitLog)
      .then(getGithubPullRequestsMetadata)
      .then(getGithubFilesMetadata)
      .then(getLastGitTag)
      .then(buildChangelog)
      .then(function(gitMetadata) {
        log(colors.blue('\n' + gitMetadata.changelog));
        if (isDryrun) {
          return;
        }
        return getCurrentSha().then(
            submitReleaseNotes.bind(null, argv.tag, gitMetadata.changelog)
        );
      })
      .catch(errHandler);
}


/**
 * Get the last git tag this current HEAD bases off of from.
 *
 * @param {!GitMetadataDef} gitMetadata
 * @return {!GitMetadataDef}
 */
function getLastGitTag(gitMetadata) {
  const command = 'git describe --tags --abbrev=0';

  return exec(command).then(lastTag => {
    gitMetadata.baseTag = lastTag.trim();
    return gitMetadata;
  });
}

/**
 * Get the current working branch name.
 *
 * @param {!GitMetadataDef} gitMetadata
 * @return {!GitMetadataDef}
 */
function getCurrentBranchName(gitMetadata) {
  if (overrideBranch) {
    gitMetadata.branch = overrideBranch;
    return gitMetadata;
  }
  const command = 'git rev-parse --abbrev-ref HEAD';

  return exec(command).then(branchName => {
    gitMetadata.branch = branchName.trim();
    return gitMetadata;
  });
}

/**
 * @param {string} version
 * @param {string} changelog
 * @param {string} sha
 * @return {!Promise}
 */
function submitReleaseNotes(version, changelog, sha) {
  const name = String(version);
  const options = {
    url: 'https://api.github.com/repos/ampproject/amphtml/releases',
    method: 'POST',
    headers: {
      'User-Agent': 'amp-changelog-gulp-task',
      'Accept': 'application/vnd.github.v3+json',
    },
    json: true,
    body: {
      'tag_name': name,
      'target_commitish': sha,
      'name': name,
      'body': changelog,
      'draft': true,
      'prerelease': true,
    },
  };

  if (GITHUB_ACCESS_TOKEN) {
    options.qs = {
      'access_token': GITHUB_ACCESS_TOKEN,
    };
  }

  return request(options).then(function() {
    log(colors.green('Release Notes submitted'));
  });
}

/**
 * @return {!Promise<string>}
 */
function getCurrentSha() {
  return gitExec({args: 'rev-parse HEAD'}).then(function(sha) {
    return sha.trim();
  });
}

/**
 * @param {!GitMetadataDef} gitMetadata
 * @return {!GitMetadataDef}
 */
function buildChangelog(gitMetadata) {
  let changelog = `## Version: ${argv.tag}\n\n`;

  if (gitMetadata.baseTag) {
    changelog += `## Baseline: [${gitMetadata.baseTag}]` +
        '(https://github.com/ampproject/amphtml/releases/' +
        `tag/${gitMetadata.baseTag})\n\n`;
  }

  // Append all titles
  changelog += gitMetadata.logs.filter(function(log) {
    const {pr} = log;
    if (!pr) {
      return true;
    }
    // Ignore PRs that are just all docs changes.
    return !pr.filenames.every(function(filename) {
      return config.changelogIgnoreFileTypes.test(filename);
    });
  }).map(function(log) {
    const {pr} = log;
    if (!pr) {
      return '  - ' + log.title;
    }
    return `  - ${pr.title.trim()} (#${pr.id})`;
  }).join('\n');
  changelog += '\n\n## Breakdown by component\n\n';
  const sections = buildSections(gitMetadata);

  Object.keys(sections).sort().forEach(function(section) {
    changelog += `<details>\n<summary>${section}</summary>\n`;
    const uniqueItems = sections[section].filter(function(title, idx) {
      return sections[section].indexOf(title) == idx;
    });
    changelog += uniqueItems.join('');
    changelog += '</details>\n';
  });

  gitMetadata.changelog = changelog;
  return gitMetadata;
}

/**
 * @param {!GitMetadata} gitMetadata
 * @return {!Object<string, string>}
 */
function buildSections(gitMetadata) {
  const sections = {};
  gitMetadata.logs.forEach(function(log) {
    const {pr} = log;
    if (!pr) {
      return;
    }
    const hasNonDocChange = !pr.filenames.every(function(filename) {
      return config.changelogIgnoreFileTypes.test(filename);
    });
    const listItem = `${pr.title.trim()} (#${pr.id})\n`;
    if (hasNonDocChange) {
      changelog += listItem;
    }

    pr.filenames.forEach(function(filename) {
      let section;
      let body = '';
      const path = filename.split('/');
      const isExtensionChange = path[0] == 'extensions';
      const isBuiltinChange = path[0] == 'builtins';
      const isAdsChange = path[0] == 'ads';
      // TODO: figure out how to break down validator changes since
      // it is usually a big PR with a number of commits, and the commit
      // message is what is useful for a changelog.
      const isValidatorChange = path[0] == 'validator';

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
          body = `${pr.body}\n`;
        }
        sections[section].push(listItem + body);
      }
    });
  });
  return sections;
}

/**
 * Get the latest git tag from either a normal release or from a canary release.
 * @param {!GitMetadataDef} gitMetadata
 * @return {!Promise<GitMetadataDef>}
 */
function getLastProdReleasedGitTag(gitMetadata) {
  return request(latestReleaseOptions).then(res => {
    const body = JSON.parse(res.body);
    if (!body.tag_name) {
      throw new Error('getLastProdReleasedGitTag: ' + body.message);
    }
    gitMetadata.tag = body.tag_name;
    return gitMetadata;
  });
}

/**
 * Runs `git log ${branch}...{tag} --pretty=oneline --first-parent`
 * @param {!GitMetadataDef} gitMetadata
 * @return {!Promise<GitMetadataDef>}
 */
function getGitLog(gitMetadata) {
  const args = `log ${gitMetadata.branch}...${gitMetadata.tag} ` +
      '--pretty=oneline --first-parent';
  const options = {args};
  return gitExec(options).then(function(logs) {
    if (!logs) {
      throw new Error('No logs found "git log ' + gitMetadata.branch + '...' +
          gitMetadata.tag + '".\nIs it possible that there is no delta?\n' +
          'Make sure to fetch and rebase (or reset --hard) the latest ' +
          'from remote upstream.');
    }
    const commits = logs.split('\n').filter(log => !!log.length);
    gitMetadata.logs = commits.map(log => {
      const words = log.split(' ');
      return {sha: words.shift(), title: words.join(' ')};
    });
    return gitMetadata;
  });
}

/**
 * @param {!GitMetadataDef} gitMetadata
 * @return {!Promise<!GitMetadataDef>}
 */
function getGithubPullRequestsMetadata(gitMetadata) {
  // (erwinm): Github seems to only return data for the first 3 pages
  // from my manual testing.
  return BBPromise.all([
    getClosedPullRequests(1),
    getClosedPullRequests(2),
    getClosedPullRequests(3),
  ])
      .then(requests => [].concat.apply([], requests))
      .then(prs => {
        gitMetadata.prs = prs;
        const githubPrRequest = gitMetadata.logs.map(log => {
          const pr = prs.filter(pr => pr.merge_commit_sha == log.sha)[0];
          if (pr) {
            log.pr = buildPrMetadata(pr);
          } else if (isPrIdInTitle(log.title)) {
            const id = getPrIdFromCommit(log.title);
            const prOptions = extend({}, pullOptions);
            prOptions.url += `/${id}`;
            const fileOptions = extend({}, prOptions);
            fileOptions.url += '/files';
            // If we couldn't find the matching pull request from 3 pages
            // of closed pull request try and fetch it through the id
            // if we can retrieve it from the commit message (only available
            // through github merge).
            return getPullRequest(prOptions, log);
          }
          return BBPromise.resolve();
        });
        return BBPromise.all(githubPrRequest).then(() => {
          return gitMetadata;
        });
      });
}

/**
 * We either fetch the pulls/${id}/files but if we have no PrMetadata yet,
 * we will try and also fetch pulls/${id} first before fetching
 * pulls/${id}/files.
 *
 * @param {!GitMetadataDef} gitMetadata
 * @return {!Promise<!GitMetadataDef>}
 */
function getGithubFilesMetadata(gitMetadata) {
  const githubFileRequests = gitMetadata.logs.map(log => {
    if (log.pr) {
      const fileOptions = extend({}, pullOptions);
      fileOptions.url = `${log.pr.url}/files`;
      return getPullRequestFiles(fileOptions, log.pr);
    }
    return BBPromise.resolve();
  });
  return BBPromise.all(githubFileRequests).then(() => {
    return gitMetadata;
  });
}

/**
 * Fetches pulls?page=${opt_page}
 *
 * @param {number=} opt_page
 * @return {!Promise<!Array<!PrMetadataDef>}
 */
function getClosedPullRequests(opt_page) {
  opt_page = opt_page || 1;
  const options = extend({}, pullOptions);
  options.qs = {
    state: 'closed',
    page: opt_page,
    'access_token': GITHUB_ACCESS_TOKEN,
  };
  return request(options).then(res => {
    const prs = JSON.parse(res.body);
    assert(Array.isArray(prs), 'prs must be an array.');
    return prs;
  });
}

/**
 * @param {Object<string, string>} prOption
 * @param {!LogMetadataDef} log
 * @return {!Promise<PrMetadataDef>}
 */
function getPullRequest(prOption, log) {
  return request(prOption).then(function(res) {
    const pr = JSON.parse(res.body);
    assert(typeof pr === 'object', 'Pull Requests Metadata must be an object');
    log.pr = buildPrMetadata(pr);
    return log.pr;
  });
}

/**
 * @param {!Object<string, string>} filesOption
 * @param {!PrMetadataDef} pr
 * @return {!Promise<PrMetadataDef>}
 */
function getPullRequestFiles(filesOption, pr) {
  return request(filesOption).then(function(res) {
    const body = JSON.parse(res.body);

    assert(Array.isArray(body) && body.length > 0,
        'Pull request response must not be empty. ' + res.body);
    const filenames = body.map(function(file) {
      return file.filename;
    });

    pr.filenames = filenames;
    return pr;
  });
}

function errHandler(err) {
  let msg = err;
  if (err.message) {
    msg = err.message;
  }
  log(colors.red(msg));
}

/**
 * Check if the string starts with "Merge pull request #"
 * @param {string} str
 * @return {boolean}
 */
function isPrIdInTitle(str) {
  return str./* OK*/indexOf('Merge pull request #') == 0;
}

/**
 * @param {string} commit
 * @return {number}
 */
function getPrIdFromCommit(commit) {
  // We only need the PR id
  const id = commit.split(' ')[3].slice(1);
  const value = parseInt(id, 10);
  assert(value > 0, 'Should be an integer greater than 0. ' + value);
  return id;
}

/**
 * Checks if string ends with ".js"
 * @param {string} str
 * @return {boolean}
 */
function isJs(str) {
  return str./* OK*/endsWith('.js');
}


/**
 * @param {!JSONValue} pr
 * @return {!PrMetadata}
 */
function buildPrMetadata(pr) {
  return {
    'id': pr.number,
    'title': pr.title,
    'body': pr.body,
    'merge_commit_sha': pr.merge_commit_sha,
    'url': pr._links.self.href,
  };
}

async function changelogUpdate() {
  if (!GITHUB_ACCESS_TOKEN) {
    log(colors.red('Warning! You have not set the ' +
        'GITHUB_ACCESS_TOKEN env var. Aborting "changelog" task.'));
    log(colors.green('See https://help.github.com/articles/' +
        'creating-an-access-token-for-command-line-use/ ' +
        'for instructions on how to create a github access token. We only ' +
        'need `public_repo` scope.'));
    return;
  }
  if (!argv.message) {
    log(colors.red('--message flag must be set.'));
  }
  return update();
}

function update() {
  const url = 'https://api.github.com/repos/ampproject/amphtml/releases/tags/' +
      `${argv.tag}`;
  const tagsOptions = {
    url,
    method: 'GET',
    headers: {
      'User-Agent': 'amp-changelog-gulp-task',
      'Accept': 'application/vnd.github.v3+json',
    },
  };

  const releasesOptions = {
    url: 'https://api.github.com/repos/ampproject/amphtml/releases/',
    method: 'PATCH',
    body: {},
    json: true,
    headers: {
      'User-Agent': 'amp-changelog-gulp-task',
      'Accept': 'application/vnd.github.v3+json',
    },
  };

  if (GITHUB_ACCESS_TOKEN) {
    tagsOptions.qs = {
      'access_token': GITHUB_ACCESS_TOKEN,
    };
    releasesOptions.qs = {
      'access_token': GITHUB_ACCESS_TOKEN,
    };
  }

  return request(tagsOptions).then(res => {
    const release = JSON.parse(res.body);
    if (!release.body) {
      return;
    }
    const {id} = release;
    releasesOptions.url += id;
    if (argv.suffix) {
      releasesOptions.body.body = release.body + argv.message;
    } else {
      releasesOptions.body.body = argv.message + release.body;
    }
    return request(releasesOptions).then(() => {
      log(colors.green('Update Successful.'));
    })
        .catch(e => {
          log(colors.red('Update Failed. ' + e.message));
        });
  });
}

module.exports = {
  changelog,
  changelogUpdate,
};

changelog.description = 'Create github release draft';
changelog.flags = {
  dryrun: '  Generate changelog but dont push it out',
  type: '  Pass in "canary" to generate a canary changelog',
  tag: '  The git tag and github release label',
};

changelogUpdate.description = 'Update github release. Ex. prepend ' +
    'canary percentage changes to release';
changelogUpdate.flags = {
  dryrun: '  Generate changelog but dont push it out',
  tag: '  The git tag and github release label',
};
