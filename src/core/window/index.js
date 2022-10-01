/**
 * Externs declare that access `defaultView` from `document` or
 * `ownerDocument` is of type `(Window|null)` but most of our parameter types
 * assume that it is never null. This is OK in practice as we ever only get
 * null on disconnected documents or old IE.
 * This helper function casts it into just a simple Window return type.
 *
 * @param {?Window} winOrNull
 * @return {Window}
 */
export function toWin(winOrNull) {
  return /** @type {Window} */ (winOrNull);
}

/**
 * Returns the associated Window for a node.
 *
 * @param {Node} node
 * @return {Window}
 */
export function getWin(node) {
  return toWin(
    (node.ownerDocument || /** @type {Document} */ (node)).defaultView
  );
}
