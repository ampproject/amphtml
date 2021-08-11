function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import { Services } from "../../../src/service";
import { dev, user } from "../../../src/log";
import {
getServicePromiseForDoc,
registerServiceBuilderForDoc } from "../../../src/service-helpers";

import { hasOwn, map } from "../../../src/core/types/object";
import { isDocumentHidden } from "../../../src/core/document-visibility";
import { isObject } from "../../../src/core/types";
import { listen } from "../../../src/event-helper";

/** @const {string} */
var TAG = 'amp-analytics/session-manager';

/** @const {string} */
var SESSION_STORAGE_KEY = 'amp-session:';

/**
 * We ignore Sessions that are older than 30 minutes.
 */
export var SESSION_MAX_AGE_MILLIS = 30 * 60 * 1000;

/**
 * Key values for retriving/storing session values
 * @enum {string}
 */
export var SESSION_VALUES = {
  SESSION_ID: 'sessionId',
  CREATION_TIMESTAMP: 'creationTimestamp',
  ACCESS_TIMESTAMP: 'accessTimestamp',
  ENGAGED: 'engaged',
  EVENT_TIMESTAMP: 'eventTimestamp',
  COUNT: 'count' };


/**
 * Even though our LocalStorage implementation already has a
 * mechanism that handles removing expired values, we keep it
 * in memory so that we don't have to read the value everytime.
 * @typedef {{
 *  sessionId: number,
 *  creationTimestamp: number,
 *  accessTimestamp: number,
 *  engaged: boolean,
 *  eventTimestamp: number,
 *  count: number,
 * }}
 */
export var SessionInfoDef;

/**
 * @implements {../../../src/service.Disposable}
 */
