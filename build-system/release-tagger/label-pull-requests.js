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
 * Main function
 * @param {string} head tag
 * @param {string} base tag
 * @param {string} channel (beta|stable|lts)
 * @param {boolean} rollback
 * @return {Promise<Object>}
 */
async function updateLabelsOnPullRequests(
  head,
  base,
  channel,
  rollback = false
) {
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

module.exports = {updateLabelsOnPullRequests};
