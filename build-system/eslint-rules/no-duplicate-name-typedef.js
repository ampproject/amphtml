/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const argv = require('minimist')(process.argv.slice(2));

// Global cache of typedefName: typedefLocation.
const typedefs = new Map();

module.exports = function(context) {
  return {
    VariableDeclaration(node) {
      // This rule does not work with per-file on-the-fly linting done by IDEs.
      if (!argv._.includes('lint')) {
        return;
      }

      if (!node.leadingComments) {
        return;
      }

      const typedefComment = node.leadingComments.find(comment => {
        return comment.type === 'Block' && /@typedef/.test(comment.value);
      });

      if (!typedefComment) {
        return;
      }

      // We can assume theres only 1 variable declaration when a typedef
      // annotation is found. This is because Closure Compiler does not allow
      // declaration of multiple variables with a shared type information.
      const typedefName = node.declarations[0].id.name;

      const typedefLocation = typedefs.get(typedefName);
      if (!typedefLocation) {
        typedefs.set(typedefName, context.getFilename());
        return;
      }

      context.report({
        node,
        message:
          `Duplicate typedef name found: ${typedefName}. Another ` +
          `typedef with the same name is found in ${typedefLocation}. ` +
          'Suggestion: Add an infix version indicator like MyType_0_1_Def.',
      });
    },
  };
};
