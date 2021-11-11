import * as Preact from /*OK*/ 'preact';

export {forwardRef} from 'preact-forwardref';

/**
 * @param {...PreactDef.Renderable} unusedChildren
 * @return {!Array<PreactDef.Renderable>}
 */
export function toChildArray(unusedChildren) {
  return Preact.toChildArray(arguments);
}
