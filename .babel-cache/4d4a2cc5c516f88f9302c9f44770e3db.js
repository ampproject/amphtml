import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function Performance(win) {var _this = this;_classCallCheck(this, Performance);
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

    var supportedEntryTypes =
    (this.win.PerformanceObserver &&
    this.win.PerformanceObserver.supportedEntryTypes) ||
    [];

    // If Paint Timing API is not supported, cannot determine first contentful paint
    if (!supportedEntryTypes.includes('paint')) {
      this.metrics_.rejectSignal(
      TickLabel.FIRST_CONTENTFUL_PAINT,
      dev().createExpectedError('First Contentful Paint not supported'));

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
      dev().createExpectedError('Cumulative Layout Shift not supported'));

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
      dev().createExpectedError('First Input Delay not supported'));

    }

    /**
     * Whether the user agent supports the Largest Contentful Paint metric.
     *
     * @private {boolean}
     */
    this.supportsLargestContentfulPaint_ = supportedEntryTypes.includes(
    'largest-contentful-paint');


    if (!this.supportsLargestContentfulPaint_) {
      this.metrics_.rejectSignal(
      TickLabel.LARGEST_CONTENTFUL_PAINT,
      dev().createExpectedError('Largest Contentful Paint not supported'));

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
    whenDocumentComplete(win.document).then(function () {return _this.onload_();});
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
   */_createClass(Performance, [{ key: "coreServicesAvailable", value:
    function coreServicesAvailable() {var _this2 = this;
      var documentElement = this.win.document.documentElement;
      this.ampdoc_ = Services.ampdoc(documentElement);
      this.viewer_ = Services.viewerForDoc(documentElement);
      this.resources_ = Services.resourcesForDoc(documentElement);
      this.documentInfo_ = Services.documentInfoForDoc(this.ampdoc_);

      this.isPerformanceTrackingOn_ =
      this.viewer_.isEmbedded() && this.viewer_.getParam('csi') === '1';

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

      var registerVisibilityChangeListener =
      this.supportsLargestContentfulPaint_ || this.supportsLayoutShift_;
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

      return channelPromise.
      then(function () {
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
      }).
      then(function () {
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
     */ }, { key: "maybeAddStoryExperimentId_", value:
    function maybeAddStoryExperimentId_() {var _this3 = this;
      var ampdoc = Services.ampdocServiceFor(this.win).getSingleDoc();
      return isStoryDocument(ampdoc).then(function (isStory) {
        if (isStory) {
          _this3.addEnabledExperiment('story');
        }
      });
    }

    /**
     * Callback for onload.
     */ }, { key: "onload_", value:
    function onload_() {
      this.tick(TickLabel.ON_LOAD);
      this.tickLegacyFirstPaintTime_();
      this.flush();
    }

    /**
     * Reports performance metrics first paint, first contentful paint,
     * and first input delay.
     * See https://github.com/WICG/paint-timing
     */ }, { key: "registerPerformanceObserver_", value:
    function registerPerformanceObserver_() {var _this4 = this;
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
        } else if (
        entry.name == 'first-contentful-paint' &&
        !recordedFirstContentfulPaint)
        {
          var value = entry.startTime + entry.duration;
          _this4.tickDelta(TickLabel.FIRST_CONTENTFUL_PAINT, value);
          _this4.tickSinceVisible(TickLabel.FIRST_CONTENTFUL_PAINT_VISIBLE, value);
          recordedFirstContentfulPaint = true;
        } else if (
        entry.entryType === 'first-input' &&
        !recordedFirstInputDelay)
        {
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
          [
          'domComplete',
          'domContentLoadedEventEnd',
          'domContentLoadedEventStart',
          'domInteractive',
          'loadEventEnd',
          'loadEventStart',
          'requestStart',
          'responseStart'].
          forEach(function (label) {return _this4.tick(label, entry[label]);});
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
          buffered: true });

      }

      if (this.supportsLayoutShift_) {
        this.createPerformanceObserver_(processEntry, {
          type: 'layout-shift',
          buffered: true });

      }

      if (this.supportsLargestContentfulPaint_) {
        // lcpObserver
        this.createPerformanceObserver_(processEntry, {
          type: 'largest-contentful-paint',
          buffered: true });

      }

      if (this.supportsNavigation_) {
        // Wrap in a try statement as there are some browsers (ex. chrome 73)
        // that will say it supports navigation but throws.
        this.createPerformanceObserver_(processEntry, {
          type: 'navigation',
          buffered: true });

      }

      if (entryTypesToObserve.length > 0) {
        this.createPerformanceObserver_(processEntry, {
          entryTypes: entryTypesToObserve });

      }
    }

    /**
     * @param {function(!PerformanceEntry)} processEntry
     * @param {!PerformanceObserverInit} init
     * @return {!PerformanceObserver}
     * @private
     */ }, { key: "createPerformanceObserver_", value:
    function createPerformanceObserver_(processEntry, init) {var _this5 = this;
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
     */ }, { key: "registerFirstInputDelayPolyfillListener_", value:
    function registerFirstInputDelayPolyfillListener_() {var _this6 = this;
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
     */ }, { key: "onAmpDocVisibilityChange_", value:
    function onAmpDocVisibilityChange_() {
      var state = this.ampdoc_.getVisibilityState();
      if (
      state === VisibilityState.INACTIVE ||
      state === VisibilityState.HIDDEN)
      {
        this.tickCumulativeMetrics_();
      }
    }

    /**
     * Tick the metrics whose values change over time.
     * @private
     */ }, { key: "tickCumulativeMetrics_", value:
    function tickCumulativeMetrics_() {
      if (this.supportsLayoutShift_) {
        if (!this.googleFontExpRecorded_) {
          this.googleFontExpRecorded_ = true;
          var win = this.win;
          var googleFontExp = parseInt(
          computedStyle(win, win.document.body).getPropertyValue(
          '--google-font-exp'),

          10);

          if (googleFontExp >= 0) {
            this.addEnabledExperiment("google-font-exp=".concat(googleFontExp));
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
     */ }, { key: "tickLayoutShiftScore_", value:
    function tickLayoutShiftScore_() {var _this$metrics_$get, _this$metrics_$get2;
      var cls = this.layoutShifts_.reduce(function (sum, entry) {return sum + entry.value;}, 0);
      var fcp = (_this$metrics_$get = this.metrics_.get(TickLabel.FIRST_CONTENTFUL_PAINT)) !== null && _this$metrics_$get !== void 0 ? _this$metrics_$get : 0; // fallback to 0, so that we never overcount.
      var ofv = (_this$metrics_$get2 = this.metrics_.get(TickLabel.ON_FIRST_VISIBLE)) !== null && _this$metrics_$get2 !== void 0 ? _this$metrics_$get2 : 0;

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
        this.tickDelta(
        TickLabel.CUMULATIVE_LAYOUT_SHIFT_BEFORE_FCP,
        clsBeforeFCP);

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
     */ }, { key: "tickLegacyFirstPaintTime_", value:
    function tickLegacyFirstPaintTime_() {
      // Detect deprecated first paint time API
      // https://bugs.chromium.org/p/chromium/issues/detail?id=621512
      // We'll use this until something better is available.
      if (
      !this.win.PerformancePaintTiming &&
      this.win.chrome &&
      typeof this.win.chrome.loadTimes == 'function')
      {
        var fpTime =
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
     */ }, { key: "tickLargestContentfulPaint_", value:
    function tickLargestContentfulPaint_() {
      if (this.largestContentfulPaint_ == null) {
        return;
      }

      this.tickDelta(
      TickLabel.LARGEST_CONTENTFUL_PAINT,
      this.largestContentfulPaint_);

      this.tickSinceVisible(
      TickLabel.LARGEST_CONTENTFUL_PAINT_VISIBLE,
      this.largestContentfulPaint_);

      this.flush();
    }

    /**
     * Measure the delay the user perceives of how long it takes
     * to load the initial viewport.
     * @private
     */ }, { key: "measureUserPerceivedVisualCompletenessTime_", value:
    function measureUserPerceivedVisualCompletenessTime_() {var _this7 = this;
      var didStartInPrerender = !this.ampdoc_.hasBeenVisible();

      var docVisibleTime = -1;
      this.ampdoc_.whenFirstVisible().then(function () {
        docVisibleTime = _this7.win.performance.now();
        // Mark this first visible instance in the browser timeline.
        _this7.mark('visible');
      });

      this.whenViewportLayoutComplete_().then(function () {
        if (didStartInPrerender) {
          var userPerceivedVisualCompletenesssTime =
          docVisibleTime > -1 ?
          _this7.win.performance.now() - docVisibleTime :
          //  Prerender was complete before visibility.
          0;
          _this7.ampdoc_.whenFirstVisible().then(function () {
            // We only tick this if the page eventually becomes visible,
            // since otherwise we heavily skew the metric towards the
            // 0 case, since pre-renders that are never used are highly
            // likely to fully load before they are never used :)
            _this7.tickDelta(
            TickLabel.FIRST_VIEWPORT_READY,
            userPerceivedVisualCompletenesssTime);

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
     */ }, { key: "whenViewportLayoutComplete_", value:
    function whenViewportLayoutComplete_() {var _this8 = this;
      return this.resources_.whenFirstPass().then(function () {
        var documentElement = _this8.win.document.documentElement;
        var size = Services.viewportForDoc(documentElement).getSize();
        var rect = layoutRectLtwh(0, 0, size.width, size.height);
        return whenContentIniLoad(
        documentElement,
        _this8.win,
        rect,
        /* isInPrerender */true);

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
     */ }, { key: "tick", value:
    function tick(label, opt_delta, opt_value) {
      devAssert(
      opt_delta == undefined || opt_value == undefined);



      var data = dict({ 'label': label });
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
      this.win.dispatchEvent(
      createCustomEvent(
      this.win,
      'perf',
      /** @type {JsonObject} */({ label: label, delta: delta })));



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
     */ }, { key: "mark", value:
    function mark(label) {
      if (
      this.win.performance &&
      this.win.performance.mark &&
      arguments.length == 1)
      {
        this.win.performance.mark(label);
      }
    }

    /**
     * Tick a very specific value for the label. Use this method if you
     * measure the time it took to do something yourself.
     * @param {TickLabel} label The variable name as it will be reported.
     * @param {number} value The value in milliseconds that should be ticked.
     */ }, { key: "tickDelta", value:
    function tickDelta(label, value) {
      this.tick(label, value);
    }

    /**
     * Tick time delta since the document has become visible.
     * @param {TickLabel} label The variable name as it will be reported.
     * @param {number=} opt_delta The optional delta value in milliseconds.
     */ }, { key: "tickSinceVisible", value:
    function tickSinceVisible(label, opt_delta) {var _this$viewer_, _this$ampdoc_;
      var delta =
      opt_delta == undefined ? this.win.performance.now() : opt_delta;
      var end = this.timeOrigin_ + delta;

      // If on Origin, use timeOrigin
      // If in a viewer, use firstVisibleTime
      var visibleTime = ((_this$viewer_ = this.viewer_) !== null && _this$viewer_ !== void 0) && _this$viewer_.isEmbedded() ? ((_this$ampdoc_ =
      this.ampdoc_) === null || _this$ampdoc_ === void 0) ? (void 0) : _this$ampdoc_.getFirstVisibleTime() :
      this.timeOrigin_;
      var v = visibleTime ? Math.max(end - visibleTime, 0) : 0;
      this.tickDelta(label, v);
    }

    /**
     * Ask the viewer to flush the ticks
     */ }, { key: "flush", value:
    function flush() {
      if (this.isMessagingReady_ && this.isPerformanceTrackingOn_) {
        if (this.ampexp_ == null) {
          this.ampexp_ = Object.keys(this.enabledExperiments_).join(',');
        }
        this.viewer_.sendMessage(
        'sendCsi',
        dict({
          'ampexp': this.ampexp_,
          'canonicalUrl': this.documentInfo_.canonicalUrl }),

        /* cancelUnsent */true);

      }
    }

    /**
     * Flush with a rate limit of 10 per second.
     */ }, { key: "throttledFlush", value:
    function throttledFlush() {
      if (!this.throttledFlush_) {
        /** @private {function()} */
        this.throttledFlush_ = throttle(this.win, this.flush.bind(this), 100);
      }
      this.throttledFlush_();
    }

    /**
     * @param {string} experimentId
     */ }, { key: "addEnabledExperiment", value:
    function addEnabledExperiment(experimentId) {
      this.enabledExperiments_[experimentId] = true;
      this.ampexp_ = undefined;
    }

    /**
     * Queues the events to be flushed when tick function is set.
     *
     * @param {TickEventDef} data Tick data to be queued.
     * @private
     */ }, { key: "queueTick_", value:
    function queueTick_(data) {
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
     */ }, { key: "flushQueuedTicks_", value:
    function flushQueuedTicks_() {var _this9 = this;
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
     */ }, { key: "prerenderComplete_", value:
    function prerenderComplete_(value) {
      if (this.viewer_) {
        this.viewer_.sendMessage(
        'prerenderComplete',
        dict({ 'value': value }),
        /* cancelUnsent */true);

      }
    }

    /**
     * Identifies if the viewer is able to track performance. If the document is
     * not embedded, there is no messaging channel, so no performance tracking is
     * needed since there is nobody to forward the events.
     * @return {boolean}
     */ }, { key: "isPerformanceTrackingOn", value:
    function isPerformanceTrackingOn() {
      return this.isPerformanceTrackingOn_;
    }

    /**
     * Retrieve a promise for tick label, resolved with metric. Used by amp-analytics
     *
     * @param {TickLabel} label
     * @return {!Promise<time>}
     */ }, { key: "getMetric", value:
    function getMetric(label) {
      return this.metrics_.whenSignal(label);
    } }]);return Performance;}();


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
// /Users/mszylkowski/src/amphtml/src/service/performance-impl.js