export var SessionManager = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function SessionManager(ampdoc) {_classCallCheck(this, SessionManager);
    /** @private {!Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForDoc(ampdoc);

    /** @private {!Object<string, ?SessionInfoDef>} */
    this.sessions_ = map();

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!Window} */
    this.win_ = ampdoc.win;

    /** @private {!Array<!UnlistenDef>} */
    this.unlisteners_ = [];

    /** @private {?boolean} */
    this.isFocused_ = null;

    /** @private {?boolean} */
    this.isVisible_ = null;

    /** @private {boolean} */
    this.isOpen_ = true;

    this.init_();
  }

  /**
   * Install event listeners for engaged singals.
   * `amp-analytics` waits for ampdoc to be visible first.
   */_createClass(SessionManager, [{ key: "init_", value:
    function init_() {var _this = this;
      this.setInitialEngagedSignals_();
      this.unlisteners_.push(
      listen(this.win_, 'focus', function () {
        _this.isFocused_ = true;
        _this.updateEngagedForSessions_();
      }),
      listen(this.win_, 'blur', function () {
        _this.isFocused_ = false;
        _this.updateEngagedForSessions_();
      }),
      listen(this.win_, 'pageshow', function () {
        _this.isOpen_ = true;
        _this.updateEngagedForSessions_();
      }),
      listen(this.win_, 'pagehide', function () {
        _this.isOpen_ = false;
        _this.updateEngagedForSessions_();
      }),
      this.ampdoc_.onVisibilityChanged(function () {
        _this.isVisible_ = _this.ampdoc_.isVisible();
        _this.updateEngagedForSessions_();
      }));

    }

    /** Sets the initial states of the engaged signals used for all sessions. */ }, { key: "setInitialEngagedSignals_", value:
    function setInitialEngagedSignals_() {
      this.isFocused_ = this.win_.document.hasFocus();
      this.isVisible_ = !isDocumentHidden(this.win_.document);
    }

    /** Sets the engaged session value for all sessions and persists. */ }, { key: "updateEngagedForSessions_", value:
    function updateEngagedForSessions_() {var _this2 = this;
      Object.keys(this.sessions_).forEach(function (key) {
        var session = _this2.sessions_[key];
        session[SESSION_VALUES.ENGAGED] = _this2.getEngagedValue_();
        _this2.setSession_(key, session);
      });
    }

    /** @override */ }, { key: "dispose", value:
    function dispose() {
      this.unlisteners_.forEach(function (unlisten) {
        unlisten();
      });
      this.unlisteners_.length = 0;
    }

    /**
     * Get the value from the session per the vendor.
     * @param {string|undefined} type
     * @param {SESSION_VALUES} value
     * @return {!Promise<number|undefined>}
     */ }, { key: "getSessionValue", value:
    function getSessionValue(type, value) {
      return this.get(type).then(function (session) {return (session === null || session === void 0) ? (void 0) : session[value];});
    }

    /**
     * Updates EventTimestamp for this session,
     * asynchronously as a callback to avoid duplicate writing,
     * when the session is retrieved or created.
     * @param {string} type
     * @return {!Promise}
     */ }, { key: "updateEvent", value:
    function updateEvent(type) {
      return this.get(type, function (session) {
        session[SESSION_VALUES.EVENT_TIMESTAMP] = Date.now();
      });
    }

    /**
     * Get the session for the vendor, checking if it exists or
     * creating it if necessary.
     * @param {string|undefined} type
     * @param {Function=} opt_processing
     * @return {!Promise<?SessionInfoDef>}
     */ }, { key: "get", value:
    function get(type, opt_processing) {
      if (!type) {
        user().error(TAG, 'Sessions can only be accessed with a vendor type.');
        return Promise.resolve(null);
      }

      if (
      hasOwn(this.sessions_, type) &&
      !isSessionExpired(this.sessions_[type]))
      {
        this.sessions_[type] = this.updateSession_(this.sessions_[type]);
        (opt_processing === null || opt_processing === void 0) ? (void 0) : opt_processing(this.sessions_[type]);
        this.setSession_(type, this.sessions_[type]);
        return Promise.resolve(this.sessions_[type]);
      }

      return this.getOrCreateSession_(type, opt_processing);
    }

    /**
     * Get our session if it exists or creates it. Sets the session
     * in localStorage to update the access time.
     * @param {string} type
     * @param {Function=} opt_processing
     * @return {!Promise<SessionInfoDef>}
     */ }, { key: "getOrCreateSession_", value:
    function getOrCreateSession_(type, opt_processing) {var _this3 = this;
      return this.storagePromise_.
      then(function (storage) {
        var storageKey = getStorageKey(type);
        return storage.get(storageKey);
      }).
      then(function (session) {
        // Either create session or update it
        return !session ?
        constructSessionInfo(_this3.getEngagedValue_()) :
        _this3.updateSession_(constructSessionFromStoredValue(session), true);
      }).
      then(function (session) {
        // Avoid multiple session creation race
        if (type in _this3.sessions_ && !isSessionExpired(_this3.sessions_[type])) {
          return _this3.sessions_[type];
        }
        (opt_processing === null || opt_processing === void 0) ? (void 0) : opt_processing(session);
        _this3.setSession_(type, session);
        _this3.sessions_[type] = session;
        return _this3.sessions_[type];
      });
    }

    /**
     * Check if session has expired and reset/update values (id, count) if so.
     * Also update `accessTimestamp`.
     * Sets the initial engaged singals if this session is a continuation and
     * was not debounced.
     * @param {!SessionInfoDef} session
     * @param {boolean=} opt_usePersistedEngaged
     * @return {!SessionInfoDef}
     */ }, { key: "updateSession_", value:
    function updateSession_(session, opt_usePersistedEngaged) {
      var currentCount = session[SESSION_VALUES.COUNT];
      var now = Date.now();
      if (isSessionExpired(session)) {
        var newSessionCount = (currentCount !== null && currentCount !== void 0 ? currentCount : 0) + 1;
        session = constructSessionInfo(this.getEngagedValue_(), newSessionCount);
      } else {
        var previouslyEngaged =
        opt_usePersistedEngaged && session[SESSION_VALUES.ENGAGED];
        // Use the persisted engaged value if it was `true`,
        // to signal that this was not a debounced session.
        session[SESSION_VALUES.ENGAGED] =
        previouslyEngaged || this.getEngagedValue_();
        // Set the initial engaged signals to true (since it's not debounced)
        if (previouslyEngaged) {
          this.isFocused_ = true;
          this.isOpen_ = true;
          this.isVisible_ = true;
        }
      }
      session[SESSION_VALUES.ACCESS_TIMESTAMP] = now;
      return session;
    }

    /** Gets the most recent engaged value */ }, { key: "getEngagedValue_", value:
    function getEngagedValue_() {
      return this.isOpen_ && this.isVisible_ && this.isFocused_;
    }

    /**
     * Set the session in localStorage, updating
     * its access time if it did not exist before.
     * @param {string} type
     * @param {SessionInfoDef} session
     * @return {!Promise}
     */ }, { key: "setSession_", value:
    function setSession_(type, session) {
      return this.storagePromise_.then(function (storage) {
        var storageKey = getStorageKey(type);
        storage.setNonBoolean(storageKey, session);
      });
    } }]);return SessionManager;}();


