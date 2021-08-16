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
 * Label pull request functions for the release tagger.
 * Parameters
 * 1. head tag (amp version)
 * 2. base tag (amp version)
 * 3. channel (beta|lts|stable)
 */

const argv = require('minimist')(process.argv.slice(2));
const {
  getLabel,
  getPullRequestsBetweenCommits,
  getRelease,
  labelPullRequests,
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
 * @return {Promise<Object>}
 */
async function main(head, base, channel) {
  const labelId = (await getLabel(labelConfig[channel]))['node_id'];
  const headSha = (await getRelease(head))['target_commitish'];
  const baseSha = (await getRelease(base))['target_commitish'];
  const prs = await getPullRequestsBetweenCommits(headSha, baseSha);
  return await labelPullRequests(prs, labelId);
}

main(argv.head, argv.base, argv.label);
module.exports = {main};
