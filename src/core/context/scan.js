/** @typedef {import('./node').ContextNode<?>} ContextNode */

/**
 * Performs the `closest()` scan through context nodes to find the one that
 * matches the predicate with an optional argument.
 *
 * @param {ContextNode} startNode
 * @param {function(ContextNode, T|undefined):boolean} predicate
 * @param {T=} arg
 * @param {boolean=} includeSelf
 * @return {?ContextNode}
 * @template T
 */
export function findParent(
  startNode,
  predicate,
  arg = undefined,
  includeSelf = true
) {
  for (let n = includeSelf ? startNode : startNode.parent; n; n = n.parent) {
    if (predicate(n, arg)) {
      return n;
    }
  }
  return null;
}

/**
 * Performs the deep scan through context nodes and calls the specified
 * callback with the optional argument. A node can stop the deep scan into its
 * subtree by returning a falsy result. Otherwise, the subtree will be scanned
 * and the result value will be passed to the children callbacks.
 *
 * @param {ContextNode} startNode
 * @param {function(ContextNode, T|undefined, S):S} callback
 * @param {T=} arg
 * @param {S=} state
 * @param {boolean=} includeSelf
 * @template T
 * @template S
 */
export function deepScan(
  startNode,
  callback,
  arg = undefined,
  state = /** @type {S} */ (/** @type {?} */ (true)),
  includeSelf = true
) {
  if (includeSelf) {
    const newState = callback(startNode, arg, state);
    if (newState) {
      deepScan(startNode, callback, arg, newState, false);
    }
  } else if (startNode.children) {
    for (const node of startNode.children) {
      deepScan(node, callback, arg, state, true);
    }
  }
}
