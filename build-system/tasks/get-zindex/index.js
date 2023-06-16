'use strict';

const fastGlob = require('fast-glob');
const fs = require('fs');
const path = require('path');
const Postcss = require('postcss');
const prettier = require('prettier');
const {getZindexJs} = require('./js');
const {gray, magenta} = require('kleur/colors');
const {logLocalDev, logOnSameLineLocalDev} = require('../../common/logging');
const {writeDiffOrFail} = require('../../common/diff');

/** @type {Postcss.default} */
const postcss = /** @type {*} */ (Postcss);

const tableHeaders = ['context', 'z-index', 'file'];

const preamble = `
**Run \`amp get-zindex --fix\` to generate this file.**

<!-- markdown-link-check-disable -->
`.trim();

const logChecking = (filename) =>
  logOnSameLineLocalDev(gray(path.basename(filename)));

const sortedByEntryKey = (a, b) => a[0].localeCompare(b[0]);

/**
 * @param {!{[key: string]: string}} acc accumulator object for selectors
 * @param {!Postcss.Rule} css post css rules object
 */
function zIndexCollector(acc, css) {
  css.walkRules((rule) => {
    rule.walkDecls((decl) => {
      // Split out multi selector rules
      if (decl.prop == 'z-index') {
        rule.selector
          .replace('\n', '')
          .split(',')
          .forEach((selector) => {
            // If multiple redeclaration of a selector and z index
            // are done in a single file, this will get overridden.
            acc[selector.trim()] = decl.value;
          });
      }
    });
  });
}

/**
 * @param {!{[key: string]: !{[key: string]: !Array<number>}}} filesData
 *    accumulation of files and the rules and z index values.
 * @return {!Array<!Array<string>>}
 */
function createTable(filesData) {
  const rows = [];
  for (const filename of Object.keys(filesData).sort()) {
    // JS entries are Arrays of Arrays since they can have duplicate contexts
    // like [['context', 9999]]
    // CSS entries are Obejcts since they should not have duplicate selectors
    // like {'.selector': 9999}
    const entry = Array.isArray(filesData[filename])
      ? filesData[filename]
      : Object.entries(filesData[filename]).sort(sortedByEntryKey);
    // @ts-ignore
    for (const [context, zIndex] of entry) {
      rows.push([`\`${context}\``, zIndex, `[${filename}](/${filename})`]);
    }
  }
  rows.sort((a, b) => {
    const aZIndex = parseInt(a[1], 10);
    const bZIndex = parseInt(b[1], 10);
    // Word values sorted lexicographically.
    if (isNaN(aZIndex) && isNaN(bZIndex)) {
      return a[1].localeCompare(b[1]);
    }
    // Word values before length values.
    if (isNaN(aZIndex)) {
      return -1;
    }
    if (isNaN(bZIndex)) {
      return 1;
    }
    // By length descending.
    return bZIndex - aZIndex;
  });
  return rows;
}

/**
 * Extract z-index selectors from all files matching the given glob starting at
 * the given working directory
 * @param {string|Array<string>} glob
 * @param {string=} cwd
 * @return {Promise<Object>}
 */
async function getZindexSelectors(glob, cwd = '.') {
  const filesData = Object.create(null);
  const files = await fastGlob(glob, {cwd});
  for (const file of files) {
    const contents = await fs.promises.readFile(path.join(cwd, file), 'utf-8');
    const selectors = Object.create(null);
    const plugins = [zIndexCollector.bind(null, selectors)];
    logChecking(file);
    await postcss(plugins).process(contents, {from: file});
    if (Object.keys(selectors).length) {
      filesData[file] = selectors;
    }
  }
  return filesData;
}

/**
 * @param {string|Array<string>} glob
 * @param {string=} cwd
 * @return {!Promise<Object>}
 */
async function getZindexChainsInJs(glob, cwd = '.') {
  const files = (await fastGlob(glob, {cwd})).map((file) =>
    path.join(cwd, file)
  );

  const resultEntries = await Promise.all(
    files.map(async (filename) => {
      logChecking(filename);
      const relative = path.relative(cwd, filename);
      const found = await getZindexJs(filename);
      return [relative, found];
    })
  );

  return Object.fromEntries(
    resultEntries
      // eslint-disable-next-line local/no-deep-destructuring
      .filter(([, {length}]) => length)
  );
}

/**
 * Entry point for amp get-zindex
 * @return {Promise<void>}
 */
async function getZindex() {
  logLocalDev('...');

  const filesData = Object.assign(
    {},
    ...(await Promise.all([
      getZindexSelectors([
        '{css,src,extensions}/**/*.css',
        '!**/dist/**/*.css',
      ]),
      getZindexChainsInJs([
        '{3p,src,extensions}/**/*.js',
        '!**/dist/**/*.js',
        '!extensions/**/test/**/*.js',
        '!extensions/**/storybook/**/*.js',
      ]),
    ]))
  );

  logOnSameLineLocalDev(
    'Generating z-index table from',
    magenta(`${Object.keys(filesData).length} files`)
  );

  const filename = 'css/Z_INDEX.md';
  const rows = [
    tableHeaders,
    tableHeaders.map(() => '-'),
    ...createTable(filesData),
  ];
  const table = rows.map((row) => row.join(' | ')).join('\n');
  const output = await prettierFormat(filename, `${preamble}\n\n${table}`);

  await writeDiffOrFail(
    'get-zindex',
    filename,
    output,
    /* gitDiffFlags */ [
      '-U1',
      // Rows are formatted to align, so rows with unchanged content may change
      // in whitespace, forcing the diff to contain the entire table.
      '--ignore-space-change',
    ]
  );
}

/**
 * @param {string} filename
 * @param {string} output
 * @return {Promise<string>}
 */
async function prettierFormat(filename, output) {
  return prettier.format(output, {
    ...(await prettier.resolveConfig(filename)),
    parser: 'markdown',
  });
}

module.exports = {
  createTable,
  getZindex,
  getZindexSelectors,
  getZindexChainsInJs,
};

getZindex.description =
  'Run through all css files in the repo to gather z-index values';

getZindex.flags = {
  'fix': 'Write the results to file',
};
