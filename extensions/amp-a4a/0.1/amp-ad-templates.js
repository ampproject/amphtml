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
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {getAmpdoc} from '../../../src/service';
import {Bind} from '../../amp-bind/0.1/bind-impl';

/** @private {!Object<string, string|boolean>} */
const TEMPLATE_CORS_CONFIG = {
  mode: 'cors',
  method: 'GET',
  // This should be cached across publisher domains, so don't append
  // __amp_source_origin to the URL.
  ampCors: false,
  credentials: 'omit',
};

/** @const {string} */
const TAG = 'amp-ad-templates';

export class AmpAdTemplates {

  /**
   * @param {!Window} win
   * @param {function(string)=} opt_onRetrieve Function to be executed upon
   *   the successful retrieval of a template. If one is not supplied, we will
   *   default to a no-op.
   */
  constructor(win, opt_onRetrieve = unusedTemplate => {}) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {function(string)} */
    this.onRetrieve_ = opt_onRetrieve;

    /** @private {LRUCache} */
    this.cache_ = new LRUCache(5);
  }

  /**
   * Fetch and parse template from AMP cache.  Result is stored in global in
   * order to reduce overhead when template is used multiple times.
   * @param {string} templateUrl CDN Proxy URL to template.
   * @return {!Promise<string>}
   */
  fetch(templateUrl) {
    let templatePromise = this.cache_.get(templateUrl);
    if (!templatePromise) {
      templatePromise = Services.xhrFor(this.win_)
          .fetchText(getMode(this.win_).localDev
            ? `http://ads.localhost:${this.win_.location.port}` +
                `/a4a_template/adzerk/${templateUrl}`
            : templateUrl, TEMPLATE_CORS_CONFIG)
          .then(response => response.text())
          .then(template => {
            this.onRetrieve_(template);
            return template;
          });
      this.cache_.put(templateUrl, templatePromise);
    }
    dev().assert(templatePromise);
    return /** @type{!Promise<string>} */ (templatePromise);
  }

  /**
   * @param {!JsonObject} templateValues The values to macro in.
   * @param {!Element} element Parent element containing template.
   */
  render(templateValues, element) {
    const win = element.ownerDocument.defaultView;
    if (win) {
      const bind = new Bind(getAmpdoc(element), win);
      bind.setState(templateValues);
    }
  }
}

/** @typedef {{
      payload: *,
      access: number,
    }} */
export let Cacheable;

class LRUCache {
  /** @param {number} capacity */
  constructor(capacity) {
    /** @private {number} */
    this.capacity_ = capacity;

    /** @private {!Object<(number|string), !Cacheable>} */
    this.cache_ = {};
  }

  /**
   * @param {number|string} id
   * @return {*} The cached payload.
   */
  get(id) {
    return this.cache_[id] ? this.cache_[id].payload : undefined;
  }

  /**
   * @param {number|string} id
   * @param {*} payload The payload to cache.
   */
  put(id, payload) {
    this.cache_[id] = {payload, access: Date.now()};
    const cacheKeys = /**@type {!Array<number>}*/ (Object.keys(this.cache_));
    if (cacheKeys.length > this.capacity_) {
      dev().warn(TAG, 'Trimming template cache');
      // Evict oldest entry to ensure memory usage is minimized.
      cacheKeys.sort((a, b) => this.cache_[b].access - this.cache_[a].access);
      delete this.cache_[cacheKeys[cacheKeys.length - 1]];
    }
  }
}
