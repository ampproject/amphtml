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

import {documentInfoFor} from '../document-info';
import {onDocumentReady} from '../document-ready';
import {fromClass} from '../service';
import {loadPromise} from '../event-helper';
import {resourcesFor} from '../resources';
import {timer} from '../timer';
import {viewerFor} from '../viewer';


/**
 * Maximum number of tick events we allow to accumulate in the performance
 * instance's queue before we start dropping those events and can no longer
 * be forwarded to the actual `tick` function when it is set.
 */
const QUEUE_LIMIT = 50;

/**
 * Added to relative relative timings so that they are never 0 which the
 * underlying library considers a non-value.
 */
export const ENSURE_NON_ZERO = new Date().getTime();

/**
 * @typedef {{
 *   label: string,
 *   opt_from: (string|null|undefined),
 *   opt_value: (number|undefined)
 * }}
 */
let TickEventDef;


/**
 * Increments the value, else defaults to 0 for the given object key.
 * @param {!Object<string, (string|number|boolean|Array|Object|null)>} obj
 * @param {?string} name
 */
function incOrDef(obj, name) {
  if (!name) {
    return;
  }

  if (!obj[name]) {
    obj[name] = 1;
  } else {
    obj[name]++;
  }
}


/**
 * Performance holds the mechanism to call `tick` to stamp out important
 * events in the lifecycle of the AMP runtime. It can hold a small amount
 * of tick events to forward to the external `tick` function when it is set.
 */
export class Performance {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {number} */
    this.initTime_ = timer.now();

    /** @const @private {!Array<TickEventDef>} */
    this.events_ = [];

    /** @private {?./viewer-impl.Viewer} */
    this.viewer_ = null;

    /** @private {?./resources-impl.Resources} */
    this.resources = null;

    /** @private {boolean} */
    this.isMessagingReady_ = false;

    /** @private @const {!Promise} */
    this.whenReadyToRetrieveResourcesPromise_ = new Promise(resolve => {
      onDocumentReady(this.win.document, () => {
        // We need to add a delay, since this can execute earlier
        // than the onReady callback registered inside of `Resources`.
        // Should definitely think of making `getResourcesInViewport` async.
        timer.delay(resolve);
      });
    });

