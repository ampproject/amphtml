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

import {CSS} from '../../../build/amp-story-hint-0.1.css';
import {LocalizedStringId} from './localization';
import {Services} from '../../../src/services';
import {StateProperty} from './amp-story-store-service';
import {createShadowRootWithStyle} from './utils';
import {dict} from '../../../src/utils/object';
import {renderAsElement} from './simple-template';


/** @private @const {!./simple-template.ElementDef} */
const TEMPLATE = {
  tag: 'aside',
  attrs: dict({
    'class': 'i-amphtml-story-hint-container ' +
        'i-amphtml-story-system-reset i-amphtml-hidden'}),
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
                  localizedStringId:
                      LocalizedStringId.AMP_STORY_HINT_UI_PREVIOUS_LABEL,
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
                  localizedStringId:
                      LocalizedStringId.AMP_STORY_HINT_UI_NEXT_LABEL,
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
   * @param {!Element} parentEl Element where to append the component
   */
  constructor(win, parentEl) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {boolean} Whether the component is built. */
    this.isBuilt_ = false;

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

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win_);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;
  }

  /**
   * Builds the hint layer DOM.
   */
  build() {
    if (this.isBuilt()) {
      return;
    }

    this.isBuilt_ = true;

    const root = this.document_.createElement('div');
    this.hintContainer_ = renderAsElement(this.document_, TEMPLATE);
    createShadowRootWithStyle(root, this.hintContainer_, CSS);

    this.vsync_.mutate(() => {
      this.parentEl_.appendChild(root);
    });
  }

  /**
   * Whether the component is built.
   * @return {boolean}
   */
  isBuilt() {
    return this.isBuilt_;
  }

  /**
   * Shows the given hint.
   * @param {string} hintClass
   * @private
   */
  showHint_(hintClass) {
    // Don't show the swiping hint on desktop, or when the share menu is on.
    if (this.storeService_.get(StateProperty.DESKTOP_STATE) ||
        this.storeService_.get(StateProperty.SHARE_MENU_STATE)) {
      return;
    }

    this.build();

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
    // Don't show the overlay if the share menu is open.
    if (this.storeService_.get(StateProperty.SHARE_MENU_STATE)) {
      return;
    }

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
    if (!this.isBuilt()) {
      return;
    }

    this.vsync_.mutate(() => {
      this.hintContainer_.classList.add('i-amphtml-hidden');
    });
  }
}

