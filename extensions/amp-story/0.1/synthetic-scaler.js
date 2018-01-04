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
import {dev} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {
  px,
  resetStyles,
  scale,
  setImportantStyles,
  translate,
} from '../../../src/style';


/**
 * Minimum pixel width that pages can render at.
 * @private @const {number}
 */
const MIN_RENDER_WIDTH = 380;

/**
 * Maximum pixel width that pages can render at.
 * @private @const {number}
 */
const MAX_RENDER_WIDTH = 460;


//   __          __     _____  _   _ _____ _   _  _____ _
//   \ \        / /\   |  __ \| \ | |_   _| \ | |/ ____| |
//    \ \  /\  / /  \  | |__) |  \| | | | |  \| | |  __| |
//     \ \/  \/ / /\ \ |  _  /| . ` | | | | . ` | | |_ | |
//      \  /\  / ____ \| | \ \| |\  |_| |_| |\  | |__| |_|
//       \/  \/_/    \_\_|  \_\_| \_|_____|_| \_|\_____(_)
//
// The constants below should always match the values set in
// ./amp-story-desktop-scaling.css
//
// If you need to modify some of these values, make sure that to also update the
// corresponding CSS properties.

/**
 * Scale factor for width of available area on desktop.
 * Respective to viewport height.
 * @private @const {number}
 */
const DESKTOP_AVAILABLE_WIDTH = 3 / 5 * 0.75;

/**
 * Scale factor for height of available area on desktop.
 * Respective to viewport height.
 * @private @const {number}
 */
const DESKTOP_AVAILABLE_HEIGHT = 0.75;

/**
 * Scale factor for inactive pages on desktop.
 * @private @const {number}
 */
const DESKTOP_INACTIVE_SCALE = 0.9;

/**
 * `translateX` value for pages that are not visible/scheduled on desktop.
 * @private @const {string}
 */
const DESKTOP_UNSCHEDULED_X = '250vw';

/**
 * `translateX` value for active page on desktop.
 * @private @const {string}
 */
const DESKTOP_ACTIVE_X = '-50%';

/**
 * `translateX` value for page on the right of the active page on desktop.
 * @private @const {string}
 */
const DESKTOP_INACTIVE_RIGHT_X = 'calc(50% + 64px)';

/**
 * `translateX` value for page on the left of the active page on desktop.
 * @private @const {string}
 */
const DESKTOP_INACTIVE_LEFT_X = 'calc(-150% - 64px)';


/** @struct @typedef {{width: number, height: number}} */
let AreaDef;


/**
 * @param {!Window} win
 * @param {!Element} pageElement
 * @return {!PageScaler}
 */
export function createPageScaler(win, pageElement) {
  if (!isExperimentOn(win, 'amp-story-scaler')) {
    return new MockPageScaler();
  }
  return new RealPageScaler(pageElement);
}


/** @interface */
export class PageScaler {
  /** @param {!AreaDef} unusedArea */
  setViewportArea(unusedArea) {}

  /** Applies scaling. */
  apply() {}
}


/** @implements {PageScaler} */
// Used when experiment is off.
class MockPageScaler {
  /** @param {!AreaDef} unusedArea */
  setViewportArea(unusedArea) {}

  /** Applies scaling. */
  apply() {}
}


/** @implements {PageScaler} */
// TODO(alanorozco): RTL
class RealPageScaler {
  /** @param {!Element} pageElement */
  constructor(pageElement) {
    /** @private @const {!Element} */
    this.pageElement_ = pageElement;

    /** @private {?AreaDef} */
    this.viewportArea_ = null;

    /** @private {?AreaDef} */
    this.lastScaledAtViewportArea_ = null;

    /** @private {?number} */
    this.lastScaledAtDistance_ = null;

    /** @private {?number} */
    this.lastScaledAtBaseFactor_ = null;
  }

  /** @param {!AreaDef} area */
  setViewportArea(area) {
    this.viewportArea_ = area;
    this.apply();
  }

