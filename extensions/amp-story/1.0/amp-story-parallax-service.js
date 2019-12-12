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
import {dev} from '../../../src/log';
import {escapeCssSelectorIdent} from '../../../src/css';
import {isExperimentOn} from '../../../src/experiments';
import {listen} from '../../../src/event-helper';
import {mapRange, sum} from '../../../src/utils/math';
import {registerServiceBuilder} from '../../../src/service';
import {resetStyles, setImportantStyles, setStyles} from '../../../src/style';
import {toArray} from '../../../src/types';

const SMOOTHING_PTS = 4;
const PERSPECTIVE = 1000;
const DEFAULT_LAYER_SPACING = 1;
const DEFAULT_BG_SCALE = 1.3;
const AMPLIFICATION_FACTOR = 40;
const DEFAULT_ORIGIN_LAYER = -1;

const LAYER_SPACING_ATTR = 'parallax-fx-layer-spacing';
const ORIGIN_LAYER_ATTR = 'parallax-fx-origin-layer';
const PARALLAX_FX_ATTR = 'parallax-fx';
const NO_PARALLAX_FX_ATTR = 'no-parallax-fx';

/**
 * Util function to retrieve the parallax service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param  {!Window} win
 * @param {!Element=} opt_story
 * @return {?AmpStoryParallaxService}
 */
export const getParallaxService = (win, opt_story) => {
  let service = Services.storyParallaxService(win);

  if (!service && opt_story) {
    service = new AmpStoryParallaxService(win, dev().assertElement(opt_story));
    registerServiceBuilder(win, 'story-parallax', () => service);
  }

  return service;
};

/**
 * Parallax service.
 */
export class AmpStoryParallaxService {
  /**
   * @param {!Window} win
   * @param {!Element} story
   */
  constructor(win, story) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win_);

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

    /** @const {string} */
    this.storyLayerSpacing = this.story_.getAttribute(LAYER_SPACING_ATTR);

    /** @const {string} */
    this.storyOriginLayer = this.story_.getAttribute(ORIGIN_LAYER_ATTR);

    /** @private {boolean} */
    this.enabled_ =
      isExperimentOn(this.win_, 'amp-story-parallax') &&
      story.hasAttribute(PARALLAX_FX_ATTR) &&
      !win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  /**
   * Creates the appropriate listeners (tilt on mobile or mouse on desktop)
   */
  initializeListeners() {
    if (
      this.enabled_ &&
      (this.platform_.isIos() || this.platform_.isAndroid()) &&
      this.win_.DeviceOrientationEvent
    ) {
      listen(this.win_, 'deviceorientation', event => {
        this.parallaxOrientationMutate_(event);
      });
    } else {
      listen(this.win_, 'mousemove', event => {
        this.parallaxMouseMutate_(event);
      });
    }
  }

  /**
   * Registers a new story page as having a parallax effect
   * @param {!Element} page the page element
   * @return {!Promise<?ParallaxPage>}
   */
  registerParallaxPage(page) {
    if (!this.enabled_) {
      return Promise.resolve();
    }
    return this.story_.getImpl().then(impl => {
      const parallaxPage = new ParallaxPage(this, impl.getVsync(), page);
      this.parallaxPages_.push(parallaxPage);
      return parallaxPage;
    });
  }

  /**
   * Calculate the smoothed change in position using the device orientation
   * change event then update each of the layers will its calculated position.
   * @param {Event} event
   * @private
   */
  parallaxOrientationMutate_(event) {
    const window = this.win_;
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

    this.parallaxPages_.forEach(page => {
      if (page.shouldUpdate()) {
        if (this.middleY_ != 0 && this.middleX_ != 0) {
          page.update(mappedX, mappedY);
        } else {
          page.update(this.middleX_, this.middleY_);
        }
      } else {
        page.resetStyles();
      }
    });
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

    const box = page.element.getLayoutBox();

    const percentageX = (event.pageX - box.left) / box.width;
    const percentageY = (event.pageY - box.top) / box.height;

    const mappedX = mapRange(percentageX * 100, 100, 0, -25, 25);
    const mappedY = mapRange(percentageY * 100, 100, 0, -25, 25);

    this.parallaxPages_.forEach(page => {
      if (page.shouldUpdate()) {
        page.update(mappedX, mappedY);
      } else {
        page.resetStyles();
      }
    });
  }
}

/**
 * Encapsulates and tracks a story page's parallax effect.
 */
export class ParallaxPage {
  /**
   * @param {!AmpStoryParallaxService} manager
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!Element} element The parent page of thi element
   */
  constructor(manager, vsync, element) {
    /** @private {!AmpStoryParallaxService} */
    this.manager_ = manager;

    /** @const {!Element} */
    this.element = element;

    /** @private {boolean} */
    this.initialized_ = false;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsync;

    /** @private @const {number} */
    this.layerSpacing_ = Number(
      this.element.getAttribute(LAYER_SPACING_ATTR) ||
        this.manager_.storyLayerSpacing ||
        DEFAULT_LAYER_SPACING
    );

    /** @private @const {number} */
    this.originLayer_ = Number(
      this.element.getAttribute(ORIGIN_LAYER_ATTR) ||
        this.manager_.storyOriginLayer ||
        DEFAULT_ORIGIN_LAYER
    );
  }

  /**
   * Apply the parallax effect to the element given the movements in the
   * x and y axes
   * @param {number} x The movement of the layer in the x axis
   * @param {number} y The movement of the layer in the y axis
   * @return {!Promise}
   */
  update(x = 0, y = 0) {
    return this.setInitialStyles().then(() => {
      return this.vsync_.mutate(() => {
        setStyles(this.element, {
          perspectiveOrigin: `${Math.round(
            x * AMPLIFICATION_FACTOR
          )}px ${Math.round(y * AMPLIFICATION_FACTOR)}px`,
        });
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
        resetStyles(this.element, ['perspectiveOrigin', 'perspective']);

        layers.forEach(layer => {
          resetStyles(layer, ['contain', 'overflow']);
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
    if (!this.shouldUpdate() || this.initialized_) {
      return Promise.resolve();
    }

    return this.vsync_.mutatePromise(() => {
      const layers = this.getLayers();

      setStyles(this.element, {
        perspective: PERSPECTIVE * layers.length + 'px',
      });

      setImportantStyles(this.element, {
        transition: 'opacity 350ms cubic-bezier(0.0,0.0,0.2,1)',
      });

      // Loop through the layers in the page and assign a z-index following
      // DOM order (manual override will be added in the future)
      layers.forEach((layer, order) => {
        const isFillLayer = layer.getAttribute('template') === 'fill';
        const translation = `translateZ(${(order - this.originLayer_) *
          this.layerSpacing_ *
          (PERSPECTIVE / AMPLIFICATION_FACTOR)}px)`;
        const scale = isFillLayer ? `scale(${DEFAULT_BG_SCALE})` : '';
        setImportantStyles(layer, {
          contain: 'none',
          overflow: 'visible',
          transform: `${translation} ${scale}`,
        });
      });

      this.initialized_ = true;
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
    return toArray(
      this.element.querySelectorAll(
        // TODO(wassgha): Determine exact behavior of excluded layers
        // (should they still be given depth but no animation?)
        `amp-story-grid-layer:not([${escapeCssSelectorIdent(
          NO_PARALLAX_FX_ATTR
        )}])`
      )
    ).map(layer => dev().assertElement(layer));
  }
}