    // Tick window.onload event.
    loadPromise(win).then(() => {
      this.tick('ol');
      this.flush();
    });
  }

  /**
   * Listens to viewer and resource events.
   * @return {!Promise}
   */
  coreServicesAvailable() {
    this.viewer_ = viewerFor(this.win);
    this.resources_ = resourcesFor(this.win);

    // This is for redundancy. Call flush on any visibility change.
    this.viewer_.onVisibilityChanged(this.flush.bind(this));

    // Does not need to wait for messaging ready since it will be queued
    // if it isn't ready.
    this.measureUserPerceivedVisualCompletenessTime_();

    // Can be null which would mean this AMP page is not embedded
    // and has no messaging channel.
    const channelPromise = this.viewer_.whenMessagingReady();

    // We don't check `isPerformanceTrackingOn` here since there are some
    // events that we call on the viewer even though performance tracking
    // is off we only need to know if the AMP page has a messaging
    // channel or not.
    if (!channelPromise) {
      return Promise.resolve();
    }

    return channelPromise.then(() => {
      this.isMessagingReady_ = true;

      // This task is async
      this.setDocumentInfoParams_();
      // forward all queued ticks to the viewer since messaging
      // is now ready.
      this.flushQueuedTicks_();
      // send all csi ticks through.
      this.flush();
    });
  }

  /**
   * Measure the delay the user perceives of how long it takes
   * to load the initial viewport.
   * @private
   */
  measureUserPerceivedVisualCompletenessTime_() {
    const didStartInPrerender = !this.viewer_.hasBeenVisible();
    let docVisibleTime = didStartInPrerender ? -1 : this.initTime_;

    // This is only relevant if the viewer is in prerender mode.
    // (hasn't been visible yet, ever at this point)
    if (didStartInPrerender) {
      this.viewer_.whenFirstVisible().then(() => {
        docVisibleTime = timer.now();
      });
    }

    this.whenViewportLayoutComplete_().then(() => {
      if (didStartInPrerender) {
        const userPerceivedVisualCompletenesssTime = docVisibleTime > -1
            ? (timer.now() - docVisibleTime)
            : 1 /* MS (magic number for prerender was complete
                   by the time the user opened the page) */;
        this.tickDelta('pc', userPerceivedVisualCompletenesssTime);
        this.prerenderComplete_(userPerceivedVisualCompletenesssTime);
      } else {
        // If it didnt start in prerender, no need to calculate anything
        // and we just need to tick `pc`. (it will give us the relative
        // time since the viewer initialized the timer)
        this.tick('pc');
        // We don't have the actual csi timer's clock start time,
        // so we just have to use `docVisibleTime`.
        this.prerenderComplete_(timer.now() - docVisibleTime);
      }
      this.flush();
    });
  }

  /**
   * Returns a promise that is resolved when resources in viewport
   * have been finished being laid out.
   * @return {!Promise}
   * @private
   */
  whenViewportLayoutComplete_() {
    return this.whenReadyToRetrieveResources_().then(() => {
      return Promise.all(this.resources_.getResourcesInViewport().map(r => {
        // We're ok with the layout failing and still reporting.
        return r.loaded().catch(function() {});
      }));
    });
  }

  /**
   * Returns a promise that is resolved when the document is ready and
   * after a microtask delay.
   * @return {!Promise}
   */
  whenReadyToRetrieveResources_() {
    return this.whenReadyToRetrieveResourcesPromise_;
  }

  /**
   * Forward an object to be appended as search params to the external
   * intstrumentation library.
   * @param {!JSONType} params
   * @private
   */
  setFlushParams_(params) {
    this.viewer_.setFlushParams(params);
  }

  /**
   * Ticks a timing event.
   *
   * @param {string} label The variable name as it will be reported.
   * @param {?string=} opt_from The label of a previous tick to use as a
   *    relative start for this tick.
   * @param {number=} opt_value The time to record the tick at. Optional, if
   *    not provided, use the current time. You probably want to use
   *    `tickDelta` instead.
   */
  tick(label, opt_from, opt_value) {
    opt_from = opt_from == undefined ? null : opt_from;
    opt_value = opt_value == undefined ? timer.now() : opt_value;

    if (this.isMessagingReady_ && this.viewer_.isPerformanceTrackingOn()) {
      this.viewer_.tick({
        label,
        from: opt_from,
        value: opt_value,
      });
    } else {
      this.queueTick_(label, opt_from, opt_value);
    }
  }

  /**
   * Tick a very specific value for the label. Use this method if you
   * measure the time it took to do something yourself.
   * @param {string} label The variable name as it will be reported.
   * @param {number} value The value in milliseconds that should be ticked.
   */
  tickDelta(label, value) {
    // ENSURE_NON_ZERO Is added instead of non-zero, because the underlying
    // library doesn't like 0 values.
    this.tick('_' + label, undefined, ENSURE_NON_ZERO);
    this.tick(label, '_' + label, Math.round(value + ENSURE_NON_ZERO));
  }

  /**
   * Tick time delta since the document has become visible.
   * @param {string} label The variable name as it will be reported.
   */
  tickSinceVisible(label) {
    const now = timer.now();
    const visibleTime = this.viewer_ ? this.viewer_.getFirstVisibleTime() : 0;
    const v = visibleTime ? Math.max(now - visibleTime, 0) : 0;
    this.tickDelta(label, v);
  }


  /**
   * Calls the "flushTicks" function on the viewer.
   */
  flush() {
    if (this.isMessagingReady_ && this.viewer_.isPerformanceTrackingOn()) {
      this.viewer_.flushTicks();
    }
  }


  /**
   * Queues the events to be flushed when tick function is set.
   *
   * @param {string} label The variable name as it will be reported.
   * @param {?string=} opt_from The label of a previous tick to use as a
   *    relative start for this tick.
   * @param {number=} opt_value The time to record the tick at. Optional, if
   *    not provided, use the current time.
   * @private
   */
  queueTick_(label, opt_from, opt_value) {
    // Start dropping the head of the queue if we've reached the limit
    // so that we don't take up too much memory in the runtime.
    if (this.events_.length >= QUEUE_LIMIT) {
      this.events_.shift();
    }

    this.events_.push({
      label,
      from: opt_from,
      value: opt_value,
    });
  }


  /**
   * Forwards all queued ticks to the viewer tick method.
   * @private
   */
  flushQueuedTicks_() {
    if (!this.viewer_) {
      return;
    }

    if (!this.viewer_.isPerformanceTrackingOn()) {
      // drop all queued ticks to not leak
      this.events_.length = 0;
      return;
    }

    this.events_.forEach(tickEvent => {
      this.viewer_.tick(tickEvent);
    });
    this.events_.length = 0;
  }


  /**
   * Calls "setFlushParams_" with relevant document information.
   * @return {!Promise}
   * @private
   */
  setDocumentInfoParams_() {
    return this.whenViewportLayoutComplete_().then(() => {
      const params = Object.create(null);
      const sourceUrl = documentInfoFor(this.win).sourceUrl
          .replace(/#.*/, '');
      params['sourceUrl'] = sourceUrl;

      this.resources_.get().forEach(r => {
        const el = r.element;
        const name = el.tagName.toLowerCase();
        incOrDef(params, name);
        if (name == 'amp-ad') {
          incOrDef(params, `ad-${el.getAttribute('type')}`);
        }
      });

      this.setFlushParams_(params);
      this.flush();
    });
  }

  /**
   * @private
   * @param {number} value
   */
  prerenderComplete_(value) {
    if (this.viewer_) {
      this.viewer_.prerenderComplete({
        value,
      });
    }
  }
}


/**
 * @param {!Window} window
 * @return {!Performance}
 */
export function installPerformanceService(window) {
  return fromClass(window, 'performance', Performance);
};