  /** Applies scaling. */
  apply() {
    const pageDistance = this.getPageDistance_();

    if (pageDistance === null) {
      // Too early.
      return;
    }

    const hasViewportChanged = !this.lastScaledAtViewportArea_ ||
        this.lastScaledAtViewportArea_.width != this.viewportArea_.width ||
        this.lastScaledAtViewportArea_.height != this.viewportArea_.height;

    const hasDistanceChanged = this.lastScaledAtDistance_ !== pageDistance;

    if (!hasDistanceChanged && !hasViewportChanged) {
      // Don't scale if nothing changed.
      return;
    }

    this.lastScaledAtDistance_ = pageDistance;
    this.lastScaledAtViewportArea_ = this.viewportArea_;

    if (pageDistance >= 3) {
      // Disable transform and ignore pages that are too far from the active
      // page.
      this.resetAppliedStyles_();
      return;
    }

    const baseScaleFactor = this.getBaseScaleFactor_();
    const hasBaseScaleFactorChanged =
        this.lastScaledAtBaseFactor_ !== baseScaleFactor;

    if (!hasDistanceChanged && !hasViewportChanged &&
        !hasBaseScaleFactorChanged) {
      // Don't recalculate if base scale factor remains equal.
      return;
    }

    this.lastScaledAtBaseFactor_ = baseScaleFactor;

    const area = this.getAvailableArea_(baseScaleFactor);
    const areaRatio = area.width / area.height;

    const renderWidth =
        Math.min(MAX_RENDER_WIDTH,
            Math.max(area.width, Math.max(1, areaRatio) * MIN_RENDER_WIDTH));
    const renderHeight = renderWidth / areaRatio;

    const scaleValue = area.width / renderWidth;

    if (scaleValue >= 0.99 && scaleValue <= 1.01) {
      // Nothing to scale, default styles match.
      this.resetAppliedStyles_();
      return;
    }

    const translateX = this.getRenderTranslateX_();
    const translateY = this.getRenderTranslateY_();

    setImportantStyles(this.pageElement_, {
      'width': px(renderWidth),
      'height': px(renderHeight),

      'transform':
          [translate(translateX, translateY), scale(scaleValue)].join(' '),

      'transform-origin':
          this.isDesktop_() ?
              'center center' :
              'left top',
    });
  }

  /** @private */
  resetAppliedStyles_() {
    resetStyles(this.pageElement_, [
      'width',
      'height',
      'transform',
      'transform-origin',
    ]);
  }

  /**
   * @return {boolean}
   * @private
   */
  isDesktop_() {
    return this.pageElement_.parentNode.hasAttribute('desktop');
  }

  /**
   * @return {boolean}
   * @private
   */
  isPageActive_() {
    return this.pageElement_.hasAttribute('active');
  }

  /**
   * @param {number} baseScaleFactor
   * @return {!AreaDef}
   * @private
   */
  getAvailableArea_(baseScaleFactor) {
    dev().assert(this.viewportArea_,
        'Tried to scale page before defining viewport area.');

    if (this.isDesktop_()) {
      return this.getAvailableAreaForDesktop_(baseScaleFactor);
    }

    return /** @type {!AreaDef} */ (this.viewportArea_);
  }

  /**
   * @param {number} baseScaleFactor
   * @return {!AreaDef}
   * @private
   */
  getAvailableAreaForDesktop_(baseScaleFactor) {
    const {width, height} = this.viewportArea_;
    return {
      // Looks wrong, but area width should be respective to viewport height.
      width: baseScaleFactor * DESKTOP_AVAILABLE_WIDTH * height,
      height: baseScaleFactor * DESKTOP_AVAILABLE_HEIGHT * height,
    };
  }

  /**
   * @return {!number}
   * @private
   */
  getBaseScaleFactor_() {
    if (this.isDesktop_()) {
      return this.isPageActive_() ? 1 : DESKTOP_INACTIVE_SCALE;
    }
    return 1;
  }

  /**
   * @return {?number}
   * @private
   */
  getPageDistance_() {
    if (this.isPageActive_()) {
      return 0;
    }
    if (!this.pageElement_.hasAttribute('distance')) {
      return null;
    }
    return parseInt(this.pageElement_.getAttribute('distance'), 10);
  }

  /**
   * @return {number|string}
   * @private
   */
  getRenderTranslateY_() {
    if (this.isDesktop_()) {
      return 0;
    }
    const pageDistance = this.getPageDistance_();
    if (pageDistance === 0) {
      return 0;
    }
    return (100 * pageDistance) + 'vh';
  }

  /**
   * @return {number|string}
   * @private
   */
  getRenderTranslateX_() {
    if (!this.isDesktop_()) {
      return 0;
    }
    if (this.isPageActive_()) {
      return DESKTOP_ACTIVE_X;
    }
    if (this.getPageDistance_() == 1) {
      return this.pageElement_.hasAttribute('pre-active') ?
          DESKTOP_INACTIVE_LEFT_X :
          DESKTOP_INACTIVE_RIGHT_X;
    }
    return DESKTOP_UNSCHEDULED_X;
  }
}
