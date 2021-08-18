import * as compat from /*OK*/ 'preact/compat';

/**
 * @param {function(T, {current: (R|null)}):PreactDef.Renderable} fn
 * @return {function(T):PreactDef.Renderable}
 * @template T, R
 */
export function forwardRef(fn) {
  return compat.forwardRef(fn);
}

/**
 * @param {PreactDef.VNode} vnode
 * @param {HTMLElement} container
 * @return {PreactDef.VNode}
 */
export function createPortal(vnode, container) {
  return compat.createPortal(vnode, container);
}

/**
 * @param {...PreactDef.Renderable} unusedChildren
 * @return {!Array<PreactDef.Renderable>}
 */
export function toChildArray(unusedChildren) {
  return compat.Children.toArray.apply(undefined, arguments);
}
