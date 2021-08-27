import {useEffect, useState} from '#preact';

const ioForWindow = {};
//   window: null,
// };

// let io;

/**
 * @param ref
 * @param targetWin
 * @param callback
 */
export function useIntersectionObserver(ref, targetWin, callback) {
  const [lastEntry, setLastEntry] = useState(null);
  const win = targetWin ?? ref.current?.ownerDocument.defaultView;

  useEffect(() => {
    const currentRef = ref.current;
    // other stuff we were doing with io
    ioForWindow =
      ioForWindow ??
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

// component.js
// Will `isIntersecting` cause new render if its value is unchanged,
// but other properties of the entry do change?
// const isIntersectingRef = useRef(null);
// const attemptResize = useCallback(({isIntersecting}) => {
//   if (isIntersecting === isIntersectingRef.current) {
//     // unchanged
//     return;
//   }
//   isIntersectingRef.current = isIntersecting;
//   if (!isIntersecting) {
//     requestResize();
//   }
// });
// useInOb(iframeRef, /* window */ undefined, attemptResize);
// useEffect(() => {
//   if (!ioEntry.isIntersecting) {
//     attemptResize();
//   }
// }, [isIntersecting]);

// const {boundingClientRect, inViewport, rootBounds} = useInOb(ref)
