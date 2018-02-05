/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {computedStyle} from './style';
import {dev} from './log';
import {getParentWindowFrameElement} from './service';

const AD_CONTAINER_PROP = '__AMP__AD_CONTAINER';

/**
 * Tags that are allowed to have fixed positioning
 * @const {!Object<string, boolean>}
 */
const CONTAINERS = {
  'AMP-FX-FLYING-CARPET': true,
  'AMP-LIGHTBOX': true,
  'AMP-STICKY-AD': true,
};

/**
 * Determines if an element is fixed-positioned.
 * OK to use, because it's only called from onLayoutMeasure
 * @param {!Element} el
 * @param {!Window} win
 * @return {boolean}
 */
function isPositionFixed(el, win) {
  const position = computedStyle(win, el).position;
  // We consider sticky positions as fixed, since they can be fixed.
  return position == 'fixed' || position == 'sticky';
}

/**
 * @param {!Element} element
 * @param {!Window} win
 * @return {boolean} whether the element position is allowed. If the element
 * belongs to CONTAINERS, it is allowed to be position fixed.
 * If the element has a position fixed ancestor, it is not allowed.
 * This should only be called when a layout on the page was just forced
 * anyway.
 */
export function isAdPositionAllowed(element, win) {
  let hasFixedAncestor = false;
  let containers = 0;
  let el = element;
  do {
    if (CONTAINERS[el.tagName]) {
      // The containers must not themselves be contained in a fixed-position
      // element. Continue the search.
      containers++;
      hasFixedAncestor = false;
    } else if (isPositionFixed(dev().assertElement(el), win)) {
      // Because certain blessed elements may contain a position fixed
      // container (which contain an ad), we continue to search the
      // ancestry tree.
      hasFixedAncestor = true;
    }
    el = el.parentElement;
  } while (el && el.tagName != 'BODY');
  return !hasFixedAncestor && containers <= 1;
}

/**
 * Returns the blessed container element tagName if the ad is contained by one.
 * This is called during layout measure.
 * @param {!Element} element
 * @return {?string}
 */
export function getAdContainer(element) {
  if (element[AD_CONTAINER_PROP] === undefined) {
    let el = element;
    do {
      el = el.parentElement;
      if (CONTAINERS[el.tagName]) {
        return element[AD_CONTAINER_PROP] = el.tagName;
      }
    } while (el && el.tagName != 'BODY');
    element[AD_CONTAINER_PROP] = null;
  }
  return element[AD_CONTAINER_PROP];
}

/**
 * Gets the resource ID of the amp-ad element containing the passed node.
 * If there is no containing amp-ad tag, then null will be returned.
 * TODO(jonkeller): Investigate whether non-A4A use case is needed. Issue 11436
 * @return {?string}
 */
export function getAmpAdResourceId(node, topWin) {
  try {
    const frameParent = getParentWindowFrameElement(node, topWin).parentElement;
    if (frameParent.nodeName == 'AMP-AD') {
      return String(frameParent.getResourceId());
    }
  } catch (e) {
  }
  // Whether we entered the catch above (e.g. due to attempt to access
  // across xdomain boundary), or failed to enter the if further above, the
  // node is not within a friendly amp-ad tag. So, there is no amp-ad
  // resource ID. How to handle that is up to the caller, but see TODO above.
  return null;
}

