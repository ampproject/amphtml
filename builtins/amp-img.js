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
import {getLengthNumeral, isLayoutSizeDefined} from '../src/layout';
import {loadPromise} from '../src/event-helper';
import {parseSrcset} from '../src/srcset';
import {registerElement} from '../src/custom-element';


/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installImg(win) {

  class AmpImg extends BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
      /** @private @const {!Element} */
      this.img_ = new Image();

      if (this.element.id) {
        this.img_.setAttribute('amp-img-id', this.element.id);
      }
      this.propagateAttributes(['alt'], this.img_);
      this.applyFillContent(this.img_, true);

      this.img_.width = getLengthNumeral(this.element.getAttribute('width'));
      this.img_.height = getLengthNumeral(this.element.getAttribute('height'));

      this.element.appendChild(this.img_);

      /** @private @const {!Srcset} */
      this.srcset_ = parseSrcset(this.element.getAttribute('srcset') ||
          this.element.getAttribute('src'));
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
     * @return {!Promise}
     * @private
     */
    updateImageSrc_() {
      if (this.getLayoutWidth() <= 0) {
        return Promise.resolve();
      }
      const src = this.srcset_.select(this.getLayoutWidth(), this.getDpr()).url;
      if (src == this.img_.getAttribute('src')) {
        return Promise.resolve();
      }
      this.img_.setAttribute('src', src);

      return loadPromise(this.img_);
    }
  };

  registerElement(win, 'amp-img', AmpImg);
}
