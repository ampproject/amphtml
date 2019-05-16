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
import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-story-bookend-0.1.css';
import {
  DEPRECATED_SHARE_PROVIDERS_KEY,
  SHARE_PROVIDERS_KEY,
  ScrollableShareWidget,
} from './amp-story-share';
import {EventType, dispatch} from './events';
import {Keys} from '../../../src/utils/key-codes';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {getAmpdoc} from '../../../src/service';
import {getJsonLd} from './jsonld';
import {isArray} from '../../../src/types';
import {isProtocolValid, parseUrlDeprecated} from '../../../src/url';
import {
  parseArticlesToClassicApi,
  relatedArticlesFromJson,
} from './related-articles';
import {renderAsElement, renderSimpleTemplate} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';

/**
 * Key for omponents in bookend config.
 * @private @const {string}
 */
const BOOKEND_VERSION_KEY = 'bookendVersion';
const BOOKEND_VERSION_1 = 'v1.0';

/**
 * Deprecated key for components in bookend config.
 * @private @const {string}
 */
const DEPRECATED_BOOKEND_VERSION_KEY = 'bookend-version';

/**
 * @typedef {{
 *   shareProviders: (!JsonObject|!Object<string, !JsonObject>),
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
    'class':
      'i-amphtml-story-bookend i-amphtml-story-system-reset ' +
      HIDDEN_CLASSNAME,
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
 * @param {?string} consentId
 * @return {!./simple-template.ElementDef}
 */
