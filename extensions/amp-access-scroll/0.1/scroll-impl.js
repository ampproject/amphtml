/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {AccessClientAdapter} from '../../amp-access/0.1/amp-access-client';
import {ActivateBar, ScrollUserBar} from './scroll-bar';
import {Audio} from './scroll-audio';
import {CSS} from '../../../build/amp-access-scroll-0.1.css';
import {ReadDepthTracker} from './read-depth-tracker.js';
import {Relay} from './scroll-relay';
import {Services} from '../../../src/services';
import {createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {installStylesForDoc} from '../../../src/style-installer';
import {parseQueryString} from '../../../src/url';

const TAG = 'amp-access-scroll-elt';
/**
 * @param {string} baseUrl
 * @return {!JsonObject}
 */
const accessConfig = baseUrl => {
  /** @const {!JsonObject} */
  const ACCESS_CONFIG = /** @type {!JsonObject} */ ({
    'authorization':
      `${baseUrl}/amp/access` +
      '?rid=READER_ID' +
      '&cid=CLIENT_ID(scroll1)' +
      '&c=CANONICAL_URL' +
      '&o=AMPDOC_URL' +
      '&x=QUERY_PARAM(scrollx)',
    'pingback':
      `${baseUrl}/amp/pingback` +
      '?rid=READER_ID' +
      '&cid=CLIENT_ID(scroll1)' +
      '&c=CANONICAL_URL' +
      '&o=AMPDOC_URL' +
      '&r=DOCUMENT_REFERRER' +
      '&x=QUERY_PARAM(scrollx)' +
      '&d=AUTHDATA(scroll)' +
      '&v=AUTHDATA(visitId)',
    'namespace': 'scroll',
  });
  return ACCESS_CONFIG;
};

/**
 * @param {string} baseUrl
 * @return {!JsonObject}
 */
const analyticsConfig = baseUrl => {
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
        '&s=${totalEngagedTime}',
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
 * The eTLD for scroll URLs in development mode.
 *
 * Enables amp-access-scroll to work with dev/staging environments.
 *
 * @param {!JsonObject} config
 * @return {string}
 */
const devEtld = config => {
  return getMode().development && config['etld'] ? config['etld'] : '';
};

/**
 * The connect server hostname.
 *
 * @param {!JsonObject} config
 * @return {string}
 */
const connectHostname = config => {
  return `https://connect${devEtld(config) || '.scroll.com'}`;
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
    return super.authorize().then(response => {
      const isStory = this.ampdoc
        .getRootNode()
        .querySelector('amp-story[standalone]');

      if (response && response['scroll']) {
        if (!isStory) {
          // Display Scrollbar and set up features
          const bar = new ScrollUserBar(
            this.ampdoc,
            this.accessSource_,
            this.baseUrl_
          );
          const audio = new Audio(this.ampdoc);

          const relay = new Relay(this.baseUrl_);
          relay.register(audio.window, message => {
            if (message['_scramp'] === 'au') {
              audio.update(message);
            }
          });
          relay.register(bar.window);

          const config = this.accessSource_.getAdapterConfig();
          addAnalytics(this.ampdoc, config);
          if (response['features'] && response['features']['readDepth']) {
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
          new ScrollContentBlocker(this.ampdoc, this.accessSource_).check();
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
   */
  constructor(ampdoc, accessSource) {
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;
  }

  /**
   * Check if the Scroll App blocks the resource request.
   */
  check() {
    Services.xhrFor(this.ampdoc_.win)
      .fetchJson('https://block.scroll.com/check.json')
      .then(() => false, e => this.blockedByScrollApp_(e.message))
      .then(blockedByScrollApp => {
        if (blockedByScrollApp === true) {
          // TODO(dbow): Ideally we would automatically redirect to the page
          // here, but for now we are adding a button so we redirect on user
          // action.
          new ActivateBar(
            this.ampdoc_,
            this.accessSource_,
            connectHostname(this.accessSource_.getAdapterConfig())
          );
        }
      });
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
  const attributes = dict({'trigger': 'immediate'});
  if (vendorConfig['dataConsentId']) {
    attributes['data-block-on-consent'] = '';
  }
  const analyticsElem = createElementWithAttributes(
    doc,
    'amp-analytics',
    attributes
  );
  const scriptElem = createElementWithAttributes(
    doc,
    'script',
    dict({
      'type': 'application/json',
    })
  );
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
