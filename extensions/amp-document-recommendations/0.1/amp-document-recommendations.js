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

/** @const */
const EXPERIMENT = 'amp-document-recommendations';

/** @const */
const MAX_ARTICLES = 2;

/** @const */
const SEPARATPOR_RECOS = 3;

import {assertConfig} from './config';
import {user} from '../../../src/log';
import {tryParseJson} from '../../../src/json';
import {CSS} from '../../../build/amp-document-recommendations-0.1.css';
import {isJsonScriptTag} from '../../../src/dom';
import {Services} from '../../../src/services';
import {MultidocManager} from '../../../src/runtime';

export class AmpDocumentRecommendations extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    this.element.classList.add('-amp-document-recommendations');

    // TODO(emarchiori): Consider using a service instead of singleton.
    if (this.win.CONTENT_DISCOVERY) {
      return;
    }
    this.win.CONTENT_DISCOVERY = this;

    /** @private {?AmpDocumentRecommendationsConfig} */
    this.config_;

    /** @private {MultidocManager} */
    this.multidocManager_;

    /** @private {number} */
    this.nextArticle_ = 0;
  }

  /** @override */
  isLayoutSupported(layout) {
    return true;
  }

  appendDivision_() {
    const doc = this.win.document;
    const topDivision = doc.createElement('div');
    topDivision.classList.add('amp-document-recommendations-division');
    this.element.appendChild(topDivision);
  }

  appendNextArticle_(url) {
    if (this.nextArticle_ < MAX_ARTICLES && this.nextArticle_ < this.config_.recommendations.length) {
      this.appendDivision_();
      this.appendArticleLinks_(this.nextArticle_ + 1);

      const next = this.config_.recommendations[this.nextArticle_];
      this.nextArticle_++;

      Services.xhrFor(this.win)
        .fetchDocument(next.ampUrl, {})
        .then(
          (doc) => {this.attachShadowDoc(doc);},
          (error) => {});    
    }
  }

  /** 
   * @param {number} from
   */
  appendArticleLinks_(from) {
    const doc = this.win.document;
    let article = from;
    const viewer = Services.viewerForDoc(this.getAmpDoc());

    while (article < this.config_.recommendations.length &&
        article - from < SEPARATPOR_RECOS) {
      const next = this.config_.recommendations[article];
      article++;

      const articleHolder = doc.createElement('div');
      articleHolder.classList.add('-reco-holder-article');
      articleHolder.onclick = () => {
        viewer.navigateTo(next.ampUrl, 'content-discovery');
      }

      const imageElement = doc.createElement('div');
      imageElement.classList.add('-next-article-image', 'amp-document-recommendations-image');
      imageElement.style.backgroundImage = `url(${next.image})`;
      articleHolder.appendChild(imageElement);

      const titleElement = doc.createElement('div');
      titleElement.classList.add('-next-article-title', 'amp-document-recommendations-text');

      titleElement.textContent = next.title;
      articleHolder.appendChild(titleElement);

      this.element.appendChild(articleHolder);

      this.appendDivision_();
    }
  }

  attachShadowDoc(doc, url) {
    this.getVsync().mutate(() => {
      const shadowRoot = this.win.document.createElement('div');
      //shadowRoot.classList.add('amp-next-article-container');

      try {
        const amp = this.multidocManager_.attachShadowDoc(shadowRoot, doc, '', {});

        // TODO(emarchiori): Update document title.

        this.element.appendChild(shadowRoot);

        if (this.nextArticle_ < this.config_.recommendations.length) {
          this.appendNextArticle_();
        }

      } catch(e) {
        this.handleLoadingError();
      }
    });
  }

  /** @override */
  buildCallback() {
    if (this.win.CONTENT_DISCOVERY !== this) {
      return Promise.resolve();
    }

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

    const configJson = tryParseJson(scriptElement.textContent, error => {
      throw user().createError('failed to parse content discovery script', error);
    });

    this.config_ = assertConfig(configJson);

    return this.mutateElement(() => {
      this.appendNextArticle_();
    });
  }
}

AMP.registerElement('amp-document-recommendations', AmpDocumentRecommendations, CSS);