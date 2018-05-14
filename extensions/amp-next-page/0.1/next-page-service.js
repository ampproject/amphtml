/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-next-page-0.1.css';
import {MultidocManager} from '../../../src/runtime';
import {PositionObserverFidelity} from '../../../src/service/position-observer/position-observer-worker';
import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {getAmpdoc, getServiceForDoc} from '../../../src/service';
import {
  installPositionObserverServiceForDoc,
} from '../../../src/service/position-observer/position-observer-impl';
import {installStylesForDoc} from '../../../src/style-installer';
import {layoutRectLtwh} from '../../../src/layout-rect';
import {parseUrl} from '../../../src/url';
import {setStyle} from '../../../src/style';
import {triggerAnalyticsEvent} from '../../../src/analytics';

// TODO(emarchiori): Make this a configurable parameter.
const SEPARATOR_RECOS = 3;

const MAX_ARTICLES = 2;

const PRERENDER_VIEWPORT_COUNT = 3;

const TAG = 'amp-next-page';

/**
 * @typedef {{
 *   ampUrl: string,
 *   amp: ?Object,
 *   recUnit: ?Element,
 *   cancelled: boolean
 * }}
 */
export let DocumentRef;

/**
 * Window-scoped service to handle the amp-next-page lifecycle. Handles all
 * events and page lifecycle for the first {@code AmpNextPage} element
 * registered. All subsequent registrations will be ignored.
 */
export class NextPageService {
  constructor() {
    /** @private {?Window} */
    this.win_ = null;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?./config.AmpNextPageConfig} */
    this.config_ = null;

    /** @private {string} */
    this.hideSelector_;

    /** @private {?Element} */
    this.separator_ = null;

    /** @private {?../../../src/service/resources-impl.Resources} */
    this.resources_ = null;

    /** @private {?MultidocManager} */
    this.multidocManager_ = null;

    /** @private {number} */
    this.nextArticle_ = 0;

    /** @private {boolean} */
    this.documentQueued_ = false;

    /** @private {?../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = null;

    /** @private {?../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = null;

    /**
     * @private
     * {?../../../../src/service/position-observer/position-observer-impl.PositionObserver}
     */
    this.positionObserver_ = null;

    /** @private @const {!Array<!DocumentRef>} */
    this.documentRefs_ = [];

    /** @private {?DocumentRef} */
    this.activeDocumentRef_ = null;

