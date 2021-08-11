function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { getServiceForDoc, registerServiceBuilderForDoc } from "../service-helpers";
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
  'googleanalytics': 'AMP_ECID_GOOGLE'
};

/**
 * The mapping from analytics providers to their CID API service keys.
 * @const @private {Object<string, string>}
 */
var API_KEYS = {
  'googleanalytics': 'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM'
};

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
export var CidDef = /*#__PURE__*/function () {
  function CidDef() {
    _classCallCheck(this, CidDef);
  }

  _createClass(CidDef, [{
    key: "get",
    value:
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
     */

  }, {
    key: "optOut",
    value: function optOut() {}
  }]);

  return CidDef;
}();

/**
 * @implements {CidDef}
 */
var Cid = /*#__PURE__*/function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function Cid(ampdoc) {
    _classCallCheck(this, Cid);

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

  /** @override */
  _createClass(Cid, [{
    key: "get",
    value: function get(getCidStruct, consent, opt_persistenceConsent) {
      var _this = this;

      userAssert(SCOPE_NAME_VALIDATOR.test(getCidStruct.scope) && SCOPE_NAME_VALIDATOR.test(getCidStruct.cookieName), 'The CID scope and cookie name must only use the characters ' + '[a-zA-Z0-9-_.]+\nInstead found: %s', getCidStruct.scope);
      return consent.then(function () {
        return _this.ampdoc.whenFirstVisible();
      }).then(function () {
        // Check if user has globally opted out of CID, we do this after
        // consent check since user can optout during consent process.
        return isOptedOutOfCid(_this.ampdoc);
      }).then(function (optedOut) {
        if (optedOut) {
          return '';
        }

        var cidPromise = _this.getExternalCid_(getCidStruct, opt_persistenceConsent || consent);

        // Getting the CID might involve an HTTP request. We timeout after 10s.
        return Services.timerFor(_this.ampdoc.win).timeoutPromise(10000, cidPromise, "Getting cid for \"" + getCidStruct.scope + "\" timed out").catch(function (error) {
          rethrowAsync(error);
        });
      });
    }
    /** @override */

  }, {
    key: "optOut",
    value: function optOut() {
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

  }, {
    key: "getExternalCid_",
    value: function getExternalCid_(getCidStruct, persistenceConsent) {
      var _this2 = this;

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
     */

  }, {
    key: "scopeBaseCid_",
    value: function scopeBaseCid_(persistenceConsent, scope, url) {
      var _this3 = this;

      return getBaseCid(this, persistenceConsent).then(function (baseCid) {
        return Services.cryptoFor(_this3.ampdoc.win).sha384Base64(baseCid + getProxySourceOrigin(url) + scope);
      });
    }
    /**
     * Checks if the page has opted in CID API for the given scope.
     * Returns the API key that should be used, or null if page hasn't opted in.
     *
     * @param {string} scope
     * @return {string|undefined}
     */

  }, {
    key: "isScopeOptedIn_",
    value: function isScopeOptedIn_(scope) {
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

  }, {
    key: "getOptedInScopes_",
    value: function getOptedInScopes_() {
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
              user().warn(TAG_, "Unsupported client for Google CID API: " + clientName + "." + ("Please remove or correct meta[name=\"" + GOOGLE_CID_API_META_NAME + "\"]"));
            }
          }
        });
      }

      return apiKeyMap;
    }
  }]);

  return Cid;
}();

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
  Services.viewerForDoc(ampdoc).
  /*OK*/
  sendMessage(CID_OPTOUT_VIEWER_MESSAGE, dict());
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
  return Services.storageForDoc(ampdoc).then(function (storage) {
    return storage.get(CID_OPTOUT_STORAGE_KEY).then(function (val) {
      return !!val;
    });
  }).catch(function () {
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
    highestAvailableDomain: true
  });
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
  var ampdoc = cid.ampdoc,
      isBackupCidExpOn = cid.isBackupCidExpOn;
  var win = ampdoc.win;
  var disableBackup = getCidStruct.disableBackup,
      scope = getCidStruct.scope;
  var cookieName = getCidStruct.cookieName || scope;
  var existingCookie = getCookie(win, cookieName);

  if (existingCookie) {
    return Promise.resolve(existingCookie);
  }

  if (isBackupCidExpOn && !disableBackup) {
    return Services.storageForDoc(ampdoc).then(function (storage) {
      var key = getStorageKey(cookieName);
      return storage.get(key, BASE_CID_MAX_AGE_MILLIS);
    }).then(function (backupCid) {
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
  var ampdoc = cid.ampdoc,
      isBackupCidExpOn = cid.isBackupCidExpOn;
  var win = ampdoc.win;
  var disableBackup = getCidStruct.disableBackup,
      scope = getCidStruct.scope;
  var cookieName = getCidStruct.cookieName || scope;
  return maybeGetCidFromCookieOrBackup(cid, getCidStruct).then(function (existingCookie) {
    if (!existingCookie && !getCidStruct.createCookieIfNotPresent) {
      return (
        /** @type {!Promise<?string>} */
        Promise.resolve(null)
      );
    }

    if (existingCookie) {
      // If we created the cookie, update it's expiration time.
      if (/^amp-/.test(existingCookie)) {
        setCidCookie(win, cookieName, existingCookie);

        if (isBackupCidExpOn && !disableBackup) {
          setCidBackup(ampdoc, cookieName, existingCookie);
        }
      }

      return (
        /** @type {!Promise<?string>} */
        Promise.resolve(existingCookie)
      );
    }

    if (cid.externalCidCache_[scope]) {
      return (
        /** @type {!Promise<?string>} */
        cid.externalCidCache_[scope]
      );
    }

    var newCookiePromise = getRandomString64(win) // Create new cookie, always prefixed with "amp-", so that we can see from
    // the value whether we created it.
    .then(function (randomStr) {
      return 'amp-' + randomStr;
    });
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
    return cid.externalCidCache_[scope] = newCookiePromise;
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
  return cid.baseCid_ = read(cid.ampdoc).then(function (stored) {
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
  });
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
      } catch (ignore) {// Setting localStorage may fail. In practice we don't expect that to
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
        return JSON.stringify(dict({
          'time': Date.now(),
          // CID returned from old API is always fresh
          'cid': data
        }));
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
  return JSON.stringify(dict({
    'time': Date.now(),
    'cid': cidString
  }));
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
  } catch (ignore) {// If reading from localStorage fails, we assume it is empty.
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
      cid: item['cid']
    };
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
  var uint8array = getCryptoRandomBytesArray(win, 16);

  // 128 bit
  if (uint8array) {
    return uint8array;
  }

  // Support for legacy browsers.
  return String(win.location.href + Date.now() + win.Math.random() + win.screen.width + win.screen.height);
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
    var cast =
    /** @type {!Uint8Array} */
    entropy;
    return tryResolve(function () {
      return base64UrlEncodeFromBytes(cast) // Remove trailing padding
      .replace(/\.+$/, '');
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNpZC1pbXBsLmpzIl0sIm5hbWVzIjpbInRyeVJlc29sdmUiLCJpc0lmcmFtZWQiLCJyZXRocm93QXN5bmMiLCJkaWN0IiwicGFyc2VKc29uIiwidHJ5UGFyc2VKc29uIiwiYmFzZTY0VXJsRW5jb2RlRnJvbUJ5dGVzIiwiZ2V0Q3J5cHRvUmFuZG9tQnl0ZXNBcnJheSIsImlzRXhwZXJpbWVudE9uIiwiU2VydmljZXMiLCJDYWNoZUNpZEFwaSIsIkdvb2dsZUNpZEFwaSIsIlRva2VuU3RhdHVzIiwiVmlld2VyQ2lkQXBpIiwiZ2V0Q29va2llIiwic2V0Q29va2llIiwiZGV2IiwidXNlciIsInVzZXJBc3NlcnQiLCJnZXRTZXJ2aWNlRm9yRG9jIiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyIsImdldFNvdXJjZU9yaWdpbiIsImlzUHJveHlPcmlnaW4iLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJPTkVfREFZX01JTExJUyIsIkJBU0VfQ0lEX01BWF9BR0VfTUlMTElTIiwiU0NPUEVfTkFNRV9WQUxJREFUT1IiLCJDSURfT1BUT1VUX1NUT1JBR0VfS0VZIiwiQ0lEX09QVE9VVF9WSUVXRVJfTUVTU0FHRSIsIkNJRF9CQUNLVVBfU1RPUkFHRV9LRVkiLCJUQUdfIiwiR09PR0xFX0NJRF9BUElfTUVUQV9OQU1FIiwiQ0lEX0FQSV9TQ09QRV9BTExPV0xJU1QiLCJBUElfS0VZUyIsIkJhc2VDaWRJbmZvRGVmIiwiR2V0Q2lkRGVmIiwiQ2lkRGVmIiwidW51c2VkR2V0Q2lkU3RydWN0IiwidW51c2VkQ29uc2VudCIsIm9wdF9wZXJzaXN0ZW5jZUNvbnNlbnQiLCJDaWQiLCJhbXBkb2MiLCJiYXNlQ2lkXyIsImV4dGVybmFsQ2lkQ2FjaGVfIiwiT2JqZWN0IiwiY3JlYXRlIiwiY2FjaGVDaWRBcGlfIiwidmlld2VyQ2lkQXBpXyIsImNpZEFwaV8iLCJhcGlLZXlNYXBfIiwiaXNCYWNrdXBDaWRFeHBPbiIsIndpbiIsImdldENpZFN0cnVjdCIsImNvbnNlbnQiLCJ0ZXN0Iiwic2NvcGUiLCJjb29raWVOYW1lIiwidGhlbiIsIndoZW5GaXJzdFZpc2libGUiLCJpc09wdGVkT3V0T2ZDaWQiLCJvcHRlZE91dCIsImNpZFByb21pc2UiLCJnZXRFeHRlcm5hbENpZF8iLCJ0aW1lckZvciIsInRpbWVvdXRQcm9taXNlIiwiY2F0Y2giLCJlcnJvciIsIm9wdE91dE9mQ2lkIiwicGVyc2lzdGVuY2VDb25zZW50IiwidXJsIiwibG9jYXRpb24iLCJocmVmIiwiYXBpS2V5IiwiaXNTY29wZU9wdGVkSW5fIiwiZ2V0U2NvcGVkQ2lkIiwic2NvcGVkQ2lkIiwiT1BUX09VVCIsInNldENpZENvb2tpZSIsImdldE9yQ3JlYXRlQ29va2llIiwiaXNTdXBwb3J0ZWQiLCJzdXBwb3J0ZWQiLCJzY29wZUJhc2VDaWRfIiwiZ2V0QmFzZUNpZCIsImJhc2VDaWQiLCJjcnlwdG9Gb3IiLCJzaGEzODRCYXNlNjQiLCJnZXRQcm94eVNvdXJjZU9yaWdpbiIsImdldE9wdGVkSW5TY29wZXNfIiwiYXBpS2V5TWFwIiwib3B0SW5NZXRhIiwiZ2V0TWV0YUJ5TmFtZSIsInNwbGl0IiwiZm9yRWFjaCIsIml0ZW0iLCJ0cmltIiwiaW5kZXhPZiIsInBhaXIiLCJjbGllbnROYW1lIiwid2FybiIsInZpZXdlckZvckRvYyIsInNlbmRNZXNzYWdlIiwic3RvcmFnZUZvckRvYyIsInN0b3JhZ2UiLCJzZXQiLCJnZXQiLCJ2YWwiLCJjb29raWUiLCJleHBpcmF0aW9uIiwiRGF0ZSIsIm5vdyIsImhpZ2hlc3RBdmFpbGFibGVEb21haW4iLCJzZXRDaWRCYWNrdXAiLCJpc1ZpZXdlclN0b3JhZ2UiLCJrZXkiLCJnZXRTdG9yYWdlS2V5Iiwic2V0Tm9uQm9vbGVhbiIsIm1heWJlR2V0Q2lkRnJvbUNvb2tpZU9yQmFja3VwIiwiY2lkIiwiZGlzYWJsZUJhY2t1cCIsImV4aXN0aW5nQ29va2llIiwiUHJvbWlzZSIsInJlc29sdmUiLCJiYWNrdXBDaWQiLCJjcmVhdGVDb29raWVJZk5vdFByZXNlbnQiLCJuZXdDb29raWVQcm9taXNlIiwiZ2V0UmFuZG9tU3RyaW5nNjQiLCJyYW5kb21TdHIiLCJhbGwiLCJyZXN1bHRzIiwibmV3Q29va2llIiwicmVsb29rdXAiLCJvcmlnaW4iLCJyZWFkIiwic3RvcmVkIiwibmVlZHNUb1N0b3JlIiwiaXNFeHBpcmVkIiwic2hvdWxkVXBkYXRlU3RvcmVkVGltZSIsImdldEVudHJvcHkiLCJzdG9yZSIsImNpZFN0cmluZyIsInZpZXdlckJhc2VDaWQiLCJjcmVhdGVDaWREYXRhIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsImlnbm9yZSIsIm9wdF9kYXRhIiwidmlld2VyIiwiaXNUcnVzdGVkVmlld2VyIiwidHJ1c3RlZCIsInVuZGVmaW5lZCIsImV4cGVjdGVkRXJyb3IiLCJzZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UiLCJkYXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsImdldEl0ZW0iLCJkYXRhUHJvbWlzZSIsInRpbWUiLCJzdG9yZWRDaWRJbmZvIiwiY3JlYXRlZFRpbWUiLCJ1aW50OGFycmF5IiwiU3RyaW5nIiwiTWF0aCIsInJhbmRvbSIsInNjcmVlbiIsIndpZHRoIiwiaGVpZ2h0IiwiZW50cm9weSIsImNhc3QiLCJyZXBsYWNlIiwiaW5zdGFsbENpZFNlcnZpY2UiLCJjaWRTZXJ2aWNlRm9yRG9jRm9yVGVzdGluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsVUFBUjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxZQUFSO0FBQ0EsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLFNBQVIsRUFBbUJDLFlBQW5CO0FBQ0EsU0FBUUMsd0JBQVI7QUFDQSxTQUFRQyx5QkFBUjtBQUVBLFNBQVFDLGNBQVI7QUFFQSxTQUFRQyxRQUFSO0FBRUEsU0FBUUMsV0FBUjtBQUNB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QVUsQ0FBQ3RGLEdBQUQsQ0FBMUI7O0FBQ0EsTUFBSSxPQUFPb0gsT0FBUCxJQUFrQixRQUF0QixFQUFnQztBQUM5QixXQUFPOUosUUFBUSxDQUFDMkUsU0FBVCxDQUFtQmpDLEdBQW5CLEVBQXdCa0MsWUFBeEIsQ0FBcUNrRixPQUFyQyxDQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0w7QUFDQTtBQUNBLFFBQU1DLElBQUk7QUFBRztBQUE0QkQsSUFBQUEsT0FBekM7QUFDQSxXQUFPdkssVUFBVSxDQUFDO0FBQUEsYUFDaEJNLHdCQUF3QixDQUFDa0ssSUFBRCxDQUF4QixDQUNFO0FBREYsT0FFR0MsT0FGSCxDQUVXLE1BRlgsRUFFbUIsRUFGbkIsQ0FEZ0I7QUFBQSxLQUFELENBQWpCO0FBS0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsaUJBQVQsQ0FBMkJqSSxNQUEzQixFQUFtQztBQUN4QyxTQUFPckIsNEJBQTRCLENBQUNxQixNQUFELEVBQVMsS0FBVCxFQUFnQkQsR0FBaEIsQ0FBbkM7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTbUksMEJBQVQsQ0FBb0NsSSxNQUFwQyxFQUE0QztBQUNqRHJCLEVBQUFBLDRCQUE0QixDQUFDcUIsTUFBRCxFQUFTLEtBQVQsRUFBZ0JELEdBQWhCLENBQTVCO0FBQ0EsU0FBT3JCLGdCQUFnQixDQUFDc0IsTUFBRCxFQUFTLEtBQVQsQ0FBdkI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgUHJvdmlkZXMgcGVyIEFNUCBkb2N1bWVudCBzb3VyY2Ugb3JpZ2luIGFuZCB1c2UgY2FzZVxuICogcGVyc2lzdGVudCBjbGllbnQgaWRlbnRpZmllcnMgZm9yIHVzZSBpbiBhbmFseXRpY3MgYW5kIHNpbWlsYXIgdXNlXG4gKiBjYXNlcy5cbiAqXG4gKiBGb3IgZGV0YWlscywgc2VlIGh0dHBzOi8vZ29vLmdsL013YWFjc1xuICovXG5cbmltcG9ydCB7dHJ5UmVzb2x2ZX0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHtpc0lmcmFtZWR9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge3JldGhyb3dBc3luY30gZnJvbSAnI2NvcmUvZXJyb3InO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtwYXJzZUpzb24sIHRyeVBhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHtiYXNlNjRVcmxFbmNvZGVGcm9tQnl0ZXN9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy9iYXNlNjQnO1xuaW1wb3J0IHtnZXRDcnlwdG9SYW5kb21CeXRlc0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvYnl0ZXMnO1xuXG5pbXBvcnQge2lzRXhwZXJpbWVudE9ufSBmcm9tICcjZXhwZXJpbWVudHMnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7Q2FjaGVDaWRBcGl9IGZyb20gJy4vY2FjaGUtY2lkLWFwaSc7XG5pbXBvcnQge0dvb2dsZUNpZEFwaSwgVG9rZW5TdGF0dXN9IGZyb20gJy4vY2lkLWFwaSc7XG5pbXBvcnQge1ZpZXdlckNpZEFwaX0gZnJvbSAnLi92aWV3ZXItY2lkLWFwaSc7XG5cbmltcG9ydCB7Z2V0Q29va2llLCBzZXRDb29raWV9IGZyb20gJy4uL2Nvb2tpZXMnO1xuaW1wb3J0IHtkZXYsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge1xuICBnZXRTZXJ2aWNlRm9yRG9jLFxuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jLFxufSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRTb3VyY2VPcmlnaW4sIGlzUHJveHlPcmlnaW4sIHBhcnNlVXJsRGVwcmVjYXRlZH0gZnJvbSAnLi4vdXJsJztcblxuY29uc3QgT05FX0RBWV9NSUxMSVMgPSAyNCAqIDM2MDAgKiAxMDAwO1xuXG4vKipcbiAqIFdlIGlnbm9yZSBiYXNlIGNpZHMgdGhhdCBhcmUgb2xkZXIgdGhhbiAocm91Z2hseSkgb25lIHllYXIuXG4gKi9cbmV4cG9ydCBjb25zdCBCQVNFX0NJRF9NQVhfQUdFX01JTExJUyA9IDM2NSAqIE9ORV9EQVlfTUlMTElTO1xuXG5jb25zdCBTQ09QRV9OQU1FX1ZBTElEQVRPUiA9IC9eW2EtekEtWjAtOS1fLl0rJC87XG5cbmNvbnN0IENJRF9PUFRPVVRfU1RPUkFHRV9LRVkgPSAnYW1wLWNpZC1vcHRvdXQnO1xuXG5jb25zdCBDSURfT1BUT1VUX1ZJRVdFUl9NRVNTQUdFID0gJ2NpZE9wdE91dCc7XG5cbmNvbnN0IENJRF9CQUNLVVBfU1RPUkFHRV9LRVkgPSAnYW1wLWNpZDonO1xuXG4vKipcbiAqIFRhZyBmb3IgZGVidWcgbG9nZ2luZy5cbiAqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfVxuICovXG5jb25zdCBUQUdfID0gJ0NJRCc7XG5cbi8qKlxuICogVGhlIG5hbWUgb2YgdGhlIEdvb2dsZSBDSUQgQVBJIGFzIGl0IGFwcGVhcnMgaW4gdGhlIG1ldGEgdGFnIHRvIG9wdC1pbi5cbiAqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfVxuICovXG5jb25zdCBHT09HTEVfQ0lEX0FQSV9NRVRBX05BTUUgPSAnYW1wLWdvb2dsZS1jbGllbnQtaWQtYXBpJztcblxuLyoqXG4gKiBUaGUgbWFwcGluZyBmcm9tIGFuYWx5dGljcyBwcm92aWRlcnMgdG8gQ0lEIHNjb3Blcy5cbiAqIEBjb25zdCBAcHJpdmF0ZSB7T2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAqL1xuY29uc3QgQ0lEX0FQSV9TQ09QRV9BTExPV0xJU1QgPSB7XG4gICdnb29nbGVhbmFseXRpY3MnOiAnQU1QX0VDSURfR09PR0xFJyxcbn07XG5cbi8qKlxuICogVGhlIG1hcHBpbmcgZnJvbSBhbmFseXRpY3MgcHJvdmlkZXJzIHRvIHRoZWlyIENJRCBBUEkgc2VydmljZSBrZXlzLlxuICogQGNvbnN0IEBwcml2YXRlIHtPYmplY3Q8c3RyaW5nLCBzdHJpbmc+fVxuICovXG5jb25zdCBBUElfS0VZUyA9IHtcbiAgJ2dvb2dsZWFuYWx5dGljcyc6ICdBSXphU3lBNjVsRUhVRWl6SXNOdGxiTm8tbDJLMThkVDY4MG5zYU0nLFxufTtcblxuLyoqXG4gKiBBIGJhc2UgY2lkIHN0cmluZyB2YWx1ZSBhbmQgdGhlIHRpbWUgaXQgd2FzIGxhc3QgcmVhZCAvIHN0b3JlZC5cbiAqIEB0eXBlZGVmIHt7dGltZTogdGltZSwgY2lkOiBzdHJpbmd9fVxuICovXG5sZXQgQmFzZUNpZEluZm9EZWY7XG5cbi8qKlxuICogVGhlIFwiZ2V0IENJRFwiIHBhcmFtZXRlcnMuXG4gKiAtIGNyZWF0ZUNvb2tpZUlmTm90UHJlc2VudDogV2hldGhlciBDSUQgaXMgYWxsb3dlZCB0byBjcmVhdGUgYSBjb29raWUgd2hlbi5cbiAqICAgRGVmYXVsdCB2YWx1ZSBpcyBgZmFsc2VgLlxuICogLSBjb29raWVOYW1lOiBOYW1lIG9mIHRoZSBjb29raWUgdG8gYmUgdXNlZCBpZiBkZWZpbmVkIGZvciBub24tcHJveHkgY2FzZS5cbiAqIC0gZGlzYWJsZUJhY2t1cDogV2hldGhlciBDSUQgc2hvdWxkIG5vdCBiZSBiYWNrZWQgdXAgaW4gU3RvcmFnZS5cbiAqICAgRGVmYXVsdCB2YWx1ZSBpcyBgZmFsc2VgLlxuICogQHR5cGVkZWYge3tcbiAqICAgc2NvcGU6IHN0cmluZyxcbiAqICAgY3JlYXRlQ29va2llSWZOb3RQcmVzZW50OiAoYm9vbGVhbnx1bmRlZmluZWQpLFxuICogICBjb29raWVOYW1lOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gKiAgIGRpc2FibGVCYWNrdXA6IChib29sZWFufHVuZGVmaW5lZCksXG4gKiB9fVxuICovXG5sZXQgR2V0Q2lkRGVmO1xuXG4vKipcbiAqIEBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGNsYXNzIENpZERlZiB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFHZXRDaWREZWZ9IHVudXNlZEdldENpZFN0cnVjdCBhbiBvYmplY3QgcHJvdmlkZXMgQ0lEIHNjb3BlIG5hbWUgZm9yXG4gICAqICAgICBwcm94eSBjYXNlIGFuZCBjb29raWUgbmFtZSBmb3Igbm9uLXByb3h5IGNhc2UuXG4gICAqIEBwYXJhbSB7IVByb21pc2V9IHVudXNlZENvbnNlbnQgUHJvbWlzZSBmb3Igd2hlbiB0aGUgdXNlciBoYXMgZ2l2ZW4gY29uc2VudFxuICAgKiAgICAgKGlmIGRlZW1lZCBuZWNlc3NhcnkgYnkgdGhlIHB1Ymxpc2hlcikgZm9yIHVzZSBvZiB0aGUgY2xpZW50XG4gICAqICAgICBpZGVudGlmaWVyLlxuICAgKiBAcGFyYW0geyFQcm9taXNlPX0gb3B0X3BlcnNpc3RlbmNlQ29uc2VudCBEZWRpY2F0ZWQgcHJvbWlzZSBmb3Igd2hlblxuICAgKiAgICAgaXQgaXMgT0sgdG8gcGVyc2lzdCBhIG5ldyB0cmFja2luZyBpZGVudGlmaWVyLiBUaGlzIGNvdWxkIGJlXG4gICAqICAgICBzdXBwbGllZCBPTkxZIGJ5IHRoZSBjb2RlIHRoYXQgc3VwcGxpZXMgdGhlIGFjdHVhbCBjb25zZW50XG4gICAqICAgICBjb29raWUuXG4gICAqICAgICBJZiB0aGlzIGlzIGdpdmVuLCB0aGUgY29uc2VudCBwYXJhbSBzaG91bGQgYmUgYSByZXNvbHZlZCBwcm9taXNlXG4gICAqICAgICBiZWNhdXNlIHRoaXMgY2FsbCBzaG91bGQgYmUgb25seSBtYWRlIGluIG9yZGVyIHRvIGdldCBjb25zZW50LlxuICAgKiAgICAgVGhlIGNvbnNlbnQgcHJvbWlzZSBwYXNzZWQgdG8gb3RoZXIgY2FsbHMgc2hvdWxkIHRoZW4gaXRzZWxmXG4gICAqICAgICBkZXBlbmQgb24gdGhlIG9wdF9wZXJzaXN0ZW5jZUNvbnNlbnQgcHJvbWlzZSAoYW5kIHRoZSBhY3R1YWxcbiAgICogICAgIGNvbnNlbnQsIG9mIGNvdXJzZSkuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPD9zdHJpbmc+fSBBIGNsaWVudCBpZGVudGlmaWVyIHRoYXQgc2hvdWxkIGJlIHVzZWRcbiAgICogICAgICB3aXRoaW4gdGhlIGN1cnJlbnQgc291cmNlIG9yaWdpbiBhbmQgZXh0ZXJuYWxDaWRTY29wZS4gTWlnaHQgYmVcbiAgICogICAgICBudWxsIGlmIHVzZXIgaGFzIG9wdGVkIG91dCBvZiBjaWQgb3Igbm8gaWRlbnRpZmllciB3YXMgZm91bmRcbiAgICogICAgICBvciBpdCBjb3VsZCBiZSBtYWRlLlxuICAgKiAgICAgIFRoaXMgcHJvbWlzZSBtYXkgdGFrZSBhIGxvbmcgdGltZSB0byByZXNvbHZlIGlmIGNvbnNlbnQgaXNuJ3RcbiAgICogICAgICBnaXZlbi5cbiAgICovXG4gIGdldCh1bnVzZWRHZXRDaWRTdHJ1Y3QsIHVudXNlZENvbnNlbnQsIG9wdF9wZXJzaXN0ZW5jZUNvbnNlbnQpIHt9XG5cbiAgLyoqXG4gICAqIFVzZXIgd2lsbCBiZSBvcHRlZCBvdXQgb2YgQ2lkIGlzc3VhbmNlIGZvciBhbGwgc2NvcGVzLlxuICAgKiBXaGVuIG9wdGVkLW91dCBDaWQgc2VydmljZSB3aWxsIHJlamVjdCBhbGwgYGdldGAgcmVxdWVzdHMuXG4gICAqXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgb3B0T3V0KCkge31cbn1cblxuLyoqXG4gKiBAaW1wbGVtZW50cyB7Q2lkRGVmfVxuICovXG5jbGFzcyBDaWQge1xuICAvKiogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvYyAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQGNvbnN0ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBkb2M7XG5cbiAgICAvKipcbiAgICAgKiBDYWNoZWQgYmFzZSBjaWQgb25jZSByZWFkIGZyb20gc3RvcmFnZSB0byBhdm9pZCByZXBlYXRlZFxuICAgICAqIHJlYWRzLlxuICAgICAqIEBwcml2YXRlIHs/UHJvbWlzZTxzdHJpbmc+fVxuICAgICAqIEByZXN0cmljdGVkXG4gICAgICovXG4gICAgdGhpcy5iYXNlQ2lkXyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBDYWNoZSB0byBzdG9yZSBleHRlcm5hbCBjaWRzLiBTY29wZSBpcyB1c2VkIGFzIHRoZSBrZXkgYW5kIGNvb2tpZSB2YWx1ZVxuICAgICAqIGlzIHRoZSB2YWx1ZS5cbiAgICAgKiBAcHJpdmF0ZSB7IU9iamVjdDxzdHJpbmcsICFQcm9taXNlPHN0cmluZz4+fVxuICAgICAqIEByZXN0cmljdGVkXG4gICAgICovXG4gICAgdGhpcy5leHRlcm5hbENpZENhY2hlXyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFDYWNoZUNpZEFwaX1cbiAgICAgKi9cbiAgICB0aGlzLmNhY2hlQ2lkQXBpXyA9IG5ldyBDYWNoZUNpZEFwaShhbXBkb2MpO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUgeyFWaWV3ZXJDaWRBcGl9XG4gICAgICovXG4gICAgdGhpcy52aWV3ZXJDaWRBcGlfID0gbmV3IFZpZXdlckNpZEFwaShhbXBkb2MpO1xuXG4gICAgdGhpcy5jaWRBcGlfID0gbmV3IEdvb2dsZUNpZEFwaShhbXBkb2MpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/T2JqZWN0PHN0cmluZywgc3RyaW5nPn0gKi9cbiAgICB0aGlzLmFwaUtleU1hcF8gPSBudWxsO1xuXG4gICAgLyoqIEBjb25zdCB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzQmFja3VwQ2lkRXhwT24gPSBpc0V4cGVyaW1lbnRPbih0aGlzLmFtcGRvYy53aW4sICdhbXAtY2lkLWJhY2t1cCcpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXQoZ2V0Q2lkU3RydWN0LCBjb25zZW50LCBvcHRfcGVyc2lzdGVuY2VDb25zZW50KSB7XG4gICAgdXNlckFzc2VydChcbiAgICAgIFNDT1BFX05BTUVfVkFMSURBVE9SLnRlc3QoZ2V0Q2lkU3RydWN0LnNjb3BlKSAmJlxuICAgICAgICBTQ09QRV9OQU1FX1ZBTElEQVRPUi50ZXN0KGdldENpZFN0cnVjdC5jb29raWVOYW1lKSxcbiAgICAgICdUaGUgQ0lEIHNjb3BlIGFuZCBjb29raWUgbmFtZSBtdXN0IG9ubHkgdXNlIHRoZSBjaGFyYWN0ZXJzICcgK1xuICAgICAgICAnW2EtekEtWjAtOS1fLl0rXFxuSW5zdGVhZCBmb3VuZDogJXMnLFxuICAgICAgZ2V0Q2lkU3RydWN0LnNjb3BlXG4gICAgKTtcbiAgICByZXR1cm4gY29uc2VudFxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hbXBkb2Mud2hlbkZpcnN0VmlzaWJsZSgpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdXNlciBoYXMgZ2xvYmFsbHkgb3B0ZWQgb3V0IG9mIENJRCwgd2UgZG8gdGhpcyBhZnRlclxuICAgICAgICAvLyBjb25zZW50IGNoZWNrIHNpbmNlIHVzZXIgY2FuIG9wdG91dCBkdXJpbmcgY29uc2VudCBwcm9jZXNzLlxuICAgICAgICByZXR1cm4gaXNPcHRlZE91dE9mQ2lkKHRoaXMuYW1wZG9jKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigob3B0ZWRPdXQpID0+IHtcbiAgICAgICAgaWYgKG9wdGVkT3V0KSB7XG4gICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNpZFByb21pc2UgPSB0aGlzLmdldEV4dGVybmFsQ2lkXyhcbiAgICAgICAgICBnZXRDaWRTdHJ1Y3QsXG4gICAgICAgICAgb3B0X3BlcnNpc3RlbmNlQ29uc2VudCB8fCBjb25zZW50XG4gICAgICAgICk7XG4gICAgICAgIC8vIEdldHRpbmcgdGhlIENJRCBtaWdodCBpbnZvbHZlIGFuIEhUVFAgcmVxdWVzdC4gV2UgdGltZW91dCBhZnRlciAxMHMuXG4gICAgICAgIHJldHVybiBTZXJ2aWNlcy50aW1lckZvcih0aGlzLmFtcGRvYy53aW4pXG4gICAgICAgICAgLnRpbWVvdXRQcm9taXNlKFxuICAgICAgICAgICAgMTAwMDAsXG4gICAgICAgICAgICBjaWRQcm9taXNlLFxuICAgICAgICAgICAgYEdldHRpbmcgY2lkIGZvciBcIiR7Z2V0Q2lkU3RydWN0LnNjb3BlfVwiIHRpbWVkIG91dGBcbiAgICAgICAgICApXG4gICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgcmV0aHJvd0FzeW5jKGVycm9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvcHRPdXQoKSB7XG4gICAgcmV0dXJuIG9wdE91dE9mQ2lkKHRoaXMuYW1wZG9jKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBcImV4dGVybmFsIGNpZFwiLiBUaGlzIGlzIGEgY2lkIGZvciBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICogKFNheSBBbmFseXRpY3MgcHJvdmlkZXIgWCkuIEl0IGlzIHVuaXF1ZSBwZXIgdXNlciwgdXNlckFzc2VydCwgdGhhdCBwdXJwb3NlXG4gICAqIGFuZCB0aGUgQU1QIG9yaWdpbiBzaXRlLlxuICAgKiBAcGFyYW0geyFHZXRDaWREZWZ9IGdldENpZFN0cnVjdFxuICAgKiBAcGFyYW0geyFQcm9taXNlfSBwZXJzaXN0ZW5jZUNvbnNlbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8P3N0cmluZz59XG4gICAqL1xuICBnZXRFeHRlcm5hbENpZF8oZ2V0Q2lkU3RydWN0LCBwZXJzaXN0ZW5jZUNvbnNlbnQpIHtcbiAgICBjb25zdCB7c2NvcGV9ID0gZ2V0Q2lkU3RydWN0O1xuICAgIC8qKiBAY29uc3QgeyFMb2NhdGlvbn0gKi9cbiAgICBjb25zdCB1cmwgPSBwYXJzZVVybERlcHJlY2F0ZWQodGhpcy5hbXBkb2Mud2luLmxvY2F0aW9uLmhyZWYpO1xuICAgIGlmICghaXNQcm94eU9yaWdpbih1cmwpKSB7XG4gICAgICBjb25zdCBhcGlLZXkgPSB0aGlzLmlzU2NvcGVPcHRlZEluXyhzY29wZSk7XG4gICAgICBpZiAoYXBpS2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNpZEFwaV8uZ2V0U2NvcGVkQ2lkKGFwaUtleSwgc2NvcGUpLnRoZW4oKHNjb3BlZENpZCkgPT4ge1xuICAgICAgICAgIGlmIChzY29wZWRDaWQgPT0gVG9rZW5TdGF0dXMuT1BUX09VVCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzY29wZWRDaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvb2tpZU5hbWUgPSBnZXRDaWRTdHJ1Y3QuY29va2llTmFtZSB8fCBzY29wZTtcbiAgICAgICAgICAgIHNldENpZENvb2tpZSh0aGlzLmFtcGRvYy53aW4sIGNvb2tpZU5hbWUsIHNjb3BlZENpZCk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGVkQ2lkO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZ2V0T3JDcmVhdGVDb29raWUodGhpcywgZ2V0Q2lkU3RydWN0LCBwZXJzaXN0ZW5jZUNvbnNlbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBnZXRPckNyZWF0ZUNvb2tpZSh0aGlzLCBnZXRDaWRTdHJ1Y3QsIHBlcnNpc3RlbmNlQ29uc2VudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmlld2VyQ2lkQXBpXy5pc1N1cHBvcnRlZCgpLnRoZW4oKHN1cHBvcnRlZCkgPT4ge1xuICAgICAgaWYgKHN1cHBvcnRlZCkge1xuICAgICAgICBjb25zdCBhcGlLZXkgPSB0aGlzLmlzU2NvcGVPcHRlZEluXyhzY29wZSk7XG4gICAgICAgIHJldHVybiB0aGlzLnZpZXdlckNpZEFwaV8uZ2V0U2NvcGVkQ2lkKGFwaUtleSwgc2NvcGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jYWNoZUNpZEFwaV8uaXNTdXBwb3J0ZWQoKSAmJiB0aGlzLmlzU2NvcGVPcHRlZEluXyhzY29wZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVDaWRBcGlfLmdldFNjb3BlZENpZChzY29wZSkudGhlbigoc2NvcGVkQ2lkKSA9PiB7XG4gICAgICAgICAgaWYgKHNjb3BlZENpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHNjb3BlZENpZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGVCYXNlQ2lkXyhwZXJzaXN0ZW5jZUNvbnNlbnQsIHNjb3BlLCB1cmwpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNjb3BlQmFzZUNpZF8ocGVyc2lzdGVuY2VDb25zZW50LCBzY29wZSwgdXJsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0geyFQcm9taXNlfSBwZXJzaXN0ZW5jZUNvbnNlbnRcbiAgICogQHBhcmFtIHsqfSBzY29wZVxuICAgKiBAcGFyYW0geyFMb2NhdGlvbn0gdXJsXG4gICAqIEByZXR1cm4geyp9XG4gICAqL1xuICBzY29wZUJhc2VDaWRfKHBlcnNpc3RlbmNlQ29uc2VudCwgc2NvcGUsIHVybCkge1xuICAgIHJldHVybiBnZXRCYXNlQ2lkKHRoaXMsIHBlcnNpc3RlbmNlQ29uc2VudCkudGhlbigoYmFzZUNpZCkgPT4ge1xuICAgICAgcmV0dXJuIFNlcnZpY2VzLmNyeXB0b0Zvcih0aGlzLmFtcGRvYy53aW4pLnNoYTM4NEJhc2U2NChcbiAgICAgICAgYmFzZUNpZCArIGdldFByb3h5U291cmNlT3JpZ2luKHVybCkgKyBzY29wZVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHBhZ2UgaGFzIG9wdGVkIGluIENJRCBBUEkgZm9yIHRoZSBnaXZlbiBzY29wZS5cbiAgICogUmV0dXJucyB0aGUgQVBJIGtleSB0aGF0IHNob3VsZCBiZSB1c2VkLCBvciBudWxsIGlmIHBhZ2UgaGFzbid0IG9wdGVkIGluLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2NvcGVcbiAgICogQHJldHVybiB7c3RyaW5nfHVuZGVmaW5lZH1cbiAgICovXG4gIGlzU2NvcGVPcHRlZEluXyhzY29wZSkge1xuICAgIGlmICghdGhpcy5hcGlLZXlNYXBfKSB7XG4gICAgICB0aGlzLmFwaUtleU1hcF8gPSB0aGlzLmdldE9wdGVkSW5TY29wZXNfKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFwaUtleU1hcF9bc2NvcGVdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIG1ldGEgdGFncyBmb3Igb3B0ZWQgaW4gc2NvcGVzLiAgTWV0YSB0YWdzIHdpbGwgaGF2ZSB0aGUgZm9ybVxuICAgKiA8bWV0YSBuYW1lPVwicHJvdmlkZXItYXBpLW5hbWVcIiBjb250ZW50PVwicHJvdmlkZXItbmFtZVwiPlxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAgICovXG4gIGdldE9wdGVkSW5TY29wZXNfKCkge1xuICAgIGNvbnN0IGFwaUtleU1hcCA9IHt9O1xuICAgIGNvbnN0IG9wdEluTWV0YSA9IHRoaXMuYW1wZG9jLmdldE1ldGFCeU5hbWUoR09PR0xFX0NJRF9BUElfTUVUQV9OQU1FKTtcbiAgICBpZiAob3B0SW5NZXRhKSB7XG4gICAgICBvcHRJbk1ldGEuc3BsaXQoJywnKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW0gPSBpdGVtLnRyaW0oKTtcbiAgICAgICAgaWYgKGl0ZW0uaW5kZXhPZignPScpID4gMCkge1xuICAgICAgICAgIGNvbnN0IHBhaXIgPSBpdGVtLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgY29uc3Qgc2NvcGUgPSBwYWlyWzBdLnRyaW0oKTtcbiAgICAgICAgICBhcGlLZXlNYXBbc2NvcGVdID0gcGFpclsxXS50cmltKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgY2xpZW50TmFtZSA9IGl0ZW07XG4gICAgICAgICAgY29uc3Qgc2NvcGUgPSBDSURfQVBJX1NDT1BFX0FMTE9XTElTVFtjbGllbnROYW1lXTtcbiAgICAgICAgICBpZiAoc2NvcGUpIHtcbiAgICAgICAgICAgIGFwaUtleU1hcFtzY29wZV0gPSBBUElfS0VZU1tjbGllbnROYW1lXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXNlcigpLndhcm4oXG4gICAgICAgICAgICAgIFRBR18sXG4gICAgICAgICAgICAgIGBVbnN1cHBvcnRlZCBjbGllbnQgZm9yIEdvb2dsZSBDSUQgQVBJOiAke2NsaWVudE5hbWV9LmAgK1xuICAgICAgICAgICAgICAgIGBQbGVhc2UgcmVtb3ZlIG9yIGNvcnJlY3QgbWV0YVtuYW1lPVwiJHtHT09HTEVfQ0lEX0FQSV9NRVRBX05BTUV9XCJdYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYXBpS2V5TWFwO1xuICB9XG59XG5cbi8qKlxuICogVXNlciB3aWxsIGJlIG9wdGVkIG91dCBvZiBDaWQgaXNzdWFuY2UgZm9yIGFsbCBzY29wZXMuXG4gKiBXaGVuIG9wdGVkLW91dCBDaWQgc2VydmljZSB3aWxsIHJlamVjdCBhbGwgYGdldGAgcmVxdWVzdHMuXG4gKlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHJldHVybiB7IVByb21pc2V9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdE91dE9mQ2lkKGFtcGRvYykge1xuICAvLyBUZWxsIHRoZSB2aWV3ZXIgdGhhdCB1c2VyIGhhcyBvcHRlZCBvdXQuXG4gIFNlcnZpY2VzLnZpZXdlckZvckRvYyhhbXBkb2MpLi8qT0sqLyBzZW5kTWVzc2FnZShcbiAgICBDSURfT1BUT1VUX1ZJRVdFUl9NRVNTQUdFLFxuICAgIGRpY3QoKVxuICApO1xuXG4gIC8vIFN0b3JlIHRoZSBvcHRvdXQgYml0IGluIHN0b3JhZ2VcbiAgcmV0dXJuIFNlcnZpY2VzLnN0b3JhZ2VGb3JEb2MoYW1wZG9jKS50aGVuKChzdG9yYWdlKSA9PiB7XG4gICAgcmV0dXJuIHN0b3JhZ2Uuc2V0KENJRF9PUFRPVVRfU1RPUkFHRV9LRVksIHRydWUpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHVzZXIgaGFzIG9wdGVkIG91dCBvZiBDaWQgaXNzdWFuY2UgZm9yIGFsbCBzY29wZXMuXG4gKlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHJldHVybiB7IVByb21pc2U8Ym9vbGVhbj59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzT3B0ZWRPdXRPZkNpZChhbXBkb2MpIHtcbiAgcmV0dXJuIFNlcnZpY2VzLnN0b3JhZ2VGb3JEb2MoYW1wZG9jKVxuICAgIC50aGVuKChzdG9yYWdlKSA9PiB7XG4gICAgICByZXR1cm4gc3RvcmFnZS5nZXQoQ0lEX09QVE9VVF9TVE9SQUdFX0tFWSkudGhlbigodmFsKSA9PiAhIXZhbCk7XG4gICAgfSlcbiAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgLy8gSWYgd2UgZmFpbCB0byByZWFkIHRoZSBmbGFnLCBhc3N1bWUgbm90IG9wdGVkIG91dC5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTZXRzIGEgbmV3IENJRCBjb29raWUgZm9yIGV4cGlyZSAxIHllYXIgZnJvbSBub3cuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmd9IHNjb3BlXG4gKiBAcGFyYW0ge3N0cmluZ30gY29va2llXG4gKi9cbmZ1bmN0aW9uIHNldENpZENvb2tpZSh3aW4sIHNjb3BlLCBjb29raWUpIHtcbiAgY29uc3QgZXhwaXJhdGlvbiA9IERhdGUubm93KCkgKyBCQVNFX0NJRF9NQVhfQUdFX01JTExJUztcbiAgc2V0Q29va2llKHdpbiwgc2NvcGUsIGNvb2tpZSwgZXhwaXJhdGlvbiwge1xuICAgIGhpZ2hlc3RBdmFpbGFibGVEb21haW46IHRydWUsXG4gIH0pO1xufVxuXG4vKipcbiAqIFNldHMgYSBuZXcgQ0lEIGJhY2t1cCBpbiBTdG9yYWdlXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gY29va2llTmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGNvb2tpZVxuICovXG5mdW5jdGlvbiBzZXRDaWRCYWNrdXAoYW1wZG9jLCBjb29raWVOYW1lLCBjb29raWUpIHtcbiAgU2VydmljZXMuc3RvcmFnZUZvckRvYyhhbXBkb2MpLnRoZW4oKHN0b3JhZ2UpID0+IHtcbiAgICBjb25zdCBpc1ZpZXdlclN0b3JhZ2UgPSBzdG9yYWdlLmlzVmlld2VyU3RvcmFnZSgpO1xuICAgIGlmICghaXNWaWV3ZXJTdG9yYWdlKSB7XG4gICAgICBjb25zdCBrZXkgPSBnZXRTdG9yYWdlS2V5KGNvb2tpZU5hbWUpO1xuICAgICAgc3RvcmFnZS5zZXROb25Cb29sZWFuKGtleSwgY29va2llKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb29raWVOYW1lXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldFN0b3JhZ2VLZXkoY29va2llTmFtZSkge1xuICByZXR1cm4gQ0lEX0JBQ0tVUF9TVE9SQUdFX0tFWSArIGNvb2tpZU5hbWU7XG59XG5cbi8qKlxuICogTWF5YmUgZ2V0cyB0aGUgQ0lEIGZyb20gY29va2llIG9yLCBpZiBhbGxvd2VkLCBnZXRzIGJhY2t1cCBDSURcbiAqIGZyb20gU3RvcmFnZS5cbiAqIEBwYXJhbSB7IUNpZH0gY2lkXG4gKiBAcGFyYW0geyFHZXRDaWREZWZ9IGdldENpZFN0cnVjdFxuICogQHJldHVybiB7IVByb21pc2U8P3N0cmluZz59XG4gKi9cbmZ1bmN0aW9uIG1heWJlR2V0Q2lkRnJvbUNvb2tpZU9yQmFja3VwKGNpZCwgZ2V0Q2lkU3RydWN0KSB7XG4gIGNvbnN0IHthbXBkb2MsIGlzQmFja3VwQ2lkRXhwT259ID0gY2lkO1xuICBjb25zdCB7d2lufSA9IGFtcGRvYztcbiAgY29uc3Qge2Rpc2FibGVCYWNrdXAsIHNjb3BlfSA9IGdldENpZFN0cnVjdDtcbiAgY29uc3QgY29va2llTmFtZSA9IGdldENpZFN0cnVjdC5jb29raWVOYW1lIHx8IHNjb3BlO1xuICBjb25zdCBleGlzdGluZ0Nvb2tpZSA9IGdldENvb2tpZSh3aW4sIGNvb2tpZU5hbWUpO1xuXG4gIGlmIChleGlzdGluZ0Nvb2tpZSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZXhpc3RpbmdDb29raWUpO1xuICB9XG4gIGlmIChpc0JhY2t1cENpZEV4cE9uICYmICFkaXNhYmxlQmFja3VwKSB7XG4gICAgcmV0dXJuIFNlcnZpY2VzLnN0b3JhZ2VGb3JEb2MoYW1wZG9jKVxuICAgICAgLnRoZW4oKHN0b3JhZ2UpID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0U3RvcmFnZUtleShjb29raWVOYW1lKTtcbiAgICAgICAgcmV0dXJuIHN0b3JhZ2UuZ2V0KGtleSwgQkFTRV9DSURfTUFYX0FHRV9NSUxMSVMpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChiYWNrdXBDaWQpID0+IHtcbiAgICAgICAgaWYgKCFiYWNrdXBDaWQgfHwgdHlwZW9mIGJhY2t1cENpZCAhPSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYWNrdXBDaWQ7XG4gICAgICB9KTtcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xufVxuXG4vKipcbiAqIElmIGNvb2tpZSBleGlzdHMgaXQncyByZXR1cm5lZCBpbW1lZGlhdGVseS4gT3RoZXJ3aXNlLCBpZiBpbnN0cnVjdGVkLCB0aGVcbiAqIG5ldyBjb29raWUgaXMgY3JlYXRlZC5cbiAqIEBwYXJhbSB7IUNpZH0gY2lkXG4gKiBAcGFyYW0geyFHZXRDaWREZWZ9IGdldENpZFN0cnVjdFxuICogQHBhcmFtIHshUHJvbWlzZX0gcGVyc2lzdGVuY2VDb25zZW50XG4gKiBAcmV0dXJuIHshUHJvbWlzZTw/c3RyaW5nPn1cbiAqL1xuZnVuY3Rpb24gZ2V0T3JDcmVhdGVDb29raWUoY2lkLCBnZXRDaWRTdHJ1Y3QsIHBlcnNpc3RlbmNlQ29uc2VudCkge1xuICBjb25zdCB7YW1wZG9jLCBpc0JhY2t1cENpZEV4cE9ufSA9IGNpZDtcbiAgY29uc3Qge3dpbn0gPSBhbXBkb2M7XG4gIGNvbnN0IHtkaXNhYmxlQmFja3VwLCBzY29wZX0gPSBnZXRDaWRTdHJ1Y3Q7XG4gIGNvbnN0IGNvb2tpZU5hbWUgPSBnZXRDaWRTdHJ1Y3QuY29va2llTmFtZSB8fCBzY29wZTtcblxuICByZXR1cm4gbWF5YmVHZXRDaWRGcm9tQ29va2llT3JCYWNrdXAoY2lkLCBnZXRDaWRTdHJ1Y3QpLnRoZW4oXG4gICAgKGV4aXN0aW5nQ29va2llKSA9PiB7XG4gICAgICBpZiAoIWV4aXN0aW5nQ29va2llICYmICFnZXRDaWRTdHJ1Y3QuY3JlYXRlQ29va2llSWZOb3RQcmVzZW50KSB7XG4gICAgICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPD9zdHJpbmc+fSAqLyAoUHJvbWlzZS5yZXNvbHZlKG51bGwpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4aXN0aW5nQ29va2llKSB7XG4gICAgICAgIC8vIElmIHdlIGNyZWF0ZWQgdGhlIGNvb2tpZSwgdXBkYXRlIGl0J3MgZXhwaXJhdGlvbiB0aW1lLlxuICAgICAgICBpZiAoL15hbXAtLy50ZXN0KGV4aXN0aW5nQ29va2llKSkge1xuICAgICAgICAgIHNldENpZENvb2tpZSh3aW4sIGNvb2tpZU5hbWUsIGV4aXN0aW5nQ29va2llKTtcbiAgICAgICAgICBpZiAoaXNCYWNrdXBDaWRFeHBPbiAmJiAhZGlzYWJsZUJhY2t1cCkge1xuICAgICAgICAgICAgc2V0Q2lkQmFja3VwKGFtcGRvYywgY29va2llTmFtZSwgZXhpc3RpbmdDb29raWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTw/c3RyaW5nPn0gKi8gKFxuICAgICAgICAgIFByb21pc2UucmVzb2x2ZShleGlzdGluZ0Nvb2tpZSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNpZC5leHRlcm5hbENpZENhY2hlX1tzY29wZV0pIHtcbiAgICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8P3N0cmluZz59ICovIChjaWQuZXh0ZXJuYWxDaWRDYWNoZV9bc2NvcGVdKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3Q29va2llUHJvbWlzZSA9IGdldFJhbmRvbVN0cmluZzY0KHdpbilcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBjb29raWUsIGFsd2F5cyBwcmVmaXhlZCB3aXRoIFwiYW1wLVwiLCBzbyB0aGF0IHdlIGNhbiBzZWUgZnJvbVxuICAgICAgICAvLyB0aGUgdmFsdWUgd2hldGhlciB3ZSBjcmVhdGVkIGl0LlxuICAgICAgICAudGhlbigocmFuZG9tU3RyKSA9PiAnYW1wLScgKyByYW5kb21TdHIpO1xuXG4gICAgICAvLyBTdG9yZSBpdCBhcyBhIGNvb2tpZSBiYXNlZCBvbiB0aGUgcGVyc2lzdGVuY2UgY29uc2VudC5cbiAgICAgIFByb21pc2UuYWxsKFtuZXdDb29raWVQcm9taXNlLCBwZXJzaXN0ZW5jZUNvbnNlbnRdKS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgIC8vIFRoZSBpbml0aWFsIENJRCBnZW5lcmF0aW9uIGlzIGluaGVyZW50bHkgcmFjeS4gRmlyc3Qgb25lIHRoYXQgZ2V0c1xuICAgICAgICAvLyBjb25zZW50IHdpbnMuXG4gICAgICAgIGNvbnN0IG5ld0Nvb2tpZSA9IHJlc3VsdHNbMF07XG4gICAgICAgIGNvbnN0IHJlbG9va3VwID0gZ2V0Q29va2llKHdpbiwgY29va2llTmFtZSk7XG4gICAgICAgIGlmICghcmVsb29rdXApIHtcbiAgICAgICAgICBzZXRDaWRDb29raWUod2luLCBjb29raWVOYW1lLCBuZXdDb29raWUpO1xuICAgICAgICAgIGlmIChpc0JhY2t1cENpZEV4cE9uICYmICFkaXNhYmxlQmFja3VwKSB7XG4gICAgICAgICAgICBzZXRDaWRCYWNrdXAoYW1wZG9jLCBjb29raWVOYW1lLCBuZXdDb29raWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gKGNpZC5leHRlcm5hbENpZENhY2hlX1tzY29wZV0gPSBuZXdDb29raWVQcm9taXNlKTtcbiAgICB9XG4gICk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc291cmNlIG9yaWdpbiBvZiBhbiBBTVAgZG9jdW1lbnQgZm9yIGRvY3VtZW50cyBzZXJ2ZWRcbiAqIG9uIGEgcHJveHkgb3JpZ2luLiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGRvYyBpcyBub3Qgb24gYSBwcm94eSBvcmlnaW4uXG4gKiBAcGFyYW0geyFMb2NhdGlvbn0gdXJsIFVSTCBvZiBhbiBBTVAgZG9jdW1lbnQuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzb3VyY2Ugb3JpZ2luIG9mIHRoZSBVUkwuXG4gKiBAdmlzaWJsZUZvclRlc3RpbmcgQlVUIGlmIHRoaXMgaXMgbmVlZGVkIGVsc2V3aGVyZSBpdCBjb3VsZCBiZVxuICogICAgIGZhY3RvcmVkIGludG8gaXRzIG93biBwYWNrYWdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJveHlTb3VyY2VPcmlnaW4odXJsKSB7XG4gIHVzZXJBc3NlcnQoaXNQcm94eU9yaWdpbih1cmwpLCAnRXhwZWN0ZWQgcHJveHkgb3JpZ2luICVzJywgdXJsLm9yaWdpbik7XG4gIHJldHVybiBnZXRTb3VyY2VPcmlnaW4odXJsKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiYXNlIGNpZCBmb3IgdGhlIGN1cnJlbnQgdXNlcigpLiBUaGlzIHN0cmluZyBtdXN0IG5vdFxuICogYmUgZXhwb3NlZCB0byB1c2VycyB3aXRob3V0IGhhc2hpbmcgd2l0aCB0aGUgY3VycmVudCBzb3VyY2Ugb3JpZ2luXG4gKiBhbmQgdGhlIGV4dGVybmFsQ2lkU2NvcGUuXG4gKiBPbiBhIHByb3h5IHRoaXMgdmFsdWUgaXMgdGhlIHNhbWUgZm9yIGEgdXNlciBhY3Jvc3MgYWxsIHNvdXJjZVxuICogb3JpZ2lucy5cbiAqIEBwYXJhbSB7IUNpZH0gY2lkXG4gKiBAcGFyYW0geyFQcm9taXNlfSBwZXJzaXN0ZW5jZUNvbnNlbnRcbiAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59XG4gKi9cbmZ1bmN0aW9uIGdldEJhc2VDaWQoY2lkLCBwZXJzaXN0ZW5jZUNvbnNlbnQpIHtcbiAgaWYgKGNpZC5iYXNlQ2lkXykge1xuICAgIHJldHVybiBjaWQuYmFzZUNpZF87XG4gIH1cbiAgY29uc3Qge3dpbn0gPSBjaWQuYW1wZG9jO1xuXG4gIHJldHVybiAoY2lkLmJhc2VDaWRfID0gcmVhZChjaWQuYW1wZG9jKS50aGVuKChzdG9yZWQpID0+IHtcbiAgICBsZXQgbmVlZHNUb1N0b3JlID0gZmFsc2U7XG4gICAgbGV0IGJhc2VDaWQ7XG5cbiAgICAvLyBTZWUgaWYgd2UgaGF2ZSBhIHN0b3JlZCBiYXNlIGNpZCBhbmQgd2hldGhlciBpdCBpcyBzdGlsbCB2YWxpZFxuICAgIC8vIGluIHRlcm1zIG9mIGV4cGlyYXRpb24uXG4gICAgaWYgKHN0b3JlZCAmJiAhaXNFeHBpcmVkKHN0b3JlZCkpIHtcbiAgICAgIGJhc2VDaWQgPSBQcm9taXNlLnJlc29sdmUoc3RvcmVkLmNpZCk7XG4gICAgICBpZiAoc2hvdWxkVXBkYXRlU3RvcmVkVGltZShzdG9yZWQpKSB7XG4gICAgICAgIG5lZWRzVG9TdG9yZSA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIG5lZWQgdG8gbWFrZSBhIG5ldyBvbmUuXG4gICAgICBiYXNlQ2lkID0gU2VydmljZXMuY3J5cHRvRm9yKHdpbikuc2hhMzg0QmFzZTY0KGdldEVudHJvcHkod2luKSk7XG4gICAgICBuZWVkc1RvU3RvcmUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChuZWVkc1RvU3RvcmUpIHtcbiAgICAgIGJhc2VDaWQudGhlbigoYmFzZUNpZCkgPT4ge1xuICAgICAgICBzdG9yZShjaWQuYW1wZG9jLCBwZXJzaXN0ZW5jZUNvbnNlbnQsIGJhc2VDaWQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhc2VDaWQ7XG4gIH0pKTtcbn1cblxuLyoqXG4gKiBTdG9yZXMgYSBuZXcgY2lkU3RyaW5nIGluIGxvY2FsU3RvcmFnZS4gQWRkcyB0aGUgY3VycmVudCB0aW1lIHRvIHRoZVxuICogc3RvcmVkIHZhbHVlLlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHBhcmFtIHshUHJvbWlzZX0gcGVyc2lzdGVuY2VDb25zZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gY2lkU3RyaW5nIEFjdHVhbCBjaWQgc3RyaW5nIHRvIHN0b3JlLlxuICovXG5mdW5jdGlvbiBzdG9yZShhbXBkb2MsIHBlcnNpc3RlbmNlQ29uc2VudCwgY2lkU3RyaW5nKSB7XG4gIGNvbnN0IHt3aW59ID0gYW1wZG9jO1xuICBpZiAoaXNJZnJhbWVkKHdpbikpIHtcbiAgICAvLyBJZiB3ZSBhcmUgYmVpbmcgZW1iZWRkZWQsIHRyeSB0byBzYXZlIHRoZSBiYXNlIGNpZCB0byB0aGUgdmlld2VyLlxuICAgIHZpZXdlckJhc2VDaWQoYW1wZG9jLCBjcmVhdGVDaWREYXRhKGNpZFN0cmluZykpO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIHVzZSBsb2NhbCBzdG9yYWdlLCB3ZSBuZWVkIHVzZXIncyBjb25zZW50LlxuICAgIHBlcnNpc3RlbmNlQ29uc2VudC50aGVuKCgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHdpbi5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYW1wLWNpZCcsIGNyZWF0ZUNpZERhdGEoY2lkU3RyaW5nKSk7XG4gICAgICB9IGNhdGNoIChpZ25vcmUpIHtcbiAgICAgICAgLy8gU2V0dGluZyBsb2NhbFN0b3JhZ2UgbWF5IGZhaWwuIEluIHByYWN0aWNlIHdlIGRvbid0IGV4cGVjdCB0aGF0IHRvXG4gICAgICAgIC8vIGhhcHBlbiBhIGxvdCAoc2luY2Ugd2UgZG9uJ3QgZ28gYW55d2hlcmUgbmVhciB0aGUgcXVvdGEsIGJ1dFxuICAgICAgICAvLyBpbiBwYXJ0aWN1bGFyIGluIFNhZmFyaSBwcml2YXRlIGJyb3dzaW5nIG1vZGUgaXQgYWx3YXlzIGZhaWxzLlxuICAgICAgICAvLyBJbiB0aGF0IGNhc2Ugd2UganVzdCBkb24ndCBzdG9yZSBhbnl0aGluZywgd2hpY2ggaXMganVzdCBmaW5lLlxuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogR2V0L3NldCB0aGUgQmFzZSBDSUQgZnJvbS90byB0aGUgdmlld2VyLlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfZGF0YSBTdHJpbmdpZmllZCBKU09OIG9iamVjdCB7Y2lkLCB0aW1lfS5cbiAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZ3x1bmRlZmluZWQ+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmlld2VyQmFzZUNpZChhbXBkb2MsIG9wdF9kYXRhKSB7XG4gIGNvbnN0IHZpZXdlciA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhhbXBkb2MpO1xuICByZXR1cm4gdmlld2VyLmlzVHJ1c3RlZFZpZXdlcigpLnRoZW4oKHRydXN0ZWQpID0+IHtcbiAgICBpZiAoIXRydXN0ZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIFRPRE8obGFubmthLCAjMTEwNjApOiBjbGVhbiB1cCB3aGVuIGFsbCBWaWV3ZXJzIGdldCBtaWdyYXRlZFxuICAgIGRldigpLmV4cGVjdGVkRXJyb3IoJ0NJRCcsICdWaWV3ZXIgZG9lcyBub3QgcHJvdmlkZSBjYXA9Y2lkJyk7XG4gICAgcmV0dXJuIHZpZXdlci5zZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UoJ2NpZCcsIG9wdF9kYXRhKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAvLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eTogIzQwMjlcbiAgICAgIGlmIChkYXRhICYmICF0cnlQYXJzZUpzb24oZGF0YSkpIHtcbiAgICAgICAgLy8gVE9ETyhsYW5ua2EsICMxMTA2MCk6IGNsZWFuIHVwIHdoZW4gYWxsIFZpZXdlcnMgZ2V0IG1pZ3JhdGVkXG4gICAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoJ0NJRCcsICdpbnZhbGlkIGNpZCBmb3JtYXQnKTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgIGRpY3Qoe1xuICAgICAgICAgICAgJ3RpbWUnOiBEYXRlLm5vdygpLCAvLyBDSUQgcmV0dXJuZWQgZnJvbSBvbGQgQVBJIGlzIGFsd2F5cyBmcmVzaFxuICAgICAgICAgICAgJ2NpZCc6IGRhdGEsXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgSlNPTiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgZ2l2ZW4gQ0lEIGFuZCB0aGUgY3VycmVudCB0aW1lIGFzXG4gKiBhIHRpbWVzdGFtcC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjaWRTdHJpbmdcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2lkRGF0YShjaWRTdHJpbmcpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFxuICAgIGRpY3Qoe1xuICAgICAgJ3RpbWUnOiBEYXRlLm5vdygpLFxuICAgICAgJ2NpZCc6IGNpZFN0cmluZyxcbiAgICB9KVxuICApO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHBlcnNpc3RlZCBDSUQgZGF0YSBhcyBhIHByb21pc2UuIEl0IHRyaWVzIHRvIHJlYWQgZnJvbVxuICogbG9jYWxTdG9yYWdlIGZpcnN0IHRoZW4gZnJvbSB2aWV3ZXIgaWYgaXQgaXMgaW4gZW1iZWRkZWQgbW9kZS5cbiAqIFJldHVybnMgbnVsbCBpZiBub25lIHdhcyBmb3VuZC5cbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEByZXR1cm4geyFQcm9taXNlPD9CYXNlQ2lkSW5mb0RlZj59XG4gKi9cbmZ1bmN0aW9uIHJlYWQoYW1wZG9jKSB7XG4gIGNvbnN0IHt3aW59ID0gYW1wZG9jO1xuICBsZXQgZGF0YTtcbiAgdHJ5IHtcbiAgICBkYXRhID0gd2luLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhbXAtY2lkJyk7XG4gIH0gY2F0Y2ggKGlnbm9yZSkge1xuICAgIC8vIElmIHJlYWRpbmcgZnJvbSBsb2NhbFN0b3JhZ2UgZmFpbHMsIHdlIGFzc3VtZSBpdCBpcyBlbXB0eS5cbiAgfVxuICBsZXQgZGF0YVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoZGF0YSk7XG4gIGlmICghZGF0YSAmJiBpc0lmcmFtZWQod2luKSkge1xuICAgIC8vIElmIHdlIGFyZSBiZWluZyBlbWJlZGRlZCwgdHJ5IHRvIGdldCB0aGUgYmFzZSBjaWQgZnJvbSB0aGUgdmlld2VyLlxuICAgIGRhdGFQcm9taXNlID0gdmlld2VyQmFzZUNpZChhbXBkb2MpO1xuICB9XG4gIHJldHVybiBkYXRhUHJvbWlzZS50aGVuKChkYXRhKSA9PiB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgaXRlbSA9IHBhcnNlSnNvbihkYXRhKTtcbiAgICByZXR1cm4ge1xuICAgICAgdGltZTogaXRlbVsndGltZSddLFxuICAgICAgY2lkOiBpdGVtWydjaWQnXSxcbiAgICB9O1xuICB9KTtcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRoZSByZXRyaWV2ZWQgY2lkIG9iamVjdCBpcyBleHBpcmVkIGFuZCBzaG91bGQgYmUgaWdub3JlZC5cbiAqIEBwYXJhbSB7IUJhc2VDaWRJbmZvRGVmfSBzdG9yZWRDaWRJbmZvXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0V4cGlyZWQoc3RvcmVkQ2lkSW5mbykge1xuICBjb25zdCBjcmVhdGVkVGltZSA9IHN0b3JlZENpZEluZm8udGltZTtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgcmV0dXJuIGNyZWF0ZWRUaW1lICsgQkFTRV9DSURfTUFYX0FHRV9NSUxMSVMgPCBub3c7XG59XG5cbi8qKlxuICogV2hldGhlciB3ZSBzaG91bGQgd3JpdGUgYSBuZXcgdGltZXN0YW1wIHRvIHRoZSBzdG9yZWQgY2lkIHZhbHVlLlxuICogV2Ugc2F5IHllcyBpZiBpdCBpcyBvbGRlciB0aGFuIDEgZGF5LCBzbyB3ZSBvbmx5IGRvIHRoaXMgbWF4IG9uY2VcbiAqIHBlciBkYXkgdG8gYXZvaWQgd3JpdGluZyB0byBsb2NhbFN0b3JhZ2UgYWxsIHRoZSB0aW1lLlxuICogQHBhcmFtIHshQmFzZUNpZEluZm9EZWZ9IHN0b3JlZENpZEluZm9cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIHNob3VsZFVwZGF0ZVN0b3JlZFRpbWUoc3RvcmVkQ2lkSW5mbykge1xuICBjb25zdCBjcmVhdGVkVGltZSA9IHN0b3JlZENpZEluZm8udGltZTtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgcmV0dXJuIGNyZWF0ZWRUaW1lICsgT05FX0RBWV9NSUxMSVMgPCBub3c7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSB3aXRoIGEgdG90YWwgb2YgMTI4IG9mIHJhbmRvbSB2YWx1ZXMgYmFzZWQgb24gdGhlXG4gKiBgd2luLmNyeXB0by5nZXRSYW5kb21WYWx1ZXNgIEFQSS4gSWYgdGhhdCBpcyBub3QgYXZhaWxhYmxlIGNvbmNhdGVuYXRlc1xuICogYSBzdHJpbmcgb2Ygb3RoZXIgdmFsdWVzIHRoYXQgbWlnaHQgYmUgaGFyZCB0byBndWVzcyBpbmNsdWRpbmdcbiAqIGBNYXRoLnJhbmRvbWAgYW5kIHRoZSBjdXJyZW50IHRpbWUuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IVVpbnQ4QXJyYXl8c3RyaW5nfSBFbnRyb3B5LlxuICovXG5mdW5jdGlvbiBnZXRFbnRyb3B5KHdpbikge1xuICAvLyBVc2Ugd2luLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMgdG8gZ2V0IDEyOCBiaXRzIG9mIHJhbmRvbSB2YWx1ZVxuICBjb25zdCB1aW50OGFycmF5ID0gZ2V0Q3J5cHRvUmFuZG9tQnl0ZXNBcnJheSh3aW4sIDE2KTsgLy8gMTI4IGJpdFxuICBpZiAodWludDhhcnJheSkge1xuICAgIHJldHVybiB1aW50OGFycmF5O1xuICB9XG5cbiAgLy8gU3VwcG9ydCBmb3IgbGVnYWN5IGJyb3dzZXJzLlxuICByZXR1cm4gU3RyaW5nKFxuICAgIHdpbi5sb2NhdGlvbi5ocmVmICtcbiAgICAgIERhdGUubm93KCkgK1xuICAgICAgd2luLk1hdGgucmFuZG9tKCkgK1xuICAgICAgd2luLnNjcmVlbi53aWR0aCArXG4gICAgICB3aW4uc2NyZWVuLmhlaWdodFxuICApO1xufVxuXG4vKipcbiAqIFByb2R1Y2VzIGFuIGV4dGVybmFsIENJRCBmb3IgdXNlIGluIGEgY29va2llLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59IFRoZSBjaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbVN0cmluZzY0KHdpbikge1xuICBjb25zdCBlbnRyb3B5ID0gZ2V0RW50cm9weSh3aW4pO1xuICBpZiAodHlwZW9mIGVudHJvcHkgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gU2VydmljZXMuY3J5cHRvRm9yKHdpbikuc2hhMzg0QmFzZTY0KGVudHJvcHkpO1xuICB9IGVsc2Uge1xuICAgIC8vIElmIG91ciBlbnRyb3B5IGlzIGEgcHVyZSByYW5kb20gbnVtYmVyLCB3ZSBjYW4ganVzdCBkaXJlY3RseSB0dXJuIGl0XG4gICAgLy8gaW50byBiYXNlIDY0XG4gICAgY29uc3QgY2FzdCA9IC8qKiBAdHlwZSB7IVVpbnQ4QXJyYXl9ICovIChlbnRyb3B5KTtcbiAgICByZXR1cm4gdHJ5UmVzb2x2ZSgoKSA9PlxuICAgICAgYmFzZTY0VXJsRW5jb2RlRnJvbUJ5dGVzKGNhc3QpXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBwYWRkaW5nXG4gICAgICAgIC5yZXBsYWNlKC9cXC4rJC8sICcnKVxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxDaWRTZXJ2aWNlKGFtcGRvYykge1xuICByZXR1cm4gcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhhbXBkb2MsICdjaWQnLCBDaWQpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEByZXR1cm4geyFDaWR9XG4gKiBAcHJpdmF0ZSB2aXNpYmxlIGZvciB0ZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaWRTZXJ2aWNlRm9yRG9jRm9yVGVzdGluZyhhbXBkb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhhbXBkb2MsICdjaWQnLCBDaWQpO1xuICByZXR1cm4gZ2V0U2VydmljZUZvckRvYyhhbXBkb2MsICdjaWQnKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/cid-impl.js