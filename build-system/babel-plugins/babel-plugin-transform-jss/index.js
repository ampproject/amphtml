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
 * const useStyles = createStyleSheet({button: { fontSize: 12 }});
 * const CSS = ''
 * ```
 *
 * Out:
 * ```
 * const useStyles = { button: 'button-1' }
 * const CSS = `button-1 { fontSize: 12 }`
 * ```
 */

const {create} = require('jss');
const {default: preset} = require('jss-preset-default');

module.exports = function ({types: t}) {
  function isJssFile(filename) {
    return filename.endsWith('.jss.js');
  }

  function compileJss(filepath) {
    const jss = create();
    jss.setup(preset());
    return jss.createStyleSheet(require(filepath).JSS);
  }

  function multimapAdd(map, key, value) {
    if (!map.has(key)) {
      map.set(key, [value]);
      return;
    }
    map.get(key).push(value);
  }

  function compileJssStatically(JSS) {
    const jss = create();
    jss.setup(preset());
    return jss.createStyleSheet(JSS);
  }

  const isIdent = (path, ident) => path.node.id && path.node.id.name === ident;
  const replaceVal = (path, newValue) => {
    const newNode = t.cloneNode(path.node);
    // TODO: This line is definitely a hack. Fix when Justin notices.
    newNode.init = t.identifier(newValue);
    path.replaceWith(newNode);
  };

  const sheetMap = new WeakMap();
  const pendingUpdates = new WeakMap();
  return {
    visitor: {
      VariableDeclarator(path, state) {
        // TODO: Can I skip the whole file if not jss?
        const {filename} = state.file.opts;
        if (!isJssFile(filename)) {
          return;
        }
        if (!sheetMap.has(state.file)) {
          sheetMap.set(state.file, compileJss(filename));
        }

        if (isIdent(path, 'useStyles')) {
          multimapAdd(pendingUpdates, state.file, () =>
            replaceVal(
              path,
              `() => (${JSON.stringify(sheetMap.get(state.file))})`
            )
          );
          // path.stop();
        }

        if (isIdent(path, 'CSS')) {
          multimapAdd(pendingUpdates, state.file, () =>
            replaceVal(path, '`' + sheetMap.get(state.file).toString() + '`')
          );
          // path.stop();
        }

        if (isIdent(path, 'JSS')) {
          const jssVal = path.evaluate();
          if (!jssVal.confident) {
            throw new Error(`JSS Value must be statically evaluatable.`);
          }
          sheetMap.set(state.file, compileJssStatically(jssVal.val));
        }

        // Run all pending replacements.
        if (sheetMap.has(state.file)) {
          pendingUpdates.get(state.file).forEach((fn) => fn());
        }
      },

      // Convert module.exports into es6 named exports.
      // TODO: how can we get around this?
      AssignmentExpression(path, state) {
        const {filename} = state.file.opts;
        if (!isJssFile(filename)) {
          return;
        }

        const isModuleExport =
          path.node.left.object &&
          path.node.left.property &&
          path.node.left.object.name === 'module' &&
          path.node.left.property.name === 'exports';
        if (!isModuleExport) {
          return;
        }
        const exports = path.node.right.properties
          .map((p) => p.key.name)
          .map((ident) => {
            return t.exportSpecifier(t.identifier(ident), t.identifier(ident));
          });
        path.parentPath.replaceWith(t.exportNamedDeclaration(null, exports));
      },
    },
  };
};
