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
 * Create release functions for the release tagger.
 * Parameters
 * 1. tag (or AMP version)
 * 2. previous tag
 */

const argv = require('minimist')(process.argv.slice(2));
const {
  createRelease,
  getPullRequestsBetweenCommits,
  getRelease,
} = require('./utils');
const {GraphQlQueryResponseData} = require('@octokit/graphql'); //eslint-disable-line no-unused-vars

/**
 * Create body for GitHub release
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {string}
 */
function _createBody(prs) {
  return prs.map((pr) => pr.number).join('\n'); // TODO: build this out please
}

/**
 * Main function
 * @param {string} tag
 * @param {string} previousTag
 * @return {Promise<Object>}
 */
async function main(tag, previousTag) {
  const {'target_commitish': commit} = await getRelease(tag);
  const {'target_commitish': previousCommit} = await getRelease(previousTag);
  const prs = await getPullRequestsBetweenCommits(commit, previousCommit);
  const body = _createBody(prs);
  return await createRelease(tag, commit, body);
}

main(argv.tag, argv.previousTag);
module.exports = {main};
