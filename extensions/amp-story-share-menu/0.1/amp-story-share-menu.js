import {Keys_Enum} from '#core/constants/key-codes';
import {addAttributesToElement} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {closest, closestAncestorElementBySelector} from '#core/dom/query';
import {isObject} from '#core/types';
import {dict, map} from '#core/types/object';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '#core/window/clipboard';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {listen} from '#utils/event-helper';
import {dev, devAssert, user} from '#utils/log';

import {Toast} from './toast';

import {CSS} from '../../../build/amp-story-share-menu-0.1.css';
import {getAmpdoc} from '../../../src/service-helpers';
import {AmpSocialShare} from '../../amp-social-share/0.1/amp-social-share-impl';
import {getRequestService} from '../../amp-story/1.0/amp-story-request-service';
import {
  Action,
  StateProperty,
  UIType,
} from '../../amp-story/1.0/amp-story-store-service';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/** @const {string} Class to toggle the share menu. */
export const VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

/**
 * Maps share provider type to visible name.
 * If the name only needs to be capitalized (e.g. `facebook` to `Facebook`) it
 * does not need to be included here.
 * @const {!Object<string, !LocalizedStringId_Enum>}
 */
const SHARE_PROVIDER_LOCALIZED_STRING_ID = map({
  'system': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM,
  'email': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL,
  'facebook': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK,
  'line': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINE,
  'linkedin': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN,
  'pinterest': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST,
  'tumblr': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR,
  'twitter': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_TWITTER,
  'whatsapp': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP,
  'sms': LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_SMS,
});

/**
 * Key for share providers in config.
 * @const {string}
 */
export const SHARE_PROVIDERS_KEY = 'shareProviders';

/**
 * Deprecated key for share providers in config.
 * @const {string}
 */
export const DEPRECATED_SHARE_PROVIDERS_KEY = 'share-providers';

/**
 * Quick share template, used as a fallback if native sharing is not supported.
 * @return {!Element}
 */
