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
import {getNameArgs} from './variables';
import {hasOwn} from '../../../src/utils/object';
import {isInFie} from '../../../src/friendly-iframe-embed';
import {isObject} from '../../../src/types';
import {isProxyOrigin} from '../../../src/url';
import {setCookie} from '../../../src/cookies';
import {user} from '../../../src/log';


const TAG = 'amp-analytics/cookie-writer';

const EXPAND_WHITELIST = {
  'QUERY_PARAM': true,
  // TODO: Add linker_param
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


    if (!hasOwn(this.config_, 'writeCookies')) {
      return Promise.resolve();
    }

    if (!isObject(this.config_['writeCookies'])) {
      user().error(TAG, 'writeCookies config must be an object');
      return Promise.resolve();
    }

    const inputConfig = this.config_['writeCookies'];
    const ids = Object.keys(inputConfig);
    const promises = [];
    for (let i = 0; i < ids.length; i++) {
      const cookieName = ids[i];
      const cookieValue = inputConfig[cookieName];
      if (this.isCookieValueStringValid_(cookieValue)) {
        promises.push(this.expandAndWrite_(cookieName, cookieValue));
      }
    }

    return Promise.all(promises);
  }

  /**
   * Check whether the cookie value is supported. Currently only support
   * QUERY_PARAM(***)
   * @param {*} str
   * @return {boolean}
   */
  isCookieValueStringValid_(str) {
    if (typeof str !== 'string') {
      user().error(TAG, 'cookie value needs to be a string');
      return false;
    }

    // Make sure that only QUERY_PARAM and LINKER_PARAM is supported
    const {name} = getNameArgs(str);
    if (!EXPAND_WHITELIST[name]) {
      user().error(TAG, `cookie value ${str} not supported. ` +
        'Only QUERY_PARAM is supported');
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
        /* TODO: Add opt_binding */ undefined, EXPAND_WHITELIST).then(
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

