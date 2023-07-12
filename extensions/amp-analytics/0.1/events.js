import {CommonSignals_Enum} from '#core/constants/common-signals';
import {Observable} from '#core/data-structures/observable';
import {Deferred} from '#core/data-structures/promise';
import {getDataParamsFromAttributes} from '#core/dom';
import {isAmpElement} from '#core/dom/amp-element-helpers';
import {isArray, isEnumValue, isFiniteNumber} from '#core/types';
import {enumValues} from '#core/types/enum';
import {debounce} from '#core/types/function';
import {deepMerge, hasOwn} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {getData} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {
  PlayingStates_Enum,
  VideoAnalyticsEvents_Enum,
  videoAnalyticsCustomEventTypeKey,
} from '../../../src/video-interface';

const SCROLL_PRECISION_PERCENT = 5;
const VAR_H_SCROLL_BOUNDARY = 'horizontalScrollBoundary';
const VAR_V_SCROLL_BOUNDARY = 'verticalScrollBoundary';
const MIN_TIMER_INTERVAL_SECONDS = 0.5;
const DEFAULT_MAX_TIMER_LENGTH_SECONDS = 7200;
const VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;
const NO_UNLISTEN = function () {};
const TAG = 'amp-analytics/events';
const SESSION_DEBOUNCE_TIME_MS = 500;

/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */
export const AnalyticsEventType = {
  CLICK: 'click',
  BROWSER_EVENT: 'browser-event',
  CUSTOM: 'custom',
  HIDDEN: 'hidden',
  INI_LOAD: 'ini-load',
  RENDER_START: 'render-start',
  SCROLL: 'scroll',
  STORY: 'story',
  TIMER: 'timer',
  VIDEO: 'video',
  VISIBLE: 'visible',
};

const BrowserEventType = {
  BLUR: 'blur',
  CHANGE: 'change',
};

const ALLOWED_FOR_ALL_ROOT_TYPES = ['ampdoc', 'embed'];

/**
 * Events that can result in analytics data to be sent.
 * @const {!Object<string, {
 *     name: string,
 *     allowedFor: !Array<string>,
 *     klass: typeof ./events.EventTracker
 *   }>}
 */
const TRACKER_TYPE = Object.freeze({
  [AnalyticsEventType.CLICK]: {
    name: AnalyticsEventType.CLICK,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
    // Escape the temporal dead zone by not referencing a class directly.
    klass: function (root) {
      return new ClickEventTracker(root);
    },
  },
  [AnalyticsEventType.BROWSER_EVENT]: {
    name: AnalyticsEventType.BROWSER_EVENT,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
    // Escape the temporal dead zone by not referencing a class directly.
    klass: function (root) {
      return new BrowserEventTracker(root);
    },
  },
  [AnalyticsEventType.CUSTOM]: {
    name: AnalyticsEventType.CUSTOM,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
    klass: function (root) {
      return new CustomEventTracker(root);
    },
  },
  [AnalyticsEventType.HIDDEN]: {
    name: AnalyticsEventType.VISIBLE, // Reuse tracker with visibility
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
    klass: function (root) {
      return new VisibilityTracker(root);
    },
  },
  [AnalyticsEventType.INI_LOAD]: {
    name: AnalyticsEventType.INI_LOAD,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer', 'visible']),
    klass: function (root) {
      return new IniLoadTracker(root);
    },
  },
  [AnalyticsEventType.RENDER_START]: {
    name: AnalyticsEventType.RENDER_START,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer', 'visible']),
    klass: function (root) {
      return new SignalTracker(root);
    },
  },
  [AnalyticsEventType.SCROLL]: {
    name: AnalyticsEventType.SCROLL,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
    klass: function (root) {
      return new ScrollEventTracker(root);
    },
  },
  [AnalyticsEventType.STORY]: {
    name: AnalyticsEventType.STORY,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: function (root) {
      return new AmpStoryEventTracker(root);
    },
  },
  [AnalyticsEventType.TIMER]: {
    name: AnalyticsEventType.TIMER,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
    klass: function (root) {
      return new TimerEventTracker(root);
    },
  },
  [AnalyticsEventType.VIDEO]: {
    name: AnalyticsEventType.VIDEO,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
    klass: function (root) {
      return new VideoEventTracker(root);
    },
  },
  [AnalyticsEventType.VISIBLE]: {
    name: AnalyticsEventType.VISIBLE,
    allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
    klass: function (root) {
      return new VisibilityTracker(root);
    },
  },
});

/** @visibleForTesting */
export const trackerTypeForTesting = TRACKER_TYPE;

/**
 * @param {string} triggerType
 * @return {boolean}
 */
function isAmpStoryTriggerType(triggerType) {
  return triggerType.startsWith('story');
}

/**
 * Assert that the selectors are all unique
 * @param {!Array<string>|string} selectors
 */
function assertUniqueSelectors(selectors) {
  userAssert(
    !isArray(selectors) || new Set(selectors).size === selectors.length,
    'Cannot have duplicate selectors in selectors list: %s',
    selectors
  );
}

/**
 * @param {string} triggerType
 * @return {boolean}
 */
function isVideoTriggerType(triggerType) {
  return triggerType.startsWith('video');
}

/**
 * @param {string} triggerType
 * @return {boolean}
 */
function isCustomBrowserTriggerType(triggerType) {
  return isEnumValue(BrowserEventType, triggerType);
}

/**
 * @param {string} triggerType
 * @return {boolean}
 */
function isReservedTriggerType(triggerType) {
  return isEnumValue(AnalyticsEventType, triggerType);
}

/**
 * @param {string} eventType
 * @return {string}
 */
