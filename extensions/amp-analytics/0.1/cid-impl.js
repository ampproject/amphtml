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

import {getCookie, setCookie} from '../../../src/cookies';
import {fromClass} from '../../../src/service';
import {
  getSourceOrigin,
  isProxyOrigin,
  parseUrl,
} from '../../../src/url';
import {timer} from '../../../src/timer';
import {viewerFor} from '../../../src/viewer';
import {cryptoFor} from '../../../src/crypto';
import {user} from '../../../src/log';


const ONE_DAY_MILLIS = 24 * 3600 * 1000;

/**
 * We ignore base cids that are older than (roughly) one year.
 */
const BASE_CID_MAX_AGE_MILLIS = 365 * ONE_DAY_MILLIS;

/**
 * A base cid string value and the time it was last read / stored.
 * @typedef {{time: time, cid: string}}
 */
let BaseCidInfoDef;

/**
 * The "get CID" parameters.
 * - createCookieIfNotPresent: Whether CID is allowed to create a cookie when.
 *   Default value is `false`.
 * @typedef {{
 *   scope: string,
 *   createCookieIfNotPresent: (boolean|undefined),
 * }}
 */
let GetCidDef;


class Cid {
  /** @param {!Window} win */
  constructor(win) {
    /** @const */
    this.win = win;

    /**
     * Cached base cid once read from storage to avoid repeated
     * reads.
     * @private {?Promise<string>}
     */
    this.baseCid_ = null;

    /**
     * Cache to store external cids. Scope is used as the key and cookie value
     * is the value.
     * @private {!Object<string, !Promise<string>>}
     */
    this.externalCidCache_ = Object.create(null);
  }

  /**
   * @param {string|!GetCidDef} externalCidScope Name of the fallback cookie
   *     for the case where this doc is not served by an AMP proxy. GetCidDef
   *     structure can also instruct CID to create a cookie if one doesn't yet
   *     exist in a non-proxy case.
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
   * @return {!Promise<?string>} A client identifier that should be used
   *      within the current source origin and externalCidScope. Might be
   *      null if no identifier was found or could be made.
   *      This promise may take a long time to resolve if consent isn't
   *      given.
   */
  get(externalCidScope, consent, opt_persistenceConsent) {
    /** @type {!GetCidDef} */
    let getCidStruct;
    if (typeof externalCidScope == 'string') {
      getCidStruct = {scope: externalCidScope};
    } else {
      getCidStruct = /** @type {!GetCidDef} */ (externalCidScope);
    }
    user.assert(/^[a-zA-Z0-9-_]+$/.test(getCidStruct.scope),
        'The client id name must only use the characters ' +
        '[a-zA-Z0-9-_]+\nInstead found: %s', getCidStruct.scope);
    return consent.then(() => {
      return viewerFor(this.win).whenFirstVisible();
    }).then(() => {
      return getExternalCid(this, getCidStruct,
          opt_persistenceConsent || consent);
    });
  }
}

/**
 * Returns the "external cid". This is a cid for a specific purpose
 * (Say Analytics provider X). It is unique per user, that purpose
 * and the AMP origin site.
 * @param {!Cid} cid
 * @param {!GetCidDef} getCidStruct
 * @param {!Promise} persistenceConsent
 * @return {!Promise<?string>}
 */
function getExternalCid(cid, getCidStruct, persistenceConsent) {
  const url = parseUrl(cid.win.location.href);
  if (!isProxyOrigin(url)) {
    return getOrCreateCookie(cid, getCidStruct, persistenceConsent);
  }
  return Promise.all([getBaseCid(cid, persistenceConsent), cryptoFor(cid.win)])
      .then(results => {
        const baseCid = results[0];
        const crypto = results[1];
        return crypto.sha384Base64(
            baseCid + getProxySourceOrigin(url) + getCidStruct.scope);
      });
}

/**
 * Sets a new CID cookie for expire 1 year from now.
 * @param {!Window} win
 * @param {string} scope
 * @param {string} cookie
 */
function setCidCookie(win, scope, cookie) {
  const expiration = timer.now() + BASE_CID_MAX_AGE_MILLIS;
  setCookie(win, scope, cookie, expiration, {
    highestAvailableDomain: true,
  });
}

/**
 * If cookie exists it's returned immediately. Otherwise, if instructed, the
 * new cookie is created.
 *
 * @param {!Cid} cid
 * @param {!GetCidDef} getCidStruct
 * @param {!Promise} persistenceConsent
 * @return {!Promise<?string>}
 */
