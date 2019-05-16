/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * This script auto triage pull requests from 3P.
 * It supports:
 * 1. Triaging and 3P ad service integration PR.
 */

'use strict';
const argv = require('minimist')(process.argv.slice(2));
const assert = require('assert');
const BBPromise = require('bluebird');
const colors = require('ansi-colors');
const extend = require('util')._extend;
const log = require('fancy-log');
const request = BBPromise.promisify(require('request'));

const {GITHUB_ACCESS_TOKEN} = process.env;

const isDryrun = argv.dryrun;

let reviewer = '';

const REGEX_3P_INTEGRATION = new RegExp('3p/integration.js');
const REGEX_3P_AD_JS = new RegExp('ads/[^/]+.js');
const REGEX_3P_AD_MD = new RegExp('ads/[^/]+.md');
const REGEX_3P_AD_CONFIG = new RegExp('ads/_config.js');
const REGEX_3P_AD_EXAMPLE = new RegExp('examples/ads.amp.html');
const REGEX_AD_MD = new RegExp('extensions/amp-ad/amp-ad.md');

const adIntegrationFileList = [
  REGEX_3P_INTEGRATION,
  REGEX_3P_AD_JS,
  REGEX_3P_AD_MD,
  REGEX_3P_AD_CONFIG,
  REGEX_3P_AD_EXAMPLE,
  REGEX_AD_MD,
];

const internalContributors = [
  // Feel free to add your name here
  // if you don't want your PR to be auto triaged.
  'bradfrizzell',
  'calebcordry',
  'glevitzky',
  'keithwrightbos',
  'lannka',
  'jasti',
  'rudygalfi',
  'zhouyx',
];

const reviewers = [
  // In rotation order
  'calebcordry',
  'zhouyx',
  'lannka',
];

const REF_DATE = new Date('May 13, 2018 00:00:00');
const WEEK_DIFF = 604800000;

const ANALYZE_OUTCOME = {
  AD: 1, // Ad integration PR, ping the ad onduty person
};

const AD_COMMENT =
  'Dear contributor! Thank you for the pull request. ' +
  'It looks like this PR is trying to add support to an ad network. \n \n' +
  'If this is your first time adding support for ' +
  'a new third-party ad service, please make sure your follow our ' +
  '[developer guideline](https://github.com/ampproject/amphtml/blob/master/' +
  'ads/README.md#developer-guidelines-for-a-pull-request). \n \n' +
  'If you have not implemented it, we also highly recommend implementing ' +
  'the [renderStart API](https://github.com/ampproject/amphtml/blob/master/' +
  'ads/README.md#available-apis) to provide better user experience. ' +
  'Please let us know if there is any question. \n \n';

const defaultOption = {
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json',
  },
  qs: {
    'access_token': GITHUB_ACCESS_TOKEN,
  },
};

// we need around 14 batches to get more than 1k issues
const NUM_BATCHES = 14;

/**
 * Calculate the reviewer this week, based on rotation calendar
 */
function calculateReviewer() {
  const now = Date.now();
  const diff = now - REF_DATE;
  const week = diff / WEEK_DIFF;
  const turn = Math.floor(week % 3);
  return reviewers[turn];
}

/**
 * Main function for auto triaging
 */
function process3pGithubPr() {
  if (!GITHUB_ACCESS_TOKEN) {
    log(colors.red('You have not set the ' + 'GITHUB_ACCESS_TOKEN env var.'));
    log(
      colors.green(
        'See https://help.github.com/articles/' +
          'creating-an-access-token-for-command-line-use/ ' +
          'for instructions on how to create a github access token. We only ' +
          'need `public_repo` scope.'
      )
    );
    return;
  }

  reviewer = calculateReviewer();

  const arrayPromises = [];
  // we need to pull issues in batches
  for (let batch = 1; batch < NUM_BATCHES; batch++) {
    arrayPromises.push(getIssues(batch));
  }
  return BBPromise.all(arrayPromises)
    .then(requests => [].concat.apply([], requests))
    .then(issues => {
      const allIssues = issues;
      const allTasks = [];
      allIssues.forEach(function(issue) {
        allTasks.push(handleIssue(issue));
      });
      return Promise.all(allTasks);
    })
    .then(() => {
      log(colors.blue('auto triaging succeed!'));
    });
}

function handleIssue(issue) {
  return isQualifiedPR(issue).then(outcome => {
    return replyToPR(issue, outcome);
  });
}

/**
 * Fetches issues?page=${opt_page}
 *
 * @param {number=} opt_page
 * @return {!Promise<!Array<}
 */
