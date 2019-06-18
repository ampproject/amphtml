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

import * as utils from './utils';
import {Services} from '../../../src/services';
import {createElementWithAttributes} from '../../../src/dom';
import {userAssert} from '../../../src/log';

/** @const */
const TAG = 'amp-denakop';

export class AmpDenakop extends AMP.BaseElement {
  /** @override */
  buildCallback() {
    const tagId = this.element.getAttribute('data-tag-id');
    userAssert(tagId, 'Missing tag id attribute');

    const publisherId = this.element.getAttribute('data-publisher-id');
    userAssert(publisherId, 'Missing publisher id attribute');

    const ampdoc = this.getAmpDoc();
    Services.extensionsFor(this.win)
        .installExtensionForDoc(ampdoc, 'amp-ad');
    Services.extensionsFor(this.win)
        .installExtensionForDoc(ampdoc, 'amp-sticky-ad');
    Services.extensionsFor(this.win)
        .installExtensionForDoc(ampdoc, 'amp-iframe');
    Services.extensionsFor(this.win)
        .installExtensionForDoc(ampdoc, 'amp-analytics');

    const viewer = Services.viewerForDoc(this.getAmpDoc());
    const whenVisible = viewer.whenFirstVisible();
    const uxid = utils.getCookie('uxid');

    whenVisible
        .then(() => {
          return this.getConfig_(utils.getConfigUrl({
            t: tagId,
            p: publisherId,
            tz: utils.rand(),
            uxid,
          }));
        })
        .then(configObj => {
          if (!configObj) {
            return;
          }

          const doc = ampdoc.win.document;
          const body = ampdoc.getBody();

          utils.setCookie('uxid', configObj['user']['uxid'],
              configObj['settings']['topDomain'], 10);

          const stickyAdAttributes = utils.getStickyAdAttributes();

          if (configObj['adUnits'].length !== 0) {
            configObj['adUnits'].forEach(function(adUnit) {

              const adAttributes = utils.getAdAttributes(adUnit);
              const ampAd = createElementWithAttributes(doc, 'amp-ad',
                  adAttributes);
              const ampStickyAd = createElementWithAttributes(doc,
                  'amp-sticky-ad', stickyAdAttributes);
              const extraUrlParams = utils.getExtraUrlParams(publisherId, tagId,
                  configObj, adUnit);
              const adAnalyticsAuthorizedConfig =
                /** @type {!JsonObject} */ utils.getAmpAdAnalyticsAuthorizedConfig(extraUrlParams);
              const adAnalyticsViewConfig =
                /** @type {!JsonObject} */ utils.getAmpAdAnalyticsViewConfig(extraUrlParams);

              ampStickyAd.appendChild(ampAd);
              body.insertBefore(ampStickyAd, body.firstChild);
              utils.analyticAd(ampAd, adAnalyticsAuthorizedConfig,
                  adAnalyticsViewConfig);
            });
          }
        });
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /**
   * @param {string} configUrl
   * @return {!Promise<!JsonObject>}
   *
   * @private
   */
  getConfig_(configUrl) {
    return Services.xhrFor(this.win)
        .fetch(configUrl, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'text/plain',
            'Content-Type': 'text/plain',
          },
        })
        .then(res => res.json())
        .catch(reason => {
          this.user().error(TAG, 'amp-denakop config xhr failed: ' + reason);

          return null;
        });
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDenakop);
});
