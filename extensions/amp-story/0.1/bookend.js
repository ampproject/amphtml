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
import {EventType, dispatch} from './events';
import {KeyCodes} from '../../../src/utils/key-codes';
import {ScrollableShareWidget} from './share';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {getJsonLd} from './jsonld';
import {isArray} from '../../../src/types';
import {isProtocolValid} from '../../../src/url';
import {parseUrl} from '../../../src/url';
import {renderAsElement, renderSimpleTemplate} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';


/**
 * @typedef {{
 *   shareProviders: (!JsonObject|undefined),
 *   relatedArticles: !Array<!./related-articles.RelatedArticleSetDef>
 * }}
 */
export let BookendConfigDef;


/**
 * Scroll amount required for full-bleed in px.
 * @private @const {number}
 */
const FULLBLEED_THRESHOLD = 88;


/** @private @const {string} */
const FULLBLEED_CLASSNAME = 'i-amphtml-story-bookend-fullbleed';


/** @private @const {string} */
const HIDDEN_CLASSNAME = 'i-amphtml-hidden';


/** @private @const {!./simple-template.ElementDef} */
const ROOT_TEMPLATE = {
  tag: 'section',
  attrs: dict({
    'class': 'i-amphtml-story-bookend i-amphtml-story-system-reset ' +
        HIDDEN_CLASSNAME}),
  children: [
    // Overflow container that gets pushed to the bottom when content height is
    // smaller than viewport.
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-bookend-overflow'}),
      children: [
        // Holds bookend content.
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-bookend-inner'}),
        },
      ],
    },
  ],
};


/** @private @const {!./simple-template.ElementDef} */
const REPLAY_ICON_TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-bookend-replay-icon'}),
};


/**
 * @param {!./related-articles.RelatedArticleDef} articleData
 * @return {!./simple-template.ElementDef}
 */
function buildArticleTemplate(articleData) {
  const template = /** @type {!./simple-template.ElementDef} */ ({
    tag: 'a',
    attrs: dict({
      'class': 'i-amphtml-story-bookend-article',
      'href': articleData.url,
    }),
    children: [
      {
        tag: 'h2',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-heading'}),
        text: articleData.title,
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-meta'}),
        text: articleData.domainName,
      },
    ],
  });

  if (articleData.image) {
    template.children.unshift(/** @type {!./simple-template.ElementDef} */ ({
      tag: 'amp-img',
      attrs: dict({
        'class': 'i-amphtml-story-bookend-article-image',
        'src': articleData.image,
        'width': 100,
        'height': 100,
      }),
    }));
  }

  return template;
}


/**
 * @param {!Array<!./related-articles.RelatedArticleSetDef>} articleSets
 * @return {!Array<!./simple-template.ElementDef>}
 */
function buildArticlesContainerTemplate(articleSets) {
  const template = [];

  articleSets.forEach(articleSet => {
    if (articleSet.heading) {
      template.push({
        tag: 'h3',
        attrs: dict({'class': 'i-amphtml-story-bookend-heading'}),
        text: articleSet.heading,
      });
    }
    template.push({
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-bookend-article-set'}),
      children: articleSet.articles.map(article =>
        buildArticleTemplate(article)),
    });
  });

  return template;
}


/**
 * @param {!Document} doc
 * @param {string} title
 * @param {string} domainName
 * @param {string=} opt_imageUrl
 * @return {!./simple-template.ElementDef}
 */