function getIssues(opt_page) {
  // We need to use the issue API because assignee is only available with it.
  const options = extend({}, defaultOption);
  options.url = 'https://api.github.com/repos/ampproject/amphtml/issues';
  options.qs = {
    'state': 'open',
    'assignee': 'none',
    'page': opt_page,
    'per_page': 100,
    'access_token': GITHUB_ACCESS_TOKEN,
  };
  return request(options).then(res => {
    const issues = JSON.parse(res.body);
    assert(Array.isArray(issues), 'issues must be an array.');
    return issues;
  });
}

/**
 * API call to get all changed files of a pull request.
 * @param {!Object} pr
 */
function getPullRequestFiles(pr) {
  const options = extend({}, defaultOption);
  const {number} = pr;
  options.url =
    'https://api.github.com/repos/ampproject/amphtml/pulls/' +
    `${number}/files`;
  return request(options).then(res => {
    const files = JSON.parse(res.body);
    if (!Array.isArray(files)) {
      return null;
    }
    return files;
  });
}

/**
 * Determine the type of a give pull request
 * @param {?Array<!Object>} files
 */
function analyzeChangedFiles(files) {
  if (!files) {
    return;
  }
  // Only support 3p ads integration files
  const fileCount = files.length;
  if (fileCount == 0) {
    return null;
  }
  let matchFileCount = 0;
  for (let i = 0; i < fileCount; i++) {
    const fileName = files[i].filename;
    for (let j = 0; j < adIntegrationFileList.length; j++) {
      const regex = adIntegrationFileList[j];
      if (regex.test(fileName)) {
        matchFileCount++;
        continue;
      }
    }
  }
  const percentage = matchFileCount / fileCount;
  if (percentage > 0.75 || matchFileCount >= 3) {
    // Still need to check the matchFileCount because of incorrect rebase.
    return ANALYZE_OUTCOME.AD;
  }
  return null;
}

/**
 * Determine if we need to reply to an issue
 * @param {!Object} issue
 */
function isQualifiedPR(issue) {
  // All issues are opened has no assignee
  if (!issue.pull_request) {
    // Is not a pull request
    return Promise.resolve(null);
  }

  const author = issue.user.login;
  if (internalContributors.indexOf(author) > -1) {
    // If it is a pull request from internal contributor
    return Promise.resolve(null);
  }
  // get pull request reviewer API is not working as expected. Skip

  // Get changed files of this PR
  return getPullRequestFiles(issue).then(files => {
    return analyzeChangedFiles(files);
  });
}

/**
 * Auto reply
 * @param {!Object} pr
 * @param {ANALYZE_OUTCOME} outcome
 */
function replyToPR(pr, outcome) {
  let promise = Promise.resolve();
  if (outcome == ANALYZE_OUTCOME.AD) {
    promise = promise
      .then(() => {
        // We should be good with rate limit given the number of
        // 3p integration PRs today.
        const comment = AD_COMMENT + `Thank you! Ping @${reviewer} for review`;
        return applyComment(pr, comment);
      })
      .then(() => {
        return assignIssue(pr, [reviewer]);
      });
  }
  return promise;
}

/**
 * API call to comment on a give issue.
 * @param {!Object} issue
 * @param {string} comment
 */
function applyComment(issue, comment) {
  const {number} = issue;
  const options = extend(
    {
      url:
        'https://api.github.com/repos/ampproject/amphtml/issues/' +
        `${number}/comments`,
      method: 'POST',
      body: JSON.stringify({
        'body': comment,
      }),
    },
    defaultOption
  );
  if (isDryrun) {
    log(
      colors.blue(`apply comment to PR #${number}, ` + `comment is ${comment}`)
    );
    return Promise.resolve();
  }
  return request(options);
}

/**
 * API call to assign an issue with a list of assignees
 * @param {!Object} issue
 * @param {!Array<string>} assignees
 */
function assignIssue(issue, assignees) {
  const {number} = issue;
  const options = extend(
    {
      url:
        'https://api.github.com/repos/ampproject/amphtml/issues/' +
        `${number}/assignees`,
      method: 'POST',
      body: JSON.stringify({
        'assignees': assignees,
      }),
    },
    defaultOption
  );
  if (isDryrun) {
    log(colors.blue(`assign PR #${number}, ` + `to ${assignees}`));
    return Promise.resolve();
  }
  return request(options);
}

process3pGithubPr.description = 'Automatically triage 3P integration PRs';
process3pGithubPr.flags = {
  dryrun: "  Generate process but don't push it out",
};