export function getTrackerKeyName(eventType) {
  if (isVideoTriggerType(eventType)) {
    return AnalyticsEventType.VIDEO;
  }
  if (isCustomBrowserTriggerType(eventType)) {
    return AnalyticsEventType.BROWSER_EVENT;
  }
  if (isAmpStoryTriggerType(eventType)) {
    return AnalyticsEventType.STORY;
  }
  if (!isReservedTriggerType(eventType)) {
    return AnalyticsEventType.CUSTOM;
  }
  return hasOwn(TRACKER_TYPE, eventType)
    ? TRACKER_TYPE[eventType].name
    : eventType;
}

/**
 * @param {string} parentType
 * @return {!{[key: string]: typeof EventTracker}}
 */
export function getTrackerTypesForParentType(parentType) {
  const filtered = {};
  Object.keys(TRACKER_TYPE).forEach((key) => {
    if (
      hasOwn(TRACKER_TYPE, key) &&
      TRACKER_TYPE[key].allowedFor.indexOf(parentType) != -1
    ) {
      filtered[key] = TRACKER_TYPE[key].klass;
    }
  });
  return filtered;
}

/**
 * Expand the event variables to include default data-vars
 * eventVars value will override data-vars value
 * @param {!Element} target
 * @param {!JsonObject} eventVars
 * @return {!JsonObject}
 */
function mergeDataVars(target, eventVars) {
  const vars = getDataParamsFromAttributes(
    target,
    /* computeParamNameFunc */
    undefined,
    VARIABLE_DATA_ATTRIBUTE_KEY
  );
  // Merge eventVars into vars, depth=0 because
  // vars and eventVars are not supposed to contain nested object.
  deepMerge(vars, eventVars, 0);
  return vars;
}

/**
 * @interface
 */
class SignalTrackerDef {
  /**
   * @param {string} unusedEventType
   * @return {!Promise}
   */
  getRootSignal(unusedEventType) {}

  /**
   * @param {string} unusedEventType
   * @param {!Element} unusedElement
   * @return {!Promise}
   */
  getElementSignal(unusedEventType, unusedElement) {}
}

/**
 * The analytics event.
 * @dict
 */
export class AnalyticsEvent {
  /**
   * @param {!Element} target The most relevant target element.
   * @param {string} type The type of event.
   * @param {!JsonObject} vars A map of vars and their values.
   * @param {boolean} enableDataVars A boolean to indicate if data-vars-*
   * attribute value from target element should be included.
   */
  constructor(target, type, vars = {}, enableDataVars = true) {
    /** @const */
    this['target'] = target;
    /** @const */
    this['type'] = type;
    /** @const */
    this['vars'] = enableDataVars ? mergeDataVars(target, vars) : vars;
  }
}

/**
 * The base class for all trackers. A tracker tracks all events of the same
 * type for a single analytics root.
 *
 * @implements {../../../src/service.Disposable}
 * @abstract
 * @visibleForTesting
 */
export class EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    /** @const */
    this.root = root;
  }

  /** @override @abstract */
  dispose() {}

  /**
   * @param {!Element} unusedContext
   * @param {string} unusedEventType
   * @param {!JsonObject} unusedConfig
   * @param {function(!AnalyticsEvent)} unusedListener
   * @return {!UnlistenDef}
   * @abstract
   */
  add(unusedContext, unusedEventType, unusedConfig, unusedListener) {}
}

/**
 * Tracks browser events as a pass-through.
 */
export class BrowserEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @private {?Observable<!Event>} */
    this.observables_ = new Observable();

    /** @private {!{[key: BrowserEventType]: boolean}} */
    this.listenerMap_ = {};

    /** @private {?function(!Event)} */
    this.boundOnSession_ = this.observables_.fire.bind(this.observables_);

    /** @private {?function(!Event):void} */
    this.debouncedBoundOnSession_ = debounce(
      this.root.ampdoc.win,
      this.boundOnSession_,
      SESSION_DEBOUNCE_TIME_MS
    );
  }

  /** @override */
  dispose() {
    const root = this.root.getRoot();
    Object.keys(this.listenerMap_).forEach((eventName) => {
      root.removeEventListener(eventName, this.debouncedBoundOnSession_);
    });
    this.boundOnSession_ = null;
    this.observables_ = null;
  }

  /** @override */
  add(context, eventType, config, listener) {
    userAssert(
      isExperimentOn(this.root.ampdoc.win, 'analytics-browser-events'),
      'expected global "analytics-browser-events" experiment to be enabled'
    );

    const {
      'on': eventName,
      'selectionMethod': selectionMethod = null,
      'selector': selector,
    } = config;
    userAssert(
      selector?.length,
      'Missing required selector on browser event trigger'
    );
    assertUniqueSelectors(selector);
    const targetPromises = this.root.getElements(
      context,
      selector,
      selectionMethod,
      false
    );
    if (!this.listenerMap_[eventName]) {
      this.root
        .getRootElement()
        .addEventListener(eventName, this.debouncedBoundOnSession_, true);
      this.listenerMap_[eventName] = true;
    }
    return this.observables_.add((event) => {
      if (event.type !== eventName) {
        return;
      }
      targetPromises.then((targets) => {
        targets.forEach((target) => {
          const el = event.target;
          if (!target.contains(el)) {
            return;
          }
          // TODO(kalemuw): Allowlist properties from event.detail to pass as vars.
          listener(new AnalyticsEvent(target, eventName, {}));
        });
      });
    });
  }
}
/**
 * Tracks custom events.
 */
