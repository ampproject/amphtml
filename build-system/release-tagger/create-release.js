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
const dedent = require('dedent');
const {
  createRelease,
  getPullRequestsBetweenCommits,
  getRelease,
} = require('./utils');
const {GraphQlQueryResponseData} = require('@octokit/graphql'); //eslint-disable-line no-unused-vars

/**
 * Format pull request line
 * @param {GraphQlQueryResponseData} pr
 * @return {string}
 */
function _formatPullRequestLine(pr) {
  const {mergeCommit, number, title, url} = pr;
  const {abbreviatedOid, commitUrl} = mergeCommit;
  return dedent`\
  <a href="${commitUrl}"><code>${abbreviatedOid}</code></a> ${title} \
  (<a href="${url}">#${number}</a>)`;
}

/**
 * Create raw notes
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {Array<string>}
 */
function _createRawNotes(prs) {
  return prs.map((pr) => _formatPullRequestLine(pr));
}

/**
 * Organize pull requests into sections
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {Array<string>}
 */
function _createSections(prs) {
  const sections = {
    'ads': [],
    'build-system': [],
    'src': [],
    'third_party': [],
    'validator': [],
    'package updates': [],
  };

  for (const pr of prs) {
    // renovate bot
    if (pr.author.login === 'renovate-bot') {
      sections['package updates'].push(_formatPullRequestLine(pr));
      continue;
    }

    // directories
    for (const key of Object.keys(sections)) {
      if (pr.files.nodes.some((node) => node.path.startsWith(`${key}/`))) {
        sections[key].push(_formatPullRequestLine(pr));
      }
    }

    // components
    for (const node of pr.files.nodes) {
      if (node.path.startsWith('extensions/')) {
        const component = node.path.split('/')[1];
        if (!Object.keys(sections).includes(component)) {
          sections[component] = [];
        }
        sections[component].push(_formatPullRequestLine(pr));
      }
    }
  }

  const sectionsMarkdown = [];
  for (const key of Object.keys(sections).sort()) {
    const orderedPrs = sections[key].sort();
    const template = dedent`
      <details>\
        <summary>\
          ${key} (${orderedPrs.length})\
        </summary>\
        ${orderedPrs.join('<br />')}\
      </details>`;
    sectionsMarkdown.push(template);
  }

  return sectionsMarkdown;
}

/**
 * Create body for GitHub release
 * @param {string} base
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {string}
 */
function _createBody(base, prs) {
  const rawNotes = _createRawNotes(prs);
  const sections = _createSections(prs);
  const template = dedent`\
      #### *Baseline release: [${base}]\
      (https://github.com/ampproject/amphtml/releases/${base})*

      #### Raw notes
      ${rawNotes.join('\n')}

      #### Breakdown by component
      ${sections.join('')}\
  `;
  return template;
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
  const body = _createBody(previousTag, prs);
  return await createRelease(tag, commit, body);
}

main(argv.tag, argv.previousTag);
module.exports = {main};
