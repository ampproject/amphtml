import {observeIntersections} from '#core/dom/layout/viewport-observer';

import {useCallback, useRef} from '#preact';

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {function(IntersectionObserverEntry)} callback
 * @return {function(Element)}
 */
export function useIntersectionObserver(callback) {
  const unobserveRef = useRef(null);
  const refCb = useCallback(
    (node) => {
      const cleanup = unobserveRef.current;
      cleanup?.();

      if (!node) {
        return;
      }
      unobserveRef.current = observeIntersections(node, callback);
    },
    [callback]
  );

  return refCb;
}
