import * as Preact from /*OK*/ 'preact';
// import * as compat from /*OK*/ 'preact/compat';

/**
 * @param {function(T, {current: (R|null)}):PreactDef.Renderable} fn
 * @return {function(T):PreactDef.Renderable}
 * @template T, R
 */
export function forwardRef(fn) {
  return fn;
  // return compat.forwardRef(fn);
}

/**
 * @param {...PreactDef.Renderable} unusedChildren
 * @return {!Array<PreactDef.Renderable>}
 */
export function toChildArray(unusedChildren) {
  return Preact.toChildArray(unusedChildren);
}
