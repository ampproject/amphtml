function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import { DomBasedWeakRef } from "../../../src/core/data-structures/dom-based-weakref";
import { Services } from "../../../src/service";
import { childElement, childElementsByTag } from "../../../src/core/dom/query";
import { dev, devAssert } from "../../../src/log";
import { isExperimentOn } from "../../../src/experiments";
import { listen, listenOnce } from "../../../src/event-helper";
import { toArray } from "../../../src/core/types/array";

var TAG = 'amp-video';

/** @const {!Object<string, number>} */
var BITRATE_BY_EFFECTIVE_TYPE = {
  // We assign low values to 2G in general. None of these will likely be able
  // to stream any bitrates we see in the wild.
  'slow-2g': 50,
  '2g': 50,
  // Commonly found bitrates that should typically fit into the spectrum of
  // these connections. Further tuning may be needed.
  '3g': 1000,
  '4g': 2500,
  '5g': 5000 };


/** @const {number} Do not downgrade the quality of a video that has loaded enough content */
var BUFFERED_THRESHOLD_PERCENTAGE = 0.8;

/** @const {string} Simulates video being buffered (fully loaded) for the bitrate algorithm. */
var IS_VIDEO_FULLY_LOADED_OVERRIDE_FOR_TESTING =
'i-amphtml-is-video-fully-loaded-override-for-testing';

/** @type {!BitrateManager|undefined} */
var instance;
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
export var BitrateManager = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function BitrateManager(win) {_classCallCheck(this, BitrateManager);
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
   */_createClass(BitrateManager, [{ key: "manage", value:
    function manage(video) {var _this = this;
      if (!isExperimentOn(this.win, 'flexible-bitrate')) {
        return;
      }
      // Prevent duplicate listeners if already managing this video.
      if (video.changedSources) {
        return;
      }
      onNontrivialWait(video, function () {return _this.downgradeVideo_(video);});
      listen(video, 'downgrade', function () {return _this.downgradeVideo_(video);});
      video.changedSources = function () {
        _this.sortSources_(video);
      };
      this.videos_.push(DomBasedWeakRef.make(this.win, video));
    }

    /**
     * Downgrade a video quality by selecting a lower bitrate source if available,
     * then downgrade the other registered videos.
     * @param {!Element} video
     */ }, { key: "downgradeVideo_", value:
    function downgradeVideo_(video) {
      var current = currentSource(video);
      var newBitrate = current.bitrate_ - 1;
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
     */ }, { key: "getCurrentEffectiveConnectionType_", value:
    function getCurrentEffectiveConnectionType_() {
      var connection = this.win.navigator.connection;
      if (connection && connection.effectiveType) {
        return connection.effectiveType;
      }
      return '4g';
    }

    /**
     * Returns the currently known acceptable bitrate for the user.
     * If the effective connection type of the user has changed since we last
     * looked, then this will overrride the result. Otherwise
     * @return {number}
     * @private
     */ }, { key: "getAcceptableBitrate_", value:
    function getAcceptableBitrate_() {
      if (
      this.effectiveConnectionType_ != this.getCurrentEffectiveConnectionType_())
      {
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
     */ }, { key: "sortSources_", value:
    function sortSources_(video) {var _this2 = this;
      var sources = toArray(childElementsByTag(video, 'source'));
      // Ensure each element has the bitrate_ property
      sources.forEach(function (source) {
        if (source.bitrate_) {
          return;
        }
        var bitrate = source.getAttribute('data-bitrate');
        source.bitrate_ = bitrate ?
        parseInt(bitrate, 10) :
        Number.POSITIVE_INFINITY;
      });
      var hasChanges = false;
      sources.sort(function (a, b) {
        // Biggest first, bitrates above threshold to the back
        var value =
        _this2.getBitrateForComparison_(b) - _this2.getBitrateForComparison_(a);
        if (value < 0) {
          hasChanges = true;
        }
        return value;
      });

      if (hasChanges) {
        sources.forEach(function (source) {
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
     */ }, { key: "getBitrateForComparison_", value:
    function getBitrateForComparison_(source) {
      var rate = source.bitrate_;
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
     */ }, { key: "hasLowerBitrate_", value:
    function hasLowerBitrate_(video, bitrate) {
      var lowerBitrateSource = sources(video, function (source) {
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
     */ }, { key: "switchToLowerBitrate_", value:
    function switchToLowerBitrate_(video, currentBitrate) {
      if (!this.hasLowerBitrate_(video, currentBitrate)) {
        dev().fine(TAG, 'No lower bitrate available');
        return;
      }
      var currentTime = video.currentTime;
      video.pause();
      var hasChanges = this.sortSources_(video);
      if (!hasChanges) {
        video.play();
        return;
      }
      video.load();
      listenOnce(video, 'loadedmetadata', function () {
        // Restore currentTime after loading new source.
        video.currentTime = currentTime;
        video.play();
        dev().fine(TAG, 'Playing at lower bitrate %s', video.currentSrc);
      });
    }

    /**
     * Update other managed videos when we learn that the current selected
     * bandwidth wasn't good. Only operates on videos that are currently paused
     * as we never want to interrupt playing videos if we don't have to.
     * @private
     */ }, { key: "updateOtherManagedAndPausedVideos_", value:
    function updateOtherManagedAndPausedVideos_() {
      for (var i = this.videos_.length - 1; i >= 0; i--) {
        var weakref = this.videos_[i];
        var video = weakref.deref();
        if (!video) {
          this.videos_.splice(i, 1);
          continue;
        }
        if (!video.paused || isVideoLoaded(video)) {
          continue;
        }
        var hasChanges = this.sortSources_(video);
        if (hasChanges) {
          video.load();
        }
      }
    } }]);return BitrateManager;}();


/**
 * Calls the callback if the video goes into waiting state and does not
 * emerge from it within a short amount of time.
 * @param {!Element} video
 * @param {function()} callback
 */
function onNontrivialWait(video, callback) {
  listen(video, 'waiting', function () {
    // Do not trigger downgrade if not loaded metadata yet, or if video is fully loaded (eg: replay).
    if (video.readyState < 1 || getBufferedPercentage(video) > 0.99) {
      return;
    }
    var timer = null;
    var unlisten = listenOnce(video, 'playing', function () {
      clearTimeout(timer);
    });
    timer = setTimeout(function () {
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
  return (/** @type {?HTMLSourceElement} */(
    childElement(video, function (source) {
      if (source.tagName != 'SOURCE') {
        return false;
      }
      return fn( /** @type {!HTMLSourceElement} */(source));
    })));

}

/**
 * Returns the currently active source element of the video.
 * @param {!Element} video
 * @return {!HTMLSourceElement}
 */
function currentSource(video) {
  return devAssert(
  sources(video, function (source) {
    return source.src == video.currentSrc;
  }));

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
  var bufferedSum = 0;
  for (var i = 0; i < videoEl.buffered.length; i++) {
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
    'true');

  }
  return getBufferedPercentage(videoEl) > BUFFERED_THRESHOLD_PERCENTAGE;
}
// /Users/mszylkowski/src/amphtml/extensions/amp-video/0.1/flexible-bitrate.js