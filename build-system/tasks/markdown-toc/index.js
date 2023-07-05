const fastGlob = require('fast-glob');
const path = require('path');
const prettier = require('prettier');
const toc = require('markdown-toc');
const {getStdout} = require('../../common/process');
const {green} = require('kleur/colors');
const {logOnSameLineLocalDev} = require('../../common/logging');
const {readFile} = require('fs-extra');
const {writeDiffOrFail} = require('../../common/diff');

const task = 'markdown-toc';

const header = `<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    amp markdown-toc --fix
-->`;

// Case-insensitive, allows multiple newlines and arbitrary indentation.
const headerRegexp = new RegExp(
  header
    .split(/\n+/g)
    .map(
      (line) =>
        `\\s*${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/^\s+/, '')}`
    )
    .join('\n+'),
  'im'
);

/**
 * @param {string} content
 * @return {?string}
 */
function getFrontmatter(content) {
  const end = content.search(/(\n-|\n#)/m);
  if (end < 0) {
    return null;
  }
  const withWhitespace = content.substr(0, end);
  if (withWhitespace.trim().length < 1) {
    return null;
  }
  return withWhitespace;
}

/**
 * @param {?string} maybeComment
 * @return {?Object}
 */
function isolateCommentJson(maybeComment) {
  if (!maybeComment) {
    return null;
  }

  const json = maybeComment.replace('<!--', '').replace('-->', '').trim();
  if (!json) {
    return null;
  }

  try {
    const options = JSON.parse(json);
    return options;
  } catch (_) {
    return null;
  }
}

/**
 * @param {string} content
 * @return {Promise<?string>}
 */
async function overrideToc(content) {
  const headerMatch = content.match(headerRegexp);

  if (!headerMatch || !headerMatch.length || headerMatch.index === undefined) {
    return null;
  }

  const headerEnd = headerMatch.index + headerMatch[0].length;

  const afterHeader = content.substr(headerEnd);

  const frontmatter = getFrontmatter(afterHeader);
  const frontmatterOptions = isolateCommentJson(frontmatter);

  const afterFrontmatter = frontmatter
    ? afterHeader.substr(afterHeader.indexOf(frontmatter) + frontmatter.length)
    : afterHeader;

  const listEnd = afterFrontmatter.search(/\n[^-\s]/m);

  if (listEnd < 0) {
    return null;
  }

  // https://github.com/jonschlinkert/markdown-toc#options
  const options = {
    firsth1: false,
    ...frontmatterOptions,
    // Don't allow to override `bullets` because it breaks assumptions.
    bullets: '-',
  };

  const overridden = [
    content.substr(0, headerEnd),
    frontmatter,
    toc(content, options).content,
    afterFrontmatter.substr(listEnd),
  ].join('\n');

  return prettier.format(overridden, {
    ...(await prettier.resolveConfig('_.md')),
    parser: 'markdown',
  });
}

/**
 * @param {string} cwd
 * @return {Promise<{[key: string]: ?string}>}
 */
async function overrideTocGlob(cwd) {
  const glob = [
    '**/*.md',
    '!**/{node_modules,build,dist,dist.3p,dist.tools,.karma-cache}/**',
  ];
  const files = (await fastGlob(glob, {cwd})).map((file) =>
    path.join(cwd, file)
  );
  const filesIncludingString = getStdout(
    [`grep -irl "${task}"`, ...files].join(' ')
  )
    .trim()
    .split('\n');

  /** @type {{[key: string]: ?string}} */
  const result = {};

  for (const filename of filesIncludingString) {
    const content = await readFile(filename, 'utf-8');
    const tentative = await overrideToc(content);

    if (!tentative) {
      continue;
    }

    result[filename] = tentative === content ? null : tentative;
  }

  return result;
}

/**
 * Entry point for the `amp markdown-toc` task.
 * @return {Promise<void>}
 */
async function markdownToc() {
  const result = await overrideTocGlob('.');
  let errored = false;
  for (const filename in result) {
    if (filename.indexOf('markdown-toc/') >= 0) {
      continue;
    }
    const tentative = result[filename];
    if (!tentative) {
      logOnSameLineLocalDev(green('Checked: ') + filename);
    } else {
      try {
        writeDiffOrFail('markdown-toc', filename, tentative);
      } catch (_) {
        errored = true;
      }
    }
  }
  if (errored) {
    throw new Error('Files are outdated');
  }
}

module.exports = {
  headerRegExpForTesting: headerRegexp,
  markdownToc,
  overrideTocGlob,
  overrideToc,
};

markdownToc.description =
  'Update all markdown files that contain a table of contents';

markdownToc.flags = {
  'fix': 'Update the list and write results to file',
};
