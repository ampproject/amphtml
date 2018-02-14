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
import {childElementsByTag, matches} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {px, setImportantStyles} from '../../../src/style';
import {throttle} from '../../../src/utils/rate-limit';
import {toArray, toWin} from '../../../src/types';
import {unscaledClientRect} from './utils';


/** @private @const {number} */
const MIN_LAYER_WIDTH_PX = 380;


/** @private @const {number} */
const MAX_LAYER_WIDTH_PX = 520;


/** @private @const {string} */
const SCALING_APPLIED_CLASSNAME = 'i-amphtml-story-scaled';


/** @struct @typedef {{factor: number, width: number, height: number}} */
let TargetDimensionsDef;


/**
 * @struct
 * @typedef {{
 *   relativeWidth: number,
 *   relativeHeight: number,
 *   matrix: ?Array<number>,
 * }}
 */
let ScalableDimensionsDef;


/**
 * @param {!Element} sizer
 * @return {!TargetDimensionsDef}
 */
function targetDimensionsFor(sizer) {
  const {width, height} = unscaledClientRect(sizer);

  const ratio = width / height;

  const targetWidth = Math.min(MAX_LAYER_WIDTH_PX,
      Math.max(width, Math.max(1, ratio) * MIN_LAYER_WIDTH_PX));

  const targetHeight = (targetWidth / ratio);

  const factor = width / targetWidth;

  return {factor, width: targetWidth, height: targetHeight};
}


/**
 * @param {number} factor
 * @param {number} width
 * @param {number} height
 * @param {!Array<number>} matrix
 * @return {!Object<string, *>}
 */
function scaleTransform(factor, width, height, matrix) {
  // TODO(alanorozco, #12934): Translate values are not correctly calculated if
  // `scale`, `skew` or `rotate` have been user-defined.
  const translateX = width * factor / 2 - width / 2;
  const translateY = height * factor / 2 - height / 2;
  return [
    matrix[0] * factor,
    matrix[1],
    matrix[2],
    matrix[3] * factor,
    matrix[4] + translateX,
    matrix[5] + translateY,
  ];
}


/**
 * @param {!Element} page
 * @return {!Array<!Element>}
 */
function scalableElements(page) {
  return toArray(childElementsByTag(page, 'amp-story-grid-layer'));
}


/**
 * @param {!Element} page
 * @return {boolean}
 */
