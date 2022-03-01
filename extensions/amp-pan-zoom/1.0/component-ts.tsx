import {useDrag, useMove, usePinch} from '@use-gesture/react';
import type {ComponentChildren, Ref} from 'preact';

import {bezierCurve} from '#core/data-structures/curve';
import {scale as cssScale, setStyles, translate} from '#core/dom/style';

import * as Preact from '#preact';
import {useEffect, useImperativeHandle, useLayoutEffect, useRef} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {useGestures} from '#preact/hooks/useGestures';
import {logger} from '#preact/logger';

import {useStyles} from './component.jss';
import {usePointerDrag} from './hooks/use-pointer-drag';
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

export type BentoPanZoomProps = {
  children?: ComponentChildren;
  controls?: boolean;
  initialScale?: number;
  initialX?: number;
  initialY?: number;
  maxScale?: number;
  onTransformEnd?: (scale: number, x: number, y: number) => void;
  resetOnResize?: boolean;
};

export type BentoPanZoomApi = {
  transform(scale: number, x: number, y: number): void;
};

function getElementPosition(
  clientX: number,
  clientY: number,
  elBounds: DOMRect
) {
  return {
    anchorX: clientX - elBounds.x,
    anchorY: clientY - elBounds.y,
  };
}

function classNames(...args: Array<string | false | null | 0>) {
  return args.filter(Boolean).join(' ');
}

/**
 * @return {PreactDef.Renderable}
 */
export function BentoPanZoomWithRef(
  props: BentoPanZoomProps,
  ref: Ref<BentoPanZoomApi>
) {
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
    actions.INITIALIZE_BOUNDS({
      containerBox: containerRef.current!./*REVIEW*/ getBoundingClientRect(),
      contentBox: contentRef.current!./*REVIEW*/ getBoundingClientRect(),
    });
  }, [actions]);

  useLayoutEffect(() => {
    setStyles(contentRef.current!, {
      transformOrigin: '0 0',
      transform: translate(state.posX, state.posY) + cssScale(state.scale),
      touchAction: state.isZoomed ? 'none' : 'pan-x pan-y',
    });
  }, [state.posX, state.posY, state.scale]);

  const toggleZoom = () => {
    const newScale =
      state.scale >= maxScale ? DEFAULT_MIN_SCALE : state.scale + 1;
    actions.UPDATE_SCALE({scale: newScale});
  };

  // const resetContentDimensions = () => {
  //   actions.CLEAR_DIMENSIONS();
  // };

  // const setContentBoxOffsets = () => {
  //   actions.SET_CONTENT_BOX_OFFSETS({
  //       contentBox: containerRef.current./*REVIEW*/ getBoundingClientRect(),
  //     });
  // };

  type StartDragInfo = {
    posX: number;
    posY: number;
    clientX: number;
    clientY: number;
  };

  usePointerDrag<StartDragInfo>(contentRef, {
    button: 'left',
    onStart({clientX, clientY}) {
      actions.SET_IS_PANNABLE({isPannable: true});
      return {posX: state.posX, posY: state.posY, clientX, clientY};
    },
    onMove({clientX, clientY, data: start}) {
      actions.MOVE({
        posX: start.posX + clientX - start.clientX,
        posY: start.posY + clientY - start.clientY,
        element: contentRef.current!,
      });
    },
    onStop(unusedEv) {
      actions.MOVE_RELEASE();
    },
  });

  useGestures(contentRef, {
    pinch(ev) {
      console.log('PINCH', ev);
      toggleZoom();
    },
    doubletap(ev) {
      const {clientX, clientY} = ev.data;
      const {anchorX, anchorY} = getElementPosition(
        clientX,
        clientY,
        state.contentBox
      );
      const newScale =
        state.scale >= maxScale ? DEFAULT_MIN_SCALE : state.scale + 1;

      actions.UPDATE_SCALE({
        anchorX,
        anchorY,
        scale: newScale,
      });
    },
  });

  const handleDoubleClick = (ev: MouseEvent) => {
    const {clientX, clientY} = ev;
    const {anchorX, anchorY} = getElementPosition(
      clientX,
      clientY,
      state.contentBox
    );
    const newScale =
      state.scale >= maxScale ? DEFAULT_MIN_SCALE : state.scale + 1;
    actions.UPDATE_SCALE({anchorX, anchorY, scale: newScale});
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
        onDoubleClick={handleDoubleClick}
        class={classNames(
          styles.ampPanZoomChild,
          state.isZoomed && styles.ampPanZoomPannable
        )}
      >
        {children}
      </div>

      <div
        class={classNames(
          styles.ampPanZoomButton,
          state.isZoomed ? styles.ampPanZoomOutIcon : styles.ampPanZoomInIcon
        )}
        onClick={toggleZoom}
      />
    </ContainWrapper>
  );
}

const BentoPanZoom = forwardRef(BentoPanZoomWithRef);
BentoPanZoom.displayName = 'BentoPanZoom'; // Make findable for tests.
export {BentoPanZoom};
