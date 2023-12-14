import {userAssert} from '#core/assert';
import {Keys_Enum} from '#core/constants/key-codes';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {isObject} from '#core/types';
import {map} from '#core/types/object';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '#core/window/clipboard';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {user} from '#utils/log';

import {localizeTemplate} from 'extensions/amp-story/1.0/amp-story-localization-service';
import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';
import {Toast} from 'extensions/amp-story/1.0/toast';
import {AMP_STORY_COPY_URL} from 'src/amp-story-player/event';

import {CSS} from '../../../build/amp-story-share-menu-0.1.css';
import {getAmpdoc} from '../../../src/service-helpers';
import {
  Action,
  StateProperty,
  UIType_Enum,
} from '../../amp-story/1.0/amp-story-store-service';
import {AmpStoryViewerMessagingHandler} from '../../amp-story/1.0/amp-story-viewer-messaging-handler';
import {
  createShadowRootWithStyle,
  dependsOnStoryServices,
} from '../../amp-story/1.0/utils';

import '../../amp-social-share/0.1/amp-social-share';

/** @const {string} Class to toggle the share menu. */
export const VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

/**
 * Maps share provider type to localization asset.
 * @const {!{[key: string]: !LocalizedStringId_Enum}}
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
const SHARE_PROVIDERS_KEY = 'shareProviders';

/**
 * Deprecated key for share providers in config.
 * @const {string}
 */
const DEPRECATED_SHARE_PROVIDERS_KEY = 'share-providers';

/**
 * @param {!Node} child
 * @return {!Element} */
const renderShareItemElement = (child) => (
  <li class="i-amphtml-story-share-item">{child}</li>
);

/**
 * Share menu UI.
 */
export class AmpStoryShareMenu extends AMP.BaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.rootEl_ = null;

    /** @private @const {!Element} */
    this.storyEl_ = userAssert(
      closestAncestorElementBySelector(element, 'amp-story')
    );

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = Services.localizationForDoc(this.element);

    /** @private @const {!../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win);

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = null;

    /** @private {?AmpStoryViewerMessagingHandler} */
    this.viewerMessagingHandler_ = null;
  }

  /**
   * Builds and appends the component in the story. Could build either the
   * amp-social-share button to display the native system sharing, or a fallback
   * UI.
   */
  buildCallback() {
    if (this.rootEl_) {
      return;
    }

    const providersList = this.buildProvidersList_();
    this.rootEl_ = this.buildDialog_(providersList);
    localizeTemplate(this.rootEl_, this.element);
    createShadowRootWithStyle(this.element, this.rootEl_, CSS);
    this.initializeListeners_();

    this.viewer_ = Services.viewerForDoc(this.win.document.documentElement);
    this.viewerMessagingHandler_ = this.viewer_.isEmbedded()
      ? new AmpStoryViewerMessagingHandler(this.win, this.viewer_)
      : null;
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

    this.win.addEventListener('keyup', (event) => {
      if (event.key == Keys_Enum.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });
  }

  /**
   * Reacts to menu state updates shows or hides the menu.
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
   * Reacts to UI state updates and triggers the right UI.
   * @param {!UIType_Enum} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.vsync_.mutate(() => {
      uiState !== UIType_Enum.MOBILE
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
            i-amphtml-i18n-aria-label={
              LocalizedStringId_Enum.AMP_STORY_CLOSE_BUTTON_LABEL
            }
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
      localizeTemplate(list, this.storyEl_);
    });

    return list;
  }

  /**
   * @param {{[key: string]: *}|string} provider
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
        <span
          class="i-amphtml-story-share-label"
          i-amphtml-i18n-text-content={shareProviderLocalizedStringId}
        ></span>
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
    if (!isCopyingToClipboardSupported(this.win.document)) {
      return;
    }
    return renderShareItemElement(
      <button
        class="i-amphtml-story-share-icon i-amphtml-story-share-icon-link"
        i-amphtml-i18n-aria-label={
          LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINK
        }
        onClick={(e) => {
          e.preventDefault();
          this.copyUrlToClipboard_();
        }}
      >
        <span
          class="i-amphtml-story-share-label"
          i-amphtml-i18n-text-content={
            LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINK
          }
        ></span>
      </button>
    );
  }

  /**
   * @private
   */
  copyUrlToClipboard_() {
    const url = Services.documentInfoForDoc(
      getAmpdoc(this.storyEl_)
    ).canonicalUrl;

    if (this.viewerMessagingHandler_) {
      this.viewerMessagingHandler_.onMessage('copyComplete', (data) => {
        if (data.success) {
          this.showCopySuccessfulToast_(data.url);
        } else {
          this.showCopyFailedToast_();
        }
      });
      this.viewerMessagingHandler_.send('documentStateUpdate', {
        'state': AMP_STORY_COPY_URL,
        'value': url,
      });
    } else {
      copyTextToClipboard(
        this.win,
        url,
        this.showCopySuccessfulToast_.bind(this, url),
        this.showCopyFailedToast_
      );
    }
  }

  /**
   * @param {string} url
   * @private
   */
  showCopySuccessfulToast_(url) {
    this.localizationService_
      .getLocalizedStringAsync(
        LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT
      )
      .then((successString) =>
        Toast.show(
          this.storyEl_,
          this.buildCopySuccessfulToast_(url, successString)
        )
      );
  }

  /**
   * @private
   */
  showCopyFailedToast_() {
    this.localizationService_
      .getLocalizedStringAsync(
        LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT
      )
      .then((failureString) => Toast.show(this.storyEl_, failureString));
  }

  /**
   * @param {string} url
   * @param {string} localizedString
   * @return {!Element}
   */
  buildCopySuccessfulToast_(url, localizedString) {
    return (
      <div class="i-amphtml-story-copy-successful">
        {localizedString}
        <div class="i-amphtml-story-copy-url">{url}</div>
      </div>
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}

/**
 * This extension installs the share widget.
 */

AMP.extension('amp-story-share-menu', '0.1', (AMP) => {
  AMP.registerElement(
    'amp-story-share-menu',
    dependsOnStoryServices(AmpStoryShareMenu)
  );
});
