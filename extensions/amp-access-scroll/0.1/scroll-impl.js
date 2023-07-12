import {createElementWithAttributes} from '#core/dom';
import {parseQueryString} from '#core/types/string/url';

import {Services} from '#service';

import {ReadDepthTracker} from './read-depth-tracker';
import {ScrollBar} from './scroll-bar';
import {PROTOCOL_VERSION} from './scroll-protocol';
import {Relay} from './scroll-relay';
import {Sheet} from './scroll-sheet';
import {buildUrl, connectHostname} from './scroll-url';

import {CSS} from '../../../build/amp-access-scroll-0.1.css';
import {installStylesForDoc} from '../../../src/style-installer';
import {addParamToUrl, isProxyOrigin} from '../../../src/url';
import {AccessClientAdapter} from '../../amp-access/0.1/amp-access-client';

const TAG = 'amp-access-scroll-elt';
/**
 * @param {string} baseUrl
 * @return {!JsonObject}
 */
const accessConfig = (baseUrl) => {
  /** @const {!JsonObject} */
  const ACCESS_CONFIG = /** @type {!JsonObject} */ ({
    'authorization':
      `${baseUrl}/amp/access` +
      '?rid=READER_ID' +
      '&cid=CLIENT_ID(scroll1)' +
      '&c=CANONICAL_URL' +
      '&o=AMPDOC_URL' +
      '&x=QUERY_PARAM(scrollx)' +
      `&p=${PROTOCOL_VERSION}`,
    'pingback':
      `${baseUrl}/amp/pingback` +
      '?rid=READER_ID' +
      '&cid=CLIENT_ID(scroll1)' +
      '&c=CANONICAL_URL' +
      '&o=AMPDOC_URL' +
      '&r=DOCUMENT_REFERRER' +
      '&x=QUERY_PARAM(scrollx)' +
      '&d=AUTHDATA(scroll)' +
      '&v=AUTHDATA(visitId)' +
      `&p=${PROTOCOL_VERSION}`,
    'namespace': 'scroll',
  });
  return ACCESS_CONFIG;
};

/**
 * @param {string} baseUrl
 * @return {!JsonObject}
 */
const analyticsConfig = (baseUrl) => {
  const ANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
    'requests': {
      'scroll':
        `${baseUrl}/amp/analytics` +
        '?rid=ACCESS_READER_ID' +
        '&cid=CLIENT_ID(scroll1)' +
        '&c=CANONICAL_URL' +
        '&o=AMPDOC_URL' +
        '&r=DOCUMENT_REFERRER' +
        '&x=QUERY_PARAM(scrollx)' +
        '&d=AUTHDATA(scroll.scroll)' +
        '&v=AUTHDATA(scroll.visitId)' +
        '&h=SOURCE_HOSTNAME' +
        '&s=${totalEngagedTime}' +
        `&p=${PROTOCOL_VERSION}`,
    },
    'triggers': {
      'trackInterval': {
        'on': 'timer',
        'timerSpec': {
          'interval': 15,
          'maxTimerLength': 7200,
        },
        'request': 'scroll',
      },
    },
  });
  return ANALYTICS_CONFIG;
};

/**
 * amp-access vendor that authenticates against the scroll.com service.
 * If the user is authenticated, also adds a fixed position iframe
 * to the page.
 *
 * A little gross, but avoid some duplicate code by inheriting
 * from ClientAdapter.
 * @implements {../../amp-access/0.1/access-vendor.AccessVendor}
 */
export class ScrollAccessVendor extends AccessClientAdapter {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   */
  constructor(ampdoc, accessSource) {
    const scrollConfig = accessSource.getAdapterConfig();
    const baseUrl = connectHostname(scrollConfig);
    super(ampdoc, accessConfig(baseUrl), {
      buildUrl: accessSource.buildUrl.bind(accessSource),
      collectUrlVars: accessSource.collectUrlVars.bind(accessSource),
    });

    // Install styles
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;
    /** @private */
    this.baseUrl_ = baseUrl;
  }

