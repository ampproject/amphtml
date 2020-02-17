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
import {HIDDEN_DOC_CLASS, HostPage, Page, PageState} from './page';
import {MultidocManager} from '../../../src/multidoc-manager';
import {Services} from '../../../src/services';
import {
  UrlReplacementPolicy,
  batchFetchJsonFor,
} from '../../../src/batched-json';
import {VisibilityState} from '../../../src/visibility-state';
import {
  childElementByAttr,
  childElementsByTag,
  insertAfterOrAtStart,
  isJsonScriptTag,
  removeChildren,
  removeElement,
  scopedQuerySelector,
} from '../../../src/dom';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {escapeCssSelectorIdent} from '../../../src/css';
import {htmlFor, htmlRefs} from '../../../src/static-template';
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

const ASYNC_NOOP = () => Promise.resolve();

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

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

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

    /** @private @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win_);

    /** @private {?Element} */
    this.separator_ = null;

    /** @private {?Element} */
    this.footer_ = null;

    /** @private {function():!Promise} */
    this.refreshFooter_ = ASYNC_NOOP;

    /** @private {boolean} */
    this.finished_ = false;

    /** @private {?AmpElement} element */
    this.host_ = null;

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

    /** @private {boolean} */
    this.hasDeepParsing_ = false;

    /** @private {?string} */
    this.nextSrc_ = null;

    /** @private {?function()} */
    this.readyResolver_ = null;

    /** @private @const {!Promise} */
    this.readyPromise_ = new Promise(resolve => {
      this.readyResolver_ = resolve;
    });
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
   * @param {!AmpElement} element <amp-next-page> element on the host page
   */
  build(element) {
    // Prevent multiple amp-next-page on the same document
    if (this.isBuilt()) {
      return;
    }

    // Save the <amp-next-page> from the host page
    this.host_ = element;

    // Get the separator and more box (and remove the provided elements in the process)
    this.separator_ = this.getSeparatorElement_(element);
    this.footer_ = this.getFooterElement_(element);

    // Create a reference to the host page
    this.hostPage_ = this.createHostPage();
    this.toggleHiddenAndReplaceableElements(this.doc_);

    this.history_ = Services.historyForDoc(this.ampdoc_);
    this.initializeHistory();

    this.multidocManager_ = new MultidocManager(
      this.win_,
      Services.ampdocServiceFor(this.win_),
      Services.extensionsFor(this.win_),
      Services.timerFor(this.win_)
    );
    this.visibilityObserver_ = new VisibilityObserver(this.ampdoc_);

    if (!this.pages_) {
      this.pages_ = [this.hostPage_];
      this.setLastFetchedPage(this.hostPage_);
    }

    // Have the footer be always visible
    insertAfterOrAtStart(this.host_, this.footer_, null /** after */);

    this.nextSrc_ = this.getHost_().getAttribute('src');
    this.hasDeepParsing_ =
      this.getHost_().hasAttribute('deep-parsing') || !this.nextSrc_;
    this.initializePageQueue_();

    this.getHost_().classList.add(NEXT_PAGE_CLASS);

    this.viewport_.onScroll(() => this.updateScroll_());
    this.viewport_.onResize(() => this.updateScroll_());
    this.updateScroll_();
  }

  /**
   * @return {!AmpElement}
   * @private
   */
  getHost_() {
    return dev().assertElement(this.host_);
  }

  /**
   * @private
   */
  updateScroll_() {
    this.updateScrollDirection_();
    if (this.finished_) {
      return;
    }
    this.readyPromise_.then(() => {
      this.maybeFetchNext();
    });
  }

  /**
   * @param {boolean=} force
   * @return {!Promise}
   */
  maybeFetchNext(force = false) {
    devAssert(!this.finished_);

    // If a page is already queued to be fetched, wait for it
    if (this.pages_.some(page => page.is(PageState.FETCHING))) {
      return Promise.resolve();
    }
    // If we're still too far from the bottom, early return
    if (this.getViewportsAway_() > PRERENDER_VIEWPORT_COUNT && !force) {
      return Promise.resolve();
    }

    const pageCount = this.pages_.length;
    const nextPage = this.pages_[this.getPageIndex_(this.lastFetchedPage_) + 1];
    if (nextPage) {
      return nextPage.fetch().then(() => {
        if (nextPage.is(PageState.FAILED)) {
          // Silently skip this page and get the footer ready in case
          // this page is the last one
          this.setLastFetchedPage(nextPage);
          return this.refreshFooter_();
        }
      });
    }

    // Attempt to get more pages
    return (
      this.getRemotePages_()
        .then(pages => this.queuePages_(pages))
        // Queuing pages can result in no new pages (in case the server
        // returned an empty array or the suggestions already exist in the queue)
        .then(() => {
          if (this.pages_.length <= pageCount) {
            // Remote server did not return any new pages, update the footer and lock the state
            this.finished_ = true;
            return this.refreshFooter_();
          }
          return this.maybeFetchNext(true /** force */);
        })
    );
  }

  /**
   * Loops through pages and updates their visibility according
   * to their relative position to the viewport
   */
  updateVisibility() {
    this.pages_.forEach((page, index) => {
      if (
        page.relativePos === ViewportRelativePos.OUTSIDE_VIEWPORT &&
        page.isVisible()
      ) {
        page.setVisibility(VisibilityState.HIDDEN);
      } else {
        if (!page.isVisible()) {
          page.setVisibility(VisibilityState.VISIBLE);
        }
        this.hidePreviousPages_(index);
        this.resumePausedPages_(index);
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
          // Pages that are outside of the viewport should be hidden
          return page.relativePos === ViewportRelativePos.OUTSIDE_VIEWPORT;
        })
        .map((page, away) => {
          // Hide all pages whose visibility state have changed to hidden
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
   * @return {!Promise}
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
      .filter(page => page.is(PageState.PAUSED));

    return Promise.all(nearViewportPages.map(page => page.resume()));
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
    this.doc_.title = title;
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
    const {title, location} = this.doc_;
    const {href: url} = location;
    const image =
      parseSchemaImage(this.doc_) ||
      parseOgImage(this.doc_) ||
      parseFavicon(this.doc_) ||
      '';
    return new HostPage(
      this,
      {
        url,
        title: title || '',
        image,
      },
      PageState.INSERTED /** initState */,
      VisibilityState.VISIBLE /** initVisibility */,
      this.doc_ /** initDoc */
    );
  }

  /**
   * Create a container element for the document and insert it into
   * the amp-next-page element
   * @param {!Page} page
   * @return {!Element}
   */
  createDocumentContainerForPage(page) {
    const container = this.doc_.createElement('div');
    container.classList.add(DOC_CONTAINER_CLASS);
    this.host_.insertBefore(container, dev().assertElement(this.footer_));

    // Insert the document
    const shadowRoot = this.doc_.createElement('div');
    shadowRoot.classList.add(SHADOW_ROOT_CLASS);
    container.appendChild(shadowRoot);

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
   * @return {!Promise<?../../../src/runtime.ShadowDoc>}
   */
  attachDocumentToPage(page, content, force = false) {
    // If the user already scrolled to the bottom, prevent rendering
    if (this.getViewportsAway_() < NEAR_BOTTOM_VIEWPORT_COUNT && !force) {
      // TODO(wassgha): Append a "load next article" button?
      return Promise.resolve();
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
      devAssert(page.is(PageState.PAUSED));
      const placeholder = dev().assertElement(
        scopedQuerySelector(
          container,
          `> .${escapeCssSelectorIdent(PLACEHOLDER_CLASS)}`
        ),
        'Paused page does not have a placeholder'
      );

      shadowRoot = this.doc_.createElement('div');
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

      // Insert the separator
      const separatorInstance = this.separator_.cloneNode(true);
      insertAfterOrAtStart(container, separatorInstance, null /** after */);
      const separatorPromise = this.maybeRenderSeparatorTemplate_(
        separatorInstance,
        page
      );

      return separatorPromise.then(() => amp);
    } catch (e) {
      dev().error(TAG, 'failed to attach shadow document for page', e);
      return Promise.resolve();
    }
  }

  /**
   * Closes the shadow document of an inserted page and replaces it
   * with a placeholder
   * @param {!Page} page
   * @return {!Promise}
   */
  closeDocument(page) {
    if (page.is(PageState.PAUSED)) {
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
    const placeholder = this.doc_.createElement('div');
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
      if (this.hasDeepParsing_) {
        const pages = this.getInlinePages_(el);
        this.queuePages_(pages);
      }
      removeElement(el);
    });

    // Mark document as hidden initially
    doc.body.classList.add(HIDDEN_DOC_CLASS);

    // Make sure all hidden elements are initially invisible
    this.toggleHiddenAndReplaceableElements(doc, false /** isVisible */);
  }

  /**
   * Hides or shows elements based on the `next-page-hide` and
   * `next-page-replace` attributes
   * @param {!Document|!ShadowRoot} doc Document to attach.
   * @param {boolean=} isVisible Whether this page is visible or not
   */
  toggleHiddenAndReplaceableElements(doc, isVisible = true) {
    // Hide elements that have [next-page-hide] on child documents
    if (doc !== this.hostPage_.document) {
      toArray(doc.querySelectorAll('[next-page-hide]')).forEach(element =>
        toggle(element, false /** opt_display */)
      );
    }

    // Element replacing is only concerned with the visible page
    if (!isVisible) {
      return;
    }

    // Replace elements that have [next-page-replace]
    toArray(
      doc.querySelectorAll('*:not(amp-next-page) [next-page-replace]')
    ).forEach(element => {
      let uniqueId = element.getAttribute('next-page-replace');
      if (!uniqueId) {
        uniqueId = String(Date.now() + Math.floor(Math.random() * 100));
        element.setAttribute('next-page-replace', uniqueId);
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
        const doc = this.doc_.implementation.createHTMLDocument('');
        doc.open();
        doc.write(html);
        doc.close();
        return doc;
      })
      .catch(e => {
        user().error(TAG, 'failed to fetch %s', page.url, e);
        throw e;
      });
  }

  /**
   * Parses the amp-next-page element for inline or remote list of pages and
   * adds them to the queue
   * @private
   * @return {!Promise}
   */
  initializePageQueue_() {
    const inlinePages = this.getInlinePages_(this.getHost_());
    userAssert(
      inlinePages || this.nextSrc_,
      '%s should contain a <script> child or a URL specified in [src]',
      TAG
    );
    return this.getRemotePages_()
      .then(remotePages => [].concat(inlinePages, remotePages))
      .then(pages => {
        if (pages.length === 0) {
          user().warn(TAG, 'Could not find recommendations');
          return Promise.resolve();
        }
        return this.queuePages_(pages).then(() => {
          // Render the initial footer template with all pages
          this.refreshFooter_();
          // Mark the page as ready
          this.readyResolver_();
        });
      });
  }

  /**
   * Add the provided page metadata into the queue of
   * pages to fetch
   * @param {!Array<!./page.PageMeta>} pages
   * @return {!Promise}
   */
  queuePages_(pages) {
    if (!pages.length || this.finished_) {
      return Promise.resolve();
    }
    // Queue the given pages
    pages.forEach(meta => {
      try {
        validatePage(meta, this.ampdoc_.getUrl());
        // Prevent loops by checking if the page already exists
        // we use initialUrl since the url can get updated if
        // the page issues a redirect
        if (this.pages_.some(page => page.initialUrl == meta.url)) {
          return;
        }
        // Queue the page for fetching
        this.pages_.push(new Page(this, meta));
      } catch (e) {
        user().error(TAG, 'Failed to queue page due to error:', e);
      }
    });

    // To be safe, if the pages were parsed after the user
    // finished scrolling
    return this.maybeFetchNext();
  }

  /**
   * Reads the inline next pages from the element.
   * @param {!Element} element the container of the amp-next-page extension
   * @return {!Array<!./page.PageMeta>} JSON object
   * @private
   */
  getInlinePages_(element) {
    const scriptElements = childElementsByTag(element, 'SCRIPT');
    if (!scriptElements.length) {
      return [];
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

    const parsed = tryParseJson(scriptElement.textContent, error => {
      user().error(TAG, 'failed to parse inline page list', error);
    });

    const pages = /** @type {!Array<!./page.PageMeta>} */ (user().assertArray(
      parsed,
      `${TAG} Page list expected an array, found: ${typeof parsed}`
    ));

    removeElement(scriptElement);
    return pages;
  }

  /**
   * Fetches the next batch of page recommendations from the server (initially
   * specified by the [src] attribute then obtained as a next pointer)
   * @return {!Promise<!Array<!./page.PageMeta>>} Page information promise
   * @private
   */
  getRemotePages_() {
    if (!this.nextSrc_) {
      return Promise.resolve([]);
    }
    return batchFetchJsonFor(this.ampdoc_, this.getHost_(), {
      urlReplacement: UrlReplacementPolicy.ALL,
      xssiPrefix: this.getHost_().getAttribute('xssi-prefix') || undefined,
    })
      .then(result => {
        this.nextSrc_ = result['next'] || null;
        if (this.nextSrc_) {
          this.getHost_().setAttribute('src', this.nextSrc_);
        }
        return result['pages'] || [];
      })
      .catch(error =>
        user().error(TAG, 'error fetching page list from remote server', error)
      );
  }

  /**
   * Reads the developer-provided separator element or defaults
   * to the internal implementation of it
   * @param {!Element} element the container of the amp-next-page extension
   * @return {!Element}
   * @private
   */
  getSeparatorElement_(element) {
    const providedSeparator = childElementByAttr(element, 'separator');
    if (providedSeparator) {
      removeElement(providedSeparator);
      return providedSeparator;
    }
    // If no separator is provided, we build a default one
    return this.buildDefaultSeparator_();
  }

  /**
   * @return {!Element}
   * @private
   */
  buildDefaultSeparator_() {
    const html = htmlFor(this.getHost_());
    return html`
      <div
        class="amp-next-page-separator"
        aria-label="Next article separator"
      ></div>
    `;
  }

  /**
   * Renders the template inside the separator element using
   * data from the current article (if a template is present)
   * otherwise rehydrates the default separator
   *
   * @param {!Element} separator
   * @param {!Page} page
   * @return {!Promise}
   */
  maybeRenderSeparatorTemplate_(separator, page) {
    if (!this.templates_.hasTemplate(separator)) {
      return Promise.resolve();
    }

    const data = /** @type {!JsonObject} */ ({
      title: page.title,
      url: page.url,
      image: page.image,
    });

    return this.templates_
      .findAndRenderTemplate(separator, data)
      .then(rendered => {
        return this.mutator_.mutateElement(separator, () => {
          removeChildren(dev().assertElement(separator));
          separator.appendChild(rendered);
        });
      });
  }

  /**
   * @param {!Element} element the container of the amp-next-page extension
   * @return {!Element}
   * @private
   */
  getFooterElement_(element) {
    const providedFooter = childElementByAttr(element, 'footer');
    if (providedFooter) {
      this.refreshFooter_ = this.templates_.hasTemplate(providedFooter)
        ? () => this.renderFooterTemplate_()
        : ASYNC_NOOP;
      removeElement(providedFooter);
      return providedFooter;
    }
    // If no footer is provided then we build a default one
    this.refreshFooter_ = () => this.refreshDefaultFooter_();
    return this.buildDefaultFooter_();
  }

  /**
   * @return {!Element}
   * @private
   */
  buildDefaultFooter_() {
    const html = htmlFor(this.getHost_());
    return html`
      <div class="amp-next-page-footer" aria-label="Read more articles"></div>
    `;
  }

  /**
   * Renders the template inside the footer element using
   * data from the current articles
   *
   * @return {!Promise}
   */
  renderFooterTemplate_() {
    const footer = dev().assertElement(this.footer_);
    devAssert(this.templates_.hasTemplate(footer));

    const data = /** @type {!JsonObject} */ ({
      pages: (this.pages_ || [])
        .filter(page => !page.isLoaded() && !page.is(PageState.FETCHING))
        .map(page => ({
          title: page.title,
          url: page.url,
          image: page.image,
        })),
    });

    // Re-render templated footer (if needed)
    return this.templates_
      .findAndRenderTemplate(footer, data)
      .then(rendered => {
        return this.mutator_.mutateElement(footer, () => {
          removeChildren(dev().assertElement(footer));
          footer.appendChild(rendered);
        });
      });
  }

  /**
   * Renders the template inside the footer element using
   * data from the current articles (if a template is present)
   * otherwise rehydrates the default footer element
   *
   * @return {!Promise}
   */
  refreshDefaultFooter_() {
    const footer = dev().assertElement(this.footer_);
    const data = /** @type {!JsonObject} */ ({
      pages: (this.pages_ || [])
        .filter(page => !page.isLoaded() && !page.is(PageState.FETCHING))
        .map(page => ({
          title: page.title,
          url: page.url,
          image: page.image,
        })),
    });

    const html = htmlFor(this.getHost_());
    const content = this.doc_.createElement('div');
    content.classList.add('amp-next-page-footer-content');

    data['pages'].forEach(page => {
      const article = html`
        <a class="amp-next-page-footer-article">
          <img ref="image" class="amp-next-page-footer-image" />
          <span ref="title" class="amp-next-page-footer-title"></span>
        </a>
      `;
      const {image, title} = htmlRefs(article);
      image.src = page.image;
      title.textContent = page.title;
      article.href = page.url;

      content.appendChild(article);
    });

    return this.mutator_.mutateElement(footer, () => {
      removeChildren(dev().assertElement(footer));
      footer.appendChild(content);
    });
  }
}
