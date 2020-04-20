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
const {gitCherryMaster, gitCommitFormattedTime} = require('../common/git');

// Allow leading zeros in --version_override, e.g. 0000000000001
const argv = minimist(process.argv.slice(2), {
  string: ['version_override'],
});

function getVersion() {
  if (argv.version_override) {
    const version = String(argv.version_override);
    if (!/^\d{13}$/.test(version)) {
      throw new Error('--version_override only accepts a 13-digit version');
    }
    return version;
  }
  // Version numbers are determined using the following algorithm:
  // - Count the number (<X>) of cherry-picked releases on this branch that came
  //   from the `master` branch, until reaching `master` or the first commit
  //   that was added directly on this branch (if the current commit is on
  //   `master`'s commit history, or only contains new commits that are not
  //   cherry-picked from `master`, then <X> is 0).
  //   - If <X> > 9 then cap it at 9 (or throw an error for `--strict_build`s).
  // - Find the commit (<C>) before the last cherry-picked commit from the
  //   `master` branch (if the current branch is `master`, or otherwise in
  //   `master`'s commit history, then the current commit is <C>).
  // - Find the commit time of <C> (<C>.time). Note that commit time might be
  //   different from author time! e.g., commit time might be the time that a PR
  //   was merged into `master`, or a commit was cherry-picked onto the brabnch;
  //   author time is when the original author of the commit ran the
  //   "git commit" command.
  // - The version number is <C>.time.format("YYmmDDHHMMSS", "UTC") + <X> (the
  //   pseudo-code assumes standard `.strftime` formatting).
  //
  // Examples:
  // 1. The version number of a release built from the HEAD commit on `master`,
  //    where that HEAD commit was committed on April 25, 2020 2:31:11 PM EDT
  //    would be `2004251831110`.
  //    - EDT is UTC-4, so the hour value changes from EDT's 14 to UTC's 18.
  //    - The last digit is 0 as this commit is on `master`.
  //
  // 2. The version number of a release built from a local working branch (e.g.,
  //    on a developer's workstation) that was split off from a `master` commit
  //    from May 6, 2021 10:40:59 AM PDT and has multiple commits that exist
  //    only on local working branch would be `2105061840590`.
  //    - PDT is UTC-7, so the hour value changes from PST's 10 to UTC's 17.
  //    - The last digit is 0 as this commit is on a branch that was split
  //      from but does not have any commits since the split that were
  //      cherry-picked from `master`.
  //
  // 3. For a release built from a local working branch that was split off from
  //    a `master` commit from November 9, 2021 11:48:11 PM PST, and then:
  //    - had one commit that was cherry-picked from `master`,
  //    - followed by two commits that were created directly on the branch, the
  //      last of which was commited on November 10, 2021 5:01:12 PM PST,
  //    - followed by four commits that were cherry-picked from `master`,
  //    then its version number would be `202111110101124`.
  //    - The latest four commits are cherry-picks from `master`, and the one
  //      before them is not, so our last digit is set to 4.
  //    - PST is UTC-8, so the hour value changes from PST's 17 to UTC's 1, and
  //      one day is added.
  let numberOfCherryPicks = 0;
  const commitCherriesInfo = gitCherryMaster().reverse();
  for (const {isCherryPick} of commitCherriesInfo) {
    if (!isCherryPick) {
      break;
    }
    numberOfCherryPicks++;
  }
  const lastCommitFormattedTime = gitCommitFormattedTime(
    `HEAD~${numberOfCherryPicks}`
  );

  if (argv.strict_build && numberOfCherryPicks > 9) {
    throw new Error(
      `This branch has ${numberOfCherryPicks} cherry-picks. --strict_build caps the number of cherry-picks at 10. To build this branch use --version_override.`
    );
  }
  const lastDigit = Math.min(numberOfCherryPicks, 9);
  return `${lastCommitFormattedTime}${lastDigit}`;
}

// Used to e.g. references the ads binary from the runtime to get version lock.
exports.VERSION = getVersion();
