import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { TickLabel } from "../core/constants/enums";
import { VisibilityState } from "../core/constants/visibility-state";
import { Signals } from "../core/data-structures/signals";
import { whenDocumentComplete, whenDocumentReady } from "../core/document-ready";
import { layoutRectLtwh } from "../core/dom/layout/rect";
import { computedStyle } from "../core/dom/style";
import { throttle } from "../core/types/function";
import { dict, map } from "../core/types/object";
import { Services } from "./";
import { createCustomEvent } from "../event-helper";
import { whenContentIniLoad } from "../ini-load";
import { dev, devAssert } from "../log";
import { getMode } from "../mode";
import { getService, registerServiceBuilder } from "../service-helpers";
import { isStoryDocument } from "../utils/story";

/**
 * Maximum number of tick events we allow to accumulate in the performance
 * instance's queue before we start dropping those events and can no longer
 * be forwarded to the actual `tick` function when it is set.
 */
var QUEUE_LIMIT = 50;
var TAG = 'Performance';

/**
 * Fields:
 * {{
 *   label: string,
 *   delta: (number|null|undefined),
 *   value: (number|null|undefined)
 * }}
 * @typedef {!JsonObject}
 */
var TickEventDef;

/**
 * Performance holds the mechanism to call `tick` to stamp out important
 * events in the lifecycle of the AMP runtime. It can hold a small amount
 * of tick events to forward to the external `tick` function when it is set.
 */
