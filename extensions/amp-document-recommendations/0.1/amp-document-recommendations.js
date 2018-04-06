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

import {CSS} from '../../../build/amp-document-recommendations-0.1.css';
import {Layout} from '../../../src/layout';
import {MultidocManager} from '../../../src/runtime';
import {
  PositionObserverFidelity,
} from '../../../src/service/position-observer/position-observer-worker';
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
import {isExperimentOn} from '../../../src/experiments';
import {parseUrl} from '../../../src/url';
import {setStyle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';

import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-document-recommendations';

/** @const */
const MAX_ARTICLES = 2;

/**
 * @const
 * TODO(emarchiori): Make this a configurable parameter.
 */
const SEPARATOR_RECOS = 3;

/** @private {AmpDocumentRecommendations} */
let activeInstance_ = null;

/**
 * @typedef {{
 *   ampUrl: string,
 *   amp: ?Object
 * }}
 */
export let DocumentRef;

export class AmpDocumentRecommendations extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    // TODO(emarchiori): Consider using a service instead of singleton.
    if (activeInstance_) {
      return;
    }
    activeInstance_ = this;

    const ampDoc = this.getAmpDoc();
    installPositionObserverServiceForDoc(ampDoc);

    /** @private {?./config.AmpDocumentRecommendationsConfig} */
    this.config_ = null;

    /** @private {?MultidocManager} */
    this.multidocManager_ = null;

    /** @private {number} */
    this.nextArticle_ = 0;

    /** @private {Element} */
    this.separator_ = null;

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampDoc);

    /**
     * @private @const
     * {!../../../../src/service/position-observer/position-observer-impl.PositionObserver}
     */
    this.positionObserver_ = getServiceForDoc(ampDoc, 'position-observer');

    /** @private @const {!Array<!DocumentRef>} */
    this.documentRef_ = [{
      ampUrl: this.win.document.location.href,
      amp: {title: this.win.document.title},
    }];
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /**
   * Creates a divider between two recommendations or articles.
   * @return {!Element}
   */
  createDivider_() {
    const doc = this.win.document;
    const topDivision = doc.createElement('div');
    topDivision.classList.add('amp-document-recommendations-division');
    return topDivision;
  }

  /**
   * Append a new article if still possible.
   */
  appendNextArticle_() {
    if (this.nextArticle_ < MAX_ARTICLES &&
        this.nextArticle_ < this.config_.recommendations.length) {
      const next = this.config_.recommendations[this.nextArticle_];
      const documentRef = {ampUrl: next.ampUrl, amp: null};
      this.documentRefs_.push(documentRef);
      this.nextArticle_++;

      // TODO(emarchiori): ampUrl needs to be updated to point to
      // the cache or same domain, otherwise this is a CORS request.
      Services.xhrFor(this.win)
          .fetchDocument(next.ampUrl, {ampCors: false})
          .then(doc => this.attachShadowDoc_(doc), () => {})
          .then(amp => documentRef.amp = amp);
    }
  }

  /**
   * Append recommendation links to articles, starting from a given
   * one.
   * @param {number} nextRecommendation Index of the next unseen recommendation
   *     to use as the first recommendation in the list.
   */
  appendArticleLinks_(nextRecommendation) {
    const doc = this.win.document;
    const currentArticle = nextRecommendation - 1;
    let article = nextRecommendation;

    const recommendations = doc.createElement('div');

    while (article < this.config_.recommendations.length &&
           article - nextRecommendation < SEPARATOR_RECOS) {
      const next = this.config_.recommendations[article];
      article++;

      const articleHolder = doc.createElement('button');
      articleHolder.classList.add('i-amphtml-reco-holder-article');
      articleHolder.addEventListener('click', () => {
        this.viewer_.navigateToAmpUrl(next.ampUrl, 'content-discovery');
      });

      const imageElement = doc.createElement('div');
      imageElement.classList.add(
          'i-amphtml-next-article-image', 'amp-document-recommendations-image');
      setStyle(imageElement, 'background-image', `url(${next.image})`);
      articleHolder.appendChild(imageElement);

      const titleElement = doc.createElement('div');
      titleElement.classList.add(
          'i-amphtml-next-article-title', 'amp-document-recommendations-text');

      titleElement.textContent = next.title;
      articleHolder.appendChild(titleElement);

      recommendations.appendChild(articleHolder);
      recommendations.appendChild(this.createDivider_());
    }

    this.element.appendChild(recommendations);
    this.positionObserver_.observe(recommendations,
        PositionObserverFidelity.LOW,
        position => this.positionUpdate_(currentArticle, position));
  }

  /**
   * Attach a ShadowDoc using the given document.
   * @param {!Document} doc
   * @return {!Promise<?Object>} Promise resolved with the return value of
   *     {@link MultiDocManager#attachShadowDoc}
   */
  attachShadowDoc_(doc) {
    let amp = null;
    return this.getVsync()
        .mutatePromise(() => {
          const shadowRoot = this.win.document.createElement('div');

          try {
            amp =
                this.multidocManager_.attachShadowDoc(shadowRoot, doc, '', {});

            if (this.separator_) {
              const separatorClone = this.separator_.cloneNode(true);
              separatorClone.removeAttribute('separator');
              this.element.appendChild(separatorClone);
            }

            this.element.appendChild(shadowRoot);
            this.element.appendChild(this.createDivider_());
            this.appendArticleLinks_(this.nextArticle_ + 1);

            if (this.nextArticle_ < this.config_.recommendations.length) {
              this.appendNextArticle_();
            }
          } catch (e) {
            // TODO(emarchiori): Handle loading errors.
          }
        })
        .then(() => amp);
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, TAG), `Experiment ${TAG} disabled`);

    if (activeInstance_ !== this) {
      return Promise.resolve();
    }

    this.element.classList.add('i-amphtml-document-recommendations');

    this.multidocManager_ =
        new MultidocManager(this.win, Services.ampdocServiceFor(this.win),
          Services.extensionsFor(this.win), Services.timerFor(this.win));

    // TODO(peterjosling): Read config from another source.

    const scriptElements = childElementsByTag(this.element, 'SCRIPT');
    user().assert(scriptElements.length == 1,
        'The tag should contain only one <script> child.');
    const scriptElement = scriptElements[0];
    user().assert(isJsonScriptTag(scriptElement),
        'The amp-document-recommendations config should ' +
            'be inside a <script> tag with type="application/json"');
    const configJson = tryParseJson(scriptElement.textContent, error => {
      throw user().createError(
          'failed to parse content discovery script', error);
    });

    const docInfo = Services.documentInfoForDoc(this.element);
    const host = parseUrl(docInfo.sourceUrl).host;
    this.config_ = assertConfig(configJson, host);

    const separatorElements = childElementsByAttr(this.element, 'separator');
    user().assert(separatorElements.length <= 1,
        'The tag should contain at most one <div separator> child.');

    if (separatorElements.length == 1) {
      this.separator_ = separatorElements[0];
    }

    this.mutateElement(() => {
      this.element.appendChild(this.createDivider_());
      this.appendArticleLinks_(this.nextArticle_ + 1);
    });
  }

  /** @override */
  layoutCallback() {
    // TODO(emarchiori): Decide when to append the next article
    // based on PositionObserver.
    this.appendNextArticle_();
    return Promise.resolve();
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
      this.setActiveDocument_(this.documentRefs_[i + 1]);
    } else if (position.relativePos === 'bottom') {
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
    this.win.document.title = amp.title || '';
    if (this.win.history.replaceState) {
      const url = parseUrl(documentRef.ampUrl);
      this.win.history.replaceState({}, amp.title, url.pathname);
    }

    // TODO(peterjosling): Send request to viewer with title/URL
    // TODO(emarchiori): Trigger analtyics event when active
    // document changes.
    // TODO(emarchiori): Hide position fixed elements of inactive
    // documents and update approriately.
  }
}

AMP.registerElement(TAG, AmpDocumentRecommendations, CSS);
