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
const table = require('text-table');

const tableHeaders = [
  ['selector', 'z-index', 'file'],
  ['---', '---', '---'],
];

const tableOptions = {
  align: ['l', 'l', 'l'],
  hsep: '   |   ',
};

const preamble = 'Run `gulp get-zindex` to generate this file.';

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
  Object.keys(filesData)
    .sort()
    .forEach((fileName) => {
      const selectors = filesData[fileName];
      Object.keys(selectors)
        .sort()
        .forEach((selectorName) => {
          const zIndex = selectors[selectorName];
          const row = [selectorName, zIndex, fileName];
          rows.push(row);
        });
    });
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
 * @param {string} glob
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
 * Entry point for gulp get-zindex
 */
async function getZindex() {
  const filesData = await getZindexSelectors('{css,src,extensions}/**/*.css');
  const filename = 'css/Z_INDEX.md';
  const rows = [...tableHeaders, ...createTable(filesData)];
  const tbl = table(rows, tableOptions);
  const output = `${preamble}\n\n${tbl}`;
  fs.writeFileSync(filename, await prettierFormat(filename, output));
}

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
};

getZindex.description =
  'Runs through all css files of project to gather z-index values';
