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

/*eslint no-unused-vars: 0*/
/**
 * @typedef {{
 *  style: string,
 *  variant: string,
 *  weight: string,
 *  size: string,
 *  family: string
 * }}
 */
let FontConfigDef;


/** @private @const {Array.<string>} */
const DEFAULT_FONTS_ = ['sans-serif', 'serif'];

/** @private @const {string} */
const TEST_STRING_ = 'MAxmTYklsjo190QW';

/** @private @const {number} */
const TOLERANCE_ = 2;


import {removeElement} from '../../../src/dom';
import {timerFor} from '../../../src/timer';
import {vsyncFor} from '../../../src/vsync';
import * as style from '../../../src/style';


export class FontLoader {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;
    /** @private @const {!Document} */
    this.document_ = win.document;
    /** @private {?Element} */
    this.container_ = null;
    /** @private {?Array.<Element>} */
    this.defaultFontElements_ = null;
    /** @private {?Element} */
    this.customFontElement_ = null;
    /** @private {boolean} */
    this.fontLoadResolved_ = false;
    /** @private {boolean} */
    this.fontLoadRejected_ = false;
    /** @private {FontConfigDef} */
    this.fontConfig_ = null;
  }


  /**
   * Triggers the font load. Returns promise that will complete when loading
   * is considered to be complete.
   * @param {!FontConfigDef} fontConfig Config that describes the font to be
   *    loaded.
   * @param {number} timeout number of milliseconds after which the font load
   *    attempt would be stopped.
   * @return {!Promise}
   */
  load(fontConfig, timeout) {
    this.fontConfig_ = fontConfig;
    return timerFor(this.win_)
        .timeoutPromise(timeout, this.load_())
        .then(() => {
          this.fontLoadResolved_ = true;
          this.dispose_();
        }, reason => {
          this.fontLoadRejected_ = true;
          this.dispose_();
          throw reason;
        });
  }


  /**
   * Triggers the font load. Returns promise that will complete when loading
   * is considered to be complete.
   * @return {!Promise}
   * @private
   */
  load_() {
    return new Promise((resolve, reject) => {
      /* style | variant | weight | size/line-height | family */
      /* font: italic small-caps bolder 16px/3 cursive; */
      const fontString = (
        this.fontConfig_.style + ' ' +
        this.fontConfig_.variant + ' ' +
        this.fontConfig_.weight + ' ' +
        this.fontConfig_.size + ' ' +
        this.fontConfig_.family);

      if (this.canUseNativeApis_()) {
        // Check if font already exists.
        if (this.document_.fonts.check(fontString)) {
          resolve();
        } else {
          // Load font with native api if supported.
          this.document_.fonts.load(fontString).then(() => {
            // Workaround for chrome bug
            // https://bugs.chromium.org/p/chromium/issues/detail?id=347460
            return this.document_.fonts.load(fontString);
          }).then(() => {
            if (this.document_.fonts.check(fontString)) {
              resolve();
            } else {
              reject(new Error('Font could not be loaded,'
                  + ' probably due to incorrect @font-face.'));
            }
          }).catch(reject);
        }
      } else {
        // Load font with polyfill if native api is not supported.
        this.loadWithPolyfill_().then(resolve, reject);
      }
    });
  }


  /**
   * @returns {boolean} True when native font api is supported by the browser.
   * @private
   */
  canUseNativeApis_() {
    return 'fonts' in this.document_;
  }


  /**
   * Make the browsers that don't support font loading events to download the
   * custom font by creating an element (with text) not visible on the viewport.
   * Font download is detected by comparing the elements height and width with
   * measurements between default fonts and custom font.
   * @private
   */
  loadWithPolyfill_() {
    return new Promise((resolve, reject) => {
      const vsync = vsyncFor(this.win_);
      // Create DOM elements
      this.createElements_();
      // Measure until timeout (or font load).
      const vsyncTask = vsync.createTask({
        measure: () => {
          if (this.fontLoadResolved_) {
            resolve();
          } else if (this.fontLoadRejected_) {
            reject(new Error('Font loading timed out.'));
          } else if (this.compareMeasurements_()) {
            resolve();
          } else {
            vsyncTask();
          }
        },
      });
      vsyncTask();
    });
  }


  /**
   * Step 1 for loading font on browsers that don't support font loading events.
   * Creates divs hidden from the viewport and measures dimensions for default
   * fonts.
   * @private
   */
  createElements_() {
    const containerElement = this.container_ =
        this.document_.createElement('div');
    style.setStyles(containerElement, {
      // Use larger font-size to better detect font load.
      fontSize: '40px',
      fontVariant: this.fontConfig_.variant,
      fontWeight: this.fontConfig_.weight,
      fontStyle: this.fontConfig_.style,
      left: '-999px',
      lineHeight: 'normal',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: '-999px',
      visibility: 'hidden',
    });
    this.defaultFontElements_ = [];
    DEFAULT_FONTS_.forEach(font => {
      const defaultFontElement = this.document_.createElement('div');
      this.defaultFontElements_.push(defaultFontElement);
      defaultFontElement.textContent = TEST_STRING_;
      style.setStyles(defaultFontElement, {
        fontFamily: font,
        margin: 0,
        padding: 0,
        whiteSpace: 'nowrap',
      });
      containerElement.appendChild(defaultFontElement);
    });
    // Adding custom font family to the element to trigger load.
    // The loading will begin after the container has been appended to the body.
    const customFontElement = this.customFontElement_ =
        this.document_.createElement('div');
    style.setStyles(customFontElement, {
      fontFamily: this.fontConfig_.family + ',' + DEFAULT_FONTS_.join(),
      margin: 0,
      padding: 0,
      whiteSpace: 'nowrap',
    });
    customFontElement.textContent = TEST_STRING_;
    containerElement.appendChild(customFontElement);
    this.document_.body.appendChild(containerElement);
  }


  /**
   * Compare dimensions between elements styled with default fonts and custom
   * font.
   * @returns {boolean} Returns true if the dimensions are noticeably different
   * else returns false.
   * @private
   */
  compareMeasurements_() {
    return this.defaultFontElements_.some(defaultElement => {
      const hasWidthChanged = (
          Math.abs(
              defaultElement./*OK*/offsetWidth -
              this.customFontElement_./*OK*/offsetWidth) >
              TOLERANCE_);
      const hasHeightChanged = (
          Math.abs(
              defaultElement./*OK*/offsetHeight -
              this.customFontElement_./*OK*/offsetHeight) >
              TOLERANCE_);
      return (hasWidthChanged || hasHeightChanged);
    });
  }


  /**
   * @private
   */
  dispose_() {
    if (this.container_) {
      removeElement(this.container_);
    }
    this.container_ = null;
    this.defaultFontElements_ = null;
    this.customFontElement_ = null;
  }
}
