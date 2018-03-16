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
import {MessageId} from './messages';
import {Services} from '../../../src/services';
import {Toast} from './toast';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '../../../src/clipboard';
import {dev, user} from '../../../src/log';
import {dict, map} from './../../../src/utils/object';
import {isObject} from '../../../src/types';
import {listen} from '../../../src/event-helper';
import {px, setImportantStyles} from '../../../src/style';
import {renderAsElement, renderSimpleTemplate} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';


/**
 * Maps share provider type to visible name.
 * If the name only needs to be capitalized (e.g. `facebook` to `Facebook`) it
 * does not need to be included here.
 * @const {!Object<string, !MessageId>}
 */
const SHARE_PROVIDER_MESSAGE_ID = map({
  'system': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM,
  'email': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_EMAIL,
  'facebook': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK,
  'linkedin': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN,
  'pinterest': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST,
  'gplus': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS,
  'tumblr': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR,
  'twitter': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_TWITTER,
  'whatsapp': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP,
  'sms': MessageId.AMP_STORY_SHARING_PROVIDER_NAME_SMS,
});


/**
 * Default left/right padding for share buttons.
 * @private @const {number}
 */
const DEFAULT_BUTTON_PADDING = 16;

/**
 * Minimum left/right padding for share buttons.
 * @private @const {number}
 */
const MIN_BUTTON_PADDING = 10;


/** @private @const {!./simple-template.ElementDef} */
const TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-share-widget'}),
  children: [{
    tag: 'ul',
    attrs: dict({'class': 'i-amphtml-story-share-list'}),
    children: [
      {
        tag: 'li',
        attrs: dict({'class': 'i-amphtml-story-share-system'}),
      },
    ],
  }],
};


/** @private @const {!./simple-template.ElementDef} */
const SHARE_ITEM_TEMPLATE = {
  tag: 'li',
  attrs: dict({'class': 'i-amphtml-story-share-item'}),
};


/** @private @const {!./simple-template.ElementDef} */
const LINK_SHARE_ITEM_TEMPLATE = {
  tag: 'div',
  attrs: dict({
    'class':
        'i-amphtml-story-share-icon i-amphtml-story-share-icon-link',
  }),
  messageId: MessageId.AMP_STORY_SHARING_PROVIDER_NAME_LINK,
};


/** @private @const {string} */
const SCROLLABLE_CLASSNAME = 'i-amphtml-story-share-widget-scrollable';


/**
 * @param {!JsonObject=} opt_params
 * @return {!JsonObject}
 */
