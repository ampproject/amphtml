/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const typeMap = {
  'assertElement': 'Element',
  'assertString': 'string',
  'assertNumber': 'number',
  'assertBoolean': 'boolean',
  'assertArray': 'Array',
};

const REMOVABLE = {
  dev: [
    'assert',
    'fine',
    'assertElement',
    'assertString',
    'assertNumber',
    'assertBoolean',
    'assertArray',
  ],
  user: ['fine'],
};

module.exports = function(babel) {
  const {types: t, template} = babel;

  /**
   * @param {!NodePath} path
   * @param {!Array<string>} names
   * @return {boolean}
   */
  function isRemovableMethod(path, names) {
    return names.some(name => {
      return path.isIdentifier({name});
    });
  }

  /**
   * @param {!NodePath} path
   * @param {string|undefined} type
   * @param {boolean} assertion
   */
  function eliminate(path, type, assertion) {
    const argument = path.get('arguments.0');
    if (!argument) {
      if (assertion) {
        throw path.buildCodeFrameError('assertion without a parameter!');
      }

      // This is to resolve right hand side usage of expression where
      // no argument is passed in. This bare undefined value is eventually
      // stripped by Closure Compiler.
      path.replaceWith(t.identifier('undefined'));
      return;
    }

    const arg = argument.node;
    if (assertion) {
      const evaluation = argument.evaluate();

      // If we can statically evaluate the value to a falsey expression
      if (evaluation.confident) {
        if (type) {
          if (typeof evaluation.value !== type) {
            path.replaceWith(template.ast`
              (function() {
                throw new Error('static type assertion failure');
              }());
            `);
            return;
          }
        } else if (!evaluation.value) {
          path.replaceWith(template.ast`
            (function() {
              throw new Error('static assertion failure');
            }());
          `);
          return;
        }
      }
    }

    if (type) {
      path.replaceWith(t.parenthesizedExpression(arg));
      // If it starts with a capital, make the type non-nullable.
      if (/^[A-Z]/.test(type)) {
        type = '!' + type;
      }
      // Add a cast annotation to fix type.
      path.addComment('leading', `* @type {${type}} `);
    } else if (!assertion) {
      path.replaceWith(t.parenthesizedExpression(arg));
    }
  }

  return {
    visitor: {
      CallExpression(path) {
        const callee = path.get('callee');

        if (callee.isIdentifier({name: 'devAssert'})) {
          return eliminate(path, '', /* assertion */ true);
        }

        const isMemberAndCallExpression =
          callee.isMemberExpression() &&
          callee.get('object').isCallExpression();

        if (!isMemberAndCallExpression) {
          return;
        }

        const logCallee = callee.get('object.callee');
        let removable = [];

        if (
          logCallee.isIdentifier({name: 'dev'}) ||
          logCallee.isIdentifier({name: 'user'})
        ) {
          removable = REMOVABLE[logCallee.node.name];
        }

        const prop = callee.get('property');
        if (!isRemovableMethod(prop, removable)) {
          return;
        }

        const method = prop.node.name;
        eliminate(
          path,
          typeMap[method],
          /* assertion */ method.startsWith('assert')
        );
      },
    },
  };
};
