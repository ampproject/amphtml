const fastGlob = require('fast-glob');
const {getStdout} = require('../common/process');
const {readFile} = require('fs-extra');
const {writeDiffOrFail} = require('../common/diff');

/** Checks or updates 3rd party video player list on this Markdown file. */
const filepath = 'docs/spec/amp-video-interface.md';

/** Excludes these extensions since they're on a separate list. */
const excludeGeneric = ['amp-video', 'amp-video-iframe'];

/** Determines whether a file belongs to an extension that should be listed. */
const grepJsContent = '@implements {.*VideoInterface}';

/** Finds extension files here. */
const grepJsFiles = 'extensions/**/*.js';

/**
 * Returns a formatted list entry.
 * @param {string} name
 * @return {string}
 */
const entry = (name) =>
  `-   [${name}](https://amp.dev/documentation/components/${name}.md)\n`;

/**
 * Generates Markdown list by finding matching extensions.
 * @return {string}
 */
const generateList = () =>
  getStdout(
    ['grep -lr', `"${grepJsContent}"`, ...fastGlob.sync(grepJsFiles)].join(' ')
  )
    .trim()
    .split('\n')
    .reduce((list, path) => {
      const name = path.substr('extensions/'.length).split('/').shift() ?? '';
      return list + (excludeGeneric.includes(name) ? '' : entry(name));
    }, '');

/**
 * Returns a RegExp that matches the existing list.
 * @return {RegExp}
 */
const getListRegExp = () =>
  new RegExp(
    `(${entry('NAME')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\NAME/g, `((?!${excludeGeneric.join('|')})[a-z0-9-]+)`)})+`,
    'gim'
  );

/**
 * Checks or updates 3rd party video player list.
 * @return {Promise<void>}
 */
async function checkVideoInterfaceList() {
  const current = await readFile(filepath, 'utf-8');
  const tentative = current.replace(getListRegExp(), generateList());
  if (current !== tentative) {
    await writeDiffOrFail('check-video-interface-list', filepath, tentative);
  }
}

module.exports = {
  checkVideoInterfaceList,
};

checkVideoInterfaceList.description =
  'Check 3rd party video player list in amp-video-interface.md';

checkVideoInterfaceList.flags = {
  'fix': 'Update the list and write results to file',
};
