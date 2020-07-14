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
const gulp = require('gulp');
const PluginError = require('plugin-error');
const postcss = require('postcss');
const prettier = require('prettier');
const table = require('text-table');
const through = require('through2');

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
 * @param {!Vinyl} file vinyl fs object
 * @param {string} enc encoding value
 * @param {function(err: ?Object, data: !Vinyl|string)} cb chunk data through
 */
function onFileThrough(file, enc, cb) {
  if (file.isNull()) {
    cb(null, file);
    return;
  }

  if (file.isStream()) {
    cb(new PluginError('size', 'Stream not supported'));
    return;
  }

  const selectors = Object.create(null);

  postcss([zIndexCollector.bind(null, selectors)])
    .process(file.contents.toString(), {
      from: file.relative,
    })
    .then(() => {
      cb(null, {name: file.relative, selectors});
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
 * @param {string} glob
 * @return {!Stream}
 */
function getZindexStream(glob) {
  return gulp.src(glob).pipe(through.obj(onFileThrough));
}

/**
 * @param {function()} cb
 */
function getZindex(cb) {
  const filesData = Object.create(null);
  // Don't return the stream here since we do a `writeFileSync`
  getZindexStream('{css,src,extensions}/**/*.css')
    .on('data', (chunk) => {
      filesData[chunk.name] = chunk.selectors;
    })
    .on('end', async () => {
      const filename = 'css/Z_INDEX.md';
      const rows = [...tableHeaders, ...createTable(filesData)];
      const tbl = table(rows, tableOptions);
      const output = `${preamble}\n\n${tbl}`;
      fs.writeFileSync(filename, await prettierFormat(filename, output));
      cb();
    });
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
  getZindexStream,
};

getZindex.description =
  'Runs through all css files of project to gather z-index values';
