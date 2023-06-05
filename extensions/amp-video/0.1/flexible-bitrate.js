import {DomBasedWeakRef} from '#core/data-structures/dom-based-weakref';
import {childElement, childElementsByTag} from '#core/dom/query';
import {tryPlay} from '#core/dom/video';
import {toArray} from '#core/types/array';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {listen, listenOnce} from '#utils/event-helper';
import {dev, devAssert} from '#utils/log';

const TAG = 'amp-video';

/** @const {!{[key: string]: number}} */
const BITRATE_BY_EFFECTIVE_TYPE = {
  // We assign low values to 2G in general. None of these will likely be able
  // to stream any bitrates we see in the wild.
  'slow-2g': 50,
  '2g': 50,
  // Commonly found bitrates that should typically fit into the spectrum of
  // these connections. Further tuning may be needed.
  '3g': 1000,
  '4g': 2500,
  '5g': 5000,
};

/** @const {number} Do not downgrade the quality of a video that has loaded enough content */
const BUFFERED_THRESHOLD_PERCENTAGE = 0.8;

/** @const {string} Simulates video being buffered (fully loaded) for the bitrate algorithm. */
const IS_VIDEO_FULLY_LOADED_OVERRIDE_FOR_TESTING =
  'i-amphtml-is-video-fully-loaded-override-for-testing';

/** @type {!BitrateManager|undefined} */
let instance;
/**
 * @param {!Window} win
 * @return {!BitrateManager}
 */
export function getBitrateManager(win) {
  if (instance) {
    return instance;
  }

  if (isExperimentOn(win, 'flexible-bitrate')) {
    Services.performanceFor(win).addEnabledExperiment('flexible-bitrate');
  }

  return (instance = new BitrateManager(win));
}

/**
 * Manages the sources of video elements by bitrate.
 *
 * Expects all sources to have a `data-bitrate` attribute with an integer
 * value in Kilobits/s.
 *
 * Initializes based on the effective connection type. See BITRATE_BY_EFFECTIVE_TYPE
 * for inferred bitrates. Lowers assumed bitrate when a video goes into `waiting`
 * state.
 *
 * Potentially desirable but unsupported features
 * - Does not ever increase the bitrate when things are going well.
 * - Does not persist information across page loads.
 * - Does not re-sort sources of non-playing videos that are already managed.
 */
export class BitrateManager {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const */
    this.win = win;
    /**
     * Init set as a side effect of the this.getAcceptableBitrate_() call
     * @private {string}
     */
    this.effectiveConnectionType_ = '';
    /** @private {number} */
    this.acceptableBitrate_ = this.getAcceptableBitrate_();

