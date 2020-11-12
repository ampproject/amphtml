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

import {dev, devAssert} from '../../../src/log';
import {toWin} from '../../../src/types';
import {memo} from '../../../src/utils/object';
import {Deferred} from '../../../src/utils/promise';

const OBSERVERS_MAP_PROP = '__AMP_A4A_VP_MAP';

/**
 * Resolves when the underlying element is within the given viewport range.
 * @param {!Element} element
 * @param {number} viewportNum
 * @return {!Promise}
 */
export function whenWithinViewport(element, viewportNum) {
  // This can only fully be implemented when `root=document` is polyfilled
  // everywhere.
  if (!WITHIN_VIEWPORT_INOB) {
    return Promise.reject('!WITHIN_VIEWPORT_INOB');
  }

  // QQQQ: not checking isLayoutPending. It's not checked everywhere anyway.
  // // Resolve is already laid out or viewport is true.
  // if (!this.isLayoutPending() || viewport === true) {
  //   return Promise.resolve();
  // }

  const win = toWin(element.ownerDocument.defaultView);
  const observersMap = memo(win, OBSERVERS_MAP_PROP, createObserversMap);

  let observer = observersMap.get(viewportNum);
  if (!observer) {
    observer = createObserver(win, viewportNum);
    observersMap.set(viewportNum, observer);
  }
  return observer(element);
}

/** @return {!Map<string, function(!Element):!Promise>} */
const createObserversMap = () => new Map();

/**
 * @param {!Window} win
 * @param {number} viewportNum
 * @return {function(!Element):!Promise}
 */
function createObserver(win, viewportNum) {
  const elements = new WeakMap();

  const callback = (records) => {
    for (let i = 0; i < records.length; i++) {
      const {target: element, isIntersecting} = records[i];
      const deferred = elements.get(element);
      if (deferred && isIntersecting) {
        deferred.resolve();
        observer.unobserve(element);
        elements.delete(element);
      }
    }
  };

  const observer = new win.IntersectionObserver(
    callback,
    {
      root: win.document,
      rootMargin: `${(viewportNum - 1) * 100}%`,
    });

  return (element) => {
    let deferred = elements.get(element);
    if (!deferred) {
      deferred = new Deferred();
      elements.set(element, deferred);
      observer.observe(element);
    }
    return deferred.promise;
  };
}
