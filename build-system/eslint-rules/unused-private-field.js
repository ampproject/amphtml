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
  return {
    MemberExpression(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      const { property } = node;
      if (property.type !== 'Identifier') {
        return;
      }

      const { name } = property;
      if (!name.endsWith('_')) {
        return;
      }

      const comments = context.getCommentsBefore(node);
      const testing = comments.some(comment => {
        return comment.value.includes('@visibleForTesting');
      });
      if (testing) {
        return;
      }

      const ancestors = context.getAncestors(node);
      const constructor = ancestors.reverse().find(node => {
        return node.type === 'MethodDefinition' && node.kind === 'constructor';
      });

      if (!constructor) {
        return
      }

      // Yah, I know, we're not using the AST anymore.
      // But there's no good way to do inner traversals, so this is all we got.
      const source = context.getSourceCode();
      const body = source.getText(constructor.parent).replace(
          source.getText(constructor), '');

      if (!body.includes(name)) {
        context.report(node, `Unused private variable "${name}".` +
          ' If this is used for testing, annotate with "@visibleForTesting".');
      }
    },
  };
};
