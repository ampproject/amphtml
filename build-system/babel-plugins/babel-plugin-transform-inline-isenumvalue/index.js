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

/**
 * @fileoverview
 * Takes isEnumValue() calls and replaces them with a smaller form that only
 * requires the enum object's values, and not its property keys.
 *
 * In:
 *     isEnumValue({FOO: 'foo', BAR: 'bar'}, x);
 * Out:
 *     x === 'foo' || x === 'bar'
 */

module.exports = function (babel) {
  const {types: t} = babel;

  return {
    name: 'transform-inline-isenumvalue',
    visitor: {
      CallExpression(path) {
        const callee = path.get('callee');
        if (!callee.isIdentifier({name: 'isEnumValue'})) {
          return;
        }
        const enumArg = path.get('arguments.0');
        const {confident, value} = enumArg.evaluate();
        if (!confident) {
          // throw path.buildCodeFrameError('Cannot evaluate. Is it imported?');
          return;
        }
        const [enumNode, subject] = path.node.arguments;

        // x === 1 || x === 2 || x === 3 || ...
        const expression = Object.keys(value)
          .map((key) =>
            t.binaryExpression(
              '===',
              t.cloneNode(subject),
              t.memberExpression(t.cloneNode(enumNode), t.identifier(key))
            )
          )
          .reduce((a, b) => t.logicalExpression('||', a, b));
        path.replaceWith(expression);
      },
    },
  };
};
