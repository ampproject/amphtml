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
import {isLayoutSizeDefined} from '../src/layout';
import {loadPromise} from '../src/event-helper';
import {registerElement} from '../src/custom-element';
import {getIframe, listen} from '../src/3p-frame';


/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installAd(win) {
  class AmpAd extends BaseElement {
    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    createdCallback() {
      /** @private {?Element} */
      this.iframe_ = null;

      /** @private {?Element} */
      this.placeholder_ = this.getPlaceholder();

      if (this.placeholder_) {
        this.placeholder_.classList.add('hidden');
      }
    }

    /** @override */
    layoutCallback() {
      if (!this.iframe_) {
        this.iframe_ = getIframe(this.element.ownerDocument.defaultView,
            this.element);
        this.applyFillContent(this.iframe_);
        this.element.appendChild(this.iframe_);
        if (this.placeholder_) {
          // Triggered by context.noContentAvailable() inside the ad iframe.
          listen(this.iframe_, 'no-content', () => {
            this.placeholder_.classList.remove('hidden');
          });
        }
      }
      return loadPromise(this.iframe_);
    }
  };

  registerElement(win, 'amp-ad', AmpAd);
}
