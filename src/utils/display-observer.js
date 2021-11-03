import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {containsNotSelf} from '#core/dom';
import {rethrowAsync} from '#core/error';
import {pushIfNotExist, removeItem} from '#core/types/array';

import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from '../service-helpers';

const SERVICE_ID = 'DisplayObserver';

const DISPLAY_THRESHOLD = 0.51;

const CUSTOM_CONTAINER_OFFSET = 2;

/**
 * @typedef {function(boolean, !Element)}
 */
let ObserverCallbackDef;

/**
 * @typedef {{
 *   container: ?Element,
 *   root: ?Element,
 *   contains: function(!Element):boolean,
 *   io: ?IntersectionObserver,
 * }}
 */
let ObserverDef;

/**
 * Observes whether the specified target is displayable. The initial observation
 * is returned shortly after observing, and subsequent observations are
 * returned when the target's displayable state changes.
 *
 * The element is displayable if:
 * 1. It doesn't have `display: none` style or `hidden` attribute.
 * 2. It intersects with the main document's scroller by at least 51%. This
 *    means if the element is offset from the main scroller using
 *    `translateX(-1000px)`, it's not displayable. Another example, if the
 *    element is nested inside another scroller and scrolled off the screen.
 *    However, if an element is inside the main document's scroller, but simply
 *    not in the viewport, it's considered to be "displayable".
 *
 * @param {!Element} target
 * @param {!ObserverCallbackDef} callback
 */
export function observeDisplay(target, callback) {
  getObserver(target).observe(target, callback);
}

/**
 * @param {!Element} target
 * @param {!ObserverCallbackDef} callback
 */
export function unobserveDisplay(target, callback) {
  getObserver(target).unobserve(target, callback);
}

/**
 * @param {!Element} target
 * @return {!Promise<boolean>}
 */
export function measureDisplay(target) {
  const observer = getObserver(target);
  return new Promise((resolve) => {
    const onDisplay = (display) => {
      resolve(display);
      observer.unobserve(target, onDisplay);
    };
    observer.observe(target, onDisplay);
  });
}

/**
 * Registers the container to provide additional display intersection info
 * for other targets. Mainly aimed for fixed and/or scrollable containers
 * that can provide display information in addition to the document flow.
 *
 * @param {!Element} container
 * @param {?Element=} opt_root The subelement inside the container to be
 * used as an intersection root. If not specified, the container will be
 * used as an intersection root.
 */
export function registerContainer(container, opt_root) {
  getObserver(container).registerContainer(container, opt_root);
}

/**
 * @param {!Element} container
 */
export function unregisterContainer(container) {
  getObserver(container).unregisterContainer(container);
}

/**
 * @implements {Disposable}
 * @visibleForTesting
 * @package
 */
export class DisplayObserver {
  /**
   * @param {!AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    const {win} = ampdoc;
    const body = ampdoc.getBody();

    this.observed_ = this.observed_.bind(this);
    this.containerObserved_ = this.containerObserved_.bind(this);

    /** @private @const {!Array<!ObserverDef>} */
    this.observers_ = [];

    // Viewport observer is only needed because `postion:fixed` elements
    // are not observable by a documentElement or body's root.
    this.observers_.push({
      container: null,
      root: null,
      contains: () => true,
      io: new win.IntersectionObserver(this.observed_, {
        threshold: DISPLAY_THRESHOLD,
      }),
    });

    // Body observer: very close to `display:none` observer.
    this.observers_.push({
      container: body,
      root: body,
      contains: () => true,
      io: new win.IntersectionObserver(this.observed_, {
        root: body,
        threshold: DISPLAY_THRESHOLD,
      }),
    });

    /** @private {boolean} */
    this.isDocDisplay_ = computeDocIsDisplayed(ampdoc.getVisibilityState());

    /** @private {?UnlistenDef} */
    this.visibilityUnlisten_ = ampdoc.onVisibilityChanged(() => {
      const display = computeDocIsDisplayed(ampdoc.getVisibilityState());
      if (display !== this.isDocDisplay_) {
        this.isDocDisplay_ = display;
        this.docVisibilityChanged_();
      }
    });

    /** @private @const {!Map<!Element, !Array<!ObserverCallbackDef>>} */
    this.targetObserverCallbacks_ = new Map();

