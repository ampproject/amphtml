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

// Global typedef map typedefName: typedef comment
const TYPEDEFS = new Map();

const buildTypedefs = (t, path) => {
  const typedefs = [];
  for (const [typedefName, typedefComment] of TYPEDEFS) {
    const ast = buildVarDeclAndComment(t, path, typedefName, typedefComment);
    typedefs.push(ast);
  }
  return typedefs;
};

const buildVarDeclAndComment = (t, path, name, comment) => {
  const decl = t.variableDeclaration('let', [
    t.variableDeclarator(t.identifier(name)),
  ]);
  // Add the typedef annotation.
  t.addComment(decl, 'leading', comment);
  return decl;
};

module.exports = function(babel) {
  const {types: t} = babel;
  // `shouldWriteToFile` should only be true in the production pipeline.
  let shouldWriteToFile;
  // `shouldEmitTypedefs` is used for testing purposes only.
  let shouldEmitTypedefs;
  return {
    pre() {
      TYPEDEFS.clear();
      const {writeToFile = false, emitTypedefs = false} = this.opts;
      shouldWriteToFile = writeToFile;
      shouldEmitTypedefs = emitTypedefs;
    },
    visitor: {
      Program: {
        exit(path) {

          // Write out the transient file that we will feed into CC.
          if (shouldWriteToFile) {
            // Stub. This needs to be an append operation.
            console.log('write to temp directory');
          }

          // This is done for testing purposes only to output what the
          // extern would look like.
          if (shouldEmitTypedefs) {
            // Preserve the leading LICENSE comment.
            path.addComment('leading', path.parent.comments[0].value);

            const typedefs = buildTypedefs(t, path);
            path.replaceWith(t.program(typedefs));
            path.skip();
          }
        },
      },
      VariableDeclaration(path) {
        const {node} = path;

        if (!node.leadingComments) {
          return;
        }

        const typedefComment = node.leadingComments.find(comment => {
          return (
            comment.type === 'CommentBlock' && /@typedef/.test(comment.value)
          );
        });

        if (!typedefComment) {
          return;
        }

        // We can assume theres only 1 variable declaration  when a typedef
        // annotation is found. This is because Closure Compiler does not allow
        // declaration of multiple variables with a shared type information.
        const typedefName = node.declarations[0].id.name;

        const typedefLocation = TYPEDEFS.get(typedefName);
        if (!typedefLocation) {
          TYPEDEFS.set(typedefName, typedefComment.value);
        }

        // We can't easily remove comment nodes so we just empty the string out.
        typedefComment.value = '';
        // Remove the actual VariableDeclaration.
        path.remove();
      },
    },
  };
};
