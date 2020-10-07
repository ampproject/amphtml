/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/* eslint-disable local/no-style-property-setting */

const MAX_TRANSITION_DURATION = 500; // ms
const MIN_TRANSITION_DURATION = 200; // ms
const EXPAND_CURVE = 'cubic-bezier(0.47, 0, 0.745, 0.715)';
const COLLAPSE_CURVE = 'cubic-bezier(0.39, 0.575, 0.565, 1)';

/**
 * @param {!Element} content
 * @return {!UnlistenDef}
 */
export function animateExpand(content) {
  return animate(content, () => {
    const {
      height: oldHeight,
      opacity: oldOpacity,
      overflowY: oldOverflowY,
    } = content.style;

    // Measure the expanded height. This is relatively heavy with a sync
    // layout. But no way around it. The hope that the `commitStyles` API
    // may eventually make this unneeded.
    content.style.height = '0';
    content.style.opacity = '0';
    content.style.overflowY = 'auto';
    content.hidden = false;
    const targetHeight = content./*OK*/scrollHeight;

    // Reset back. The animation will take care of these properties
    // going forward.
    content.style.height = oldHeight;
    content.style.opacity = oldOpacity;
    content.style.overflowY = oldOverflowY;

    const duration = getTransitionDuration(targetHeight);

    return content.animate(
      [
        {
          height: 0,
          opacity: 0,
          overflowY: 'hidden',
        },
        {
          height: targetHeight + 'px',
          opacity: 1,
          overflowY: 'hidden',
        },
      ],
      {
        easing: EXPAND_CURVE,
        duration,
      }
    );
  });
}

/**
 * @param {!Element} content
 * @return {!UnlistenDef}
 */
export function animateCollapse(content) {
  return animate(
    content,
    () => {
      // Measure the starting height.
      // This looks ugly, but avoids weird `hidden` state management in the
      // component itself. Most importantly, this has no performance issues
      // by itself b/c flipping `hidden` back and force before measure has
      // no effect - the `useLayoutEffect` assures this.
      content.hidden = false;
      const startHeight = content./*OK*/offsetHeight;

      const duration = getTransitionDuration(startHeight);

      return content.animate(
        [
          {
            height: startHeight + 'px',
            opacity: 1,
            overflowY: 'hidden',
          },
          {
            height: '0',
            opacity: 0,
            overflowY: 'hidden',
          },
        ],
        {
          easing: COLLAPSE_CURVE,
          duration,
        }
      );
    },
    () => {
      // Undo the `content.hidden = true` above.
      content.hidden = true;
    }
  );
}

/**
 * @param {!Element} element
 * @param {function():!Animation} prepare
 * @param {function()=} cleanup
 * @return {!UnlistenDef}
 */
function animate(element, prepare, cleanup = undefined) {
  let player = prepare();
  player.onfinish = player.oncancel = () => {
    player = null;
    if (cleanup) {
      cleanup();
    }
  };
  return () => {
    if (player) {
      player.cancel();
    }
  };
}

/**
 * Calculates transition duration from vertical distance traveled
 * @param {number} dy
 * @return {number}
 */
function getTransitionDuration(dy) {
  const maxY = window./*OK*/innerHeight;
  const distanceAdjustedDuration =
    (Math.abs(dy) / maxY) * MAX_TRANSITION_DURATION;
  return Math.min(
    Math.max(distanceAdjustedDuration, MIN_TRANSITION_DURATION),
    MAX_TRANSITION_DURATION
  );
}

/* eslint-enable local/no-style-property-setting */
