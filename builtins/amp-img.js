/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {BaseElement} from '../src/base-element';
import {createLoaderElement} from '../src/loader';
import {getLengthNumeral, isLayoutSizeDefined} from '../src/layout';
import {loadPromise} from '../src/event-helper';
import {parseSrcset} from '../src/srcset';
import {registerElement} from '../src/custom-element';
import {timer} from '../src/timer';


/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installImg(win) {

  /** @type {number} Count of images */
  var count = 0;

  class AmpImg extends BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
      /** @private @const {!Element} */
      this.img_ = new Image();

      /** @private {?Element} */
      this.placeholder_ = this.getPlaceholder();

      /** @private {boolean} */
      this.isDefaultPlaceholder_ = !this.placeholder_;

      /** @private {boolean} */
      this.imgLoadedOnce_ = false;

      if (this.element.id) {
        this.img_.setAttribute('amp-img-id', this.element.id);
      }
      this.propagateAttributes(['alt'], this.img_);
      this.applyFillContent(this.img_);

      this.img_.width = getLengthNumeral(this.element.getAttribute('width'));
      this.img_.height = getLengthNumeral(this.element.getAttribute('height'));

      this.element.appendChild(this.img_);

      /** @private @const {!Srcset} */
      this.srcset_ = parseSrcset(this.element.getAttribute('srcset') ||
          this.element.getAttribute('src'));

      this.setDefaultPlaceholder_();
      // TODO(@dvoytenko) Remove when #254 is fixed.
      // Always immediately request the first two images to make sure
      // we start the HTTP requests for them as early as possible.
      if (count++ < 2 && this.element.offsetWidth > 10) {
        this.updateImageSrc_();
      }
    }

    /** @override */
    prerenderAllowed() {
      return true;
    }

    /** @override */
    isRelayoutNeeded() {
      return true;
    }

    /** @override */
    layoutCallback() {
      return this.updateImageSrc_();
    }

    /**
     * @param {boolean} inViewport
     * @override
     */
    viewportCallback(inViewport) {
      this.setDefaultPlaceholder_();
    }

    /**
     * @return {!Promise}
     * @private
     */
    updateImageSrc_() {
      let src = this.srcset_.select(this.element.offsetWidth,
          this.getDpr()).url;
      if (src == this.img_.getAttribute('src')) {
        return Promise.resolve();
      }
      this.img_.setAttribute('src', src);

      let onImgLoaded = this.onImgLoaded_.bind(this);
      return loadPromise(this.img_).then(onImgLoaded, onImgLoaded);
    }

    /**
     * @private
     */
    setDefaultPlaceholder_() {
      if (this.isDefaultPlaceholder_ && !this.placeholder_ &&
          !this.imgLoadedOnce_ && this.isInViewport()) {
        this.placeholder_ = createLoaderElement();
        this.placeholder_.setAttribute('placeholder', '');
        this.element.appendChild(this.placeholder_);

        // Set a minimum delay in case the image resource loads much faster
        // than an intermitent loading screen that dissapears right away.
        // This can occur on fast internet connections or on a local server.
        return timer.delay(() => {
          this.placeholder_.classList
              .toggle('-amp-hidden', this.imgLoadedOnce_);
          this.placeholder_.classList
              .toggle('-amp-active', !this.imgLoadedOnce_);
        }, 100);
      }
    }

    /**
     * @private
     */
    cleanupPlaceholder_() {
      let inViewport = this.isInViewport();
      if (this.placeholder_ && (!inViewport || this.imgLoadedOnce_)) {
        if (this.isDefaultPlaceholder_) {
          this.placeholder_.classList.remove('-amp-active');
        }
        this.placeholder_.classList.add('-amp-hidden');
      }
    }

    /**
     * @param {!Element} element
     * @return {!Element}
     * @private
     */
    onImgLoaded_(element) {
      this.imgLoadedOnce_ = true;
      this.cleanupPlaceholder_();
      return element;
    }
  };

  registerElement(win, 'amp-img', AmpImg);
}
