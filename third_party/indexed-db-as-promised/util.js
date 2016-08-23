/**
 * A partial application that will wait until called before resolving.
 *
 * @param {function(T)} resolve
 * @template T
 */
export function resolveWithResult(resolve) {
  /**
   * A callback that takes the `target.result` value and forwards it.
   *
   * @param {Event} event
   */
  const resolver = (event) => {
    resolve(event.target.result);
  };
  return resolver;
}

/**
 * A partial application that will wait until called before rejecting.
 *
 * @param {function(T)} reject
 * @template T
 */
export function rejectWithError(reject) {
  /**
   * A callback that takes the `target.error` value and forwards it.
   *
   * @param {Event} event
   */
  const rejecter = (event) => {
    reject(event.target.error);
  };
  return rejecter;
}
