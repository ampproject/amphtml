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
 * base62-encoded ([0-9a-zA-Z]) ids. These redirect to a URL or look up a table
 * to interpolate and display the logged string.
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
const {messagesByMessagePath} = require('../../compile/log-messages');

/**
 * Approximate length of a compressed message expansion call to determine
 * whether an instance of message indirection actually reduces binary size.
 */
const roughMinifiedExpansionLength = '["xx"]'.length;

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
  function buildMessage(node, interpolationArgs) {
    if (t.isStringLiteral(node)) {
      return node.value;
    }

    if (t.isBinaryExpression(node, {operator: '+'})) {
      return (
        buildMessage(node.left, interpolationArgs) +
        buildMessage(node.right, interpolationArgs)
      );
    }

    if (t.isTemplateLiteral(node)) {
      let quasied = '';
      let i = 0;
      for (; i < node.quasis.length - 1; i++) {
        quasied += node.quasis[i].value.cooked;
        quasied += buildMessage(node.expressions[i], interpolationArgs);
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
      messagesPath = relativeToRoot(
        this.opts.messagesPath || messagesByMessagePath
      );

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

        // Construct a printf template from the argument set. There could be
        // non-string types among string literals in variadic calls, so the
        // template includes them as interpolated arguments.
        const templateArgs = [];
        const message = buildMessage(messageArg, templateArgs);

        // Bounce when indirection increases minified size (±1 byte). Also
        // catches the the case where the top-level message is variable (ie.
        // when its template is exactly '%s'), in which indirection would be
        // pointless.
        if (message.length <= roughMinifiedExpansionLength) {
          return;
        }

        const id = getOrCreateMessageId(message);

        if (!shouldReplaceCallArguments) {
          return;
        }

        // We care only about message arguments beyond the first (ie. the body):
        // all previous method arguments (ie. the head) should stay in place.
        // The body is nested into an array expression, after the template id.
        const bodyArgs = node.arguments.slice(messageArgPos + 1);

        // Truncate to keep head arguments.
        node.arguments.length = messageArgPos;

        // Interpolation order breaks badly when template literals are mixed
        // with variadic calls. This transform implicitly depends on the
        // `no-mixed-interpolation` lint rule to prevent such usage.
        node.arguments.push(
          t.arrayExpression([t.stringLiteral(id), ...bodyArgs, ...templateArgs])
        );
      },
    },
  };
};
