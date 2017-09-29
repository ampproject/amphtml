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
import {EventType, dispatch} from './events';
import {createElementWithAttributes, escapeHtml} from '../../../src/dom';
import {dev} from '../../../src/log';


/**
 * @typedef {{
 *   shareProviders: !JsonObject|undefined,
 *   relatedArticles: !Array<!./related-articles.RelatedArticleSet>
 * }}
 */
export let BookendConfig;


/**
 * @param {!./related-articles.RelatedArticle} articleData
 * @return {!string}
 */
// TODO(alanorozco): link
// TODO(alanorozco): reading time
// TODO(alanorozco): domain name
function articleHtml(articleData) {
  // TODO(alanorozco): Consider using amp-img and what we need to get it working
  const imgHtml = articleData.image ? (
      `<div class="i-amp-story-bookend-article-image">
        <img src="${articleData.image}"
            width="116"
            height="116">
        </img>
      </div>`
  ) : '';

  return (
      `${imgHtml}
      <h2 class="i-amp-story-bookend-article-heading">
        ${articleData.title}
      </h2>
      <div class="i-amp-story-bookend-article-meta">
        example.com - 10 mins
      </div>`
  );
}


/**
 * Bookend component for <amp-story>.
 */
export class Bookend {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {!BookendShareWidget} */
    this.shareWidget_ = BookendShareWidget.create(win);
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
    this.root_.classList.add('i-amp-story-bookend');

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
   * @param {!BookendConfig} bookendConfig
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
   * @param {!Array<!./related-articles.RelatedArticleSet>} articleSets
   * @private
   */
  setRelatedArticles_(articleSets) {
    const fragment = this.win_.document.createDocumentFragment();

    articleSets.forEach(articleSet =>
        fragment.appendChild(this.buildArticleSet_(articleSet)));

    this.getRoot().appendChild(fragment);
  }

  /**
   * @param {!./related-articles.RelatedArticleSet} articleSet
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
   * @param {!Array<!./related-articles.RelatedArticle>} articleList
   * @return {!Element}
   * @private
   */
  buildArticleList_(articleList) {
    const container = createElementWithAttributes(this.win_.document, 'div', {
      'class': 'i-amp-story-bookend-article-set',
    });
    articleList.forEach(article =>
        container.appendChild(this.buildArticle_(article)));
    return container;
  }

  /**
   * @param {!string} heading
   * @return {!Element}
   */
  buildArticleSetHeading_(heading) {
    const headingEl = createElementWithAttributes(this.win_.document, 'h3', {
      'class': 'i-amp-story-bookend-heading',
    });
    headingEl.innerText = escapeHtml(heading);
    return headingEl;
  }

  /**
   * @param {!./related-articles.RelatedArticle} article
   * @return {!Element}
   */
  // TODO(alanorozco): typing and format
  buildArticle_(article) {
    const el = this.win_.document.createElement('article');
    el./*OK*/innerHTML = articleHtml(article);
    return el;
  }

  /**
   * @return {!Element}
   */
  getRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.root_);
  }
}

