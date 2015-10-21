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

import {removeElement} from '../../../src/dom';
import {timer} from '../../../src/timer';
import {vsync} from '../../../src/vsync';
import * as style from '../../../src/style';
import {FontLoader} from './fontloader';

/** @private @const {number} */
const DEFAULT_TIMEOUT_ = 5000;

/** @private @const {string} */
const DEFAULT_WEIGHT_ = '400';

/** @private @const {string} */
const DEFAULT_VARIANT_ = 'normal';

/** @private @const {string} */
const DEFAULT_STYLE_ = 'normal';

/** @private @const {string} */
const DEFAULT_SIZE_ = 'medium';

/** @private @const {number}*/
const CACHED_FONT_LOAD_TIME_ = 100;


export class AmpFont extends AMP.BaseElement {


  /** @override */
  prerenderAllowed() {
    return true;
  }


  /** @override */
  buildCallback() {
    /** @private {string} */
    this.fontFamily_ = AMP.assert(this.element.getAttribute('font-family'),
        'The font-family attribute is required for <amp-font> %s',
        this.element);
    /** @private {string} */
    this.fontWeight_ =
        this.element.getAttribute('font-weight') || DEFAULT_WEIGHT_;
    /** @private {string} */
    this.fontStyle_ =
        this.element.getAttribute('font-style') || DEFAULT_STYLE_;
    /** @private {string} */
    this.fontVariant_ =
        this.element.getAttribute('font-variant') || DEFAULT_VARIANT_;
    this.document_ = this.getWin().document;
    this.documentElement_ = this.document_.documentElement;
    this.fontLoader_ = new FontLoader(this.document_);
    this.startLoad_();
  }


  /**
   * Starts to download the font.
   * @private
   */
  startLoad_() {
    /** @type FontConfig*/
    const fontConfig = {
      style: this.fontStyle_,
      variant: this.fontVariant_,
      weight: this.fontWeight_,
      size: DEFAULT_SIZE_,
      family: this.fontFamily_
    };
    this.fontLoader_.load(fontConfig, this.getTimeout_()).then(() => {
      this.onFontLoadSuccess_();
    }).catch(() => {
      this.onFontLoadError_();
    });
  }

  /**
   * @private
   */
  onFontLoadSuccess_() {
    var addClassName = this.element.getAttribute('on-load-add-class');
    var removeClassName =
        this.element.getAttribute('on-load-remove-class');
    this.onFontLoadFinish_(addClassName, removeClassName);
  }


  /**
   * @private
   */
  onFontLoadError_() {
    var addClassName = this.element.getAttribute('on-error-add-class');
    var removeClassName =
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
    if (addClassName) {
      this.documentElement_.classList.add(addClassName);
    }
    if (removeClassName) {
      this.documentElement_.classList.remove(removeClassName);
      this.document_.body.classList.remove(removeClassName);
    };
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
    timeoutInMs = isNaN(timeoutInMs) || timeoutInMs < 0 ?
        DEFAULT_TIMEOUT_ : timeoutInMs;
    timeoutInMs = Math.max(
      (timeoutInMs - timer.timeSinceStart()), CACHED_FONT_LOAD_TIME_);
    return timeoutInMs;
  }
}


AMP.registerElement('amp-font', AmpFont);
