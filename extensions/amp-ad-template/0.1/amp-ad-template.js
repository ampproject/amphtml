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
import {dev, user} from '../../../src/log';
import {Bind} from '../../amp-bind/0.1/bind-impl';
import {getMode} from '../../../src/mode';
import {getAmpdoc} from '../../../src/service';

/** @typedef {{
      templatePromise: Promise<string>,
      access: number
    }} */
export let CachedTemplateDef;

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
const TAG = 'amp-ad-template';

export class AmpAdTemplate {

  /**
   * @param {!Window} win
   * @param {function(string)=} opt_onRetrieve
   */
  constructor(win, opt_onRetrieve = template => {}) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object<number, !CachedTemplateDef>} */
    this.templateCache_ = {};

    /** @private {function(string)} */
    this.onRetrieve_ = opt_onRetrieve;
  }

  /**
   * Fetch and parse template from AMP cache.  Result is stored in global in
   * order to reduce overhead when template is used multiple times.
   * @param {number} templateId
   * @return {!CachedTemplateDef}
   */
  retrieveTemplate(templateId) {
    // Retrieve template from AMP cache.
    this.templateCache_[templateId] = this.templateCache_[templateId] ||
    {
      templatePromise: Services.xhrFor(this.win_)
            .fetchText(getMode(this.win_).localDev ?
              `http://ads.localhost:${this.win_.location.port}` +
                `/a4a_template/adzerk/${templateId}` :
              `${urls.cdn}/c/s/adzerk/${templateId}`,
            TEMPLATE_CORS_CONFIG)
            .then(response => response.text())
            .then(template => {
              this.onRetrieve_(template);
              return template;
            }),
      access: Date.now()
    };
    const cacheKeys = /**@type {!Array<number>}*/
        (Object.keys(this.templateCache_));
    if (cacheKeys.length > 5) {
      dev().warn(TAG, 'Trimming template cache');
      // Evict oldest entry to ensure memory usage is minimized.
      cacheKeys.sort((a, b) =>
        this.templateCache_[b].access - this.templateCache_[a].access);
      delete this.templateCache_[cacheKeys[cacheKeys.length - 1]];
    }
    dev().assert(this.templateCache_[templateId]);
    return this.templateCache_[templateId];
  }

  /**
   * @param {!JsonObject} templateValues The values to macro in.
   * @param {!Element} element Parent element containing template.
   * @param {!Window=} opt_window
   */
  populateTemplate(templateValues, element, opt_window) {
    const bind = new Bind(getAmpdoc(element), opt_window);
    bind.setState(templateValues);
  }
}

AMP.extension('amp-ad-template', '0.1', AMP => {
  AMP.registerElement('amp-ad-template', AmpAdTemplate);
});
