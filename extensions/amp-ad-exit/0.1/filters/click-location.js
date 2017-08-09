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

import {FilterType, Filter} from './filter';
import {user} from '../../../../src/log';

export class ClickLocationFilter extends Filter {
  /**
   * @param {string} name The user-defined name of the filter.
   * @param {!../config.ClickLocationConfig} spec
   */
  constructor(name, spec, win) {
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

    /** @private {string|undefined} */
    this.relativeTo_ = spec.relativeTo;

    /** @private {!Window} */
    this.win_ = win;
  }

  /** @override */
  filter(event) {
    let left = 0;
    let top = 0;
    let right = this.win_./*REVIEW*/innerWidth;
    let bottom = this.win_./*REVIEW*/innerHeight;
    if (this.relativeTo_) {
      const relativeElement = this.win_.document.querySelector(
          this.relativeTo_);
      user().assert(relativeElement,
          `relativeTo element ${this.relativeTo_} not found.`);
      const elementRect = relativeElement./*REVIEW*/getBoundingClientRect();
      left = elementRect.left;
      top = elementRect.top;
      right = elementRect.right;
      bottom = elementRect.bottom;
    }
    if (event.clientX < (left + this.leftBorder_) ||
        event.clientX > (right - this.rightBorder_) ||
        event.clientY < (top + this.topBorder_) ||
        event.clientY > (bottom - this.bottomBorder_)) {
      return false;
    }
    return true;
  }
}

/**
 * @param {!../config.FilterConfig} spec
 * @return {boolean} Whether the config defines a ClickLocation filter.
 */
function isValidClickLocationSpec(spec) {
  return spec.type == FilterType.CLICK_LOCATION &&
      (typeof spec.left == 'undefined' || typeof spec.left == 'number') &&
      (typeof spec.right == 'undefined' || typeof spec.right == 'number') &&
      (typeof spec.top == 'undefined' || typeof spec.top == 'number') &&
      (typeof spec.bottom == 'undefined' || typeof spec.bottom == 'number') &&
      (typeof spec.relativeTo == 'undefined' ||
       typeof spec.relativeTo == 'string') ;
}

