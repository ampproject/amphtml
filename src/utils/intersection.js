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
import {Deferred} from '../core/data-structures/promise';
import {createViewportObserver} from '../viewport-observer';
import {dict} from '../core/types/object';
import {layoutRectFromDomRect} from '../layout-rect';
import {toWin} from '../types';

/** @type {!WeakMap<!Element, !Deferred>|undefined} */
let intersectionDeferreds;

/** @type {!WeakMap<!Window, !IntersectionObserver>|undefined} */
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
      {needsRootBounds: true}
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
 * @return {!Promise<!IntersectionObserverEntry>}
 */
export function measureIntersection(el) {
  if (intersectionDeferreds && intersectionDeferreds.has(el)) {
    return intersectionDeferreds.get(el).promise;
  }

  const inOb = getInOb(toWin(el.ownerDocument.defaultView));
  inOb.observe(el);

  const deferred = new Deferred();
  intersectionDeferreds.set(el, deferred);
  return deferred.promise;
}

/**
 * Convert an IntersectionObserverEntry to a regular object to make it serializable.
 *
 * @param {!IntersectionObserverEntry} entry
 * @return {!JsonObject}
 */
export function intersectionEntryToJson(entry) {
  return dict({
    'time': entry.time,
    'rootBounds': safeLayoutRectFromDomRect(entry.rootBounds),
    'boundingClientRect': safeLayoutRectFromDomRect(entry.boundingClientRect),
    'intersectionRect': safeLayoutRectFromDomRect(entry.intersectionRect),
    'intersectionRatio': entry.intersectionRatio,
  });
}

/**
 * @param {?} rect
 * @return {?../layout-rect.LayoutRectDef}
 */
function safeLayoutRectFromDomRect(rect) {
  if (rect === null) {
    return null;
  }
  return layoutRectFromDomRect(/** @type {!ClientRect} */ (rect));
}
