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
import {Deferred} from '#core/data-structures/promise';
import {createViewportObserver} from '../viewport-observer';
import {toWin} from '#core/window';

/**
 * @fileoverview
 * This utility is similar to the `src/utils/intersection`, but it doesn't
 * require the `rootBounds` and thus can use a simpler version of the
 * intersection observer that's supported natively on more platforms.
 *
 * TODO(#33678): Dedupe intersection measurement utils once the native
 * support is better.
 */

/** @type {WeakMap<!Element, Deferred>} */
let intersectionDeferreds;

/** @type {WeakMap<!Window, IntersectionObserver>} */
let intersectionObservers;

/**
 * @param {!Window} win
 * @return {!IntersectionObserver}
 */
function getInOb(win) {
  if (!intersectionDeferreds) {
    intersectionDeferreds = new WeakMap();
    intersectionObservers = new WeakMap();
  }

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

          observer.unobserve(target);
          intersectionDeferreds.get(target).resolve(entries[i]);
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
 * @param {!Element} el
 * @return {!Promise<IntersectionObserverEntry>}
 */
export function measureIntersectionNoRoot(el) {
  if (intersectionDeferreds && intersectionDeferreds.has(el)) {
    return intersectionDeferreds.get(el).promise;
  }

  const inOb = getInOb(toWin(el.ownerDocument.defaultView));
  inOb.observe(el);

  const deferred = new Deferred();
  intersectionDeferreds.set(el, deferred);
  return deferred.promise;
}
