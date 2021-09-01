import {
  observeWithSharedInOb,
  unobserveWithSharedInOb,
} from '#core/dom/layout/viewport-observer';

import {useEffect} from '#preact';

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {{current: Element}} ref
 * @param {function(IntersectionObserverEntry)} callback
 * @param {?Window} targetWin
 */
export function useIntersectionObserver(ref, callback, targetWin) {
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    observeWithSharedInOb(node, callback);

    return () => {
      unobserveWithSharedInOb(node);
    };
  }, [callback, ref, targetWin]);
}
