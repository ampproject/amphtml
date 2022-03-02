import {bezierCurve} from '#core/data-structures/curve';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {scale as cssScale, px, translate} from '#core/dom/style';
import {numeric} from '#core/dom/transition';
import {boundValue, distance} from '#core/math';

import {useMemo, useState} from '#preact';

import type {BentoPanZoomProps} from './component-ts';

const PAN_ZOOM_CURVE = bezierCurve(0.4, 0, 0.2, 1.4);
const ANIMATION_EASE_IN = 'cubic-bezier(0,0,.21,1)';
const DEFAULT_MAX_SCALE = 3;
const DEFAULT_INITIAL_SCALE = 1;
const MAX_ANIMATION_DURATION = 250;
const DEFAULT_ORIGIN = 0;

const initialRect = new DOMRect(0, 0, 0, 0);

const initialState = {
  /** @deprecated */
  startX: 0,
  posX: 0,

  /** @deprecated */
  startY: 0,
  posY: 0,

  minScale: 1,
  maxScale: DEFAULT_MAX_SCALE,
  scale: 1,

  /** @deprecated */
  width: '',
  /** @deprecated */
  sourceWidth: 0,
  /** @deprecated */
  height: '',
  /** @deprecated */
  sourceHeight: 0,

  contentBox: initialRect,
  containerBox: initialRect,

  /** @deprecated */
  isPannable: false,
  isZoomed: false,
  canZoom: true,
};

type State = typeof initialState;

type PanZoomConfig = Pick<
  BentoPanZoomProps,
  'initialScale' | 'initialX' | 'initialY' | 'maxScale'
>;

/** @deprecated */
const updatePanZoomBoundaries = (state: State, newScale: number) => {
  const {containerBox, contentBox} = state;
  const {
    height: contentHeight,
    left: contentXOffset,
    top: contentYOffset,
    width: contentWidth,
  } = contentBox;
  const {height: elementHeight, width: elementWidth} = containerBox;
  const minX = Math.min(
    0,
    elementWidth - (contentXOffset + (contentWidth * (newScale + 1)) / 2)
  );
  const maxX = Math.max(
    0,
    (contentWidth * newScale - contentWidth) / 2 - contentXOffset
  );
  const minY = Math.min(
    0,
    elementHeight - (contentYOffset + (contentHeight * (newScale + 1)) / 2)
  );
  const maxY = Math.max(
    0,
    (contentHeight * newScale - contentHeight) / 2 - contentYOffset
  );
  return {
    maxX,
    minX,
    maxY,
    minY,
  };
};

/** @deprecated */
const updateContentDimensions = (
  sourceHeight: number,
  sourceWidth: number,
  aspectRatio: number,
  containerBox: DOMRect
) => {
  // Calculate content height if we set width to amp-pan-zoom's width
  const heightToFit = containerBox.width / aspectRatio;
  // Calculate content width if we set height to be amp-pan-zoom's height
  const widthToFit = containerBox.height * aspectRatio;
  // The content should fit within amp-pan-zoom, so take the smaller value
  let height = Math.min(heightToFit, containerBox.height);
  let width = Math.min(widthToFit, containerBox.width);
  if (
    Math.abs(width - sourceWidth) <= 16 &&
    Math.abs(height - sourceHeight) <= 16
  ) {
    width = sourceWidth;
    height = sourceHeight;
  }
  return layoutRectLtwh(0, 0, Math.round(width), Math.round(height));
};

/** @deprecated */
const resetContentDimensions = () => {};

/** @deprecated */
const updateMaxScale = (
  maxScale: number,
  aspectRatio: number,
  containerBox: DOMRect
) => {
  const {height, width} = containerBox;
  const containerBoxRatio = width / height;
  const newMaxScale = Math.max(
    containerBoxRatio / aspectRatio,
    aspectRatio / containerBoxRatio
  );
  if (!isNaN(newMaxScale)) {
    return Math.max(maxScale, newMaxScale);
  }
  return maxScale;
};

/** @deprecated */
const measure = (
  state: State,
  contentWidth: number,
  contentHeight: number,
  containerBoxRect: DOMRect
) => {
  const sourceAspectRatio = contentWidth / contentHeight;
  return {
    sourceWidth: contentWidth,
    sourceHeight: contentHeight,
    maxScale: updateMaxScale(
      state.maxScale,
      sourceAspectRatio,
      containerBoxRect
    ),
    containerBox: containerBoxRect,
    contentBox: updateContentDimensions(
      contentWidth,
      contentHeight,
      sourceAspectRatio,
      containerBoxRect
    ),
  };
};

