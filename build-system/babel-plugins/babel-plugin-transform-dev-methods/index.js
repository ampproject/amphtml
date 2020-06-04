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

const {resolve, dirname} = require('path');

// This Babel Plugin removes `dev().info(...)` CallExpressions for production ESM builds.
module.exports = function () {
  let devLoggingImported = false;
  return {
    visitor: {
      ImportDeclaration({node}, state) {
        // Only remove the CallExpressions if this module imported the correct method ('dev') from '/log'.
        const {specifiers, source} = node;
        if (!source.value.endsWith('/log')) {
          return;
        }
        specifiers.forEach((specifier) => {
          if (specifier.imported && specifier.imported.name === 'dev') {
            const filepath = resolve(
              dirname(state.file.opts.filename),
              source.value
            );
            if (filepath.endsWith('/amphtml/src/log')) {
              devLoggingImported = true;
            }
          }
        });
      },
      CallExpression(path) {
        if (!devLoggingImported) {
          return;
        }

        const {node} = path;
        const {callee} = node;
        if (callee.type === 'MemberExpression') {
          const {object: obj, property} = callee;
          const {callee: memberCallee} = obj;
          if (
            memberCallee &&
            memberCallee.name === 'dev' &&
            property.name === 'info'
          ) {
            path.remove();
          }
        }
      },
    },
  };
};
