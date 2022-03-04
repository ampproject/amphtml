import type {ComponentChildren, Ref} from 'preact';

import {scale as cssScale, px, translate} from '#core/dom/style';

import * as Preact from '#preact';
import {useEffect, useImperativeHandle, useRef} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {useGestures} from '#preact/hooks/useGestures';
import {logger} from '#preact/logger';

import {useStyles} from './component.jss';
import {usePointerDrag} from './hooks/use-pointer-drag';
import {useResizeObserver} from './hooks/use-resize-observer';
import {usePanZoomState} from './reducer';

const TAG = 'amp-pan-zoom';
const DEFAULT_MAX_SCALE = 3;
const DEFAULT_MIN_SCALE = 1;

const ELIGIBLE_TAGS = new Set([
  'svg',
  'div',
  'img',
  // 'AMP-IMG',
  // 'AMP-LAYOUT',
  // 'AMP-SELECTOR',
]);

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
  element: HTMLElement
) {
  const elBounds = element./* REVIEW */ getBoundingClientRect();
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
    initialScale,
    initialX,
    initialY,
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
      logger.error(TAG, 'Component should only have one child');
    }
  }, [children]);

  const [state, actions] = usePanZoomState(props);

  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSizes = () => {
    const contentBox = contentRef.current!./* REVIEW */ getBoundingClientRect();
    const containerBox =
      containerRef.current!./* REVIEW */ getBoundingClientRect();

    actions.UPDATE_BOUNDS({
      containerSize: containerBox,
      contentSize: contentBox,
      contentOffset: {
        x: contentBox.x - containerBox.x,
        y: contentBox.y - containerBox.y,
      },
    });
  };
  useResizeObserver(contentRef, updateSizes);
  useResizeObserver(containerRef, updateSizes);

  const toggleZoom = () => {
    const newScale =
      state.scale >= maxScale ? DEFAULT_MIN_SCALE : state.scale + 1;
    actions.UPDATE_SCALE({scale: newScale});
  };

  type StartDragInfo = {
    posX: number;
    posY: number;
    clientX: number;
    clientY: number;
  };
  usePointerDrag<StartDragInfo>(containerRef, {
    button: 'left',
    onStart({clientX, clientY}) {
      actions.DRAGGING_START();
      return {posX: state.posX, posY: state.posY, clientX, clientY};
    },
    onMove({clientX, clientY, data: start}) {
      actions.MOVE({
        posX: start.posX + clientX - start.clientX,
        posY: start.posY + clientY - start.clientY,
      });
    },
    onStop(unusedEv) {
      actions.DRAGGING_RELEASE();
    },
  });

  useGestures(containerRef, {
    doubletap(ev) {
      const {clientX, clientY} = ev.data;
      const {anchorX, anchorY} = getElementPosition(
        clientX,
        clientY,
        containerRef.current!
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
      ev.currentTarget as HTMLElement
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

  const panZoomStyles = {
    transformOrigin:
      px(-state.contentOffset.x) + ' ' + px(-state.contentOffset.y),
    transform: translate(state.posX, state.posY) + cssScale(state.scale),
    touchAction: state.isZoomed ? 'none' : 'pan-x pan-y',
  };

  return (
    <ContainWrapper
      {...rest}
      layout
      contentClassName={styles.ampPanZoomWrapper}
    >
      <div
        class={classNames(
          styles.ampPanZoomContainer,
          state.isZoomed && styles.ampPanZoomPannable
        )}
        ref={containerRef}
        onDblClick={handleDoubleClick}
      >
        <div ref={contentRef}>
          <div
            class={classNames(
              styles.ampPanZoomContent,
              state.isDragging && styles.ampPanZoomDragging
            )}
            style={panZoomStyles}
          >
            {children}
          </div>
        </div>
      </div>

      <button
        class={classNames(
          styles.ampPanZoomButton,
          state.canZoom ? styles.ampPanZoomInIcon : styles.ampPanZoomOutIcon
        )}
        onClick={toggleZoom}
      />
    </ContainWrapper>
  );
}

const BentoPanZoom = forwardRef(BentoPanZoomWithRef);
BentoPanZoom.displayName = 'BentoPanZoom'; // Make findable for tests.
export {BentoPanZoom};