const buildPromptConsentTemplate = consentId => {
  return /** @type {!./simple-template.ElementDef} */ ({
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-bookend-consent'}),
    children: [
      {
        tag: 'h3',
        attrs: dict({'class': 'i-amphtml-story-bookend-heading'}),
        localizedStringId:
          LocalizedStringId.AMP_STORY_BOOKEND_PRIVACY_SETTINGS_TITLE,
      },
      {
        tag: 'h2',
        attrs: dict({
          'class': 'i-amphtml-story-bookend-consent-button',
          'on': `tap:${consentId}.prompt`,
          'role': 'button',
          'aria-label': 'Change data privacy settings',
        }),
        localizedStringId:
          LocalizedStringId.AMP_STORY_BOOKEND_PRIVACY_SETTINGS_BUTTON_LABEL,
      },
    ],
  });
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
      'target': '_top',
    }),
    children: [
      {
        tag: 'h2',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-heading'}),
        unlocalizedString: articleData.title,
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-meta'}),
        unlocalizedString: articleData.domainName,
      },
    ],
  });

  if (articleData.image) {
    template.children.unshift(
      /** @type {!./simple-template.ElementDef} */ ({
        tag: 'amp-img',
        attrs: dict({
          'class': 'i-amphtml-story-bookend-article-image',
          'src': articleData.image,
          'width': 100,
          'height': 100,
        }),
      })
    );
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
        unlocalizedString: articleSet.heading,
      });
    }
    template.push({
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-bookend-article-set'}),
      children: articleSet.articles.map(article =>
        buildArticleTemplate(article)
      ),
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
      !opt_imageUrl
        ? REPLAY_ICON_TEMPLATE
        : {
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
        unlocalizedString: title,
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-meta'}),
        unlocalizedString: domainName,
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
   * @param {!Element} parentEl Element where to append the bookend
   */
  constructor(win, parentEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?./amp-story-bookend.BookendConfigDef|undefined} */
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

    /** @private @const {!./amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = Services.storyRequestServiceV01(this.win_);

    /** @private {!ScrollableShareWidget} */
    this.shareWidget_ = ScrollableShareWidget.create(this.win_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreServiceV01(this.win_);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;

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
    this.bookendEl_ = renderAsElement(this.win_.document, ROOT_TEMPLATE);

    createShadowRootWithStyle(this.root_, this.bookendEl_, CSS);

    this.replayButton_ = this.buildReplayButton_();

    const ampdoc = getAmpdoc(this.parentEl_);

    const innerContainer = this.getInnerContainer_();
    innerContainer.appendChild(this.replayButton_);
    innerContainer.appendChild(this.shareWidget_.build(ampdoc));

    const consentId = this.storeService_.get(StateProperty.CONSENT_ID);

    if (consentId) {
      const promptConsentEl = renderAsElement(
        this.win_.document,
        buildPromptConsentTemplate(String(consentId))
      );
      innerContainer.appendChild(promptConsentEl);
    }

    this.initializeListeners_();

    this.vsync_.mutate(() => {
      this.parentEl_.appendChild(this.getRoot());
    });
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.getShadowRoot().addEventListener('click', event =>
      this.onClick_(event)
    );
    this.replayButton_.addEventListener('click', event =>
      this.onReplayButtonClick_(event)
    );

    this.getOverflowContainer_().addEventListener(
      'scroll',
      // minInterval is high since this is a step function that does not
      // require smoothness
      throttle(this.win_, () => this.onScroll_(), 100)
    );

    this.win_.addEventListener('keyup', event => {
      if (!this.isActive_()) {
        return;
      }
      if (event.key == Keys.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(
      StateProperty.CAN_SHOW_SHARING_UIS,
      show => {
        this.onCanShowSharingUisUpdate_(show);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.DESKTOP_STATE,
      isDesktop => {
        this.onDesktopStateUpdate_(isDesktop);
      },
      true /** callToInitialize */
    );
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
   * Reacts to updates to whether sharing UIs may be shown, and updates the UI
   * accordingly.
   * @param {boolean} canShowSharingUis
   * @private
   */
  onCanShowSharingUisUpdate_(canShowSharingUis) {
    this.vsync_.mutate(() => {
      this.getShadowRoot().classList.toggle(
        'i-amphtml-story-no-sharing',
        !canShowSharingUis
      );
    });
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
   * Reads the bookend version from the bookend JSON config.
   * @param {!JsonObject} config
   * @return {?string}
   * @private
   */
  readBookendVersion_(config) {
    if (config[DEPRECATED_BOOKEND_VERSION_KEY]) {
      user().warn(
        'AMP-STORY-BOOKEND',
        '`bookend-version` and ' +
          '`share-providers` keys in the bookend config are deprecated, please ' +
          '`bookendVersion` and `shareProviders` keys'
      );
    }

    return (
      config[DEPRECATED_BOOKEND_VERSION_KEY] ||
      config[BOOKEND_VERSION_KEY] ||
      null
    );
  }

  /**
   * Retrieves the publisher bookend configuration. Applying the configuration
   * will prerender the bookend DOM, but there are cases where we need it before
   * the component is built. Eg: the desktop share button needs the providers.
   * @param {boolean=} applyConfig  Whether the config should be set.
   * @return {!Promise<?./amp-story-bookend.BookendConfigDef>}
   */
  loadConfig(applyConfig = true) {
    if (this.config_ !== undefined) {
      if (applyConfig && this.config_) {
        this.setConfig_(this.config_);
      }
      return Promise.resolve(this.config_);
    }

    return this.requestService_
      .loadBookendConfig()
      .then(response => {
        if (!response) {
          return null;
        }
        if (this.readBookendVersion_(response) === BOOKEND_VERSION_1) {
          this.config_ = {
            shareProviders: this.shareWidget_.parseProvidersToClassicApi(
              response[SHARE_PROVIDERS_KEY] ||
                response[DEPRECATED_SHARE_PROVIDERS_KEY]
            ),
            relatedArticles: parseArticlesToClassicApi(response['components']),
          };
        } else {
          this.config_ = {
            shareProviders: response['share-providers'],
            relatedArticles: relatedArticlesFromJson(
              response['related-articles']
            ),
          };
        }

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
   * Handles click events on the bookend:
   *   - Closes bookend if tapping outside usable area
   *   - Forwards AMP actions
   * @param {!Event} event
   * @private
   */
  onClick_(event) {
    const target = dev().assertElement(event.target);

    if (this.elementOutsideUsableArea_(target)) {
      event.stopPropagation();
      this.close_();
      return;
    }

    if (target.hasAttribute('on')) {
      const actionService = Services.actionServiceForDoc(this.parentEl_);
      actionService.trigger(target, 'tap', event, ActionTrust.HIGH);
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
    this.vsync_.run(
      {
        measure: state => {
          state.shouldBeFullBleed =
            this.getOverflowContainer_()./*OK*/ scrollTop >=
            FULLBLEED_THRESHOLD;
        },
        mutate: state => {
          this.getShadowRoot().classList.toggle(
            FULLBLEED_CLASSNAME,
            state.shouldBeFullBleed
          );
        },
      },
      {}
    );
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
      isDesktop
        ? this.getShadowRoot().setAttribute('desktop', '')
        : this.getShadowRoot().removeAttribute('desktop');
    });
  }

  /**
   * @return {boolean}
   */
  isBuilt() {
    return this.isBuilt_;
  }

  /** @private */
  assertBuilt_() {
    devAssert(this.isBuilt(), 'Bookend component needs to be built.');
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

    this.setRelatedArticles_(bookendConfig.relatedArticles);
  }

  /**
   * @param {!Array<!./related-articles.RelatedArticleSetDef>} articleSets
   * @private
   */
  setRelatedArticles_(articleSets) {
    this.vsync_.mutate(() => {
      this.getInnerContainer_().appendChild(
        renderSimpleTemplate(
          this.win_.document,
          buildArticlesContainerTemplate(articleSets)
        )
      );
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
    const ampdoc = getAmpdoc(this.parentEl_);
    const jsonLd = getJsonLd(ampdoc.getRootNode());

    const metadata = {
      title:
        jsonLd && jsonLd['headline']
          ? jsonLd['headline']
          : user().assertElement(
              this.win_.document.head.querySelector('title'),
              'Please set <title> or structured data (JSON-LD).'
            ).textContent,

      domainName: parseUrlDeprecated(
        Services.documentInfoForDoc(ampdoc).canonicalUrl
      ).hostname,
    };

    if (jsonLd && isArray(jsonLd['image']) && jsonLd['image'].length) {
      userAssert(
        isProtocolValid(jsonLd['image']),
        `Unsupported protocol for story image URL ${jsonLd['image']}`
      );
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
    return renderAsElement(
      this.win_.document,
      buildReplayButtonTemplate(
        this.win_.document,
        metadata.title,
        metadata.domainName,
        metadata.imageUrl
      )
    );
  }
}
