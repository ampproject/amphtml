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

import {CSS} from '../../../build/amp-next-page-0.2.css';
import {MultidocManager} from '../../../src/multidoc-manager';
import {Page, PageRelativePos, PageState} from './page';
import {
  PositionObserver, // eslint-disable-line no-unused-vars
  installPositionObserverServiceForDoc,
} from '../../../src/service/position-observer/position-observer-impl';
import {PositionObserverFidelity} from '../../../src/service/position-observer/position-observer-worker';
import {Services} from '../../../src/services';
import {VisibilityState} from '../../../src/visibility-state';
import {
  childElementByAttr,
  childElementsByTag,
  isJsonScriptTag,
  removeElement,
} from '../../../src/dom';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {installStylesForDoc} from '../../../src/style-installer';
import {
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
} from '../../../src/mediasession-helper';
import {sanitizeDoc, validatePage, validateUrl} from './utils';
import {tryParseJson} from '../../../src/json';

const TAG = 'amp-next-page';
const PRERENDER_VIEWPORT_COUNT = 3;

/** @enum */
export const Direction = {UP: 1, DOWN: -1};

export class NextPageService {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!PositionObserver=} injectedPositionObserver
   */
  constructor(ampdoc, injectedPositionObserver) {
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

    /** @private @const {?PositionObserver} */
    this.injectedPositionObserver_ = injectedPositionObserver || null;

    /** @private {?MultidocManager} */
    this.multidocManager_ = null;

    /** @private {?../../../src/service/history-impl.History} */
    this.history_ = null;

    /** @private {?Array<!Page>} */
    this.pages_;

    /** @private {?Page} */
    this.lastFetchedPage_ = null;

    /** @private {!Direction} */
    this.scrollDirection_ = Direction.DOWN;

    /** @private {number} */
    this.lastScrollTop_ = 0;

    /** @private {?Page} */
    this.initialPage_ = null;
  }

  /**
   * @return {boolean}
   */
  isBuilt() {
    return !!this.pages_;
  }

  /**
   * Builds the next-page service by fetching the required elements
   * and the initial list of pages and installing scoll listeners
   * @param {!AmpElement} element
   */
  build(element) {
    // Create a reference to the host page
    this.initialPage_ = this.createInitialPage();

    this.history_ = Services.historyForDoc(this.ampdoc_);
    this.initializeHistory();

    this.multidocManager_ = new MultidocManager(
      this.win_,
      Services.ampdocServiceFor(this.win_),
      Services.extensionsFor(this.win_),
      Services.timerFor(this.win_)
    );

    this.element_ = element;
    this.separator_ = this.getSeparatorElement_();
    this.moreBox_ = this.getMoreBoxElement_();

    // Have the suggestion box be always visible
    this.element_.appendChild(this.moreBox_);

    if (!this.pages_) {
      this.pages_ = [this.initialPage_];
      this.setLastFetchedPage(this.initialPage_);
    }

    this.getPagesPromise_().then(pages => {
      pages.forEach(page => {
        validatePage(page, this.ampdoc_.getUrl());
        this.pages_.push(
          new Page(this, {url: page.url, title: page.title, image: page.image})
        );
      });
    });

    this.viewport_.onScroll(() => this.updateScroll_());
    this.viewport_.onResize(() => this.updateScroll_());
    this.updateScroll_();
  }

  /**
   * @return {!AmpElement}
   * @private
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
   * Loops through pages and updates their visibility according
   * to their relative position to the viewport
   */
  updateVisibility() {
    this.pages_.forEach((page, index) => {
      if (
        page.relativePos === PageRelativePos.INSIDE_VIEWPORT ||
        page.relativePos === PageRelativePos.CONTAINS_VIEWPORT
      ) {
        if (!page.isVisible()) {
          page.setVisibility(VisibilityState.VISIBLE);
        }
        // Hide the previous pages
        let prevPageIndex = index + this.scrollDirection_;
        while (prevPageIndex >= 0 && prevPageIndex < this.pages_.length) {
          const prevPage = this.pages_[prevPageIndex];
          if (
            prevPage &&
            (prevPage.relativePos === PageRelativePos.LEAVING_VIEWPORT ||
              prevPage.relativePos === PageRelativePos.OUTSIDE_VIEWPORT ||
              prevPage === this.initialPage_) &&
            prevPage.isVisible()
          ) {
            prevPage.setVisibility(VisibilityState.HIDDEN);
          }
          prevPageIndex += this.scrollDirection_;
        }
      } else if (page.relativePos === PageRelativePos.OUTSIDE_VIEWPORT) {
        if (page.isVisible()) {
          page.setVisibility(VisibilityState.HIDDEN);
        }
      }
    });

    // If no page is visible then the host page should be
    if (!this.pages_.some(page => page.isVisible())) {
      this.initialPage_.setVisibility(VisibilityState.VISIBLE);
    }
  }

  /**
   * @return {!PositionObserver}
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
   * @param {!Page} page
   */
  setLastFetchedPage(page) {
    this.lastFetchedPage_ = page;
  }

  /**
   * Sets the title and url of the document to those of
   * the provided page
   * @param {?Page=} page
   */
  setTitlePage(page = this.initialPage_) {
    if (!page) {
      dev().warn(TAG, 'setTitlePage called before next-page-service is built');
      return;
    }
    const {title, url} = page;
    this.win_.document.title = title;
    this.history_.replace({title, url});
  }

  /**
   * Adds an initial entry in history that sub-pages can
   * replace when they become visible
   */
  initializeHistory() {
    const {title, url} = this.initialPage_;
    this.history_.push(undefined /** opt_onPop */, {title, url});
  }

  /**
   *
   * @return {!Page}
   */
  createInitialPage() {
    const doc = this.win_.document;
    const {title, location} = doc;
    const {href: url} = location;
    const image =
      parseSchemaImage(doc) || parseOgImage(doc) || parseFavicon(doc) || '';
    return new Page(
      this,
      {
        url,
        title,
        image,
      },
      PageState.INSERTED /** initState */,
      VisibilityState.VISIBLE /** initVisibility */
    );
  }

  /**
   *
   * @param {!Page} page
   * @param {!Document} doc
   * @return {?../../../src/runtime.ShadowDoc}
   */
  appendAndObservePage(page, doc) {
    // If the user already scrolled to the bottom, prevent rendering
    if (this.getViewportsAway_() <= 1) {
      // TODO(wassgha): Append a "load next article" button
      return null;
    }

    const header = this.win_.document.createElement('div');
    const shadowRoot = this.win_.document.createElement('div');
    const footer = this.win_.document.createElement('div');

    // TODO(wassgha): Unobserve
    this.getPositionObserver_().observe(
      header,
      PositionObserverFidelity.LOW,
      position => page.headerPositionChanged(position)
    );
    this.getPositionObserver_().observe(
      footer,
      PositionObserverFidelity.LOW,
      position => page.footerPositionChanged(position)
    );

    // Handles extension deny-lists and sticky items
    sanitizeDoc(doc);

    // Insert the separator
    this.element_.insertBefore(this.separator_.cloneNode(true), this.moreBox_);

    // Insert the shadow doc and two observer elements
    this.element_.insertBefore(header, this.moreBox_);
    this.element_.insertBefore(shadowRoot, this.moreBox_);
    this.element_.insertBefore(footer, this.moreBox_);

    // Try inserting the shadow document
    try {
      const amp = this.multidocManager_.attachShadowDoc(shadowRoot, doc, '', {
        visibilityState: VisibilityState.PRERENDER,
      });

      const ampdoc = devAssert(amp.ampdoc);
      installStylesForDoc(ampdoc, CSS, null, false, TAG);

      const body = ampdoc.getBody();
      body.classList.add('i-amphtml-next-page-document');

      return amp;
    } catch (e) {
      dev().error(TAG, 'failed to attach shadow document for page', e);
      return null;
    }
  }

  /**
   * @return {number} viewports left to reach the end of the document
   * @private
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
   * @param {Page} desiredPage
   * @return {number} The index of the page.
   */
  getPageIndex_(desiredPage) {
    const pages = dev().assertArray(this.pages_);
    return pages.indexOf(desiredPage);
  }

  /**
   * @param {!Page} page
   * @return {!Promise<!Document>}
   */
  fetchPageDocument(page) {
    return Services.xhrFor(this.win_)
      .fetch(page.url, {ampCors: false})
      .then(response => {
        // Make sure the response is coming from the same origin as the
        // page and update the page's url in case of a redirection
        validateUrl(response.url, this.ampdoc_.getUrl());
        page.url = response.url;

        return response.text();
      })
      .then(html => {
        const doc = this.win_.document.implementation.createHTMLDocument('');
        doc.open();
        doc.write(html);
        doc.close();
        return doc;
      })
      .catch(e => user().error(TAG, 'failed to fetch %s', page.url, e));
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
      // TODO(wassgha): Implement loading pages from a URL
      return Promise.resolve([]);
    }

    // TODO(wassgha): Implement recursively loading pages from subsequent documents
    return Promise.resolve(inlinePages);
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
      user().error(TAG, 'failed to parse inline page list', error);
    });

    return user().assertArray(pages, `${TAG} page list should be an array`);
  }

  /**
   * Reads the developer-provided separator element or defaults
   * to the internal implementation of it
   * @return {!Element}
   * @private
   */
  getSeparatorElement_() {
    const providedSeparator = childElementByAttr(
      this.getNextPageElement_(),
      'amp-next-page-separator'
    );
    // TODO(wassgha): Use templates (amp-mustache) to render the separator
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
   * @return {!Element}
   * @private
   */
  getMoreBoxElement_() {
    const providedMoreBox = childElementByAttr(
      this.getNextPageElement_(),
      'amp-next-page-more-box'
    );
    // TODO(wassgha): Use templates (amp-mustache) to render the more box
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
    // TODO(wassgha): Better default more box
    const moreBox = this.win_.document.createElement('div');
    moreBox.classList.add('amp-next-page-more-box');
    return moreBox;
  }
}