export var Performance = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Performance(win) {
    var _this = this;

    _classCallCheck(this, Performance);

    /** @const {!Window} */
    this.win = win;

    /** @const @private {!Array<TickEventDef>} */
    this.events_ = [];

    /** @const @private {number} */
    this.timeOrigin_ = win.performance.timeOrigin || win.performance.timing.navigationStart;

    /** @private {?./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = null;

    /** @private {?./viewer-interface.ViewerInterface} */
    this.viewer_ = null;

    /** @private {?./resources-interface.ResourcesInterface} */
    this.resources_ = null;

    /** @private {?./document-info-impl.DocumentInfoDef} */
    this.documentInfo_ = null;

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
     * The collection of layout shift events from the Layout Instability API.
     * @private {Array<LayoutShift>}
     */
    this.layoutShifts_ = [];
    var supportedEntryTypes = this.win.PerformanceObserver && this.win.PerformanceObserver.supportedEntryTypes || [];

    // If Paint Timing API is not supported, cannot determine first contentful paint
    if (!supportedEntryTypes.includes('paint')) {
      this.metrics_.rejectSignal(TickLabel.FIRST_CONTENTFUL_PAINT, dev().createExpectedError('First Contentful Paint not supported'));
    }

    /**
     * Whether the user agent supports the Layout Instability API that shipped
     * with Chromium 77.
     *
     * @private {boolean}
     */
    this.supportsLayoutShift_ = supportedEntryTypes.includes('layout-shift');

    if (!this.supportsLayoutShift_) {
      this.metrics_.rejectSignal(TickLabel.CUMULATIVE_LAYOUT_SHIFT, dev().createExpectedError('Cumulative Layout Shift not supported'));
    }

    /**
     * Whether the user agent supports the Event Timing API that shipped
     * with Chromium 77.
     *
     * @private {boolean}
     */
    this.supportsEventTiming_ = supportedEntryTypes.includes('first-input');

    if (!this.supportsEventTiming_) {
      this.metrics_.rejectSignal(TickLabel.FIRST_INPUT_DELAY, dev().createExpectedError('First Input Delay not supported'));
    }

    /**
     * Whether the user agent supports the Largest Contentful Paint metric.
     *
     * @private {boolean}
     */
    this.supportsLargestContentfulPaint_ = supportedEntryTypes.includes('largest-contentful-paint');

    if (!this.supportsLargestContentfulPaint_) {
      this.metrics_.rejectSignal(TickLabel.LARGEST_CONTENTFUL_PAINT, dev().createExpectedError('Largest Contentful Paint not supported'));
    }

    /**
     * Whether the user agent supports the navigation timing API
     *
     * @private {boolean}
     */
    this.supportsNavigation_ = supportedEntryTypes.includes('navigation');

    /**
     * The latest reported largest contentful paint time. Uses entry.startTime,
     * which equates to: renderTime ?? loadTime. We can't always use one or the other
     * because:
     * - loadTime is 0 for non-remote resources (text)
     * - renderTime is undefined for crossorigin resources
     *
     * @private {?number}
     */
    this.largestContentfulPaint_ = null;
    this.onAmpDocVisibilityChange_ = this.onAmpDocVisibilityChange_.bind(this);
    // Add RTV version as experiment ID, so we can slice the data by version.
    this.addEnabledExperiment('rtv-' + getMode(this.win).rtvVersion);
    // Tick document ready event.
    whenDocumentReady(win.document).then(function () {
      _this.tick(TickLabel.DOCUMENT_READY);

      _this.flush();
    });
    // Tick window.onload event.
    whenDocumentComplete(win.document).then(function () {
      return _this.onload_();
    });
    this.registerPerformanceObserver_();
    this.registerFirstInputDelayPolyfillListener_();

    /**
     * @private {boolean}
     */
    this.googleFontExpRecorded_ = false;
  }

  /**
   * Listens to viewer and resource events.
   * @return {!Promise}
   */
  _createClass(Performance, [{
    key: "coreServicesAvailable",
    value: function coreServicesAvailable() {
      var _this2 = this;

      var documentElement = this.win.document.documentElement;
      this.ampdoc_ = Services.ampdoc(documentElement);
      this.viewer_ = Services.viewerForDoc(documentElement);
      this.resources_ = Services.resourcesForDoc(documentElement);
      this.documentInfo_ = Services.documentInfoForDoc(this.ampdoc_);
      this.isPerformanceTrackingOn_ = this.viewer_.isEmbedded() && this.viewer_.getParam('csi') === '1';
      // This is for redundancy. Call flush on any visibility change.
      this.ampdoc_.onVisibilityChanged(this.flush.bind(this));
      // Does not need to wait for messaging ready since it will be queued
      // if it isn't ready.
      this.measureUserPerceivedVisualCompletenessTime_();
      // Can be null which would mean this AMP page is not embedded
      // and has no messaging channel.
      var channelPromise = this.viewer_.whenMessagingReady();
      this.ampdoc_.whenFirstVisible().then(function () {
        _this2.tick(TickLabel.ON_FIRST_VISIBLE);

        _this2.flush();
      });
      var registerVisibilityChangeListener = this.supportsLargestContentfulPaint_ || this.supportsLayoutShift_;

      // Register a handler to record metrics when the page enters the hidden
      // lifecycle state.
      if (registerVisibilityChangeListener) {
        this.ampdoc_.onVisibilityChanged(this.onAmpDocVisibilityChange_);
      }

      // We don't check `isPerformanceTrackingOn` here since there are some
      // events that we call on the viewer even though performance tracking
      // is off we only need to know if the AMP page has a messaging
      // channel or not.
      if (!channelPromise) {
        return _resolvedPromise();
      }

      return channelPromise.then(function () {
        // Tick the "messaging ready" signal.
        _this2.tickDelta(TickLabel.MESSAGING_READY, _this2.win.performance.now());

        // Tick timeOrigin so that epoch time can be calculated by consumers.
        _this2.tick(TickLabel.TIME_ORIGIN, undefined, _this2.timeOrigin_);

        var usqp = _this2.ampdoc_.getMetaByName('amp-usqp');

        if (usqp) {
          usqp.split(',').forEach(function (exp) {
            _this2.addEnabledExperiment('ssr-' + exp);
          });
        }

        return _this2.maybeAddStoryExperimentId_();
      }).then(function () {
        _this2.isMessagingReady_ = true;

        // Forward all queued ticks to the viewer since messaging
        // is now ready.
        _this2.flushQueuedTicks_();

        // Send all csi ticks through.
        _this2.flush();
      });
    }
    /**
     * Add a story experiment ID in order to slice the data for amp-story.
     * @return {!Promise}
     * @private
     */

  }, {
    key: "maybeAddStoryExperimentId_",
    value: function maybeAddStoryExperimentId_() {
      var _this3 = this;

      var ampdoc = Services.ampdocServiceFor(this.win).getSingleDoc();
      return isStoryDocument(ampdoc).then(function (isStory) {
        if (isStory) {
          _this3.addEnabledExperiment('story');
        }
      });
    }
    /**
     * Callback for onload.
     */

  }, {
    key: "onload_",
    value: function onload_() {
      this.tick(TickLabel.ON_LOAD);
      this.tickLegacyFirstPaintTime_();
      this.flush();
    }
    /**
     * Reports performance metrics first paint, first contentful paint,
     * and first input delay.
     * See https://github.com/WICG/paint-timing
     */

  }, {
    key: "registerPerformanceObserver_",
    value: function registerPerformanceObserver_() {
      var _this4 = this;

      // Turn off performanceObserver derived metrics for inabox as there
      // will never be a viewer to report to.
      // TODO(ccordry): we are still doing some other unnecessary measurements for
      // the inabox case, but would need a larger refactor.
      if (getMode(this.win).runtime === 'inabox') {
        return;
      }

      // These state vars ensure that we only report a given value once, because
      // the backend doesn't support updates.
      var recordedFirstPaint = false;
      var recordedFirstContentfulPaint = false;
      var recordedFirstInputDelay = false;
      var recordedNavigation = false;

      var processEntry = function processEntry(entry) {
        if (entry.name == 'first-paint' && !recordedFirstPaint) {
          _this4.tickDelta(TickLabel.FIRST_PAINT, entry.startTime + entry.duration);

          recordedFirstPaint = true;
        } else if (entry.name == 'first-contentful-paint' && !recordedFirstContentfulPaint) {
          var value = entry.startTime + entry.duration;

          _this4.tickDelta(TickLabel.FIRST_CONTENTFUL_PAINT, value);

          _this4.tickSinceVisible(TickLabel.FIRST_CONTENTFUL_PAINT_VISIBLE, value);

          recordedFirstContentfulPaint = true;
        } else if (entry.entryType === 'first-input' && !recordedFirstInputDelay) {
          var _value = entry.processingStart - entry.startTime;

          _this4.tickDelta(TickLabel.FIRST_INPUT_DELAY, _value);

          recordedFirstInputDelay = true;
        } else if (entry.entryType === 'layout-shift') {
          // Ignore layout shift that occurs within 500ms of user input, as it is
          // likely in response to the user's action.
          // 1000 here is a magic number to prevent unbounded growth. We don't expect it to be reached.
          if (!entry.hadRecentInput && _this4.layoutShifts_.length < 1000) {
            _this4.layoutShifts_.push(entry);
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          _this4.largestContentfulPaint_ = entry.startTime;
        } else if (entry.entryType == 'navigation' && !recordedNavigation) {
          ['domComplete', 'domContentLoadedEventEnd', 'domContentLoadedEventStart', 'domInteractive', 'loadEventEnd', 'loadEventStart', 'requestStart', 'responseStart'].forEach(function (label) {
            return _this4.tick(label, entry[label]);
          });
          recordedNavigation = true;
        }
      };

      var entryTypesToObserve = [];

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
          buffered: true
        });
      }

      if (this.supportsLayoutShift_) {
        this.createPerformanceObserver_(processEntry, {
          type: 'layout-shift',
          buffered: true
        });
      }

      if (this.supportsLargestContentfulPaint_) {
        // lcpObserver
        this.createPerformanceObserver_(processEntry, {
          type: 'largest-contentful-paint',
          buffered: true
        });
      }

      if (this.supportsNavigation_) {
        // Wrap in a try statement as there are some browsers (ex. chrome 73)
        // that will say it supports navigation but throws.
        this.createPerformanceObserver_(processEntry, {
          type: 'navigation',
          buffered: true
        });
      }

      if (entryTypesToObserve.length > 0) {
        this.createPerformanceObserver_(processEntry, {
          entryTypes: entryTypesToObserve
        });
      }
    }
    /**
     * @param {function(!PerformanceEntry)} processEntry
     * @param {!PerformanceObserverInit} init
     * @return {!PerformanceObserver}
     * @private
     */

  }, {
    key: "createPerformanceObserver_",
    value: function createPerformanceObserver_(processEntry, init) {
      var _this5 = this;

      try {
        var obs = new this.win.PerformanceObserver(function (list) {
          list.getEntries().forEach(processEntry);

          _this5.flush();
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

  }, {
    key: "registerFirstInputDelayPolyfillListener_",
    value: function registerFirstInputDelayPolyfillListener_() {
      var _this6 = this;

      if (!this.win.perfMetrics || !this.win.perfMetrics.onFirstInputDelay) {
        return;
      }

      this.win.perfMetrics.onFirstInputDelay(function (delay) {
        _this6.tickDelta(TickLabel.FIRST_INPUT_DELAY_POLYFILL, delay);

        _this6.flush();
      });
    }
    /**
     * When the viewer visibility state of the document changes to inactive or hidden,
     * send the layout score.
     * @private
     */

  }, {
    key: "onAmpDocVisibilityChange_",
    value: function onAmpDocVisibilityChange_() {
      var state = this.ampdoc_.getVisibilityState();

      if (state === VisibilityState.INACTIVE || state === VisibilityState.HIDDEN) {
        this.tickCumulativeMetrics_();
      }
    }
    /**
     * Tick the metrics whose values change over time.
     * @private
     */

  }, {
    key: "tickCumulativeMetrics_",
    value: function tickCumulativeMetrics_() {
      if (this.supportsLayoutShift_) {
        if (!this.googleFontExpRecorded_) {
          this.googleFontExpRecorded_ = true;
          var win = this.win;
          var googleFontExp = parseInt(computedStyle(win, win.document.body).getPropertyValue('--google-font-exp'), 10);

          if (googleFontExp >= 0) {
            this.addEnabledExperiment("google-font-exp=" + googleFontExp);
          }
        }

        this.tickLayoutShiftScore_();
      }

      if (this.supportsLargestContentfulPaint_) {
        this.tickLargestContentfulPaint_();
      }
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

  }, {
    key: "tickLayoutShiftScore_",
    value: function tickLayoutShiftScore_() {
      var _this$metrics_$get, _this$metrics_$get2;

      var cls = this.layoutShifts_.reduce(function (sum, entry) {
        return sum + entry.value;
      }, 0);
      var fcp = (_this$metrics_$get = this.metrics_.get(TickLabel.FIRST_CONTENTFUL_PAINT)) != null ? _this$metrics_$get : 0;
      // fallback to 0, so that we never overcount.
      var ofv = (_this$metrics_$get2 = this.metrics_.get(TickLabel.ON_FIRST_VISIBLE)) != null ? _this$metrics_$get2 : 0;
      // TODO(#33207): Remove after data collection
      var clsBeforeFCP = this.layoutShifts_.reduce(function (sum, entry) {
        if (entry.startTime < fcp) {
          return sum + entry.value;
        }

        return sum;
      }, 0);
      var clsBeforeOFV = this.layoutShifts_.reduce(function (sum, entry) {
        if (entry.startTime < ofv) {
          return sum + entry.value;
        }

        return sum;
      }, 0);

      if (this.shiftScoresTicked_ === 0) {
        this.tick(TickLabel.CUMULATIVE_LAYOUT_SHIFT_BEFORE_VISIBLE, clsBeforeOFV);
        this.tickDelta(TickLabel.CUMULATIVE_LAYOUT_SHIFT_BEFORE_FCP, clsBeforeFCP);
        this.tickDelta(TickLabel.CUMULATIVE_LAYOUT_SHIFT, cls);
        this.flush();
        this.shiftScoresTicked_ = 1;
      } else if (this.shiftScoresTicked_ === 1) {
        this.tickDelta(TickLabel.CUMULATIVE_LAYOUT_SHIFT_2, cls);
        this.flush();
        this.shiftScoresTicked_ = 2;
      }
    }
    /**
     * Tick fp time based on Chromium's legacy paint timing API when
     * appropriate.
     * `registerPaintTimingObserver_` calls the standards based API and this
     * method does nothing if it is available.
     */

  }, {
    key: "tickLegacyFirstPaintTime_",
    value: function tickLegacyFirstPaintTime_() {
      // Detect deprecated first paint time API
      // https://bugs.chromium.org/p/chromium/issues/detail?id=621512
      // We'll use this until something better is available.
      if (!this.win.PerformancePaintTiming && this.win.chrome && typeof this.win.chrome.loadTimes == 'function') {
        var fpTime = this.win.chrome.loadTimes()['firstPaintTime'] * 1000 - this.win.performance.timing.navigationStart;

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

  }, {
    key: "tickLargestContentfulPaint_",
    value: function tickLargestContentfulPaint_() {
      if (this.largestContentfulPaint_ == null) {
        return;
      }

      this.tickDelta(TickLabel.LARGEST_CONTENTFUL_PAINT, this.largestContentfulPaint_);
      this.tickSinceVisible(TickLabel.LARGEST_CONTENTFUL_PAINT_VISIBLE, this.largestContentfulPaint_);
      this.flush();
    }
    /**
     * Measure the delay the user perceives of how long it takes
     * to load the initial viewport.
     * @private
     */

  }, {
    key: "measureUserPerceivedVisualCompletenessTime_",
    value: function measureUserPerceivedVisualCompletenessTime_() {
      var _this7 = this;

      var didStartInPrerender = !this.ampdoc_.hasBeenVisible();
      var docVisibleTime = -1;
      this.ampdoc_.whenFirstVisible().then(function () {
        docVisibleTime = _this7.win.performance.now();

        // Mark this first visible instance in the browser timeline.
        _this7.mark('visible');
      });
      this.whenViewportLayoutComplete_().then(function () {
        if (didStartInPrerender) {
          var userPerceivedVisualCompletenesssTime = docVisibleTime > -1 ? _this7.win.performance.now() - docVisibleTime : //  Prerender was complete before visibility.
          0;

          _this7.ampdoc_.whenFirstVisible().then(function () {
            // We only tick this if the page eventually becomes visible,
            // since otherwise we heavily skew the metric towards the
            // 0 case, since pre-renders that are never used are highly
            // likely to fully load before they are never used :)
            _this7.tickDelta(TickLabel.FIRST_VIEWPORT_READY, userPerceivedVisualCompletenesssTime);
          });

          _this7.prerenderComplete_(userPerceivedVisualCompletenesssTime);

          // Mark this instance in the browser timeline.
          _this7.mark(TickLabel.FIRST_VIEWPORT_READY);
        } else {
          // If it didnt start in prerender, no need to calculate anything
          // and we just need to tick `pc`. (it will give us the relative
          // time since the viewer initialized the timer)
          _this7.tick(TickLabel.FIRST_VIEWPORT_READY);

          _this7.prerenderComplete_(_this7.win.performance.now() - docVisibleTime);
        }

        _this7.flush();
      });
    }
    /**
     * Returns a promise that is resolved when resources in viewport
     * have been finished being laid out.
     * @return {!Promise}
     * @private
     */

  }, {
    key: "whenViewportLayoutComplete_",
    value: function whenViewportLayoutComplete_() {
      var _this8 = this;

      return this.resources_.whenFirstPass().then(function () {
        var documentElement = _this8.win.document.documentElement;
        var size = Services.viewportForDoc(documentElement).getSize();
        var rect = layoutRectLtwh(0, 0, size.width, size.height);
        return whenContentIniLoad(documentElement, _this8.win, rect,
        /* isInPrerender */
        true);
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

  }, {
    key: "tick",
    value: function tick(label, opt_delta, opt_value) {
      devAssert(opt_delta == undefined || opt_value == undefined, 'You may not set both opt_delta and opt_value.');
      var data = dict({
        'label': label
      });
      var delta;

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

      // Emit events. Used by `amp performance`.
      this.win.dispatchEvent(createCustomEvent(this.win, 'perf',
      /** @type {JsonObject} */
      {
        label: label,
        delta: delta
      }));

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

  }, {
    key: "mark",
    value: function mark(label) {
      if (this.win.performance && this.win.performance.mark && arguments.length == 1) {
        this.win.performance.mark(label);
      }
    }
    /**
     * Tick a very specific value for the label. Use this method if you
     * measure the time it took to do something yourself.
     * @param {TickLabel} label The variable name as it will be reported.
     * @param {number} value The value in milliseconds that should be ticked.
     */

  }, {
    key: "tickDelta",
    value: function tickDelta(label, value) {
      this.tick(label, value);
    }
    /**
     * Tick time delta since the document has become visible.
     * @param {TickLabel} label The variable name as it will be reported.
     * @param {number=} opt_delta The optional delta value in milliseconds.
     */

  }, {
    key: "tickSinceVisible",
    value: function tickSinceVisible(label, opt_delta) {
      var delta = opt_delta == undefined ? this.win.performance.now() : opt_delta;
      var end = this.timeOrigin_ + delta;
      // Order is timeOrigin -> firstVisibleTime -> end.
      var visibleTime = this.ampdoc_ && this.ampdoc_.getFirstVisibleTime();
      var v = visibleTime ? Math.max(end - visibleTime, 0) : 0;
      this.tickDelta(label, v);
    }
    /**
     * Ask the viewer to flush the ticks
     */

  }, {
    key: "flush",
    value: function flush() {
      if (this.isMessagingReady_ && this.isPerformanceTrackingOn_) {
        if (this.ampexp_ == null) {
          this.ampexp_ = Object.keys(this.enabledExperiments_).join(',');
        }

        this.viewer_.sendMessage('sendCsi', dict({
          'ampexp': this.ampexp_,
          'canonicalUrl': this.documentInfo_.canonicalUrl
        }),
        /* cancelUnsent */
        true);
      }
    }
    /**
     * Flush with a rate limit of 10 per second.
     */

  }, {
    key: "throttledFlush",
    value: function throttledFlush() {
      if (!this.throttledFlush_) {
        /** @private {function()} */
        this.throttledFlush_ = throttle(this.win, this.flush.bind(this), 100);
      }

      this.throttledFlush_();
    }
    /**
     * @param {string} experimentId
     */

  }, {
    key: "addEnabledExperiment",
    value: function addEnabledExperiment(experimentId) {
      this.enabledExperiments_[experimentId] = true;
      this.ampexp_ = undefined;
    }
    /**
     * Queues the events to be flushed when tick function is set.
     *
     * @param {TickEventDef} data Tick data to be queued.
     * @private
     */

  }, {
    key: "queueTick_",
    value: function queueTick_(data) {
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

  }, {
    key: "flushQueuedTicks_",
    value: function flushQueuedTicks_() {
      var _this9 = this;

      if (!this.viewer_) {
        return;
      }

      if (!this.isPerformanceTrackingOn_) {
        // drop all queued ticks to not leak
        this.events_.length = 0;
        return;
      }

      this.events_.forEach(function (tickEvent) {
        _this9.viewer_.sendMessage('tick', tickEvent);
      });
      this.events_.length = 0;
    }
    /**
     * @private
     * @param {number} value
     */

  }, {
    key: "prerenderComplete_",
    value: function prerenderComplete_(value) {
      if (this.viewer_) {
        this.viewer_.sendMessage('prerenderComplete', dict({
          'value': value
        }),
        /* cancelUnsent */
        true);
      }
    }
    /**
     * Identifies if the viewer is able to track performance. If the document is
     * not embedded, there is no messaging channel, so no performance tracking is
     * needed since there is nobody to forward the events.
     * @return {boolean}
     */

  }, {
    key: "isPerformanceTrackingOn",
    value: function isPerformanceTrackingOn() {
      return this.isPerformanceTrackingOn_;
    }
    /**
     * Retrieve a promise for tick label, resolved with metric. Used by amp-analytics
     *
     * @param {TickLabel} label
     * @return {!Promise<time>}
     */

  }, {
    key: "getMetric",
    value: function getMetric(label) {
      return this.metrics_.whenSignal(label);
    }
  }]);

  return Performance;
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBlcmZvcm1hbmNlLWltcGwuanMiXSwibmFtZXMiOlsiVGlja0xhYmVsIiwiVmlzaWJpbGl0eVN0YXRlIiwiU2lnbmFscyIsIndoZW5Eb2N1bWVudENvbXBsZXRlIiwid2hlbkRvY3VtZW50UmVhZHkiLCJsYXlvdXRSZWN0THR3aCIsImNvbXB1dGVkU3R5bGUiLCJ0aHJvdHRsZSIsImRpY3QiLCJtYXAiLCJTZXJ2aWNlcyIsImNyZWF0ZUN1c3RvbUV2ZW50Iiwid2hlbkNvbnRlbnRJbmlMb2FkIiwiZGV2IiwiZGV2QXNzZXJ0IiwiZ2V0TW9kZSIsImdldFNlcnZpY2UiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyIiwiaXNTdG9yeURvY3VtZW50IiwiUVVFVUVfTElNSVQiLCJUQUciLCJUaWNrRXZlbnREZWYiLCJQZXJmb3JtYW5jZSIsIndpbiIsImV2ZW50c18iLCJ0aW1lT3JpZ2luXyIsInBlcmZvcm1hbmNlIiwidGltZU9yaWdpbiIsInRpbWluZyIsIm5hdmlnYXRpb25TdGFydCIsImFtcGRvY18iLCJ2aWV3ZXJfIiwicmVzb3VyY2VzXyIsImRvY3VtZW50SW5mb18iLCJpc01lc3NhZ2luZ1JlYWR5XyIsImlzUGVyZm9ybWFuY2VUcmFja2luZ09uXyIsImVuYWJsZWRFeHBlcmltZW50c18iLCJhbXBleHBfIiwidW5kZWZpbmVkIiwibWV0cmljc18iLCJzaGlmdFNjb3Jlc1RpY2tlZF8iLCJsYXlvdXRTaGlmdHNfIiwic3VwcG9ydGVkRW50cnlUeXBlcyIsIlBlcmZvcm1hbmNlT2JzZXJ2ZXIiLCJpbmNsdWRlcyIsInJlamVjdFNpZ25hbCIsIkZJUlNUX0NPTlRFTlRGVUxfUEFJTlQiLCJjcmVhdGVFeHBlY3RlZEVycm9yIiwic3VwcG9ydHNMYXlvdXRTaGlmdF8iLCJDVU1VTEFUSVZFX0xBWU9VVF9TSElGVCIsInN1cHBvcnRzRXZlbnRUaW1pbmdfIiwiRklSU1RfSU5QVVRfREVMQVkiLCJzdXBwb3J0c0xhcmdlc3RDb250ZW50ZnVsUGFpbnRfIiwiTEFSR0VTVF9DT05URU5URlVMX1BBSU5UIiwic3VwcG9ydHNOYXZpZ2F0aW9uXyIsImxhcmdlc3RDb250ZW50ZnVsUGFpbnRfIiwib25BbXBEb2NWaXNpYmlsaXR5Q2hhbmdlXyIsImJpbmQiLCJhZGRFbmFibGVkRXhwZXJpbWVudCIsInJ0dlZlcnNpb24iLCJkb2N1bWVudCIsInRoZW4iLCJ0aWNrIiwiRE9DVU1FTlRfUkVBRFkiLCJmbHVzaCIsIm9ubG9hZF8iLCJyZWdpc3RlclBlcmZvcm1hbmNlT2JzZXJ2ZXJfIiwicmVnaXN0ZXJGaXJzdElucHV0RGVsYXlQb2x5ZmlsbExpc3RlbmVyXyIsImdvb2dsZUZvbnRFeHBSZWNvcmRlZF8iLCJkb2N1bWVudEVsZW1lbnQiLCJhbXBkb2MiLCJ2aWV3ZXJGb3JEb2MiLCJyZXNvdXJjZXNGb3JEb2MiLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJpc0VtYmVkZGVkIiwiZ2V0UGFyYW0iLCJvblZpc2liaWxpdHlDaGFuZ2VkIiwibWVhc3VyZVVzZXJQZXJjZWl2ZWRWaXN1YWxDb21wbGV0ZW5lc3NUaW1lXyIsImNoYW5uZWxQcm9taXNlIiwid2hlbk1lc3NhZ2luZ1JlYWR5Iiwid2hlbkZpcnN0VmlzaWJsZSIsIk9OX0ZJUlNUX1ZJU0lCTEUiLCJyZWdpc3RlclZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lciIsInRpY2tEZWx0YSIsIk1FU1NBR0lOR19SRUFEWSIsIm5vdyIsIlRJTUVfT1JJR0lOIiwidXNxcCIsImdldE1ldGFCeU5hbWUiLCJzcGxpdCIsImZvckVhY2giLCJleHAiLCJtYXliZUFkZFN0b3J5RXhwZXJpbWVudElkXyIsImZsdXNoUXVldWVkVGlja3NfIiwiYW1wZG9jU2VydmljZUZvciIsImdldFNpbmdsZURvYyIsImlzU3RvcnkiLCJPTl9MT0FEIiwidGlja0xlZ2FjeUZpcnN0UGFpbnRUaW1lXyIsInJ1bnRpbWUiLCJyZWNvcmRlZEZpcnN0UGFpbnQiLCJyZWNvcmRlZEZpcnN0Q29udGVudGZ1bFBhaW50IiwicmVjb3JkZWRGaXJzdElucHV0RGVsYXkiLCJyZWNvcmRlZE5hdmlnYXRpb24iLCJwcm9jZXNzRW50cnkiLCJlbnRyeSIsIm5hbWUiLCJGSVJTVF9QQUlOVCIsInN0YXJ0VGltZSIsImR1cmF0aW9uIiwidmFsdWUiLCJ0aWNrU2luY2VWaXNpYmxlIiwiRklSU1RfQ09OVEVOVEZVTF9QQUlOVF9WSVNJQkxFIiwiZW50cnlUeXBlIiwicHJvY2Vzc2luZ1N0YXJ0IiwiaGFkUmVjZW50SW5wdXQiLCJsZW5ndGgiLCJwdXNoIiwibGFiZWwiLCJlbnRyeVR5cGVzVG9PYnNlcnZlIiwiUGVyZm9ybWFuY2VQYWludFRpbWluZyIsImdldEVudHJpZXNCeVR5cGUiLCJjcmVhdGVQZXJmb3JtYW5jZU9ic2VydmVyXyIsInR5cGUiLCJidWZmZXJlZCIsImVudHJ5VHlwZXMiLCJpbml0Iiwib2JzIiwibGlzdCIsImdldEVudHJpZXMiLCJvYnNlcnZlIiwiZXJyIiwid2FybiIsInBlcmZNZXRyaWNzIiwib25GaXJzdElucHV0RGVsYXkiLCJkZWxheSIsIkZJUlNUX0lOUFVUX0RFTEFZX1BPTFlGSUxMIiwic3RhdGUiLCJnZXRWaXNpYmlsaXR5U3RhdGUiLCJJTkFDVElWRSIsIkhJRERFTiIsInRpY2tDdW11bGF0aXZlTWV0cmljc18iLCJnb29nbGVGb250RXhwIiwicGFyc2VJbnQiLCJib2R5IiwiZ2V0UHJvcGVydHlWYWx1ZSIsInRpY2tMYXlvdXRTaGlmdFNjb3JlXyIsInRpY2tMYXJnZXN0Q29udGVudGZ1bFBhaW50XyIsImNscyIsInJlZHVjZSIsInN1bSIsImZjcCIsImdldCIsIm9mdiIsImNsc0JlZm9yZUZDUCIsImNsc0JlZm9yZU9GViIsIkNVTVVMQVRJVkVfTEFZT1VUX1NISUZUX0JFRk9SRV9WSVNJQkxFIiwiQ1VNVUxBVElWRV9MQVlPVVRfU0hJRlRfQkVGT1JFX0ZDUCIsIkNVTVVMQVRJVkVfTEFZT1VUX1NISUZUXzIiLCJjaHJvbWUiLCJsb2FkVGltZXMiLCJmcFRpbWUiLCJMQVJHRVNUX0NPTlRFTlRGVUxfUEFJTlRfVklTSUJMRSIsImRpZFN0YXJ0SW5QcmVyZW5kZXIiLCJoYXNCZWVuVmlzaWJsZSIsImRvY1Zpc2libGVUaW1lIiwibWFyayIsIndoZW5WaWV3cG9ydExheW91dENvbXBsZXRlXyIsInVzZXJQZXJjZWl2ZWRWaXN1YWxDb21wbGV0ZW5lc3NzVGltZSIsIkZJUlNUX1ZJRVdQT1JUX1JFQURZIiwicHJlcmVuZGVyQ29tcGxldGVfIiwid2hlbkZpcnN0UGFzcyIsInNpemUiLCJ2aWV3cG9ydEZvckRvYyIsImdldFNpemUiLCJyZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJvcHRfZGVsdGEiLCJvcHRfdmFsdWUiLCJkYXRhIiwiZGVsdGEiLCJNYXRoIiwibWF4IiwiZGlzcGF0Y2hFdmVudCIsInNlbmRNZXNzYWdlIiwicXVldWVUaWNrXyIsInNpZ25hbCIsImFyZ3VtZW50cyIsImVuZCIsInZpc2libGVUaW1lIiwiZ2V0Rmlyc3RWaXNpYmxlVGltZSIsInYiLCJPYmplY3QiLCJrZXlzIiwiam9pbiIsImNhbm9uaWNhbFVybCIsInRocm90dGxlZEZsdXNoXyIsImV4cGVyaW1lbnRJZCIsInNoaWZ0IiwidGlja0V2ZW50Iiwid2hlblNpZ25hbCIsImluc3RhbGxQZXJmb3JtYW5jZVNlcnZpY2UiLCJ3aW5kb3ciLCJwZXJmb3JtYW5jZUZvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxTQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxvQkFBUixFQUE4QkMsaUJBQTlCO0FBQ0EsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLGFBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsSUFBUixFQUFjQyxHQUFkO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQVFDLGlCQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUFR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VUFBQzhHLFNBQUQsRUFBZTtBQUNsQyxRQUFBLE1BQUksQ0FBQ3pLLE9BQUwsQ0FBYTBKLFdBQWIsQ0FBeUIsTUFBekIsRUFBaUNlLFNBQWpDO0FBQ0QsT0FGRDtBQUdBLFdBQUtoTCxPQUFMLENBQWE0RixNQUFiLEdBQXNCLENBQXRCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUEzdkJBO0FBQUE7QUFBQSxXQTR2QkUsNEJBQW1CTixLQUFuQixFQUEwQjtBQUN4QixVQUFJLEtBQUsvRSxPQUFULEVBQWtCO0FBQ2hCLGFBQUtBLE9BQUwsQ0FBYTBKLFdBQWIsQ0FDRSxtQkFERixFQUVFakwsSUFBSSxDQUFDO0FBQUMsbUJBQVNzRztBQUFWLFNBQUQsQ0FGTjtBQUdFO0FBQW1CLFlBSHJCO0FBS0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUEzd0JBO0FBQUE7QUFBQSxXQTR3QkUsbUNBQTBCO0FBQ3hCLGFBQU8sS0FBSzNFLHdCQUFaO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBcnhCQTtBQUFBO0FBQUEsV0FzeEJFLG1CQUFVbUYsS0FBVixFQUFpQjtBQUNmLGFBQU8sS0FBSy9FLFFBQUwsQ0FBY2tLLFVBQWQsQ0FBeUJuRixLQUF6QixDQUFQO0FBQ0Q7QUF4eEJIOztBQUFBO0FBQUE7O0FBMnhCQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNvRix5QkFBVCxDQUFtQ0MsTUFBbkMsRUFBMkM7QUFDaEQxTCxFQUFBQSxzQkFBc0IsQ0FBQzBMLE1BQUQsRUFBUyxhQUFULEVBQXdCckwsV0FBeEIsQ0FBdEI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU3NMLGNBQVQsQ0FBd0JELE1BQXhCLEVBQWdDO0FBQ3JDLFNBQU8zTCxVQUFVLENBQUMyTCxNQUFELEVBQVMsYUFBVCxDQUFqQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7VGlja0xhYmVsfSBmcm9tICcjY29yZS9jb25zdGFudHMvZW51bXMnO1xuaW1wb3J0IHtWaXNpYmlsaXR5U3RhdGV9IGZyb20gJyNjb3JlL2NvbnN0YW50cy92aXNpYmlsaXR5LXN0YXRlJztcbmltcG9ydCB7U2lnbmFsc30gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3NpZ25hbHMnO1xuaW1wb3J0IHt3aGVuRG9jdW1lbnRDb21wbGV0ZSwgd2hlbkRvY3VtZW50UmVhZHl9IGZyb20gJyNjb3JlL2RvY3VtZW50LXJlYWR5JztcbmltcG9ydCB7bGF5b3V0UmVjdEx0d2h9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvcmVjdCc7XG5pbXBvcnQge2NvbXB1dGVkU3R5bGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge3Rocm90dGxlfSBmcm9tICcjY29yZS90eXBlcy9mdW5jdGlvbic7XG5pbXBvcnQge2RpY3QsIG1hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge2NyZWF0ZUN1c3RvbUV2ZW50fSBmcm9tICcuLi9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHt3aGVuQ29udGVudEluaUxvYWR9IGZyb20gJy4uL2luaS1sb2FkJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4uL21vZGUnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlLCByZWdpc3RlclNlcnZpY2VCdWlsZGVyfSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtpc1N0b3J5RG9jdW1lbnR9IGZyb20gJy4uL3V0aWxzL3N0b3J5JztcblxuLyoqXG4gKiBNYXhpbXVtIG51bWJlciBvZiB0aWNrIGV2ZW50cyB3ZSBhbGxvdyB0byBhY2N1bXVsYXRlIGluIHRoZSBwZXJmb3JtYW5jZVxuICogaW5zdGFuY2UncyBxdWV1ZSBiZWZvcmUgd2Ugc3RhcnQgZHJvcHBpbmcgdGhvc2UgZXZlbnRzIGFuZCBjYW4gbm8gbG9uZ2VyXG4gKiBiZSBmb3J3YXJkZWQgdG8gdGhlIGFjdHVhbCBgdGlja2AgZnVuY3Rpb24gd2hlbiBpdCBpcyBzZXQuXG4gKi9cbmNvbnN0IFFVRVVFX0xJTUlUID0gNTA7XG5cbmNvbnN0IFRBRyA9ICdQZXJmb3JtYW5jZSc7XG5cbi8qKlxuICogRmllbGRzOlxuICoge3tcbiAqICAgbGFiZWw6IHN0cmluZyxcbiAqICAgZGVsdGE6IChudW1iZXJ8bnVsbHx1bmRlZmluZWQpLFxuICogICB2YWx1ZTogKG51bWJlcnxudWxsfHVuZGVmaW5lZClcbiAqIH19XG4gKiBAdHlwZWRlZiB7IUpzb25PYmplY3R9XG4gKi9cbmxldCBUaWNrRXZlbnREZWY7XG5cbi8qKlxuICogUGVyZm9ybWFuY2UgaG9sZHMgdGhlIG1lY2hhbmlzbSB0byBjYWxsIGB0aWNrYCB0byBzdGFtcCBvdXQgaW1wb3J0YW50XG4gKiBldmVudHMgaW4gdGhlIGxpZmVjeWNsZSBvZiB0aGUgQU1QIHJ1bnRpbWUuIEl0IGNhbiBob2xkIGEgc21hbGwgYW1vdW50XG4gKiBvZiB0aWNrIGV2ZW50cyB0byBmb3J3YXJkIHRvIHRoZSBleHRlcm5hbCBgdGlja2AgZnVuY3Rpb24gd2hlbiBpdCBpcyBzZXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBQZXJmb3JtYW5jZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbiA9IHdpbjtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFBcnJheTxUaWNrRXZlbnREZWY+fSAqL1xuICAgIHRoaXMuZXZlbnRzXyA9IFtdO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMudGltZU9yaWdpbl8gPVxuICAgICAgd2luLnBlcmZvcm1hbmNlLnRpbWVPcmlnaW4gfHwgd2luLnBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQ7XG5cbiAgICAvKiogQHByaXZhdGUgez8uL2FtcGRvYy1pbXBsLkFtcERvY30gKi9cbiAgICB0aGlzLmFtcGRvY18gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li92aWV3ZXItaW50ZXJmYWNlLlZpZXdlckludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZXdlcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li9yZXNvdXJjZXMtaW50ZXJmYWNlLlJlc291cmNlc0ludGVyZmFjZX0gKi9cbiAgICB0aGlzLnJlc291cmNlc18gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/Li9kb2N1bWVudC1pbmZvLWltcGwuRG9jdW1lbnRJbmZvRGVmfSAqL1xuICAgIHRoaXMuZG9jdW1lbnRJbmZvXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc01lc3NhZ2luZ1JlYWR5XyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNQZXJmb3JtYW5jZVRyYWNraW5nT25fID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLGJvb2xlYW4+fSAqL1xuICAgIHRoaXMuZW5hYmxlZEV4cGVyaW1lbnRzXyA9IG1hcCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtzdHJpbmd8dW5kZWZpbmVkfSAqL1xuICAgIHRoaXMuYW1wZXhwXyA9IHVuZGVmaW5lZDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7U2lnbmFsc30gKi9cbiAgICB0aGlzLm1ldHJpY3NfID0gbmV3IFNpZ25hbHMoKTtcblxuICAgIC8qKlxuICAgICAqIEhvdyBtYW55IHRpbWVzIGEgbGF5b3V0IHNoaWZ0IG1ldHJpYyBoYXMgYmVlbiB0aWNrZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuc2hpZnRTY29yZXNUaWNrZWRfID0gMDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb2xsZWN0aW9uIG9mIGxheW91dCBzaGlmdCBldmVudHMgZnJvbSB0aGUgTGF5b3V0IEluc3RhYmlsaXR5IEFQSS5cbiAgICAgKiBAcHJpdmF0ZSB7QXJyYXk8TGF5b3V0U2hpZnQ+fVxuICAgICAqL1xuICAgIHRoaXMubGF5b3V0U2hpZnRzXyA9IFtdO1xuXG4gICAgY29uc3Qgc3VwcG9ydGVkRW50cnlUeXBlcyA9XG4gICAgICAodGhpcy53aW4uUGVyZm9ybWFuY2VPYnNlcnZlciAmJlxuICAgICAgICB0aGlzLndpbi5QZXJmb3JtYW5jZU9ic2VydmVyLnN1cHBvcnRlZEVudHJ5VHlwZXMpIHx8XG4gICAgICBbXTtcblxuICAgIC8vIElmIFBhaW50IFRpbWluZyBBUEkgaXMgbm90IHN1cHBvcnRlZCwgY2Fubm90IGRldGVybWluZSBmaXJzdCBjb250ZW50ZnVsIHBhaW50XG4gICAgaWYgKCFzdXBwb3J0ZWRFbnRyeVR5cGVzLmluY2x1ZGVzKCdwYWludCcpKSB7XG4gICAgICB0aGlzLm1ldHJpY3NfLnJlamVjdFNpZ25hbChcbiAgICAgICAgVGlja0xhYmVsLkZJUlNUX0NPTlRFTlRGVUxfUEFJTlQsXG4gICAgICAgIGRldigpLmNyZWF0ZUV4cGVjdGVkRXJyb3IoJ0ZpcnN0IENvbnRlbnRmdWwgUGFpbnQgbm90IHN1cHBvcnRlZCcpXG4gICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHVzZXIgYWdlbnQgc3VwcG9ydHMgdGhlIExheW91dCBJbnN0YWJpbGl0eSBBUEkgdGhhdCBzaGlwcGVkXG4gICAgICogd2l0aCBDaHJvbWl1bSA3Ny5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuc3VwcG9ydHNMYXlvdXRTaGlmdF8gPSBzdXBwb3J0ZWRFbnRyeVR5cGVzLmluY2x1ZGVzKCdsYXlvdXQtc2hpZnQnKTtcblxuICAgIGlmICghdGhpcy5zdXBwb3J0c0xheW91dFNoaWZ0Xykge1xuICAgICAgdGhpcy5tZXRyaWNzXy5yZWplY3RTaWduYWwoXG4gICAgICAgIFRpY2tMYWJlbC5DVU1VTEFUSVZFX0xBWU9VVF9TSElGVCxcbiAgICAgICAgZGV2KCkuY3JlYXRlRXhwZWN0ZWRFcnJvcignQ3VtdWxhdGl2ZSBMYXlvdXQgU2hpZnQgbm90IHN1cHBvcnRlZCcpXG4gICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHVzZXIgYWdlbnQgc3VwcG9ydHMgdGhlIEV2ZW50IFRpbWluZyBBUEkgdGhhdCBzaGlwcGVkXG4gICAgICogd2l0aCBDaHJvbWl1bSA3Ny5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuc3VwcG9ydHNFdmVudFRpbWluZ18gPSBzdXBwb3J0ZWRFbnRyeVR5cGVzLmluY2x1ZGVzKCdmaXJzdC1pbnB1dCcpO1xuXG4gICAgaWYgKCF0aGlzLnN1cHBvcnRzRXZlbnRUaW1pbmdfKSB7XG4gICAgICB0aGlzLm1ldHJpY3NfLnJlamVjdFNpZ25hbChcbiAgICAgICAgVGlja0xhYmVsLkZJUlNUX0lOUFVUX0RFTEFZLFxuICAgICAgICBkZXYoKS5jcmVhdGVFeHBlY3RlZEVycm9yKCdGaXJzdCBJbnB1dCBEZWxheSBub3Qgc3VwcG9ydGVkJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgdXNlciBhZ2VudCBzdXBwb3J0cyB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IG1ldHJpYy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuc3VwcG9ydHNMYXJnZXN0Q29udGVudGZ1bFBhaW50XyA9IHN1cHBvcnRlZEVudHJ5VHlwZXMuaW5jbHVkZXMoXG4gICAgICAnbGFyZ2VzdC1jb250ZW50ZnVsLXBhaW50J1xuICAgICk7XG5cbiAgICBpZiAoIXRoaXMuc3VwcG9ydHNMYXJnZXN0Q29udGVudGZ1bFBhaW50Xykge1xuICAgICAgdGhpcy5tZXRyaWNzXy5yZWplY3RTaWduYWwoXG4gICAgICAgIFRpY2tMYWJlbC5MQVJHRVNUX0NPTlRFTlRGVUxfUEFJTlQsXG4gICAgICAgIGRldigpLmNyZWF0ZUV4cGVjdGVkRXJyb3IoJ0xhcmdlc3QgQ29udGVudGZ1bCBQYWludCBub3Qgc3VwcG9ydGVkJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgdXNlciBhZ2VudCBzdXBwb3J0cyB0aGUgbmF2aWdhdGlvbiB0aW1pbmcgQVBJXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLnN1cHBvcnRzTmF2aWdhdGlvbl8gPSBzdXBwb3J0ZWRFbnRyeVR5cGVzLmluY2x1ZGVzKCduYXZpZ2F0aW9uJyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbGF0ZXN0IHJlcG9ydGVkIGxhcmdlc3QgY29udGVudGZ1bCBwYWludCB0aW1lLiBVc2VzIGVudHJ5LnN0YXJ0VGltZSxcbiAgICAgKiB3aGljaCBlcXVhdGVzIHRvOiByZW5kZXJUaW1lID8/IGxvYWRUaW1lLiBXZSBjYW4ndCBhbHdheXMgdXNlIG9uZSBvciB0aGUgb3RoZXJcbiAgICAgKiBiZWNhdXNlOlxuICAgICAqIC0gbG9hZFRpbWUgaXMgMCBmb3Igbm9uLXJlbW90ZSByZXNvdXJjZXMgKHRleHQpXG4gICAgICogLSByZW5kZXJUaW1lIGlzIHVuZGVmaW5lZCBmb3IgY3Jvc3NvcmlnaW4gcmVzb3VyY2VzXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZSB7P251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxhcmdlc3RDb250ZW50ZnVsUGFpbnRfID0gbnVsbDtcblxuICAgIHRoaXMub25BbXBEb2NWaXNpYmlsaXR5Q2hhbmdlXyA9IHRoaXMub25BbXBEb2NWaXNpYmlsaXR5Q2hhbmdlXy5iaW5kKHRoaXMpO1xuXG4gICAgLy8gQWRkIFJUViB2ZXJzaW9uIGFzIGV4cGVyaW1lbnQgSUQsIHNvIHdlIGNhbiBzbGljZSB0aGUgZGF0YSBieSB2ZXJzaW9uLlxuICAgIHRoaXMuYWRkRW5hYmxlZEV4cGVyaW1lbnQoJ3J0di0nICsgZ2V0TW9kZSh0aGlzLndpbikucnR2VmVyc2lvbik7XG5cbiAgICAvLyBUaWNrIGRvY3VtZW50IHJlYWR5IGV2ZW50LlxuICAgIHdoZW5Eb2N1bWVudFJlYWR5KHdpbi5kb2N1bWVudCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnRpY2soVGlja0xhYmVsLkRPQ1VNRU5UX1JFQURZKTtcbiAgICAgIHRoaXMuZmx1c2goKTtcbiAgICB9KTtcblxuICAgIC8vIFRpY2sgd2luZG93Lm9ubG9hZCBldmVudC5cbiAgICB3aGVuRG9jdW1lbnRDb21wbGV0ZSh3aW4uZG9jdW1lbnQpLnRoZW4oKCkgPT4gdGhpcy5vbmxvYWRfKCkpO1xuICAgIHRoaXMucmVnaXN0ZXJQZXJmb3JtYW5jZU9ic2VydmVyXygpO1xuICAgIHRoaXMucmVnaXN0ZXJGaXJzdElucHV0RGVsYXlQb2x5ZmlsbExpc3RlbmVyXygpO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5nb29nbGVGb250RXhwUmVjb3JkZWRfID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVucyB0byB2aWV3ZXIgYW5kIHJlc291cmNlIGV2ZW50cy5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBjb3JlU2VydmljZXNBdmFpbGFibGUoKSB7XG4gICAgY29uc3Qge2RvY3VtZW50RWxlbWVudH0gPSB0aGlzLndpbi5kb2N1bWVudDtcbiAgICB0aGlzLmFtcGRvY18gPSBTZXJ2aWNlcy5hbXBkb2MoZG9jdW1lbnRFbGVtZW50KTtcbiAgICB0aGlzLnZpZXdlcl8gPSBTZXJ2aWNlcy52aWV3ZXJGb3JEb2MoZG9jdW1lbnRFbGVtZW50KTtcbiAgICB0aGlzLnJlc291cmNlc18gPSBTZXJ2aWNlcy5yZXNvdXJjZXNGb3JEb2MoZG9jdW1lbnRFbGVtZW50KTtcbiAgICB0aGlzLmRvY3VtZW50SW5mb18gPSBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2ModGhpcy5hbXBkb2NfKTtcblxuICAgIHRoaXMuaXNQZXJmb3JtYW5jZVRyYWNraW5nT25fID1cbiAgICAgIHRoaXMudmlld2VyXy5pc0VtYmVkZGVkKCkgJiYgdGhpcy52aWV3ZXJfLmdldFBhcmFtKCdjc2knKSA9PT0gJzEnO1xuXG4gICAgLy8gVGhpcyBpcyBmb3IgcmVkdW5kYW5jeS4gQ2FsbCBmbHVzaCBvbiBhbnkgdmlzaWJpbGl0eSBjaGFuZ2UuXG4gICAgdGhpcy5hbXBkb2NfLm9uVmlzaWJpbGl0eUNoYW5nZWQodGhpcy5mbHVzaC5iaW5kKHRoaXMpKTtcblxuICAgIC8vIERvZXMgbm90IG5lZWQgdG8gd2FpdCBmb3IgbWVzc2FnaW5nIHJlYWR5IHNpbmNlIGl0IHdpbGwgYmUgcXVldWVkXG4gICAgLy8gaWYgaXQgaXNuJ3QgcmVhZHkuXG4gICAgdGhpcy5tZWFzdXJlVXNlclBlcmNlaXZlZFZpc3VhbENvbXBsZXRlbmVzc1RpbWVfKCk7XG5cbiAgICAvLyBDYW4gYmUgbnVsbCB3aGljaCB3b3VsZCBtZWFuIHRoaXMgQU1QIHBhZ2UgaXMgbm90IGVtYmVkZGVkXG4gICAgLy8gYW5kIGhhcyBubyBtZXNzYWdpbmcgY2hhbm5lbC5cbiAgICBjb25zdCBjaGFubmVsUHJvbWlzZSA9IHRoaXMudmlld2VyXy53aGVuTWVzc2FnaW5nUmVhZHkoKTtcblxuICAgIHRoaXMuYW1wZG9jXy53aGVuRmlyc3RWaXNpYmxlKCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnRpY2soVGlja0xhYmVsLk9OX0ZJUlNUX1ZJU0lCTEUpO1xuICAgICAgdGhpcy5mbHVzaCgpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcmVnaXN0ZXJWaXNpYmlsaXR5Q2hhbmdlTGlzdGVuZXIgPVxuICAgICAgdGhpcy5zdXBwb3J0c0xhcmdlc3RDb250ZW50ZnVsUGFpbnRfIHx8IHRoaXMuc3VwcG9ydHNMYXlvdXRTaGlmdF87XG4gICAgLy8gUmVnaXN0ZXIgYSBoYW5kbGVyIHRvIHJlY29yZCBtZXRyaWNzIHdoZW4gdGhlIHBhZ2UgZW50ZXJzIHRoZSBoaWRkZW5cbiAgICAvLyBsaWZlY3ljbGUgc3RhdGUuXG4gICAgaWYgKHJlZ2lzdGVyVmlzaWJpbGl0eUNoYW5nZUxpc3RlbmVyKSB7XG4gICAgICB0aGlzLmFtcGRvY18ub25WaXNpYmlsaXR5Q2hhbmdlZCh0aGlzLm9uQW1wRG9jVmlzaWJpbGl0eUNoYW5nZV8pO1xuICAgIH1cblxuICAgIC8vIFdlIGRvbid0IGNoZWNrIGBpc1BlcmZvcm1hbmNlVHJhY2tpbmdPbmAgaGVyZSBzaW5jZSB0aGVyZSBhcmUgc29tZVxuICAgIC8vIGV2ZW50cyB0aGF0IHdlIGNhbGwgb24gdGhlIHZpZXdlciBldmVuIHRob3VnaCBwZXJmb3JtYW5jZSB0cmFja2luZ1xuICAgIC8vIGlzIG9mZiB3ZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGUgQU1QIHBhZ2UgaGFzIGEgbWVzc2FnaW5nXG4gICAgLy8gY2hhbm5lbCBvciBub3QuXG4gICAgaWYgKCFjaGFubmVsUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGFubmVsUHJvbWlzZVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyBUaWNrIHRoZSBcIm1lc3NhZ2luZyByZWFkeVwiIHNpZ25hbC5cbiAgICAgICAgdGhpcy50aWNrRGVsdGEoVGlja0xhYmVsLk1FU1NBR0lOR19SRUFEWSwgdGhpcy53aW4ucGVyZm9ybWFuY2Uubm93KCkpO1xuXG4gICAgICAgIC8vIFRpY2sgdGltZU9yaWdpbiBzbyB0aGF0IGVwb2NoIHRpbWUgY2FuIGJlIGNhbGN1bGF0ZWQgYnkgY29uc3VtZXJzLlxuICAgICAgICB0aGlzLnRpY2soVGlja0xhYmVsLlRJTUVfT1JJR0lOLCB1bmRlZmluZWQsIHRoaXMudGltZU9yaWdpbl8pO1xuXG4gICAgICAgIGNvbnN0IHVzcXAgPSB0aGlzLmFtcGRvY18uZ2V0TWV0YUJ5TmFtZSgnYW1wLXVzcXAnKTtcbiAgICAgICAgaWYgKHVzcXApIHtcbiAgICAgICAgICB1c3FwLnNwbGl0KCcsJykuZm9yRWFjaCgoZXhwKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZEVuYWJsZWRFeHBlcmltZW50KCdzc3ItJyArIGV4cCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5tYXliZUFkZFN0b3J5RXhwZXJpbWVudElkXygpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc01lc3NhZ2luZ1JlYWR5XyA9IHRydWU7XG5cbiAgICAgICAgLy8gRm9yd2FyZCBhbGwgcXVldWVkIHRpY2tzIHRvIHRoZSB2aWV3ZXIgc2luY2UgbWVzc2FnaW5nXG4gICAgICAgIC8vIGlzIG5vdyByZWFkeS5cbiAgICAgICAgdGhpcy5mbHVzaFF1ZXVlZFRpY2tzXygpO1xuXG4gICAgICAgIC8vIFNlbmQgYWxsIGNzaSB0aWNrcyB0aHJvdWdoLlxuICAgICAgICB0aGlzLmZsdXNoKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzdG9yeSBleHBlcmltZW50IElEIGluIG9yZGVyIHRvIHNsaWNlIHRoZSBkYXRhIGZvciBhbXAtc3RvcnkuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVBZGRTdG9yeUV4cGVyaW1lbnRJZF8oKSB7XG4gICAgY29uc3QgYW1wZG9jID0gU2VydmljZXMuYW1wZG9jU2VydmljZUZvcih0aGlzLndpbikuZ2V0U2luZ2xlRG9jKCk7XG4gICAgcmV0dXJuIGlzU3RvcnlEb2N1bWVudChhbXBkb2MpLnRoZW4oKGlzU3RvcnkpID0+IHtcbiAgICAgIGlmIChpc1N0b3J5KSB7XG4gICAgICAgIHRoaXMuYWRkRW5hYmxlZEV4cGVyaW1lbnQoJ3N0b3J5Jyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIG9ubG9hZC5cbiAgICovXG4gIG9ubG9hZF8oKSB7XG4gICAgdGhpcy50aWNrKFRpY2tMYWJlbC5PTl9MT0FEKTtcbiAgICB0aGlzLnRpY2tMZWdhY3lGaXJzdFBhaW50VGltZV8oKTtcbiAgICB0aGlzLmZsdXNoKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyBwZXJmb3JtYW5jZSBtZXRyaWNzIGZpcnN0IHBhaW50LCBmaXJzdCBjb250ZW50ZnVsIHBhaW50LFxuICAgKiBhbmQgZmlyc3QgaW5wdXQgZGVsYXkuXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vV0lDRy9wYWludC10aW1pbmdcbiAgICovXG4gIHJlZ2lzdGVyUGVyZm9ybWFuY2VPYnNlcnZlcl8oKSB7XG4gICAgLy8gVHVybiBvZmYgcGVyZm9ybWFuY2VPYnNlcnZlciBkZXJpdmVkIG1ldHJpY3MgZm9yIGluYWJveCBhcyB0aGVyZVxuICAgIC8vIHdpbGwgbmV2ZXIgYmUgYSB2aWV3ZXIgdG8gcmVwb3J0IHRvLlxuICAgIC8vIFRPRE8oY2NvcmRyeSk6IHdlIGFyZSBzdGlsbCBkb2luZyBzb21lIG90aGVyIHVubmVjZXNzYXJ5IG1lYXN1cmVtZW50cyBmb3JcbiAgICAvLyB0aGUgaW5hYm94IGNhc2UsIGJ1dCB3b3VsZCBuZWVkIGEgbGFyZ2VyIHJlZmFjdG9yLlxuICAgIGlmIChnZXRNb2RlKHRoaXMud2luKS5ydW50aW1lID09PSAnaW5hYm94Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZXNlIHN0YXRlIHZhcnMgZW5zdXJlIHRoYXQgd2Ugb25seSByZXBvcnQgYSBnaXZlbiB2YWx1ZSBvbmNlLCBiZWNhdXNlXG4gICAgLy8gdGhlIGJhY2tlbmQgZG9lc24ndCBzdXBwb3J0IHVwZGF0ZXMuXG4gICAgbGV0IHJlY29yZGVkRmlyc3RQYWludCA9IGZhbHNlO1xuICAgIGxldCByZWNvcmRlZEZpcnN0Q29udGVudGZ1bFBhaW50ID0gZmFsc2U7XG4gICAgbGV0IHJlY29yZGVkRmlyc3RJbnB1dERlbGF5ID0gZmFsc2U7XG4gICAgbGV0IHJlY29yZGVkTmF2aWdhdGlvbiA9IGZhbHNlO1xuICAgIGNvbnN0IHByb2Nlc3NFbnRyeSA9IChlbnRyeSkgPT4ge1xuICAgICAgaWYgKGVudHJ5Lm5hbWUgPT0gJ2ZpcnN0LXBhaW50JyAmJiAhcmVjb3JkZWRGaXJzdFBhaW50KSB7XG4gICAgICAgIHRoaXMudGlja0RlbHRhKFRpY2tMYWJlbC5GSVJTVF9QQUlOVCwgZW50cnkuc3RhcnRUaW1lICsgZW50cnkuZHVyYXRpb24pO1xuICAgICAgICByZWNvcmRlZEZpcnN0UGFpbnQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZW50cnkubmFtZSA9PSAnZmlyc3QtY29udGVudGZ1bC1wYWludCcgJiZcbiAgICAgICAgIXJlY29yZGVkRmlyc3RDb250ZW50ZnVsUGFpbnRcbiAgICAgICkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGVudHJ5LnN0YXJ0VGltZSArIGVudHJ5LmR1cmF0aW9uO1xuICAgICAgICB0aGlzLnRpY2tEZWx0YShUaWNrTGFiZWwuRklSU1RfQ09OVEVOVEZVTF9QQUlOVCwgdmFsdWUpO1xuICAgICAgICB0aGlzLnRpY2tTaW5jZVZpc2libGUoVGlja0xhYmVsLkZJUlNUX0NPTlRFTlRGVUxfUEFJTlRfVklTSUJMRSwgdmFsdWUpO1xuICAgICAgICByZWNvcmRlZEZpcnN0Q29udGVudGZ1bFBhaW50ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGVudHJ5LmVudHJ5VHlwZSA9PT0gJ2ZpcnN0LWlucHV0JyAmJlxuICAgICAgICAhcmVjb3JkZWRGaXJzdElucHV0RGVsYXlcbiAgICAgICkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGVudHJ5LnByb2Nlc3NpbmdTdGFydCAtIGVudHJ5LnN0YXJ0VGltZTtcbiAgICAgICAgdGhpcy50aWNrRGVsdGEoVGlja0xhYmVsLkZJUlNUX0lOUFVUX0RFTEFZLCB2YWx1ZSk7XG4gICAgICAgIHJlY29yZGVkRmlyc3RJbnB1dERlbGF5ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZW50cnkuZW50cnlUeXBlID09PSAnbGF5b3V0LXNoaWZ0Jykge1xuICAgICAgICAvLyBJZ25vcmUgbGF5b3V0IHNoaWZ0IHRoYXQgb2NjdXJzIHdpdGhpbiA1MDBtcyBvZiB1c2VyIGlucHV0LCBhcyBpdCBpc1xuICAgICAgICAvLyBsaWtlbHkgaW4gcmVzcG9uc2UgdG8gdGhlIHVzZXIncyBhY3Rpb24uXG4gICAgICAgIC8vIDEwMDAgaGVyZSBpcyBhIG1hZ2ljIG51bWJlciB0byBwcmV2ZW50IHVuYm91bmRlZCBncm93dGguIFdlIGRvbid0IGV4cGVjdCBpdCB0byBiZSByZWFjaGVkLlxuICAgICAgICBpZiAoIWVudHJ5LmhhZFJlY2VudElucHV0ICYmIHRoaXMubGF5b3V0U2hpZnRzXy5sZW5ndGggPCAxMDAwKSB7XG4gICAgICAgICAgdGhpcy5sYXlvdXRTaGlmdHNfLnB1c2goZW50cnkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGVudHJ5LmVudHJ5VHlwZSA9PT0gJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCcpIHtcbiAgICAgICAgdGhpcy5sYXJnZXN0Q29udGVudGZ1bFBhaW50XyA9IGVudHJ5LnN0YXJ0VGltZTtcbiAgICAgIH0gZWxzZSBpZiAoZW50cnkuZW50cnlUeXBlID09ICduYXZpZ2F0aW9uJyAmJiAhcmVjb3JkZWROYXZpZ2F0aW9uKSB7XG4gICAgICAgIFtcbiAgICAgICAgICAnZG9tQ29tcGxldGUnLFxuICAgICAgICAgICdkb21Db250ZW50TG9hZGVkRXZlbnRFbmQnLFxuICAgICAgICAgICdkb21Db250ZW50TG9hZGVkRXZlbnRTdGFydCcsXG4gICAgICAgICAgJ2RvbUludGVyYWN0aXZlJyxcbiAgICAgICAgICAnbG9hZEV2ZW50RW5kJyxcbiAgICAgICAgICAnbG9hZEV2ZW50U3RhcnQnLFxuICAgICAgICAgICdyZXF1ZXN0U3RhcnQnLFxuICAgICAgICAgICdyZXNwb25zZVN0YXJ0JyxcbiAgICAgICAgXS5mb3JFYWNoKChsYWJlbCkgPT4gdGhpcy50aWNrKGxhYmVsLCBlbnRyeVtsYWJlbF0pKTtcbiAgICAgICAgcmVjb3JkZWROYXZpZ2F0aW9uID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgZW50cnlUeXBlc1RvT2JzZXJ2ZSA9IFtdO1xuICAgIGlmICh0aGlzLndpbi5QZXJmb3JtYW5jZVBhaW50VGltaW5nKSB7XG4gICAgICAvLyBQcm9ncmFtbWF0aWNhbGx5IHJlYWQgb25jZSBhcyBjdXJyZW50bHkgUGVyZm9ybWFuY2VPYnNlcnZlciBkb2VzIG5vdFxuICAgICAgLy8gcmVwb3J0IHBhc3QgZW50cmllcyBhcyBvZiBDaHJvbWl1bSA2MS5cbiAgICAgIC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTcyNTU2N1xuICAgICAgdGhpcy53aW4ucGVyZm9ybWFuY2UuZ2V0RW50cmllc0J5VHlwZSgncGFpbnQnKS5mb3JFYWNoKHByb2Nlc3NFbnRyeSk7XG4gICAgICBlbnRyeVR5cGVzVG9PYnNlcnZlLnB1c2goJ3BhaW50Jyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3VwcG9ydHNFdmVudFRpbWluZ18pIHtcbiAgICAgIHRoaXMuY3JlYXRlUGVyZm9ybWFuY2VPYnNlcnZlcl8ocHJvY2Vzc0VudHJ5LCB7XG4gICAgICAgIHR5cGU6ICdmaXJzdC1pbnB1dCcsXG4gICAgICAgIGJ1ZmZlcmVkOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3VwcG9ydHNMYXlvdXRTaGlmdF8pIHtcbiAgICAgIHRoaXMuY3JlYXRlUGVyZm9ybWFuY2VPYnNlcnZlcl8ocHJvY2Vzc0VudHJ5LCB7XG4gICAgICAgIHR5cGU6ICdsYXlvdXQtc2hpZnQnLFxuICAgICAgICBidWZmZXJlZDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN1cHBvcnRzTGFyZ2VzdENvbnRlbnRmdWxQYWludF8pIHtcbiAgICAgIC8vIGxjcE9ic2VydmVyXG4gICAgICB0aGlzLmNyZWF0ZVBlcmZvcm1hbmNlT2JzZXJ2ZXJfKHByb2Nlc3NFbnRyeSwge1xuICAgICAgICB0eXBlOiAnbGFyZ2VzdC1jb250ZW50ZnVsLXBhaW50JyxcbiAgICAgICAgYnVmZmVyZWQ6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdXBwb3J0c05hdmlnYXRpb25fKSB7XG4gICAgICAvLyBXcmFwIGluIGEgdHJ5IHN0YXRlbWVudCBhcyB0aGVyZSBhcmUgc29tZSBicm93c2VycyAoZXguIGNocm9tZSA3MylcbiAgICAgIC8vIHRoYXQgd2lsbCBzYXkgaXQgc3VwcG9ydHMgbmF2aWdhdGlvbiBidXQgdGhyb3dzLlxuICAgICAgdGhpcy5jcmVhdGVQZXJmb3JtYW5jZU9ic2VydmVyXyhwcm9jZXNzRW50cnksIHtcbiAgICAgICAgdHlwZTogJ25hdmlnYXRpb24nLFxuICAgICAgICBidWZmZXJlZDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChlbnRyeVR5cGVzVG9PYnNlcnZlLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuY3JlYXRlUGVyZm9ybWFuY2VPYnNlcnZlcl8ocHJvY2Vzc0VudHJ5LCB7XG4gICAgICAgIGVudHJ5VHlwZXM6IGVudHJ5VHlwZXNUb09ic2VydmUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbighUGVyZm9ybWFuY2VFbnRyeSl9IHByb2Nlc3NFbnRyeVxuICAgKiBAcGFyYW0geyFQZXJmb3JtYW5jZU9ic2VydmVySW5pdH0gaW5pdFxuICAgKiBAcmV0dXJuIHshUGVyZm9ybWFuY2VPYnNlcnZlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZVBlcmZvcm1hbmNlT2JzZXJ2ZXJfKHByb2Nlc3NFbnRyeSwgaW5pdCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBvYnMgPSBuZXcgdGhpcy53aW4uUGVyZm9ybWFuY2VPYnNlcnZlcigobGlzdCkgPT4ge1xuICAgICAgICBsaXN0LmdldEVudHJpZXMoKS5mb3JFYWNoKHByb2Nlc3NFbnRyeSk7XG4gICAgICAgIHRoaXMuZmx1c2goKTtcbiAgICAgIH0pO1xuICAgICAgb2JzLm9ic2VydmUoaW5pdCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBkZXYoKS53YXJuKFRBRywgZXJyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyB0aGUgZmlyc3QgaW5wdXQgZGVsYXkgdmFsdWUgY2FsY3VsYXRlZCBieSBhIHBvbHlmaWxsLCBpZiBwcmVzZW50LlxuICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9Hb29nbGVDaHJvbWVMYWJzL2ZpcnN0LWlucHV0LWRlbGF5XG4gICAqL1xuICByZWdpc3RlckZpcnN0SW5wdXREZWxheVBvbHlmaWxsTGlzdGVuZXJfKCkge1xuICAgIGlmICghdGhpcy53aW4ucGVyZk1ldHJpY3MgfHwgIXRoaXMud2luLnBlcmZNZXRyaWNzLm9uRmlyc3RJbnB1dERlbGF5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMud2luLnBlcmZNZXRyaWNzLm9uRmlyc3RJbnB1dERlbGF5KChkZWxheSkgPT4ge1xuICAgICAgdGhpcy50aWNrRGVsdGEoVGlja0xhYmVsLkZJUlNUX0lOUFVUX0RFTEFZX1BPTFlGSUxMLCBkZWxheSk7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgdmlld2VyIHZpc2liaWxpdHkgc3RhdGUgb2YgdGhlIGRvY3VtZW50IGNoYW5nZXMgdG8gaW5hY3RpdmUgb3IgaGlkZGVuLFxuICAgKiBzZW5kIHRoZSBsYXlvdXQgc2NvcmUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkFtcERvY1Zpc2liaWxpdHlDaGFuZ2VfKCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5hbXBkb2NfLmdldFZpc2liaWxpdHlTdGF0ZSgpO1xuICAgIGlmIChcbiAgICAgIHN0YXRlID09PSBWaXNpYmlsaXR5U3RhdGUuSU5BQ1RJVkUgfHxcbiAgICAgIHN0YXRlID09PSBWaXNpYmlsaXR5U3RhdGUuSElEREVOXG4gICAgKSB7XG4gICAgICB0aGlzLnRpY2tDdW11bGF0aXZlTWV0cmljc18oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGljayB0aGUgbWV0cmljcyB3aG9zZSB2YWx1ZXMgY2hhbmdlIG92ZXIgdGltZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRpY2tDdW11bGF0aXZlTWV0cmljc18oKSB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNMYXlvdXRTaGlmdF8pIHtcbiAgICAgIGlmICghdGhpcy5nb29nbGVGb250RXhwUmVjb3JkZWRfKSB7XG4gICAgICAgIHRoaXMuZ29vZ2xlRm9udEV4cFJlY29yZGVkXyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHt3aW59ID0gdGhpcztcbiAgICAgICAgY29uc3QgZ29vZ2xlRm9udEV4cCA9IHBhcnNlSW50KFxuICAgICAgICAgIGNvbXB1dGVkU3R5bGUod2luLCB3aW4uZG9jdW1lbnQuYm9keSkuZ2V0UHJvcGVydHlWYWx1ZShcbiAgICAgICAgICAgICctLWdvb2dsZS1mb250LWV4cCdcbiAgICAgICAgICApLFxuICAgICAgICAgIDEwXG4gICAgICAgICk7XG4gICAgICAgIGlmIChnb29nbGVGb250RXhwID49IDApIHtcbiAgICAgICAgICB0aGlzLmFkZEVuYWJsZWRFeHBlcmltZW50KGBnb29nbGUtZm9udC1leHA9JHtnb29nbGVGb250RXhwfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMudGlja0xheW91dFNoaWZ0U2NvcmVfKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnN1cHBvcnRzTGFyZ2VzdENvbnRlbnRmdWxQYWludF8pIHtcbiAgICAgIHRoaXMudGlja0xhcmdlc3RDb250ZW50ZnVsUGFpbnRfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRpY2sgdGhlIGxheW91dCBzaGlmdCBzY29yZSBtZXRyaWMuXG4gICAqXG4gICAqIEEgdmFsdWUgb2YgdGhlIG1ldHJpYyBpcyByZWNvcmRlZCBpbiB1bmRlciB0d28gbmFtZXMsIGBjbHNgIGFuZCBgY2xzLTJgLFxuICAgKiBmb3IgdGhlIGZpcnN0IHR3byB0aW1lcyB0aGUgcGFnZSB0cmFuc2l0aW9ucyBpbnRvIGEgaGlkZGVuIGxpZmVjeWNsZSBzdGF0ZVxuICAgKiAod2hlbiB0aGUgcGFnZSBpcyBuYXZpZ2F0ZWQgYSB3YXkgZnJvbSwgdGhlIHRhYiBpcyBiYWNrZ3JvdW5kZWQgZm9yXG4gICAqIGFub3RoZXIgdGFiLCBvciB0aGUgdXNlciBiYWNrZ3JvdW5kcyB0aGUgYnJvd3NlciBhcHBsaWNhdGlvbikuXG4gICAqXG4gICAqIFNpbmNlIHdlIGNhbid0IHJlbGlhYmx5IGRldGVjdCB3aGVuIGEgcGFnZSBzZXNzaW9uIGZpbmFsbHkgZW5kcyxcbiAgICogcmVjb3JkaW5nIHRoZSB2YWx1ZSBmb3IgdGhlc2UgZmlyc3QgdHdvIGV2ZW50cyBzaG91bGQgcHJvdmlkZSBhIGZhaXJcbiAgICogYW1vdW50IG9mIHZpc2liaWxpdHkgaW50byB0aGlzIG1ldHJpYy5cbiAgICovXG4gIHRpY2tMYXlvdXRTaGlmdFNjb3JlXygpIHtcbiAgICBjb25zdCBjbHMgPSB0aGlzLmxheW91dFNoaWZ0c18ucmVkdWNlKChzdW0sIGVudHJ5KSA9PiBzdW0gKyBlbnRyeS52YWx1ZSwgMCk7XG4gICAgY29uc3QgZmNwID0gdGhpcy5tZXRyaWNzXy5nZXQoVGlja0xhYmVsLkZJUlNUX0NPTlRFTlRGVUxfUEFJTlQpID8/IDA7IC8vIGZhbGxiYWNrIHRvIDAsIHNvIHRoYXQgd2UgbmV2ZXIgb3ZlcmNvdW50LlxuICAgIGNvbnN0IG9mdiA9IHRoaXMubWV0cmljc18uZ2V0KFRpY2tMYWJlbC5PTl9GSVJTVF9WSVNJQkxFKSA/PyAwO1xuXG4gICAgLy8gVE9ETygjMzMyMDcpOiBSZW1vdmUgYWZ0ZXIgZGF0YSBjb2xsZWN0aW9uXG4gICAgY29uc3QgY2xzQmVmb3JlRkNQID0gdGhpcy5sYXlvdXRTaGlmdHNfLnJlZHVjZSgoc3VtLCBlbnRyeSkgPT4ge1xuICAgICAgaWYgKGVudHJ5LnN0YXJ0VGltZSA8IGZjcCkge1xuICAgICAgICByZXR1cm4gc3VtICsgZW50cnkudmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VtO1xuICAgIH0sIDApO1xuICAgIGNvbnN0IGNsc0JlZm9yZU9GViA9IHRoaXMubGF5b3V0U2hpZnRzXy5yZWR1Y2UoKHN1bSwgZW50cnkpID0+IHtcbiAgICAgIGlmIChlbnRyeS5zdGFydFRpbWUgPCBvZnYpIHtcbiAgICAgICAgcmV0dXJuIHN1bSArIGVudHJ5LnZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN1bTtcbiAgICB9LCAwKTtcblxuICAgIGlmICh0aGlzLnNoaWZ0U2NvcmVzVGlja2VkXyA9PT0gMCkge1xuICAgICAgdGhpcy50aWNrKFRpY2tMYWJlbC5DVU1VTEFUSVZFX0xBWU9VVF9TSElGVF9CRUZPUkVfVklTSUJMRSwgY2xzQmVmb3JlT0ZWKTtcbiAgICAgIHRoaXMudGlja0RlbHRhKFxuICAgICAgICBUaWNrTGFiZWwuQ1VNVUxBVElWRV9MQVlPVVRfU0hJRlRfQkVGT1JFX0ZDUCxcbiAgICAgICAgY2xzQmVmb3JlRkNQXG4gICAgICApO1xuICAgICAgdGhpcy50aWNrRGVsdGEoVGlja0xhYmVsLkNVTVVMQVRJVkVfTEFZT1VUX1NISUZULCBjbHMpO1xuICAgICAgdGhpcy5mbHVzaCgpO1xuICAgICAgdGhpcy5zaGlmdFNjb3Jlc1RpY2tlZF8gPSAxO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaGlmdFNjb3Jlc1RpY2tlZF8gPT09IDEpIHtcbiAgICAgIHRoaXMudGlja0RlbHRhKFRpY2tMYWJlbC5DVU1VTEFUSVZFX0xBWU9VVF9TSElGVF8yLCBjbHMpO1xuICAgICAgdGhpcy5mbHVzaCgpO1xuICAgICAgdGhpcy5zaGlmdFNjb3Jlc1RpY2tlZF8gPSAyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaWNrIGZwIHRpbWUgYmFzZWQgb24gQ2hyb21pdW0ncyBsZWdhY3kgcGFpbnQgdGltaW5nIEFQSSB3aGVuXG4gICAqIGFwcHJvcHJpYXRlLlxuICAgKiBgcmVnaXN0ZXJQYWludFRpbWluZ09ic2VydmVyX2AgY2FsbHMgdGhlIHN0YW5kYXJkcyBiYXNlZCBBUEkgYW5kIHRoaXNcbiAgICogbWV0aG9kIGRvZXMgbm90aGluZyBpZiBpdCBpcyBhdmFpbGFibGUuXG4gICAqL1xuICB0aWNrTGVnYWN5Rmlyc3RQYWludFRpbWVfKCkge1xuICAgIC8vIERldGVjdCBkZXByZWNhdGVkIGZpcnN0IHBhaW50IHRpbWUgQVBJXG4gICAgLy8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NjIxNTEyXG4gICAgLy8gV2UnbGwgdXNlIHRoaXMgdW50aWwgc29tZXRoaW5nIGJldHRlciBpcyBhdmFpbGFibGUuXG4gICAgaWYgKFxuICAgICAgIXRoaXMud2luLlBlcmZvcm1hbmNlUGFpbnRUaW1pbmcgJiZcbiAgICAgIHRoaXMud2luLmNocm9tZSAmJlxuICAgICAgdHlwZW9mIHRoaXMud2luLmNocm9tZS5sb2FkVGltZXMgPT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgY29uc3QgZnBUaW1lID1cbiAgICAgICAgdGhpcy53aW4uY2hyb21lLmxvYWRUaW1lcygpWydmaXJzdFBhaW50VGltZSddICogMTAwMCAtXG4gICAgICAgIHRoaXMud2luLnBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQ7XG4gICAgICBpZiAoZnBUaW1lIDw9IDEpIHtcbiAgICAgICAgLy8gVGhyb3cgYXdheSBiYWQgZGF0YSBnZW5lcmF0ZWQgZnJvbSBhbiBhcHBhcmVudCBDaHJvbWl1bSBidWdcbiAgICAgICAgLy8gdGhhdCBpcyBmaXhlZCBpbiBsYXRlciBDaHJvbWl1bSB2ZXJzaW9ucy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy50aWNrRGVsdGEoVGlja0xhYmVsLkZJUlNUX1BBSU5ULCBmcFRpbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaWNrIHRoZSBsYXJnZXN0IGNvbnRlbnRmdWwgcGFpbnQgbWV0cmljcy5cbiAgICovXG4gIHRpY2tMYXJnZXN0Q29udGVudGZ1bFBhaW50XygpIHtcbiAgICBpZiAodGhpcy5sYXJnZXN0Q29udGVudGZ1bFBhaW50XyA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy50aWNrRGVsdGEoXG4gICAgICBUaWNrTGFiZWwuTEFSR0VTVF9DT05URU5URlVMX1BBSU5ULFxuICAgICAgdGhpcy5sYXJnZXN0Q29udGVudGZ1bFBhaW50X1xuICAgICk7XG4gICAgdGhpcy50aWNrU2luY2VWaXNpYmxlKFxuICAgICAgVGlja0xhYmVsLkxBUkdFU1RfQ09OVEVOVEZVTF9QQUlOVF9WSVNJQkxFLFxuICAgICAgdGhpcy5sYXJnZXN0Q29udGVudGZ1bFBhaW50X1xuICAgICk7XG4gICAgdGhpcy5mbHVzaCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lYXN1cmUgdGhlIGRlbGF5IHRoZSB1c2VyIHBlcmNlaXZlcyBvZiBob3cgbG9uZyBpdCB0YWtlc1xuICAgKiB0byBsb2FkIHRoZSBpbml0aWFsIHZpZXdwb3J0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWVhc3VyZVVzZXJQZXJjZWl2ZWRWaXN1YWxDb21wbGV0ZW5lc3NUaW1lXygpIHtcbiAgICBjb25zdCBkaWRTdGFydEluUHJlcmVuZGVyID0gIXRoaXMuYW1wZG9jXy5oYXNCZWVuVmlzaWJsZSgpO1xuXG4gICAgbGV0IGRvY1Zpc2libGVUaW1lID0gLTE7XG4gICAgdGhpcy5hbXBkb2NfLndoZW5GaXJzdFZpc2libGUoKS50aGVuKCgpID0+IHtcbiAgICAgIGRvY1Zpc2libGVUaW1lID0gdGhpcy53aW4ucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAvLyBNYXJrIHRoaXMgZmlyc3QgdmlzaWJsZSBpbnN0YW5jZSBpbiB0aGUgYnJvd3NlciB0aW1lbGluZS5cbiAgICAgIHRoaXMubWFyaygndmlzaWJsZScpO1xuICAgIH0pO1xuXG4gICAgdGhpcy53aGVuVmlld3BvcnRMYXlvdXRDb21wbGV0ZV8oKS50aGVuKCgpID0+IHtcbiAgICAgIGlmIChkaWRTdGFydEluUHJlcmVuZGVyKSB7XG4gICAgICAgIGNvbnN0IHVzZXJQZXJjZWl2ZWRWaXN1YWxDb21wbGV0ZW5lc3NzVGltZSA9XG4gICAgICAgICAgZG9jVmlzaWJsZVRpbWUgPiAtMVxuICAgICAgICAgICAgPyB0aGlzLndpbi5wZXJmb3JtYW5jZS5ub3coKSAtIGRvY1Zpc2libGVUaW1lXG4gICAgICAgICAgICA6IC8vICBQcmVyZW5kZXIgd2FzIGNvbXBsZXRlIGJlZm9yZSB2aXNpYmlsaXR5LlxuICAgICAgICAgICAgICAwO1xuICAgICAgICB0aGlzLmFtcGRvY18ud2hlbkZpcnN0VmlzaWJsZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIC8vIFdlIG9ubHkgdGljayB0aGlzIGlmIHRoZSBwYWdlIGV2ZW50dWFsbHkgYmVjb21lcyB2aXNpYmxlLFxuICAgICAgICAgIC8vIHNpbmNlIG90aGVyd2lzZSB3ZSBoZWF2aWx5IHNrZXcgdGhlIG1ldHJpYyB0b3dhcmRzIHRoZVxuICAgICAgICAgIC8vIDAgY2FzZSwgc2luY2UgcHJlLXJlbmRlcnMgdGhhdCBhcmUgbmV2ZXIgdXNlZCBhcmUgaGlnaGx5XG4gICAgICAgICAgLy8gbGlrZWx5IHRvIGZ1bGx5IGxvYWQgYmVmb3JlIHRoZXkgYXJlIG5ldmVyIHVzZWQgOilcbiAgICAgICAgICB0aGlzLnRpY2tEZWx0YShcbiAgICAgICAgICAgIFRpY2tMYWJlbC5GSVJTVF9WSUVXUE9SVF9SRUFEWSxcbiAgICAgICAgICAgIHVzZXJQZXJjZWl2ZWRWaXN1YWxDb21wbGV0ZW5lc3NzVGltZVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByZXJlbmRlckNvbXBsZXRlXyh1c2VyUGVyY2VpdmVkVmlzdWFsQ29tcGxldGVuZXNzc1RpbWUpO1xuICAgICAgICAvLyBNYXJrIHRoaXMgaW5zdGFuY2UgaW4gdGhlIGJyb3dzZXIgdGltZWxpbmUuXG4gICAgICAgIHRoaXMubWFyayhUaWNrTGFiZWwuRklSU1RfVklFV1BPUlRfUkVBRFkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgaXQgZGlkbnQgc3RhcnQgaW4gcHJlcmVuZGVyLCBubyBuZWVkIHRvIGNhbGN1bGF0ZSBhbnl0aGluZ1xuICAgICAgICAvLyBhbmQgd2UganVzdCBuZWVkIHRvIHRpY2sgYHBjYC4gKGl0IHdpbGwgZ2l2ZSB1cyB0aGUgcmVsYXRpdmVcbiAgICAgICAgLy8gdGltZSBzaW5jZSB0aGUgdmlld2VyIGluaXRpYWxpemVkIHRoZSB0aW1lcilcbiAgICAgICAgdGhpcy50aWNrKFRpY2tMYWJlbC5GSVJTVF9WSUVXUE9SVF9SRUFEWSk7XG4gICAgICAgIHRoaXMucHJlcmVuZGVyQ29tcGxldGVfKHRoaXMud2luLnBlcmZvcm1hbmNlLm5vdygpIC0gZG9jVmlzaWJsZVRpbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5mbHVzaCgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiByZXNvdXJjZXMgaW4gdmlld3BvcnRcbiAgICogaGF2ZSBiZWVuIGZpbmlzaGVkIGJlaW5nIGxhaWQgb3V0LlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHdoZW5WaWV3cG9ydExheW91dENvbXBsZXRlXygpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZXNfLndoZW5GaXJzdFBhc3MoKS50aGVuKCgpID0+IHtcbiAgICAgIGNvbnN0IHtkb2N1bWVudEVsZW1lbnR9ID0gdGhpcy53aW4uZG9jdW1lbnQ7XG4gICAgICBjb25zdCBzaXplID0gU2VydmljZXMudmlld3BvcnRGb3JEb2MoZG9jdW1lbnRFbGVtZW50KS5nZXRTaXplKCk7XG4gICAgICBjb25zdCByZWN0ID0gbGF5b3V0UmVjdEx0d2goMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xuICAgICAgcmV0dXJuIHdoZW5Db250ZW50SW5pTG9hZChcbiAgICAgICAgZG9jdW1lbnRFbGVtZW50LFxuICAgICAgICB0aGlzLndpbixcbiAgICAgICAgcmVjdCxcbiAgICAgICAgLyogaXNJblByZXJlbmRlciAqLyB0cnVlXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRpY2tzIGEgdGltaW5nIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1RpY2tMYWJlbH0gbGFiZWwgVGhlIHZhcmlhYmxlIG5hbWUgYXMgaXQgd2lsbCBiZSByZXBvcnRlZC5cbiAgICogICAgIFNlZSBUSUNLRVZFTlRTLm1kIGZvciBhdmFpbGFibGUgbWV0cmljcywgYW5kIGVkaXQgdGhpcyBmaWxlXG4gICAqICAgICB3aGVuIGFkZGluZyBhIG5ldyBtZXRyaWMuXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2RlbHRhIFRoZSBkZWx0YS4gQ2FsbCB0aWNrRGVsdGEgaW5zdGVhZCBvZiBzZXR0aW5nXG4gICAqICAgICB0aGlzIGRpcmVjdGx5LlxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdF92YWx1ZSBUaGUgdmFsdWUgdG8gdXNlLiBPdmVycmlkZXMgZGVmYXVsdCBjYWxjdWxhdGlvbi5cbiAgICovXG4gIHRpY2sobGFiZWwsIG9wdF9kZWx0YSwgb3B0X3ZhbHVlKSB7XG4gICAgZGV2QXNzZXJ0KFxuICAgICAgb3B0X2RlbHRhID09IHVuZGVmaW5lZCB8fCBvcHRfdmFsdWUgPT0gdW5kZWZpbmVkLFxuICAgICAgJ1lvdSBtYXkgbm90IHNldCBib3RoIG9wdF9kZWx0YSBhbmQgb3B0X3ZhbHVlLidcbiAgICApO1xuXG4gICAgY29uc3QgZGF0YSA9IGRpY3QoeydsYWJlbCc6IGxhYmVsfSk7XG4gICAgbGV0IGRlbHRhO1xuXG4gICAgaWYgKG9wdF9kZWx0YSAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGRhdGFbJ2RlbHRhJ10gPSBkZWx0YSA9IE1hdGgubWF4KG9wdF9kZWx0YSwgMCk7XG4gICAgfSBlbHNlIGlmIChvcHRfdmFsdWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICBkYXRhWyd2YWx1ZSddID0gb3B0X3ZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBNYXJraW5nIG9ubHkgbWFrZXMgc2Vuc2UgZm9yIG5vbi1vdmVycmlkZGVuIHZhbHVlcyAoYW5kIG5vIGRlbHRhcykuXG4gICAgICB0aGlzLm1hcmsobGFiZWwpO1xuICAgICAgZGVsdGEgPSB0aGlzLndpbi5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGRhdGFbJ3ZhbHVlJ10gPSB0aGlzLnRpbWVPcmlnaW5fICsgZGVsdGE7XG4gICAgfVxuXG4gICAgLy8gRW1pdCBldmVudHMuIFVzZWQgYnkgYGFtcCBwZXJmb3JtYW5jZWAuXG4gICAgdGhpcy53aW4uZGlzcGF0Y2hFdmVudChcbiAgICAgIGNyZWF0ZUN1c3RvbUV2ZW50KFxuICAgICAgICB0aGlzLndpbixcbiAgICAgICAgJ3BlcmYnLFxuICAgICAgICAvKiogQHR5cGUge0pzb25PYmplY3R9ICovICh7bGFiZWwsIGRlbHRhfSlcbiAgICAgIClcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuaXNNZXNzYWdpbmdSZWFkeV8gJiYgdGhpcy5pc1BlcmZvcm1hbmNlVHJhY2tpbmdPbl8pIHtcbiAgICAgIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZSgndGljaycsIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnF1ZXVlVGlja18oZGF0YSk7XG4gICAgfVxuXG4gICAgdGhpcy5tZXRyaWNzXy5zaWduYWwobGFiZWwsIGRlbHRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYnJvd3NlciBwZXJmb3JtYW5jZSB0aW1lbGluZSBlbnRyaWVzIGZvciBzaW1wbGUgdGlja3MuXG4gICAqIFRoZXNlIGFyZSBmb3IgZXhhbXBsZSBleHBvc2VkIGluIFdQVC5cbiAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9QZXJmb3JtYW5jZS9tYXJrXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbFxuICAgKi9cbiAgbWFyayhsYWJlbCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMud2luLnBlcmZvcm1hbmNlICYmXG4gICAgICB0aGlzLndpbi5wZXJmb3JtYW5jZS5tYXJrICYmXG4gICAgICBhcmd1bWVudHMubGVuZ3RoID09IDFcbiAgICApIHtcbiAgICAgIHRoaXMud2luLnBlcmZvcm1hbmNlLm1hcmsobGFiZWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaWNrIGEgdmVyeSBzcGVjaWZpYyB2YWx1ZSBmb3IgdGhlIGxhYmVsLiBVc2UgdGhpcyBtZXRob2QgaWYgeW91XG4gICAqIG1lYXN1cmUgdGhlIHRpbWUgaXQgdG9vayB0byBkbyBzb21ldGhpbmcgeW91cnNlbGYuXG4gICAqIEBwYXJhbSB7VGlja0xhYmVsfSBsYWJlbCBUaGUgdmFyaWFibGUgbmFtZSBhcyBpdCB3aWxsIGJlIHJlcG9ydGVkLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIHZhbHVlIGluIG1pbGxpc2Vjb25kcyB0aGF0IHNob3VsZCBiZSB0aWNrZWQuXG4gICAqL1xuICB0aWNrRGVsdGEobGFiZWwsIHZhbHVlKSB7XG4gICAgdGhpcy50aWNrKGxhYmVsLCB2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogVGljayB0aW1lIGRlbHRhIHNpbmNlIHRoZSBkb2N1bWVudCBoYXMgYmVjb21lIHZpc2libGUuXG4gICAqIEBwYXJhbSB7VGlja0xhYmVsfSBsYWJlbCBUaGUgdmFyaWFibGUgbmFtZSBhcyBpdCB3aWxsIGJlIHJlcG9ydGVkLlxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdF9kZWx0YSBUaGUgb3B0aW9uYWwgZGVsdGEgdmFsdWUgaW4gbWlsbGlzZWNvbmRzLlxuICAgKi9cbiAgdGlja1NpbmNlVmlzaWJsZShsYWJlbCwgb3B0X2RlbHRhKSB7XG4gICAgY29uc3QgZGVsdGEgPVxuICAgICAgb3B0X2RlbHRhID09IHVuZGVmaW5lZCA/IHRoaXMud2luLnBlcmZvcm1hbmNlLm5vdygpIDogb3B0X2RlbHRhO1xuICAgIGNvbnN0IGVuZCA9IHRoaXMudGltZU9yaWdpbl8gKyBkZWx0YTtcblxuICAgIC8vIE9yZGVyIGlzIHRpbWVPcmlnaW4gLT4gZmlyc3RWaXNpYmxlVGltZSAtPiBlbmQuXG4gICAgY29uc3QgdmlzaWJsZVRpbWUgPSB0aGlzLmFtcGRvY18gJiYgdGhpcy5hbXBkb2NfLmdldEZpcnN0VmlzaWJsZVRpbWUoKTtcbiAgICBjb25zdCB2ID0gdmlzaWJsZVRpbWUgPyBNYXRoLm1heChlbmQgLSB2aXNpYmxlVGltZSwgMCkgOiAwO1xuICAgIHRoaXMudGlja0RlbHRhKGxhYmVsLCB2KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc2sgdGhlIHZpZXdlciB0byBmbHVzaCB0aGUgdGlja3NcbiAgICovXG4gIGZsdXNoKCkge1xuICAgIGlmICh0aGlzLmlzTWVzc2FnaW5nUmVhZHlfICYmIHRoaXMuaXNQZXJmb3JtYW5jZVRyYWNraW5nT25fKSB7XG4gICAgICBpZiAodGhpcy5hbXBleHBfID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5hbXBleHBfID0gT2JqZWN0LmtleXModGhpcy5lbmFibGVkRXhwZXJpbWVudHNfKS5qb2luKCcsJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnZpZXdlcl8uc2VuZE1lc3NhZ2UoXG4gICAgICAgICdzZW5kQ3NpJyxcbiAgICAgICAgZGljdCh7XG4gICAgICAgICAgJ2FtcGV4cCc6IHRoaXMuYW1wZXhwXyxcbiAgICAgICAgICAnY2Fub25pY2FsVXJsJzogdGhpcy5kb2N1bWVudEluZm9fLmNhbm9uaWNhbFVybCxcbiAgICAgICAgfSksXG4gICAgICAgIC8qIGNhbmNlbFVuc2VudCAqLyB0cnVlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGbHVzaCB3aXRoIGEgcmF0ZSBsaW1pdCBvZiAxMCBwZXIgc2Vjb25kLlxuICAgKi9cbiAgdGhyb3R0bGVkRmx1c2goKSB7XG4gICAgaWYgKCF0aGlzLnRocm90dGxlZEZsdXNoXykge1xuICAgICAgLyoqIEBwcml2YXRlIHtmdW5jdGlvbigpfSAqL1xuICAgICAgdGhpcy50aHJvdHRsZWRGbHVzaF8gPSB0aHJvdHRsZSh0aGlzLndpbiwgdGhpcy5mbHVzaC5iaW5kKHRoaXMpLCAxMDApO1xuICAgIH1cbiAgICB0aGlzLnRocm90dGxlZEZsdXNoXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHBlcmltZW50SWRcbiAgICovXG4gIGFkZEVuYWJsZWRFeHBlcmltZW50KGV4cGVyaW1lbnRJZCkge1xuICAgIHRoaXMuZW5hYmxlZEV4cGVyaW1lbnRzX1tleHBlcmltZW50SWRdID0gdHJ1ZTtcbiAgICB0aGlzLmFtcGV4cF8gPSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogUXVldWVzIHRoZSBldmVudHMgdG8gYmUgZmx1c2hlZCB3aGVuIHRpY2sgZnVuY3Rpb24gaXMgc2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge1RpY2tFdmVudERlZn0gZGF0YSBUaWNrIGRhdGEgdG8gYmUgcXVldWVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcXVldWVUaWNrXyhkYXRhKSB7XG4gICAgLy8gU3RhcnQgZHJvcHBpbmcgdGhlIGhlYWQgb2YgdGhlIHF1ZXVlIGlmIHdlJ3ZlIHJlYWNoZWQgdGhlIGxpbWl0XG4gICAgLy8gc28gdGhhdCB3ZSBkb24ndCB0YWtlIHVwIHRvbyBtdWNoIG1lbW9yeSBpbiB0aGUgcnVudGltZS5cbiAgICBpZiAodGhpcy5ldmVudHNfLmxlbmd0aCA+PSBRVUVVRV9MSU1JVCkge1xuICAgICAgdGhpcy5ldmVudHNfLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudHNfLnB1c2goZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogRm9yd2FyZHMgYWxsIHF1ZXVlZCB0aWNrcyB0byB0aGUgdmlld2VyIHRpY2sgbWV0aG9kLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZmx1c2hRdWV1ZWRUaWNrc18oKSB7XG4gICAgaWYgKCF0aGlzLnZpZXdlcl8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNQZXJmb3JtYW5jZVRyYWNraW5nT25fKSB7XG4gICAgICAvLyBkcm9wIGFsbCBxdWV1ZWQgdGlja3MgdG8gbm90IGxlYWtcbiAgICAgIHRoaXMuZXZlbnRzXy5sZW5ndGggPSAwO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzXy5mb3JFYWNoKCh0aWNrRXZlbnQpID0+IHtcbiAgICAgIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZSgndGljaycsIHRpY2tFdmVudCk7XG4gICAgfSk7XG4gICAgdGhpcy5ldmVudHNfLmxlbmd0aCA9IDA7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqL1xuICBwcmVyZW5kZXJDb21wbGV0ZV8odmFsdWUpIHtcbiAgICBpZiAodGhpcy52aWV3ZXJfKSB7XG4gICAgICB0aGlzLnZpZXdlcl8uc2VuZE1lc3NhZ2UoXG4gICAgICAgICdwcmVyZW5kZXJDb21wbGV0ZScsXG4gICAgICAgIGRpY3Qoeyd2YWx1ZSc6IHZhbHVlfSksXG4gICAgICAgIC8qIGNhbmNlbFVuc2VudCAqLyB0cnVlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZGVudGlmaWVzIGlmIHRoZSB2aWV3ZXIgaXMgYWJsZSB0byB0cmFjayBwZXJmb3JtYW5jZS4gSWYgdGhlIGRvY3VtZW50IGlzXG4gICAqIG5vdCBlbWJlZGRlZCwgdGhlcmUgaXMgbm8gbWVzc2FnaW5nIGNoYW5uZWwsIHNvIG5vIHBlcmZvcm1hbmNlIHRyYWNraW5nIGlzXG4gICAqIG5lZWRlZCBzaW5jZSB0aGVyZSBpcyBub2JvZHkgdG8gZm9yd2FyZCB0aGUgZXZlbnRzLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNQZXJmb3JtYW5jZVRyYWNraW5nT24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNQZXJmb3JtYW5jZVRyYWNraW5nT25fO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGEgcHJvbWlzZSBmb3IgdGljayBsYWJlbCwgcmVzb2x2ZWQgd2l0aCBtZXRyaWMuIFVzZWQgYnkgYW1wLWFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0ge1RpY2tMYWJlbH0gbGFiZWxcbiAgICogQHJldHVybiB7IVByb21pc2U8dGltZT59XG4gICAqL1xuICBnZXRNZXRyaWMobGFiZWwpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzXy53aGVuU2lnbmFsKGxhYmVsKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsUGVyZm9ybWFuY2VTZXJ2aWNlKHdpbmRvdykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyKHdpbmRvdywgJ3BlcmZvcm1hbmNlJywgUGVyZm9ybWFuY2UpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gKiBAcmV0dXJuIHshUGVyZm9ybWFuY2V9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJmb3JtYW5jZUZvcih3aW5kb3cpIHtcbiAgcmV0dXJuIGdldFNlcnZpY2Uod2luZG93LCAncGVyZm9ybWFuY2UnKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/performance-impl.js