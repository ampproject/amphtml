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
import {useDraggable} from './hooks/use-draggable';
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

function classNames(...args: Array<string | false | null | 0>) {
  return args.filter(Boolean).join(' ');
}

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

  // Warn if there are too many children:
  useEffect(() => {
    const childrenArray = Children.toArray(children);
    if (childrenArray.length !== 1) {
      // this should also potentially check child types?
      logger.error('BENTO-PAN-ZOOM', 'Component should only have one child');
    }
  }, [children]);

  const [state, actions] = usePanZoomState(props);

  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
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

    setStyles(contentRef.current!, {
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

  useDraggable<{posX: number; posY: number; clientX: number; clientY: number}>(
    contentRef,
    {
      dragStart({clientX, clientY}) {
        actions.SET_IS_PANNABLE({isPannable: true});
        const {posX, posY} = state;
        return {posX, posY, clientX, clientY};
      },
      dragMove({clientX, clientY}, start) {
        actions.MOVE({
          posX: start.posX + clientX - start.clientX,
          posY: start.posY + clientY - start.clientY,
          element: contentRef.current!,
        });
      },
      dragEnd: (unusedInfo, unusedStart) => {
        actions.MOVE_RELEASE();
      },
    }
  );

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

  const buttonClass = state.isZoomed
    ? styles.ampPanZoomOutIcon
    : styles.ampPanZoomInIcon;
  return (
    <ContainWrapper
      {...rest}
      ref={containerRef}
      class={styles.ampPanZoom}
      contentClassName={styles.ampPanZoomContent}
      layout
    >
      <div
        ref={contentRef}
        class={classNames(
          styles.ampPanZoomChild,
          state.isZoomed && styles.ampPanZoomPannable
        )}
      >
        {children}
      </div>

      <div
        class={classNames(styles.ampPanZoomButton, buttonClass)}
        onClick={handleZoomButtonClick}
      />
    </ContainWrapper>
  );
}

const BentoPanZoom = forwardRef(BentoPanZoomWithRef);
BentoPanZoom.displayName = 'BentoPanZoom'; // Make findable for tests.
export {BentoPanZoom};
