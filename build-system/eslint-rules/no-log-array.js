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

const {
  assertAliases,
  definitionFile,
  singletonFunctions,
  transformableMethods,
} = require('../log-module-metadata.js');

const selector = Object.keys(transformableMethods)
  .map(name => `CallExpression[callee.property.name=${name}]`)
  .concat(assertAliases.map(name => `CallExpression[callee.name=${name}]`))
  .join(',');

module.exports = {
  create(context) {
    return {
      [selector]: function(node) {
        // Don't evaluate or transform log.js
        if (context.getFilename().endsWith(definitionFile)) {
          return;
        }

        let methodInvokedName;

        // Make sure that callee is a CallExpression as well.

        const {callee} = node;

        // userAssert() and devAssert() aliases
        if (
          callee.type == 'Identifier' &&
          assertAliases.includes(callee.name)
        ) {
          methodInvokedName = 'assert';
        } else {
          // dev().assert() // enforce rule
          // dev.assert() // ignore
          const calleeObject = callee.object;
          if (!calleeObject || calleeObject.type !== 'CallExpression') {
            return;
          }

          // Make sure that the CallExpression is one of dev() or user().
          if (!singletonFunctions.includes(calleeObject.callee.name)) {
            return;
          }

          methodInvokedName = callee.property.name;
        }

        // Find the position of the argument we care about.
        const metadata = transformableMethods[methodInvokedName];

        // If there's no metadata, this is most likely a test file running
        // private methods on log.
        if (!metadata) {
          return;
        }

        const {messageArgPos} = metadata;

        const argToEval = node.arguments[messageArgPos];
        if (!argToEval || argToEval.type != 'ArrayExpression') {
          return;
        }

        const errMsg =
          `Don't pass an array to ${methodInvokedName}. ` +
          'Array syntax is to be used by compiled output only. ' +
          'Use variadic or sprintf (%s) syntax.';

        context.report({
          node: argToEval,
          message: errMsg,
        });
      },
    };
  },
};
