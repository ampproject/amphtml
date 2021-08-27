import {useEffect, useState} from '#preact';

const ioForWindow = {}; // new Map()?

/**
 * Uses a shared IntersectionObserver per window instance to observe the given `ref`.
 *
 * @param ref
 * @param targetWin
 * @param callback
 */
export function useIntersectionObserver(ref, targetWin, callback) {
  // If a window instance is not provided, uses the one local to the given `ref`.
  const win = targetWin ?? toWin(ref.current?.ownerDocument?.defaultView);

  useEffect(() => {
    if (!win) {
      return;
    }
    const currentRef = ref.current;
    ioForWindow[win] =
      ioForWindow[win] ??
      new win.IntersectionObserver((entries) => {
        const targetEntries = entries.filter(
          (entry) => entry.target === currentRef
        );
        const last = targetEntries[targetEntries.length - 1];
        setLastEntry(last);
        callback(last);
      });
    return () => {
      // cleanup
      ioForWindow[win].unobserve(currentRef);
    };
  }, [ref, win, callback]);

  return lastEntry;
}
