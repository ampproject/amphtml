import {useMemo, useState} from '#preact';

import type {BentoPanZoomProps} from '../component-ts';

const DEFAULT_MAX_SCALE = 3;
const DEFAULT_INITIAL_SCALE = 1;
const DEFAULT_ORIGIN = 0;

const initialState = {
  posX: 0,
  posY: 0,

  minScale: 1,
  maxScale: DEFAULT_MAX_SCALE,
  scale: 1,

  contentOffset: {x: 0, y: 0},
  containerSize: {width: 0, height: 0},
  contentSize: {width: 0, height: 0},

  isDragging: false,
  allowExtent: false,
};

type State = typeof initialState;

type PanZoomConfig = Pick<
  BentoPanZoomProps,
  'initialScale' | 'initialX' | 'initialY' | 'maxScale'
>;

/**
 * Clamps the value between min and max,
 * optionally a little "extent" past the bounds.
 */
const boundValueSpring = (
  val: number,
  min: number,
  max: number,
  extent: number
) => {
  if (val < min) {
    return min + (val - min) * extent;
  }
  if (val > max) {
    return max + (val - max) * extent;
  }
  return val;
};

/**
 * Updates the scale, keeping the "anchor" position stationary
 * @param state
 * @param anchorX
 * @param anchorY
 * @param newScale
 */
const updateScaleFromAnchor = (
  state: State,
  anchorX: number,
  anchorY: number,
  newScale: number
): PickState<'posX' | 'posY' | 'scale'> => {
  const {posX, posY, scale} = state;

  const ds = newScale / scale;

  const newPosX = anchorX - (anchorX - posX) * ds;
  const newPosY = anchorY - (anchorY - posY) * ds;

  return {posX: newPosX, posY: newPosY, scale: newScale};
};

/**
 * Updates the position and scale, ensuring they stay in-bounds.
 * Also updates various calculated properties.
 */
const updateView = (
  state: State,
  newState: Partial<PickState<'posX' | 'posY' | 'scale'>>
): Partial<State> => {
  const {
    allowExtent,
    containerSize,
    contentOffset,
    contentSize,
    maxScale,
    minScale,
  } = state;
  const {posX = state.posX, posY = state.posY, scale = state.scale} = newState;

  const extentScale = allowExtent ? 0.25 : 0;
  const newScale = boundValueSpring(scale, minScale, maxScale, extentScale);

  // Calculate the bounds:
  // Contain:
  let minX = -contentOffset.x * newScale;
  let maxX =
    containerSize.width - (contentOffset.x + contentSize.width) * newScale;
  let minY = -contentOffset.y * newScale;
  let maxY =
    containerSize.height - (contentOffset.y + contentSize.height) * newScale;
  // If content is larger than container, we Cover:
  if (contentSize.width * newScale > containerSize.width) {
    [minX, maxX] = [maxX, minX]; // (swap)
  }
  if (contentSize.height * newScale > containerSize.height) {
    [minY, maxY] = [maxY, minY]; // (swap)
  }

  const extent = allowExtent && newScale > 1 ? 0.25 : 0;

  return {
    posX: boundValueSpring(posX, minX, maxX, extent),
    posY: boundValueSpring(posY, minY, maxY, extent),
    scale: newScale,
  };
};

function initReducer(config: PanZoomConfig): State {
  const {
    initialScale = DEFAULT_INITIAL_SCALE,
    initialX = DEFAULT_ORIGIN,
    initialY = DEFAULT_ORIGIN,
    maxScale = DEFAULT_MAX_SCALE,
  } = config;
  return {
    ...initialState,
    posX: Number(initialX),
    posY: Number(initialY),
    scale: Number(initialScale),
    maxScale: Number(maxScale),
  };
}

type PickState<keys extends keyof State> = Required<Pick<State, keys>>;

export function usePanZoomState(config: PanZoomConfig) {
  const [state, setState] = useState(() => initReducer(config));
  const actions = useMemo(
    () => ({
      updateBounds(
        payload: PickState<'contentOffset' | 'containerSize' | 'contentSize'>
      ) {
        setState((state) => {
          const newState = {
            ...state,
            ...payload,
          };
          return {
            ...newState,
            // Ensure the element is still in-bounds:
            ...updateView(newState, newState),
          };
        });
      },
      draggingStart() {
        setState((state) => {
          return {
            ...state,
            isDragging: true,
            allowExtent: true,
          };
        });
      },
      draggingRelease() {
        setState((state) => {
          const newState: State = {
            ...state,
            isDragging: false,
            allowExtent: false,
          };
          // "Snap back" when we release:
          const newPosition = updateView(newState, newState);
          return {
            ...newState,
            ...newPosition,
          };
        });
      },
      updateScale(payload: {
        anchorX?: number;
        anchorY?: number;
        scale?: number;
      }) {
        setState((state) => {
          const {
            anchorX = state.containerSize.width / 2,
            anchorY = state.containerSize.height / 2,
            scale = state.scale === state.maxScale
              ? state.minScale
              : Math.floor(state.scale) + 1,
          } = payload;
          return {
            ...state,
            ...updateView(
              state,
              updateScaleFromAnchor(state, anchorX, anchorY, scale)
            ),
          };
        });
      },
      transform(payload: Partial<PickState<'posX' | 'posY' | 'scale'>>) {
        setState((state) => ({
          ...state,
          ...updateView(state, payload),
        }));
      },
    }),
    [setState]
  );

  return [state, actions] as const;
}
