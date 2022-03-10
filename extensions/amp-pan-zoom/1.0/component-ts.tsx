import type {ComponentChildren, Ref} from 'preact';
import type {FC} from 'preact/compat';
import * as ReactHammer from 'react-hammerjs';

import {scale as cssScale, px, translate} from '#core/dom/style';

import * as Preact from '#preact';
import {useEffect, useImperativeHandle, useRef} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {useResizeObserver} from '#preact/hooks/useResizeObserver';
import {logger} from '#preact/logger';

import {useStyles} from './component.jss';
import {usePanZoomState} from './hooks/usePanZoomState';

/**
 * Fix a few issues with importing <Hammer>:
 */
const Hammer: FC<Omit<ReactHammerProps, 'children'>> = (ReactHammer as any)
  .default;
type ReactHammerProps = ReactHammer.ReactHammerProps;

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
  initialScale?: number | string;
  initialX?: number | string;
  initialY?: number | string;
  maxScale?: number | string;
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
    controls = true,
    // These are here so they will be omitted from '...rest'
    initialScale: unusedIS,
    initialX: unusedIX,
    initialY: unusedIY,
    maxScale: unusedMaxScale,
    onTransformEnd,
    resetOnResize = false,
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

    actions.updateBounds({
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
      state.scale >= state.maxScale ? DEFAULT_MIN_SCALE : state.scale + 1;
    actions.updateScale({scale: newScale});
  };

  useImperativeHandle(
    ref,
    () => /** @type {!BentoPanZoom.PanZoomApi} */ ({
      transform: (scale: number, x: number, y: number) => {
        actions.transform({
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
  };

  const hammerStartInfo = useRef<Pick<typeof state, 'posX' | 'posY'>>(null);
  const hammerHandlers: Omit<ReactHammerProps, 'children'> = {
    onDoubleTap: (ev) => {
      const {center} = ev;
      const element = containerRef.current!;
      const {anchorX, anchorY} = getElementPosition(
        center.x,
        center.y,
        element
      );
      actions.updateScale({anchorX, anchorY});
    },

    direction: 'DIRECTION_ALL',
    onPanStart: () => {
      if (!state.isPannable) {
        return;
      }
      actions.draggingStart();
      hammerStartInfo.current = {
        posX: state.posX,
        posY: state.posY,
      };
    },
    onPanEnd: () => {
      if (!state.isPannable) {
        return;
      }
      actions.draggingRelease();
    },
    onPan: (ev) => {
      if (!state.isPannable) {
        return;
      }
      const {deltaX, deltaY} = ev;

      actions.transform({
        posX: hammerStartInfo.current!.posX + deltaX,
        posY: hammerStartInfo.current!.posY + deltaY,
      });
    },

    onPinch: (ev) => {
      // TODO
      console.log('onPinch', ev);
    },
    onPinchStart: (ev) => {
      // TODO
      console.log('onPinchStart', ev);
    },
    onPinchEnd: (ev) => {
      // TODO
      console.log('onPinchEnd', ev);
    },
    options: {
      touchAction: state.isPannable ? 'none' : 'pan-x pan-y',
      recognizers: {
        pinch: {enable: true},
      },
    },
  };

  return (
    <ContainWrapper
      {...rest}
      layout
      contentClassName={styles.ampPanZoomWrapper}
      contentRef={containerRef}
    >
      <Hammer {...hammerHandlers}>
        <div
          class={classNames(
            styles.ampPanZoomContainer,
            state.isPannable && styles.ampPanZoomPannable
          )}
        >
          <div ref={contentRef}>
            <div
              class={classNames(
                styles.ampPanZoomContent,
                state.isDragging && styles.ampPanZoomDragging
              )}
              style={panZoomStyles}
              onPointerDown={(ev) => {
                if (state.isPannable) {
                  // Prevent images from being dragged, etc:
                  ev.preventDefault();
                }
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </Hammer>

      {controls && (
        <button
          class={classNames(
            styles.ampPanZoomButton,
            state.canZoom ? styles.ampPanZoomInIcon : styles.ampPanZoomOutIcon
          )}
          onClick={toggleZoom}
        />
      )}
    </ContainWrapper>
  );
}

const BentoPanZoom = forwardRef(BentoPanZoomWithRef);
BentoPanZoom.displayName = 'BentoPanZoom'; // Make findable for tests.
export {BentoPanZoom};
