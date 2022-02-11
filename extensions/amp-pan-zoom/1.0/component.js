import {bezierCurve} from '#core/data-structures/curve';
import {
  scale as cssScale,
  getStyle,
  setStyles,
  translate,
} from '#core/dom/style';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {logger} from '#preact/logger';

import {useStyles} from './component.jss';
import {ACTIONS, initReducer, panZoomReducer} from './reducer';
const PAN_ZOOM_CURVE_ = bezierCurve(0.4, 0, 0.2, 1.4);
const TAG = 'amp-pan-zoom';
const DEFAULT_MAX_SCALE = 3;
const DEFAULT_MIN_SCALE = 1;
const DEFAULT_INITIAL_SCALE = 1;
const MAX_ANIMATION_DURATION = 250;
const DEFAULT_ORIGIN = 0;

const ELIGIBLE_TAGS = new Set([
  'svg',
  'div',
  'img',
  // 'AMP-IMG',
  // 'AMP-LAYOUT',
  // 'AMP-SELECTOR',
]);

const useZoomAnimation = () => {};

/**
 * @param {!BentoPanZoom.Props} props
 * @param {{current: ?BentoPanZoom.PanZoomApi}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoPanZoomWithRef(props, ref) {
  const {
    children,
    controls,
    initialScale = DEFAULT_INITIAL_SCALE,
    initialX = DEFAULT_ORIGIN,
    initialY = DEFAULT_ORIGIN,
    maxScale = DEFAULT_MAX_SCALE,
    onTransformEnd,
    resetOnResize,
    ...rest
  } = props;
  const styles = useStyles();
  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const [state, dispatch] = useReducer(panZoomReducer, props, initReducer);
  const [mousePos, setMousePos] = useState({mousePosX: 0, mousePosY: 0});

  useEffect(() => {
    if (childrenArray.length !== 1) {
      // this should also potentially check child types?
      logger.error('BENTO-PAN-ZOOM', 'Component should only have one child');
    }
  }, [childrenArray]);

  useLayoutEffect(() => {
    if (!containerRef.current && !contentRef.current) {
      return;
    }

    dispatch({
      type: ACTIONS.INITIALIZE_BOUNDS,
      payload: {
        contentBox: containerRef.current./*REVIEW*/ getBoundingClientRect(),
        containerBox: contentRef.current./*REVIEW*/ getBoundingClientRect(),
      },
    });
  }, []);

  useLayoutEffect(() => {
    if (!containerRef.current && !contentRef.current) {
      return;
    }

    const element = contentRef.current;
    setStyles(element, {
      transform: translate(state.posX, state.posY) + cssScale(state.scale),
    });
  }, [state.posX, state.posY, state.scale]);

  const handleZoomButtonClick = (e) => {
    if (!state.isZoomed) {
      dispatch({type: ACTIONS.SET_IS_ZOOMED, payload: {isZoomed: true}});
      dispatch({
        type: ACTIONS.TRANSFORM,
        payload: {x: 0, y: 0, scale: maxScale},
      });
    } else {
      dispatch({type: ACTIONS.SET_IS_ZOOMED, payload: {isZoomed: false}});
      dispatch({
        type: ACTIONS.TRANSFORM,
        payload: {x: 0, y: 0, scale: DEFAULT_MIN_SCALE},
      });
    }
  };

  // const resetContentDimensions = () => {
  //   dispatch({type: ACTIONS.CLEAR_DIMENSIONS});
  // };

  // const setContentBoxOffsets = () => {
  //   dispatch({
  //     type: ACTIONS.SET_CONTENT_BOX_OFFSETS,
  //     payload: {
  //       contentBox: containerRef.current./*REVIEW*/ getBoundingClientRect(),
  //     },
  //   });
  // };

  const onMouseMove = useCallback(
    (e) => {
      // Prevent swiping by accident
      e.preventDefault();

      if (!state.isPannable) {
        return;
      }

      const {clientX, clientY} = e;
      const deltaX = clientX - mousePos.mousePosX;
      const deltaY = clientY - mousePos.mousePosY;

      dispatch({
        type: ACTIONS.MOVE,
        payload: {
          posX: deltaX,
          posY: deltaY,
          element: contentRef.current,
        },
      });
    },
    [mousePos.mousePosX, mousePos.mousePosY, state.isPannable]
  );

  const onMouseDown = useCallback((e) => {
    // Return early for right click
    if (e.button == 2) {
      return;
    }

    e.preventDefault();

    const {clientX, clientY} = e;

    dispatch({type: ACTIONS.SET_IS_PANNABLE, payload: {isPannable: true}});
    setMousePos({
      mousePosX: clientX,
      mousePosY: clientY,
    });
  }, []);

  const onMouseUp = useCallback((e) => {
    e.preventDefault();

    const {clientX, clientY} = e;

    dispatch({
      type: ACTIONS.MOVE_RELEASE,
      payload: {
        posX: clientX,
        posY: clientY,
      },
    });
  }, []);

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoPanZoom.PanZoomApi} */ ({
        transform: (scale, x, y) => {
          dispatch({
            type: ACTIONS.TRANSFORM,
            payload: {
              scale,
              posX: x,
              posY: y,
            },
          });
        },
      }),
    []
  );

  const showPanCursor = state.isZoomed ? styles.ampPanZoomPannable : '';
  const buttonClass = state.isZoomed
    ? styles.ampPanZoomOutIcon
    : styles.ampPanZoomInIcon;
  return (
    <ContainWrapper
      {...rest}
      ref={containerRef}
      onMouseMove={onMouseMove}
      class={styles.ampPanZoom}
      contentClassName={styles.ampPanZoomContent}
      layout
    >
      <div
        ref={contentRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        class={`${styles.ampPanZoomChild} ${showPanCursor}`}
      >
        {children}
      </div>

      <div
        class={`${styles.ampPanZoomButton} ${buttonClass}`}
        onClick={handleZoomButtonClick}
      />
    </ContainWrapper>
  );
}

const BentoPanZoom = forwardRef(BentoPanZoomWithRef);
BentoPanZoom.displayName = 'BentoPanZoom'; // Make findable for tests.
export {BentoPanZoom};
