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

import {Services} from '../services';
import {Signals} from '../utils/signals';
import {TickLabel} from '../enums';
import {VisibilityState} from '../visibility-state';
import {createCustomEvent} from '../event-helper';
import {dev, devAssert} from '../log';
import {dict, map} from '../utils/object';
import {getMode} from '../mode';
import {getService, registerServiceBuilder} from '../service';
import {isStoryDocument} from '../utils/story';
import {layoutRectLtwh} from '../layout-rect';
import {throttle} from '../utils/rate-limit';
import {whenContentIniLoad} from '../ini-load';
import {whenDocumentComplete, whenDocumentReady} from '../document-ready';

/**
 * Maximum number of tick events we allow to accumulate in the performance
 * instance's queue before we start dropping those events and can no longer
 * be forwarded to the actual `tick` function when it is set.
 */
const QUEUE_LIMIT = 50;

/** @const {string} */
const VISIBILITY_CHANGE_EVENT = 'visibilitychange';

/**
 * Fields:
 * {{
 *   label: string,
 *   delta: (number|null|undefined),
 *   value: (number|null|undefined)
 * }}
 * @typedef {!JsonObject}
 */
let TickEventDef;

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

    /** @const @private {!Array<TickEventDef>} */
    this.events_ = [];

    /** @const @private {number} */
    this.timeOrigin_ =
      win.performance.timeOrigin || win.performance.timing.navigationStart;

    /** @private {?./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = null;

    /** @private {?./viewer-interface.ViewerInterface} */
    this.viewer_ = null;

    /** @private {?./resources-interface.ResourcesInterface} */
    this.resources_ = null;

    /** @private {boolean} */
    this.isMessagingReady_ = false;

    /** @private {boolean} */
    this.isPerformanceTrackingOn_ = false;

    /** @private {!Object<string,boolean>} */
    this.enabledExperiments_ = map();

    /** @private {string|undefined} */
    this.ampexp_ = undefined;

    /** @private {Signals} */
    this.metrics_ = new Signals();

    /**
     * How many times a layout shift metric has been ticked.
     *
     * @private {number}
     */
    this.shiftScoresTicked_ = 0;

    /**
     * The sum of all layout shift fractions triggered on the page from the
     * Layout Instability API.
     *
     * @private {number}
     */
    this.aggregateShiftScore_ = 0;

    /**
     * True if the ratios have already been ticked.
     * @private {boolean}
     */
    this.slowElementRatioTicked_ = false;

    const supportedEntryTypes =
      (this.win.PerformanceObserver &&
        this.win.PerformanceObserver.supportedEntryTypes) ||
      [];

    // If Paint Timing API is not supported, cannot determine first contentful paint
    if (!supportedEntryTypes.includes('paint')) {
      this.metrics_.rejectSignal(
        TickLabel.FIRST_CONTENTFUL_PAINT,
        dev().createExpectedError('First Contentful Paint not supported')
      );
    }

    /**
     * Whether the user agent supports the Layout Instability API that shipped
     * with Chromium 77.
     *
     * @private {boolean}
     */
    this.supportsLayoutShift_ = supportedEntryTypes.includes('layout-shift');

    if (!this.supportsLayoutShift_) {
      this.metrics_.rejectSignal(
        TickLabel.CUMULATIVE_LAYOUT_SHIFT,
        dev().createExpectedError('Cumulative Layout Shift not supported')
      );
    }

    /**
     * Whether the user agent supports the Event Timing API that shipped
     * with Chromium 77.
     *
     * @private {boolean}
     */
    this.supportsEventTiming_ = supportedEntryTypes.includes('first-input');

    if (!this.supportsEventTiming_) {
      this.metrics_.rejectSignal(
        TickLabel.FIRST_INPUT_DELAY,
        dev().createExpectedError('First Input Delay not supported')
      );
    }

    /**
     * Whether the user agent supports the Largest Contentful Paint metric.
     *
     * @private {boolean}
     */
    this.supportsLargestContentfulPaint_ = supportedEntryTypes.includes(
      'largest-contentful-paint'
    );

    if (!this.supportsLargestContentfulPaint_) {
      this.metrics_.rejectSignal(
        TickLabel.LARGEST_CONTENTFUL_PAINT_VISIBLE,
        dev().createExpectedError('Largest Contentful Paint not supported')
      );
    }

    /**
     * Whether the user agent supports the navigation timing API
     *
     * @private {boolean}
     */
    this.supportsNavigation_ = supportedEntryTypes.includes('navigation');

    /**
     * The latest reported largest contentful paint time, where the loadTime
     * is specified.
     *
     * @private {number|null}
     */
    this.largestContentfulPaintLoadTime_ = null;

    /**
     * The latest reported largest contentful paint time, where the renderTime
     * is specified.
     *
     * @private {number|null}
     */
    this.largestContentfulPaintRenderTime_ = null;

    this.boundOnVisibilityChange_ = this.onVisibilityChange_.bind(this);
    this.onAmpDocVisibilityChange_ = this.onAmpDocVisibilityChange_.bind(this);

    // Add RTV version as experiment ID, so we can slice the data by version.
    this.addEnabledExperiment('rtv-' + getMode(this.win).rtvVersion);

    // Tick document ready event.
    whenDocumentReady(win.document).then(() => {
      this.tick(TickLabel.DOCUMENT_READY);
      this.flush();
    });

    // Tick window.onload event.
    whenDocumentComplete(win.document).then(() => this.onload_());
    this.registerPerformanceObserver_();
    this.registerFirstInputDelayPolyfillListener_();
  }

  /**
   * Listens to viewer and resource events.
   * @return {!Promise}
   */
  coreServicesAvailable() {
    const {documentElement} = this.win.document;
    this.ampdoc_ = Services.ampdoc(documentElement);
    this.viewer_ = Services.viewerForDoc(documentElement);
    this.resources_ = Services.resourcesForDoc(documentElement);

    this.isPerformanceTrackingOn_ =
      this.viewer_.isEmbedded() && this.viewer_.getParam('csi') === '1';

    // This is for redundancy. Call flush on any visibility change.
    this.ampdoc_.onVisibilityChanged(this.flush.bind(this));

    // Does not need to wait for messaging ready since it will be queued
    // if it isn't ready.
    this.measureUserPerceivedVisualCompletenessTime_();

    // Can be null which would mean this AMP page is not embedded
    // and has no messaging channel.
    const channelPromise = this.viewer_.whenMessagingReady();

    this.ampdoc_.whenFirstVisible().then(() => {
      this.tick(TickLabel.ON_FIRST_VISIBLE);
      this.flush();
    });

    const registerVisibilityChangeListener =
      this.supportsLargestContentfulPaint_ || this.supportsLayoutShift_;
    // Register a handler to record metrics when the page enters the hidden
    // lifecycle state.
    if (registerVisibilityChangeListener) {
      this.win.addEventListener(
        VISIBILITY_CHANGE_EVENT,
        this.boundOnVisibilityChange_,
        {capture: true}
      );

      this.ampdoc_.onVisibilityChanged(this.onAmpDocVisibilityChange_);
    }

    // We don't check `isPerformanceTrackingOn` here since there are some
    // events that we call on the viewer even though performance tracking
    // is off we only need to know if the AMP page has a messaging
    // channel or not.
    if (!channelPromise) {
      return Promise.resolve();
    }

    return channelPromise
      .then(() => {
        // Tick the "messaging ready" signal.
        this.tickDelta(TickLabel.MESSAGING_READY, this.win.performance.now());

        // Tick timeOrigin so that epoch time can be calculated by consumers.
        this.tick(TickLabel.TIME_ORIGIN, undefined, this.timeOrigin_);

        const usqp = this.ampdoc_.getMetaByName('amp-usqp');
        if (usqp) {
          usqp.split(',').forEach((exp) => {
            this.addEnabledExperiment('ssr-' + exp);
          });
        }

        return this.maybeAddStoryExperimentId_();
      })
      .then(() => {
        this.isMessagingReady_ = true;

        // Forward all queued ticks to the viewer since messaging
        // is now ready.
        this.flushQueuedTicks_();

        // Send all csi ticks through.
        this.flush();
      });
  }

  /**
   * Add a story experiment ID in order to slice the data for amp-story.
   * @return {!Promise}
   * @private
   */
  maybeAddStoryExperimentId_() {
    const ampdoc = Services.ampdocServiceFor(this.win).getSingleDoc();
    return isStoryDocument(ampdoc).then((isStory) => {
      if (isStory) {
        this.addEnabledExperiment('story');
      }
    });
  }

  /**
   * Callback for onload.
   */
  onload_() {
    this.tick(TickLabel.ON_LOAD);
    this.tickLegacyFirstPaintTime_();
    this.flush();
  }

  /**
   * Reports performance metrics first paint, first contentful paint,
   * and first input delay.
   * See https://github.com/WICG/paint-timing
   */
  registerPerformanceObserver_() {
    // Turn off performanceObserver derived metrics for inabox as there
    // will never be a viewer to report to.
    // TODO(ccordry): we are still doing some other unnecessary measurements for
    // the inabox case, but would need a larger refactor.
    if (getMode(this.win).runtime === 'inabox') {
      return;
    }

    // These state vars ensure that we only report a given value once, because
    // the backend doesn't support updates.
    let recordedFirstPaint = false;
    let recordedFirstContentfulPaint = false;
    let recordedFirstInputDelay = false;
    let recordedNavigation = false;
    const processEntry = (entry) => {
      if (entry.name == 'first-paint' && !recordedFirstPaint) {
        this.tickDelta(TickLabel.FIRST_PAINT, entry.startTime + entry.duration);
        recordedFirstPaint = true;
      } else if (
        entry.name == 'first-contentful-paint' &&
        !recordedFirstContentfulPaint
      ) {
        const value = entry.startTime + entry.duration;
        this.tickDelta(TickLabel.FIRST_CONTENTFUL_PAINT, value);
        this.tickSinceVisible(TickLabel.FIRST_CONTENTFUL_PAINT_VISIBLE, value);
        recordedFirstContentfulPaint = true;
      } else if (
        entry.entryType === 'first-input' &&
        !recordedFirstInputDelay
      ) {
        const value = entry.processingStart - entry.startTime;
        this.tickDelta(TickLabel.FIRST_INPUT_DELAY, value);
        recordedFirstInputDelay = true;
      } else if (entry.entryType === 'layout-shift') {
        // Ignore layout shift that occurs within 500ms of user input, as it is
        // likely in response to the user's action.
        if (!entry.hadRecentInput) {
          this.aggregateShiftScore_ += entry.value;
        }
      } else if (entry.entryType === 'largest-contentful-paint') {
        if (entry.loadTime) {
          this.largestContentfulPaintLoadTime_ = entry.loadTime;
        }
        if (entry.renderTime) {
          this.largestContentfulPaintRenderTime_ = entry.renderTime;
        }
      } else if (entry.entryType == 'navigation' && !recordedNavigation) {
        [
          'domComplete',
          'domContentLoadedEventEnd',
          'domContentLoadedEventStart',
          'domInteractive',
          'loadEventEnd',
          'loadEventStart',
          'requestStart',
          'responseStart',
        ].forEach((label) => this.tick(label, entry[label]));
        recordedNavigation = true;
      }
    };

    const entryTypesToObserve = [];
    if (this.win.PerformancePaintTiming) {
      // Programmatically read once as currently PerformanceObserver does not
      // report past entries as of Chromium 61.
      // https://bugs.chromium.org/p/chromium/issues/detail?id=725567
      this.win.performance.getEntriesByType('paint').forEach(processEntry);
      entryTypesToObserve.push('paint');
    }

    if (this.supportsEventTiming_) {
      this.createPerformanceObserver_(processEntry, {
        type: 'first-input',
        buffered: true,
      });
    }

    if (this.supportsLayoutShift_) {
      this.createPerformanceObserver_(processEntry, {
        type: 'layout-shift',
        buffered: true,
      });
    }

    if (this.supportsLargestContentfulPaint_) {
      // lcpObserver
      this.createPerformanceObserver_(processEntry, {
        type: 'largest-contentful-paint',
        buffered: true,
      });
    }

    if (this.supportsNavigation_) {
      // Wrap in a try statement as there are some browsers (ex. chrome 73)
      // that will say it supports navigation but throws.
      this.createPerformanceObserver_(processEntry, {
        type: 'navigation',
        buffered: true,
      });
    }

    if (entryTypesToObserve.length > 0) {
      this.createPerformanceObserver_(processEntry, {
        entryTypes: entryTypesToObserve,
      });
    }
  }

  /**
   * @param {function(!PerformanceEntry)} processEntry
   * @param {!PerformanceObserverInit} init
   * @return {!PerformanceObserver}
   * @private
   */
  createPerformanceObserver_(processEntry, init) {
    try {
      const obs = new this.win.PerformanceObserver((list) => {
        list.getEntries().forEach(processEntry);
        this.flush();
      });
      obs.observe(init);
    } catch (err) {
      dev().warn(TAG, err);
    }
  }

  /**
   * Reports the first input delay value calculated by a polyfill, if present.
   * @see https://github.com/GoogleChromeLabs/first-input-delay
   */
  registerFirstInputDelayPolyfillListener_() {
    if (!this.win.perfMetrics || !this.win.perfMetrics.onFirstInputDelay) {
      return;
    }
    this.win.perfMetrics.onFirstInputDelay((delay) => {
      this.tickDelta(TickLabel.FIRST_INPUT_DELAY_POLYFILL, delay);
      this.flush();
    });
  }

  /**
   * When the visibility state of the document changes to hidden,
   * send the layout scores.
   * @private
   */
  onVisibilityChange_() {
    if (this.win.document.visibilityState === 'hidden') {
      this.tickCumulativeMetrics_();
    }
  }

  /**
   * When the viewer visibility state of the document changes to inactive,
   * send the layout score.
   * @private
   */
  onAmpDocVisibilityChange_() {
    if (this.ampdoc_.getVisibilityState() === VisibilityState.INACTIVE) {
      this.tickCumulativeMetrics_();
    }
  }

  /**
   * Tick the metrics whose values change over time.
   * @private
   */
  tickCumulativeMetrics_() {
    if (this.supportsLayoutShift_) {
      this.tickLayoutShiftScore_();
    }
    if (this.supportsLargestContentfulPaint_) {
      this.tickLargestContentfulPaint_();
    }
    this.tickSlowElementRatio_();
  }

  /**
   * Tick the layout shift score metric.
   *
   * A value of the metric is recorded in under two names, `cls` and `cls-2`,
   * for the first two times the page transitions into a hidden lifecycle state
   * (when the page is navigated a way from, the tab is backgrounded for
   * another tab, or the user backgrounds the browser application).
   *
   * Since we can't reliably detect when a page session finally ends,
   * recording the value for these first two events should provide a fair
   * amount of visibility into this metric.
   */
  tickLayoutShiftScore_() {
    if (this.shiftScoresTicked_ === 0) {
      this.tickDelta(
        TickLabel.CUMULATIVE_LAYOUT_SHIFT,
        this.aggregateShiftScore_
      );
      this.flush();
      this.shiftScoresTicked_ = 1;
    } else if (this.shiftScoresTicked_ === 1) {
      this.tickDelta(
        TickLabel.CUMULATIVE_LAYOUT_SHIFT_2,
        this.aggregateShiftScore_
      );
      this.flush();
      this.shiftScoresTicked_ = 2;

      // No more work to do, so clean up event listeners.
      this.win.removeEventListener(
        VISIBILITY_CHANGE_EVENT,
        this.boundOnVisibilityChange_,
        {capture: true}
      );
    }
  }

  /**
   * Tick the slow element ratio.
   */
  tickSlowElementRatio_() {
    if (this.slowElementRatioTicked_) {
      return;
    }
    if (!this.resources_) {
      const TAG = 'Performance';
      dev().error(TAG, 'Failed to tick ser due to null resources');
      return;
    }

    this.slowElementRatioTicked_ = true;
    this.tickDelta(
      TickLabel.SLOW_ELEMENT_RATIO,
      this.resources_.getSlowElementRatio()
    );
    this.flush();
  }

  /**
   * Tick fp time based on Chromium's legacy paint timing API when
   * appropriate.
   * `registerPaintTimingObserver_` calls the standards based API and this
   * method does nothing if it is available.
   */
  tickLegacyFirstPaintTime_() {
    // Detect deprecated first paint time API
    // https://bugs.chromium.org/p/chromium/issues/detail?id=621512
    // We'll use this until something better is available.
    if (
      !this.win.PerformancePaintTiming &&
      this.win.chrome &&
      typeof this.win.chrome.loadTimes == 'function'
    ) {
      const fpTime =
        this.win.chrome.loadTimes()['firstPaintTime'] * 1000 -
        this.win.performance.timing.navigationStart;
      if (fpTime <= 1) {
        // Throw away bad data generated from an apparent Chromium bug
        // that is fixed in later Chromium versions.
        return;
      }
      this.tickDelta(TickLabel.FIRST_PAINT, fpTime);
    }
  }

  /**
   * Tick the largest contentful paint metrics.
   */
  tickLargestContentfulPaint_() {
    /** @type {number|null} */ let end;
    if (this.largestContentfulPaintLoadTime_ !== null) {
      this.tickDelta(
        TickLabel.LARGEST_CONTENTFUL_PAINT_LOAD,
        this.largestContentfulPaintLoadTime_
      );
      end = this.largestContentfulPaintLoadTime_;
    }
    if (this.largestContentfulPaintRenderTime_ !== null) {
      this.tickDelta(
        TickLabel.LARGEST_CONTENTFUL_PAINT_RENDER,
        this.largestContentfulPaintRenderTime_
      );
      end = end || this.largestContentfulPaintRenderTime_;
    }
    if (end !== null) {
      this.tickSinceVisible(TickLabel.LARGEST_CONTENTFUL_PAINT_VISIBLE, end);
    }
    this.flush();
  }

  /**
   * Measure the delay the user perceives of how long it takes
   * to load the initial viewport.
   * @private
   */
  measureUserPerceivedVisualCompletenessTime_() {
    const didStartInPrerender = !this.ampdoc_.hasBeenVisible();

    let docVisibleTime = -1;
    this.ampdoc_.whenFirstVisible().then(() => {
      docVisibleTime = this.win.performance.now();
      // Mark this first visible instance in the browser timeline.
      this.mark('visible');
    });

    this.whenViewportLayoutComplete_().then(() => {
      if (didStartInPrerender) {
        const userPerceivedVisualCompletenesssTime =
          docVisibleTime > -1
            ? this.win.performance.now() - docVisibleTime
            : //  Prerender was complete before visibility.
              0;
        this.ampdoc_.whenFirstVisible().then(() => {
          // We only tick this if the page eventually becomes visible,
          // since otherwise we heavily skew the metric towards the
          // 0 case, since pre-renders that are never used are highly
          // likely to fully load before they are never used :)
          this.tickDelta(
            TickLabel.FIRST_VIEWPORT_READY,
            userPerceivedVisualCompletenesssTime
          );
        });
        this.prerenderComplete_(userPerceivedVisualCompletenesssTime);
        // Mark this instance in the browser timeline.
        this.mark(TickLabel.FIRST_VIEWPORT_READY);
      } else {
        // If it didnt start in prerender, no need to calculate anything
        // and we just need to tick `pc`. (it will give us the relative
        // time since the viewer initialized the timer)
        this.tick(TickLabel.FIRST_VIEWPORT_READY);
        this.prerenderComplete_(this.win.performance.now() - docVisibleTime);
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
    return this.resources_.whenFirstPass().then(() => {
      const {documentElement} = this.win.document;
      const size = Services.viewportForDoc(documentElement).getSize();
      const rect = layoutRectLtwh(0, 0, size.width, size.height);
      return whenContentIniLoad(
        documentElement,
        this.win,
        rect,
        /* isInPrerender */ true
      );
    });
  }

  /**
   * Ticks a timing event.
   *
   * @param {TickLabel} label The variable name as it will be reported.
   *     See TICKEVENTS.md for available metrics, and edit this file
   *     when adding a new metric.
   * @param {number=} opt_delta The delta. Call tickDelta instead of setting
   *     this directly.
   * @param {number=} opt_value The value to use. Overrides default calculation.
   */
  tick(label, opt_delta, opt_value) {
    devAssert(
      opt_delta == undefined || opt_value == undefined,
      'You may not set both opt_delta and opt_value.'
    );

    const data = dict({'label': label});
    let delta;

    if (opt_delta != undefined) {
      data['delta'] = delta = Math.max(opt_delta, 0);
    } else if (opt_value != undefined) {
      data['value'] = opt_value;
    } else {
      // Marking only makes sense for non-overridden values (and no deltas).
      this.mark(label);
      delta = this.win.performance.now();
      data['value'] = this.timeOrigin_ + delta;
    }

    // Emit events. Used by `gulp performance`.
    this.win.dispatchEvent(
      createCustomEvent(
        this.win,
        'perf',
        /** @type {JsonObject} */ ({label, delta})
      )
    );

    if (this.isMessagingReady_ && this.isPerformanceTrackingOn_) {
      this.viewer_.sendMessage('tick', data);
    } else {
      this.queueTick_(data);
    }

    this.metrics_.signal(label, delta);
  }

  /**
   * Add browser performance timeline entries for simple ticks.
   * These are for example exposed in WPT.
   * See https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark
   * @param {string} label
   */
  mark(label) {
    if (
      this.win.performance &&
      this.win.performance.mark &&
      arguments.length == 1
    ) {
      this.win.performance.mark(label);
    }
  }

  /**
   * Tick a very specific value for the label. Use this method if you
   * measure the time it took to do something yourself.
   * @param {TickLabel} label The variable name as it will be reported.
   * @param {number} value The value in milliseconds that should be ticked.
   */
  tickDelta(label, value) {
    this.tick(label, value);
  }

  /**
   * Tick time delta since the document has become visible.
   * @param {TickLabel} label The variable name as it will be reported.
   * @param {number=} opt_delta The optional delta value in milliseconds.
   */
  tickSinceVisible(label, opt_delta) {
    const delta =
      opt_delta == undefined ? this.win.performance.now() : opt_delta;
    const end = this.timeOrigin_ + delta;

    // Order is timeOrigin -> firstVisibleTime -> end.
    const visibleTime = this.ampdoc_ && this.ampdoc_.getFirstVisibleTime();
    const v = visibleTime ? Math.max(end - visibleTime, 0) : 0;
    this.tickDelta(label, v);
  }

  /**
   * Ask the viewer to flush the ticks
   */
  flush() {
    if (this.isMessagingReady_ && this.isPerformanceTrackingOn_) {
      if (this.ampexp_ == null) {
        this.ampexp_ = Object.keys(this.enabledExperiments_).join(',');
      }
      this.viewer_.sendMessage(
        'sendCsi',
        dict({
          'ampexp': this.ampexp_,
        }),
        /* cancelUnsent */ true
      );
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
    this.ampexp_ = undefined;
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

    this.events_.forEach((tickEvent) => {
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
      this.viewer_.sendMessage(
        'prerenderComplete',
        dict({'value': value}),
        /* cancelUnsent */ true
      );
    }
  }

  /**
   * Identifies if the viewer is able to track performance. If the document is
   * not embedded, there is no messaging channel, so no performance tracking is
   * needed since there is nobody to forward the events.
   * @return {boolean}
   */
  isPerformanceTrackingOn() {
    return this.isPerformanceTrackingOn_;
  }

  /**
   * Retrieve a promise for tick label, resolved with metric. Used by amp-analytics
   *
   * @param {TickLabel} label
   * @return {!Promise<time>}
   */
  getMetric(label) {
    return this.metrics_.whenSignal(label);
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
