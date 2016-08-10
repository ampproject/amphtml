/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

module.exports = function(context) {
  /**
   * @param {!Array<!Node>|undefined} commentLines
   * @return {boolean}
   */
  function isPrivate(commentLines) {
    if (!commentLines) {
      return false;
    }
    return commentLines.some(function(comment) {
      return comment.type == 'Block' && /@private/.test(comment.value);
    });
  }

  /**
   * @param {string}
   * @return {boolean}
   */
  function noTrailingUnderscore(fnName) {
    return !/_$/.test(fnName);
  }

  /**
   * @param {!Node}
   * @return {boolean}
   */
  function isThisMemberExpression(node) {
    return node.type == 'MemberExpression' &&
        node.object.type == 'ThisExpression';
  }
  return {
    'MethodDefinition:exit': function(node) {
      if (isPrivate(node.leadingComments) &&
            noTrailingUnderscore(node.key.name)) {
        context.report(node,
            'Method marked as private but has no trailing underscore.');
      }
    },
    'AssignmentExpression': function(node) {
      if (node.parent.type == 'ExpressionStatement' &&
            isPrivate(node.parent.leadingComments) &&
            isThisMemberExpression(node.left) &&
            noTrailingUnderscore(node.left.property.name)) {
        context.report(node,
            'Property marked as private but has no trailing underscore.');
      }
    }
  }
};
