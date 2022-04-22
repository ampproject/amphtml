import type {RefObject} from 'preact';

import {useEffect} from '#preact';
import {useValueRef} from '#preact/component';

/**
 * Callback is called on initial render,
 * and again whenever the element's size changes.
 */
export function useResizeObserver(
  elementRef: RefObject<HTMLElement>,
  callback: (entry: ResizeObserverEntry) => void
) {
  const callbackRef = useValueRef(callback);
  useEffect(() => {
    const el = elementRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver((entries) => {
      callbackRef.current(entries[0]);
    });
    ro.observe(el);
    return () => {
      ro.unobserve(el);
      ro.disconnect();
    };
  }, [elementRef, callbackRef]);
}
