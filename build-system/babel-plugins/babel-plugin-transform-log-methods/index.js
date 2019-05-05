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
 * @fileoverview Indirects log messages through expansion calls with
 * base36-encoded message ids that redirect to to a URL or look up a message
 * table to interpolate and display the logged message.
 *
 * The motivation of this transform is to reduce binary size. The average length
 * of an error message is ~43 whereas the common minified transformed output
 * in the form of `x().l('z2')` is just 11. Since the first part of the output
 * repeats, it also compresses well.
 *
 * Additionally outputs a JSON file containing [message, id] pairs keyed by
 * message string. This table is "backwards" for deduping, to key by id its rows
 * should be reversed independently.
 *
 * Converts:
 *
 *    dev().assert(foo != bar, 'foo should not be bar')
 *
 * into:
 *
 *    dev().assert(foo != bar, dev().getLogUrl('0'))
 *
 * When the message contains arguments, those get passed to the expansion
 * method. The following gets converted:
 *
 *    dev().assert(..., `${foo} should not be ${bar}`)
 *
 * into:
 *
 *    dev().assert(..., dev().getLogUrl('0', foo, bar))
 *
 */

const fs = require('fs');

const logMessagesPath = `${__dirname}/../../log-messages.json`;
const messageExpansionMethod = 'getLogUrl';

/**
 * Positions of the first message argument in the logging methods.
 * @type {!Array<LogMethodMetadataDef>}
 */
const methodsMessageArgPos = {
  assert: 1,
  assertBoolean: 1,
  assertElement: 1,
  assertEnumValue: 2,
  assertNumber: 1,
  assertString: 1,
  createError: 0,
  createExpectedError: 0,
  error: 1,
  expectedError: 1,
  fine: 1,
  info: 1,
  warn: 1,
};

const isTransformableMethod = (t, node, methods) =>
  t.isIdentifier(node) && node.name in methods;

/**
 * Retrieves the error map from the json file.
 * @return {!Object<string, string>}
 */
const getMessageToIdMap = () => JSON.parse(fs.readFileSync(logMessagesPath));

/**
 * Retrieves the error map from the json file.
 * @param {!Object<string, string>} obj
 */
function writeErrorMap(obj) {
  const json = JSON.stringify(obj, /* replacer */ null, /* spaces */ 2);
  fs.writeFileSync(logMessagesPath, json);
}

/**
 * Converts a numeric message id to a base-36 encoded string.
 * @param {number} id
 * @return {string}
 */
const createShortMessageId = id => id.toString(36);

/**
 * Gets a message id from the message map, or adds a new entry for a new
 * message.
 * @param {string} message
 * @return {string}
 */
function getOrCreateShortMessageId(message) {
  const errorMap = getMessageToIdMap();
  if (errorMap[message]) {
    return errorMap[message];
  }
  const shortMessageId = createShortMessageId(Object.keys(errorMap).length + 1);
  errorMap[message] = shortMessageId;
  writeErrorMap(errorMap);
  return shortMessageId;
}

/**
 * Determines whether a callee is either dev() or user() singleton.
 * @param {*} t babel.types
 * @param {Node} callee
 * @return {boolean}
 */
const isLogSingletonCall = (t, callee) =>
  ['dev', 'user'].some(name => t.isIdentifier(callee, {name}));

module.exports = function({types: t}) {
  return {
    visitor: {
      CallExpression(path) {
        const {node} = path;
        const {callee} = node;

        // Test to see if it looks like a method().call()
        const isMemberAndCallExpression =
          t.isMemberExpression(callee) && t.isCallExpression(callee.object);
        if (!isMemberAndCallExpression) {
          return;
        }

        const logCallee = callee.object.callee;
        const {property} = callee;

        // This is dev() or user() call expression with a known method.
        if (
          !isLogSingletonCall(t, logCallee) ||
          !isTransformableMethod(t, property, methodsMessageArgPos)
        ) {
          return;
        }

        const messageArgPos = methodsMessageArgPos[property.name];
        const messageArg = node.arguments[messageArgPos];

        // If there is actually no message argument then bail out on the whole
        // transformation.
        if (!messageArg) {
          return;
        }

        const templateLiteralArgs = [];

        // Construct a String Literal from the argument. This is because
        // There could be other Nodes like Template Literals, Binary
        // Expressions, Method calls etc.
        const message = buildMessage(t, messageArg, templateLiteralArgs);

        const shortMessageId = getOrCreateShortMessageId(message);

        const argsHead = node.arguments.slice(
            0,
            Math.max(0, messageArgPos - 1)
        );

        const argsTail = node.arguments.slice(messageArgPos + 1);

        // Member expression as callee of message expansion method,
        // eg. `dev().getLogUrl`.
        const messageExpansionCallee = t.memberExpression(
            t.callExpression(t.identifier(logCallee.name), []),
            t.identifier(messageExpansionMethod)
        );

        const messageExpansionArgs = [
          t.stringLiteral(shortMessageId),
          t.arrayExpression([...argsTail, ...templateLiteralArgs]),
        ];

        console.log(
            t.callExpression(messageExpansionCallee, messageExpansionArgs)
        );

        node.arguments = [
          ...argsHead,
          // Full expansion call as eg. `dev().getLogUrl(shortId, ...args)`
          t.callExpression(messageExpansionCallee, messageExpansionArgs),
        ];
      },
    },
  };
};

/**
 * @param {*} t babel.types
 * @param {!Node} node
 * @param {!Array<!Node>} otherNodes
 */
function buildMessage(t, node, otherNodes) {
  if (t.isStringLiteral(node)) {
    return node.value;
  }

  if (t.isBinaryExpression(node, {operator: '+'})) {
    return (
      buildMessage(t, node.left, otherNodes) +
      buildMessage(t, node.right, otherNodes)
    );
  }

  if (t.isTemplateLiteral(node)) {
    let quasied = '';
    let i = 0;
    for (; i < node.quasis.length - 1; i++) {
      quasied += node.quasis[i].value.cooked;
      quasied += buildMessage(t, node.expressions[i], otherNodes);
    }
    quasied += node.quasis[i].value.cooked;
    return quasied;
  }

  otherNodes.push(node);
  return '%s';
}
