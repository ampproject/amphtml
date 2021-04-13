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
    name: 'simple-array-destructure',

    visitor: {
      ArrayPattern(path) {
        const {parentPath} = path;
        if (!parentPath.isVariableDeclarator()) {
          throw path.buildCodeFrameError(
            'Cannot handle array non-simple array destructure'
          );
        }

        const props = [];
        const {elements} = path.node;
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element === null) {
            continue;
          }

          props.push(t.objectProperty(t.numericLiteral(i), element));
        }
        path.replaceWith(t.objectPattern(props));
      },
    },
  };
};
