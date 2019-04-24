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

import {CacheCidApi} from './cache-cid-api';
import {GoogleCidApi, TokenStatus} from './cid-api';
import {Services} from '../services';
import {ViewerCidApi} from './viewer-cid-api';
import {base64UrlEncodeFromBytes} from '../utils/base64';
import {dev, rethrowAsync, user, userAssert} from '../log';
import {dict} from '../utils/object';
import {getCookie, setCookie} from '../cookies';
import {getCryptoRandomBytesArray} from '../utils/bytes';
import {getServiceForDoc, registerServiceBuilderForDoc} from '../service';
import {getSourceOrigin, isProxyOrigin, parseUrlDeprecated} from '../url';
import {isIframed} from '../dom';
import {parseJson, tryParseJson} from '../json';
import {tryResolve} from '../utils/promise';

const ONE_DAY_MILLIS = 24 * 3600 * 1000;

/**
 * We ignore base cids that are older than (roughly) one year.
 */
export const BASE_CID_MAX_AGE_MILLIS = 365 * ONE_DAY_MILLIS;

const SCOPE_NAME_VALIDATOR = /^[a-zA-Z0-9-_.]+$/;

const CID_OPTOUT_STORAGE_KEY = 'amp-cid-optout';

const CID_OPTOUT_VIEWER_MESSAGE = 'cidOptOut';

/**
 * Tag for debug logging.
 * @const @private {string}
 */
const TAG_ = 'CID';

/**
 * The name of the Google CID API as it appears in the meta tag to opt-in.
 * @const @private {string}
 */
const GOOGLE_CID_API_META_NAME = 'amp-google-client-id-api';

/**
 * The mapping from analytics providers to CID scopes.
 * @const @private {Object<string, string>}
 */
const CID_API_SCOPE_WHITELIST = {
  'googleanalytics': 'AMP_ECID_GOOGLE',
};

/**
 * The mapping from analytics providers to their CID API service keys.
 * @const @private {Object<string, string>}
 */
const API_KEYS = {
  'googleanalytics': 'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM',
};

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
 *   cookieName: (string|undefined),
 * }}
 */
let GetCidDef;

export class Cid {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /**
     * Cached base cid once read from storage to avoid repeated
     * reads.
     * @private {?Promise<string>}
     * @restricted
     */
    this.baseCid_ = null;

    /**
     * Cache to store external cids. Scope is used as the key and cookie value
     * is the value.
     * @private {!Object<string, !Promise<string>>}
     * @restricted
     */
    this.externalCidCache_ = Object.create(null);

    /**
     * @private @const {!CacheCidApi}
     */
    this.cacheCidApi_ = new CacheCidApi(ampdoc);

    /**
     * @private {!ViewerCidApi}
     */
    this.viewerCidApi_ = new ViewerCidApi(ampdoc);

    this.cidApi_ = new GoogleCidApi(ampdoc);

