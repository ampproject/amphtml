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

import {
  AmpdocAnalyticsRoot,
  EmbedAnalyticsRoot,
} from './analytics-root';
import {
  AnalyticsEvent,
  AnalyticsEventType,
  CustomEventTracker,
  getTrackerKeyName,
  getTrackerTypesForParentType,
} from './events';
import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {
  getFriendlyIframeEmbedOptional,
} from '../../../src/friendly-iframe-embed';
import {
  getParentWindowFrameElement,
  getServiceForDoc,
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service';
import {hasOwn} from '../../../src/utils/object';

const SCROLL_PRECISION_PERCENT = 5;
const VAR_H_SCROLL_BOUNDARY = 'horizontalScrollBoundary';
const VAR_V_SCROLL_BOUNDARY = 'verticalScrollBoundary';
const PROP = '__AMP_AN_ROOT';



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
 * @implements {../../../src/service.Disposable}
 * @private
 * @visibleForTesting
 */
export class InstrumentationService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.ampdocRoot_ = new AmpdocAnalyticsRoot(this.ampdoc);

    /** @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private {boolean} */
    this.scrollHandlerRegistered_ = false;

    /** @private {!Observable<
        !../../../src/service/viewport/viewport-impl.ViewportChangedEventDef>} */
    this.scrollObservable_ = new Observable();
  }

  /** @override */
  dispose() {
    this.ampdocRoot_.dispose();
  }

  /**
   * @param {!Node} context
   * @return {!./analytics-root.AnalyticsRoot}
   */
  getAnalyticsRoot(context) {
    return this.findRoot_(context);
  }

  /**
   * @param {!Element} analyticsElement
   * @return {!AnalyticsGroup}
   */
  createAnalyticsGroup(analyticsElement) {
    const root = this.findRoot_(analyticsElement);
    return new AnalyticsGroup(root, analyticsElement, this);
  }

  /**
   * Triggers the analytics event with the specified type.
   *
   * @param {!Element} target
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   */
  triggerEventForTarget(target, eventType, opt_vars) {
    // TODO(dvoytenko): rename to `triggerEvent`.
    const event = new AnalyticsEvent(target, eventType, opt_vars);
    const root = this.findRoot_(target);
    const tracker = /** @type {!CustomEventTracker} */ (
      root.getTracker('custom', CustomEventTracker));
    tracker.trigger(event);
  }

  /**
   * @param {!Node} context
   * @return {!./analytics-root.AnalyticsRoot}
   */
  findRoot_(context) {
    // FIE
    const frame = getParentWindowFrameElement(context, this.ampdoc.win);
    if (frame) {
      const embed = getFriendlyIframeEmbedOptional(frame);
      if (embed) {
        const embedNotNull = embed;
        return this.getOrCreateRoot_(embed, () => {
          return new EmbedAnalyticsRoot(this.ampdoc, embedNotNull,
              this.ampdocRoot_);
        });
      }
    }

    // Ampdoc root
    return this.ampdocRoot_;
  }

  /**
   * @param {!Object} holder
   * @param {function():!./analytics-root.AnalyticsRoot} factory
   * @return {!./analytics-root.AnalyticsRoot}
   */
  getOrCreateRoot_(holder, factory) {
    let root = /** @type {?./analytics-root.AnalyticsRoot} */ (holder[PROP]);
    if (!root) {
      root = factory();
      holder[PROP] = root;
    }
    return root;
  }

  /**
   * @param {!JsonObject} config Configuration for instrumentation.
   * @param {function(!AnalyticsEvent)} listener The callback to call when the event
   *  occurs.
   * @param {!Element} analyticsElement The element associated with the
   *  config.
   * @private
   */
  addListenerDepr_(config, listener, analyticsElement) {
    const eventType = config['on'];
    if (!this.isTriggerAllowed_(eventType, analyticsElement)) {
      user().error(TAG, 'Trigger type "' + eventType + '" is not ' +
        'allowed in the embed.');
      return;
    }
    if (eventType === AnalyticsEventType.SCROLL) {
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
        velocity: 0, // Hack for typing.
      });
    }
  }

  /**
   * @param {string} type
   * @param {!Object<string, string>=} opt_vars
   * @return {!AnalyticsEvent}
   * @private
   */
  createEventDepr_(type, opt_vars) {
    // TODO(dvoytenko): Remove when Tracker migration is complete.
    return new AnalyticsEvent(
        this.ampdocRoot_.getRootElement(), type, opt_vars);
  }

  /**
   * @param {!../../../src/service/viewport/viewport-impl.ViewportChangedEventDef} e
   * @private
   */
  onScroll_(e) {
    this.scrollObservable_.fire(e);
  }

  /**
   * Register for a listener to be called when the boundaries specified in
   * config are reached.
   * @param {!JsonObject} config the config that specifies the boundaries.
   * @param {function(!AnalyticsEvent)} listener
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
    const triggerScrollEvents = (bounds, scrollPos, varName) => {
      if (!scrollPos) {
        return;
      }
      // Goes through each of the boundaries and fires an event if it has not
      // been fired so far and it should be.
      for (const b in bounds) {
        if (!hasOwn(bounds, b) || b > scrollPos || bounds[b]) {
          continue;
        }
        bounds[b] = true;
        const vars = Object.create(null);
        vars[varName] = b;
        listener(this.createEventDepr_(AnalyticsEventType.SCROLL, vars));
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
   * Checks to confirm that a given trigger type is allowed for the element.
   * Specifically, it confirms that if the element is in the embed, only a
   * subset of the trigger types are allowed.
   * @param  {!AnalyticsEventType} triggerType
   * @param  {!Element} element
   * @return {boolean} True if the trigger is allowed. False otherwise.
   */
  isTriggerAllowed_(triggerType, element) {
    if (element.ownerDocument.defaultView != this.ampdoc.win) {
      return ALLOWED_IN_EMBED.includes(triggerType);
    }
    return true;
  }
}


