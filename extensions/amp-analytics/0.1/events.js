/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {CommonSignals} from '../../../src/common-signals';
import {Observable} from '../../../src/observable';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {user} from '../../../src/log';
import {startsWith} from '../../../src/string';

const VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;
const NO_UNLISTEN = function() {};

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
 */
export class AnalyticsEvent {
  /**
   * @param {!Element} target The most relevant target element.
   * @param {string} type The type of event.
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   */
  constructor(target, type, opt_vars) {
    /** @const */
    this.target = target;
    /** @const */
    this.type = type;
    /** @const */
    this.vars = opt_vars || Object.create(null);
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
 * Tracks custom events.
 */
export class CustomEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @const @private {!Object<string, !Observable<!AnalyticsEvent>>} */
    this.observables_ = {};

    /**
     * Early events have to be buffered because there's no way to predict
     * how fast all `amp-analytics` elements will be instrumented.
     * @private {!Object<string, !Array<!AnalyticsEvent>>|undefined}
     */
    this.buffer_ = {};

    /**
     * Sandbox events get their own buffer, because handler to those events will
     * be added after parent element's layout. (Time varies, can be later than 10s)
     * sandbox events buffer will never expire but will cleared when handler is ready.
     * @private {!Object<string, !Array<!AnalyticsEvent>|undefined>|undefined}
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

    const targetReady =
        this.root.getElement(context, selector, selectionMethod);

    const isSandboxEvent = startsWith(eventType, 'sandbox-');

    // Push recent events if any.
    const buffer = isSandboxEvent ?
        this.sandboxBuffer_ && this.sandboxBuffer_[eventType] :
        this.buffer_ && this.buffer_[eventType];

    if (buffer) {
      const bufferLength = buffer.length;
      targetReady.then(target => {
        setTimeout(() => {
          for (let i = 0; i < bufferLength; i++) {
            const event = buffer[i];
            if (target.contains(event.target)) {
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

    return this.observables_[eventType].add(event => {
      // Wait for target selected
      targetReady.then(target => {
        if (target.contains(event.target)) {
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
    const eventType = event.type;
    const isSandboxEvent = startsWith(eventType, 'sandbox-');
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

    /** @private @const */
    this.boundOnClick_ = e => {
      this.clickObservable_.fire(e);
    };
    this.root.getRoot().addEventListener('click', this.boundOnClick_);
  }

  /** @override */
  dispose() {
    this.root.getRoot().removeEventListener('click', this.boundOnClick_);
    this.clickObservable_.removeAll();
  }

  /** @override */
  add(context, eventType, config, listener) {
    const selector = user().assert(config['selector'],
        'Missing required selector on click trigger');
    const selectionMethod = config['selectionMethod'] || null;
    return this.clickObservable_.add(this.root.createSelectiveListener(
        this.handleClick_.bind(this, listener),
        (context.parentElement || context),
        selector,
        selectionMethod));
  }

  /**
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Element} target
   * @param {!Event} unusedEvent
   * @private
   */
  handleClick_(listener, target, unusedEvent) {
    const params = getDataParamsFromAttributes(
        target,
        /* computeParamNameFunc */ undefined,
        VARIABLE_DATA_ATTRIBUTE_KEY);
    listener(new AnalyticsEvent(target, 'click', params));
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
  dispose() {
  }

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
      signalsPromise = this.root.getAmpElement(
          (context.parentElement || context),
          selector,
          selectionMethod
          ).then(element => {
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
  dispose() {
  }

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
      promise = this.root.getAmpElement(
          (context.parentElement || context),
          selector,
          selectionMethod
          ).then(element => {
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
      signals.whenSignal(CommonSignals.INI_LOAD),
      signals.whenSignal(CommonSignals.LOAD_END),
    ]);
  }
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
  dispose() {
  }

  /** @override */
  add(context, eventType, config, listener) {
    const visibilitySpec = config['visibilitySpec'] || {};
    const selector = config['selector'] || visibilitySpec['selector'];
    const waitForSpec = visibilitySpec['waitFor'];
    const visibilityManager = this.root.getVisibilityManager();
    // special polyfill for eventType: 'hidden'
    let createReadyReportPromiseFunc = null;
    if (eventType == 'hidden') {
      createReadyReportPromiseFunc = this.createReportReadyPromise_.bind(this);
    }

    // Root selectors are delegated to analytics roots.
    if (!selector || selector == ':root' || selector == ':host') {
      // When `selector` is specified, we always use "ini-load" signal as
      // a "ready" signal.
      return visibilityManager.listenRoot(
          visibilitySpec,
          this.getReadyPromise(waitForSpec, selector),
          createReadyReportPromiseFunc,
          this.onEvent_.bind(
              this, eventType, listener, this.root.getRootElement()));
    }

    // An AMP-element. Wait for DOM to be fully parsed to avoid
    // false missed searches.
    const selectionMethod = config['selectionMethod'] ||
          visibilitySpec['selectionMethod'];
    const unlistenPromise = this.root.getAmpElement(
        (context.parentElement || context),
        selector,
        selectionMethod
        ).then(element => {
          return visibilityManager.listenElement(
              element,
              visibilitySpec,
              this.getReadyPromise(waitForSpec, selector, element),
              createReadyReportPromiseFunc,
              this.onEvent_.bind(this, eventType, listener, element));
        });
    return function() {
      unlistenPromise.then(unlisten => {
        unlisten();
      });
    };
  }

  /**
   * @return {!Promise}
   * @visibleForTesting
   */
  createReportReadyPromise_() {
    const viewer = this.root.getViewer();

    if (!viewer.isVisible()) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      viewer.onVisibilityChanged(() => {
        if (!viewer.isVisible()) {
          resolve();
        }
      });
    });
  }

  /**
   * @param {string|undefined} waitForSpec
   * @param {string|undefined} selector
   * @param {Element=} element
   * @return {?Promise}
   * @visibleForTesting
   */
  getReadyPromise(waitForSpec, selector, element) {
    if (!waitForSpec) {
      // Default case:
      if (!selector) {
        // waitFor nothing is selector is not defined
        waitForSpec = 'none';
      } else {
        // otherwise wait for ini-load by default
        waitForSpec = 'ini-load';
      }
    }

    user().assert(SUPPORT_WAITFOR_TRACKERS[waitForSpec] !== undefined,
        'waitFor value %s not supported', waitForSpec);

    if (!SUPPORT_WAITFOR_TRACKERS[waitForSpec]) {
      // waitFor NONE, wait for nothing
      return null;
    }

    if (!this.waitForTrackers_[waitForSpec]) {
      this.waitForTrackers_[waitForSpec] =
        new SUPPORT_WAITFOR_TRACKERS[waitForSpec](this.root);
    }

    const waitForTracker = this.waitForTrackers_[waitForSpec];
    // Wait for root signal if there's no element selected.
    return element ? waitForTracker.getElementSignal(waitForSpec, element)
        : waitForTracker.getRootSignal(waitForSpec);
  }

  /**
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Element} target
   * @param {!Object<string, *>} state
   * @private
   */
  onEvent_(eventType, listener, target, state) {
    const attr = getDataParamsFromAttributes(
        target,
        /* computeParamNameFunc */ undefined,
        VARIABLE_DATA_ATTRIBUTE_KEY);
    for (const key in attr) {
      state[key] = attr[key];
    }
    listener(new AnalyticsEvent(target, eventType, state));
  }
}

/** @const @private */
const SUPPORT_WAITFOR_TRACKERS = {
  'none': null,
  'ini-load': IniLoadTracker,
  'render-start': SignalTracker,
};
