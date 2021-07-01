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

import {Services} from '#service';
import {dev, user} from '../../../src/log';
import {
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service-helpers';
import {hasOwn, map} from '#core/types/object';
import {isObject} from '#core/types';

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
  CREATION_TIMESTAMP: 'creationTimestamp',
  ACCESS_TIMESTAMP: 'accessTimestamp',
  ENGAGED: 'engaged',
  EVENT_TIMESTAMP: 'eventTimestamp',
  COUNT: 'count',
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
    return this.get(type).then((session) => session?.[value]);
  }

  /**
   * Updates EventTimestamp and/or Engaged for this session,
   * asynchronously as a callback to avoid duplicate writing,
   * when the session is retrieved or created.
   * @param {string} type
   * @param {boolean} persistEvent
   * @param {boolean} persistEngaged
   * @return {!Promise}
   */
  updateEvent(type, persistEvent, persistEngaged) {
    return this.get(type, (session) => {
      if (persistEvent) {
        session[SESSION_VALUES.EVENT_TIMESTAMP] = Date.now();
      }
      if (persistEngaged) {
        session[SESSION_VALUES.ENGAGED] = true;
      }
    });
  }

  /**
   * Get the session for the vendor, checking if it exists or
   * creating it if necessary.
   * @param {string|undefined} type
   * @param {Function=} opt_processing
   * @return {!Promise<?SessionInfoDef>}
   */
  get(type, opt_processing) {
    if (!type) {
      user().error(TAG, 'Sessions can only be accessed with a vendor type.');
      return Promise.resolve(null);
    }

    if (
      hasOwn(this.sessions_, type) &&
      !isSessionExpired(this.sessions_[type])
    ) {
      this.sessions_[type] = this.updateSession_(this.sessions_[type]);
      opt_processing?.(this.sessions_[type]);
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
  getOrCreateSession_(type, opt_processing) {
    return this.storagePromise_
      .then((storage) => {
        const storageKey = getStorageKey(type);
        return storage.get(storageKey);
      })
      .then((session) => {
        // Either create session or update it
        return !session
          ? constructSessionInfo()
          : this.updateSession_(constructSessionFromStoredValue(session));
      })
      .then((session) => {
        // Avoid multiple session creation race
        if (type in this.sessions_ && !isSessionExpired(this.sessions_[type])) {
          return this.sessions_[type];
        }
        opt_processing?.(session);
        this.setSession_(type, session);
        this.sessions_[type] = session;
        return this.sessions_[type];
      });
  }

  /**
   * Check if session has expired and reset/update values (id, count) if so.
   * Also update `accessTimestamp`.
   * @param {!SessionInfoDef} session
   * @return {!SessionInfoDef}
   */
  updateSession_(session) {
    const currentCount = session[SESSION_VALUES.COUNT];
    const now = Date.now();
    if (isSessionExpired(session)) {
      const newSessionCount = (currentCount ?? 0) + 1;
      session = constructSessionInfo(newSessionCount);
    } else if (currentCount === undefined) {
      session[SESSION_VALUES.COUNT] = 1;
    }
    session[SESSION_VALUES.ACCESS_TIMESTAMP] = now;
    return session;
  }

  /**
   * Set the session in localStorage, updating
   * its access time if it did not exist before.
   * @param {string} type
   * @param {SessionInfoDef} session
   * @return {!Promise}
   */
  setSession_(type, session) {
    return this.storagePromise_.then((storage) => {
      const storageKey = getStorageKey(type);
      storage.setNonBoolean(storageKey, session);
    });
  }
}

/**
 * Checks if a session has expired
 * @param {SessionInfoDef} session
 * @return {boolean}
 */
function isSessionExpired(session) {
  const accessTimestamp = session[SESSION_VALUES.ACCESS_TIMESTAMP];
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
  if (!isObject(storedSession)) {
    dev().error(TAG, 'Invalid stored session value');
    return constructSessionInfo();
  }

  return {
    [SESSION_VALUES.SESSION_ID]: storedSession[SESSION_VALUES.SESSION_ID],
    [SESSION_VALUES.CREATION_TIMESTAMP]:
      storedSession[SESSION_VALUES.CREATION_TIMESTAMP],
    [SESSION_VALUES.COUNT]: storedSession[SESSION_VALUES.COUNT],
    [SESSION_VALUES.ACCESS_TIMESTAMP]:
      storedSession[SESSION_VALUES.ACCESS_TIMESTAMP],
    [SESSION_VALUES.EVENT_TIMESTAMP]:
      storedSession[SESSION_VALUES.EVENT_TIMESTAMP],
    [SESSION_VALUES.ENGAGED]: storedSession[SESSION_VALUES.ENGAGED] ?? false,
  };
}

/**
 * Constructs a new SessionInfoDef object
 * @param {number=} count
 * @return {!SessionInfoDef}
 */
function constructSessionInfo(count = 1) {
  return {
    [SESSION_VALUES.SESSION_ID]: generateSessionId(),
    [SESSION_VALUES.CREATION_TIMESTAMP]: Date.now(),
    [SESSION_VALUES.ACCESS_TIMESTAMP]: Date.now(),
    [SESSION_VALUES.COUNT]: count,
    [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
    [SESSION_VALUES.ENGAGED]: false,
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
