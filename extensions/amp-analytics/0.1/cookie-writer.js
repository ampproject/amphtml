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

import {isObject, toWin} from '../../../src/types';
import {hasOwn, map} from '../../../src/utils/object';
import {user} from '../../../src/log';
import {Services} from '../../../src/services';
import {setCookie} from '../../../src/cookies';
import {BASE_CID_MAX_AGE_MILLIS} from '../../../src/service/cid-impl';
import {isInFie} from '../../../src/friendly-iframe-embed';
import {Deferred} from '../../../src/utils/promise';
import {isProxyOrigin} from '../../../src/url';


const TAG = 'amp-analytics/cookie-writer';

const EXPAND_WHITELIST = {
  'QUERY_PARAM': true,
  // TODO: Add linker_param
}

export class CookieWriter {

  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!JsonObject} config
   */
  constructor (win, element, config) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ = Services.urlReplacementsForDoc(element);

    /** @private {!Array<!Promise>} */
    this.promises_ = [];

    /** @private {!../../../src/utils/promise.Deferred} */
    this.readyPromise_ = new Deferred();

    this.init_(config);
  }

  /**
   * @return {!Promise}
   */
  whenReady() {
    return this.readyPromise_.promise;
  }

  /**
   * @param {!JsonObject} config
   */
  init_(config) {
    if (!hasOwn(config, 'writeCookies')) {
      this.readyPromise_.resolve();
      return;
    }

    if (!isObject(config['writeCookies'])) {
      user().error(TAG, 'writeCookies config must be an object');
      this.readyPromise_.resolve();
      return;
    }

    if (isInFie(this.element_)) {
      // TODO: Need the consider the case for shadow doc.
      // QQ: Is this even an error since vendor defines it?
      user().error(TAG, 'writeCookies is disabled in friendly iframe');
      this.readyPromise_.resolve();
      return;
    }
    if (isProxyOrigin(this.win_.location)) {
      // Disable cookie writter for proxy origin
      // It's important to check here so that setCookie doesn't throw error on
      // "should not attempt ot set cookie on proxy origin"
      this.readyPromise_.resolve();
      return;
    }

    const inputConfig = config['writeCookies'];
    const ids = Object.keys(inputConfig);
    for (let i = 0; i < ids.length; i++) {
      const cookieId = ids[i];
      const cookieStr = inputConfig[cookieId];
      if (typeof cookieStr === 'string') {
        this.promises_.push(this.expandAndWrite_(cookieId, cookieStr));
      }
    }

    Promise.all(this.promises_).then(() => {
      this.readyPromise_.resolve();
    });
  }

  /**
   * Expand the value and write to cookie if necessary
   * @param {string} cookieId
   * @param {string} cookieStr
   * @return {!Promise}
   */
  expandAndWrite_(cookieId, cookieStr) {
    // Note: Have to use `expandStringAsync` because QUERY_PARAM can wait for
    // trackImpressionPromise and resolve async
    return this.urlReplacementService_.expandStringAsync(cookieStr,
      /* TODO: Add opt_binding */ undefined, EXPAND_WHITELIST).then(
      cookieValue => {
        // Note: We ignore empty cookieValue, that means currently we don't
        // provide a way to overwrite or erase existing cookie
        if (cookieValue) {
          const expireDate = Date.now() + BASE_CID_MAX_AGE_MILLIS;
          setCookie(this.win_, cookieId, cookieValue, expireDate);
        }
    }).catch(e => {
      user().error(TAG, 'Error expanding cookie string', e);
    });
  }
}