    /** @private {function(!Element)} */
    this.appendPageHandler_ = () => {};
  }

  /** Returns true if the service has already been initialized. */
  isActive() {
    return this.config_ !== null;
  }

  /**
   * Registers the window-scoped service against the specified {@code
   * recommendationsOb}. Only the first call to this method will be used, any
   * subsequent calls will be ignored.
   * @param {!Element} element {@link AmpNextPage} element.
   * @param {!./config.AmpNextPageConfig} config Element configuration.
   * @param {?Element} separator Separator element to display between pages. If
   *     none is specified a default hairline separator will be used.
   */
  register(element, config, separator) {
    if (this.isActive()) {
      return;
    }

    const ampDoc = getAmpdoc(element);
    const win = ampDoc.win;

    this.config_ = config;
    this.win_ = win;
    this.separator_ = separator || this.createDivider_();
    this.element_ = element;

    if (this.config_.hideSelectors) {
      this.hideSelector_ = this.config_.hideSelectors.join(',');
    }

    this.viewer_ = Services.viewerForDoc(ampDoc);
    this.viewport_ = Services.viewportForDoc(ampDoc);
    this.resources_ = Services.resourcesForDoc(ampDoc);
    this.multidocManager_ =
        new MultidocManager(win, Services.ampdocServiceFor(win),
          Services.extensionsFor(win), Services.timerFor(win));

    installPositionObserverServiceForDoc(ampDoc);
    this.positionObserver_ = getServiceForDoc(ampDoc, 'position-observer');

    this.documentRefs_.push({
      ampUrl: win.document.location.href,
      amp: {title: win.document.title},
      recUnit: null,
      cancelled: false,
    });
    this.activeDocumentRef_ = this.documentRefs_[0];

    this.viewport_.onScroll(() => this.scrollHandler_());
    this.viewport_.onResize(() => this.scrollHandler_());

    // Check scroll position immediately to handle documents which are shorter
    // than the viewport.
    this.scrollHandler_();
  }

  /**
   * Sets the handler to be called with a
   * @param {function(!Element)} handler Handler to be called when a new page
   *     needs adding to the DOM, with a container element for that page.
   */
  setAppendPageHandler(handler) {
    this.appendPageHandler_ = handler;
  }

  /**
   * Attach a ShadowDoc using the given document.
   * @param {!Element} shadowRoot Root element to attach the shadow document to.
   * @param {!Document} doc Document to attach.
   * @return {?Object} Return value of {@link MultidocManager#attachShadowDoc}
   */
  attachShadowDoc_(shadowRoot, doc) {
    if (this.hideSelector_) {
      const elements = doc.querySelectorAll(this.hideSelector_);
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add('i-amphtml-next-page-hidden');
      }
    }

    const amp =
        this.multidocManager_.attachShadowDoc(shadowRoot, doc, '', {});
    installStylesForDoc(amp.ampdoc, CSS, null, false, TAG);

    const body = amp.ampdoc.getBody();
    body.classList.add('i-amphtml-next-page-document');

    return amp;
  }

  /**
   * Creates a divider between two recommendations or articles.
   * @return {!Element}
   */
  createDivider_() {
    const topDivision = this.win_.document.createElement('div');
    topDivision.classList.add('amp-next-page-division');
    return topDivision;
  }

  /**
   * Append a new article if still possible.
   */
  appendNextArticle_() {
    if (this.nextArticle_ < MAX_ARTICLES &&
        this.nextArticle_ < this.config_.pages.length) {
      const next = this.config_.pages[this.nextArticle_];
      const documentRef = {
        ampUrl: next.ampUrl,
        amp: null,
        recUnit: null,
        cancelled: false,
      };
      this.documentRefs_.push(documentRef);
      this.nextArticle_++;

      const container = this.win_.document.createElement('div');

      const separator = this.separator_.cloneNode(true);
      separator.removeAttribute('separator');
      container.appendChild(separator);

      const page = this.nextArticle_ - 1;
      this.positionObserver_.observe(separator, PositionObserverFidelity.LOW,
          position => this.positionUpdate_(page, position));

      const articleLinks = this.createArticleLinks_(this.nextArticle_);
      container.appendChild(articleLinks);
      documentRef.recUnit = articleLinks;

      this.positionObserver_.observe(articleLinks, PositionObserverFidelity.LOW,
          unused => this.articleLinksPositionUpdate_(documentRef));

      const shadowRoot = this.win_.document.createElement('div');
      container.appendChild(shadowRoot);

      this.appendPageHandler_(container);

      Services.xhrFor(/** @type {!Window} */ (this.win_))
          .fetchDocument(next.ampUrl, {ampCors: false})
          .then(doc => new Promise((resolve, reject) => {
            if (documentRef.cancelled) {
              // User has reached the end of the document already, don't render.
              resolve();
              return;
            }

            this.positionObserver_.unobserve(articleLinks);
            this.resources_.mutateElement(container, () => {
              try {
                const amp = this.attachShadowDoc_(shadowRoot, doc);
                documentRef.amp = amp;

                setStyle(documentRef.recUnit, 'display', 'none');
                this.documentQueued_ = false;
                resolve();
              } catch (e) {
                reject(e);
              }
            });
          }),
          e => dev().error(TAG, `failed to fetch ${next.ampUrl}`, e))
          .catch(e => dev().error(TAG,
              `failed to attach shadow document for ${next.ampUrl}`, e));
    }
  }

  /**
   * Creates a recommendation unit with links to articles, starting from a given
   * one.
   * @param {number} nextPage Index of the next unseen page to use as the first
   *     recommendation in the list.
   * @return {Element} Container element for the recommendations.
   */
  createArticleLinks_(nextPage) {
    const doc = this.win_.document;
    const currentArticle = nextPage - 1;
    let article = nextPage;
    let currentAmpUrl = '';
    if (nextPage > 0) {
      currentAmpUrl = this.documentRefs_[currentArticle].ampUrl;
    }

    const element = doc.createElement('div');
    const divider = this.createDivider_();
    element.appendChild(divider);

    while (article < this.config_.pages.length &&
           article - nextPage < SEPARATOR_RECOS) {
      const next = this.config_.pages[article];
      article++;

      const articleHolder = doc.createElement('button');
      articleHolder.classList.add('i-amphtml-reco-holder-article');
      articleHolder.addEventListener('click', () => {
        this.triggerAnalyticsEvent_(
            'amp-next-page-click', next.ampUrl, currentAmpUrl);
        this.viewer_.navigateToAmpUrl(next.ampUrl, 'content-discovery');
      });

      const imageElement = doc.createElement('div');
      imageElement.classList.add(
          'i-amphtml-next-article-image', 'amp-next-page-image');
      setStyle(imageElement, 'background-image', `url(${next.image})`);
      articleHolder.appendChild(imageElement);

      const titleElement = doc.createElement('div');
      titleElement.classList.add(
          'i-amphtml-next-article-title', 'amp-next-page-text');

      titleElement.textContent = next.title;
      articleHolder.appendChild(titleElement);

      element.appendChild(articleHolder);
      element.appendChild(this.createDivider_());
    }

    return element;
  }

  /**
   * Handles scroll events from the viewport and appends the next document when
   * the user comes within {@code PRERENDER_VIEWPORT_COUNT} viewports of the
   * end.
   * @private
   */
  scrollHandler_() {
    if (this.documentQueued_) {
      return;
    }

    const viewportSize = this.viewport_.getSize();
    const viewportBox =
        layoutRectLtwh(0, 0, viewportSize.width, viewportSize.height);
    this.viewport_.getClientRectAsync(dev().assertElement(this.element_))
        .then(elementBox => {
          if (this.documentQueued_) {
            return;
          }

          const prerenderHeight =
              PRERENDER_VIEWPORT_COUNT * viewportSize.height;
          if (elementBox.bottom - viewportBox.bottom < prerenderHeight) {
            this.documentQueued_ = true;
            this.appendNextArticle_();
          }
        });
  }

  /**
   * Handles updates from the {@code PositionObserver} indicating a change in
   * the position of a page separator in the viewport.
   * @param {number} i Index of the documentRef this recommendation unit is
   *     attached to.
   * @param
   * {!../../../src/service/position-observer/position-observer-worker.PositionInViewportEntryDef}
   *     position Position of the current recommendation unit in the viewport.
   */
  positionUpdate_(i, position) {
    // We're only interested when the recommendations exit the viewport
    if (position.positionRect !== null) {
      return;
    }

    if (position.relativePos === 'top') {
      const documentRef = this.documentRefs_[i + 1];
      this.triggerAnalyticsEvent_('amp-next-page-scroll',
          documentRef.ampUrl, this.activeDocumentRef_.ampUrl);
      this.setActiveDocument_(documentRef);
    } else if (position.relativePos === 'bottom') {
      const documentRef = this.documentRefs_[i];
      this.triggerAnalyticsEvent_('amp-next-page-scroll-back',
          documentRef.ampUrl, this.activeDocumentRef_.ampUrl);
      this.setActiveDocument_(documentRef);
    }
  }

  /**
   * Handles updates from the {@code PositionObserver} indicating a change in
   * the position of the recommendation unit in the viewport. Used to indicate
   * when the recommendation unit has entered the viewport, and should not be
   * hidden from view automatically.
   * @param {!DocumentRef} documentRef Reference to the active document.
   */
  articleLinksPositionUpdate_(documentRef) {
    documentRef.cancelled = true;
    this.positionObserver_.unobserve(documentRef.recUnit);
  }

  /**
   * Sets the specified document as active, updating the document title and URL.
   * @param {!DocumentRef} documentRef Reference to the document to set as
   *     active.
   */
  setActiveDocument_(documentRef) {
    const amp = documentRef.amp;
    this.win_.document.title = amp.title || '';
    if (this.win_.history.replaceState) {
      const url = parseUrl(documentRef.ampUrl);
      this.win_.history.replaceState({}, amp.title, url.pathname);
    }

    this.activeDocumentRef_ = documentRef;

    // TODO(peterjosling): Send request to viewer with title/URL
    // TODO(emarchiori): Consider updating position fixed elements.
  }

  /**
   * Wrapper around {@code triggerAnalyticsEvent}.
   * @param {string} eventType
   * @param {string} toURL The new url after the event.
   * @param {string=} fromURL The old URL before the event.
   */
  triggerAnalyticsEvent_(eventType, toURL, fromURL) {
    fromURL = fromURL || '';

    const vars = {toURL, fromURL};
    triggerAnalyticsEvent(dev().assertElement(this.element_), eventType, vars);
  }
}
