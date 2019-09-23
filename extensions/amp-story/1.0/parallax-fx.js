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
  setStyle,
  setStyles,
} from '../../../src/style';
import {dev} from '../../../src/log';
import {listen} from '../../../src/event-helper';
import {toArray} from '../../../src/types';

const SMOOTHING_PTS = 4;
const PERSPECTIVE = 1000;
const MAX_TILT = 15;
const DEFAULT_LAYER_SPACING = 1;
const DEFAULT_FARTHEST_SCALE = 1.3;
const DEFAULT_NEAREST_SCALE = 0.8;

const LAYER_SPACING_ATTR = 'parallax-fx-layer-spacing';
const NEAREST_SCALE_ATTR = 'parallax-fx-nearest-scale';
const FARTHEST_SCALE_ATTR = 'parallax-fx-farthest-scale';
const NO_PARALLAX_FX_ATTR = 'no-parallax-fx';
const ORIGIN_LAYER_ATTR = 'parallax-fx-origin-layer';

/**
 * Installs parallax handlers
 */
export class ParallaxManager {
  /**
   * @param {!Window} global
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!Element} story
   */
  constructor(global, vsync, story) {
    /** @public {!Window} */
    this.win = global;

    /** @public @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync = vsync;

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
    this.storyLayerSpacing_ = this.story_.getAttribute(LAYER_SPACING_ATTR);

    /** @private {string} */
    this.storyFarthestScale_ = this.story_.getAttribute(FARTHEST_SCALE_ATTR);

    /** @private {string} */
    this.storyNearestScale_ = this.story_.getAttribute(NEAREST_SCALE_ATTR);

    if (
      (this.platform_.isIos() || this.platform_.isAndroid()) &&
      this.win.DeviceOrientationEvent
    ) {
      listen(this.win, 'deviceorientation', event => {
        this.parallaxOrientationMutate_(event);
      });
    } else {
      listen(this.win, 'mousemove', event => {
        this.parallaxMouseMutate_(event);
      });
    }
  }

  /**
   * Gets the computed value for each parameter (either specified on the story element or a default one)
   * @param {string} attribute
   * @return {*} the story's attribute value or the default one
   */
  getDefaultAttr(attribute) {
    switch (attribute) {
      case LAYER_SPACING_ATTR:
        return this.storyLayerSpacing_ || DEFAULT_LAYER_SPACING;
      case FARTHEST_SCALE_ATTR:
        return this.storyFarthestScale_ || DEFAULT_FARTHEST_SCALE;
      case NEAREST_SCALE_ATTR:
        return this.storyNearestScale_ || DEFAULT_NEAREST_SCALE;
      default:
        return '';
    }
  }

  /**
   * Registers a new story page as having a parallax effect
   * @param {!Element} page the page element
   * @return {!ParallaxPage}
   */
  registerParallaxPage(page) {
    const parallaxPage = new ParallaxPage(this, page);
    this.parallaxPages_.push(parallaxPage);
    return parallaxPage;
  }

  /**
   * Resets and re-initializes all page styles
   * @return {!Promise}
   */
  refreshAllPageStyles() {
    return this.parallaxPages_.forEach(page => {
      if (page.shouldUpdate()) {
        page.update(this.middleX_, this.middleY_);
      } else {
        page.resetStyles();
      }
    });
  }

  /**
   * Calculate the smoothed change in position using the device orientation
   * change event then update each of the layers will its calculated position.
   * @param {Event} event
   * @private
   */
  parallaxOrientationMutate_(event) {
    const window = this.win;
    const {screen} = window;

    const page = this.parallaxPages_.filter(page => page.shouldUpdate())[0];
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

    this.refreshAllPageStyles();

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
   * @private
   */
  parallaxMouseMutate_(event) {
    const page = this.parallaxPages_.filter(page => page.shouldUpdate())[0];
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

    this.refreshAllPageStyles();

    page.update(mappedX, mappedY, tiltX, tiltY);
  }
}

/**
 * Encapsulates and tracks a story page's parallax effect.
 */
export class ParallaxPage {
  /**
   * @param {!ParallaxManager} manager
   * @param {!Element} element The parent page of thi element
   */
  constructor(manager, element) {
    /** @private {!ParallaxManager} */
    this.manager_ = manager;

    /** @const {!Element} */
    this.element = element;

    /** @private @const {boolean} */
    this.initialized_ = false;

    /** @private @const {string} */
    this.initialTransform_ = '';

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.manager_.vsync;

    /** @private {!Window} */
    this.win_ = this.manager_.win;

    /** @private @const {number} */
    this.layerSpacing_ = Number(
      this.element.getAttribute(LAYER_SPACING_ATTR) ||
        this.manager_.getDefaultAttr(LAYER_SPACING_ATTR)
    );

    /** @private @const {number} */
    this.farthestScale_ = Number(
      this.element.getAttribute(FARTHEST_SCALE_ATTR) ||
        this.manager_.getDefaultAttr(FARTHEST_SCALE_ATTR)
    );

    /** @private @const {number} */
    this.nearestScale_ = Number(
      this.element.getAttribute(NEAREST_SCALE_ATTR) ||
        this.manager_.getDefaultAttr(NEAREST_SCALE_ATTR)
    );
  }

