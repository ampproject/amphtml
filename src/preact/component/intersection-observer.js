import {observeIntersections} from '#core/dom/layout/viewport-observer';

import {useCallback, useEffect, useRef, useState} from '#preact';

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {function(IntersectionObserverEntry):void} callback
 * @param {import('#core/dom/layout/types').IOOptions} [ioOptions]
 * @return {function(Element):void}
 */
export function useIntersectionObserver(callback, ioOptions) {
  /** @type {import('preact/hooks').MutableRef<import('#core/types/function/types').UnlistenCallback?>} */
  const unobserveRef = useRef(null);
  const refCb = useCallback(
    /** @param {Element} node */
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
 * Returns whether an element is within the viewport.
 *
 * @param {{current: ?Element}} ref
 * @param {import('#core/dom/layout/types').IOOptions} [ioOptions]
 * @return {boolean}
 */
export function useIsInViewport(ref, ioOptions) {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
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
