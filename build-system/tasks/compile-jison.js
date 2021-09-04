'use strict';

const fastGlob = require('fast-glob');
const fs = require('fs-extra');
const jison = require('jison');
const path = require('path');
const {jisonPath} = require('../test-configs/config');

// set imports for each parser from directory build/parsers/.
const imports = new Map([
  [
    'cssParser',
    "import * as ast from '../../extensions/amp-animation/0.1/parsers/css-expr-ast';",
  ],
  [
    'bindParser',
    "import {AstNode, AstNodeType} from '../../extensions/amp-bind/0.1/bind-expr-defines';\n" +
      "import {tryParseJson} from '../../src/core/types/object/json';",
  ],
]);

/**
 * Builds parsers for extensions with *.jison files.
 * Uses jison file path to name the parser to export.
 * For example, css-expr-impl.jison creates `cssParser`.
 *
 * @param {string} searchDir - directory to compile jison files within.
 * @return {!Promise}
 */
async function compileJison(searchDir = jisonPath) {
  const jisonFiles = await fastGlob(searchDir);
  await Promise.all(
    jisonFiles.map((jisonFile) => {
      const jsFile = path.basename(jisonFile, '.jison');
      const extension = jsFile.replace('-expr-impl', '');
      const parser = extension + 'Parser';
      const newFilePath = `build/parsers/${jsFile}.js`;
      return compileExpr(jisonFile, parser, newFilePath);
    })
  );
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
  await fs.outputFile(newFilePath, out);
}

module.exports = {
  compileJison,
};

compileJison.description =
  'Precompile jison parsers for use during the main build';
