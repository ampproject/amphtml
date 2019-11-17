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

import {PositionObserverFidelity} from '../../../src/service/position-observer/position-observer-worker';
import {RelativePositions} from '../../../src/layout-rect';
import {Services} from '../../../src/services';
import {
  childElementByAttr,
  childElementsByTag,
  isJsonScriptTag,
  removeElement,
} from '../../../src/dom';
import {dev, user, userAssert} from '../../../src/log';
import {findIndex} from '../../../src/utils/array';
import {installPositionObserverServiceForDoc} from '../../../src/service/position-observer/position-observer-impl';
import {setStyles} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {validatePage} from './utils';

const TAG = 'amp-next-page';
const PRERENDER_VIEWPORT_COUNT = 3;

/** @enum */
export const Direction = {UP: 1, DOWN: -1};

/** @enum {string} */
const PageState = {
  QUEUED: 'queued',
  FETCHING: 'fetching',
  LOADED: 'loaded',
  FAILED: 'failed',
  INSERTED: 'inserted',
};

/** @enum {string} */
const PageRelativePos = {
  INSIDE_VIEWPORT: 'inside',
  OUTSIDE_VIEWPORT: 'outside',
  LEAVING_VIEWPORT: 'leaving',
  CONTAINS_VIEWPORT: 'contains',
};

/** @enum */
const PageBound = {
  HEADER: 0,
  FOOTER: 1,
};

export class Page {
  /**
   * @param {!NextPageService} manager
   * @param {string} url
   * @param {string} title
   * @param {string} image
   */
  constructor(manager, url, title, image) {
    /** @private {!NextPageService} */
    this.manager_ = manager;
    /** @private {?../../../src/runtime.ShadowDoc} */
    this.amp_ = null; // eslint-disable-line local/unused-private-field
    /** @private {PageState} */
    this.state_ = PageState.QUEUED;
    /** @private {boolean} */
    this.visibilityState_ = false;
    this.boundPosition_ = {[PageBound.HEADER]: null, [PageBound.FOOTER]: null};

    // Public properties
    this.title = title;
    this.url = url;
    this.image = image;
    this.relativePos = PageRelativePos.OUTSIDE_VIEWPORT;
  }

  /**
   * @return {boolean}
   */
  isVisible() {
    return !!this.visibilityState_;
    // return this.amp_ && this.amp_.getVisibilityState() == VISIBLE;
  }

  /**
   */
  setVisible() {
    this.visibilityState_ = true;
    // return this.amp_ && this.amp_.getVisibilityState();
  }

  /**
   */
  setHidden() {
    this.visibilityState_ = false;
    // return this.amp_ && this.amp_.getVisibilityState();
  }

  /**
   * @return {boolean}
   */
  isFetching() {
    return this.state_ == PageState.FETCHING;
  }

  /**
   * @return {boolean}
   */
  isLoaded() {
    return this.state_ == PageState.LOADED || this.state_ == PageState.INSERTED;
  }

  /**  */
  fetch() {
    this.state_ = PageState.FETCHING;
    setTimeout(() => {
      this.state_ = PageState.LOADED;

      const content = this.manager_.buildMockDocument(this.title);

      if (this.manager_.appendAndObservePage(this, content)) {
        this.manager_.setLastFetchedPage(this);
        this.state_ = PageState.INSERTED;
      }
    }, 1000);
  }

  /**
   * @param {PageBound} bound
   * @param {?../../../src/service/position-observer/position-observer-worker.PositionInViewportEntryDef} position
   */
  boundPositionChanged(bound, position) {
    const prevBoundPosition = this.boundPosition_[bound];
    if (position.relativePos === prevBoundPosition) {
      return;
    }
    this.boundPosition_[bound] = position.relativePos;
    this.updateRelativePos();
  }

  /**
   *
   */
  updateRelativePos() {
    const header = this.boundPosition_[PageBound.HEADER];
    const footer = this.boundPosition_[PageBound.FOOTER];

    if (
      header == RelativePositions.INSIDE &&
      footer == RelativePositions.INSIDE
    ) {
      this.relativePos = PageRelativePos.INSIDE_VIEWPORT;
    } else if (
      header == RelativePositions.TOP &&
      (!footer || footer == RelativePositions.BOTTOM)
    ) {
      this.relativePos = PageRelativePos.CONTAINS_VIEWPORT;
    } else if (
      (header == RelativePositions.TOP && footer == RelativePositions.TOP) ||
      (header == RelativePositions.BOTTOM && footer == RelativePositions.BOTTOM)
    ) {
      this.relativePos = PageRelativePos.OUTSIDE_VIEWPORT;
    } else {
      this.relativePos = PageRelativePos.LEAVING_VIEWPORT;
    }
    this.manager_.updateVisibility();
  }
}

