import {devAssert} from '#core/assert';
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
   * @param hostEl Element where to append the component
   */
  constructor(hostEl) {
    /** @private {!AmpDoc} */
    this.ampdoc_ = getAmpdoc(hostEl);

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

    /** @private {?Element} */
    this.root_ = null;

    /** @private {!Element} */
    this.hostEl_ = hostEl;
  }

  /**
   * Builds and appends the component in the story. Could build either the
   * amp-social-share button to display the native system sharing, or a fallback
   * UI.
   */
  build() {
    if (this.root_) {
      return;
    }

    const shareWidgetElement = this.buildFallback_(this.ampdoc_);
    this.element_ = this.renderForFallbackSharing_(shareWidgetElement);
    // TODO(mszylkowski): import '../../amp-social-share/0.1/amp-social-share' when this file is lazy loaded.
    Services.extensionsFor(this.win_).installExtensionForDoc(
      this.ampdoc_,
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
      true
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
      this.element_.classList.toggle(VISIBLE_CLASS, isOpen);
      this.element_.setAttribute('aria-hidden', !isOpen);
    });
  }

  /**
   * @param {Object<string, *>|string} provider
   * @private
   * TODO(alanorozco): Set story metadata in share config.
   */
  setProviders_(provider) {
    let params;

    if (isObject(provider)) {
      params = provider;
      provider = provider['provider'];
      delete params['provider'];
    }

    const element = this.buildProvider_(
      this.win_.document,
      /** @type {string} */ (provider)
    );

    if (params) {
      for (const field in params) {
        element.setAttribute(`data-param-${field}`, params[field]);
      }
    }

    const list = devAssert(this.root_).lastElementChild;
    const item = renderShareItemElement(element);

    // `lastElementChild` is the system share button container, which should
    // always be last in list
    list.insertBefore(item, list.lastElementChild);
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
   * Closes the share menu.
   * @private
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
  }

  /**
   * Quick share template, used as a fallback if native sharing is not supported.
   * @param {?Array<?Element|?string>|?Element|?string|undefined} children
   * @return {!Element}
   */
  renderForFallbackSharing_(children) {
    return (
      <div
        class="i-amphtml-story-share-menu i-amphtml-story-system-reset"
        aria-hidden="true"
        role="alert"
        onClick={(event) => {
          // Close if click occurred directly on this element.
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
          {children}
        </div>
      </div>
    );
  }

  /**
   * @return {!Element}
   */
  buildFallback_() {
    this.root_ = (
      <div class="i-amphtml-story-share-widget">
        <ul class="i-amphtml-story-share-list">
          {this.maybeRenderLinkShareButton_()}
        </ul>
      </div>
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
        this.setProviders_(provider);
      }
    });

    return this.root_;
  }

  /**
   * @return {?Element}
   * @private
   */
  maybeRenderLinkShareButton_() {
    if (!isCopyingToClipboardSupported(this.win_.document)) {
      return;
    }
    return this.renderLinkShareItemElement_(this.storyEl_);
  }

  /**
   * @private
   * @param {!Element} el
   * @return {!Element}
   */
  renderLinkShareItemElement_(el) {
    const label = localize(
      el,
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

  /**
   * Returns the share button for the provider if available.
   * @param {!Document} doc
   * @param {string} shareType
   * @return {?Element}
   */
  buildProvider_(doc, shareType) {
    const shareProviderLocalizedStringId =
      SHARE_PROVIDER_LOCALIZED_STRING_ID[shareType];

    if (!shareProviderLocalizedStringId) {
      user().warn(
        'AMP-STORY',
        `'${shareType}'is not a valid share provider type.`
      );
      return null;
    }

    return (
      <amp-social-share
        width={48}
        height={48}
        class="i-amphtml-story-share-icon"
        type={shareType}
      >
        <span class="i-amphtml-story-share-label">
          {localize(doc, shareProviderLocalizedStringId)}
        </span>
      </amp-social-share>
    );
  }
}
