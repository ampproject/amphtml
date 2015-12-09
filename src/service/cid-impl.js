/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Provides per AMP document source origin and use case
 * persistent client identifiers for use in analytics and similar use
 * cases.
 *
 * For details, see https://goo.gl/Mwaacs
 */

import {assert} from '../asserts';
import {getCookie} from '../cookies';
import {getService} from '../service';
import {parseUrl} from '../url';
import {timer} from '../timer';
import {sha384Base64} from
    '../../third_party/closure-library/sha384-generated';


const ONE_DAY_MILLIS = 24 * 3600 * 1000;

/**
 * We ignore base cids that are older than (roughly) one year.
 */
const BASE_CID_MAX_AGE_MILLIS = 365 * ONE_DAY_MILLIS;

/**
 * A base cid string value and the time it was last read / stored.
 * @typedef {{time: number, cid: string}}
 */
let BaseCidInfo;


class Cid {
  /** @param {!Window} win */
  constructor(win) {
    /** @const */
    this.win = win;

    /** @private @const Instance for testing. */
    this.sha384Base64_ = sha384Base64;

    /**
     * Cached base cid once read from storage to avoid repeated
     * reads.
     * @private {?string}
     */
    this.baseCid_ = null;
  }

  /**
   * @param {string} externalCidScope Name of the fallback cookie for the
   *     case where this doc is not served by an AMP proxy.
   * @param {!Promise} consent Promise for when the user has given consent
   *     (if deemed necessary by the publisher) for use of the client
   *     identifier.
   * @param {!Promise=} opt_persistenceConsent Dedicated promise for when
   *     it is OK to persist a new tracking identifier. This could be
   *     supplied ONLY by the code that supplies the actual consent
   *     cookie.
   *     If this is given, the consent param should be a resolved promise
   *     because this call should be only made in order to get consent.
   *     The consent promise passed to other calls should then itself
   *     depend on the opt_persistenceConsent promise (and the actual
   *     consent, of course).
   *  @return {!Promise<?string>} A client identifier that should be used
   *      within the current source origin and externalCidScope. Might be
   *      null if no identifier was found or could be made.
   *      This promise may take a long time to resolve if consent isn't
   *      given.
   */
  get(externalCidScope, consent, opt_persistenceConsent) {
    return consent.then(() => {
      return getExternalCid(this, externalCidScope,
          opt_persistenceConsent || consent);
    });
  }
}

/**
 * Returns the "external cid". This is a cid for a specific purpose
 * (Say Analytics provider X). It is unique per user, that purpose
 * and the AMP origin site.
 * @param {!Cid} cid
 * @param {string} externalCidScope
 * @param {!Promise} persistenceConsent
 * @return {!Promise<?string>}
 */
function getExternalCid(cid, externalCidScope, persistenceConsent) {
  const url = parseUrl(cid.win.location.href);
  if (!isProxyOrigin(url)) {
    return Promise.resolve(getCookie(cid.win, externalCidScope));
  }
  return getBaseCid(cid, persistenceConsent).then(baseCid => {
    return cid.sha384Base64_(
        baseCid +
        getSourceOrigin(url) +
        externalCidScope);
  });
}

/**
 * Returns whether the URL has the origin of a proxy.
 * @param {!Url} url URL of an AMP document.
 * @return {boolean}
 * @visibleForTesting BUT if this is needed elsewhere it could be
 *     factored into its own package.
 */
export function isProxyOrigin(url) {
  // List of well known proxy hosts. New proxies must be added here
  // to generate correct tokens.
  return (url.origin == 'https://cdn.ampproject.org' ||
      url.origin.indexOf('http://localhost:') == 0);
}

/**
 * Returns the source origin of an AMP document for documents served
 * on a proxy origin. Throws an error if the doc is not on a proxy origin.
 * @param {!Url} url URL of an AMP document.
 * @return {string} The source origin of the URL.
 * @visibleForTesting BUT if this is needed elsewhere it could be
 *     factored into its own package.
 */
export function getSourceOrigin(url) {
  assert(isProxyOrigin(url), 'Expected proxy origin %s', url.origin);
  // Example path that is being matched here.
  // https://cdn.ampproject.org/c/s/www.origin.com/foo/
  // The /s/ is optional and signals a secure origin.
  const path = url.pathname.split('/');
  const prefix = path[1];
  assert(prefix == 'c' || prefix == 'v',
      'Unknown path prefix in url %s', url.href);
  const domainOrHttpsSignal = path[2];
  const origin = domainOrHttpsSignal == 's'
      ? 'https://' + path[3]
      : 'http://' + domainOrHttpsSignal;
  // Sanity test that what we found looks like a domain.
  assert(origin.indexOf('.') > 0, 'Expected a . in origin %s', origin);
  return origin;
}