function buildProviderParams(opt_params) {
  const attrs = dict();

  if (opt_params) {
    Object.keys(opt_params).forEach(field => {
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
  const shareProviderMessageId = dev().assert(
      SHARE_PROVIDER_MESSAGE_ID[shareType],
      `No message to display name for share type ${shareType}.`);

  return renderSimpleTemplate(doc,
      /** @type {!Array<!./simple-template.ElementDef>} */ ([
        {
          tag: 'amp-social-share',
          attrs: /** @type {!JsonObject} */ (Object.assign(
              dict({
                'width': 48,
                'height': 66,
                'class': 'i-amphtml-story-share-icon',
                'type': shareType,
              }),
              buildProviderParams(opt_params))),
          messageId: shareProviderMessageId,
        },
      ]));
}


/**
 * @param {!Document} doc
 * @param {string} url
 * @return {!Element}
 */
function buildCopySuccessfulToast(doc, url) {
  return renderAsElement(doc, /** @type {!./simple-template.ElementDef} */ ({
    tag: 'div',
    attrs: dict({'class': 'i-amphtml-story-copy-successful'}),
    children: [
      {
        tag: 'div',
        messageId: MessageId.AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT,
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-copy-url'}),
        untranslatedText: url,
      },
    ],
  }));
}


/**
 * Social share widget for story bookend.
 */
export class ShareWidget {
  /** @param {!Window} win */
  constructor(win) {
    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = null;

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?./messages/MessageService} */
    this.messageServicePromise_ = null;
  }

  /** @param {!Window} win */
  static create(win) {
    return new ShareWidget(win);
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Element}
   */
  build(ampdoc) {
    dev().assert(!this.root_, 'Already built.');

    this.ampdoc_ = ampdoc;
    this.messageServicePromise_ = Services.messageServiceForOrNull(this.win_);

    this.root_ = renderAsElement(this.win_.document, TEMPLATE);

    this.maybeAddLinkShareButton_();
    this.maybeAddSystemShareButton_();

    return this.root_;
  }

  /** @private */
  maybeAddLinkShareButton_() {
    if (!isCopyingToClipboardSupported(this.win_.document)) {
      return;
    }

    const linkShareButton =
        renderAsElement(this.win_.document, LINK_SHARE_ITEM_TEMPLATE);

    this.add_(linkShareButton);

    // TODO(alanorozco): Listen for proper tap event (i.e. fastclick)
    listen(linkShareButton, 'click', e => {
      e.preventDefault();
      this.copyUrlToClipboard_();
    });
  }

  /** @private */
  // TODO(alanorozco): i18n for toast.
  copyUrlToClipboard_() {
    const url = Services.documentInfoForDoc(
        /** @type {!../../../src/service/ampdoc-impl.AmpDoc} */ (
          dev().assert(this.ampdoc_))).canonicalUrl;

    if (!copyTextToClipboard(this.win_, url)) {
      this.messageServicePromise_.then(messageService => {
        dev().assert(messageService, 'Could not retrieve MessageService.');
        const failureMessage = messageService
            .getMessage(MessageId.AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT);
        Toast.show(this.win_, failureMessage);
      });
      return;
    }

    Toast.show(this.win_, buildCopySuccessfulToast(this.win_.document, url));
  }

  /** @private */
  maybeAddSystemShareButton_() {
    if (!this.isSystemShareSupported_()) {
      // `amp-social-share` will hide `system` buttons when not supported, but
      // we also need to avoid adding it for rendering reasons.
      return;
    }

    const container = dev().assertElement(this.root_).querySelector(
        '.i-amphtml-story-share-system');

    this.loadRequiredExtensions_();

    container.appendChild(buildProvider(this.win_.document, 'system'));
  }

  /** @private */
  // NOTE(alanorozco): This is a duplicate of the logic in the
  // `amp-social-share` component.
  isSystemShareSupported_() {
    const viewer = Services.viewerForDoc(
        /** @type {!../../../src/service/ampdoc-impl.AmpDoc} */ (
          dev().assert(this.ampdoc_)));

    const platform = Services.platformFor(this.win_);

    // Chrome exports navigator.share in WebView but does not implement it.
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
    const isChromeWebview = viewer.isWebviewEmbedded() && platform.isChrome();

    return ('share' in navigator) && !isChromeWebview;
  }

  /**
   * @param {!Object<string, (!JsonObject|boolean)>} providers
   * @public
   */
  // TODO(alanorozco): Set story metadata in share config
  setProviders(providers) {
    this.loadRequiredExtensions_();

    Object.keys(providers).forEach(type => {
      if (type == 'system') {
        user().warn('AMP-STORY',
            '`system` is not a valid share provider type. Native sharing is ' +
            'enabled by default and cannot be turned off.',
            type);
        return;
      }

      if (isObject(providers[type])) {
        this.add_(buildProvider(this.win_.document, type,
            /** @type {!JsonObject} */ (providers[type])));
        return;
      }

      // Bookend config API requires real boolean, not just truthy
      if (providers[type] === true) {
        this.add_(buildProvider(this.win_.document, type));
        return;
      }

      user().warn('AMP-STORY',
          'Invalid amp-story bookend share configuration for %s. ' +
          'Value must be `true` or a params object.',
          type);
    });
  }

  /** @private */
  loadRequiredExtensions_() {
    const ampdoc = /** @type {!../../../src/service/ampdoc-impl.AmpDoc} */ (
      dev().assert(this.ampdoc_));

    Services.extensionsFor(this.win_)
        .installExtensionForDoc(ampdoc, 'amp-social-share');
  }

  /**
   * @param {!Node} node
   * @private
   */
  add_(node) {
    const list = dev().assert(this.root_).firstElementChild;
    const item = renderAsElement(this.win_.document, SHARE_ITEM_TEMPLATE);

    item.appendChild(node);

    // `lastElementChild` is the system share button container, which should
    // always be last in list
    list.insertBefore(item, list.lastElementChild);
  }
}


/**
 * Social share widget for story bookend with a scrollable layout.
 * This class is coupled to the DOM structure for ShareWidget, but that's ok.
 */
export class ScrollableShareWidget {
  /** @param {!Window} win */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(win);

    /** @private @const {!ShareWidget} */
    this.mixin_ = ShareWidget.create(win);

    /**
     * Container width is being tracked to prevent unnecessary layout
     * calculations.
     * @private {?number}
     */
    this.containerWidth_ = null;

    /** @private {?Element} */
    this.root_ = null;
  }

  /** @param {!Window} win */
  static create(win) {
    return new ScrollableShareWidget(win);
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Element}
   */
  build(ampdoc) {
    this.root_ = this.mixin_.build(ampdoc);

    this.root_.classList.add(SCROLLABLE_CLASSNAME);

    Services.viewportForDoc(ampdoc).onResize(
        // we don't require a lot of smoothness here, so we throttle
        throttle(this.win_, () => this.applyButtonPadding_(), 100));

    return this.root_;
  }

  /**
   * Calculates padding between buttons so that the result is that there's
   * always one item visually "cut off" for scroll affordance.
   * @private
   */
  applyButtonPadding_() {
    const items = this.getVisibleItems_();

    if (!items.length) {
      return;
    }

    this.vsync_.run({
      measure: state => {
        const containerWidth = this.root_./*OK*/clientWidth;

        if (containerWidth == this.containerWidth_) {
          // Don't recalculate if width has not changed (i.e. onscreen keyboard)
          state.noop = true;
          return;
        }

        const icon = dev().assert(items[0].firstElementChild);

        const leftMargin = icon./*OK*/offsetLeft - this.root_./*OK*/offsetLeft;
        const iconWidth = icon./*OK*/offsetWidth;

        // Total width that the buttons will occupy with minimum padding.
        const totalItemWidth =
            (iconWidth * items.length + 2 * MIN_BUTTON_PADDING *
                (items.length - 1));

        // If buttons don't fit within the available area, calculate padding so
        // that there will be an element cut-off.
        if (totalItemWidth > (containerWidth - leftMargin * 2)) {
          const availableWidth = containerWidth - leftMargin - iconWidth / 2;
          const amountVisible =
              Math.floor(availableWidth / (iconWidth + MIN_BUTTON_PADDING * 2));

          state.padding = 0.5 * (availableWidth / amountVisible - iconWidth);
        } else {
          // Otherwise, calculate padding in from MIN_PADDING to DEFAULT_PADDING
          // so that all elements fit and take as much area as possible.
          const totalPadding =
              ((containerWidth - leftMargin * 2) - iconWidth * items.length) /
              (items.length - 1);

          state.padding = Math.min(DEFAULT_BUTTON_PADDING, 0.5 * totalPadding);
        }

        this.containerWidth_ = containerWidth;
      },
      mutate: state => {
        if (state.noop) {
          return;
        }
        items.forEach((el, i) => {
          if (i != 0) {
            setImportantStyles(el, {'padding-left': px(state.padding)});
          }
          if (i != items.length - 1) {
            setImportantStyles(el, {'padding-right': px(state.padding)});
          }
        });
      },
    }, {});
  }

  /**
   * @return {!Array<!Element>}
   * @private
   */
  getVisibleItems_() {
    return Array.prototype.filter.call(
        dev().assertElement(this.root_).querySelectorAll('li'),
        el => !!el.firstElementChild);
  }

  /**
   * @param {!Object<string, (!JsonObject|boolean)>} providers
   * @public
   */
  setProviders(providers) {
    this.mixin_.setProviders(providers);
    this.applyButtonPadding_();
  }
}
