/**
 * @fileoverview Embeds an AddThis widget.
 * The data-pub-id and data-widget-id can be found easily in the AddThis
 * dashboard at addthis.com.
 * For floating tool, pickup floating widget-id from dashboard
 * and add an attribute: data-widget-type="floating"
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

import {createElementWithAttributes, removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {setStyle} from '#core/dom/style';
import * as mode from '#core/mode';

import {Services} from '#service';

import {listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {callEng} from './addthis-utils/eng';
import {getWidgetOverload} from './addthis-utils/get-widget-id-overloaded-with-json-for-anonymous-mode';
import {callLojson} from './addthis-utils/lojson';
import {getOgImage} from './addthis-utils/meta';
import {
  getAddThisMode,
  isProductCode,
  isPubId,
  isWidgetId,
} from './addthis-utils/mode';
import {ActiveToolsMonitor} from './addthis-utils/monitors/active-tools-monitor';
import {ClickMonitor} from './addthis-utils/monitors/click-monitor';
import {DwellMonitor} from './addthis-utils/monitors/dwell-monitor';
import {ScrollMonitor} from './addthis-utils/monitors/scroll-monitor';
import {callPjson} from './addthis-utils/pjson';
import {ConfigManager} from './config-manager';
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
import {PostMessageDispatcher} from './post-message-dispatcher';

import {CSS} from '../../../build/amp-addthis-0.1.css';
import {parseUrlDeprecated} from '../../../src/url';

// The following items will be shared by all AmpAddThis elements on a page, to
// prevent unnecessary HTTP requests, get accurate analytics, etc., and hence
// are defined outside of the class.
const configManager = new ConfigManager();
const scrollMonitor = new ScrollMonitor();
const dwellMonitor = new DwellMonitor();
const clickMonitor = new ClickMonitor();
const activeToolsMonitor = new ActiveToolsMonitor();

// `shouldRegisterView` is a shared flag that should be true only for the first
// built element on the page, to prevent registering more than one view per
// page.
let shouldRegisterView = true;

/**
 * Redirection to prevent eslint issues.
 * @return {*} TODO(#23582): Specify return type
 */
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
    this.productCode_ = '';

    /** @private {string} */
    this.canonicalUrl_ = '';

    /** @private {string} */
    this.canonicalTitle_ = '';

    /** @private {string} */
    this.referrer_ = '';

    /** @private {?JsonObject<string, string>} */
    this.shareConfig_ = null;

    /** @private {(?JsonObject)} */
    this.atConfig_ = null;

    /** @private {string} */
    this.widgetType_ = '';

    /** @private {number} */
    this.mode_ = -1;

    /** @private {string} */
    this.containerClassName_ = '';
  }

  /**
   * @override
   */
  buildCallback() {
    const pubId = this.element.getAttribute('data-pub-id') || '';
    const widgetId = this.element.getAttribute('data-widget-id') || '';
    const productCode = this.element.getAttribute('data-product-code') || '';
    this.mode_ = getAddThisMode({pubId, widgetId, productCode});
    if (this.mode_ === -1) {
      if (isPubId(pubId)) {
        if (!isProductCode(productCode) && !isWidgetId(widgetId)) {
          userAssert(
            widgetId,
            'Widget id or product code is required for <amp-addthis> %s',
            this.element
          );
        } else if (isProductCode(productCode) && isWidgetId(widgetId)) {
          userAssert(
            productCode,
            'Only widget id or product code is required <amp-addthis> %s',
            this.element
          );
        }
      } else {
        userAssert(
          pubId,
          'The data-pub-id attribute is required for <amp-addthis> %s',
          this.element
        );
      }
    }

    this.containerClassName_ =
      this.element.getAttribute('data-class-name') || '';

    this.pubId_ = pubId;
    this.widgetId_ = this.mode_ === 3 ? getWidgetOverload(this) : widgetId;
    this.productCode_ = productCode;

    // sets the widget type when we use a product code for WP modes
    if (this.productCode_ === 'shfs') {
      this.element.setAttribute('data-widget-type', 'floating');
    }

    // Optional attributes
    const ampDoc = this.getAmpDoc();
    this.canonicalUrl_ =
      this.element.getAttribute('data-canonical-url') ||
      Services.documentInfoForDoc(this.element).canonicalUrl ||
      ampDoc.getUrl();
    this.canonicalTitle_ =
      this.element.getAttribute('data-canonical-title') ||
      ampDoc.win.document.title;
    this.widgetType_ = this.element.getAttribute('data-widget-type');
    this.shareConfig_ = this.getShareConfigAsJsonObject_();
    this.atConfig_ = this.getATConfig_(ampDoc);

    if (shouldRegisterView) {
      // Register pageview (and setup analytics), only for the first
      // amp-addthis element on the page
      shouldRegisterView = false;

      const viewer = Services.viewerForDoc(ampDoc);
      const loc = parseUrlDeprecated(this.canonicalUrl_);

      ampDoc
        .whenFirstVisible()
        .then(() => viewer.getReferrerUrl())
        .then((referrer) => {
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

      // Only the component that registers the page view listens for x-frame
      // events.
      this.setupListeners_({ampDoc, loc, pubId: this.pubId_});

      // Create close button for listing tool
      if (this.element.getAttribute('data-widget-type') === 'messages') {
        const closeButton = createElementWithAttributes(
          this.win.document,
          'button',
          {
            'class': 'i-amphtml-addthis-close',
          }
        );
        closeButton.onclick = () => removeElement(this.element);
        this.element.appendChild(closeButton);
      }
    }
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    const ampdoc = this.getAmpDoc();
    preconnect.url(ampdoc, ORIGIN, opt_onLayout);
    preconnect.url(ampdoc, API_SERVER, opt_onLayout);
    preconnect.url(ampdoc, COOKIELESS_API_SERVER, opt_onLayout);
    preconnect.url(ampdoc, SHARECOUNTER_SERVER, opt_onLayout);
    // Images, etc.:
    preconnect.url(ampdoc, 'https://cache.addthiscdn.com', opt_onLayout);
    preconnect.url(ampdoc, 'https://su.addthis.com', opt_onLayout);
  }

  /** @override */
  isAlwaysFixed() {
    return this.widgetType_ === 'floating';
  }

  /**
   * @return {Element}
   */
  createPlaceholderCallback() {
    const placeholder = createElementWithAttributes(this.win.document, 'div', {
      'placeholder': '',
    });
    setStyle(placeholder, 'background-color', '#fff');

    const image = createElementWithAttributes(this.win.document, 'amp-img', {
      'src': `https://cache.addthiscdn.com/icons/v3/thumbs/${ICON_SIZE}x${ICON_SIZE}/addthis.png`,
      'layout': 'fixed',
      'width': ICON_SIZE,
      'height': ICON_SIZE,
      'referrerpolicy': 'origin',
      'alt': ALT_TEXT,
    });

    placeholder.appendChild(image);
    return placeholder;
  }

  /** @override */
  layoutCallback() {
    const iframe = createElementWithAttributes(
      /** @type {!Document} */ (this.element.ownerDocument),
      'iframe',
      {
        'frameborder': 0,
        'title': ALT_TEXT,
        // Document has overly long cache age: go.amp.dev/issue/24848
        // Adding AMP runtime version as a meaningless query param to force bust
        // cached versions.
        'src': `${ORIGIN}/dc/amp-addthis.html?_amp_=${mode.version()}`,
        'id': this.widgetId_,
        'pco': this.productCode_,
        'containerClassName': this.containerClassName_,
      }
    );
    const iframeLoadPromise = this.loadPromise(iframe);

    applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    configManager.register({
      pubId: this.pubId_,
      widgetId: this.widgetId_,
      productCode: this.productCode_,
      shareConfig: this.shareConfig_,
      atConfig: this.atConfig_,
      containerClassName: this.containerClassName_,
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
   * @return {!JsonObject}
   */
  getShareConfigAsJsonObject_() {
    const params = {};
    SHARE_CONFIG_KEYS.map((key) => {
      const value = this.element.getAttribute(`data-${key}`);
      if (value) {
        params[key] = value;
      } else {
        // Fallbacks for values that should always be defined.
        if (key === 'url') {
          params[key] = this.getAmpDoc().getUrl();
        } else if (key === 'title') {
          params[key] = this.getAmpDoc().win.document.title;
        } else if (key === 'media') {
          params[key] = getOgImage(this.getAmpDoc().win.document);
        }
      }
    });
    return params;
  }

  /**
   * @private
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   * @return {!JsonObject}
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
          config[key] =
            win.document.documentElement.lang ||
            win.navigator.language ||
            win.navigator.userLanguage ||
            'en';
        }
      }
      return config;
    }, {});
  }

  /**
   * @typedef {{
   *   ampdoc: !../../../src/service/ampdoc-impl.AmpDoc,
   *   loc: *,
   *   pubId: *,
   * }} SetupListenersInput
   */

  /**
   * Sets up listeners.
   *
   * @param {!SetupListenersInput} input
   * @memberof AmpAddThis
   */
  setupListeners_(input) {
    const {ampDoc, loc, pubId} = input;
    // Send "engagement" analytics on page hide.
    listen(ampDoc.win, 'pagehide', () =>
      callEng({
        monitors: {
          dwellMonitor,
          scrollMonitor,
          clickMonitor,
          activeToolsMonitor,
        },
        ampDoc,
        loc,
        pubId,
      })
    );

    const postMessageDispatcher = new PostMessageDispatcher();
    const pmHandler = postMessageDispatcher.handleAddThisMessage.bind(
      postMessageDispatcher
    );

    listen(ampDoc.win, 'message', pmHandler);

    // Trigger "pjson" call when a share occurs.
    postMessageDispatcher.on(SHARE_EVENT, (data) =>
      callPjson({
        data,
        loc,
        pubId,
        ampDoc,
        title: this.canonicalTitle_,
        atConfig: this.atConfig_,
        referrer: this.referrer_,
      })
    );

    // Dispatch the configuration to the configManager on a
    // CONFIGURATION_EVENT.
    postMessageDispatcher.on(
      CONFIGURATION_EVENT,
      configManager.receiveConfiguration.bind(configManager)
    );
  }
}

AMP.extension('amp-addthis', '0.1', (AMP) => {
  AMP.registerElement('amp-addthis', AmpAddThis, CSS);
});
