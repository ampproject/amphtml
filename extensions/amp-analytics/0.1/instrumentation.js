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

import {dev, user} from '../../../src/log';
import {getElement, isVisibilitySpecValid} from './visibility-impl';
import {Observable} from '../../../src/observable';
import {getServicePromiseForDoc} from '../../../src/service';
import {timerFor} from '../../../src/timer';
import {viewerForDoc} from '../../../src/viewer';
import {viewportForDoc} from '../../../src/viewport';
import {getDataParamsFromAttributes, matches} from '../../../src/dom';
import {Visibility} from './visibility-impl';
import {isExperimentOn} from '../../../src/experiments';

const MIN_TIMER_INTERVAL_SECONDS_ = 0.5;
const DEFAULT_MAX_TIMER_LENGTH_SECONDS_ = 7200;
const SCROLL_PRECISION_PERCENT = 5;
const VAR_H_SCROLL_BOUNDARY = 'horizontalScrollBoundary';
const VAR_V_SCROLL_BOUNDARY = 'verticalScrollBoundary';
const VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;


/**
 * Type to define a callback that is called when an instrumented event fires.
 * @typedef {function(!AnalyticsEvent)}
 */
let AnalyticsEventListenerDef;


/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */
export const AnalyticsEventType = {
  VISIBLE: 'visible',
  CLICK: 'click',
  TIMER: 'timer',
  SCROLL: 'scroll',
  HIDDEN: 'hidden',
};

/** @const {string} */
const TAG = 'Analytics.Instrumentation';


/**
 * Events that can result in analytics data to be sent.
 * @const {Array<AnalyticsEventType>}
 */
const ALLOWED_IN_EMBED = [
  AnalyticsEventType.VISIBLE,
  AnalyticsEventType.CLICK,
  AnalyticsEventType.TIMER,
  AnalyticsEventType.HIDDEN,
];

/**
 * Ignore Most of this class as it has not been thought through yet. It will
 * change completely.
 */
class AnalyticsEvent {

  /**
   * @param {!AnalyticsEventType|string} type The type of event.
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   */
  constructor(type, opt_vars) {
    /** @const  */
    this.type = type;
    /** @const  */
    this.vars = opt_vars || Object.create(null);
  }
}

