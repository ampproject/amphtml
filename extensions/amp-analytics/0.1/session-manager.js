import {isDocumentHidden} from '#core/document/visibility';
import {isObject} from '#core/types';
import {hasOwn, map} from '#core/types/object';

import {Services} from '#service';

import {listen} from '#utils/event-helper';
import {dev, user} from '#utils/log';

import {
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service-helpers';

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

/**
 * @implements {../../../src/service.Disposable}
 */
export class SessionManager {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForDoc(ampdoc);

    /** @private {!{[key: string]: ?SessionInfoDef}} */
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
  init_() {
    this.setInitialEngagedSignals_();
    this.unlisteners_.push(
      listen(this.win_, 'focus', () => {
        this.isFocused_ = true;
        this.updateEngagedForSessions_();
      }),
      listen(this.win_, 'blur', () => {
        this.isFocused_ = false;
        this.updateEngagedForSessions_();
      }),
      listen(this.win_, 'pageshow', () => {
        this.isOpen_ = true;
        this.updateEngagedForSessions_();
      }),
      listen(this.win_, 'pagehide', () => {
        this.isOpen_ = false;
        this.updateEngagedForSessions_();
      }),
      this.ampdoc_.onVisibilityChanged(() => {
        this.isVisible_ = this.ampdoc_.isVisible();
        this.updateEngagedForSessions_();
      })
    );
  }

  /** Sets the initial states of the engaged signals used for all sessions. */
  setInitialEngagedSignals_() {
    this.isFocused_ = this.win_.document.hasFocus();
    this.isVisible_ = !isDocumentHidden(this.win_.document);
  }

  /** Sets the engaged session value for all sessions and persists. */
  updateEngagedForSessions_() {
    Object.keys(this.sessions_).forEach((key) => {
      const session = this.sessions_[key];
      session[SESSION_VALUES.ENGAGED] = this.getEngagedValue_();
      this.setSession_(key, session);
    });
  }

  /** @override */
  dispose() {
    this.unlisteners_.forEach((unlisten) => {
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
  getSessionValue(type, value) {
    return this.get(type).then((session) => session?.[value]);
  }

  /**
   * Updates EventTimestamp for this session,
   * asynchronously as a callback to avoid duplicate writing,
   * when the session is retrieved or created.
   * @param {string} type
   * @return {!Promise}
   */
  updateEvent(type) {
    return this.get(type, (session) => {
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
          ? constructSessionInfo(this.getEngagedValue_())
          : this.updateSession_(constructSessionFromStoredValue(session), true);
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
   * Sets the initial engaged singals if this session is a continuation and
   * was not debounced.
   * @param {!SessionInfoDef} session
   * @param {boolean=} opt_usePersistedEngaged
   * @return {!SessionInfoDef}
   */
  updateSession_(session, opt_usePersistedEngaged) {
    const currentCount = session[SESSION_VALUES.COUNT];
    const now = Date.now();
    if (isSessionExpired(session)) {
      const newSessionCount = (currentCount ?? 0) + 1;
      session = constructSessionInfo(this.getEngagedValue_(), newSessionCount);
    } else {
      const previouslyEngaged =
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

  /** Gets the most recent engaged value */
  getEngagedValue_() {
    return this.isOpen_ && this.isVisible_ && this.isFocused_;
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
    [SESSION_VALUES.ENGAGED]: storedSession[SESSION_VALUES.ENGAGED] ?? true,
  };
}

/**
 * Constructs a new SessionInfoDef object
 * @param {boolean} engaged
 * @param {number=} count
 * @return {!SessionInfoDef}
 */
function constructSessionInfo(engaged, count = 1) {
  return {
    [SESSION_VALUES.SESSION_ID]: generateSessionId(),
    [SESSION_VALUES.CREATION_TIMESTAMP]: Date.now(),
    [SESSION_VALUES.ACCESS_TIMESTAMP]: Date.now(),
    [SESSION_VALUES.COUNT]: count,
    [SESSION_VALUES.EVENT_TIMESTAMP]: undefined,
    [SESSION_VALUES.ENGAGED]: engaged,
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
