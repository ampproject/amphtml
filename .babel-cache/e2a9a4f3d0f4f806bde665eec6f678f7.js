function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { tryResolve } from "../core/data-structures/promise";
import { isIframed } from "../core/dom";
import { rethrowAsync } from "../core/error";
import { dict } from "../core/types/object";
import { parseJson, tryParseJson } from "../core/types/object/json";
import { base64UrlEncodeFromBytes } from "../core/types/string/base64";
import { getCryptoRandomBytesArray } from "../core/types/string/bytes";

import { isExperimentOn } from "../experiments";

import { Services } from "./";

import { CacheCidApi } from "./cache-cid-api";
import { GoogleCidApi, TokenStatus } from "./cid-api";
import { ViewerCidApi } from "./viewer-cid-api";

import { getCookie, setCookie } from "../cookies";
import { dev, user, userAssert } from "../log";
import {
getServiceForDoc,
registerServiceBuilderForDoc } from "../service-helpers";

import { getSourceOrigin, isProxyOrigin, parseUrlDeprecated } from "../url";

var ONE_DAY_MILLIS = 24 * 3600 * 1000;

/**
 * We ignore base cids that are older than (roughly) one year.
 */
export var BASE_CID_MAX_AGE_MILLIS = 365 * ONE_DAY_MILLIS;

var SCOPE_NAME_VALIDATOR = /^[a-zA-Z0-9-_.]+$/;

var CID_OPTOUT_STORAGE_KEY = 'amp-cid-optout';

var CID_OPTOUT_VIEWER_MESSAGE = 'cidOptOut';

var CID_BACKUP_STORAGE_KEY = 'amp-cid:';

/**
 * Tag for debug logging.
 * @const @private {string}
 */
var TAG_ = 'CID';

/**
 * The name of the Google CID API as it appears in the meta tag to opt-in.
 * @const @private {string}
 */
var GOOGLE_CID_API_META_NAME = 'amp-google-client-id-api';

/**
 * The mapping from analytics providers to CID scopes.
 * @const @private {Object<string, string>}
 */
var CID_API_SCOPE_ALLOWLIST = {
  'googleanalytics': 'AMP_ECID_GOOGLE' };


/**
 * The mapping from analytics providers to their CID API service keys.
 * @const @private {Object<string, string>}
 */
var API_KEYS = {
  'googleanalytics': 'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM' };


/**
 * A base cid string value and the time it was last read / stored.
 * @typedef {{time: time, cid: string}}
 */
var BaseCidInfoDef;

/**
 * The "get CID" parameters.
 * - createCookieIfNotPresent: Whether CID is allowed to create a cookie when.
 *   Default value is `false`.
 * - cookieName: Name of the cookie to be used if defined for non-proxy case.
 * - disableBackup: Whether CID should not be backed up in Storage.
 *   Default value is `false`.
 * @typedef {{
 *   scope: string,
 *   createCookieIfNotPresent: (boolean|undefined),
 *   cookieName: (string|undefined),
 *   disableBackup: (boolean|undefined),
 * }}
 */
var GetCidDef;

/**
 * @interface
 */
export var CidDef = /*#__PURE__*/function () {function CidDef() {_classCallCheck(this, CidDef);}_createClass(CidDef, [{ key: "get", value:
    /**
     * @param {!GetCidDef} unusedGetCidStruct an object provides CID scope name for
     *     proxy case and cookie name for non-proxy case.
     * @param {!Promise} unusedConsent Promise for when the user has given consent
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
    function get(unusedGetCidStruct, unusedConsent, opt_persistenceConsent) {}

    /**
     * User will be opted out of Cid issuance for all scopes.
     * When opted-out Cid service will reject all `get` requests.
     *
     * @return {!Promise}
     */ }, { key: "optOut", value:
    function optOut() {} }]);return CidDef;}();


/**
 * @implements {CidDef}
 */var
