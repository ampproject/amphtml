import {MEDIA_LOAD_FAILURE_SRC_PROPERTY, listen} from '#utils/event-helper';
import {Services} from '#service';
import {TickLabel_Enum} from '#core/constants/enums';
import {dev} from '#utils/log';
import {lastChildElement, matches} from '#core/dom/query';
import {toArray} from '#core/types/array';
import {TimestampDef} from '#core/types/date';

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
 * @typedef {{
 *   playing: !TimestampDef,
 *   waiting: !TimestampDef,
 *   jointLatency: number,
 *   rebuffers: number,
 *   rebufferTime: number,
 *   watchTime: number,
 *   status: number,
 * }}
 */
let MediaEntryDef;

/** @type {number} */
const MINIMUM_TIME_THRESHOLD_MS = 1000;

/** @type {number} */
const REBUFFER_THRESHOLD_MS = 250;

/** @type {string} */
const TAG = 'media-performance-metrics';

export class MediaPerformanceTracker {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Array<!function(boolean)>} */
    this.stopFns_ = [];

    /** @private @const {!../../../src/service/performance-impl.Performance} */
    this.performanceService_ = Services.performanceFor(win);
  }

  /**
   * Starts recording performance metrics for a a given HTMLMediaElement. This
   * method has to be called right before trying to play the media. This allows
   * to reliably record joint latency (time to play), as well initial buffering.
   * @param {!HTMLMediaElement} media
   */
  track(media) {
    if (!this.performanceService_.isPerformanceTrackingOn()) {
      return;
    }

    // Media must start paused in order to determine the joint latency, and
    // initial buffering, if any.
    if (!media.paused) {
      dev().expectedError(TAG, 'media must start paused');
      return;
    }

    this.stopFns_.push(this.listen_(media));
  }

  /**
   * @param {boolean} sendMetrics
   */
  stop(sendMetrics) {
    while (this.stopFns_.length) {
      this.stopFns_.shift()(sendMetrics);
    }
  }

  /**
   * @param {!HTMLMediaElement} media
   * @param {!MediaEntryDef} mediaEntry
   * @param {!TimestampDef} started
   * @param {number=} errorCode
   * @private
   */
  sendMetrics_(media, mediaEntry, started, errorCode) {
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_CACHE_STATE,
      getVideoCacheState(media)
    );
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_ON_FIRST_PAGE,
      Number(matches(media, 'amp-story-page:first-of-type *'))
    );

    // If the media errored.
    if (errorCode != null) {
      this.performanceService_.tickDelta(TickLabel_Enum.VIDEO_ERROR, errorCode);
      this.performanceService_.flush();
      return;
    }

    // If the user was on the video for less than one second, ignore the metrics
    // (eg: users tapping through a story, or scrolling through content).
    if (
      !mediaEntry.jointLatency &&
      Date.now() - started < MINIMUM_TIME_THRESHOLD_MS
    ) {
      return;
    }

    // If the playback did not start.
    if (!mediaEntry.jointLatency) {
      this.performanceService_.tickDelta(
        TickLabel_Enum.VIDEO_ERROR,
        5 /* Custom error code */
      );
      this.performanceService_.flush();
      return;
    }

    const {rebuffers, watchTime} = mediaEntry;

    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_JOINT_LATENCY,
      mediaEntry.jointLatency
    );
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_WATCH_TIME,
      watchTime
    );
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_REBUFFERS,
      rebuffers
    );
    this.performanceService_.tickDelta(
      TickLabel_Enum.VIDEO_REBUFFER_RATE,
      Math.round(
        (mediaEntry.rebufferTime / (mediaEntry.rebufferTime + watchTime)) * 100
      )
    );
    if (rebuffers) {
      this.performanceService_.tickDelta(
        TickLabel_Enum.VIDEO_MEAN_TIME_BETWEEN_REBUFFER,
        Math.round(watchTime / rebuffers)
      );
    }
    this.performanceService_.flush();
  }

  /**
   * @param {!HTMLMediaElement} media
   * @return {function(boolean)}
   * @private
   */
  listen_(media) {
    const started = Date.now();
    const mediaEntry = {
      status: Status.PAUSED,
      playing: 0,
      waiting: 0,
      jointLatency: 0,
      rebuffers: 0,
      rebufferTime: 0,
      watchTime: 0,
    };

    let errorCode;
    const onError = () => {
      errorCode = (media.error && media.error.code) || 0;
      mediaEntry.status = Status.ERRORED;
    };

    // Checks if the media already errored (eg: could have failed the source
    // selection).
    if (
      media.error ||
      media[MEDIA_LOAD_FAILURE_SRC_PROPERTY] === media.currentSrc
    ) {
      onError();
    }

    // If the media element has no `src`, it will try to load the sources in
    // document order. If the last source errors, then the media element
    // loading errored.
    let errorTarget = media;
    if (!media.hasAttribute('src')) {
      errorTarget =
        lastChildElement(media, (child) => child.tagName === 'SOURCE') || media;
    }

    const unlisteners = [
      listen(media, 'ended', () => updateOnPauseOrEnded(mediaEntry)),
      listen(media, 'pause', () => updateOnPauseOrEnded(mediaEntry)),
      listen(media, 'playing', () => updateOnPlaying(mediaEntry, started)),
      listen(media, 'waiting', () => updateOnWaiting(mediaEntry)),
      listen(errorTarget, 'error', onError),
    ];

    const stop = (sendMetrics) => {
      unlisteners.forEach((unlisten) => unlisten());
      maybeAddWatchTime(mediaEntry);
      maybeAddRebuffer(mediaEntry);
      if (sendMetrics) {
        this.sendMetrics_(media, mediaEntry, started, errorCode);
      }
    };

    return stop;
  }
}

