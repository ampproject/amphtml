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
import {setStyles} from '../src/style';
import {loadPromise} from '../src/event-helper';
import {registerElement} from '../src/custom-element';
import {getIframe, listen} from '../src/3p-frame';


/**
 * Preview phase only default backfill for ads. If the ad
 * cannot fill the slot one of these will be displayed instead.
 * @private @const
 */
const BACKFILL_IMGS_ = {
  '300x200': [
    'backfill-1-300x250.png',
    'backfill-2-300x250.png',
    'backfill-3-300x250.png',
    'backfill-4-300x250.png',
    'backfill-5-300x250.png',
  ],
  '320x50': [
    'backfill-6-320x50.png',
    'backfill-7-320x50.png',
  ],
};

/** @private @const */
const BACKFILL_DIMENSIONS_ = [
  [300, 200],
  [320, 50],
];

/**
 * @param {!Array<!Array<number>>} dims
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @visibleForTesting
 */
export function scoreDimensions_(dims, maxWidth, maxHeight) {
  return dims.map(function(dim) {
    let [width, height] = dim;
    let widthScore = Math.abs(width - maxWidth);
    // if the width is over the max then we need to penalize it
    let widthPenalty = Math.abs((maxWidth - width) * 3);
    // we add a multiplier to height as we prioritize it more than width
    let heightScore = Math.abs(height - maxHeight) * 2;
    // if the height is over the max then we need to penalize it
    let heightPenalty = Math.abs((maxHeight - height) * 2.5);

    return (widthScore - widthPenalty) + (heightScore - heightPenalty);
  });
}


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

      /** @private {boolean} */
      this.isDefaultPlaceholder_ = false;
    }

    /** @override */
    buildCallback() {
      if (this.placeholder_) {
        this.placeholder_.classList.add('hidden');
      } else {
        this.isDefaultPlaceholder_ = true;
      }
    }

    /** @override */
    layoutCallback() {
      if (!this.iframe_) {
        this.iframe_ = getIframe(this.element.ownerDocument.defaultView,
            this.element);
        this.applyFillContent(this.iframe_);
        this.element.appendChild(this.iframe_);

        // Triggered by context.noContentAvailable() inside the ad iframe.
        listen(this.iframe_, 'no-content', () => {
          if (this.isDefaultPlaceholder_) {
            this.setDefaultPlaceholder_();
            this.element.appendChild(this.placeholder_);
            this.element.removeChild(this.iframe_);
          }
          this.placeholder_.classList.remove('hidden');
        });
      }
      return loadPromise(this.iframe_);
    }

    /**
     * This is a preview-phase only thing where if the ad says that it
     * cannot fill the slot we select from a small set of default
     * banners.
     * @private
     * @visibleForTesting
     */
    setDefaultPlaceholder_() {
      var a = document.createElement('a');
      a.href = 'https://www.ampproject.org';
      a.target = '_blank';
      a.setAttribute('placeholder', '');
      a.classList.add('hidden');
      var img = new Image();
      setStyles(img, {
        width: 'auto',
        height: '100%',
        margin: 'auto',
      });

      let winner = this.getPlaceholderImage_();
      img.src = `https://ampproject.org/backfill/${winner}`;
      this.placeholder_ = a;
      a.appendChild(img);
    }

    /**
     * Picks a random backfill image for the case that no real ad can be
     * shown.
     * @private
     * @return {string} The image URL.
     */
    getPlaceholderImage_() {
      let scores = scoreDimensions_(BACKFILL_DIMENSIONS_,
          this.element.clientWidth, this.element.clientHeight);
      let dims = BACKFILL_DIMENSIONS_[scores.indexOf(Math.max(...scores))];
      let images = BACKFILL_IMGS_[dims.join('x')];
      // do we need a more sophisticated randomizer?
      return images[Math.floor(Math.random() * images.length)];
    }
  };

  registerElement(win, 'amp-ad', AmpAd);
}
