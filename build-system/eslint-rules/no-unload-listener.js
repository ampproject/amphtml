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
'use strict';

module.exports = function (context) {
  const listenMethodNames = [
    'listen',
    'listenPromise',
    'listenOnce',
    'listenOncePromise',
  ];
  const listenCall = listenMethodNames
    .map((m) => `CallExpression[callee.name=${m}]`)
    .join(',');
  const addEventListenerCall =
    'CallExpression[callee.property.name=addEventListener]';
  const call = `${listenCall},${addEventListenerCall}`;

  const displayMessage = [
    'Do not add "unload" or "beforeunload" listeners because they break the back/forward cache.',
    'Use the "pagehide" event instead, and if needed check `!event.persisted`.',
  ].join('\n\t');

  return {
    [call]: function (node) {
      const {callee} = node;
      const {name} = callee;
      const argIndex = name && name.lastIndexOf('listen', 0) == 0 ? 1 : 0;
      const arg = node.arguments[argIndex];
      if (!arg) {
        return;
      }

      const comments = context.getCommentsBefore(arg);
      const ok = comments.some((comment) => comment.value === 'OK');
      if (ok) {
        return;
      }

      const {value, type} = arg;
      if (type !== 'Literal' || typeof value !== 'string') {
        return;
      }

      if (value === 'unload' || value === 'beforeunload') {
        context.report({
          node: arg,
          message: displayMessage,
        });
      }
    },
  };
};