    /** @private @const {!Map<!Element, !Array<boolean>>} */
    this.targetObservations_ = new Map();
  }

  /** @override */
  dispose() {
    this.observers_.forEach((observer) => {
      if (observer.io) {
        observer.io.disconnect();
      }
    });
    this.observers_.length = 0;
    this.visibilityUnlisten_();
    this.visibilityUnlisten_ = null;
    this.targetObserverCallbacks_.clear();
    this.targetObservations_.clear();
  }

  /**
   * @param {!Element} container
   * @param {?Element=} opt_root
   */
  registerContainer(container, opt_root) {
    const existing = findObserverByContainer(this.observers_, container);
    if (existing != -1) {
      return;
    }

    /** @type {!ObserverDef} */
    const observer = {
      container,
      root: opt_root || container,
      contains: (target) => containsNotSelf(container, target),
      // Start with null as IntersectionObserver. Will be initialized when
      // the container itself becomes displayed.
      io: null,
    };
    const index = this.observers_.length;
    this.observers_.push(observer);
    this.observe(container, this.containerObserved_);

    this.targetObserverCallbacks_.forEach((_, target) => {
      // Reset observation to `null` and wait for the actual measurement.
      const value = observer.contains(target) ? null : false;
      this.setObservation_(target, index, value, /* callbacks */ null);
    });
  }

  /**
   * @param {!Element} container
   */
  unregisterContainer(container) {
    const index = findObserverByContainer(this.observers_, container);
    if (index < CUSTOM_CONTAINER_OFFSET) {
      // The container has been unregistered already.
      return;
    }

    // Remove observer.
    const observer = this.observers_[index];
    this.observers_.splice(index, 1);
    if (observer.io) {
      observer.io.disconnect();
    }

    // Unobserve the container itself.
    this.unobserve(container, this.containerObserved_);

    // Remove observations.
    this.targetObserverCallbacks_.forEach((callbacks, target) => {
      const observations = this.targetObservations_.get(target);
      if (!observations || observations.length <= index) {
        return;
      }
      const oldDisplay = computeDisplay(observations, this.isDocDisplay_);
      observations.splice(index, 1);
      const newDisplay = computeDisplay(observations, this.isDocDisplay_);
      notifyIfChanged(callbacks, target, newDisplay, oldDisplay);
    });
  }

  /**
   * @param {!Element} target
   * @param {!ObserverCallbackDef} callback
   */
  observe(target, callback) {
    let callbacks = this.targetObserverCallbacks_.get(target);
    if (!callbacks) {
      callbacks = [];
      this.targetObserverCallbacks_.set(target, callbacks);

      // Subscribe observers.
      for (let i = 0; i < this.observers_.length; i++) {
        const observer = this.observers_[i];
        if (observer.io && observer.contains(target)) {
          // Reset observation to `null` and wait for the actual measurement.
          this.setObservation_(target, i, null, /* callbacks */ null);
          observer.io.observe(target);
        } else {
          // The `false` value will essentially ignore this observe when
          // computing the display value.
          this.setObservation_(target, i, false, /* callbacks */ null);
        }
      }
    }
    if (pushIfNotExist(callbacks, callback)) {
      if (this.targetObservations_.has(target)) {
        // Notify the existing observation immediately.
        setTimeout(() => {
          const display = computeDisplay(
            this.targetObservations_.get(target),
            this.isDocDisplay_
          );
          if (display != null) {
            callCallbackNoInline(callback, target, display);
          }
        });
      }
    }
  }

  /**
   * @param {!Element} target
   * @param {!ObserverCallbackDef} callback
   */
  unobserve(target, callback) {
    const callbacks = this.targetObserverCallbacks_.get(target);
    if (!callbacks) {
      return;
    }
    removeItem(callbacks, callback);
    if (callbacks.length == 0) {
      this.targetObserverCallbacks_.delete(target);
      this.targetObservations_.delete(target);
      for (let i = 0; i < this.observers_.length; i++) {
        const observer = this.observers_[i];
        if (observer.io) {
          observer.io.unobserve(target);
        }
      }
    }
  }

  /** @private */
  docVisibilityChanged_() {
    this.targetObserverCallbacks_.forEach((callbacks, target) => {
      const observations = this.targetObservations_.get(target);
      const oldDisplay = computeDisplay(observations, !this.isDocDisplay_);
      const newDisplay = computeDisplay(observations, this.isDocDisplay_);
      notifyIfChanged(callbacks, target, newDisplay, oldDisplay);
    });
  }

  /**
   * @param {boolean} isDisplayed
   * @param {!Element} container
   * @private
   */
  containerObserved_(isDisplayed, container) {
    const index = findObserverByContainer(this.observers_, container);
    if (index < CUSTOM_CONTAINER_OFFSET) {
      // The container has been unregistered already.
      return;
    }

    const observer = this.observers_[index];
    if (isDisplayed && observer.io) {
      // Has already been initialized.
      return;
    }

    if (isDisplayed) {
      const {win} = this.ampdoc_;
      observer.io = new win.IntersectionObserver(this.observed_, {
        root: observer.root,
        threshold: DISPLAY_THRESHOLD,
      });
    } else if (observer.io) {
      observer.io.disconnect();
      observer.io = null;
    }

    this.targetObserverCallbacks_.forEach((callbacks, target) => {
      if (observer.io && observer.contains(target)) {
        // Reset observation to `null` and wait for the actual measurement.
        this.setObservation_(target, index, null, callbacks);
        observer.io.observe(target);
      } else {
        this.setObservation_(target, index, false, callbacks);
      }
    });
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @param {!IntersectionObserver} io
   * @private
   */
  observed_(entries, io) {
    const seen = new Set();
    for (let i = entries.length - 1; i >= 0; i--) {
      const {isIntersecting, target} = entries[i];
      if (seen.has(target)) {
        continue;
      }
      seen.add(target);
      const callbacks = this.targetObserverCallbacks_.get(target);
      const index = findObserverByIo(this.observers_, io);
      if (!callbacks || index == -1) {
        continue;
      }
      this.setObservation_(target, index, isIntersecting, callbacks);
    }
  }

  /**
   * @param {!Element} target
   * @param {number} index
   * @param {?boolean} value
   * @param {?Array<!ObserverCallbackDef>} callbacks
   * @private
   */
  setObservation_(target, index, value, callbacks) {
    let observations = this.targetObservations_.get(target);
    if (!observations) {
      const observers = this.observers_;
      observations = new Array(observers.length);
      for (let i = 0; i < observers.length; i++) {
        observations[i] = observers[i].io ? null : false;
      }
      this.targetObservations_.set(target, observations);
    }

    if (callbacks) {
      const oldDisplay = computeDisplay(observations, this.isDocDisplay_);
      observations[index] = value;
      const newDisplay = computeDisplay(observations, this.isDocDisplay_);
      notifyIfChanged(callbacks, target, newDisplay, oldDisplay);
    } else {
      observations[index] = value;
    }
  }
}