/** @deprecated */
const setContentBox = (contentBox: DOMRect, containerBox: DOMRect) => {
  return {
    // ...contentBox,
    top: contentBox.top - containerBox.top,
    left: contentBox.left - containerBox.left,
    width: contentBox.width,
    height: contentBox.height,
  };
};

const boundScale = (state: State, newScale: number, allowExtent: boolean) => {
  const {maxScale, minScale} = state;
  const extent = allowExtent ? 0.25 : 0;
  return boundValue(newScale, minScale, maxScale, extent);
};

/** @deprecated */
const boundX = (state: State, newPosX: number, allowExtent: boolean) => {
  const {containerBox, scale} = state;
  const extent = allowExtent && scale > 1 ? containerBox.width * 0.25 : 0;
  const minX = containerBox.width * (scale - 1);
  return boundValue(newPosX, minX, 0, extent);
};

/** @deprecated */
const boundY = (state: State, newPosY: number, allowExtent: boolean) => {
  const {containerBox, scale} = state;
  const extent = allowExtent && scale > 1 ? containerBox.height * 0.25 : 0;
  const minY = containerBox.height * (scale - 1);
  return boundValue(newPosY, minY, 0, extent);
};

/** @deprecated */
const transform = (state: State, x: number, y: number, scale: number) => {
  const newX = boundX(state, x, false);
  const newY = boundY(state, y, false);

  return setZoomParams(state, scale, newX, newY, true);
};

/** @deprecated */
const move = (state: State, x: number, y: number, element: HTMLElement) => {
  const newX = boundX(state, x, false);
  const newY = boundY(state, y, false);
  return setZoomParams(state, state.scale, newX, newY, false, element);
};

const updateScale = (
  state: State,
  anchorX: number,
  anchorY: number,
  newScale: number
) => {
  const {
    contentBox: {height, width},
    posX,
    posY,
    scale,
  } = state;

  const ds = newScale / scale;

  const newPosX = anchorX - (anchorX - posX) * ds;
  const newPosY = anchorY - (anchorY - posY) * ds;

  return {posX: newPosX, posY: newPosY, scale: newScale};
};

const boundPosition = (
  state: State,
  newState: Pick<State, 'posX' | 'posY' | 'scale'>,
  allowExtent: boolean
) => {
  const {containerBox} = state;
  const {posX, posY, scale} = newState;

  const extentX = allowExtent && scale > 1 ? containerBox.width * 0.25 : 0;
  const extentY = allowExtent && scale > 1 ? containerBox.height * 0.25 : 0;
  const minX = containerBox.width * (1 - scale);
  const minY = containerBox.height * (1 - scale);

  return {
    posX: boundValue(posX, minX, 0, extentX),
    posY: boundValue(posY, minY, 0, extentY),
    scale,
  };
};

/** @deprecated */
const moveRelease = (state: State, x: number, y: number, animate: boolean) => {
  const newX = boundX(state, x, false);
  const newY = boundY(state, y, false);
  return setZoomParams(state, state.scale, newX, newY, animate);
};

// this needs to return a promise or at least a thenable
/** @deprecated */
const setZoomParams = (
  state: State,
  newScale: number,
  newPosX: number,
  newPosY: number,
  animate: boolean,
  elementRef?: HTMLElement
) => {
  const {posX, posY, scale} = state;
  const ds = newScale - scale;
  const dist = distance(posX, posY, newPosX, newPosY);
  const dur = animate
    ? Math.min(
        1,
        Math.max(
          dist * 0.01, // Distance
          Math.abs(ds) // Change in scale
        )
      ) * MAX_ANIMATION_DURATION
    : 0;

  if (dur > 16 && animate && elementRef) {
    // should be Animation
    const scaleFunc = numeric(scale, newScale);
    const xFunc = numeric(posX, newPosX);
    const yFunc = numeric(posY, newPosY);
    const time = dur;

    return {
      scale: scaleFunc(time),
      posX: xFunc(time),
      posY: yFunc(time),
    };
    // const keys = getKeyframes(xFunc(time), yFunc(time), scaleFunc(time));
    // elementRef.animate(keys, {
    //   easing: PAN_ZOOM_CURVE,
    //   duration: 10000,
    //   fill: 'both',
    // });
  } else {
    return {
      scale: newScale,
      posX: newPosX,
      posY: newPosY,
    };
  }
};
// keyframes
// {
//   duration: ANIMATION_DURATION,
//   fill: 'both',
//   easing: ANIMATION_EASE_IN,
// }