    /** @private {?Object<string, string>} */
    this.apiKeyMap_ = null;
  }

  /**
   * @param {!GetCidDef} getCidStruct an object provides CID scope name for
   *     proxy case and cookie name for non-proxy case.
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
   *      null if user has opted out of cid or no identifier was found
   *      or it could be made.
   *      This promise may take a long time to resolve if consent isn't
   *      given.
   */
  get(getCidStruct, consent, opt_persistenceConsent) {
    userAssert(
      SCOPE_NAME_VALIDATOR.test(getCidStruct.scope) &&
        SCOPE_NAME_VALIDATOR.test(getCidStruct.cookieName),
      'The CID scope and cookie name must only use the characters ' +
        '[a-zA-Z0-9-_.]+\nInstead found: %s',
      getCidStruct.scope
    );
    return consent
      .then(() => {
        return Services.viewerForDoc(this.ampdoc).whenFirstVisible();
      })
      .then(() => {
        // Check if user has globally opted out of CID, we do this after
        // consent check since user can optout during consent process.
        return isOptedOutOfCid(this.ampdoc);
      })
      .then(optedOut => {
        if (optedOut) {
          return '';
        }
        const cidPromise = this.getExternalCid_(
          getCidStruct,
          opt_persistenceConsent || consent
        );
        // Getting the CID might involve an HTTP request. We timeout after 10s.
        return Services.timerFor(this.ampdoc.win)
          .timeoutPromise(
            10000,
            cidPromise,
            `Getting cid for "${getCidStruct.scope}" timed out`
          )
          .catch(error => {
            rethrowAsync(error);
          });
      });
  }

  /**
   * User will be opted out of Cid issuance for all scopes.
   * When opted-out Cid service will reject all `get` requests.
   *
   * @return {!Promise}
   */
  optOut() {
    return optOutOfCid(this.ampdoc);
  }

  /**
   * Returns the "external cid". This is a cid for a specific purpose
   * (Say Analytics provider X). It is unique per user, userAssert, that purpose
   * and the AMP origin site.
   * @param {!GetCidDef} getCidStruct
   * @param {!Promise} persistenceConsent
   * @return {!Promise<?string>}
   */
  getExternalCid_(getCidStruct, persistenceConsent) {
    const {scope} = getCidStruct;
    /** @const {!Location} */
    const url = parseUrlDeprecated(this.ampdoc.win.location.href);
    if (!isProxyOrigin(url)) {
      const apiKey = this.isScopeOptedIn_(scope);
      if (apiKey) {
        return this.cidApi_.getScopedCid(apiKey, scope).then(scopedCid => {
          if (scopedCid == TokenStatus.OPT_OUT) {
            return null;
          }
          if (scopedCid) {
            const cookieName = getCidStruct.cookieName || scope;
            setCidCookie(this.ampdoc.win, cookieName, scopedCid);
            return scopedCid;
          }
          return getOrCreateCookie(this, getCidStruct, persistenceConsent);
        });
      }
      return getOrCreateCookie(this, getCidStruct, persistenceConsent);
    }

    return this.viewerCidApi_.isSupported().then(supported => {
      if (supported) {
        const apiKey = this.isScopeOptedIn_(scope);
        return this.viewerCidApi_.getScopedCid(apiKey, scope);
      }

      if (this.cacheCidApi_.isSupported() && this.isScopeOptedIn_(scope)) {
        return this.cacheCidApi_.getScopedCid(scope).then(scopedCid => {
          if (scopedCid) {
            return scopedCid;
          }
          return this.scopeBaseCid_(persistenceConsent, scope, url);
        });
      }
      return this.scopeBaseCid_(persistenceConsent, scope, url);
    });
  }

  /**
   *
   * @param {!Promise} persistenceConsent
   * @param {*} scope
   * @param {!Location} url
   * @return {*}
   */
  scopeBaseCid_(persistenceConsent, scope, url) {
    return getBaseCid(this, persistenceConsent).then(baseCid => {
      return Services.cryptoFor(this.ampdoc.win).sha384Base64(
        baseCid + getProxySourceOrigin(url) + scope
      );
    });
  }

  /**
   * Checks if the page has opted in CID API for the given scope.
   * Returns the API key that should be used, or null if page hasn't opted in.
   *
   * @param {string} scope
   * @return {string|undefined}
   */
  isScopeOptedIn_(scope) {
    if (!this.apiKeyMap_) {
      this.apiKeyMap_ = this.getOptedInScopes_();
    }
    return this.apiKeyMap_[scope];
  }

  /**
   * Reads meta tags for opted in scopes.  Meta tags will have the form
   * <meta name="provider-api-name" content="provider-name">
   * @return {!Object<string, string>}
   */
  getOptedInScopes_() {
    const apiKeyMap = {};
    const optInMeta = this.ampdoc.win.document.head./*OK*/ querySelector(
      `meta[name=${GOOGLE_CID_API_META_NAME}]`
    );
    if (optInMeta && optInMeta.hasAttribute('content')) {
      const list = optInMeta.getAttribute('content').split(',');
      list.forEach(item => {
        item = item.trim();
        if (item.indexOf('=') > 0) {
          const pair = item.split('=');
          const scope = pair[0].trim();
          apiKeyMap[scope] = pair[1].trim();
        } else {
          const clientName = item;
          // We have installations that specified gtag API that never became
          // supported. Make sure that there's no error reported in this case.
          if (clientName === 'gtag') {
            return;
          }
          const scope = CID_API_SCOPE_WHITELIST[clientName];
          if (scope) {
            apiKeyMap[scope] = API_KEYS[clientName];
          } else if (scope === 'gtag') {
            // We have installations that specified gtag API that never became
            // supported. Make sure that the warning message looks appropriate.
            user().warn(
              TAG_,
              `<meta name="amp-google-client-id-api" content="gtag"> is not supported. Please remove it from the page`
            );
          } else {
            user().error(
              TAG_,
              `Unsupported client for Google CID API: ${clientName}`
            );
          }
        }
      });
    }
    return apiKeyMap;
  }
}