  /** @override */
  authorize() {
    // TODO(dbow): Handle timeout?
    return super.authorize().then((response) => {
      const isStory = this.ampdoc
        .getRootNode()
        .querySelector('amp-story[standalone]');

      if (response && response['scroll']) {
        if (!isStory) {
          // Display Scrollbar and set up features
          const bar = new ScrollBar(this.ampdoc, this.accessSource_);
          const sheet = new Sheet(this.ampdoc);

          const relay = new Relay(this.baseUrl_);
          relay.register(sheet.window, (message) => {
            if (message['_scramp'] === 'au' || message['_scramp'] === 'st') {
              sheet.update(message);
            }
          });
          relay.register(bar.window, (message) => {
            if (message['_scramp'] === 'st') {
              sheet.update(message);
              bar.update(message);
            }
          });

          const config = this.accessSource_.getAdapterConfig();
          addAnalytics(this.ampdoc, config);
          if (response['features'] && response['features']['d']) {
            new ReadDepthTracker(
              this.ampdoc,
              this.accessSource_,
              connectHostname(config)
            );
          }
        }
      } else {
        if (
          response &&
          response['blocker'] &&
          ScrollContentBlocker.shouldCheck(this.ampdoc)
        ) {
          new ScrollContentBlocker(
            this.ampdoc,
            this.accessSource_,
            response['features'] && response['features']['r']
          ).check();
        }
      }
      return response;
    });
  }
}

/**
 * Coordinate with the Scroll App's Content Blocker on Safari browsers.
 */
class ScrollContentBlocker {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {boolean}
   * @static
   */
  static shouldCheck(ampdoc) {
    const queryParams = parseQueryString(ampdoc.win.location.search);
    return !queryParams['scrollnoblockerrefresh'];
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   * @param {boolean} redirect
   */
  constructor(ampdoc, accessSource, redirect) {
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;

    /** @const @private {boolean} */
    this.redirect_ = redirect;
  }

  /**
   * Check if the Scroll App blocks the resource request.
   */
  check() {
    Services.xhrFor(this.ampdoc_.win)
      .fetchJson('https://block.scroll.com/check.json')
      .then(
        (response) => response.json().then((json) => json['dns'] === true),
        (e) => this.blockedByScrollApp_(e.message)
      )
      .then((blockedByScrollApp) => {
        if (blockedByScrollApp === true) {
          this.handleBlocked_();
        }
      });
  }

  /** @private */
  handleBlocked_() {
    // Redirect app auth flow if enabled and not on AMP proxy.
    if (this.redirect_ && !isProxyOrigin(this.ampdoc_.win.location)) {
      buildUrl(this.accessSource_, 'https://scroll.com/loginwithapp').then(
        (url) => {
          const navigationService = Services.navigationForDoc(this.ampdoc_);
          navigationService.navigateTo(
            this.ampdoc_.win,
            addParamToUrl(url, 'feature', 'r')
          );
        }
      );
    } else {
      // Prompt to activate.
      const baseUrl = connectHostname(this.accessSource_.getAdapterConfig());
      const bar = new ScrollBar(this.ampdoc_, this.accessSource_);
      const relay = new Relay(baseUrl);
      relay.register(bar.window, (message) => {
        if (message['_scramp'] === 'st') {
          bar.update(message);
        }
      });
    }
  }

  /**
   * Whether the given error message indicates the Scroll App blocked the
   * request.
   *
   * @param {string} message
   * @return {boolean}
   * @private
   */
  blockedByScrollApp_(message) {
    return (
      message.indexOf(
        'XHR Failed fetching (https://block.scroll.com/...): ' +
          'Resource blocked by content blocker'
      ) === 0
    );
  }
}

/**
 * Add analytics for Scroll to page.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject} vendorConfig
 */
function addAnalytics(ampdoc, vendorConfig) {
  if (vendorConfig['disableAnalytics']) {
    return;
  }

  // Create analytics element
  const doc = /** @type {!Document} */ (ampdoc.win.document);
  const attributes = {'trigger': 'immediate'};
  if (vendorConfig['dataConsentId']) {
    attributes['data-block-on-consent'] = '';
  }
  const analyticsElem = createElementWithAttributes(
    doc,
    'amp-analytics',
    attributes
  );
  const scriptElem = createElementWithAttributes(doc, 'script', {
    'type': 'application/json',
  });
  const ANALYTICS_CONFIG = analyticsConfig(connectHostname(vendorConfig));
  scriptElem.textContent = JSON.stringify(ANALYTICS_CONFIG);
  analyticsElem.appendChild(scriptElem);
  analyticsElem.CONFIG = ANALYTICS_CONFIG;

  // Get extensions service and force load analytics extension
  const extensions = Services.extensionsFor(ampdoc.win);
  extensions./*OK*/ installExtensionForDoc(ampdoc, 'amp-analytics');

  // Append
  ampdoc.getBody().appendChild(analyticsElem);
}
