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
 * base36-encoded message ids. These redirect to a URL or look up a message
 * table to interpolate and display the logged string.
 *
 *    dev().assert(foo != bar, 'foo should not be bar')
 *    // transforms into 👇
 *    dev().assert(foo != bar, ['1z'])
 *
 * `assert is overloaded so array syntax causes lookup of the message template
 * and expansion of the message, or displaying a URL where the interpolated
 * message is displayed.
 *
 * Additionally outputs a JSON file containing [template, id] pairs keyed by
 * message template. This table is "backwards" for deduping, to key by id its
 * rows should be reversed separately.
 *
 * When the template has arguments they are nested into the expansion method:
 *
 *    dev().assert(false, '%s should not be %s.', foo, bar)
 *    // transforms into 👇
 *    dev().assert(false, ['e2', foo, bar])
 *
 * It also nests arguments of template literals:
 *
 *    dev().assert(false, `Hello, my dear ${name}`);
 *    // transforms into 👇
 *    dev().assert(false, ['0a', name]);
 *
 * The motivation of this transform is to reduce binary size. The average length
 * of a log message is ~43 whereas the common minified transformed output (as
 * `['xx']`) is just 6.
 *
 * Resulting compressed, minified binaries reduce size by ~2.8% depending on
 * their logging density.
 */
const base62 = require('base62/lib/ascii');
const fs = require('fs');
const path = require('path');
const {
  messagesPath,
  singletonFunctions,
  transformableMethods,
} = require('../../log-module-metadata.js');

/**
 * Approximate length of a compressed message expansion call to determine
 * whether an instance of message indirection actually reduces binary size.
 */
const roughMinifiedExpansionLength = '["xx"]'.length;

const assertAliases = singletonFunctions.map(prefix => `${prefix}Assert`);

/**
 * Determines a filepath relative to the repo root.
 * @param {string} path
 * @return {string}
 */
const relativeToRoot = path => `${__dirname}/../../../${path}`;

/**
 * Reads the messages table from the JSON file.
 * @param {string} messagesPath
 * @return {!Object<string, string>}
 */
function getMessages(messagesPath) {
  try {
    return JSON.parse(fs.readFileSync(messagesPath));
  } catch {
    // When non-existent or empty just return an empty object. Transformations
    // that read will write as well.
    return {};
  }
}

/**
 * Writes the messages table to the JSON file.
 * @param {string} messagesPath
 * @param {!Object<string, string>} obj
 */
function writeMessages(messagesPath, obj) {
  const json = JSON.stringify(obj, /* replacer */ null, /* spaces */ 2);
  const messagesPathDir = path.dirname(messagesPath);
  if (!fs.existsSync(messagesPathDir)) {
    fs.mkdirSync(messagesPathDir);
  }
  fs.writeFileSync(messagesPath, json);
}

/**
 * Gets a message id from the table, or adds a new entry for a message if
 * non-existent and returns its new id.
 * @param {Object<string, string>} messages
 * @param {string} message
 * @param {function():number} getMessageId
 * @return {string} Short message id.
 */
function getOrCreateShortMessageId(messages, message, getMessageId) {
  if (messages[message]) {
    return messages[message];
  }
  // Base-62 radix for best utilization of ascii space.
  const shortMessageId = base62.encode(getMessageId());
  messages[message] = shortMessageId;
  return shortMessageId;
}

/**
 * Builds a message template using printf syntax from a starting node.
 * @param {@babel/types} t
 * @param {!Node} node
 * @param {!Array<!Node>} interpolationArgs
 * @return {string} Template for the message.
 */
function buildMessage(t, node, interpolationArgs) {
  if (t.isStringLiteral(node)) {
    return node.value;
  }

  if (t.isBinaryExpression(node, {operator: '+'})) {
    return (
      buildMessage(t, node.left, interpolationArgs) +
      buildMessage(t, node.right, interpolationArgs)
    );
  }

  if (t.isTemplateLiteral(node)) {
    let quasied = '';
    let i = 0;
    for (; i < node.quasis.length - 1; i++) {
      quasied += node.quasis[i].value.cooked;
      quasied += buildMessage(t, node.expressions[i], interpolationArgs);
    }
    quasied += node.quasis[i].value.cooked;
    return quasied;
  }

  interpolationArgs.push(node);
  return '%s';
}

let messages;
let nextMessageId;
let relativeMessagesPath;

let shouldReplaceCallArguments = true;

/** @return {number} */
const getMessageId = () => nextMessageId++;

module.exports = function({types: t}) {
  return {
    /** Resolves plugin config. */
    pre() {
      // Temporary option to not replace call arguments, but still output the
      // table to keep build code and infra independent from rollout.
      if (this.opts.replaceCallArguments !== undefined) {
        shouldReplaceCallArguments = this.opts.replaceCallArguments;
      }

      // Configurable to isolate test output.
      relativeMessagesPath = relativeToRoot(
        this.opts.messagesPath || messagesPath
      );
    },
    visitor: {
      /** Message table I/O. */
      Program: {
        enter() {
          messages = getMessages(relativeMessagesPath);
          nextMessageId = Object.keys(messages).length;
        },
        exit() {
          writeMessages(relativeMessagesPath, messages);
        },
      },
      /**
       * Visits call expressions for known log assertion/error methods.
       * @param {*} path babel.path
       */
      CallExpression({node}) {
        const {callee} = node;

        // Transformable method metadata when available;
        let meta;

        // devAssert() or userAssert() call.
        if (assertAliases.some(name => t.isIdentifier(callee, {name}))) {
          meta = transformableMethods.assert;
        } else {
          // Looks like a method().call().
          if (
            !t.isMemberExpression(callee) ||
            !t.isCallExpression(callee.object)
          ) {
            return;
          }

          // is either dev() or user() object.
          const singletonCallee = callee.object.callee;
          if (
            !singletonFunctions.some(name =>
              t.isIdentifier(singletonCallee, {name})
            )
          ) {
            return;
          }

          // object property is transformable method.
          const {property} = callee;
          if (
            !t.isIdentifier(property) ||
            !(property.name in transformableMethods)
          ) {
            return;
          }

          meta = transformableMethods[property.name];
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
        const message = buildMessage(t, messageArg, templateArgs);

        // Bounce when indirection increases minified size (±1 byte). Also
        // catches the the case where the top-level message is variable (ie.
        // when its template is exactly '%s'), in which indirection would be
        // pointless.
        if (message.length <= roughMinifiedExpansionLength) {
          return;
        }

        const shortMessageId = getOrCreateShortMessageId(
          messages,
          message,
          getMessageId
        );

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
          t.arrayExpression([
            t.stringLiteral(shortMessageId),
            ...bodyArgs,
            ...templateArgs,
          ])
        );
      },
    },
  };
};
