/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

// This rule asserts that we only grab properties from getMode(), and never
// store a reference to the return value.
//
// Good:
// getMode().foo;
// const x = getMode().test;
//
// Bad:
// const mode = getMode();
// isTest(getMode());
// obj[getMode()];
module.exports = function (context) {
  return {
    'CallExpression[callee.name=getMode]': function (node) {
      if (
        node.parent.type === 'MemberExpression' &&
        node.parent.object === node
      ) {
        return;
      }

      context.report({
        node,
        message:
          'Do not re-alias getMode or its return value so it can be ' +
          "DCE'd. Use explicitly like `getMode().localDev` instead.",
      });
    },
  };
};
