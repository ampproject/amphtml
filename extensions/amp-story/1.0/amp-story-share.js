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
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {Toast} from './toast';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '../../../src/clipboard';
import {dev, devAssert, user} from '../../../src/log';
import {dict, map} from './../../../src/core/types/object';
import {getLocalizationService} from './amp-story-localization-service';
import {getRequestService} from './amp-story-request-service';
import {isObject} from '../../../src/core/types';
import {listen} from '../../../src/event-helper';
import {renderAsElement, renderSimpleTemplate} from './simple-template';

/**
 * Maps share provider type to visible name.
 * If the name only needs to be capitalized (e.g. `facebook` to `Facebook`) it
 * does not need to be included here.
 * @const {!Object<string, !LocalizedStringId>}
 */
const SHARE_PROVIDER_LOCALIZED_STRING_ID = map({
  'system': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM,
  'email': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL,
  'facebook': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK,
  'line': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINE,
  'linkedin': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN,
  'pinterest': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST,
  'gplus': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS,
  'tumblr': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR,
  'twitter': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_TWITTER,
  'whatsapp': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP,
  'sms': LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_SMS,
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

/** @private @const {!./simple-template.ElementDef} */
const TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-share-widget'}),
  children: [
    {
      tag: 'ul',
      attrs: dict({'class': 'i-amphtml-story-share-list'}),
      children: [
        {
          tag: 'li',
          attrs: dict({'class': 'i-amphtml-story-share-system'}),
        },
      ],
    },
  ],
};

/** @private @const {!./simple-template.ElementDef} */
const SHARE_ITEM_TEMPLATE = {
  tag: 'li',
  attrs: dict({'class': 'i-amphtml-story-share-item'}),
};

/**
 * @private
 * @param {!Element} el
 * @return {./simple-template-ElementDef}
 */
function buildLinkShareItemTemplate(el) {
  return {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-share-icon i-amphtml-story-share-icon-link',
      'tabindex': 0,
      'role': 'button',
      'aria-label': getLocalizationService(el).getLocalizedString(
        LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK
      ),
    }),
    children: [
      {
        tag: 'span',
        attrs: dict({'class': 'i-amphtml-story-share-label'}),
        localizedStringId:
          LocalizedStringId.AMP_STORY_SHARING_PROVIDER_NAME_LINK,
      },
    ],
  };
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
 * @return {!Node}
 */
function buildProvider(doc, shareType, opt_params) {
  const shareProviderLocalizedStringId = devAssert(
    SHARE_PROVIDER_LOCALIZED_STRING_ID[shareType],
    `No localized string to display name for share type ${shareType}.`
  );

  return renderSimpleTemplate(
    doc,
    /** @type {!Array<!./simple-template.ElementDef>} */ ([
      {
        tag: 'amp-social-share',
        attrs: /** @type {!JsonObject} */ (
          Object.assign(
            dict({
              'width': 48,
              'height': 48,
              'class': 'i-amphtml-story-share-icon',
              'type': shareType,
            }),
            buildProviderParams(opt_params)
          )
        ),
        children: [
          {
            tag: 'span',
            attrs: dict({'class': 'i-amphtml-story-share-label'}),
            localizedStringId: shareProviderLocalizedStringId,
          },
        ],
      },
    ])
  );
}

/**
 * @param {!Document} doc
 * @param {string} url
 * @return {!Element}
 */
function buildCopySuccessfulToast(doc, url) {
  return renderAsElement(
    doc,
    /** @type {!./simple-template.ElementDef} */ ({
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-copy-successful'}),
      children: [
        {
          tag: 'div',
          localizedStringId:
            LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT,
        },
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-copy-url'}),
          unlocalizedString: url,
        },
      ],
    })
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

    this.root = renderAsElement(this.win.document, TEMPLATE);

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

    const linkShareButton = renderAsElement(
      this.win.document,
      buildLinkShareItemTemplate(this.storyEl)
    );

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
      const localizationService = getLocalizationService(this.storyEl);
      devAssert(localizationService, 'Could not retrieve LocalizationService.');
      const failureString = localizationService.getLocalizedString(
        LocalizedStringId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT
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
    const item = renderAsElement(this.win.document, SHARE_ITEM_TEMPLATE);

    item.appendChild(node);

    // `lastElementChild` is the system share button container, which should
    // always be last in list
    list.insertBefore(item, list.lastElementChild);
  }
}
