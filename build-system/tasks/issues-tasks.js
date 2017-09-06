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

// Set token TODO
var GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
var exec = BBPromise.promisify(child_process.exec);
var gitExec = BBPromise.promisify(git.exec);

var isDryrun = argv.dryrun;
var verbose = (argv.verbose || argv.v);

const issuesopt = {
  // Url to repository TODO 
  url: 'https://api.github.com/repos/ampproject/amphtml/issues',
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json'
  },
};

const optionsMilestone = {
  // Url to repository TODO
  url: 'https://api.github.com/repos/ampproject/amphtml/milestones',
  headers: {
    'User-Agent': 'amp-changelog-gulp-task',
    'Accept': 'application/vnd.github.v3+json'
  },
};

if (GITHUB_ACCESS_TOKEN) {
  issuesopt.qs = {
    access_token: GITHUB_ACCESS_TOKEN
  }
  optionsMilestone.qs = {
    access_token: GITHUB_ACCESS_TOKEN
  }
}

function processissues() {
  if (!GITHUB_ACCESS_TOKEN) {
    util.log(util.colors.red('You have not set the ' +
        'GITHUB_ACCESS_TOKEN env var.'));
    util.log(util.colors.green('See https://help.github.com/articles/' +
        'creating-an-access-token-for-command-line-use/ ' +
        'for instructions on how to create a github access token. We only ' +
        'need `public_repo` scope.'));
    return;
  }

  return getGitMetadata();
}

function getGitMetadata() {
return getIssues()
.then(function() {
	util.log(util.colors.blue('automation applied'));
})
}
/**
 * Function goes through all the gitHub issues,
 * gets all the Labels we are interested in,
 * depending if missing milestone or label, 
 * tasks applied as per design go/ampgithubautomation
 */
function getIssues(){
  var promise = Promise.resolve();
  var options = extend({}, issuesopt);
  options.qs = {
    state: 'open',
    per_page: 1000,
    access_token: GITHUB_ACCESS_TOKEN,
  };
  return request(options).then(res => {
    const issues = JSON.parse(res.body);
    issues.forEach(function(issue) {
      var labels = issue.labels;
      var issueType;
      var milestone = issue.milestone;
      var milestoneTitle; 
      var milestoneState;
      var hasPriority = false;
      // By default we will assign 'Pending Triage' milestone, number 20 TODO
      var issueNewMilestone = 20; 

      // Get the title and state of the milestone 
      if (milestone) {
        milestoneTitle = milestone['title']; 
        milestoneState = milestone['state'];
      }
      // Get the labels we want to check
      labels.forEach(function(label) {
        if (label) {
          // Check if the issues has type
          if (label.name.startsWith('Type') || label.name.startsWith('Related'))
            issueType = label.name;
          // Check if the issues has Priority
          if (label.name.startsWith('P0') || label.name.startsWith('P1') || 
            label.name.startsWith('P2') || label.name.startsWith('P3'))
            hasPriority = true;
        }
      });
      promise = promise.then(function() {
        util.log('Update ' + issue.number);
        var updates = [];
        // Milestone task: move issue from closed milestone
        if (milestone) {
          if (milestoneTitle.startsWith('Sprint') && milestoneState == 'closed') {
            // 4 is the number for Milestone 'Backlog Bugs' TODO
            issueNewMilestone = 4; 
            updates.push(applyMilestone(issue, issueNewMilestone));
          }
        }
        //if issueType is not null, add correct milestones
        if (issueType != null) {
          if (milestoneTitle == 'Pending Triage' || milestone == null) {
            if (issueType == 'Type: Feature Request') {
              // 23 is the number for Milestone 'New FRs' TODO
              issueNewMilestone = 23;
              updates.push(applyMilestone(issue, issueNewMilestone)); 
            } else {
              if (issueType == 'Related to: Documentation' || 
                issueType == 'Type: Design Review' || issueType == 'Type: Weekly Status') {
                // 12 is the number for Milestone 'Docs Updates' TODO 
                issueNewMilestone = 12;
                updates.push(applyMilestone(issue, issueNewMilestone));
              } else {
                if (issueType == 'Type: Bug' || issueType == 'Related to: Flaky Tests') {
                  // 4 is the number for Milestone 'Backlog Bugs' TODO
                  issueNewMilestone = 4;
                  updates.push(applyMilestone(issue, issueNewMilestone));
                } else {
                  if (milestone == null) {
                    // 20 is the number for Milestone 'Pending Triage' TODO
                    updates.push(applyMilestone(issue, issueNewMilestone));
                  }
                }
              }
            }
          }
        } else {
          if (milestone == null){
            // 20 is the number for Milestone 'Pending Triage' TODO
            updates.push(applyMilestone(issue, issueNewMilestone));     
          } else {
            if (milestoneTitle == 'Prioritized FRs' || milestoneTitle == 'New FRs') {
              updates.push(applyLabel(issue, 'Type: Feature Request'));
            } else {
              if (milestoneTitle == 'Backlog Bugs' || milestoneTitle.startsWith('Sprint')) {
                updates.push(applyLabel(issue, 'Type: Bug'));
              }
            } 
          }                              
        }
        // Apply default priority if no priority
        if (hasPriority == false && milestoneTitle != 'New FRs' && 
          milestoneTitle != '3P Implementation' && milestoneTitle != 'Pending Triage' 
          && milestone != null) 
          updates.push(applyLabel(issue, 'P2: Soon'));  
        return Promise.all(updates);
      });
    });
    assert(Array.isArray(issues), `issues must be an array.`);
    return issues;
  });	
}

function errHandler(err) {
  var msg = err;
  if (err.message) {
    msg = err.message;
  }
  util.log(util.colors.red(msg));
}

function applyMilestone(issue, milestoneNumber) {
  var options = extend({}, optionsMilestone);
  options.qs = {
    state: 'open',
    per_page: 1000,
    access_token: GITHUB_ACCESS_TOKEN,
  };

  issue.milestone = milestoneNumber;
  return githubRequest(
      '/issues/' + issue.number,
      'PATCH',
      issue.milestone, 'milestone').then(function() {
        if (verbose) {
          util.log(util.colors.green(
              'Milestone applied ' + milestone + ' for #' + issue.number));
        }
      });
}

function applyLabel(issue, label) {
  var options = extend({}, optionsMilestone);
  options.qs = {
    state: 'open',
    per_page: 1000,
    access_token: GITHUB_ACCESS_TOKEN,
  };
  return githubRequest(
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
 * @param {string} path
 * @param {string=} opt_method
 * @param {*} opt_data
 * @param {string} typeRequest
 * @return {!Promise<*>}
 */
function githubRequest(path, opt_method, opt_data, typeRequest) {
  var options = {
    // Url to repository TODO
    url: 'https://api.github.com/repos/ampproject/amphtml' + path,
    body: {},
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
    if (typeRequest == 'milestone') {
      options.body['milestone'] = opt_data;
    }
    else options.body = opt_data;
  }
  return request(options)
}

gulp.task('issues:one', 'Get issues data', processissues, {
  options: {
    dryrun: '  Generate process but dont push it out',
  }
});