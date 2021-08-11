function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
  '5g': 5000
};

/** @const {number} Do not downgrade the quality of a video that has loaded enough content */
var BUFFERED_THRESHOLD_PERCENTAGE = 0.8;

/** @const {string} Simulates video being buffered (fully loaded) for the bitrate algorithm. */
var IS_VIDEO_FULLY_LOADED_OVERRIDE_FOR_TESTING = 'i-amphtml-is-video-fully-loaded-override-for-testing';

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

  return instance = new BitrateManager(win);
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
  function BitrateManager(win) {
    _classCallCheck(this, BitrateManager);

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
  _createClass(BitrateManager, [{
    key: "manage",
    value: function manage(video) {
      var _this = this;

      if (!isExperimentOn(this.win, 'flexible-bitrate')) {
        return;
      }

      // Prevent duplicate listeners if already managing this video.
      if (video.changedSources) {
        return;
      }

      onNontrivialWait(video, function () {
        return _this.downgradeVideo_(video);
      });
      listen(video, 'downgrade', function () {
        return _this.downgradeVideo_(video);
      });

      video.changedSources = function () {
        _this.sortSources_(video);
      };

      this.videos_.push(DomBasedWeakRef.make(this.win, video));
    }
    /**
     * Downgrade a video quality by selecting a lower bitrate source if available,
     * then downgrade the other registered videos.
     * @param {!Element} video
     */

  }, {
    key: "downgradeVideo_",
    value: function downgradeVideo_(video) {
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
     */

  }, {
    key: "getCurrentEffectiveConnectionType_",
    value: function getCurrentEffectiveConnectionType_() {
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
     */

  }, {
    key: "getAcceptableBitrate_",
    value: function getAcceptableBitrate_() {
      if (this.effectiveConnectionType_ != this.getCurrentEffectiveConnectionType_()) {
        this.effectiveConnectionType_ = this.getCurrentEffectiveConnectionType_();
        this.acceptableBitrate_ = BITRATE_BY_EFFECTIVE_TYPE[this.effectiveConnectionType_] || BITRATE_BY_EFFECTIVE_TYPE['4g'];
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

  }, {
    key: "sortSources_",
    value: function sortSources_(video) {
      var _this2 = this;

      var sources = toArray(childElementsByTag(video, 'source'));
      // Ensure each element has the bitrate_ property
      sources.forEach(function (source) {
        if (source.bitrate_) {
          return;
        }

        var bitrate = source.getAttribute('data-bitrate');
        source.bitrate_ = bitrate ? parseInt(bitrate, 10) : Number.POSITIVE_INFINITY;
      });
      var hasChanges = false;
      sources.sort(function (a, b) {
        // Biggest first, bitrates above threshold to the back
        var value = _this2.getBitrateForComparison_(b) - _this2.getBitrateForComparison_(a);

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
     */

  }, {
    key: "getBitrateForComparison_",
    value: function getBitrateForComparison_(source) {
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
     */

  }, {
    key: "hasLowerBitrate_",
    value: function hasLowerBitrate_(video, bitrate) {
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
     */

  }, {
    key: "switchToLowerBitrate_",
    value: function switchToLowerBitrate_(video, currentBitrate) {
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
     */

  }, {
    key: "updateOtherManagedAndPausedVideos_",
    value: function updateOtherManagedAndPausedVideos_() {
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
    }
  }]);

  return BitrateManager;
}();

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
  return (
    /** @type {?HTMLSourceElement} */
    childElement(video, function (source) {
      if (source.tagName != 'SOURCE') {
        return false;
      }

      return fn(
      /** @type {!HTMLSourceElement} */
      source);
    })
  );
}

/**
 * Returns the currently active source element of the video.
 * @param {!Element} video
 * @return {!HTMLSourceElement}
 */
function currentSource(video) {
  return devAssert(sources(video, function (source) {
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
    return videoEl.getAttribute(IS_VIDEO_FULLY_LOADED_OVERRIDE_FOR_TESTING) === 'true';
  }

  return getBufferedPercentage(videoEl) > BUFFERED_THRESHOLD_PERCENTAGE;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZsZXhpYmxlLWJpdHJhdGUuanMiXSwibmFtZXMiOlsiRG9tQmFzZWRXZWFrUmVmIiwiU2VydmljZXMiLCJjaGlsZEVsZW1lbnQiLCJjaGlsZEVsZW1lbnRzQnlUYWciLCJkZXYiLCJkZXZBc3NlcnQiLCJpc0V4cGVyaW1lbnRPbiIsImxpc3RlbiIsImxpc3Rlbk9uY2UiLCJ0b0FycmF5IiwiVEFHIiwiQklUUkFURV9CWV9FRkZFQ1RJVkVfVFlQRSIsIkJVRkZFUkVEX1RIUkVTSE9MRF9QRVJDRU5UQUdFIiwiSVNfVklERU9fRlVMTFlfTE9BREVEX09WRVJSSURFX0ZPUl9URVNUSU5HIiwiaW5zdGFuY2UiLCJnZXRCaXRyYXRlTWFuYWdlciIsIndpbiIsInBlcmZvcm1hbmNlRm9yIiwiYWRkRW5hYmxlZEV4cGVyaW1lbnQiLCJCaXRyYXRlTWFuYWdlciIsImVmZmVjdGl2ZUNvbm5lY3Rpb25UeXBlXyIsImFjY2VwdGFibGVCaXRyYXRlXyIsImdldEFjY2VwdGFibGVCaXRyYXRlXyIsInZpZGVvc18iLCJ2aWRlbyIsImNoYW5nZWRTb3VyY2VzIiwib25Ob250cml2aWFsV2FpdCIsImRvd25ncmFkZVZpZGVvXyIsInNvcnRTb3VyY2VzXyIsInB1c2giLCJtYWtlIiwiY3VycmVudCIsImN1cnJlbnRTb3VyY2UiLCJuZXdCaXRyYXRlIiwiYml0cmF0ZV8iLCJzd2l0Y2hUb0xvd2VyQml0cmF0ZV8iLCJ1cGRhdGVPdGhlck1hbmFnZWRBbmRQYXVzZWRWaWRlb3NfIiwiY29ubmVjdGlvbiIsIm5hdmlnYXRvciIsImVmZmVjdGl2ZVR5cGUiLCJnZXRDdXJyZW50RWZmZWN0aXZlQ29ubmVjdGlvblR5cGVfIiwic291cmNlcyIsImZvckVhY2giLCJzb3VyY2UiLCJiaXRyYXRlIiwiZ2V0QXR0cmlidXRlIiwicGFyc2VJbnQiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImhhc0NoYW5nZXMiLCJzb3J0IiwiYSIsImIiLCJ2YWx1ZSIsImdldEJpdHJhdGVGb3JDb21wYXJpc29uXyIsImFwcGVuZENoaWxkIiwicmF0ZSIsImxvd2VyQml0cmF0ZVNvdXJjZSIsImN1cnJlbnRCaXRyYXRlIiwiaGFzTG93ZXJCaXRyYXRlXyIsImZpbmUiLCJjdXJyZW50VGltZSIsInBhdXNlIiwicGxheSIsImxvYWQiLCJjdXJyZW50U3JjIiwiaSIsImxlbmd0aCIsIndlYWtyZWYiLCJkZXJlZiIsInNwbGljZSIsInBhdXNlZCIsImlzVmlkZW9Mb2FkZWQiLCJjYWxsYmFjayIsInJlYWR5U3RhdGUiLCJnZXRCdWZmZXJlZFBlcmNlbnRhZ2UiLCJ0aW1lciIsInVubGlzdGVuIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImZuIiwidGFnTmFtZSIsInNyYyIsInZpZGVvRWwiLCJkdXJhdGlvbiIsImJ1ZmZlcmVkU3VtIiwiYnVmZmVyZWQiLCJlbmQiLCJzdGFydCIsImhhc0F0dHJpYnV0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsZUFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxTQUFRQyxZQUFSLEVBQXNCQyxrQkFBdEI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWI7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsTUFBUixFQUFnQkMsVUFBaEI7QUFDQSxTQUFRQyxPQUFSO0FBRUEsSUFBTUMsR0FBRyxHQUFHLFdBQVo7O0FBRUE7QUFDQSxJQUFNQyx5QkFBeUIsR0FBRztBQUNoQztBQUNBO0FBQ0EsYUFBVyxFQUhxQjtBQUloQyxRQUFNLEVBSjBCO0FBS2hDO0FBQ0E7QUFDQSxRQUFNLElBUDBCO0FBUWhDLFFBQU0sSUFSMEI7QUFTaEMsUUFBTTtBQVQwQixDQUFsQzs7QUFZQTtBQUNBLElBQU1DLDZCQUE2QixHQUFHLEdBQXRDOztBQUVBO0FBQ0EsSUFBTUMsMENBQTBDLEdBQzlDLHNEQURGOztBQUdBO0FBQ0EsSUFBSUMs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IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0RvbUJhc2VkV2Vha1JlZn0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL2RvbS1iYXNlZC13ZWFrcmVmJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7Y2hpbGRFbGVtZW50LCBjaGlsZEVsZW1lbnRzQnlUYWd9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cyc7XG5pbXBvcnQge2xpc3RlbiwgbGlzdGVuT25jZX0gZnJvbSAnLi4vLi4vLi4vc3JjL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge3RvQXJyYXl9IGZyb20gJyNjb3JlL3R5cGVzL2FycmF5JztcblxuY29uc3QgVEFHID0gJ2FtcC12aWRlbyc7XG5cbi8qKiBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCBudW1iZXI+fSAqL1xuY29uc3QgQklUUkFURV9CWV9FRkZFQ1RJVkVfVFlQRSA9IHtcbiAgLy8gV2UgYXNzaWduIGxvdyB2YWx1ZXMgdG8gMkcgaW4gZ2VuZXJhbC4gTm9uZSBvZiB0aGVzZSB3aWxsIGxpa2VseSBiZSBhYmxlXG4gIC8vIHRvIHN0cmVhbSBhbnkgYml0cmF0ZXMgd2Ugc2VlIGluIHRoZSB3aWxkLlxuICAnc2xvdy0yZyc6IDUwLFxuICAnMmcnOiA1MCxcbiAgLy8gQ29tbW9ubHkgZm91bmQgYml0cmF0ZXMgdGhhdCBzaG91bGQgdHlwaWNhbGx5IGZpdCBpbnRvIHRoZSBzcGVjdHJ1bSBvZlxuICAvLyB0aGVzZSBjb25uZWN0aW9ucy4gRnVydGhlciB0dW5pbmcgbWF5IGJlIG5lZWRlZC5cbiAgJzNnJzogMTAwMCxcbiAgJzRnJzogMjUwMCxcbiAgJzVnJzogNTAwMCxcbn07XG5cbi8qKiBAY29uc3Qge251bWJlcn0gRG8gbm90IGRvd25ncmFkZSB0aGUgcXVhbGl0eSBvZiBhIHZpZGVvIHRoYXQgaGFzIGxvYWRlZCBlbm91Z2ggY29udGVudCAqL1xuY29uc3QgQlVGRkVSRURfVEhSRVNIT0xEX1BFUkNFTlRBR0UgPSAwLjg7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gU2ltdWxhdGVzIHZpZGVvIGJlaW5nIGJ1ZmZlcmVkIChmdWxseSBsb2FkZWQpIGZvciB0aGUgYml0cmF0ZSBhbGdvcml0aG0uICovXG5jb25zdCBJU19WSURFT19GVUxMWV9MT0FERURfT1ZFUlJJREVfRk9SX1RFU1RJTkcgPVxuICAnaS1hbXBodG1sLWlzLXZpZGVvLWZ1bGx5LWxvYWRlZC1vdmVycmlkZS1mb3ItdGVzdGluZyc7XG5cbi8qKiBAdHlwZSB7IUJpdHJhdGVNYW5hZ2VyfHVuZGVmaW5lZH0gKi9cbmxldCBpbnN0YW5jZTtcbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4geyFCaXRyYXRlTWFuYWdlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJpdHJhdGVNYW5hZ2VyKHdpbikge1xuICBpZiAoaW5zdGFuY2UpIHtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBpZiAoaXNFeHBlcmltZW50T24od2luLCAnZmxleGlibGUtYml0cmF0ZScpKSB7XG4gICAgU2VydmljZXMucGVyZm9ybWFuY2VGb3Iod2luKS5hZGRFbmFibGVkRXhwZXJpbWVudCgnZmxleGlibGUtYml0cmF0ZScpO1xuICB9XG5cbiAgcmV0dXJuIChpbnN0YW5jZSA9IG5ldyBCaXRyYXRlTWFuYWdlcih3aW4pKTtcbn1cblxuLyoqXG4gKiBNYW5hZ2VzIHRoZSBzb3VyY2VzIG9mIHZpZGVvIGVsZW1lbnRzIGJ5IGJpdHJhdGUuXG4gKlxuICogRXhwZWN0cyBhbGwgc291cmNlcyB0byBoYXZlIGEgYGRhdGEtYml0cmF0ZWAgYXR0cmlidXRlIHdpdGggYW4gaW50ZWdlclxuICogdmFsdWUgaW4gS2lsb2JpdHMvcy5cbiAqXG4gKiBJbml0aWFsaXplcyBiYXNlZCBvbiB0aGUgZWZmZWN0aXZlIGNvbm5lY3Rpb24gdHlwZS4gU2VlIEJJVFJBVEVfQllfRUZGRUNUSVZFX1RZUEVcbiAqIGZvciBpbmZlcnJlZCBiaXRyYXRlcy4gTG93ZXJzIGFzc3VtZWQgYml0cmF0ZSB3aGVuIGEgdmlkZW8gZ29lcyBpbnRvIGB3YWl0aW5nYFxuICogc3RhdGUuXG4gKlxuICogUG90ZW50aWFsbHkgZGVzaXJhYmxlIGJ1dCB1bnN1cHBvcnRlZCBmZWF0dXJlc1xuICogLSBEb2VzIG5vdCBldmVyIGluY3JlYXNlIHRoZSBiaXRyYXRlIHdoZW4gdGhpbmdzIGFyZSBnb2luZyB3ZWxsLlxuICogLSBEb2VzIG5vdCBwZXJzaXN0IGluZm9ybWF0aW9uIGFjcm9zcyBwYWdlIGxvYWRzLlxuICogLSBEb2VzIG5vdCByZS1zb3J0IHNvdXJjZXMgb2Ygbm9uLXBsYXlpbmcgdmlkZW9zIHRoYXQgYXJlIGFscmVhZHkgbWFuYWdlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJpdHJhdGVNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQGNvbnN0ICovXG4gICAgdGhpcy53aW4gPSB3aW47XG4gICAgLyoqXG4gICAgICogSW5pdCBzZXQgYXMgYSBzaWRlIGVmZmVjdCBvZiB0aGUgdGhpcy5nZXRBY2NlcHRhYmxlQml0cmF0ZV8oKSBjYWxsXG4gICAgICogQHByaXZhdGUge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLmVmZmVjdGl2ZUNvbm5lY3Rpb25UeXBlXyA9ICcnO1xuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuYWNjZXB0YWJsZUJpdHJhdGVfID0gdGhpcy5nZXRBY2NlcHRhYmxlQml0cmF0ZV8oKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PCFXZWFrUmVmPCFFbGVtZW50PnwhLi4vLi4vLi4vc3JjL3V0aWxzL2RvbS1iYXNlZC13ZWFrcmVmLkRvbUJhc2VkV2Vha1JlZjwhRWxlbWVudD4+fSAqL1xuICAgIHRoaXMudmlkZW9zXyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hbmFnZXMgYml0cmF0ZSBjaGFuZ2VzIGZvciB0aGUgZ2l2ZW4gdmlkZW8uXG4gICAqXG4gICAqIENhbGxlcnMgTVVTVCBjYWxsIGB2aWRlby5jaGFuZ2VkU291cmNlcygpYCBzeW5jaHJvbm91c2x5IHdoZW5ldmVyIHRoZXlcbiAgICogY2hhbmdlZCB0aGUgc291cmNlcyBvZiB0aGUgdmlkZW8gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdmlkZW9cbiAgICovXG4gIG1hbmFnZSh2aWRlbykge1xuICAgIGlmICghaXNFeHBlcmltZW50T24odGhpcy53aW4sICdmbGV4aWJsZS1iaXRyYXRlJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gUHJldmVudCBkdXBsaWNhdGUgbGlzdGVuZXJzIGlmIGFscmVhZHkgbWFuYWdpbmcgdGhpcyB2aWRlby5cbiAgICBpZiAodmlkZW8uY2hhbmdlZFNvdXJjZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgb25Ob250cml2aWFsV2FpdCh2aWRlbywgKCkgPT4gdGhpcy5kb3duZ3JhZGVWaWRlb18odmlkZW8pKTtcbiAgICBsaXN0ZW4odmlkZW8sICdkb3duZ3JhZGUnLCAoKSA9PiB0aGlzLmRvd25ncmFkZVZpZGVvXyh2aWRlbykpO1xuICAgIHZpZGVvLmNoYW5nZWRTb3VyY2VzID0gKCkgPT4ge1xuICAgICAgdGhpcy5zb3J0U291cmNlc18odmlkZW8pO1xuICAgIH07XG4gICAgdGhpcy52aWRlb3NfLnB1c2goRG9tQmFzZWRXZWFrUmVmLm1ha2UodGhpcy53aW4sIHZpZGVvKSk7XG4gIH1cblxuICAvKipcbiAgICogRG93bmdyYWRlIGEgdmlkZW8gcXVhbGl0eSBieSBzZWxlY3RpbmcgYSBsb3dlciBiaXRyYXRlIHNvdXJjZSBpZiBhdmFpbGFibGUsXG4gICAqIHRoZW4gZG93bmdyYWRlIHRoZSBvdGhlciByZWdpc3RlcmVkIHZpZGVvcy5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gdmlkZW9cbiAgICovXG4gIGRvd25ncmFkZVZpZGVvXyh2aWRlbykge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBjdXJyZW50U291cmNlKHZpZGVvKTtcbiAgICBjb25zdCBuZXdCaXRyYXRlID0gY3VycmVudC5iaXRyYXRlXyAtIDE7XG4gICAgaWYgKG5ld0JpdHJhdGUgPj0gdGhpcy5hY2NlcHRhYmxlQml0cmF0ZV8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5hY2NlcHRhYmxlQml0cmF0ZV8gPSBuZXdCaXRyYXRlO1xuICAgIHRoaXMuc3dpdGNoVG9Mb3dlckJpdHJhdGVfKHZpZGVvLCBjdXJyZW50LmJpdHJhdGVfKTtcbiAgICB0aGlzLnVwZGF0ZU90aGVyTWFuYWdlZEFuZFBhdXNlZFZpZGVvc18oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlZmZlY3RpdmUgY29ubmVjdGlvbiB0eXBlIGFzIHJlcG9ydGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKiBEZWZhdWx0cyB0byBgNGdgIGlmIHRoZSBicm93c2VyIChub3RhYmx5IFdlYktpdCkgZG9lcyBub3QgcmVwb3J0IGl0LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRDdXJyZW50RWZmZWN0aXZlQ29ubmVjdGlvblR5cGVfKCkge1xuICAgIGNvbnN0IHtjb25uZWN0aW9ufSA9IHRoaXMud2luLm5hdmlnYXRvcjtcbiAgICBpZiAoY29ubmVjdGlvbiAmJiBjb25uZWN0aW9uLmVmZmVjdGl2ZVR5cGUpIHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uLmVmZmVjdGl2ZVR5cGU7XG4gICAgfVxuICAgIHJldHVybiAnNGcnOyAvLyBNb3N0IGNvbW1vbiBub3dhZGF5cy5cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50bHkga25vd24gYWNjZXB0YWJsZSBiaXRyYXRlIGZvciB0aGUgdXNlci5cbiAgICogSWYgdGhlIGVmZmVjdGl2ZSBjb25uZWN0aW9uIHR5cGUgb2YgdGhlIHVzZXIgaGFzIGNoYW5nZWQgc2luY2Ugd2UgbGFzdFxuICAgKiBsb29rZWQsIHRoZW4gdGhpcyB3aWxsIG92ZXJycmlkZSB0aGUgcmVzdWx0LiBPdGhlcndpc2VcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0QWNjZXB0YWJsZUJpdHJhdGVfKCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuZWZmZWN0aXZlQ29ubmVjdGlvblR5cGVfICE9IHRoaXMuZ2V0Q3VycmVudEVmZmVjdGl2ZUNvbm5lY3Rpb25UeXBlXygpXG4gICAgKSB7XG4gICAgICB0aGlzLmVmZmVjdGl2ZUNvbm5lY3Rpb25UeXBlXyA9IHRoaXMuZ2V0Q3VycmVudEVmZmVjdGl2ZUNvbm5lY3Rpb25UeXBlXygpO1xuICAgICAgdGhpcy5hY2NlcHRhYmxlQml0cmF0ZV8gPVxuICAgICAgICBCSVRSQVRFX0JZX0VGRkVDVElWRV9UWVBFW3RoaXMuZWZmZWN0aXZlQ29ubmVjdGlvblR5cGVfXSB8fFxuICAgICAgICBCSVRSQVRFX0JZX0VGRkVDVElWRV9UWVBFWyc0ZyddO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hY2NlcHRhYmxlQml0cmF0ZV87XG4gIH1cblxuICAvKipcbiAgICogU29ydHMgdGhlIHNvdXJjZXMgb2YgdGhlIGdpdmVuIHZpZGVvIGVsZW1lbnQgYnkgdGhlaXIgYml0cmF0ZXMgc3VjaCB0aGF0XG4gICAqIHRoZSBzb3VyY2VzIGNsb3Nlc3QgbWF0Y2hpbmcgdGhlIGFjY2VwdGFibGUgYml0cmF0ZSBhcmUgaW4gZnJvbnQuXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc29ydGluZyBjaGFuZ2VkIHRoZSBvcmRlciBvZiBzb3VyY2VzLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB2aWRlb1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc29ydFNvdXJjZXNfKHZpZGVvKSB7XG4gICAgY29uc3Qgc291cmNlcyA9IHRvQXJyYXkoY2hpbGRFbGVtZW50c0J5VGFnKHZpZGVvLCAnc291cmNlJykpO1xuICAgIC8vIEVuc3VyZSBlYWNoIGVsZW1lbnQgaGFzIHRoZSBiaXRyYXRlXyBwcm9wZXJ0eVxuICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICBpZiAoc291cmNlLmJpdHJhdGVfKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGJpdHJhdGUgPSBzb3VyY2UuZ2V0QXR0cmlidXRlKCdkYXRhLWJpdHJhdGUnKTtcbiAgICAgIHNvdXJjZS5iaXRyYXRlXyA9IGJpdHJhdGVcbiAgICAgICAgPyBwYXJzZUludChiaXRyYXRlLCAxMClcbiAgICAgICAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgfSk7XG4gICAgbGV0IGhhc0NoYW5nZXMgPSBmYWxzZTtcbiAgICBzb3VyY2VzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIC8vIEJpZ2dlc3QgZmlyc3QsIGJpdHJhdGVzIGFib3ZlIHRocmVzaG9sZCB0byB0aGUgYmFja1xuICAgICAgY29uc3QgdmFsdWUgPVxuICAgICAgICB0aGlzLmdldEJpdHJhdGVGb3JDb21wYXJpc29uXyhiKSAtIHRoaXMuZ2V0Qml0cmF0ZUZvckNvbXBhcmlzb25fKGEpO1xuICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcblxuICAgIGlmIChoYXNDaGFuZ2VzKSB7XG4gICAgICBzb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgICAgICB2aWRlby5hcHBlbmRDaGlsZChzb3VyY2UpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBoYXNDaGFuZ2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHJhdGUgb2YgYSBzb3VyY2UgaW4gc3VjaCBhIHdheSB0aGF0IGJpdHJhdGVzIHRoYXQgYXJlIGhpZ2hlclxuICAgKiB0aGFuIHRoZSBjdXJyZW50IGFjY2VwdGFibGUgYml0cmF0ZSByYW5rIGxvd2VzdC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gc291cmNlXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEJpdHJhdGVGb3JDb21wYXJpc29uXyhzb3VyY2UpIHtcbiAgICBsZXQgcmF0ZSA9IHNvdXJjZS5iaXRyYXRlXztcbiAgICBpZiAocmF0ZSA+IHRoaXMuZ2V0QWNjZXB0YWJsZUJpdHJhdGVfKCkpIHtcbiAgICAgIC8vIFdlIG1ha2UgYml0cmF0ZXMgaGlnaGVyIHRoYW4gdGhlIGFjY2VwdGFibGUgcmF0ZSBuZWdhdGl2ZS4gVGhhdCBtZWFucyxcbiAgICAgIC8vIHRoZSBoaWdoZXIgdGhleSBhcmUsIHRoZSBmdXJ0aGVyIHRoZXkgZ28gaW4gdGhlIGJhY2suXG4gICAgICByYXRlICo9IC0xO1xuICAgIH1cbiAgICByZXR1cm4gcmF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgYW55IHNvdXJjZXMgb2YgdGhlIHZpZGVvIGhhdmUgYSBsb3dlciBiaXRyYXRlIHRoYW4gdGhlIGdpdmVuXG4gICAqIGJpdHJhdGUuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHZpZGVvXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiaXRyYXRlXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYXNMb3dlckJpdHJhdGVfKHZpZGVvLCBiaXRyYXRlKSB7XG4gICAgY29uc3QgbG93ZXJCaXRyYXRlU291cmNlID0gc291cmNlcyh2aWRlbywgKHNvdXJjZSkgPT4ge1xuICAgICAgcmV0dXJuIHNvdXJjZS5iaXRyYXRlXyA8IGJpdHJhdGU7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhbG93ZXJCaXRyYXRlU291cmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN3aXRjaGVzIHRoZSB2aWRlbyB0byB1c2UgYSBsb3dlciBiaXRyYXRlIGlmIGF2YWlsYWJsZS5cbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIGlmIHRoZSB2aWRlbyBpcyBjdXJyZW50bHkgaW4gd2FpdGluZyBtb2RlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB2aWRlb1xuICAgKiBAcGFyYW0ge251bWJlcn0gY3VycmVudEJpdHJhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN3aXRjaFRvTG93ZXJCaXRyYXRlXyh2aWRlbywgY3VycmVudEJpdHJhdGUpIHtcbiAgICBpZiAoIXRoaXMuaGFzTG93ZXJCaXRyYXRlXyh2aWRlbywgY3VycmVudEJpdHJhdGUpKSB7XG4gICAgICBkZXYoKS5maW5lKFRBRywgJ05vIGxvd2VyIGJpdHJhdGUgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtjdXJyZW50VGltZX0gPSB2aWRlbztcbiAgICB2aWRlby5wYXVzZSgpO1xuICAgIGNvbnN0IGhhc0NoYW5nZXMgPSB0aGlzLnNvcnRTb3VyY2VzXyh2aWRlbyk7XG4gICAgaWYgKCFoYXNDaGFuZ2VzKSB7XG4gICAgICB2aWRlby5wbGF5KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZpZGVvLmxvYWQoKTtcbiAgICBsaXN0ZW5PbmNlKHZpZGVvLCAnbG9hZGVkbWV0YWRhdGEnLCAoKSA9PiB7XG4gICAgICAvLyBSZXN0b3JlIGN1cnJlbnRUaW1lIGFmdGVyIGxvYWRpbmcgbmV3IHNvdXJjZS5cbiAgICAgIHZpZGVvLmN1cnJlbnRUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICB2aWRlby5wbGF5KCk7XG4gICAgICBkZXYoKS5maW5lKFRBRywgJ1BsYXlpbmcgYXQgbG93ZXIgYml0cmF0ZSAlcycsIHZpZGVvLmN1cnJlbnRTcmMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBvdGhlciBtYW5hZ2VkIHZpZGVvcyB3aGVuIHdlIGxlYXJuIHRoYXQgdGhlIGN1cnJlbnQgc2VsZWN0ZWRcbiAgICogYmFuZHdpZHRoIHdhc24ndCBnb29kLiBPbmx5IG9wZXJhdGVzIG9uIHZpZGVvcyB0aGF0IGFyZSBjdXJyZW50bHkgcGF1c2VkXG4gICAqIGFzIHdlIG5ldmVyIHdhbnQgdG8gaW50ZXJydXB0IHBsYXlpbmcgdmlkZW9zIGlmIHdlIGRvbid0IGhhdmUgdG8uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVPdGhlck1hbmFnZWRBbmRQYXVzZWRWaWRlb3NfKCkge1xuICAgIGZvciAobGV0IGkgPSB0aGlzLnZpZGVvc18ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHdlYWtyZWYgPSB0aGlzLnZpZGVvc19baV07XG4gICAgICBjb25zdCB2aWRlbyA9IHdlYWtyZWYuZGVyZWYoKTtcbiAgICAgIGlmICghdmlkZW8pIHtcbiAgICAgICAgdGhpcy52aWRlb3NfLnNwbGljZShpLCAxKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoIXZpZGVvLnBhdXNlZCB8fCBpc1ZpZGVvTG9hZGVkKHZpZGVvKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhhc0NoYW5nZXMgPSB0aGlzLnNvcnRTb3VyY2VzXyh2aWRlbyk7XG4gICAgICBpZiAoaGFzQ2hhbmdlcykge1xuICAgICAgICB2aWRlby5sb2FkKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2FsbHMgdGhlIGNhbGxiYWNrIGlmIHRoZSB2aWRlbyBnb2VzIGludG8gd2FpdGluZyBzdGF0ZSBhbmQgZG9lcyBub3RcbiAqIGVtZXJnZSBmcm9tIGl0IHdpdGhpbiBhIHNob3J0IGFtb3VudCBvZiB0aW1lLlxuICogQHBhcmFtIHshRWxlbWVudH0gdmlkZW9cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gb25Ob250cml2aWFsV2FpdCh2aWRlbywgY2FsbGJhY2spIHtcbiAgbGlzdGVuKHZpZGVvLCAnd2FpdGluZycsICgpID0+IHtcbiAgICAvLyBEbyBub3QgdHJpZ2dlciBkb3duZ3JhZGUgaWYgbm90IGxvYWRlZCBtZXRhZGF0YSB5ZXQsIG9yIGlmIHZpZGVvIGlzIGZ1bGx5IGxvYWRlZCAoZWc6IHJlcGxheSkuXG4gICAgaWYgKHZpZGVvLnJlYWR5U3RhdGUgPCAxIHx8IGdldEJ1ZmZlcmVkUGVyY2VudGFnZSh2aWRlbykgPiAwLjk5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCB0aW1lciA9IG51bGw7XG4gICAgY29uc3QgdW5saXN0ZW4gPSBsaXN0ZW5PbmNlKHZpZGVvLCAncGxheWluZycsICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgfSk7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHVubGlzdGVuKCk7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH0sIDEwMCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNvdXJjZSBlbGVtZW50IGZvciB3aGljaCB0aGUgY2FsbGJhY2sgcmV0dXJucyB0cnVlLlxuICogQHBhcmFtIHshRWxlbWVudH0gdmlkZW9cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oIUhUTUxTb3VyY2VFbGVtZW50KTpib29sZWFufSBmblxuICogQHJldHVybiB7P0hUTUxTb3VyY2VFbGVtZW50fVxuICovXG5mdW5jdGlvbiBzb3VyY2VzKHZpZGVvLCBmbikge1xuICByZXR1cm4gLyoqIEB0eXBlIHs/SFRNTFNvdXJjZUVsZW1lbnR9ICovIChcbiAgICBjaGlsZEVsZW1lbnQodmlkZW8sIChzb3VyY2UpID0+IHtcbiAgICAgIGlmIChzb3VyY2UudGFnTmFtZSAhPSAnU09VUkNFJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gZm4oLyoqIEB0eXBlIHshSFRNTFNvdXJjZUVsZW1lbnR9ICovIChzb3VyY2UpKTtcbiAgICB9KVxuICApO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnRseSBhY3RpdmUgc291cmNlIGVsZW1lbnQgb2YgdGhlIHZpZGVvLlxuICogQHBhcmFtIHshRWxlbWVudH0gdmlkZW9cbiAqIEByZXR1cm4geyFIVE1MU291cmNlRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY3VycmVudFNvdXJjZSh2aWRlbykge1xuICByZXR1cm4gZGV2QXNzZXJ0KFxuICAgIHNvdXJjZXModmlkZW8sIChzb3VyY2UpID0+IHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc3JjID09IHZpZGVvLmN1cnJlbnRTcmM7XG4gICAgfSlcbiAgKTtcbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHshRWxlbWVudH0gdmlkZW9FbFxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgcGVyY2VudGFnZSBidWZmZXJlZCBbMC0xXVxuICovXG5mdW5jdGlvbiBnZXRCdWZmZXJlZFBlcmNlbnRhZ2UodmlkZW9FbCkge1xuICAvLyB2aWRlb0VsLmR1cmF0aW9uIGNhbiBiZSBOYU4gaWYgdmlkZW8gaXMgbm90IGxvYWRlZCBvciAwLlxuICBpZiAoIXZpZGVvRWwuZHVyYXRpb24pIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICBsZXQgYnVmZmVyZWRTdW0gPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHZpZGVvRWwuYnVmZmVyZWQubGVuZ3RoOyBpKyspIHtcbiAgICBidWZmZXJlZFN1bSArPSB2aWRlb0VsLmJ1ZmZlcmVkLmVuZChpKSAtIHZpZGVvRWwuYnVmZmVyZWQuc3RhcnQoaSk7XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcmVkU3VtIC8gdmlkZW9FbC5kdXJhdGlvbjtcbn1cblxuLyoqXG4gKiBDaGVja3MgZm9yIHRoZSB2aWRlbyBidWZmZXIgcGVyY2VudGFnZSB0byBrbm93IGlmIGEgdmlkZW8gaXMgbG9hZGVkXG4gKiAoY2FuIGJlIG92ZXJyaWRlbiB3aXRoIHRoZSBhdHRyaWJ1dGUgYGktYW1waHRtbC1pcy12aWRlby1mdWxseS1sb2FkZWQtb3ZlcnJpZGUtZm9yLXRlc3RpbmdgKS5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IHZpZGVvRWxcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzVmlkZW9Mb2FkZWQodmlkZW9FbCkge1xuICBpZiAodmlkZW9FbC5oYXNBdHRyaWJ1dGUoSVNfVklERU9fRlVMTFlfTE9BREVEX09WRVJSSURFX0ZPUl9URVNUSU5HKSkge1xuICAgIHJldHVybiAoXG4gICAgICB2aWRlb0VsLmdldEF0dHJpYnV0ZShJU19WSURFT19GVUxMWV9MT0FERURfT1ZFUlJJREVfRk9SX1RFU1RJTkcpID09PVxuICAgICAgJ3RydWUnXG4gICAgKTtcbiAgfVxuICByZXR1cm4gZ2V0QnVmZmVyZWRQZXJjZW50YWdlKHZpZGVvRWwpID4gQlVGRkVSRURfVEhSRVNIT0xEX1BFUkNFTlRBR0U7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-video/0.1/flexible-bitrate.js