/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {
  ALT_TEXT,
  API_SERVER,
  AT_CONFIG_KEYS,
  CONFIGURATION_EVENT,
  COOKIELESS_API_SERVER,
  ICON_SIZE,
  ORIGIN,
  SHARECOUNTER_SERVER,
  SHARE_CONFIG_KEYS,
  SHARE_EVENT,
} from './constants';
import {
  ActiveToolsMonitor,
} from './addthis-utils/monitors/active-tools-monitor';
import {ClickMonitor} from './addthis-utils/monitors/click-monitor';
import {ConfigManager} from './config-manager';
import {DwellMonitor} from './addthis-utils/monitors/dwell-monitor';
import {PostMessageDispatcher} from './post-message-dispatcher';
import {ScrollMonitor} from './addthis-utils/monitors/scroll-monitor';
import {Services} from '../../../src/services';

import {callEng} from './addthis-utils/eng';
import {callLojson} from './addthis-utils/lojson';
import {callPjson} from './addthis-utils/pjson';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
import {parseUrl} from '../../../src/url';
import {setStyle} from '../../../src/style';
import {user} from '../../../src/log';

// The following items will be shared by all AmpAddThis elements on a page, to prevent unnecessary
// HTTP requests, get accurate analytics, etc., and hence are defined outside of the class.
const configManager = new ConfigManager();
const scrollMonitor = new ScrollMonitor();
const dwellMonitor = new DwellMonitor();
const clickMonitor = new ClickMonitor();
const activeToolsMonitor = new ActiveToolsMonitor();

// `shouldRegisterView` is a shared flag that should be true only for the first built element on the
// page, to prevent registering more than one view per page.
let shouldRegisterView = true;

// Redirection to prevent eslint issues.
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

    /** @private {string} */
    this.referrer_ = '';

    /** @private {(?JsonObject<string, string>|null)} */
    this.shareConfig_ = null;

    /** @private {(?Object<string, string>|null)} */
    this.atConfig_ = null;
  }

  /**
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
    this.shareConfig_ = this.getShareConfigAsJsonObject_();
    this.atConfig_ = this.getATConfig_(ampDoc);

    if (shouldRegisterView) {
      // Register pageview (and setup analytics), only for the first
      // amp-addthis element on the page
      shouldRegisterView = false;

      const viewer = Services.viewerForDoc(ampDoc);
      const loc = parseUrl(this.canonicalUrl_);

      viewer.whenFirstVisible()
          .then(() => viewer.getReferrerUrl())
          .then(referrer => {
            this.referrer_ = referrer;

            callLojson({
              loc,
              title: this.canonicalTitle_,
              pubId: this.pubId_,
              atConfig: this.atConfig_,
              referrer,
              ampDoc,
            });

            dwellMonitor.startForDoc(ampDoc);
            scrollMonitor.startForDoc(ampDoc);
            clickMonitor.startForDoc(ampDoc);
          });

      // Only the component that registers the page view listens for x-frame events.
      this.setupListeners_({ampDoc, loc, pubId: this.pubId_});
    }
  }


  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url(ORIGIN, opt_onLayout);
    this.preconnect.url(API_SERVER, opt_onLayout);
    this.preconnect.url(COOKIELESS_API_SERVER, opt_onLayout);
    this.preconnect.url(SHARECOUNTER_SERVER, opt_onLayout);
    // Images, etc.:
    this.preconnect.url('https://cache.addthiscdn.com', opt_onLayout);
    this.preconnect.url('https://su.addthis.com', opt_onLayout);
  }

  /**
   * @returns {Element}
   */
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
      atConfig: this.atConfig_,
      iframe,
      iframeLoadPromise,
      activeToolsMonitor,
    });

    return iframeLoadPromise;
  }

  /**
   *
   * @return {boolean}
   * @override
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
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
   * @return {JsonObject<string, string>}
   */
  getShareConfigAsJsonObject_() {
    const params = dict();
    SHARE_CONFIG_KEYS.map(key => {
      const value = this.element.getAttribute(`data-${key}`);
      if (value) {
        params[key] = value;
      } else {
        // Fallbacks for values that should always be defined.
        if (key === 'url') {
          params[key] = this.getAmpDoc().getUrl();
        } else if (key === 'title') {
          params[key] = this.getAmpDoc().win.document.title;
        }
      }
    });
    return params;
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

  setupListeners_({ampDoc, loc, pubId}) {
    // Send "engagement" analytics on page hide.
    listen(ampDoc.win, 'pagehide', () => callEng({
      monitors: {
        dwellMonitor,
        scrollMonitor,
        clickMonitor,
        activeToolsMonitor,
      },
      ampDoc,
      loc,
      pubId,
    }));

    const postMessageDispatcher = new PostMessageDispatcher();
    const pmHandler = postMessageDispatcher.handleAddThisMessage.bind(
        postMessageDispatcher
    );

    listen(ampDoc.win, 'message', pmHandler);

    // Trigger "pjson" call when a share occurs.
    postMessageDispatcher.on(SHARE_EVENT, data => callPjson({
      data,
      loc,
      pubId,
      ampDoc,
      title: this.canonicalTitle_,
      atConfig: this.atConfig_,
      referrer: this.referrer_,
    }));

    // Dispatch the configuration to the configManager on a
    // CONFIGURATION_EVENT.
    postMessageDispatcher.on(
        CONFIGURATION_EVENT,
        configManager.receiveConfiguration.bind(configManager)
    );
  }
}

if (typeof AMP.extension === 'function') {
  AMP.extension('amp-addthis', '0.1', AMP => {
    AMP.registerElement('amp-addthis', AmpAddThis);
  });
} else {
  AMP.registerElement('amp-addthis', AmpAddThis);
}
