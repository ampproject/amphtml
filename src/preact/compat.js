import * as Preact from /*OK*/ 'preact';

export {forwardRef} from './forward-ref';

/**
 * @param {...PreactDef.Renderable} unusedChildren
 * @return {!Array<PreactDef.Renderable>}
 */
export function toChildArray(unusedChildren) {
  return Preact.toChildArray(unusedChildren);
}
