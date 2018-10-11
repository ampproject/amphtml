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

/**
 * @typedef {{
 *   name: string.
 *   variadle: boolean,
 *   startPos: number
 * }}
 */
let LogMethodMetadataDef;


/**
 * @type {!Array<LogMethodMetadataDef>}
 */
const transformableMethods = [
  {name: 'assert', variadic: false, startPos: 1},
  {name: 'assertString', variadic: false, startPos: 1},
  {name: 'assertNumber', variadic: false, startPos: 1},
  {name: 'assertBoolean', variadic: false, startPos: 1},
  {name: 'assertEnumValue', variadic: false, startPos: 2},
  {name: 'assertElement', variadic: false, startPos: 1},
  {name: 'createExpectedError', variadic: true, startPos: 0},
  {name: 'fine', variadic: true, startPos: 1},
  {name: 'info', variadic: true, startPos: 1},
  {name: 'warn', variadic: true, startPos: 1},
  {name: 'error', variadic: true, startPos: 1},
  {name: 'expectedError', variadic: true, startPos: 1},
  {name: 'createError', variadic: true, startPos: 0},
];

/**
 * @param {!Node} node
 * @return {boolean}
 */
function isMessageString(node) {
  if (node.type === 'Literal') {
    return typeof node.value === 'string';
  }
  // Allow for string concatenation operations.
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    return isMessageString(node.left) && isMessageString(node.right);
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

const expressions = transformableMethods.map(method => {
  return `CallExpression[callee.property.name=${method.name}]`;
}).join(',');


module.exports = function(context) {
  return {
    [expressions]: function(node) {
      // Make sure that callee is a CallExpression as well.
      // dev().assert() // enforce rule
      // dev.assert() // ignore
      const callee = node.callee;
      const calleeObject = callee.object;
      if (!calleeObject ||
          calleeObject.type !== 'CallExpression') {
        return;
      }

      // Make sure that the CallExpression is one of dev() or user().
      if(!['dev', 'user'].includes(calleeObject.callee.name)) {
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

      let errMsg = [
        `Must use a literal string for argument[${metadata.startPos}]`,
        `on ${metadata.name} call.`
      ].join(' ');

      if (metadata.variadic) {
        errMsg += '\n\tIf you want to pass data to the string, use `%s` ';
        errMsg += 'placeholders and pass additional arguments';
      }

      if (!isMessageString(argToEval)) {
        context.report({
          node: argToEval,
          message: errMsg,
        });
      }
    },
  };

};
