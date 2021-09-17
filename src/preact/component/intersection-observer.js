import {
  observeIntersections,
  unobserveIntersections,
} from '#core/dom/layout/viewport-observer';

import {useCallback, useRef} from '#preact';

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {function(IntersectionObserverEntry)} callback
 * @return {function(Element)}
 */
export function useIntersectionObserver(callback, opts = {}) {
  const nodeRef = useRef(null);
  const refCb = useCallback(
    (node) => {
      const prevNode = nodeRef.current;
      nodeRef.current = node;
      if (prevNode) {
        unobserveIntersections(prevNode, callback);
      }
      if (!node) {
        return;
      }
      observeIntersections(node, callback, opts);
    },
    [callback]
  );

  return refCb;
}
