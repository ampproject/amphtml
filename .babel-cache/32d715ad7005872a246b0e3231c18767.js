function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { getServicePromiseForDoc, registerServiceBuilderForDoc } from "../../../src/service-helpers";
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
  COUNT: 'count'
};

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
  function SessionManager(ampdoc) {
    _classCallCheck(this, SessionManager);

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
   */
  _createClass(SessionManager, [{
    key: "init_",
    value: function init_() {
      var _this = this;

      this.setInitialEngagedSignals_();
      this.unlisteners_.push(listen(this.win_, 'focus', function () {
        _this.isFocused_ = true;

        _this.updateEngagedForSessions_();
      }), listen(this.win_, 'blur', function () {
        _this.isFocused_ = false;

        _this.updateEngagedForSessions_();
      }), listen(this.win_, 'pageshow', function () {
        _this.isOpen_ = true;

        _this.updateEngagedForSessions_();
      }), listen(this.win_, 'pagehide', function () {
        _this.isOpen_ = false;

        _this.updateEngagedForSessions_();
      }), this.ampdoc_.onVisibilityChanged(function () {
        _this.isVisible_ = _this.ampdoc_.isVisible();

        _this.updateEngagedForSessions_();
      }));
    }
    /** Sets the initial states of the engaged signals used for all sessions. */

  }, {
    key: "setInitialEngagedSignals_",
    value: function setInitialEngagedSignals_() {
      this.isFocused_ = this.win_.document.hasFocus();
      this.isVisible_ = !isDocumentHidden(this.win_.document);
    }
    /** Sets the engaged session value for all sessions and persists. */

  }, {
    key: "updateEngagedForSessions_",
    value: function updateEngagedForSessions_() {
      var _this2 = this;

      Object.keys(this.sessions_).forEach(function (key) {
        var session = _this2.sessions_[key];
        session[SESSION_VALUES.ENGAGED] = _this2.getEngagedValue_();

        _this2.setSession_(key, session);
      });
    }
    /** @override */

  }, {
    key: "dispose",
    value: function dispose() {
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
     */

  }, {
    key: "getSessionValue",
    value: function getSessionValue(type, value) {
      return this.get(type).then(function (session) {
        return session == null ? void 0 : session[value];
      });
    }
    /**
     * Updates EventTimestamp for this session,
     * asynchronously as a callback to avoid duplicate writing,
     * when the session is retrieved or created.
     * @param {string} type
     * @return {!Promise}
     */

  }, {
    key: "updateEvent",
    value: function updateEvent(type) {
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
     */

  }, {
    key: "get",
    value: function get(type, opt_processing) {
      if (!type) {
        user().error(TAG, 'Sessions can only be accessed with a vendor type.');
        return Promise.resolve(null);
      }

      if (hasOwn(this.sessions_, type) && !isSessionExpired(this.sessions_[type])) {
        this.sessions_[type] = this.updateSession_(this.sessions_[type]);
        opt_processing == null ? void 0 : opt_processing(this.sessions_[type]);
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
     */

  }, {
    key: "getOrCreateSession_",
    value: function getOrCreateSession_(type, opt_processing) {
      var _this3 = this;

      return this.storagePromise_.then(function (storage) {
        var storageKey = getStorageKey(type);
        return storage.get(storageKey);
      }).then(function (session) {
        // Either create session or update it
        return !session ? constructSessionInfo(_this3.getEngagedValue_()) : _this3.updateSession_(constructSessionFromStoredValue(session), true);
      }).then(function (session) {
        // Avoid multiple session creation race
        if (type in _this3.sessions_ && !isSessionExpired(_this3.sessions_[type])) {
          return _this3.sessions_[type];
        }

        opt_processing == null ? void 0 : opt_processing(session);

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
     */

  }, {
    key: "updateSession_",
    value: function updateSession_(session, opt_usePersistedEngaged) {
      var currentCount = session[SESSION_VALUES.COUNT];
      var now = Date.now();

      if (isSessionExpired(session)) {
        var newSessionCount = (currentCount != null ? currentCount : 0) + 1;
        session = constructSessionInfo(this.getEngagedValue_(), newSessionCount);
      } else {
        var previouslyEngaged = opt_usePersistedEngaged && session[SESSION_VALUES.ENGAGED];
        // Use the persisted engaged value if it was `true`,
        // to signal that this was not a debounced session.
        session[SESSION_VALUES.ENGAGED] = previouslyEngaged || this.getEngagedValue_();

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
    /** Gets the most recent engaged value */

  }, {
    key: "getEngagedValue_",
    value: function getEngagedValue_() {
      return this.isOpen_ && this.isVisible_ && this.isFocused_;
    }
    /**
     * Set the session in localStorage, updating
     * its access time if it did not exist before.
     * @param {string} type
     * @param {SessionInfoDef} session
     * @return {!Promise}
     */

  }, {
    key: "setSession_",
    value: function setSession_(type, session) {
      return this.storagePromise_.then(function (storage) {
        var storageKey = getStorageKey(type);
        storage.setNonBoolean(storageKey, session);
      });
    }
  }]);

  return SessionManager;
}();

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
function constructSessionFromStoredValue(storedSession) {
  var _storedSession$SESSIO, _ref;

  if (!isObject(storedSession)) {
    dev().error(TAG, 'Invalid stored session value');
    return constructSessionInfo();
  }

  return _ref = {}, _ref[SESSION_VALUES.SESSION_ID] = storedSession[SESSION_VALUES.SESSION_ID], _ref[SESSION_VALUES.CREATION_TIMESTAMP] = storedSession[SESSION_VALUES.CREATION_TIMESTAMP], _ref[SESSION_VALUES.COUNT] = storedSession[SESSION_VALUES.COUNT], _ref[SESSION_VALUES.ACCESS_TIMESTAMP] = storedSession[SESSION_VALUES.ACCESS_TIMESTAMP], _ref[SESSION_VALUES.EVENT_TIMESTAMP] = storedSession[SESSION_VALUES.EVENT_TIMESTAMP], _ref[SESSION_VALUES.ENGAGED] = (_storedSession$SESSIO = storedSession[SESSION_VALUES.ENGAGED]) != null ? _storedSession$SESSIO : true, _ref;
}

/**
 * Constructs a new SessionInfoDef object
 * @param {boolean} engaged
 * @param {number=} count
 * @return {!SessionInfoDef}
 */
function constructSessionInfo(engaged, count) {
  var _ref2;

  if (count === void 0) {
    count = 1;
  }

  return _ref2 = {}, _ref2[SESSION_VALUES.SESSION_ID] = generateSessionId(), _ref2[SESSION_VALUES.CREATION_TIMESTAMP] = Date.now(), _ref2[SESSION_VALUES.ACCESS_TIMESTAMP] = Date.now(), _ref2[SESSION_VALUES.COUNT] = count, _ref2[SESSION_VALUES.EVENT_TIMESTAMP] = undefined, _ref2[SESSION_VALUES.ENGAGED] = engaged, _ref2;
}

/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<!SessionManager>}
 */
export function sessionServicePromiseForDoc(elementOrAmpDoc) {
  return (
    /** @type {!Promise<!SessionManager>} */
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-session')
  );
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installSessionServiceForTesting(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'amp-analytics-session', SessionManager);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlc3Npb24tbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsImRldiIsInVzZXIiLCJnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJoYXNPd24iLCJtYXAiLCJpc0RvY3VtZW50SGlkZGVuIiwiaXNPYmplY3QiLCJsaXN0ZW4iLCJUQUciLCJTRVNTSU9OX1NUT1JBR0VfS0VZIiwiU0VTU0lPTl9NQVhfQUdFX01JTExJUyIsIlNFU1NJT05fVkFMVUVTIiwiU0VTU0lPTl9JRCIsIkNSRUFUSU9OX1RJTUVTVEFNUCIsIkFDQ0VTU19USU1FU1RBTVAiLCJFTkdBR0VEIiwiRVZFTlRfVElNRVNUQU1QIiwiQ09VTlQiLCJTZXNzaW9uSW5mb0RlZiIsIlNlc3Npb25NYW5hZ2VyIiwiYW1wZG9jIiwic3RvcmFnZVByb21pc2VfIiwic3RvcmFnZUZvckRvYyIsInNlc3Npb25zXyIsImFtcGRvY18iLCJ3aW5fIiwid2luIiwidW5saXN0ZW5lcnNfIiwiaXNGb2N1c2VkXyIsImlzVmlzaWJsZV8iLCJpc09wZW5fIiwiaW5pdF8iLCJzZXRJbml0aWFsRW5nYWdlZFNpZ25hbHNfIiwicHVzaCIsInVwZGF0ZUVuZ2FnZWRGb3JTZXNzaW9uc18iLCJvblZpc2liaWxpdHlDaGFuZ2VkIiwiaXNWaXNpYmxlIiwiZG9jdW1lbnQiLCJoYXNGb2N1cyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5Iiwic2Vzc2lvbiIsImdldEVuZ2FnZWRWYWx1ZV8iLCJzZXRTZXNzaW9uXyIsInVubGlzdGVuIiwibGVuZ3RoIiwidHlwZSIsInZhbHVlIiwiZ2V0IiwidGhlbiIsIkRhdGUiLCJub3ciLCJvcHRfcHJvY2Vzc2luZyIsImVycm9yIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpc1Nlc3Npb25FeHBpcmVkIiwidXBkYXRlU2Vzc2lvbl8iLCJnZXRPckNyZWF0ZVNlc3Npb25fIiwic3RvcmFnZSIsInN0b3JhZ2VLZXkiLCJnZXRTdG9yYWdlS2V5IiwiY29uc3RydWN0U2Vzc2lvbkluZm8iLCJjb25zdHJ1Y3RTZXNzaW9uRnJvbVN0b3JlZFZhbHVlIiwib3B0X3VzZVBlcnNpc3RlZEVuZ2FnZWQiLCJjdXJyZW50Q291bnQiLCJuZXdTZXNzaW9uQ291bnQiLCJwcmV2aW91c2x5RW5nYWdlZCIsInNldE5vbkJvb2xlYW4iLCJhY2Nlc3NUaW1lc3RhbXAiLCJnZW5lcmF0ZVNlc3Npb25JZCIsIk1hdGgiLCJyb3VuZCIsInJhbmRvbSIsInN0b3JlZFNlc3Npb24iLCJlbmdhZ2VkIiwiY291bnQiLCJ1bmRlZmluZWQiLCJzZXNzaW9uU2VydmljZVByb21pc2VGb3JEb2MiLCJlbGVtZW50T3JBbXBEb2MiLCJpbnN0YWxsU2Vzc2lvblNlcnZpY2VGb3JUZXN0aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxJQUFiO0FBQ0EsU0FDRUMsdUJBREYsRUFFRUMsNEJBRkY7QUFJQSxTQUFRQyxNQUFSLEVBQWdCQyxHQUFoQjtBQUNBLFNBQVFDLGdCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLE1BQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsK0JBQVo7O0FBRUE7QUFDQSxJQUFNQyxtQkFBbUIsR0FBRyxjQUE1Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLHNCQUFzQixHQUFHLEtBQUssRUFBTCxHQUFVLElBQXpDOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxjQUFjLEdBQUc7QUFDNUJDLEVBQUFBLFVBQVUsRUFBRSxXQURnQjtBQUU1QkMsRUFBQUEsa0JBQWtCLEVBQUUsbUJBRlE7QUFHNUJDLEVBQUFBLGdCQUFnQixFQUFFLGlCQUhVO0FBSTVCQyxFQUFBQSxPQUFPLEVBQUUsU0FKbUI7QUFLNUJDLEVBQUFBLGVBQWUsRUFBRSxnQkFMVztBQU01QkMsRUFBQUEsS0FBSyxFQUFFO0FBTnFCLENBQXZCOztBQVNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxjQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLGNBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSwwQkFBWUMsTUFBWixFQUFvQjtBQUFBOztBQUNsQjtBQUNBLFNBQUtDLGVBQUwsR0FBdUJ2QixRQUFRLENBQUN3QixhQUFULENBQXVCRixNQUF2QixDQUF2Qjs7QUFFQTtBQUNBLFNBQUtHLFNBQUwsR0FBaUJuQixHQUFHLEVBQXBCOztBQUVBO0FBQ0EsU0FBS29CLE9BQUwsR0FBZUosTUFBZjs7QUFFQTtBQUNBLFNBQUtLLElBQUwsR0FBWUwsTUFBTSxDQUFDTSxHQUFuQjs7QUFFQTtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsRUFBcEI7O0FBRUE7QUFDQSxTQUFLQyxVQUFMLEdBQWtCLElBQWxCOztBQUVBO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQixJQUFsQjs7QUFFQTtBQUNBLFNBQUtDLE9BQUwsR0FBZSxJQUFmO0FBRUEsU0FBS0MsS0FBTDtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBbkNBO0FBQUE7QUFBQSxXQW9DRSxpQkFBUTtBQUFBOztBQUNOLFdBQUtDLHlCQUFMO0FBQ0EsV0FBS0wsWUFBTCxDQUFrQk0sSUFBbEIsQ0FDRTFCLE1BQU0sQ0FBQyxLQUFLa0IsSUFBTixFQUFZLE9BQVosRUFBcUIsWUFBTTtBQUMvQixRQUFBLEtBQUksQ0FBQ0csVUFBTCxHQUFrQixJQUFsQjs7QUFDQSxRQUFBLEtBQUksQ0FBQ00seUJBQUw7QUFDRCxPQUhLLENBRFIsRUFLRTNCLE1BQU0sQ0FBQyxLQUFLa0IsSUFBTixFQUFZLE1BQVosRUFBb0IsWUFBTTtBQUM5QixRQUFBLEtBQUksQ0FBQ0csVUFBTCxHQUFrQixLQUFsQjs7QUFDQSxRQUFBLEtBQUksQ0FBQ00seUJBQUw7QUFDRCxPQUhLLENBTFIsRUFTRTNCLE1BQU0sQ0FBQyxLQUFLa0IsSUFBTixFQUFZLFVBQVosRUFBd0IsWUFBTTtBQUNsQyxRQUFBLEtBQUksQ0FBQ0ssT0FBTCxHQUFlLElBQWY7O0FBQ0EsUUFBQSxLQUFJLENBQUNJLHlCQUFMO0FBQ0QsT0FISyxDQVRSLEVBYUUzQixNQUFNLENBQUMsS0FBS2tCLElBQU4sRUFBWSxVQUFaLEVBQXdCLFlBQU07QUFDbEMsUUFBQSxLQUFJLENBQUNLLE9BQUwsR0FBZSxLQUFmOztBQUNBLFFBQUEsS0FBSSxDQUFDSSx5QkFBTDtBQUNELE9BSEssQ0FiUixFQWlCRSxLQUFLVixPQUFMLENBQWFXLG1CQUFiLENBQWlDLFlBQU07QUFDckMsUUFBQSxLQUFJLENBQUNOLFVBQUwsR0FBa0IsS0FBSSxDQUFDTCxPQUFMLENBQWFZLFNBQWIsRUFBbEI7O0FBQ0EsUUFBQSxLQUFJLENBQUNGLHlCQUFMO0FBQ0QsT0FIRCxDQWpCRjtBQXNCRDtBQUVEOztBQTlERjtBQUFBO0FBQUEsV0ErREUscUNBQTRCO0FBQzFCLFdBQUtOLFVBQUwsR0FBa0IsS0FBS0gsSUFBTCxDQUFVWSxRQUFWLENBQW1CQyxRQUFuQixFQUFsQjtBQUNBLFdBQUtULFVBQUwsR0FBa0IsQ0FBQ3hCLGdCQUFnQixDQUFDLEtBQUtvQixJQUFMLENBQVVZLFFBQVgsQ0FBbkM7QUFDRDtBQUVEOztBQXBFRjtBQUFBO0FBQUEsV0FxRUUscUNBQTRCO0FBQUE7O0FBQzFCRSxNQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWSxLQUFLakIsU0FBakIsRUFBNEJrQixPQUE1QixDQUFvQyxVQUFDQyxHQUFELEVBQVM7QUFDM0MsWUFBTUMsT0FBTyxHQUFHLE1BQUksQ0FBQ3BCLFNBQUwsQ0FBZW1CLEdBQWYsQ0FBaEI7QUFDQUMsUUFBQUEsT0FBTyxDQUFDaEMsY0FBYyxDQUFDSSxPQUFoQixDQUFQLEdBQWtDLE1BQUksQ0FBQzZCLGdCQUFMLEVBQWxDOztBQUNBLFFBQUEsTUFBSSxDQUFDQyxXQUFMLENBQWlCSCxHQUFqQixFQUFzQkMsT0FBdEI7QUFDRCxPQUpEO0FBS0Q7QUFFRDs7QUE3RUY7QUFBQTtBQUFBLFdBOEVFLG1CQUFVO0FBQ1IsV0FBS2hCLFlBQUwsQ0FBa0JjLE9BQWxCLENBQTBCLFVBQUNLLFFBQUQsRUFBYztBQUN0Q0EsUUFBQUEsUUFBUTtBQUNULE9BRkQ7QUFHQSxXQUFLbkIsWUFBTCxDQUFrQm9CLE1BQWxCLEdBQTJCLENBQTNCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBMUZBO0FBQUE7QUFBQSxXQTJGRSx5QkFBZ0JDLElBQWhCLEVBQXNCQyxLQUF0QixFQUE2QjtBQUMzQixhQUFPLEtBQUtDLEdBQUwsQ0FBU0YsSUFBVCxFQUFlRyxJQUFmLENBQW9CLFVBQUNSLE9BQUQ7QUFBQSxlQUFhQSxPQUFiLG9CQUFhQSxPQUFPLENBQUdNLEtBQUgsQ0FBcEI7QUFBQSxPQUFwQixDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFyR0E7QUFBQTtBQUFBLFdBc0dFLHFCQUFZRCxJQUFaLEVBQWtCO0FBQ2hCLGFBQU8sS0FBS0UsR0FBTCxDQUFTRixJQUFULEVBQWUsVUFBQ0wsT0FBRCxFQUFhO0FBQ2pDQSxRQUFBQSxPQUFPLENBQUNoQyxjQUFjLENBQUNLLGVBQWhCLENBQVAsR0FBMENvQyxJQUFJLENBQUNDLEdBQUwsRUFBMUM7QUFDRCxPQUZNLENBQVA7QUFHRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWxIQTtBQUFBO0FBQUEsV0FtSEUsYUFBSUwsSUFBSixFQUFVTSxjQUFWLEVBQTBCO0FBQ3hCLFVBQUksQ0FBQ04sSUFBTCxFQUFXO0FBQ1RoRCxRQUFBQSxJQUFJLEdBQUd1RCxLQUFQLENBQWEvQyxHQUFiLEVBQWtCLG1EQUFsQjtBQUNBLGVBQU9nRCxPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBUDtBQUNEOztBQUVELFVBQ0V0RCxNQUFNLENBQUMsS0FBS29CLFNBQU4sRUFBaUJ5QixJQUFqQixDQUFOLElBQ0EsQ0FBQ1UsZ0JBQWdCLENBQUMsS0FBS25DLFNBQUwsQ0FBZXlCLElBQWYsQ0FBRCxDQUZuQixFQUdFO0FBQ0EsYUFBS3pCLFNBQUwsQ0FBZXlCLElBQWYsSUFBdUIsS0FBS1csY0FBTCxDQUFvQixLQUFLcEMsU0FBTCxDQUFleUIsSUFBZixDQUFwQixDQUF2QjtBQUNBTSxRQUFBQSxjQUFjLFFBQWQsWUFBQUEsY0FBYyxDQUFHLEtBQUsvQixTQUFMLENBQWV5QixJQUFmLENBQUgsQ0FBZDtBQUNBLGFBQUtILFdBQUwsQ0FBaUJHLElBQWpCLEVBQXVCLEtBQUt6QixTQUFMLENBQWV5QixJQUFmLENBQXZCO0FBQ0EsZUFBT1EsT0FBTyxDQUFDQyxPQUFSLENBQWdCLEtBQUtsQyxTQUFMLENBQWV5QixJQUFmLENBQWhCLENBQVA7QUFDRDs7QUFFRCxhQUFPLEtBQUtZLG1CQUFMLENBQXlCWixJQUF6QixFQUErQk0sY0FBL0IsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBNUlBO0FBQUE7QUFBQSxXQTZJRSw2QkFBb0JOLElBQXBCLEVBQTBCTSxjQUExQixFQUEwQztBQUFBOztBQUN4QyxhQUFPLEtBQUtqQyxlQUFMLENBQ0o4QixJQURJLENBQ0MsVUFBQ1UsT0FBRCxFQUFhO0FBQ2pCLFlBQU1DLFVBQVUsR0FBR0MsYUFBYSxDQUFDZixJQUFELENBQWhDO0FBQ0EsZUFBT2EsT0FBTyxDQUFDWCxHQUFSLENBQVlZLFVBQVosQ0FBUDtBQUNELE9BSkksRUFLSlgsSUFMSSxDQUtDLFVBQUNSLE9BQUQsRUFBYTtBQUNqQjtBQUNBLGVBQU8sQ0FBQ0EsT0FBRCxHQUNIcUIsb0JBQW9CLENBQUMsTUFBSSxDQUFDcEIsZ0JBQUwsRUFBRCxDQURqQixHQUVILE1BQUksQ0FBQ2UsY0FBTCxDQUFvQk0sK0JBQStCLENBQUN0QixPQUFELENBQW5ELEVBQThELElBQTlELENBRko7QUFHRCxPQVZJLEVBV0pRLElBWEksQ0FXQyxVQUFDUixPQUFELEVBQWE7QUFDakI7QUFDQSxZQUFJSyxJQUFJLElBQUksTUFBSSxDQUFDekIsU0FBYixJQUEwQixDQUFDbUMsZ0JBQWdCLENBQUMsTUFBSSxDQUFDbkMsU0FBTCxDQUFleUIsSUFBZixDQUFELENBQS9DLEVBQXVFO0FBQ3JFLGlCQUFPLE1BQUksQ0FBQ3pCLFNBQUwsQ0FBZXlCLElBQWYsQ0FBUDtBQUNEOztBQUNETSxRQUFBQSxjQUFjLFFBQWQsWUFBQUEsY0FBYyxDQUFHWCxPQUFILENBQWQ7O0FBQ0EsUUFBQSxNQUFJLENBQUNFLFdBQUwsQ0FBaUJHLElBQWpCLEVBQXVCTCxPQUF2Qjs7QUFDQSxRQUFBLE1BQUksQ0FBQ3BCLFNBQUwsQ0FBZXlCLElBQWYsSUFBdUJMLE9BQXZCO0FBQ0EsZUFBTyxNQUFJLENBQUNwQixTQUFMLENBQWV5QixJQUFmLENBQVA7QUFDRCxPQXBCSSxDQUFQO0FBcUJEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTdLQTtBQUFBO0FBQUEsV0E4S0Usd0JBQWVMLE9BQWYsRUFBd0J1Qix1QkFBeEIsRUFBaUQ7QUFDL0MsVUFBTUMsWUFBWSxHQUFHeEIsT0FBTyxDQUFDaEMsY0FBYyxDQUFDTSxLQUFoQixDQUE1QjtBQUNBLFVBQU1vQyxHQUFHLEdBQUdELElBQUksQ0FBQ0MsR0FBTCxFQUFaOztBQUNBLFVBQUlLLGdCQUFnQixDQUFDZixPQUFELENBQXBCLEVBQStCO0FBQzdCLFlBQU15QixlQUFlLEdBQUcsQ0FBQ0QsWUFBRCxXQUFDQSxZQUFELEdBQWlCLENBQWpCLElBQXNCLENBQTlDO0FBQ0F4QixRQUFBQSxPQUFPLEdBQUdxQixvQkFBb0IsQ0FBQyxLQUFLcEIsZ0JBQUwsRUFBRCxFQUEwQndCLGVBQTFCLENBQTlCO0FBQ0QsT0FIRCxNQUdPO0FBQ0wsWUFBTUMsaUJBQWlCLEdBQ3JCSCx1QkFBdUIsSUFBSXZCLE9BQU8sQ0FBQ2hDLGNBQWMsQ0FBQ0ksT0FBaEIsQ0FEcEM7QUFFQTtBQUNBO0FBQ0E0QixRQUFBQSxPQUFPLENBQUNoQyxjQUFjLENBQUNJLE9BQWhCLENBQVAsR0FDRXNELGlCQUFpQixJQUFJLEtBQUt6QixnQkFBTCxFQUR2Qjs7QUFFQTtBQUNBLFlBQUl5QixpQkFBSixFQUF1QjtBQUNyQixlQUFLekMsVUFBTCxHQUFrQixJQUFsQjtBQUNBLGVBQUtFLE9BQUwsR0FBZSxJQUFmO0FBQ0EsZUFBS0QsVUFBTCxHQUFrQixJQUFsQjtBQUNEO0FBQ0Y7O0FBQ0RjLE1BQUFBLE9BQU8sQ0FBQ2hDLGNBQWMsQ0FBQ0csZ0JBQWhCLENBQVAsR0FBMkN1QyxHQUEzQztBQUNBLGFBQU9WLE9BQVA7QUFDRDtBQUVEOztBQXRNRjtBQUFBO0FBQUEsV0F1TUUsNEJBQW1CO0FBQ2pCLGFBQU8sS0FBS2IsT0FBTCxJQUFnQixLQUFLRCxVQUFyQixJQUFtQyxLQUFLRCxVQUEvQztBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBak5BO0FBQUE7QUFBQSxXQWtORSxxQkFBWW9CLElBQVosRUFBa0JMLE9BQWxCLEVBQTJCO0FBQ3pCLGFBQU8sS0FBS3RCLGVBQUwsQ0FBcUI4QixJQUFyQixDQUEwQixVQUFDVSxPQUFELEVBQWE7QUFDNUMsWUFBTUMsVUFBVSxHQUFHQyxhQUFhLENBQUNmLElBQUQsQ0FBaEM7QUFDQWEsUUFBQUEsT0FBTyxDQUFDUyxhQUFSLENBQXNCUixVQUF0QixFQUFrQ25CLE9BQWxDO0FBQ0QsT0FITSxDQUFQO0FBSUQ7QUF2Tkg7O0FBQUE7QUFBQTs7QUEwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNlLGdCQUFULENBQTBCZixPQUExQixFQUFtQztBQUNqQyxNQUFNNEIsZUFBZSxHQUFHNUIsT0FBTyxDQUFDaEMsY0FBYyxDQUFDRyxnQkFBaEIsQ0FBL0I7QUFDQSxTQUFPeUQsZUFBZSxHQUFHN0Qsc0JBQWxCLEdBQTJDMEMsSUFBSSxDQUFDQyxHQUFMLEVBQWxEO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTbUIsaUJBQVQsR0FBNkI7QUFDM0IsU0FBT0MsSUFBSSxDQUFDQyxLQUFMLENBQVcsUUFBUUQsSUFBSSxDQUFDRSxNQUFMLEVBQW5CLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNaLGFBQVQsQ0FBdUJmLElBQXZCLEVBQTZCO0FBQzNCLFNBQU92QyxtQkFBbUIsR0FBR3VDLElBQTdCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTaUIsK0JBQVQsQ0FBeUNXLGFBQXpDLEVBQXdEO0FBQUE7O0FBQ3RELE1BQUksQ0FBQ3RFLFFBQVEsQ0FBQ3NFLGFBQUQsQ0FBYixFQUE4QjtBQUM1QjdFLElBQUFBLEdBQUcsR0FBR3dELEtBQU4sQ0FBWS9DLEdBQVosRUFBaUIsOEJBQWpCO0FBQ0EsV0FBT3dELG9CQUFvQixFQUEzQjtBQUNEOztBQUVELHlCQUNHckQsY0FBYyxDQUFDQyxVQURsQixJQUMrQmdFLGFBQWEsQ0FBQ2pFLGNBQWMsQ0FBQ0MsVUFBaEIsQ0FENUMsT0FFR0QsY0FBYyxDQUFDRSxrQkFGbEIsSUFHSStELGFBQWEsQ0FBQ2pFLGNBQWMsQ0FBQ0Usa0JBQWhCLENBSGpCLE9BSUdGLGNBQWMsQ0FBQ00sS0FKbEIsSUFJMEIyRCxhQUFhLENBQUNqRSxjQUFjLENBQUNNLEtBQWhCLENBSnZDLE9BS0dOLGNBQWMsQ0FBQ0csZ0JBTGxCLElBTUk4RCxhQUFhLENBQUNqRSxjQUFjLENBQUNHLGdCQUFoQixDQU5qQixPQU9HSCxjQUFjLENBQUNLLGVBUGxCLElBUUk0RCxhQUFhLENBQUNqRSxjQUFjLENBQUNLLGVBQWhCLENBUmpCLE9BU0dMLGNBQWMsQ0FBQ0ksT0FUbEIsNkJBUzRCNkQsYUFBYSxDQUFDakUsY0FBYyxDQUFDSSxPQUFoQixDQVR6QyxvQ0FTcUUsSUFUckU7QUFXRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTaUQsb0JBQVQsQ0FBOEJhLE9BQTlCLEVBQXVDQyxLQUF2QyxFQUFrRDtBQUFBOztBQUFBLE1BQVhBLEtBQVc7QUFBWEEsSUFBQUEsS0FBVyxHQUFILENBQUc7QUFBQTs7QUFDaEQsMkJBQ0duRSxjQUFjLENBQUNDLFVBRGxCLElBQytCNEQsaUJBQWlCLEVBRGhELFFBRUc3RCxjQUFjLENBQUNFLGtCQUZsQixJQUV1Q3VDLElBQUksQ0FBQ0MsR0FBTCxFQUZ2QyxRQUdHMUMsY0FBYyxDQUFDRyxnQkFIbEIsSUFHcUNzQyxJQUFJLENBQUNDLEdBQUwsRUFIckMsUUFJRzFDLGNBQWMsQ0FBQ00sS0FKbEIsSUFJMEI2RCxLQUoxQixRQUtHbkUsY0FBYyxDQUFDSyxlQUxsQixJQUtvQytELFNBTHBDLFFBTUdwRSxjQUFjLENBQUNJLE9BTmxCLElBTTRCOEQsT0FONUI7QUFRRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0csMkJBQVQsQ0FBcUNDLGVBQXJDLEVBQXNEO0FBQzNEO0FBQU87QUFDTGhGLElBQUFBLHVCQUF1QixDQUFDZ0YsZUFBRCxFQUFrQix1QkFBbEI7QUFEekI7QUFHRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLCtCQUFULENBQXlDOUQsTUFBekMsRUFBaUQ7QUFDdERsQixFQUFBQSw0QkFBNEIsQ0FBQ2tCLE1BQUQsRUFBUyx1QkFBVCxFQUFrQ0QsY0FBbEMsQ0FBNUI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjEgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2RldiwgdXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge1xuICBnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyxcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyxcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2hhc093biwgbWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtpc0RvY3VtZW50SGlkZGVufSBmcm9tICcjY29yZS9kb2N1bWVudC12aXNpYmlsaXR5JztcbmltcG9ydCB7aXNPYmplY3R9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7bGlzdGVufSBmcm9tICdzcmMvZXZlbnQtaGVscGVyJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1hbmFseXRpY3Mvc2Vzc2lvbi1tYW5hZ2VyJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgU0VTU0lPTl9TVE9SQUdFX0tFWSA9ICdhbXAtc2Vzc2lvbjonO1xuXG4vKipcbiAqIFdlIGlnbm9yZSBTZXNzaW9ucyB0aGF0IGFyZSBvbGRlciB0aGFuIDMwIG1pbnV0ZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBTRVNTSU9OX01BWF9BR0VfTUlMTElTID0gMzAgKiA2MCAqIDEwMDA7XG5cbi8qKlxuICogS2V5IHZhbHVlcyBmb3IgcmV0cml2aW5nL3N0b3Jpbmcgc2Vzc2lvbiB2YWx1ZXNcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBTRVNTSU9OX1ZBTFVFUyA9IHtcbiAgU0VTU0lPTl9JRDogJ3Nlc3Npb25JZCcsXG4gIENSRUFUSU9OX1RJTUVTVEFNUDogJ2NyZWF0aW9uVGltZXN0YW1wJyxcbiAgQUNDRVNTX1RJTUVTVEFNUDogJ2FjY2Vzc1RpbWVzdGFtcCcsXG4gIEVOR0FHRUQ6ICdlbmdhZ2VkJyxcbiAgRVZFTlRfVElNRVNUQU1QOiAnZXZlbnRUaW1lc3RhbXAnLFxuICBDT1VOVDogJ2NvdW50Jyxcbn07XG5cbi8qKlxuICogRXZlbiB0aG91Z2ggb3VyIExvY2FsU3RvcmFnZSBpbXBsZW1lbnRhdGlvbiBhbHJlYWR5IGhhcyBhXG4gKiBtZWNoYW5pc20gdGhhdCBoYW5kbGVzIHJlbW92aW5nIGV4cGlyZWQgdmFsdWVzLCB3ZSBrZWVwIGl0XG4gKiBpbiBtZW1vcnkgc28gdGhhdCB3ZSBkb24ndCBoYXZlIHRvIHJlYWQgdGhlIHZhbHVlIGV2ZXJ5dGltZS5cbiAqIEB0eXBlZGVmIHt7XG4gKiAgc2Vzc2lvbklkOiBudW1iZXIsXG4gKiAgY3JlYXRpb25UaW1lc3RhbXA6IG51bWJlcixcbiAqICBhY2Nlc3NUaW1lc3RhbXA6IG51bWJlcixcbiAqICBlbmdhZ2VkOiBib29sZWFuLFxuICogIGV2ZW50VGltZXN0YW1wOiBudW1iZXIsXG4gKiAgY291bnQ6IG51bWJlcixcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgU2Vzc2lvbkluZm9EZWY7XG5cbi8qKlxuICogQGltcGxlbWVudHMgey4uLy4uLy4uL3NyYy9zZXJ2aWNlLkRpc3Bvc2FibGV9XG4gKi9cbmV4cG9ydCBjbGFzcyBTZXNzaW9uTWFuYWdlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jKSB7XG4gICAgLyoqIEBwcml2YXRlIHshUHJvbWlzZTwhLi4vLi4vLi4vc3JjL3NlcnZpY2Uvc3RvcmFnZS1pbXBsLlN0b3JhZ2U+fSAqL1xuICAgIHRoaXMuc3RvcmFnZVByb21pc2VfID0gU2VydmljZXMuc3RvcmFnZUZvckRvYyhhbXBkb2MpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgP1Nlc3Npb25JbmZvRGVmPn0gKi9cbiAgICB0aGlzLnNlc3Npb25zXyA9IG1hcCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IGFtcGRvYztcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSBhbXBkb2Mud2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8IVVubGlzdGVuRGVmPn0gKi9cbiAgICB0aGlzLnVubGlzdGVuZXJzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzRm9jdXNlZF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzVmlzaWJsZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNPcGVuXyA9IHRydWU7XG5cbiAgICB0aGlzLmluaXRfKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5zdGFsbCBldmVudCBsaXN0ZW5lcnMgZm9yIGVuZ2FnZWQgc2luZ2Fscy5cbiAgICogYGFtcC1hbmFseXRpY3NgIHdhaXRzIGZvciBhbXBkb2MgdG8gYmUgdmlzaWJsZSBmaXJzdC5cbiAgICovXG4gIGluaXRfKCkge1xuICAgIHRoaXMuc2V0SW5pdGlhbEVuZ2FnZWRTaWduYWxzXygpO1xuICAgIHRoaXMudW5saXN0ZW5lcnNfLnB1c2goXG4gICAgICBsaXN0ZW4odGhpcy53aW5fLCAnZm9jdXMnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNGb2N1c2VkXyA9IHRydWU7XG4gICAgICAgIHRoaXMudXBkYXRlRW5nYWdlZEZvclNlc3Npb25zXygpO1xuICAgICAgfSksXG4gICAgICBsaXN0ZW4odGhpcy53aW5fLCAnYmx1cicsICgpID0+IHtcbiAgICAgICAgdGhpcy5pc0ZvY3VzZWRfID0gZmFsc2U7XG4gICAgICAgIHRoaXMudXBkYXRlRW5nYWdlZEZvclNlc3Npb25zXygpO1xuICAgICAgfSksXG4gICAgICBsaXN0ZW4odGhpcy53aW5fLCAncGFnZXNob3cnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNPcGVuXyA9IHRydWU7XG4gICAgICAgIHRoaXMudXBkYXRlRW5nYWdlZEZvclNlc3Npb25zXygpO1xuICAgICAgfSksXG4gICAgICBsaXN0ZW4odGhpcy53aW5fLCAncGFnZWhpZGUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNPcGVuXyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnVwZGF0ZUVuZ2FnZWRGb3JTZXNzaW9uc18oKTtcbiAgICAgIH0pLFxuICAgICAgdGhpcy5hbXBkb2NfLm9uVmlzaWJpbGl0eUNoYW5nZWQoKCkgPT4ge1xuICAgICAgICB0aGlzLmlzVmlzaWJsZV8gPSB0aGlzLmFtcGRvY18uaXNWaXNpYmxlKCk7XG4gICAgICAgIHRoaXMudXBkYXRlRW5nYWdlZEZvclNlc3Npb25zXygpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGluaXRpYWwgc3RhdGVzIG9mIHRoZSBlbmdhZ2VkIHNpZ25hbHMgdXNlZCBmb3IgYWxsIHNlc3Npb25zLiAqL1xuICBzZXRJbml0aWFsRW5nYWdlZFNpZ25hbHNfKCkge1xuICAgIHRoaXMuaXNGb2N1c2VkXyA9IHRoaXMud2luXy5kb2N1bWVudC5oYXNGb2N1cygpO1xuICAgIHRoaXMuaXNWaXNpYmxlXyA9ICFpc0RvY3VtZW50SGlkZGVuKHRoaXMud2luXy5kb2N1bWVudCk7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgZW5nYWdlZCBzZXNzaW9uIHZhbHVlIGZvciBhbGwgc2Vzc2lvbnMgYW5kIHBlcnNpc3RzLiAqL1xuICB1cGRhdGVFbmdhZ2VkRm9yU2Vzc2lvbnNfKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuc2Vzc2lvbnNfKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLnNlc3Npb25zX1trZXldO1xuICAgICAgc2Vzc2lvbltTRVNTSU9OX1ZBTFVFUy5FTkdBR0VEXSA9IHRoaXMuZ2V0RW5nYWdlZFZhbHVlXygpO1xuICAgICAgdGhpcy5zZXRTZXNzaW9uXyhrZXksIHNlc3Npb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMudW5saXN0ZW5lcnNfLmZvckVhY2goKHVubGlzdGVuKSA9PiB7XG4gICAgICB1bmxpc3RlbigpO1xuICAgIH0pO1xuICAgIHRoaXMudW5saXN0ZW5lcnNfLmxlbmd0aCA9IDA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB2YWx1ZSBmcm9tIHRoZSBzZXNzaW9uIHBlciB0aGUgdmVuZG9yLlxuICAgKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IHR5cGVcbiAgICogQHBhcmFtIHtTRVNTSU9OX1ZBTFVFU30gdmFsdWVcbiAgICogQHJldHVybiB7IVByb21pc2U8bnVtYmVyfHVuZGVmaW5lZD59XG4gICAqL1xuICBnZXRTZXNzaW9uVmFsdWUodHlwZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQodHlwZSkudGhlbigoc2Vzc2lvbikgPT4gc2Vzc2lvbj8uW3ZhbHVlXSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBFdmVudFRpbWVzdGFtcCBmb3IgdGhpcyBzZXNzaW9uLFxuICAgKiBhc3luY2hyb25vdXNseSBhcyBhIGNhbGxiYWNrIHRvIGF2b2lkIGR1cGxpY2F0ZSB3cml0aW5nLFxuICAgKiB3aGVuIHRoZSBzZXNzaW9uIGlzIHJldHJpZXZlZCBvciBjcmVhdGVkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHVwZGF0ZUV2ZW50KHR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQodHlwZSwgKHNlc3Npb24pID0+IHtcbiAgICAgIHNlc3Npb25bU0VTU0lPTl9WQUxVRVMuRVZFTlRfVElNRVNUQU1QXSA9IERhdGUubm93KCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBzZXNzaW9uIGZvciB0aGUgdmVuZG9yLCBjaGVja2luZyBpZiBpdCBleGlzdHMgb3JcbiAgICogY3JlYXRpbmcgaXQgaWYgbmVjZXNzYXJ5LlxuICAgKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IHR5cGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbj19IG9wdF9wcm9jZXNzaW5nXG4gICAqIEByZXR1cm4geyFQcm9taXNlPD9TZXNzaW9uSW5mb0RlZj59XG4gICAqL1xuICBnZXQodHlwZSwgb3B0X3Byb2Nlc3NpbmcpIHtcbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdTZXNzaW9ucyBjYW4gb25seSBiZSBhY2Nlc3NlZCB3aXRoIGEgdmVuZG9yIHR5cGUuJyk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIGhhc093bih0aGlzLnNlc3Npb25zXywgdHlwZSkgJiZcbiAgICAgICFpc1Nlc3Npb25FeHBpcmVkKHRoaXMuc2Vzc2lvbnNfW3R5cGVdKVxuICAgICkge1xuICAgICAgdGhpcy5zZXNzaW9uc19bdHlwZV0gPSB0aGlzLnVwZGF0ZVNlc3Npb25fKHRoaXMuc2Vzc2lvbnNfW3R5cGVdKTtcbiAgICAgIG9wdF9wcm9jZXNzaW5nPy4odGhpcy5zZXNzaW9uc19bdHlwZV0pO1xuICAgICAgdGhpcy5zZXRTZXNzaW9uXyh0eXBlLCB0aGlzLnNlc3Npb25zX1t0eXBlXSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuc2Vzc2lvbnNfW3R5cGVdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRPckNyZWF0ZVNlc3Npb25fKHR5cGUsIG9wdF9wcm9jZXNzaW5nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgb3VyIHNlc3Npb24gaWYgaXQgZXhpc3RzIG9yIGNyZWF0ZXMgaXQuIFNldHMgdGhlIHNlc3Npb25cbiAgICogaW4gbG9jYWxTdG9yYWdlIHRvIHVwZGF0ZSB0aGUgYWNjZXNzIHRpbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb249fSBvcHRfcHJvY2Vzc2luZ1xuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxTZXNzaW9uSW5mb0RlZj59XG4gICAqL1xuICBnZXRPckNyZWF0ZVNlc3Npb25fKHR5cGUsIG9wdF9wcm9jZXNzaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVByb21pc2VfXG4gICAgICAudGhlbigoc3RvcmFnZSkgPT4ge1xuICAgICAgICBjb25zdCBzdG9yYWdlS2V5ID0gZ2V0U3RvcmFnZUtleSh0eXBlKTtcbiAgICAgICAgcmV0dXJuIHN0b3JhZ2UuZ2V0KHN0b3JhZ2VLZXkpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChzZXNzaW9uKSA9PiB7XG4gICAgICAgIC8vIEVpdGhlciBjcmVhdGUgc2Vzc2lvbiBvciB1cGRhdGUgaXRcbiAgICAgICAgcmV0dXJuICFzZXNzaW9uXG4gICAgICAgICAgPyBjb25zdHJ1Y3RTZXNzaW9uSW5mbyh0aGlzLmdldEVuZ2FnZWRWYWx1ZV8oKSlcbiAgICAgICAgICA6IHRoaXMudXBkYXRlU2Vzc2lvbl8oY29uc3RydWN0U2Vzc2lvbkZyb21TdG9yZWRWYWx1ZShzZXNzaW9uKSwgdHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKHNlc3Npb24pID0+IHtcbiAgICAgICAgLy8gQXZvaWQgbXVsdGlwbGUgc2Vzc2lvbiBjcmVhdGlvbiByYWNlXG4gICAgICAgIGlmICh0eXBlIGluIHRoaXMuc2Vzc2lvbnNfICYmICFpc1Nlc3Npb25FeHBpcmVkKHRoaXMuc2Vzc2lvbnNfW3R5cGVdKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNlc3Npb25zX1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICBvcHRfcHJvY2Vzc2luZz8uKHNlc3Npb24pO1xuICAgICAgICB0aGlzLnNldFNlc3Npb25fKHR5cGUsIHNlc3Npb24pO1xuICAgICAgICB0aGlzLnNlc3Npb25zX1t0eXBlXSA9IHNlc3Npb247XG4gICAgICAgIHJldHVybiB0aGlzLnNlc3Npb25zX1t0eXBlXTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHNlc3Npb24gaGFzIGV4cGlyZWQgYW5kIHJlc2V0L3VwZGF0ZSB2YWx1ZXMgKGlkLCBjb3VudCkgaWYgc28uXG4gICAqIEFsc28gdXBkYXRlIGBhY2Nlc3NUaW1lc3RhbXBgLlxuICAgKiBTZXRzIHRoZSBpbml0aWFsIGVuZ2FnZWQgc2luZ2FscyBpZiB0aGlzIHNlc3Npb24gaXMgYSBjb250aW51YXRpb24gYW5kXG4gICAqIHdhcyBub3QgZGVib3VuY2VkLlxuICAgKiBAcGFyYW0geyFTZXNzaW9uSW5mb0RlZn0gc2Vzc2lvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfdXNlUGVyc2lzdGVkRW5nYWdlZFxuICAgKiBAcmV0dXJuIHshU2Vzc2lvbkluZm9EZWZ9XG4gICAqL1xuICB1cGRhdGVTZXNzaW9uXyhzZXNzaW9uLCBvcHRfdXNlUGVyc2lzdGVkRW5nYWdlZCkge1xuICAgIGNvbnN0IGN1cnJlbnRDb3VudCA9IHNlc3Npb25bU0VTU0lPTl9WQUxVRVMuQ09VTlRdO1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgaWYgKGlzU2Vzc2lvbkV4cGlyZWQoc2Vzc2lvbikpIHtcbiAgICAgIGNvbnN0IG5ld1Nlc3Npb25Db3VudCA9IChjdXJyZW50Q291bnQgPz8gMCkgKyAxO1xuICAgICAgc2Vzc2lvbiA9IGNvbnN0cnVjdFNlc3Npb25JbmZvKHRoaXMuZ2V0RW5nYWdlZFZhbHVlXygpLCBuZXdTZXNzaW9uQ291bnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcmV2aW91c2x5RW5nYWdlZCA9XG4gICAgICAgIG9wdF91c2VQZXJzaXN0ZWRFbmdhZ2VkICYmIHNlc3Npb25bU0VTU0lPTl9WQUxVRVMuRU5HQUdFRF07XG4gICAgICAvLyBVc2UgdGhlIHBlcnNpc3RlZCBlbmdhZ2VkIHZhbHVlIGlmIGl0IHdhcyBgdHJ1ZWAsXG4gICAgICAvLyB0byBzaWduYWwgdGhhdCB0aGlzIHdhcyBub3QgYSBkZWJvdW5jZWQgc2Vzc2lvbi5cbiAgICAgIHNlc3Npb25bU0VTU0lPTl9WQUxVRVMuRU5HQUdFRF0gPVxuICAgICAgICBwcmV2aW91c2x5RW5nYWdlZCB8fCB0aGlzLmdldEVuZ2FnZWRWYWx1ZV8oKTtcbiAgICAgIC8vIFNldCB0aGUgaW5pdGlhbCBlbmdhZ2VkIHNpZ25hbHMgdG8gdHJ1ZSAoc2luY2UgaXQncyBub3QgZGVib3VuY2VkKVxuICAgICAgaWYgKHByZXZpb3VzbHlFbmdhZ2VkKSB7XG4gICAgICAgIHRoaXMuaXNGb2N1c2VkXyA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNPcGVuXyA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNWaXNpYmxlXyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHNlc3Npb25bU0VTU0lPTl9WQUxVRVMuQUNDRVNTX1RJTUVTVEFNUF0gPSBub3c7XG4gICAgcmV0dXJuIHNlc3Npb247XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9zdCByZWNlbnQgZW5nYWdlZCB2YWx1ZSAqL1xuICBnZXRFbmdhZ2VkVmFsdWVfKCkge1xuICAgIHJldHVybiB0aGlzLmlzT3Blbl8gJiYgdGhpcy5pc1Zpc2libGVfICYmIHRoaXMuaXNGb2N1c2VkXztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHNlc3Npb24gaW4gbG9jYWxTdG9yYWdlLCB1cGRhdGluZ1xuICAgKiBpdHMgYWNjZXNzIHRpbWUgaWYgaXQgZGlkIG5vdCBleGlzdCBiZWZvcmUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7U2Vzc2lvbkluZm9EZWZ9IHNlc3Npb25cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBzZXRTZXNzaW9uXyh0eXBlLCBzZXNzaW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVByb21pc2VfLnRoZW4oKHN0b3JhZ2UpID0+IHtcbiAgICAgIGNvbnN0IHN0b3JhZ2VLZXkgPSBnZXRTdG9yYWdlS2V5KHR5cGUpO1xuICAgICAgc3RvcmFnZS5zZXROb25Cb29sZWFuKHN0b3JhZ2VLZXksIHNlc3Npb24pO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgc2Vzc2lvbiBoYXMgZXhwaXJlZFxuICogQHBhcmFtIHtTZXNzaW9uSW5mb0RlZn0gc2Vzc2lvblxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNTZXNzaW9uRXhwaXJlZChzZXNzaW9uKSB7XG4gIGNvbnN0IGFjY2Vzc1RpbWVzdGFtcCA9IHNlc3Npb25bU0VTU0lPTl9WQUxVRVMuQUNDRVNTX1RJTUVTVEFNUF07XG4gIHJldHVybiBhY2Nlc3NUaW1lc3RhbXAgKyBTRVNTSU9OX01BWF9BR0VfTUlMTElTIDwgRGF0ZS5ub3coKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBwc2V1ZG9yYW5kb20gbG93IGVudHJvcHkgdmFsdWUgZm9yIHNlc3Npb24gaWQuXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlU2Vzc2lvbklkKCkge1xuICByZXR1cm4gTWF0aC5yb3VuZCgxMDAwMCAqIE1hdGgucmFuZG9tKCkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldFN0b3JhZ2VLZXkodHlwZSkge1xuICByZXR1cm4gU0VTU0lPTl9TVE9SQUdFX0tFWSArIHR5cGU7XG59XG5cbi8qKlxuICogQHBhcmFtIHsqfSBzdG9yZWRTZXNzaW9uXG4gKiBAcmV0dXJuIHtTZXNzaW9uSW5mb0RlZn1cbiAqL1xuZnVuY3Rpb24gY29uc3RydWN0U2Vzc2lvbkZyb21TdG9yZWRWYWx1ZShzdG9yZWRTZXNzaW9uKSB7XG4gIGlmICghaXNPYmplY3Qoc3RvcmVkU2Vzc2lvbikpIHtcbiAgICBkZXYoKS5lcnJvcihUQUcsICdJbnZhbGlkIHN0b3JlZCBzZXNzaW9uIHZhbHVlJyk7XG4gICAgcmV0dXJuIGNvbnN0cnVjdFNlc3Npb25JbmZvKCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIFtTRVNTSU9OX1ZBTFVFUy5TRVNTSU9OX0lEXTogc3RvcmVkU2Vzc2lvbltTRVNTSU9OX1ZBTFVFUy5TRVNTSU9OX0lEXSxcbiAgICBbU0VTU0lPTl9WQUxVRVMuQ1JFQVRJT05fVElNRVNUQU1QXTpcbiAgICAgIHN0b3JlZFNlc3Npb25bU0VTU0lPTl9WQUxVRVMuQ1JFQVRJT05fVElNRVNUQU1QXSxcbiAgICBbU0VTU0lPTl9WQUxVRVMuQ09VTlRdOiBzdG9yZWRTZXNzaW9uW1NFU1NJT05fVkFMVUVTLkNPVU5UXSxcbiAgICBbU0VTU0lPTl9WQUxVRVMuQUNDRVNTX1RJTUVTVEFNUF06XG4gICAgICBzdG9yZWRTZXNzaW9uW1NFU1NJT05fVkFMVUVTLkFDQ0VTU19USU1FU1RBTVBdLFxuICAgIFtTRVNTSU9OX1ZBTFVFUy5FVkVOVF9USU1FU1RBTVBdOlxuICAgICAgc3RvcmVkU2Vzc2lvbltTRVNTSU9OX1ZBTFVFUy5FVkVOVF9USU1FU1RBTVBdLFxuICAgIFtTRVNTSU9OX1ZBTFVFUy5FTkdBR0VEXTogc3RvcmVkU2Vzc2lvbltTRVNTSU9OX1ZBTFVFUy5FTkdBR0VEXSA/PyB0cnVlLFxuICB9O1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgU2Vzc2lvbkluZm9EZWYgb2JqZWN0XG4gKiBAcGFyYW0ge2Jvb2xlYW59IGVuZ2FnZWRcbiAqIEBwYXJhbSB7bnVtYmVyPX0gY291bnRcbiAqIEByZXR1cm4geyFTZXNzaW9uSW5mb0RlZn1cbiAqL1xuZnVuY3Rpb24gY29uc3RydWN0U2Vzc2lvbkluZm8oZW5nYWdlZCwgY291bnQgPSAxKSB7XG4gIHJldHVybiB7XG4gICAgW1NFU1NJT05fVkFMVUVTLlNFU1NJT05fSURdOiBnZW5lcmF0ZVNlc3Npb25JZCgpLFxuICAgIFtTRVNTSU9OX1ZBTFVFUy5DUkVBVElPTl9USU1FU1RBTVBdOiBEYXRlLm5vdygpLFxuICAgIFtTRVNTSU9OX1ZBTFVFUy5BQ0NFU1NfVElNRVNUQU1QXTogRGF0ZS5ub3coKSxcbiAgICBbU0VTU0lPTl9WQUxVRVMuQ09VTlRdOiBjb3VudCxcbiAgICBbU0VTU0lPTl9WQUxVRVMuRVZFTlRfVElNRVNUQU1QXTogdW5kZWZpbmVkLFxuICAgIFtTRVNTSU9OX1ZBTFVFUy5FTkdBR0VEXTogZW5nYWdlZCxcbiAgfTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fCEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICogQHJldHVybiB7IVByb21pc2U8IVNlc3Npb25NYW5hZ2VyPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlc3Npb25TZXJ2aWNlUHJvbWlzZUZvckRvYyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgcmV0dXJuIC8qKiBAdHlwZSB7IVByb21pc2U8IVNlc3Npb25NYW5hZ2VyPn0gKi8gKFxuICAgIGdldFNlcnZpY2VQcm9taXNlRm9yRG9jKGVsZW1lbnRPckFtcERvYywgJ2FtcC1hbmFseXRpY3Mtc2Vzc2lvbicpXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxTZXNzaW9uU2VydmljZUZvclRlc3RpbmcoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoYW1wZG9jLCAnYW1wLWFuYWx5dGljcy1zZXNzaW9uJywgU2Vzc2lvbk1hbmFnZXIpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/session-manager.js