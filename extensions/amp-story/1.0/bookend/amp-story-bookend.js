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

import {AMP_STORY_BOOKEND_COMPONENT_DATA} from './components/bookend-component-interface';
import {Action, StateProperty, UIType} from '../amp-story-store-service';
import {ActionTrust} from '../../../../src/action-constants';
import {AnalyticsVariable, getVariableService} from '../variable-service';
import {BookendComponent} from './bookend-component';
import {CSS} from '../../../../build/amp-story-bookend-1.0.css';
import {
  DEPRECATED_SHARE_PROVIDERS_KEY,
  SHARE_PROVIDERS_KEY,
  ScrollableShareWidget,
} from '../amp-story-share';
import {DraggableDrawer} from '../amp-story-draggable-drawer';
import {EventType, dispatch} from '../events';
import {HistoryState, getHistoryState, setHistoryState} from '../history';
import {Keys} from '../../../../src/utils/key-codes';
import {LocalizedStringId} from '../../../../src/localized-strings';
import {Services} from '../../../../src/services';
import {StoryAnalyticsEvent, getAnalyticsService} from '../story-analytics';
import {closest, closestAncestorElementBySelector} from '../../../../src/dom';
import {createShadowRootWithStyle} from '../utils';
import {dev, devAssert, user, userAssert} from '../../../../src/log';
import {dict} from '../../../../src/utils/object';
import {getAmpdoc} from '../../../../src/service';
import {getJsonLd} from '../jsonld';
import {getLocalizationService} from '../amp-story-localization-service';
import {getRequestService} from '../amp-story-request-service';
import {isArray} from '../../../../src/types';
import {renderAsElement} from '../simple-template';
import {toggle} from '../../../../src/style';

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
 * Key used for retargeting event target originating from shadow DOM.
 * @const {string}
 */
const AMP_CUSTOM_LINKER_TARGET = '__AMP_CUSTOM_LINKER_TARGET__';

/**
 * @const {!../simple-template.ElementDef}
 */
const rootTemplate = {
  tag: 'section',
  attrs: dict({
    'class': 'i-amphtml-story-bookend i-amphtml-story-system-reset',
  }),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-bookend-handle'}),
    },
  ],
};

/** @const {!../simple-template.ElementDef} */
const REPLAY_ICON_TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-bookend-replay-icon'}),
};

