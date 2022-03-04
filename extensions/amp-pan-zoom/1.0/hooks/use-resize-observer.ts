import type {RefObject} from 'preact';

import {getWin} from '#core/window';

import {useEffect} from '#preact';
import {useValueRef} from '#preact/component';

export function useResizeObserver(
  element: RefObject<HTMLElement>,
  callback: (entry: ResizeObserverEntry) => void
) {
  const callbackRef = useValueRef(callback);
  useEffect(() => {
    const el = element.current!;
    const win = getWin(el);
    const ro = new win.ResizeObserver((entries) => {
      callbackRef.current(entries[0]);
    });
    ro.observe(el);
    return () => {
      ro.unobserve(el);
      ro.disconnect();
    };
  }, [element, callbackRef]);
}
