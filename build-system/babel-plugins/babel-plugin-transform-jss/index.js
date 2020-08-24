/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Takes a .jss.js file and transforms the `useStyles` export to remove side effects
 * and directly return the classes map.
 *
 * @example
 * In:
 * ```
 * import {createUseStyles} from 'react-jss'
 *
 * const JSS = { button: { fontSize: 12 }}
 * export const CSS = ''
 * export const useStyles = createUseStyles(JSS);
 * ```
 *
 * Out:
 * ```
 * const JSS = { button: { fontSize: 12 }}
 * const classes = {button: 'button-1'}
 * export const useStyles = () => classes;
 * export const CSS = `button-1 { fontSize: 12 }`
 * ```
 */

const {create} = require('jss');
const {default: preset} = require('jss-preset-default');

module.exports = function ({types: t}) {
  function isJssFile(filename) {
    return filename.endsWith('.jss.js');
  }

  function compileJss(JSS) {
    const jss = create();
    jss.setup(preset());
    return jss.createStyleSheet(JSS);
  }

  const isIdent = (path, ident) => path.node.id && path.node.id.name === ident;
  const sheetMap = new WeakMap();

  function findAndCompileJss(path, state) {
    if (sheetMap.has(state.file)) {
      return;
    }

    const topPath = path.findParent((p) => p.parent.type === 'File');
    // Try to find the createUseStyles. The first arg will be the JSS.
    // Compile the JSS and place into the sheetMap.
    topPath.traverse({
      CallExpression(path) {
        if (path.node.callee.name !== 'createUseStyles') {
          return;
        }

        const {confident, value: JSS} = path.get('arguments')[0].evaluate();
        if (!confident) {
          throw new Error(
            `First argument to createUseStyles must be statically evaluatable.`
          );
        }
        sheetMap.set(state.file, compileJss(JSS));
      },
    });
    if (!sheetMap.has(state.file)) {
      throw new Error(`Could not find createUseStyles.`);
    }
  }

  return {
    visitor: {
      VariableDeclarator(path, state) {
        // TODO: Can I skip the whole file if not jss?
        const {filename} = state.file.opts;
        if (!isJssFile(filename)) {
          return;
        }
        findAndCompileJss(path, state);

        if (isIdent(path, 'useStyles')) {
          // Convert classes map to json ast.
          const classesVal = t.objectExpression(
            Object.entries(sheetMap.get(state.file).classes).map(([k, v]) =>
              t.objectProperty(t.identifier(k), t.stringLiteral(v))
            )
          );
          path
            .getStatementParent()
            .insertBefore(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier('classes'), classesVal),
              ])
            );
          path
            .get('init')
            .replaceWith(
              t.arrowFunctionExpression([], t.identifier('classes'))
            );
          path.stop();
        }

        if (isIdent(path, 'CSS')) {
          path
            .get('init')
            .replaceWith(
              t.stringLiteral('`' + sheetMap.get(state.file).toString() + '`')
            );
          path.stop();
        }
      },

      // Remove the import for react-jss
      ImportDeclaration(path, state) {
        const {filename} = state.file.opts;
        if (!isJssFile(filename)) {
          return;
        }

        if (path.node.source.value === 'react-jss') {
          path.remove();
        }
      },
    },
  };
};
