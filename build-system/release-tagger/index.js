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
 * Entry file for ./github/workflows/release-tagger.yml
 * Parameters
 * 1. action (promote|rollback)
 * 2. head (AMP version)
 * 3. base (AMP version)
 * 4. channel (beta|stable|lts)
 */

const [action, head, base, channel] = process.argv.slice(2);

const {makeRelease} = require('./make-release');
const {publishRelease, rollbackRelease} = require('./update-release');
const {updateLabelsOnPullRequests} = require('./label-pull-requests');

/**
 * Promote actions
 * @return {Promise<void>}
 */
async function _promote() {
  try {
    await publishRelease(head);
  } catch (e) {
    await makeRelease(head, base, channel);
  }

  await updateLabelsOnPullRequests(head, base, channel);
}

/**
 * Rollback actions
 * @return {Promise<void>}
 */
async function _rollback() {
  try {
    await rollbackRelease(head);
  } catch (e) {}

  await updateLabelsOnPullRequests(head, base, channel, true);
}

/**
 * Main functions for the release tagger
 * @return {Promise<void>}
 */
async function main() {
  if (action == 'promote') {
    return await _promote();
  }

  if (action == 'rollback') {
    return await _rollback();
  }

  // TODO(estherkim): add release tracker comment on prs
}

main();
