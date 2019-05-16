/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
/**
 * @fileoverview Description of this file.
 */
import {Services} from '../../../src/services';
/**
 * Runs a delay after deferring to the event loop. This is useful to call from
 * within an animation frame, as you can be sure that at least duration
 * milliseconds has elapsed after the animation has started. Simply waiting
 * for the desired duration may result in running code before an animation has
 * completed.
 * @param {!Window} win A Window object.
 * @param {number} duration How long to wait for.
 * @return {!Promise} A Promise that resolves after the specified duration.
 */
export function delayAfterDeferringToEventLoop(win, duration) {
  const timer = Services.timerFor(win);
  // Timer.promise does not defer to event loop for 0.
  const eventLoopDelay = 1;
  // First, defer to the JavaScript execution loop. If we are in a
  // requestAnimationFrame, this will place us after render. Second, wait
  // for duration to elapse.
  return timer.promise(eventLoopDelay).then(() => timer.promise(duration));
}

/**
 * Pads the beginning of a string with a substring to a target length.
 * @param {string} s
 * @param {number} targetLength
 * @param {string} padString
 */
function padStart(s, targetLength, padString) {
  if (s.length >= targetLength) {
    return s;
  }
  targetLength = targetLength - s.length;
  let padding = padString;
  while (targetLength > padding.length) {
    padding += padString;
  }
  return padding.slice(0, targetLength) + s;
}

/**
 * Converts seconds to a timestamp formatted string.
 * @param {number} seconds
 * @return {string}
 * @private
 */
export function secondsToTimestampString(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const hh = padStart(h.toString(), 2, '0');
  const mm = padStart(m.toString(), 2, '0');
  const ss = padStart(s.toString(), 2, '0');
  return hh + ':' + mm + ':' + ss;
}
