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
const doctrine = require('@jridgewell/doctrine');

const flatten = arr => [].concat(...arr);

const buildFuncDecl = (t, id) => {
  return t.functionDeclaration(t.identifier(id), [], t.blockStatement([]));
};

const buildExprStmt = (t, id, field) => {
  return t.expressionStatement(
    t.memberExpression(
      t.memberExpression(t.identifier(id), t.identifier('prototype')),
      t.identifier(field)
    )
  );
};

module.exports = function(babel) {
  const {types: t} = babel;
  return {
    visitor: {
      VariableDeclaration(path) {
        const {node} = path;
        if (!node.leadingComments) {
          return;
        }

        const comments = node.leadingComments.filter(comment => {
          return (
            comment.type === 'CommentBlock' && /@typedef/.test(comment.value)
          );
        });

        if (!comments.length) {
          return;
        }
        // We can assume theres only 1 typedef comment per VariableDeclaration.
        const comment = doctrine.parse(comments[0].value, {unwrap: true});
        const {fields} = comment.tags.filter(
          tag => tag.title === 'typedef'
        )[0].type;

        // We can assume theres only 1 variable declarator
        // if we can find a typedef leading comment.
        const id = node.declarations[0].id.name;
        const funcDecl = buildFuncDecl(t, id);
        const memberExprs = fields.map(field => {
          return buildExprStmt(t, id, field.key);
        });
        path.replaceWithMultiple([funcDecl, ...memberExprs]);
      },
    },
  };
};
