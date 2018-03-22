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
import {CSS} from '../../../build/amp-story-bookend-0.1.css';
import {EventType, dispatch} from './events';
import {KeyCodes} from '../../../src/utils/key-codes';
import {ScrollableShareWidget} from './share';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {createShadowRoot} from '../../../src/shadow-embed';
import {dev, user} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {getAmpdoc} from '../../../src/service';
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
 * This component has to be built and preloaded before it can be displayed,
 * through the 'build' and 'loadConfig' method. It can then be toggled by
 * dispatching the store TOGGLE_BOOKEND action.
 */
export class Bookend {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement Element where to append the bookend
   */
  constructor(win, storyElement) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?./bookend.BookendConfigDef|undefined} */
    this.config_;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {boolean} */
    this.isConfigRendered_ = false;

    /** @private {?Element} */
    this.replayButton_ = null;

    /**
     * Root element containing a shadow DOM root.
     * @private {?Element}
     */
    this.root_ = null;

    /**
     * Actual bookend.
     * @private {?Element}
     */
    this.bookendEl_ = null;

    /** @private {!ScrollableShareWidget} */
    this.shareWidget_ = ScrollableShareWidget.create(this.win_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win_);

    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);
  }

  /**
   * Builds the bookend components and appends it to the provided story.
   */
  build() {
    if (this.isBuilt_) {
      return;
    }

    this.isBuilt_ = true;

    this.root_ = this.win_.document.createElement('div');
    const shadowRoot = createShadowRoot(this.root_);

    this.bookendEl_ = renderAsElement(this.win_.document, ROOT_TEMPLATE);

    const style = this.win_.document.createElement('style');
    style./*OK*/textContent = CSS;

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(this.bookendEl_);

    this.replayButton_ = this.buildReplayButton_();

    const ampdoc = getAmpdoc(this.storyElement_);

    const innerContainer = this.getInnerContainer_();
    innerContainer.appendChild(this.replayButton_);
    innerContainer.appendChild(this.shareWidget_.build(ampdoc));
    this.initializeListeners_();

    if (this.storeService_.get(StateProperty.DESKTOP_STATE)) {
      this.toggleDesktopAttribute_(true);
    }

    this.vsync_.mutate(() => {
      this.storyElement_.appendChild(this.getRoot());
    });
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.getRoot().addEventListener('click', event => this.maybeClose_(event));
    this.replayButton_.addEventListener(
        'click', event => this.onReplayButtonClick_(event));

    this.getOverflowContainer_().addEventListener('scroll',
        // minInterval is high since this is a step function that does not
        // require smoothness
        throttle(this.win_, () => this.onScroll_(), 100));

    this.win_.addEventListener('keyup', event => {
      if (!this.isActive_()) {
        return;
      }
      if (event.keyCode == KeyCodes.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(StateProperty.DESKTOP_STATE, isDesktop => {
      this.onDesktopStateUpdate_(isDesktop);
    });
  }

  /**
   * Whether the bookend is displayed.
   * @return {boolean}
   * @private
   */
  isActive_() {
    return !!this.storeService_.get(StateProperty.BOOKEND_STATE);
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
   * Reacts to bookend state updates.
   * @param {boolean} isActive
   * @private
   */
  onBookendStateUpdate_(isActive) {
    this.toggle_(isActive);
  }

  /**
   * Reacts to desktop state updates.
   * @param {boolean} isDesktop
   * @private
   */
  onDesktopStateUpdate_(isDesktop) {
    this.toggleDesktopAttribute_(isDesktop);
  }

  /**
   * Retrieves the publisher bookend configuration. Applying the configuration
   * will prerender the bookend DOM, but there are cases where we need it before
   * the component is built. Eg: the desktop share button needs the providers.
   * @param {boolean=} applyConfig  Whether the config should be set.
   * @return {!Promise<?./bookend.BookendConfigDef>}
   */
  loadConfig(applyConfig = true) {
    if (this.config_ !== undefined) {
      if (applyConfig && this.config_) {
        this.setConfig_(this.config_);
      }
      return Promise.resolve(this.config_);
    }

    return this.loadJsonFromAttribute_(BOOKEND_CONFIG_ATTRIBUTE_NAME)
        .then(response => {
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
            this.setConfig_(this.config_);
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

    const ampdoc = getAmpdoc(this.storyElement_);

    return Services.urlReplacementsForDoc(ampdoc)
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
    if (!this.isActive_()) {
      return;
    }
    this.vsync_.run({
      measure: state => {
        state.shouldBeFullBleed =
            this.getOverflowContainer_()./*OK*/scrollTop >= FULLBLEED_THRESHOLD;
      },
      mutate: state => {
        this.getShadowRoot().classList.toggle(
            FULLBLEED_CLASSNAME, state.shouldBeFullBleed);
      },
    }, {});
  }

  /**
   * @param {boolean} show
   * @private
   */
  toggle_(show) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(HIDDEN_CLASSNAME, !show);
    });
  }

  /**
   * Toggles the bookend desktop UI.
   * @param {boolean} isDesktop
   * @private
   */
  toggleDesktopAttribute_(isDesktop) {
    this.vsync_.mutate(() => {
      isDesktop ?
          this.getShadowRoot().setAttribute('desktop', '') :
          this.getShadowRoot().removeAttribute('desktop');
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
   * @private
   */
  setConfig_(bookendConfig) {
    if (this.isConfigRendered_) {
      return;
    }

    this.assertBuilt_();
    this.isConfigRendered_ = true;

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
    this.vsync_.mutate(() => {
      this.getInnerContainer_().appendChild(
          renderSimpleTemplate(this.win_.document,
              buildArticlesContainerTemplate(articleSets)));
    });
  }

  /** @return {!Element} */
  getRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.root_);
  }

  /** @return {!Element} */
  getShadowRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.bookendEl_);
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
    return dev().assertElement(this.getShadowRoot().firstElementChild);
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
    const ampdoc = getAmpdoc(this.storyElement_);
    const jsonLd = getJsonLd(ampdoc.getRootNode());

    const metadata = {
      title: jsonLd && jsonLd['headline'] ?
        jsonLd['headline'] :
        user().assertElement(
            this.win_.document.head.querySelector('title'),
            'Please set <title> or structured data (JSON-LD).').textContent,

      domainName: parseUrl(
          Services.documentInfoForDoc(ampdoc).canonicalUrl).hostname,
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
    const metadata = this.getStoryMetadata_();
    return renderAsElement(this.win_.document, buildReplayButtonTemplate(
        this.win_.document,
        metadata.title,
        metadata.domainName,
        metadata.imageUrl));
  }
}
