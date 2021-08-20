/**
 * @fileoverview
 * Update release for the release tagger.
 */

const {getRelease, updateRelease} = require('./utils');

/**
 * Publish a GitHub release
 * @param {string} tag
 * @return {Promise<Object>}
 */
async function publishRelease(tag) {
  const release = await getRelease(tag);
  const changes = {prerelease: false};
  return await updateRelease(release.id, changes);
}

/**
 * Roll back a GitHub release
 * @param {string} tag
 * @return {Promise<Object>}
 */
async function rollbackRelease(tag) {
  const release = await getRelease(tag);
  const body = '#### :back: This release was rolled back.\n' + release.body;
  const changes = {prerelease: true, body};
  return await updateRelease(release.id, changes);
}

module.exports = {publishRelease, rollbackRelease};