    /** @private {!Array<!WeakRef<!Element>|!../../../src/utils/dom-based-weakref.DomBasedWeakRef<!Element>>} */
    this.videos_ = [];
  }

  /**
   * Manages bitrate changes for the given video.
   *
   * Callers MUST call `video.changedSources()` synchronously whenever they
   * changed the sources of the video element.
   *
   * @param {!Element} video
   */
  manage(video) {
    if (!isExperimentOn(this.win, 'flexible-bitrate')) {
      return;
    }
    // Prevent duplicate listeners if already managing this video.
    if (video.changedSources) {
      return;
    }
    onNontrivialWait(video, () => this.downgradeVideo_(video));
    listen(video, 'downgrade', () => this.downgradeVideo_(video));
    video.changedSources = () => {
      this.sortSources_(video);
    };
    this.videos_.push(DomBasedWeakRef.make(this.win, video));
  }

  /**
   * Downgrade a video quality by selecting a lower bitrate source if available,
   * then downgrade the other registered videos.
   * @param {!Element} video
   */
  downgradeVideo_(video) {
    const current = currentSource(video);
    const newBitrate = current.bitrate_ - 1;
    if (newBitrate >= this.acceptableBitrate_) {
      return;
    }
    this.acceptableBitrate_ = newBitrate;
    this.switchToLowerBitrate_(video, current.bitrate_);
    this.updateOtherManagedAndPausedVideos_();
  }

  /**
   * Returns the effective connection type as reported by the browser.
   * Defaults to `4g` if the browser (notably WebKit) does not report it.
   * @return {string}
   * @private
   */
  getCurrentEffectiveConnectionType_() {
    const {connection} = this.win.navigator;
    if (connection && connection.effectiveType) {
      return connection.effectiveType;
    }
    return '4g'; // Most common nowadays.
  }

  /**
   * Returns the currently known acceptable bitrate for the user.
   * If the effective connection type of the user has changed since we last
   * looked, then this will overrride the result. Otherwise
   * @return {number}
   * @private
   */
  getAcceptableBitrate_() {
    if (
      this.effectiveConnectionType_ != this.getCurrentEffectiveConnectionType_()
    ) {
      this.effectiveConnectionType_ = this.getCurrentEffectiveConnectionType_();
      this.acceptableBitrate_ =
        BITRATE_BY_EFFECTIVE_TYPE[this.effectiveConnectionType_] ||
        BITRATE_BY_EFFECTIVE_TYPE['4g'];
    }
    return this.acceptableBitrate_;
  }

  /**
   * Sorts the sources of the given video element by their bitrates such that
   * the sources closest matching the acceptable bitrate are in front.
   * Returns true if the sorting changed the order of sources.
   * @param {!Element} video
   * @return {boolean}
   */
  sortSources_(video) {
    const sources = toArray(childElementsByTag(video, 'source'));
    // Ensure each element has the bitrate_ property
    sources.forEach((source) => {
      if (source.bitrate_) {
        return;
      }
      const bitrate = source.getAttribute('data-bitrate');
      source.bitrate_ = bitrate
        ? parseInt(bitrate, 10)
        : Number.POSITIVE_INFINITY;
    });
    let hasChanges = false;
    sources.sort((a, b) => {
      // Biggest first, bitrates above threshold to the back
      const value =
        this.getBitrateForComparison_(b) - this.getBitrateForComparison_(a);
      if (value < 0) {
        hasChanges = true;
      }
      return value;
    });

    if (hasChanges) {
      sources.forEach((source) => {
        video.appendChild(source);
      });
    }
    return hasChanges;
  }

  /**
   * Returns the bitrate of a source in such a way that bitrates that are higher
   * than the current acceptable bitrate rank lowest.
   * @param {!Element} source
   * @return {number}
   * @private
   */
  getBitrateForComparison_(source) {
    let rate = source.bitrate_;
    if (rate > this.getAcceptableBitrate_()) {
      // We make bitrates higher than the acceptable rate negative. That means,
      // the higher they are, the further they go in the back.
      rate *= -1;
    }
    return rate;
  }

  /**
   * Returns true if any sources of the video have a lower bitrate than the given
   * bitrate.
   * @param {!Element} video
   * @param {number} bitrate
   * @return {boolean}
   * @private
   */
  hasLowerBitrate_(video, bitrate) {
    const lowerBitrateSource = sources(video, (source) => {
      return source.bitrate_ < bitrate;
    });
    return !!lowerBitrateSource;
  }

  /**
   * Switches the video to use a lower bitrate if available.
   * This should be called if the video is currently in waiting mode.
   * @param {!Element} video
   * @param {number} currentBitrate
   * @private
   */
  switchToLowerBitrate_(video, currentBitrate) {
    if (!this.hasLowerBitrate_(video, currentBitrate)) {
      dev().fine(TAG, 'No lower bitrate available');
      return;
    }
    const {currentTime} = video;
    video.pause();
    const hasChanges = this.sortSources_(video);
    if (!hasChanges) {
      tryPlay(video);
      return;
    }
    video.load();
    listenOnce(video, 'loadedmetadata', () => {
      // Restore currentTime after loading new source.
      video.currentTime = currentTime;
      tryPlay(video);
      dev().fine(TAG, 'Playing at lower bitrate %s', video.currentSrc);
    });
  }

  /**
   * Update other managed videos when we learn that the current selected
   * bandwidth wasn't good. Only operates on videos that are currently paused
   * as we never want to interrupt playing videos if we don't have to.
   * @private
   */
  updateOtherManagedAndPausedVideos_() {
    for (let i = this.videos_.length - 1; i >= 0; i--) {
      const weakref = this.videos_[i];
      const video = weakref.deref();
      if (!video) {
        this.videos_.splice(i, 1);
        continue;
      }
      if (!video.paused || isVideoLoaded(video)) {
        continue;
      }
      const hasChanges = this.sortSources_(video);
      if (hasChanges) {
        video.load();
      }
    }
  }
}

/**
 * Calls the callback if the video goes into waiting state and does not
 * emerge from it within a short amount of time.
 * @param {!Element} video
 * @param {function()} callback
 */
function onNontrivialWait(video, callback) {
  listen(video, 'waiting', () => {
    // Do not trigger downgrade if not loaded metadata yet, or if video is fully loaded (eg: replay).
    if (video.readyState < 1 || getBufferedPercentage(video) > 0.99) {
      return;
    }
    let timer = null;
    const unlisten = listenOnce(video, 'playing', () => {
      clearTimeout(timer);
    });
    timer = setTimeout(() => {
      unlisten();
      callback();
    }, 100);
  });
}

/**
 * Returns the source element for which the callback returns true.
 * @param {!Element} video
 * @param {function(!HTMLSourceElement):boolean} fn
 * @return {?HTMLSourceElement}
 */
function sources(video, fn) {
  return /** @type {?HTMLSourceElement} */ (
    childElement(video, (source) => {
      if (source.tagName != 'SOURCE') {
        return false;
      }
      return fn(/** @type {!HTMLSourceElement} */ (source));
    })
  );
}

/**
 * Returns the currently active source element of the video.
 * @param {!Element} video
 * @return {!HTMLSourceElement}
 */
function currentSource(video) {
  return devAssert(
    sources(video, (source) => {
      return source.src == video.currentSrc;
    })
  );
}

/**
 * @private
 * @param {!Element} videoEl
 * @return {number} the percentage buffered [0-1]
 */
function getBufferedPercentage(videoEl) {
  // videoEl.duration can be NaN if video is not loaded or 0.
  if (!videoEl.duration) {
    return 0;
  }
  let bufferedSum = 0;
  for (let i = 0; i < videoEl.buffered.length; i++) {
    bufferedSum += videoEl.buffered.end(i) - videoEl.buffered.start(i);
  }
  return bufferedSum / videoEl.duration;
}

/**
 * Checks for the video buffer percentage to know if a video is loaded
 * (can be overriden with the attribute `i-amphtml-is-video-fully-loaded-override-for-testing`).
 * @param {!Element} videoEl
 * @return {boolean}
 */
function isVideoLoaded(videoEl) {
  if (videoEl.hasAttribute(IS_VIDEO_FULLY_LOADED_OVERRIDE_FOR_TESTING)) {
    return (
      videoEl.getAttribute(IS_VIDEO_FULLY_LOADED_OVERRIDE_FOR_TESTING) ===
      'true'
    );
  }
  return getBufferedPercentage(videoEl) > BUFFERED_THRESHOLD_PERCENTAGE;
}
