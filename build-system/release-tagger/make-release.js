/**
 * @fileoverview
 * Make release for the release tagger.
 */

const dedent = require('dedent');
const {GitHubApi} = require('./utils');

/** @typedef {import('@octokit/graphql').GraphQlQueryResponseData} GraphQlQueryResponseData */

const prereleaseConfig = {
  'beta-opt-in': true,
  'beta-percent': true,
  'stable': false,
  'lts': false,
};

/**
 * @typedef {{
 *  [major: string]: {
 *    packages: {
 *      [extension: string]: Set
 *    }
 *    unchanged: Set,
 *  }}} PackageMetadata
 */

/**
 * Format pull request line
 * @param {GraphQlQueryResponseData} pr
 * @return {string}
 */
function _formatPullRequestLine(pr) {
  const {mergeCommit, title} = pr;
  const {abbreviatedOid, commitUrl} = mergeCommit;
  return dedent`\
   <a href="${commitUrl}"><code>${abbreviatedOid}</code></a> - ${title}`;
}

/**
 * Organize pull requests into sections
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {Array<string>}
 */
function _createComponentSections(prs) {
  const sections = {
    'ads': [],
    'build-system': [],
    'src': [],
    'third_party': [],
    'validator': [],
    'package updates': new Array(), // [] defaults to never[], which tsc flags
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
      const componentName = getComponentNameFromPath(node.path);
      if (componentName) {
        if (!sections[componentName]) {
          sections[componentName] = new Set();
        }
        sections[componentName].add(_formatPullRequestLine(pr));
      }
    }
  }

  const sectionsMarkdown = [];
  for (const key of Object.keys(sections).sort()) {
    const orderedPrs = [...sections[key]].sort();
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
 * Gets the name of a component from its directory path.
 * Returns undefined if the path is not a component directory.
 * @param {string} path
 * @return {string|undefined}
 */
function getComponentNameFromPath(path) {
  if (path.startsWith('extensions/')) {
    return path.split('/')[1];
  }

  if (path.startsWith('src/bento/components/')) {
    return path.split('/')[3];
  }
}

/**
 * Create body for GitHub release
 * @param {string} head
 * @param {string} base
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {string}
 */
function _createBody(head, base, prs) {
  const components = _createComponentSections(prs);
  const template = dedent`\
     <h2>Changelog</h2>
     <p>
     <a href="https://github.com/ampproject/amphtml/compare/${base}...${head}">
     <code>${base}...${head}</code>
     </a>
     </p>
 
     <h2>Changes by component</h2>
     ${components.sort().join('')}\
   `;

  const patched = head.slice(0, -3) + '000';
  const cherrypickHeader = head.endsWith('0')
    ? ''
    : dedent`\
    <h2>🌸 Cherry-picked release 🌸</h2>
    <a href="https://github.com/ampproject/amphtml/releases/tag/${patched}">\
    ${patched}</a> was patched and published as <b>${head}</b>. Refer to the \
    <a href="https://amp-release-calendar.appspot.com">release calendar</a> \
    for additional channel information.\n\n`;
  return cherrypickHeader + template;
}

/**
 * Make release
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @param {string} sha
 * @param {Object|undefined} octokitRest
 * @param {Object|undefined} octokitGraphQl
 * @return {Promise<Object>}
 */
async function makeRelease(
  head,
  base,
  channel,
  sha,
  octokitRest = undefined,
  octokitGraphQl = undefined
) {
  const api = new GitHubApi(octokitRest, octokitGraphQl);
  let headRef;
  try {
    headRef = (await api.getRef(head)).object;
  } catch (_) {
    headRef = (await api.createTag(head, sha)).object;
  }
  const {object: baseRef} = await api.getRef(base);
  const prs = await api.getPullRequestsBetweenCommits(headRef.sha, baseRef.sha);
  const body = _createBody(head, base, prs);
  const prerelease = prereleaseConfig[channel];
  return await api.createRelease(head, headRef.sha, body, prerelease);
}

/**
 * Get a release
 * @param {string} head
 * @param {Object|undefined} octokitRest
 * @param {Object|undefined} octokitGraphQl
 * @return {Promise<Object>}
 */
async function getRelease(
  head,
  octokitRest = undefined,
  octokitGraphQl = undefined
) {
  const api = new GitHubApi(octokitRest, octokitGraphQl);
  return await api.getRelease(head);
}

module.exports = {getRelease, makeRelease};
