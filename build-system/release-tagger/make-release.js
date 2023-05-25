/**
 * @fileoverview
 * Make release for the release tagger.
 */

const dedent = require('dedent');
const {GitHubApi} = require('./utils');
const {getExtensionsAndComponents, getSemver} = require('../npm-publish/utils');
const {GraphQlQueryResponseData} = require('@octokit/graphql'); // eslint-disable-line @typescript-eslint/no-unused-vars

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
 * Organize bento changes into sections
 * @param {Array<GraphQlQueryResponseData>} prs
 * @return {PackageMetadata}
 */
function _createPackageSections(prs) {
  const bundles = getExtensionsAndComponents();
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
        if (isComponentPath(node.path, extension, version)) {
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
 * Determines if a path is a path to a component directory.
 * @param {string} path
 * @param {?string=} name
 * @param {?string=} version
 * @return {boolean}
 */
function isComponentPath(path, name, version) {
  const nameDir = name ? `${name}/` : '';
  const versionDir = version ? `${version}/` : '';
  return (
    path.startsWith(`extensions/${nameDir}${versionDir}`) ||
    path.startsWith(`src/bento/components/${nameDir}${versionDir}`)
  );
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
           .sort()
           .map(
             ([extension, prs]) =>
               `<b>${extension}</b>\n<ul>${[...prs].join('\n')}</ul>`
           )
           .join('\n')}
   
         <b>Packages not changed:</b> <i>${[...unchanged]
           .sort()
           .join(', ')}</i>`
       )
       .join('\n')}
 
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
