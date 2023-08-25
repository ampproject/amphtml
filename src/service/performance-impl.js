import {TickLabel_Enum} from '#core/constants/enums';
import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Signals} from '#core/data-structures/signals';
import {whenDocumentComplete, whenDocumentReady} from '#core/document/ready';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {computedStyle} from '#core/dom/style';
import {debounce} from '#core/types/function';
import {map} from '#core/types/object';
import {base64UrlEncodeFromBytes} from '#core/types/string/base64';
import {getCryptoRandomBytesArray} from '#core/types/string/bytes';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {dev, devAssert} from '#utils/log';
import {isStoryDocument} from '#utils/story';

import {whenContentIniLoad} from '../ini-load';
import {getMode} from '../mode';
import {getService, registerServiceBuilder} from '../service-helpers';

/**
 * Maximum number of tick events we allow to accumulate in the performance
 * instance's queue before we start dropping those events and can no longer
 * be forwarded to the actual `tick` function when it is set.
 */
const QUEUE_LIMIT = 50;

const CLS_SESSION_GAP = 1000;
const CLS_SESSION_MAX = 5000;

const INP_REPORTING_THRESHOLD = 40;

const TAG = 'Performance';

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
 * @enum {number}
 */
export const ELEMENT_TYPE_ENUM = {
  other: 0,
  image: 1 << 0,
  video: 1 << 1,
  ad: 1 << 2,
  carousel: 1 << 3,
  bcarousel: 1 << 4,
  text: 1 << 5,
};

/**
 * @param {?Node} node
 * @return {ELEMENT_TYPE_ENUM}
 */
