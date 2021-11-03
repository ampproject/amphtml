import * as Preact from '#core/dom/jsx';
import {LOCALIZED_STRING_ID_ENUM} from '#service/localization/strings';
import {Services} from '#service';
import {Toast} from './toast';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '#core/window/clipboard';
import {dev, devAssert, user} from '#utils/log';
import {dict, map} from '#core/types/object';
import {localize} from './amp-story-localization-service';
import {getRequestService} from './amp-story-request-service';
import {isObject} from '#core/types';
import {listen} from '#utils/event-helper';

/**
 * Maps share provider type to visible name.
 * If the name only needs to be capitalized (e.g. `facebook` to `Facebook`) it
 * does not need to be included here.
 * @const {!Object<string, !LOCALIZED_STRING_ID_ENUM>}
 */
const SHARE_PROVIDER_LOCALIZED_STRING_ID = map({
  'system': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM,
  'email': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL,
  'facebook': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK,
  'line': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_LINE,
  'linkedin': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN,
  'pinterest':
    LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST,
  'gplus': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS,
  'tumblr': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR,
  'twitter': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_TWITTER,
  'whatsapp': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP,
  'sms': LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_SMS,
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

/** @return {!Element} */
const renderElement = () => (
  <div class="i-amphtml-story-share-widget">
    <ul class="i-amphtml-story-share-list">
      <li class="i-amphtml-story-share-system" />
    </ul>
  </div>
);

/**
 * @param {!Node} child
 * @return {!Element} */
const renderShareItemListElement = (child) => (
  <li class="i-amphtml-story-share-item">{child}</li>
);

/**
 * @private
 * @param {!Element} el
 * @return {!Element}
 */
function renderLinkShareButtonElement(el) {
  return (
    <div
      class="i-amphtml-story-share-icon i-amphtml-story-share-icon-link"
      tabIndex={0}
      role="button"
      aria-label={localize(
        el,
        LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_LINK
      )}
    >
      <span class="i-amphtml-story-share-label">
        {localize(
          el,
          LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_PROVIDER_NAME_LINK
        )}
      </span>
    </div>
  );
}

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
 * @param {!Document} doc
 * @param {string} shareType
 * @param {!JsonObject=} opt_params
 * @return {!Element}
 */
function buildProvider(doc, shareType, opt_params) {
  const shareProviderLocalizedStringId = devAssert(
    SHARE_PROVIDER_LOCALIZED_STRING_ID[shareType],
    `No localized string to display name for share type ${shareType}.`
  );

  return (
    <amp-social-share
      width={48}
      height={48}
      class="i-amphtml-story-share-icon"
      type={shareType}
      {...buildProviderParams(opt_params)}
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
          LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT
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
    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = null;

    /** @protected @const {!Window} */
    this.win = win;

    /** @protected @const {!Element} */
    this.storyEl = storyEl;

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
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Element}
   */
  build(ampdoc) {
    devAssert(!this.root, 'Already built.');

    this.ampdoc_ = ampdoc;

    this.root = renderElement();

    this.loadProviders();
    this.maybeAddLinkShareButton_();
    this.maybeAddSystemShareButton_();

    return this.root;
  }

  /**
   * @return {!../../../src/service/ampdoc-impl.AmpDoc}
   * @private
   */
  getAmpDoc_() {
    return devAssert(this.ampdoc_);
  }

  /** @private */
  maybeAddLinkShareButton_() {
    if (!isCopyingToClipboardSupported(this.win.document)) {
      return;
    }

    const linkShareButton = renderLinkShareButtonElement(this.storyEl);

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
  copyUrlToClipboard_() {
    const url = Services.documentInfoForDoc(this.getAmpDoc_()).canonicalUrl;

    if (!copyTextToClipboard(this.win, url)) {
      const failureString = localize(
        this.storyEl_,
        LOCALIZED_STRING_ID_ENUM.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT
      );
      Toast.show(this.storyEl, dev().assertString(failureString));
      return;
    }

    Toast.show(this.storyEl, buildCopySuccessfulToast(this.win.document, url));
  }

  /** @private */
  maybeAddSystemShareButton_() {
    if (!this.isSystemShareSupported()) {
      // `amp-social-share` will hide `system` buttons when not supported, but
      // we also need to avoid adding it for rendering reasons.
      return;
    }

    const container = dev()
      .assertElement(this.root)
      .querySelector('.i-amphtml-story-share-system');

    this.loadRequiredExtensions();

    container.appendChild(buildProvider(this.win.document, 'system'));
  }

  /**
   * NOTE(alanorozco): This is a duplicate of the logic in the
   * `amp-social-share` component.
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc=}  ampdoc
   * @return {boolean} Whether the browser supports native system sharing.
   */
  isSystemShareSupported(ampdoc = this.getAmpDoc_()) {
    const viewer = Services.viewerForDoc(ampdoc);

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

    this.requestService_.loadShareConfig().then((config) => {
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
          buildProvider(
            this.win.document,
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
      this.add_(
        buildProvider(this.win.document, /** @type {string} */ (provider))
      );
    });
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc=} ampdoc
   */
  loadRequiredExtensions(ampdoc = this.getAmpDoc_()) {
    Services.extensionsFor(this.win).installExtensionForDoc(
      ampdoc,
      'amp-social-share'
    );
  }

  /**
   * @param {!Node} node
   * @private
   */
  add_(node) {
    const list = devAssert(this.root).lastElementChild;
    const item = renderShareItemListElement(node);

    // `lastElementChild` is the system share button container, which should
    // always be last in list
    list.insertBefore(item, list.lastElementChild);
  }
}