export class CustomEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);
    /** @const @private {!{[key: string]: !Observable<!AnalyticsEvent>}} */
    this.observables_ = {};
    /**
     * Early events have to be buffered because there's no way to predict
     * how fast all `amp-analytics` elements will be instrumented.
     * @private {!{[key: string]: !Array<!AnalyticsEvent>>|undefined}}
     */
    this.buffer_ = {};

    /**
     * Sandbox events get their own buffer, because handler to those events will
     * be added after parent element's layout. (Time varies, can be later than
     * 10s) sandbox events buffer will never expire but will cleared when
     * handler is ready.
     * @private {!{[key: string]: !Array<!AnalyticsEvent>|undefined>|undefined}}
     */
    this.sandboxBuffer_ = {};

    // Stop buffering of custom events after 10 seconds. Assumption is that all
    // `amp-analytics` elements will have been instrumented by this time.
    setTimeout(() => {
      this.buffer_ = undefined;
    }, 10000);
  }

  /** @override */
  dispose() {
    this.buffer_ = undefined;
    this.sandboxBuffer_ = undefined;
    for (const k in this.observables_) {
      this.observables_[k].removeAll();
    }
  }

  /** @override */
  add(context, eventType, config, listener) {
    let selector = config['selector'];
    if (!selector) {
      selector = ':root';
    }
    const selectionMethod = config['selectionMethod'] || null;

    const targetReady = this.root.getElement(
      context,
      selector,
      selectionMethod
    );

    const isSandboxEvent = eventType.startsWith('sandbox-');

    // Push recent events if any.
    const buffer = isSandboxEvent
      ? this.sandboxBuffer_ && this.sandboxBuffer_[eventType]
      : this.buffer_ && this.buffer_[eventType];

    if (buffer) {
      const bufferLength = buffer.length;
      targetReady.then((target) => {
        setTimeout(() => {
          for (let i = 0; i < bufferLength; i++) {
            const event = buffer[i];
            if (target.contains(event['target'])) {
              listener(event);
            }
          }
          if (isSandboxEvent) {
            // We assume sandbox event will only has single listener.
            // It is safe to clear buffer once handler is ready.
            this.sandboxBuffer_[eventType] = undefined;
          }
        }, 1);
      });
    }

    let observables = this.observables_[eventType];
    if (!observables) {
      observables = new Observable();
      this.observables_[eventType] = observables;
    }

    return this.observables_[eventType].add((event) => {
      // Wait for target selected
      targetReady.then((target) => {
        if (target.contains(event['target'])) {
          listener(event);
        }
      });
    });
  }

  /**
   * Triggers a custom event for the associated root.
   * @param {!AnalyticsEvent} event
   */
  trigger(event) {
    const eventType = event['type'];
    const isSandboxEvent = eventType.startsWith('sandbox-');
    const observables = this.observables_[eventType];

    // If listeners already present - trigger right away.
    if (observables) {
      observables.fire(event);
      if (isSandboxEvent) {
        // No need to buffer sandbox event if handler ready
        return;
      }
    }

    // Create buffer and enqueue buffer if needed
    if (isSandboxEvent) {
      this.sandboxBuffer_[eventType] = this.sandboxBuffer_[eventType] || [];
      this.sandboxBuffer_[eventType].push(event);
    } else {
      // Check if buffer has expired
      if (this.buffer_) {
        this.buffer_[eventType] = this.buffer_[eventType] || [];
        this.buffer_[eventType].push(event);
      }
    }
  }
}

// TODO(Enriqe): If needed, add support for sandbox story event.
// (e.g. sandbox-story-xxx).
export class AmpStoryEventTracker extends CustomEventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);
  }

  /** @override */
  add(context, eventType, config, listener) {
    const rootTarget = this.root.getRootElement();

    // Fire buffered events if any.
    const buffer = this.buffer_ && this.buffer_[eventType];
    if (buffer) {
      const bufferLength = buffer.length;

      for (let i = 0; i < bufferLength; i++) {
        const event = buffer[i];
        this.fireListener_(event, rootTarget, config, listener);
      }
    }

    let observables = this.observables_[eventType];
    if (!observables) {
      observables = new Observable();
      this.observables_[eventType] = observables;
    }

    return this.observables_[eventType].add((event) => {
      this.fireListener_(event, rootTarget, config, listener);
    });
  }

  /**
   * Fires listener given the specified configuration.
   * @param {!AnalyticsEvent} event
   * @param {!Element} rootTarget
   * @param {!JsonObject} config
   * @param {function(!AnalyticsEvent)} listener
   */
  fireListener_(event, rootTarget, config, listener) {
    const type = event['type'];
    const vars = event['vars'];

    const storySpec = config['storySpec'] || {};
    const repeat =
      storySpec['repeat'] === undefined ? true : storySpec['repeat'];
    const eventDetails = vars['eventDetails'];
    const tagName = config['tagName'];

    if (
      tagName &&
      eventDetails['tagName'] &&
      tagName.toLowerCase() !== eventDetails['tagName']
    ) {
      return;
    }

    if (repeat === false && eventDetails['repeated']) {
      return;
    }

    listener(new AnalyticsEvent(rootTarget, type, vars));
  }

  /**
   * Triggers a custom event for the associated root, or buffers them if the
   * observables aren't present yet.
   * @param {!AnalyticsEvent} event
   */
  trigger(event) {
    const eventType = event['type'];
    const observables = this.observables_[eventType];

    // If listeners already present - trigger right away.
    if (observables) {
      observables.fire(event);
    }

    // Create buffer and enqueue event if needed.
    if (this.buffer_) {
      this.buffer_[eventType] = this.buffer_[eventType] || [];
      this.buffer_[eventType].push(event);
    }
  }
}

/**
 * Tracks click events.
 */
export class ClickEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @private {!Observable<!Event>} */
    this.clickObservable_ = new Observable();

    /** @private @const {function(!Event)} */
    this.boundOnClick_ = this.clickObservable_.fire.bind(this.clickObservable_);
    this.root.getRoot().addEventListener('click', this.boundOnClick_);
  }

  /** @override */
  dispose() {
    this.root.getRoot().removeEventListener('click', this.boundOnClick_);
    this.clickObservable_.removeAll();
  }

  /** @override */
  add(context, eventType, config, listener) {
    const selector = userAssert(
      config['selector'],
      'Missing required selector on click trigger'
    );
    const selectionMethod = config['selectionMethod'] || null;
    return this.clickObservable_.add(
      this.root.createSelectiveListener(
        this.handleClick_.bind(this, listener),
        context.parentElement || context,
        selector,
        selectionMethod
      )
    );
  }

  /**
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Element} target
   * @param {!Event} unusedEvent
   * @private
   */
  handleClick_(listener, target, unusedEvent) {
    listener(new AnalyticsEvent(target, 'click'));
  }
}

