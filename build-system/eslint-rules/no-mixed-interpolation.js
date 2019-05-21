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

const {transformableMethods} = require('../log-module-metadata');

/**
 * @typedef {{
 *   name: string.
 *   variadle: boolean,
 *   startPos: number
 * }}
 */
let LogMethodMetadataDef;

/**
 * @param {!Node} node
 * @return {boolean}
 */
function isBinaryConcat(node) {
  return node.type === 'BinaryExpression' && node.operator === '+';
}

/**
 * @param {!Node} node
 * @return {boolean}
 */
function isLiteralString(node) {
  return node.type === 'Literal' && typeof node.value === 'string';
}

/**
 * @param {!Node} node
 * @return {boolean}
 */
function hasTemplateLiteral(node) {
  if (node.type === 'TemplateLiteral') {
    return true;
  }

  // Allow for string concatenation operations.
  if (isBinaryConcat(node)) {
    return hasTemplateLiteral(node.left) && hasTemplateLiteral(node.right);
  }

  return false;
}

/**
 * @param {string} name
 * @return {!LogMethodMetadataDef}
 */
function getMetadata(name) {
  return transformableMethods.find(cur => cur.name === name);
}

const selector = transformableMethods
  .map(method => {
    return `CallExpression[callee.property.name=${method.name}]`;
  })
  .join(',');

module.exports = {
  create(context) {
    return {
      [selector]: function(node) {
        // Don't evaluate or transform log.js
        if (context.getFilename().endsWith('src/log.js')) {
          return;
        }
        // Make sure that callee is a CallExpression as well.
        // dev().assert() // enforce rule
        // dev.assert() // ignore
        const {callee} = node;
        const calleeObject = callee.object;
        if (!calleeObject || calleeObject.type !== 'CallExpression') {
          return;
        }

        // Make sure that the CallExpression is one of dev() or user().
        if (!['dev', 'user'].includes(calleeObject.callee.name)) {
          return;
        }

        const methodInvokedName = callee.property.name;
        // Find the position of the argument we care about.
        const metadata = getMetadata(methodInvokedName);

        // If there's no metadata, this is most likely a test file running
        // private methods on log.
        if (!metadata) {
          return;
        }

        const argToEval = node.arguments[metadata.startPos];

        if (!argToEval) {
          return;
        }

        const errMsg = [
          'Mixing Template Strings and %s interpolation for log methods is',
          `not supported on ${metadata.name}. Please either use template `,
          'literals or use the log strformat(%s) style interpolation ',
          'exclusively',
        ].join(' ');

        // If method is not variadic we don't need to check.
        if (!metadata.variadic) {
          return;
        }

        const hasVariadicInterpolation = node.arguments[metadata.startPos + 1];

        if (hasVariadicInterpolation && hasTemplateLiteral(argToEval)) {
          context.report({
            node: argToEval,
            message: errMsg,
          });
        }
      },
    };
  },
};
