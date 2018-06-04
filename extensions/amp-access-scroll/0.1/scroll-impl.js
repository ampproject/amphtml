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

import {AccessClientAdapter} from '../../amp-access/0.1/amp-access-client';
import {CSS} from '../../../build/amp-access-scroll-0.1.css';
import {Services} from '../../../src/services';
import {createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {installStylesForDoc} from '../../../src/style-installer';

const TAG = 'amp-access-scroll-elt';

/** @const {!JsonObject} */
const ACCESS_CONFIG = /** @type {!JsonObject} */ ({
  'authorization': 'https://connect.scroll.com/amp/access?' +
                   'rid=READER_ID&o=SOURCE_URL&' +
                   'cid=CLIENT_ID(cid-fallback-cookie)',
  'pingback': 'https://connect.scroll.com/amp/pingback?' +
              'rid=READER_ID&o=SOURCE_URL&cid=CLIENT_ID(cid-fallback-cookie)&' +
              'd=AUTHDATA(scroll)&v=AUTHDATA(visitId)',
  'namespace': 'scroll',
});

const ANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'scroll': 'https://connect.scroll.com/amp/analytics'
              + '?rid=ACCESS_READER_ID'
              + '&cid=CLIENT_ID(cid-fallback-cookie)'
              + '&o=SOURCE_URL&c=CANONICAL_URL'
              + '&d=AUTHDATA(scroll.scroll)'
              + '&v=AUTHDATA(scroll.visitId)'
              + '&s=${totalEngagedTime}',
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
   * @param {!../../amp-access/0.1/amp-access.AccessService} accessService
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   */
  constructor(ampdoc, accessService, accessSource) {
    super(ampdoc, ACCESS_CONFIG, {
      buildUrl: accessSource.buildUrl.bind(accessSource),
      collectUrlVars: accessSource.collectUrlVars.bind(accessSource),
    });

    /** @private {!../../amp-access/0.1/amp-access.AccessService} */
    this.accessService_ = accessService;

    /** @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;
  }

  authorize() {
    return super.authorize()
        .then(response => {
          const isStory = this.ampdoc.getRootNode().querySelector(
              'amp-story[standalone]');
          if (response && response.scroll && !isStory) {
            new ScrollElement(this.ampdoc).show(this.accessService_);
            addAnalytics(this.ampdoc, this.accessSource_.getAdapterConfig());
          }
          return response;
        });
  }
}

/**
 * UI for logged-in Scroll users.
 *
 * Presents a fixed bar at the bottom of the screen.
 */
class ScrollElement {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Element} */
    this.wrapper_ = document.createElement('div');
    this.wrapper_.classList.add('amp-access-scroll-bar');
    ampdoc.getBody().appendChild(this.wrapper_);

    /** @const {!Element} */
    this.placeholder_ = document.createElement('div');
    this.placeholder_.classList.add('amp-access-scroll-placeholder');
    this.wrapper_.appendChild(this.placeholder_);

    const img = document.createElement('img');
    img.setAttribute('src',
        'https://static.scroll.com/assets/icn-scroll-logo.svg');
    img.setAttribute('layout', 'fixed');
    img.setAttribute('width', 26);
    img.setAttribute('height', 26);
    this.placeholder_.appendChild(img);

    /** @const {!Element} */
    this.iframe_ = document.createElement('iframe');
    this.iframe_.setAttribute('scrolling', 'no');
    this.iframe_.setAttribute('frameborder', '0');
    this.iframe_.setAttribute('allowtransparency', 'true');
    this.iframe_.setAttribute('title', 'Scroll');
    this.iframe_.setAttribute('width', '100%');
    this.iframe_.setAttribute('height', '100%');
    this.iframe_.setAttribute('sandbox', 'allow-scripts allow-same-origin ' +
                                         'allow-top-navigation allow-popups ' +
                                         'allow-popups-to-escape-sandbox');
    this.wrapper_.appendChild(this.iframe_);

  }

  /**
   * @param {!../../amp-access/0.1/amp-access.AccessService} accessService
   */
  show(accessService) {
    accessService.getAccessReaderId()
        .then(readerId => {
          this.iframe_.onload = () => {
            this.wrapper_.removeChild(this.placeholder_);
          };
          this.iframe_.setAttribute('src',
              'https://connect.scroll.com/amp/scrollbar?readerId=' +
              encodeURIComponent(readerId));
        });
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
  const analyticsElem = createElementWithAttributes(doc, 'amp-analytics',
      attributes);
  const scriptElem = createElementWithAttributes(
      doc,
      'script', dict({
        'type': 'application/json',
      }));
  scriptElem.textContent = JSON.stringify(ANALYTICS_CONFIG);
  analyticsElem.appendChild(scriptElem);
  analyticsElem.CONFIG = ANALYTICS_CONFIG;

  // Get extensions service and force load analytics extension
  const extensions = Services.extensionsFor(ampdoc.win);
  extensions./*OK*/installExtensionForDoc(ampdoc, 'amp-analytics');

  // Append
  ampdoc.getBody().appendChild(analyticsElem);
}
