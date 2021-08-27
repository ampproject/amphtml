import {useEffect, useState} from '#preact';

const ioForWindow = {}; // new Map()?

/**
 * @param ref
 * @param targetWin
 * @param callback
 */
export function useIntersectionObserver(ref, targetWin, callback) {
  const [lastEntry, setLastEntry] = useState(null);
  const win = targetWin ?? ref.current?.ownerDocument.defaultView;

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
