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

const {VERSION} = require('../../internal-version') ;

module.exports = function(babel) {
  const {types: t} = babel;
  return {
    name: 'transform-version-call',
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name === 'internalRuntimeVersion') {
          // Detect if we're in a test run and if we are replace the value
          // with a static string.
          if (process.env.JEST_WORKER_ID !== undefined) {
            path.replaceWith(t.stringLiteral('transform-version-call'));
            return;
          }
          path.replaceWith(t.stringLiteral(VERSION));
        }
      },
    },
  };
};
