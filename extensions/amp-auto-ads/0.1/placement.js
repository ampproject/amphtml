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

import {dev} from '../../../src/log';
import {resourcesForDoc} from '../../../src/resources';
import {createElementWithAttributes} from '../../../src/dom';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * TODO: Specify this via the configuration.
 * @const
 */
const TARGET_AD_WIDTH_PX = 320;

/**
 * TODO: Specify this via the configuration.
 * @const
 */
const TARGET_AD_HEIGHT_PX = 100;

/**
 * @export
 * @typedef {{name: string, value: (boolean|number|string)}}
 */
export let DataAttributeDef;

/**
 * @enum {number}
 */
export const PlacementState = {
  UNUSED: 0,
  RESIZE_FAILED: 1,
  PLACED: 2,
  TOO_NEAR_EXISTING_AD: 3,
};

/**
 * Indicates where a placement is relative to the anchor element in the DOM.
 * @enum {number}
 */
const Position = {
  BEFORE: 1,  // Placement should be the sibling before the anchor element.
  FIRST_CHILD: 2,  // Placement should be the first child of the anchor element.
  LAST_CHILD: 3,  // Placement should be the last child of the anchor element.
  AFTER: 4,  // Placement should be the sibling after the anchor element.
};

/**
 * @const {!Object<!Position, !function(!Element, !Element)>}
 */
const INJECTORS = {};
INJECTORS[Position.BEFORE] = (anchorElement, elementToInject) => {
  anchorElement.parentNode.insertBefore(elementToInject, anchorElement);
};
INJECTORS[Position.AFTER] = (anchorElement, elementToInject) => {
  anchorElement.parentNode.insertBefore(
      elementToInject, anchorElement.nextSibling);
};
INJECTORS[Position.FIRST_CHILD] = (anchorElement, elementToInject) => {
  anchorElement.insertBefore(elementToInject, anchorElement.firstChild);
};
INJECTORS[Position.LAST_CHILD] = (anchorElement, elementToInject) => {
  anchorElement.appendChild(elementToInject);
};

export class Placement {
  /**
   * @param {!Window} win
   * @param {!../../../src/service/resources-impl.Resources} resources
   * @param {!Element} anchorElement
   * @param {!Position} position
   * @param {!function(!Element, !Element)} injector
   */
  constructor(win, resources, anchorElement, position, injector) {
    /** @const @private {!Window} */
    this.win_ = win;

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = resources;

    /** @const @private {!Element} */
    this.anchorElement_ = anchorElement;

    /** @const @private {!Position} */
    this.position_ = position;

    /** @const @private {!function(!Element, !Element)} */
    this.injector_ = injector;

    /** @private {?Element} */
    this.adElement_ = null;

    /** @private {!PlacementState} */
    this.state_ = PlacementState.UNUSED;
  }

  /**
   * @return {!Element}
   */
  getAdElement() {
    return dev().assertElement(this.adElement_, 'No ad element');
  }

  /**
   * An estimate of the y-position of the placement based on the position of its
   * anchor. This is known to not be completely reliable, since the position
   * of the anchor does not necessarily indicate the position of a sibling.
   * @return {!Promise<number>}
   */
  getEstimatedPosition() {
    return this.resources_.getElementLayoutBox(this.anchorElement_).then(
        layoutBox => {
          return this.getEstimatedPositionFromAchorLayout_(layoutBox);
        });
  }

  /**
   * @param {!../../../src/layout-rect.LayoutRectDef} anchorLayout
   * @return {number}
   * @private
   */
  getEstimatedPositionFromAchorLayout_(anchorLayout) {
    // TODO: This should really take account of margins and padding too.
    switch (this.position_) {
      case Position.BEFORE:
      case Position.FIRST_CHILD:
        return anchorLayout.top;
      case Position.LAST_CHILD:
      case Position.AFTER:
        return anchorLayout.bottom;
      default:
        throw new Error('Unknown position');
    }
  }

  /**
   * @param {string} type
   * @param {!Array<!DataAttributeDef>} dataAttributes
   * @param {!./ad-tracker.AdTracker} adTracker
   * @return {!Promise<!PlacementState>}
   */
  placeAd(type, dataAttributes, adTracker) {
    return this.getEstimatedPosition().then(yPosition => {
      return adTracker.isTooNearAnAd(yPosition).then(tooNear => {
        if (tooNear) {
          this.state_ = PlacementState.TOO_NEAR_EXISTING_AD;
          return this.state_;
        }
        this.adElement_ = this.createAdElement_(type, dataAttributes);
        this.injector_(this.anchorElement_, this.adElement_);
        return this.resources_.attemptChangeSize(
            this.adElement_, TARGET_AD_HEIGHT_PX, TARGET_AD_WIDTH_PX)
                .then(() => {
                  this.state_ = PlacementState.PLACED;
                  return this.state_;
                }, () => {
                  this.state_ = PlacementState.RESIZE_FAILED;
                  return this.state_;
                });
      });
    });
  }

  /**
   * @param {string} type
   * @param {!Array<!DataAttributeDef>} dataAttributes
   * @return {!Element}
   * @private
   */
  createAdElement_(type, dataAttributes) {
    const attributes = {
      type,
      'layout': 'responsive',
      'width': '0',
      'height': '0',
    };
    for (let i = 0; i < dataAttributes.length; ++i) {
      attributes['data-' + dataAttributes[i].name] = dataAttributes[i].value;
    }
    return createElementWithAttributes(
        this.win_.document, 'amp-ad', attributes);
  }
}

/**
 * @param {!Window} win
 * @param {!JSONType} configObj
 * @return {!Array<!Placement>}
 */
export function getPlacementsFromConfigObj(win, configObj) {
  const placementObjs = configObj['placements'];
  if (!placementObjs) {
    dev().warn(TAG, 'No placements in config');
    return [];
  }
  const placements = [];
  for (let i = 0; i < placementObjs.length; ++i) {
    const placement = getPlacementFromObject(win, placementObjs[i]);
    if (placement) {
      placements.push(placement);
    }
  }
  return placements;
}

/**
 * Validates that the placementObj represents a valid placement and if so
 * constructs and returns an instance of the Placement class for it.
 * @param {!Window} win
 * @param {!Object} placementObj
 * @return {?Placement}
 */
function getPlacementFromObject(win, placementObj) {
  const injector = INJECTORS[placementObj['pos']];
  if (!injector) {
    dev().warn(TAG, 'No injector for position');
    return null;
  }
  const anchor = placementObj['anchor'];
  if (!anchor) {
    dev().warn(TAG, 'No anchor in placement');
    return null;
  }
  const anchorElement = getAnchorElement(win, anchor);
  if (!anchorElement) {
    dev().warn(TAG, 'No anchor element found');
    return null;
  }
  if ((placementObj['pos'] == Position.BEFORE ||
       placementObj['pos'] == Position.AFTER) &&
      !anchorElement.parentNode) {
    dev().warn(TAG, 'Parentless anchor with BEFORE/AFTER position.');
    return null;
  }
  return new Placement(win, resourcesForDoc(anchorElement), anchorElement,
      placementObj['pos'], injector);
}

/**
 * @param {!Window} win
 * @param {!Object} anchorObj
 * @return {?Element}
 */
function getAnchorElement(win, anchorObj) {
  const selector = anchorObj['selector'];
  if (!selector) {
    dev().warn(TAG, 'No selector in anchor');
    return null;
  }
  const index = anchorObj['index'] || 0;
  if (index == 0) {
    return win.document.querySelector(selector);
  }
  return win.document.querySelectorAll(selector)[index] || null;
}
