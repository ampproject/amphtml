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

module.exports = function (babel) {
  const {types: t} = babel;

  return {
    name: 'ast-transform', // not required
    visitor: {
      MemberExpression(path) {
        const {node} = path;
        const {computed, object, property} = node;

        if (computed) {
          return;
        }
        if (!t.isIdentifier(object, {name: 'props'})) {
          return;
        }
        if (!t.isIdentifier(property)) {
          return;
        }

        const k = t.inherits(t.stringLiteral(property.name), property);
        path.replaceWith(t.memberExpression(object, k, true));
      },

      ObjectPattern(path) {
        const init = path.getSibling('init');

        if (!init.isIdentifier({name: 'props'})) {
          return;
        }

        const props = path.node.properties.map((prop) => {
          const {key} = prop;
          if (prop.computed) {
            return;
          }
          if (!t.isIdentifier(key)) {
            return prop;
          }
          const k = t.inherits(t.stringLiteral(key.name), key);

          return t.objectProperty(k, prop.value, false, false);
        });

        path.replaceWith(t.objectPattern(props));
        path.skip();
      },
    },
  };
};
