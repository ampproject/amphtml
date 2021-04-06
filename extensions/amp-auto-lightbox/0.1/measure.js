/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '../../../src/utils/promise';

/** @type {!WeakMap<!Window, !IntersectionObserver>} */
const intersectionObserversByWin = new WeakMap();

/** @type {!WeakMap<!Element, !Deferred>} */
const measuringElements = new WeakMap();

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @return {!Promise<!ClientRect>}
 */
export function measure(ampdoc, element) {
  // Uses the `IntersectionObserver` for size measurements. It'd be more
  // appropriate to use `size-observer.measureBorderBoxSize`, but it's very
  // poorly supported. While, `IntersectionObserver` is implemented on most
  // of platforms in this basic form.
  const {win} = ampdoc;
  let observer = intersectionObserversByWin.get(win);
  if (!observer) {
    observer = new win.IntersectionObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        const {target, boundingClientRect} = entries[i];
        const deferred = measuringElements.get(target);
        if (deferred) {
          deferred.resolve(boundingClientRect);
          measuringElements.delete(target);
          observer.unobserve(target);
        }
      }
    });
    intersectionObserversByWin.set(win, observer);
  }

  let deferred = measuringElements.get(element);
  if (!deferred) {
    deferred = new Deferred();
    measuringElements.set(element, deferred);
    observer.observe(element);
  }
  return deferred.promise;
}
