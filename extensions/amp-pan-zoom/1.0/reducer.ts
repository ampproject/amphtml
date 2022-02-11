import {bezierCurve} from '#core/data-structures/curve';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {scale as cssScale, px, translate} from '#core/dom/style';
import {numeric} from '#core/dom/transition';
import {boundValue, distance} from '#core/math';

const PAN_ZOOM_CURVE = bezierCurve(0.4, 0, 0.2, 1.4);
const ANIMATION_EASE_IN = 'cubic-bezier(0,0,.21,1)';
const DEFAULT_MAX_SCALE = 3;
const DEFAULT_INITIAL_SCALE = 1;
const MAX_ANIMATION_DURATION = 250;
const DEFAULT_ORIGIN = 0;

export const ACTIONS = {
  INITIALIZE_BOUNDS: 'INITIALIZE_BOUNDS',
  SET_DIMENSIONS: 'SET_DIMENSIONS',
  SET_CONTENT_BOX_OFFSETS: 'SET_CONTENT_BOX_OFFSETS',
  CLEAR_DIMENSIONS: 'CLEAR_DIMENSIONS',
  UPDATE_PAN_ZOOM: 'UPDATE_PAN_ZOOM',
  UPDATE_PAN_ZOOM_BOUNDS: 'UPDATE_PAN_ZOOM_BOUNDS',
  SET_ZOOM_BOUNDS: 'SET_ZOOM_BOUNDS',
  UPDATE_CONTENT_DIMENSIONS: 'UPDATE_CONTENT_DIMENSIONS',
  RESET_CONTENT_DIMENSIONS: 'RESET_CONTENT_DIMENSIONS',
  TRANSFORM: 'TRANSFORM',
  SET_IS_ZOOMED: 'SET_IS_ZOOMED',
  SET_IS_PANNABLE: 'SET_IS_PANNABLE',
  MOVE: 'MOVE',
  MOVE_RELEASE: 'MOVE_RELEASE',
};

const initialRect = new DOMRect(0, 0, 0, 0);

type InitialState = {
  maxX: number;
  minX: number;
  startX: number;
  posX: number;

  maxY: number;
  minY: number;
  startY: number;
  posY: number;

  minScale: number;
  maxScale: number;
  scale: number;

  width: number;
  sourceWidth: number;
  height: number;
  sourceHeight: number;
  transform: string;

  contentBox: DOMRect;
  containerBox: DOMRect;

  isPannable: boolean;
  isZoomed: boolean;
};

type State = InitialState;

const initialState: InitialState = {
  maxX: 0,
  minX: 0,
  startX: 0,
  posX: 0,

  maxY: 0,
  minY: 0,
  startY: 0,
  posY: 0,

  minScale: 1,
  maxScale: DEFAULT_MAX_SCALE,
  scale: 1,

  width: 0,
  sourceWidth: 0,
  height: 0,
  sourceHeight: 0,
  transform: '',

  contentBox: initialRect,
  containerBox: initialRect,

  isPannable: false,
  isZoomed: false,
};

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

const resetContentDimensions = () => {};

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

const setContentBox = (contentBox: DOMRect, containerBox: DOMRect) => {
  return {
    ...contentBox,
    top: contentBox.top - containerBox.top,
    left: contentBox.left - containerBox.left,
  };
};

const boundScale = (state: State, newScale: number, allowExtent: boolean) => {
  const {maxScale, minScale} = state;
  const extent = allowExtent ? 0.25 : 0;
  return boundValue(newScale, minScale, maxScale, extent);
};

const boundX = (state: State, newPosX: number, allowExtent: boolean) => {
  const {containerBox, maxX, minX, scale} = state;
  const maxExtent = containerBox.width * 0.25;
  const extent = allowExtent && scale > 1 ? maxExtent : 0;
  return boundValue(newPosX, minX, maxX, extent);
};

