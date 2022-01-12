import {observeIntersections} from '#core/dom/layout/viewport-observer';

import {useCallback, useEffect, useRef, useState} from '#preact';

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {function(IntersectionObserverEntry)} callback
 * @param {IOOptions} [ioOptions]
 * @return {function(Element)}
 */
export function useIntersectionObserver(callback, ioOptions) {
  const unobserveRef = useRef(null);
  const refCb = useCallback(
    (node) => {
      const cleanup = unobserveRef.current;
      if (cleanup) {
        cleanup();
        unobserveRef.current = null;
      }

      if (!node) {
        return;
      }

      unobserveRef.current = observeIntersections(node, callback, ioOptions);
    },
    [callback, ioOptions]
  );

  return refCb;
}
