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
import {dev, user} from '../../../src/log';
import {setImportantStyles} from '../../../src/style';

/** @const {string} */
const TAG = 'AMP_STORY_PANNING_MEDIA';

/** @const {string}  */
const DURATION_MS = 1000;

export class AmpStoryPanningMedia extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.element_ = element;

    /** @private {?Element} The element that is transitioned. */
    this.ampImgEl_ = null;

    /** @private {?float} Percentage between [-50; 50] */
    this.x_ = null;

    /** @private {?float} Percentage between [-50; 50] */
    this.y_ = null;

    /** @private {?float} 0 is not visible. 1 fills the viewport vertically. */
    this.zoom_ = null;

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?string} */
    this.pageId_ = null;

    /** @private {boolean} */
    this.isOnActivePage_ = false;

    /** @private {?number} Distance from active page. */
    this.distance_ = null;
  }

  /** @override */
  buildCallback() {
    this.x_ = parseFloat(this.element_.getAttribute('x')) || 0;
    this.y_ = parseFloat(this.element_.getAttribute('y')) || 0;
    this.zoom_ = parseFloat(this.element_.getAttribute('zoom')) || 1;

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
  onPageNavigation_() {
    if (this.isOnActivePage_) {
      // TODO(#31932): A key could be sent here to update elements of the same group.
      // Note, this will not work when there are 2 or more panning components on the same page.
      // It might need to dynamic to hold more than 1 set of positions.
      this.animate_();
    }
  }

  /**
   * Animates from current position to active components position.
   * @private
   */
  animate_() {
    const startPos = this.storeService_.get(
      StateProperty.PANNING_MEDIA_STATE
    ) || {x: this.x_, y: this.y_, zoom: this.zoom_};

    const easeInOutQuad = (val) =>
      val < 0.5 ? 2 * val * val : 1 - Math.pow(-2 * val + 2, 2) / 2;

    let startTime;
    const nextFrame = (currTime) => {
      if (!startTime) {
        startTime = currTime;
      }
      const elapsedTime = currTime - startTime;
      if (elapsedTime < DURATION_MS) {
        const easing = easeInOutQuad(elapsedTime / DURATION_MS);
        this.storeService_.dispatch(Action.SET_PANNING_MEDIA_STATE, {
          x: startPos.x + (this.x_ - startPos.x) * easing,
          y: startPos.y + (this.y_ - startPos.y) * easing,
          zoom: startPos.zoom + (this.zoom_ - startPos.zoom) * easing,
        });
        // Only call loop again if on active page.
        if (this.isOnActivePage_) {
          requestAnimationFrame(nextFrame);
        }
      } else {
        this.storeService_.dispatch(Action.SET_PANNING_MEDIA_STATE, {
          x: this.x_,
          y: this.y_,
          zoom: this.zoom_,
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
    if (panningMediaState && this.distance_ <= 1) {
      // TODO(#31932): Update siblings that are part of the same group.
      this.updateTransform_(panningMediaState);
    }
  }

  /**
   * @private
   * @param {!Object<string, string>} panningMediaState
   * @return {!Promise}
   */
  updateTransform_(panningMediaState) {
    const {x, y, zoom} = panningMediaState;
    return this.mutateElement(() => {
      setImportantStyles(this.ampImgEl_, {
        transform: `scale(${zoom}) translate(${x}%, ${y}%)`,
      });
    });
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

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FILL;
  }
}

AMP.extension('amp-story-panning-media', '0.1', (AMP) => {
  AMP.registerElement('amp-story-panning-media', AmpStoryPanningMedia, CSS);
});
