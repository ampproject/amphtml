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

import {describe, expect, it} from '@jest/globals';
import {renderElement, writeAstToDocument, writeDocumentToAst} from '../index';
import htmlParser from 'posthtml-parser';

describe('amp-layout', () => {
  it('layout=fixed.', () => {
    const input = `<amp-layout layout="fixed" width="100" height="100"> will act like a 100px by 100px div </amp-layout>`;
    const expectedOutput = `<amp-layout layout="fixed" width="100" height="100"><div class="i-amphtml-fill-content"> will act like a 100px by 100px div </div></amp-layout>`;

    const ast = htmlParser(input);
    const rendered = renderElement(ast);

    expect(rendered).toBe(expectedOutput);
  });

  it('layout=responsive', () => {
    const input = `<amp-layout layout="responsive" width="2" height="1"> This amp-layout acts like a div that always keeps a 2x1 aspect ratio. </amp-layout>`;
    const expectedOutput = `<amp-layout layout="responsive" width="2" height="1"><div class="i-amphtml-fill-content"> This amp-layout acts like a div that always keeps a 2x1 aspect ratio. </div></amp-layout>`;

    const ast = htmlParser(input);
    const rendered = renderElement(ast);

    expect(rendered).toBe(expectedOutput);
  });
});

describe('writeAstToDocument', () => {
  it('should handle empty AST', () => {
    const html = '';
    const ast = htmlParser(html);
    const doc = writeAstToDocument(ast);

    expect(doc.outerHTML).toBe('<#document></#document>');
  });

  it('should handle single node', () => {
    const html = '<div></div>';
    const ast = htmlParser(html);
    const doc = writeAstToDocument(ast);

    expect(doc.firstChild.outerHTML).toBe(html);
  });

  it('should handle nested nodes', () => {
    const html = '<body><div><img></div><h1>title</h1></body>';
    const ast = htmlParser(html);
    const doc = writeAstToDocument(ast);

    expect(doc.firstChild.outerHTML).toBe(html);
  });

  it('should handle nodes with text', () => {
    const html = '<body><h1>the answer: <span>42</span></h1></body>';
    const ast = htmlParser(html);
    const doc = writeAstToDocument(ast);

    expect(doc.firstChild.outerHTML).toBe(html);
  });

  it('should handle nodes with attributes', () => {
    const html =
      '<body data-amp-bind-foo="hello"><h1 style="display:none;">title</h1></body>';
    const ast = htmlParser(html);
    const doc = writeAstToDocument(ast);

    expect(doc.firstChild.outerHTML).toBe(html);
  });

  it.todo('should handle binding notation for amp-bind');
});

describe('writeDocumentToAst', () => {
  it('should handle empty AST', () => {
    const html = '';
    const inputAst = htmlParser(html);
    const outputAst = writeDocumentToAst(writeAstToDocument(inputAst));

    expect(outputAst).toEqual(inputAst);
  });

  it('should handle single node', () => {
    const html = '<div></div>';
    const inputAst = htmlParser(html);
    const outputAst = writeDocumentToAst(writeAstToDocument(inputAst));

    expect(outputAst).toEqual(inputAst);
  });

  it('should handle nested nodes', () => {
    const html = '<body><div><img></div><h1>title</h1></body>';
    const inputAst = htmlParser(html);
    const outputAst = writeDocumentToAst(writeAstToDocument(inputAst));

    expect(outputAst).toEqual(inputAst);
  });
});
