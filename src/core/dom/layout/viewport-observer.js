import {devAssert} from '#core/assert';
import {isIframed} from '#core/dom';
import * as mode from '#core/mode';
import {toWin} from '#core/window';

/**
 * Returns an IntersectionObserver tracking the Viewport.
 *
 * @param {function(!Array<!IntersectionObserverEntry>)} ioCallback
 * @param {!Window} win
 * @param {{
 *   threshold: (number|!Array<number>|undefined),
 *   needsRootBounds: (boolean|undefined),
 * }=} opts
 * @return {!IntersectionObserver}
 */
export function createViewportObserver(ioCallback, win, opts = {}) {
  const {needsRootBounds, threshold} = opts;
  // The Document -> Element type conversion is necessary to satisfy the
  // `IntersectionObserver` constructor extern that only accepts `Element`.
  const root =
    isIframed(win) && needsRootBounds
      ? /** @type {?} */ (win.document)
      : undefined;
  return new win.IntersectionObserver(ioCallback, {
    threshold,
    root,
  });
}

/** @type {!WeakMap<!Window, !IntersectionObserver>} */
const viewportObservers = new WeakMap();

/** @type {!WeakMap<!Element, !Array<function(boolean)>>} */
const viewportCallbacks = new WeakMap();

/**
 * Lazily creates an IntersectionObserver per Window to track when elements
 * enter and exit the viewport. Fires viewportCallback when this happens.
 *
 * @param {!Element} element
 * @param {function(boolean)} viewportCallback
 */
export function observeWithSharedInOb(element, viewportCallback) {
  // There should never be two unique observers of the same element.
  // if (mode.isTest()) {
  //   devAssert(
  //     !viewportCallbacks.has(element) ||
  //       viewportCallbacks.get(element) === viewportCallback
  //   );
  // }

  const win = toWin(element.ownerDocument.defaultView);
  let viewportObserver = viewportObservers.get(win);
  if (!viewportObserver) {
    viewportObservers.set(
      win,
      (viewportObserver = createViewportObserver(ioCallback, win))
    );
  }
  let callbacks = viewportCallbacks.get(element);
  if (!callbacks) {
    callbacks = [];
    viewportCallbacks.set(element, callbacks);
  }

  callbacks.push(viewportCallback);
  viewportObserver.observe(element);
}

/**
 * Unobserve an element.
 * @param {!Element} element
 */
export function unobserveWithSharedInOb(element) {
  const win = toWin(element.ownerDocument.defaultView);
  const viewportObserver = viewportObservers.get(win);
  viewportObserver?.unobserve(element);
  viewportCallbacks.delete(element);
}

/**
 * Call the registered callbacks for each element that has crossed the
 * viewport boundary.
 *
 * @param {!Array<!IntersectionObserverEntry>} entries
 */
function ioCallback(entries) {
  entries.forEach((entry) => {
    const {isIntersecting, target} = entry;
    const callbacks = viewportCallbacks.get(target) ?? [];
    callbacks.forEach((callback) => {
      callback(isIntersecting);
    });
  });
}
