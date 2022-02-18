import type {RefObject} from 'preact';

import {useEffect, useRef} from '#preact';

/**
 * Trigger the event handler whenever the event occurs in an element matching the selector.
 *
 * This is useful for "lazy" event handling, where the matching DOM nodes might be inserted later.
 *
 * @param containerRef - The container that holds the elements
 * @param selector - A selector; anything children matching the selector will trigger the event
 * @param eventName - A valid HTML event name, like 'click'
 * @param handler - The event handler
 */
export function useEventDelegation<
  TElement extends HTMLElement,
  TEventType extends keyof HTMLElementEventMap
>(
  containerRef: RefObject<TElement>,
  selector: string,
  eventName: TEventType,
  handler: (ev: HTMLElementEventMap[TEventType]) => any
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleEvent = (ev: HTMLElementEventMap[TEventType]) => {
      const target = ev.target as HTMLElement;
      const matchingTarget = target.closest(selector);
      if (matchingTarget) {
        handlerRef.current(ev);
      }
    };

    container.addEventListener(eventName, handleEvent);
    return () => {
      container.removeEventListener(eventName, handleEvent);
    };
  }, [containerRef, selector, eventName, handlerRef]);
}
