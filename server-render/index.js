import {createDocument} from './node_modules/@ampproject/worker-dom/dist/server-lib.mjs';
import {buildDOM as buildAmpLayout} from '../builtins/amp-layout/build';

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

/**
 *
 * @param {*} ast
 * @param {*} doc
 * @param {*} parent
 * @returns
 */
export function writeAstToDocument(ast, doc = createDocument(), parent = doc) {
  for (let astNode of ast) {
    // Text node
    if (typeof astNode === 'string') {
      parent.appendChild(doc.createTextNode(astNode));
      continue;
    }

    const domNode = doc.createElement(astNode.tag);
    for (let [k, v] of Object.entries(astNode.attrs ?? [])) {
      domNode.setAttribute(k, v);
    }
    writeAstToDocument(astNode.content ?? [], doc, domNode);
    parent.appendChild(domNode);
  }
  return doc;
}
