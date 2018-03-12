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

module.exports = function(babel) {
  const {types: t, template} = babel;

  //const typeRegex = /{([\.\!\?][^}]+)\.[\w\d]+}/g;
  const typeRegex = /(?:@type|@return|@param|@const)\W+{([\.\!\?][^}]+)}/g;
  function extractComments(comments, collected) {
    if (!comments) return;
    //console.log('comments', comments);
    for (let i = 0; i < comments.length; i++) {
      const {value} = comments[i];

      let match;
      while ((match = typeRegex.exec(value))) {
        collected.add(match[1]);
      }
    }
  }

  const commentVisitor = {
    enter(path) {
      const collected = this.collected;
      extractComments(path.node.leadingComments, collected);
      extractComments(path.node.trailingComments, collected);
    },
  };

  return {
    visitor: {
      Program(path) {
        console.log('current file:', path.hub.file.parserOpts.sourceFileName);
        const collected = new Set();
        path.traverse(commentVisitor, {collected});
        console.log('start');
        collected.forEach(x => console.log(x));
        console.log('end');


        /** Ignore this part, it's just me printing it for you */
        //const array = [...collected].map(s => t.stringLiteral(s));
        //path.replaceWith(t.program([t.expressionStatement(t.arrayExpression(array))]));
        //path.stop();
        /** Ignore */
      }
    }
  };
}
