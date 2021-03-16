/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
  Action,
  StateProperty,
} from '../../../extensions/amp-story/1.0/amp-story-store-service';
import {CSS} from '../../../build/amp-story-panning-media-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {closest, whenUpgradedToCustomElement} from '../../../src/dom';
import {deepEquals} from '../../../src/json';
import {dev, user} from '../../../src/log';
import {setImportantStyles} from '../../../src/style';

/** @const {string} */
const TAG = 'AMP_STORY_PANNING_MEDIA';

/** @const {string}  */
const DURATION_MS = 1000;

/** @const {number}  */
const DISTANCE_TO_CENTER_EDGE = 50;

/**
 * A small number used to calculate zooming out to 0.
 * @const {number}
 */
const MIN_INTEGER = -100000;

/**
 * Position values used to animate between components.
 * x: (optional) Percentage between [-50; 50]
 * y: (optional) Percentage between [-50; 50]
 * zoom: 0 is not visible. 1 fills the viewport vertically.
 * @typedef {{
 *   x: float,
 *   y: float,
 *   zoom: float,
 * }}
 */
export let panningMediaPositionDef;

/**
 * Max distances to keep image in viewport.
 * left: Percentage between [-50; 50]
 * right: Percentage between [-50; 50]
 * top: Percentage between [-50; 50]
 * bottom: Percentage between [-50; 50]
 * @typedef {{
 *   left: float,
 *   right: float,
 *   top: float,
 *   bottom: float,
 * }}
 */
export let panningMediaMaxBoundsDef;

