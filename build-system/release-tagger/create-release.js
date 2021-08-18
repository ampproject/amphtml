/**
 * @fileoverview
 * Create release functions for the release tagger.
 * Parameters
 * 1. head tag
 * 2. base tag
 * 3. channel (beta|stable|lts)
 */

const argv = require('minimist')(process.argv.slice(2));
const dedent = require('dedent');
const {
  createRelease,
  getPullRequestsBetweenCommits,
  getRelease,
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

  const cherrypickHeader = head.endsWith('0')
    ? ''
    : dedent`\
    <h2>🌸 Cherry-picked release 🌸</h2>
    <a href="https://github.com/ampproject/amphtml/releases/tag/${base}">\
    ${base}</a> was patched and published as <b>${head}</b>. Refer to the \
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
async function main(head, base, channel) {
  const {'target_commitish': headCommit} = await getRelease(head);
  const {'target_commitish': baseCommit} = await getRelease(base);
  const prs = await getPullRequestsBetweenCommits(headCommit, baseCommit);
  const body = _createBody(head, base, prs);
  const prerelease = prereleaseConfig[channel];
  return await createRelease(head, headCommit, body, prerelease);
}

main(argv.head, argv.base, argv.channel);
module.exports = {main};
