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

import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {urls} from '../../../src/config';
import {parseUrl} from '../../../src/url';
import {LRUCache} from '../../../src/utils/lru-cache';
import {isArray} from '../../../src/types';
import {createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';

/** @private {!Object<string, string|boolean>} */
const TEMPLATE_CORS_CONFIG = {
  mode: 'cors',
  method: 'GET',
  // This should be cached across publisher domains, so don't append
  // __amp_source_origin to the URL.
  ampCors: false,
  credentials: 'omit',
};

export class AmpAdTemplates {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {LRUCache} */
    this.cache_ = new LRUCache(5);
  }

  /**
   * Fetch and parse template from AMP cache.  Result is stored in global in
   * order to reduce overhead when template is used multiple times.
   * @param {string} templateUrl Canonical URL to template.
   * @return {!Promise<string>}
   */
  fetch(templateUrl) {
    const proxyUrl = getMode(this.win_).localDev
      ? templateUrl
      : this.getTemplateProxyUrl_(templateUrl);
    let templatePromise = this.cache_.get(proxyUrl);
    if (!templatePromise) {
      templatePromise = Services.xhrFor(this.win_)
          .fetchText(getMode(this.win_).localDev
            ? `http://ads.localhost:${this.win_.location.port}` +
                `/a4a_template/adzerk/${proxyUrl}`
            : proxyUrl, TEMPLATE_CORS_CONFIG)
          .then(response => response.text());
      this.cache_.put(proxyUrl, templatePromise);
    }
    dev().assert(templatePromise);
    return /** @type{!Promise<string>} */ (templatePromise);
  }

  /**
   * @param {!JsonObject} templateValues The values to macro in.
   * @param {!Element} element Parent element containing template.
   * @return {!Promise<!Element>} Promise which resolves after rendering completes.
   */
  render(templateValues, element) {
    return Services.templatesFor(this.win_)
        .findAndRenderTemplate(element, templateValues);
  }

  /**
   * @param {!Element} element
   * @param {!Array|!JsonObject} analyticsValue
   */
  insertAnalytics(element, analyticsValue) {
    analyticsValue = /**@type {!Array}*/
        (isArray(analyticsValue) ? analyticsValue : [analyticsValue]);
    for (let i = 0; i < analyticsValue.length; i++) {
      const config = analyticsValue[i];
      const analyticsEle = element.ownerDocument.createElement('amp-analytics');
      if (config['remote']) {
        analyticsEle.setAttribute('config', config['remote']);
      }
      if (config['type']) {
        analyticsEle.setAttribute('type', config['type']);
      }
      if (config['inline']) {
        const scriptElem = createElementWithAttributes(
            element.ownerDocument,
            'script', dict({
              'type': 'application/json',
            }));
        scriptElem.textContent = JSON.stringify(config['inline']);
        analyticsEle.appendChild(scriptElem);
      }
      element.appendChild(analyticsEle);
    }
  }

  /**
   * Converts the canonical template URL to the CDN proxy URL.
   * @param {string} url
   * @return {string}
   */
  getTemplateProxyUrl_(url) {
    const cdnUrlSuffix = urls.cdn.slice(8);
    const loc = parseUrl(url);
    return loc.origin.indexOf(cdnUrlSuffix) > 0 ? url :
      'https://' + loc.hostname.replace(/-/g, '--').replace(/\./g, '-') +
      '.' + cdnUrlSuffix + '/ad/s/' + loc.hostname + loc.pathname;
  }
}
