import {toWin} from '#core/window';

import {useEffect} from '#preact';

const ioForWindow = {};
const callbackMap = {};

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
    const node = ref.current;
    if (!node) {
      return;
    }
    callbackMap[node] = callback;

    ioForWindow[win] =
      ioForWindow[win] ??
      new win.IntersectionObserver((entries) => {
        entries.reduceRight((accumulator, currentValue) => {
          const {target} = currentValue;
          if (!accumulator.has(target)) {
            accumulator.add(target);
            callbackMap[target](currentValue);
          }
        }, new Set());
      });
    ioForWindow[win].observe(node);
    return () => {
      ioForWindow[win].unobserve(node);
      delete callbackMap[node];
    };
  }, [ref, targetWin, callback]);
}
