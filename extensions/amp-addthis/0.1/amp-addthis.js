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

/**
 * @fileoverview Embeds an AddThis widget.
 * The data-pub-id and data-widget-id can be found easily in the AddThis dashboard at addthis.com.
 * Example:
 * <code>
 * <amp-addthis
 *   width="320"
 *   height="92"
 *   layout="responsive"
 *   data-pub-id="ra-59c2c366435ef478"
 *   data-widget-id="0fyg">
 * </amp-addthis>
 * </code>
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {setStyle} from '../../../src/style';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {Services} from '../../../src/services';
import {parseUrl} from '../../../src/url';

import {ConfigManager} from './config-manager';
import {
  AT_CONFIG_KEYS,
  SHARE_CONFIG_KEYS,
  ORIGIN,
  API_SERVER,
  COOKIELESS_API_SERVER,
  ICON_SIZE,
  ALT_TEXT,
} from './constants';
import {callLojson} from './addthis-utils/lojson';

// This `configManager` will be shared by all AmpAddThis elements on a page, to prevent unnecessary
// HTTP requests, get accurate analytics, etc.
const configManager = new ConfigManager();

export function getConfigManager() {
  return configManager;
}

class AmpAddThis extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.pubId_ = '';

    /** @private {string} */
    this.widgetId_ = '';

    /** @private {string} */
    this.canonicalUrl_ = '';

    /** @private {string} */
    this.canonicalTitle_ = '';

    /** @private {(?Object<string, string>|null)} */
    this.shareConfig_ = null;

    /** @private {(?Object<string, string>|null)} */
    this.atConfig_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url(ORIGIN, opt_onLayout);
    this.preconnect.url(API_SERVER, opt_onLayout);
    this.preconnect.url(COOKIELESS_API_SERVER, opt_onLayout);
    this.preconnect.url('https://cache.addthiscdn.com', opt_onLayout);
  }

  /**
   * Note: Does no actual building (building is deferred until layout). Simply checks for/sets
   * required attributes.
   * @override
   */
  buildCallback() {
    const pubId = this.element.getAttribute('data-pub-id');
    const widgetId = this.element.getAttribute('data-widget-id');

    // Required attributes
    this.pubId_ = user().assert(
        pubId,
        'The data-pub-id attribute is required for <amp-addthis> %s',
        this.element
    );
    this.widgetId_ = user().assert(
        widgetId,
        'The data-widget-id attribute is required for <amp-addthis> %s',
        this.element
    );

    // Optional attributes
    const ampDoc = this.getAmpDoc();
    this.canonicalUrl_ = this.element.getAttribute('data-canonical-url') ||
        ampDoc.getUrl();
    this.canonicalTitle_ = this.element.getAttribute('data-canonical-title') ||
        ampDoc.win.document.title;
    this.shareConfig_ = this.getShareConfig_();
    this.atConfig_ = this.getATConfig_(ampDoc);

    // Register pageview
    const viewer = Services.viewerForDoc(ampDoc);
    viewer.whenFirstVisible().then(() => callLojson({
      loc: parseUrl(this.canonicalUrl_),
      title: this.canonicalTitle_,
      pubId: this.pubId_,
      atConfig: this.atConfig_,
      referrer: viewer.getReferrerUrl(),
      ampDoc,
    }));
  }

  createPlaceholderCallback() {
    const placeholder = createElementWithAttributes(
        this.win.document,
        'div',
        dict({
          'placeholder': '',
        })
    );
    setStyle(placeholder, 'background-color', '#eee');

    const image = createElementWithAttributes(
        this.win.document,
        'amp-img',
        dict({
          'src': `https://cache.addthiscdn.com/icons/v3/thumbs/${ICON_SIZE}x${ICON_SIZE}/addthis.png`,
          'layout': 'fixed',
          'width': ICON_SIZE,
          'height': ICON_SIZE,
          'referrerpolicy': 'origin',
          'alt': ALT_TEXT,
        })
    );

    placeholder.appendChild(image);
    return placeholder;
  }

  /**
   * @return {boolean}
   * @override
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = createElementWithAttributes(
        /** @type !Document */ (this.element.ownerDocument),
        'iframe',
        dict({
          'frameborder': 0,
          'title': ALT_TEXT,
          'src': `${ORIGIN}/dc/amp-addthis.html`,
        })
    );
    const iframeLoadPromise = this.loadPromise(iframe);
    setStyle(iframe, 'margin-bottom', '-5px');
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    configManager.register({
      pubId: this.pubId_,
      widgetId: this.widgetId_,
      shareConfig: this.shareConfig_,
      iframe,
      iframeLoadPromise,
      win: this.win,
    });

    return iframeLoadPromise;
  }

  /**
   * @override
   * @return {boolean}
   */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      configManager.unregister({
        pubId: this.pubId_,
        iframe: this.iframe_,
      });
      this.iframe_ = null;
    }
    return true;
  }

  /**
   * @private
   * @return {Object<string, string>}
   */
  getShareConfig_() {
    return SHARE_CONFIG_KEYS.reduce((config, key) => {
      const value = this.element.getAttribute(`data-${key}`);
      if (value) {
        config[key] = value;
      } else {
        // Fallbacks for values that should always be defined.
        if (key === 'url') {
          config[key] = this.getAmpDoc().getUrl();
        } else if (key === 'title') {
          config[key] = this.getAmpDoc().win.document.title;
        }
      }
      return config;
    }, {});
  }

  /**
   * @private
   * @return {Object<string, string>}
   */
  getATConfig_(ampDoc) {
    return AT_CONFIG_KEYS.reduce((config, key) => {
      const value = this.element.getAttribute(`data-${key}`);
      if (value) {
        config[key] = value;
      } else {
        // Fallbacks for values that should always be defined.
        const {win} = ampDoc;
        if (key === 'ui_language') {
          config[key] = win.document.documentElement.lang ||
              win.navigator.language ||
              win.navigator.userLanguage ||
              'en';
        }
      }
      return config;
    }, {});
  }
}

AMP.extension('amp-addthis', '0.1', AMP => {
  AMP.registerElement('amp-addthis', AmpAddThis);
});
