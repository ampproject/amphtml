import type {RefObject} from 'preact';

import {useEffect} from '#preact';
import useEvent from '#preact/hooks/useEvent';

/**
 * Triggers the callback if a click occurs outside the element.
 * Works with any combination of Light DOM and Shadow DOM.
 */
export function useClickOutside(
  elementRef: RefObject<HTMLElement>,
  callback: (ev: MouseEvent) => void
) {
  const cb = useEvent(callback);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const handler = (ev: MouseEvent) => {
      const element = elementRef.current;
      if (element && !shadowContains(element, ev.target as Element)) {
        cb(ev);
      }
    };
    const document = elementRef.current.ownerDocument;
    document.addEventListener('click', handler, {capture: true});
    return () => {
      document.removeEventListener('click', handler, {capture: true});
    };
  }, [elementRef, cb]);
}

/**
 * Same as Element.contains, except it traverses shadow DOM too.
 * @param element - The element that might contain the target
 * @param target - The element that might be contained
 */
function shadowContains(element: HTMLElement, target: Element | null) {
  let parent: Node | null = target;
  while (parent) {
    if (parent === element) {
      return true;
    }

    // Traverse "into" the shadowDOM, if possible:
    parent = (parent as Element).assignedSlot || parent.parentNode;

    // Traverse "out" of the shadowDOM:
    if (parent instanceof ShadowRoot) {
      parent = parent.host;
    }
  }

  return false;
}
