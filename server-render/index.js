/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {buildDOM as buildAmpLayout} from '../builtins/amp-layout/amp-layout';
import {createDocument} from './node_modules/@ampproject/worker-dom/dist/server-lib.mjs';

/**
 *
 * @param {*} ast a posthtml AST of the element.
 * @return {*} the rendered htmlparser2 AST of the document.
 */
export function renderElement(ast) {
  const doc = writeAstToDocument(ast);
  const el = doc.firstChild;
  buildAmpLayout(doc, el);

  // TODO: create `writeDocumentToAst`
  return el.outerHTML;
}

// TODO: handle comment nodes

/**
 *
 * @param {*} ast
 * @param {*} document
 * @param {*} parent
 * @return
 */
export function writeAstToDocument(
  ast,
  document = createDocument(),
  parent = document
) {
  for (const astNode of ast) {
    // Text node
    if (typeof astNode === 'string') {
      parent.appendChild(document.createTextNode(astNode));
      continue;
    }

    const domNode = document.createElement(astNode.tag);
    for (const [k, v] of Object.entries(astNode.attrs ?? [])) {
      domNode.setAttribute(k, v);
    }
    writeAstToDocument(astNode.content ?? [], document, domNode);
    parent.appendChild(domNode);
  }
  return document;
}

export function writeDocumentToAst(document, parent = []) {
  for (const domNode of document.childNodes ?? []) {
    // Text node
    if (domNode.nodeType === 3) {
      parent.content.push(domNode.data);
      continue;
    }

    const astNode = {tag: domNode.tagName.toLowerCase()};
    if (domNode.hasAttributes()) {
      astNode.attrs = Object.fromEntries(
        Array.from(domNode.attributes).map((attr) => [attr.name, attr.value])
      );
    }

    if (domNode.childNodes.length > 0) {
      astNode.content = [];
      writeDocumentToAst(domNode, astNode);
    }

    // top-level parent is an array.
    (parent.content ?? parent).push(astNode);
  }
  return parent;
}
