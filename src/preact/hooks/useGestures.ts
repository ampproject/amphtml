import type {RefObject} from 'preact';

import {useEffect} from '#preact';
import {useValueRef} from '#preact/component';

// gesture-base has no dependencies on Services, so it's safe to import
// eslint-disable-next-line import/no-restricted-paths
import {Gesture, Gestures} from '../../gesture-base';
import {
  DoubletapDef,
  DoubletapRecognizer,
  PinchDef,
  PinchRecognizer,
  SwipeDef,
  SwipeXRecognizer,
  SwipeXYRecognizer,
  SwipeYRecognizer,
  TapDef,
  TapRecognizer,
  TapzoomDef,
  TapzoomRecognizer,
  // gesture-recognizers has no dependencies on Services, so it's safe to import
  // eslint-disable-next-line import/no-restricted-paths
} from '../../gesture-recognizers';

const gestureRecognizers = {
  doubletap: DoubletapRecognizer,
  pinch: PinchRecognizer,
  swipeX: SwipeXRecognizer,
  swipeXY: SwipeXYRecognizer,
  swipeY: SwipeYRecognizer,
  tap: TapRecognizer,
  tapZoom: TapzoomRecognizer,
};

type GestureHandlers = {
  doubletap: (ev: Gesture<DoubletapDef>) => void;
  pinch: (ev: Gesture<PinchDef>) => void;
  swipeX: (ev: Gesture<SwipeDef>) => void;
  swipeXY: (ev: Gesture<SwipeDef>) => void;
  swipeY: (ev: Gesture<SwipeDef>) => void;
  tap: (ev: Gesture<TapDef>) => void;
  tapZoom: (ev: Gesture<TapzoomDef>) => void;
};

const keys = Object.keys as <TObj>(obj: TObj) => Array<keyof TObj>;

export function useGestures(
  elementRef: RefObject<HTMLElement>,
  handlers: Partial<GestureHandlers>
) {
  const handlersRef = useValueRef(handlers);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const handlers = handlersRef.current;

    const gestures = Gestures.get(element);
    keys(handlers).forEach((key) => {
      const recognizer = gestureRecognizers[key];
      gestures.onGesture(recognizer as any, (ev) => {
        handlersRef.current[key]!(ev);
      });
    });

    return () => {
      keys(handlers).forEach((key) => {
        const recognizer = gestureRecognizers[key];
        gestures.removeGesture(recognizer as any);
      });
    };
  }, [elementRef, handlersRef]);
}
