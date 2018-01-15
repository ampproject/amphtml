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


/**
 * @fileoverview Triggers and monitors loading of custom fonts on AMP pages.
 * Example:
 * <code>
 * <amp-font
 *   font-family="My Font"
 *   timeout="3s"
 *   font-weight="bold"
 *   on-error-add-class="myfont2-missing"
 *   on-error-remove-class="myfont3-loaded"
 *   on-load-add-class="myfont2-loaded"
 *   on-load-remove-class="myfont1-loaded"
 *   layout="nodisplay">
 * </amp-font>
 * </code>
 *
 * the amp-font element's layout type is nodisplay.
 */

import {FontLoader} from './fontloader';
import {Services} from '../../../src/services';
import {isFiniteNumber} from '../../../src/types';
import {user} from '../../../src/log';

const TAG = 'amp-font';

const DEFAULT_TIMEOUT_ = 3000;

const DEFAULT_WEIGHT_ = '400';

const DEFAULT_VARIANT_ = 'normal';

const DEFAULT_STYLE_ = 'normal';

const DEFAULT_SIZE_ = 'medium';

/**
 * https://output.jsbin.com/badore - is js bin experiment to test timeouts on
 * various mobile devices. Loade the page and try refreshing it to serve the
 * font from cache.
 *
 * Font load times (from the browser cache) documented as follows:
 * Wifi
 * iPhone6(iOs 9.1) - safari - 2ms ~ 14ms
 * Windows phone(8.1 Update 2) - IE - 20ms ~ 46ms
 * Nexus5 (Android 6.0.0) - Chrome(44.0.2403.133) - 24ms ~ 52ms
 * Samsung Galaxy S4 (Android 4.4.2) - Default Browser - 7ms - 24ms
 *
 * LTE
 * iPhone6(iOs 9.1) - safari - 6ms ~ 14ms
 * Nexus5 (Android 6.0.0) - Chrome(46.0.2) - 46ms ~ 100ms
 */
const CACHED_FONT_LOAD_TIME_ = 100;


export class AmpFont extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private */
    this.fontFamily_ = '';

    /** @private */
    this.fontWeight_ = '';

    /** @private */
    this.fontStyle_ = '';

    /** @private */
    this.fontVariant_ = '';

    /** @private {?FontLoader} */
    this.fontLoader_ = null;
  }

  /** @override */
  prerenderAllowed() {
    return true;
  }


  /** @override */
  buildCallback() {
    this.fontFamily_ = user().assert(this.element.getAttribute('font-family'),
        'The font-family attribute is required for <amp-font> %s',
        this.element);
    this.fontWeight_ =
        this.element.getAttribute('font-weight') || DEFAULT_WEIGHT_;
    this.fontStyle_ =
        this.element.getAttribute('font-style') || DEFAULT_STYLE_;
    this.fontVariant_ =
        this.element.getAttribute('font-variant') || DEFAULT_VARIANT_;
    this.fontLoader_ = new FontLoader(this.getAmpDoc());
    this.startLoad_();
  }


  /**
   * Starts to download the font.
   * @private
   */
  startLoad_() {
    const fontConfig = {
      style: this.fontStyle_,
      variant: this.fontVariant_,
      weight: this.fontWeight_,
      size: DEFAULT_SIZE_,
      family: this.fontFamily_,
    };
    this.fontLoader_.load(fontConfig, this.getTimeout_()).then(() => {
      this.onFontLoadSuccess_();
    }).catch(unusedError => {
      this.onFontLoadError_();
      user().warn(TAG, 'Font download timed out for ' + this.fontFamily_);
    });
  }


  /**
   * @private
   */
  onFontLoadSuccess_() {
    const addClassName = this.element.getAttribute('on-load-add-class');
    const removeClassName =
        this.element.getAttribute('on-load-remove-class');
    this.onFontLoadFinish_(addClassName, removeClassName);
  }


  /**
   * @private
   */
  onFontLoadError_() {
    const addClassName = this.element.getAttribute('on-error-add-class');
    const removeClassName =
        this.element.getAttribute('on-error-remove-class');
    this.onFontLoadFinish_(addClassName, removeClassName);
  }


  /**
   * @param {?string} addClassName css class to be added to the
   *    document-element.
   * @param {?string} removeClassName css class to be removed from the
   *    document-element.
   * @private
   */
  onFontLoadFinish_(addClassName, removeClassName) {
    const ampdoc = this.getAmpDoc();
    // Add the class to <html> unless in ShadowRoot, where we append to <body>
    const root = ampdoc.getRootNode().documentElement || ampdoc.getBody();
    if (addClassName) {
      root.classList.add(addClassName);
    }
    if (removeClassName) {
      root.classList.remove(removeClassName);
    }
    this.dispose_();
  }


  /**
   * @private
   */
  dispose_() {
    this.fontLoader_ = null;
  }


  /**
   * Computes and returns the time (in ms) to wait for font download.
   * @returns {number} time (in ms) to wait for font download.
   * @private
   */
  getTimeout_() {
    let timeoutInMs = parseInt(this.element.getAttribute('timeout'), 10);
    timeoutInMs = !isFiniteNumber(timeoutInMs) ||
        timeoutInMs < 0 ? DEFAULT_TIMEOUT_ : timeoutInMs;
    timeoutInMs = Math.max(
        (timeoutInMs - Services.timerFor(this.win).timeSinceStart()),
        CACHED_FONT_LOAD_TIME_
    );
    return timeoutInMs;
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpFont);
});
