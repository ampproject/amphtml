/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {listen} from '../../../src/event-helper';
import {mapRange, sum} from '../../../src/utils/math';
import {setImportantStyles, setStyles} from '../../../src/style';
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
const PERSPECTIVE = 1500;
const DEFAULT_MODE = ParallaxModes.DEPTH;
const DEFAULT_LAYER_SPACING = 1;
const DEFAULT_FARTHEST_SCALE = 1.2;
const DEFAULT_NEAREST_SCALE = 1;

const MODE_ATTR = 'parallax-fx-mode';
const LAYER_SPACING_ATTR = 'parallax-fx-layer-spacing';
const NEAREST_SCALE_ATTR = 'parallax-fx-nearest-scale';
const FARTHEST_SCALE_ATTR = 'parallax-fx-farthest-scale';

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

    listen(global, 'deviceorientation', event => {
      this.parallaxOrientationMutate_(event, this.parallaxPages_);
    });
  }

  /**
   * Initializes the pages by giving them perspective and initializating their layers
   */
  init_() {
    this.vsync_.mutate(() => {
      this.getPages()
        .filter(page => !page.hasAttribute('no-parallax-fx'))
        .forEach(page => {
          const layers = this.getLayers(page);

          // Set the page's perspective
          setStyles(page, {
            perspective: PERSPECTIVE * layers.length + `px`,
          });

          this.parallaxPages_.push(new ParallaxPage(page, this.vsync_));

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

          this.initLayers_(
            layers,
            mode,
            layerSpacing,
            farthestScale,
            nearestScale
          );
        });
    });
  }

  /**
   * Initializes the page's layers by giving them the appropriate translation and scaling
   * @param {!Array<!Element>} layers
   * @param {string} mode
   * @param {number} layerSpacing
   * @param {number} farthestScale
   * @param {number} nearestScale
   */
  initLayers_(layers, mode, layerSpacing, farthestScale, nearestScale) {
    // Loop through the layers in the page and assign a z-index following
    // DOM order (manual override will be added in the future)
    let order = 1;

    const layerZIndexOffset =
      mode == ParallaxModes.DEPTH
        ? layers.length
        : mode == ParallaxModes.CENTER
        ? layers.length / 2
        : 0;

    layers.map(layer => {
      this.vsync_.mutate(() => {
        const translation = `translateZ(${(order - layerZIndexOffset) *
          layerSpacing *
          30}px)`;
        const scale = `scale(${mapRange(
          order,
          1,
          layers.length,
          farthestScale,
          nearestScale
        )})`;
        setImportantStyles(layer, {
          contain: 'none',
          overflow: 'visible',
          transform: `${translation} ${scale}`,
        });
        order++;
      });
    });
  }

  /**
   * Discovers and returns all pages inside the story
   * @return {!Array<!Element>}
   */
  getPages() {
    return toArray(this.story_.querySelectorAll('amp-story-page')).map(page =>
      dev().assertElement(page)
    );
  }

  /**
   * Discovers and returns all layers inside a page
   * @param {!Element} page
   * @return {!Array<!Element>}
   */
  getLayers(page) {
    return toArray(page.querySelectorAll(`amp-story-grid-layer`)).map(layer =>
      dev().assertElement(layer)
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
    let {gamma, beta} = event;

    let angle;

    // Detect the implementation of orientation angle
    if ('orientation' in screen) {
      angle = screen.orientation.angle;
    } else {
      angle = window.orientation;
    }

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

    pages.forEach(page => {
      if (page.shouldUpdate()) {
        if (this.middleY_ != 0 && this.middleX_ != 0) {
          page.update(mappedX, mappedY);
        } else {
          page.update(this.middleX_, this.middleY_);
        }
      }
    });
  }
}

/**
 * Encapsulates and tracks a story page's parallax effect.
 */
export class ParallaxPage {
  /**
   * @param {!Element} page The parent page of thi element
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   */
  constructor(page, vsync) {
    /** @private @const {!Element} */
    this.page_ = page;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsync;
  }

  /**
   * Apply the parallax effect to the element given the movements in the
   * x and y axes
   * @param {number} x The movement of the layer in the x axis
   * @param {number} y The movement of the layer in the y axis
   */
  update(x = 0, y = 0) {
    this.vsync_.mutate(() => {
      setStyles(this.page_, {
        perspectiveOrigin: `${Math.round(x * 50)}px ${Math.round(y * 50)}px`,
      });
    });
  }

  /**
   * True if the element is in the viewport.
   * @return {boolean}
   */
  shouldUpdate() {
    return this.page_.hasAttribute('active');
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