/**
 * Increments the watch time with the duration from the last `playing` event.
 * @param {!MediaEntryDef} mediaEntry
 */
function maybeAddWatchTime(mediaEntry) {
  if (mediaEntry.status === Status.PLAYING) {
    mediaEntry.watchTime += Date.now() - mediaEntry.playing;
  }
}

/**
 * Increments the rebuffer time with the duration from the last `waiting`
 * event, and increments the rebuffers count.
 * @param {!MediaEntryDef} mediaEntry
 */
function maybeAddRebuffer(mediaEntry) {
  if (mediaEntry.status === Status.WAITING) {
    const rebufferTime = Date.now() - mediaEntry.waiting;
    if (rebufferTime > REBUFFER_THRESHOLD_MS) {
      mediaEntry.rebuffers++;
      mediaEntry.rebufferTime += rebufferTime;
    }
  }
}

/**
 * @param {!MediaEntry} mediaEntry
 */
function updateOnPauseOrEnded(mediaEntry) {
  maybeAddWatchTime(mediaEntry);
  mediaEntry.status = Status.PAUSED;
}

/**
 * @param {!MediaEntryDef} mediaEntry
 * @param {!TimestampDef} started
 */
function updateOnPlaying(mediaEntry, started) {
  if (!mediaEntry.jointLatency) {
    mediaEntry.jointLatency = Date.now() - started;
  }
  maybeAddRebuffer(mediaEntry);
  mediaEntry.playing = Date.now();
  mediaEntry.status = Status.PLAYING;
}

/**
 * @param {!MediaEntryDef} mediaEntry
 */
function updateOnWaiting(mediaEntry) {
  maybeAddWatchTime(mediaEntry);
  mediaEntry.waiting = Date.now();
  mediaEntry.status = Status.WAITING;
}

/**
 * @param {!HTMLMediaElement} media
 * @return {!CacheState}
 */
function getVideoCacheState(media) {
  let hasCachedSource = false;
  // All video caching mechanisms rely on HTMLSourceElements and never a src
  // on the HTMLMediaElement as it does not allow for fallback sources.
  const sources = toArray(
    media.querySelectorAll('[i-amphtml-video-cached-source]')
  );
  for (const source of sources) {
    // Playing source is cached.
    if (media.currentSrc === source.src) {
      return CacheState.CACHE;
    }
    // Non playing source but is cached. Used to differentiate a cache miss
    // (e.g. cache returned a 40x) vs no cached source at all.
    hasCachedSource = true;
  }
  return hasCachedSource ? CacheState.ORIGIN_CACHE_MISS : CacheState.ORIGIN;
}
