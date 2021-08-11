function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import {
MEDIA_LOAD_FAILURE_SRC_PROPERTY,
listen } from "../../../src/event-helper";

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
  WAITING: 3 };


/**
 * Cache serving status.
 * @enum
 */
var CacheState = {
  ORIGIN: 0, // Served from origin.
  ORIGIN_CACHE_MISS: 1, // Served from origin even though cache URL was present.
  CACHE: 2 // Served from cache.
};

/**
 * Video is first page status.
 * @enum
 */
var FirstPageState = {
  NOT_ON_FIRST_PAGE: 0, // Video is not on the first page.
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
  function MediaPerformanceMetricsService(win) {_classCallCheck(this, MediaPerformanceMetricsService);
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
   */_createClass(MediaPerformanceMetricsService, [{ key: "isPerformanceTrackingOn", value:
    function isPerformanceTrackingOn() {
      return this.performanceService_.isPerformanceTrackingOn();
    }

    /**
     * Starts recording performance metrics for a a given HTMLMediaElement. This
     * method has to be called right before trying to play the media. This allows
     * to reliably record joint latency (time to play), as well initial buffering.
     * @param {!HTMLMediaElement} media
     */ }, { key: "startMeasuring", value:
    function startMeasuring(media) {
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
      if (
      media.error ||
      media[MEDIA_LOAD_FAILURE_SRC_PROPERTY] === media.currentSrc)
      {
        mediaEntry.metrics.error = media.error ? media.error.code : 0;
        mediaEntry.status = Status.ERRORED;
      }
    }

    /**
     * Stops recording, computes, and sends performance metrics collected for the
     * given media element.
     * @param {!HTMLMediaElement} media
     * @param {boolean=} sendMetrics
     */ }, { key: "stopMeasuring", value:
    function stopMeasuring(media) {var sendMetrics = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var mediaEntry = this.mediaMap_.get(media);

      if (!mediaEntry) {
        return;
      }

      mediaEntry.unlisteners.forEach(function (unlisten) {return unlisten();});
      this.mediaMap_.delete(media);

      switch (mediaEntry.status) {
        case Status.PLAYING:
          this.addWatchTime_(mediaEntry);
          break;
        case Status.WAITING:
          this.addRebuffer_(mediaEntry);
          break;}


      if (sendMetrics) {
        this.sendMetrics_(mediaEntry);
      }
    }

    /**
     * @param {!MediaEntryDef} mediaEntry
     * @private
     */ }, { key: "sendMetrics_", value:
    function sendMetrics_(mediaEntry) {
      var media = mediaEntry.media,metrics = mediaEntry.metrics;

      this.performanceService_.tickDelta(
      TickLabel.VIDEO_CACHE_STATE,
      this.getVideoCacheState_(media));

      this.performanceService_.tickDelta(
      TickLabel.VIDEO_ON_FIRST_PAGE,
      matches(media, "amp-story-page:first-of-type ".concat(media.tagName)) ?
      FirstPageState.ON_FIRST_PAGE :
      FirstPageState.NOT_ON_FIRST_PAGE);


      // If the media errored.
      if (metrics.error !== null) {
        this.performanceService_.tickDelta(
        TickLabel.VIDEO_ERROR,
        metrics.error || 0);

        this.performanceService_.flush();
        return;
      }

      // If the user was on the video for less than one second, ignore the metrics
      // (eg: users tapping through a story, or scrolling through content).
      if (
      !metrics.jointLatency &&
      Date.now() - mediaEntry.timeStamps.start < MINIMUM_TIME_THRESHOLD_MS)
      {
        return;
      }

      // If the playback did not start.
      if (!metrics.jointLatency) {
        this.performanceService_.tickDelta(
        TickLabel.VIDEO_ERROR,
        5 /* Custom error code */);

        this.performanceService_.flush();
        return;
      }

      var rebufferRate = Math.round(
      (metrics.rebufferTime / (metrics.rebufferTime + metrics.watchTime)) * 100);


      this.performanceService_.tickDelta(
      TickLabel.VIDEO_JOINT_LATENCY,
      metrics.jointLatency);

      this.performanceService_.tickDelta(
      TickLabel.VIDEO_WATCH_TIME,
      metrics.watchTime);

      this.performanceService_.tickDelta(
      TickLabel.VIDEO_REBUFFERS,
      metrics.rebuffers);

      this.performanceService_.tickDelta(
      TickLabel.VIDEO_REBUFFER_RATE,
      rebufferRate);

      if (metrics.rebuffers) {
        this.performanceService_.tickDelta(
        TickLabel.VIDEO_MEAN_TIME_BETWEEN_REBUFFER,
        Math.round(metrics.watchTime / metrics.rebuffers));

      }
      this.performanceService_.flush();
    }

    /**
     * @param {!HTMLMediaElement} media
     * @param {!Array<!UnlistenDef>} unlisteners
     * @return {!MediaEntryDef}
     * @private
     */ }, { key: "getNewMediaEntry_", value:
    function getNewMediaEntry_(media, unlisteners) {
      return {
        media: media,
        status: Status.PAUSED,
        unlisteners: unlisteners,
        timeStamps: {
          start: Date.now(),
          playing: 0,
          waiting: 0 },

        metrics: {
          error: null,
          jointLatency: 0,
          meanTimeBetweenRebuffers: 0,
          rebuffers: 0,
          rebufferTime: 0,
          watchTime: 0 } };


    }

    /**
     * Increments the watch time with the duration from the last `playing` event.
     * @param {!MediaEntryDef} mediaEntry
     * @private
     */ }, { key: "addWatchTime_", value:
    function addWatchTime_(mediaEntry) {
      mediaEntry.metrics.watchTime += Date.now() - mediaEntry.timeStamps.playing;
    }

    /**
     * Increments the rebuffer time with the duration from the last `waiting`
     * event, and increments the rebuffers count.
     * @param {!MediaEntryDef} mediaEntry
     * @private
     */ }, { key: "addRebuffer_", value:
    function addRebuffer_(mediaEntry) {
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
     */ }, { key: "listen_", value:
    function listen_(media) {
      var unlisteners = [
      listen(media, 'ended', this.onPauseOrEnded_.bind(this)),
      listen(media, 'pause', this.onPauseOrEnded_.bind(this)),
      listen(media, 'playing', this.onPlaying_.bind(this)),
      listen(media, 'waiting', this.onWaiting_.bind(this))];


      // If the media element has no `src`, it will try to load the sources in
      // document order. If the last source errors, then the media element
      // loading errored.
      var errorTarget = media;
      if (!media.hasAttribute('src')) {
        errorTarget = lastChildElement(
        media,
        function (child) {return child.tagName === 'SOURCE';});

      }
      unlisteners.push(
      listen(errorTarget || media, 'error', this.onError_.bind(this)));


      return unlisteners;
    }

    /**
     * @param {!Event} event
     * @private
     */ }, { key: "onError_", value:
    function onError_(event) {
      // Media error target could be either HTMLMediaElement or HTMLSourceElement.
      var media =
      event.target.tagName === 'SOURCE' ? event.target.parent : event.target;
      var mediaEntry = this.mediaMap_.get(media);

      mediaEntry.metrics.error = media.error ? media.error.code : 0;
      mediaEntry.status = Status.ERRORED;
    }

    /**
     * @param {!Event} event
     * @private
     */ }, { key: "onPauseOrEnded_", value:
    function onPauseOrEnded_(event) {
      var mediaEntry = this.mediaMap_.get(event.target);

      if (mediaEntry.status === Status.PLAYING) {
        this.addWatchTime_(mediaEntry);
      }
      mediaEntry.status = Status.PAUSED;
    }

    /**
     * @param {!Event} event
     * @private
     */ }, { key: "onPlaying_", value:
    function onPlaying_(event) {
      var mediaEntry = this.mediaMap_.get(event.target);
      var metrics = mediaEntry.metrics,timeStamps = mediaEntry.timeStamps;

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
     */ }, { key: "onWaiting_", value:
    function onWaiting_(event) {
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
     */ }, { key: "getVideoCacheState_", value:
    function getVideoCacheState_(media) {
      var hasCachedSource = false;
      // All video caching mechanisms rely on HTMLSourceElements and never a src
      // on the HTMLMediaElement as it does not allow for fallback sources.
      var sources = toArray(media.querySelectorAll('source'));var _iterator = _createForOfIteratorHelper(
      sources),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var source = _step.value;
          var isCachedSource = source.hasAttribute(
          'i-amphtml-video-cached-source');

          // Playing source is cached.
          if (isCachedSource && media.currentSrc === source.src) {
            return CacheState.CACHE;
          }
          // Non playing source but is cached. Used to differentiate a cache miss
          // (e.g. cache returned a 40x) vs no cached source at all.
          if (isCachedSource) {
            hasCachedSource = true;
          }
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
      return hasCachedSource ? CacheState.ORIGIN_CACHE_MISS : CacheState.ORIGIN;
    } }]);return MediaPerformanceMetricsService;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/media-performance-metrics-service.js