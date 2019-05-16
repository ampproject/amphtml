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

import {
  LayoutMarginsChangeDef,
  cloneLayoutMarginsChangeDef,
} from '../../../src/layout-rect';
import {Services} from '../../../src/services';
import {clamp} from '../../../src/utils/math';
import {
  closestAncestorElementBySelector,
  createElementWithAttributes,
  scopedQuerySelectorAll,
  whenUpgradedToCustomElement,
} from '../../../src/dom';
import {computedStyle} from '../../../src/style';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getAttributesFromConfigObj} from './attributes';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * @typedef {{
 *   width: (number|undefined),
 *   height: (number|undefined),
 *   margins: (LayoutMarginsChangeDef|undefined),
 * }}
 */
let PlacementSizingDef;

/**
 * TODO: Specify this via the configuration.
 * @const
 */
const TARGET_AD_HEIGHT_PX = 250;

/**
 * @const
 */
const MAXIMUM_RESPONSIVE_WIDTH = 1200;

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
  BEFORE: 1, // Placement should be the sibling before the anchor element.
  FIRST_CHILD: 2, // Placement should be the first child of the anchor element.
  LAST_CHILD: 3, // Placement should be the last child of the anchor element.
  AFTER: 4, // Placement should be the sibling after the anchor element.
};

/**
 * Should be kept in sync with the disallowed_ancestors in
 * extensions/amp-ad/.../validator-amp-ad.protoascii.
 * @const {!Array<string>}
 */
const BLACKLISTED_ANCESTOR_TAGS = ['AMP-SIDEBAR', 'AMP-APP-BANNER'];

/**
 * @const {!Object<!Position, function(!Element, !Element)>}
 */
const INJECTORS = {};
INJECTORS[Position.BEFORE] = (anchorElement, elementToInject) => {
  anchorElement.parentNode.insertBefore(elementToInject, anchorElement);
};
INJECTORS[Position.AFTER] = (anchorElement, elementToInject) => {
  anchorElement.parentNode.insertBefore(
    elementToInject,
    anchorElement.nextSibling
  );
};
INJECTORS[Position.FIRST_CHILD] = (anchorElement, elementToInject) => {
  anchorElement.insertBefore(elementToInject, anchorElement.firstChild);
};
INJECTORS[Position.LAST_CHILD] = (anchorElement, elementToInject) => {
  anchorElement.appendChild(elementToInject);
};

export class Placement {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/service/resources-impl.Resources} resources
   * @param {!Element} anchorElement
   * @param {!Position} position
   * @param {function(!Element, !Element)} injector
   * @param {!JsonObject<string, string>} attributes
   * @param {!../../../src/layout-rect.LayoutMarginsChangeDef=} opt_margins
   */
  constructor(
    ampdoc,
    resources,
    anchorElement,
    position,
    injector,
    attributes,
    opt_margins
  ) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = resources;

    /** @const @private {!Element} */
    this.anchorElement_ = anchorElement;

    /** @const @private {!Position} */
    this.position_ = position;

    /** @const @private {!function(!Element, !Element)} */
    this.injector_ = injector;

    /** @const @private {!JsonObject<string, string>} */
    this.attributes_ = attributes;

    /**
     * @const
     * @private {!../../../src/layout-rect.LayoutMarginsChangeDef|undefined}
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
    return this.resources_
      .getElementLayoutBox(this.anchorElement_)
      .then(layoutBox => {
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
   * @param {!JsonObject<string, string>} baseAttributes Any attributes to add to
   *     injected <amp-ad>. Specific attributes will override defaults, but be
   *     overridden by placement specific attributes defined in the
   *     configuration.
   * @param {!./ad-network-config.SizeInfoDef} sizing
   * @param {!./ad-tracker.AdTracker} adTracker
   * @param {boolean} isResponsiveEnabled
   * @return {!Promise<!PlacementState>}
   */
  placeAd(baseAttributes, sizing, adTracker, isResponsiveEnabled) {
    return this.getEstimatedPosition().then(yPosition => {
      return adTracker.isTooNearAnAd(yPosition).then(tooNear => {
        if (tooNear) {
          this.state_ = PlacementState.TOO_NEAR_EXISTING_AD;
          return this.state_;
        }
        this.adElement_ = this.createAdElement_(baseAttributes, sizing.width);
        this.injector_(this.anchorElement_, this.getAdElement());

        return this.getPlacementSizing_(sizing, isResponsiveEnabled).then(
          placement => {
            // CustomElement polyfill does not call connectedCallback
            // synchronously. So we explicitly wait for CustomElement to be
            // ready.
            return whenUpgradedToCustomElement(this.getAdElement())
              .then(() => this.getAdElement().whenBuilt())
              .then(() => {
                return this.resources_.attemptChangeSize(
                  this.getAdElement(),
                  placement.height,
                  placement.width,
                  placement.margins
                );
              })
              .then(
                () => {
                  this.state_ = PlacementState.PLACED;
                  return this.state_;
                },
                () => {
                  this.state_ = PlacementState.RESIZE_FAILED;
                  return this.state_;
                }
              );
          }
        );
      });
    });
  }

  /**
   * Gets instructions for the placement in terms of height, width and margins.
   * If responsive is on, ad should be placed at full viewport width and a
   * proportionate height, and the margins are adjusted so that the ad edges
   * stick to both ends of the viewport.
   * @param {!./ad-network-config.SizeInfoDef} sizing
   * @param {boolean} isResponsiveEnabled
   * @return {!Promise<!PlacementSizingDef>}
   * @private
   */
  getPlacementSizing_(sizing, isResponsiveEnabled) {
    const viewport = this.resources_.getViewport();
    const viewportWidth = viewport.getWidth();
    if (isResponsiveEnabled && viewportWidth <= MAXIMUM_RESPONSIVE_WIDTH) {
      const viewportHeight = viewport.getHeight();
      const responsiveHeight = getResponsiveHeightForContext_(
        viewportWidth,
        viewportHeight
      );
      let margins = cloneLayoutMarginsChangeDef(this.margins_);
      return Services.resourcesForDoc(this.anchorElement_)
        .getElementLayoutBox(this.anchorElement_)
        .then(layoutBox => {
          const direction = computedStyle(this.ampdoc.win, this.anchorElement_)[
            'direction'
          ];
          if (layoutBox.left !== 0) {
            margins = margins || {};
            if (direction == 'rtl') {
              margins.right = layoutBox.left;
            } else {
              margins.left = -layoutBox.left;
            }
          }
        })
        .then(() => {
          return Promise.resolve({
            width: viewportWidth,
            height: responsiveHeight,
            margins,
          });
        });
    } else {
      return Promise.resolve(
        /** @type {!PlacementSizingDef} */ ({
          height: sizing.height || TARGET_AD_HEIGHT_PX,
          margins: this.margins_,
        })
      );
    }
  }

  /**
   * @param {!JsonObject<string, string>} baseAttributes
   * @param {number|undefined} width
   * @return {!Element}
   * @private
   */
  createAdElement_(baseAttributes, width) {
    const attributes = /** @type {!JsonObject} */ (Object.assign(
      dict({
        'layout': width ? 'fixed' : 'fixed-height',
        'height': '0',
        'width': width ? width : 'auto',
        'class': 'i-amphtml-layout-awaiting-size',
      }),
      baseAttributes,
      this.attributes_
    ));
    return createElementWithAttributes(
      this.ampdoc.win.document,
      'amp-ad',
      attributes
    );
  }
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject} configObj
 * @return {!Array<!Placement>}
 */
