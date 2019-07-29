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

/**
 * @fileoverview Indirects log messages through expansion calls with
 * base62-encoded ([0-9a-zA-Z]) ids.
 *
 *    dev().assert(foo != bar, 'foo should not be bar')
 *    // 👇
 *    dev().assert(foo != bar, ['1z'])
 *
 * `assert is overloaded so array syntax causes lookup of the message template
 * and expansion of the message, or returning a URL where the interpolated
 * message is displayed.
 *
 * Additionally outputs a JSON table containing {message: {...item}}. This table
 * is "backwards" for deduping, to key by id its rows should be reversed
 * separately.
 *
 * When the template has arguments they are nested into the expansion method:
 *
 *    dev().assert(false, '%s should not be %s.', foo, bar)
 *    // 👇
 *    dev().assert(false, ['e2', foo, bar])
 *
 * It also nests arguments of template literals:
 *
 *    dev().assert(false, `Hello, my dear ${name}`);
 *    // 👇
 *    dev().assert(false, ['0a', name]);
 *
 * The motivation of this transform is to reduce binary size. Resulting minified
 * compressed binaries are reduced by ~2.8% depending on logging density.
 */
const base62ascii = require('base62/lib/ascii');
const fs = require('fs-extra');
const {
  assertAliases,
  singletonFunctions,
  transformableMethods,
} = require('../../log-module-metadata.js');

// Considered default for this transform, configurable only for tests.
// For other files output from this transform see linked module.
const {extractedPath} = require('../../compile/log-messages');

/**
 * Approximate length of a nested argument to determine whether a message
 * being indirected actually reduces binary size.
 */
const roughNestedLength = '["xx"]'.length;

/**
 * @param {string} path
 * @return {string}
 */
const relativeToRoot = path => `${__dirname}/../../../${path}`;

module.exports = function({types: t}) {
  let messages;
  let nextMessageId;
  let messagesPath;

  let shouldReplaceCallArguments;

  /**
   * @param {string} message
   * @return {string} Short message id.
   */
  function getOrCreateMessageId(message) {
    if (message in messages) {
      return messages[message].id;
    }
    const id = base62ascii.encode(nextMessageId++); // [0-9a-zA-Z]
    messages[message] = {id, message};
    return id;
  }

  /**
   * Builds a message template using printf syntax from a starting node.
   * @param {!Node} node
   * @param {!Array<!Node>} interpolationArgs
   * @return {string} Template for the message.
   */
  function buildMessageSprintf(node, interpolationArgs) {
    if (t.isStringLiteral(node)) {
      return node.value;
    }

    if (t.isBinaryExpression(node, {operator: '+'})) {
      return (
        buildMessageSprintf(node.left, interpolationArgs) +
        buildMessageSprintf(node.right, interpolationArgs)
      );
    }

    if (t.isTemplateLiteral(node)) {
      let quasied = '';
      let i = 0;
      for (; i < node.quasis.length - 1; i++) {
        quasied += node.quasis[i].value.cooked;
        quasied += buildMessageSprintf(node.expressions[i], interpolationArgs);
      }
      quasied += node.quasis[i].value.cooked;
      return quasied;
    }

    interpolationArgs.push(node);
    return '%s';
  }

  /**
   * @param {!Node} node
   * @return {../../log-module-metadata.LogMethodMetadataDef}
   */
  function getTransformableCalleeMeta({callee}) {
    if (assertAliases.some(name => t.isIdentifier(callee, {name}))) {
      return transformableMethods.assert;
    }
    // is method().call().
    if (!t.isMemberExpression(callee) || !t.isCallExpression(callee.object)) {
      return;
    }
    // is either dev() or user() object.
    const singletonCallee = callee.object.callee;
    if (
      !singletonFunctions.some(name => t.isIdentifier(singletonCallee, {name}))
    ) {
      return;
    }
    if (!t.isIdentifier(callee.property)) {
      return;
    }
    // callee property is transformable method, otherwise undefined.
    return transformableMethods[callee.property.name];
  }

  return {
    /** Resolves plugin config. */
    pre() {
      // Temporary option to not replace call arguments, but still output the
      // table to keep build code and infra independent from rollout.
      const {replaceCallArguments = true} = this.opts;
      shouldReplaceCallArguments = replaceCallArguments;

      // Configurable to isolate test output.
      messagesPath = relativeToRoot(this.opts.messagesPath || extractedPath);

      // Read table.
      messages = fs.readJsonSync(messagesPath, {throws: false}) || {};
      nextMessageId = Object.keys(messages).length;
    },
    visitor: {
      /** Write table on every exit. */
      Program: {
        exit() {
          fs.outputJsonSync(messagesPath, messages, {spaces: 2});
        },
      },
      /**
       * Visits call expressions for known log assertion/error methods.
       * @param {*} path babel.path
       */
      CallExpression({node}) {
        const meta = getTransformableCalleeMeta(node);
        if (!meta) {
          return;
        }

        const {extractMessages, messageArgPos} = meta;
        if (!extractMessages) {
          return;
        }

        const messageArg = node.arguments[messageArgPos];
        if (!messageArg) {
          return;
        }

        // Recursively construct sprintf template from arguments.
        const templateArgs = [];
        const message = buildMessageSprintf(messageArg, templateArgs);

        // Bounce when indirection does nothing (±1 byte delta). (Also catches
        // the case when its template is exactly `%s`).
        if (message.length <= roughNestedLength) {
          return;
        }

        const idLiteral = t.stringLiteral(getOrCreateMessageId(message));

        if (!shouldReplaceCallArguments) {
          return;
        }

        const variadicArgs = node.arguments.slice(messageArgPos + 1);

        // Keep leading arguments in place.
        node.arguments.length = messageArgPos;

        node.arguments.push(
          // Arg order implicitly depends on `no-mixed-interpolation` lint rule.
          t.arrayExpression([idLiteral, ...variadicArgs, ...templateArgs])
        );
      },
    },
  };
};
