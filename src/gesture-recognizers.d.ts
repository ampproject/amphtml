export declare abstract class GestureRecognizer<TGestureData> {}

/**
 * A "tap" gesture.
 */
export type TapDef = {
  clientX: number;
  clientY: number;
};
export declare class TapRecognizer extends GestureRecognizer<TapDef> {}

/**
 * A "doubletap" gesture.
 */
export type DoubletapDef = {
  clientX: number;
  clientY: number;
};
export declare class DoubletapRecognizer extends GestureRecognizer<DoubletapDef> {}

/**
 * A "swipe-xy", "swipe-x" or "swipe-y" gesture. A number of these gestures
 * may be emitted for a single touch series.
 */
export type SwipeDef = {
  first: boolean;
  last: boolean;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
};
export declare class SwipeRecognizer extends GestureRecognizer<SwipeDef> {}

export declare class SwipeXYRecognizer extends SwipeRecognizer {}

export declare class SwipeXRecognizer extends SwipeRecognizer {}

export declare class SwipeYRecognizer extends SwipeRecognizer {}

export type TapzoomDef = {
  first: boolean;
  last: boolean;
  centerClientX: number;
  centerClientY: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
};
export declare class TapzoomRecognizer extends GestureRecognizer<TapzoomDef> {}

/**
 * A "pinch" gesture. It has a center, delta off the center center and
 * the velocity of moving away from the center. "dir" component of `1`
 * indicates that it's a expand motion and `-1` indicates pinch motion.
 */
export type PinchDef = {
  first: boolean;
  last: boolean;
  centerClientX: number;
  centerClientY: number;
  dir: number;
  distance: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
};

export declare class PinchRecognizer extends GestureRecognizer<PinchDef> {}