/**
 * Tracks scroll events.
 */
export class ScrollEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @private {!./analytics-root.AnalyticsRoot} root */
    this.root_ = root;

    /** @private {?function(!Object)} */
    this.boundScrollHandler_ = null;
  }

  /** @override */
  dispose() {
    if (this.boundScrollHandler_ !== null) {
      this.root_
        .getScrollManager()
        .removeScrollHandler(this.boundScrollHandler_);
      this.boundScrollHandler_ = null;
    }
  }

  /** @override */
  add(context, eventType, config, listener) {
    if (!config['scrollSpec']) {
      user().error(TAG, 'Missing scrollSpec on scroll trigger.');
      return NO_UNLISTEN;
    }

    if (
      !Array.isArray(config['scrollSpec']['verticalBoundaries']) &&
      !Array.isArray(config['scrollSpec']['horizontalBoundaries'])
    ) {
      user().error(
        TAG,
        'Boundaries are required for the scroll trigger to work.'
      );
      return NO_UNLISTEN;
    }

    const boundsV = this.normalizeBoundaries_(
      config['scrollSpec']['verticalBoundaries']
    );
    const boundsH = this.normalizeBoundaries_(
      config['scrollSpec']['horizontalBoundaries']
    );
    const useInitialPageSize = !!config['scrollSpec']['useInitialPageSize'];

    this.boundScrollHandler_ = this.scrollHandler_.bind(
      this,
      boundsH,
      boundsV,
      useInitialPageSize,
      listener
    );

    return this.root_
      .getScrollManager()
      .addScrollHandler(this.boundScrollHandler_);
  }

  /**
   * Function to handle scroll events from the Scroll manager
   * @param {!{[key: number]: boolean}} boundsH
   * @param {!{[key: number]: boolean}} boundsV
   * @param {boolean} useInitialPageSize
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Object} e
   * @private
   */
  scrollHandler_(boundsH, boundsV, useInitialPageSize, listener, e) {
    // Calculates percentage scrolled by adding screen height/width to
    // top/left and dividing by the total scroll height/width.
    const {scrollHeight, scrollWidth} = useInitialPageSize ? e.initialSize : e;

    this.triggerScrollEvents_(
      boundsV,
      ((e.top + e.height) * 100) / scrollHeight,
      VAR_V_SCROLL_BOUNDARY,
      listener
    );

    this.triggerScrollEvents_(
      boundsH,
      ((e.left + e.width) * 100) / scrollWidth,
      VAR_H_SCROLL_BOUNDARY,
      listener
    );
  }

  /**
   * Rounds the boundaries for scroll trigger to nearest
   * SCROLL_PRECISION_PERCENT and returns an object with normalized boundaries
   * as keys and false as values.
   *
   * @param {!Array<number>} bounds array of bounds.
   * @return {!JsonObject} Object with normalized bounds as keys
   * and false as value.
   * @private
   */
  normalizeBoundaries_(bounds) {
    const result = {};
    if (!bounds || !Array.isArray(bounds)) {
      return result;
    }

    for (let b = 0; b < bounds.length; b++) {
      let bound = bounds[b];
      if (typeof bound !== 'number' || !isFinite(bound)) {
        user().error(TAG, 'Scroll trigger boundaries must be finite.');
        return result;
      }

      bound = Math.min(
        Math.round(bound / SCROLL_PRECISION_PERCENT) * SCROLL_PRECISION_PERCENT,
        100
      );
      result[bound] = false;
    }
    return result;
  }

  /**
   * @param {!{[key: number]: boolean}} bounds
   * @param {number} scrollPos Number representing the current scroll
   * @param {string} varName variable name to assign to the bound that
   * @param {function(!AnalyticsEvent)} listener
   * triggers the event position.
   */
  triggerScrollEvents_(bounds, scrollPos, varName, listener) {
    if (!scrollPos) {
      return;
    }

    // Goes through each of the boundaries and fires an event if it has not
    // been fired so far and it should be.
    for (const b in bounds) {
      if (!hasOwn(bounds, b)) {
        continue;
      }
      const bound = parseInt(b, 10);
      if (bound > scrollPos || bounds[bound]) {
        continue;
      }
      bounds[bound] = true;
      const vars = {};
      vars[varName] = b;
      listener(
        new AnalyticsEvent(
          this.root_.getRootElement(),
          AnalyticsEventType.SCROLL,
          vars,
          /** enableDataVars */ false
        )
      );
    }
  }
}

/**
 * Tracks events based on signals.
 * @implements {SignalTrackerDef}
 */
export class SignalTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);
  }

  /** @override */
  dispose() {}

  /** @override */
  add(context, eventType, config, listener) {
    let target;
    let signalsPromise;
    const selector = config['selector'] || ':root';
    if (selector == ':root' || selector == ':host') {
      // Root selectors are delegated to analytics roots.
      target = this.root.getRootElement();
      signalsPromise = this.getRootSignal(eventType);
    } else {
      // Look for the AMP-element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      const selectionMethod = config['selectionMethod'];
      signalsPromise = this.root
        .getAmpElement(
          context.parentElement || context,
          selector,
          selectionMethod
        )
        .then((element) => {
          target = element;
          return this.getElementSignal(eventType, target);
        });
    }

    // Wait for the target and the event signal.
    signalsPromise.then(() => {
      listener(new AnalyticsEvent(target, eventType));
    });
    return NO_UNLISTEN;
  }

  /** @override */
  getRootSignal(eventType) {
    return this.root.signals().whenSignal(eventType);
  }

  /** @override */
  getElementSignal(eventType, element) {
    if (typeof element.signals != 'function') {
      return Promise.resolve();
    }
    return element.signals().whenSignal(eventType);
  }
}

