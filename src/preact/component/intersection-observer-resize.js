import {toWin} from '#core/window';

import {useEffect} from '#preact';

const ioForWindow = new Map();
const callbackMap = new Map();

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param {{current: Element}} ref
 * @param {function(IntersectionObserverEntry)} callback
 * @param {?Window} targetWin
 */
export function useIntersectionObserver(ref, callback, targetWin = null) {
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
    callbackMap.set(node, callback);

    if (ioForWindow.has(win)) {
      ioForWindow.get(win).observe(node);
    } else {
      const io = new win.IntersectionObserver((entries) => {
        entries.reduceRight((accumulator, entry) => {
          const {target} = entry;
          if (!accumulator.has(target)) {
            accumulator.add(target);
            callbackMap.get(target)(entry);
          }
          return accumulator;
        }, new Set());
      });
      ioForWindow.set(win, io);
      io.observe(node);
    }

    return () => {
      ioForWindow.get(win).unobserve(node);
      callbackMap.delete(node);
    };
  }, [callback, ref, targetWin]);
}