/**
 * Returns the base cid for the current user. This string must not
 * be exposed to users without hashing with the current source origin
 * and the externalCidScope.
 * On a proxy this value is the same for a user across all source
 * origins.
 * @param {!Cid} cid
 * @param {!Promise} persistenceConsent
 * @return {!Promise<string>}
 */
function getBaseCid(cid, persistenceConsent) {
  if (cid.baseCid_) {
    return Promise.resolve(cid.baseCid_);
  }
  const win = cid.win;
  const stored = read(win);
  // See if we have a stored base cid and whether it is still valid
  // in terms of expiration.
  if (stored && !isExpired(stored)) {
    if (shouldUpdateStoredTime(stored)) {
      // Once per interval we mark the cid as used.
      store(win, stored.cid);
    }
    cid.baseCid_ = stored.cid;
    return Promise.resolve(stored.cid);
  }
  // We need to make a new one.
  const seed = getEntropy(win);
  const newVal = cid.sha384Base64_(seed);
  // Storing the value may require consent. We wait for the respective
  // promise.
  persistenceConsent.then(() => {
    // The initial CID generation is inherently racy. First one that gets
    // consent wins.
    const relookup = read(win);
    if (!relookup) {
      store(win, newVal);
    }
  });
  return Promise.resolve(newVal);
}

/**
 * Stores a new cidString in localStorage. Adds the current time to the
 * stored value.
 * @param {!Window} win
 * @param {string} cidString Actual cid string to store.
 */
function store(win, cidString) {
  const item = {};
  item['time'] = timer.now();
  item['cid'] = cidString;
  win.localStorage.setItem('amp-cid', JSON.stringify(item));
}

/**
 * Retrieves a stored cid item from localStorage. Returns undefined if
 * none was found
 * @param {!Window} win
 * @return {!BaseCidInfo|undefined}
 */
function read(win) {
  const val = win.localStorage.getItem('amp-cid');
  if (!val) {
    return undefined;
  }
  const item = JSON.parse(val);
  return {
    time: item['time'],
    cid: item['cid'],
  };
}

/**
 * Whether the retrieved cid object is expired and should be ignored.
 * @param {!BaseCidInfo} storedCidInfo
 * @return {boolean}
 */
function isExpired(storedCidInfo) {
  const createdTime = storedCidInfo.time;
  const now = timer.now();
  return createdTime + BASE_CID_MAX_AGE_MILLIS < now;
}

/**
 * Whether we should write a new timestamp to the stored cid value.
 * We say yes if it is older than 1 day, so we only do this max once
 * per day to avoid writing to localStorage all the time.
 * @param {!BaseCidInfo} storedCidInfo
 * @return {boolean}
 */
function shouldUpdateStoredTime(storedCidInfo) {
  const createdTime = storedCidInfo.time;
  const now = timer.now();
  return createdTime + ONE_DAY_MILLIS < now;
}

/**
 * Returns an array with a total of 128 of random values based on the
 * `win.crypto.getRandomValues` API. If that is not available concatenates
 * a string of other values that might be hard to guess including
 * `Math.random` and the current time.
 * @param {!Window} win
 * @return {!Array<number>|string} Entropy.
 */
function getEntropy(win) {
  // Widely available in browsers we support:
  // http://caniuse.com/#search=getRandomValues
  if (win.crypto && win.crypto.getRandomValues) {
    const uint8array = new Uint8Array(16);  // 128 bit
    win.crypto.getRandomValues(uint8array);
    // While closure's Hash interface would except a Uint8Array
    // sha384 does not in practice, so we copy the values into
    // a plain old array.
    const array = new Array(16);
    for (let i = 0; i < uint8array.length; i++) {
      array[i] = uint8array[i];
    }
    return array;
  }
  // Support for legacy browsers.
  return String(win.location.href + timer.now() +
      win.Math.random() + win.screen.width + win.screen.height);
}

/**
 * @param {!Window} window
 */
export function installCidService(window) {
  getService(window, 'cid', () => {
    return new Cid(window);
  });
};