function isScalingEnabled(page) {
  // TODO(alanorozco, #12902): Clean up experiment flag.
  // NOTE(alanorozco): Experiment flag is temporary. No need to clutter the
  // signatures in this function path by adding `win` as a parameter.
  const win = toWin(page.ownerDocument.defaultView);
  if (isExperimentOn(win, 'amp-story-scaling')) {
    return true;
  }
  return page.getAttribute('scaling') == 'relative';
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
 * @param {!Window} win
 * @return {boolean}
 */
function isCssZoomSupported(win) {
  // IE supports `zoom`, but not `CSS.supports`.
  return Services.platformFor(win).isIe() || win.CSS.supports('zoom', '1');
}


/**
 * @param {!Window} win
 * @return {boolean}
 */
function isCssCustomPropsSupported(win) {
  return !Services.platformFor(win).isIe() && win.CSS.supports('(--foo: red)');
}


/** @private {?PageScalingService} */
let pageScalingService = null;


/**
 * Service for scaling pages dynamically so their layers will be sized within a
 * certain pixel range independent of visual dimensions.
 */
// TODO(alanorozco): Make this part of the runtime layout system to prevent
// FOUC-like jump and allow for SSR.
export class PageScalingService {
  /**
   * @param {!Window} win
   * @param {!Element} rootEl
   */
  constructor(win, rootEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
    this.rootEl_ = rootEl;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(win);

    /** @private @const {?Element} */
    // Assumes active page to be determinant of the target size.
    this.sizer_ = rootEl.querySelector('amp-story-page[active]');

    /** @private {?TargetDimensionsDef} */
    this.targetDimensions_ = null;

    /** @private {!Object<string, !Array<!ScalableDimensionsDef>>} */
    this.scalableElsDimensions_ = {};

    Services.viewportForDoc(rootEl).onResize(
        throttle(win, () => this.onViewportResize_(), 100));
  }

  /**
   * @param {!Element} story
   * @return {!PageScalingService}
   */
  static for(story) {
    // Implemented as singleton for now, should be mapped to story element.
    // TODO(alanorozco): Implement mapping to support multiple <amp-story>
    // instances in one doc.
    const win = toWin(story.ownerDocument.defaultView);
    if (!pageScalingService) {
      // TODO(alanorozco, #13064): Falling back to transform on iOS
      if (!isCssZoomSupported(win) || Services.platformFor(win).isIos()) {
        // TODO(alanorozco, #12934): Combine transform matrix.
        user().warn('AMP-STORY',
            '`amp-story-scaling` using CSS transforms as fallback.',
            'Any `amp-story-grid-layer` with user-defined CSS transforms will',
            'break.',
            'See https://github.com/ampproject/amphtml/issues/12934');
        pageScalingService = new TransformScalingService(win, story);
      } else if (isCssCustomPropsSupported(win)) {
        pageScalingService = new CssPropsZoomScalingService(win, story);
      } else {
        pageScalingService = new ZoomScalingService(win, story);
      }
    }
    return pageScalingService;
  }

  /**
   * @param {!Element} page
   * @return {!Promise}
   */
  scale(page) {
    return Promise.resolve(this.scale_(page));
  }

  /**
   * @param {!Element} page
   * @return {!Promise|undefined}
   * @private
   */
  scale_(page) {
    if (isScalingApplied(page)) {
      return;
    }
    if (!isScalingEnabled(page)) {
      return;
    }
    if (!withinRange(page)) {
      return;
    }
    return this.vsync_.runPromise({
      measure: state => {
        state.targetDimensions = this.measureTargetDimensions_();
        state.scalableElsDimensions = this.getOrMeasureScalableElsFor(page);
      },
      mutate: state => {
        const {targetDimensions, scalableElsDimensions} = state;
        scalableElements(page).forEach((el, i) => {
          // `border-box` required since layer now has a width/height set.
          setImportantStyles(el, {'box-sizing': 'border-box'});
          setImportantStyles(el,
              this.scalingStyles(targetDimensions, scalableElsDimensions[i]));
        });
        markScalingApplied(page);
      },
    }, /* state */ {});
  }

  /**
   * @return {!TargetDimensionsDef}
   * @private
   */
  measureTargetDimensions_() {
    if (!this.targetDimensions_) {
      const sizer = dev().assertElement(this.sizer_, 'No sizer.');
      const dimensions = targetDimensionsFor(sizer);
      this.targetDimensions_ = dimensions;
      this.updateRootProps(dimensions);
    }
    return /** @type {!TargetDimensionsDef} */ (
      dev().assert(this.targetDimensions_));
  }

  /**
   * @param {!Element} page
   * @return {!Array<!ScalableDimensionsDef>}
   * @protected
   */
  getOrMeasureScalableElsFor(page) {
    const pageId = user().assert(page.id, 'No page id.');

    if (!this.scalableElsDimensions_[pageId]) {
      this.scalableElsDimensions_[pageId] = this.measureScalableElsFor(page);
    }

    return /** @type {!Array<!ScalableDimensionsDef>} */ (
      dev().assert(this.scalableElsDimensions_[pageId]));
  }

  /**
   * Measures scalable elements in a page.
   * @param {!Element} page
   * @return {!Array<!ScalableDimensionsDef>}
   * @protected
   */
  measureScalableElsFor(page) {
    const {width, height} = unscaledClientRect(page);
    const pageWidth = width;
    const pageHeight = height;
    return scalableElements(page).map(el => {
      const {width, height} = unscaledClientRect(el);
      return {
        matrix: this.getTransformMatrix(el),
        relativeWidth: width / pageWidth,
        relativeHeight: height / pageHeight,
      };
    });
  }

  /** @private */
  onViewportResize_() {
    this.targetDimensions_ = null;
    this.vsync_.measure(() => {
      this.measureTargetDimensions_();
    });
    this.updatePagesOnResize();
  }

  /** @protected */
  scaleAll() {
    const pages = toArray(childElementsByTag(this.rootEl_, 'amp-story-page'));
    pages.forEach(page => {
      markScalingApplied(page, false);
      this.scale_(page);
    });
  }

  /**
   * Updates properties on root element when target dimensions have been
   * re-measured.
   * @param {!TargetDimensionsDef} unusedTargetDimensions
   */
  updateRootProps(unusedTargetDimensions) {
    // Intentionally left blank.
  }

  /** @protected */
  updatePagesOnResize() {
    // Intentionally left blank.
  }

  /**
   * Gets an element's transform matrix.
   * @param {!Element} unusedEl
   * @return {?Array<number>}
   */
  getTransformMatrix(unusedEl) {
    // Calculating a transform matrix is optional depending on scaling
    // implementation.
    return null;
  }

  /**
   * @param {!TargetDimensionsDef} unusedTargetDimensions
   * @param {!ScalableDimensionsDef} unusedScalableElDimensions
   * @return {!Object<string, *>}
   * @protected
   */
  scalingStyles(unusedTargetDimensions, unusedScalableElDimensions) {
    dev().assert(false, 'Empty PageScalingService implementation.');
    return {};
  }
}


/** Uses CSS zoom as scaling method. */
class ZoomScalingService extends PageScalingService {
  /** @protected */
  updatePagesOnResize() {
    this.scaleAll();
  }

  /** @override */
  scalingStyles(targetDimensions, elementDimensions) {
    const {width, height, factor} = targetDimensions;
    const {relativeWidth, relativeHeight} = elementDimensions;
    return {
      'width': px(width * relativeWidth),
      'height': px(height * relativeHeight),
      'zoom': factor,
    };
  }
}


/** Uses combined CSS transform as scaling method. */
class TransformScalingService extends PageScalingService {
  /** @protected */
  updatePagesOnResize() {
    this.scaleAll();
  }

  /** @override */
  getTransformMatrix(unusedEl) {
    // TODO(alanorozco, #12934): Implement.
    return [1, 0, 0, 1, 0, 0];
  }

  /** @override */
  scalingStyles(targetDimensions, elementDimensions) {
    const {width, height, factor} = targetDimensions;
    const {relativeWidth, relativeHeight, matrix} = elementDimensions;
    const initialMatrix = /** @type {!Array<number>} */ (dev().assert(matrix));
    const transformedMatrix =
      scaleTransform(factor, width, height, initialMatrix);
    return {
      'width': px(width * relativeWidth),
      'height': px(height * relativeHeight),
      'transform': `matrix(${transformedMatrix.join()})`,
    };
  }
}


/** Uses CSS zoom and custom CSS properties as scaling method. */
class CssPropsZoomScalingService extends PageScalingService {
  /** @override */
  getOrMeasureScalableElsFor(page) {
    // Circumvents element dimensions cache as layers are only mutated once.
    return this.measureScalableElsFor(page);
  }

  /** @override */
  updateRootProps() {
    const {width, height, factor} = this.targetDimensions_;
    this.vsync_.mutate(() => {
      this.rootEl_.style.setProperty('--i-amphtml-story-width', px(width));
      this.rootEl_.style.setProperty('--i-amphtml-story-height', px(height));
      this.rootEl_.style.setProperty('--i-amphtml-story-factor',
          factor.toString());
    });
  }

  /** @override */
  scalingStyles(unusedTargetDimensions, elementDimensions) {
    const {relativeWidth, relativeHeight} = elementDimensions;
    return {
      'width': `calc(var(--i-amphtml-story-width) * ${relativeWidth})`,
      'height': `calc(var(--i-amphtml-story-height) * ${relativeHeight})`,
      'zoom': 'var(--i-amphtml-story-factor)',
    };
  }
}
