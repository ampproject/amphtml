function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";var _template = ["<i-amphtml-poster></i-amphtml-poster>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import { EMPTY_METADATA } from "../../../src/mediasession-helper";
import { PauseHelper } from "../../../src/core/dom/video/pause-helper";
import { Services } from "../../../src/service";
import { VideoEvents } from "../../../src/video-interface";
import { VisibilityState } from "../../../src/core/constants/visibility-state";
import { addParamsToUrl } from "../../../src/url";
import { applyFillContent, isLayoutSizeDefined } from "../../../src/core/dom/layout";
import {
childElement,
childElementByTag,
childElementsByTag,
matches } from "../../../src/core/dom/query";

import { descendsFromStory } from "../../../src/utils/story";
import { dev, devAssert, user } from "../../../src/log";
import {
addAttributesToElement,
dispatchCustomEvent,
insertAfterOrAtStart,
removeElement } from "../../../src/core/dom";

import { fetchCachedSources } from "./video-cache";
import {
fullscreenEnter as _fullscreenEnter,
fullscreenExit as _fullscreenExit,
isFullscreenElement } from "../../../src/core/dom/fullscreen";

import { getBitrateManager } from "./flexible-bitrate";
import { getMode } from "../../../src/mode";
import { htmlFor } from "../../../src/core/dom/static-template";
import { installVideoManagerForDoc } from "../../../src/service/video-manager-impl";
import { isExperimentOn } from "../../../src/experiments";
import { listen, listenOncePromise } from "../../../src/event-helper";
import { mutedOrUnmutedEvent } from "../../../src/iframe-video";
import { propagateAttributes } from "../../../src/core/dom/propagate-attributes";
import {
propagateObjectFitStyles,
setImportantStyles,
setInitialDisplay,
setStyles } from "../../../src/core/dom/style";

import { toArray } from "../../../src/core/types/array";

var TAG = 'amp-video';

/** @private {!Array<string>} */
var ATTRS_TO_PROPAGATE_ON_BUILD = [
'aria-describedby',
'aria-label',
'aria-labelledby',
'controls',
'crossorigin',
'disableremoteplayback',
'controlsList',
'title'];


/** @private {!Map<string, number>} the bitrate in Kb/s of amp_video_quality for videos in the ampproject cdn */
var AMP_VIDEO_QUALITY_BITRATES = {
  'high': 2000,
  'medium': 720,
  'low': 400 };


/**
 * Do not propagate `autoplay`. Autoplay behavior is managed by
 *       video manager since amp-video implements the VideoInterface.
 * @private {!Array<string>}
 */
var ATTRS_TO_PROPAGATE_ON_LAYOUT = ['loop', 'poster', 'preload'];

/** @private {!Array<string>} */
var ATTRS_TO_PROPAGATE = ATTRS_TO_PROPAGATE_ON_BUILD.concat(
ATTRS_TO_PROPAGATE_ON_LAYOUT);