function getElementType(node) {
  if (node == null) {
    return ELEMENT_TYPE_ENUM.other;
  }
  const outer = getOutermostAmpElement(node);
  const {nodeName} = outer;
  if (nodeName === 'IMG' || nodeName === 'AMP-IMG') {
    return ELEMENT_TYPE_ENUM.image;
  }
  if (nodeName === 'VIDEO' || nodeName === 'AMP-VIDEO') {
    return ELEMENT_TYPE_ENUM.video;
  }
  if (nodeName === 'AMP-CAROUSEL') {
    return ELEMENT_TYPE_ENUM.carousel;
  }
  if (nodeName === 'AMP-BASE-CAROUSEL') {
    return ELEMENT_TYPE_ENUM.bcarousel;
  }
  if (nodeName === 'AMP-AD') {
    return ELEMENT_TYPE_ENUM.ad;
  }
  if (!nodeName.startsWith('AMP-') && outer.textContent) {
    return ELEMENT_TYPE_ENUM.text;
  }
  return ELEMENT_TYPE_ENUM.other;
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

    /** @const {string} */
    this.eventid_ = base64UrlEncodeFromBytes(
      getCryptoRandomBytesArray(win, 16)
    );

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

    /** @private {!{[key: string]: boolean}} */
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
     * The collection of layout shift events from the Layout Instability API,
     * used for normalized windowed sessions according to the latest CWV
     * implementation. This uses 5s max window with a 1s session gap as the
     * session size.
     * See https://github.com/GoogleChrome/web-vitals/blob/main/src/getCLS.ts
     * @private {Array<LayoutShift>}
     */
    this.layoutShiftEntries_ = [];

    /**
     * The sum of all layout shifts.
     * @private {number}
     */
    this.layoutShiftSum_ = 0;

    const supportedEntryTypes =
      (this.win.PerformanceObserver &&
        this.win.PerformanceObserver.supportedEntryTypes) ||
      [];

    // If Paint Timing API is not supported, cannot determine first contentful paint
    if (!supportedEntryTypes.includes('paint')) {
      this.metrics_.rejectSignal(
        TickLabel_Enum.FIRST_CONTENTFUL_PAINT,
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
      const e = dev().createExpectedError(
        'Cumulative Layout Shift not supported'
      );
      this.metrics_.rejectSignal(TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT, e);
      this.metrics_.rejectSignal(TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT_1, e);
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
        TickLabel_Enum.FIRST_INPUT_DELAY,
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
        TickLabel_Enum.LARGEST_CONTENTFUL_PAINT,
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
     * Whether the user agent supports the interaction to next paint metric.
     */
    this.supportsEvents_ =
      supportedEntryTypes.includes('event') &&
      isExperimentOn(win, 'interaction-to-next-paint');

    if (!this.supportsEvents_) {
      this.metrics_.rejectSignal(
        TickLabel_Enum.INTERACTION_TO_NEXT_PAINT,
        dev().createExpectedError('Interaction to next paint not supported')
      );
    }

    this.onAmpDocVisibilityChange_ = this.onAmpDocVisibilityChange_.bind(this);

    // Add RTV version as experiment ID, so we can slice the data by version.
    this.addEnabledExperiment('rtv-' + getMode(this.win).rtvVersion);

    // Tick document ready event.
    whenDocumentReady(win.document).then(() => {
      this.tick(TickLabel_Enum.DOCUMENT_READY);
      this.flush();
    });

    // Tick window.onload event.
    whenDocumentComplete(win.document).then(() => this.onload_());

    whenDocumentComplete(win.document).then(() =>
      this.tickInteractionToNextPaint_(INP_REPORTING_THRESHOLD)
    );
    this.registerPerformanceObserver_();

    /**
     * @private {boolean}
     */
    this.googleFontExpRecorded_ = false;

    /**
     * This is called to ensure we'll report the current cls window's value
     * after the window closes. Its debounce time is intentionally longer than
     * the max session time so that we're certain the sesssion has closed
     * (since a PerfOb is async, entries that belong in the current window may
     * arrive later).
     */
    this.debouncedFlushLayoutShiftScore_ = debounce(
      win,
      () => {
        this.flushLayoutShiftScore_();
      },
      CLS_SESSION_MAX + 1000
    );
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
    const channelPromise = this.viewer_.whenMessagingReady();

    this.ampdoc_.whenFirstVisible().then(() => {
      this.tick(TickLabel_Enum.ON_FIRST_VISIBLE);
      this.flush();
    });

    const registerVisibilityChangeListener =
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
      return Promise.resolve();
    }

    return channelPromise
      .then(() => {
        // Tick the "messaging ready" signal.
        this.tickDelta(
          TickLabel_Enum.MESSAGING_READY,
          this.win.performance.now()
        );

        // Tick timeOrigin so that epoch time can be calculated by consumers.
        this.tick(TickLabel_Enum.TIME_ORIGIN, undefined, this.timeOrigin_);

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
    this.tick(TickLabel_Enum.ON_LOAD);
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
        this.tickDelta(
          TickLabel_Enum.FIRST_PAINT,
          entry.startTime + entry.duration
        );
        recordedFirstPaint = true;
      } else if (
        entry.name == 'first-contentful-paint' &&
        !recordedFirstContentfulPaint
      ) {
        const value = entry.startTime + entry.duration;
        this.tickDelta(TickLabel_Enum.FIRST_CONTENTFUL_PAINT, value);
        this.tickSinceVisible(
          TickLabel_Enum.FIRST_CONTENTFUL_PAINT_VISIBLE,
          value
        );
        recordedFirstContentfulPaint = true;
      } else if (
        entry.entryType === 'first-input' &&
        !recordedFirstInputDelay
      ) {
        const value = entry.processingStart - entry.startTime;
        this.tickDelta(TickLabel_Enum.FIRST_INPUT_DELAY, value);
        recordedFirstInputDelay = true;
      } else if (entry.entryType === 'layout-shift') {
        // Ignore layout shift that occurs within 500ms of user input, as it is
        // likely in response to the user's action.
        if (!entry.hadRecentInput) {
          this.tickLayoutShiftScore_(entry);
          this.layoutShiftSum_ += entry.value;
        }
      } else if (entry.entryType === 'largest-contentful-paint') {
        this.tickLargestContentfulPaint_(entry);
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
      } else if (entry.entryType == 'event' && entry.interactionId) {
        this.tickInteractionToNextPaint_(entry.duration);
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

    if (this.supportsEvents_) {
      this.createPerformanceObserver_(processEntry, {
        type: 'event',
        durationThreshold: INP_REPORTING_THRESHOLD, // Minimim duration of 40ms, as implemented in Chrome web-vitals
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
   * Whether the AMP doc is hidden.
   * @return {boolean}
   */
  isVisibilityHidden_() {
    const state = this.ampdoc_.getVisibilityState();
    return (
      state === VisibilityState_Enum.INACTIVE ||
      state === VisibilityState_Enum.HIDDEN
    );
  }

  /**
   * When the viewer visibility state of the document changes to inactive or hidden,
   * send the layout score.
   * @private
   */
  onAmpDocVisibilityChange_() {
    if (this.isVisibilityHidden_()) {
      this.tickCumulativeMetrics_();
      this.flushLayoutShiftScore_();
    }
  }

  /** @private */
  recordGoogleFontExp_() {
    if (!this.googleFontExpRecorded_) {
      this.googleFontExpRecorded_ = true;
      const {win} = this;
      const googleFontExp = parseInt(
        computedStyle(win, win.document.body).getPropertyValue(
          '--google-font-exp'
        ),
        10
      );
      if (googleFontExp >= 0) {
        this.addEnabledExperiment(`google-font-exp=${googleFontExp}`);
      }
    }
  }

  /**
   * Tick the metrics whose values change over time.
   * @private
   */
  tickCumulativeMetrics_() {
    if (this.supportsLayoutShift_) {
      this.recordGoogleFontExp_();
      this.tickCumulativeLayoutShiftScore_();
    }
  }

  /**
   * Tick the layout shift metric, following the latest CWV standard. This uses
   * a 5s maximum window with a 1s gap between events to define a "session".
   * We report the maximum session value over the lifetime of the page as the CLS.
   *
   * @param {!LayoutShift} entry
   */
  tickLayoutShiftScore_(entry) {
    if (!this.ampdoc_) {
      return;
    }

    if (this.isVisibilityHidden_()) {
      return;
    }

    const entries = this.layoutShiftEntries_;
    if (entries.length > 0) {
      const first = entries[0];
      const last = entries[entries.length - 1];
      if (
        entry.startTime - last.startTime < CLS_SESSION_GAP &&
        entry.startTime - first.startTime < CLS_SESSION_MAX
      ) {
        // This entry continues the current CLS window.
        entries.push(entry);
        return;
      }
      // This entry is the start of a new CLS window, but we haven't flushed the old value yet.
      this.flushLayoutShiftScore_();
    }
    entries.push(entry);
    // Ensure we report the CLS when the session closes. We're not guaranteed
    // to get more LayoutShift entires, so we need some setTimeout magic to
    // ensure it happens.
    this.debouncedFlushLayoutShiftScore_();
  }

  /**
   * Records the normalized CLS score, following the latest CWV standard.
   * See https://web.dev/evolving-cls/
   */
  flushLayoutShiftScore_() {
    const entries = this.layoutShiftEntries_;
    const old = this.metrics_.get(TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT);
    let union = 0;
    let sum = 0;
    for (const entry of entries) {
      if (entry.sources) {
        for (const source of entry.sources) {
          union |= getElementType(source.node);
        }
      }
      sum += entry.value;
    }
    entries.length = 0;
    this.recordGoogleFontExp_();
    if (old == null || sum > old) {
      // We'll record the largest windowed CLS.
      this.metrics_.reset(TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT);
      this.metrics_.reset(TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT_TYPE_UNION);
      this.tickDelta(TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT, sum);
      this.tickDelta(TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT_TYPE_UNION, union);
      this.flush();
    }
  }

  /**
   * Record the interaction to next paint score.
   * @param {number=} duration
   */
  tickInteractionToNextPaint_(duration) {
    if (!this.ampdoc_) {
      return;
    }

    const old = this.metrics_.get(TickLabel_Enum.INTERACTION_TO_NEXT_PAINT);
    if (old == null || duration > old) {
      this.tickDelta(
        TickLabel_Enum.INTERACTION_TO_NEXT_PAINT,
        duration - (old ?? 0)
      );
      this.flush();
    }
  }

  /**
   * Tick the layout shift score metric.
   *
   * A value of the metric is recorded in under two names, `cls-1` and `cls-2`,
   * for the first two times the page transitions into a hidden lifecycle state
   * (when the page is navigated a way from, the tab is backgrounded for
   * another tab, or the user backgrounds the browser application).
   *
   * Since we can't reliably detect when a page session finally ends,
   * recording the value for these first two events should provide a fair
   * amount of visibility into this metric.
   */
  tickCumulativeLayoutShiftScore_() {
    if (this.shiftScoresTicked_ === 0) {
      this.tickDelta(
        TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT_1,
        this.layoutShiftSum_
      );
      this.flush();
      this.shiftScoresTicked_ = 1;
    } else if (this.shiftScoresTicked_ === 1) {
      this.tickDelta(
        TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT_2,
        this.layoutShiftSum_
      );
      this.flush();
      this.shiftScoresTicked_ = 2;
    }
  }

  /**
   * Tick the largest contentful paint metrics.
   * Uses entry.startTime, which equates to: `renderTime ?? loadTime`. We can't
   * always use one or the other because:
   * - loadTime is 0 for non-remote resources (text)
   * - renderTime is undefined for crossorigin resources
   *
   * @param {!LargestContentfulPaint} entry
   */
  tickLargestContentfulPaint_(entry) {
    const {element, startTime} = entry;
    const type = getElementType(element);

    this.tickDelta(TickLabel_Enum.LARGEST_CONTENTFUL_PAINT_TYPE, type);
    this.tickDelta(TickLabel_Enum.LARGEST_CONTENTFUL_PAINT, startTime);
    this.tickSinceVisible(
      TickLabel_Enum.LARGEST_CONTENTFUL_PAINT_VISIBLE,
      startTime
    );
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
            TickLabel_Enum.FIRST_VIEWPORT_READY,
            userPerceivedVisualCompletenesssTime
          );
        });
        this.prerenderComplete_(userPerceivedVisualCompletenesssTime);
        // Mark this instance in the browser timeline.
        this.mark(TickLabel_Enum.FIRST_VIEWPORT_READY);
      } else {
        // If it didnt start in prerender, no need to calculate anything
        // and we just need to tick `pc`. (it will give us the relative
        // time since the viewer initialized the timer)
        this.tick(TickLabel_Enum.FIRST_VIEWPORT_READY);
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
   * @param {TickLabel_Enum} label The variable name as it will be reported.
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

    const data = {'label': label};
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

    // Emit events. Used by `amp performance`.
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
    this.win.performance.mark?.(label);
  }

  /**
   * Tick a very specific value for the label. Use this method if you
   * measure the time it took to do something yourself.
   * @param {TickLabel_Enum} label The variable name as it will be reported.
   * @param {number} value The value in milliseconds that should be ticked.
   */
  tickDelta(label, value) {
    this.tick(label, value);
  }

  /**
   * Tick time delta since the document has become visible.
   * @param {TickLabel_Enum} label The variable name as it will be reported.
   * @param {number=} opt_delta The optional delta value in milliseconds.
   */
  tickSinceVisible(label, opt_delta) {
    const delta =
      opt_delta == undefined ? this.win.performance.now() : opt_delta;
    const end = this.timeOrigin_ + delta;

    // If on Origin, use timeOrigin
    // If in a viewer, use firstVisibleTime
    const visibleTime = this.viewer_?.isEmbedded()
      ? this.ampdoc_?.getFirstVisibleTime()
      : this.timeOrigin_;
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
        {
          'ampexp': this.ampexp_,
          'canonicalUrl': this.documentInfo_.canonicalUrl,
          'eventid': this.eventid_,
        },
        /* cancelUnsent */ true
      );
    }
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
        {'value': value},
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
   * @param {TickLabel_Enum} label
   * @return {!Promise<time>}
   */
  getMetric(label) {
    return this.metrics_.whenSignal(label);
  }
}

/**
 * Traverse node ancestors and return the highest level amp element.
 * Returns the given node if none are found.
 *
 * @param {!Node} node
 * @return {!Node}
 */
function getOutermostAmpElement(node) {
  let max = node;
  while ((node = node.parentNode) != null) {
    if (node.nodeName.startsWith('AMP-')) {
      max = node;
    }
  }
  return max;
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