/**
 * User will be opted out of Cid issuance for all scopes.
 * When opted-out Cid service will reject all `get` requests.
 *
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise}
 * @visibleForTesting
 */
export function optOutOfCid(ampdoc) {
  // Tell the viewer that user has opted out.
  Services.viewerForDoc(ampdoc)./*OK*/ sendMessage(
    CID_OPTOUT_VIEWER_MESSAGE,
    dict()
  );

  // Store the optout bit in storage
  return Services.storageForDoc(ampdoc).then(storage => {
    return storage.set(CID_OPTOUT_STORAGE_KEY, true);
  });
}

/**
 * Whether user has opted out of Cid issuance for all scopes.
 *
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<boolean>}
 * @visibleForTesting
 */
export function isOptedOutOfCid(ampdoc) {
  return Services.storageForDoc(ampdoc)
    .then(storage => {
      return storage.get(CID_OPTOUT_STORAGE_KEY).then(val => !!val);
    })
    .catch(() => {
      // If we fail to read the flag, assume not opted out.
      return false;
    });
}

/**
 * Sets a new CID cookie for expire 1 year from now.
 * @param {!Window} win
 * @param {string} scope
 * @param {string} cookie
 */
function setCidCookie(win, scope, cookie) {
  const expiration = Date.now() + BASE_CID_MAX_AGE_MILLIS;
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
  const {win} = cid.ampdoc;
  const {scope} = getCidStruct;
  const cookieName = getCidStruct.cookieName || scope;
  const existingCookie = getCookie(win, cookieName);

  if (!existingCookie && !getCidStruct.createCookieIfNotPresent) {
    return /** @type {!Promise<?string>} */ (Promise.resolve(null));
  }

  if (cid.externalCidCache_[scope]) {
    return /** @type {!Promise<?string>} */ (cid.externalCidCache_[scope]);
  }

  if (existingCookie) {
    // If we created the cookie, update it's expiration time.
    if (/^amp-/.test(existingCookie)) {
      setCidCookie(win, cookieName, existingCookie);
    }
    return /** @type {!Promise<?string>} */ (Promise.resolve(existingCookie));
  }

  const newCookiePromise = getNewCidForCookie(win)
    // Create new cookie, always prefixed with "amp-", so that we can see from
    // the value whether we created it.
    .then(randomStr => 'amp-' + randomStr);

  // Store it as a cookie based on the persistence consent.
  Promise.all([newCookiePromise, persistenceConsent]).then(results => {
    // The initial CID generation is inherently racy. First one that gets
    // consent wins.
    const newCookie = results[0];
    const relookup = getCookie(win, cookieName);
    if (!relookup) {
      setCidCookie(win, cookieName, newCookie);
    }
  });
  return (cid.externalCidCache_[scope] = newCookiePromise);
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
  userAssert(isProxyOrigin(url), 'Expected proxy origin %s', url.origin);
  return getSourceOrigin(url);
}

/**
 * Returns the base cid for the current user(). This string must not
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
  const {win} = cid.ampdoc;

  return (cid.baseCid_ = read(cid.ampdoc).then(stored => {
    let needsToStore = false;
    let baseCid;

    // See if we have a stored base cid and whether it is still valid
    // in terms of expiration.
    if (stored && !isExpired(stored)) {
      baseCid = Promise.resolve(stored.cid);
      if (shouldUpdateStoredTime(stored)) {
        needsToStore = true;
      }
    } else {
      // We need to make a new one.
      baseCid = Services.cryptoFor(win).sha384Base64(getEntropy(win));
      needsToStore = true;
    }

    if (needsToStore) {
      baseCid.then(baseCid => {
        store(cid.ampdoc, persistenceConsent, baseCid);
      });
    }

    return baseCid;
  }));
}

/**
 * Stores a new cidString in localStorage. Adds the current time to the
 * stored value.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Promise} persistenceConsent
 * @param {string} cidString Actual cid string to store.
 */
