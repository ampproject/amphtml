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
 * base36-encoded message ids. These redirect to a URL or look up a message
 * table to interpolate and display the logged string.
 *
 *    dev().assert(foo != bar, 'foo should not be bar')
 *    // transforms into 👇
 *    dev().assert(foo != bar, dev().expandLogMessage('1z'))
 *
 * Where `expandLogMessage` is in charge of looking up and expanding the message
 * string, or returning a URL where the interpolated message is displayed.
 *
 * Additionally outputs a JSON file containing [template, id] pairs keyed by
 * message template. This table is "backwards" for deduping, to key by id its
 * rows should be reversed separately.
 *
 * When the template has arguments they are nested into the expansion method:
 *
 *    dev().assert(false, '%s should not be %s.', foo, bar)
 *    // transforms into 👇
 *    dev().assert(false, dev().expandLogMessage('e2', foo, bar))
 *
 * It also nests arguments of template literals:
 *
 *    dev().assert(false, `Hello, my dear ${name}`);
 *    // transforms into 👇
 *    dev().assert(false, dev().expandLogMessage('0a', name));
 *
 * The motivation of this transform is to reduce binary size. The average length
 * of a log message is ~43 whereas the common minified transformed output (as
 * `x().l('a0')`) is just 11. Since the prefix of the output could repeat
 * throughout a binary, it also compresses well.
 *
 * Resulting binary savings are ~1.5% depending on their logging density.
 */
const fs = require('fs');
const path = require('path');
const {
  singletonFunctions,
  transformableMethods,
} = require('../../log-module-metadata.js');

/**
 * Path to messages file for this version relative to the repo root.
 * This is a default since tests can configure this table's output path, but for
 * all building purposes this should be considered the canonical messages
 * filepath for the built version.
 */
const defaultMessagesPath = 'dist/log-messages.json';

/** Method on `Log` that this transform outputs to "expand" log messages. */
const messageExpansionMethod = 'expandLogMessage';

const roughMinifiedExpansionLength = 'a().b("xx")'.length;

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
 * @param {file} messagesPath
 * @param {string} message
 * @return {string} Short message id.
 */
function getOrCreateShortMessageId(messagesPath, message) {
  const messages = getMessages(messagesPath);
  if (messages[message]) {
    return messages[message];
  }
  // Base-36 radix for best utilization of ascii space.
  const shortMessageId = Object.keys(messages).length.toString(36);
  messages[message] = shortMessageId;
  writeMessages(messagesPath, messages);
  return shortMessageId;
}

/**
 * Builds a message template using printf syntax from a starting node.
 * @param {*} t babel.types
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

module.exports = function({types: t}) {
  return {
    pre() {
      // Configurable to isolate test output.
      const {messagesPath = defaultMessagesPath} = this.opts;
      this.messagesPath = relativeToRoot(messagesPath);
    },
    visitor: {
      CallExpression({node}, {opts}) {
        const {callee} = node;

        // Looks like a method().call().
        if (
          !t.isMemberExpression(callee) ||
          !t.isCallExpression(callee.object)
        ) {
          return;
        }

        const singletonCallee = callee.object.callee;
        if (
          !singletonFunctions.some(name =>
            t.isIdentifier(singletonCallee, {name})
          )
        ) {
          return;
        }

        const {property} = callee;
        if (
          !t.isIdentifier(property) ||
          !(property.name in transformableMethods)
        ) {
          return;
        }

        const {messageArgPos} = transformableMethods[property.name];
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
            this.messagesPath,
            message
        );

        // Temporary option to not replace call arguments, but still output the
        // table to keep other code and infra independent from rollout.
        if (opts.replaceCallArguments === false) {
          return;
        }

        // We care only about message arguments beyond the first (ie. the body):
        // all previous method arguments (ie. the head) should stay in place.
        // The body is nested into the expansion method call, after the template
        // id.
        const headArgs = node.arguments.slice(0, Math.max(0, messageArgPos));
        const bodyArgs = node.arguments.slice(messageArgPos + 1);

        // Callee to expansion method, eg. `dev().expandLogMessage`.
        const messageExpansionCallee = t.memberExpression(
            t.callExpression(t.identifier(singletonCallee.name), []),
            t.identifier(messageExpansionMethod)
        );

        // Interpolation order breaks badly when template literals are mixed
        // with variadic calls. This transform implicitly depends on the
        // `no-mixed-interpolation` lint rule to prevent such usage.
        const expansionCall = t.callExpression(messageExpansionCallee, [
          t.stringLiteral(shortMessageId),
          ...bodyArgs,
          ...templateArgs,
        ]);

        node.arguments = [...headArgs, expansionCall];
      },
    },
  };
};