/**
 * @param {!Element} target
 * @return {!DisplayObserver}
 */
function getObserver(target) {
  registerServiceBuilderForDoc(target, SERVICE_ID, DisplayObserver);
  return /** @type {!DisplayObserver} */ (getServiceForDoc(target, SERVICE_ID));
}

/**
 * @param {?Array<boolean>} observations
 * @param {boolean} isDocDisplay
 * @return {?boolean}
 */
function computeDisplay(observations, isDocDisplay) {
  if (!isDocDisplay) {
    return false;
  }
  if (!observations || observations.length == 0) {
    // Unknown yet.
    return null;
  }
  return observations.reduce(displayReducer);
}

/**
 * @param {!VisibilityState_Enum} visibilityState
 * @return {boolean}
 */
function computeDocIsDisplayed(visibilityState) {
  return (
    visibilityState == VisibilityState_Enum.VISIBLE ||
    // The document is still considered "displayed" or at least "displayable"
    // when it's hidden (tab is switched). Only prerender/paused/inactive
    // states require pause of resources.
    visibilityState == VisibilityState_Enum.HIDDEN
  );
}

/**
 * @param {?boolean} acc
 * @param {?boolean|undefined} value
 * @return {?boolean}
 */
function displayReducer(acc, value) {
  if (acc || value) {
    // OR condition: one true - the result is true.
    return true;
  }
  if (acc === false && value === false) {
    // Reverse of OR: both must be false for the result to be false.
    return false;
  }
  // Unknown.
  return null;
}

/**
 * @param {!Array<!ObserverDef>} observers
 * @param {!IntersectionObserver} io
 * @return {number}
 */
function findObserverByIo(observers, io) {
  for (let i = 0; i < observers.length; i++) {
    if (observers[i].io === io) {
      return i;
    }
  }
  return -1;
}

/**
 * @param {!Array<!ObserverDef>} observers
 * @param {!Element} container
 * @return {number}
 */
function findObserverByContainer(observers, container) {
  for (let i = 0; i < observers.length; i++) {
    if (observers[i].container === container) {
      return i;
    }
  }
  return -1;
}

/**
 * @param {!Array<function(boolean)>} callbacks
 * @param {!Element} target
 * @param {boolean} newDisplay
 * @param {boolean} oldDisplay
 */
function notifyIfChanged(callbacks, target, newDisplay, oldDisplay) {
  if (newDisplay != null && newDisplay !== oldDisplay) {
    for (let i = 0; i < callbacks.length; i++) {
      callCallbackNoInline(callbacks[i], target, newDisplay);
    }
  }
}

/**
 * @param {!ObserverCallbackDef} callback
 * @param {!Element} target
 * @param {boolean} isDisplayed
 */
function callCallbackNoInline(callback, target, isDisplayed) {
  try {
    callback(isDisplayed, target);
  } catch (e) {
    rethrowAsync(e);
  }
}
