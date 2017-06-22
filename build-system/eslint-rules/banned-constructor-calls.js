/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

module.exports = {
  meta: {
    schema: [{
      type: 'array',
      minimum: 1,
    }]
  },
  create(context) {
    const bannedMethods = context.options[0];
    return {
      CallExpression: function(node) {
        var name = getCallExpressionName(node);
        if (bannedMethods.indexOf(name) > -1 && isInAmpClassConstructor(node)) {
          context.report(node,
              name + ' call is not allowed inside constructors whose class ' +
              'inherit from AMP.BaseElement.');
        }
      }
    };
  },
};

function isInAmpClassConstructor(node) {
  while ((node = node.parent)) {
    if (node.type === 'MethodDefinition' && node.kind === 'constructor' &&
        node.parent && node.parent.parent &&
        node.parent.parent.type === 'ClassDeclaration' &&
        node.parent.parent.superClass !== null &&
        node.parent.parent.id.name.indexOf('Amp') === 0) {
      return true;
    }
  }
  return false;
}

function getCallExpressionName(node) {
  if (node && node.callee) {
    if (node.callee.name) {
      return node.callee.name;
    } else if (node.callee.property && node.callee.property.name) {
      return node.callee.property.name;
    }
  }
  return null;
}
