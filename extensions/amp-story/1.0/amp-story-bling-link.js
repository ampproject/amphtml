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
import {htmlFor} from '../../../src/static-template';

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
    this.addPulseElement_();
    this.addIconElement_();
  }

  /**
   * Adds icon as a child element of <amp-story-bling-link>
   * @private
   */
  addIconElement_() {
    const iconEl = htmlFor(this.element)`
      <div class="i-amphtml-story-bling-link-circle">
        <i class="i-amphtml-story-bling-link-icon i-amphtml-story-bling-link-shopping-cart">
        </i>
      </div>`;
    this.element.appendChild(iconEl);
  }

  /**
   * Adds pulse as a child element of <amp-story-bling-link>
   * @private
   */
  addPulseElement_() {
    const pulseEl = htmlFor(this.element)`
      <div class="i-amphtml-story-bling-link-pulse"></div>`;
    this.element.appendChild(pulseEl);
  }
}
