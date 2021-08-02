/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview
 * Update release functions for the release tagger.
 * Parameters
 * 1. tag (or AMP version)
 * 2. action (publish | rollback)
 */

const argv = require('minimist')(process.argv.slice(2));
const {getRelease, updateRelease} = require('./utils');

/**
 * Publish a GitHub release
 * @param {string} tag
 * @return {Promise<Object>}
 */
async function _publish(tag) {
  const release = await getRelease(tag);
  const changes = {prerelease: false};
  return await updateRelease(release.id, changes);
}

/**
 * Roll back a GitHub release
 * @param {string} tag
 * @return {Promise<Object>}
 */
async function _rollback(tag) {
  const release = await getRelease(tag);
  const body = '#### :back: This release was rolled back.\n' + release.body;
  const changes = {prerelease: true, body};
  return await updateRelease(release.id, changes);
}

/**
 * Main function
 * @param {string} tag
 * @param {string} action
 * @return {Promise<Object>}
 */
async function main(tag, action) {
  if (action == 'publish') {
    return await _publish(tag);
  }

  if (action == 'rollback') {
    return await _rollback(tag);
  }
}

main(argv.tag, argv.action);
module.exports = {main};
