import {layoutRectFromDomRect, layoutRectLtwh} from '#core/dom/layout/rect';
import {resetStyles, setImportantStyles} from '#core/dom/style';

import {
  centerFrameUnderVsyncMutate,
  collapseFrameUnderVsyncMutate,
  expandFrameUnderVsyncMutate,
} from './full-overlay-frame-helper';
import {restrictedVsync, timer} from './util';

const CENTER_TRANSITION_TIME_MS = 150;
const CENTER_TRANSITION_END_WAIT_TIME_MS = 50;

/**
 * Places the child frame in full overlay mode.
 * @param {!Window} win Host window.
 * @param {!HTMLIFrameElement} iframe
 * @param {function(!LayoutRectDef, !LayoutRectDef)} onFinish
 * @private
 */
const expandFrameImpl = function (win, iframe, onFinish) {
  restrictedVsync(
    win,
    {
      measure(state) {
        state.viewportSize = {
          width: win./*OK*/ innerWidth,
          height: win./*OK*/ innerHeight,
        };
        state.rect = layoutRectFromDomRect(
          iframe./*OK*/ getBoundingClientRect()
        );
      },
      mutate(state) {
        const {height, width} = state.viewportSize;
        const expandedRect = layoutRectLtwh(0, 0, width, height);

        centerFrameUnderVsyncMutate(
          iframe,
          state.rect,
          state.viewportSize,
          CENTER_TRANSITION_TIME_MS
        );

        // To prevent double click during transition;
        setImportantStyles(iframe, {'pointer-events': 'none'});

        timer(() => {
          restrictedVsync(win, {
            mutate() {
              resetStyles(iframe, ['pointer-events']);
              expandFrameUnderVsyncMutate(iframe);
              onFinish(state.rect, expandedRect);
            },
          });
        }, CENTER_TRANSITION_TIME_MS + CENTER_TRANSITION_END_WAIT_TIME_MS);
      },
    },
    {}
  );
};

/**
 * Resets the frame from full overlay mode.
 * @param {!Window} win Host window.
 * @param {!HTMLIFrameElement} iframe
 * @param {function()} onFinish
 * @param {function(!LayoutRectDef)} onMeasure
 * @private
 */
const collapseFrameImpl = function (win, iframe, onFinish, onMeasure) {
  restrictedVsync(win, {
    mutate() {
      collapseFrameUnderVsyncMutate(iframe);

      onFinish();

      // remeasure so client knows about updated dimensions
      restrictedVsync(win, {
        measure() {
          onMeasure(
            layoutRectFromDomRect(iframe./*OK*/ getBoundingClientRect())
          );
        },
      });
    },
  });
};

/**
 * Places the child frame in full overlay mode.
 * @param {!Window} win Host window.
 * @param {!HTMLIFrameElement} iframe
 * @param {function(!LayoutRectDef, !LayoutRectDef)} onFinish
 */
export let expandFrame = expandFrameImpl;

/**
 * @param {!Function} implFn
 * @visibleForTesting
 */
export function stubExpandFrameForTesting(implFn) {
  expandFrame = implFn;
}

/**
 * @visibleForTesting
 */
export function resetExpandFrameForTesting() {
  expandFrame = expandFrameImpl;
}

/**
 * Places the child frame in full overlay mode.
 * @param {!Window} win Host window.
 * @param {!HTMLIFrameElement} iframe
 * @param {function()} onFinish
 * @param {function(!LayoutRectDef)} onMeasure
 */
export let collapseFrame = collapseFrameImpl;

/**
 * @param {!Function} implFn
 * @visibleForTesting
 */
export function stubCollapseFrameForTesting(implFn) {
  collapseFrame = implFn;
}

/**
 * @visibleForTesting
 */
export function resetCollapseFrameForTesting() {
  collapseFrame = collapseFrameImpl;
}
