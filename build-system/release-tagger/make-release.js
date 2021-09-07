/**
 * @fileoverview
 * Make release for the release tagger.
 */

const dedent = require('dedent');
const {
  createRelease,
  getPullRequestsBetweenCommits,
  getRef,
} = require('./utils');
const {getExtensions, getSemver} = require('../npm-publish/utils');
const {GraphQlQueryResponseData} = require('@octokit/graphql'); //eslint-disable-line no-unused-vars

const prereleaseConfig = {
  'beta': true,
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
 * Organize bento changes into sections
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {PackageMetadata}
 */
function _createPackageSections(prs) {
  const bundles = getExtensions();
  const majors = [...new Set(bundles.map((b) => b.version))];
  /** @type PackageMetadata */
  const metadata = {};
  for (const major of majors) {
    metadata[major] = {
      packages: {},
      unchanged: new Set(),
    };
    bundles
      .filter((b) => b.version == major)
      .map((b) => metadata[major].unchanged.add(b.extension));
  }

  for (const pr of prs) {
    for (const node of pr.files.nodes) {
      for (const {extension, version} of bundles) {
        if (node.path.startsWith(`extensions/${extension}/${version}`)) {
          if (!Object.keys(metadata[version].packages).includes(extension)) {
            metadata[version].packages[extension] = new Set();
            metadata[version].unchanged.delete(extension);
          }
          metadata[version].packages[extension].add(
            `<li>${_formatPullRequestLine(pr)}</li>`
          );
        }
      }
    }
  }

  return metadata;
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
      if (node.path.startsWith('extensions/')) {
        const component = node.path.split('/')[1];
        if (!Object.keys(sections).includes(component)) {
          sections[component] = new Set();
        }
        sections[component].add(_formatPullRequestLine(pr));
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
 * Create body for GitHub release
 * @param {string} head
 * @param {string} base
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {string}
 */
function _createBody(head, base, prs) {
  const bento = _createPackageSections(prs);
  const components = _createComponentSections(prs);
  const template = dedent`\
     <h2>Changelog</h2>
     <p>
     <a href="https://github.com/ampproject/amphtml/compare/${base}...${head}">
     <code>${base}...${head}</code>
     </a>
     </p>
 
     ${Object.entries(bento)
       .map(
         // eslint-disable-next-line local/no-deep-destructuring
         ([major, {packages, unchanged}]) => dedent`\
         <h2>npm packages @ ${getSemver(major, head)}</h2>
         ${Object.entries(packages)
           .map(
             ([extension, prs]) =>
               `<b>${extension}</b>\n<ul>${[...prs].join('\n')}</ul>`
           )
           .join('\n')}
   
         <b>Packages not changed:</b> <i>${[...unchanged].join(', ')}</i>`
       )
       .join('\n')}
 
     <h2>Changes by component</h2>
     ${components.join('')}\
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
 * Main function
 * @param {string} head
 * @param {string} base
 * @param {string} channel
 * @return {Promise<Object>}
 */
async function makeRelease(head, base, channel) {
  const {object: headRef} = await getRef(head);
  const {object: baseRef} = await getRef(base);
  const prs = await getPullRequestsBetweenCommits(headRef.sha, baseRef.sha);
  const body = _createBody(head, base, prs);
  const prerelease = prereleaseConfig[channel];
  return await createRelease(head, headRef.sha, body, prerelease);
}

module.exports = {makeRelease};
