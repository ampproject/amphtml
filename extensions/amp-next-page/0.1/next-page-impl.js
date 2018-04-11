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

import {MultidocManager} from '../../../src/runtime';
import {PositionObserverFidelity} from '../../../src/service/position-observer/position-observer-worker';
import {Services} from '../../../src/services';
import {assertConfig} from './config';
import {
  childElementsByAttr,
  childElementsByTag,
  isJsonScriptTag,
} from '../../../src/dom';
import {getServiceForDoc} from '../../../src/service';
import {
  installPositionObserverServiceForDoc,
} from '../../../src/service/position-observer/position-observer-impl';
import {installStylesForDoc} from '../../../src/style-installer';
import {layoutRectLtwh} from '../../../src/layout-rect';
import {parseUrl} from '../../../src/url';
import {setStyle} from '../../../src/style';
import {triggerAnalyticsEvent} from '../../../src/analytics';
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';

// TODO(emarchiori): Make this a configurable parameter.
const SEPARATOR_RECOS = 3;

const MAX_ARTICLES = 2;

const PRERENDER_VIEWPORT_COUNT = 3;

const TAG = 'amp-next-page';

/**
 * @typedef {{
 *   ampUrl: string,
 *   amp: ?Object
 * }}
 */
export let DocumentRef;

/**
 * Window-scoped service to handle the amp-next-page lifecycle. Attaches all
 * events and DOM manipulation to the first first {@code AmpNextPage} element
 * registered. All subsequent registrations will be ignored.
 */
export class NextPage {
  constructor() {
    /** @private {?./amp-next-page.AmpNextPage} */
    this.nextPage_ = null;

    /** @private {?./config.AmpNextPageConfig} */
    this.config_ = null;

    /** @private {?MultidocManager} */
    this.multidocManager_ = null;

    /** @private {number} */
    this.nextArticle_ = 0;

    /** @private {Element} */
    this.separator_ = null;

    /** @private {boolean} */
    this.documentQueued_ = false;

    /** @private {?../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = null;

    /** @private {?../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = null;

    /** @private {?../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = null;

    /**
     * @private
     * {?../../../../src/service/position-observer/position-observer-impl.PositionObserver}
     */
    this.positionObserver_ = null;

    /** @private @const {!Array<!DocumentRef>} */
    this.documentRefs_ = [];

    /** @private {?DocumentRef} */
    this.activeDocumentRef_ = null;
  }

  /**
   * Registers the window-scoped service against the specified {@code
   * recommendationsOb}. Only the first call to this method will be used, any
   * subsequent calls will be ignored.
   */
  register(nextPage) {
    if (this.nextPage_ !== null) {
      return;
    }

    const win = nextPage.win;
    const element = nextPage.element;
    const ampDoc = nextPage.getAmpDoc();

    this.nextPage_ = nextPage;
    this.viewer_ = Services.viewerForDoc(ampDoc);
    this.viewport_ = Services.viewportForDoc(ampDoc);
    this.vsync_ = Services.vsyncFor(win);
    this.multidocManager_ =
        new MultidocManager(win, Services.ampdocServiceFor(win),
          Services.extensionsFor(win), Services.timerFor(win));

    installPositionObserverServiceForDoc(ampDoc);
    this.positionObserver_ = getServiceForDoc(ampDoc, 'position-observer');

    this.documentRefs_.push({
      ampUrl: win.document.location.href,
      amp: {title: win.document.title},
    });
    this.activeDocumentRef_ = this.documentRefs_[0];

    nextPage.element.classList.add('i-amphtml-next-page');

    // TODO(peterjosling): Read config from another source.

    const scriptElements = childElementsByTag(this.element, 'SCRIPT');
    user().assert(scriptElements.length == 1,
        `${TAG} should contain only one <script> child.`);
    const scriptElement = scriptElements[0];
    user().assert(isJsonScriptTag(scriptElement),
        `${TAG} config should ` +
        'be inside a <script> tag with type="application/json"');
    const configJson = tryParseJson(scriptElement.textContent, error => {
      throw user().createError(`failed to parse ${TAG} config`, error);
    });

    const docInfo = Services.documentInfoForDoc(element);
    const host = parseUrl(docInfo.sourceUrl).host;
    this.config_ = assertConfig(configJson, host);

    const separatorElements = childElementsByAttr(element, 'separator');
    user().assert(separatorElements.length <= 1,
        `${TAG} should contain at most one <div separator> child`);

    if (separatorElements.length == 1) {
      this.separator_ = separatorElements[0];
    }

    this.nextPage_.mutateElement(() => {
      element.appendChild(this.createDivider_());
      this.appendArticleLinks_(this.nextArticle_ + 1);
    });

    this.viewport_.onScroll(() => this.scrollHandler_());
    this.viewport_.onResize(() => this.scrollHandler_());
  }