/** @deprecated */
const getKeyframes = (posX, posY, scale) => {
  return [{transform: translate(posX, posY) + cssScale(scale)}];
};

/** @deprecated */
export function initReducer(config: PanZoomConfig): State {
  const {
    initialScale = DEFAULT_INITIAL_SCALE,
    initialX = DEFAULT_ORIGIN,
    initialY = DEFAULT_ORIGIN,
    maxScale = DEFAULT_MAX_SCALE,
  } = config;
  return {
    ...initialState,
    posX: initialX,
    posY: initialY,
    scale: initialScale,
    maxScale,
  };
}

type PickState<keys extends keyof State> = Required<Pick<State, keys>>;

export function usePanZoomState(config: PanZoomConfig) {
  const [state, setState] = useState(() => initReducer(config));
  const actions = useMemo(() => {
    return {
      INITIALIZE_BOUNDS(payload: PickState<'contentBox' | 'containerBox'>) {
        setState((state) => ({
          ...state,
          contentBox: payload.contentBox,
          containerBox: payload.containerBox,
        }));
      },
      /** @deprecated */
      SET_DIMENSIONS() {
        setState((state) => ({
          ...state,
          height: px(state.contentBox?.height),
          width: px(state.contentBox?.width),
        }));
      },
      /** @deprecated */
      CLEAR_DIMENSIONS() {
        setState((state) => ({
          ...state,
          height: '',
          width: '',
        }));
      },
      /** @deprecated */
      UPDATE_PAN_ZOOM_BOUNDS(payload: PickState<'scale'>) {
        setState((state) => ({
          ...state,
          ...updatePanZoomBoundaries(state, payload.scale),
        }));
      },
      /** @deprecated */
      SET_CONTENT_BOX_OFFSETS(payload: PickState<'contentBox'>) {
        setState((state) => ({
          ...state,
          ...setContentBox(payload.contentBox, state.containerBox),
        }));
      },
      SET_IS_PANNABLE(payload: PickState<'isPannable'>) {
        setState((state) =>
          // temp work around for clicking on zoom button
          state.isZoomed
            ? state
            : {
                ...state,
                isPannable: payload.isPannable,
              }
        );
      },
      SET_IS_ZOOMED(payload: PickState<'isZoomed'>) {
        setState((state) => ({
          ...state,
          isZoomed: payload.isZoomed,
        }));
      },
      /** @deprecated */
      UPDATE_CONTENT_DIMENSIONS(payload: PickState<'scale'>) {
        setState((state) => ({
          ...state,
          ...updatePanZoomBoundaries(state, payload.scale),
        }));
      },
      MOVE(payload: PickState<'posX' | 'posY'> & {element: HTMLElement}) {
        setState((state) => ({
          ...state,
          ...boundPosition(state, {...payload, scale: state.scale}, false),
          // ...move(state, payload.posX, payload.posY, payload.element),
        }));
      },
      UPDATE_SCALE(payload: {
        anchorX?: number;
        anchorY?: number;
        scale: number;
      }) {
        setState((state) => {
          const allowExtent = false;
          const {
            anchorX = state.containerBox.width / 2,
            anchorY = state.containerBox.height / 2,
            scale,
          } = payload;
          const newScale = boundScale(state, scale, allowExtent);
          const newPosition = updateScale(state, anchorX, anchorY, newScale);
          const isZoomed = newScale !== 1;
          const canZoom = newScale !== state.maxScale;
          return {
            ...state,
            isZoomed,
            canZoom,
            ...boundPosition(state, newPosition, allowExtent),
          };
        });
      },
      MOVE_RELEASE() {
        setState((state) => ({
          ...state,
          isPannable: false,
        }));
      },
      /** @deprecated */
      TRANSFORM(payload: PickState<'posX' | 'posY' | 'scale'>) {
        setState((state) => ({
          ...state,
          ...updatePanZoomBoundaries(state, payload.scale),
          ...transform(state, payload.posX, payload.posY, payload.scale),
        }));
      },
    };
  }, [setState]);

  return [state, actions] as const;
}
