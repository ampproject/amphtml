import {parse, print} from './ast';
import {renderAmpAst} from './render';

/*
 * Renders all of the eligible AMP Components within an AMP Document
 */
export function renderAmpHtml(html: string): string {
  const ast = parse(html);
  return print(renderAmpAst(ast));
}

export {renderAmpAst};
