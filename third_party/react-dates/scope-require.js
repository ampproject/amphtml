/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const astReplace = require('ast-replace');
const detectGlobals = require('acorn-globals');
const escodegen = require('escodegen');
const rocambole = require('rocambole');

const colors = require('ansi-colors');
const es = require('event-stream');
const fs = require('fs');
const program = require('commander');

/**
 * Changes global `require` calls to be referenced from a given global
 * namespace. e.g. if scopeName is `AMP`, calls will be transformed to
 * `AMP.require`.
 * @param {string} src The contents of a JavaScript source file.
 * @param {string} scopeName The name to prepend to `require` calls.
 * @return {string} The transformed source code
 */
function scopeRequire(src, scopeName) {
  const ast = rocambole.parse(src);
  const globals = detectGlobals(ast);
  const flatGlobals = globals.reduce((acc, g) => acc.concat(g.nodes), []);

  flatGlobals
    .filter(node => isIdentifier(node) && isRequire(node))
    .forEach(node =>
      replaceIdentifier(node.parent, test => test === node, scopeName)
    );

  return escodegen.generate(ast, {format: {compact: true}});
}

/**
 * True if the node is an Identifier node
 * @param {!Object} node An AST node
 * @return {boolean}
 */
function isIdentifier(node) {
  return node.type === 'Identifier';
}

/**
 * True if the node name is `require`
 * @param {!Object} node An AST node
 * @return {boolean}
 */
function isRequire(node) {
  return node.name === 'require';
}

/**
 * Replaces an Identifer node in the AST with a Member node.
 * @param {!Object} ast The AST subtree we are currently mutating.
 * @param {function(!Object):boolean} test Tests if the visitor is on the desired node
 * @param {string} scopeName The name to reference `require` calls from.
 */
function replaceIdentifier(ast, test, scopeName) {
  scopeName = scopeName || 'window';
  const replacement = {
    'Identifier': {
      replace: node => {
        if (node.name !== scopeName) {
          return createMemberNode(node, scopeName);
        }
      },
      test,
    },
  };
  astReplace(ast, replacement);
}

/**
 * Convert the given Identifier node to be referenced from the scope name
 * @param {!Object} identifierNode
 * @param {string} scopeName
 * @return {!Object}
 */
function createMemberNode(identifierNode, scopeName) {
  return {
    'type': 'MemberExpression',
    'object': {
      'type': 'Identifier',
      'name': scopeName,
    },
    'property': identifierNode,
  };
}

program
  .description('Scope global `require` calls to an object.')
  .option(
    '-i, --infile [filename]',
    'The path of the input file. Reads from stdin if unspecified'
  )
  .option(
    '-o, --outfile [filename]',
    'The path for the output file. Writes to stdout if unspecified.'
  )
  .option(
    '-n --name [name]',
    'The name to reference `require` calls from. The default is `AMP`',
    'AMP'
  )
  .parse(process.argv);

const inputStream =
  program.infile && program.infile !== '-'
    ? fs.createReadStream(program.infile)
    : process.stdin;
inputStream.on('error', err => {
  console./*OK*/ error(colors.red('\nError reading file: ' + err.path));
});

const outputStream =
  program.outfile && program.outfile !== '-'
    ? fs.createWriteStream(program.outfile)
    : process.stdout;
outputStream.on('error', err => {
  console./*OK*/ error(colors.red('\nError writing file: ' + err.path));
});

const scopeRequireStream = es.map((inputFile, cb) =>
  cb(null, scopeRequire(inputFile.toString('utf8'), program.name))
);

inputStream
  .pipe(es.wait())
  .pipe(scopeRequireStream)
  .pipe(outputStream);
