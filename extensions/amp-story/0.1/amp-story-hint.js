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
import {debounce} from '../../../src/utils/rate-limit';
import {Animation} from '../../../src/animation';
import {setImportantStyles, resetStyles} from '../../../src/style';
import {dev} from '../../../src/log';

/** @private @const {!Array<!./simple-template.ElementDef>} */
const NAVIGATION_HELP_OVERLAY = [
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
            attrs: dict({'class': 'i-amphtml-story-icons-container'}),
            children: [
              {
                tag: 'div',
                attrs: dict({'class': 'i-amphtml-story-hint-tap-icon'}),
              },
              {
                tag: 'div',
                attrs: dict({'class': 'i-amphtml-story-hint-tap-icon-text'}),
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
            attrs: dict({'class': 'i-amphtml-story-icons-container'}),
            children: [
              {
                tag: 'div',
                attrs: dict({'class': 'i-amphtml-story-hint-tap-icon'}),
              },
              {
                tag: 'div',
                attrs: dict({'class': 'i-amphtml-story-hint-tap-icon-text'}),
                text: 'Next page',
              },
            ],
          },
        ],
      },
    ],
  },
];

/** @type {string} */
const NAVIGATION_OVERLAY_CLASS = 'show-navigation-overlay';

/** @type {string} */
const FIRST_PAGE_OVERLAY_CLASS = 'show-first-page-overlay';

/** @type {number} */
const NAVIGATION_OVERLAY_TIMEOUT = 3000;

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

    /** @private {?Element} */
    this.hintContainer_ = null;

    /** @private {?number} */
    this.hintTimeout_ = null;

    this.fadeoutHints_ = debounce(this.win_, () => {
      Animation.animate(dev().assertElement(this.hintContainer_), () => {
        setImportantStyles(
            dev().assertElement(this.hintContainer_), {'opacity': '0'});
      }, 200).thenAlways(() => {
        this.resetContainerStyle_();
        resetStyles(dev().assertElement(this.hintContainer_), ['opacity']);
      });
    }, NAVIGATION_OVERLAY_TIMEOUT);
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
   * Shows the given hint
   */
  showHint_(hintClass) {
    if (this.hintContainer_.classList.contains(hintClass)) {
      return;
    }

    this.hideAllNavigationHint();
    this.hintContainer_.classList.add(hintClass);
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
   * Hide all navigation hints.
   */
  hideAllNavigationHint() {
    this.resetContainerStyle_();
    this.fadeoutHints_();
  }

  /** @private */
  resetContainerStyle_() {
    this.hintContainer_.classList.remove(NAVIGATION_OVERLAY_CLASS);
    this.hintContainer_.classList.remove(FIRST_PAGE_OVERLAY_CLASS);
  }
}

