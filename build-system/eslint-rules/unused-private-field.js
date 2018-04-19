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

module.exports = function(context) {
  const regex = /\.(\w+_) =/g;
  return {
    MethodDefinition(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      if (node.kind !== 'constructor') {
        return;
      }

      // Yah, I know, we're not using the AST anymore.
      // But there's no good way to do inner traversals, so this is all we got.
      const source = context.getSourceCode();
      const constructor = source.getText(node);
      const body = source.getText(node.parent).replace(constructor, '');

      let match;
      while ((match = regex.exec(constructor))) {
        const name = match[1];
        const member = context.getNodeByRangeIndex(node.range[0] + match.index);

        if (member) {
          const comments = context.getCommentsBefore(member);
          const testing = comments.some(comment => {
            return comment.value.includes('@visibleForTesting');
          });
          if (testing) {
            continue;
          }
        }

        if (!body.includes(name)) {
          context.report(member || node, `Unused private variable "${name}".` +
              ' If this is used for testing, annotate with "@visibleForTesting".');
        }
      }
    }
  };
};
