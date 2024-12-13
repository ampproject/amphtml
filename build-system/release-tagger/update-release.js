/**
 * @fileoverview
 * Update release for the release tagger.
 */

const {GitHubApi} = require('./utils');

/**
 * Publish a GitHub release
 * @param {string} tag
 * @param {boolean} latest
 * @param {Object|undefined} octokitRest
 * @param {Object|undefined} octokitGraphQl
 * @return {Promise<Object>}
 */
async function publishRelease(
  tag,
  latest,
  octokitRest = undefined,
  octokitGraphQl = undefined
) {
  const api = new GitHubApi(octokitRest, octokitGraphQl);
  const release = await api.getRelease(tag);
  const changes = {prerelease: false, 'make_latest': latest};
  return await api.updateRelease(release.id, changes);
}

/**
 * Roll back a GitHub release
 * @param {string} tag
 * @param {Object|undefined} octokitRest
 * @param {Object|undefined} octokitGraphQl
 * @return {Promise<Object>}
 */
async function rollbackRelease(
  tag,
  octokitRest = undefined,
  octokitGraphQl = undefined
) {
  const api = new GitHubApi(octokitRest, octokitGraphQl);
  const release = await api.getRelease(tag);
  const body = '#### :back: This release was rolled back.\n' + release.body;
  const changes = {prerelease: true, body};
  return await api.updateRelease(release.id, changes);
}

module.exports = {publishRelease, rollbackRelease};
