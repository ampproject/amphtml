import {TickLabel_Enum} from '#core/constants/enums';
import {lastChildElement, matches} from '#core/dom/query';
import {toArray} from '#core/types/array';

import {Services} from '#service';

import {MEDIA_LOAD_FAILURE_SRC_PROPERTY, listen} from '#utils/event-helper';
import {dev} from '#utils/log';

import {registerServiceBuilder} from '../../../src/service-helpers';

/**
 * Media status.
 * @enum
 */
const Status = {
  ERRORED: 0,
  PAUSED: 1,
  PLAYING: 2,
  WAITING: 3,
};

/**
 * Cache serving status.
 * @enum
 */
const CacheState = {
  ORIGIN: 0, // Served from origin.
  ORIGIN_CACHE_MISS: 1, // Served from origin even though cache URL was present.
  CACHE: 2, // Served from cache.
};

/**
 * Video is first page status.
 * @enum
 */
const FirstPageState = {
  NOT_ON_FIRST_PAGE: 0, // Video is not on the first page.
  ON_FIRST_PAGE: 1, // Video is on the first page.
};

/**
 * @typedef {{
 *   start: number,
 *   playing: number,
 *   waiting: number,
 * }}
 */
let TimeStampsDef;

/**
 * @typedef {{
 *   error: ?number,
 *   jointLatency: number,
 *   rebuffers: number,
 *   rebufferTime: number,
 *   watchTime: number
 * }}
 */
let MetricsDef;

/**
 * @typedef {{
 *   media: !HTMLMediaElement,
 *   status: number,
 *   unlisteners: !Array<!UnlistenDef>,
 *   timeStamps: !TimeStampsDef,
 *   metrics: !MetricsDef
 * }}
 */
let MediaEntryDef;

/** @type {number} */
const MINIMUM_TIME_THRESHOLD_MS = 1000;

/** @type {number} */
const REBUFFER_THRESHOLD_MS = 250;

/** @type {string} */
const TAG = 'media-performance-metrics';

/**
 * Util function to retrieve the media performance metrics service. Ensures we
 * can retrieve the service synchronously from the amp-story codebase without
 * running into race conditions.
 * @param  {!Window} win
 * @return {!MediaPerformanceMetricsService}
 */
export const getMediaPerformanceMetricsService = (win) => {
  let service = Services.mediaPerformanceMetricsService(win);

  if (!service) {
    service = new MediaPerformanceMetricsService(win);
    registerServiceBuilder(win, 'media-performance-metrics', function () {
      return service;
    });
  }

  return service;
};

/**
 * Media performance metrics service.
 * @final
 */