/**
 * Tracks when the elements in the first viewport has been loaded - "ini-load".
 * @implements {SignalTrackerDef}
 */
export class IniLoadTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);
  }

  /** @override */
  dispose() {}

  /** @override */
  add(context, eventType, config, listener) {
    let target;
    let promise;
    const selector = config['selector'] || ':root';
    if (selector == ':root' || selector == ':host') {
      // Root selectors are delegated to analytics roots.
      target = this.root.getRootElement();
      promise = this.getRootSignal();
    } else {
      // An AMP-element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      const selectionMethod = config['selectionMethod'];
      promise = this.root
        .getAmpElement(
          context.parentElement || context,
          selector,
          selectionMethod
        )
        .then((element) => {
          target = element;
          return this.getElementSignal('ini-load', target);
        });
    }
    // Wait for the target and the event.
    promise.then(() => {
      listener(new AnalyticsEvent(target, eventType));
    });
    return NO_UNLISTEN;
  }

  /** @override */
  getRootSignal() {
    return this.root.whenIniLoaded();
  }

  /** @override */
  getElementSignal(unusedEventType, element) {
    if (typeof element.signals != 'function') {
      return Promise.resolve();
    }
    const signals = element.signals();
    return Promise.race([
      signals.whenSignal(CommonSignals_Enum.INI_LOAD),
      signals.whenSignal(CommonSignals_Enum.LOAD_END),
    ]);
  }
}

/**
 * Timer event handler.
 */
class TimerEventHandler {
  /**
   * @param {JsonObject} timerSpec The timer specification.
   * @param {function(): UnlistenDef=} opt_startBuilder Factory for building
   *     start trackers for this timer.
   * @param {function(): UnlistenDef=} opt_stopBuilder Factory for building stop
   *     trackers for this timer.
   */
  constructor(timerSpec, opt_startBuilder, opt_stopBuilder) {
    /** @private {number|undefined} */
    this.intervalId_ = undefined;

    userAssert(
      'interval' in timerSpec,
      'Timer interval specification required'
    );
    /** @private @const {number} */
    this.intervalLength_ = Number(timerSpec['interval']) || 0;
    userAssert(
      this.intervalLength_ >= MIN_TIMER_INTERVAL_SECONDS,
      'Bad timer interval specification'
    );

    /** @private @const {number} */
    this.maxTimerLength_ =
      'maxTimerLength' in timerSpec
        ? Number(timerSpec['maxTimerLength'])
        : DEFAULT_MAX_TIMER_LENGTH_SECONDS;
    userAssert(this.maxTimerLength_ > 0, 'Bad maxTimerLength specification');

    /** @private @const {boolean} */
    this.maxTimerInSpec_ = 'maxTimerLength' in timerSpec;

    /** @private @const {boolean} */
    this.callImmediate_ =
      'immediate' in timerSpec ? Boolean(timerSpec['immediate']) : true;

    /** @private {?function()} */
    this.intervalCallback_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenStart_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenStop_ = null;

    /** @private @const {?function(): UnlistenDef} */
    this.startBuilder_ = opt_startBuilder || null;

    /** @private @const {?function(): UnlistenDef} */
    this.stopBuilder_ = opt_stopBuilder || null;

    /** @private {number|undefined} */
    this.startTime_ = undefined; // milliseconds

    /** @private {number|undefined} */
    this.lastRequestTime_ = undefined; // milliseconds
  }

  /**
   * @param {function()} startTimer
   */
  init(startTimer) {
    if (!this.startBuilder_) {
      // Timer starts on load.
      startTimer();
    } else {
      // Timer starts on event.
      this.listenForStart_();
    }
  }

  /**
   * Unlistens for start and stop.
   */
  dispose() {
    this.unlistenForStop_();
    this.unlistenForStart_();
  }

  /** @private */
  listenForStart_() {
    if (this.startBuilder_) {
      this.unlistenStart_ = this.startBuilder_();
    }
  }

  /** @private */
  unlistenForStart_() {
    if (this.unlistenStart_) {
      this.unlistenStart_();
      this.unlistenStart_ = null;
    }
  }

  /** @private */
  listenForStop_() {
    if (this.stopBuilder_) {
      try {
        this.unlistenStop_ = this.stopBuilder_();
      } catch (e) {
        this.dispose(); // Stop timer and then throw error.
        throw e;
      }
    }
  }

  /** @private */
  unlistenForStop_() {
    if (this.unlistenStop_) {
      this.unlistenStop_();
      this.unlistenStop_ = null;
    }
  }

  /** @return {boolean} */
  isRunning() {
    return !!this.intervalId_;
  }

  /**
   * @param {!Window} win
   * @param {function()} timerCallback
   * @param {function()} timeoutCallback
   */
  startIntervalInWindow(win, timerCallback, timeoutCallback) {
    if (this.isRunning()) {
      return;
    }
    this.startTime_ = Date.now();
    this.lastRequestTime_ = undefined;
    this.intervalCallback_ = timerCallback;
    this.intervalId_ = win.setInterval(() => {
      timerCallback();
    }, this.intervalLength_ * 1000);

    // If there's no way to turn off the timer, cap it.
    if (!this.stopBuilder_ || (this.stopBuilder_ && this.maxTimerInSpec_)) {
      win.setTimeout(() => {
        timeoutCallback();
      }, this.maxTimerLength_ * 1000);
    }

    this.unlistenForStart_();
    if (this.callImmediate_) {
      timerCallback();
    }
    this.listenForStop_();
  }

  /**
   * @param {!Window} win
   * @restricted
   */
  stopTimer_(win) {
    if (!this.isRunning()) {
      return;
    }
    this.intervalCallback_();
    this.intervalCallback_ = null;
    win.clearInterval(this.intervalId_);
    this.intervalId_ = undefined;
    this.lastRequestTime_ = undefined;
    this.unlistenForStop_();
    this.listenForStart_();
  }

