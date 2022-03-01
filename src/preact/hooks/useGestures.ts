import type {RefObject} from 'preact';

import {useEffect} from '#preact';
import {useValueRef} from '#preact/component';

import {Gesture, GestureRecognizer, Gestures} from '../../gesture';
import {
  DoubletapRecognizer,
  PinchRecognizer,
  SwipeXRecognizer,
  SwipeXYRecognizer,
  SwipeYRecognizer,
  TapRecognizer,
  TapzoomRecognizer,
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

type GestureHandlers<TStartInfo> = {
  [P in keyof typeof gestureRecognizers]: typeof gestureRecognizers[P] extends GestureRecognizer<
    infer TData
  >
    ? (gestureData: Gesture<TData>, start: TStartInfo) => TStartInfo
    : (gestureData: Gesture<unknown>, start: TStartInfo) => TStartInfo;
};

const keys = Object.keys as <TObj>(obj: TObj) => Array<keyof TObj>;

export function useGestures(
  elementRef: RefObject<HTMLElement>,
  handlers: Partial<GestureHandlers<unknown>>
) {
  const handlersRef = useValueRef(handlers);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const gestures = Gestures.get(element);
    keys(handlers).forEach((key) => {
      const recognizer = gestureRecognizers[key];
      let initialData: unknown = null;
      gestures.onGesture(recognizer, (ev) => {
        if (ev.data.first) {
          initialData = null;
        }
        initialData = handlersRef.current[key]!(ev, initialData);
        if (ev.data.last) {
          initialData = null;
        }
      });
    });

    return () => {
      keys(handlers).forEach((key) => {
        const recognizer = gestureRecognizers[key];
        gestures.removeGesture(recognizer);
      });
    };
  }, []);
}
