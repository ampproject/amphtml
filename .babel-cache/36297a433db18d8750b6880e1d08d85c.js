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
      var _this$viewer_, _this$ampdoc_;

      var delta = opt_delta == undefined ? this.win.performance.now() : opt_delta;
      var end = this.timeOrigin_ + delta;
      // If on Origin, use timeOrigin
      // If in a viewer, use firstVisibleTime
      var visibleTime = (_this$viewer_ = this.viewer_) != null && _this$viewer_.isEmbedded() ? (_this$ampdoc_ = this.ampdoc_) == null ? void 0 : _this$ampdoc_.getFirstVisibleTime() : this.timeOrigin_;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBlcmZvcm1hbmNlLWltcGwuanMiXSwibmFtZXMiOlsiVGlja0xhYmVsIiwiVmlzaWJpbGl0eVN0YXRlIiwiU2lnbmFscyIsIndoZW5Eb2N1bWVudENvbXBsZXRlIiwid2hlbkRvY3VtZW50UmVhZHkiLCJsYXlvdXRSZWN0THR3aCIsImNvbXB1dGVkU3R5bGUiLCJ0aHJvdHRsZSIsImRpY3QiLCJtYXAiLCJTZXJ2aWNlcyIsImNyZWF0ZUN1c3RvbUV2ZW50Iiwid2hlbkNvbnRlbnRJbmlMb2FkIiwiZGV2IiwiZGV2QXNzZXJ0IiwiZ2V0TW9kZSIsImdldFNlcnZpY2UiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyIiwiaXNTdG9yeURvY3VtZW50IiwiUVVFVUVfTElNSVQiLCJUQUciLCJUaWNrRXZlbnREZWYiLCJQZXJmb3JtYW5jZSIsIndpbiIsImV2ZW50c18iLCJ0aW1lT3JpZ2luXyIsInBlcmZvcm1hbmNlIiwidGltZU9yaWdpbiIsInRpbWluZyIsIm5hdmlnYXRpb25TdGFydCIsImFtcGRvY18iLCJ2aWV3ZXJfIiwicmVzb3VyY2VzXyIsImRvY3VtZW50SW5mb18iLCJpc01lc3NhZ2luZ1JlYWR5XyIsImlzUGVyZm9ybWFuY2VUcmFja2luZ09uXyIsImVuYWJsZWRFeHBlcmltZW50c18iLCJhbXBleHBfIiwidW5kZWZpbmVkIiwibWV0cmljc18iLCJzaGlmdFNjb3Jlc1RpY2tlZF8iLCJsYXlvdXRTaGlmdHNfIiwic3VwcG9ydGVkRW50cnlUeXBlcyIsIlBlcmZvcm1hbmNlT2JzZXJ2ZXIiLCJpbmNsdWRlcyIsInJlamVjdFNpZ25hbCIsIkZJUlNUX0NPTlRFTlRGVUxfUEFJTlQiLCJjcmVhdGVFeHBlY3RlZEVycm9yIiwic3VwcG9ydHNMYXlvdXRTaGlmdF8iLCJDVU1VTEFUSVZFX0xBWU9VVF9TSElGVCIsInN1cHBvcnRzRXZlbnRUaW1pbmdfIiwiRklSU1RfSU5QVVRfREVMQVkiLCJzdXBwb3J0c0xhcmdlc3RDb250ZW50ZnVsUGFpbnRfIiwiTEFSR0VTVF9DT05URU5URlVMX1BBSU5UIiwic3VwcG9ydHNOYXZpZ2F0aW9uXyIsImxhcmdlc3RDb250ZW50ZnVsUGFpbnRfIiwib25BbXBEb2NWaXNpYmlsaXR5Q2hhbmdlXyIsImJpbmQiLCJhZGRFbmFibGVkRXhwZXJpbWVudCIsInJ0dlZlcnNpb24iLCJkb2N1bWVudCIsInRoZW4iLCJ0aWNrIiwiRE9DVU1FTlRfUkVBRFkiLCJmbHVzaCIsIm9ubG9hZF8iLCJyZWdpc3RlclBlcmZvcm1hbmNlT2JzZXJ2ZXJfIiwicmVnaXN0ZXJGaXJzdElucHV0RGVsYXlQb2x5ZmlsbExpc3RlbmVyXyIsImdvb2dsZUZvbnRFeHBSZWNvcmRlZF8iLCJkb2N1bWVudEVsZW1lbnQiLCJhbXBkb2MiLCJ2aWV3ZXJGb3JEb2MiLCJyZXNvdXJjZXNGb3JEb2MiLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJpc0VtYmVkZGVkIiwiZ2V0UGFyYW0iLCJvblZpc2liaWxpdHlDaGFuZ2VkIiwibWVhc3VyZVVzZXJQZXJjZWl2ZWRWaXN1YWxDb21wbGV0ZW5lc3NUaW1lXyIsImNoYW5uZWxQcm9taXNlIiwid2hlbk1lc3NhZ2luZ1JlYWR5Iiwid2hlbkZpcnN0VmlzaWJsZSIsIk9OX0ZJUlNUX1ZJU0lCTEUiLCJyZWdpc3RlclZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lciIsInRpY2tEZWx0YSIsIk1FU1NBR0lOR19SRUFEWSIsIm5vdyIsIlRJTUVfT1JJR0lOIiwidXNxcCIsImdldE1ldGFCeU5hbWUiLCJzcGxpdCIsImZvckVhY2giLCJleHAiLCJtYXliZUFkZFN0b3J5RXhwZXJpbWVudElkXyIsImZsdXNoUXVldWVkVGlja3NfIiwiYW1wZG9jU2VydmljZUZvciIsImdldFNpbmdsZURvYyIsImlzU3RvcnkiLCJPTl9MT0FEIiwidGlja0xlZ2FjeUZpcnN0UGFpbnRUaW1lXyIsInJ1bnRpbWUiLCJyZWNvcmRlZEZpcnN0UGFpbnQiLCJyZWNvcmRlZEZpcnN0Q29udGVudGZ1bFBhaW50IiwicmVjb3JkZWRGaXJzdElucHV0RGVsYXkiLCJyZWNvcmRlZE5hdmlnYXRpb24iLCJwcm9jZXNzRW50cnkiLCJlbnRyeSIsIm5hbWUiLCJGSVJTVF9QQUlOVCIsInN0YXJ0VGltZSIsImR1cmF0aW9uIiwidmFsdWUiLCJ0aWNrU2luY2VWaXNpYmxlIiwiRklSU1RfQ09OVEVOVEZVTF9QQUlOVF9WSVNJQkxFIiwiZW50cnlUeXBlIiwicHJvY2Vzc2luZ1N0YXJ0IiwiaGFkUmVjZW50SW5wdXQiLCJsZW5ndGgiLCJwdXNoIiwibGFiZWwiLCJlbnRyeVR5cGVzVG9PYnNlcnZlIiwiUGVyZm9ybWFuY2VQYWludFRpbWluZyIsImdldEVudHJpZXNCeVR5cGUiLCJjcmVhdGVQZXJmb3JtYW5jZU9ic2VydmVyXyIsInR5cGUiLCJidWZmZXJlZCIsImVudHJ5VHlwZXMiLCJpbml0Iiwib2JzIiwibGlzdCIsImdldEVudHJpZXMiLCJvYnNlcnZlIiwiZXJyIiwid2FybiIsInBlcmZNZXRyaWNzIiwib25GaXJzdElucHV0RGVsYXkiLCJkZWxheSIsIkZJUlNUX0lOUFVUX0RFTEFZX1BPTFlGSUxMIiwic3RhdGUiLCJnZXRWaXNpYmlsaXR5U3RhdGUiLCJJTkFDVElWRSIsIkhJRERFTiIsInRpY2tDdW11bGF0aXZlTWV0cmljc18iLCJnb29nbGVGb250RXhwIiwicGFyc2VJbnQiLCJib2R5IiwiZ2V0UHJvcGVydHlWYWx1ZSIsInRpY2tMYXlvdXRTaGlmdFNjb3JlXyIsInRpY2tMYXJnZXN0Q29udGVudGZ1bFBhaW50XyIsImNscyIsInJlZHVjZSIsInN1bSIsImZjcCIsImdldCIsIm9mdiIsImNsc0JlZm9yZUZDUCIsImNsc0JlZm9yZU9GViIsIkNVTVVMQVRJVkVfTEFZT1VUX1NISUZUX0JFRk9SRV9WSVNJQkxFIiwiQ1VNVUxBVElWRV9MQVlPVVRfU0hJRlRfQkVGT1JFX0ZDUCIsIkNVTVVMQVRJVkVfTEFZT1VUX1NISUZUXzIiLCJjaHJvbWUiLCJsb2FkVGltZXMiLCJmcFRpbWUiLCJMQVJHRVNUX0NPTlRFTlRGVUxfUEFJTlRfVklTSUJMRSIsImRpZFN0YXJ0SW5QcmVyZW5kZXIiLCJoYXNCZWVuVmlzaWJsZSIsImRvY1Zpc2libGVUaW1lIiwibWFyayIsIndoZW5WaWV3cG9ydExheW91dENvbXBsZXRlXyIsInVzZXJQZXJjZWl2ZWRWaXN1YWxDb21wbGV0ZW5lc3NzVGltZSIsIkZJUlNUX1ZJRVdQT1JUX1JFQURZIiwicHJlcmVuZGVyQ29tcGxldGVfIiwid2hlbkZpcnN0UGFzcyIsInNpemUiLCJ2aWV3cG9ydEZvckRvYyIsImdldFNpemUiLCJyZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJvcHRfZGVsdGEiLCJvcHRfdmFsdWUiLCJkYXRhIiwiZGVsdGEiLCJNYXRoIiwibWF4IiwiZGlzcGF0Y2hFdmVudCIsInNlbmRNZXNzYWdlIiwicXVldWVUaWNrXyIsInNpZ25hbCIsImFyZ3VtZW50cyIsImVuZCIsInZpc2libGVUaW1lIiwiZ2V0Rmlyc3RWaXNpYmxlVGltZSIsInYiLCJPYmplY3QiLCJrZXlzIiwiam9pbiIsImNhbm9uaWNhbFVybCIsInRocm90dGxlZEZsdXNoXyIsImV4cGVyaW1lbnRJZCIsInNoaWZ0IiwidGlja0V2ZW50Iiwid2hlblNpZ25hbCIsImluc3RhbGxQZXJmb3JtYW5jZVNlcnZpY2UiLCJ3aW5kb3ciLCJwZXJmb3JtYW5jZUZvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxTQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxvQkFBUixFQUE4QkMsaUJBQTlCO0FBQ0EsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLGFBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsSUFBUixFQUFjQyxHQUFkO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQVFDLGlCQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUFR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KipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtUaWNrTGFiZWx9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9lbnVtcyc7XG5pbXBvcnQge1Zpc2liaWxpdHlTdGF0ZX0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL3Zpc2liaWxpdHktc3RhdGUnO1xuaW1wb3J0IHtTaWduYWxzfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvc2lnbmFscyc7XG5pbXBvcnQge3doZW5Eb2N1bWVudENvbXBsZXRlLCB3aGVuRG9jdW1lbnRSZWFkeX0gZnJvbSAnI2NvcmUvZG9jdW1lbnQtcmVhZHknO1xuaW1wb3J0IHtsYXlvdXRSZWN0THR3aH0gZnJvbSAnI2NvcmUvZG9tL2xheW91dC9yZWN0JztcbmltcG9ydCB7Y29tcHV0ZWRTdHlsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7dGhyb3R0bGV9IGZyb20gJyNjb3JlL3R5cGVzL2Z1bmN0aW9uJztcbmltcG9ydCB7ZGljdCwgbWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7Y3JlYXRlQ3VzdG9tRXZlbnR9IGZyb20gJy4uL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge3doZW5Db250ZW50SW5pTG9hZH0gZnJvbSAnLi4vaW5pLWxvYWQnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydH0gZnJvbSAnLi4vbG9nJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vbW9kZSc7XG5pbXBvcnQge2dldFNlcnZpY2UsIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2lzU3RvcnlEb2N1bWVudH0gZnJvbSAnLi4vdXRpbHMvc3RvcnknO1xuXG4vKipcbiAqIE1heGltdW0gbnVtYmVyIG9mIHRpY2sgZXZlbnRzIHdlIGFsbG93IHRvIGFjY3VtdWxhdGUgaW4gdGhlIHBlcmZvcm1hbmNlXG4gKiBpbnN0YW5jZSdzIHF1ZXVlIGJlZm9yZSB3ZSBzdGFydCBkcm9wcGluZyB0aG9zZSBldmVudHMgYW5kIGNhbiBubyBsb25nZXJcbiAqIGJlIGZvcndhcmRlZCB0byB0aGUgYWN0dWFsIGB0aWNrYCBmdW5jdGlvbiB3aGVuIGl0IGlzIHNldC5cbiAqL1xuY29uc3QgUVVFVUVfTElNSVQgPSA1MDtcblxuY29uc3QgVEFHID0gJ1BlcmZvcm1hbmNlJztcblxuLyoqXG4gKiBGaWVsZHM6XG4gKiB7e1xuICogICBsYWJlbDogc3RyaW5nLFxuICogICBkZWx0YTogKG51bWJlcnxudWxsfHVuZGVmaW5lZCksXG4gKiAgIHZhbHVlOiAobnVtYmVyfG51bGx8dW5kZWZpbmVkKVxuICogfX1cbiAqIEB0eXBlZGVmIHshSnNvbk9iamVjdH1cbiAqL1xubGV0IFRpY2tFdmVudERlZjtcblxuLyoqXG4gKiBQZXJmb3JtYW5jZSBob2xkcyB0aGUgbWVjaGFuaXNtIHRvIGNhbGwgYHRpY2tgIHRvIHN0YW1wIG91dCBpbXBvcnRhbnRcbiAqIGV2ZW50cyBpbiB0aGUgbGlmZWN5Y2xlIG9mIHRoZSBBTVAgcnVudGltZS4gSXQgY2FuIGhvbGQgYSBzbWFsbCBhbW91bnRcbiAqIG9mIHRpY2sgZXZlbnRzIHRvIGZvcndhcmQgdG8gdGhlIGV4dGVybmFsIGB0aWNrYCBmdW5jdGlvbiB3aGVuIGl0IGlzIHNldC5cbiAqL1xuZXhwb3J0IGNsYXNzIFBlcmZvcm1hbmNlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gd2luO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IUFycmF5PFRpY2tFdmVudERlZj59ICovXG4gICAgdGhpcy5ldmVudHNfID0gW107XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHtudW1iZXJ9ICovXG4gICAgdGhpcy50aW1lT3JpZ2luXyA9XG4gICAgICB3aW4ucGVyZm9ybWFuY2UudGltZU9yaWdpbiB8fCB3aW4ucGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez8uL3ZpZXdlci1pbnRlcmZhY2UuVmlld2VySW50ZXJmYWNlfSAqL1xuICAgIHRoaXMudmlld2VyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez8uL3Jlc291cmNlcy1pbnRlcmZhY2UuUmVzb3VyY2VzSW50ZXJmYWNlfSAqL1xuICAgIHRoaXMucmVzb3VyY2VzXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez8uL2RvY3VtZW50LWluZm8taW1wbC5Eb2N1bWVudEluZm9EZWZ9ICovXG4gICAgdGhpcy5kb2N1bWVudEluZm9fID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmlzTWVzc2FnaW5nUmVhZHlfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc1BlcmZvcm1hbmNlVHJhY2tpbmdPbl8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9iamVjdDxzdHJpbmcsYm9vbGVhbj59ICovXG4gICAgdGhpcy5lbmFibGVkRXhwZXJpbWVudHNfID0gbWFwKCk7XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ3x1bmRlZmluZWR9ICovXG4gICAgdGhpcy5hbXBleHBfID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqIEBwcml2YXRlIHtTaWduYWxzfSAqL1xuICAgIHRoaXMubWV0cmljc18gPSBuZXcgU2lnbmFscygpO1xuXG4gICAgLyoqXG4gICAgICogSG93IG1hbnkgdGltZXMgYSBsYXlvdXQgc2hpZnQgbWV0cmljIGhhcyBiZWVuIHRpY2tlZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5zaGlmdFNjb3Jlc1RpY2tlZF8gPSAwO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbGxlY3Rpb24gb2YgbGF5b3V0IHNoaWZ0IGV2ZW50cyBmcm9tIHRoZSBMYXlvdXQgSW5zdGFiaWxpdHkgQVBJLlxuICAgICAqIEBwcml2YXRlIHtBcnJheTxMYXlvdXRTaGlmdD59XG4gICAgICovXG4gICAgdGhpcy5sYXlvdXRTaGlmdHNfID0gW107XG5cbiAgICBjb25zdCBzdXBwb3J0ZWRFbnRyeVR5cGVzID1cbiAgICAgICh0aGlzLndpbi5QZXJmb3JtYW5jZU9ic2VydmVyICYmXG4gICAgICAgIHRoaXMud2luLlBlcmZvcm1hbmNlT2JzZXJ2ZXIuc3VwcG9ydGVkRW50cnlUeXBlcykgfHxcbiAgICAgIFtdO1xuXG4gICAgLy8gSWYgUGFpbnQgVGltaW5nIEFQSSBpcyBub3Qgc3VwcG9ydGVkLCBjYW5ub3QgZGV0ZXJtaW5lIGZpcnN0IGNvbnRlbnRmdWwgcGFpbnRcbiAgICBpZiAoIXN1cHBvcnRlZEVudHJ5VHlwZXMuaW5jbHVkZXMoJ3BhaW50JykpIHtcbiAgICAgIHRoaXMubWV0cmljc18ucmVqZWN0U2lnbmFsKFxuICAgICAgICBUaWNrTGFiZWwuRklSU1RfQ09OVEVOVEZVTF9QQUlOVCxcbiAgICAgICAgZGV2KCkuY3JlYXRlRXhwZWN0ZWRFcnJvcignRmlyc3QgQ29udGVudGZ1bCBQYWludCBub3Qgc3VwcG9ydGVkJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgdXNlciBhZ2VudCBzdXBwb3J0cyB0aGUgTGF5b3V0IEluc3RhYmlsaXR5IEFQSSB0aGF0IHNoaXBwZWRcbiAgICAgKiB3aXRoIENocm9taXVtIDc3LlxuICAgICAqXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5zdXBwb3J0c0xheW91dFNoaWZ0XyA9IHN1cHBvcnRlZEVudHJ5VHlwZXMuaW5jbHVkZXMoJ2xheW91dC1zaGlmdCcpO1xuXG4gICAgaWYgKCF0aGlzLnN1cHBvcnRzTGF5b3V0U2hpZnRfKSB7XG4gICAgICB0aGlzLm1ldHJpY3NfLnJlamVjdFNpZ25hbChcbiAgICAgICAgVGlja0xhYmVsLkNVTVVMQVRJVkVfTEFZT1VUX1NISUZULFxuICAgICAgICBkZXYoKS5jcmVhdGVFeHBlY3RlZEVycm9yKCdDdW11bGF0aXZlIExheW91dCBTaGlmdCBub3Qgc3VwcG9ydGVkJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgdXNlciBhZ2VudCBzdXBwb3J0cyB0aGUgRXZlbnQgVGltaW5nIEFQSSB0aGF0IHNoaXBwZWRcbiAgICAgKiB3aXRoIENocm9taXVtIDc3LlxuICAgICAqXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5zdXBwb3J0c0V2ZW50VGltaW5nXyA9IHN1cHBvcnRlZEVudHJ5VHlwZXMuaW5jbHVkZXMoJ2ZpcnN0LWlucHV0Jyk7XG5cbiAgICBpZiAoIXRoaXMuc3VwcG9ydHNFdmVudFRpbWluZ18pIHtcbiAgICAgIHRoaXMubWV0cmljc18ucmVqZWN0U2lnbmFsKFxuICAgICAgICBUaWNrTGFiZWwuRklSU1RfSU5QVVRfREVMQVksXG4gICAgICAgIGRldigpLmNyZWF0ZUV4cGVjdGVkRXJyb3IoJ0ZpcnN0IElucHV0IERlbGF5IG5vdCBzdXBwb3J0ZWQnKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSB1c2VyIGFnZW50IHN1cHBvcnRzIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgbWV0cmljLlxuICAgICAqXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5zdXBwb3J0c0xhcmdlc3RDb250ZW50ZnVsUGFpbnRfID0gc3VwcG9ydGVkRW50cnlUeXBlcy5pbmNsdWRlcyhcbiAgICAgICdsYXJnZXN0LWNvbnRlbnRmdWwtcGFpbnQnXG4gICAgKTtcblxuICAgIGlmICghdGhpcy5zdXBwb3J0c0xhcmdlc3RDb250ZW50ZnVsUGFpbnRfKSB7XG4gICAgICB0aGlzLm1ldHJpY3NfLnJlamVjdFNpZ25hbChcbiAgICAgICAgVGlja0xhYmVsLkxBUkdFU1RfQ09OVEVOVEZVTF9QQUlOVCxcbiAgICAgICAgZGV2KCkuY3JlYXRlRXhwZWN0ZWRFcnJvcignTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IG5vdCBzdXBwb3J0ZWQnKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSB1c2VyIGFnZW50IHN1cHBvcnRzIHRoZSBuYXZpZ2F0aW9uIHRpbWluZyBBUElcbiAgICAgKlxuICAgICAqIEBwcml2YXRlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuc3VwcG9ydHNOYXZpZ2F0aW9uXyA9IHN1cHBvcnRlZEVudHJ5VHlwZXMuaW5jbHVkZXMoJ25hdmlnYXRpb24nKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBsYXRlc3QgcmVwb3J0ZWQgbGFyZ2VzdCBjb250ZW50ZnVsIHBhaW50IHRpbWUuIFVzZXMgZW50cnkuc3RhcnRUaW1lLFxuICAgICAqIHdoaWNoIGVxdWF0ZXMgdG86IHJlbmRlclRpbWUgPz8gbG9hZFRpbWUuIFdlIGNhbid0IGFsd2F5cyB1c2Ugb25lIG9yIHRoZSBvdGhlclxuICAgICAqIGJlY2F1c2U6XG4gICAgICogLSBsb2FkVGltZSBpcyAwIGZvciBub24tcmVtb3RlIHJlc291cmNlcyAodGV4dClcbiAgICAgKiAtIHJlbmRlclRpbWUgaXMgdW5kZWZpbmVkIGZvciBjcm9zc29yaWdpbiByZXNvdXJjZXNcbiAgICAgKlxuICAgICAqIEBwcml2YXRlIHs/bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubGFyZ2VzdENvbnRlbnRmdWxQYWludF8gPSBudWxsO1xuXG4gICAgdGhpcy5vbkFtcERvY1Zpc2liaWxpdHlDaGFuZ2VfID0gdGhpcy5vbkFtcERvY1Zpc2liaWxpdHlDaGFuZ2VfLmJpbmQodGhpcyk7XG5cbiAgICAvLyBBZGQgUlRWIHZlcnNpb24gYXMgZXhwZXJpbWVudCBJRCwgc28gd2UgY2FuIHNsaWNlIHRoZSBkYXRhIGJ5IHZlcnNpb24uXG4gICAgdGhpcy5hZGRFbmFibGVkRXhwZXJpbWVudCgncnR2LScgKyBnZXRNb2RlKHRoaXMud2luKS5ydHZWZXJzaW9uKTtcblxuICAgIC8vIFRpY2sgZG9jdW1lbnQgcmVhZHkgZXZlbnQuXG4gICAgd2hlbkRvY3VtZW50UmVhZHkod2luLmRvY3VtZW50KS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMudGljayhUaWNrTGFiZWwuRE9DVU1FTlRfUkVBRFkpO1xuICAgICAgdGhpcy5mbHVzaCgpO1xuICAgIH0pO1xuXG4gICAgLy8gVGljayB3aW5kb3cub25sb2FkIGV2ZW50LlxuICAgIHdoZW5Eb2N1bWVudENvbXBsZXRlKHdpbi5kb2N1bWVudCkudGhlbigoKSA9PiB0aGlzLm9ubG9hZF8oKSk7XG4gICAgdGhpcy5yZWdpc3RlclBlcmZvcm1hbmNlT2JzZXJ2ZXJfKCk7XG4gICAgdGhpcy5yZWdpc3RlckZpcnN0SW5wdXREZWxheVBvbHlmaWxsTGlzdGVuZXJfKCk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmdvb2dsZUZvbnRFeHBSZWNvcmRlZF8gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0ZW5zIHRvIHZpZXdlciBhbmQgcmVzb3VyY2UgZXZlbnRzLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGNvcmVTZXJ2aWNlc0F2YWlsYWJsZSgpIHtcbiAgICBjb25zdCB7ZG9jdW1lbnRFbGVtZW50fSA9IHRoaXMud2luLmRvY3VtZW50O1xuICAgIHRoaXMuYW1wZG9jXyA9IFNlcnZpY2VzLmFtcGRvYyhkb2N1bWVudEVsZW1lbnQpO1xuICAgIHRoaXMudmlld2VyXyA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhkb2N1bWVudEVsZW1lbnQpO1xuICAgIHRoaXMucmVzb3VyY2VzXyA9IFNlcnZpY2VzLnJlc291cmNlc0ZvckRvYyhkb2N1bWVudEVsZW1lbnQpO1xuICAgIHRoaXMuZG9jdW1lbnRJbmZvXyA9IFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmFtcGRvY18pO1xuXG4gICAgdGhpcy5pc1BlcmZvcm1hbmNlVHJhY2tpbmdPbl8gPVxuICAgICAgdGhpcy52aWV3ZXJfLmlzRW1iZWRkZWQoKSAmJiB0aGlzLnZpZXdlcl8uZ2V0UGFyYW0oJ2NzaScpID09PSAnMSc7XG5cbiAgICAvLyBUaGlzIGlzIGZvciByZWR1bmRhbmN5LiBDYWxsIGZsdXNoIG9uIGFueSB2aXNpYmlsaXR5IGNoYW5nZS5cbiAgICB0aGlzLmFtcGRvY18ub25WaXNpYmlsaXR5Q2hhbmdlZCh0aGlzLmZsdXNoLmJpbmQodGhpcykpO1xuXG4gICAgLy8gRG9lcyBub3QgbmVlZCB0byB3YWl0IGZvciBtZXNzYWdpbmcgcmVhZHkgc2luY2UgaXQgd2lsbCBiZSBxdWV1ZWRcbiAgICAvLyBpZiBpdCBpc24ndCByZWFkeS5cbiAgICB0aGlzLm1lYXN1cmVVc2VyUGVyY2VpdmVkVmlzdWFsQ29tcGxldGVuZXNzVGltZV8oKTtcblxuICAgIC8vIENhbiBiZSBudWxsIHdoaWNoIHdvdWxkIG1lYW4gdGhpcyBBTVAgcGFnZSBpcyBub3QgZW1iZWRkZWRcbiAgICAvLyBhbmQgaGFzIG5vIG1lc3NhZ2luZyBjaGFubmVsLlxuICAgIGNvbnN0IGNoYW5uZWxQcm9taXNlID0gdGhpcy52aWV3ZXJfLndoZW5NZXNzYWdpbmdSZWFkeSgpO1xuXG4gICAgdGhpcy5hbXBkb2NfLndoZW5GaXJzdFZpc2libGUoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMudGljayhUaWNrTGFiZWwuT05fRklSU1RfVklTSUJMRSk7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCByZWdpc3RlclZpc2liaWxpdHlDaGFuZ2VMaXN0ZW5lciA9XG4gICAgICB0aGlzLnN1cHBvcnRzTGFyZ2VzdENvbnRlbnRmdWxQYWludF8gfHwgdGhpcy5zdXBwb3J0c0xheW91dFNoaWZ0XztcbiAgICAvLyBSZWdpc3RlciBhIGhhbmRsZXIgdG8gcmVjb3JkIG1ldHJpY3Mgd2hlbiB0aGUgcGFnZSBlbnRlcnMgdGhlIGhpZGRlblxuICAgIC8vIGxpZmVjeWNsZSBzdGF0ZS5cbiAgICBpZiAocmVnaXN0ZXJWaXNpYmlsaXR5Q2hhbmdlTGlzdGVuZXIpIHtcbiAgICAgIHRoaXMuYW1wZG9jXy5vblZpc2liaWxpdHlDaGFuZ2VkKHRoaXMub25BbXBEb2NWaXNpYmlsaXR5Q2hhbmdlXyk7XG4gICAgfVxuXG4gICAgLy8gV2UgZG9uJ3QgY2hlY2sgYGlzUGVyZm9ybWFuY2VUcmFja2luZ09uYCBoZXJlIHNpbmNlIHRoZXJlIGFyZSBzb21lXG4gICAgLy8gZXZlbnRzIHRoYXQgd2UgY2FsbCBvbiB0aGUgdmlld2VyIGV2ZW4gdGhvdWdoIHBlcmZvcm1hbmNlIHRyYWNraW5nXG4gICAgLy8gaXMgb2ZmIHdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZSBBTVAgcGFnZSBoYXMgYSBtZXNzYWdpbmdcbiAgICAvLyBjaGFubmVsIG9yIG5vdC5cbiAgICBpZiAoIWNoYW5uZWxQcm9taXNlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYW5uZWxQcm9taXNlXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIFRpY2sgdGhlIFwibWVzc2FnaW5nIHJlYWR5XCIgc2lnbmFsLlxuICAgICAgICB0aGlzLnRpY2tEZWx0YShUaWNrTGFiZWwuTUVTU0FHSU5HX1JFQURZLCB0aGlzLndpbi5wZXJmb3JtYW5jZS5ub3coKSk7XG5cbiAgICAgICAgLy8gVGljayB0aW1lT3JpZ2luIHNvIHRoYXQgZXBvY2ggdGltZSBjYW4gYmUgY2FsY3VsYXRlZCBieSBjb25zdW1lcnMuXG4gICAgICAgIHRoaXMudGljayhUaWNrTGFiZWwuVElNRV9PUklHSU4sIHVuZGVmaW5lZCwgdGhpcy50aW1lT3JpZ2luXyk7XG5cbiAgICAgICAgY29uc3QgdXNxcCA9IHRoaXMuYW1wZG9jXy5nZXRNZXRhQnlOYW1lKCdhbXAtdXNxcCcpO1xuICAgICAgICBpZiAodXNxcCkge1xuICAgICAgICAgIHVzcXAuc3BsaXQoJywnKS5mb3JFYWNoKChleHApID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkRW5hYmxlZEV4cGVyaW1lbnQoJ3Nzci0nICsgZXhwKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLm1heWJlQWRkU3RvcnlFeHBlcmltZW50SWRfKCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzTWVzc2FnaW5nUmVhZHlfID0gdHJ1ZTtcblxuICAgICAgICAvLyBGb3J3YXJkIGFsbCBxdWV1ZWQgdGlja3MgdG8gdGhlIHZpZXdlciBzaW5jZSBtZXNzYWdpbmdcbiAgICAgICAgLy8gaXMgbm93IHJlYWR5LlxuICAgICAgICB0aGlzLmZsdXNoUXVldWVkVGlja3NfKCk7XG5cbiAgICAgICAgLy8gU2VuZCBhbGwgY3NpIHRpY2tzIHRocm91Z2guXG4gICAgICAgIHRoaXMuZmx1c2goKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHN0b3J5IGV4cGVyaW1lbnQgSUQgaW4gb3JkZXIgdG8gc2xpY2UgdGhlIGRhdGEgZm9yIGFtcC1zdG9yeS5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZUFkZFN0b3J5RXhwZXJpbWVudElkXygpIHtcbiAgICBjb25zdCBhbXBkb2MgPSBTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKHRoaXMud2luKS5nZXRTaW5nbGVEb2MoKTtcbiAgICByZXR1cm4gaXNTdG9yeURvY3VtZW50KGFtcGRvYykudGhlbigoaXNTdG9yeSkgPT4ge1xuICAgICAgaWYgKGlzU3RvcnkpIHtcbiAgICAgICAgdGhpcy5hZGRFbmFibGVkRXhwZXJpbWVudCgnc3RvcnknKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3Igb25sb2FkLlxuICAgKi9cbiAgb25sb2FkXygpIHtcbiAgICB0aGlzLnRpY2soVGlja0xhYmVsLk9OX0xPQUQpO1xuICAgIHRoaXMudGlja0xlZ2FjeUZpcnN0UGFpbnRUaW1lXygpO1xuICAgIHRoaXMuZmx1c2goKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIHBlcmZvcm1hbmNlIG1ldHJpY3MgZmlyc3QgcGFpbnQsIGZpcnN0IGNvbnRlbnRmdWwgcGFpbnQsXG4gICAqIGFuZCBmaXJzdCBpbnB1dCBkZWxheS5cbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL3BhaW50LXRpbWluZ1xuICAgKi9cbiAgcmVnaXN0ZXJQZXJmb3JtYW5jZU9ic2VydmVyXygpIHtcbiAgICAvLyBUdXJuIG9mZiBwZXJmb3JtYW5jZU9ic2VydmVyIGRlcml2ZWQgbWV0cmljcyBmb3IgaW5hYm94IGFzIHRoZXJlXG4gICAgLy8gd2lsbCBuZXZlciBiZSBhIHZpZXdlciB0byByZXBvcnQgdG8uXG4gICAgLy8gVE9ETyhjY29yZHJ5KTogd2UgYXJlIHN0aWxsIGRvaW5nIHNvbWUgb3RoZXIgdW5uZWNlc3NhcnkgbWVhc3VyZW1lbnRzIGZvclxuICAgIC8vIHRoZSBpbmFib3ggY2FzZSwgYnV0IHdvdWxkIG5lZWQgYSBsYXJnZXIgcmVmYWN0b3IuXG4gICAgaWYgKGdldE1vZGUodGhpcy53aW4pLnJ1bnRpbWUgPT09ICdpbmFib3gnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlc2Ugc3RhdGUgdmFycyBlbnN1cmUgdGhhdCB3ZSBvbmx5IHJlcG9ydCBhIGdpdmVuIHZhbHVlIG9uY2UsIGJlY2F1c2VcbiAgICAvLyB0aGUgYmFja2VuZCBkb2Vzbid0IHN1cHBvcnQgdXBkYXRlcy5cbiAgICBsZXQgcmVjb3JkZWRGaXJzdFBhaW50ID0gZmFsc2U7XG4gICAgbGV0IHJlY29yZGVkRmlyc3RDb250ZW50ZnVsUGFpbnQgPSBmYWxzZTtcbiAgICBsZXQgcmVjb3JkZWRGaXJzdElucHV0RGVsYXkgPSBmYWxzZTtcbiAgICBsZXQgcmVjb3JkZWROYXZpZ2F0aW9uID0gZmFsc2U7XG4gICAgY29uc3QgcHJvY2Vzc0VudHJ5ID0gKGVudHJ5KSA9PiB7XG4gICAgICBpZiAoZW50cnkubmFtZSA9PSAnZmlyc3QtcGFpbnQnICYmICFyZWNvcmRlZEZpcnN0UGFpbnQpIHtcbiAgICAgICAgdGhpcy50aWNrRGVsdGEoVGlja0xhYmVsLkZJUlNUX1BBSU5ULCBlbnRyeS5zdGFydFRpbWUgKyBlbnRyeS5kdXJhdGlvbik7XG4gICAgICAgIHJlY29yZGVkRmlyc3RQYWludCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBlbnRyeS5uYW1lID09ICdmaXJzdC1jb250ZW50ZnVsLXBhaW50JyAmJlxuICAgICAgICAhcmVjb3JkZWRGaXJzdENvbnRlbnRmdWxQYWludFxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZW50cnkuc3RhcnRUaW1lICsgZW50cnkuZHVyYXRpb247XG4gICAgICAgIHRoaXMudGlja0RlbHRhKFRpY2tMYWJlbC5GSVJTVF9DT05URU5URlVMX1BBSU5ULCB2YWx1ZSk7XG4gICAgICAgIHRoaXMudGlja1NpbmNlVmlzaWJsZShUaWNrTGFiZWwuRklSU1RfQ09OVEVOVEZVTF9QQUlOVF9WSVNJQkxFLCB2YWx1ZSk7XG4gICAgICAgIHJlY29yZGVkRmlyc3RDb250ZW50ZnVsUGFpbnQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZW50cnkuZW50cnlUeXBlID09PSAnZmlyc3QtaW5wdXQnICYmXG4gICAgICAgICFyZWNvcmRlZEZpcnN0SW5wdXREZWxheVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZW50cnkucHJvY2Vzc2luZ1N0YXJ0IC0gZW50cnkuc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLnRpY2tEZWx0YShUaWNrTGFiZWwuRklSU1RfSU5QVVRfREVMQVksIHZhbHVlKTtcbiAgICAgICAgcmVjb3JkZWRGaXJzdElucHV0RGVsYXkgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChlbnRyeS5lbnRyeVR5cGUgPT09ICdsYXlvdXQtc2hpZnQnKSB7XG4gICAgICAgIC8vIElnbm9yZSBsYXlvdXQgc2hpZnQgdGhhdCBvY2N1cnMgd2l0aGluIDUwMG1zIG9mIHVzZXIgaW5wdXQsIGFzIGl0IGlzXG4gICAgICAgIC8vIGxpa2VseSBpbiByZXNwb25zZSB0byB0aGUgdXNlcidzIGFjdGlvbi5cbiAgICAgICAgLy8gMTAwMCBoZXJlIGlzIGEgbWFnaWMgbnVtYmVyIHRvIHByZXZlbnQgdW5ib3VuZGVkIGdyb3d0aC4gV2UgZG9uJ3QgZXhwZWN0IGl0IHRvIGJlIHJlYWNoZWQuXG4gICAgICAgIGlmICghZW50cnkuaGFkUmVjZW50SW5wdXQgJiYgdGhpcy5sYXlvdXRTaGlmdHNfLmxlbmd0aCA8IDEwMDApIHtcbiAgICAgICAgICB0aGlzLmxheW91dFNoaWZ0c18ucHVzaChlbnRyeSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZW50cnkuZW50cnlUeXBlID09PSAnbGFyZ2VzdC1jb250ZW50ZnVsLXBhaW50Jykge1xuICAgICAgICB0aGlzLmxhcmdlc3RDb250ZW50ZnVsUGFpbnRfID0gZW50cnkuc3RhcnRUaW1lO1xuICAgICAgfSBlbHNlIGlmIChlbnRyeS5lbnRyeVR5cGUgPT0gJ25hdmlnYXRpb24nICYmICFyZWNvcmRlZE5hdmlnYXRpb24pIHtcbiAgICAgICAgW1xuICAgICAgICAgICdkb21Db21wbGV0ZScsXG4gICAgICAgICAgJ2RvbUNvbnRlbnRMb2FkZWRFdmVudEVuZCcsXG4gICAgICAgICAgJ2RvbUNvbnRlbnRMb2FkZWRFdmVudFN0YXJ0JyxcbiAgICAgICAgICAnZG9tSW50ZXJhY3RpdmUnLFxuICAgICAgICAgICdsb2FkRXZlbnRFbmQnLFxuICAgICAgICAgICdsb2FkRXZlbnRTdGFydCcsXG4gICAgICAgICAgJ3JlcXVlc3RTdGFydCcsXG4gICAgICAgICAgJ3Jlc3BvbnNlU3RhcnQnLFxuICAgICAgICBdLmZvckVhY2goKGxhYmVsKSA9PiB0aGlzLnRpY2sobGFiZWwsIGVudHJ5W2xhYmVsXSkpO1xuICAgICAgICByZWNvcmRlZE5hdmlnYXRpb24gPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBlbnRyeVR5cGVzVG9PYnNlcnZlID0gW107XG4gICAgaWYgKHRoaXMud2luLlBlcmZvcm1hbmNlUGFpbnRUaW1pbmcpIHtcbiAgICAgIC8vIFByb2dyYW1tYXRpY2FsbHkgcmVhZCBvbmNlIGFzIGN1cnJlbnRseSBQZXJmb3JtYW5jZU9ic2VydmVyIGRvZXMgbm90XG4gICAgICAvLyByZXBvcnQgcGFzdCBlbnRyaWVzIGFzIG9mIENocm9taXVtIDYxLlxuICAgICAgLy8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NzI1NTY3XG4gICAgICB0aGlzLndpbi5wZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlUeXBlKCdwYWludCcpLmZvckVhY2gocHJvY2Vzc0VudHJ5KTtcbiAgICAgIGVudHJ5VHlwZXNUb09ic2VydmUucHVzaCgncGFpbnQnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdXBwb3J0c0V2ZW50VGltaW5nXykge1xuICAgICAgdGhpcy5jcmVhdGVQZXJmb3JtYW5jZU9ic2VydmVyXyhwcm9jZXNzRW50cnksIHtcbiAgICAgICAgdHlwZTogJ2ZpcnN0LWlucHV0JyxcbiAgICAgICAgYnVmZmVyZWQ6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdXBwb3J0c0xheW91dFNoaWZ0Xykge1xuICAgICAgdGhpcy5jcmVhdGVQZXJmb3JtYW5jZU9ic2VydmVyXyhwcm9jZXNzRW50cnksIHtcbiAgICAgICAgdHlwZTogJ2xheW91dC1zaGlmdCcsXG4gICAgICAgIGJ1ZmZlcmVkOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3VwcG9ydHNMYXJnZXN0Q29udGVudGZ1bFBhaW50Xykge1xuICAgICAgLy8gbGNwT2JzZXJ2ZXJcbiAgICAgIHRoaXMuY3JlYXRlUGVyZm9ybWFuY2VPYnNlcnZlcl8ocHJvY2Vzc0VudHJ5LCB7XG4gICAgICAgIHR5cGU6ICdsYXJnZXN0LWNvbnRlbnRmdWwtcGFpbnQnLFxuICAgICAgICBidWZmZXJlZDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN1cHBvcnRzTmF2aWdhdGlvbl8pIHtcbiAgICAgIC8vIFdyYXAgaW4gYSB0cnkgc3RhdGVtZW50IGFzIHRoZXJlIGFyZSBzb21lIGJyb3dzZXJzIChleC4gY2hyb21lIDczKVxuICAgICAgLy8gdGhhdCB3aWxsIHNheSBpdCBzdXBwb3J0cyBuYXZpZ2F0aW9uIGJ1dCB0aHJvd3MuXG4gICAgICB0aGlzLmNyZWF0ZVBlcmZvcm1hbmNlT2JzZXJ2ZXJfKHByb2Nlc3NFbnRyeSwge1xuICAgICAgICB0eXBlOiAnbmF2aWdhdGlvbicsXG4gICAgICAgIGJ1ZmZlcmVkOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGVudHJ5VHlwZXNUb09ic2VydmUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5jcmVhdGVQZXJmb3JtYW5jZU9ic2VydmVyXyhwcm9jZXNzRW50cnksIHtcbiAgICAgICAgZW50cnlUeXBlczogZW50cnlUeXBlc1RvT2JzZXJ2ZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFQZXJmb3JtYW5jZUVudHJ5KX0gcHJvY2Vzc0VudHJ5XG4gICAqIEBwYXJhbSB7IVBlcmZvcm1hbmNlT2JzZXJ2ZXJJbml0fSBpbml0XG4gICAqIEByZXR1cm4geyFQZXJmb3JtYW5jZU9ic2VydmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlUGVyZm9ybWFuY2VPYnNlcnZlcl8ocHJvY2Vzc0VudHJ5LCBpbml0KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG9icyA9IG5ldyB0aGlzLndpbi5QZXJmb3JtYW5jZU9ic2VydmVyKChsaXN0KSA9PiB7XG4gICAgICAgIGxpc3QuZ2V0RW50cmllcygpLmZvckVhY2gocHJvY2Vzc0VudHJ5KTtcbiAgICAgICAgdGhpcy5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgICBvYnMub2JzZXJ2ZShpbml0KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGRldigpLndhcm4oVEFHLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIHRoZSBmaXJzdCBpbnB1dCBkZWxheSB2YWx1ZSBjYWxjdWxhdGVkIGJ5IGEgcG9seWZpbGwsIGlmIHByZXNlbnQuXG4gICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL0dvb2dsZUNocm9tZUxhYnMvZmlyc3QtaW5wdXQtZGVsYXlcbiAgICovXG4gIHJlZ2lzdGVyRmlyc3RJbnB1dERlbGF5UG9seWZpbGxMaXN0ZW5lcl8oKSB7XG4gICAgaWYgKCF0aGlzLndpbi5wZXJmTWV0cmljcyB8fCAhdGhpcy53aW4ucGVyZk1ldHJpY3Mub25GaXJzdElucHV0RGVsYXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy53aW4ucGVyZk1ldHJpY3Mub25GaXJzdElucHV0RGVsYXkoKGRlbGF5KSA9PiB7XG4gICAgICB0aGlzLnRpY2tEZWx0YShUaWNrTGFiZWwuRklSU1RfSU5QVVRfREVMQVlfUE9MWUZJTEwsIGRlbGF5KTtcbiAgICAgIHRoaXMuZmx1c2goKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSB2aWV3ZXIgdmlzaWJpbGl0eSBzdGF0ZSBvZiB0aGUgZG9jdW1lbnQgY2hhbmdlcyB0byBpbmFjdGl2ZSBvciBoaWRkZW4sXG4gICAqIHNlbmQgdGhlIGxheW91dCBzY29yZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQW1wRG9jVmlzaWJpbGl0eUNoYW5nZV8oKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmFtcGRvY18uZ2V0VmlzaWJpbGl0eVN0YXRlKCk7XG4gICAgaWYgKFxuICAgICAgc3RhdGUgPT09IFZpc2liaWxpdHlTdGF0ZS5JTkFDVElWRSB8fFxuICAgICAgc3RhdGUgPT09IFZpc2liaWxpdHlTdGF0ZS5ISURERU5cbiAgICApIHtcbiAgICAgIHRoaXMudGlja0N1bXVsYXRpdmVNZXRyaWNzXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaWNrIHRoZSBtZXRyaWNzIHdob3NlIHZhbHVlcyBjaGFuZ2Ugb3ZlciB0aW1lLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdGlja0N1bXVsYXRpdmVNZXRyaWNzXygpIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0c0xheW91dFNoaWZ0Xykge1xuICAgICAgaWYgKCF0aGlzLmdvb2dsZUZvbnRFeHBSZWNvcmRlZF8pIHtcbiAgICAgICAgdGhpcy5nb29nbGVGb250RXhwUmVjb3JkZWRfID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qge3dpbn0gPSB0aGlzO1xuICAgICAgICBjb25zdCBnb29nbGVGb250RXhwID0gcGFyc2VJbnQoXG4gICAgICAgICAgY29tcHV0ZWRTdHlsZSh3aW4sIHdpbi5kb2N1bWVudC5ib2R5KS5nZXRQcm9wZXJ0eVZhbHVlKFxuICAgICAgICAgICAgJy0tZ29vZ2xlLWZvbnQtZXhwJ1xuICAgICAgICAgICksXG4gICAgICAgICAgMTBcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGdvb2dsZUZvbnRFeHAgPj0gMCkge1xuICAgICAgICAgIHRoaXMuYWRkRW5hYmxlZEV4cGVyaW1lbnQoYGdvb2dsZS1mb250LWV4cD0ke2dvb2dsZUZvbnRFeHB9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy50aWNrTGF5b3V0U2hpZnRTY29yZV8oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNMYXJnZXN0Q29udGVudGZ1bFBhaW50Xykge1xuICAgICAgdGhpcy50aWNrTGFyZ2VzdENvbnRlbnRmdWxQYWludF8oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGljayB0aGUgbGF5b3V0IHNoaWZ0IHNjb3JlIG1ldHJpYy5cbiAgICpcbiAgICogQSB2YWx1ZSBvZiB0aGUgbWV0cmljIGlzIHJlY29yZGVkIGluIHVuZGVyIHR3byBuYW1lcywgYGNsc2AgYW5kIGBjbHMtMmAsXG4gICAqIGZvciB0aGUgZmlyc3QgdHdvIHRpbWVzIHRoZSBwYWdlIHRyYW5zaXRpb25zIGludG8gYSBoaWRkZW4gbGlmZWN5Y2xlIHN0YXRlXG4gICAqICh3aGVuIHRoZSBwYWdlIGlzIG5hdmlnYXRlZCBhIHdheSBmcm9tLCB0aGUgdGFiIGlzIGJhY2tncm91bmRlZCBmb3JcbiAgICogYW5vdGhlciB0YWIsIG9yIHRoZSB1c2VyIGJhY2tncm91bmRzIHRoZSBicm93c2VyIGFwcGxpY2F0aW9uKS5cbiAgICpcbiAgICogU2luY2Ugd2UgY2FuJ3QgcmVsaWFibHkgZGV0ZWN0IHdoZW4gYSBwYWdlIHNlc3Npb24gZmluYWxseSBlbmRzLFxuICAgKiByZWNvcmRpbmcgdGhlIHZhbHVlIGZvciB0aGVzZSBmaXJzdCB0d28gZXZlbnRzIHNob3VsZCBwcm92aWRlIGEgZmFpclxuICAgKiBhbW91bnQgb2YgdmlzaWJpbGl0eSBpbnRvIHRoaXMgbWV0cmljLlxuICAgKi9cbiAgdGlja0xheW91dFNoaWZ0U2NvcmVfKCkge1xuICAgIGNvbnN0IGNscyA9IHRoaXMubGF5b3V0U2hpZnRzXy5yZWR1Y2UoKHN1bSwgZW50cnkpID0+IHN1bSArIGVudHJ5LnZhbHVlLCAwKTtcbiAgICBjb25zdCBmY3AgPSB0aGlzLm1ldHJpY3NfLmdldChUaWNrTGFiZWwuRklSU1RfQ09OVEVOVEZVTF9QQUlOVCkgPz8gMDsgLy8gZmFsbGJhY2sgdG8gMCwgc28gdGhhdCB3ZSBuZXZlciBvdmVyY291bnQuXG4gICAgY29uc3Qgb2Z2ID0gdGhpcy5tZXRyaWNzXy5nZXQoVGlja0xhYmVsLk9OX0ZJUlNUX1ZJU0lCTEUpID8/IDA7XG5cbiAgICAvLyBUT0RPKCMzMzIwNyk6IFJlbW92ZSBhZnRlciBkYXRhIGNvbGxlY3Rpb25cbiAgICBjb25zdCBjbHNCZWZvcmVGQ1AgPSB0aGlzLmxheW91dFNoaWZ0c18ucmVkdWNlKChzdW0sIGVudHJ5KSA9PiB7XG4gICAgICBpZiAoZW50cnkuc3RhcnRUaW1lIDwgZmNwKSB7XG4gICAgICAgIHJldHVybiBzdW0gKyBlbnRyeS52YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdW07XG4gICAgfSwgMCk7XG4gICAgY29uc3QgY2xzQmVmb3JlT0ZWID0gdGhpcy5sYXlvdXRTaGlmdHNfLnJlZHVjZSgoc3VtLCBlbnRyeSkgPT4ge1xuICAgICAgaWYgKGVudHJ5LnN0YXJ0VGltZSA8IG9mdikge1xuICAgICAgICByZXR1cm4gc3VtICsgZW50cnkudmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VtO1xuICAgIH0sIDApO1xuXG4gICAgaWYgKHRoaXMuc2hpZnRTY29yZXNUaWNrZWRfID09PSAwKSB7XG4gICAgICB0aGlzLnRpY2soVGlja0xhYmVsLkNVTVVMQVRJVkVfTEFZT1VUX1NISUZUX0JFRk9SRV9WSVNJQkxFLCBjbHNCZWZvcmVPRlYpO1xuICAgICAgdGhpcy50aWNrRGVsdGEoXG4gICAgICAgIFRpY2tMYWJlbC5DVU1VTEFUSVZFX0xBWU9VVF9TSElGVF9CRUZPUkVfRkNQLFxuICAgICAgICBjbHNCZWZvcmVGQ1BcbiAgICAgICk7XG4gICAgICB0aGlzLnRpY2tEZWx0YShUaWNrTGFiZWwuQ1VNVUxBVElWRV9MQVlPVVRfU0hJRlQsIGNscyk7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgICB0aGlzLnNoaWZ0U2NvcmVzVGlja2VkXyA9IDE7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNoaWZ0U2NvcmVzVGlja2VkXyA9PT0gMSkge1xuICAgICAgdGhpcy50aWNrRGVsdGEoVGlja0xhYmVsLkNVTVVMQVRJVkVfTEFZT1VUX1NISUZUXzIsIGNscyk7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgICB0aGlzLnNoaWZ0U2NvcmVzVGlja2VkXyA9IDI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRpY2sgZnAgdGltZSBiYXNlZCBvbiBDaHJvbWl1bSdzIGxlZ2FjeSBwYWludCB0aW1pbmcgQVBJIHdoZW5cbiAgICogYXBwcm9wcmlhdGUuXG4gICAqIGByZWdpc3RlclBhaW50VGltaW5nT2JzZXJ2ZXJfYCBjYWxscyB0aGUgc3RhbmRhcmRzIGJhc2VkIEFQSSBhbmQgdGhpc1xuICAgKiBtZXRob2QgZG9lcyBub3RoaW5nIGlmIGl0IGlzIGF2YWlsYWJsZS5cbiAgICovXG4gIHRpY2tMZWdhY3lGaXJzdFBhaW50VGltZV8oKSB7XG4gICAgLy8gRGV0ZWN0IGRlcHJlY2F0ZWQgZmlyc3QgcGFpbnQgdGltZSBBUElcbiAgICAvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD02MjE1MTJcbiAgICAvLyBXZSdsbCB1c2UgdGhpcyB1bnRpbCBzb21ldGhpbmcgYmV0dGVyIGlzIGF2YWlsYWJsZS5cbiAgICBpZiAoXG4gICAgICAhdGhpcy53aW4uUGVyZm9ybWFuY2VQYWludFRpbWluZyAmJlxuICAgICAgdGhpcy53aW4uY2hyb21lICYmXG4gICAgICB0eXBlb2YgdGhpcy53aW4uY2hyb21lLmxvYWRUaW1lcyA9PSAnZnVuY3Rpb24nXG4gICAgKSB7XG4gICAgICBjb25zdCBmcFRpbWUgPVxuICAgICAgICB0aGlzLndpbi5jaHJvbWUubG9hZFRpbWVzKClbJ2ZpcnN0UGFpbnRUaW1lJ10gKiAxMDAwIC1cbiAgICAgICAgdGhpcy53aW4ucGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydDtcbiAgICAgIGlmIChmcFRpbWUgPD0gMSkge1xuICAgICAgICAvLyBUaHJvdyBhd2F5IGJhZCBkYXRhIGdlbmVyYXRlZCBmcm9tIGFuIGFwcGFyZW50IENocm9taXVtIGJ1Z1xuICAgICAgICAvLyB0aGF0IGlzIGZpeGVkIGluIGxhdGVyIENocm9taXVtIHZlcnNpb25zLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnRpY2tEZWx0YShUaWNrTGFiZWwuRklSU1RfUEFJTlQsIGZwVGltZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRpY2sgdGhlIGxhcmdlc3QgY29udGVudGZ1bCBwYWludCBtZXRyaWNzLlxuICAgKi9cbiAgdGlja0xhcmdlc3RDb250ZW50ZnVsUGFpbnRfKCkge1xuICAgIGlmICh0aGlzLmxhcmdlc3RDb250ZW50ZnVsUGFpbnRfID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnRpY2tEZWx0YShcbiAgICAgIFRpY2tMYWJlbC5MQVJHRVNUX0NPTlRFTlRGVUxfUEFJTlQsXG4gICAgICB0aGlzLmxhcmdlc3RDb250ZW50ZnVsUGFpbnRfXG4gICAgKTtcbiAgICB0aGlzLnRpY2tTaW5jZVZpc2libGUoXG4gICAgICBUaWNrTGFiZWwuTEFSR0VTVF9DT05URU5URlVMX1BBSU5UX1ZJU0lCTEUsXG4gICAgICB0aGlzLmxhcmdlc3RDb250ZW50ZnVsUGFpbnRfXG4gICAgKTtcbiAgICB0aGlzLmZsdXNoKCk7XG4gIH1cblxuICAvKipcbiAgICogTWVhc3VyZSB0aGUgZGVsYXkgdGhlIHVzZXIgcGVyY2VpdmVzIG9mIGhvdyBsb25nIGl0IHRha2VzXG4gICAqIHRvIGxvYWQgdGhlIGluaXRpYWwgdmlld3BvcnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtZWFzdXJlVXNlclBlcmNlaXZlZFZpc3VhbENvbXBsZXRlbmVzc1RpbWVfKCkge1xuICAgIGNvbnN0IGRpZFN0YXJ0SW5QcmVyZW5kZXIgPSAhdGhpcy5hbXBkb2NfLmhhc0JlZW5WaXNpYmxlKCk7XG5cbiAgICBsZXQgZG9jVmlzaWJsZVRpbWUgPSAtMTtcbiAgICB0aGlzLmFtcGRvY18ud2hlbkZpcnN0VmlzaWJsZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgZG9jVmlzaWJsZVRpbWUgPSB0aGlzLndpbi5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIC8vIE1hcmsgdGhpcyBmaXJzdCB2aXNpYmxlIGluc3RhbmNlIGluIHRoZSBicm93c2VyIHRpbWVsaW5lLlxuICAgICAgdGhpcy5tYXJrKCd2aXNpYmxlJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLndoZW5WaWV3cG9ydExheW91dENvbXBsZXRlXygpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKGRpZFN0YXJ0SW5QcmVyZW5kZXIpIHtcbiAgICAgICAgY29uc3QgdXNlclBlcmNlaXZlZFZpc3VhbENvbXBsZXRlbmVzc3NUaW1lID1cbiAgICAgICAgICBkb2NWaXNpYmxlVGltZSA+IC0xXG4gICAgICAgICAgICA/IHRoaXMud2luLnBlcmZvcm1hbmNlLm5vdygpIC0gZG9jVmlzaWJsZVRpbWVcbiAgICAgICAgICAgIDogLy8gIFByZXJlbmRlciB3YXMgY29tcGxldGUgYmVmb3JlIHZpc2liaWxpdHkuXG4gICAgICAgICAgICAgIDA7XG4gICAgICAgIHRoaXMuYW1wZG9jXy53aGVuRmlyc3RWaXNpYmxlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gV2Ugb25seSB0aWNrIHRoaXMgaWYgdGhlIHBhZ2UgZXZlbnR1YWxseSBiZWNvbWVzIHZpc2libGUsXG4gICAgICAgICAgLy8gc2luY2Ugb3RoZXJ3aXNlIHdlIGhlYXZpbHkgc2tldyB0aGUgbWV0cmljIHRvd2FyZHMgdGhlXG4gICAgICAgICAgLy8gMCBjYXNlLCBzaW5jZSBwcmUtcmVuZGVycyB0aGF0IGFyZSBuZXZlciB1c2VkIGFyZSBoaWdobHlcbiAgICAgICAgICAvLyBsaWtlbHkgdG8gZnVsbHkgbG9hZCBiZWZvcmUgdGhleSBhcmUgbmV2ZXIgdXNlZCA6KVxuICAgICAgICAgIHRoaXMudGlja0RlbHRhKFxuICAgICAgICAgICAgVGlja0xhYmVsLkZJUlNUX1ZJRVdQT1JUX1JFQURZLFxuICAgICAgICAgICAgdXNlclBlcmNlaXZlZFZpc3VhbENvbXBsZXRlbmVzc3NUaW1lXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJlcmVuZGVyQ29tcGxldGVfKHVzZXJQZXJjZWl2ZWRWaXN1YWxDb21wbGV0ZW5lc3NzVGltZSk7XG4gICAgICAgIC8vIE1hcmsgdGhpcyBpbnN0YW5jZSBpbiB0aGUgYnJvd3NlciB0aW1lbGluZS5cbiAgICAgICAgdGhpcy5tYXJrKFRpY2tMYWJlbC5GSVJTVF9WSUVXUE9SVF9SRUFEWSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiBpdCBkaWRudCBzdGFydCBpbiBwcmVyZW5kZXIsIG5vIG5lZWQgdG8gY2FsY3VsYXRlIGFueXRoaW5nXG4gICAgICAgIC8vIGFuZCB3ZSBqdXN0IG5lZWQgdG8gdGljayBgcGNgLiAoaXQgd2lsbCBnaXZlIHVzIHRoZSByZWxhdGl2ZVxuICAgICAgICAvLyB0aW1lIHNpbmNlIHRoZSB2aWV3ZXIgaW5pdGlhbGl6ZWQgdGhlIHRpbWVyKVxuICAgICAgICB0aGlzLnRpY2soVGlja0xhYmVsLkZJUlNUX1ZJRVdQT1JUX1JFQURZKTtcbiAgICAgICAgdGhpcy5wcmVyZW5kZXJDb21wbGV0ZV8odGhpcy53aW4ucGVyZm9ybWFuY2Uubm93KCkgLSBkb2NWaXNpYmxlVGltZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHJlc291cmNlcyBpbiB2aWV3cG9ydFxuICAgKiBoYXZlIGJlZW4gZmluaXNoZWQgYmVpbmcgbGFpZCBvdXQuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgd2hlblZpZXdwb3J0TGF5b3V0Q29tcGxldGVfKCkge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc18ud2hlbkZpcnN0UGFzcygpLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3Qge2RvY3VtZW50RWxlbWVudH0gPSB0aGlzLndpbi5kb2N1bWVudDtcbiAgICAgIGNvbnN0IHNpemUgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyhkb2N1bWVudEVsZW1lbnQpLmdldFNpemUoKTtcbiAgICAgIGNvbnN0IHJlY3QgPSBsYXlvdXRSZWN0THR3aCgwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgICByZXR1cm4gd2hlbkNvbnRlbnRJbmlMb2FkKFxuICAgICAgICBkb2N1bWVudEVsZW1lbnQsXG4gICAgICAgIHRoaXMud2luLFxuICAgICAgICByZWN0LFxuICAgICAgICAvKiBpc0luUHJlcmVuZGVyICovIHRydWVcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGlja3MgYSB0aW1pbmcgZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7VGlja0xhYmVsfSBsYWJlbCBUaGUgdmFyaWFibGUgbmFtZSBhcyBpdCB3aWxsIGJlIHJlcG9ydGVkLlxuICAgKiAgICAgU2VlIFRJQ0tFVkVOVFMubWQgZm9yIGF2YWlsYWJsZSBtZXRyaWNzLCBhbmQgZWRpdCB0aGlzIGZpbGVcbiAgICogICAgIHdoZW4gYWRkaW5nIGEgbmV3IG1ldHJpYy5cbiAgICogQHBhcmFtIHtudW1iZXI9fSBvcHRfZGVsdGEgVGhlIGRlbHRhLiBDYWxsIHRpY2tEZWx0YSBpbnN0ZWFkIG9mIHNldHRpbmdcbiAgICogICAgIHRoaXMgZGlyZWN0bHkuXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X3ZhbHVlIFRoZSB2YWx1ZSB0byB1c2UuIE92ZXJyaWRlcyBkZWZhdWx0IGNhbGN1bGF0aW9uLlxuICAgKi9cbiAgdGljayhsYWJlbCwgb3B0X2RlbHRhLCBvcHRfdmFsdWUpIHtcbiAgICBkZXZBc3NlcnQoXG4gICAgICBvcHRfZGVsdGEgPT0gdW5kZWZpbmVkIHx8IG9wdF92YWx1ZSA9PSB1bmRlZmluZWQsXG4gICAgICAnWW91IG1heSBub3Qgc2V0IGJvdGggb3B0X2RlbHRhIGFuZCBvcHRfdmFsdWUuJ1xuICAgICk7XG5cbiAgICBjb25zdCBkYXRhID0gZGljdCh7J2xhYmVsJzogbGFiZWx9KTtcbiAgICBsZXQgZGVsdGE7XG5cbiAgICBpZiAob3B0X2RlbHRhICE9IHVuZGVmaW5lZCkge1xuICAgICAgZGF0YVsnZGVsdGEnXSA9IGRlbHRhID0gTWF0aC5tYXgob3B0X2RlbHRhLCAwKTtcbiAgICB9IGVsc2UgaWYgKG9wdF92YWx1ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGRhdGFbJ3ZhbHVlJ10gPSBvcHRfdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE1hcmtpbmcgb25seSBtYWtlcyBzZW5zZSBmb3Igbm9uLW92ZXJyaWRkZW4gdmFsdWVzIChhbmQgbm8gZGVsdGFzKS5cbiAgICAgIHRoaXMubWFyayhsYWJlbCk7XG4gICAgICBkZWx0YSA9IHRoaXMud2luLnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgZGF0YVsndmFsdWUnXSA9IHRoaXMudGltZU9yaWdpbl8gKyBkZWx0YTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IGV2ZW50cy4gVXNlZCBieSBgYW1wIHBlcmZvcm1hbmNlYC5cbiAgICB0aGlzLndpbi5kaXNwYXRjaEV2ZW50KFxuICAgICAgY3JlYXRlQ3VzdG9tRXZlbnQoXG4gICAgICAgIHRoaXMud2luLFxuICAgICAgICAncGVyZicsXG4gICAgICAgIC8qKiBAdHlwZSB7SnNvbk9iamVjdH0gKi8gKHtsYWJlbCwgZGVsdGF9KVxuICAgICAgKVxuICAgICk7XG5cbiAgICBpZiAodGhpcy5pc01lc3NhZ2luZ1JlYWR5XyAmJiB0aGlzLmlzUGVyZm9ybWFuY2VUcmFja2luZ09uXykge1xuICAgICAgdGhpcy52aWV3ZXJfLnNlbmRNZXNzYWdlKCd0aWNrJywgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucXVldWVUaWNrXyhkYXRhKTtcbiAgICB9XG5cbiAgICB0aGlzLm1ldHJpY3NfLnNpZ25hbChsYWJlbCwgZGVsdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBicm93c2VyIHBlcmZvcm1hbmNlIHRpbWVsaW5lIGVudHJpZXMgZm9yIHNpbXBsZSB0aWNrcy5cbiAgICogVGhlc2UgYXJlIGZvciBleGFtcGxlIGV4cG9zZWQgaW4gV1BULlxuICAgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1BlcmZvcm1hbmNlL21hcmtcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsXG4gICAqL1xuICBtYXJrKGxhYmVsKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy53aW4ucGVyZm9ybWFuY2UgJiZcbiAgICAgIHRoaXMud2luLnBlcmZvcm1hbmNlLm1hcmsgJiZcbiAgICAgIGFyZ3VtZW50cy5sZW5ndGggPT0gMVxuICAgICkge1xuICAgICAgdGhpcy53aW4ucGVyZm9ybWFuY2UubWFyayhsYWJlbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRpY2sgYSB2ZXJ5IHNwZWNpZmljIHZhbHVlIGZvciB0aGUgbGFiZWwuIFVzZSB0aGlzIG1ldGhvZCBpZiB5b3VcbiAgICogbWVhc3VyZSB0aGUgdGltZSBpdCB0b29rIHRvIGRvIHNvbWV0aGluZyB5b3Vyc2VsZi5cbiAgICogQHBhcmFtIHtUaWNrTGFiZWx9IGxhYmVsIFRoZSB2YXJpYWJsZSBuYW1lIGFzIGl0IHdpbGwgYmUgcmVwb3J0ZWQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgdmFsdWUgaW4gbWlsbGlzZWNvbmRzIHRoYXQgc2hvdWxkIGJlIHRpY2tlZC5cbiAgICovXG4gIHRpY2tEZWx0YShsYWJlbCwgdmFsdWUpIHtcbiAgICB0aGlzLnRpY2sobGFiZWwsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaWNrIHRpbWUgZGVsdGEgc2luY2UgdGhlIGRvY3VtZW50IGhhcyBiZWNvbWUgdmlzaWJsZS5cbiAgICogQHBhcmFtIHtUaWNrTGFiZWx9IGxhYmVsIFRoZSB2YXJpYWJsZSBuYW1lIGFzIGl0IHdpbGwgYmUgcmVwb3J0ZWQuXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2RlbHRhIFRoZSBvcHRpb25hbCBkZWx0YSB2YWx1ZSBpbiBtaWxsaXNlY29uZHMuXG4gICAqL1xuICB0aWNrU2luY2VWaXNpYmxlKGxhYmVsLCBvcHRfZGVsdGEpIHtcbiAgICBjb25zdCBkZWx0YSA9XG4gICAgICBvcHRfZGVsdGEgPT0gdW5kZWZpbmVkID8gdGhpcy53aW4ucGVyZm9ybWFuY2Uubm93KCkgOiBvcHRfZGVsdGE7XG4gICAgY29uc3QgZW5kID0gdGhpcy50aW1lT3JpZ2luXyArIGRlbHRhO1xuXG4gICAgLy8gSWYgb24gT3JpZ2luLCB1c2UgdGltZU9yaWdpblxuICAgIC8vIElmIGluIGEgdmlld2VyLCB1c2UgZmlyc3RWaXNpYmxlVGltZVxuICAgIGNvbnN0IHZpc2libGVUaW1lID0gdGhpcy52aWV3ZXJfPy5pc0VtYmVkZGVkKClcbiAgICAgID8gdGhpcy5hbXBkb2NfPy5nZXRGaXJzdFZpc2libGVUaW1lKClcbiAgICAgIDogdGhpcy50aW1lT3JpZ2luXztcbiAgICBjb25zdCB2ID0gdmlzaWJsZVRpbWUgPyBNYXRoLm1heChlbmQgLSB2aXNpYmxlVGltZSwgMCkgOiAwO1xuICAgIHRoaXMudGlja0RlbHRhKGxhYmVsLCB2KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc2sgdGhlIHZpZXdlciB0byBmbHVzaCB0aGUgdGlja3NcbiAgICovXG4gIGZsdXNoKCkge1xuICAgIGlmICh0aGlzLmlzTWVzc2FnaW5nUmVhZHlfICYmIHRoaXMuaXNQZXJmb3JtYW5jZVRyYWNraW5nT25fKSB7XG4gICAgICBpZiAodGhpcy5hbXBleHBfID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5hbXBleHBfID0gT2JqZWN0LmtleXModGhpcy5lbmFibGVkRXhwZXJpbWVudHNfKS5qb2luKCcsJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnZpZXdlcl8uc2VuZE1lc3NhZ2UoXG4gICAgICAgICdzZW5kQ3NpJyxcbiAgICAgICAgZGljdCh7XG4gICAgICAgICAgJ2FtcGV4cCc6IHRoaXMuYW1wZXhwXyxcbiAgICAgICAgICAnY2Fub25pY2FsVXJsJzogdGhpcy5kb2N1bWVudEluZm9fLmNhbm9uaWNhbFVybCxcbiAgICAgICAgfSksXG4gICAgICAgIC8qIGNhbmNlbFVuc2VudCAqLyB0cnVlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGbHVzaCB3aXRoIGEgcmF0ZSBsaW1pdCBvZiAxMCBwZXIgc2Vjb25kLlxuICAgKi9cbiAgdGhyb3R0bGVkRmx1c2goKSB7XG4gICAgaWYgKCF0aGlzLnRocm90dGxlZEZsdXNoXykge1xuICAgICAgLyoqIEBwcml2YXRlIHtmdW5jdGlvbigpfSAqL1xuICAgICAgdGhpcy50aHJvdHRsZWRGbHVzaF8gPSB0aHJvdHRsZSh0aGlzLndpbiwgdGhpcy5mbHVzaC5iaW5kKHRoaXMpLCAxMDApO1xuICAgIH1cbiAgICB0aGlzLnRocm90dGxlZEZsdXNoXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHBlcmltZW50SWRcbiAgICovXG4gIGFkZEVuYWJsZWRFeHBlcmltZW50KGV4cGVyaW1lbnRJZCkge1xuICAgIHRoaXMuZW5hYmxlZEV4cGVyaW1lbnRzX1tleHBlcmltZW50SWRdID0gdHJ1ZTtcbiAgICB0aGlzLmFtcGV4cF8gPSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogUXVldWVzIHRoZSBldmVudHMgdG8gYmUgZmx1c2hlZCB3aGVuIHRpY2sgZnVuY3Rpb24gaXMgc2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge1RpY2tFdmVudERlZn0gZGF0YSBUaWNrIGRhdGEgdG8gYmUgcXVldWVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcXVldWVUaWNrXyhkYXRhKSB7XG4gICAgLy8gU3RhcnQgZHJvcHBpbmcgdGhlIGhlYWQgb2YgdGhlIHF1ZXVlIGlmIHdlJ3ZlIHJlYWNoZWQgdGhlIGxpbWl0XG4gICAgLy8gc28gdGhhdCB3ZSBkb24ndCB0YWtlIHVwIHRvbyBtdWNoIG1lbW9yeSBpbiB0aGUgcnVudGltZS5cbiAgICBpZiAodGhpcy5ldmVudHNfLmxlbmd0aCA+PSBRVUVVRV9MSU1JVCkge1xuICAgICAgdGhpcy5ldmVudHNfLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudHNfLnB1c2goZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogRm9yd2FyZHMgYWxsIHF1ZXVlZCB0aWNrcyB0byB0aGUgdmlld2VyIHRpY2sgbWV0aG9kLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZmx1c2hRdWV1ZWRUaWNrc18oKSB7XG4gICAgaWYgKCF0aGlzLnZpZXdlcl8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNQZXJmb3JtYW5jZVRyYWNraW5nT25fKSB7XG4gICAgICAvLyBkcm9wIGFsbCBxdWV1ZWQgdGlja3MgdG8gbm90IGxlYWtcbiAgICAgIHRoaXMuZXZlbnRzXy5sZW5ndGggPSAwO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzXy5mb3JFYWNoKCh0aWNrRXZlbnQpID0+IHtcbiAgICAgIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZSgndGljaycsIHRpY2tFdmVudCk7XG4gICAgfSk7XG4gICAgdGhpcy5ldmVudHNfLmxlbmd0aCA9IDA7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqL1xuICBwcmVyZW5kZXJDb21wbGV0ZV8odmFsdWUpIHtcbiAgICBpZiAodGhpcy52aWV3ZXJfKSB7XG4gICAgICB0aGlzLnZpZXdlcl8uc2VuZE1lc3NhZ2UoXG4gICAgICAgICdwcmVyZW5kZXJDb21wbGV0ZScsXG4gICAgICAgIGRpY3Qoeyd2YWx1ZSc6IHZhbHVlfSksXG4gICAgICAgIC8qIGNhbmNlbFVuc2VudCAqLyB0cnVlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZGVudGlmaWVzIGlmIHRoZSB2aWV3ZXIgaXMgYWJsZSB0byB0cmFjayBwZXJmb3JtYW5jZS4gSWYgdGhlIGRvY3VtZW50IGlzXG4gICAqIG5vdCBlbWJlZGRlZCwgdGhlcmUgaXMgbm8gbWVzc2FnaW5nIGNoYW5uZWwsIHNvIG5vIHBlcmZvcm1hbmNlIHRyYWNraW5nIGlzXG4gICAqIG5lZWRlZCBzaW5jZSB0aGVyZSBpcyBub2JvZHkgdG8gZm9yd2FyZCB0aGUgZXZlbnRzLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNQZXJmb3JtYW5jZVRyYWNraW5nT24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNQZXJmb3JtYW5jZVRyYWNraW5nT25fO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGEgcHJvbWlzZSBmb3IgdGljayBsYWJlbCwgcmVzb2x2ZWQgd2l0aCBtZXRyaWMuIFVzZWQgYnkgYW1wLWFuYWx5dGljc1xuICAgKlxuICAgKiBAcGFyYW0ge1RpY2tMYWJlbH0gbGFiZWxcbiAgICogQHJldHVybiB7IVByb21pc2U8dGltZT59XG4gICAqL1xuICBnZXRNZXRyaWMobGFiZWwpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzXy53aGVuU2lnbmFsKGxhYmVsKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsUGVyZm9ybWFuY2VTZXJ2aWNlKHdpbmRvdykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyKHdpbmRvdywgJ3BlcmZvcm1hbmNlJywgUGVyZm9ybWFuY2UpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gKiBAcmV0dXJuIHshUGVyZm9ybWFuY2V9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJmb3JtYW5jZUZvcih3aW5kb3cpIHtcbiAgcmV0dXJuIGdldFNlcnZpY2Uod2luZG93LCAncGVyZm9ybWFuY2UnKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/performance-impl.js