export function getPlacementsFromConfigObj(ampdoc, configObj) {
  const placementObjs = configObj['placements'];
  if (!placementObjs) {
    user().info(TAG, 'No placements in config');
    return [];
  }
  const placements = [];
  placementObjs.forEach(placementObj => {
    getPlacementsFromObject(ampdoc, placementObj, placements);
  });
  return placements;
}

/**
 * Validates that the placementObj represents a valid placement and if so
 * constructs and returns an instance of the Placement class for it.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject} placementObj
 * @param {!Array<!Placement>} placements
 */
function getPlacementsFromObject(ampdoc, placementObj, placements) {
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
  const anchorElements = getAnchorElements(ampdoc.getRootNode(), anchor);
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
    placements.push(
      new Placement(
        ampdoc,
        Services.resourcesForDoc(anchorElement),
        anchorElement,
        placementObj['pos'],
        injector,
        attributes,
        margins
      )
    );
  });
}

/**
 * Looks up the element(s) addresses by the anchorObj.
 *
 * @param {(Document|ShadowRoot|Element)} rootElement
 * @param {!Object} anchorObj
 * @return {!Array<!Element>}
 */
function getAnchorElements(rootElement, anchorObj) {
  const selector = anchorObj['selector'];
  if (!selector) {
    user().warn(TAG, 'No selector in anchor');
    return [];
  }
  let elements = [].slice.call(
    scopedQuerySelectorAll(rootElement.documentElement || rootElement, selector)
  );

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
    position == Position.BEFORE || position == Position.AFTER
      ? anchorElement.parentElement
      : anchorElement;
  if (!elementToCheckOrNull) {
    user().warn(TAG, 'Parentless anchor with BEFORE/AFTER position.');
    return false;
  }
  const elementToCheck = dev().assertElement(elementToCheckOrNull);
  return !BLACKLISTED_ANCESTOR_TAGS.some(tagName => {
    if (closestAncestorElementBySelector(elementToCheck, tagName)) {
      user().warn(TAG, 'Placement inside blacklisted ancestor: ' + tagName);
      return true;
    }
    return false;
  });
}

/**
 * Calculates the appropriate height for a full-width responsive ad.
 * @param {number} viewportWidth
 * @param {number} viewportHeight
 * @return {number}
 * @private
 */
function getResponsiveHeightForContext_(viewportWidth, viewportHeight) {
  const minHeight = 100;
  const maxHeight = Math.min(300, viewportHeight);
  // We aim for a 6:5 aspect ratio.
  const idealHeight = Math.round(viewportWidth / 1.2);
  return clamp(idealHeight, minHeight, maxHeight);
}
