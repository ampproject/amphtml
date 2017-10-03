/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {BookendShareWidget} from './bookend-share';
import {createElementWithAttributes} from '../../../src/dom';
import {dev} from '../../../src/log';


/**
 * @typedef {{
 *   shareProviders: (!JsonObject|undefined),
 *   relatedArticles: !Array<!./related-articles.RelatedArticleSetDef>
 * }}
 */
export let BookendConfigDef;


/**
 * @param {!./related-articles.RelatedArticleDef} articleData
 * @return {!DocumentFragment}
 */
// TODO(alanorozco): link
// TODO(alanorozco): reading time
// TODO(alanorozco): domain name
function buildArticle(doc, articleData) {
  const root = doc.createElement('article');
  const fragment = doc.createDocumentFragment();

  if (articleData.image) {
    const imageContainer = createElementWithAttributes(doc, 'div', {
      class: 'i-amphtml-story-bookend-article-image',
    });

    // TODO(alanorozco): Figure out how to use amp-img here
    imageContainer.appendChild(createElementWithAttributes(doc, 'img', {
      src: articleData.image,
      width: 116,
      height: 116,
    }));

    fragment.appendChild(imageContainer);
  }

  const title = createElementWithAttributes(doc, 'h2', {
    class: 'i-amphtml-story-bookend-article-heading',
  });

  title.textContent = articleData.title;

  const metaContainer = createElementWithAttributes(doc, 'div', {
    class: 'i-amphtml-story-bookend-article-meta',
  });

  metaContainer.textContent = 'example.com - 10 mins';

  root.appendChild(title);
  root.appendChild(metaContainer);

  fragment.appendChild(root);

  return fragment;
}


/**
 * Bookend component for <amp-story>.
 */
export class Bookend {
  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Window} */
    this.win_ = ampdoc.win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {!BookendShareWidget} */
    this.shareWidget_ = BookendShareWidget.create(ampdoc);
  }

  /**
   * @return {!Element}
   */
  build() {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    this.isBuilt_ = true;

    this.root_ = this.win_.document.createElement('section');
    this.root_.classList.add('i-amphtml-story-bookend');

    this.root_.appendChild(this.shareWidget_.build());

    return this.getRoot();
  }

  /**
   * @retun {boolean}
   */
  isBuilt() {
    return this.isBuilt_;
  }

  /** @private */
  assertBuilt_() {
    dev().assert(this.isBuilt(), 'Bookend component needs to be built.');
  }

  /**
   * @param {!BookendConfigDef} bookendConfig
   */
  setConfig(bookendConfig) {
    this.assertBuilt_();

    if (bookendConfig.shareProviders) {
      this.shareWidget_.setProviders(
          dev().assert(bookendConfig.shareProviders));
    }

    this.setRelatedArticles_(bookendConfig.relatedArticles);
  }

  /**
   * @param {!Array<!./related-articles.RelatedArticleSetDef>} articleSets
   * @private
   */
  setRelatedArticles_(articleSets) {
    const fragment = this.win_.document.createDocumentFragment();

    articleSets.forEach(articleSet =>
        fragment.appendChild(this.buildArticleSet_(articleSet)));

    this.getRoot().appendChild(fragment);
  }

  /**
   * @param {!./related-articles.RelatedArticleSetDef} articleSet
   * @return {!DocumentFragment}
   */
  // TODO(alanorozco): typing and format
  buildArticleSet_(articleSet) {
    const fragment = this.win_.document.createDocumentFragment();

    if (articleSet.heading) {
      fragment.appendChild(
          this.buildArticleSetHeading_(articleSet.heading));
    }

    fragment.appendChild(this.buildArticleList_(articleSet.articles));

    return fragment;
  }

  /**
   * @param {!Array<!./related-articles.RelatedArticleDef>} articleList
   * @return {!Element}
   * @private
   */
  buildArticleList_(articleList) {
    const container = createElementWithAttributes(this.win_.document, 'div', {
      'class': 'i-amphtml-story-bookend-article-set',
    });
    articleList.forEach(article =>
        container.appendChild(buildArticle(this.win_.document, article)));
    return container;
  }

  /**
   * @param {!string} heading
   * @return {!Element}
   * @private
   */
  buildArticleSetHeading_(heading) {
    const headingEl = createElementWithAttributes(this.win_.document, 'h3', {
      'class': 'i-amphtml-story-bookend-heading',
    });
    headingEl.textContet = heading;
    return headingEl;
  }

  /** @return {!Element} */
  getRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.root_);
  }
}

