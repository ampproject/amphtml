import {toWin} from '#core/window';

import {useEffect} from '#preact';

/** @type {WeakMap<!Element, function(boolean)>} */
const ioForWindow = new WeakMap();
const callbackMap = new WeakMap();

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
    // If a window instance is not provided, uses the one local to the given `ref`.
    const win = targetWin ?? toWin(node.ownerDocument?.defaultView);
    if (!win) {
      return;
    }
    callbackMap.set(node, callback);

    let observer = ioForWindow.get(win);
    if (!observer) {
      observer = new win.IntersectionObserver((entries) => {
        entries.reduceRight((accumulator, entry) => {
          const {target} = entry;
          if (!accumulator.has(target)) {
            accumulator.add(target);
            callbackMap.get(target)(entry);
          }
          return accumulator;
        }, new Set());
      });
      ioForWindow.set(win, observer);
    }
    observer.observe(node);

    return () => {
      ioForWindow.get(win).unobserve(node);
      callbackMap.delete(node);
    };
  }, [callback, ref, targetWin]);
}
