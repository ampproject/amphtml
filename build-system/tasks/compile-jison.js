/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const fs = require('fs-extra');
const glob = require('glob');
const jison = require('jison');
const path = require('path');
const {endBuildStep} = require('./helpers');
const {jisonPaths} = require('../test-configs/config');

// set imports for each parser from directory build/parsers/.
const imports = new Map([
  [
    'cssParser',
    "import * as ast from '../../extensions/amp-animation/0.1/parsers/css-expr-ast';",
  ],
  [
    'bindParser',
    "import {AstNode, AstNodeType} from '../../extensions/amp-bind/0.1/bind-expr-defines';\n" +
      "import {tryParseJson} from '../../src/json';",
  ],
]);

/**
 * Builds parsers for extensions with *.jison files.
 * Uses jison file path to name the parser to export.
 * For example, css-expr-impl.jison creates `cssParser`.
 * @return {!Promise<void>}
 */
async function compileJison() {
  fs.mkdirSync('build/parsers', {recursive: true});
  const startTime = Date.now();
  const promises = [];
  jisonPaths.forEach((jisonPath) => {
    glob.sync(jisonPath).forEach((jisonFile) => {
      const jsFile = path.basename(jisonFile, '.jison');
      const extension = jsFile.replace('-expr-impl', '');
      const parser = extension + 'Parser';
      const newFilePath = `build/parsers/${jsFile}.js`;
      promises.push(compileExpr(jisonFile, parser, newFilePath));
    });
  });
  await Promise.all(promises);
  endBuildStep('Compiled Jison parsers into', 'build/parsers/', startTime);
}

/**
 * Helper function that uses jison to generate a parser for the input file.
 * @param {string} jisonFilePath
 * @param {string} parserName
 * @param {string} newFilePath
 * @return {!Promise<void>}
 */
async function compileExpr(jisonFilePath, parserName, newFilePath) {
  const bnf = await fs.readFile(jisonFilePath, 'utf8');
  const settings = {
    type: 'lalr',
    debug: false,
    moduleType: 'js',
  };
  const generator = new jison.Generator(bnf, settings);
  const jsModule = generator.generate(settings);

  const license = fs.readFileSync('build-system/tasks/js-license.txt', 'utf8');
  const suppressCheckTypes =
    '/** @fileoverview ' +
    '@suppress {checkTypes, suspiciousCode, uselessCode} */';
  const jsExports = 'export const ' + parserName + ' = parser;';
  const out =
    [license, suppressCheckTypes, imports.get(parserName), jsModule, jsExports]
      .join('\n\n')
      // Required in order to support babel 7, since 'token-stack: true' will
      // adversely affect lexer performance.
      // See https://github.com/ampproject/amphtml/pull/18574#discussion_r223506153.
      .replace(/[ \t]*_token_stack:[ \t]*/, '') + '\n';
  return fs.writeFile(newFilePath, out);
}

module.exports = {
  compileJison,
};

compileJison.description = 'Use jison to create parsers';
