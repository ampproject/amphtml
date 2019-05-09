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

import {BASE_CID_MAX_AGE_MILLIS} from '../../../src/service/cid-impl';
import {Services} from '../../../src/services';
import {getMode} from '../../../src/mode';
import {getNameArgs, variableServiceFor} from './variables';
import {hasOwn} from '../../../src/utils/object';
import {isInFie} from '../../../src/friendly-iframe-embed';
import {isObject} from '../../../src/types';
import {isProxyOrigin} from '../../../src/url';
import {setCookie} from '../../../src/cookies';
import {user} from '../../../src/log';

const TAG = 'amp-analytics/cookie-writer';

const EXPAND_WHITELIST = {
  'QUERY_PARAM': true,
  'LINKER_PARAM': true,
};

const RESERVED_KEYS = {
  'referrerDomains': true,
  'enabled': true,
  'cookiePath': true,
  'cookieMaxAge': true,
  'cookieSecure': true,
  'cookieDomain': true,
};

export class CookieWriter {

  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!JsonObject} config
   */
  constructor(win, element, config) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ = Services.urlReplacementsForDoc(element);

    /** @private {?Promise} */
    this.writePromise_ = null;

    /** @private {!JsonObject} */
    this.config_ = config;

    /** @const @private {!JsonObject} */
    this.bindings_ = variableServiceFor(this.win_).getMacros();
  }

  /**
   * @return {!Promise}
   */
  write() {
    if (!this.writePromise_) {
      this.writePromise_ = this.init_();
    }

    return this.writePromise_;
  }

  /**
   * Parse the config and write to cookie
   * Config looks like
   * cookies: {
   *   enabled: true/false, //Default to true
   *   cookieNameA: {
   *     value: cookieValueA (QUERY_PARAM/LINKER_PARAM)
   *   },
   *   cookieValueB: {
   *     value: cookieValueB
   *   }
   *   ...
   * }
   * @return {!Promise}
   */
  init_() {
    // TODO: Need the consider the case for shadow doc.
    if (isInFie(this.element_) || isProxyOrigin(this.win_.location) ||
        getMode(this.win_).runtime == 'inabox') {
      // Disable cookie writer in friendly iframe and proxy origin and inabox.
      // Note: It's important to check origin here so that setCookie doesn't
      // throw error "should not attempt ot set cookie on proxy origin"
      return Promise.resolve();
    }


    if (!hasOwn(this.config_, 'cookies')) {
      return Promise.resolve();
    }

    if (!isObject(this.config_['cookies'])) {
      user().error(TAG, 'cookies config must be an object');
      return Promise.resolve();
    }

    const inputConfig = this.config_['cookies'];

    if (inputConfig['enabled'] === false) {
      // Enabled by default
      // TODO: Allow indiviual cookie object to override the value
      return Promise.resolve();
    }

    const ids = Object.keys(inputConfig);
    const promises = [];
    for (let i = 0; i < ids.length; i++) {
      const cookieName = ids[i];
      const cookieObj = inputConfig[cookieName];
      if (this.isValidCookieConfig_(cookieName, cookieObj)) {
        promises.push(this.expandAndWrite_(cookieName, cookieObj['value']));
      }
    }

    return Promise.all(promises);
  }

  /**
   * Check whether the cookie value is supported. Currently only support
   * QUERY_PARAM(***) and LINKER_PARAM(***, ***)
   *
   * CookieObj should looks like
   * cookeName: {
   *  value: string (cookieValue),
   * }
   * @param {string} cookieName
   * @param {*} cookieConfig
   * @return {boolean}
   */
  isValidCookieConfig_(cookieName, cookieConfig) {
    if (RESERVED_KEYS[cookieName]) {
      return false;
    }

    if (!isObject(cookieConfig)) {
      user().error(TAG, 'cookieValue must be configured in an object');
      return false;
    }

    if (!hasOwn(cookieConfig, 'value')) {
      user().error(TAG, 'value is required in the cookieValue object');
      return false;
    }

    const str = cookieConfig['value'];
    // Make sure that only QUERY_PARAM and LINKER_PARAM is supported
    const {name} = getNameArgs(str);
    if (!EXPAND_WHITELIST[name]) {
      user().error(TAG, `cookie value ${str} not supported. ` +
        'Only QUERY_PARAM and LINKER_PARAM is supported');
      return false;
    }

    return true;
  }

  /**
   * Expand the value and write to cookie if necessary
   * @param {string} cookieName
   * @param {string} cookieValue
   * @return {!Promise}
   */
  expandAndWrite_(cookieName, cookieValue) {
    // Note: Have to use `expandStringAsync` because QUERY_PARAM can wait for
    // trackImpressionPromise and resolve async
    return this.urlReplacementService_.expandStringAsync(cookieValue,
        this.bindings_, EXPAND_WHITELIST).then(
        value => {
          // Note: We ignore empty cookieValue, that means currently we don't
          // provide a way to overwrite or erase existing cookie
          if (value) {
            const expireDate = Date.now() + BASE_CID_MAX_AGE_MILLIS;
            setCookie(this.win_, cookieName, value, expireDate);
          }
        }).catch(e => {
      user().error(TAG, 'Error expanding cookie string', e);
    });
  }
}
