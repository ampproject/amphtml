/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const fs = require('fs');
const globby = require('globby');
const path = require('path');
const postcss = require('postcss');
const prettier = require('prettier');
const tempy = require('tempy');
const textTable = require('text-table');
const {getStdout} = require('../../common/process');
const {readJsonSync} = require('fs-extra');
const {writeDiffOrFail} = require('../../common/diff');

const tableHeaders = [
  ['context', 'z-index', 'file'],
  ['---', '---', '---'],
];

const tableOptions = {
  align: ['l', 'l', 'l'],
  hsep: '   |   ',
};

const preamble = '**Run `gulp get-zindex --fix` to generate this file.**';

const sortedByEntryKey = (a, b) => a[0].localeCompare(b[0]);

/**
 * @param {!Object<string, !Array<number>} acc accumulator object for selectors
 * @param {!Rules} css post css rules object
 */
function zIndexCollector(acc, css) {
  css.walkRules((rule) => {
    rule.walkDecls((decl) => {
      // Split out multi selector rules
      let selectorNames = rule.selector.replace('\n', '');
      selectorNames = selectorNames.split(',');
      if (decl.prop == 'z-index') {
        selectorNames.forEach((selector) => {
          // If multiple redeclaration of a selector and z index
          // are done in a single file, this will get overridden.
          acc[selector] = decl.value;
        });
      }
    });
  });
}

/**
 * @param {!Object<string, !Object<string, !Array<number>} filesData
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
 * @return {Object}
 */
async function getZindexSelectors(glob, cwd = '.') {
  const filesData = Object.create(null);
  const files = globby.sync(glob, {cwd});
  for (const file of files) {
    const contents = await fs.promises.readFile(path.join(cwd, file), 'utf-8');
    const selectors = Object.create(null);
    const plugins = [zIndexCollector.bind(null, selectors)];
    await postcss(plugins).process(contents, {from: file});
    filesData[file] = selectors;
  }
  return filesData;
}

/**
 * @param {string|Array<string>} glob
 * @param {string=} cwd
 * @return {!Promise<Object>}
 */
function getZindexChainsInJs(glob, cwd = '.') {
  const files = globby.sync(glob, {cwd}).map((file) => path.join(cwd, file));
  const filesIncludingString = getStdout(
    ['grep -irl "z-*index"', ...files].join(' ')
  )
    .trim()
    .split('\n');
  return tempy.write.task('{}', (temporary) => {
    getStdout(
      [
        'npx jscodeshift',
        '--dry',
        '--parser babylon',
        `--parser-config ${__dirname}/jscodeshift/parser-config.json`,
        `--transform ${__dirname}/jscodeshift/collect-zindex.js`,
        `--collectZindexToFile=${temporary}`,
        ...filesIncludingString,
      ].join(' ')
    );
    const resultAbsolute = readJsonSync(temporary);
    const result = {};
    for (const key in resultAbsolute) {
      const relative = path.relative(cwd, key);
      result[relative] = resultAbsolute[key].sort(sortedByEntryKey);
    }
    return result;
  });
}

/**
 * Entry point for gulp get-zindex
 */
async function getZindex() {
  const filesData = {
    ...(await getZindexSelectors('{css,src,extensions}/**/*.css')),
    ...(await getZindexChainsInJs([
      '{3p,src,extensions}/**/*.js',
      '!extensions/**/test/**/*.js',
      '!extensions/**/storybook/**/*.js',
    ])),
  };
  const filename = 'css/Z_INDEX.md';
  const rows = [...tableHeaders, ...createTable(filesData)];
  const table = textTable(rows, tableOptions);
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
 * @return {string}
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
  'Runs through all css files of project to gather z-index values';

getZindex.flags = {
  'fix': '  Write to file',
};
