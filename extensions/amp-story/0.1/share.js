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
import {Services} from '../../../src/services';
import {Toast} from './toast';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '../../../src/clipboard';
import {dev, user} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {isObject} from '../../../src/types';
import {listen} from '../../../src/event-helper';
import {renderAsElement, renderSimpleTemplate} from './simple-template';


/**
 * Maps share provider type to visible name.
 * If the name only needs to be capitalized (e.g. `facebook` to `Facebook`) it
 * does not need to be included here.
 * @const {!JsonObject}
 */
const SHARE_PROVIDER_NAME = dict({
  'gplus': 'Google+',
  'linkedin': 'LinkedIn',
  'whatsapp': 'WhatsApp',
});


/** @private @const {!./simple-template.ElementDef} */
const SHARE_LIST_TEMPLATE = {
  tag: 'ul',
  attrs: dict({'class': 'i-amphtml-story-share-list'}),
};


/** @private @const {!./simple-template.ElementDef} */
const SHARE_ITEM_TEMPLATE = {tag: 'li'};


/** @private @const {!./simple-template.ElementDef} */
const LINK_SHARE_ITEM_TEMPLATE = {
  tag: 'div',
  attrs: dict({
    'class':
        'i-amphtml-story-share-icon i-amphtml-story-share-icon-link',
  }),
  text: 'Get Link', // TODO(alanorozco): i18n
};



/**
 * @param {!JsonObject=} opt_params
 * @return {!JsonObject}
 */
function buildProviderParams(opt_params) {
  const attrs = dict();

  if (opt_params) {
    Object.keys(opt_params || {}).forEach(field => {
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
          text: SHARE_PROVIDER_NAME[shareType] || shareType,
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
        text: 'Link copied!', // TODO(alanorozco): i18n
      },
      {
        tag: 'div',
        attrs: dict({'class': 'i-amphtml-story-copy-url'}),
        text: url,
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

    this.root_ = renderAsElement(this.win_.document, SHARE_LIST_TEMPLATE);

    this.maybeAddLinkShareButton_();
    this.maybeAddNativeShare_();

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

    if (!copyTextToClipboard(this.win_.document, url)) {
      Toast.show(this.win_, 'Could not copy link to clipboard :(');
      return;
    }

    Toast.show(this.win_, buildCopySuccessfulToast(this.win_.document, url));
  }


  /** @private */
  maybeAddNativeShare_() {
    // TODO(alanorozco): Implement
  }

  /**
   * @param {!Object<string, (!JsonObject|boolean)>} providers
   * @public
   */
  // TODO(alanorozco): Set story metadata in share config
  setProviders(providers) {
    this.loadRequiredExtensions_();

    Object.keys(providers).forEach(type => {
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
    const item = renderAsElement(this.win_.document, SHARE_ITEM_TEMPLATE);
    item.appendChild(node);
    dev().assert(this.root_).appendChild(item);
  }
}
