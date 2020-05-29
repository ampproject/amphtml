/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
const log = require('fancy-log');
const {getOutput} = require('../common/exec');
const {green, cyan, red, yellow} = require('ansi-colors');

/**
 * Executes a shell command, and logs an error message if the command fails.
 *
 * @param {string} cmd
 * @param {string} msg
 * @return {!Object}
 */
function execOrLog(cmd, msg) {
  const result = getOutput(cmd);
  if (result.status) {
    log(yellow('ERROR:'), msg);
    throw new Error(result.stderr);
  }

  return result;
}

/**
 * Determines the name of the cherry-pick branch.
 *
 * @param {string} version
 * @return {string}
 */
function cherryPickBranchName(version) {
  const timestamp = version.slice(0, -3);
  let suffix = String(Number(version.slice(-3)) + 1);
  while (suffix.length < 3) {
    suffix = `0${suffix}`;
  }
  return `amp-release-${timestamp}${suffix}`;
}

/**
 * Updates tags from the remote and creates a branch at the release commit.
 *
 * @param {string} ref
 * @param {!Array<string>} commits
 * @param {string} branch
 * @param {string} remote
 */
function prepareBranch(ref, commits, branch, remote) {
  const needsFetch = [ref]
    .concat(commits)
    .some((r) => getOutput(`git rev-parse ${r}`).status);

  if (needsFetch) {
    log(green('INFO:'), 'Fetching latest tags and commits from', cyan(remote));
    execOrLog(
      `git fetch ${remote}`,
      `Failed to fetch updates from remote ${cyan(remote)}`
    );
  } else {
    log(
      green('INFO:'),
      'Identified tag and all commits available in local repository'
    );
  }

  execOrLog(
    `git checkout -b ${branch} ${ref}`,
    `Failed to checkout new branch at ref ${cyan(ref)}`
  );
}

/**
 * Cherry-picks a commit into a new branch. When the cherry-pick succeeds,
 * returns `true`. In the event of a merge conflict, the cherry-pick is aborted
 * and an error is thrown.
 *
 * @param {string} sha
 */
function performCherryPick(sha) {
  try {
    log(green('INFO:'), 'Cherry-picking commit', cyan(sha));
    execOrLog(
      `git cherry-pick -x ${sha}`,
      `Failed to cherry-pick commit ${cyan(sha)}; aborting`
    );
  } catch (e) {
    log(green('INFO:'), 'Aborting cherry-pick of commit', cyan(sha));
    getOutput(`git cherry-pick --abort`);
    throw e;
  }
}

function cherryPick() {
  const {push, remote = 'origin'} = argv;
  const commits = (argv.commits || '').split(',').filter(Boolean);
  const onto = String(argv.onto || '');
  const branch = cherryPickBranchName(onto);

  if (!commits.length) {
    log(red('ERROR:'), 'Must provide commit list with --commits');
    process.exitCode = 1;
    return;
  }
  if (!onto) {
    log(red('ERROR:'), 'Must provide 13-digit AMP version with --onto');
    process.exitCode = 1;
    return;
  }
  if (onto.length === 15) {
    log(
      yellow('WARNING:'),
      'Expected a 13-digit AMP version but got a 15-digit RTV;',
      'ignoring channel prefix'
    );
    // Be forgiving if someone provides a version instead of a full RTV.
    onto = onto.substr(2);
  }

  try {
    prepareBranch(onto, commits, branch, remote);
    commits.forEach(performCherryPick);

    if (push) {
      log(
        green('INFO:'),
        'Pushing branch',
        cyan(branch),
        'to remote',
        cyan(remote)
      );
      execOrLog(
        `git push --set-upstream ${remote} ${branch}`,
        `Failed to push branch ${cyan(branch)} to remote ${cyan(remote)}`
      );
    }

    log(
      green('SUCCESS:'),
      `Cherry-picked ${commits.length} commits onto release ${onto}`
    );
    process.exitCode = 0;
  } catch (e) {
    log(red('ERROR:'), e.message);
    log('Deleting branch', cyan(branch));
    getOutput(`git checkout master && git branch -d ${branch}`);
    process.exitCode = 1;
  }
}

module.exports = {cherryPick};

cherryPick.description = 'Cherry-picks one or more commits onto a new branch';
cherryPick.flags = {
  'commits': '  Comma-delimited list of commit SHAs to cherry-pick',
  'push': '  If set, will push the created branch to the remote',
  'remote': '  Remote to refresh tags from (default: origin)',
  'onto': '  13-digit AMP version to cherry-pick onto',
};