/**
 * Represents the group of analytics triggers for a single config. All triggers
 * are declared and released at the same time.
 *
 * @implements {../../../src/service.Disposable}
 */
export class AnalyticsGroup {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   * @param {!Element} analyticsElement
   * @param {!InstrumentationService} service
   */
  constructor(root, analyticsElement, service) {
    // TODO(dvoytenko): remove `service` as soon as migration is complete.

    /** @const */
    this.root_ = root;
    /** @const */
    this.analyticsElement_ = analyticsElement;
    /** @const */
    this.service_ = service;

    /** @private @const {!Array<!UnlistenDef>} */
    this.listeners_ = [];
  }

  /** @override */
  dispose() {
    this.listeners_.forEach(listener => {
      listener();
    });
  }

  /**
   * Adds a trigger with the specified config and listener. The config must
   * contain `on` property specifying the type of the event.
   *
   * Triggers registered on a group are automatically released when the
   * group is disposed.
   *
   * @param {!JsonObject} config
   * @param {function(!AnalyticsEvent)} handler
   */
  addTrigger(config, handler) {
    const eventType = dev().assertString(config['on']);
    const trackerKey = getTrackerKeyName(eventType);
    const trackerWhitelist = getTrackerTypesForParentType(this.root_.getType());

    if (this.isDeprecatedListenerEvent(trackerKey)) {
      // TODO(dvoytenko): remove this use and `addListenerDepr_` once all
      // triggers have been migrated..
      this.service_.addListenerDepr_(config, handler, this.analyticsElement_);
      return;
    }

    const tracker = this.root_.getTrackerForWhitelist(
        trackerKey, trackerWhitelist);
    user().assert(!!tracker,
        'Trigger type "%s" is not allowed in the %s', eventType,
        this.root_.getType());
    const unlisten = tracker.add(this.analyticsElement_, eventType, config,
        handler);
    this.listeners_.push(unlisten);
  }

  /**
   * @param {string} triggerType
   * @return {boolean}
   */
  isDeprecatedListenerEvent(triggerType) {
    return triggerType == 'scroll';
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
export function instrumentationServicePromiseForDoc(nodeOrDoc) {
  return /** @type {!Promise<InstrumentationService>} */ (
    getServicePromiseForDoc(nodeOrDoc, 'amp-analytics-instrumentation'));
}

/*
 * @param {!Node|!../../../src/service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!InstrumentationService}
 */
export function instrumentationServiceForDocForTesting(nodeOrDoc) {
  registerServiceBuilderForDoc(
      nodeOrDoc, 'amp-analytics-instrumentation', InstrumentationService);
  return getServiceForDoc(nodeOrDoc, 'amp-analytics-instrumentation');
}
