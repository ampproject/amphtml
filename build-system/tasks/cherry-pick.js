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

const RTV_PREFIXES = {
  '00': 'experimental',
  '01': 'stable',
  '02': 'control',
  '03': 'beta',
  '04': 'nightly',
  '05': 'nightly-control',
};

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
 * @param {string} rtv
 * @param {Array<string>} commits
 * @return {string}
 */
function cherryPickBranchName(rtv, commits) {
  const prefix = rtv.substr(0, 2);
  const channel = RTV_PREFIXES[prefix] || 'unknown';
  const [date] = new Date().toISOString().split('T');

  return `amp-release-${date}-${channel}+${commits.length}`;
}

/**
 * Updates tags from the remote and creates a branch at the release commit.
 *
 * @param {string} ref
 * @param {string} branch
 * @param {string} remote
 */
function prepareBranch(ref, branch, remote) {
  const {status} = getOutput(`git rev-parse ${ref}`);
  // Skip fetching remote tags if the tag is already available.
  if (status === 0) {
    log(green('INFO:'), 'Identified ref', cyan(ref), 'in local repository');
  } else {
    log(green('INFO:'), 'Fetching latest tags from', cyan(remote));
    execOrLog(
      `git fetch ${remote} "refs/tags/*:refs/tags/*"`,
      `Failed to fetch updated tags from remote ${cyan(remote)}`
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
  let rtv = String(argv.rtv || '');

  if (!commits.length) {
    log(red('ERROR:'), 'Must provide commit list with --commits');
    process.exitCode = 1;
    return;
  }
  if (!rtv) {
    log(red('ERROR:'), 'Must provide release RTV with --rtv');
    process.exitCode = 1;
    return;
  }
  if (rtv.length === 13) {
    log(
      yellow('WARNING:'),
      'Expected a 15-digit RTV but got a 13-digit AMP version;',
      'using Stable prefix',
      cyan('01')
    );
    // Be forgiving if someone provides a version instead of a full RTV.
    rtv = `01${rtv}`;
  }

  const tagName = rtv.substr(2);
  const branch = cherryPickBranchName(rtv, commits);

  try {
    prepareBranch(tagName, branch, remote);
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
      `Cherry-picked ${commits.length} commits onto release ${rtv}`
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
  'rtv': '  15-digit RTV to cherry-pick onto',
};
