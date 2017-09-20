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
const argv = require('minimist')(process.argv.slice(2));
const assert = require('assert');
const child_process = require('child_process');
const extend = require('util')._extend;
const git = require('gulp-git');
const gulp = require('gulp-help')(require('gulp'));
const request = BBPromise.promisify(require('request'));
const util = require('gulp-util');

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const exec = BBPromise.promisify(child_process.exec);
const gitExec = BBPromise.promisify(git.exec);

const verbose = (argv.verbose || argv.v);
const isDryrun = argv.dryrun;

const issuesOptions = {
  url: 'https://api.github.com/repos/ampproject/amphtml/issues',
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json',
  },
  qs: {
    access_token: GITHUB_ACCESS_TOKEN,
  },
};

const milestoneOptions = {
  url: 'https://api.github.com/repos/ampproject/amphtml/milestones',
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json',
  },
  qs: {
    access_token: GITHUB_ACCESS_TOKEN,
  },
};

// 4 is the number for Milestone 'Backlog Bugs'
const MILESTONE_BACKLOG_BUGS = 4;
// By default we will assign 'Pending Triage' milestone, number 20
const MILESTONE_PENDING_TRIAGE = 20;
// 23 is the number for Milestone 'New FRs'
const MILESTONE_NEW_FRS = 23;
// 12 is the number for Milestone 'Docs Updates'
const MILESTONE_DOCS_UPDATES = 12;

// We start processing the issues by checking token first
function processIssues() {
  if (!GITHUB_ACCESS_TOKEN) {
    util.log(util.colors.red('You have not set the ' +
        'GITHUB_ACCESS_TOKEN env var.'));
    util.log(util.colors.green('See https://help.github.com/articles/' +
        'creating-an-access-token-for-command-line-use/ ' +
        'for instructions on how to create a github access token. We only ' +
        'need `public_repo` scope.'));
    return;
  }
  return updateGitHubIssues().then(function() {
    util.log(util.colors.blue('automation applied'));
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
    state: 'open',
    page: opt_page,
    per_page: 100,
    access_token: GITHUB_ACCESS_TOKEN,
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
  let promise = Promise.resolve();
  return BBPromise.all([
    getIssues(1),
    getIssues(2),
    getIssues(3),
    getIssues(4),
    getIssues(5),
  ])
      .then(requests => [].concat.apply([], requests))
      .then(issues => {
        const allIssues = issues;
        allIssues.forEach(function(issue) {
          const labels = issue.labels;
          let issueType;
          const milestone = issue.milestone;
          let milestoneTitle;
          let milestoneState;
          let hasPriority = false;
          let issueNewMilestone = MILESTONE_PENDING_TRIAGE;

          // Get the title and state of the milestone
          if (milestone) {
            milestoneTitle = milestone.title;
            milestoneState = milestone.state;
          }
          // Get the labels we want to check
          labels.forEach(function(label) {
            if (label) {
              // Check if the issues has type
              if (label.name.startsWith('Type') ||
             label.name.startsWith('Related')) {
                issueType = label.name;
              }
              // Check if the issues has Priority
              if (label.name.startsWith('P0') ||
                  label.name.startsWith('P1') ||
                  label.name.startsWith('P2') ||
                  label.name.startsWith('P3')) {
                hasPriority = true;
              }
            }
          });
          promise = promise.then(function() {
            util.log('Update ' + issue.number);
            const updates = [];
            // Milestone task: move issue from closed milestone
            if (milestone) {
              if (milestoneTitle.startsWith('Sprint') &&
             milestoneState === 'closed') {
                issueNewMilestone = MILESTONE_BACKLOG_BUGS;
                updates.push(applyMilestone(issue, issueNewMilestone));
              }
            }
            // if issueType is not null, add correct milestones
            if (issueType != null) {
              if (milestoneTitle === 'Pending Triage' || milestone == null) {
                if (issueType === 'Type: Feature Request') {
                  issueNewMilestone = MILESTONE_NEW_FRS;
                  updates.push(applyMilestone(issue, issueNewMilestone));
                } else if (issueType === 'Related to: Documentation' ||
                    issueType === 'Type: Design Review' ||
                    issueType === 'Type: Weekly Status') {
                  issueNewMilestone = MILESTONE_DOCS_UPDATES;
                  updates.push(applyMilestone(issue, issueNewMilestone));
                } else if (issueType === 'Type: Bug' ||
                    issueType === 'Related to: Flaky Tests') {
                  issueNewMilestone = MILESTONE_BACKLOG_BUGS;
                  updates.push(applyMilestone(issue, issueNewMilestone));
                } else if (milestone == null) {
                  updates.push(applyMilestone(issue, issueNewMilestone));
                }
              }
            } else if (milestone == null) {
              updates.push(applyMilestone(issue, issueNewMilestone));
            } else if (milestoneTitle === 'Prioritized FRs' ||
                milestoneTitle === 'New FRs') {
              updates.push(applyLabel(issue, 'Type: Feature Request'));
            } else if (milestoneTitle === 'Backlog Bugs' ||
                milestoneTitle.startsWith('Sprint')) {
              updates.push(applyLabel(issue, 'Type: Bug'));
            }
            // Apply default priority if no priority
            if (hasPriority == false && milestoneTitle != 'New FRs' &&
                milestoneTitle !== '3P Implementation' &&
                milestoneTitle !== 'Pending Triage' && milestone != null) {
              updates.push(applyLabel(issue, 'P2: Soon'));
            }
            if (isDryrun) {
              util.log('Performing a dry run. ' +
                  'These are the updates that would have been applied:');
              updates.forEach(function(update) {
                util.log(util.inspect(update, {depth: null}));
              });
              return Promise.resolve();
            }
            return Promise.all(updates);
          });
        });
        return issues;
      });
}

/**
 * @param {string} issue
 * @param {number} milestoneNumber
 * @return {!Promise<*>}
 */
function applyMilestone(issue, milestoneNumber) {
  const options = extend({}, milestoneOptions);
  options.qs = {
    state: 'open',
    per_page: 100,
    access_token: GITHUB_ACCESS_TOKEN,
  };

  issue.milestone = milestoneNumber;
  return createGithubRequest(
      '/issues/' + issue.number,
      'PATCH',
      issue.milestone, 'milestone').then(function() {
        if (verbose) {
          util.log(util.colors.green(
              'Milestone applied ' + milestone + ' for #' + issue.number));
        }
      });
}

/**
 * @param {string} issue
 * @param {string} label
 * @return {!Promise<*>}
 */
function applyLabel(issue, label) {
  const options = extend({}, milestoneOptions);
  options.qs = {
    state: 'open',
    per_page: 100,
    access_token: GITHUB_ACCESS_TOKEN,
  };
  return createGithubRequest(
      '/issues/' + issue.number + '/labels',
      'POST',
      [label], 'label').then(function() {
        if (verbose) {
          util.log(util.colors.green(
              'Label applied ' + label + ' for #' + issue.number));
        }
      });
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
  const options = {
    url: 'https://api.github.com/repos/ampproject/amphtml' + path,
    body: {},
    headers: {
      'User-Agent': 'amp-changelog-gulp-task',
      'Accept': 'application/vnd.github.v3+json',
    },
    qs: {
      access_token: GITHUB_ACCESS_TOKEN,
    },
  };
  if (opt_method) {
    options.method = opt_method;
  }
  if (opt_data) {
    options.json = true;
    if (typeRequest === 'milestone') {
      options.body.milestone = opt_data;
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