  /**
   * Attach a ShadowDoc using the given document.
   * @param {!Document} doc
   * @return {!Promise<?Object>} Promise resolved with the return value of
   *     {@link MultidocManager#attachShadowDoc}
   */
  attachShadowDoc_(doc) {
    let amp = null;
    return this.vsync_
        .mutatePromise(() => {
          const shadowRoot =
              this.nextPage_.win.document.createElement('div');

          try {
            amp =
                this.multidocManager_.attachShadowDoc(shadowRoot, doc, '', {});

            const element = this.nextPage_.element;

            if (this.separator_) {
              const separatorClone = this.separator_.cloneNode(true);
              separatorClone.removeAttribute('separator');
              element.appendChild(separatorClone);
            }

            element.appendChild(shadowRoot);
            element.appendChild(this.createDivider_());
            this.appendArticleLinks_(this.nextArticle_ + 1);

            installStylesForDoc(amp.ampdoc, CSS, null, false, TAG);
            const body = amp.ampdoc.getBody();
            body.classList.add('i-amphtml-next-page-document');
          } catch (e) {
            // TODO(emarchiori): Handle loading errors.
          }
        })
        .then(() => amp);
  }

  /**
   * Creates a divider between two recommendations or articles.
   * @return {!Element}
   */
  createDivider_() {
    const topDivision =
        this.nextPage_.win.document.createElement('div');
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
      const documentRef = {ampUrl: next.ampUrl, amp: null};
      this.documentRefs_.push(documentRef);
      this.nextArticle_++;

      const win = this.nextPage_.win;

      // TODO(emarchiori): ampUrl needs to be updated to point to
      // the cache or same domain, otherwise this is a CORS request.
      Services.xhrFor(win)
          .fetchDocument(next.ampUrl, {ampCors: false})
          .then(doc => this.attachShadowDoc_(doc), () => {})
          .then(amp => {
            documentRef.amp = amp;
            this.documentQueued_ = false;
          });
    }
  }

  /**
   * Append recommendation links to articles, starting from a given
   * one.
   * @param {number} nextPage Index of the next unseen page to use as the first
   *     recommendation in the list.
   */
  appendArticleLinks_(nextPage) {
    const doc = this.nextPage_.win.document;
    const currentArticle = nextPage - 1;
    let article = nextPage;
    let currentAmpUrl = '';
    if (nextPage > 0) {
      currentAmpUrl = this.documentRefs_[currentArticle].ampUrl;
    }
    const recommendations = doc.createElement('div');

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

      recommendations.appendChild(articleHolder);
      recommendations.appendChild(this.createDivider_());
    }

    this.nextPage_.element.appendChild(recommendations);
    this.positionObserver_.observe(recommendations,
        PositionObserverFidelity.LOW,
        position => this.positionUpdate_(currentArticle, position));
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
    this.viewport_.getClientRectAsync(this.nextPage_.element)
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
   * the position of a recommendation unit in the viewport.
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
      this.setActiveDocument_(this.documentRefs_[i + 1]);
    } else if (position.relativePos === 'bottom') {
      const documentRef = this.documentRefs_[i];
      this.triggerAnalyticsEvent_('amp-next-page-scroll-back',
          documentRef.ampUrl, this.activeDocumentRef_.ampUrl);
      this.setActiveDocument_(this.documentRefs_[i]);
    }
  }

  /**
   * Sets the specified document as active, updating the document title and URL.
   * @param {!DocumentRef} documentRef Reference to the document to set as
   *     active.
   */
  setActiveDocument_(documentRef) {
    const amp = documentRef.amp;
    const win = this.nextPage_.win;
    win.document.title = amp.title || '';
    if (win.history.replaceState) {
      const url = parseUrl(documentRef.ampUrl);
      win.history.replaceState({}, amp.title, url.pathname);
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
    triggerAnalyticsEvent(this.nextPage_.element, eventType, vars);
  }
}