/** @const {string} */
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
    attrs: dict({
      'class':
        'i-amphtml-story-bookend-replay i-amphtml-story-bookend-top-level',
    }),
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
      !imageUrl
        ? REPLAY_ICON_TEMPLATE
        : {
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
const buildPromptConsentTemplate = (consentId) => {
  return /** @type {!../simple-template.ElementDef} */ ({
    tag: 'div',
    attrs: dict({
      'class':
        'i-amphtml-story-bookend-consent ' +
        'i-amphtml-story-bookend-top-level',
    }),
    children: [
      {
        tag: 'h3',
        attrs: dict({
          'class':
            'i-amphtml-story-bookend-heading ' +
            ' i-amphtml-story-bookend-component',
        }),
        localizedStringId:
          LocalizedStringId.AMP_STORY_BOOKEND_PRIVACY_SETTINGS_TITLE,
      },
      {
        tag: 'h2',
        attrs: dict({
          'class':
            'i-amphtml-story-bookend-consent-button ' +
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
export class AmpStoryBookend extends DraggableDrawer {
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

    /** @private {?Element} */
    this.shadowHost_ = null;

    /** @private {?ScrollableShareWidget} */
    this.shareWidget_ = null;

    /** @private {!../story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win, this.element);

    /** @const @private {!../variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(this.win);
  }

  /**
   * @override
   */
  buildCallback() {
    super.buildCallback();

    this.headerEl_.classList.add(
      'i-amphtml-story-draggable-drawer-header-bookend'
    );
    this.element.classList.add('i-amphtml-story-draggable-drawer-bookend');

    const handleEl = this.win.document.createElement('div');
    handleEl.classList.add('i-amphtml-story-bookend-handle');
    this.headerEl_.appendChild(handleEl);
  }

  /**
   * @override
   */
  layoutCallback() {
    return Promise.resolve();
  }

  /**
   * Builds the bookend components and appends it to the provided story.
   */
  build() {
    if (this.isBuilt_) {
      return;
    }

    this.isBuilt_ = true;

    this.bookendEl_ = renderAsElement(this.win.document, rootTemplate);

    this.shadowHost_ = this.win.document.createElement('div');

    createShadowRootWithStyle(this.shadowHost_, this.bookendEl_, CSS);
    this.contentEl_.appendChild(this.shadowHost_);

    this.replayButton_ = this.buildReplayButton_();

    this.shareWidget_ = ScrollableShareWidget.create(
      this.win,
      dev().assertElement(this.element.parentElement)
    );

    this.bookendEl_.appendChild(this.replayButton_);
    this.bookendEl_.appendChild(
      this.shareWidget_.build(getAmpdoc(this.win.document))
    );

    const consentId = this.storeService_.get(StateProperty.CONSENT_ID);

    if (consentId) {
      const promptConsentEl = renderAsElement(
        this.win.document,
        buildPromptConsentTemplate(String(consentId))
      );
      this.bookendEl_.appendChild(promptConsentEl);
    }

    this.initializeListeners_();

    // Removes the [hidden] attribute the runtime sets because of the
    // [layout="nodisplay"].
    toggle(this.element, true);
  }

  /**
   * @override
   */
  initializeListeners_() {
    super.initializeListeners_();

    this.element.addEventListener('click', (event) =>
      this.onOuterShadowClick_(event)
    );

    this.getShadowRoot().addEventListener('click', (event) => {
      this.onInnerShadowClick_(event);
    });

    this.replayButton_.addEventListener('click', (event) =>
      this.onReplayButtonClick_(event)
    );

    this.win.addEventListener('keyup', (event) => {
      if (!this.isActive_()) {
        return;
      }
      if (event.key == Keys.ESCAPE) {
        event.preventDefault();
        this.storeService_.dispatch(Action.TOGGLE_BOOKEND, false);
      }
    });

    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, (isActive) => {
      this.onBookendStateUpdate_(isActive);
    });

    this.storeService_.subscribe(
      StateProperty.CAN_SHOW_SHARING_UIS,
      (show) => {
        this.onCanShowSharingUisUpdate_(show);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => {
        this.onRtlStateUpdate_(rtlState);
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
    dispatch(
      this.win,
      this.element,
      EventType.REPLAY,
      /* payload */ undefined,
      {bubbles: true}
    );
  }

  /**
   * @override
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_BOOKEND, false);
  }

  /**
   * Reacts to bookend state updates.
   * @param {boolean} isActive
   * @private
   */
  onBookendStateUpdate_(isActive) {
    const shouldAnimate = !getHistoryState(
      this.win,
      HistoryState.BOOKEND_ACTIVE
    );
    isActive ? this.open(shouldAnimate) : this.closeInternal_();
    this.analyticsService_.triggerEvent(
      isActive ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.element
    );
    setHistoryState(this.win, HistoryState.BOOKEND_ACTIVE, isActive);
  }

  /**
   * Reacts to updates to whether sharing UIs may be shown, and updates the UI
   * accordingly.
   * @param {boolean} canShowSharingUis
   * @private
   */
  onCanShowSharingUisUpdate_(canShowSharingUis) {
    this.mutateElement(() => {
      this.getShadowRoot().classList.toggle(
        'i-amphtml-story-no-sharing',
        !canShowSharingUis
      );
    });
  }

  /**
   * @override
   */
  onUIStateUpdate_(uiState) {
    super.onUIStateUpdate_(uiState);

    this.mutateElement(() => {
      [UIType.DESKTOP_FULLBLEED, UIType.DESKTOP_PANELS].includes(uiState)
        ? this.getShadowRoot().setAttribute('desktop', '')
        : this.getShadowRoot().removeAttribute('desktop');
    });
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState
        ? this.getShadowRoot().setAttribute('dir', 'rtl')
        : this.getShadowRoot().removeAttribute('dir');
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
   * Retrieves the publisher bookend configuration.
   * @return {!Promise<?./bookend-component.BookendDataDef>}
   */
  loadConfig() {
    if (this.config_) {
      return Promise.resolve(this.config_);
    }

    const requestService = getRequestService(
      this.win,
      dev().assertElement(this.element.parentElement)
    );

    return requestService
      .loadBookendConfig()
      .then((response) => {
        if (!response) {
          return null;
        }
        if (this.readBookendVersion_(response) === BOOKEND_VERSION_1) {
          const components = BookendComponent.buildFromJson(
            response['components'],
            this.element
          );

          this.config_ = /** @type {./bookend-component.BookendDataDef} */ ({
            [BOOKEND_VERSION_KEY]: BOOKEND_VERSION_1,
            'components': components,
            'shareProviders':
              response[SHARE_PROVIDERS_KEY] ||
              response[DEPRECATED_SHARE_PROVIDERS_KEY],
          });
        } else {
          dev().warn(
            TAG,
            `Version ${BOOKEND_VERSION_0} of the amp-story` +
              `-bookend is deprecated. Use ${BOOKEND_VERSION_1} instead.`
          );
        }
        return this.config_;
      })
      .catch((e) => {
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
    return this.loadConfig().then((config) => {
      if (renderBookend && !this.isBookendRendered_ && config) {
        this.renderBookend_(config);
      }
      return config;
    });
  }

  /**
   * Reacts to clicks outside the shadow root.
   * @param {!Event} event
   * @private
   */
  onOuterShadowClick_(event) {
    const target = dev().assertElement(event.target);
    if (this.elementOutsideBookend_(target)) {
      event.stopPropagation();
      this.storeService_.dispatch(Action.TOGGLE_BOOKEND, false);
      return;
    }
  }

  /**
   * Reacts to clicks inside the shadow root.
   * @param {!Event} event
   * @private
   */
  onInnerShadowClick_(event) {
    const target = dev().assertElement(event.target);
    event[AMP_CUSTOM_LINKER_TARGET] = target;

    this.fireAnalyticsEvent_(target);

    if (target.hasAttribute('on')) {
      const actionService = Services.actionServiceForDoc(this.element);
      actionService.trigger(target, 'tap', event, ActionTrust.HIGH);
    }
  }

  /**
   * Configures analytics variables and fires analytic event.
   * @param {!Element} target
   * @private
   */
  fireAnalyticsEvent_(target) {
    const anchorEl = closestAncestorElementBySelector(target, 'A');
    if (!anchorEl) {
      return;
    }

    const componentData = anchorEl[AMP_STORY_BOOKEND_COMPONENT_DATA];

    this.variableService_.onVariableUpdate(
      AnalyticsVariable.BOOKEND_TARGET_HREF,
      anchorEl.href
    );

    this.variableService_.onVariableUpdate(
      AnalyticsVariable.BOOKEND_COMPONENT_TYPE,
      componentData.type
    );

    this.variableService_.onVariableUpdate(
      AnalyticsVariable.BOOKEND_COMPONENT_POSITION,
      componentData.position
    );

    this.analyticsService_.triggerEvent(StoryAnalyticsEvent.BOOKEND_CLICK);
  }

  /**
   * Returns true if element is outside the bookend.
   * @param {!Element} el
   * @return {boolean}
   * @private
   */
  elementOutsideBookend_(el) {
    return !closest(el, (el) => el === this.shadowHost_);
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
   * @private
   */
  renderBookend_(bookendConfig) {
    this.assertBuilt_();
    this.isBookendRendered_ = true;

    this.renderComponents_(bookendConfig.components);
  }

  /**
   * Renders the configurable components of the bookend in the page. It returns
   * a promise to ensure loadConfigAndMaybeRenderBookend renders the components
   * first before proceeding. This is needed for our unit tests.
   * @param {!Array<!../bookend/bookend-component.BookendComponentDef>} components
   * @private
   */
  renderComponents_(components) {
    dev().assertElement(this.bookendEl_, 'Error rendering amp-story-bookend.');

    if (!components.length) {
      return;
    }

    const localizationService = getLocalizationService(this.element);
    if (!localizationService) {
      user().error(TAG, 'Unable to fetch localization service.');
      return;
    }

    const bookendEls = BookendComponent.buildElements(
      components,
      this.win,
      localizationService
    );
    const container = dev().assertElement(
      BookendComponent.buildContainer(this.getShadowRoot(), this.win.document)
    );
    this.mutateElement(() => container.appendChild(bookendEls));
  }

  /** @return {!Element} */
  getShadowRoot() {
    this.assertBuilt_();
    return dev().assertElement(this.bookendEl_);
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
      jsonLd && jsonLd['headline']
        ? jsonLd['headline']
        : user().assertElement(
            this.win.document.head.querySelector('title'),
            'Please set <title> or structured data (JSON-LD).'
          ).textContent;

    const metadata = {domainName, title};
    const image = jsonLd && isArray(jsonLd['image']) ? jsonLd['image'] : null;

    if (image != null && image.length >= 0) {
      userAssert(
        urlService.isProtocolValid(image[0]),
        `Unsupported protocol for story image URL ${image[0]}`
      );
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
    return renderAsElement(
      this.win.document,
      buildReplayButtonTemplate(
        metadata.title,
        metadata.domainName,
        metadata.imageUrl
      )
    );
  }
}
