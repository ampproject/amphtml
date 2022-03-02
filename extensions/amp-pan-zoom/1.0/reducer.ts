import {boundValue} from '#core/math';

import {useMemo, useState} from '#preact';

import type {BentoPanZoomProps} from './component-ts';

const DEFAULT_MAX_SCALE = 3;
const DEFAULT_INITIAL_SCALE = 1;
const DEFAULT_ORIGIN = 0;

const initialRect = new DOMRect(0, 0, 0, 0);

const initialState = {
  posX: 0,
  posY: 0,

  minScale: 1,
  maxScale: DEFAULT_MAX_SCALE,
  scale: 1,

  contentBox: initialRect,
  containerBox: initialRect,

  isZoomed: false,
  canZoom: true,
  isDragging: false,
  allowExtent: false,
};

type State = typeof initialState;

type PanZoomConfig = Pick<
  BentoPanZoomProps,
  'initialScale' | 'initialX' | 'initialY' | 'maxScale'
>;

const boundScale = (state: State, newScale: number) => {
  const {allowExtent, maxScale, minScale} = state;
  const extent = allowExtent ? 0.25 : 0;
  return boundValue(newScale, minScale, maxScale, extent);
};

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

const updateView = (
  state: State,
  newState: Pick<State, 'posX' | 'posY' | 'scale'>
) => {
  const {allowExtent, containerBox, maxScale, minScale} = state;
  const {posX, posY, scale} = newState;

  const extentScale = allowExtent ? 0.25 : 0;
  const newScale = boundValue(scale, minScale, maxScale, extentScale);

  const extentX = allowExtent && newScale > 1 ? containerBox.width * 0.25 : 0;
  const extentY = allowExtent && newScale > 1 ? containerBox.height * 0.25 : 0;
  const minX = containerBox.width * (1 - newScale);
  const minY = containerBox.height * (1 - newScale);

  return {
    posX: boundValue(posX, minX, 0, extentX),
    posY: boundValue(posY, minY, 0, extentY),
    scale: newScale,
    isZoomed: newScale !== 1,
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
      INITIALIZE_BOUNDS(payload: PickState<'contentBox' | 'containerBox'>) {
        setState((state) => ({
          ...state,
          contentBox: payload.contentBox,
          containerBox: payload.containerBox,
        }));
      },
      DRAGGING_START() {
        setState((state) => {
          return {
            ...state,
            isDragging: true,
            allowExtent: true,
          };
        });
      },
      DRAGGING_RELEASE() {
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
      MOVE(payload: PickState<'posX' | 'posY'> & {element: HTMLElement}) {
        setState((state) => ({
          ...state,
          ...updateView(state, {...payload, scale: state.scale}),
        }));
      },
      UPDATE_SCALE(payload: {
        anchorX?: number;
        anchorY?: number;
        scale: number;
      }) {
        setState((state) => {
          const {
            anchorX = state.containerBox.width / 2,
            anchorY = state.containerBox.height / 2,
            scale,
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
      TRANSFORM(payload: PickState<'posX' | 'posY' | 'scale'>) {
        setState((state) => ({
          ...state,
          ...updateView(state, payload),
        }));
      },
    };
  }, [setState]);

  return [state, actions] as const;
}
