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

const {dirname, join: joinPath} = require('path');
const {openSync, readFileSync} = require('fs');

/**
 * @fileoverview
 * Takes isEnumValue() calls and replaces them with a smaller form that only
 * requires the enum object's values, and not its property keys.
 *
 * In:
 *     isEnumValue({FOO: 'foo', BAR: 'bar'}, x);
 * Out:
 *     x === 'foo' || x === 'bar'
 */

module.exports = function (babel) {
  const {types: t, parseSync, traverse} = babel;

  function resolveImportEvaluate(path, filename) {
    const evaluated = path.evaluate();
    if (evaluated.confident) {
      return evaluated;
    }
    if (path.isIdentifier()) {
      const importDeclaration = path.scope.getBinding(path.node.name).path
        .parentPath;
      const specifier = importDeclaration.node.specifiers.find(
        ({local}) => local.name === path.node.name
      );
      if (importDeclaration.isImportDeclaration()) {
        const importPath = joinPath(
          dirname(filename),
          importDeclaration.node.source.value
        );
        let importedFileHandle;
        for (const suffix of ['.js', '/index.js']) {
          try {
            importedFileHandle = openSync(`${importPath}/${suffix}`);
            break;
          } catch (_) {}
        }
        if (importedFileHandle != null) {
          const code = readFileSync(importedFileHandle, 'utf8');
          let evaluated;
          traverse(parseSync(code), {
            Identifier(path) {
              if (path.node.name === specifier.imported.name) {
                if (path.parentPath.isVariableDeclarator()) {
                  evaluated = path.parentPath.get('init').evaluate();
                }
              }
            },
          });
          if (evaluated) {
            return evaluated;
          }
        }
      }
    }
    return {confident: false};
  }

  return {
    name: 'transform-inline-isenumvalue',
    visitor: {
      CallExpression(path, state) {
        const callee = path.get('callee');
        if (!callee.isIdentifier({name: 'isEnumValue'})) {
          return;
        }
        const enumArg = path.get('arguments.0');
        const {confident, value} = resolveImportEvaluate(
          enumArg,
          state.file.opts.filename
        );
        if (!confident) {
          return;
        }
        const [enumNode, subject] = path.node.arguments;

        // x === 1 || x === 2 || x === 3 || ...
        const expression = Object.keys(value)
          .map((key) =>
            t.binaryExpression(
              '===',
              t.cloneNode(subject),
              t.memberExpression(t.cloneNode(enumNode), t.identifier(key))
            )
          )
          .reduce((a, b) => t.logicalExpression('||', a, b));
        path.replaceWith(expression);
      },
    },
  };
};
