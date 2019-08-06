/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

module.exports = function({template, types: t}) {
  // eslint-disable-next-line no-eval
  const e = eval;

  return {
    name: 'transform-json-configuration',

    visitor: {
      CallExpression(path) {
        if (path.node.callee.name !== 'jsonConfiguration') {
          return;
        }

        const arg = path.get('arguments.0');
        let json;
        try {
          const obj = e(`(${arg.toString()})`);
          json = JSON.stringify(obj);
        } catch (e) {
          const ref = arg || path;
          throw ref.buildCodeFrameError('failed to JSON configuration');
        }

        const literal = t.templateLiteral(
          [
            t.templateElement({
              cooked: json,
              raw: json,
            }),
          ],
          []
        );
        path.replaceWith(template.expression.ast`
          JSON.parse(${literal})
        `);
      },
    },
  };
};
