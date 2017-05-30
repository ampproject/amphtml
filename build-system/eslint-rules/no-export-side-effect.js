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
'use strict';

module.exports = function(context) {
  return {
    ExportNamedDeclaration: function(node) {
      if (node.declaration) {
        var declaration = node.declaration;
        if (declaration.type === 'VariableDeclaration') {
          declaration.declarations
              .map(function(declarator) {
                return declarator.init
              }).filter(function(init) {
                return init && /(?:Call|New)Expression/.test(init.type)
                    // Special case creating a map object from a literal.
                    && init.callee.name != 'map';
              }).forEach(function(init) {
                context.report(init, 'Cannot export side-effect');
              });
        }
      } else if (node.specifiers) {
        context.report(node, 'Side-effect linting not implemented');
      }
    },
  };
};
