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

import {renderSimpleTemplate} from './simple-template';
import {dict} from '../../../src/utils/object';

/** @private @const {!Array<!./simple-template.ElementDef>} */
const NAVIGATION_HELP_OVERLAY = [
  {
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-navigation-help-overlay'}),
    children: [
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-navigation-help-section'
            + ' i-amphtml-story-navigation-help-first-page'}),
        children: [
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-hint-text'}),
            text: 'this is the first page',
          },
        ],
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-navigation-help-section'
            + ' i-amphtml-story-navigation-help-next-page'}),
        children: [
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-hint-tap-icon'}),
          },
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-hint-tap-icon-text'}),
            text: 'tap for next',
          },
        ],
      },
    ],
  },
];

/** @type {string} */
const NAVIGATION_OVERLAY_CLASS = 'show-navigation-overlay';

/** @type {number} */
const NAVIGATION_OVERLAY_TIMEOUT = 2000;

/**
 * User Hint Layer for <amp-story>.
 */
export class AmpStoryHint {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Document} */
    this.document_ = this.win_.document;

    /** @private {?Storage} */
    this.localStorage_ = this.win_.localStorage;

    /** @private {?Element} */
    this.hintContainer_ = null;

    /** @private {?number} */
    this.hintTimeout_ = null;
  }

  /**
   * Builds the hint layer DOM.
   * @return {!Element}
   */
  buildHintContainer() {
    this.hintContainer_ = this.document_.createElement('aside');
    this.hintContainer_.classList.add('i-amphtml-story-hint-container');
    this.buildNavigationOverlay_();
    return this.hintContainer_;
  }

  /**
   * Builds navigation overlay DOM.
   * @private
   */
  buildNavigationOverlay_() {
    this.hintContainer_.appendChild(
        renderSimpleTemplate(this.document_, NAVIGATION_HELP_OVERLAY));
  }

  /**
   * Show navigation overlay DOM.
   */
  showNavigationOverlay() {
    this.hintContainer_.classList.add(NAVIGATION_OVERLAY_CLASS);

    this.hintTimeout_ = setTimeout(() => {
      this.hideAllNavigationHint();
    }, NAVIGATION_OVERLAY_TIMEOUT);
  }

  /**
   * Hide all navigation hints.
   */
  hideAllNavigationHint() {
    this.hintContainer_.classList.remove(NAVIGATION_OVERLAY_CLASS);

    if (this.hintTimeout_) {
      this.win_.clearTimeout(this.hintTimeout_);
      this.hintTimeout_ = null;
    }
  }
}