function store(ampdoc, persistenceConsent, cidString) {
  const {win} = ampdoc;
  if (isIframed(win)) {
    // If we are being embedded, try to save the base cid to the viewer.
    viewerBaseCid(ampdoc, createCidData(cidString));
  } else {
    // To use local storage, we need user's consent.
    persistenceConsent.then(() => {
      try {
        win.localStorage.setItem('amp-cid', createCidData(cidString));
      } catch (ignore) {
        // Setting localStorage may fail. In practice we don't expect that to
        // happen a lot (since we don't go anywhere near the quota, but
        // in particular in Safari private browsing mode it always fails.
        // In that case we just don't store anything, which is just fine.
      }
    });
  }
}

/**
 * Get/set the Base CID from/to the viewer.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {string=} opt_data Stringified JSON object {cid, time}.
 * @return {!Promise<string|undefined>}
 */
export function viewerBaseCid(ampdoc, opt_data) {
  const viewer = Services.viewerForDoc(ampdoc);
  return viewer.isTrustedViewer().then(trusted => {
    if (!trusted) {
      return undefined;
    }
    // TODO(lannka, #11060): clean up when all Viewers get migrated
    dev().expectedError('CID', 'Viewer does not provide cap=cid');
    return viewer.sendMessageAwaitResponse('cid', opt_data).then(data => {
      // For backward compatibility: #4029
      if (data && !tryParseJson(data)) {
        // TODO(lannka, #11060): clean up when all Viewers get migrated
        dev().expectedError('CID', 'invalid cid format');
        return JSON.stringify(
          dict({
            'time': Date.now(), // CID returned from old API is always fresh
            'cid': data,
          })
        );
      }
      return data;
    });
  });
}

/**
 * Creates a JSON object that contains the given CID and the current time as
 * a timestamp.
 * @param {string} cidString
 * @return {string}
 */
function createCidData(cidString) {
  return JSON.stringify(
    dict({
      'time': Date.now(),
      'cid': cidString,
    })
  );
}

/**
 * Gets the persisted CID data as a promise. It tries to read from
 * localStorage first then from viewer if it is in embedded mode.
 * Returns null if none was found.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<?BaseCidInfoDef>}
 */
function read(ampdoc) {
  const {win} = ampdoc;
  let data;
  try {
    data = win.localStorage.getItem('amp-cid');
  } catch (ignore) {
    // If reading from localStorage fails, we assume it is empty.
  }
  let dataPromise = Promise.resolve(data);
  if (!data && isIframed(win)) {
    // If we are being embedded, try to get the base cid from the viewer.
    dataPromise = viewerBaseCid(ampdoc);
  }
  return dataPromise.then(data => {
    if (!data) {
      return null;
    }
    const item = parseJson(data);
    return {
      time: item['time'],
      cid: item['cid'],
    };
  });
}

/**
 * Whether the retrieved cid object is expired and should be ignored.
 * @param {!BaseCidInfoDef} storedCidInfo
 * @return {boolean}
 */
function isExpired(storedCidInfo) {
  const createdTime = storedCidInfo.time;
  const now = Date.now();
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
  const now = Date.now();
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
  // Use win.crypto.getRandomValues to get 128 bits of random value
  const uint8array = getCryptoRandomBytesArray(win, 16); // 128 bit
  if (uint8array) {
    return uint8array;
  }

  // Support for legacy browsers.
  return String(
    win.location.href +
      Date.now() +
      win.Math.random() +
      win.screen.width +
      win.screen.height
  );
}

/**
 * Produces an external CID for use in a cookie.
 * @param {!Window} win
 * @return {!Promise<string>} The cid
 */
function getNewCidForCookie(win) {
  const entropy = getEntropy(win);
  if (typeof entropy == 'string') {
    return Services.cryptoFor(win).sha384Base64(entropy);
  } else {
    // If our entropy is a pure random number, we can just directly turn it
    // into base 64
    const cast = /** @type {!Uint8Array} */ (entropy);
    return tryResolve(() =>
      base64UrlEncodeFromBytes(cast)
        // Remove trailing padding
        .replace(/\.+$/, '')
    );
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installCidService(ampdoc) {
  return registerServiceBuilderForDoc(ampdoc, 'cid', Cid);
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Cid}
 * @private visible for testing
 */
export function cidServiceForDocForTesting(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'cid', Cid);
  return getServiceForDoc(ampdoc, 'cid');
}
