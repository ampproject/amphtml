import {isIframed} from '#core/dom';
import {removeItem} from '#core/types/array';
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

/** @type {!WeakMap<!Element, !Array<function(IntersectionObserverEntry)>>} */
const viewportCallbacks = new WeakMap();

/**
 * Lazily creates an IntersectionObserver per Window to track when elements
 * enter and exit the viewport. Fires viewportCallback when this happens.
 *
 * TODO(dmanek): This is a wrapper around `observeIntersections` to maintain
 * backwards compatibility and can be deleted once all instances have been
 * migrated.
 *
 * @param {!Element} element
 * @param {function(boolean)} viewportCallback
 */
export function observeWithSharedInOb(element, viewportCallback) {
  observeIntersections(element, ({isIntersecting}) =>
    viewportCallback(isIntersecting)
  );
}

/**
 * Unobserve an element.
 * @param {!Element} element
 */
export function unobserveWithSharedInOb(element) {
  const win = toWin(element.ownerDocument.defaultView);
  const viewportObserver = viewportObservers.get(win);
  viewportObserver?.unobserve(element);
  // TODO(dmanek): This is a potential bug. We only want to remove
  // a single callback as opposed to all.
  viewportCallbacks.delete(element);
}

/**
 * Lazily creates an IntersectionObserver per Window to track when elements
 * enter and exit the viewport. Fires viewportCallback when this happens.
 *
 * @param {!Element} element
 * @param {function(IntersectionObserverEntry)} callback
 */
export function observeIntersections(element, callback) {
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
  callbacks.push(callback);
  viewportObserver.observe(element);
}

/**
 * Unobserves the intersection observer for the given callback.
 * If no callbacks remain for the element, unobserves the element too.
 *
 * @param {!Element} element
 * @param {function(IntersectionObserverEntry)} callback
 */
export function unobserveIntersections(element, callback) {
  const callbacks = viewportCallbacks.get(element);
  if (!callbacks) {
    return;
  }
  if (!removeItem(callbacks, callback)) {
    return;
  }
  if (callbacks.length) {
    return;
  }
  // if all callbacks for this elements are removed, unobserve & delete it
  // from the list of viewport callbacks
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
  const seen = new Set();
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    const {target} = entry;
    if (seen.has(target)) {
      continue;
    }
    seen.add(target);
    const callbacks = viewportCallbacks.get(target);
    if (!callbacks) {
      continue;
    }
    for (let k = 0; k < callbacks.length; k++) {
      const callback = callbacks[k];
      callback(entry);
    }
  }
}