  /**
   * @private
   * @return {number}
   */
  calculateDuration_() {
    if (this.startTime_) {
      return Date.now() - (this.lastRequestTime_ || this.startTime_);
    }
    return 0;
  }

  /** @return {!JsonObject} */
  getTimerVars() {
    let timerDuration = 0;
    if (this.isRunning()) {
      timerDuration = this.calculateDuration_();
      this.lastRequestTime_ = Date.now();
    }
    return {
      'timerDuration': timerDuration,
      'timerStart': this.startTime_ || 0,
    };
  }
}

/**
 * Tracks timer events.
 */
export class TimerEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);
    /** @const @private {!{[key: number]: TimerEventHandler}} */
    this.trackers_ = {};

    /** @private {number} */
    this.timerIdSequence_ = 1;
  }

  /**
   * @return {!Array<number>}
   * @visibleForTesting
   */
  getTrackedTimerKeys() {
    return /** @type {!Array<number>} */ (Object.keys(this.trackers_));
  }

  /** @override */
  dispose() {
    this.getTrackedTimerKeys().forEach((timerId) => {
      this.removeTracker_(timerId);
    });
  }

  /** @override */
  add(context, eventType, config, listener) {
    const timerSpec = config['timerSpec'];
    userAssert(
      timerSpec && typeof timerSpec == 'object',
      'Bad timer specification'
    );
    const timerStart = 'startSpec' in timerSpec ? timerSpec['startSpec'] : null;
    userAssert(
      !timerStart || typeof timerStart == 'object',
      'Bad timer start specification'
    );
    const timerStop = 'stopSpec' in timerSpec ? timerSpec['stopSpec'] : null;
    userAssert(
      (!timerStart && !timerStop) || typeof timerStop == 'object',
      'Bad timer stop specification'
    );

    const timerId = this.generateTimerId_();
    let startBuilder;
    let stopBuilder;
    if (timerStart) {
      const startTracker = this.getTracker_(timerStart);
      userAssert(startTracker, 'Cannot track timer start');
      startBuilder = startTracker.add.bind(
        startTracker,
        context,
        timerStart['on'],
        timerStart,
        this.handleTimerToggle_.bind(this, timerId, eventType, listener)
      );
    }
    if (timerStop) {
      const stopTracker = this.getTracker_(timerStop);
      userAssert(stopTracker, 'Cannot track timer stop');
      stopBuilder = stopTracker.add.bind(
        stopTracker,
        context,
        timerStop['on'],
        timerStop,
        this.handleTimerToggle_.bind(this, timerId, eventType, listener)
      );
    }

    const timerHandler = new TimerEventHandler(
      /** @type {!JsonObject} */ (timerSpec),
      startBuilder,
      stopBuilder
    );
    this.trackers_[timerId] = timerHandler;

    timerHandler.init(
      this.startTimer_.bind(this, timerId, eventType, listener)
    );
    return () => {
      this.removeTracker_(timerId);
    };
  }

  /**
   * @return {number}
   * @private
   */
  generateTimerId_() {
    return ++this.timerIdSequence_;
  }

  /**
   * @param {!JsonObject} config
   * @return {?EventTracker}
   * @private
   */
  getTracker_(config) {
    const eventType = user().assertString(config['on']);
    const trackerKey = getTrackerKeyName(eventType);

    return this.root.getTrackerForAllowlist(
      trackerKey,
      getTrackerTypesForParentType('timer')
    );
  }

  /**
   * Toggles which listeners are active depending on timer state, so no race
   * conditions can occur in the case where the timer starts and stops on the
   * same event type from the same target.
   * @param {number} timerId
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @private
   */
  handleTimerToggle_(timerId, eventType, listener) {
    const timerHandler = this.trackers_[timerId];
    if (!timerHandler) {
      return;
    }
    if (timerHandler.isRunning()) {
      this.stopTimer_(timerId);
    } else {
      this.startTimer_(timerId, eventType, listener);
    }
  }

  /**
   * @param {number} timerId
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @private
   */
  startTimer_(timerId, eventType, listener) {
    const timerHandler = this.trackers_[timerId];
    const timerCallback = () => {
      listener(this.createEvent_(timerId, eventType));
    };
    timerHandler.startIntervalInWindow(
      this.root.ampdoc.win,
      timerCallback,
      this.removeTracker_.bind(this, timerId)
    );
  }

  /**
   * @param {number} timerId
   * @private
   */
  stopTimer_(timerId) {
    this.trackers_[timerId].stopTimer_(this.root.ampdoc.win);
  }

  /**
   * @param {number} timerId
   * @param {string} eventType
   * @return {!AnalyticsEvent}
   * @private
   */
  createEvent_(timerId, eventType) {
    return new AnalyticsEvent(
      this.root.getRootElement(),
      eventType,
      this.trackers_[timerId].getTimerVars(),
      /** enableDataVars */ false
    );
  }

  /**
   * @param {number} timerId
   * @private
   */
  removeTracker_(timerId) {
    if (this.trackers_[timerId]) {
      this.stopTimer_(timerId);
      this.trackers_[timerId].dispose();
      delete this.trackers_[timerId];
    }
  }
}

/**
 * Tracks video session events
 */
