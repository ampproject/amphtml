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
import {Action, StateProperty} from './amp-story-store-service';
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
import {relatedArticlesFromJson} from './related-articles';
import {renderAsElement, renderSimpleTemplate} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';


/**
 * @typedef {{
 *   shareProviders: (!JsonObject|undefined),
 *   relatedArticles: !Array<!./related-articles.RelatedArticleSetDef>
 * }}
 */
export let BookendConfigDef;


/** @private @const {string} */
const BOOKEND_CONFIG_ATTRIBUTE_NAME = 'bookend-config-src';


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


/** @type {string} */
const TAG = 'amp-story';


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
      'target': '_top',
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
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} storyElement Element where to append the bookend
   */
  constructor(ampdoc, storyElement) {
    /** @private @const {!Window} */
    this.win_ = ampdoc.win;

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?./bookend.BookendConfigDef=} Fetched bookend config */
    this.config_;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.replayButton_ = null;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {!ScrollableShareWidget} */
    this.shareWidget_ = ScrollableShareWidget.create(this.win_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win_);

    /** @private @const {!Element} */
    this.storyElement_ = storyElement;
  }

  /**
   * Builds the bookend components and appends it to the provided story.
   */
  build() {
    if (this.isBuilt_) {
      return;
    }

    this.isBuilt_ = true;

    this.root_ = renderAsElement(this.win_.document, ROOT_TEMPLATE);

    this.replayButton_ = this.buildReplayButton_();

    const innerContainer = this.getInnerContainer_();
    innerContainer.appendChild(this.replayButton_);
    innerContainer.appendChild(this.shareWidget_.build(this.ampdoc_));

    this.initializeListeners_();

    this.storyElement_.appendChild(this.getRoot());
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.root_.addEventListener('click', event => this.maybeClose_(event));
    this.replayButton_.addEventListener(
        'click', event => this.onReplayButtonClick_(event));

    this.getOverflowContainer_().addEventListener('scroll',
        // minInterval is high since this is a step function that does not
        // require smoothness
        throttle(this.win_, () => this.onScroll_(), 100));

    this.win_.addEventListener('keyup', event => {
      if (!this.isActive()) {
        return;
      }
      if (event.keyCode == KeyCodes.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });

    this.storeService_.subscribe(
        StateProperty.BOOKEND_STATE, isActive => this.toggle_(isActive));
  }

  /** @return {boolean} */
  isActive() {
    return this.isBuilt() &&
        !this.getRoot().classList.contains(HIDDEN_CLASSNAME);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onReplayButtonClick_(event) {
    event.stopPropagation();
    dispatch(this.getRoot(), EventType.REPLAY, /* opt_bubbles */ true);
  }

  /**
   * Retrieves the publisher bookend configuration. Applying the configuration
   * will prerender the bookend DOM, but there are cases where we need it before
   * the component is built. Eg: the desktop share button needs the providers.
   * @param {boolean=} applyConfig  Whether the config should be set.
   * @return {!Promise<?./bookend.BookendConfigDef>}
   * @private
   */
  loadConfig(applyConfig = true) {
    if (this.config_ !== undefined) {
      if (applyConfig) {
        this.setConfig(this.config_);
      }
      return Promise.resolve(this.config_);
    }

    return this.loadJsonFromAttribute_(BOOKEND_CONFIG_ATTRIBUTE_NAME)
        .then(response  => {
          if (!response) {
            return null;
          }

          this.config_ = {
            shareProviders: response['share-providers'],
            relatedArticles:
                relatedArticlesFromJson(response['related-articles']),
          };

          // Allows the config to be fetched before the component is built, for
          // cases like getting the share providers on desktop.
          if (applyConfig) {
            this.setConfig(this.config_);
          }

          return this.config_;
        })
        .catch(e => {
          user().error(TAG, 'Error fetching bookend configuration', e.message);
          return null;
        });
  }

  /**
   * @param {string} attributeName
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   * @private
   */
  loadJsonFromAttribute_(attributeName) {
    if (!this.storyElement_.hasAttribute(attributeName)) {
      return Promise.resolve(null);
    }

    const rawUrl = this.storyElement_.getAttribute(attributeName);
    const opts = {};
    opts.requireAmpResponseSourceOrigin = false;

    return Services.urlReplacementsForDoc(this.ampdoc_)
        .expandUrlAsync(user().assertString(rawUrl))
        .then(url => Services.xhrFor(this.win_).fetchJson(url, opts))
        .then(response => {
          user().assert(response.ok, 'Invalid HTTP response for bookend JSON');
          return response.json();
        });
  }

  /**
   * Closes bookend if tapping outside usable area.
   * @param {!Event} event
   * @private
   */
  maybeClose_(event) {
    if (this.elementOutsideUsableArea_(dev().assertElement(event.target))) {
      event.stopPropagation();
      this.close_();
    }
  }

  /**
   * Closes the bookend.
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_BOOKEND, false);
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
   * @return {{
   *   title: string,
   *   domainName: string,
   *   imageUrl: (string|undefined),
   * }}
   * @private
   */
  getStoryMetadata_() {
    const jsonLd = getJsonLd(this.ampdoc_.getRootNode());

    const metadata = {
      title: jsonLd && jsonLd['headline'] ?
        jsonLd['headline'] :
        user().assertElement(
            this.win_.document.head.querySelector('title'),
            'Please set <title> or structured data (JSON-LD).').textContent,

      domainName: parseUrl(
          Services.documentInfoForDoc(this.ampdoc_).canonicalUrl).hostname,
    };

    if (jsonLd && isArray(jsonLd['image']) && jsonLd['image'].length) {
      user().assert(isProtocolValid(jsonLd['image']),
          `Unsupported protocol for story image URL ${jsonLd['image']}`);
      metadata.imageUrl = jsonLd['image'][0];
    }

    return metadata;
  }

  /**
   * @return {!Element}
   * @private
   */
  buildReplayButton_() {
    const metadata = this.getStoryMetadata_(this.ampdoc_);
    return renderAsElement(this.win_.document, buildReplayButtonTemplate(
        this.win_.document,
        metadata.title,
        metadata.domainName,
        metadata.imageUrl));
  }
}
