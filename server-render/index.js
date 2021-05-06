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

// TODO: handle comment nodes

/**
 *
 * @param {*} ast
 * @param {*} document
 * @param {*} parent
 * @returns
 */
export function writeAstToDocument(
  ast,
  document = createDocument(),
  parent = document
) {
  for (let astNode of ast) {
    // Text node
    if (typeof astNode === 'string') {
      parent.appendChild(document.createTextNode(astNode));
      continue;
    }

    const domNode = document.createElement(astNode.tag);
    for (let [k, v] of Object.entries(astNode.attrs ?? [])) {
      domNode.setAttribute(k, v);
    }
    writeAstToDocument(astNode.content ?? [], document, domNode);
    parent.appendChild(domNode);
  }
  return document;
}

export function writeDocumentToAst(document, parent = []) {
  for (let domNode of document.childNodes ?? []) {
    // Text node
    if (domNode.nodeType === 3) {
      parent.content.push(domNode.data);
      continue;
    }

    let astNode;
    try {
      astNode = {tag: domNode.tagName.toLowerCase()};
    } catch (err) {
      throw new Error('hello' + domNode.nodeType);
    }
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