const renderShareMenu = () => {
  return (
    <div class="i-amphtml-story-share-menu" aria-hidden="true" role="alert">
      <div class="i-amphtml-story-share-menu-container">
        <button
          class="i-amphtml-story-share-menu-close-button"
          aria-label="close"
          role="button"
        >
          &times;
        </button>
        <div class="i-amphtml-story-share-widget">
          <ul class="i-amphtml-story-share-list">
            <li class="i-amphtml-story-share-system" />
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * @param {!Node} child
 * @return {!Element} */
const renderShareItemListElement = (child) => (
  <li class="i-amphtml-story-share-item">{child}</li>
);

/**
 * @param {!JsonObject=} opt_params
 * @return {!JsonObject}
 */
function buildProviderParams(opt_params) {
  const attrs = dict();

  if (opt_params) {
    Object.keys(opt_params).forEach((field) => {
      if (field === 'provider') {
        return;
      }
      attrs[`data-param-${field}`] = opt_params[field];
    });
  }

  return attrs;
}

/**
 * Share menu UI.
 */
class AmpStoryShareMenu {
  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  constructor(element, win) {
    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.rootEl_ = null;

    /** @private {?Element} */
    this.closeButton_ = null;

    /** @private {?Element} */
    this.innerContainerEl_ = null;

    /** @private {?../../services/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {!AmpDoc} */
    this.ampdoc_ = getAmpdoc(element);

    /** @private {!Element} */
    this.storyEl_ = closestAncestorElementBySelector(element, 'amp-story');

    this.requestService_ = getRequestService(win, element);

    this.vsync_ = Services.vsyncFor(win);
  }

  /** @override */
  build() {
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win_).then((service) => {
        this.storeService_ = service;
      }),
      Services.localizationServiceForOrNull(this.element_).then((service) => {
        this.localizationService_ = service;
      }),
    ]).then(() => this.buildShareMenu_());
  }

  /**
   * Builds and appends the fallback UI.
   * @private
   */
  buildShareMenu_() {
    this.element_.classList.add('i-amphtml-story-share-menu-host');

    this.rootEl_ = renderShareMenu();
    createShadowRootWithStyle(this.element_, this.rootEl_, CSS);

    this.closeButton_ = dev().assertElement(
      this.rootEl_.querySelector('.i-amphtml-story-share-menu-close-button')
    );
    this.closeButton_.setAttribute(
      'aria-label',
      this.localizationService_.getLocalizedString(
        LocalizedStringId_Enum.AMP_STORY_CLOSE_BUTTON_LABEL
      )
    );

    this.initializeListeners_();

    this.innerContainerEl_ = this.rootEl_./*OK*/ querySelector(
      '.i-amphtml-story-share-menu-container'
    );

    this.loadProviders();
    this.maybeAddLinkShareButton_();
  }

  /** @private */
  maybeAddLinkShareButton_() {
    if (!isCopyingToClipboardSupported(this.win_.document)) {
      return;
    }

    const linkShareButton = this.renderLinkShareButtonElement_();

    this.add_(linkShareButton);

    listen(linkShareButton, 'click', (e) => {
      e.preventDefault();
      this.copyUrlToClipboard_();
    });
    listen(linkShareButton, 'keyup', (e) => {
      const code = e.charCode || e.keyCode;
      // Check if pressed Space or Enter to trigger button.
      if (code === 32 || code === 13) {
        e.preventDefault();
        this.copyUrlToClipboard_();
      }
    });
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.SHARE_MENU_STATE,
      (isOpen) => {
        this.onShareMenuStateUpdate_(isOpen);
      },
      true
    );

    this.rootEl_.addEventListener('click', (event) =>
      this.onShareMenuClick_(event)
    );

    this.win_.addEventListener('keyup', (event) => {
      if (event.key == Keys_Enum.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });
  }

  /**
   * Reacts to menu state updates and decides whether to show either the native
   * system sharing, or the fallback UI.
   * @param {boolean} isOpen
   * @private
   */
  onShareMenuStateUpdate_(isOpen) {
    this.vsync_.mutate(() => {
      this.rootEl_.classList.toggle(VISIBLE_CLASS, isOpen);
      this.rootEl_.setAttribute('aria-hidden', !isOpen);
    });
  }

  /**
   * Handles click events and maybe closes the menu for the fallback UI.
   * @param  {!Event} event
   */
  onShareMenuClick_(event) {
    const el = dev().assertElement(event.target);

    if (el === this.closeButton_) {
      this.close_();
    }

    // Closes the menu if click happened outside of the menu main container.
    if (!closest(el, (el) => el === this.innerContainerEl_, this.rootEl_)) {
      this.close_();
    }
  }

  /**
   * Reacts to UI state updates and triggers the right UI.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.vsync_.mutate(() => {
      uiState !== UIType.MOBILE
        ? this.rootEl_.setAttribute('desktop', '')
        : this.rootEl_.removeAttribute('desktop');
    });
  }

  /**
   * Closes the share menu.
   * @private
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
  }

  /**
   * Loads and applies the share providers configured by the publisher.
   * @protected
   */
  loadProviders() {
    const shareEl = this.storyEl_.querySelector(
      'amp-story-social-share, amp-story-bookend'
    );

    this.requestService_.loadShareConfig(shareEl).then((config) => {
      const providers =
        config &&
        (config[SHARE_PROVIDERS_KEY] || config[DEPRECATED_SHARE_PROVIDERS_KEY]);
      if (!providers) {
        return;
      }
      this.setProviders_(providers);
    });
  }

  /**
   * @param {(!Object<string, (!JsonObject|boolean)> | !Array<!Object|string>)} providers
   * @private
   * TODO(alanorozco): Set story metadata in share config.
   */
  setProviders_(providers) {
    /** @type {!Array} */ (providers).forEach((provider) => {
      if (isObject(provider)) {
        this.add_(
          this.buildProvider_(
            provider['provider'],
            /** @type {!JsonObject} */ (provider)
          )
        );
        return;
      }

      if (provider == 'system') {
        user().warn(
          'AMP-STORY',
          '`system` is not a valid share provider type. Native sharing is ' +
            'enabled by default and cannot be turned off.',
          provider
        );
        return;
      }
      this.add_(this.buildProvider_(/** @type {string} */ (provider)));
    });
  }

  /**
   * @param {!Node} node
   * @private
   */
  add_(node) {
    const list = devAssert(this.innerContainerEl_).querySelector(
      '.i-amphtml-story-share-list'
    );
    const item = renderShareItemListElement(node);

    // `lastElementChild` is the system share button container, which should
    // always be last in list
    list.insertBefore(item, list.lastElementChild);
  }

  /**
   * @private
   */
  copyUrlToClipboard_() {
    const url = Services.documentInfoForDoc(this.ampdoc_).canonicalUrl;

    if (!copyTextToClipboard(this.win_, url)) {
      const failureString = this.localizationService_.getLocalizedString(
        this.storyEl_,
        LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT
      );
      Toast.show(this.storyEl_, dev().assertString(failureString));
      return;
    }

    Toast.show(
      this.storyEl_,
      this.buildCopySuccessfulToast_(this.win_.document, url)
    );
  }

  /**
   * Creates an amp-social-share element if the type is valid.
   * @param {string} shareType
   * @param {!JsonObject=} opt_params
   * @return {?Element}
   */
  buildProvider_(shareType, opt_params) {
    const shareProviderLocalizedStringId =
      SHARE_PROVIDER_LOCALIZED_STRING_ID[shareType];

    if (!shareProviderLocalizedStringId) {
      return;
    }

    const social = (
      <amp-social-share
        width={48}
        height={48}
        class="i-amphtml-story-share-icon"
        type={shareType}
      >
        <span class="i-amphtml-story-share-label">
          {this.localizationService_.getLocalizedString(
            shareProviderLocalizedStringId
          )}
        </span>
      </amp-social-share>
    );
    return addAttributesToElement(social, buildProviderParams(opt_params));
  }

  /**
   * @param {!Document} doc
   * @param {string} url
   * @return {!Element}
   */
  buildCopySuccessfulToast_(doc, url) {
    return (
      <div class="i-amphtml-story-copy-successful">
        <div>
          {this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT
          )}
        </div>
        <div class="i-amphtml-story-copy-url">{url}</div>
      </div>
    );
  }

  /**
   * @private
   * @return {!Element}
   */
  renderLinkShareButtonElement_() {
    return (
      <div
        class="i-amphtml-story-share-icon i-amphtml-story-share-icon-link"
        tabIndex={0}
        role="button"
        aria-label={this.localizationService_.getLocalizedString(
          LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINK
        )}
      >
        <span class="i-amphtml-story-share-label">
          {this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINK
          )}
        </span>
      </div>
    );
  }
}

/**
 * This extension installs the share widget.
 */

AMP.extension('amp-story-share-menu', '0.1', (AMP) => {
  AMP.ampdoc.whenReady().then(() => {
    const element = AMP.ampdoc
      .getRootNode()
      .querySelector('.i-amphtml-story-share-menu');
    const shareMenu = new AmpStoryShareMenu(element, AMP.ampdoc.win);
    shareMenu.build();
  });
  AMP.registerElement('amp-social-share', AmpSocialShare);
});
