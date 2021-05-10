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

const fsPath = require('path');
const {accessSync} = require('fs-extra');
const {jsifyCssSync} = require('../../tasks/css/jsify-css-sync');

module.exports = function (babel) {
  const {types: t, template} = babel;
  return {
    visitor: {
      ImportDeclaration(path, state) {
        if (path.node.specifiers.length !== 1) {
          return;
        }
        const source = path.get('source');
        if (!source.isStringLiteral() || !source.node.value.endsWith('.css')) {
          return;
        }
        const specifier = path.get('specifiers.0');
        if (!specifier.isImportDefaultSpecifier()) {
          return;
        }

        const importFilepath = fsPath.join(
          fsPath.dirname(state.file.opts.filename),
          source.node.value
        );

        // Omit references to built files.
        if (importFilepath.includes('/build/')) {
          return;
        }

        // Nonexistent files will error out down the chain once we check for
        // unknown Closure modules.
        try {
          accessSync(importFilepath);
        } catch (_) {
          return;
        }

        try {
          const css = jsifyCssSync(importFilepath);
          const id = t.identifier(specifier.node.local.name);
          const init = t.stringLiteral(css);
          path.replaceWith(template.ast`const ${id} = ${init};`);
        } catch (e) {
          throw path.buildCodeFrameError(`[${importFilepath}] ${e.message}`);
        }
      },
    },
  };
};