  /**
   * Apply the parallax effect to the element given the movements in the
   * x and y axes
   * @param {number} x The movement of the layer in the x axis
   * @param {number} y The movement of the layer in the y axis
   * @param {number} tiltX Rotation on the X axis
   * @param {number} tiltY Rotation on the Y axis
   * @return {!Promise}
   */
  update(x = 0, y = 0, tiltX = 0, tiltY = 0) {
    return this.setInitialStyles().then(() => {
      return this.vsync_.mutate(() => {
        setStyles(this.element, {
          perspectiveOrigin: `${Math.round(x * 50)}px ${Math.round(y * 50)}px`,
        });
        setImportantStyles(this.element, {
          transform:
            `rotateX(${tiltY}deg) rotateY(${tiltX}deg) ` +
            this.initialTransform_,
          willChange: 'transform',
        });
      });
    });
  }

  /**
   * Re-queries and saves the element's original transform styling
   * @return {!Promise}
   */
  updateInheritedTransforms() {
    return this.vsync_
      .mutatePromise(() => {
        setStyle(this.element, 'transform', null);
      })
      .then(() => {
        return this.vsync_.mutatePromise(() => {
          this.initialTransform_ = computedStyle(
            this.win_,
            this.element
          ).getPropertyValue('transform');
        });
      })
      .then(() => {
        setImportantStyles(this.element, {
          transform: this.initialTransform_,
          willChange: 'transform',
        });
      });
  }

  /**
   * Resets any styles applied during the updates
   * @return {!Promise}
   */
  resetStyles() {
    const layers = this.getLayers();

    return this.vsync_
      .mutatePromise(() => {
        resetStyles(this.element, [
          'transform',
          'perspectiveOrigin',
          'perspective',
        ]);
        setImportantStyles(this.element, {
          willChange: 'transform',
        });

        layers.forEach(layer => {
          resetStyles(layer, ['contain', 'overflow', 'transform']);
        });
      })
      .then(() => {
        // Reset the transitions after all other styles are reset to avoid
        // animating the reset
        return this.vsync_.mutatePromise(() => {
          resetStyles(this.element, ['transition']);
        });
      })
      .then(() => {
        this.initialized_ = false;
      });
  }

  /**
   * Initializes the page's layers by giving them the appropriate translation and scaling
   * @return {!Promise}
   */
  setInitialStyles() {
    return this.updateInheritedTransforms().then(() => {
      if (!this.shouldUpdate() || this.initialized_) {
        return Promise.resolve();
      }

      return this.vsync_.mutate(() => {
        const layers = this.getLayers();

        setStyles(this.element, {
          perspective: PERSPECTIVE * layers.length + 'px',
          willChange: 'transform',
        });

        setImportantStyles(this.element, {
          transition: 'opacity 350ms cubic-bezier(0.0,0.0,0.2,1)',
          transform: this.initialTransform_,
        });

        const originLayerIndex = layers.findIndex(layer =>
          layer.hasAttribute(ORIGIN_LAYER_ATTR)
        );

        const layerZIndexOffset =
          originLayerIndex == -1
            ? Math.round(layers.length / 2)
            : originLayerIndex;

        // Loop through the layers in the page and assign a z-index following
        // DOM order (manual override will be added in the future)
        layers.forEach((layer, order) => {
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

        this.initialized_ = true;
      });
    });
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
    return toArray(this.element.querySelectorAll(`amp-story-grid-layer`))
      .map(layer => dev().assertElement(layer))
      .filter(layer => !layer.hasAttribute(NO_PARALLAX_FX_ATTR));
  }
}

/**
 * Installs the required observers and listeners for the parallax effect
 * if present on the story.
 * @param {!Window} win
 * @param {!../../../src/service/vsync-impl.Vsync} vsync
 * @param {!Element} story
 * @return {ParallaxManager}
 */
export function installParallaxFx(win, vsync, story) {
  return new ParallaxManager(win, vsync, story);
}
