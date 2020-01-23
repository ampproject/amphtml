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

import {CSS} from '../../../build/amp-next-page-1.0.css';
import {HostPage, Page, PageState} from './page';
import {MultidocManager} from '../../../src/multidoc-manager';
import {Services} from '../../../src/services';
import {VisibilityState} from '../../../src/visibility-state';
import {
  childElementByAttr,
  childElementsByTag,
  isJsonScriptTag,
  removeElement,
  scopedQuerySelector,
} from '../../../src/dom';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {escapeCssSelectorIdent} from '../../../src/css';
import {installStylesForDoc} from '../../../src/style-installer';
import {
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
} from '../../../src/mediasession-helper';
import {setStyles, toggle} from '../../../src/style';
import {toArray} from '../../../src/types';
import {tryParseJson} from '../../../src/json';
import {validatePage, validateUrl} from './utils';
import VisibilityObserver, {ViewportRelativePos} from './visibility-observer';

const TAG = 'amp-next-page';
const PRERENDER_VIEWPORT_COUNT = 3;
const NEAR_BOTTOM_VIEWPORT_COUNT = 1;
const PAUSE_PAGE_COUNT = 5;

const NEXT_PAGE_CLASS = 'i-amphtml-next-page';
const DOC_CLASS = 'i-amphtml-next-page-document';
const DOC_CONTAINER_CLASS = 'i-amphtml-next-page-document-container';
const SHADOW_ROOT_CLASS = 'i-amphtml-next-page-shadow-root';
const PLACEHOLDER_CLASS = 'i-amphtml-next-page-placeholder';

/** @enum */
export const Direction = {UP: 1, DOWN: -1};

