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
const log = require('fancy-log');
const request = BBPromise.promisify(require('request'));

const {GITHUB_ACCESS_TOKEN} = process.env;

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
// days for biweekly updates
const BIWEEKLY_DAYS = 14;
// days for quarterly updates
const QUARTERLY_DAYS = 89;
// we need around 14 batches to get more than 1k issues
const NUM_BATCHES = 14;

// We start processing the issues by checking token first
function processGithubIssues() {
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
  let promise = Promise.resolve();
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
          const {
            labels,
            milestone,
            assignee,
            'pull_request': pullRequest,
            'updated_at': issueLastUpdate,
          } = issue;
          let issueType;
          let milestoneTitle;
          let milestoneState;
          let hasPriority = false;
          let hasCategory = false;
          let issueNewMilestone = MILESTONE_PENDING_TRIAGE;
          let assigneeName = '';
          let biweeklyUpdate = true;
          let quartelyUpdate = true;
          // if an issue is a pull request, we'll skip it
          if (pullRequest) {
            if (isDryrun) {
              log(colors.red(issue.number + ' is a pull request'));
            }
            return;
          }
          if (getLastUpdate(issueLastUpdate) > QUARTERLY_DAYS) {
            quartelyUpdate = false;
            biweeklyUpdate = false;
          } else if (getLastUpdate(issueLastUpdate) > BIWEEKLY_DAYS) {
            biweeklyUpdate = false;
          }
          // Get the assignee
          if (assignee) {
            assigneeName = '@' + assignee.login;
          }
          // Get the title and state of the milestone
          if (milestone) {
            milestoneTitle = milestone.title;
            milestoneState = milestone.state;
            issueNewMilestone = milestone.number;
          }
          // promise starts
          promise = promise.then(function() {
            log('Update ' + issue.number);
            const updates = [];
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
                  if (label.name.startsWith('P0') ||
                      label.name.startsWith('P1')) {
                    if (biweeklyUpdate == false) {
                      biweeklyUpdate = true;
                      updates.push(applyComment(issue, 'This is a high priority'
                          + ' issue but it hasn\'t been updated in awhile. ' +
                          assigneeName + ' Do you have any updates?'));
                    }
                  } else if (label.name.startsWith('P2') &&
                      quartelyUpdate == false) {
                    quartelyUpdate = true;
                    updates.push(applyComment(issue, 'This issue hasn\'t been '
                        + ' updated in awhile. ' +
                    assigneeName + ' Do you have any updates?'));
                  }
                }
                if (label.name.startsWith('Category') ||
                    label.name.startsWith('Related to') ||
                    label.name.startsWith('GFI') ||
                    label.name.startsWith('good first issue')) {
                  hasCategory = true;
                }
              }
            });
            // Milestone task: move issues from closed milestone
            if (milestone) {
              if (milestoneState === 'closed') {
                issueNewMilestone = MILESTONE_BACKLOG_BUGS;
                updates.push(applyMilestone(issue, issueNewMilestone));
              }
            }
            if (issueNewMilestone === MILESTONE_PENDING_TRIAGE) {
              if (quartelyUpdate == false) {
                quartelyUpdate = true;
                updates.push(applyComment(issue, 'This issue seems to be in ' +
                    ' Pending Triage for awhile. ' +
                    assigneeName + ' Please triage this to ' +
                    'an appropriate milestone.'));
              }
            }
            // if issueType is not null, add correct milestones
            if (issueType != null) {
              if (issueNewMilestone === MILESTONE_PENDING_TRIAGE ||
                  milestone == null) {
                if (issueType === 'Type: Feature Request') {
                  issueNewMilestone = MILESTONE_NEW_FRS;
                  updates.push(applyMilestone(issue, issueNewMilestone));
                } else if (issueType === 'Related to: Documentation' ||
                    issueType === 'Type: Design Review' ||
                    issueType === 'Type: Status Update') {
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
            } else if (issueNewMilestone === MILESTONE_PRIORITIZED_FRS ||
                issueNewMilestone === MILESTONE_NEW_FRS) {
              updates.push(applyLabel(issue, 'Type: Feature Request'));
            } else if (issueNewMilestone === MILESTONE_BACKLOG_BUGS ||
                milestoneTitle.startsWith('Sprint')) {
              updates.push(applyLabel(issue, 'Type: Bug'));
            }
            // Apply default priority if no priority
            if (hasPriority == false &&
                issueNewMilestone != MILESTONE_NEW_FRS &&
                issueNewMilestone !== MILESTONE_3P_IMPLEMENTATION &&
                issueNewMilestone !== MILESTONE_PENDING_TRIAGE &&
                milestone != null) {
              updates.push(applyLabel(issue, 'P2: Soon'));
            }
            // Add comment with missing Category
            if (hasCategory == false) {
              if (issueNewMilestone === MILESTONE_PENDING_TRIAGE ||
                  issueNewMilestone === MILESTONE_DOCS_UPDATES ||
                  issueNewMilestone == null ||
                  issueNewMilestone === MILESTONE_GREAT_ISSUES) {
                if (isDryrun) {
                  log(colors.green('No comment needed '
                      + ' for #' + issue.number));
                }
              } else {
                updates.push(applyComment(issue,
                    'This issue doesn\'t have a category'
                    + ' which makes it harder for us to keep track of it. ' +
                    assigneeName + ' Please add an appropriate category.'));
              }
            }
            return Promise.all(updates);
          });
        });
        return promise;
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
    'state': 'open',
    'per_page': 100,
    'access_token': GITHUB_ACCESS_TOKEN,
  };

  issue.milestone = milestoneNumber;
  if (isDryrun) {
    log(colors.green('Milestone applied ' + milestoneNumber +
        ' for #' + issue.number));
    return;
  } else {
    return createGithubRequest('/issues/' + issue.number,'PATCH',
        issue.milestone, 'milestone');
  }
}

/**
 * @param {string} issue
 * @param {string} label
 * @return {!Promise<*>}
 */
function applyLabel(issue, label) {
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

module.exports = {
  processGithubIssues,
};

processGithubIssues.description = 'Automatically updates the labels ' +
    'and milestones of all open issues at github.com/ampproject/amphtml.';
processGithubIssues.flags = {
  dryrun: '  Generate process but don\'t push it out',
};
