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

import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service';
import {hasOwn, map} from '../../../src/core/types/object';
import {isObject} from '../../../src/core/types';

/** @const {string} */
const TAG = 'amp-analytics/session-manager';

/** @const {string} */
const SESSION_STORAGE_KEY = 'amp-session:';

/**
 * We ignore Sessions that are older than 30 minutes.
 */
export const SESSION_MAX_AGE_MILLIS = 30 * 60 * 1000;

/**
 * Key values for retriving/storing session values
 * @enum {string}
 */
export const SESSION_VALUES = {
  SESSION_ID: 'sessionId',
};

/**
 * Key values for retriving/storing session values
 * @enum {string}
 */
const SESSION_STORAGE_KEYS = {
  SESSION_ID: 'ssid',
  CREATION_TIMESTAMP: 'ct',
};

/**
 * `lastAccessTimestamp` is not stored in localStorage, since
 * that mechanism already handles removing expired sessions.
 * We just keep it so that we don't have to read the value everytime
 * during the same page visit.
 * @typedef {{
 *  sessionId: number,
 *  creationTimestamp: number,
 *  lastAccessTimestamp: number,
 * }}
 */
export let SessionInfoDef;

export class SessionManager {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForDoc(ampdoc);

    /** @private {!Object<string, ?SessionInfoDef>} */
    this.sessions_ = map();
  }

  /**
   * Get the value from the session per the vendor.
   * @param {string|undefined} type
   * @param {SESSION_VALUES} value
   * @return {!Promise<number|undefined>}
   */
  getSessionValue(type, value) {
    return this.get(type).then((session) => {
      return session?.[value];
    });
  }

  /**
   * Get the session for the vendor, checking if it exists or
   * creating it if necessary.
   * @param {string|undefined} type
   * @return {!Promise<SessionInfoDef|null>}
   */
  get(type) {
    if (!type) {
      user().error(TAG, 'Sessions can only be accessed with a vendor type.');
      return Promise.resolve(null);
    }

    if (
      hasOwn(this.sessions_, type) &&
      !this.isSessionExpired_(this.sessions_[type])
    ) {
      this.setSession_(type, this.sessions_[type]);
      this.sessions_[type].lastAccessTimestamp = Date.now();
      return Promise.resolve(this.sessions_[type]);
    }

    return this.getSessionFromStorage_(type);
  }

  /**
   * Get our session if it exists or creates it. Sets the session
   * in localStorage to update the last access time.
   * @param {string} type
   * @return {!Promise<SessionInfoDef>}
   */
  getSessionFromStorage_(type) {
    return this.storagePromise_
      .then((storage) => {
        const storageKey = getStorageKey(type);
        // Gets the session if it has not expired
        return storage.get(storageKey, SESSION_MAX_AGE_MILLIS);
      })
      .then((session) => {
        // If no valid session in storage, create a new one
        return !session
          ? constructSessionInfo(generateSessionId(), Date.now())
          : constructSessionFromStoredValue(session);
      })
      .then((session) => {
        // Avoid multiple session creation race
        if (
          type in this.sessions_ &&
          !this.isSessionExpired_(this.sessions_[type])
        ) {
          return this.sessions_[type];
        }
        this.setSession_(type, session);
        session.lastAccessTimestamp = Date.now();
        this.sessions_[type] = session;
        return this.sessions_[type];
      });
  }

  /**
   * Set the session in localStorage, updating
   * its last access time if it did not exist before.
   * @param {string} type
   * @param {SessionInfoDef} session
   * @return {!Promise}
   */
  setSession_(type, session) {
    return this.storagePromise_.then((storage) => {
      const storageKey = getStorageKey(type);
      const value = composeStorageSessionValue(session);
      storage.setNonBoolean(storageKey, value);
    });
  }

  /**
   * Checks if a session has expired
   * @param {SessionInfoDef} session
   * @return {!Promise}
   */
  isSessionExpired_(session) {
    return session.lastAccessTimestamp + SESSION_MAX_AGE_MILLIS < Date.now();
  }
}

/**
 * Return a pseudorandom low entropy value for session id.
 * @return {number}
 */
function generateSessionId() {
  return Math.floor(10000 * Math.random());
}

/**
 * @param {string} type
 * @return {string}
 */
function getStorageKey(type) {
  return SESSION_STORAGE_KEY + type;
}

/**
 * @param {SessionInfoDef|string} storedSession
 * @return {SessionInfoDef|undefined}
 */
function constructSessionFromStoredValue(storedSession) {
  if (!isObject(storedSession)) {
    dev().error(TAG, 'Invalid stored session value');
    return;
  }

  return constructSessionInfo(
    storedSession[SESSION_STORAGE_KEYS.SESSION_ID],
    storedSession[SESSION_STORAGE_KEYS.CREATION_TIMESTAMP],
    Date.now()
  );
}

/**
 * @param {!SessionInfoDef} session
 * @return {!Object}
 */
export function composeStorageSessionValue(session) {
  const obj = map();
  obj[SESSION_STORAGE_KEYS.SESSION_ID] = session.sessionId;
  obj[SESSION_STORAGE_KEYS.CREATION_TIMESTAMP] = session.creationTimestamp;
  return obj;
}

/**
 * Construct the session info object from values
 * @param {number} sessionId
 * @param {number} creationTimestamp
 * @param {number} lastAccessTimestamp
 * @return {!SessionInfoDef}
 */
function constructSessionInfo(
  sessionId,
  creationTimestamp,
  lastAccessTimestamp
) {
  return {
    'sessionId': sessionId,
    'creationTimestamp': creationTimestamp,
    'lastAccessTimestamp': lastAccessTimestamp,
  };
}

/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<!SessionManager>}
 */
export function sessionServicePromiseForDoc(elementOrAmpDoc) {
  return /** @type {!Promise<!SessionManager>} */ (
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-session')
  );
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installSessionServiceForTesting(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'amp-analytics-session', SessionManager);
}
