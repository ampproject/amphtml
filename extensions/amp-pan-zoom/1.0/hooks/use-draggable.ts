import type {RefObject} from 'preact';

import {useEffect} from '#preact';
import {useValueRef} from '#preact/component';

export type DraggableEvent = Pick<
  MouseEvent,
  'clientX' | 'clientY' | 'currentTarget'
>;
export type DraggableCallbacks<TDragStartInfo> = {
  dragStart(ev: DraggableEvent): TDragStartInfo;
  dragMove(ev: DraggableEvent, start: TDragStartInfo): void;
  dragEnd(ev: DraggableEvent, start: TDragStartInfo): void;
};

const LEFT_CLICK = 0;

export function useDraggable<TDragStartInfo>(
  elementRef: RefObject<HTMLElement>,
  config: DraggableCallbacks<TDragStartInfo>
) {
  const configRef = useValueRef(config);

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

        start = configRef.current.dragStart(ev);
      },

      'pointermove': (ev) => {
        if (!start) {
          return;
        }
        ev.preventDefault();

        configRef.current.dragMove(ev, start);
      },

      'pointerup': (ev) => {
        if (ev.button !== LEFT_CLICK || !start) {
          return;
        }
        ev.preventDefault();

        element.releasePointerCapture(ev.pointerId);

        configRef.current.dragEnd(ev, start);
        start = null;
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