Cid = /*#__PURE__*/function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function Cid(ampdoc) {_classCallCheck(this, Cid);
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

    /** @const {boolean} */
    this.isBackupCidExpOn = isExperimentOn(this.ampdoc.win, 'amp-cid-backup');
  }

  /** @override */_createClass(Cid, [{ key: "get", value:
    function get(getCidStruct, consent, opt_persistenceConsent) {var _this = this;
      userAssert(
      SCOPE_NAME_VALIDATOR.test(getCidStruct.scope) &&
      SCOPE_NAME_VALIDATOR.test(getCidStruct.cookieName),
      'The CID scope and cookie name must only use the characters ' +
      '[a-zA-Z0-9-_.]+\nInstead found: %s',
      getCidStruct.scope);

      return consent.
      then(function () {
        return _this.ampdoc.whenFirstVisible();
      }).
      then(function () {
        // Check if user has globally opted out of CID, we do this after
        // consent check since user can optout during consent process.
        return isOptedOutOfCid(_this.ampdoc);
      }).
      then(function (optedOut) {
        if (optedOut) {
          return '';
        }
        var cidPromise = _this.getExternalCid_(
        getCidStruct,
        opt_persistenceConsent || consent);

        // Getting the CID might involve an HTTP request. We timeout after 10s.
        return Services.timerFor(_this.ampdoc.win).
        timeoutPromise(
        10000,
        cidPromise, "Getting cid for \"".concat(
        getCidStruct.scope, "\" timed out")).

        catch(function (error) {
          rethrowAsync(error);
        });
      });
    }

    /** @override */ }, { key: "optOut", value:
    function optOut() {
      return optOutOfCid(this.ampdoc);
    }

    /**
     * Returns the "external cid". This is a cid for a specific purpose
     * (Say Analytics provider X). It is unique per user, userAssert, that purpose
     * and the AMP origin site.
     * @param {!GetCidDef} getCidStruct
     * @param {!Promise} persistenceConsent
     * @return {!Promise<?string>}
     */ }, { key: "getExternalCid_", value:
    function getExternalCid_(getCidStruct, persistenceConsent) {var _this2 = this;
      var scope = getCidStruct.scope;
      /** @const {!Location} */
      var url = parseUrlDeprecated(this.ampdoc.win.location.href);
      if (!isProxyOrigin(url)) {
        var apiKey = this.isScopeOptedIn_(scope);
        if (apiKey) {
          return this.cidApi_.getScopedCid(apiKey, scope).then(function (scopedCid) {
            if (scopedCid == TokenStatus.OPT_OUT) {
              return null;
            }
            if (scopedCid) {
              var cookieName = getCidStruct.cookieName || scope;
              setCidCookie(_this2.ampdoc.win, cookieName, scopedCid);
              return scopedCid;
            }
            return getOrCreateCookie(_this2, getCidStruct, persistenceConsent);
          });
        }
        return getOrCreateCookie(this, getCidStruct, persistenceConsent);
      }

      return this.viewerCidApi_.isSupported().then(function (supported) {
        if (supported) {
          var _apiKey = _this2.isScopeOptedIn_(scope);
          return _this2.viewerCidApi_.getScopedCid(_apiKey, scope);
        }

        if (_this2.cacheCidApi_.isSupported() && _this2.isScopeOptedIn_(scope)) {
          return _this2.cacheCidApi_.getScopedCid(scope).then(function (scopedCid) {
            if (scopedCid) {
              return scopedCid;
            }
            return _this2.scopeBaseCid_(persistenceConsent, scope, url);
          });
        }
        return _this2.scopeBaseCid_(persistenceConsent, scope, url);
      });
    }

    /**
     *
     * @param {!Promise} persistenceConsent
     * @param {*} scope
     * @param {!Location} url
     * @return {*}
     */ }, { key: "scopeBaseCid_", value:
    function scopeBaseCid_(persistenceConsent, scope, url) {var _this3 = this;
      return getBaseCid(this, persistenceConsent).then(function (baseCid) {
        return Services.cryptoFor(_this3.ampdoc.win).sha384Base64(
        baseCid + getProxySourceOrigin(url) + scope);

      });
    }

    /**
     * Checks if the page has opted in CID API for the given scope.
     * Returns the API key that should be used, or null if page hasn't opted in.
     *
     * @param {string} scope
     * @return {string|undefined}
     */ }, { key: "isScopeOptedIn_", value:
    function isScopeOptedIn_(scope) {
      if (!this.apiKeyMap_) {
        this.apiKeyMap_ = this.getOptedInScopes_();
      }
      return this.apiKeyMap_[scope];
    }

    /**
     * Reads meta tags for opted in scopes.  Meta tags will have the form
     * <meta name="provider-api-name" content="provider-name">
     * @return {!Object<string, string>}
     */ }, { key: "getOptedInScopes_", value:
    function getOptedInScopes_() {
      var apiKeyMap = {};
      var optInMeta = this.ampdoc.getMetaByName(GOOGLE_CID_API_META_NAME);
      if (optInMeta) {
        optInMeta.split(',').forEach(function (item) {
          item = item.trim();
          if (item.indexOf('=') > 0) {
            var pair = item.split('=');
            var scope = pair[0].trim();
            apiKeyMap[scope] = pair[1].trim();
          } else {
            var clientName = item;
            var _scope = CID_API_SCOPE_ALLOWLIST[clientName];
            if (_scope) {
              apiKeyMap[_scope] = API_KEYS[clientName];
            } else {
              user().warn(
              TAG_,
              "Unsupported client for Google CID API: ".concat(clientName, ".") + "Please remove or correct meta[name=\"".concat(
              GOOGLE_CID_API_META_NAME, "\"]"));

            }
          }
        });
      }
      return apiKeyMap;
    } }]);return Cid;}();


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
  Services.viewerForDoc(ampdoc). /*OK*/sendMessage(
  CID_OPTOUT_VIEWER_MESSAGE,
  dict());


  // Store the optout bit in storage
  return Services.storageForDoc(ampdoc).then(function (storage) {
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
  return Services.storageForDoc(ampdoc).
  then(function (storage) {
    return storage.get(CID_OPTOUT_STORAGE_KEY).then(function (val) {return !!val;});
  }).
  catch(function () {
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
  var expiration = Date.now() + BASE_CID_MAX_AGE_MILLIS;
  setCookie(win, scope, cookie, expiration, {
    highestAvailableDomain: true });

}

/**
 * Sets a new CID backup in Storage
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {string} cookieName
 * @param {string} cookie
 */
function setCidBackup(ampdoc, cookieName, cookie) {
  Services.storageForDoc(ampdoc).then(function (storage) {
    var isViewerStorage = storage.isViewerStorage();
    if (!isViewerStorage) {
      var key = getStorageKey(cookieName);
      storage.setNonBoolean(key, cookie);
    }
  });
}

/**
 * @param {string} cookieName
 * @return {string}
 */
function getStorageKey(cookieName) {
  return CID_BACKUP_STORAGE_KEY + cookieName;
}

/**
 * Maybe gets the CID from cookie or, if allowed, gets backup CID
 * from Storage.
 * @param {!Cid} cid
 * @param {!GetCidDef} getCidStruct
 * @return {!Promise<?string>}
 */
function maybeGetCidFromCookieOrBackup(cid, getCidStruct) {
  var ampdoc = cid.ampdoc,isBackupCidExpOn = cid.isBackupCidExpOn;
  var win = ampdoc.win;
  var disableBackup = getCidStruct.disableBackup,scope = getCidStruct.scope;
  var cookieName = getCidStruct.cookieName || scope;
  var existingCookie = getCookie(win, cookieName);

  if (existingCookie) {
    return Promise.resolve(existingCookie);
  }
  if (isBackupCidExpOn && !disableBackup) {
    return Services.storageForDoc(ampdoc).
    then(function (storage) {
      var key = getStorageKey(cookieName);
      return storage.get(key, BASE_CID_MAX_AGE_MILLIS);
    }).
    then(function (backupCid) {
      if (!backupCid || typeof backupCid != 'string') {
        return null;
      }
      return backupCid;
    });
  }
  return Promise.resolve(null);
}

/**
 * If cookie exists it's returned immediately. Otherwise, if instructed, the
 * new cookie is created.
 * @param {!Cid} cid
 * @param {!GetCidDef} getCidStruct
 * @param {!Promise} persistenceConsent
 * @return {!Promise<?string>}
 */
function getOrCreateCookie(cid, getCidStruct, persistenceConsent) {
  var ampdoc = cid.ampdoc,isBackupCidExpOn = cid.isBackupCidExpOn;
  var win = ampdoc.win;
  var disableBackup = getCidStruct.disableBackup,scope = getCidStruct.scope;
  var cookieName = getCidStruct.cookieName || scope;

  return maybeGetCidFromCookieOrBackup(cid, getCidStruct).then(
  function (existingCookie) {
    if (!existingCookie && !getCidStruct.createCookieIfNotPresent) {
      return (/** @type {!Promise<?string>} */(Promise.resolve(null)));
    }

    if (existingCookie) {
      // If we created the cookie, update it's expiration time.
      if (/^amp-/.test(existingCookie)) {
        setCidCookie(win, cookieName, existingCookie);
        if (isBackupCidExpOn && !disableBackup) {
          setCidBackup(ampdoc, cookieName, existingCookie);
        }
      }
      return (/** @type {!Promise<?string>} */(
        Promise.resolve(existingCookie)));

    }

    if (cid.externalCidCache_[scope]) {
      return (/** @type {!Promise<?string>} */(cid.externalCidCache_[scope]));
    }

    var newCookiePromise = getRandomString64(win)
    // Create new cookie, always prefixed with "amp-", so that we can see from
    // the value whether we created it.
    .then(function (randomStr) {return 'amp-' + randomStr;});

    // Store it as a cookie based on the persistence consent.
    Promise.all([newCookiePromise, persistenceConsent]).then(function (results) {
      // The initial CID generation is inherently racy. First one that gets
      // consent wins.
      var newCookie = results[0];
      var relookup = getCookie(win, cookieName);
      if (!relookup) {
        setCidCookie(win, cookieName, newCookie);
        if (isBackupCidExpOn && !disableBackup) {
          setCidBackup(ampdoc, cookieName, newCookie);
        }
      }
    });
    return (cid.externalCidCache_[scope] = newCookiePromise);
  });

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
  var win = cid.ampdoc.win;

  return (cid.baseCid_ = read(cid.ampdoc).then(function (stored) {
    var needsToStore = false;
    var baseCid;

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
      baseCid.then(function (baseCid) {
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
  var win = ampdoc.win;
  if (isIframed(win)) {
    // If we are being embedded, try to save the base cid to the viewer.
    viewerBaseCid(ampdoc, createCidData(cidString));
  } else {
    // To use local storage, we need user's consent.
    persistenceConsent.then(function () {
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
  var viewer = Services.viewerForDoc(ampdoc);
  return viewer.isTrustedViewer().then(function (trusted) {
    if (!trusted) {
      return undefined;
    }
    // TODO(lannka, #11060): clean up when all Viewers get migrated
    dev().expectedError('CID', 'Viewer does not provide cap=cid');
    return viewer.sendMessageAwaitResponse('cid', opt_data).then(function (data) {
      // For backward compatibility: #4029
      if (data && !tryParseJson(data)) {
        // TODO(lannka, #11060): clean up when all Viewers get migrated
        dev().expectedError('CID', 'invalid cid format');
        return JSON.stringify(
        dict({
          'time': Date.now(), // CID returned from old API is always fresh
          'cid': data }));


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
    'cid': cidString }));


}

/**
 * Gets the persisted CID data as a promise. It tries to read from
 * localStorage first then from viewer if it is in embedded mode.
 * Returns null if none was found.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<?BaseCidInfoDef>}
 */
function read(ampdoc) {
  var win = ampdoc.win;
  var data;
  try {
    data = win.localStorage.getItem('amp-cid');
  } catch (ignore) {
    // If reading from localStorage fails, we assume it is empty.
  }
  var dataPromise = Promise.resolve(data);
  if (!data && isIframed(win)) {
    // If we are being embedded, try to get the base cid from the viewer.
    dataPromise = viewerBaseCid(ampdoc);
  }
  return dataPromise.then(function (data) {
    if (!data) {
      return null;
    }
    var item = parseJson(data);
    return {
      time: item['time'],
      cid: item['cid'] };

  });
}

/**
 * Whether the retrieved cid object is expired and should be ignored.
 * @param {!BaseCidInfoDef} storedCidInfo
 * @return {boolean}
 */
function isExpired(storedCidInfo) {
  var createdTime = storedCidInfo.time;
  var now = Date.now();
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
  var createdTime = storedCidInfo.time;
  var now = Date.now();
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
  var uint8array = getCryptoRandomBytesArray(win, 16); // 128 bit
  if (uint8array) {
    return uint8array;
  }

  // Support for legacy browsers.
  return String(
  win.location.href +
  Date.now() +
  win.Math.random() +
  win.screen.width +
  win.screen.height);

}

/**
 * Produces an external CID for use in a cookie.
 * @param {!Window} win
 * @return {!Promise<string>} The cid
 */
export function getRandomString64(win) {
  var entropy = getEntropy(win);
  if (typeof entropy == 'string') {
    return Services.cryptoFor(win).sha384Base64(entropy);
  } else {
    // If our entropy is a pure random number, we can just directly turn it
    // into base 64
    var cast = /** @type {!Uint8Array} */(entropy);
    return tryResolve(function () {return (
        base64UrlEncodeFromBytes(cast)
        // Remove trailing padding
        .replace(/\.+$/, ''));});

  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {*} TODO(#23582): Specify return type
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
// /Users/mszylkowski/src/amphtml/src/service/cid-impl.js