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

import {layoutRectLtwh} from '../layout-rect';
import {registerServiceBuilder, getService} from '../service';
import {resourcesForDoc} from '../services';
import {viewerForDoc} from '../services';
import {viewportForDoc} from '../services';
import {whenDocumentComplete} from '../document-ready';
import {getMode} from '../mode';
import {isCanary} from '../experiments';
import {throttle} from '../utils/function';
import {map} from '../utils/object';

/**
 * Maximum number of tick events we allow to accumulate in the performance
 * instance's queue before we start dropping those events and can no longer
 * be forwarded to the actual `tick` function when it is set.
 */
const QUEUE_LIMIT = 50;

/**
 * @typedef {{
 *   label: string,
 *   delta: (number|null|undefined),
 *   value: (number|null|undefined)
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
    this.initTime_ = this.win.Date.now();

    /** @const @private {!Array<TickEventDef>} */
    this.events_ = [];

    /** @private {?./viewer-impl.Viewer} */
    this.viewer_ = null;

    /** @private {?./resources-impl.Resources} */
    this.resources_ = null;

    /** @private {boolean} */
    this.isMessagingReady_ = false;

    /** @private {boolean} */
    this.isPerformanceTrackingOn_ = false;

    /** @private {!Object<string,boolean>} */
    this.enabledExperiments_ = map();
    /** @private {string} */
    this.ampexp_ = '';

    // Add RTV version as experiment ID, so we can slice the data by version.
    this.addEnabledExperiment('rtv-' + getMode(this.win).rtvVersion);
    if (isCanary(this.win)) {
      this.addEnabledExperiment('canary');
    }

    // Tick window.onload event.
    whenDocumentComplete(win.document).then(() => {
      this.onload_();
      this.flush();
    });
  }

  /**
   * Listens to viewer and resource events.
   * @return {!Promise}
   */
  coreServicesAvailable() {
    this.viewer_ = viewerForDoc(this.win.document);
    this.resources_ = resourcesForDoc(this.win.document);

    this.isPerformanceTrackingOn_ = this.viewer_.isEmbedded() &&
        this.viewer_.getParam('csi') === '1';

    // This is for redundancy. Call flush on any visibility change.
    this.viewer_.onVisibilityChanged(this.flush.bind(this));

    // Does not need to wait for messaging ready since it will be queued
    // if it isn't ready.
    this.measureUserPerceivedVisualCompletenessTime_();

    // Can be null which would mean this AMP page is not embedded
    // and has no messaging channel.
    const channelPromise = this.viewer_.whenMessagingReady();

    this.viewer_.whenFirstVisible().then(() => {
      this.tick('ofv');
      this.flush();
    });

    // We don't check `isPerformanceTrackingOn` here since there are some
    // events that we call on the viewer even though performance tracking
    // is off we only need to know if the AMP page has a messaging
    // channel or not.
    if (!channelPromise) {
      return Promise.resolve();
    }

    return channelPromise.then(() => {
      this.isMessagingReady_ = true;

      // Tick the "messaging ready" signal.
      this.tickDelta('msr', this.win.Date.now() - this.initTime_);

      // Forward all queued ticks to the viewer since messaging
      // is now ready.
      this.flushQueuedTicks_();

      // Send all csi ticks through.
      this.flush();
    });
  }

  onload_() {
    this.tick('ol');
    // Detect deprecated first pain time API
    // https://bugs.chromium.org/p/chromium/issues/detail?id=621512
    // We'll use this until something better is available.
    if (this.win.chrome && typeof this.win.chrome.loadTimes == 'function') {
      this.tickDelta('fp',
          this.win.chrome.loadTimes().firstPaintTime * 1000 -
              this.win.performance.timing.navigationStart);
    }
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
        docVisibleTime = this.win.Date.now();
      });
    }

    this.whenViewportLayoutComplete_().then(() => {
      if (didStartInPrerender) {
        const userPerceivedVisualCompletenesssTime = docVisibleTime > -1
            ? (this.win.Date.now() - docVisibleTime)
            //  Prerender was complete before visibility.
            : 0;
        this.viewer_.whenFirstVisible().then(() => {
          // We only tick this if the page eventually becomes visible,
          // since otherwise we heavily skew the metric towards the
          // 0 case, since pre-renders that are never used are highly
          // likely to fully load before they are never used :)
          this.tickDelta('pc', userPerceivedVisualCompletenesssTime);
        });
        this.prerenderComplete_(userPerceivedVisualCompletenesssTime);
      } else {
        // If it didnt start in prerender, no need to calculate anything
        // and we just need to tick `pc`. (it will give us the relative
        // time since the viewer initialized the timer)
        this.tick('pc');
        // We don't have the actual csi timer's clock start time,
        // so we just have to use `docVisibleTime`.
        this.prerenderComplete_(this.win.Date.now() - docVisibleTime);
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
    const size = viewportForDoc(this.win.document).getSize();
    const rect = layoutRectLtwh(0, 0, size.width, size.height);
    return this.resources_.getResourcesInRect(
            this.win, rect, /* isInPrerender */ true)
        .then(resources => Promise.all(resources.map(r => r.loadedOnce())));
  }

  /**
   * Ticks a timing event.
   *
   * @param {string} label The variable name as it will be reported.
   *     See TICKEVENTS.md for available metrics, and edit this file
   *     when adding a new metric.
   * @param {number=} opt_delta The delta. Call tickDelta instead of setting
   *     this directly.
   */
  tick(label, opt_delta) {
    const value = (opt_delta == undefined) ? this.win.Date.now() : undefined;

    const data = {
      label,
      value,
      // Delta can be 0 or negative, but will always be changed to 1.
      delta: opt_delta != null ? Math.max(opt_delta, 1) : undefined,
    };
    if (this.isMessagingReady_ && this.isPerformanceTrackingOn_) {
      this.viewer_.sendMessage('tick', data);
    } else {
      this.queueTick_(data);
    }
    // Add browser performance timeline entries for simple ticks.
    // These are for example exposed in WPT.
    if (this.win.performance
        && this.win.performance.mark
        && arguments.length == 1) {
      this.win.performance.mark(label);
    }
  }

  /**
   * Tick a very specific value for the label. Use this method if you
   * measure the time it took to do something yourself.
   * @param {string} label The variable name as it will be reported.
   * @param {number} value The value in milliseconds that should be ticked.
   */
  tickDelta(label, value) {
    this.tick(label, value);
  }

  /**
   * Tick time delta since the document has become visible.
   * @param {string} label The variable name as it will be reported.
   */
  tickSinceVisible(label) {
    const now = this.win.Date.now();
    const visibleTime = this.viewer_ ? this.viewer_.getFirstVisibleTime() : 0;
    const v = visibleTime ? Math.max(now - visibleTime, 0) : 0;
    this.tickDelta(label, v);
  }


  /**
   * Ask the viewer to flush the ticks
   */
  flush() {
    if (this.isMessagingReady_ && this.isPerformanceTrackingOn_) {
      this.viewer_.sendMessage('sendCsi', {
        ampexp: this.ampexp_,
      }, /* cancelUnsent */true);
    }
  }

  /**
   * Flush with a rate limit of 10 per second.
   */
  throttledFlush() {
    if (!this.throttledFlush_) {
      /** @private {function()} */
      this.throttledFlush_ = throttle(this.win, this.flush.bind(this), 100);
    }
    this.throttledFlush_();
  }

  /**
   * @param {string} experimentId
   */
  addEnabledExperiment(experimentId) {
    this.enabledExperiments_[experimentId] = true;
    this.ampexp_ = Object.keys(this.enabledExperiments_).join(',');
  }

  /**
   * Queues the events to be flushed when tick function is set.
   *
   * @param {TickEventDef} data Tick data to be queued.
   * @private
   */
  queueTick_(data) {
    // Start dropping the head of the queue if we've reached the limit
    // so that we don't take up too much memory in the runtime.
    if (this.events_.length >= QUEUE_LIMIT) {
      this.events_.shift();
    }

    this.events_.push(data);
  }

  /**
   * Forwards all queued ticks to the viewer tick method.
   * @private
   */
  flushQueuedTicks_() {
    if (!this.viewer_) {
      return;
    }

    if (!this.isPerformanceTrackingOn_) {
      // drop all queued ticks to not leak
      this.events_.length = 0;
      return;
    }

    this.events_.forEach(tickEvent => {
      this.viewer_.sendMessage('tick', tickEvent);
    });
    this.events_.length = 0;
  }

  /**
   * @private
   * @param {number} value
   */
  prerenderComplete_(value) {
    if (this.viewer_) {
      this.viewer_.sendMessage('prerenderComplete', {value},
          /* cancelUnsent */true);
    }
  }

  /**
   * Identifies if the viewer is able to track performance.
   * If the document is not embedded, there is no messaging channel,
   * so no performance tracking is needed since there is nobody to forward the events.
   * @return {boolean}
   */
  isPerformanceTrackingOn() {
    return this.isPerformanceTrackingOn_;
  }
}


/**
 * @param {!Window} window
 */
export function installPerformanceService(window) {
  registerServiceBuilder(window, 'performance', Performance);
}

/**
 * @param {!Window} window
 * @return {!Performance}
 */
export function performanceFor(window) {
  return getService(window, 'performance');
}
