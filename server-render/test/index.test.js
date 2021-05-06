import htmlParser from 'posthtml-parser';
import {writeAstToDocument, renderElement, writeDocumentToAst} from '../index';

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
