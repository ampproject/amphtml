function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { MEDIA_LOAD_FAILURE_SRC_PROPERTY, listen } from "../../../src/event-helper";
import { Services } from "../../../src/service";
import { TickLabel } from "../../../src/core/constants/enums";
import { dev } from "../../../src/log";
import { lastChildElement, matches } from "../../../src/core/dom/query";
import { registerServiceBuilder } from "../../../src/service-helpers";
import { toArray } from "../../../src/core/types/array";

/**
 * Media status.
 * @enum
 */
var Status = {
  ERRORED: 0,
  PAUSED: 1,
  PLAYING: 2,
  WAITING: 3
};

/**
 * Cache serving status.
 * @enum
 */
var CacheState = {
  ORIGIN: 0,
  // Served from origin.
  ORIGIN_CACHE_MISS: 1,
  // Served from origin even though cache URL was present.
  CACHE: 2 // Served from cache.

};

/**
 * Video is first page status.
 * @enum
 */
var FirstPageState = {
  NOT_ON_FIRST_PAGE: 0,
  // Video is not on the first page.
  ON_FIRST_PAGE: 1 // Video is on the first page.

};

/**
 * @typedef {{
 *   start: number,
 *   playing: number,
 *   waiting: number,
 * }}
 */
var TimeStampsDef;

/**
 * @typedef {{
 *   error: ?number,
 *   jointLatency: number,
 *   rebuffers: number,
 *   rebufferTime: number,
 *   watchTime: number
 * }}
 */
var MetricsDef;

/**
 * @typedef {{
 *   media: !HTMLMediaElement,
 *   status: number,
 *   unlisteners: !Array<!UnlistenDef>,
 *   timeStamps: !TimeStampsDef,
 *   metrics: !MetricsDef
 * }}
 */
var MediaEntryDef;

/** @type {number} */
var MINIMUM_TIME_THRESHOLD_MS = 1000;

/** @type {number} */
var REBUFFER_THRESHOLD_MS = 250;

/** @type {string} */
var TAG = 'media-performance-metrics';

/**
 * Util function to retrieve the media performance metrics service. Ensures we
 * can retrieve the service synchronously from the amp-story codebase without
 * running into race conditions.
 * @param  {!Window} win
 * @return {!MediaPerformanceMetricsService}
 */
