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

module.exports = function (babel, options = {}) {
  const {types: t} = babel;
  const {version} = options;

  if (!version) {
    throw new Error(
      'Need to specify runtime version as an option to babel transformer'
    );
  }

  return {
    name: 'transform-internal-version',

    visitor: {
      StringLiteral(path) {
        const {node} = path;
        const {value} = node;
        if (!value.includes('$internalRuntimeVersion$')) {
          return;
        }

        const replacement = t.stringLiteral(
          value.replace(/\$internalRuntimeVersion\$/g, version)
        );
        t.inherits(replacement, node);
        path.replaceWith(replacement);
      },

      TemplateElement(path) {
        const {node} = path;
        const {raw, cooked} = node.value;
        if (!raw.includes('$internalRuntimeVersion$')) {
          return;
        }

        const replacement = t.templateElement({
          cooked: cooked.replace(/\$internalRuntimeVersion\$/g, version),
          raw: raw.replace(/\$internalRuntimeVersion\$/g, version),
        });
        t.inherits(replacement, node);
        path.replaceWith(replacement);
      },
    },
  };
};
