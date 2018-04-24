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
  const stack = [];
  function current() {
    return stack[stack.length - 1];
  }

  function shouldIgnoreFile() {
    return /\b(test|examples)\b/.test(context.getFilename());
  }

  function shouldIgnoreDueToAnnotation(node) {
    const comments = context.getCommentsBefore(node);
    const annotated = comments.some(comment => {
      return /@(visibleForTesting|protected|override)\b/.test(comment.value);
    });
    return annotated;
  }


  function shouldCheckMember(node, needsThis = true) {
    const {computed, object, property} = node;
    if (computed ||
        (needsThis && object.type !== 'ThisExpression') ||
        property.type !== 'Identifier') {
      return false;
    }

    return isPrivateName(property);
  }

  function isAssignment(node) {
    const {parent} = node;
    return parent.type === 'AssignmentExpression' && parent.left === node;
  }

  function isPrivateName(node) {
    return node.name.endsWith('_');
  }

  return {
    ClassBody() {
      if (shouldIgnoreFile()) {
        return;
      }

      stack.push({used: new Set(), declared: new Map()});
    },

    'ClassBody:exit': function() {
      if (shouldIgnoreFile()) {
        return;
      }

      const {used, declared} = stack.pop();

      declared.forEach((node, name) => {
        if (used.has(name)) {
          return;
        }

        context.report(node, [
          `Unused private "${name}".`,
          'If this is used for testing, annotate with `@visibleForTesting`.',
          'If this is used in a subclass, annotate with `@protected`.',
          'If this is an override of a protected, annotate with `@override`.',
          'If none of these exceptions applies, please contact @jridgewell.',
        ].join('\n\t'));
      });
    },

    'ClassBody > MethodDefinition': function(node) {
      if (shouldIgnoreFile()) {
        return;
      }

      const {computed, key} = node;
      if (computed ||
          !isPrivateName(key) ||
          shouldIgnoreDueToAnnotation(node)) {
        return;
      }

      const {name} = node.key;
      const {declared} = current();
      declared.set(name, node);
    },

    'MethodDefinition[kind="constructor"] MemberExpression': function(node) {
      if (shouldIgnoreFile() ||
         !shouldCheckMember(node) ||
         !isAssignment(node)) {
        return;
      }

      const {name} = node.property;
      const {declared} = current();
      declared.set(name, node);
    },

    'ClassBody MemberExpression': function(node) {
      if (shouldIgnoreFile() ||
         !shouldCheckMember(node, false) ||
         isAssignment(node)) {
        return;
      }

      const {name} = node.property;
      const {used} = current();
      used.add(name);
    },
  };
};
