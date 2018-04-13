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
  function htmlCannotBeCalled(node) {
    context.report(node, 'The html helper MUST NOT be called directly. ' +
        'Instead, use it as a template literal tag: ``` html`<div />` ```');
  }

  function htmlForUsage(node) {
    const {parent} = node;
    if (parent.type === 'TaggedTemplateExpression' &&
        parent.tag === node) {
      return htmlTagUsage(parent);
    }

    if (parent.type === 'VariableDeclarator' &&
        parent.init === node &&
        parent.id.type === 'Identifier' &&
        parent.id.name === 'html') {
      return;
    }

    if (parent.type === 'AssignmentExpression' &&
        parent.right === node &&
        parent.left.type === 'Identifier' &&
        parent.left.name === 'html') {
      return;
    }

    context.report(node, 'htmlFor result must be stored into a variable ' +
      'named "html", or used as the tag of a tagged template literal.');
  }

  function htmlTagUsage(node) {
    if (node.quasi.expressions.length === 0) {
      return;
    }

    context.report(node, 'The html template tag CANNOT accept expression. ' +
        'The template MUST be static only.');
  }

  return {
    CallExpression(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      const {callee} = node;
      if (callee.type !== 'Identifier') {
        return;
      }

      if (callee.name === 'html') {
        return htmlCannotBeCalled(node);
      }
      if (callee.name === 'htmlFor') {
        return htmlForUsage(node);
      }
    },

    TaggedTemplateExpression(node) {
      const {tag} = node;
      if (tag.type !== 'Identifier' || tag.name !== 'html') {
        return;
      }

      htmlTagUsage(node);
    },
  };
};
