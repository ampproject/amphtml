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

import {Services} from '../../../src/services';
import {listenOncePromise} from '../../../src/event-helper';
import {setStyle} from '../../../src/style';


/** @const {number} */
const SWAP_TIMEOUT_MS = 500;


const BACKGROUND_CLASS = 'i-amphtml-story-background';

const BACKGROUND_CONTAINER_CLASS = 'i-amphtml-story-background-container';

const BACKGROUND_OVERLAY_CLASS = 'i-amphtml-story-background-overlay';



/**
 * @param {?string} url
 * @return {!Promise}
 */
function maybeLoadImage(url) {
  if (!url) {
    return Promise.resolve();
  }
  const img = new Image;
  img.src = url;
  return listenOncePromise(img, 'load');
}


/**
 * TODO(cvializ): Investigate pre-rendering blurred backgrounds to canvas to
 * possibly improve performance?
 */
export class AmpStoryBackground {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    /* @private @const {!Element} */
    this.element_ = element;

    /* @private @const {!Window} */
    this.win_ = win;

    /* @private {number} */
    this.count_ = 0;

    /** @private @const */
    this.container_ = this.element_.ownerDocument.createElement('div');

    /** @private @const */
    this.containerOverlay_ = this.element_.ownerDocument.createElement('div');

    /** @private {!Element} */
    this.hidden_ = this.createBackground_();

    /** @private {!Element} */
    this.active_ = this.createBackground_();

    this.container_.classList.add(BACKGROUND_CONTAINER_CLASS);
    this.containerOverlay_.classList.add(BACKGROUND_OVERLAY_CLASS);

    this.container_.appendChild(this.hidden_);
    this.container_.appendChild(this.active_);
    this.container_.appendChild(this.containerOverlay_);
  }

  /**
   * @return {!Element}
   */
  createBackground_() {
    const bg = this.element_.ownerDocument.createElement('div');
    bg.classList.add(BACKGROUND_CLASS);
    return bg;
  }

  /**
   * Attach the backgrounds to the document.
   */
  attach() {
    this.element_.insertBefore(this.container_, this.element_.firstChild);
  }

  /**
   * Update the background with new background image URL.
   * @param {string} color
   * @param {?string} url
   * @param {boolean=} initial
   */
  setBackground(color, url, initial = false) {
    const countAtAdd = ++this.count_;

    const whenFresh = (promise, callback) => promise.then(() => {
      if (this.count_ == countAtAdd) {
        callback();
      }
    });

    const imgLoad = maybeLoadImage(url);
    const timeout =
        Services.timerFor(this.win_).promise(initial ? 0 : SWAP_TIMEOUT_MS);

    const hidden = this.hidden_;

    setStyle(hidden, 'background-image', 'none');

    // Image will be swapped on load.
    whenFresh(imgLoad, () => {
      setStyle(hidden, 'background-image', url ? `url(${url})` : null);
    });

    // Color will always be swapped on timeout.
    whenFresh(Promise.race([imgLoad, timeout]), () => {
      setStyle(hidden, 'background-color', color);
      this.rotateActiveBackground_();
    });
  }

  /**
   * Rotates the classes on page background to bring the new bacground in foreground.
   * @private
   */
  rotateActiveBackground_() {
    const newHidden = this.active_;
    this.active_ = this.hidden_;
    this.hidden_ = newHidden;
    this.active_.classList.add('active');
    this.hidden_.classList.remove('active');
  }
}
