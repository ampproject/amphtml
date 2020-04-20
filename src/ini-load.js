/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {READY_SCAN_SIGNAL} from './service/resources-interface';
import {Services} from './services';

/** @const {!Array<string>} */
const EXCLUDE_INI_LOAD = [
  'AMP-AD',
  'AMP-ANALYTICS',
  'AMP-PIXEL',
  'AMP-AD-EXIT',
];

/**
 * Returns the promise that will be resolved when all content elements
 * have been loaded in the initially visible set.
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {!Window} hostWin
 * @param {!./layout-rect.LayoutRectDef} rect
 * @param {boolean=} opt_isInPrerender signifies if we are in prerender mode.
 * @return {!Promise}
 */
export function whenContentIniLoad(
  elementOrAmpDoc,
  hostWin,
  rect,
  opt_isInPrerender
) {
  const ampdoc = Services.ampdoc(elementOrAmpDoc);
  return getMeasuredResources(ampdoc, hostWin, (r) => {
    // TODO(jridgewell): Remove isFixed check here once the position
    // is calculted correctly in a separate layer for embeds.
    if (
      !r.isDisplayed() ||
      (!r.overlaps(rect) && !r.isFixed()) ||
      (opt_isInPrerender && !r.prerenderAllowed())
    ) {
      return false;
    }
    return true;
  }).then((resources) => {
    const promises = [];
    resources.forEach((r) => {
      if (!EXCLUDE_INI_LOAD.includes(r.element.tagName)) {
        promises.push(r.loadedOnce());
      }
    });
    return Promise.all(promises);
  });
}

/**
 * Returns a subset of resources which are (1) belong to the specified host
 * window, and (2) meet the filterFn given.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Window} hostWin
 * @param {function(!./service/resource.Resource):boolean} filterFn
 * @return {!Promise<!Array<!./service/resource.Resource>>}
 */
export function getMeasuredResources(ampdoc, hostWin, filterFn) {
  // First, wait for the `ready-scan` signal. Waiting for each element
  // individually is too expensive and `ready-scan` will cover most of
  // the initially parsed elements.
  return ampdoc
    .signals()
    .whenSignal(READY_SCAN_SIGNAL)
    .then(() => {
      // Second, wait for any left-over elements to complete measuring.
      const measurePromiseArray = [];
      const resources = Services.resourcesForDoc(ampdoc);
      resources.get().forEach((r) => {
        if (!r.hasBeenMeasured() && r.hostWin == hostWin && !r.hasOwner()) {
          measurePromiseArray.push(r.getPageLayoutBoxAsync());
        }
      });
      return Promise.all(measurePromiseArray);
    })
    .then(() => {
      const resources = Services.resourcesForDoc(ampdoc);
      return resources.get().filter((r) => {
        return (
          r.hostWin == hostWin &&
          !r.hasOwner() &&
          r.hasBeenMeasured() &&
          filterFn(r)
        );
      });
    });
}
