/**
 * @fileoverview
 * Update release for the release tagger.
 */

const {GitHubApi} = require('./utils');

/**
 * Publish a GitHub release
 * @param {string} tag
 * @param {boolean} latest
 * @param {Object} octokitRest
 * @param {Object} octokitGraphQl
 * @return {Promise<Object>}
 */
async function publishRelease(tag, latest, octokitRest, octokitGraphQl) {
  const api = new GitHubApi(octokitRest, octokitGraphQl);
  const release = await api.getRelease(tag);
  const changes = {prerelease: false, 'make_latest': latest};
  return await api.updateRelease(release.id, changes);
}

/**
 * Roll back a GitHub release
 * @param {string} tag
 * @param {Object} octokitRest
 * @param {Object} octokitGraphQl
 * @return {Promise<Object>}
 */
async function rollbackRelease(tag, octokitRest, octokitGraphQl) {
  const api = new GitHubApi(octokitRest, octokitGraphQl);
  const release = await api.getRelease(tag);
  const body = '#### :back: This release was rolled back.\n' + release.body;
  const changes = {prerelease: true, body};
  return await api.updateRelease(release.id, changes);
}

module.exports = {publishRelease, rollbackRelease};
