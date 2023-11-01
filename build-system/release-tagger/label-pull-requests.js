/**
 * @fileoverview
 * Update labels on pull requests for the release tagger.
 */

const {GitHubApi} = require('./utils');

const labelConfig = {
  'beta-percent': 'PR Use: In Beta / Experimental',
  lts: 'PR Use: In LTS',
  stable: 'PR Use: In Stable',
};

/**
 * Get PRs and label
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @param {object} api
 * @return {Promise<Object>}
 */
async function _setup(head, base, channel, api) {
  const [label, headRelease, baseRelease] = await Promise.all([
    await api.getLabel(labelConfig[channel]),
    await api.getRelease(head),
    await api.getRelease(base),
  ]);
  const prs = await api.getPullRequestsBetweenCommits(
    headRelease['target_commitish'],
    baseRelease['target_commitish']
  );
  return {prs, labelId: label['node_id']};
}

/**
 * Add label to PRs
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @param {Object|undefined} octokitRest
 * @param {Object|undefined} octokitGraphQl
 * @return {Promise<void>}
 */
async function addLabels(
  head,
  base,
  channel,
  octokitRest = undefined,
  octokitGraphQl = undefined
) {
  const api = new GitHubApi(octokitRest, octokitGraphQl);
  const {labelId, prs} = await _setup(head, base, channel, api);
  await api.labelPullRequests(prs, labelId);
}

/**
 * Remove label from PRs
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @param {Object|undefined} octokitRest
 * @param {Object|undefined} octokitGraphQl
 * @return {Promise<void>}
 */
async function removeLabels(
  head,
  base,
  channel,
  octokitRest = undefined,
  octokitGraphQl = undefined
) {
  const api = new GitHubApi(octokitRest, octokitGraphQl);
  const {labelId, prs} = await _setup(head, base, channel, api);
  await api.unlabelPullRequests(prs, labelId);
}

module.exports = {addLabels, removeLabels};
