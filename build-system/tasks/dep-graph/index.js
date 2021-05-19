/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const open = require('open');
const path = require('path');
const {execOrDie} = require('../../common/exec');

const INCLUDE_GLOB =
  argv.include_glob ||
  `src/{context,core,examiner,experiments,polyfills,preact}`;
const HTML_TPL_PATH = path.join(__dirname, 'graph-viewer.tpl.html');
const HTML_OUT_PATH = path.join(__dirname, 'graph-viewer.html');
const SVG_OUT_PATH = path.join(__dirname, 'dep-graph.svg');

/**
 * Entry point for `amp dep-graph`.
 */
async function depGraph() {
  execOrDie(
    [
      'npx depcruise',
      '--output-type dot',
      `--max-depth ${argv.max_depth || 3}`,
      `-c ${path.join(__dirname, '.dependency-cruiser.js')}`,
      INCLUDE_GLOB,
      `| dot -T svg > ${SVG_OUT_PATH}`,
    ].join(' ')
  );

  writeHtmlFromTpl();
  open(`file://${HTML_OUT_PATH}`);
}

function writeHtmlFromTpl() {
  const svgContent = fs.readFileSync(SVG_OUT_PATH, 'utf8');
  const htmlTpl = fs.readFileSync(HTML_TPL_PATH, 'utf8');
  fs.writeFileSync(
    HTML_OUT_PATH,
    htmlTpl.replace('__SVG_CONTENT__', svgContent)
  );
}

module.exports = {
  depGraph,
};

depGraph.description = 'Generates a dependency graph of key repo directories.';
depGraph.flags = {
  'max_depth': 'Max depth to pursue dependencies outside of included list',
  'include_glob': 'Source files to include in graph',
};
