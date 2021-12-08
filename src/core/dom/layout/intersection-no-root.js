import {devAssert} from '#core/assert';
import {Deferred} from '#core/data-structures/promise';
import {createViewportObserver} from '#core/dom/layout/viewport-observer';
import {getWin} from '#core/window';

/**
 * @fileoverview
 * This utility is similar to the `./intersection`, but it doesn't
 * require the `rootBounds` and thus can use a simpler version of the
 * intersection observer that's supported natively on more platforms.
 *
 * TODO(#33678): Dedupe intersection measurement utils once the native
 * support is better.
 */

/** @type {undefined|WeakMap<Element, Deferred<IntersectionObserverEntry>>} */
let intersectionDeferreds;

/** @type {undefined|WeakMap<Window, IntersectionObserver>} */
let intersectionObservers;

/**
 * @param {Window} win
 * @return {IntersectionObserver}
 */
function getInOb(win) {
  if (!intersectionDeferreds) {
    intersectionDeferreds = new WeakMap();
    intersectionObservers = new WeakMap();
  }

  let observer = devAssert(intersectionObservers).get(win);
  if (!observer) {
    observer = createViewportObserver(
      (entries) => {
        const seen = new Set();
        for (let i = entries.length - 1; i >= 0; i--) {
          const {target} = entries[i];
          if (seen.has(target)) {
            continue;
          }
          seen.add(target);

          devAssert(observer).unobserve(target);
          devAssert(intersectionDeferreds).get(target)?.resolve(entries[i]);
          devAssert(intersectionDeferreds).delete(target);
        }
      },
      win,
      {needsRootBounds: false}
    );
    devAssert(intersectionObservers).set(win, observer);
  }
  return observer;
}

/**
 * Returns a promise that resolves with the intersection entry for the given element.
 *
 * If multiple measures for the same element occur very quickly, they will
 * dedupe to the same promise.
 *
 * @param {Element} el
 * @return {Promise<IntersectionObserverEntry>}
 */
export function measureIntersectionNoRoot(el) {
  if (intersectionDeferreds?.has(el)) {
    return devAssert(intersectionDeferreds.get(el)).promise;
  }

  const inOb = getInOb(getWin(el));
  inOb.observe(el);

  const deferred = new Deferred();
  devAssert(intersectionDeferreds).set(el, deferred);
  return deferred.promise;
}
