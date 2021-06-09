import {parse, TreeProto, print} from './ast';

/*
 * Returns a new AST created by walking the entire tree and rendering each
 * eligible AMP Component.
 */
export function renderAmpAst(ast: TreeProto): TreeProto {
  throw new Error('TODO');
}

/*
 * Renders all of the eligible AMP Components within an AMP Document
 */
export function renderAmpHtml(html: string): string {
  const ast = parse(html);
  return print(renderAmpAst(ast));
}
