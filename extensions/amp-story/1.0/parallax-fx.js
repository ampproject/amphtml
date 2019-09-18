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

import {Services} from '../../../src/services';
import {clamp, mapRange, sum} from '../../../src/utils/math';
import {
  computedStyle,
  resetStyles,
  setImportantStyles,
  setStyles,
} from '../../../src/style';
import {dev} from '../../../src/log';
import {listen} from '../../../src/event-helper';
import {toArray} from '../../../src/types';

/** @enum {string} */
export const ParallaxModes = {
  /**
   * Indicates that the last (nearest) layer will appear at the
   * surface of the screen and all previous layers are behind it
   * "inside" the screen.
   */
  DEPTH: 'depth',

  /**
   * Indicates that the first (farthest) layer will appear at the surface
   * of the screen and all subsequent layers will appear as "popping out"
   * of the screen.
   */
  POP_OUT: 'pop-out',

  /**
   * Indicates that the middle layer will appear at the surface of the
   * screen with the previous (farther) layers appearing behind the screen
   * and the subsequent (nearer) layers popping out of the screen.
   */
  CENTER: 'center',
};

const SMOOTHING_PTS = 4;
const PERSPECTIVE = 1000;
const MAX_TILT = 15;
const DEFAULT_MODE = ParallaxModes.DEPTH;
const DEFAULT_LAYER_SPACING = 1;
const DEFAULT_FARTHEST_SCALE = 1.3;
const DEFAULT_NEAREST_SCALE = 0.8;

const MODE_ATTR = 'parallax-fx-mode';
const LAYER_SPACING_ATTR = 'parallax-fx-layer-spacing';
const NEAREST_SCALE_ATTR = 'parallax-fx-nearest-scale';
const FARTHEST_SCALE_ATTR = 'parallax-fx-farthest-scale';
const NO_PARALLAX_FX_ATTR = 'no-parallax-fx';

/**
 * Installs parallax handlers
 */
export class ParallaxService {
  /**
   * @param {!Window} global
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!Element} story
   */
  constructor(global, vsync, story) {
    /** @private {!Window} */
    this.win_ = global;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(global);

    /** @private {!Element} */
    this.story_ = story;

    /** @private {!Array<!ParallaxPage>} */
    this.parallaxPages_ = [];

    /** @private {number} */
    this.middleX_ = 0;

    /** @private {number} */
    this.middleY_ = 0;

    /** @private {Array} */
    this.smoothingPointsX_ = [];

    /** @private {Array} */
    this.smoothingPointsY_ = [];

    /** @private {string} */
    this.storyMode_ = this.story_.getAttribute(MODE_ATTR);

    /** @private {string} */
    this.storyLayerSpacing_ = this.story_.getAttribute(LAYER_SPACING_ATTR);

    /** @private {string} */
    this.storyFarthestScale_ = this.story_.getAttribute(FARTHEST_SCALE_ATTR);

    /** @private {string} */
    this.storyNearestScale_ = this.story_.getAttribute(NEAREST_SCALE_ATTR);

    this.init_();
  }

  /**
   * Initializes the pages by giving them perspective and initializating their layers
   */
  init_() {
    this.vsync_.mutate(() => {
      this.getPages_()
        .filter(page => !page.hasAttribute(NO_PARALLAX_FX_ATTR))
        .forEach(page => {
          const mode =
            page.getAttribute(MODE_ATTR) || this.storyMode_ || DEFAULT_MODE;
          const layerSpacing = Number(
            page.getAttribute(LAYER_SPACING_ATTR) ||
              this.storyLayerSpacing_ ||
              DEFAULT_LAYER_SPACING
          );
          const farthestScale = Number(
            page.getAttribute(FARTHEST_SCALE_ATTR) ||
              this.storyFarthestScale_ ||
              DEFAULT_FARTHEST_SCALE
          );
          const nearestScale = Number(
            page.getAttribute(NEAREST_SCALE_ATTR) ||
              this.storyNearestScale_ ||
              DEFAULT_NEAREST_SCALE
          );

          const parallaxPage = new ParallaxPage(
            this.win_,
            page,
            this.vsync_,
            mode,
            layerSpacing,
            farthestScale,
            nearestScale
          );
          this.parallaxPages_.push(parallaxPage);
        });
    });

    if (
      (this.platform_.isIos() || this.platform_.isAndroid()) &&
      this.win_.DeviceOrientationEvent
    ) {
      listen(this.win_, 'deviceorientation', event => {
        this.parallaxOrientationMutate_(event, this.parallaxPages_);
      });
    } else {
      listen(this.win_, 'mousemove', event => {
        this.parallaxMouseMutate_(event, this.parallaxPages_);
      });
    }
  }

