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

module.exports = function(context) {
  return {
    CallExpression: function(node) {
      if (node.callee.name === 'dict') {
        if (node.arguments[0]) {
          var arg1 = node.arguments[0];
          if (arg1.type !== 'ObjectExpression') {
            context.report(node,
                'calls to `dict` must have an Object Literal Expression as ' +
                'the first argument');
            return;
          }
          checkNode(arg1, context);
        }
      }
    }
  };
};

function checkNode(node, context) {
  if (node.type === 'ObjectExpression') {
    node.properties.forEach(function(prop) {
      if (!prop.key.raw) {
        context.report(node, 'Found: ' + prop.key.name + '. The keys ' +
            'of the Object Literal Expression passed into `dict` must ' +
            'have string keys.');
      }
      checkNode(prop.value, context);
    });
  } else if (node.type === 'ArrayExpression') {
    node.elements.forEach(function(elem) {
      checkNode(elem, context);
    });
  }
}