/** @private Visible for testing. */
export class InstrumentationService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
    this.ampdoc = ampdoc;

    /** @private {boolean} */
    this.visibilityV2Enabled_ = this.ampdoc.win.IntersectionObserver &&
        isExperimentOn(this.ampdoc.win, 'visibility-v2');

    /** @const @private {!./visibility-impl.Visibility} */
    this.visibility_ = new Visibility(this.ampdoc);

    /** @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timerFor(this.ampdoc.win);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.ampdoc);

    /** @const {!../../../src/service/viewport-impl.Viewport} */
    this.viewport_ = viewportForDoc(this.ampdoc);

    /** @private {!Observable<!Event>} */
    this.clickObservable_ = new Observable();

    /** @private {boolean} */
    this.scrollHandlerRegistered_ = false;

    /** @private {!Observable<
        !../../../src/service/viewport-impl.ViewportChangedEventDef>} */
    this.scrollObservable_ = new Observable();

    /** @private {!Object<string, !Observable<!AnalyticsEvent>>} */
    this.customEventObservers_ = {};

    /**
     * Early events have to be buffered because there's no way to predict
     * how fast all `amp-analytics` elements will be instrumented.
     * @private {!Object<string, !Array<!AnalyticsEvent>>|undefined}
     */
    this.customEventBuffer_ = {};

    /** @private {boolean} */
    this.clickHandlerRegistered_ = false;

    // Stop buffering of custom events after 10 seconds. Assumption is that all
    // `amp-analytics` elements will have been instrumented by this time.
    this.timer_.delay(() => {
      this.customEventBuffer_ = undefined;
    }, 10000);
  }

  /**
   * @param {!JSONType} config Configuration for instrumentation.
   * @param {!AnalyticsEventListenerDef} listener The callback to call when the event
   *  occurs.
   * @param {!Element} analyticsElement The element associated with the
   *  config.
   */
  addListener(config, listener, analyticsElement) {
    const eventType = config['on'];
    if (!this.isTriggerAllowed_(eventType, analyticsElement)) {
      user().error(TAG, 'Trigger type "' + eventType + '" is not ' +
        'allowed in the embed.');
      return;
    }
    if (eventType === AnalyticsEventType.VISIBLE) {
      this.createVisibilityListener_(listener, config,
          AnalyticsEventType.VISIBLE, analyticsElement);
    } else if (eventType === AnalyticsEventType.CLICK) {
      if (!config['selector']) {
        user().error(TAG, 'Missing required selector on click trigger');
        return;
      }

      this.ensureClickListener_();
      this.clickObservable_.add(
          this.createSelectiveListener_(listener, config['selector']));
    } else if (eventType === AnalyticsEventType.SCROLL) {
      if (!config['scrollSpec']) {
        user().error(TAG, 'Missing scrollSpec on scroll trigger.');
        return;
      }
      this.registerScrollTrigger_(config['scrollSpec'], listener);

      // Trigger an event to fire events that might have already happened.
      const size = this.viewport_.getSize();
      this.onScroll_({
        top: this.viewport_.getScrollTop(),
        left: this.viewport_.getScrollLeft(),
        width: size.width,
        height: size.height,
        relayoutAll: false,
        velocity: 0,  // Hack for typing.
      });
    } else if (eventType === AnalyticsEventType.TIMER) {
      if (this.isTimerSpecValid_(config['timerSpec'])) {
        this.createTimerListener_(listener, config['timerSpec']);
      }
    } else if (eventType === AnalyticsEventType.HIDDEN) {
      this.createVisibilityListener_(listener, config,
          AnalyticsEventType.HIDDEN, analyticsElement);
    } else {
      let observers = this.customEventObservers_[eventType];
      if (!observers) {
        observers = new Observable();
        this.customEventObservers_[eventType] = observers;
      }
      observers.add(listener);

      // Push recent events if any.
      if (this.customEventBuffer_) {
        /** @const {!Array<!AnalyticsEvent>} */
        const buffer = this.customEventBuffer_[eventType];
        if (buffer) {
          this.timer_.delay(() => {
            buffer.forEach(event => {
              listener(event);
            });
          }, 1);
        }
      }
    }
  }

  /**
   * Triggers the analytics event with the specified type.
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   */
  triggerEvent(eventType, opt_vars) {
    const event = new AnalyticsEvent(eventType, opt_vars);

    // Enqueue.
    if (this.customEventBuffer_) {
      let buffer = this.customEventBuffer_[event.type];
      if (!buffer) {
        buffer = [];
        this.customEventBuffer_[event.type] = buffer;
      }
      buffer.push(event);
    }

    // If listeners already present - trigger right away.
    const observers = this.customEventObservers_[eventType];
    if (observers) {
      observers.fire(event);
    }
  }

  /**
   * Creates listeners for visibility conditions or calls the callback if all
   * the conditions are met.
   * @param {!AnalyticsEventListenerDef} callback The callback to call when the
   *   event occurs.
   * @param {!JSONType} config Configuration for instrumentation.
   * @param {AnalyticsEventType} eventType Event type for which the callback is triggered.
   * @param {!Element} analyticsElement The element assoicated with the
   *   config.
   * @private
   */
  createVisibilityListener_(callback, config, eventType, analyticsElement) {
    dev().assert(eventType == AnalyticsEventType.VISIBLE ||
        eventType == AnalyticsEventType.HIDDEN,
        'createVisibilityListener should be called with visible or hidden ' +
        'eventType');
    const shouldBeVisible = eventType == AnalyticsEventType.VISIBLE;
    /** @const {!JSONType} */
    const spec = config['visibilitySpec'];
    if (spec) {
      if (!isVisibilitySpecValid(config)) {
        return;
      }

      const listenOnceFunc = this.visibilityV2Enabled_
          ? this.visibility_.listenOnceV2.bind(this.visibility_)
          : this.visibility_.listenOnce.bind(this.visibility_);

      listenOnceFunc(spec, vars => {
        const el = getElement(this.ampdoc, spec['selector'],
            analyticsElement, spec['selectionMethod']);
        if (el) {
          const attr = getDataParamsFromAttributes(el, undefined,
              VARIABLE_DATA_ATTRIBUTE_KEY);
          for (const key in attr) {
            vars[key] = attr[key];
          }
        }
        callback(new AnalyticsEvent(eventType, vars));
      }, shouldBeVisible, analyticsElement);
    } else {
      if (this.viewer_.isVisible() == shouldBeVisible) {
        callback(new AnalyticsEvent(eventType));
        config['called'] = true;
      } else {
        this.viewer_.onVisibilityChanged(() => {
          if (!config['called'] &&
              this.viewer_.isVisible() == shouldBeVisible) {
            callback(new AnalyticsEvent(eventType));
            config['called'] = true;
          }
        });
      }
    }
  }

  /**
   * Ensure we have a click listener registered on the document that contains
   * the given analytics element.
   * @private
   */
  ensureClickListener_() {
    if (!this.clickHandlerRegistered_) {
      this.clickHandlerRegistered_ = true;
      this.ampdoc.getRootNode().addEventListener(
          'click', this.onClick_.bind(this));
    }
  }

  /**
   * @param {!Event} e
   * @private
   */
  onClick_(e) {
    this.clickObservable_.fire(e);
  }

  /**
   * @param {!../../../src/service/viewport-impl.ViewportChangedEventDef} e
   * @private
   */
  onScroll_(e) {
    this.scrollObservable_.fire(e);
  }

  /**
   * @param {!Function} listener
   * @param {string} selector
   * @private
   */
  createSelectiveListener_(listener, selector) {
    return e => {
      try {
        let el = e.target;
        // First do the cheap lookups.
        if (selector === '*' || matches(el, selector)) {
          listener(
            new AnalyticsEvent(
              AnalyticsEventType.CLICK,
              getDataParamsFromAttributes(
                el,
                undefined,
                VARIABLE_DATA_ATTRIBUTE_KEY
              )
            )
          );
        } else {
          // More expensive search.
          while (el.parentElement != null &&
              el.parentElement.tagName != 'BODY') {
            el = el.parentElement;
            if (matches(el, selector)) {
              listener(
                new AnalyticsEvent(
                  AnalyticsEventType.CLICK,
                  getDataParamsFromAttributes(
                    el,
                    undefined,
                    VARIABLE_DATA_ATTRIBUTE_KEY
                  )
                )
              );
              // Don't fire the event multiple times even if the more than one
              // ancestor matches the selector.
              return;
            }
          }
        }
      } catch (selectorError) {
        user().error(TAG, 'Bad query selector.', selector, selectorError);
      }
    };
  }

  /**
   * Register for a listener to be called when the boundaries specified in
   * config are reached.
   * @param {!JSONType} config the config that specifies the boundaries.
   * @param {Function} listener
   * @private
   */
  registerScrollTrigger_(config, listener) {
    if (!Array.isArray(config['verticalBoundaries']) &&
        !Array.isArray(config['horizontalBoundaries'])) {
      user().error(TAG, 'Boundaries are required for the scroll ' +
          'trigger to work.');
      return;
    }

    // Ensure that the scroll events are being listened to.
    if (!this.scrollHandlerRegistered_) {
      this.scrollHandlerRegistered_ = true;
      this.viewport_.onChanged(this.onScroll_.bind(this));
    }

    /**
     * @param {!Object<number, boolean>} bounds.
     * @param {number} scrollPos Number representing the current scroll
     * @param {string} varName variable name to assign to the bound that
     * triggers the event
     * position.
     */
    const triggerScrollEvents = function(bounds, scrollPos, varName) {
      if (!scrollPos) {
        return;
      }
      // Goes through each of the boundaries and fires an event if it has not
      // been fired so far and it should be.
      for (const b in bounds) {
        if (!bounds.hasOwnProperty(b) || b > scrollPos || bounds[b]) {
          continue;
        }
        bounds[b] = true;
        const vars = Object.create(null);
        vars[varName] = b;
        listener(new AnalyticsEvent(AnalyticsEventType.SCROLL, vars));
      }
    };

    const boundsV = this.normalizeBoundaries_(config['verticalBoundaries']);
    const boundsH = this.normalizeBoundaries_(config['horizontalBoundaries']);
    this.scrollObservable_.add(e => {
      // Calculates percentage scrolled by adding screen height/width to
      // top/left and dividing by the total scroll height/width.
      triggerScrollEvents(boundsV,
          (e.top + e.height) * 100 / this.viewport_.getScrollHeight(),
          VAR_V_SCROLL_BOUNDARY);
      triggerScrollEvents(boundsH,
          (e.left + e.width) * 100 / this.viewport_.getScrollWidth(),
          VAR_H_SCROLL_BOUNDARY);
    });
  }

  /**
   * Rounds the boundaries for scroll trigger to nearest
   * SCROLL_PRECISION_PERCENT and returns an object with normalized boundaries
   * as keys and false as values.
   *
   * @param {!Array<number>} bounds array of bounds.
   * @return {!Object<number,boolean>} Object with normalized bounds as keys
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

      bound = Math.min(Math.round(bound / SCROLL_PRECISION_PERCENT) *
          SCROLL_PRECISION_PERCENT, 100);
      result[bound] = false;
    }
    return result;
  }

  /**
   * @param {JSONType} timerSpec
   * @private
   */
  isTimerSpecValid_(timerSpec) {
    if (!timerSpec) {
      user().error(TAG, 'Bad timer specification');
      return false;
    } else if (!timerSpec.hasOwnProperty('interval')) {
      user().error(TAG, 'Timer interval specification required');
      return false;
    } else if (typeof timerSpec['interval'] !== 'number' ||
               timerSpec['interval'] < MIN_TIMER_INTERVAL_SECONDS_) {
      user().error(TAG, 'Bad timer interval specification');
      return false;
    } else if (timerSpec.hasOwnProperty('maxTimerLength') &&
              (typeof timerSpec['maxTimerLength'] !== 'number' ||
                  timerSpec['maxTimerLength'] <= 0)) {
      user().error(TAG, 'Bad maxTimerLength specification');
      return false;
    } else {
      return true;
    }
  }

  /**
   * @param {!Function} listener
   * @param {JSONType} timerSpec
   * @private
   */
  createTimerListener_(listener, timerSpec) {
    const hasImmediate = timerSpec.hasOwnProperty('immediate');
    const callImmediate = hasImmediate ? Boolean(timerSpec['immediate']) : true;
    const intervalId = this.ampdoc.win.setInterval(
      listener.bind(null, new AnalyticsEvent(AnalyticsEventType.TIMER)),
      timerSpec['interval'] * 1000
    );

    if (callImmediate) {
      listener(new AnalyticsEvent(AnalyticsEventType.TIMER));
    }

    const maxTimerLength = timerSpec['maxTimerLength'] ||
        DEFAULT_MAX_TIMER_LENGTH_SECONDS_;
    this.ampdoc.win.setTimeout(
        this.ampdoc.win.clearInterval.bind(this.ampdoc.win, intervalId),
        maxTimerLength * 1000);
  }

  /**
   * Checks to confirm that a given trigger type is allowed for the element.
   * Specifically, it confirms that if the element is in the embed, only a
   * subset of the trigger types are allowed.
   * @param  {!AnalyticsEventType} triggerType
   * @param  {!Element} element
   * @return {boolean} True if the trigger is allowed. False otherwise.
   */
  isTriggerAllowed_(triggerType, element) {
    if (element.ownerDocument.defaultView != this.ampdoc.win) {
      return ALLOWED_IN_EMBED.indexOf(triggerType) > -1;
    }
    return true;
  }
}

/**
 * It's important to resolve instrumentation asynchronously in elements that depends on
 * it in multi-doc scope. Otherwise an element life-cycle could resolve way before we
 * have the service available.
 *
 * @param {!Node|!../../../src/service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<InstrumentationService>}
 */
export function instrumentationServiceForDoc(nodeOrDoc) {
  return /** @type {!Promise<InstrumentationService>} */ (
      getServicePromiseForDoc(nodeOrDoc, 'amp-analytics-instrumentation'));
}
