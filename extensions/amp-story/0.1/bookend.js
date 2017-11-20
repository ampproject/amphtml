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
import {Animation} from '../../../src/animation';
import {KeyCodes} from '../../../src/utils/key-codes';
import {ShareWidget} from './share';
import {EventType, dispatch} from './events';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {getJsonLd} from './jsonld';
import {isArray} from '../../../src/types';
import {parseUrl} from '../../../src/url';
import {renderAsElement, renderSimpleTemplate} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';
import * as tr from '../../../src/transition';


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
const FULLBLEED_THRESHOLD = 60;


/** @private @const {string} */
const FULLBLEED_CLASSNAME = 'i-amphtml-story-bookend-fullbleed';


/** @private @const {!./simple-template.ElementDef} */
const ROOT_TEMPLATE = {
  tag: 'section',
  attrs: dict({
    'class': 'i-amphtml-story-bookend',
    'hidden': true,
  }),
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
          children: [
            {
              tag: 'div',
              attrs: dict({
                'role': 'button',
                'class':
                    'i-amphtml-story-bookend-close i-amphtml-story-button',
              }),
            },
          ],
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
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-bookend-article-image'}),
      children: [
        // TODO(alanorozco): Figure out how to use amp-img here
        {
          tag: 'img',
          attrs: dict({
            'src': articleData.image,
            'width': 116,
            'height': 116,
          }),
        },
      ],
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
        attrs: dict({'class': 'i-amphtml-story-bookend-replay-image'}),
        children: [
          REPLAY_ICON_TEMPLATE,
          // TODO(alanorozco): Figure out how to use amp-img here
          {
            tag: 'img',
            attrs: dict({
              'src': opt_imageUrl,
              'width': 80,
              'height': 80,
            }),
          },
        ],
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

    /** @private {!ShareWidget} */
    this.shareWidget_ = ShareWidget.create(win);
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

    this.closeBtn_ =
        this.root_.querySelector('.i-amphtml-story-bookend-close');

    this.getInnerContainer_().appendChild(this.replayBtn_);
    this.getInnerContainer_().appendChild(this.shareWidget_.build(ampdoc));

    this.attachEvents_();

    return this.getRoot();
  }

  /** @private */
  attachEvents_() {
    // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
    this.replayBtn_.addEventListener('click', e => this.onReplayBtnClick_(e));
    this.closeBtn_.addEventListener('click', e => this.onClose_(e));

    this.getOverflowContainer_().addEventListener('scroll',
        // minInterval is high since this is a step function that does not
        // require smoothness
        throttle(this.win_, () => this.onScroll_(), 100));

    this.win_.addEventListener('keyup', e => {
      if (!this.isActive) {
        return;
      }
      if (e.keyCode == KeyCodes.ESCAPE) {
        this.onClose_(e);
      }
    });
  }

  /** @return {boolean} */
  isActive() {
    return this.isBuilt_ && !this.getRoot().hasAttribute('hidden');
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
   * @param {!Event} e
   * @private
   */
  onClose_(e) {
    e.stopPropagation();
    dispatch(this.getRoot(), EventType.CLOSE_BOOKEND, /* opt_bubbles */ true);
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

  /**
   * Hides bookend with a transition.
   * Uses animation utils instead of CSS transition for convenience and
   * coordination (i.e. listening to transition end).
   */
  hide() {
    const transition = tr.setStyles(this.getRoot(), {
      transform: tr.translateY(tr.numeric(0, this.getViewportHeight_())),
    });

    Animation.animate(this.getRoot(), transition, 300, 'ease-in')
        .thenAlways(() => {
          this.getRoot().setAttribute('hidden', true);
        });
  }

  /**
   * Shows bookend with a transition.
   * Uses animation utils instead of CSS transition for convenience and
   * coordination (i.e. listening to transition end).
   */
  show() {
    const transition = tr.setStyles(this.getRoot(), {
      transform: tr.translateY(tr.numeric(this.getViewportHeight_(), 0)),
    });

    this.getRoot().classList.remove(FULLBLEED_CLASSNAME);
    this.getRoot().removeAttribute('hidden');
    this.getRoot()./*OK*/scrollTop = 0;

    Animation.animate(this.getRoot(), transition, 300, 'ease-out');
  }

  /**
   * @return {number}
   * @private
   */
  getViewportHeight_() {
    return Services.viewportForDoc(this.getRoot()).getSize().height;
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
    return renderAsElement(this.win_.document, buildReplayButtonTemplate(
        this.win_.document,
        metadata.title,
        metadata.domainName,
        metadata.imageUrl));
  }
}