export class VideoEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @private {?Observable<!Event>} */
    this.sessionObservable_ = new Observable();

    /** @private {?function(!Event)} */
    this.boundOnSession_ = this.sessionObservable_.fire.bind(
      this.sessionObservable_
    );

    enumValues(VideoAnalyticsEvents_Enum).forEach((value) => {
      this.root.getRoot().addEventListener(value, this.boundOnSession_);
    });
  }

  /** @override */
  dispose() {
    const root = this.root.getRoot();
    enumValues(VideoAnalyticsEvents_Enum).forEach((value) => {
      root.removeEventListener(value, this.boundOnSession_);
    });
    this.boundOnSession_ = null;
    this.sessionObservable_ = null;
  }

  /** @override */
  add(context, eventType, config, listener) {
    const videoSpec = config['videoSpec'] || {};
    const selector = userAssert(
      config['selector'] || videoSpec['selector'],
      'Missing required selector on video trigger'
    );

    userAssert(selector.length, 'Missing required selector on video trigger');
    assertUniqueSelectors(selector);
    const selectionMethod = config['selectionMethod'] || null;
    const targetPromises = this.root.getElements(
      context,
      selector,
      selectionMethod,
      false
    );

    const endSessionWhenInvisible = videoSpec['end-session-when-invisible'];
    const excludeAutoplay = videoSpec['exclude-autoplay'];
    const interval = videoSpec['interval'];
    const percentages = videoSpec['percentages'];
    const on = config['on'];

    const percentageInterval = 5;

    let intervalCounter = 0;
    let lastPercentage = 0;

    return this.sessionObservable_.add((event) => {
      const {type} = event;
      const details = /** @type {?JsonObject|undefined} */ (getData(event));
      const normalizedType = normalizeVideoEventType(type, details);

      if (normalizedType !== on) {
        return;
      }

      if (
        normalizedType === VideoAnalyticsEvents_Enum.SECONDS_PLAYED &&
        !interval
      ) {
        user().error(
          TAG,
          'video-seconds-played requires interval spec with non-zero value'
        );
        return;
      }

      if (normalizedType === VideoAnalyticsEvents_Enum.SECONDS_PLAYED) {
        intervalCounter++;
        if (intervalCounter % interval !== 0) {
          return;
        }
      }

      if (normalizedType === VideoAnalyticsEvents_Enum.PERCENTAGE_PLAYED) {
        if (!percentages) {
          user().error(
            TAG,
            'video-percentage-played requires percentages spec.'
          );
          return;
        }

        for (let i = 0; i < percentages.length; i++) {
          const percentage = percentages[i];

          if (percentage <= 0 || percentage % percentageInterval != 0) {
            user().error(
              TAG,
              'Percentages must be set in increments of %s with non-zero ' +
                'values',
              percentageInterval
            );

            return;
          }
        }

        const normalizedPercentage = details['normalizedPercentage'];
        const normalizedPercentageInt = parseInt(normalizedPercentage, 10);

        devAssert(isFiniteNumber(normalizedPercentageInt));
        devAssert(normalizedPercentageInt % percentageInterval == 0);

        // Don't trigger if current percentage is the same as
        // last triggered percentage
        if (
          lastPercentage == normalizedPercentageInt &&
          percentages.length > 1
        ) {
          return;
        }

        if (percentages.indexOf(normalizedPercentageInt) < 0) {
          return;
        }

        lastPercentage = normalizedPercentageInt;
      }

      if (
        type === VideoAnalyticsEvents_Enum.SESSION_VISIBLE &&
        !endSessionWhenInvisible
      ) {
        return;
      }

      if (
        excludeAutoplay &&
        details['state'] === PlayingStates_Enum.PLAYING_AUTO
      ) {
        return;
      }

      const el = dev().assertElement(
        event.target,
        'No target specified by video session event.'
      );

      targetPromises.then((targets) => {
        targets.forEach((target) => {
          if (!target.contains(el)) {
            return;
          }
          const normalizedDetails = removeInternalVars(details);
          listener(
            new AnalyticsEvent(target, normalizedType, normalizedDetails)
          );
        });
      });
    });
  }
}

/**
 * Normalize video type from internal representation into the observed string
 * from the analytics configuration.
 * @param {string} type
 * @param {?JsonObject|undefined} details
 * @return {string}
 */
function normalizeVideoEventType(type, details) {
  if (type == VideoAnalyticsEvents_Enum.SESSION_VISIBLE) {
    return VideoAnalyticsEvents_Enum.SESSION;
  }

  // Custom video analytics events are listened to from one signal type,
  // but they're configured by user with their custom name.
  if (type == VideoAnalyticsEvents_Enum.CUSTOM) {
    return dev().assertString(details[videoAnalyticsCustomEventTypeKey]);
  }

  return type;
}

/**
 * @param {?JsonObject|undefined} details
 * @return {!JsonObject|undefined}
 */
function removeInternalVars(details) {
  if (!details) {
    return {};
  }
  const clean = {...details};
  delete clean[videoAnalyticsCustomEventTypeKey];
  return /** @type {!JsonObject} */ (clean);
}

/**
 * Tracks visibility events.
 */
