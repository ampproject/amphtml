import type {RefObject} from 'preact';

import {useEffect, useRef} from '#preact';

/**
 * Triggers the callback if a click occurs outside the element.
 * Prevents default behavior and propagation.
 */
export function useClickOutside(
  elementRef: RefObject<HTMLElement>,
  callback: (ev: MouseEvent) => void
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const handler = (ev: MouseEvent) => {
      const isOutside = !elementRef.current?.contains(ev.target as Element);
      if (isOutside) {
        ev.preventDefault();
        ev.stopPropagation();
        cbRef.current(ev);
      }
    };
    const document = elementRef.current.ownerDocument;
    document.addEventListener('click', handler, {capture: true});
    return () => {
      document.removeEventListener('click', handler, {capture: true});
    };
  }, [elementRef]);
}
