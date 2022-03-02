import type {RefObject} from 'preact';

import {useEffect} from '#preact';
import {useValueRef} from '#preact/component';

export type PointerDragEvent<TDragData> = {
  clientX: MouseEvent['clientX'];
  clientY: MouseEvent['clientY'];
  data: TDragData;
};
export type PointerType = 'mouse' | 'pen' | 'touch';

export type PointerDragCallbacks<TDragData> = {
  pointerType?: PointerType;
  button?: 'left';
  onStart(ev: Omit<PointerDragEvent<TDragData>, 'data'>): TDragData;
  onMove(ev: PointerDragEvent<TDragData>): TDragData | void;
  onStop(ev: PointerDragEvent<TDragData>): void;
};

const LEFT_BUTTON = 0;

export function usePointerDrag<TDragData>(
  elementRef: RefObject<HTMLElement>,
  config: PointerDragCallbacks<TDragData>
) {
  const configRef = useValueRef(config);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    let data: TDragData | null = null;
    const eventCleanup = addEventListeners(element, {
      'pointerdown': (ev) => {
        const config = configRef.current;

        const isWrongPointerType =
          config.pointerType && ev.pointerType !== config.pointerType;
        const isWrongButton =
          config.button === 'left' && ev.button !== LEFT_BUTTON;
        const isModifierHeld =
          ev.metaKey || ev.shiftKey || ev.altKey || ev.ctrlKey;

        if (isWrongPointerType || isWrongButton || isModifierHeld) {
          return;
        }
        ev.preventDefault();

        element.setPointerCapture(ev.pointerId);

        const {clientX, clientY} = ev;

        data = configRef.current.onStart({clientX, clientY});
      },

      'pointermove': (ev) => {
        if (!element.hasPointerCapture(ev.pointerId)) {
          return;
        }
        ev.preventDefault();

        const {clientX, clientY} = ev;

        const newData = configRef.current.onMove({
          clientX,
          clientY,
          data: data!,
        });

        if (newData) {
          data = newData;
        }
      },

      'pointerup': (ev) => {
        if (!element.hasPointerCapture(ev.pointerId)) {
          return;
        }
        ev.preventDefault();

        element.releasePointerCapture(ev.pointerId);

        const {clientX, clientY} = ev;

        configRef.current.onStop({clientX, clientY, data: data!});
        data = null;
      },
    });

    return eventCleanup;
  }, [elementRef, configRef]);
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
