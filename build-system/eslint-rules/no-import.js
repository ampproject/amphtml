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
'use strict';

const imports = [
  {import: 'sinon', message: 'Importing sinon is forbidden'},
  {
    import: 'preact',
    message:
      "Please import preact from 'src/preact'. This gives us type safety.",
  },
  {
    import: 'preact/hooks',
    message:
      "Please import preact/hooks from 'src/preact'. This gives us type safety.",
  },
];

module.exports = function (context) {
  return {
    ImportDeclaration(node) {
      const comments = context.getCommentsBefore(node.source);
      const ok = comments.some((comment) => comment.value === 'OK');
      if (ok) {
        return;
      }

      const name = node.source.value;

      for (const forbidden of imports) {
        const importSource = forbidden.import;
        if (name === importSource || name.startsWith(`${importSource}/`)) {
          context.report({
            node,
            message: forbidden.message,
          });
        }
      }
    },
  };
};