const boundY = (state: State, newPosY: number, allowExtent: boolean) => {
  const {containerBox, maxY, minY, scale} = state;
  const maxExtent = containerBox.height * 0.25;
  const extent = allowExtent && scale > 1 ? maxExtent : 0;
  return boundValue(newPosY, minY, maxY, extent);
};

const transform = (state: State, x: number, y: number, scale: number) => {
  const newX = boundX(state, x, false);
  const newY = boundY(state, y, false);

  return setZoomParams(state, scale, newX, newY, true);
};

const move = (state: State, x: number, y: number, element: any) => {
  const newX = boundX(state, x, false);
  const newY = boundY(state, y, false);
  return setZoomParams(state, state.scale, newX, newY, false, element);
};

const moveRelease = (state: State, x: number, y: number, animate: boolean) => {
  const newX = boundX(state, x, false);
  const newY = boundY(state, y, false);
  return setZoomParams(state, state.scale, newX, newY, animate);
};

// this needs to return a promise or at least a thenable
const setZoomParams = (
  state: State,
  newScale: number,
  newPosX: number,
  newPosY: number,
  animate: boolean,
  elementRef?: any
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

const getKeyframes = (posX, posY, scale) => {
  return [{transform: translate(posX, posY) + cssScale(scale)}];
};

export function initReducer(config) {
  const {initialScale, initialX, initialY, maxScale} = config;
  return {
    ...initialState,
    initialScale: initialScale || DEFAULT_INITIAL_SCALE,
    initialX: initialX || DEFAULT_ORIGIN,
    initialY: initialY || DEFAULT_ORIGIN,
    maxScale: maxScale || DEFAULT_MAX_SCALE,
  };
}

export function panZoomReducer(state: InitialState, action) {
  switch (action.type) {
    case ACTIONS.INITIALIZE_BOUNDS:
      return {
        ...state,
        contentBox: action.payload.contentBox,
        containerBox: action.payload.containerBox,
      };
    case ACTIONS.SET_DIMENSIONS:
      return {
        ...state,
        height: px(state.contentBox?.height),
        width: px(state.contentBox?.width),
      };
    case ACTIONS.CLEAR_DIMENSIONS:
      return {
        ...state,
        height: '',
        width: '',
      };
    case ACTIONS.UPDATE_PAN_ZOOM:
      const transformString = `translate(${state.posX}px ${state.posY}px) scale(${state.scale})`;
      return {
        ...state,
        transform: transformString,
      };
    case ACTIONS.UPDATE_PAN_ZOOM_BOUNDS:
      return {
        ...state,
        ...updatePanZoomBoundaries(state, action.payload.scale),
      };
    case ACTIONS.SET_CONTENT_BOX_OFFSETS:
      return {
        ...state,
        ...setContentBox(action.payload.contentBox, state.containerBox),
      };
    case ACTIONS.SET_IS_PANNABLE:
      // temp work around for clicking on zoom button
      if (!state.isZoomed) {
        return state;
      } else {
        return {
          ...state,
          isPannable: action.payload.isPannable,
        };
      }
    case ACTIONS.SET_IS_ZOOMED:
      return {
        ...state,
        isZoomed: action.payload.isZoomed,
      };
    case ACTIONS.UPDATE_CONTENT_DIMENSIONS:
      return {
        ...state,
        ...updatePanZoomBoundaries(state, action.payload.scale),
      };
    case ACTIONS.MOVE:
      return {
        ...state,
        ...move(
          state,
          action.payload.posX,
          action.payload.posY,
          action.payload.element
        ),
      };
    case ACTIONS.MOVE_RELEASE:
      return {
        ...state,
        isPannable: false,
      };
    case ACTIONS.TRANSFORM:
      return {
        ...state,
        ...updatePanZoomBoundaries(state, action.payload.scale),
        ...transform(
          state,
          action.payload.x,
          action.payload.y,
          action.payload.scale
        ),
      };
    default:
      return state;
  }
}
