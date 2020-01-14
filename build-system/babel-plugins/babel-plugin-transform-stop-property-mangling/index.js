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

module.exports = function(babel) {
  const {types: t} = babel;

  function toString(identifier) {
    return t.inherits(t.stringLiteral(identifier.name), identifier);
  }

  return {
    name: 'stop-property-mangling',

    visitor: {
      MemberExpression(path) {
        const {node} = path;
        if (node.computed) {
          return;
        }

        const property = path.get('property');
        if (!property.isIdentifier()) {
          return;
        }

        node.computed = true;
        property.replaceWith(toString(property.node));
      },

      'Property|Method': function(path) {
        if (path.node.computed) {
          return;
        }

        const key = path.get('key');
        if (!key.isIdentifier()) {
          return;
        }

        key.replaceWith(toString(key.node));
      },
    },
  };
};
