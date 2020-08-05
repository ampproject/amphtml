/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

// Source for this constant is css/amp-story-entry-point.css
import {createCustomEvent} from '../../event-helper';
import {cssText} from '../../../build/amp-story-entry-point.css';
import {setStyle} from '../../style';
import {toArray} from '../../types';

/** @enum {string} */
const STYLE_TYPES = {
  RECTANGULAR: 'rectangle',
};

/** @enum {string} */
const STYLE_CLASSES = {
  [STYLE_TYPES.RECTANGULAR]: 'rectangular-entry-point',
};

/**
 * <amp-story-entry-point> component for embedding stories and launching them in
 * the <amp-story-player>.
 *
 * Note that this is a vanilla JavaScript class and should not depend on AMP
 * services, as v0.js is not expected to be loaded in this context.
 */
export class AmpStoryEntryPoint {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @constructor
   */
  constructor(win, element) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Document} */
    this.doc_ = this.win_.document;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {boolean} */
    this.isLaidOut_ = false;

    /** @private {?Element} */
    this.rootEl_ = null;

    /** @private {?AmpStoryPlayer} */
    this.player_ = null;

    /** @private {!Array<!HTMLAnchorElement>} */
    this.stories_ = [];
  }

  /** @public */
  buildCallback() {
    if (this.isBuilt_) {
      return;
    }

    const playerId = this.element_.getAttribute('player-id');
    this.player_ = this.doc_.querySelector(`#${playerId}`);
    this.stories_ = toArray(this.player_.querySelectorAll('a'));

    this.initializeShadowRoot_();

    this.isBuilt_ = true;
  }

  /** @public */
  layoutCallback() {
    if (this.isLaidOut_) {
      return;
    }

    this.initializeGrid_();
    this.isLaidOut_ = true;
  }

  /** @private */
  initializeShadowRoot_() {
    this.rootEl_ = this.doc_.createElement('main');

    // Create shadow root
    const shadowRoot = this.element_.attachShadow({mode: 'open'});

    // Inject default styles
    const styleEl = this.doc_.createElement('style');
    styleEl.textContent = cssText;
    shadowRoot.appendChild(styleEl);
    shadowRoot.appendChild(this.rootEl_);
  }

  /** @private */
  initializeGrid_() {
    const style = this.element_.getAttribute('entry-point-style');
    const styleClass = STYLE_CLASSES['rectangle'];

      const cardsContainer = this.doc_.createElement('div');
      cardsContainer.classList.add('grid');
      this.rootEl_.append(cardsContainer);

    for (let i = 0; i < this.stories_.length; i++) {
      const story = this.stories_[i];
      const src = story.getAttribute('data-poster-portrait-src');
      const card = this.initializeCard_(
        src,
        styleClass,
        story.href,
        i
      );
      cardsContainer.append(card);
    }
  }

  /**
   * Initializes an image element to be displayed.
   * @param {string} src
   * @param {string} styleClass
   * @param {string} href
   * @param {number} index
   * @return {HTMLImageElement} poster
   * @private
   */
  initializeCard_(src, styleClass, href, index) {
    const card = this.doc_.createElement('img');
    card.src = src;
    card.classList.add(styleClass);
    card.classList.add('entry-point');
    this.onCardClick_(card, href, index);
    return card;
  }

  /**
   * Reacts to on click event for an entry point.
   * @param {HTMLImageElement} card
   * @param {string} href
   * @param {number} index
   * @private
   */
  onCardClick_(card, href, index) {
    card.addEventListener('click', () => {
      this.player_.show(href);
      this.element_.dispatchEvent(
        createCustomEvent(this.win_, 'entryPointClicked', {href, index})
      );
    });
  }

  /**
   * @public
   * @return {!Element}
   */
  getElement() {
    return this.element_;
  }
}