export class AmpStoryPanningMedia extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.element_ = element;

    /** @private {?Element} The element that is transitioned. */
    this.ampImgEl_ = null;

    /** @private {?panningMediaPositionDef} Position to animate to. */
    this.animateTo_ = {};

    /** @private {?panningMediaMaxBoundsDef} Max distances to keep image in viewport. */
    this.maxBounds_ = {};

    /** @private {?{width: number, height: number}} */
    this.pageSize_ = null;

    /** @private {?panningMediaPositionDef} Current animation state. */
    this.animationState_ = {};

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?string} */
    this.pageId_ = null;

    /** @private {boolean} */
    this.isOnActivePage_ = false;

    /** @private {?number} Distance from active page. */
    this.distance_ = null;

    /** @private {?string} */
    this.groupId_ = null;
  }

  /** @override */
  buildCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        this.storeService_ = storeService;
      }
    );
  }

  /** @override */
  layoutCallback() {
    this.ampImgEl_ = dev().assertElement(
      this.element_.querySelector('amp-img')
    );

    this.groupId_ =
      this.element_.getAttribute('group-id') ||
      this.ampImgEl_.getAttribute('src');

    this.initializeListeners_();

    return whenUpgradedToCustomElement(this.ampImgEl_)
      .then(() => this.ampImgEl_.signals().whenSignal(CommonSignals.LOAD_END))
      .then(() => {
        const imgEl = dev().assertElement(this.element_.querySelector('img'));
        // Remove layout="fill" classes so image is not clipped.
        imgEl.classList = '';
        // Centers the amp-img horizontally. The image does not load if this is done in CSS.
        // TODO(#31515): Handle base zoom of aspect ratio wider than image
        setImportantStyles(this.ampImgEl_, {
          left: 'auto',
          right: 'auto',
        });
      })
      .catch(() => user().error(TAG, 'Failed to load the amp-img.'));
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.PAGE_SIZE,
      (pageSize) => {
        this.pageSize_ = pageSize;
        this.setAnimateTo_();
        this.animate_();
      },
      true /** callToInitialize */
    );
    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (currPageId) => {
        this.isOnActivePage_ = currPageId === this.getPageId_();
        this.onPageNavigation_();
      },
      true /** callToInitialize */
    );
    this.storeService_.subscribe(
      StateProperty.PANNING_MEDIA_STATE,
      (panningMediaState) => this.onPanningMediaStateChange_(panningMediaState),
      true /** callToInitialize */
    );
    // Mutation observer for distance attribute
    const config = {attributes: true, attributeFilter: ['distance']};
    const callback = (mutationsList) => {
      this.distance_ = parseInt(
        mutationsList[0].target.getAttribute('distance'),
        10
      );
    };
    const observer = new MutationObserver(callback);
    this.getPage_() && observer.observe(this.getPage_(), config);
  }

  /** @private */
  setAnimateTo_() {
    const x = parseFloat(this.element_.getAttribute('x') || 0);
    const y = parseFloat(this.element_.getAttribute('y') || 0);
    const zoom = parseFloat(this.element_.getAttribute('zoom') || 1);
    const lockBounds = this.element_.hasAttribute('lock-bounds');

    if (!lockBounds) {
      this.animateTo_ = {x, y, zoom};
    } else {
      // Zoom must be set to calculate maxBounds.
      this.animateTo_.zoom = zoom < 1 ? 1 : zoom;

      this.setMaxBounds_();

      this.animateTo_.x =
        x > 0
          ? Math.min(this.maxBounds_.left, x)
          : Math.max(this.maxBounds_.right, x);

      this.animateTo_.y =
        y > 0
          ? Math.min(this.maxBounds_.top, y)
          : Math.max(-this.maxBounds_.bottom, y);
    }
  }

  /**
   * Calculates max distances to keep image in viewport.
   * This is only set if lock-bounds, left, right, top or bottom are specified.
   * @private
   */
  setMaxBounds_() {
    // Calculations to clamp image to edge of container.
    const {width: containerWidth, height: containerHeight} = this.pageSize_;

    const ampImgWidth = this.ampImgEl_.getAttribute('width');
    const ampImgHeight = this.ampImgEl_.getAttribute('height');
    // TODO(#31515): When aspect ratio is portrait, containerWidth will be used for this.
    const percentScaled = containerHeight / ampImgHeight;
    const scaledImageWidth = percentScaled * ampImgWidth;
    const scaledImageHeight = percentScaled * ampImgHeight;

    const widthFraction =
      1 - containerWidth / (scaledImageWidth * this.animateTo_.zoom);
    const heightFraction =
      1 - containerHeight / (scaledImageHeight * this.animateTo_.zoom);

    this.maxBounds_ = {
      left: DISTANCE_TO_CENTER_EDGE * widthFraction,
      right: -DISTANCE_TO_CENTER_EDGE * widthFraction,
      top: DISTANCE_TO_CENTER_EDGE * heightFraction,
      bottom: -DISTANCE_TO_CENTER_EDGE * heightFraction,
    };
  }

  /** @private */
  onPageNavigation_() {
    this.animate_();
  }

  /**
   * Animates from current position to active components position.
   * @private
   */
  animate_() {
    if (!this.isOnActivePage_) {
      return;
    }
    const startPos = this.storeService_.get(StateProperty.PANNING_MEDIA_STATE)[
      this.groupId_
    ];

    // Don't animate if first instance of group or prefers-reduced-motion.
    if (!startPos || this.prefersReducedMotion_()) {
      this.storeService_.dispatch(Action.ADD_PANNING_MEDIA_STATE, {
        [this.groupId_]: this.animateTo_,
      });
      return;
    }

    const easeInOutQuad = (val) =>
      val < 0.5 ? 2 * val * val : 1 - Math.pow(-2 * val + 2, 2) / 2;

    let startTime;
    const nextFrame = (currTime) => {
      if (!startTime) {
        startTime = currTime;
      }
      const elapsedTime = currTime - startTime;
      if (elapsedTime < DURATION_MS) {
        const {x, y, zoom} = this.animateTo_;
        const easing = easeInOutQuad(elapsedTime / DURATION_MS);
        this.storeService_.dispatch(Action.ADD_PANNING_MEDIA_STATE, {
          [this.groupId_]: {
            x: startPos.x + (x - startPos.x) * easing,
            y: startPos.y + (y - startPos.y) * easing,
            zoom: startPos.zoom + (zoom - startPos.zoom) * easing,
          },
        });
        // Only call loop again if on active page.
        if (this.isOnActivePage_) {
          requestAnimationFrame(nextFrame);
        }
      } else {
        this.storeService_.dispatch(Action.ADD_PANNING_MEDIA_STATE, {
          [this.groupId_]: this.animateTo_,
        });
      }
    };
    requestAnimationFrame(nextFrame);
  }

  /**
   * @private
   * @param {!Object<string, string>} panningMediaState
   */
  onPanningMediaStateChange_(panningMediaState) {
    if (
      this.distance_ <= 1 &&
      panningMediaState[this.groupId_] &&
      // Prevent update if value is same as previous value.
      // This happens when 2 or more components are on the same page.
      !deepEquals(this.animationState_, panningMediaState[this.groupId_])
    ) {
      this.animationState_ = panningMediaState[this.groupId_];
      this.updateTransform_();
    }
  }

  /**
   * @private
   * @return {!Promise}
   */
  updateTransform_() {
    const {x, y, zoom} = this.animationState_;
    return this.mutateElement(() => {
      setImportantStyles(this.ampImgEl_, {
        transform: `translate3d(${x}%, ${y}%, ${this.calculateZoom_(zoom)}px)`,
      });
    });
  }

  /**
   * Calculates zoom for translate3d and ensures the number is finite.
   * @private
   * @param {number} zoom
   * @return {number}
   */
  calculateZoom_(zoom) {
    const calculatedZoom = (zoom - 1) / zoom;
    return isFinite(calculatedZoom) ? calculatedZoom : MIN_INTEGER;
  }

  /**
   * @private
   * @return {string} the page id
   */
  getPageId_() {
    if (this.pageId_ == null) {
      this.pageId_ = this.getPage_().getAttribute('id');
    }
    return this.pageId_;
  }

  /**
   * @private
   * @return {?Element} the parent amp-story-page
   */
  getPage_() {
    return closest(
      dev().assertElement(this.element),
      (el) => el.tagName.toLowerCase() === 'amp-story-page'
    );
  }

  /**
   * Whether the device opted in prefers-reduced-motion.
   * @return {boolean}
   * @private
   */
  prefersReducedMotion_() {
    return this.win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FILL;
  }
}

AMP.extension('amp-story-panning-media', '0.1', (AMP) => {
  AMP.registerElement('amp-story-panning-media', AmpStoryPanningMedia, CSS);
});
