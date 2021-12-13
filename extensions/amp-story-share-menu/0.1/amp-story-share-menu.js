import {devAssert} from '#core/assert';
import {Keys_Enum} from '#core/constants/key-codes';
import * as Preact from '#core/dom/jsx';
import {isObject} from '#core/types';
import {map} from '#core/types/object';
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
import {ShareWidget} from '../../amp-story/1.0/amp-story-share';
import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from '../../amp-story/1.0/amp-story-store-service';
import {
  ANALYTICS_TAG_NAME,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from '../../amp-story/1.0/story-analytics';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/** @const {string} Class to toggle the share menu. */
export const VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

const TAG = 'amp-story-share-menu';

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
 * @private
 * @param {!Element} el
 * @param {function(e)} onClick
 * @return {!Element}
 */
function renderLinkShareItemElement(el, onClick) {
  return renderShareItemElement(
    <div
      class="i-amphtml-story-share-icon i-amphtml-story-share-icon-link"
      tabIndex={0}
      role="button"
      aria-label={localize(
        el,
        LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINK
      )}
      onClick={onClick}
      onKeyUp={(e) => {
        // Check if pressed Space or Enter to trigger button.
        // TODO(wg-stories): Try switching this element to a <button> and
        // removing this keyup handler, since it gives you this behavior for free.
        const code = e.charCode || e.keyCode;
        if (code === 32 || code === 13) {
          onClick();
        }
      }}
    >
      <span class="i-amphtml-story-share-label">
        {localize(
          el,
          LocalizedStringId_Enum.AMP_STORY_SHARING_PROVIDER_NAME_LINK
        )}
      </span>
    </div>
  );
}

/**
 * Returns the share button for the provider if available.
 * @param {!Document} doc
 * @param {string} shareType
 * @return {?Element}
 */
function buildProvider(doc, shareType) {
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

/**
 * @param {!Document} doc
 * @param {string} url
 * @return {!Element}
 */
function buildCopySuccessfulToast(doc, url) {
  return (
    <div class="i-amphtml-story-copy-successful">
      <div>
        {localize(
          doc,
          LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT
        )}
      </div>
      <div class="i-amphtml-story-copy-url">{url}</div>
    </div>
  );
}

/**
 * Share menu UI.
 */
export class ShareMenu {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl Element where to append the component
   */
  constructor(win, storyEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {boolean} */
    this.isSystemShareSupported_ = false;

    /** @private @const {!ShareWidget} */
    this.shareWidget_ = ShareWidget.create(this.win_, storyEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, storyEl);

    /** @private @const {!Element} */
    this.parentEl_ = storyEl;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);
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

    this.isSystemShareSupported_ = this.shareWidget_.isSystemShareSupported();

    const child = this.isSystemShareSupported_
      ? this.buildForSystemSharing_()
      : this.buildForFallbackSharing_();

    this.initializeListeners_();

    this.vsync_.mutate(() => {
      this.parentEl_.appendChild(child);
    });
  }

  /**
   * Builds a element used for analytics, since the sharing menu is not rendered.
   * @private
   * @return {!Element}
   */
  buildForSystemSharing_() {
    return (this.element_ = <div></div>);
  }

  /**
   * Builds and appends the fallback UI.
   * @private
   * @return {!Element}
   */
  buildForFallbackSharing_() {
    const shareWidgetElement = this.buildFallback_(getAmpdoc(this.parentEl_));
    this.element_ = this.renderForFallbackSharing_(shareWidgetElement);
    // TODO(mszylkowski): import '../../amp-social-share/0.1/amp-social-share' when this file is lazy loaded.
    Services.extensionsFor(this.win_).installExtensionForDoc(
      getAmpdoc(this.parentEl_),
      'amp-social-share'
    );

    // Only listen for closing when system share is unsupported, since the
    // native layer would handle all the UI interactions.
    this.win_.addEventListener('keyup', (event) => {
      if (event.key == Keys_Enum.ESCAPE) {
        event.preventDefault();
        this.close_();
      }
    });

    return createShadowRootWithStyle(
      <div class="i-amphtml-story-share-menu-host"></div>,
      this.element_,
      CSS
    );
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

    this.storeService_.subscribe(StateProperty.SHARE_MENU_STATE, (isOpen) => {
      this.onShareMenuStateUpdate_(isOpen);
    });
  }

  /**
   * Reacts to menu state updates and decides whether to show either the native
   * system sharing, or the fallback UI.
   * @param {boolean} isOpen
   * @private
   */
  onShareMenuStateUpdate_(isOpen) {
    console.log('share menu state update', isOpen);
    if (this.isSystemShareSupported_ && isOpen) {
      // Dispatches a click event on the amp-social-share button to trigger the
      // native system sharing UI. This has to be done upon user interaction.
      this.openSystemShare_();

      // There is no way to know when the user dismisses the native system share
      // menu, so we pretend it is closed on the story end, and let the native
      // end handle the UI interactions.
      this.close_();
    }

    if (!this.isSystemShareSupported_) {
      this.vsync_.mutate(() => {
        this.element_.classList.toggle(VISIBLE_CLASS, isOpen);
        this.element_.setAttribute('aria-hidden', !isOpen);
      });
    }

    this.element_[ANALYTICS_TAG_NAME] = TAG;
    this.analyticsService_.triggerEvent(
      isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.element_
    );
  }

  /**
   * Loads and applies the share providers configured by the publisher.
   * @protected
   */
  loadProviders() {
    const shareEl = this.parentEl_.querySelector(
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

    const element = buildProvider(
      this.win_.document,
      /** @type {string} */ (provider)
    );

    if (params) {
      for (const field in params) {
        element.setAttribute(`data-param-${field}`, params[field]);
      }
    }

    const list = devAssert(this.root).lastElementChild;
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
   * Opens the sharing dialog of native browsers.
   * @private
   */
  openSystemShare_() {
    const {navigator} = this.win_;
    const shareData = {
      url: Services.documentInfoForDoc(this.parentEl_).canonicalUrl,
      text: this.win_.document.title,
    };
    navigator.share(shareData).catch((e) => {
      user().warn(TAG, e.message, shareData);
    });
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
              this.parentEl_,
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
    devAssert(!this.root, 'Already built.');

    this.root = (
      <div class="i-amphtml-story-share-widget">
        <ul class="i-amphtml-story-share-list">
          {this.maybeRenderLinkShareButton_()}
        </ul>
      </div>
    );

    this.loadProviders();

    return this.root;
  }

  /**
   * @return {?Element}
   * @private
   */
  maybeRenderLinkShareButton_() {
    if (!isCopyingToClipboardSupported(this.win_.document)) {
      return;
    }
    return renderLinkShareItemElement(this.parentEl_, (e) => {
      e.preventDefault();
      this.copyUrlToClipboard_();
    });
  }

  /**
   * @private
   */
  copyUrlToClipboard_() {
    const url = Services.documentInfoForDoc(this.getAmpDoc_()).canonicalUrl;

    if (!copyTextToClipboard(this.win_, url)) {
      const failureString = localize(
        this.parentEl_,
        LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT
      );
      Toast.show(this.storyEl_, devAssert(failureString));
      return;
    }

    Toast.show(
      this.storyEl_,
      buildCopySuccessfulToast(this.win_.document, url)
    );
  }
}
