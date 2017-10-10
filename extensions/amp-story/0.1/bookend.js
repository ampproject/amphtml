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
import {Services} from '../../../src/services';
import {createElementWithAttributes} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getJsonLd} from './jsonld';
import {isArray} from '../../../src/types';
import {parseUrl} from '../../../src/url';


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
function buildArticle(doc, articleData) {
  const root = createElementWithAttributes(doc, 'a',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-bookend-article',
        href: articleData.url,
      }));

  const fragment = doc.createDocumentFragment();

  if (articleData.image) {
    const imageContainer = createElementWithAttributes(doc, 'div',
        /** @type {!JsonObject} */({
          class: 'i-amphtml-story-bookend-article-image',
        }));

    // TODO(alanorozco): Figure out how to use amp-img here
    imageContainer.appendChild(createElementWithAttributes(doc, 'img',
        /** @type {!JsonObject} */({
          src: articleData.image,
          width: 116,
          height: 116,
        })));

    root.appendChild(imageContainer);
  }

  const title = createElementWithAttributes(doc, 'h2',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-bookend-article-heading',
      }));

  title.textContent = articleData.title;

  const metaContainer = createElementWithAttributes(doc, 'div',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-bookend-article-meta',
      }));

  metaContainer.textContent = articleData.domainName;

  root.appendChild(title);
  root.appendChild(metaContainer);

  fragment.appendChild(root);

  return fragment;
}


/**
 * @param {!Document} doc
 * @param {string} title
 * @param {string} domainName
 * @param {string=} opt_imageUrl
 * @return {!Element}
 */
function buildReplayButton(doc, title, domainName, opt_imageUrl) {
  const root = createElementWithAttributes(doc, 'div',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-bookend-replay',
      }));

  const iconContainer = createElementWithAttributes(doc, 'div',
        /** @type {!JsonObject} */({
          class: 'i-amphtml-story-bookend-replay-icon',
        }));

  if (opt_imageUrl) {
    const container = createElementWithAttributes(doc, 'div',
        /** @type {!JsonObject} */({
          class: 'i-amphtml-story-bookend-replay-image',
        }));

    // TODO(alanorozco): Figure out how to use amp-img here
    container.appendChild(createElementWithAttributes(doc, 'img',
        /** @type {!JsonObject} */({
          width: 80,
          height: 80,
          src: opt_imageUrl,
        })));

    container.appendChild(iconContainer);

    root.appendChild(container);
  } else {
    root.appendChild(iconContainer);
  }

  const h2El = createElementWithAttributes(doc, 'h2',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-bookend-article-heading',
      }));

  h2El.textContent = title;

  const metaEl = createElementWithAttributes(doc, 'div',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-bookend-article-meta',
      }));

  metaEl.textContent = domainName;

  root.appendChild(h2El);
  root.appendChild(metaEl);

  return root;
}


/**
 * Bookend component for <amp-story>.
 */
export class Bookend {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.replayBtn_ = null;

    /** @private {!BookendShareWidget} */
    this.shareWidget_ = BookendShareWidget.create(win);
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Element}
   */
  build(ampdoc) {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    this.isBuilt_ = true;

    this.root_ = this.win_.document.createElement('section');
    this.root_.classList.add('i-amphtml-story-bookend');

    // TOOD(alanorozco): Domain name
    this.replayBtn_ = this.buildReplayButton_(ampdoc);

    this.root_.appendChild(this.replayBtn_);
    this.root_.appendChild(this.shareWidget_.build(ampdoc));

    this.attachEvents_();

    return this.getRoot();
  }

  /** @private */
  attachEvents_() {
    // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
    this.replayBtn_.addEventListener('click', e => this.onReplayBtnClick_(e));
  }

  /**
   * @param {!Event} e
   * @private
   */
  onReplayBtnClick_(e) {
    e.stopPropagation();
    dispatch(this.getRoot(), EventType.REPLAY, /* opt_bubbles */ true);
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
    const container = createElementWithAttributes(this.win_.document, 'div',
        /** @type {!JsonObject} */({
          'class': 'i-amphtml-story-bookend-article-set',
        }));
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
    const headingEl = createElementWithAttributes(this.win_.document, 'h3',
        /** @type {!JsonObject} */({
          'class': 'i-amphtml-story-bookend-heading',
        }));
    headingEl.textContet = heading;
    return headingEl;
  }

  /** @return {!Element} */
  getRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.root_);
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {{
   *   title: string,
   *   domainName: string,
   *   imageUrl: (string|undefined),
   * }}
   * @private
   */
  getStoryMetadata_(ampdoc) {
    const jsonLd = getJsonLd(ampdoc.getRootNode());

    const metadata = {
      title: jsonLd && jsonLd['heading'] ?
          jsonLd['heading'] :
          user().assertElement(
              this.win_.document.head.querySelector('title'),
              'Please set <title> or structured data (JSON-LD).').textContent,

      domainName:
          parseUrl(Services.documentInfoForDoc(ampdoc).canonicalUrl).hostname,
    };

    if (jsonLd && isArray(jsonLd['image']) && jsonLd['image'].length) {
      metadata.imageUrl = jsonLd['image'][0];
    }

    return metadata;
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Element}
   * @private
   */
  buildReplayButton_(ampdoc) {
    const metadata = this.getStoryMetadata_(ampdoc);
    return buildReplayButton(
        this.win_.document,
        metadata.title,
        metadata.domainName,
        metadata.imageUrl);
  }
}