export class VisibilityTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @private */
    this.waitForTrackers_ = {};
  }

  /** @override */
  dispose() {}

  /** @override */
  add(context, eventType, config, listener) {
    const visibilitySpec = config['visibilitySpec'] || {};
    const selector = config['selector'] || visibilitySpec['selector'];
    const waitForSpec = visibilitySpec['waitFor'];
    let reportWhenSpec = visibilitySpec['reportWhen'];
    let createReportReadyPromiseFunc = null;
    if (reportWhenSpec) {
      userAssert(
        !visibilitySpec['repeat'],
        'reportWhen and repeat are mutually exclusive.'
      );
    }

    if (eventType === AnalyticsEventType.HIDDEN) {
      if (reportWhenSpec) {
        user().error(
          TAG,
          'ReportWhen should not be defined when eventType is "hidden"'
        );
      }
      // special polyfill for eventType: 'hidden'
      reportWhenSpec = 'documentHidden';
    }

    const visibilityManager = this.root.getVisibilityManager();

    if (reportWhenSpec == 'documentHidden') {
      createReportReadyPromiseFunc =
        this.createReportReadyPromiseForDocumentHidden_.bind(this);
    } else if (reportWhenSpec == 'documentExit') {
      createReportReadyPromiseFunc =
        this.createReportReadyPromiseForDocumentExit_.bind(this);
    } else {
      userAssert(
        !reportWhenSpec,
        'reportWhen value "%s" not supported.',
        reportWhenSpec
      );
    }

    // Root selectors are delegated to analytics roots.
    if (!selector || selector == ':root' || selector == ':host') {
      // When `selector` is specified, we always use "ini-load" signal as
      // a "ready" signal.
      const readyPromiseWaitForSpec =
        waitForSpec || (selector ? 'ini-load' : 'none');
      return visibilityManager.listenRoot(
        visibilitySpec,
        this.getReadyPromise(readyPromiseWaitForSpec),
        createReportReadyPromiseFunc,
        this.onEvent_.bind(
          this,
          eventType,
          listener,
          this.root.getRootElement()
        )
      );
    }

    // An element. Wait for DOM to be fully parsed to avoid
    // false missed searches.
    // Array selectors do not suppor the special cases: ':host' & ':root'
    const selectionMethod =
      config['selectionMethod'] || visibilitySpec['selectionMethod'];
    assertUniqueSelectors(selector);
    const unlistenPromise = this.root
      .getElements(context.parentElement || context, selector, selectionMethod)
      .then((elements) => {
        const unlistenCallbacks = [];
        for (let i = 0; i < elements.length; i++) {
          unlistenCallbacks.push(
            visibilityManager.listenElement(
              elements[i],
              visibilitySpec,
              this.getReadyPromise(waitForSpec, elements[i]),
              createReportReadyPromiseFunc,
              this.onEvent_.bind(this, eventType, listener, elements[i])
            )
          );
        }
        return unlistenCallbacks;
      });

    return function () {
      unlistenPromise.then((unlistenCallbacks) => {
        for (let i = 0; i < unlistenCallbacks.length; i++) {
          unlistenCallbacks[i]();
        }
      });
    };
  }

  /**
   * Returns a Promise indicating that we're ready to report the analytics,
   * in the case of reportWhen: documentHidden
   * @return {!Promise}
   * @private
   */
  createReportReadyPromiseForDocumentHidden_() {
    const {ampdoc} = this.root;

    if (!ampdoc.isVisible()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      ampdoc.onVisibilityChanged(() => {
        if (!ampdoc.isVisible()) {
          resolve();
        }
      });
    });
  }

  /**
   * Returns a Promise indicating that we're ready to report the analytics,
   * in the case of reportWhen: documentExit
   * @return {!Promise}
   * @private
   */
  createReportReadyPromiseForDocumentExit_() {
    const deferred = new Deferred();
    const {win} = this.root.ampdoc;
    let unloadListener, pageHideListener;

    // Do not add an unload listener unless pagehide is not available.
    // If an unload listener is present, the back/forward cache will not work.
    // The BFCache saves pages to be instantly loaded when navigating back
    // or forward and pauses their JavaScript. The pagehide event was added
    // to give developers control over the behavior, and the unload listener
    // interferes with it. To allow publishers to use the default BFCache
    // behavior, we should not add an unload listener.
    if (!this.supportsPageHide_()) {
      win.addEventListener(
        /*OK*/ 'unload',
        (unloadListener = () => {
          win.removeEventListener('unload', unloadListener);
          deferred.resolve();
        })
      );
    }

    // Note: pagehide is currently not supported on Opera Mini, nor IE<=10.
    // Documentation conflicts as to whether Safari on iOS will also fire it
    // when switching tabs or switching to another app. Chrome does not fire it
    // in this case.
    // Good, but several years old, analysis at:
    // https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/
    // Especially note the event table on this page.
    win.addEventListener(
      'pagehide',
      (pageHideListener = () => {
        win.removeEventListener('pagehide', pageHideListener);
        deferred.resolve();
      })
    );
    return deferred.promise;
  }

  /**
   * Detect support for the pagehide event.
   * IE<=10 and Opera Mini do not support the pagehide event and
   * possibly others, so we feature-detect support with this method.
   * This is in a stubbable method for testing.
   * @return {boolean}
   * @private visible for testing
   */
  supportsPageHide_() {
    return 'onpagehide' in this.root.ampdoc.win;
  }

  /**
   * @param {string|undefined} waitForSpec
   * @param {Element=} opt_element
   * @return {?Promise}
   * @visibleForTesting
   */
  getReadyPromise(waitForSpec, opt_element) {
    if (opt_element) {
      if (!isAmpElement(opt_element)) {
        userAssert(
          !waitForSpec || waitForSpec == 'none',
          'waitFor for non-AMP elements must be none or null. Found %s',
          waitForSpec
        );
      } else {
        waitForSpec = waitForSpec || 'ini-load';
      }
    }

    if (!waitForSpec || waitForSpec == 'none') {
      // Default case, waitFor selector is not defined, wait for nothing
      return null;
    }

    const trackerAllowlist = getTrackerTypesForParentType('visible');
    userAssert(
      trackerAllowlist[waitForSpec] !== undefined,
      'waitFor value %s not supported',
      waitForSpec
    );

    const waitForTracker =
      this.waitForTrackers_[waitForSpec] ||
      this.root.getTrackerForAllowlist(waitForSpec, trackerAllowlist);
    if (waitForTracker) {
      this.waitForTrackers_[waitForSpec] = waitForTracker;
    } else {
      return null;
    }

    // Wait for root signal if there's no element selected.
    return opt_element
      ? waitForTracker.getElementSignal(waitForSpec, opt_element)
      : waitForTracker.getRootSignal(waitForSpec);
  }

  /**
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Element} target
   * @param {!JsonObject} state
   * @private
   */
  onEvent_(eventType, listener, target, state) {
    // TODO: Verify usage and change behavior to have state override data-vars
    const attr = getDataParamsFromAttributes(
      target,
      /* computeParamNameFunc */ undefined,
      VARIABLE_DATA_ATTRIBUTE_KEY
    );
    for (const key in attr) {
      state[key] = attr[key];
    }
    listener(
      new AnalyticsEvent(target, eventType, state, /** enableDataVars */ false)
    );
  }
}