export var getMediaPerformanceMetricsService = function getMediaPerformanceMetricsService(win) {
  var service = Services.mediaPerformanceMetricsService(win);

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
export var MediaPerformanceMetricsService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function MediaPerformanceMetricsService(win) {
    _classCallCheck(this, MediaPerformanceMetricsService);

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
  _createClass(MediaPerformanceMetricsService, [{
    key: "isPerformanceTrackingOn",
    value: function isPerformanceTrackingOn() {
      return this.performanceService_.isPerformanceTrackingOn();
    }
    /**
     * Starts recording performance metrics for a a given HTMLMediaElement. This
     * method has to be called right before trying to play the media. This allows
     * to reliably record joint latency (time to play), as well initial buffering.
     * @param {!HTMLMediaElement} media
     */

  }, {
    key: "startMeasuring",
    value: function startMeasuring(media) {
      // Media must start paused in order to determine the joint latency, and
      // initial buffering, if any.
      if (!media.paused) {
        dev().expectedError(TAG, 'media must start paused');
        return;
      }

      var unlisteners = this.listen_(media);
      var mediaEntry = this.getNewMediaEntry_(media, unlisteners);
      this.mediaMap_.set(media, mediaEntry);

      // Checks if the media already errored (eg: could have failed the source
      // selection).
      if (media.error || media[MEDIA_LOAD_FAILURE_SRC_PROPERTY] === media.currentSrc) {
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

  }, {
    key: "stopMeasuring",
    value: function stopMeasuring(media, sendMetrics) {
      if (sendMetrics === void 0) {
        sendMetrics = true;
      }

      var mediaEntry = this.mediaMap_.get(media);

      if (!mediaEntry) {
        return;
      }

      mediaEntry.unlisteners.forEach(function (unlisten) {
        return unlisten();
      });
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

  }, {
    key: "sendMetrics_",
    value: function sendMetrics_(mediaEntry) {
      var media = mediaEntry.media,
          metrics = mediaEntry.metrics;
      this.performanceService_.tickDelta(TickLabel.VIDEO_CACHE_STATE, this.getVideoCacheState_(media));
      this.performanceService_.tickDelta(TickLabel.VIDEO_ON_FIRST_PAGE, matches(media, "amp-story-page:first-of-type " + media.tagName) ? FirstPageState.ON_FIRST_PAGE : FirstPageState.NOT_ON_FIRST_PAGE);

      // If the media errored.
      if (metrics.error !== null) {
        this.performanceService_.tickDelta(TickLabel.VIDEO_ERROR, metrics.error || 0);
        this.performanceService_.flush();
        return;
      }

      // If the user was on the video for less than one second, ignore the metrics
      // (eg: users tapping through a story, or scrolling through content).
      if (!metrics.jointLatency && Date.now() - mediaEntry.timeStamps.start < MINIMUM_TIME_THRESHOLD_MS) {
        return;
      }

      // If the playback did not start.
      if (!metrics.jointLatency) {
        this.performanceService_.tickDelta(TickLabel.VIDEO_ERROR, 5
        /* Custom error code */
        );
        this.performanceService_.flush();
        return;
      }

      var rebufferRate = Math.round(metrics.rebufferTime / (metrics.rebufferTime + metrics.watchTime) * 100);
      this.performanceService_.tickDelta(TickLabel.VIDEO_JOINT_LATENCY, metrics.jointLatency);
      this.performanceService_.tickDelta(TickLabel.VIDEO_WATCH_TIME, metrics.watchTime);
      this.performanceService_.tickDelta(TickLabel.VIDEO_REBUFFERS, metrics.rebuffers);
      this.performanceService_.tickDelta(TickLabel.VIDEO_REBUFFER_RATE, rebufferRate);

      if (metrics.rebuffers) {
        this.performanceService_.tickDelta(TickLabel.VIDEO_MEAN_TIME_BETWEEN_REBUFFER, Math.round(metrics.watchTime / metrics.rebuffers));
      }

      this.performanceService_.flush();
    }
    /**
     * @param {!HTMLMediaElement} media
     * @param {!Array<!UnlistenDef>} unlisteners
     * @return {!MediaEntryDef}
     * @private
     */

  }, {
    key: "getNewMediaEntry_",
    value: function getNewMediaEntry_(media, unlisteners) {
      return {
        media: media,
        status: Status.PAUSED,
        unlisteners: unlisteners,
        timeStamps: {
          start: Date.now(),
          playing: 0,
          waiting: 0
        },
        metrics: {
          error: null,
          jointLatency: 0,
          meanTimeBetweenRebuffers: 0,
          rebuffers: 0,
          rebufferTime: 0,
          watchTime: 0
        }
      };
    }
    /**
     * Increments the watch time with the duration from the last `playing` event.
     * @param {!MediaEntryDef} mediaEntry
     * @private
     */

  }, {
    key: "addWatchTime_",
    value: function addWatchTime_(mediaEntry) {
      mediaEntry.metrics.watchTime += Date.now() - mediaEntry.timeStamps.playing;
    }
    /**
     * Increments the rebuffer time with the duration from the last `waiting`
     * event, and increments the rebuffers count.
     * @param {!MediaEntryDef} mediaEntry
     * @private
     */

  }, {
    key: "addRebuffer_",
    value: function addRebuffer_(mediaEntry) {
      var rebufferTime = Date.now() - mediaEntry.timeStamps.waiting;

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

  }, {
    key: "listen_",
    value: function listen_(media) {
      var unlisteners = [listen(media, 'ended', this.onPauseOrEnded_.bind(this)), listen(media, 'pause', this.onPauseOrEnded_.bind(this)), listen(media, 'playing', this.onPlaying_.bind(this)), listen(media, 'waiting', this.onWaiting_.bind(this))];
      // If the media element has no `src`, it will try to load the sources in
      // document order. If the last source errors, then the media element
      // loading errored.
      var errorTarget = media;

      if (!media.hasAttribute('src')) {
        errorTarget = lastChildElement(media, function (child) {
          return child.tagName === 'SOURCE';
        });
      }

      unlisteners.push(listen(errorTarget || media, 'error', this.onError_.bind(this)));
      return unlisteners;
    }
    /**
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onError_",
    value: function onError_(event) {
      // Media error target could be either HTMLMediaElement or HTMLSourceElement.
      var media = event.target.tagName === 'SOURCE' ? event.target.parent : event.target;
      var mediaEntry = this.mediaMap_.get(media);
      mediaEntry.metrics.error = media.error ? media.error.code : 0;
      mediaEntry.status = Status.ERRORED;
    }
    /**
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onPauseOrEnded_",
    value: function onPauseOrEnded_(event) {
      var mediaEntry = this.mediaMap_.get(event.target);

      if (mediaEntry.status === Status.PLAYING) {
        this.addWatchTime_(mediaEntry);
      }

      mediaEntry.status = Status.PAUSED;
    }
    /**
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onPlaying_",
    value: function onPlaying_(event) {
      var mediaEntry = this.mediaMap_.get(event.target);
      var metrics = mediaEntry.metrics,
          timeStamps = mediaEntry.timeStamps;

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

  }, {
    key: "onWaiting_",
    value: function onWaiting_(event) {
      var mediaEntry = this.mediaMap_.get(event.target);
      var timeStamps = mediaEntry.timeStamps;

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

  }, {
    key: "getVideoCacheState_",
    value: function getVideoCacheState_(media) {
      var hasCachedSource = false;
      // All video caching mechanisms rely on HTMLSourceElements and never a src
      // on the HTMLMediaElement as it does not allow for fallback sources.
      var sources = toArray(media.querySelectorAll('source'));

      for (var _iterator = _createForOfIteratorHelperLoose(sources), _step; !(_step = _iterator()).done;) {
        var source = _step.value;
        var isCachedSource = source.hasAttribute('i-amphtml-video-cached-source');

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
  }]);

  return MediaPerformanceMetricsService;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lZGlhLXBlcmZvcm1hbmNlLW1ldHJpY3Mtc2VydmljZS5qcyJdLCJuYW1lcyI6WyJNRURJQV9MT0FEX0ZBSUxVUkVfU1JDX1BST1BFUlRZIiwibGlzdGVuIiwiU2VydmljZXMiLCJUaWNrTGFiZWwiLCJkZXYiLCJsYXN0Q2hpbGRFbGVtZW50IiwibWF0Y2hlcyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJ0b0FycmF5IiwiU3RhdHVzIiwiRVJST1JFRCIsIlBBVVNFRCIsIlBMQVlJTkciLCJXQUlUSU5HIiwiQ2FjaGVTdGF0ZSIsIk9SSUdJTiIsIk9SSUdJTl9DQUNIRV9NSVNTIiwiQ0FDSEUiLCJGaXJzdFBhZ2VTdGF0ZSIsIk5PVF9PTl9GSVJTVF9QQUdFIiwiT05fRklSU1RfUEFHRSIsIlRpbWVTdGFtcHNEZWYiLCJNZXRyaWNzRGVmIiwiTWVkaWFFbnRyeURlZiIsIk1JTklNVU1fVElNRV9USFJFU0hPTERfTVMiLCJSRUJVRkZFUl9USFJFU0hPTERfTVMiLCJUQUciLCJnZXRNZWRpYVBlcmZvcm1hbmNlTWV0cmljc1NlcnZpY2UiLCJ3aW4iLCJzZXJ2aWNlIiwibWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlIiwiTWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlIiwibWVkaWFNYXBfIiwiV2Vha01hcCIsInBlcmZvcm1hbmNlU2VydmljZV8iLCJwZXJmb3JtYW5jZUZvciIsImlzUGVyZm9ybWFuY2VUcmFja2luZ09uIiwibWVkaWEiLCJwYXVzZWQiLCJleHBlY3RlZEVycm9yIiwidW5saXN0ZW5lcnMiLCJsaXN0ZW5fIiwibWVkaWFFbnRyeSIsImdldE5ld01lZGlhRW50cnlfIiwic2V0IiwiZXJyb3IiLCJjdXJyZW50U3JjIiwibWV0cmljcyIsImNvZGUiLCJzdGF0dXMiLCJzZW5kTWV0cmljcyIsImdldCIsImZvckVhY2giLCJ1bmxpc3RlbiIsImRlbGV0ZSIsImFkZFdhdGNoVGltZV8iLCJhZGRSZWJ1ZmZlcl8iLCJzZW5kTWV0cmljc18iLCJ0aWNrRGVsdGEiLCJWSURFT19DQUNIRV9TVEFURSIsImdldFZpZGVvQ2FjaGVTdGF0ZV8iLCJWSURFT19PTl9GSVJTVF9QQUdFIiwidGFnTmFtZSIsIlZJREVPX0VSUk9SIiwiZmx1c2giLCJqb2ludExhdGVuY3kiLCJEYXRlIiwibm93IiwidGltZVN0YW1wcyIsInN0YXJ0IiwicmVidWZmZXJSYXRlIiwiTWF0aCIsInJvdW5kIiwicmVidWZmZXJUaW1lIiwid2F0Y2hUaW1lIiwiVklERU9fSk9JTlRfTEFURU5DWSIsIlZJREVPX1dBVENIX1RJTUUiLCJWSURFT19SRUJVRkZFUlMiLCJyZWJ1ZmZlcnMiLCJWSURFT19SRUJVRkZFUl9SQVRFIiwiVklERU9fTUVBTl9USU1FX0JFVFdFRU5fUkVCVUZGRVIiLCJwbGF5aW5nIiwid2FpdGluZyIsIm1lYW5UaW1lQmV0d2VlblJlYnVmZmVycyIsIm9uUGF1c2VPckVuZGVkXyIsImJpbmQiLCJvblBsYXlpbmdfIiwib25XYWl0aW5nXyIsImVycm9yVGFyZ2V0IiwiaGFzQXR0cmlidXRlIiwiY2hpbGQiLCJwdXNoIiwib25FcnJvcl8iLCJldmVudCIsInRhcmdldCIsInBhcmVudCIsImhhc0NhY2hlZFNvdXJjZSIsInNvdXJjZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwic291cmNlIiwiaXNDYWNoZWRTb3VyY2UiLCJzcmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLCtCQURGLEVBRUVDLE1BRkY7QUFJQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxnQkFBUixFQUEwQkMsT0FBMUI7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLE9BQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxNQUFNLEdBQUc7QUFDYkMsRUFBQUEs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QUFVLENBQUNDLE1BQW5FO0FBQ0Q7QUFyVUg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBNRURJQV9MT0FEX0ZBSUxVUkVfU1JDX1BST1BFUlRZLFxuICBsaXN0ZW4sXG59IGZyb20gJy4uLy4uLy4uL3NyYy9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtUaWNrTGFiZWx9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9lbnVtcyc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2xhc3RDaGlsZEVsZW1lbnQsIG1hdGNoZXN9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHt0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5cbi8qKlxuICogTWVkaWEgc3RhdHVzLlxuICogQGVudW1cbiAqL1xuY29uc3QgU3RhdHVzID0ge1xuICBFUlJPUkVEOiAwLFxuICBQQVVTRUQ6IDEsXG4gIFBMQVlJTkc6IDIsXG4gIFdBSVRJTkc6IDMsXG59O1xuXG4vKipcbiAqIENhY2hlIHNlcnZpbmcgc3RhdHVzLlxuICogQGVudW1cbiAqL1xuY29uc3QgQ2FjaGVTdGF0ZSA9IHtcbiAgT1JJR0lOOiAwLCAvLyBTZXJ2ZWQgZnJvbSBvcmlnaW4uXG4gIE9SSUdJTl9DQUNIRV9NSVNTOiAxLCAvLyBTZXJ2ZWQgZnJvbSBvcmlnaW4gZXZlbiB0aG91Z2ggY2FjaGUgVVJMIHdhcyBwcmVzZW50LlxuICBDQUNIRTogMiwgLy8gU2VydmVkIGZyb20gY2FjaGUuXG59O1xuXG4vKipcbiAqIFZpZGVvIGlzIGZpcnN0IHBhZ2Ugc3RhdHVzLlxuICogQGVudW1cbiAqL1xuY29uc3QgRmlyc3RQYWdlU3RhdGUgPSB7XG4gIE5PVF9PTl9GSVJTVF9QQUdFOiAwLCAvLyBWaWRlbyBpcyBub3Qgb24gdGhlIGZpcnN0IHBhZ2UuXG4gIE9OX0ZJUlNUX1BBR0U6IDEsIC8vIFZpZGVvIGlzIG9uIHRoZSBmaXJzdCBwYWdlLlxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBzdGFydDogbnVtYmVyLFxuICogICBwbGF5aW5nOiBudW1iZXIsXG4gKiAgIHdhaXRpbmc6IG51bWJlcixcbiAqIH19XG4gKi9cbmxldCBUaW1lU3RhbXBzRGVmO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGVycm9yOiA/bnVtYmVyLFxuICogICBqb2ludExhdGVuY3k6IG51bWJlcixcbiAqICAgcmVidWZmZXJzOiBudW1iZXIsXG4gKiAgIHJlYnVmZmVyVGltZTogbnVtYmVyLFxuICogICB3YXRjaFRpbWU6IG51bWJlclxuICogfX1cbiAqL1xubGV0IE1ldHJpY3NEZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgbWVkaWE6ICFIVE1MTWVkaWFFbGVtZW50LFxuICogICBzdGF0dXM6IG51bWJlcixcbiAqICAgdW5saXN0ZW5lcnM6ICFBcnJheTwhVW5saXN0ZW5EZWY+LFxuICogICB0aW1lU3RhbXBzOiAhVGltZVN0YW1wc0RlZixcbiAqICAgbWV0cmljczogIU1ldHJpY3NEZWZcbiAqIH19XG4gKi9cbmxldCBNZWRpYUVudHJ5RGVmO1xuXG4vKiogQHR5cGUge251bWJlcn0gKi9cbmNvbnN0IE1JTklNVU1fVElNRV9USFJFU0hPTERfTVMgPSAxMDAwO1xuXG4vKiogQHR5cGUge251bWJlcn0gKi9cbmNvbnN0IFJFQlVGRkVSX1RIUkVTSE9MRF9NUyA9IDI1MDtcblxuLyoqIEB0eXBlIHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnbWVkaWEtcGVyZm9ybWFuY2UtbWV0cmljcyc7XG5cbi8qKlxuICogVXRpbCBmdW5jdGlvbiB0byByZXRyaWV2ZSB0aGUgbWVkaWEgcGVyZm9ybWFuY2UgbWV0cmljcyBzZXJ2aWNlLiBFbnN1cmVzIHdlXG4gKiBjYW4gcmV0cmlldmUgdGhlIHNlcnZpY2Ugc3luY2hyb25vdXNseSBmcm9tIHRoZSBhbXAtc3RvcnkgY29kZWJhc2Ugd2l0aG91dFxuICogcnVubmluZyBpbnRvIHJhY2UgY29uZGl0aW9ucy5cbiAqIEBwYXJhbSAgeyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IU1lZGlhUGVyZm9ybWFuY2VNZXRyaWNzU2VydmljZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldE1lZGlhUGVyZm9ybWFuY2VNZXRyaWNzU2VydmljZSA9ICh3aW4pID0+IHtcbiAgbGV0IHNlcnZpY2UgPSBTZXJ2aWNlcy5tZWRpYVBlcmZvcm1hbmNlTWV0cmljc1NlcnZpY2Uod2luKTtcblxuICBpZiAoIXNlcnZpY2UpIHtcbiAgICBzZXJ2aWNlID0gbmV3IE1lZGlhUGVyZm9ybWFuY2VNZXRyaWNzU2VydmljZSh3aW4pO1xuICAgIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXIod2luLCAnbWVkaWEtcGVyZm9ybWFuY2UtbWV0cmljcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzZXJ2aWNlO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHNlcnZpY2U7XG59O1xuXG4vKipcbiAqIE1lZGlhIHBlcmZvcm1hbmNlIG1ldHJpY3Mgc2VydmljZS5cbiAqIEBmaW5hbFxuICovXG5leHBvcnQgY2xhc3MgTWVkaWFQZXJmb3JtYW5jZU1ldHJpY3NTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4pIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshV2Vha01hcDxIVE1MTWVkaWFFbGVtZW50fEV2ZW50VGFyZ2V0fG51bGwsICFNZWRpYUVudHJ5RGVmPn0gKi9cbiAgICB0aGlzLm1lZGlhTWFwXyA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvcGVyZm9ybWFuY2UtaW1wbC5QZXJmb3JtYW5jZX0gKi9cbiAgICB0aGlzLnBlcmZvcm1hbmNlU2VydmljZV8gPSBTZXJ2aWNlcy5wZXJmb3JtYW5jZUZvcih3aW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIElkZW50aWZpZXMgaWYgdGhlIHZpZXdlciBpcyBhYmxlIHRvIHRyYWNrIHBlcmZvcm1hbmNlLiBJZiB0aGUgZG9jdW1lbnQgaXNcbiAgICogbm90IGVtYmVkZGVkLCB0aGVyZSBpcyBubyBtZXNzYWdpbmcgY2hhbm5lbCwgc28gbm8gcGVyZm9ybWFuY2UgdHJhY2tpbmcgaXNcbiAgICogbmVlZGVkIHNpbmNlIHRoZXJlIGlzIG5vYm9keSB0byBmb3J3YXJkIHRoZSBldmVudHMuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1BlcmZvcm1hbmNlVHJhY2tpbmdPbigpIHtcbiAgICByZXR1cm4gdGhpcy5wZXJmb3JtYW5jZVNlcnZpY2VfLmlzUGVyZm9ybWFuY2VUcmFja2luZ09uKCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHJlY29yZGluZyBwZXJmb3JtYW5jZSBtZXRyaWNzIGZvciBhIGEgZ2l2ZW4gSFRNTE1lZGlhRWxlbWVudC4gVGhpc1xuICAgKiBtZXRob2QgaGFzIHRvIGJlIGNhbGxlZCByaWdodCBiZWZvcmUgdHJ5aW5nIHRvIHBsYXkgdGhlIG1lZGlhLiBUaGlzIGFsbG93c1xuICAgKiB0byByZWxpYWJseSByZWNvcmQgam9pbnQgbGF0ZW5jeSAodGltZSB0byBwbGF5KSwgYXMgd2VsbCBpbml0aWFsIGJ1ZmZlcmluZy5cbiAgICogQHBhcmFtIHshSFRNTE1lZGlhRWxlbWVudH0gbWVkaWFcbiAgICovXG4gIHN0YXJ0TWVhc3VyaW5nKG1lZGlhKSB7XG4gICAgLy8gTWVkaWEgbXVzdCBzdGFydCBwYXVzZWQgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHRoZSBqb2ludCBsYXRlbmN5LCBhbmRcbiAgICAvLyBpbml0aWFsIGJ1ZmZlcmluZywgaWYgYW55LlxuICAgIGlmICghbWVkaWEucGF1c2VkKSB7XG4gICAgICBkZXYoKS5leHBlY3RlZEVycm9yKFRBRywgJ21lZGlhIG11c3Qgc3RhcnQgcGF1c2VkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdW5saXN0ZW5lcnMgPSB0aGlzLmxpc3Rlbl8obWVkaWEpO1xuICAgIGNvbnN0IG1lZGlhRW50cnkgPSB0aGlzLmdldE5ld01lZGlhRW50cnlfKG1lZGlhLCB1bmxpc3RlbmVycyk7XG4gICAgdGhpcy5tZWRpYU1hcF8uc2V0KG1lZGlhLCBtZWRpYUVudHJ5KTtcblxuICAgIC8vIENoZWNrcyBpZiB0aGUgbWVkaWEgYWxyZWFkeSBlcnJvcmVkIChlZzogY291bGQgaGF2ZSBmYWlsZWQgdGhlIHNvdXJjZVxuICAgIC8vIHNlbGVjdGlvbikuXG4gICAgaWYgKFxuICAgICAgbWVkaWEuZXJyb3IgfHxcbiAgICAgIG1lZGlhW01FRElBX0xPQURfRkFJTFVSRV9TUkNfUFJPUEVSVFldID09PSBtZWRpYS5jdXJyZW50U3JjXG4gICAgKSB7XG4gICAgICBtZWRpYUVudHJ5Lm1ldHJpY3MuZXJyb3IgPSBtZWRpYS5lcnJvciA/IG1lZGlhLmVycm9yLmNvZGUgOiAwO1xuICAgICAgbWVkaWFFbnRyeS5zdGF0dXMgPSBTdGF0dXMuRVJST1JFRDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgcmVjb3JkaW5nLCBjb21wdXRlcywgYW5kIHNlbmRzIHBlcmZvcm1hbmNlIG1ldHJpY3MgY29sbGVjdGVkIGZvciB0aGVcbiAgICogZ2l2ZW4gbWVkaWEgZWxlbWVudC5cbiAgICogQHBhcmFtIHshSFRNTE1lZGlhRWxlbWVudH0gbWVkaWFcbiAgICogQHBhcmFtIHtib29sZWFuPX0gc2VuZE1ldHJpY3NcbiAgICovXG4gIHN0b3BNZWFzdXJpbmcobWVkaWEsIHNlbmRNZXRyaWNzID0gdHJ1ZSkge1xuICAgIGNvbnN0IG1lZGlhRW50cnkgPSB0aGlzLm1lZGlhTWFwXy5nZXQobWVkaWEpO1xuXG4gICAgaWYgKCFtZWRpYUVudHJ5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWVkaWFFbnRyeS51bmxpc3RlbmVycy5mb3JFYWNoKCh1bmxpc3RlbikgPT4gdW5saXN0ZW4oKSk7XG4gICAgdGhpcy5tZWRpYU1hcF8uZGVsZXRlKG1lZGlhKTtcblxuICAgIHN3aXRjaCAobWVkaWFFbnRyeS5zdGF0dXMpIHtcbiAgICAgIGNhc2UgU3RhdHVzLlBMQVlJTkc6XG4gICAgICAgIHRoaXMuYWRkV2F0Y2hUaW1lXyhtZWRpYUVudHJ5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFN0YXR1cy5XQUlUSU5HOlxuICAgICAgICB0aGlzLmFkZFJlYnVmZmVyXyhtZWRpYUVudHJ5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHNlbmRNZXRyaWNzKSB7XG4gICAgICB0aGlzLnNlbmRNZXRyaWNzXyhtZWRpYUVudHJ5KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshTWVkaWFFbnRyeURlZn0gbWVkaWFFbnRyeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VuZE1ldHJpY3NfKG1lZGlhRW50cnkpIHtcbiAgICBjb25zdCB7bWVkaWEsIG1ldHJpY3N9ID0gbWVkaWFFbnRyeTtcblxuICAgIHRoaXMucGVyZm9ybWFuY2VTZXJ2aWNlXy50aWNrRGVsdGEoXG4gICAgICBUaWNrTGFiZWwuVklERU9fQ0FDSEVfU1RBVEUsXG4gICAgICB0aGlzLmdldFZpZGVvQ2FjaGVTdGF0ZV8obWVkaWEpXG4gICAgKTtcbiAgICB0aGlzLnBlcmZvcm1hbmNlU2VydmljZV8udGlja0RlbHRhKFxuICAgICAgVGlja0xhYmVsLlZJREVPX09OX0ZJUlNUX1BBR0UsXG4gICAgICBtYXRjaGVzKG1lZGlhLCBgYW1wLXN0b3J5LXBhZ2U6Zmlyc3Qtb2YtdHlwZSAke21lZGlhLnRhZ05hbWV9YClcbiAgICAgICAgPyBGaXJzdFBhZ2VTdGF0ZS5PTl9GSVJTVF9QQUdFXG4gICAgICAgIDogRmlyc3RQYWdlU3RhdGUuTk9UX09OX0ZJUlNUX1BBR0VcbiAgICApO1xuXG4gICAgLy8gSWYgdGhlIG1lZGlhIGVycm9yZWQuXG4gICAgaWYgKG1ldHJpY3MuZXJyb3IgIT09IG51bGwpIHtcbiAgICAgIHRoaXMucGVyZm9ybWFuY2VTZXJ2aWNlXy50aWNrRGVsdGEoXG4gICAgICAgIFRpY2tMYWJlbC5WSURFT19FUlJPUixcbiAgICAgICAgbWV0cmljcy5lcnJvciB8fCAwXG4gICAgICApO1xuICAgICAgdGhpcy5wZXJmb3JtYW5jZVNlcnZpY2VfLmZsdXNoKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHVzZXIgd2FzIG9uIHRoZSB2aWRlbyBmb3IgbGVzcyB0aGFuIG9uZSBzZWNvbmQsIGlnbm9yZSB0aGUgbWV0cmljc1xuICAgIC8vIChlZzogdXNlcnMgdGFwcGluZyB0aHJvdWdoIGEgc3RvcnksIG9yIHNjcm9sbGluZyB0aHJvdWdoIGNvbnRlbnQpLlxuICAgIGlmIChcbiAgICAgICFtZXRyaWNzLmpvaW50TGF0ZW5jeSAmJlxuICAgICAgRGF0ZS5ub3coKSAtIG1lZGlhRW50cnkudGltZVN0YW1wcy5zdGFydCA8IE1JTklNVU1fVElNRV9USFJFU0hPTERfTVNcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcGxheWJhY2sgZGlkIG5vdCBzdGFydC5cbiAgICBpZiAoIW1ldHJpY3Muam9pbnRMYXRlbmN5KSB7XG4gICAgICB0aGlzLnBlcmZvcm1hbmNlU2VydmljZV8udGlja0RlbHRhKFxuICAgICAgICBUaWNrTGFiZWwuVklERU9fRVJST1IsXG4gICAgICAgIDUgLyogQ3VzdG9tIGVycm9yIGNvZGUgKi9cbiAgICAgICk7XG4gICAgICB0aGlzLnBlcmZvcm1hbmNlU2VydmljZV8uZmx1c2goKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZWJ1ZmZlclJhdGUgPSBNYXRoLnJvdW5kKFxuICAgICAgKG1ldHJpY3MucmVidWZmZXJUaW1lIC8gKG1ldHJpY3MucmVidWZmZXJUaW1lICsgbWV0cmljcy53YXRjaFRpbWUpKSAqIDEwMFxuICAgICk7XG5cbiAgICB0aGlzLnBlcmZvcm1hbmNlU2VydmljZV8udGlja0RlbHRhKFxuICAgICAgVGlja0xhYmVsLlZJREVPX0pPSU5UX0xBVEVOQ1ksXG4gICAgICBtZXRyaWNzLmpvaW50TGF0ZW5jeVxuICAgICk7XG4gICAgdGhpcy5wZXJmb3JtYW5jZVNlcnZpY2VfLnRpY2tEZWx0YShcbiAgICAgIFRpY2tMYWJlbC5WSURFT19XQVRDSF9USU1FLFxuICAgICAgbWV0cmljcy53YXRjaFRpbWVcbiAgICApO1xuICAgIHRoaXMucGVyZm9ybWFuY2VTZXJ2aWNlXy50aWNrRGVsdGEoXG4gICAgICBUaWNrTGFiZWwuVklERU9fUkVCVUZGRVJTLFxuICAgICAgbWV0cmljcy5yZWJ1ZmZlcnNcbiAgICApO1xuICAgIHRoaXMucGVyZm9ybWFuY2VTZXJ2aWNlXy50aWNrRGVsdGEoXG4gICAgICBUaWNrTGFiZWwuVklERU9fUkVCVUZGRVJfUkFURSxcbiAgICAgIHJlYnVmZmVyUmF0ZVxuICAgICk7XG4gICAgaWYgKG1ldHJpY3MucmVidWZmZXJzKSB7XG4gICAgICB0aGlzLnBlcmZvcm1hbmNlU2VydmljZV8udGlja0RlbHRhKFxuICAgICAgICBUaWNrTGFiZWwuVklERU9fTUVBTl9USU1FX0JFVFdFRU5fUkVCVUZGRVIsXG4gICAgICAgIE1hdGgucm91bmQobWV0cmljcy53YXRjaFRpbWUgLyBtZXRyaWNzLnJlYnVmZmVycylcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMucGVyZm9ybWFuY2VTZXJ2aWNlXy5mbHVzaCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUhUTUxNZWRpYUVsZW1lbnR9IG1lZGlhXG4gICAqIEBwYXJhbSB7IUFycmF5PCFVbmxpc3RlbkRlZj59IHVubGlzdGVuZXJzXG4gICAqIEByZXR1cm4geyFNZWRpYUVudHJ5RGVmfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0TmV3TWVkaWFFbnRyeV8obWVkaWEsIHVubGlzdGVuZXJzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1lZGlhLFxuICAgICAgc3RhdHVzOiBTdGF0dXMuUEFVU0VELFxuICAgICAgdW5saXN0ZW5lcnMsXG4gICAgICB0aW1lU3RhbXBzOiB7XG4gICAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgICBwbGF5aW5nOiAwLFxuICAgICAgICB3YWl0aW5nOiAwLFxuICAgICAgfSxcbiAgICAgIG1ldHJpY3M6IHtcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGpvaW50TGF0ZW5jeTogMCxcbiAgICAgICAgbWVhblRpbWVCZXR3ZWVuUmVidWZmZXJzOiAwLFxuICAgICAgICByZWJ1ZmZlcnM6IDAsXG4gICAgICAgIHJlYnVmZmVyVGltZTogMCxcbiAgICAgICAgd2F0Y2hUaW1lOiAwLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEluY3JlbWVudHMgdGhlIHdhdGNoIHRpbWUgd2l0aCB0aGUgZHVyYXRpb24gZnJvbSB0aGUgbGFzdCBgcGxheWluZ2AgZXZlbnQuXG4gICAqIEBwYXJhbSB7IU1lZGlhRW50cnlEZWZ9IG1lZGlhRW50cnlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFkZFdhdGNoVGltZV8obWVkaWFFbnRyeSkge1xuICAgIG1lZGlhRW50cnkubWV0cmljcy53YXRjaFRpbWUgKz0gRGF0ZS5ub3coKSAtIG1lZGlhRW50cnkudGltZVN0YW1wcy5wbGF5aW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIEluY3JlbWVudHMgdGhlIHJlYnVmZmVyIHRpbWUgd2l0aCB0aGUgZHVyYXRpb24gZnJvbSB0aGUgbGFzdCBgd2FpdGluZ2BcbiAgICogZXZlbnQsIGFuZCBpbmNyZW1lbnRzIHRoZSByZWJ1ZmZlcnMgY291bnQuXG4gICAqIEBwYXJhbSB7IU1lZGlhRW50cnlEZWZ9IG1lZGlhRW50cnlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFkZFJlYnVmZmVyXyhtZWRpYUVudHJ5KSB7XG4gICAgY29uc3QgcmVidWZmZXJUaW1lID0gRGF0ZS5ub3coKSAtIG1lZGlhRW50cnkudGltZVN0YW1wcy53YWl0aW5nO1xuICAgIGlmIChyZWJ1ZmZlclRpbWUgPiBSRUJVRkZFUl9USFJFU0hPTERfTVMpIHtcbiAgICAgIG1lZGlhRW50cnkubWV0cmljcy5yZWJ1ZmZlcnMrKztcbiAgICAgIG1lZGlhRW50cnkubWV0cmljcy5yZWJ1ZmZlclRpbWUgKz0gcmVidWZmZXJUaW1lO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFIVE1MTWVkaWFFbGVtZW50fSBtZWRpYVxuICAgKiBAcmV0dXJuIHshQXJyYXk8IVVubGlzdGVuRGVmPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGxpc3Rlbl8obWVkaWEpIHtcbiAgICBjb25zdCB1bmxpc3RlbmVycyA9IFtcbiAgICAgIGxpc3RlbihtZWRpYSwgJ2VuZGVkJywgdGhpcy5vblBhdXNlT3JFbmRlZF8uYmluZCh0aGlzKSksXG4gICAgICBsaXN0ZW4obWVkaWEsICdwYXVzZScsIHRoaXMub25QYXVzZU9yRW5kZWRfLmJpbmQodGhpcykpLFxuICAgICAgbGlzdGVuKG1lZGlhLCAncGxheWluZycsIHRoaXMub25QbGF5aW5nXy5iaW5kKHRoaXMpKSxcbiAgICAgIGxpc3RlbihtZWRpYSwgJ3dhaXRpbmcnLCB0aGlzLm9uV2FpdGluZ18uYmluZCh0aGlzKSksXG4gICAgXTtcblxuICAgIC8vIElmIHRoZSBtZWRpYSBlbGVtZW50IGhhcyBubyBgc3JjYCwgaXQgd2lsbCB0cnkgdG8gbG9hZCB0aGUgc291cmNlcyBpblxuICAgIC8vIGRvY3VtZW50IG9yZGVyLiBJZiB0aGUgbGFzdCBzb3VyY2UgZXJyb3JzLCB0aGVuIHRoZSBtZWRpYSBlbGVtZW50XG4gICAgLy8gbG9hZGluZyBlcnJvcmVkLlxuICAgIGxldCBlcnJvclRhcmdldCA9IG1lZGlhO1xuICAgIGlmICghbWVkaWEuaGFzQXR0cmlidXRlKCdzcmMnKSkge1xuICAgICAgZXJyb3JUYXJnZXQgPSBsYXN0Q2hpbGRFbGVtZW50KFxuICAgICAgICBtZWRpYSxcbiAgICAgICAgKGNoaWxkKSA9PiBjaGlsZC50YWdOYW1lID09PSAnU09VUkNFJ1xuICAgICAgKTtcbiAgICB9XG4gICAgdW5saXN0ZW5lcnMucHVzaChcbiAgICAgIGxpc3RlbihlcnJvclRhcmdldCB8fCBtZWRpYSwgJ2Vycm9yJywgdGhpcy5vbkVycm9yXy5iaW5kKHRoaXMpKVxuICAgICk7XG5cbiAgICByZXR1cm4gdW5saXN0ZW5lcnM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkVycm9yXyhldmVudCkge1xuICAgIC8vIE1lZGlhIGVycm9yIHRhcmdldCBjb3VsZCBiZSBlaXRoZXIgSFRNTE1lZGlhRWxlbWVudCBvciBIVE1MU291cmNlRWxlbWVudC5cbiAgICBjb25zdCBtZWRpYSA9XG4gICAgICBldmVudC50YXJnZXQudGFnTmFtZSA9PT0gJ1NPVVJDRScgPyBldmVudC50YXJnZXQucGFyZW50IDogZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IG1lZGlhRW50cnkgPSB0aGlzLm1lZGlhTWFwXy5nZXQobWVkaWEpO1xuXG4gICAgbWVkaWFFbnRyeS5tZXRyaWNzLmVycm9yID0gbWVkaWEuZXJyb3IgPyBtZWRpYS5lcnJvci5jb2RlIDogMDtcbiAgICBtZWRpYUVudHJ5LnN0YXR1cyA9IFN0YXR1cy5FUlJPUkVEO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25QYXVzZU9yRW5kZWRfKGV2ZW50KSB7XG4gICAgY29uc3QgbWVkaWFFbnRyeSA9IHRoaXMubWVkaWFNYXBfLmdldChldmVudC50YXJnZXQpO1xuXG4gICAgaWYgKG1lZGlhRW50cnkuc3RhdHVzID09PSBTdGF0dXMuUExBWUlORykge1xuICAgICAgdGhpcy5hZGRXYXRjaFRpbWVfKG1lZGlhRW50cnkpO1xuICAgIH1cbiAgICBtZWRpYUVudHJ5LnN0YXR1cyA9IFN0YXR1cy5QQVVTRUQ7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblBsYXlpbmdfKGV2ZW50KSB7XG4gICAgY29uc3QgbWVkaWFFbnRyeSA9IHRoaXMubWVkaWFNYXBfLmdldChldmVudC50YXJnZXQpO1xuICAgIGNvbnN0IHttZXRyaWNzLCB0aW1lU3RhbXBzfSA9IG1lZGlhRW50cnk7XG5cbiAgICBpZiAoIW1ldHJpY3Muam9pbnRMYXRlbmN5KSB7XG4gICAgICBtZXRyaWNzLmpvaW50TGF0ZW5jeSA9IERhdGUubm93KCkgLSB0aW1lU3RhbXBzLnN0YXJ0O1xuICAgIH1cblxuICAgIGlmIChtZWRpYUVudHJ5LnN0YXR1cyA9PT0gU3RhdHVzLldBSVRJTkcpIHtcbiAgICAgIHRoaXMuYWRkUmVidWZmZXJfKG1lZGlhRW50cnkpO1xuICAgIH1cblxuICAgIHRpbWVTdGFtcHMucGxheWluZyA9IERhdGUubm93KCk7XG4gICAgbWVkaWFFbnRyeS5zdGF0dXMgPSBTdGF0dXMuUExBWUlORztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uV2FpdGluZ18oZXZlbnQpIHtcbiAgICBjb25zdCBtZWRpYUVudHJ5ID0gdGhpcy5tZWRpYU1hcF8uZ2V0KGV2ZW50LnRhcmdldCk7XG4gICAgY29uc3Qge3RpbWVTdGFtcHN9ID0gbWVkaWFFbnRyeTtcblxuICAgIGlmIChtZWRpYUVudHJ5LnN0YXR1cyA9PT0gU3RhdHVzLlBMQVlJTkcpIHtcbiAgICAgIHRoaXMuYWRkV2F0Y2hUaW1lXyhtZWRpYUVudHJ5KTtcbiAgICB9XG5cbiAgICB0aW1lU3RhbXBzLndhaXRpbmcgPSBEYXRlLm5vdygpO1xuICAgIG1lZGlhRW50cnkuc3RhdHVzID0gU3RhdHVzLldBSVRJTkc7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshSFRNTE1lZGlhRWxlbWVudH0gbWVkaWFcbiAgICogQHJldHVybiB7IUNhY2hlU3RhdGV9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRWaWRlb0NhY2hlU3RhdGVfKG1lZGlhKSB7XG4gICAgbGV0IGhhc0NhY2hlZFNvdXJjZSA9IGZhbHNlO1xuICAgIC8vIEFsbCB2aWRlbyBjYWNoaW5nIG1lY2hhbmlzbXMgcmVseSBvbiBIVE1MU291cmNlRWxlbWVudHMgYW5kIG5ldmVyIGEgc3JjXG4gICAgLy8gb24gdGhlIEhUTUxNZWRpYUVsZW1lbnQgYXMgaXQgZG9lcyBub3QgYWxsb3cgZm9yIGZhbGxiYWNrIHNvdXJjZXMuXG4gICAgY29uc3Qgc291cmNlcyA9IHRvQXJyYXkobWVkaWEucXVlcnlTZWxlY3RvckFsbCgnc291cmNlJykpO1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcbiAgICAgIGNvbnN0IGlzQ2FjaGVkU291cmNlID0gc291cmNlLmhhc0F0dHJpYnV0ZShcbiAgICAgICAgJ2ktYW1waHRtbC12aWRlby1jYWNoZWQtc291cmNlJ1xuICAgICAgKTtcbiAgICAgIC8vIFBsYXlpbmcgc291cmNlIGlzIGNhY2hlZC5cbiAgICAgIGlmIChpc0NhY2hlZFNvdXJjZSAmJiBtZWRpYS5jdXJyZW50U3JjID09PSBzb3VyY2Uuc3JjKSB7XG4gICAgICAgIHJldHVybiBDYWNoZVN0YXRlLkNBQ0hFO1xuICAgICAgfVxuICAgICAgLy8gTm9uIHBsYXlpbmcgc291cmNlIGJ1dCBpcyBjYWNoZWQuIFVzZWQgdG8gZGlmZmVyZW50aWF0ZSBhIGNhY2hlIG1pc3NcbiAgICAgIC8vIChlLmcuIGNhY2hlIHJldHVybmVkIGEgNDB4KSB2cyBubyBjYWNoZWQgc291cmNlIGF0IGFsbC5cbiAgICAgIGlmIChpc0NhY2hlZFNvdXJjZSkge1xuICAgICAgICBoYXNDYWNoZWRTb3VyY2UgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGFzQ2FjaGVkU291cmNlID8gQ2FjaGVTdGF0ZS5PUklHSU5fQ0FDSEVfTUlTUyA6IENhY2hlU3RhdGUuT1JJR0lOO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/media-performance-metrics-service.js