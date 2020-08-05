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

import {createCustomEvent} from '../../event-helper';
// Source for this constant is css/amp-story-entry-point-card.css
import {cssText} from '../../../build/amp-story-entry-point-card.css';
import {setStyle} from '../../style';
import {toArray} from '../../types';

/** @enum {string} */
const STYLE_TYPES = {
  RECTANGULAR: 'rectangle',
  CIRCULAR: 'circle',
};

/** @enum {string} */
const STYLE_CLASSES = {
  [STYLE_TYPES.RECTANGULAR]: 'rectangular-entry-point',
  [STYLE_TYPES.CIRCULAR]: 'circular-entry-point',
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

    /** @private {number} */
    this.scrollX_ = 0;
  }

  /** @public */
  buildCallback() {
    if (this.isBuilt_) {
      return;
    }

    const playerId = `#${this.element_.getAttribute('player-id')}`;
    this.player_ = this.doc_.querySelector(playerId);
    this.stories_ = toArray(this.player_.querySelectorAll('a'));

    this.initializeShadowRoot_();
    this.isBuilt_ = true;
  }

  /** @public */
  layoutCallback() {
    if (this.isLaidOut_) {
      return;
    }

    this.initializeCarousel_();
    this.initializeCarouselArrow_();
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
  initializeCarousel_() {
    const style = this.element_.getAttribute('entry-point-style');
    const styleClass = !Object.values(STYLE_TYPES).includes(style)
      ? STYLE_CLASSES['rectangle']
      : STYLE_CLASSES[style];

    this.element_.classList.add(styleClass);

    const cardsContainer = this.doc_.createElement('div');
    cardsContainer.classList.add('entry-points');
    this.rootEl_.append(cardsContainer);

    for (let i = 0; i < this.stories_.length; i++) {
      const story = this.stories_[i];
      const src = story.getAttribute('data-poster-portrait-src');

      const cardContainer = this.doc_.createElement('div');
      cardContainer.classList.add('entry-point-card-container');
      cardsContainer.append(cardContainer);

      if (styleClass !== 'circular-entry-point') {
        this.initializeCardTitle_(cardContainer, story);
        this.initializeCardLogo_(cardContainer);
      }

      this.initializeCard_(cardContainer, src, styleClass, story.href, i);
    }
  }

  /**
   * Initializes the card's title to be displayed.
   * @param {Element} cardContainer
   * @param {HTMLAnchorElement} story
   */
  initializeCardTitle_(cardContainer, story) {
    const title = this.doc_.createElement('span');
    title.classList.add('entry-point-card-headline');
    title.textContent = story.querySelector('span').textContent;
    cardContainer.append(title);
  }

  /**
   * Initializes the logo to be displayed.
   * @param {Element} cardContainer
   */
  initializeCardLogo_(cardContainer) {
    const src = this.element_.getAttribute('logo');
    if (!src) {
      return;
    }

    const logo = this.doc_.createElement('img');
    logo.classList.add('entry-point-card-logo');
    logo.src = src;
    cardContainer.append(logo);
  }

  /**
   * Initializes an image element to be displayed.
   * @param {Element} cardContainer
   * @param {string} src
   * @param {string} styleClass
   * @param {string} href
   * @param {number} index
   * @private
   */
  initializeCard_(cardContainer, src, styleClass, href, index) {
    const card = this.doc_.createElement('img');
    card.src = src;
    card.classList.add(styleClass);
    card.classList.add('entry-point-card-img');
    this.setCardWidthHeight_(card, styleClass);
    this.onCardClick_(card, href, index);
    cardContainer.append(card);
  }

  /**
   * Sets the correct height and width for poster based on style.
   * @param {HTMLImageElement} card
   * @param {string} styleClass
   * @private
   */
  setCardWidthHeight_(card, styleClass) {
    card.height = 233;
    if (styleClass === 'circular-entry-point') {
      card.width = 100;
      card.height = 100;
    }
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
   * Creates arrows to be displayed.
   * @private
   * */
  initializeCarouselArrow_() {
    const scrollContainer = this.rootEl_.querySelector('div.entry-points');
    const cards = this.rootEl_.querySelectorAll(
      'div.entry-point-card-container'
    );
    const maxScroll =
      scrollContainer./*OK*/ clientWidth -
      cards.length * cards[0]./*OK*/ clientWidth;
    if (maxScroll >= 0) {
      return;
    }

    this.createCarouselArrow_(true, maxScroll, cards);
    this.createCarouselArrow_(false, maxScroll, cards);
  }

  /**
   * Creates a button element, adds scrolling ability to it and displays it on the page.
   * @param {boolean} isLeft
   * @param {number} maxScroll
   * @param {Array<Element>} cards
   * @private
   */
  createCarouselArrow_(isLeft, maxScroll, cards) {
    const button = this.doc_.createElement('button');
    button.classList.add(
      isLeft ? 'entry-point-left-arrow' : 'entry-point-right-arrow'
    );
    button.classList.add('entry-point-arrow');
    this.rootEl_.appendChild(button);
    this.addScrollingToArrow_(button, isLeft, maxScroll, cards);
  }

  /**
   * Add ability to scroll to button.
   * @param {Element} button
   * @param {boolean} isLeft
   * @param {number} maxScroll
   * @param {Array<Element>} cards
   * @private
   */
  addScrollingToArrow_(button, isLeft, maxScroll, cards) {
    button.addEventListener('click', () => {
      this.scrollX_ = isLeft
        ? Math.min(0, this.scrollX_ + 50)
        : Math.max(maxScroll, this.scrollX_ - 50);

      for (let i = 0; i < cards.length; i++) {
        setStyle(cards[i], 'transform', `translateX(${this.scrollX_}px)`);
      }
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