function buildReplayButtonTemplate(doc, title, domainName, opt_imageUrl) {
  return /** @type {!./simple-template.ElementDef} */ ({
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-bookend-replay'}),
    children: [
      !opt_imageUrl ? REPLAY_ICON_TEMPLATE : {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-bookend-replay-image',
          'style': `background-image: url(${opt_imageUrl}) !important`,
        }),
        children: [REPLAY_ICON_TEMPLATE],
      },
      {
        tag: 'h2',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-heading'}),
        text: title,
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-meta'}),
        text: domainName,
      },
    ],
  });
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

    /** @private {?Element} */
    this.closeBtn_ = null;

    /** @private {!ScrollableShareWidget} */
    this.shareWidget_ = ScrollableShareWidget.create(win);
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

    this.root_ = renderAsElement(this.win_.document, ROOT_TEMPLATE);

    this.replayBtn_ = this.buildReplayButton_(ampdoc);

    this.getInnerContainer_().appendChild(this.replayBtn_);
    this.getInnerContainer_().appendChild(this.shareWidget_.build(ampdoc));

    this.attachEvents_();

    return this.getRoot();
  }

  /** @private */
  attachEvents_() {
    // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
    this.root_.addEventListener('click', e => this.maybeClose_(e));
    this.replayBtn_.addEventListener('click', e => this.onReplayBtnClick_(e));

    this.getOverflowContainer_().addEventListener('scroll',
        // minInterval is high since this is a step function that does not
        // require smoothness
        throttle(this.win_, () => this.onScroll_(), 100));

    this.win_.addEventListener('keyup', e => {
      if (!this.isActive()) {
        return;
      }
      if (e.keyCode == KeyCodes.ESCAPE) {
        e.preventDefault();
        this.dispatchClose_();
      }
    });
  }

  /** @return {boolean} */
  isActive() {
    return this.isBuilt() &&
        !this.getRoot().classList.contains(HIDDEN_CLASSNAME);
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
   * Closes bookend if tapping outside usable area.
   * @param {!Event} e
   * @private
   */
  maybeClose_(e) {
    if (this.elementOutsideUsableArea_(dev().assertElement(e.target))) {
      e.stopPropagation();
      this.dispatchClose_();
    }
  }

  /** @private */
  dispatchClose_() {
    dispatch(this.getRoot(), EventType.CLOSE_BOOKEND, /* opt_bubbles */ true);
  }

  /**
   * @param {!Element} el
   * @return {boolean}
   */
  elementOutsideUsableArea_(el) {
    return !closest(el, el => el == this.getInnerContainer_());
  }

  /**
   * Changes between card view and full-bleed based on scroll position.
   * @private
   */
  onScroll_() {
    if (!this.isActive()) {
      return;
    }
    Services.vsyncFor(this.win_).run({
      measure: state => {
        state.shouldBeFullBleed =
            this.getOverflowContainer_()./*OK*/scrollTop >= FULLBLEED_THRESHOLD;
      },
      mutate: state => {
        this.getRoot().classList.toggle(
            FULLBLEED_CLASSNAME, state.shouldBeFullBleed);
      },
    }, {});
  }

  /** Hides bookend with a transition. */
  hide() {
    this.toggle_(false);
  }

  /** Shows bookend with a transition. */
  show() {
    this.toggle_(true);
  }

  /**
   * @param {boolean} show
   * @private
   */
  toggle_(show) {
    Services.vsyncFor(this.win_).mutate(() => {
      this.getRoot().classList.toggle(HIDDEN_CLASSNAME, !show);
    });
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
    this.getInnerContainer_().appendChild(
        renderSimpleTemplate(this.win_.document,
            buildArticlesContainerTemplate(articleSets)));
  }

  /** @return {!Element} */
  getRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.root_);
  }

  /**
   * Gets container for bookend content.
   * @return {!Element}
   * @private
   */
  getInnerContainer_() {
    return dev().assertElement(this.getOverflowContainer_().firstElementChild);
  }

  /**
   * Gets outer container that gets scrolled.
   * @return {!Element}
   * @private
   */
  getOverflowContainer_() {
    return dev().assertElement(this.getRoot().firstElementChild);
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
      title: jsonLd && jsonLd['headline'] ?
        jsonLd['headline'] :
        user().assertElement(
            this.win_.document.head.querySelector('title'),
            'Please set <title> or structured data (JSON-LD).').textContent,

      domainName:
          parseUrl(Services.documentInfoForDoc(ampdoc).canonicalUrl).hostname,
    };

    if (jsonLd && isArray(jsonLd['image']) && jsonLd['image'].length) {
      user().assert(isProtocolValid(jsonLd['image']),
          `Unsupported protocol for story image URL ${jsonLd['image']}`);
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
    return renderAsElement(this.win_.document, buildReplayButtonTemplate(
        this.win_.document,
        metadata.title,
        metadata.domainName,
        metadata.imageUrl));
  }
}
