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

const pathmodule = require('path');
const {addNamed} = require('@babel/helper-module-imports');

module.exports = function (babel, options = {}) {
  const {types: t} = babel;
  const promiseResolveMatcher = t.buildMatchMemberExpression('Promise.resolve');
  const {importFrom = 'src/resolved-promise'} = options;

  return {
    visitor: {
      CallExpression(path) {
        const {node} = path;

        if (node.arguments.length > 0) {
          return;
        }

        const callee = path.get('callee');
        if (!promiseResolveMatcher(callee.node)) {
          return;
        }

        const {filename} = this.file.opts;
        // Ensure the source is relative to the current file by prepending.
        // Relative will return "foo" instead of "./foo". And if it returned
        // a "../foo", making it "./../foo" doesn't hurt.
        const source =
          './' +
          toPosix(
            pathmodule.relative(pathmodule.dirname(filename), importFrom)
          );
        const resolvedPromise = addNamed(path, 'resolvedPromise', source, {
          importedType: 'es6',
        });
        callee.replaceWith(resolvedPromise);
      },
    },
  };
};

// Even though we are using the path module, JS Modules should never have
// their paths specified in Windows format.
function toPosix(path) {
  return path.replace(/\\\\?/g, '/');
}
