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

import {htmlFor} from '../../../src/static-template';

/**
 * Links that are bling links.
 * @const {string}
 */
export const BLING_LINK_SELECTOR = 'a.i-amphtml-story-bling-link';

export const BLING_LINK_BUILT = 'built';

export class AmpStoryBlingLink {
  /**
   * Builds bling link
   * @param {!Element} element
   */
  static build(element) {
    if (element[BLING_LINK_BUILT]) {
      return;
    }

    this.addPulseElement_(element);
    this.addIconElement_(element);

    element[BLING_LINK_BUILT] = true;
  }

  /**
   * Adds icon as a child element of <amp-story-bling-link>
   * @param {!Element} element
   * @private
   */
  static addIconElement_(element) {
    const iconEl = htmlFor(element)`
      <div class="i-amphtml-story-bling-link-circle">
        <i class="i-amphtml-story-bling-link-icon i-amphtml-story-bling-link-shopping-cart"></i>
      </div>`;
    element.appendChild(iconEl);
  }

  /**
   * Adds pulse as a child element of <amp-story-bling-link>
   * @param {!Element} element
   * @private
   */
  static addPulseElement_(element) {
    const pulseEl = htmlFor(element)`
      <div class="i-amphtml-story-bling-link-pulse"></div>`;
    element.appendChild(pulseEl);
  }
}
