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

// var astUtils = require('eslint/lib/ast-utils');

module.exports = function(context) {
  return {
    CallExpression(node) {
      if (context.getFilename().indexOf('test') === -1) {
        return;
      }

      var callee = node.callee;
      if (callee.type !== 'MemberExpression') {
        return;
      }
      if (callee.object.name !== 'sandbox') {
        return;
      }
      if (callee.property.name !== 'mock') {
        return;
      }

      if (node.arguments.length !== 1) {
        return context.report(node, 'Whatcha doing here?');
      }

      var mock = node.arguments[0];
      if (mock.type !== 'Identifier') {
        return;
      }
      context.report(node, "Do not mock things you don't own.");
    }
  };
};
