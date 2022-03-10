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

  isPannable: false,
  canZoom: true,
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

const boundScale = (state: State, newScale: number) => {
  const {allowExtent, maxScale, minScale} = state;
  const extent = allowExtent ? 0.25 : 0;
  return boundValueSpring(newScale, minScale, maxScale, extent);
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
) => {
  const {posX, posY, scale} = state;

  newScale = boundScale(state, newScale);

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
) => {
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

  const extentX = allowExtent && newScale > 1 ? 0.25 : 0;
  const extentY = allowExtent && newScale > 1 ? 0.25 : 0;

  return {
    posX: boundValueSpring(posX, minX, maxX, extentX),
    posY: boundValueSpring(posY, minY, maxY, extentY),
    scale: newScale,
    isPannable: newScale !== 1,
    canZoom: newScale !== state.maxScale,
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
      updateBounds(
        payload: PickState<'contentOffset' | 'containerSize' | 'contentSize'>
      ) {
        setState((state) => {
          const newState = {
            ...state,
            ...payload,
          };
          // Ensure the element is still in-bounds:
          const newPosition = updateView(newState, newState);
          return {
            ...newState,
            ...newPosition,
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
          const newState = {
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
              : state.scale + 1,
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
    };
  }, [setState]);

  return [state, actions] as const;
}
