/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {restrictedVsync, timer} from './util';
import {
  centerFrameUnderVsyncMutate,
  expandFrameUnderVsyncMutate,
  collapseFrameUnderVsyncMutate,
} from '../../src/full-overlay-frame-helper';


const CENTER_TRANSITION_TIME_MS = 500;
const CENTER_TRANSITION_END_WAIT_TIME_MS = 200;


/**
 * Places the child frame in full overlay mode.
 * @param {!Window} win Host window.
 * @param {!HTMLIFrameElement} iframe
 * @param {!Function} onFinish
 * @private
 */
const expandFrameImpl = function(win, iframe, onFinish) {
  restrictedVsync(win, {
    measure(state) {
      state.viewportSize = {
        width: win./*OK*/innerWidth,
        height: win./*OK*/innerHeight,
      };
      state.rect = iframe./*OK*/getBoundingClientRect();
    },
    mutate(state) {
      centerFrameUnderVsyncMutate(iframe, state.rect, state.viewportSize,
          CENTER_TRANSITION_TIME_MS);

      timer(() => {
        restrictedVsync(win, {
          mutate() {
            expandFrameUnderVsyncMutate(iframe);
            onFinish();
          },
        });
      }, CENTER_TRANSITION_TIME_MS + CENTER_TRANSITION_END_WAIT_TIME_MS);
    },
  }, {});
};


/**
 * Resets the frame from full overlay mode.
 * @param {!Window} win Host window.
 * @param {!HTMLIFrameElement} iframe
 * @param {!Function} onFinish
 * @private
 */
const collapseFrameImpl = function(win, iframe, onFinish) {
  restrictedVsync(win, {
    mutate() {
      collapseFrameUnderVsyncMutate(iframe);
      onFinish();
    },
  });
};


/**
 * Places the child frame in full overlay mode.
 * @param {!Window} win Host window.
 * @param {!HTMLIFrameElement} iframe
 * @param {!Function} onFinish
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
 * @param {!Function} onFinish
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