export class NextPageService {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Window} */
    this.win_ = ampdoc.win;

    /**
     * @private
     * @const {!../../../src/service/viewport/viewport-interface.ViewportInterface}
     */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /**
     * @private
     * @const {!../../../src/service/mutator-interface.MutatorInterface}
     */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    /** @private {?Element} */
    this.separator_ = null;

    /** @private {?Element} */
    this.moreBox_ = null;

    /** @private {?AmpElement} element */
    this.element_ = null;

    /** @private {?VisibilityObserver} */
    this.visibilityObserver_ = null;

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
    this.hostPage_ = null;

    /** @private {!Object<string, !Element>} */
    this.replaceableElements_ = {};
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
    // Prevent multiple amp-next-page on the same document
    if (this.isBuilt()) {
      return;
    }

    this.element_ = element;

    // Get the separator and more box (and remove the provided elements in the process)
    this.separator_ = this.getSeparatorElement_(element);
    this.moreBox_ = this.getMoreBoxElement_(element);

    // Create a reference to the host page
    this.hostPage_ = this.createHostPage();
    this.toggleHiddenAndReplaceableElements(this.win_.document);

    this.history_ = Services.historyForDoc(this.ampdoc_);
    this.initializeHistory();

    this.multidocManager_ = new MultidocManager(
      this.win_,
      Services.ampdocServiceFor(this.win_),
      Services.extensionsFor(this.win_),
      Services.timerFor(this.win_)
    );
    this.visibilityObserver_ = new VisibilityObserver(this.ampdoc_);

    // Have the suggestion box be always visible
    this.element_.appendChild(this.moreBox_);

    if (!this.pages_) {
      this.pages_ = [this.hostPage_];
      this.setLastFetchedPage(this.hostPage_);
    }

    this.parseAndQueuePages_();

    this.getHostNextPageElement_().classList.add(NEXT_PAGE_CLASS);

    this.viewport_.onScroll(() => this.updateScroll_());
    this.viewport_.onResize(() => this.updateScroll_());
    this.updateScroll_();
  }

  /**
   * @return {!AmpElement}
   * @private
   */
  getHostNextPageElement_() {
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
   * @return {!Promise}
   */
  maybeFetchNext(force = false) {
    // If a page is already queued to be fetched, wait for it
    if (this.pages_.some(page => page.isFetching())) {
      return Promise.resolve();
    }
    // If we're still too far from the bottom, early return
    if (this.getViewportsAway_() > PRERENDER_VIEWPORT_COUNT && !force) {
      return Promise.resolve();
    }

    const nextPage = this.pages_[this.getPageIndex_(this.lastFetchedPage_) + 1];
    if (!nextPage) {
      return Promise.resolve();
    }
    return nextPage.fetch();
  }

  /**
   * Loops through pages and updates their visibility according
   * to their relative position to the viewport
   */
  updateVisibility() {
    this.pages_.forEach((page, index) => {
      if (
        page.relativePos === ViewportRelativePos.INSIDE_VIEWPORT ||
        page.relativePos === ViewportRelativePos.CONTAINS_VIEWPORT
      ) {
        if (!page.isVisible()) {
          page.setVisibility(VisibilityState.VISIBLE);
        }
        this.hidePreviousPages_(index);
        this.resumePausedPages_(index);
      } else if (page.relativePos === ViewportRelativePos.OUTSIDE_VIEWPORT) {
        if (page.isVisible()) {
          page.setVisibility(VisibilityState.HIDDEN);
        }
      }
    });

    // If no page is visible then the host page should be
    if (!this.pages_.some(page => page.isVisible())) {
      this.hostPage_.setVisibility(VisibilityState.VISIBLE);
    }

    // Hide elements if necessary
    this.pages_
      .filter(page => page.isVisible())
      .forEach(page =>
        this.toggleHiddenAndReplaceableElements(
          /** @type {!Document|!ShadowRoot} */ (devAssert(page.document))
        )
      );
  }

  /**
   * Makes sure that all pages preceding the current page are
   * marked hidden if they are out of the viewport and additionally
   * paused if they are too far from the current page
   * @param {number} index index of the page to start at
   * @param {number=} pausePageCountForTesting
   * @return {!Promise}
   * @private
   */
  hidePreviousPages_(index, pausePageCountForTesting) {
    // The distance (in pages) to the currently visible page after which
    // we start unloading pages from memory
    const pausePageCount =
      pausePageCountForTesting === undefined
        ? PAUSE_PAGE_COUNT
        : pausePageCountForTesting;

    const scrollingDown = this.scrollDirection_ === Direction.DOWN;
    // Hide the host (first) page if needed
    if (scrollingDown && this.hostPage_.isVisible()) {
      this.hostPage_.setVisibility(VisibilityState.HIDDEN);
    }

    // Get all the pages that the user scrolled past (or didn't see yet)
    const previousPages = scrollingDown
      ? this.pages_.slice(1, index).reverse()
      : this.pages_.slice(index + 1);

    // Find the ones that should be hidden (no longer inside the viewport)
    return Promise.all(
      previousPages
        .filter(page => {
          const shouldHide =
            page.relativePos === ViewportRelativePos.LEAVING_VIEWPORT ||
            page.relativePos === ViewportRelativePos.OUTSIDE_VIEWPORT;
          return shouldHide;
        })
        .map((page, away) => {
          // Hide all pages that are in the viewport
          if (page.isVisible()) {
            page.setVisibility(VisibilityState.HIDDEN);
          }
          // Pause those that are too far away
          if (away >= pausePageCount) {
            return page.pause();
          }
        })
    );
  }

  /**
   * Makes sure that all pages that are a few pages away from the
   * currently visible page are re-inserted (if paused) and
   * ready to become visible soon
   * @param {number} index index of the page to start at
   * @param {number=} pausePageCountForTesting
   * @private
   */
  resumePausedPages_(index, pausePageCountForTesting) {
    // The distance (in pages) to the currently visible page after which
    // we start unloading pages from memory
    const pausePageCount =
      pausePageCountForTesting === undefined
        ? PAUSE_PAGE_COUNT
        : pausePageCountForTesting;

    // Get all the pages that should be resumed
    const nearViewportPages = this.pages_
      .slice(1) // Ignore host page
      .slice(
        Math.max(0, index - pausePageCount - 1),
        Math.min(this.pages_.length, index + pausePageCount + 1)
      )
      .filter(page => page.isPaused());

    nearViewportPages.forEach(page => page.resume());
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
  setTitlePage(page = this.hostPage_) {
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
    const {title, url} = this.hostPage_;
    this.history_.push(undefined /** opt_onPop */, {title, url});
  }

  /**
   * Creates the initial (host) page based on the window's metadata
   * @return {!Page}
   */
  createHostPage() {
    const doc = this.win_.document;
    const {title, location} = doc;
    const {href: url} = location;
    const image =
      parseSchemaImage(doc) || parseOgImage(doc) || parseFavicon(doc) || '';
    return new HostPage(
      this,
      {
        url,
        title,
        image,
      },
      PageState.INSERTED /** initState */,
      VisibilityState.VISIBLE /** initVisibility */,
      doc /** initDoc */
    );
  }

  /**
   * Create a container element for the document and insert it into
   * the amp-next-page element
   * @param {!Page} page
   * @return {!Element}
   */
  createDocumentContainerForPage(page) {
    const container = this.win_.document.createElement('div');
    container.classList.add(DOC_CONTAINER_CLASS);

    const shadowRoot = this.win_.document.createElement('div');
    shadowRoot.classList.add(SHADOW_ROOT_CLASS);
    container.appendChild(shadowRoot);

    // Insert the separator
    container.appendChild(this.separator_.cloneNode(true));

    // Insert the container
    this.element_.insertBefore(container, this.moreBox_);

    // Observe this page's visibility
    this.visibilityObserver_.observe(
      shadowRoot /** element */,
      container /** parent */,
      position => {
        page.relativePos = position;
        this.updateVisibility();
      }
    );

    return container;
  }

  /**
   * Appends the given document to the host page and installs
   * a visibility observer to monitor it
   * @param {!Page} page
   * @param {!Document} content
   * @param {boolean=} force
   * @return {?../../../src/runtime.ShadowDoc}
   */
  attachDocumentToPage(page, content, force = false) {
    // If the user already scrolled to the bottom, prevent rendering
    if (this.getViewportsAway_() <= NEAR_BOTTOM_VIEWPORT_COUNT && !force) {
      // TODO(wassgha): Append a "load next article" button?
      return null;
    }

    const container = dev().assertElement(page.container);
    let shadowRoot = scopedQuerySelector(
      container,
      `> .${escapeCssSelectorIdent(SHADOW_ROOT_CLASS)}`
    );

    // Page has previously been deactivated so the shadow root
    // will need to replace placeholder
    // TODO(wassgha) This wouldn't be needed once we can resume a ShadowDoc
    if (!shadowRoot) {
      devAssert(page.isPaused());
      const placeholder = dev().assertElement(
        scopedQuerySelector(
          container,
          `> .${escapeCssSelectorIdent(PLACEHOLDER_CLASS)}`
        ),
        'Paused page does not have a placeholder'
      );

      shadowRoot = this.win_.document.createElement('div');
      shadowRoot.classList.add(SHADOW_ROOT_CLASS);

      container.replaceChild(shadowRoot, placeholder);
    }

    // Handles extension deny-lists
    this.sanitizeDoc(content);

    // Try inserting the shadow document
    try {
      const amp = this.multidocManager_.attachShadowDoc(
        shadowRoot,
        content,
        '',
        {
          visibilityState: VisibilityState.PRERENDER,
        }
      );

      const ampdoc = devAssert(amp.ampdoc);
      installStylesForDoc(ampdoc, CSS, null, false, TAG);

      const body = ampdoc.getBody();
      body.classList.add(DOC_CLASS);

      return amp;
    } catch (e) {
      dev().error(TAG, 'failed to attach shadow document for page', e);
      return null;
    }
  }

  /**
   * Closes the shadow document of an inserted page and replaces it
   * with a placeholder
   * @param {!Page} page
   * @return {!Promise}
   */
  closeDocument(page) {
    if (page.isPaused()) {
      return Promise.resolve();
    }

    const container = dev().assertElement(page.container);
    const shadowRoot = dev().assertElement(
      scopedQuerySelector(
        container,
        `> .${escapeCssSelectorIdent(SHADOW_ROOT_CLASS)}`
      )
    );

    // Create a placeholder that gets displayed when the document becomes inactive
    const placeholder = this.win_.document.createElement('div');
    placeholder.classList.add(PLACEHOLDER_CLASS);

    let docHeight = 0;
    let docWidth = 0;
    return this.mutator_.measureMutateElement(
      shadowRoot,
      () => {
        docHeight = shadowRoot./*REVIEW*/ offsetHeight;
        docWidth = shadowRoot./*REVIEW*/ offsetWidth;
      },
      () => {
        setStyles(placeholder, {
          'height': `${docHeight}px`,
          'width': `${docWidth}px`,
        });
        container.replaceChild(placeholder, shadowRoot);
      }
    );
  }

  /**
   * Removes redundancies and unauthorized extensions and elements
   * @param {!Document} doc Document to attach.
   */
  sanitizeDoc(doc) {
    // TODO(wassgha): Allow amp-analytics after bug bash
    toArray(doc.querySelectorAll('amp-analytics')).forEach(removeElement);

    // Parse for more pages and queue them
    toArray(doc.querySelectorAll('amp-next-page')).forEach(el => {
      this.parseAndQueuePages_(el);
      removeElement(el);
    });

    // Make sure all hidden elements are initially invisible
    this.toggleHiddenAndReplaceableElements(doc, false /** isVisible */);
  }

  /**
   * Hides or shows elements based on the `amp-next-page-hide` and
   * `amp-next-page-replace` attributes
   * @param {!Document|!ShadowRoot} doc Document to attach.
   * @param {boolean=} isVisible Whether this page is visible or not
   */
  toggleHiddenAndReplaceableElements(doc, isVisible = true) {
    // Hide elements that have [amp-next-page-hide] on child documents
    if (doc !== this.hostPage_.document) {
      toArray(doc.querySelectorAll('[amp-next-page-hide]')).forEach(element =>
        toggle(element, false /** opt_display */)
      );
    }

    // Element replacing is only concerned with the visible page
    if (!isVisible) {
      return;
    }

    // Replace elements that have [amp-next-page-replace]
    toArray(
      doc.querySelectorAll('*:not(amp-next-page) [amp-next-page-replace]')
    ).forEach(element => {
      let uniqueId = element.getAttribute('amp-next-page-replace');
      if (!uniqueId) {
        uniqueId = String(Date.now() + Math.floor(Math.random() * 100));
        element.setAttribute('amp-next-page-replace', uniqueId);
      }

      if (
        this.replaceableElements_[uniqueId] &&
        this.replaceableElements_[uniqueId] !== element
      ) {
        toggle(this.replaceableElements_[uniqueId], false /** opt_display */);
      }
      this.replaceableElements_[uniqueId] = element;
      toggle(element, true /** opt_display */);
    });
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
   * Parses the amp-next-page element for inline or remote list of pages and
   * add them to the queue
   * @param {!Element=} element the container of the amp-next-page extension
   * @private
   */
  parseAndQueuePages_(element = this.getHostNextPageElement_()) {
    this.parsePages_(element).then(pages => {
      pages.forEach(page => {
        try {
          validatePage(page, this.ampdoc_.getUrl());
          // Prevent loops by checking if the page already exists
          // we use initialUrl since the url can get updated if
          // the page issues a redirect
          if (this.pages_.some(p => p.initialUrl == page.url)) {
            return;
          }
          // Queue the page for fetching
          this.pages_.push(
            new Page(this, {
              url: page.url,
              title: page.title,
              image: page.image,
            })
          );
        } catch (e) {
          user().error(TAG, 'Failed to queue page', e);
        }
      });
      // To be safe, if the pages were parsed after the user
      // finished scrolling
      this.maybeFetchNext();
    });
  }

  /**
   * @param {!Element} element the container of the amp-next-page extension
   * @return {!Promise<Array>} List of pages to fetch
   * @private
   */
  parsePages_(element) {
    const inlinePages = this.getInlinePages_(element);
    const src = element.getAttribute('src');
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
   * @param {!Element} element the container of the amp-next-page extension
   * @return {?Array} JSON object, or null if no inline pages specified.
   * @private
   */
  getInlinePages_(element) {
    const scriptElements = childElementsByTag(element, 'SCRIPT');
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
   * @param {!Element} element the container of the amp-next-page extension
   * @return {!Element}
   * @private
   */
  getSeparatorElement_(element) {
    const providedSeparator = childElementByAttr(
      element,
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
   * @param {!Element} element the container of the amp-next-page extension
   * @return {!Element}
   * @private
   */
  getMoreBoxElement_(element) {
    const providedMoreBox = childElementByAttr(
      element,
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
