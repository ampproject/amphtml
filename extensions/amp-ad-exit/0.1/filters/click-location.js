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

import {Filter, FilterType} from './filter';
import {user} from '../../../../src/log';

export class ClickLocationFilter extends Filter {
  /**
   * @param {string} name The user-defined name of the filter.
   * @param {!../config.ClickLocationConfig} spec
   * @param {!../amp-ad-exit.AmpAdExit} adExitElement
   */
  constructor(name, spec, adExitElement) {
    super(name);
    user().assert(isValidClickLocationSpec(spec), 'Invaid ClickLocation spec');

    /** @private {number} */
    this.leftBorder_ = spec.left || 0;

    /** @private {number} */
    this.rightBorder_ = spec.right || 0;

    /** @private {number} */
    this.topBorder_ = spec.top || 0;

    /** @private {number} */
    this.bottomBorder_ = spec.bottom || 0;

    /**
     * By default, the border protection is relative to the current iframe. User
     * can specify a relativeTo element, then the border protection is relative
     * to the bounding rect of that element.
     * @private {string|undefined}
     */
    this.relativeTo_ = spec.relativeTo;

    /** @private {!../amp-ad-exit.AmpAdExit} */
    this.adExitElement_ = adExitElement;

    /**
     * The structure that represents the rect that will not be filtered .
     *
     * @typedef {{
     *   top: number,
     *   right: number,
     *   bottom: number,
     *   left: number
     * }}
     */
    this.allowedRect_ = {};
  }

  /** @override */
  filter(event) {
    if (event.clientX >= this.allowedRect_.left &&
        event.clientX <= this.allowedRect_.right &&
        event.clientY >= this.allowedRect_.top &&
        event.clientY <= this.allowedRect_.bottom) {
      return true;
    }
    return false;
  }

  /** @override */
  onLayoutMeasure() {
    // We don't use viewport.getSize() or viewport.getClientRect because
    // viewport function is to get the coordinate based on current viewport.
    // However, the coordinate in click event is based on the iframe.
    this.adExitElement_.getVsync().measure(() => {
      const win = this.adExitElement_.win;
      if (this.relativeTo_) {
        const relativeElement = win.document.querySelector(
            this.relativeTo_);
        user().assert(relativeElement,
            `relativeTo element ${this.relativeTo_} not found.`);
        const rect = relativeElement./*OK*/getBoundingClientRect();
        this.allowedRect_.left = rect.left;
        this.allowedRect_.top = rect.top;
        this.allowedRect_.bottom = rect.bottom;
        this.allowedRect_.right = rect.right;
      } else {
        this.allowedRect_.left = 0;
        this.allowedRect_.top = 0;
        this.allowedRect_.bottom = win./*OK*/innerHeight;
        this.allowedRect_.right = win./*OK*/innerWidth;
      }
      this.allowedRect_.left += this.leftBorder_;
      this.allowedRect_.top += this.topBorder_;
      this.allowedRect_.right -= this.rightBorder_;
      this.allowedRect_.bottom -= this.bottomBorder_;
    });
  }
}

/**
 * @param {!../config.FilterConfig} spec
 * @return {boolean} Whether the config defines a ClickLocation filter.
 */
function isValidClickLocationSpec(spec) {
  return spec.type == FilterType.CLICK_LOCATION &&
      (typeof spec.left === 'undefined' || typeof spec.left === 'number') &&
      (typeof spec.right === 'undefined' || typeof spec.right === 'number') &&
      (typeof spec.top === 'undefined' || typeof spec.top === 'number') &&
      (typeof spec.bottom === 'undefined' || typeof spec.bottom === 'number') &&
      (typeof spec.relativeTo === 'undefined' ||
       typeof spec.relativeTo === 'string') ;
}

