/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Bling link component that turns into a tooltip when clicked.
 */

import {Layout} from '../../../src/layout';

/** @const */
const ICON_CLASS = 'i-amphtml-story-bling-link-icon';

/** @const */
const SHOPPING_CART_ICON_CLASS = 'i-amphtml-story-shopping-cart';

export class AmpStoryBlingLink extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED;
  }

  /** @override */
  buildCallback() {
    //this.addPulse_();
    this.addIconElement_();
  }

  /**
   * Adds pulse as a child element of <amp-story-bling-link>
   * @private
   */
  addPulse_() {
    const pulseEl = this.win.document.createElement('i');
    pulseEl.classList.add('i-amphtml-story-bling-link-pulse');
    this.element.appendChild(pulseEl);
  }

  /**
   * Adds icon as a child element of <amp-story-bling-link>
   * @private
   */
  addIconElement_() {
    const iconEl = this.win.document.createElement('i');
    iconEl.classList.add(ICON_CLASS, SHOPPING_CART_ICON_CLASS);
    this.element.appendChild(iconEl);
  }
}
