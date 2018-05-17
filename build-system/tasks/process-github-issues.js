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
const assert = require('assert');
const BBPromise = require('bluebird');
const colors = require('ansi-colors');
const extend = require('util')._extend;
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const request = BBPromise.promisify(require('request'));

const GITHUB_ACCESS_TOKEN = '';

const isDryrun = argv.dryrun;

const issuesOptions = {
  url: 'https://api.github.com/repos/ampproject/amphtml/issues',
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json',
  },
  qs: {
    'access_token': GITHUB_ACCESS_TOKEN,
  },
};

const milestoneOptions = {
  url: 'https://api.github.com/repos/ampproject/amphtml/milestones',
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json',
  },
  qs: {
    'access_token': GITHUB_ACCESS_TOKEN,
  },
};

// 4 is the number for Milestone 'Backlog Bugs'
const MILESTONE_BACKLOG_BUGS = 4;
// 11 is the number for Milestone '3P Implementation'
const MILESTONE_3P_IMPLEMENTATION = 11;
// 12 is the number for Milestone 'Docs Updates'
const MILESTONE_DOCS_UPDATES = 12;
// By default we will assign 'Pending Triage' milestone, number 20
const MILESTONE_PENDING_TRIAGE = 20;
// 22 is the number for Milestone 'Prioritized FRs'
const MILESTONE_PRIORITIZED_FRS = 22;
// 23 is the number for Milestone 'New FRs'
const MILESTONE_NEW_FRS = 23;
// 25 is the number for Milestone 'Good First Issues (GFI)'
const MILESTONE_GREAT_ISSUES = 25;
// we need around 14 batches to get more than 1k issues
const NUM_BATCHES = 2;


// We start processing the issues by checking token first
function processIssues() {
  if (!GITHUB_ACCESS_TOKEN) {
    log(colors.red('You have not set the ' +
        'GITHUB_ACCESS_TOKEN env var.'));
    log(colors.green('See https://help.github.com/articles/' +
        'creating-an-access-token-for-command-line-use/ ' +
        'for instructions on how to create a github access token. We only ' +
        'need `public_repo` scope.'));
    return;
  }
  return updateGitHubIssues().then(function() {
    log(colors.blue('automation applied'));
  });
}
/**
 * Fetches issues?page=${opt_page}
 *
 * @param {number=} opt_page
 * @return {!Promise<!Array<}
 */
function getIssues(opt_page) {
  const options = extend({}, issuesOptions);
  options.qs = {
    'state': 'open',
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
 * Function goes through all the gitHub issues,
 * gets all the Labels we are interested in,
 * depending if missing milestone or label,
 * tasks applied as per design go/ampgithubautomation
 */
function updateGitHubIssues() {
  const arrayPromises = [];
  // we need to pull issues in batches
  for (let batch = 1; batch < NUM_BATCHES; batch++) {
    arrayPromises.push(getIssues(batch));
  }
  return BBPromise.all(arrayPromises)
      .then(requests => [].concat.apply([], requests))
      .then(issues => {
        const allIssues = issues;
        allIssues.forEach(function(issue) {
          const pullRequest = issue.pull_request;
          log(colors.blue('is Pull Request'));
          log(colors.blue(issue.added_to_project));
          const assignee = issue.assignee;
          // if an issue is a pull request, we'll skip it
          if (pullRequest) {
            if (isDryrun) {
              log(colors.red(issue.number + ' is a pull request'));
            }
            const assignee = issue.assignee;
            if (assignee) {
              log(colors.red('assignee is ' + assignee.login));
            }

            return;
          }
          // Get the assignee
          // if (assignee) {
          //   assigneeName = '@' + assignee.login;
          // }
          // promise starts
        });
      });
}

/**
 * @param {string} issue
 * @param {string} label
 * @return {!Promise<*>}
 */
function applyLabel(issue, label) {
  return;
  const options = extend({}, issuesOptions);
  options.qs = {
    'state': 'open',
    'per_page': 100,
    'access_token': GITHUB_ACCESS_TOKEN,
  };
  if (isDryrun) {
    log(colors.green('Label applied ' +
        label + ' for #' + issue.number));
    return;
  } else {
    return createGithubRequest('/issues/' + issue.number + '/labels','POST',
        [label], 'label');
  }
}

/**
 * @param {string} issue
 * @param {string} label
 * @return {!Promise<*>}
 */
function applyProject(issue, label) {
  return;
  const options = extend({}, issuesOptions);
  options.qs = {
    'state': 'open',
    'per_page': 100,
    'access_token': GITHUB_ACCESS_TOKEN,
  };
  if (isDryrun) {
    log(colors.green('Label applied ' +
        label + ' for #' + issue.number));
    return;
  } else {
    return createGithubRequest('/issues/' + issue.number + '/labels','POST',
        [label], 'label');
  }
}

/**
 * @param {string} issue
 * @param {string} comment
 * @return {!Promise<*>}
 */
function applyComment(issue, comment) {
  return;
  const options = extend({}, issuesOptions);
  options.qs = {
    'state': 'open',
    'per_page': 100,
    'access_token': GITHUB_ACCESS_TOKEN,
  };
  // delay the comment request so we don't reach github rate limits requests
  const promise = new Promise(resolve => setTimeout(resolve, 120000));
  return promise.then(function() {
    if (isDryrun) {
      log(colors.blue('waited 2 minutes to avoid gh rate limits'));
      log(colors.green('Comment applied after ' +
          'waiting 2 minutes to avoid github rate limits: ' + comment +
          ' for #' + issue.number));
      return;
    } else {
      createGithubRequest('/issues/' + issue.number + '/comments','POST',
          comment, 'comment');
    }
  });
}
// calculate number of days since the latest update
function getLastUpdate(issueLastUpdate) {
  const t = new Date();
  const splits = issueLastUpdate.split('-', 3);
  const exactDay = splits[2].split('T', 1);
  const firstDate = Date.UTC(splits[0],splits[1],exactDay[0]);
  const secondDate = Date.UTC(t.getFullYear(),t.getMonth() + 1,t.getDate());
  const diff = Math.abs((firstDate.valueOf() -
      secondDate.valueOf()) / (24 * 60 * 60 * 1000));
  return diff;
}

/**
 * Function pushes the updates requested based on the path received
 * @param {string} path
 * @param {string=} opt_method
 * @param {*} opt_data
 * @param {string} typeRequest
 * @return {!Promise<*>}
 */
function createGithubRequest(path, opt_method, opt_data, typeRequest) {
  return;
  const options = {
    url: 'https://api.github.com/repos/ampproject/amphtml' + path,
    body: {},
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
    if (typeRequest === 'milestone') {
      options.body.milestone = opt_data;
    } else if (typeRequest === 'comment') {
      options.body.body = opt_data;
    } else {
      options.body = opt_data;
    }
  }
  return request(options);
}

gulp.task(
    'process-github-issues',
    'Automatically updates the labels '
    + 'and milestones of all open issues at github.com/ampproject/amphtml.',
    processIssues,
    {
      options: {
        dryrun: '  Generate process but don\'t push it out',
      },
    }
);
