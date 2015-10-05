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
import {vsync} from '../src/vsync';
import {removeElement} from '../src/dom';


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

      // Default placeholdder
      if (this.isDefaultPlaceholder_) {
        this.placeholder_ = createLoaderElement();
        this.placeholder_.setAttribute('placeholder', '');
        this.element.appendChild(this.placeholder_);
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
      this.toggleDefaultPlaceholder_();
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

    /** @private */
    toggleDefaultPlaceholder_() {
      if (this.isDefaultPlaceholder_) {
        if (!this.isInViewport()) {
          this.placeholder_.classList.toggle('-amp-hidden', true);
          this.placeholder_.classList.toggle('-amp-active', false);
        } else {
          // Set a minimum delay in case the image resource loads much faster
          // than an intermittent loading screen that disappears right away.
          // This can occur on fast internet connections or on a local server.
          return timer.delay(() => {
            vsync.mutate(() => {
              if (this.placeholder_) {
                this.placeholder_.classList.toggle('-amp-hidden',
                    !this.isInViewport());
                this.placeholder_.classList.toggle('-amp-active',
                    this.isInViewport());
              }
            });
          }, 100);
        }
      }
    }

    /**
     * @private
     */
    cleanupPlaceholder_() {
      if (this.isDefaultPlaceholder_) {
        this.isDefaultPlaceholder_ = false;
        let placeholder = this.placeholder_;
        this.placeholder_ = null;
        placeholder.classList.remove('-amp-active');
        placeholder.classList.add('-amp-hidden');
        this.deferMutate(() => {
          removeElement(placeholder);
        });
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
