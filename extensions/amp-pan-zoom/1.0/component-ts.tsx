import type {VNode} from 'preact';

import {bezierCurve} from '#core/data-structures/curve';
import {scale as cssScale, setStyles, translate} from '#core/dom/style';

import * as Preact from '#preact';
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {logger} from '#preact/logger';

import {useStyles} from './component.jss';
import {usePanZoomState} from './reducer';
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

type PanZoomProps = {
  children?: VNode;
  controls?: boolean;
  initialScale?: number;
  initialX?: number;
  initialY?: number;
  maxScale?: number;
  onTransformEnd?: (scale: number, x: number, y: number) => void;
  resetOnResize?: boolean;
};
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

  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const [state, actions] = usePanZoomState(props);
  // const [state, dispatch] = useReducer(panZoomReducer, props, initReducer);
  const [mousePos, setMousePos] = useState({mousePosX: 0, mousePosY: 0});

  useEffect(() => {
    if (childrenArray.length !== 1) {
      // this should also potentially check child types?
      logger.error('BENTO-PAN-ZOOM', 'Component should only have one child');
    }
  }, [childrenArray]);

  useEffect(() => {
    if (!containerRef.current && !contentRef.current) {
      return;
    }

    actions.INITIALIZE_BOUNDS({
      contentBox: containerRef.current!./*REVIEW*/ getBoundingClientRect(),
      containerBox: contentRef.current!./*REVIEW*/ getBoundingClientRect(),
    });
  }, [actions]);

  useLayoutEffect(() => {
    if (!containerRef.current && !contentRef.current) {
      return;
    }

    const element = contentRef.current!;
    setStyles(element, {
      transform: translate(state.posX, state.posY) + cssScale(state.scale),
    });
  }, [state.posX, state.posY, state.scale]);

  const handleZoomButtonClick = () => {
    if (!state.isZoomed) {
      actions.SET_IS_ZOOMED({isZoomed: true});
      actions.TRANSFORM({posX: 0, posY: 0, scale: maxScale});
    } else {
      actions.SET_IS_ZOOMED({isZoomed: false});
      actions.TRANSFORM({posX: 0, posY: 0, scale: DEFAULT_MIN_SCALE});
    }
  };

  // const resetContentDimensions = () => {
  //   actions.CLEAR_DIMENSIONS();
  // };

  // const setContentBoxOffsets = () => {
  //   actions.SET_CONTENT_BOX_OFFSETS({
  //       contentBox: containerRef.current./*REVIEW*/ getBoundingClientRect(),
  //     });
  // };

  const onMouseMove = (e: MouseEvent) => {
    // Prevent swiping by accident
    e.preventDefault();

    if (!state.isPannable) {
      return;
    }

    const {clientX, clientY} = e;
    const deltaX = clientX - mousePos.mousePosX;
    const deltaY = clientY - mousePos.mousePosY;

    actions.MOVE({
      posX: deltaX,
      posY: deltaY,
      element: contentRef.current!,
    });
  };

  const onMouseDown = (e: MouseEvent) => {
    // Return early for right click
    if (e.button === 2) {
      return;
    }

    e.preventDefault();

    const {clientX, clientY} = e;

    actions.SET_IS_PANNABLE({isPannable: true});
    setMousePos({
      mousePosX: clientX,
      mousePosY: clientY,
    });
  };

  const onMouseUp = (e: MouseEvent) => {
    e.preventDefault();

    actions.MOVE_RELEASE();
  };

  useImperativeHandle(
    ref,
    () => /** @type {!BentoPanZoom.PanZoomApi} */ ({
      transform: (scale: number, x: number, y: number) => {
        actions.TRANSFORM({
          scale,
          posX: x,
          posY: y,
        });
      },
    }),
    [actions]
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