  /**
   * Discovers and returns all pages inside the story
   * @return {!Array<!Element>}
   * @private
   */
  getPages_() {
    return toArray(this.story_.querySelectorAll('amp-story-page')).map(page =>
      dev().assertElement(page)
    );
  }

  /**
   * Calculate the smoothed change in position using the device orientation
   * change event then update each of the layers will its calculated position.
   * @param {Event} event
   * @param {!Array<!ParallaxPage>} pages
   * @private
   */
  parallaxOrientationMutate_(event, pages) {
    const window = this.win_;
    const {screen} = window;

    const page = pages.filter(page => page.shouldUpdate())[0];
    if (!page) {
      return;
    }

    let {gamma, beta} = event;

    // Detect the implementation of orientation angle
    const angle =
      'orientation' in screen ? screen.orientation.angle : screen.orientation;

    // Reverse gamma/beta if the device is in landscape
    if (window.orientation == 90 || window.orientation == -90) {
      const tmp = gamma;
      gamma = beta;
      beta = tmp;
    }

    // Flip signs of the angles if the phone is in 'reverse landscape' or
    // 'reverse portrait'
    if (angle < 0) {
      gamma = -gamma;
      beta = -beta;
    }

    // Smooth the gamma value (X-AXIS)
    if (this.smoothingPointsX_.length > SMOOTHING_PTS) {
      this.smoothingPointsX_.shift();
    }
    this.smoothingPointsX_.push(gamma);
    const avgX = sum(this.smoothingPointsX_) / SMOOTHING_PTS;
    if (this.smoothingPointsX_.length > SMOOTHING_PTS && this.middleX_ == 0) {
      this.middleX_ = avgX;
    }

    // Smooth the beta value (Y-AXIS)
    if (this.smoothingPointsY_.length > SMOOTHING_PTS) {
      this.smoothingPointsY_.shift();
    }
    this.smoothingPointsY_.push(beta);
    const avgY = sum(this.smoothingPointsY_) / SMOOTHING_PTS;
    if (this.smoothingPointsY_.length > SMOOTHING_PTS && this.middleY_ == 0) {
      this.middleY_ = avgY;
    }

    let mappedX = avgX - this.middleX_;
    let mappedY = avgY - this.middleY_;

    // Limit the range for a smoother/less shaky effect
    mappedX = mapRange(mappedX, -75, 75, -25, 25);
    mappedY = mapRange(mappedY, -75, 75, -25, 25);

    pages
      .filter(page => !page.shouldUpdate())
      .forEach(page => {
        page.resetStyles();
      });

    if (this.middleY_ != 0 && this.middleX_ != 0) {
      page.update(mappedX, mappedY);
    } else {
      page.update(this.middleX_, this.middleY_);
    }
  }

  /**
   * Calculate the smoothed change in position using the mouse's position
   * then update each of the layers will its calculated position.
   * @param {Event} event
   * @param {!Array<!ParallaxPage>} pages
   * @private
   */
  parallaxMouseMutate_(event, pages) {
    const page = pages.filter(page => page.shouldUpdate())[0];
    if (!page) {
      return;
    }

    const percentageX =
      (event.pageX - (page.element.offsetLeft - page.element.offsetWidth / 2)) /
      page.element.offsetWidth;
    const percentageY =
      (event.pageY - page.element.offsetTop) / page.element.offsetHeight;

    const mappedX = mapRange(percentageX * 100, 0, 100, -25, 25);
    const mappedY = mapRange(percentageY * 100, 0, 100, -25, 25);

    const tiltX = clamp(
      MAX_TILT / 2 - percentageX * MAX_TILT,
      -MAX_TILT,
      MAX_TILT
    ).toFixed(2);
    const tiltY = clamp(
      percentageY * MAX_TILT - MAX_TILT / 2,
      -MAX_TILT,
      MAX_TILT
    ).toFixed(2);

    pages
      .filter(page => !page.shouldUpdate())
      .forEach(page => {
        page.resetStyles();
      });

    page.update(mappedX, mappedY, tiltX, tiltY);
  }
}

/**
 * Encapsulates and tracks a story page's parallax effect.
 */
