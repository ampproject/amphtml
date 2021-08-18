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
 * Update labels on pull requests for the release tagger.
 */

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
 * Get PRs and label
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @return {Promise<Object>}
 */
async function _setup(head, base, channel) {
  const [label, headRelease, baseRelease] = await Promise.all([
    await getLabel(labelConfig[channel]),
    await getRelease(head),
    await getRelease(base),
  ]);
  const prs = await getPullRequestsBetweenCommits(
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
 * @return {Promise<void>}
 */
async function addLabels(head, base, channel) {
  const {labelId, prs} = await _setup(head, base, channel);
  await labelPullRequests(prs, labelId);
}

/**
 * Remove label from PRs
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @return {Promise<void>}
 */
async function removeLabels(head, base, channel) {
  const {labelId, prs} = await _setup(head, base, channel);
  await unlabelPullRequests(prs, labelId);
}

module.exports = {addLabels, removeLabels};
