/**
 * @fileoverview
 * Label pull request functions for the release tagger.
 * Parameters
 * 1. head tag (amp version)
 * 2. base tag (amp version)
 * 3. channel (beta|lts|stable)
 * 4. rollback
 */

const argv = require('minimist')(process.argv.slice(2));
const {
  getLabel,
  getPullRequestsBetweenCommits,
  getRelease,
  labelPullRequests,
  unlabelPullRequests,
} = require('./utils');

const labelConfig = {
  beta: 'PR Use: In Beta / Experimental',
  lts: 'PR Use: In LTS',
  stable: 'PR Use: In Stable',
};

/**
 * Main function
 * @param {string} head tag
 * @param {string} base tag
 * @param {string} channel (beta|stable|lts)
 * @param {boolean} rollback
 * @return {Promise<Object>}
 */
async function main(head, base, channel, rollback = false) {
  const [label, headRelease, baseRelease] = await Promise.all([
    await getLabel(labelConfig[channel]),
    await getRelease(head),
    await getRelease(base),
  ]);
  const prs = await getPullRequestsBetweenCommits(
    headRelease['target_commitish'],
    baseRelease['target_commitish']
  );

  if (rollback) {
    return await unlabelPullRequests(prs, label['node_id']);
  }

  return await labelPullRequests(prs, label['node_id']);
}

main(argv.head, argv.base, argv.label, argv.rollback);
module.exports = {main};
