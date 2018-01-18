/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {childElementsByTag, matches} from '../../../src/dom';
import {px, setImportantStyles} from '../../../src/style';
import {renderAsElement} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';
import {toArray} from '../../../src/types';


/** @private @const {number} */
const MIN_LAYER_WIDTH_PX = 380;


/** @private @const {number} */
const MAX_LAYER_WIDTH_PX = 520;


/** @private @const {string} */
const SCALING_APPLIED_CLASSNAME = 'i-amphtml-story-scaled';


/** @private @const {!./simple-template.ElementDef} */
const SIZER_TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-page-sizer'}),
};


/** @struct @typedef {{factor: number, width: number, height: number}} */
let DimensionsDef;


/** @typedef {{scale: function(!Element):!Promise}} */
let PageScalingServiceInterface;


/**
 * @param {!Element} sizer
 * @return {!DimensionsDef}
 */
function targetDimensionsFor(sizer) {
  const {width, height} = sizer./*OK*/getBoundingClientRect();

  const ratio = width / height;

  const targetWidth = Math.min(MAX_LAYER_WIDTH_PX,
      Math.max(width, Math.max(1, ratio) * MIN_LAYER_WIDTH_PX));

  const targetHeight = (targetWidth / ratio);

  const factor = width / targetWidth;

  return {width: targetWidth, height: targetHeight, factor};
}


/**
 * @param {!Element} page
 * @param {!DimensionsDef} dimensions
 */
function applyScaling(page, dimensions) {
  const {width, height, factor} = dimensions;
  // TODO(alanorozco): Calculate relative layer dimensions for cases where
  // they won't fill the entire page.
  const style = {
    'width': px(width),
    'height': px(height),
    'zoom': `${factor * 100}%`,
    'box-sizing': 'border-box',
  };
  scalableChildren(page).forEach(el => {
    setImportantStyles(el, style);
  });
  markScalingApplied(page);
}


/**
 * @param {!Element} page
 * @return {!Array<!Element>}
 */
function scalableChildren(page) {
  return toArray(childElementsByTag(page, 'amp-story-grid-layer'));
}


/**
 * @param {!Element} page
 * @return {boolean}
 */
function isScalingEnabled(page) {
  return page.getAttribute('scaling') != 'disabled';
}


/**
 * @param {!Element} page
 * @return {boolean}
 */
function isScalingApplied(page) {
  return page.classList.contains(SCALING_APPLIED_CLASSNAME);
}


/**
 * @param {!Element} page
 * @param {boolean} isApplied
 */
function markScalingApplied(page, isApplied = true) {
  page.classList.toggle(SCALING_APPLIED_CLASSNAME, isApplied);
}


/**
 * Required for lazy evaluation after resize.
 * @param {!Element} page
 * @return {boolean}
 */
function withinRange(page) {
  return matches(page, '[active], [distance="1"], [desktop] > [distance="2"]');
}


/**
 * @param {!Element} page
 * @return {boolean}
 */
function needsScaling(page) {
  return isScalingEnabled(page) && !isScalingApplied(page) && withinRange(page);
}


/**
 * @param {!Document} doc
 * @param {!Element} container
 */
function createSizer(doc, container) {
  const element = renderAsElement(doc, SIZER_TEMPLATE);
  container.appendChild(element);
  return element;
}


/** @private @const {!PageScalingServiceInterface} */
const MOCK_PAGE_SCALING_SERVICE = {
  scale(unusedPage) {
    return Promise.resolve();
  },
};


/** @private {?PageScalingServiceInterface} */
let pageScalingService = null;


/**
 * Service for scaling pages dynamically so their layers will be sized within a
 * certain pixel range independent of visual dimensions.
 */
// TODO(alanorozco): Make this part of the runtime layout system to prevent
// FOUC-like jump and allow for SSR.
export class PageScalingService {
  constructor(win, story) {
    /** @private @const {!Element} */
    this.story_ = story;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(win);

    /** @private @const {!Element} */
    this.sizer_ = createSizer(win.document, story);

    /** @private {?DimensionsDef} */
    this.dimensions_ = null;

    Services.viewportForDoc(story).onResize(
        throttle(win, () => this.onViewportResize_(), 100));
  }

  /**
   * @param {!Window} win
   * @param {!Element} story
   * @return {!PageScalingServiceInterface}
   */
  static for(win, story) {
    // Implemented as singleton for now, should be mapped to story element.
    // TODO(alanorozco): Implement mapping to support multiple <amp-story>
    // instances in one doc.
    if (!pageScalingService) {
      if (!isExperimentOn(win, 'amp-story-scaling')) {
        pageScalingService = MOCK_PAGE_SCALING_SERVICE;
      } else if (Services.platformFor(win).isFirefox()) {
        // Firefox does not support `zoom`.
        // TODO(alanorozco): Use `scale` on Firefox.
        user().warn('`amp-story-scaling` ignored: Firefox is not supported.');
        pageScalingService = MOCK_PAGE_SCALING_SERVICE;
      } else {
        pageScalingService = new PageScalingService(win, story);
      }
    }
    return pageScalingService;
  }

  /**
   * @param {!Element} page
   * @return {!Promise}
   */
  scale(page) {
    if (!needsScaling(page)) {
      return Promise.resolve();
    }
    return this.vsync_.runPromise({
      measure: () => {
        if (!this.dimensions_) {
          this.dimensions_ = targetDimensionsFor(this.sizer_);
        }
      },
      mutate: () => {
        const dimensions =
            /** @type {!DimensionsDef} */ (dev().assert(this.dimensions_));
        applyScaling(page, dimensions);
      },
    });
  }

  /** @private */
  onViewportResize_() {
    const pages = toArray(childElementsByTag(this.story_, 'amp-story-page'));
    this.dimensions_ = null;
    pages.forEach(page => {
      markScalingApplied(page, false);
      this.scale(page);
    });
  }
}
