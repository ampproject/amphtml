import * as Preact from '#core/dom/jsx';
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {Services} from '#service';
import {Toast} from './toast';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '#core/window/clipboard';
import {devAssert, user} from '#utils/log';
import {map} from '#core/types/object';
import {localize} from './amp-story-localization-service';
import {getRequestService} from './amp-story-request-service';
import {isObject} from '#core/types';

/**
 * Maps share provider type to localization asset.
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
 * Social share widget for the system button.
 */
export class ShareWidget {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  constructor(win, storyEl) {
    /** @protected @const {!Window} */
    this.win = win;

    /** @protected @const {!Element} */
    this.storyEl_ = storyEl;

    /** @protected {?Element} */
    this.root = null;

    /** @private @const {!./amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = getRequestService(this.win, storyEl);
  }

  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   * @return {!ShareWidget}
   */
  static create(win, storyEl) {
    return new ShareWidget(win, storyEl);
  }

  /**
   * @return {!Element}
   */
  build() {
    devAssert(!this.root, 'Already built.');

    this.root = (
      <div class="i-amphtml-story-share-widget">
        <ul class="i-amphtml-story-share-list">
          {this.maybeRenderLinkShareButton_()}
          <li>{this.maybeRenderSystemShareButton_()}</li>
        </ul>
      </div>
    );

    this.loadProviders();

    return this.root;
  }

  /**
   * @return {!../../../src/service/ampdoc-impl.AmpDoc}
   * @private
   */
  getAmpDoc_() {
    return devAssert(this.storyEl_.getAmpDoc());
  }

  /**
   * @return {?Element}
   * @private
   */
  maybeRenderLinkShareButton_() {
    if (!isCopyingToClipboardSupported(this.win.document)) {
      return;
    }
    return renderLinkShareItemElement(this.storyEl_, (e) => {
      e.preventDefault();
      this.copyUrlToClipboard_();
    });
  }

  /**
   * @private
   */
  copyUrlToClipboard_() {
    const url = Services.documentInfoForDoc(this.getAmpDoc_()).canonicalUrl;

    if (!copyTextToClipboard(this.win, url)) {
      const failureString = localize(
        this.storyEl_,
        LocalizedStringId_Enum.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT
      );
      Toast.show(this.storyEl_, devAssert(failureString));
      return;
    }

    Toast.show(this.storyEl_, buildCopySuccessfulToast(this.win.document, url));
  }

  /**
   * @return {?Element}
   * @private
   */
  maybeRenderSystemShareButton_() {
    if (!this.isSystemShareSupported()) {
      // `amp-social-share` will hide `system` buttons when not supported, but
      // we also need to avoid adding it for rendering reasons.
      return null;
    }

    this.loadRequiredExtensions();
    return buildProvider(this.win.document, 'system');
  }

  /**
   * NOTE(alanorozco): This is a duplicate of the logic in the
   * `amp-social-share` component.
   * @return {boolean} Whether the browser supports native system sharing.
   */
  isSystemShareSupported() {
    const viewer = Services.viewerForDoc(this.storyEl_);
    const platform = Services.platformFor(this.win);

    // Chrome exports navigator.share in WebView but does not implement it.
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
    const isChromeWebview = viewer.isWebviewEmbedded() && platform.isChrome();

    return 'share' in navigator && !isChromeWebview;
  }

  /**
   * Loads and applies the share providers configured by the publisher.
   * @protected
   */
  loadProviders() {
    this.loadRequiredExtensions();

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

    if (provider == 'system') {
      user().warn(
        'AMP-STORY',
        '`system` is not a valid share provider type. Native sharing is ' +
          'enabled by default and cannot be turned off.',
        provider
      );
      return;
    }

    const element = buildProvider(
      this.win.document,
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
   */
  loadRequiredExtensions() {
    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc_(),
      'amp-social-share'
    );
  }
}
