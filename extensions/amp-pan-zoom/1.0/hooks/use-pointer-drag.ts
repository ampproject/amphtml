import type {RefObject} from 'preact';

import {useEffect} from '#preact';
import {useValueRef} from '#preact/component';

export type PointerDragEvent = {
  clientX: MouseEvent['clientX'];
  clientY: MouseEvent['clientY'];
  first: boolean;
  last: boolean;
};
export type PointerDragCallback<TDragStartInfo> = (
  ev: PointerDragEvent,
  start: TDragStartInfo
) => TDragStartInfo;

const LEFT_CLICK = 0;

export function usePointerDrag<TDragStartInfo>(
  elementRef: RefObject<HTMLElement>,
  callback: PointerDragCallback<TDragStartInfo>
) {
  const callbackRef = useValueRef(callback);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    let start: TDragStartInfo | null = null;
    const eventCleanup = addEventListeners(element, {
      'pointerdown': (ev) => {
        if (ev.button !== LEFT_CLICK) {
          return;
        }
        ev.preventDefault();

        element.setPointerCapture(ev.pointerId);

        const {clientX, clientY} = ev;

        start = callbackRef.current(
          {clientX, clientY, first: true, last: false},
          null as unknown as TDragStartInfo
        );
      },

      'pointermove': (ev) => {
        if (!start) {
          return;
        }
        ev.preventDefault();

        const {clientX, clientY} = ev;

        start = callbackRef.current(
          {clientX, clientY, first: false, last: false},
          start
        );
      },

      'pointerup': (ev) => {
        if (ev.button !== LEFT_CLICK || !start) {
          return;
        }
        ev.preventDefault();

        element.releasePointerCapture(ev.pointerId);

        const {clientX, clientY} = ev;

        callbackRef.current(
          {clientX, clientY, first: false, last: true},
          start
        );
        start = null;
      },
    });

    return eventCleanup;
  }, [elementRef, callbackRef]);
}

// Fixes the return type of Object.keys:
const keys = Object.keys as <TObj>(obj: TObj) => Array<keyof TObj>;

type HTMLEventHandlers = {
  [P in keyof HTMLElementEventMap]: (ev: HTMLElementEventMap[P]) => void;
};

function addEventListeners(
  element: HTMLElement,
  handlers: Partial<HTMLEventHandlers>
) {
  keys(handlers).forEach((eventName) => {
    element.addEventListener(eventName, handlers[eventName]!);
  });
  return () => {
    keys(handlers).forEach((eventName) => {
      element.removeEventListener(eventName, handlers[eventName]!);
    });
  };
}