/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
export var AmpVideo = /*#__PURE__*/function (_AMP$BaseElement) {_inherits(AmpVideo, _AMP$BaseElement);var _super = _createSuper(AmpVideo);

























































  /**
   * @param {!AmpElement} element
   */
  function AmpVideo(element) {var _this;_classCallCheck(this, AmpVideo);
    _this = _super.call(this, element);

    /** @private {?Element} */
    _this.video_ = null;

    /** @private {boolean} */
    _this.muted_ = false;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    _this.metadata_ = EMPTY_METADATA;

    /** @private @const {!Array<!UnlistenDef>} */
    _this.unlisteners_ = [];

    /** @visibleForTesting {?Element} */
    _this.posterDummyImageForTesting_ = null;

    /** @private {?boolean} whether there are sources that will use a BitrateManager */
    _this.hasBitrateSources_ = null;

    /** @private @const */
    _this.pauseHelper_ = new PauseHelper(_this.element);return _this;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */_createClass(AmpVideo, [{ key: "preconnectCallback", value:
    function preconnectCallback(opt_onLayout) {var _this2 = this;
      this.getVideoSourcesForPreconnect_().forEach(function (videoSrc) {
        Services.preconnectFor(_this2.win).url(
        _this2.getAmpDoc(),
        videoSrc,
        opt_onLayout);

      });
    }

    /**
     * @private
     * @return {!Array<string>}
     */ }, { key: "getVideoSourcesForPreconnect_", value:
    function getVideoSourcesForPreconnect_() {
      var videoSrc = this.element.getAttribute('src');
      if (videoSrc) {
        return [videoSrc];
      }
      var srcs = [];
      toArray(childElementsByTag(this.element, 'source')).forEach(function (source) {
        var src = source.getAttribute('src');
        if (src) {
          srcs.push(src);
        }
        // We also want to preconnect to the origin src to make fallback faster.
        var origSrc = source.getAttribute('amp-orig-src');
        if (origSrc) {
          srcs.push(origSrc);
        }
      });
      return srcs;
    }

    /** @override */ }, { key: "isLayoutSupported", value:
    function isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */ }, { key: "buildCallback", value:
    function buildCallback() {
      var element = this.element;

      this.configure_();

      this.video_ = element.ownerDocument.createElement('video');

      var poster = element.getAttribute('poster');
      if (!poster && false) {
        console /*OK*/.
        error('No "poster" attribute has been provided for amp-video.');
      }

      // Enable inline play for iOS.
      this.video_.setAttribute('playsinline', '');
      this.video_.setAttribute('webkit-playsinline', '');
      // Disable video preload in prerender mode.
      this.video_.setAttribute('preload', 'none');
      this.checkA11yAttributeText_();
      propagateAttributes(
      ATTRS_TO_PROPAGATE_ON_BUILD,
      this.element,
      this.video_,
      /* opt_removeMissingAttrs */true);

      this.installEventHandlers_();
      applyFillContent(this.video_, true);
      propagateObjectFitStyles(this.element, this.video_);

      element.appendChild(this.video_);

      // Gather metadata
      var artist = element.getAttribute('artist');
      var title = element.getAttribute('title');
      var album = element.getAttribute('album');
      var artwork = element.getAttribute('artwork');
      this.metadata_ = {
        'title': title || '',
        'artist': artist || '',
        'album': album || '',
        'artwork': [{ 'src': artwork || poster || '' }] };


      // Cached so mediapool operations (eg: swapping sources) don't interfere with this bool.
      this.hasBitrateSources_ =
      !!this.element.querySelector('source[data-bitrate]') ||
      this.element.hasAttribute('cache') ||
      this.hasAnyCachedSources_();

      installVideoManagerForDoc(element);

      Services.videoManagerForDoc(element).register(this);

      if (this.element.hasAttribute('cache')) {
        // If enabled, disables AMP Cache video caching (cdn.ampproject.org),
        // opted-in through the "amp-orig-src" attribute.
        this.removeCachedSources_();
        // Fetch new sources from remote video cache, opted-in through the "cache"
        // attribute.
        return fetchCachedSources(
        this.element,
        this.getAmpDoc(),
        this.getMaxBitrate_());

      }
    }

    /**
     * @private
     * Overrides aria-label with alt if aria-label or title is not specified.
     */ }, { key: "checkA11yAttributeText_", value:
    function checkA11yAttributeText_() {
      var altText = this.element.getAttribute('alt');
      var hasTitle = this.element.hasAttribute('title');
      var hasAriaLabel = this.element.hasAttribute('aria-label');
      if (altText && !hasTitle && !hasAriaLabel) {
        this.element.setAttribute('aria-label', altText);
      }
    }

    /** @override */ }, { key: "detachedCallback", value:
    function detachedCallback() {
      this.updateIsPlaying_(false);
    }

    /** @private */ }, { key: "configure_", value:
    function configure_() {
      var element = this.element;
      if (!descendsFromStory(element)) {
        return;
      }
      ['i-amphtml-disable-mediasession', 'i-amphtml-poolbound'].forEach(
      function (className) {
        element.classList.add(className);
      });

    }

    /** @override */ }, { key: "mutatedAttributesCallback", value:
    function mutatedAttributesCallback(mutations) {
      if (!this.video_) {
        return;
      }
      var element = this.element;
      if (mutations['src']) {
        var urlService = this.getUrlService_();
        urlService.assertHttpsUrl(element.getAttribute('src'), element);
        propagateAttributes(
        ['src'],
        this.element, /** @type {!Element} */(
        this.video_));

      }
      var attrs = ATTRS_TO_PROPAGATE.filter(
      function (value) {return mutations[value] !== undefined;});

      propagateAttributes(
      attrs,
      this.element, /** @type {!Element} */(
      this.video_),
      /* opt_removeMissingAttrs */true);

      if (mutations['src']) {
        dispatchCustomEvent(element, VideoEvents.RELOAD);
      }
      if (mutations['artwork'] || mutations['poster']) {
        var artwork = element.getAttribute('artwork');
        var poster = element.getAttribute('poster');
        this.metadata_['artwork'] = [{ 'src': artwork || poster || '' }];
      }
      if (mutations['album']) {
        var album = element.getAttribute('album');
        this.metadata_['album'] = album || '';
      }
      if (mutations['title']) {
        var title = element.getAttribute('title');
        this.metadata_['title'] = title || '';
      }
      if (mutations['artist']) {
        var artist = element.getAttribute('artist');
        this.metadata_['artist'] = artist || '';
      }



    }

    /** @override */ }, { key: "layoutCallback", value:
    function layoutCallback() {var _this3 = this;
      this.video_ = /** @type {!Element} */(this.video_);

      if (!this.isVideoSupported_()) {
        this.toggleFallback(true);
        return _resolvedPromise();
      }

      propagateAttributes(
      ATTRS_TO_PROPAGATE_ON_LAYOUT,
      this.element, /** @type {!Element} */(
      this.video_),
      /* opt_removeMissingAttrs */true);


      this.createPosterForAndroidBug_();
      this.onPosterLoaded_(function () {return _this3.hideBlurryPlaceholder_();});

      this.propagateCachedSources_();

      // If we are in prerender mode, only propagate cached sources and then
      // when document becomes visible propagate origin sources and other children
      // If not in prerender mode, propagate everything.
      var pendingOriginPromise;
      if (this.getAmpDoc().getVisibilityState() == VisibilityState.PRERENDER) {
        if (!this.element.hasAttribute('preload')) {
          this.video_.setAttribute('preload', 'auto');
        }
        pendingOriginPromise = this.getAmpDoc().
        whenFirstVisible().
        then(function () {
          _this3.propagateLayoutChildren_();
          // We need to yield to the event queue before listing for loadPromise
          // because this element may still be in error state from the pre-render
          // load.
          return Services.timerFor(_this3.win).
          promise(1).
          then(function () {
            // Don't wait for the source to load if media pool is taking over.
            if (_this3.isManagedByPool_()) {
              return;
            }
            return _this3.loadPromise(_this3.video_);
          });
        });
      } else {
        this.propagateLayoutChildren_();
      }

      // loadPromise for media elements listens to `loadedmetadata`.
      var promise = this.loadPromise(this.video_).
      then(null, function (reason) {
        if (pendingOriginPromise) {
          return pendingOriginPromise;
        }
        throw reason;
      }).
      then(function () {return _this3.onVideoLoaded_();});

      // Resolve layoutCallback right away if the video won't preload.
      if (this.element.getAttribute('preload') === 'none') {
        return;
      }

      // Resolve layoutCallback as soon as all sources are appended when within a
      // story, so it can be handled by the media pool as soon as possible.
      if (this.isManagedByPool_()) {
        return pendingOriginPromise;
      }

      return promise;
    }

    /**
     * Gracefully handle media errors if possible.
     * @param {!Event} event
     */ }, { key: "handleMediaError_", value:
    function handleMediaError_(event) {var _this4 = this;
      if (
      !this.video_.error ||
      this.video_.error.code != MediaError.MEDIA_ERR_DECODE)
      {
        return;
      }
      // HTMLMediaElements automatically fallback to the next source if a load fails
      // but they don't try the next source upon a decode error.
      // This code does this fallback manually.
      user().error(
      TAG, "Decode error in ".concat(
      this.video_.currentSrc),
      this.element);

      // No fallback available for bare src.
      if (this.video_.src) {
        return;
      }
      // Find the source element that caused the decode error.
      var sourceCount = 0;
      var currentSource = childElement(this.video_, function (source) {
        if (source.tagName != 'SOURCE') {
          return false;
        }
        sourceCount++;
        return source.src == _this4.video_.currentSrc;
      });
      if (sourceCount == 0) {
        return;
      }
      /** @type {!Element} */(
      currentSource);


      removeElement( /** @type {!Element} */(currentSource));
      // Resets the loading and will catch the new source if any.
      event.stopImmediatePropagation();
      this.video_.load();
      // Unfortunately we don't know exactly what operation caused the decode to
      // fail. But to help, we need to retry. Since play is most common, we're
      // doing that.
      this.play(false);
    }

    /**
     * Disables AMP Cache video caching (cdn.ampproject.org), opted-in through
     * amp-orig-src.
     * @private
     */ }, { key: "removeCachedSources_", value:
    function removeCachedSources_() {
      this.getCachedSources_().forEach(function (cachedSource) {
        cachedSource.setAttribute(
        'src',
        cachedSource.getAttribute('amp-orig-src'));

        cachedSource.removeAttribute('amp-orig-src');
      });
    }

    /**
     * @private
     * Propagate sources that are cached by the CDN.
     */ }, { key: "propagateCachedSources_", value:
    function propagateCachedSources_() {var _this5 = this;
      devAssert(this.video_);

      var sources = toArray(childElementsByTag(this.element, 'source'));

      // if the `src` of `amp-video` itself is cached, move it to <source>
      if (this.element.hasAttribute('src') && isCachedByCdn(this.element)) {
        var src = this.element.getAttribute('src');
        var type = this.element.getAttribute('type');
        var srcSource = this.createSourceElement_(src, type);
        var ampOrigSrc = this.element.getAttribute('amp-orig-src');
        srcSource.setAttribute('amp-orig-src', ampOrigSrc);
        // Also make sure src is removed from amp-video since Stories media-pool
        // may copy it back from amp-video.
        this.element.removeAttribute('src');
        this.element.removeAttribute('type');
        sources.unshift(srcSource);
      }

      // Only cached sources are added during prerender, with all the available
      // transcodes generated by the cache.
      // Origin sources will only be added when document becomes visible.
      sources.forEach(function (source) {
        // Cached by the AMP Cache (amp-video[amp-orig-src]).
        if (isCachedByCdn(source, _this5.element)) {
          source.remove();
          var qualities = Object.keys(AMP_VIDEO_QUALITY_BITRATES);
          var origType = source.getAttribute('type');
          var origSrc = source.getAttribute('amp-orig-src');
          var maxBitrate = _this5.getMaxBitrate_();
          qualities.forEach(function (quality, index) {
            if (maxBitrate < AMP_VIDEO_QUALITY_BITRATES[quality]) {
              return;
            }
            var cachedSource = addParamsToUrl(source.src, {
              'amp_video_quality': quality });

            var currSource = _this5.createSourceElement_(cachedSource, origType, {
              'data-bitrate': AMP_VIDEO_QUALITY_BITRATES[quality],
              'i-amphtml-video-cached-source': '' });

            // Keep src of amp-orig only in last one so it adds the orig source after it.
            if (index === qualities.length - 1) {
              currSource.setAttribute('amp-orig-src', origSrc);
            }
            _this5.video_.appendChild(currSource);
          });

          return;
        }

        // Cached by the remote video caching (amp-video[cache=*]).
        if (source.hasAttribute('i-amphtml-video-cached-source')) {
          _this5.video_.appendChild(source);
        }
      });

      if (this.video_.changedSources) {
        this.video_.changedSources();
      }
    }

    /**
     * Propagate origin sources and tracks
     * @private
     */ }, { key: "propagateLayoutChildren_", value:
    function propagateLayoutChildren_() {var _this6 = this;
      devAssert(this.video_);

      var sources = toArray(childElementsByTag(this.element, 'source'));

      var element = this.element;
      var urlService = this.getUrlService_();

      // If the `src` of `amp-video` itself is NOT cached, set it on video
      if (element.hasAttribute('src') && !isCachedByCdn(element)) {
        urlService.assertHttpsUrl(element.getAttribute('src'), element);
        propagateAttributes(
        ['src'],
        this.element, /** @type {!Element} */(
        this.video_));

      }

      sources.forEach(function (source) {
        // Cached sources should have been moved from <amp-video> to <video>.
        devAssert(!isCachedByCdn(source, element));
        urlService.assertHttpsUrl(source.getAttribute('src'), source);
        _this6.video_.appendChild(source);
      });

      // To handle cases where cached source may 404 if not primed yet,
      // duplicate the `origin` Urls for cached sources and insert them after each
      var cached = toArray(this.video_.querySelectorAll('[amp-orig-src]'));
      cached.forEach(function (cachedSource) {
        var origSrc = cachedSource.getAttribute('amp-orig-src');
        var origType = cachedSource.getAttribute('type');
        var origSource = _this6.createSourceElement_(origSrc, origType);
        insertAfterOrAtStart( /** @type {!Element} */(
        _this6.video_),
        origSource,
        cachedSource);

      });

      var tracks = toArray(childElementsByTag(element, 'track'));
      tracks.forEach(function (track) {
        _this6.video_.appendChild(track);
      });

      if (this.video_.changedSources) {
        this.video_.changedSources();
      }
    }

    /**
     * @param {string} src
     * @param {?string} type
     * @param {Object=} attributes
     * @return {!Element} source element
     * @private
     */ }, { key: "createSourceElement_", value:
    function createSourceElement_(src, type) {var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var element = this.element;
      this.getUrlService_().assertHttpsUrl(src, element);
      var source = element.ownerDocument.createElement('source');
      source.setAttribute('src', src);
      if (type) {
        source.setAttribute('type', type);
      }
      addAttributesToElement(source, attributes);
      return source;
    }

    /**
     * @private
     * @return {!Array<!Element>}
     */ }, { key: "getCachedSources_", value:
    function getCachedSources_() {
      var element = this.element;
      var sources = toArray(childElementsByTag(element, 'source'));
      var cachedSources = [];
      sources.push(element);
      for (var i = 0; i < sources.length; i++) {
        if (isCachedByCdn(sources[i])) {
          cachedSources.push(sources[i]);
        }
      }
      return cachedSources;
    }

    /**
     * @private
     * @return {boolean}
     */ }, { key: "hasAnyCachedSources_", value:
    function hasAnyCachedSources_() {
      return !!this.getCachedSources_().length;
    }

    /**
     * Sets a max bitrate if video is on the first page of an amp-story doc.
     * @return {number}
     */ }, { key: "getMaxBitrate_", value:
    function getMaxBitrate_() {
      if (
      this.isManagedByPool_() &&
      isExperimentOn(this.win, 'amp-story-first-page-max-bitrate') &&
      matches(this.element, 'amp-story-page:first-of-type amp-video'))
      {
        Services.performanceFor(this.win).addEnabledExperiment(
        'amp-story-first-page-max-bitrate');

        return 1000;
      }
      return Number.POSITIVE_INFINITY;
    }

    /**
     * @private
     */ }, { key: "installEventHandlers_", value:
    function installEventHandlers_() {var _this7 = this;
      var video = /** @type {!Element} */(this.video_);
      video.addEventListener('error', function (e) {return _this7.handleMediaError_(e);});

      this.unlisteners_.push(
      this.forwardEvents(
      [
      VideoEvents.ENDED,
      VideoEvents.LOADEDMETADATA,
      VideoEvents.LOADEDDATA,
      VideoEvents.PAUSE,
      VideoEvents.PLAYING,
      VideoEvents.PLAY],

      video));



      this.unlisteners_.push(
      listen(video, 'volumechange', function () {
        var muted = _this7.video_.muted;
        if (_this7.muted_ == muted) {
          return;
        }
        _this7.muted_ = muted;
        dispatchCustomEvent(_this7.element, mutedOrUnmutedEvent(_this7.muted_));
      }));


      ['play', 'pause', 'ended'].forEach(function (type) {
        _this7.unlisteners_.push(
        listen(video, type, function () {return _this7.updateIsPlaying_(type == 'play');}));

      });
    }

    /** @private */ }, { key: "uninstallEventHandlers_", value:
    function uninstallEventHandlers_() {
      this.updateIsPlaying_(false);
      while (this.unlisteners_.length) {
        this.unlisteners_.pop().call();
      }
    }

    /**
     * Resets the component if the underlying <video> was changed.
     * This should only be used in cases when a higher-level component manages
     * this element's DOM.
     */ }, { key: "resetOnDomChange", value:
    function resetOnDomChange() {var _this8 = this;
      this.video_ = /** @type {!Element} */(
      childElementByTag(this.element, 'video'));


      this.uninstallEventHandlers_();
      this.installEventHandlers_();
      if (this.hasBitrateSources_) {
        getBitrateManager(this.win).manage(this.video_);
      }
      // When source changes, video needs to trigger loaded again.
      if (this.video_.readyState >= 1) {
        this.onVideoLoaded_();
        return;
      }
      // Video might not have the sources yet, so instead of loadPromise (which would fail),
      // we listen for loadedmetadata.
      listenOncePromise(this.video_, 'loadedmetadata').then(function () {return (
          _this8.onVideoLoaded_());});

    }

    /** @private */ }, { key: "onVideoLoaded_", value:
    function onVideoLoaded_() {
      dispatchCustomEvent(this.element, VideoEvents.LOAD);
    }

    /** @override */ }, { key: "pauseCallback", value:
    function pauseCallback() {
      if (this.video_) {
        this.video_.pause();
      }
    }

    /** @private */ }, { key: "updateIsPlaying_", value:
    function updateIsPlaying_(isPlaying) {
      if (this.isManagedByPool_()) {
        return;
      }
      this.pauseHelper_.updatePlaying(isPlaying);
    }

    /** @private */ }, { key: "isVideoSupported_", value:
    function isVideoSupported_() {
      return !!this.video_.play;
    }

    // VideoInterface Implementation. See ../src/video-interface.VideoInterface

    /**
     * @override
     */ }, { key: "supportsPlatform", value:
    function supportsPlatform() {
      return this.isVideoSupported_();
    }

    /**
     * @override
     */ }, { key: "isInteractive", value:
    function isInteractive() {
      return this.element.hasAttribute('controls');
    }

    /**
     * @override
     */ }, { key: "play", value:
    function play(unusedIsAutoplay) {
      var ret = this.video_.play();

      if (ret && ret.catch) {
        ret.catch(function () {
          // Empty catch to prevent useless unhandled promise rejection logging.
          // Play can fail for many reasons such as video getting paused before
          // play() is finished.
          // We use events to know the state of the video and do not care about
          // the success or failure of the play()'s returned promise.
        });
      }
    }

    /**
     * Android will show a blank frame between the poster and the first frame in
     * some cases. In these cases, the video element is transparent. By setting
     * a poster layer underneath, the poster is still shown while the first frame
     * buffers, so no FOUC.
     * @private
     */ }, { key: "createPosterForAndroidBug_", value:
    function createPosterForAndroidBug_() {
      if (!Services.platformFor(this.win).isAndroid()) {
        return;
      }
      var element = this.element;
      if (element.querySelector('i-amphtml-poster')) {
        return;
      }
      var poster = htmlFor(element)(_template);
      var src = element.getAttribute('poster');
      setInitialDisplay(poster, 'block');
      setStyles(poster, {
        'background-image': "url(".concat(src, ")"),
        'background-size': 'cover',
        'background-position': 'center' });

      poster.classList.add('i-amphtml-android-poster-bug');
      applyFillContent(poster);
      element.appendChild(poster);
    }

    /**
     * @override
     */ }, { key: "pause", value:
    function pause() {
      this.video_.pause();
    }

    /**
     * @override
     */ }, { key: "mute", value:
    function mute() {
      if (this.isManagedByPool_()) {
        return;
      }
      this.video_.muted = true;
    }

    /**
     * @override
     */ }, { key: "unmute", value:
    function unmute() {
      if (this.isManagedByPool_()) {
        return;
      }
      this.video_.muted = false;
    }

    /**
     * @return {boolean}
     * @private
     */ }, { key: "isManagedByPool_", value:
    function isManagedByPool_() {
      return this.element.classList.contains('i-amphtml-poolbound');
    }

    /**
     * @override
     */ }, { key: "showControls", value:
    function showControls() {
      this.video_.controls = true;
    }

    /**
     * @override
     */ }, { key: "hideControls", value:
    function hideControls() {
      this.video_.controls = false;
    }

    /**
     * @override
     */ }, { key: "fullscreenEnter", value:
    function fullscreenEnter() {
      _fullscreenEnter( /** @type {!Element} */(this.video_));
    }

    /**
     * @override
     */ }, { key: "fullscreenExit", value:
    function fullscreenExit() {
      _fullscreenExit( /** @type {!Element} */(this.video_));
    }

    /** @override */ }, { key: "isFullscreen", value:
    function isFullscreen() {
      return isFullscreenElement( /** @type {!Element} */(this.video_));
    }

    /** @override */ }, { key: "getMetadata", value:
    function getMetadata() {
      return this.metadata_;
    }

    /** @override */ }, { key: "preimplementsMediaSessionAPI", value:
    function preimplementsMediaSessionAPI() {
      return false;
    }

    /** @override */ }, { key: "preimplementsAutoFullscreen", value:
    function preimplementsAutoFullscreen() {
      return false;
    }

    /** @override */ }, { key: "getCurrentTime", value:
    function getCurrentTime() {
      return this.video_.currentTime;
    }

    /** @override */ }, { key: "getDuration", value:
    function getDuration() {
      return this.video_.duration;
    }

    /** @override */ }, { key: "getPlayedRanges", value:
    function getPlayedRanges() {
      // TODO(cvializ): remove this because it can be inferred by other events
      var played = this.video_.played;
      var length = played.length;
      var ranges = [];
      for (var i = 0; i < length; i++) {
        ranges.push([played.start(i), played.end(i)]);
      }
      return ranges;
    }

    /**
     * Called when video is first loaded.
     * @override
     */ }, { key: "firstLayoutCompleted", value:
    function firstLayoutCompleted() {
      if (!this.hideBlurryPlaceholder_()) {
        this.togglePlaceholder(false);
      }
      this.removePosterForAndroidBug_();
    }

    /**
     * See `createPosterForAndroidBug_`.
     * @private
     */ }, { key: "removePosterForAndroidBug_", value:
    function removePosterForAndroidBug_() {
      var poster = this.element.querySelector('i-amphtml-poster');
      if (!poster) {
        return;
      }
      removeElement(poster);
    }

    /**
     * @return {!../../../src/service/url-impl.Url}
     * @private
     */ }, { key: "getUrlService_", value:
    function getUrlService_() {
      return Services.urlForDoc(this.element);
    }

    /**
     * Fades out a blurry placeholder if one currently exists.
     * @return {boolean} if there was a blurred image placeholder that was hidden.
     */ }, { key: "hideBlurryPlaceholder_", value:
    function hideBlurryPlaceholder_() {
      var placeholder = this.getPlaceholder();
      // checks for the existence of a visible blurry placeholder
      if (placeholder) {
        if (placeholder.classList.contains('i-amphtml-blurry-placeholder')) {
          setImportantStyles(placeholder, { 'opacity': 0.0 });
          return true;
        }
      }
      return false;
    }

    /**
     * Sets a callback when the poster is loaded.
     * @param {function()} callback The function that executes when the poster is
     * loaded.
     * @private
     */ }, { key: "onPosterLoaded_", value:
    function onPosterLoaded_(callback) {
      var poster = this.video_.getAttribute('poster');
      if (poster) {
        var posterImg = new Image();
        if (false) {
          this.posterDummyImageForTesting_ = posterImg;
        }
        posterImg.onload = callback;
        posterImg.src = poster;
      }
    }

    /** @override */ }, { key: "seekTo", value:
    function seekTo(timeSeconds) {
      this.video_.currentTime = timeSeconds;
    } }], [{ key: "prerenderAllowed", value: /**
     * AMP Cache may selectively cache certain video sources (based on various
     * heuristics such as video type, extensions, etc...).
     * When AMP Cache does so, it rewrites the `src` for `amp-video` and
     * `source` children that are cached and adds a `amp-orig-src` attribute
     * pointing to the original source.
     *
     * There are two separate runtime concerns that we handle here:
     *
     * 1) Handling 404s
     * Eventhough AMP Cache rewrites the `src` to point to the CDN, the actual
     * video may not be ready in the cache yet, in those cases the CDN will
     * return a 404.
     * AMP Cache also rewrites Urls for all sources and returns 404 for types
     * that are not supported to be cached.
     *
     * Runtime handles this situation by appending an additional
     * <source> pointing to the original src AFTER the cached source so browser
     * will automatically proceed to the next source if one fails.
     * Original sources are added only when page becomes visible and not during
     * prerender mode.
     *
     * 2) Prerendering
     * Now that some sources might be cached, we can preload them during prerender
     * phase. Runtime handles this by adding any cached sources to the <video>
     * element during prerender and automatically sets the `preload` to `auto`
     * so browsers (based on their own heuristics) can start fetching the cached
     * videos. If `preload` is specified by the author, then it takes precedence.
     *
     * Note that this flag does not impact prerendering of the `poster` as poster
     * is fetched (and is always cached) during `buildCallback` which is not
     * dependent on the value of `prerenderAllowed()`.
     *
     * @override
     * @nocollapse
     */function prerenderAllowed(element) {// Only allow prerender if video sources are cached on CDN or remote video
      // cache, or if video has a poster image.
      // Poster is available, or cache is configured.
      if (element.getAttribute('poster') || element.hasAttribute('cache')) {return true;} // Look for sources.
      var sources = toArray(childElementsByTag(element, 'source'));sources.push(element);for (var i = 0; i < sources.length; i++) {if (isCachedByCdn(sources[i], element)) {return true;}}return false;} }]);return AmpVideo;}(AMP.BaseElement); /**
 * @param {!Element} element
 * @param {!Element=} opt_videoElement
 * @return {boolean}
 * @visibleForTesting
 */export function isCachedByCdn(element, opt_videoElement) {var src = element.getAttribute('src');var hasOrigSrcAttr = element.hasAttribute('amp-orig-src');if (!hasOrigSrcAttr) {return false;}var urlService = Services.urlForDoc(opt_videoElement || element);return urlService.isProxyOrigin(src);}AMP.extension(TAG, '0.1', function (AMP) {AMP.registerElement(TAG, AmpVideo);});
// /Users/mszylkowski/src/amphtml/extensions/amp-video/0.1/amp-video.js