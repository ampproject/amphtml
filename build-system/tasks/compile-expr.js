/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
const gulp = require('gulp');
const jison = require('jison');

/**
 * Helper function that uses jison to generate a parser for the input file.
 * @param {string} path
 * @param {string} jisonFilename
 * @param {string} imports
 * @param {string} parserName
 * @param {string} jsFilename
 */
function compileExpr(path, jisonFilename, imports, parserName, jsFilename) {
  const bnf = fs.readFileSync(path + jisonFilename, 'utf8');
  const settings = {
    type: 'lalr',
    debug: false,
    moduleType: 'js',
  };
  const generator = new jison.Generator(bnf, settings);
  const jsModule = generator.generate(settings);

  const license = fs.readFileSync(
      'build-system/tasks/js-license.txt', 'utf8');
  const suppressCheckTypes = '/** @fileoverview ' +
      '@suppress {checkTypes, suspiciousCode, uselessCode} */';
  const jsExports = 'export const ' + parserName + ' = parser;';

  const out = [
    license,
    suppressCheckTypes,
    imports,
    jsModule,
    jsExports]
      .join('\n\n')
      // Required in order to support babel 7, since 'token-stack: true' will
      // adversely affect lexer performance.
      // See https://github.com/ampproject/amphtml/pull/18574#discussion_r223506153.
      .replace(/[ \t]*_token_stack:[ \t]*/, '') + '\n';
  fs.writeFileSync(path + jsFilename, out);
}

function compileAccessExpr() {
  const path = 'extensions/amp-access/0.1/';
  const jisonFilename = 'access-expr-impl.jison';
  const imports = '';
  const parserName = 'accessParser';
  const jsFilename = 'access-expr-impl.js';
  compileExpr(path, jisonFilename, imports, parserName, jsFilename);
}

function compileBindExpr() {
  const path = 'extensions/amp-bind/0.1/';
  const jisonFilename = 'bind-expr-impl.jison';
  const imports = 'import {AstNode, AstNodeType} from \'./bind-expr-defines\';';
  const parserName = 'bindParser';
  const jsFilename = 'bind-expr-impl.js';
  compileExpr(path, jisonFilename, imports, parserName, jsFilename);
}

function compileCssExpr() {
  const path = 'extensions/amp-animation/0.1/parsers/';
  const jisonFilename = 'css-expr-impl.jison';
  const imports = 'import * as ast from \'./css-expr-ast\';';
  const parserName = 'cssParser';
  const jsFilename = 'css-expr-impl.js';
  compileExpr(path, jisonFilename, imports, parserName, jsFilename);
}

gulp.task('compile-access-expr', compileAccessExpr);
gulp.task('compile-bind-expr', compileBindExpr);
gulp.task('compile-css-expr', compileCssExpr);
