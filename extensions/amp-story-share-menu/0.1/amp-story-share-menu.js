import {Keys_Enum} from '#core/constants/key-codes';
import * as Preact from '#core/dom/jsx';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {isObject} from '#core/types';
import {map} from '#core/types/object';
import {getWin} from '#core/window';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '#core/window/clipboard';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {user} from '#utils/log';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';
import {Toast} from 'extensions/amp-story/1.0/toast';

import {CSS} from '../../../build/amp-story-share-menu-0.1.css';
import {getAmpdoc} from '../../../src/service-helpers';
import {localize} from '../../amp-story/1.0/amp-story-localization-service';
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from '../../amp-story/1.0/amp-story-store-service';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/** @const {string} Class to toggle the share menu. */
export const VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

/**
 * Maps share provider type to localization asset.
 * @const {!Object<string, !LocalizedStringId_Enum>}
 */
const SHARE_PROVIDER_LOCALIZED_STRING_ID = map({
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
 * @param {!Node} child
 * @return {!Element} */
const renderShareItemElement = (child) => (
  <li class="i-amphtml-story-share-item">{child}</li>
);

/**
 * Share menu UI.
 */
export class AmpStoryShareMenu {
  /**
   * @param {!Element} hostEl
   */
  constructor(hostEl) {
    /** @private {string} */
    this.canonicalUrl_ = Services.documentInfoForDoc(hostEl).canonicalUrl;

    /** @private @const {!Window} */
    this.win_ = getWin(hostEl);

    /** @private {?Element} */
    this.element_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!Element} */
    this.storyEl_ = closestAncestorElementBySelector(hostEl, 'amp-story');

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @private {!Element} */
    this.hostEl_ = hostEl;
  }

  /**
   * Builds and appends the component in the story. Could build either the
   * amp-social-share button to display the native system sharing, or a fallback
   * UI.
   */
  build() {
    if (this.element_) {
      return;
    }

    const shareWidgetElement = this.buildProvidersList_();
    this.element_ = this.buildDialog_(shareWidgetElement);
    // TODO(mszylkowski): import '../../amp-social-share/0.1/amp-social-share' when this file is lazy loaded.
    Services.extensionsFor(this.win_).installExtensionForDoc(
      getAmpdoc(this.hostEl_),
      'amp-social-share'
    );

    this.vsync_.mutate(() => {
      createShadowRootWithStyle(this.hostEl_, this.element_, CSS);
      this.initializeListeners_();
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
      true /** callToInitialize */
    );

    this.win_.addEventListener('keyup', (event) => {
      if (event.key == Keys_Enum.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });
  }

  /**
   * Reacts to UI state updates and triggers the right UI.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.vsync_.mutate(() => {
      uiState !== UIType.MOBILE
        ? this.element_.setAttribute('desktop', '')
        : this.element_.removeAttribute('desktop');
    });
  }

  /**
   * Reacts to menu state updates shows or hides the menu.
   * @param {boolean} isOpen
   * @private
   */
  onShareMenuStateUpdate_(isOpen) {
    this.vsync_.mutate(() => {
      this.element_.classList.toggle(VISIBLE_CLASS, isOpen);
      this.element_.setAttribute('aria-hidden', !isOpen);
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
   * Quick share template, used as a fallback if native sharing is not supported.
   * @param {!Element} child
   * @return {!Element}
   */
  buildDialog_(child) {
    return (
      <div
        class="i-amphtml-story-share-menu i-amphtml-story-system-reset"
        aria-hidden="true"
        role="alert"
        onClick={(event) => {
          // Only close if clicked on background.
          if (event.target === event.currentTarget) {
            this.close_();
          }
        }}
      >
        <div class="i-amphtml-story-share-menu-container">
          <button
            class="i-amphtml-story-share-menu-close-button"
            aria-label={localize(
              this.storyEl_,
              LocalizedStringId_Enum.AMP_STORY_CLOSE_BUTTON_LABEL
            )}
            role="button"
            onClick={this.close_.bind(this)}
          >
            &times;
          </button>
          {child}
        </div>
      </div>
    );
  }

  /**
   * Create widget, and load the providers in the config.
   * @return {!Element}
   */
  buildProvidersList_() {
    const list = (
      <ul class="i-amphtml-story-share-list">
        {this.maybeRenderLinkShareButton_()}
      </ul>
    );

    const shareEl = this.storyEl_.querySelector(
      'amp-story-social-share, amp-story-bookend'
    );

    getElementConfig(shareEl).then((config) => {
      const providers =
        config &&
        (config[SHARE_PROVIDERS_KEY] || config[DEPRECATED_SHARE_PROVIDERS_KEY]);
      if (!providers) {
        return;
      }

      for (const provider of providers) {
        const el = this.buildShareProvider_(provider);
        if (el) {
          list.append(el);
        }
      }
    });

    return list;
  }

  /**
   * @param {Object<string, *>|string} provider
   * @return {Element|null}
   * @private
   * TODO(alanorozco): Set story metadata in share config.
   */
  buildShareProvider_(provider) {
    let params;

    if (isObject(provider)) {
      params = provider;
      provider = provider['provider'];
      delete params['provider'];
    }

    const shareProviderLocalizedStringId =
      SHARE_PROVIDER_LOCALIZED_STRING_ID[provider];

    if (!shareProviderLocalizedStringId) {
      user().warn(
        'AMP-STORY',
        `'${provider}'is not a valid share provider type.`
      );
      return null;
    }

    const element = (
      <amp-social-share
        width={48}
        height={48}
        class="i-amphtml-story-share-icon"
        type={provider}
      >
        <span class="i-amphtml-story-share-label">
          {localize(this.win_.document, shareProviderLocalizedStringId)}
        </span>
      </amp-social-share>
    );

    if (params) {
      for (const field in params) {
        element.setAttribute(`data-param-${field}`, params[field]);
      }
    }

    return renderShareItemElement(element);
  }

  /**
   * @return {?Element}
   * @private
   */
  maybeRenderLinkShareButton_() {
    if (!isCopyingToClipboardSupported(this.win_.document)) {
      return;
    }
    const label = localize(
      this.storyEl_,
      LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINK
    );
    return renderShareItemElement(
      <button
        class="i-amphtml-story-share-icon i-amphtml-story-share-icon-link"
        aria-label={label}
        onClick={(e) => {
          e.preventDefault();
          this.copyUrlToClipboard_();
        }}
      >
        <span class="i-amphtml-story-share-label">{label}</span>
      </button>
    );
  }

  /**
   * @private
   */
  copyUrlToClipboard_() {
    if (!copyTextToClipboard(this.win_, this.canonicalUrl_)) {
      const failureString = localize(
        this.storyEl_,
        LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT
      );
      Toast.show(this.storyEl_, failureString);
      return;
    }

    Toast.show(
      this.storyEl_,
      this.buildCopySuccessfulToast_(this.canonicalUrl_)
    );
  }

  /**
   * @param {string} url
   * @return {!Element}
   */
  buildCopySuccessfulToast_(url) {
    return (
      <div class="i-amphtml-story-copy-successful">
        {localize(
          this.storyEl_,
          LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT
        )}
        <div class="i-amphtml-story-copy-url">{url}</div>
      </div>
    );
  }
}
