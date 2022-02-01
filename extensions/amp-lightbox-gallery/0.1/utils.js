/**
 * @fileoverview Description of this file.
 */
import {padStart} from '#core/types/string';

import {Services} from '#service';
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
 * Converts seconds to a timestamp formatted string.
 * @param {number} seconds
 * @return {string}
 * @package
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
