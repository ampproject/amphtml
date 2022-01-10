/**
 * Whether addEventListener supports options or only takes capture as a boolean
 * @type {boolean|undefined}
 * @visibleForTesting
 */
let optsSupported;

/**
 * Whether addEventListener supports options or only takes passive as a boolean
 * @type {boolean|undefined}
 */
let passiveSupported;

/**
 * Options supported by addEventListener
 * @typedef AddEventListenerOptsDef
 * @property {undefined|boolean} [capture]
 * @property {undefined|boolean} [once]
 * @property {undefined|boolean} [passive]
 * @property {undefined|AbortSignal} [signal]
 * }} AddEventListenerOptsDef;
 */

/**
 * Listens for the specified event on the element.
 *
 * Do not use this directly. This method is implemented as a shared
 * dependency. Use `listen()` in either `event-helper` or
 * `#core/3p-frame-messaging`, depending on your use case.
 *
 * @param {EventTarget} element
 * @param {string} eventType
 * @param {function(Event):void} listener
 * @param {AddEventListenerOptsDef=} opt_evtListenerOpts
 * @return {import('#core/types/function/types').UnlistenCallback}
 */
export function internalListenImplementation(
  element,
  eventType,
  listener,
  opt_evtListenerOpts
) {
  let localElement = element;
  let localListener = listener;
  /** @type {?function(Event):void} */
  let wrapped = (event) => {
    try {
      return localListener(event);
    } catch (e) {
      // __AMP_REPORT_ERROR is installed globally per window in the entry point.
      self.__AMP_REPORT_ERROR?.(e);
      throw e;
    }
  };
  const optsSupported = detectEvtListenerOptsSupport();
  const capture = !!opt_evtListenerOpts?.capture;

  localElement.addEventListener(
    eventType,
    wrapped,
    optsSupported ? opt_evtListenerOpts : capture
  );
  return () => {
    localElement?.removeEventListener(
      eventType,
      wrapped,
      optsSupported ? opt_evtListenerOpts : capture
    );
    // Ensure these are GC'd
    /** @type {?} */ (localListener) = null;
    /** @type {?} */ (localElement) = null;
    wrapped = null;
  };
}

/**
 * Tests whether the browser supports options as an argument of addEventListener
 * or not.
 *
 * @return {boolean}
 */
export function detectEvtListenerOptsSupport() {
  // Only run the test once
  if (optsSupported !== undefined) {
    return optsSupported;
  }

  optsSupported = false;
  try {
    // Test whether browser supports EventListenerOptions or not
    const options = {
      get capture() {
        optsSupported = true;
        return false;
      },
    };
    self.addEventListener(
      'test-options',
      /** @type {EventListenerOrEventListenerObject} */ (
        /** @type {?} */ (null)
      ),
      options
    );
    self.removeEventListener(
      'test-options',
      /** @type {EventListenerOrEventListenerObject} */ (
        /** @type {?} */ (null)
      ),
      options
    );
  } catch (err) {
    // EventListenerOptions are not supported
  }
  return optsSupported;
}

/**
 * Resets the test for whether addEventListener supports options or not.
 */
export function resetEvtListenerOptsSupportForTesting() {
  optsSupported = undefined;
}

/**
 * Return boolean. if listener option is supported, return `true`.
 * if not supported, return `false`
 * @param {Window} win
 * @return {boolean}
 */
export function supportsPassiveEventListener(win) {
  if (passiveSupported !== undefined) {
    return passiveSupported;
  }

  passiveSupported = false;
  try {
    const options = /** @type {EventListenerOptions} */ ({
      get passive() {
        // This function will be called when the browser
        // attempts to access the passive property.
        passiveSupported = true;
        return false;
      },
    });

    win.addEventListener(
      'test-options',
      /** @type {EventListenerOrEventListenerObject} */ (
        /** @type {?} */ (null)
      ),
      options
    );
    win.removeEventListener(
      'test-options',
      /** @type {EventListenerOrEventListenerObject} */ (
        /** @type {?} */ (null)
      ),
      options
    );
  } catch (err) {
    // EventListenerOptions are not supported
  }
  return passiveSupported;
}

/**
 * Resets the test for whether addEventListener supports passive options or not.
 */
export function resetPassiveSupportedForTesting() {
  passiveSupported = undefined;
}
