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

import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from '../amp-story-store-service';
import {ActionTrust} from '../../../../src/action-constants';
import {BookendComponent} from './bookend-component';
import {CSS} from '../../../../build/amp-story-bookend-1.0.css';
import {
  DEPRECATED_SHARE_PROVIDERS_KEY,
  SHARE_PROVIDERS_KEY,
  ScrollableShareWidget,
} from '../amp-story-share';
import {EventType, dispatch} from '../events';
import {Keys} from '../../../../src/utils/key-codes';
import {LocalizedStringId} from '../../../../src/localized-strings';
import {Services} from '../../../../src/services';
import {closest} from '../../../../src/dom';
import {createShadowRootWithStyle} from '../utils';
import {dev, devAssert, user, userAssert} from '../../../../src/log';
import {dict} from '../../../../src/utils/object';
import {getAmpdoc} from '../../../../src/service';
import {getJsonLd} from '../jsonld';
import {getRequestService} from '../amp-story-request-service';
import {isArray} from '../../../../src/types';
import {renderAsElement} from '../simple-template';
import {toggle} from '../../../../src/style';


/** @private @const {string} */
const HIDDEN_CLASSNAME = 'i-amphtml-hidden';

// TODO(#14591): Clean when bookend API v0.1 is deprecated.
const BOOKEND_VERSION_1 = 'v1.0';
const BOOKEND_VERSION_0 = 'v0.1';

/**
 * Key for components in bookend config.
 * @private @const {string}
 */
const BOOKEND_VERSION_KEY = 'bookendVersion';

/**
 * Deprecated key for components in bookend config.
 * @private @const {string}
 */
const DEPRECATED_BOOKEND_VERSION_KEY = 'bookend-version';

/**
 * @param {string} hidden
 * @return {!../simple-template.ElementDef}
 */
const buildRootTemplate = hidden => {
  return /** @type {!../simple-template.ElementDef} */ ({
    tag: 'section',
    attrs: dict({
      'class': 'i-amphtml-story-bookend i-amphtml-story-system-reset ' +
          hidden}),
    children: [
      // Overflow container that gets pushed to the bottom when content height
      // is smaller than viewport.
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
  });
};

/** @private @const {!../simple-template.ElementDef} */
const REPLAY_ICON_TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-bookend-replay-icon'}),
};

/** @type {string} */
const TAG = 'amp-story-bookend';

/**
 * @param {string} title
 * @param {string} domainName
 * @param {string=} imageUrl
 * @return {!../simple-template.ElementDef}
 */
const buildReplayButtonTemplate = (title, domainName, imageUrl = undefined) => {
  return /** @type {!../simple-template.ElementDef} */ ({
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-bookend-replay ' +
      'i-amphtml-story-bookend-top-level'}),
    children: [
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-bookend-article-text-content'}),
        children: [
          {
            tag: 'h2',
            attrs: dict({'class': 'i-amphtml-story-bookend-article-heading'}),
            unlocalizedString: title,
          },
          {
            tag: 'div',
            attrs: dict({'class': 'i-amphtml-story-bookend-component-meta'}),
            unlocalizedString: domainName,
          },
        ],
      },
      !imageUrl ? REPLAY_ICON_TEMPLATE : {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-bookend-replay-image',
          'style': `background-image: url(${imageUrl}) !important`,
        }),
        children: [REPLAY_ICON_TEMPLATE],
      },
    ],
  });
};

/**
 * @param {?string} consentId
 * @return {!../simple-template.ElementDef}
 */
