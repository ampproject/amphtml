/**
 * @fileoverview Description of this file.
 */
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
  // TODO(spaharmi): generalize this to work outside requestAnimationFrame
  // and move function to src/timer-impl.js
  const timer = Services.timerFor(win);
  // Timer.promise does not defer to event loop for 0.
  const eventLoopDelay = 1;
  // First, defer to the JavaScript execution loop. If we are in a
  // requestAnimationFrame, this will place us after render. Second, wait
  // for duration to elapse.
  return timer.promise(eventLoopDelay).then(() => timer.promise(duration));
}