export class NextPageService {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/service/position-observer/position-observer-impl.PositionObserver=} opt_injectedPositionObserver
   */
  constructor(ampdoc, opt_injectedPositionObserver) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Window} */
    this.win_ = ampdoc.win;

    /**
     * @private
     * @const {!../../../src/service/viewport/viewport-interface.ViewportInterface}
     */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {?Element} */
    this.separator_ = null;

    /** @private {?Element} */
    this.moreBox_ = null;

    /** @private {?AmpElement} element */
    this.element_ = null;

    /** @private @const {?../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.injectedPositionObserver_ = opt_injectedPositionObserver || null;

    /** @private {?Array<!Page>} */
    this.pages_;

    /** @private {?Page} */
    this.lastFetchedPage_ = null;

    /** @private {Direction} */
    this.scrollDirection_ = Direction.DOWN;

    /** @private {number} */
    this.lastScrollTop_ = 0;
  }

  /**
   * @return {boolean}
   */
  isBuilt() {
    return !!this.pages_;
  }

  /**
   *
   * @param {!AmpElement} element
   */
  build(element) {
    this.element_ = element;
    this.separator_ = this.getSeparatorElement_();
    this.moreBox_ = this.getMoreBoxElement_();

    // Have the suggestion box be always visible
    this.element_.appendChild(this.moreBox_);

    if (!this.pages_) {
      this.pages_ = [];
    }

    this.getPagesPromise_().then(pages => {
      pages.forEach(page => {
        validatePage(page, this.ampdoc_.getUrl());
        this.pages_.push(new Page(this, page.url, page.title, page.image));
      });
    });

    this.viewport_.onScroll(() => this.updateScroll_());
    this.viewport_.onResize(() => this.updateScroll_());
    this.updateScroll_();
  }

  /**
   * @private
   * @return {!AmpElement}
   */
  getNextPageElement_() {
    return dev().assertElement(this.element_);
  }

  /**
   * @private
   */
  updateScroll_() {
    this.updateScrollDirection_();
    this.maybeFetchNext();
  }

  /**
   * @param {boolean=} force
   */
  maybeFetchNext(force = false) {
    // If a page is already queued to be fetched, wait for it
    if (this.pages_.some(page => page.isFetching())) {
      return;
    }

    if (force || this.getViewportsAway_() <= PRERENDER_VIEWPORT_COUNT) {
      const nextPage = this.pages_[
        this.getPageIndex_(this.lastFetchedPage_) + 1
      ];
      if (nextPage) {
        nextPage.fetch();
      }
    }
  }

  /**
   * Shows the page(s) that are visibles inside the viewport and hides the others pages
   */
  updateVisibility() {
    this.pages_.forEach((page, index) => {
      if (
        page.relativePos === PageRelativePos.INSIDE_VIEWPORT ||
        page.relativePos === PageRelativePos.CONTAINS_VIEWPORT
      ) {
        if (!page.isVisible()) {
          page.setVisible();
        }
        const prevPage = this.pages_[index + this.scrollDirection_];
        if (
          prevPage &&
          prevPage.relativePos == PageRelativePos.LEAVING_VIEWPORT &&
          prevPage.isVisible()
        ) {
          prevPage.setHidden();
        }
      } else if (page.relativePos === PageRelativePos.OUTSIDE_VIEWPORT) {
        if (page.isVisible()) {
          page.setHidden();
        }
      }
      this.printPagesForTesting();
    });
  }

  /**
   * @return {!../../../src/service/position-observer/position-observer-impl.PositionObserver}
   * @private
   */
  getPositionObserver_() {
    // For testing
    if (this.injectedPositionObserver_) {
      return this.injectedPositionObserver_;
    }

    installPositionObserverServiceForDoc(this.ampdoc_);
    return Services.positionObserverForDoc(this.ampdoc_.getHeadNode());
  }

  /**
   * @param {Page} page
   */
  setLastFetchedPage(page) {
    this.lastFetchedPage_ = page;
    this.printPagesForTesting();
  }

  /**
   *
   * @param {Page} page
   * @param {Element} doc
   * @return {boolean}
   */
  appendAndObservePage(page, doc) {
    if (this.getViewportsAway_() >= 1) {
      this.element_.insertBefore(
        this.separator_.cloneNode(true),
        this.moreBox_
      );

      const header = this.win_.document.createElement('div');
      const footer = this.win_.document.createElement('div');

      this.element_.insertBefore(header, this.moreBox_);
      this.element_.insertBefore(doc, this.moreBox_);
      this.element_.insertBefore(footer, this.moreBox_);

      this.getPositionObserver_().observe(
        header,
        PositionObserverFidelity.LOW,
        page.boundPositionChanged.bind(page, PageBound.HEADER)
      );
      this.getPositionObserver_().observe(
        footer,
        PositionObserverFidelity.LOW,
        page.boundPositionChanged.bind(page, PageBound.FOOTER)
      );
      return true;
    } else {
      // this.element_.appendChild(this.moreBox_);
      return false;
    }
  }

  /**
   * @return {number}
   */
  getViewportsAway_() {
    return Math.round(
      (this.viewport_.getScrollHeight() -
        this.viewport_.getScrollTop() -
        this.viewport_.getHeight()) /
        this.viewport_.getHeight()
    );
  }

  /**
   * @private
   */
  updateScrollDirection_() {
    const scrollTop = this.viewport_.getScrollTop();
    this.scrollDirection_ =
      scrollTop > this.lastScrollTop_ ? Direction.DOWN : Direction.UP;
    this.lastScrollTop_ = scrollTop;
  }

  /**
   * @param {!Page} desiredPage
   * @return {number} The index of the page.
   */
  getPageIndex_(desiredPage) {
    return findIndex(this.pages_, page => page === desiredPage);
  }

  /**
   * @return {!Promise<Array>} List of pages to fetch
   * @private
   */
  getPagesPromise_() {
    const inlinePages = this.getInlinePages_();
    const src = this.element_.getAttribute('src');
    userAssert(
      inlinePages || src,
      '%s should contain a <script> child or a URL specified in [src]',
      TAG
    );

    if (src) {
      // fetchPromise = this.fetchConfig_().catch(error =>
      //   user().error(TAG, 'Error fetching config', error)
      // );
      return Promise.resolve([]);
    } else {
      return Promise.resolve(inlinePages);
    }
  }

  /**
   * Reads the inline next pages from the element.
   * @return {?Array} JSON object, or null if no inline pages specified.
   * @private
   */
  getInlinePages_() {
    const scriptElements = childElementsByTag(
      this.getNextPageElement_(),
      'SCRIPT'
    );
    if (!scriptElements.length) {
      return null;
    }
    userAssert(
      scriptElements.length === 1,
      `${TAG} should contain at most one <script> child`
    );
    const scriptElement = scriptElements[0];
    userAssert(
      isJsonScriptTag(scriptElement),
      `${TAG} page list should ` +
        'be inside a <script> tag with type="application/json"'
    );

    const pages = tryParseJson(scriptElement.textContent, error => {
      user().error(TAG, 'failed to parse config', error);
    });

    return user().assertArray(pages, `${TAG} page list should be an array`);
  }

  /**
   * Reads the developer-provided separator element or defaults
   * to the internal implementation of it
   * @return {Element}
   * @private
   */
  getSeparatorElement_() {
    const providedSeparator = childElementByAttr(
      this.getNextPageElement_(),
      'amp-next-page-separator'
    );
    if (providedSeparator) {
      removeElement(providedSeparator);
    }
    return providedSeparator || this.buildDefaultSeparator_();
  }

  /**
   * @return {!Element}
   * @private
   */
  buildDefaultSeparator_() {
    const separator = this.win_.document.createElement('div');
    separator.classList.add('amp-next-page-separator');
    return separator;
  }

  /**
   * @param {string} title
   * @return {!Element}
   */
  buildMockDocument(title) {
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    const page = this.win_.document.createElement('div');
    page.innerText = title;
    page.classList.add('amp-next-page-doc');
    setStyles(page, {
      backgroundColor: getRandomColor(),
      height: `${Math.floor(Math.random() * 1600)}px`,
    });
    return page;
  }

  /**
   *
   */
  printPagesForTesting() {
    // eslint-disable
    console.log('=======');
    this.pages_.forEach(page => {
      console.log(
        page.title,
        page.state_,
        page.isVisible() ? 'VISIBLE' : 'HIDDEN',
        page.relativePos
      );
    });
    // eslint-enable
  }

  /**
   * @return {!Element}
   * @private
   */
  getMoreBoxElement_() {
    const providedMoreBox = childElementByAttr(
      this.getNextPageElement_(),
      'amp-next-page-more-box'
    );
    if (providedMoreBox) {
      removeElement(providedMoreBox);
    }
    return providedMoreBox || this.buildDefaultMoreBox_();
  }

  /**
   * @return {!Element}
   * @private
   */
  buildDefaultMoreBox_() {
    const moreBox = this.win_.document.createElement('div');
    moreBox.classList.add('amp-next-page-more-box');
    return moreBox;
  }
}