/**
 * Checks if a session has expired
 * @param {SessionInfoDef} session
 * @return {boolean}
 */
function isSessionExpired(session) {
  var accessTimestamp = session[SESSION_VALUES.ACCESS_TIMESTAMP];
  return accessTimestamp + SESSION_MAX_AGE_MILLIS < Date.now();
}

/**
 * Return a pseudorandom low entropy value for session id.
 * @return {number}
 */
function generateSessionId() {
  return Math.round(10000 * Math.random());
}

/**
 * @param {string} type
 * @return {string}
 */
function getStorageKey(type) {
  return SESSION_STORAGE_KEY + type;
}

/**
 * @param {*} storedSession
 * @return {SessionInfoDef}
 */
function constructSessionFromStoredValue(storedSession) {var _storedSession$SESSIO, _ref;
  if (!isObject(storedSession)) {
    dev().error(TAG, 'Invalid stored session value');
    return constructSessionInfo();
  }

  return _ref = {}, _defineProperty(_ref,
  SESSION_VALUES.SESSION_ID, storedSession[SESSION_VALUES.SESSION_ID]), _defineProperty(_ref,
  SESSION_VALUES.CREATION_TIMESTAMP,
  storedSession[SESSION_VALUES.CREATION_TIMESTAMP]), _defineProperty(_ref,
  SESSION_VALUES.COUNT, storedSession[SESSION_VALUES.COUNT]), _defineProperty(_ref,
  SESSION_VALUES.ACCESS_TIMESTAMP,
  storedSession[SESSION_VALUES.ACCESS_TIMESTAMP]), _defineProperty(_ref,
  SESSION_VALUES.EVENT_TIMESTAMP,
  storedSession[SESSION_VALUES.EVENT_TIMESTAMP]), _defineProperty(_ref,
  SESSION_VALUES.ENGAGED, (_storedSession$SESSIO = storedSession[SESSION_VALUES.ENGAGED]) !== null && _storedSession$SESSIO !== void 0 ? _storedSession$SESSIO : true), _ref;

}

/**
 * Constructs a new SessionInfoDef object
 * @param {boolean} engaged
 * @param {number=} count
 * @return {!SessionInfoDef}
 */
function constructSessionInfo(engaged) {var _ref2;var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return _ref2 = {}, _defineProperty(_ref2,
  SESSION_VALUES.SESSION_ID, generateSessionId()), _defineProperty(_ref2,
  SESSION_VALUES.CREATION_TIMESTAMP, Date.now()), _defineProperty(_ref2,
  SESSION_VALUES.ACCESS_TIMESTAMP, Date.now()), _defineProperty(_ref2,
  SESSION_VALUES.COUNT, count), _defineProperty(_ref2,
  SESSION_VALUES.EVENT_TIMESTAMP, undefined), _defineProperty(_ref2,
  SESSION_VALUES.ENGAGED, engaged), _ref2;

}

/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<!SessionManager>}
 */
export function sessionServicePromiseForDoc(elementOrAmpDoc) {
  return (/** @type {!Promise<!SessionManager>} */(
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-session')));

}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installSessionServiceForTesting(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'amp-analytics-session', SessionManager);
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/session-manager.js