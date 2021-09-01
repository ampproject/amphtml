import {
  observeWithSharedInOb,
  unobserveWithSharedInOb,
} from '#core/dom/layout/viewport-observer';

import {useCallback} from '#preact';

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {function(IntersectionObserverEntry)} callback
 * @return {function}
 */
export function useIntersectionObserver(callback) {
  const nodeRef = useRef(null);
  const refCb = useCallback(
    (node) => {
      const prevNode = nodeRef.current;
      nodeRef.current = node;
      if (prevNode) {
        unobserveWithSharedInOb(nodeRef.current, callback);
      }
      if (!node) {
        return;
      }
      
      observeWithSharedInOb(node, callback);

      return () => {
        unobserveWithSharedInOb(node);
      };
    },
    [callback]
  );

  return refCb;
}
