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

import {assertConfig} from './config';
import {user} from '../../../src/log';
import {tryParseJson} from '../../../src/json';
import {CSS} from '../../../build/amp-document-recommendations-0.1.css';
import {isJsonScriptTag} from '../../../src/dom';
import {Services} from '../../../src/services';
import {MultidocManager} from '../../../src/runtime';
import {setStyle} from '../../../src/style';

/** @const */
const MAX_ARTICLES = 2;

/** @const */
const SEPARATPOR_RECOS = 3;

/** @private {AmpDocumentRecommendations} */
let activeInstance_ = null;

export class AmpDocumentRecommendations extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    // TODO(emarchiori): Consider using a service instead of singleton.
    if (activeInstance_) {
      return;
    }
    activeInstance_ = this;

    /** @private {?AmpDocumentRecommendationsConfig} */
    this.config_;

    /** @private {MultidocManager} */
    this.multidocManager_;

    /** @private {number} */
    this.nextArticle_ = 0;

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.getAmpDoc());
  }

  /** @override */
  isLayoutSupported(unused) {
    return true;
  }

  /**
   * Append a divider between two recommendations or articles.
   */
  appendDivision_() {
    const doc = this.win.document;
    const topDivision = doc.createElement('div');
    topDivision.classList.add('amp-document-recommendations-division');
    this.element.appendChild(topDivision);
  }

  /**
   * Append a new article if still possible.
   */
  appendNextArticle_() {
    if (this.nextArticle_ < MAX_ARTICLES &&
        this.nextArticle_ < this.config_.recommendations.length) {
      this.appendDivision_();
      this.appendArticleLinks_(this.nextArticle_ + 1);

      const next = this.config_.recommendations[this.nextArticle_];
      this.nextArticle_++;

      Services.xhrFor(this.win)
          .fetchDocument(next.ampUrl)
          .then(
              doc => {this.attachShadowDoc_(doc);},
              () => {});
    }
  }

  /**
   * Append recommendation links to articles, starting from a given
   * one.
   * @param {number} from
   */
  appendArticleLinks_(from) {
    const doc = this.win.document;
    let article = from;

    while (article < this.config_.recommendations.length &&
        article - from < SEPARATPOR_RECOS) {
      const next = this.config_.recommendations[article];
      article++;

      const articleHolder = doc.createElement('button');
      articleHolder.classList.add('i-amphtml-reco-holder-article');
      articleHolder.addEventListener('click', () => {
        this.viewer_.navigateTo(next.ampUrl, 'content-discovery');
      });

      const imageElement = doc.createElement('div');
      imageElement.classList.add('i-amphtml-next-article-image',
          'amp-document-recommendations-image');
      setStyle(imageElement, 'background-image', `url(${next.image})`);
      articleHolder.appendChild(imageElement);

      const titleElement = doc.createElement('div');
      titleElement.classList.add('i-amphtml-next-article-title',
          'amp-document-recommendations-text');

      titleElement.textContent = next.title;
      articleHolder.appendChild(titleElement);

      this.element.appendChild(articleHolder);

      this.appendDivision_();
    }
  }

  /**
   * Attach a ShadowDoc using the given document.
   * @param {!Document} doc
   */
  attachShadowDoc_(doc) {
    this.getVsync().mutate(() => {
      const shadowRoot = this.win.document.createElement('div');

      try {
        this.multidocManager_.attachShadowDoc(shadowRoot, doc, '', {});

        // TODO(emarchiori): Update document title.

        this.element.appendChild(shadowRoot);

        if (this.nextArticle_ < this.config_.recommendations.length) {
          this.appendNextArticle_();
        }

      } catch (e) {
        this.handleLoadingError();
      }
    });
  }

  /** @override */
  buildCallback() {
    if (activeInstance_ !== this) {
      return Promise.resolve();
    }

    this.element.classList.add('i-amphtml-document-recommendations');

    this.multidocManager_ = new MultidocManager(
        this.win,
        Services.ampdocServiceFor(this.win),
        Services.extensionsFor(this.win),
        Services.timerFor(this.win));

    const children = this.element.children;
    user().assert(children.length == 1,
        'The tag should contain exactly one <script> child.');
    const scriptElement = children[0];
    user().assert(
        isJsonScriptTag(scriptElement),
        'The amp-document-recommendations config should ' +
        'be inside a <script> tag with type="application/json"');

    const configJson = tryParseJson(
        scriptElement.textContent, error => {
          throw user().createError(
              'failed to parse content discovery script', error);
        });

    this.config_ = assertConfig(configJson);

    return this.mutateElement(() => {
      this.appendNextArticle_();
    });
  }
}

AMP.registerElement(
    'amp-document-recommendations', AmpDocumentRecommendations, CSS);
