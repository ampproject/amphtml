import {
  observeWithSharedInOb,
  unobserveWithSharedInOb,
} from '#core/dom/layout/viewport-observer';

import {useCallback} from '#preact';

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {function(IntersectionObserverEntry)} callback
 * @return {Function}
 */
export function useIntersectionObserver(callback) {
  const refCb = useCallback(
    (node) => {
      observeWithSharedInOb(node, callback);

      return () => {
        unobserveWithSharedInOb(node);
      };
    },
    [callback]
  );

  return refCb;
}