export class MediaPerformanceMetricsService {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!WeakMap<HTMLMediaElement|EventTarget|null, !MediaEntryDef>} */
    this.mediaMap_ = new WeakMap();

    /** @private @const {!../../../src/service/performance-impl.Performance} */
    this.performanceService_ = Services.performanceFor(win);
  }

  /**
   * Identifies if the viewer is able to track performance. If the document is
   * not embedded, there is no messaging channel, so no performance tracking is
   * needed since there is nobody to forward the events.
   * @return {boolean}
   */
  isPerformanceTrackingOn() {
    return this.performanceService_.isPerformanceTrackingOn();
  }

  /**
   * Starts recording performance metrics for a a given HTMLMediaElement. This
   * method has to be called right before trying to play the media. This allows
   * to reliably record joint latency (time to play), as well initial buffering.
   * @param {!HTMLMediaElement} media
   */
  startMeasuring(media) {
    // Media must start paused in order to determine the joint latency, and
    // initial buffering, if any.
    if (!media.paused) {
      dev().expectedError(TAG, 'media must start paused');
      return;
    }

    const unlisteners = this.listen_(media);
    const mediaEntry = this.getNewMediaEntry_(media, unlisteners);
    this.mediaMap_.set(media, mediaEntry);

    // Checks if the media already errored (eg: could have failed the source
    // selection).
    if (
      media.error ||
      media[MEDIA_LOAD_FAILURE_SRC_PROPERTY] === media.currentSrc
    ) {
      mediaEntry.metrics.error = media.error ? media.error.code : 0;
      mediaEntry.status = Status.ERRORED;
    }
  }

  /**
   * Stops recording, computes, and sends performance metrics collected for the
   * given media element.
   * @param {!HTMLMediaElement} media
   * @param {boolean=} sendMetrics
   */
  stopMeasuring(media, sendMetrics = true) {
    const mediaEntry = this.mediaMap_.get(media);

    if (!mediaEntry) {
      return;
    }

    mediaEntry.unlisteners.forEach((unlisten) => unlisten());
    this.mediaMap_.delete(media);

    switch (mediaEntry.status) {
      case Status.PLAYING:
        this.addWatchTime_(mediaEntry);
        break;
      case Status.WAITING:
        this.addRebuffer_(mediaEntry);
        break;
    }

    if (sendMetrics) {
      this.sendMetrics_(mediaEntry);
    }
  }

  /**
   * @param {!MediaEntryDef} mediaEntry
   * @private
   */
  sendMetrics_(mediaEntry) {
    const {media, metrics} = mediaEntry;

    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_CACHE_STATE,
      this.getVideoCacheState_(media)
    );
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_ON_FIRST_PAGE,
      matches(media, `amp-story-page:first-of-type ${media.tagName}`)
        ? FirstPageState.ON_FIRST_PAGE
        : FirstPageState.NOT_ON_FIRST_PAGE
    );

    // If the media errored.
    if (metrics.error !== null) {
      this.performanceService_.tickDelta(
        TickLabel_Enum.VIDEO_ERROR,
        metrics.error || 0
      );
      this.performanceService_.flush();
      return;
    }

    // If the user was on the video for less than one second, ignore the metrics
    // (eg: users tapping through a story, or scrolling through content).
    if (
      !metrics.jointLatency &&
      Date.now() - mediaEntry.timeStamps.start < MINIMUM_TIME_THRESHOLD_MS
    ) {
      return;
    }

    // If the playback did not start.
    if (!metrics.jointLatency) {
      this.performanceService_.tickDelta(
        TickLabel_Enum.VIDEO_ERROR,
        5 /* Custom error code */
      );
      this.performanceService_.flush();
      return;
    }

    const rebufferRate = Math.round(
      (metrics.rebufferTime / (metrics.rebufferTime + metrics.watchTime)) * 100
    );

    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_JOINT_LATENCY,
      metrics.jointLatency
    );
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_WATCH_TIME,
      metrics.watchTime
    );
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_REBUFFERS,
      metrics.rebuffers
    );
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_REBUFFER_RATE,
      rebufferRate
    );
    if (metrics.rebuffers) {
      this.performanceService_.tickDelta(
        TickLabel_Enum.VIDEO_MEAN_TIME_BETWEEN_REBUFFER,
        Math.round(metrics.watchTime / metrics.rebuffers)
      );
    }
    this.performanceService_.flush();
  }

  /**
   * @param {!HTMLMediaElement} media
   * @param {!Array<!UnlistenDef>} unlisteners
   * @return {!MediaEntryDef}
   * @private
   */
  getNewMediaEntry_(media, unlisteners) {
    return {
      media,
      status: Status.PAUSED,
      unlisteners,
      timeStamps: {
        start: Date.now(),
        playing: 0,
        waiting: 0,
      },
      metrics: {
        error: null,
        jointLatency: 0,
        meanTimeBetweenRebuffers: 0,
        rebuffers: 0,
        rebufferTime: 0,
        watchTime: 0,
      },
    };
  }

  /**
   * Increments the watch time with the duration from the last `playing` event.
   * @param {!MediaEntryDef} mediaEntry
   * @private
   */
  addWatchTime_(mediaEntry) {
    mediaEntry.metrics.watchTime += Date.now() - mediaEntry.timeStamps.playing;
  }

  /**
   * Increments the rebuffer time with the duration from the last `waiting`
   * event, and increments the rebuffers count.
   * @param {!MediaEntryDef} mediaEntry
   * @private
   */
  addRebuffer_(mediaEntry) {
    const rebufferTime = Date.now() - mediaEntry.timeStamps.waiting;
    if (rebufferTime > REBUFFER_THRESHOLD_MS) {
      mediaEntry.metrics.rebuffers++;
      mediaEntry.metrics.rebufferTime += rebufferTime;
    }
  }

  /**
   * @param {!HTMLMediaElement} media
   * @return {!Array<!UnlistenDef>}
   * @private
   */
  listen_(media) {
    const unlisteners = [
      listen(media, 'ended', this.onPauseOrEnded_.bind(this)),
      listen(media, 'pause', this.onPauseOrEnded_.bind(this)),
      listen(media, 'playing', this.onPlaying_.bind(this)),
      listen(media, 'waiting', this.onWaiting_.bind(this)),
    ];

    // If the media element has no `src`, it will try to load the sources in
    // document order. If the last source errors, then the media element
    // loading errored.
    let errorTarget = media;
    if (!media.hasAttribute('src')) {
      errorTarget = lastChildElement(
        media,
        (child) => child.tagName === 'SOURCE'
      );
    }
    unlisteners.push(
      listen(errorTarget || media, 'error', this.onError_.bind(this))
    );

    return unlisteners;
  }

  /**
   * @param {!Event} event
   * @private
   */
  onError_(event) {
    // Media error target could be either HTMLMediaElement or HTMLSourceElement.
    const media =
      event.target.tagName === 'SOURCE' ? event.target.parent : event.target;
    const mediaEntry = this.mediaMap_.get(media);

    mediaEntry.metrics.error = media.error ? media.error.code : 0;
    mediaEntry.status = Status.ERRORED;
  }

  /**
   * @param {!Event} event
   * @private
   */
  onPauseOrEnded_(event) {
    const mediaEntry = this.mediaMap_.get(event.target);

    if (mediaEntry.status === Status.PLAYING) {
      this.addWatchTime_(mediaEntry);
    }
    mediaEntry.status = Status.PAUSED;
  }

  /**
   * @param {!Event} event
   * @private
   */
  onPlaying_(event) {
    const mediaEntry = this.mediaMap_.get(event.target);
    const {metrics, timeStamps} = mediaEntry;

    if (!metrics.jointLatency) {
      metrics.jointLatency = Date.now() - timeStamps.start;
    }

    if (mediaEntry.status === Status.WAITING) {
      this.addRebuffer_(mediaEntry);
    }

    timeStamps.playing = Date.now();
    mediaEntry.status = Status.PLAYING;
  }

  /**
   * @param {!Event} event
   * @private
   */
  onWaiting_(event) {
    const mediaEntry = this.mediaMap_.get(event.target);
    const {timeStamps} = mediaEntry;

    if (mediaEntry.status === Status.PLAYING) {
      this.addWatchTime_(mediaEntry);
    }

    timeStamps.waiting = Date.now();
    mediaEntry.status = Status.WAITING;
  }

  /**
   * @param {!HTMLMediaElement} media
   * @return {!CacheState}
   * @private
   */
  getVideoCacheState_(media) {
    let hasCachedSource = false;
    // All video caching mechanisms rely on HTMLSourceElements and never a src
    // on the HTMLMediaElement as it does not allow for fallback sources.
    const sources = toArray(media.querySelectorAll('source'));
    for (const source of sources) {
      const isCachedSource = source.hasAttribute(
        'i-amphtml-video-cached-source'
      );
      // Playing source is cached.
      if (isCachedSource && media.currentSrc === source.src) {
        return CacheState.CACHE;
      }
      // Non playing source but is cached. Used to differentiate a cache miss
      // (e.g. cache returned a 40x) vs no cached source at all.
      if (isCachedSource) {
        hasCachedSource = true;
      }
    }
    return hasCachedSource ? CacheState.ORIGIN_CACHE_MISS : CacheState.ORIGIN;
  }
}
