import {toWin} from '#core/window';

import {useEffect} from '#preact';

const ioForWindow = {};

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param ref
 * @param targetWin
 * @param callback
 */
export function useIntersectionObserver(ref, targetWin, callback) {
  useEffect(() => {
    // If a window instance is not provided, uses the one local to the given `ref`.
    const win = targetWin ?? toWin(ref.current?.ownerDocument?.defaultView);
    if (!win) {
      return;
    }
    const {current} = ref;
    ioForWindow[win] =
      ioForWindow[win] ??
      new win.IntersectionObserver((entries) => {
        const targetEntries = entries.filter(
          (entry) => entry.target === current
        );
        const last = targetEntries[targetEntries.length - 1];
        callback(last);
      });
    ioForWindow[win].observe(current);
    return () => {
      ioForWindow[win].unobserve(current);
    };
  }, [ref, targetWin, callback]);
}
