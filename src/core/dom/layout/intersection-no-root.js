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

  devAssert(intersectionObservers);
  let observer = intersectionObservers.get(win);
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

          devAssert(observer);
          observer.unobserve(target);
          devAssert(intersectionDeferreds);
          intersectionDeferreds.get(target)?.resolve(entries[i]);
          intersectionDeferreds.delete(target);
        }
      },
      win,
      {needsRootBounds: false}
    );
    intersectionObservers.set(win, observer);
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
  let deferred = intersectionDeferreds?.get(el);
  if (!deferred) {
    const inOb = getInOb(getWin(el));
    devAssert(intersectionDeferreds);
    inOb.observe(el);

    deferred = new Deferred();
    intersectionDeferreds.set(el, deferred);
  }

  return deferred.promise;
}
