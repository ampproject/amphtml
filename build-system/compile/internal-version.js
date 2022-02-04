'use strict';

const minimist = require('minimist');
const {gitCherryMain, gitCommitFormattedTime} = require('../common/git');

// Allow leading zeros in --version_override, e.g. 0000000000001
const argv = minimist(process.argv.slice(2), {
  string: ['version_override'],
});

/**
 * Generates the AMP version number.
 *
 * Version numbers are determined using the following algorithm:
 * - Count the number (<X>) of cherry-picked commits on this branch, including
 *   commits not on the main branch . If this branch only contains new commits
 *   that are not cherry-picked, then <X> is 0).
 * - Find the commit (<C>) before the last cherry-picked commit from the
 *   main branch (if the current branch is the main branch, or otherwise in
 *   its commit history, then the current commit is <C>).
 * - Find the commit time of <C> (<C>.time). Note that commit time might be
 *   different from author time! e.g., commit time might be the time that a PR
 *   was merged into the main branch, or a commit was cherry-picked onto the
 *   branch;
 *   author time is when the original author of the commit ran the "git commit"
 *   command.
 * - The version number is <C>.time.format("YYmmDDHHMM", "UTC") + <X> (the
 *   pseudo-code assumes standard `.strftime` formatting, and <X> gets
 *   zero-padded until it is three digits long).
 *   - The maximum number of cherry-picks in a single branch is 999. More than
 *     that will fail to build. This should never happen.
 *
 * Examples:
 * 1. The version number of a release built from the HEAD commit on the main
 *    branch, where that HEAD commit was committed on April 25, 2020 2:31 PM EDT
 *    would be `2004251831000`.
 *    - EDT is UTC-4, so the hour value changes from EDT's 14 to UTC's 18.
 *    - The last three digits are 000 as this commit is on the main branch.
 *
 * 2. The version number of a release built from a local working branch (e.g.,
 *    on a developer's workstation) that was split off from a main branch commit
 *    from May 6, 2021 10:40 AM PDT and has multiple commits that exist only on
 *    local working branch would be `2105061840000`.
 *    - PDT is UTC-7, so the hour value changes from PDT's 10 to UTC's 17.
 *    - The last three digits are 000 as this commit is on a branch that was
 *      split from the main branch, and does not have any cherry-picked commits.
 *
 * 3. For a release built from a local working branch that was split off from a
 *    main branch commit from November 9, 2021 11:48 PM PST, and then:
 *    - had one commit that was cherry-picked from the main branch,
 *    - followed by two commits that were created directly on the branch, the
 *      last of which was commited on November 23, 2021 6:38 PM PST,
 *    - followed by twelve commits that were cherry-picked from the main branch,
 *      then its version number would be `2111240238012`.
 *    - The latest twelve commits are cherry-picks from the main branch, and the
 *      one before them is not, so our last three digits are set to 012.
 *    - PST is UTC-8, so the hour value changes from PST's 18 to UTC's 2, and
 *      one day is added.
 *
 * The version number can be manually overridden by passing --version_override
 * to the `amp build`/`amp dist` command.
 *
 * @param {string} ref
 * @return {string} AMP version number (always 13 digits long)
 */
function getVersion(ref = 'HEAD') {
  if (argv.version_override) {
    const version = String(argv.version_override);
    if (!/^\d{13}$/.test(version)) {
      throw new Error('--version_override only accepts a 13-digit version');
    }
    return version;
  }

  const numberOfCherryPicks = gitCherryMain(ref).length;
  if (numberOfCherryPicks > 999) {
    throw new Error(
      `This branch has ${numberOfCherryPicks} cherry-picks, which is more ` +
        'than 999, the maximum allowed number of cherry-picks! Please make ' +
        'sure your local main branch is up to date.'
    );
  }

  const lastCommitFormattedTime = gitCommitFormattedTime(
    `${ref}~${numberOfCherryPicks}`
  ).slice(0, -2);

  const numberOfCherryPicksStr = String(numberOfCherryPicks).padStart(3, '0');
  return `${lastCommitFormattedTime}${numberOfCherryPicksStr}`;
}

// Used to e.g. references the ads binary from the runtime to get version lock.
const VERSION = getVersion();

module.exports = {
  VERSION,
  getVersion,
};
