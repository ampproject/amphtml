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

const minimist = require('minimist');
const {
  gitBranchContains,
  gitCherryMaster,
  gitCommitMessage,
  gitCommitFormattedTime,
} = require('../common/git');

// Allow leading zeros in --version_override, e.g. 0000000000001
const argv = minimist(process.argv.slice(2), {
  string: ['version_override'],
});

/**
 * Generates the AMP version number.
 *
 * Version numbers are determined using the following algorithm:
 * - Count the number (<X>) of cherry-picked commits on this branch that came
 *   from the `master` branch, until reaching `master` or the first commit that
 *   was added directly on this branch (if the current commit is on `master`'s
 *   commit history, or only contains new commits that are not cherry-picked
 *   from `master`, then <X> is 0).
 * - Find the commit (<C>) before the last cherry-picked commit from the
 *   `master` branch (if the current branch is `master`, or otherwise in
 *   `master`'s commit history, then the current commit is <C>).
 * - Find the commit time of <C> (<C>.time). Note that commit time might be
 *   different from author time! e.g., commit time might be the time that a PR
 *   was merged into `master`, or a commit was cherry-picked onto the branch;
 *   author time is when the original author of the commit ran the "git commit"
 *   command.
 * - The version number is <C>.time.format("YYmmDDHHMM", "UTC") + <X> (the
 *   pseudo-code assumes standard `.strftime` formatting, and <X> gets
 *   zero-padded until it is three digits long).
 *   - The maximum number of cherry-picks in a single branch is 999. More than
 *     that will fail to build. This should never happen.
 *
 * Examples:
 * 1. The version number of a release built from the HEAD commit on `master`,
 *    where that HEAD commit was committed on April 25, 2020 2:31 PM EDT would
 *    be `2004251831000`.
 *    - EDT is UTC-4, so the hour value changes from EDT's 14 to UTC's 18.
 *    - The last three digits are 000 as this commit is on `master`.
 *
 * 2. The version number of a release built from a local working branch (e.g.,
 *    on a developer's workstation) that was split off from a `master` commit
 *    from May 6, 2021 10:40 AM PDT and has multiple commits that exist only on
 *    local working branch would be `2105061840000`.
 *    - PDT is UTC-7, so the hour value changes from PDT's 10 to UTC's 17.
 *    - The last three digits are 000 as this commit is on a branch that was
 *      split from `master`, and does not have any cherry-picked commits.
 *
 * 3. For a release built from a local working branch that was split off from a
 *    `master` commit from November 9, 2021 11:48 PM PST, and then:
 *    - had one commit that was cherry-picked from `master`,
 *    - followed by two commits that were created directly on the branch, the
 *      last of which was commited on November 23, 2021 6:38 PM PST,
 *    - followed by twelve commits that were cherry-picked from `master`, then
 *      its version number would be `2111240238012`.
 *    - The latest twelve commits are cherry-picks from `master`, and the one
 *      before them is not, so our last three digits are set to 012.
 *    - PST is UTC-8, so the hour value changes from PST's 18 to UTC's 2, and
 *      one day is added.
 *
 * The version number can be manually overridden by passing --version_override
 * to the `gulp build`/`gulp dist` command.
 *
 * @return {string} AMP version number (always 13 digits long)
 */
function getVersion() {
  if (argv.version_override) {
    const version = String(argv.version_override);
    if (!/^\d{13}$/.test(version)) {
      throw new Error('--version_override only accepts a 13-digit version');
    }
    return version;
  }

  let numberOfCherryPicks = 0;
  const commitCherriesInfo = gitCherryMaster().reverse();
  for (const {isCherryPick, sha} of commitCherriesInfo) {
    if (!isCherryPick) {
      // Sometimes cherry-picks are mistaken for new commits. Double-check here
      // by looking for the hard-coded message at the end of the commit that
      // indicates that it was a cherry-pick. Requires that the cherry-pick was
      // performed with the `-x` flag.
      const commitMessage = gitCommitMessage(sha);
      const cherryPickedMatch = /\(cherry picked from commit ([0-9a-f]{40})\)/.exec(
        commitMessage
      );
      if (!cherryPickedMatch) {
        break;
      }

      if (!gitBranchContains(cherryPickedMatch[1])) {
        break;
      }
    }
    numberOfCherryPicks++;
  }
  if (numberOfCherryPicks > 999) {
    throw new Error(
      `This branch has ${numberOfCherryPicks} cherry-picks, which is more than 999, the maximum allowed number of cherry-picks!`
    );
  }

  const lastCommitFormattedTime = gitCommitFormattedTime(
    `HEAD~${numberOfCherryPicks}`
  ).slice(0, -2);

  numberOfCherryPicks = String(numberOfCherryPicks).padStart(3, '0');
  return `${lastCommitFormattedTime}${numberOfCherryPicks}`;
}

// Used to e.g. references the ads binary from the runtime to get version lock.
exports.VERSION = getVersion();
