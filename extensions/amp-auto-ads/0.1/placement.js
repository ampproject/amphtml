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

import {dev, user} from '../../../src/log';
import {getAttributesFromConfigObj} from './attributes';
import {resourcesForDoc} from '../../../src/services';
import {
  closestByTag,
  createElementWithAttributes,
  scopedQuerySelectorAll,
} from '../../../src/dom';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * TODO: Specify this via the configuration.
 * @const
 */
const TARGET_AD_HEIGHT_PX = 250;

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
 * Should be kept in sync with the disallowed_ancestors in
 * extensions/amp-ad/.../validator-amp-ad.protoascii.
 * @const {!Array<string>}
 */
const BLACKLISTED_ANCESTOR_TAGS = [
  'AMP-SIDEBAR',
  'AMP-APP-BANNER',
];

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
   * @param {!Object<string, string>} attributes
   * @param {!../../../src/DOM-rect.DOMMarginsChangeDef=} opt_margins
   */
  constructor(win, resources, anchorElement, position, injector, attributes,
      opt_margins) {
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

    /** @const @private {!Object<string, string>} */
    this.attributes_ = attributes;

    /**
     * @const
     * @private {!../../../src/DOM-rect.DOMMarginsChangeDef|undefined}
     */
    this.margins_ = opt_margins;

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
   * @param {!../../../src/DOM-rect.DOMRectDef} anchorLayout
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
   * @param {!Object<string, string>} baseAttributes Any attributes to add to
   *     injected <amp-ad>. Specific attributes will override defaults, but be
   *     overridden by placement specific attributes defined in the
   *     configuration.
   * @param {!./ad-tracker.AdTracker} adTracker
   * @return {!Promise<!PlacementState>}
   */
  placeAd(baseAttributes, adTracker) {
    return this.getEstimatedPosition().then(yPosition => {
      return adTracker.isTooNearAnAd(yPosition).then(tooNear => {
        if (tooNear) {
          this.state_ = PlacementState.TOO_NEAR_EXISTING_AD;
          return this.state_;
        }
        this.adElement_ = this.createAdElement_(baseAttributes);
        this.injector_(this.anchorElement_, this.adElement_);
        return this.resources_.attemptChangeSize(this.adElement_,
            TARGET_AD_HEIGHT_PX, undefined, this.margins_)
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
   * @param {!Object<string, string>} baseAttributes
   * @return {!Element}
   * @private
   */
  createAdElement_(baseAttributes) {
    const attributes = Object.assign({
      'layout': 'fixed-height',
      'height': '0',
      'class': 'i-amphtml-layout-awaiting-size',
    }, baseAttributes, this.attributes_);
    return createElementWithAttributes(
        this.win_.document, 'amp-ad', attributes);
  }
}

/**
 * @param {!Window} win
 * @param {!JsonObject} configObj
 * @return {!Array<!Placement>}
 */
export function getPlacementsFromConfigObj(win, configObj) {
  const placementObjs = configObj['placements'];
  if (!placementObjs) {
    user().warn(TAG, 'No placements in config');
    return [];
  }
  const placements = [];
  placementObjs.forEach(placementObj => {
    getPlacementsFromObject(win, placementObj, placements);
  });
  return placements;
}

/**
 * Validates that the placementObj represents a valid placement and if so
 * constructs and returns an instance of the Placement class for it.
 * @param {!Window} win
 * @param {!Object} placementObj
 * @param {!Array<!Placement>} placements
 */
function getPlacementsFromObject(win, placementObj, placements) {
  const injector = INJECTORS[placementObj['pos']];
  if (!injector) {
    user().warn(TAG, 'No injector for position');
    return;
  }
  const anchor = placementObj['anchor'];
  if (!anchor) {
    user().warn(TAG, 'No anchor in placement');
    return;
  }
  const anchorElements =
      getAnchorElements(win.document.documentElement, anchor);
  if (!anchorElements.length) {
    user().warn(TAG, 'No anchor element found');
    return;
  }
  let margins = undefined;
  if (placementObj['style']) {
    const marginTop = parseInt(placementObj['style']['top_m'], 10);
    const marginBottom = parseInt(placementObj['style']['bot_m'], 10);
    if (marginTop || marginBottom) {
      margins = {
        top: marginTop || undefined,
        bottom: marginBottom || undefined,
      };
    }
  }
  anchorElements.forEach(anchorElement => {
    if (!isPositionValid(anchorElement, placementObj['pos'])) {
      return;
    }
    const attributes = getAttributesFromConfigObj(placementObj);
    placements.push(new Placement(win, resourcesForDoc(anchorElement),
        anchorElement, placementObj['pos'], injector, attributes, margins));
  });
}

/**
 * Looks up the element(s) addresses by the anchorObj.
 *
 * @param {!Element} rootElement
 * @param {!Object} anchorObj
 * @return {!Array<!Element>}
 */
function getAnchorElements(rootElement, anchorObj) {
  const selector = anchorObj['selector'];
  if (!selector) {
    user().warn(TAG, 'No selector in anchor');
    return [];
  }
  let elements = [].slice.call(scopedQuerySelectorAll(rootElement, selector));

  const minChars = anchorObj['min_c'] || 0;
  if (minChars > 0) {
    elements = elements.filter(el => {
      return el.textContent.length >= minChars;
    });
  }

  if (typeof anchorObj['index'] == 'number' || !anchorObj['all']) {
    const element = elements[anchorObj['index'] || 0];
    elements = element ? [element] : [];
  }

  if (elements.length == 0) {
    return [];
  }

  if (anchorObj['sub']) {
    let subElements = [];
    elements.forEach(el => {
      subElements = subElements.concat(getAnchorElements(el, anchorObj['sub']));
    });
    return subElements;
  }
  return elements;
}

/**
 * @param {!Element} anchorElement
 * @param {!Position} position
 * @return {boolean}
 */
function isPositionValid(anchorElement, position) {
  const elementToCheckOrNull =
      position == Position.BEFORE || position == Position.AFTER ?
          anchorElement.parentElement : anchorElement;
  if (!elementToCheckOrNull) {
    user().warn(TAG, 'Parentless anchor with BEFORE/AFTER position.');
    return false;
  }
  const elementToCheck = dev().assertElement(elementToCheckOrNull);
  return !BLACKLISTED_ANCESTOR_TAGS.some(tagName => {
    if (closestByTag(elementToCheck, tagName)) {
      user().warn(TAG, 'Placement inside blacklisted ancestor: ' + tagName);
      return true;
    }
    return false;
  });
}
