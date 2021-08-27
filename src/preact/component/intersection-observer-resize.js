import {toWin} from '#core/window';

import {useEffect} from '#preact';

const ioForWindow = {};
// const callbackMap = {};
// const ioForWindow = new Map();
const callbackMap = new Map();

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {{current: Element}} ref
 * @param {?Window} targetWin
 * @param {function(IntersectionObserverEntry)} callback
 */
export function useIntersectionObserver(ref, targetWin, callback) {
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    // If a window instance is not provided, uses the one local to the given `ref`.
    const win = targetWin ?? toWin(node.ownerDocument?.defaultView);
    if (!win) {
      return;
    }
    // callbackMap[node] = callback;
    callbackMap.set(node, callback);

    console.log(callbackMap);
    ioForWindow[win] =
      ioForWindow[win] ??
      new win.IntersectionObserver((entries) => {
        entries.reduceRight((accumulator, currentValue) => {
          const {target} = currentValue;
          if (!accumulator.has(target)) {
            accumulator.add(target);
            console.log(callbackMap);
            // callbackMap[target](currentValue);
            callbackMap.get(target)(currentValue);
          }
          return accumulator;
        }, new Set());
      });
    ioForWindow[win].observe(node);
    return () => {
      console.log('cleaning up:', node);
      ioForWindow[win].unobserve(node);
      delete callbackMap[node];
    };
  }, [callback]);
}
