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
 * const useStyles = createStyleSheet({button: { fileSize: 12 }});
 * ```
 *
 * Out:
 * ```
 * const useStyles = { button: 'button-1' }
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

  const isIdent = (path, ident) => path.node.id && path.node.id.name === ident;
  const replaceVal = (path, newValue) => {
    const newNode = t.cloneNode(path.node);
    newNode.init = t.identifier(newValue);
    path.replaceWith(newNode);
  };

  const sheetMap = new WeakMap();
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
        const sheet = sheetMap.get(state.file);

        if (isIdent(path, 'useStyles')) {
          replaceVal(path, `() => (${JSON.stringify(sheet.classes)})`);
          path.stop();
        }
        if (isIdent(path, 'CSS')) {
          replaceVal(path, '`' + sheet.toString() + '`');
          path.stop();
        }
      },
    },
  };
};