export class ParallaxPage {
  /**
   * @param {!Window} global
   * @param {!Element} element The parent page of thi element
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {string} mode
   * @param {number} layerSpacing
   * @param {number} farthestScale
   * @param {number} nearestScale
   */
  constructor(
    global,
    element,
    vsync,
    mode,
    layerSpacing,
    farthestScale,
    nearestScale
  ) {
    /** @private {!Window} */
    this.win_ = global;

    /** @const {!Element} */
    this.element = element;

    /** @private @const {boolean} */
    this.initialized_ = false;

    /** @private @const {string} */
    this.initialTransform_ = '';

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private @const {string} */
    this.mode_ = mode;

    /** @private @const {string} */
    this.layerSpacing_ = layerSpacing;

    /** @private @const {string} */
    this.farthestScale_ = farthestScale;

    /** @private @const {string} */
    this.nearestScale_ = nearestScale;
  }

  /**
   * Apply the parallax effect to the element given the movements in the
   * x and y axes
   * @param {number} x The movement of the layer in the x axis
   * @param {number} y The movement of the layer in the y axis
   * @param {number} tiltX Rotation on the X axis
   * @param {number} tiltY Rotation on the Y axis
   */
  update(x = 0, y = 0, tiltX = 0, tiltY = 0) {
    if (!this.initialized_) {
      this.initialTransform_ = computedStyle(
        this.win_,
        this.element
      ).getPropertyValue('transform');
      this.setInitialStyles_();
    }

    this.vsync_.mutate(() => {
      setStyles(this.element, {
        perspectiveOrigin: `${Math.round(x * 50)}px ${Math.round(y * 50)}px`,
        willChange: 'transform',
      });

      setImportantStyles(this.element, {
        transform:
          this.initialTransform_ + ` rotateX(${tiltY}deg) rotateY(${tiltX}deg)`,
        transition: 'opacity 350ms cubic-bezier(0.0,0.0,0.2,1)',
      });
    });
  }

  /**
   * Resets any styles applied during the updates
   */
  resetStyles() {
    const layers = this.getLayers();

    this.vsync_.mutate(() => {
      resetStyles(this.element, [
        'transform',
        'perspectiveOrigin',
        'willChange',
        'perspective',
      ]);

      layers.forEach(layer => {
        resetStyles(layer, ['contain', 'overflow', 'transform']);
      });
    });

    // Reset the transitions after all other styles are reset to avoid
    // animating the reset
    this.vsync_.mutate(() => {
      resetStyles(this.element, ['transition']);
    });

    this.initialized_ = false;
  }

  /**
   * Initializes the page's layers by giving them the appropriate translation and scaling
   */
  setInitialStyles_() {
    const layers = this.getLayers();

    setStyles(this.element, {
      perspective: PERSPECTIVE * layers.length + 'px',
    });

    const layerZIndexOffset =
      this.mode_ == ParallaxModes.DEPTH
        ? layers.length - 1
        : this.mode_ == ParallaxModes.CENTER
        ? layers.length / 2
        : 0;

    // Loop through the layers in the page and assign a z-index following
    // DOM order (manual override will be added in the future)
    layers.forEach((layer, order) => {
      this.vsync_.mutate(() => {
        const translation = `translateZ(${(order - layerZIndexOffset) *
          this.layerSpacing_ *
          (PERSPECTIVE / 35)}px)`;
        const scale = `scale(${mapRange(
          order,
          0,
          layers.length - 1,
          this.farthestScale_,
          this.nearestScale_
        )})`;
        setImportantStyles(layer, {
          contain: 'none',
          overflow: 'visible',
          transform: `${translation} ${scale}`,
        });
      });
    });

    this.initialized_ = true;
  }

  /**
   * True if the element is in the viewport.
   * @return {boolean}
   */
  shouldUpdate() {
    return this.element.hasAttribute('active');
  }

  /**
   * Discovers and returns all layers inside a page
   * @return {!Array<!Element>}
   */
  getLayers() {
    return toArray(this.element.querySelectorAll(`amp-story-grid-layer`)).map(
      layer => dev().assertElement(layer)
    );
  }
}

/**
 * Installs the required observers and listeners for the parallax effect
 * if present on the story.
 * @param {!Window} win
 * @param {!../../../src/service/vsync-impl.Vsync} vsync
 * @param {!Element} story
 * @return {ParallaxService}
 */
export function installParallaxFx(win, vsync, story) {
  return new ParallaxService(win, vsync, story);
}
