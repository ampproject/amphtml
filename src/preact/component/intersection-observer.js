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

/**
 * Determines if an element is within the viewport.
 *
 * Returns 2 values; the `isInViewport` value, and a ref to be used to capture the element.
 *
 * @param {{current: ?Element}} ref
 * @param {IOOptions} [ioOptions]
 * @return {boolean}
 */
export function useIsInViewport(ref, ioOptions) {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return null;
    }

    const unobserve = observeIntersections(
      node,
      (entry) => {
        setIsInViewport(entry.isIntersecting);
      },
      ioOptions
    );
    return unobserve;
  }, [ref, ioOptions]);

  return isInViewport;
}
