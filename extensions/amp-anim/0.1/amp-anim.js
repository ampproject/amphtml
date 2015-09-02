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

import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';


(window.AMP = window.AMP || []).push(function(AMP) {
  class AmpAnim extends AMP.BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    firstAttachedCallback() {
      /** @private {?Element} */
      this.placeholder_ = this.getPlaceholder();

      var width = this.element.getAttribute('width');
      var height = this.element.getAttribute('height');
      var img = new Image();
      if (this.placeholder_) {
        img.style.display = 'none';
      }
      this.applyFillContent(img);
      img.width = getLengthNumeral(width);
      img.height = getLengthNumeral(height);
      this.element.appendChild(img);

      /** @const {!Element} */
      this.img = img;
    }

    /** @override */
    loadContent() {
      // TODO(dvoytenko): do strictly via Resources
      if (this.placeholder_.initiateLoadContent) {
        this.placeholder_.initiateLoadContent();
      }

      this.propagateAttributes(['src', 'srcset', 'alt'], this.img);
      return loadPromise(this.img);
    }

    /** @override */
    activateContent() {
      if (this.placeholder_) {
        this.placeholder_.classList.add('hidden');
        this.img.style.display = 'block';
      }
    }

    /** @override */
    deactivateContent() {
      if (this.placeholder_) {
        this.placeholder_.classList.remove('hidden');
        this.img.style.display = 'none';
      }
    }
  }

  AMP.registerElement('amp-anim', AmpAnim);
});