const buildPromptConsentTemplate = consentId => {
  return /** @type {!../simple-template.ElementDef} */ ({
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-bookend-consent ' +
        'i-amphtml-story-bookend-top-level'}),
    children: [
      {
        tag: 'h3',
        attrs: dict({'class': 'i-amphtml-story-bookend-heading ' +
          ' i-amphtml-story-bookend-component'}),
        localizedStringId:
            LocalizedStringId.AMP_STORY_BOOKEND_PRIVACY_SETTINGS_TITLE,
      },
      {
        tag: 'h2',
        attrs: dict({
          'class': 'i-amphtml-story-bookend-consent-button ' +
            'i-amphtml-story-bookend-component',
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
 * Bookend component for <amp-story>.
 * This component has to be built and preloaded before it can be displayed,
 * through the 'build' and 'loadConfig' method. It can then be toggled by
 * dispatching the store TOGGLE_BOOKEND action.
 */
export class AmpStoryBookend extends AMP.BaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?./bookend-component.BookendDataDef} */
    this.config_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {boolean} */
    this.isBookendRendered_ = false;

    /** @private {?Element} */
    this.replayButton_ = null;

    /**
     * Actual bookend.
     * @private {?Element}
     */
    this.bookendEl_ = null;

    const {win} = this;

    /** @private {?ScrollableShareWidget} */
    this.shareWidget_ = null;

    /** @private @const {!../amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);
  }

  /**
   * Builds the bookend components and appends it to the provided story.
   * @param {boolean} skipAnimation Skips opening animation of the bookend.
   */
  build(skipAnimation = false) {
    if (this.isBuilt_) {
      return;
    }

    this.isBuilt_ = true;

    this.bookendEl_ =
        renderAsElement(this.win.document, buildRootTemplate(skipAnimation ?
          '' : HIDDEN_CLASSNAME));

    createShadowRootWithStyle(this.element, this.bookendEl_, CSS);

    this.replayButton_ = this.buildReplayButton_();

    this.shareWidget_ =
        ScrollableShareWidget.create(
            this.win, dev().assertElement(this.element.parentElement));

    const innerContainer = this.getInnerContainer_();
    innerContainer.appendChild(this.replayButton_);
    innerContainer.appendChild(
        this.shareWidget_.build(getAmpdoc(this.win.document)));

    const consentId = this.storeService_.get(StateProperty.CONSENT_ID);

    if (consentId) {
      const promptConsentEl =
          renderAsElement(
              this.win.document, buildPromptConsentTemplate(String(consentId)));
      innerContainer.appendChild(promptConsentEl);
    }

    this.initializeListeners_();

    // Removes the [hidden] attribute the runtime sets because of the
    // [layout="nodisplay"].
    toggle(this.element, true);
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.getShadowRoot()
        .addEventListener('click', event => this.onClick_(event));
    this.replayButton_
        .addEventListener('click', event => this.onReplayButtonClick_(event));

    this.win.addEventListener('keyup', event => {
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

    this.storeService_.subscribe(StateProperty.CAN_SHOW_SHARING_UIS, show => {
      this.onCanShowSharingUisUpdate_(show);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.UI_STATE, uiState => {
      this.onUIStateUpdate_(uiState);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.RTL_STATE, rtlState => {
      this.onRtlStateUpdate_(rtlState);
    }, true /** callToInitialize */);
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
    dispatch(this.win, this.element, EventType.REPLAY,
    /* payload */ undefined, {bubbles: true});
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
    this.mutateElement(() => {
      this.getShadowRoot()
          .classList.toggle('i-amphtml-story-no-sharing', !canShowSharingUis);
    });
  }

  /**
   * Reacts to UI state updates.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.mutateElement(() => {
      [UIType.DESKTOP_FULLBLEED, UIType.DESKTOP_PANELS].includes(uiState) ?
        this.getShadowRoot().setAttribute('desktop', '') :
        this.getShadowRoot().removeAttribute('desktop');
    });
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState ?
        this.getShadowRoot().setAttribute('dir', 'rtl') :
        this.getShadowRoot().removeAttribute('dir');
    });
  }

  /**
   * Reads the bookend version from the bookend JSON config.
   * @param {!JsonObject} config
   * @return {?string}
   * @private
   */
  readBookendVersion_(config) {
    if (config[DEPRECATED_BOOKEND_VERSION_KEY]) {
      user().warn('AMP-STORY-BOOKEND', '`bookend-version` and ' +
      '`share-providers` keys in the bookend config are deprecated, please ' +
      '`bookendVersion` and `shareProviders` keys');
    }

    return config[DEPRECATED_BOOKEND_VERSION_KEY] ||
      config[BOOKEND_VERSION_KEY] || null;
  }

  /**
   * Retrieves the publisher bookend configuration.
   * @return {!Promise<?./bookend-component.BookendDataDef>}
   */
  loadConfig() {
    if (this.config_) {
      return Promise.resolve(this.config_);
    }

    const requestService =
        getRequestService(
            this.win, dev().assertElement(this.element.parentElement));

    return requestService.loadBookendConfig().then(response => {
      if (!response) {
        return null;
      }
      if (this.readBookendVersion_(response) === BOOKEND_VERSION_1) {
        const components = BookendComponent.buildFromJson(
            response['components'], this.element);

        this.config_ = /** @type {./bookend-component.BookendDataDef} */ ({
          [BOOKEND_VERSION_KEY]: BOOKEND_VERSION_1,
          'components': components,
          'shareProviders': response[SHARE_PROVIDERS_KEY] ||
            response[DEPRECATED_SHARE_PROVIDERS_KEY],
        });
      } else {
        dev().warn(TAG, `Version ${BOOKEND_VERSION_0} of the amp-story` +
        `-bookend is deprecated. Use ${BOOKEND_VERSION_1} instead.`);
      }
      return this.config_;
    }).catch(e => {
      user().error(TAG, 'Error fetching bookend configuration', e.message);
      return null;
    });
  }

  /**
   * Retrieves the publisher bookend configuration. Applying the configuration
   * will prerender the bookend DOM, but there are cases where we need it before
   * the component is built. Eg: the desktop share button needs the providers.
   * @param {boolean=} renderBookend  Whether the bookend should be rendered.
   * When set to false it allows the config to be fetched before the component
   * is built, for cases like getting the share providers
   * on desktop.
   * @return {!Promise<?./bookend-component.BookendDataDef>}
   */
  loadConfigAndMaybeRenderBookend(renderBookend = true) {
    return this.loadConfig().then(config => {
      if (renderBookend && !this.isBookendRendered_ && config) {
        return this.renderBookend_(config).then(() => config);
      }
      return config;
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
      const actionService = Services.actionServiceForDoc(this.element);
      actionService.trigger(target, 'tap', event, ActionTrust.HIGH);
    }
  }

  /**
   * Closes the bookend.
   * @private
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_BOOKEND, false);
  }

  /**
   * @param {!Element} el
   * @return {boolean}
   * @private
   */
  elementOutsideUsableArea_(el) {
    return !closest(el, el => el == this.getInnerContainer_());
  }

  /**
   * @param {boolean} show
   * @private
   */
  toggle_(show) {
    this.mutateElement(() => {
      this.getShadowRoot().classList.toggle(HIDDEN_CLASSNAME, !show);
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
   * @param {!./bookend-component.BookendDataDef} bookendConfig
   * @return {!Promise}
   * @private
   */
  renderBookend_(bookendConfig) {
    this.assertBuilt_();
    this.isBookendRendered_ = true;

    return this.renderComponents_(bookendConfig.components);
  }

  /**
   * Renders the configurable components of the bookend in the page. It returns
   * a promise to ensure loadConfigAndMaybeRenderBookend renders the components
   * first before proceeding. This is needed for our unit tests.
   * @param {!Array<!../bookend/bookend-component.BookendComponentDef>} components
   * @return {!Promise}
   * @private
   */
  renderComponents_(components) {
    dev().assertElement(this.bookendEl_, 'Error rendering amp-story-bookend.');

    return Services
        .localizationServiceForOrNull(this.win).then(localizationService => {
          const bookendEls = BookendComponent
              .buildElements(
                  components, this.win.document, localizationService);
          const container = dev().assertElement(
              BookendComponent.buildContainer(this.getInnerContainer_(),
                  this.win.document));
          this.mutateElement(() => container.appendChild(bookendEls));
        }).catch(e => {
          user().error(TAG, 'Unable to fetch localization service.', e.message);
          return null;
        });
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
    const jsonLd = getJsonLd(this.getAmpDoc().getRootNode());

    const urlService = Services.urlForDoc(this.element);
    const {canonicalUrl} = Services.documentInfoForDoc(this.getAmpDoc());
    const {hostname: domainName} = urlService.parse(canonicalUrl);

    const title =
      jsonLd && jsonLd['headline'] ?
        jsonLd['headline'] :
        user().assertElement(
            this.win.document.head.querySelector('title'),
            'Please set <title> or structured data (JSON-LD).').textContent;

    const metadata = {domainName, title};
    const image = jsonLd && isArray(jsonLd['image']) ? jsonLd['image'] : null;

    if (image != null && image.length >= 0) {
      userAssert(urlService.isProtocolValid(image[0]),
          `Unsupported protocol for story image URL ${image[0]}`);
      metadata.imageUrl = image[0];
    }

    return metadata;
  }

  /**
   * @return {!Element}
   * @private
   */
  buildReplayButton_() {
    const metadata = this.getStoryMetadata_();
    return renderAsElement(this.win.document, buildReplayButtonTemplate(
        metadata.title,
        metadata.domainName,
        metadata.imageUrl));
  }
}
