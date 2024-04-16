import {isObject} from '#core/types';
import {hasOwn} from '#core/types/object';

import {Services} from '#service';
import {BASE_CID_MAX_AGE_MILLIS} from '#service/cid-impl';

import {user} from '#utils/log';

import {ConsentLinkerReader} from './linker-reader';

import {setCookie} from '../../../src/cookies';
import {isInFie} from '../../../src/iframe-helper';
import {getMode} from '../../../src/mode';
import {isProxyOrigin} from '../../../src/url';

const TAG = 'amp-consent/cookie-writer';

const RESERVED_KEYS = {
  'referrerDomains': true,
  'enabled': true,
  'cookiePath': true,
  'cookieMaxAge': true,
  'cookieSecure': true,
  'cookieDomain': true,
};

/** @const @type {!{[key: string]: boolean}} */
const CONSENT_COOKIE_WRITE_VARS_ALLOWED_LIST = {
  'LINKER_PARAM': true,
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

    /** @private {?Promise} */
    this.writePromise_ = null;

    /** @private {!JsonObject} */
    this.config_ = config;

    this.linkerReader_ = new ConsentLinkerReader(win);
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
   *     value: cookieValueA (LINKER_PARAM)
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
    if (!this.isCookieAllowed_(this.win_, this.element_)) {
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

    const cookieExpireDateMs = this.getCookieMaxAgeMs_(inputConfig);

    const ids = Object.keys(inputConfig);
    const promises = [];
    for (let i = 0; i < ids.length; i++) {
      const cookieName = ids[i];
      const cookieObj = inputConfig[cookieName];
      if (this.isValidCookieConfig_(cookieName, cookieObj)) {
        promises.push(
          this.expandAndWrite_(
            cookieName,
            cookieObj['value'],
            cookieExpireDateMs
          )
        );
      }
    }
    return Promise.all(promises);
  }

  /**
   * Retrieves cookieMaxAge from given config, provides default value if no
   * value is found or value is invalid
   * @param {JsonObject} inputConfig
   * @return {number}
   */
  getCookieMaxAgeMs_(inputConfig) {
    if (!hasOwn(inputConfig, 'cookieMaxAge')) {
      return BASE_CID_MAX_AGE_MILLIS;
    }

    const cookieMaxAge = Number(inputConfig['cookieMaxAge']);

    // 0 is a special case which we allow
    if (!cookieMaxAge && cookieMaxAge !== 0) {
      user().error(
        TAG,
        'invalid cookieMaxAge %s, falling back to default value (1 year)',
        inputConfig['cookieMaxAge']
      );
      return BASE_CID_MAX_AGE_MILLIS;
    }

    if (cookieMaxAge <= 0) {
      user().warn(
        TAG,
        'cookieMaxAge %s less than or equal to 0, cookie will immediately expire',
        inputConfig['cookieMaxAge']
      );
    }

    // convert cookieMaxAge (sec) to milliseconds
    return cookieMaxAge * 1000;
  }

  /**
   * Check whether the cookie value is supported. Currently only
   * support LINKER_PARAM(***, ***)
   *
   * CookieObj should looks like
   * cookieName: {
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

    return true;
  }

  /**
   * Expand the value and write to cookie if necessary
   * @param {string} cookieName
   * @param {string} cookieValue
   * @param {number} cookieExpireDateMs
   * @return {!Promise}
   */
  expandAndWrite_(cookieName, cookieValue, cookieExpireDateMs) {
    return Services.urlReplacementsForDoc(this.element_)
      .expandStringAsync(
        cookieValue,
        {
          'LINKER_PARAM': (name, id) => this.linkerReader_.get(name, id),
        },
        CONSENT_COOKIE_WRITE_VARS_ALLOWED_LIST
      )
      .then((value) => {
        // Note: We ignore empty cookieValue, that means currently we don't
        // provide a way to overwrite or erase existing cookie
        if (value) {
          const expireDate = Date.now() + cookieExpireDateMs;
          setCookie(this.win_, cookieName, value, expireDate, {
            highestAvailableDomain: true,
          });
        }
      })
      .catch((e) => {
        user().error(TAG, 'Error expanding cookie string', e);
      });
  }

  /**
   * Determine if cookie writing/reading feature is supported in current
   * environment.
   * Disable cookie writer in friendly iframe and proxy origin and inabox.
   * @return {boolean}
   */
  isCookieAllowed_() {
    return (
      !isInFie(this.element_) &&
      !isProxyOrigin(this.win_.location) &&
      !(getMode(this.win_).runtime == 'inabox')
    );
  }
}
