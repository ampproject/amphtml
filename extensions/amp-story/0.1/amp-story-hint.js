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

import {renderAsElement} from './simple-template';
import {dict} from '../../../src/utils/object';
import {Services} from '../../../src/services';


/** @private @const {!./simple-template.ElementDef} */
const TEMPLATE = {
  tag: 'aside',
  attrs: dict({'class': 'i-amphtml-story-hint-container i-amphtml-hidden'}),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-navigation-help-overlay'}),
      children: [
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-navigation-help-section'
              + ' prev-page'}),
          children: [
            {
              tag: 'div',
              attrs: dict({'class': 'i-amphtml-story-hint-placeholder'}),
              children: [
                {
                  tag: 'div',
                  attrs: dict({'class': 'i-amphtml-story-hint-tap-button'}),
                  children: [
                    {
                      tag: 'div',
                      attrs: dict({'class':
                          'i-amphtml-story-hint-tap-button-icon'}),
                    },
                  ],
                },
                {
                  tag: 'div',
                  attrs: dict({'class':
                      'i-amphtml-story-hint-tap-button-text'}),
                  text: 'Back',
                },
              ],
            },
          ],
        },
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-navigation-help-section'
              + ' next-page'}),
          children: [
            {
              tag: 'div',
              attrs: dict({'class': 'i-amphtml-story-hint-placeholder'}),
              children: [
                {
                  tag: 'div',
                  attrs: dict({'class': 'i-amphtml-story-hint-tap-button'}),
                  children: [
                    {
                      tag: 'div',
                      attrs: dict({'class':
                          'i-amphtml-story-hint-tap-button-icon'}),
                    },
                  ],
                },
                {
                  tag: 'div',
                  attrs: dict({'class':
                      'i-amphtml-story-hint-tap-button-text'}),
                  text: 'Next',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** @type {string} */
const NAVIGATION_OVERLAY_CLASS = 'show-navigation-overlay';

/** @type {string} */
const FIRST_PAGE_OVERLAY_CLASS = 'show-first-page-overlay';

/** @type {number} */
const NAVIGATION_OVERLAY_TIMEOUT = 3000;

/** @type {number} */
const FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT = 275;

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

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?Element} */
    this.hintContainer_ = null;

    /** @private {?(number|string)} */
    this.hintTimeout_ = null;
  }

  /**
   * Builds the hint layer DOM.
   * @return {!Element}
   */
  buildHintContainer() {
    this.hintContainer_ = renderAsElement(this.document_, TEMPLATE);
    return this.hintContainer_;
  }

  /**
   * Shows the given hint
   */
  showHint_(hintClass) {
    this.vsync_.mutate(() => {
      this.hintContainer_.classList.toggle(NAVIGATION_OVERLAY_CLASS,
          hintClass == NAVIGATION_OVERLAY_CLASS);
      this.hintContainer_.classList.toggle(FIRST_PAGE_OVERLAY_CLASS,
          hintClass == FIRST_PAGE_OVERLAY_CLASS);
      this.hintContainer_.classList.remove('i-amphtml-hidden');

      const hideTimeout = hintClass == NAVIGATION_OVERLAY_CLASS
        ? NAVIGATION_OVERLAY_TIMEOUT : FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT;
      this.hideAfterTimeout(hideTimeout);
    });

  }

  /**
   * Show navigation overlay DOM.
   */
  showNavigationOverlay() {
    this.showHint_(NAVIGATION_OVERLAY_CLASS);
  }

  /**
   * Show navigation overlay DOM.
   */
  showFirstPageHintOverlay() {
    this.showHint_(FIRST_PAGE_OVERLAY_CLASS);
  }

  /**
   * Hides the overlay after a given time
   * @param {number} timeout
   */
  hideAfterTimeout(timeout) {
    this.hintTimeout_ = this.timer_.delay(
        () => this.hideInternal_(), timeout);
  }

  /**
   * Hide all navigation hints.
   */
  hideAllNavigationHint() {
    this.hideInternal_();

    if (this.hintTimeout_ !== null) {
      this.timer_.cancel(this.hintTimeout_);
      this.hintTimeout_ = null;
    }
  }

  /** @private */
  hideInternal_() {
    this.vsync_.mutate(() => {
      this.hintContainer_.classList.add('i-amphtml-hidden');
    });
  }
}