function getOrCreateCookie(cid, getCidStruct, persistenceConsent) {
  const win = cid.win;
  const scope = getCidStruct.scope;
  const existingCookie = getCookie(win, scope);

  if (!existingCookie && !getCidStruct.createCookieIfNotPresent) {
    return Promise.resolve(null);
  }

  if (cid.externalCidCache_[scope]) {
    return cid.externalCidCache_[scope];
  }

  if (existingCookie) {
    // If we created the cookie, update it's expiration time.
    if (/^amp-/.test(existingCookie)) {
      setCidCookie(win, scope, existingCookie);
    }
    return Promise.resolve(existingCookie);
  }

  const newCookiePromise = cryptoFor(win)
      .then(crypto => crypto.sha384Base64(getEntropy(win)))
      // Create new cookie, always prefixed with "amp-", so that we can see from
      // the value whether we created it.
      .then(randomStr => 'amp-' + randomStr);

  // Store it as a cookie based on the persistence consent.
  Promise.all([newCookiePromise, persistenceConsent])
      .then(results => {
        // The initial CID generation is inherently racy. First one that gets
        // consent wins.
        const newCookie = results[0];
        const relookup = getCookie(win, scope);
        if (!relookup) {
          setCidCookie(win, scope, newCookie);
        }
      });
  return cid.externalCidCache_[scope] = newCookiePromise;
}

/**
 * Returns the source origin of an AMP document for documents served
 * on a proxy origin. Throws an error if the doc is not on a proxy origin.
 * @param {!Location} url URL of an AMP document.
 * @return {string} The source origin of the URL.
 * @visibleForTesting BUT if this is needed elsewhere it could be
 *     factored into its own package.
 */
export function getProxySourceOrigin(url) {
  user.assert(isProxyOrigin(url), 'Expected proxy origin %s', url.origin);
  return getSourceOrigin(url);
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
    return cid.baseCid_;
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
    return cid.baseCid_ = Promise.resolve(stored.cid);
  }
  // If we are being embedded, try to get the base cid from the viewer.
  // Note, that we never try to persist to localStorage in this case.
  const viewer = viewerFor(win);
  if (viewer.isIframed()) {
    return cid.baseCid_ = viewer.getBaseCid().then(cidValue => {
      if (!cidValue) {
        throw new Error('No CID');
      }
      return cidValue;
    });
  }

  // We need to make a new one.
  cid.baseCid_ = cryptoFor(win)
      .then(crypto => crypto.sha384Base64(getEntropy(win)));

  // Storing the value may require consent. We wait for the respective
  // promise.
  Promise.all([cid.baseCid_, persistenceConsent])
      .then(results => {
        // The initial CID generation is inherently racy. First one that gets
        // consent wins.
        const newVal = results[0];
        const relookup = read(win);
        if (!relookup) {
          store(win, newVal);
        }
      });
  return cid.baseCid_;
}

/**
 * Stores a new cidString in localStorage. Adds the current time to the
 * stored value.
 * @param {!Window} win
 * @param {string} cidString Actual cid string to store.
 */
function store(win, cidString) {
  try {
    const item = {
      time: timer.now(),
      cid: cidString,
    };
    const data = JSON.stringify(item);
    win.localStorage.setItem('amp-cid', data);
  } catch (ignore) {
    // Setting localStorage may fail. In practice we don't expect that to
    // happen a lot (since we don't go anywhere near the quota, but
    // in particular in Safari private browsing mode it always fails.
    // In that case we just don't store anything, which is just fine.
  }
}

/**
 * Retrieves a stored cid item from localStorage. Returns undefined if
 * none was found
 * @param {!Window} win
 * @return {!BaseCidInfoDef|undefined}
 */
function read(win) {
  let data;
  try {
    data = win.localStorage.getItem('amp-cid');
  } catch (ignore) {
    // If reading from localStorage fails, we assume it is empty.
  }
  if (!data) {
    return undefined;
  }
  const item = JSON.parse(data);
  return {
    time: item['time'],
    cid: item['cid'],
  };
}

/**
 * Whether the retrieved cid object is expired and should be ignored.
 * @param {!BaseCidInfoDef} storedCidInfo
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
 * @param {!BaseCidInfoDef} storedCidInfo
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
 * @return {!Uint8Array|string} Entropy.
 */
function getEntropy(win) {
  // Widely available in browsers we support:
  // http://caniuse.com/#search=getRandomValues
  if (win.crypto && win.crypto.getRandomValues) {
    const uint8array = new Uint8Array(16);  // 128 bit
    win.crypto.getRandomValues(uint8array);
    return uint8array;
  }
  // Support for legacy browsers.
  return String(win.location.href + timer.now() +
      win.Math.random() + win.screen.width + win.screen.height);
}

/**
 * @param {!Window} window
 * @return {!Cid}
 */
export function installCidService(window) {
  return fromClass(window, 'cid', Cid);
}
