import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

var _templateObject;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
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
import { childElement, childElementByTag, childElementsByTag, matches } from "../../../src/core/dom/query";
import { descendsFromStory } from "../../../src/utils/story";
import { dev, devAssert, user } from "../../../src/log";
import { addAttributesToElement, dispatchCustomEvent, insertAfterOrAtStart, removeElement } from "../../../src/core/dom";
import { fetchCachedSources } from "./video-cache";
import { fullscreenEnter as _fullscreenEnter, fullscreenExit as _fullscreenExit, isFullscreenElement } from "../../../src/core/dom/fullscreen";
import { getBitrateManager } from "./flexible-bitrate";
import { getMode } from "../../../src/mode";
import { htmlFor } from "../../../src/core/dom/static-template";
import { installVideoManagerForDoc } from "../../../src/service/video-manager-impl";
import { isExperimentOn } from "../../../src/experiments";
import { listen, listenOncePromise } from "../../../src/event-helper";
import { mutedOrUnmutedEvent } from "../../../src/iframe-video";
import { propagateAttributes } from "../../../src/core/dom/propagate-attributes";
import { propagateObjectFitStyles, setImportantStyles, setInitialDisplay, setStyles } from "../../../src/core/dom/style";
import { toArray } from "../../../src/core/types/array";
var TAG = 'amp-video';

/** @private {!Array<string>} */
var ATTRS_TO_PROPAGATE_ON_BUILD = ['aria-describedby', 'aria-label', 'aria-labelledby', 'controls', 'crossorigin', 'disableremoteplayback', 'controlsList', 'title'];

/** @private {!Map<string, number>} the bitrate in Kb/s of amp_video_quality for videos in the ampproject cdn */
var AMP_VIDEO_QUALITY_BITRATES = {
  'high': 2000,
  'medium': 720,
  'low': 400
};

/**
 * Do not propagate `autoplay`. Autoplay behavior is managed by
 *       video manager since amp-video implements the VideoInterface.
 * @private {!Array<string>}
 */
var ATTRS_TO_PROPAGATE_ON_LAYOUT = ['loop', 'poster', 'preload'];

/** @private {!Array<string>} */
var ATTRS_TO_PROPAGATE = ATTRS_TO_PROPAGATE_ON_BUILD.concat(ATTRS_TO_PROPAGATE_ON_LAYOUT);

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
export var AmpVideo = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpVideo, _AMP$BaseElement);

  var _super = _createSuper(AmpVideo);

  /**
   * @param {!AmpElement} element
   */
  function AmpVideo(element) {
    var _this;

    _classCallCheck(this, AmpVideo);

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
    _this.pauseHelper_ = new PauseHelper(_this.element);
    return _this;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  _createClass(AmpVideo, [{
    key: "preconnectCallback",
    value: function preconnectCallback(opt_onLayout) {
      var _this2 = this;

      this.getVideoSourcesForPreconnect_().forEach(function (videoSrc) {
        Services.preconnectFor(_this2.win).url(_this2.getAmpDoc(), videoSrc, opt_onLayout);
      });
    }
    /**
     * @private
     * @return {!Array<string>}
     */

  }, {
    key: "getVideoSourcesForPreconnect_",
    value: function getVideoSourcesForPreconnect_() {
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
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      var element = this.element;
      this.configure_();
      this.video_ = element.ownerDocument.createElement('video');
      var poster = element.getAttribute('poster');

      if (!poster && getMode().development) {
        console
        /*OK*/
        .error('No "poster" attribute has been provided for amp-video.');
      }

      // Enable inline play for iOS.
      this.video_.setAttribute('playsinline', '');
      this.video_.setAttribute('webkit-playsinline', '');
      // Disable video preload in prerender mode.
      this.video_.setAttribute('preload', 'none');
      this.checkA11yAttributeText_();
      propagateAttributes(ATTRS_TO_PROPAGATE_ON_BUILD, this.element, this.video_,
      /* opt_removeMissingAttrs */
      true);
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
        'artwork': [{
          'src': artwork || poster || ''
        }]
      };
      // Cached so mediapool operations (eg: swapping sources) don't interfere with this bool.
      this.hasBitrateSources_ = !!this.element.querySelector('source[data-bitrate]') || this.element.hasAttribute('cache') || this.hasAnyCachedSources_();
      installVideoManagerForDoc(element);
      Services.videoManagerForDoc(element).register(this);

      if (this.element.hasAttribute('cache')) {
        // If enabled, disables AMP Cache video caching (cdn.ampproject.org),
        // opted-in through the "amp-orig-src" attribute.
        this.removeCachedSources_();
        // Fetch new sources from remote video cache, opted-in through the "cache"
        // attribute.
        return fetchCachedSources(this.element, this.getAmpDoc(), this.getMaxBitrate_());
      }
    }
    /**
     * @private
     * Overrides aria-label with alt if aria-label or title is not specified.
     */

  }, {
    key: "checkA11yAttributeText_",
    value: function checkA11yAttributeText_() {
      var altText = this.element.getAttribute('alt');
      var hasTitle = this.element.hasAttribute('title');
      var hasAriaLabel = this.element.hasAttribute('aria-label');

      if (altText && !hasTitle && !hasAriaLabel) {
        this.element.setAttribute('aria-label', altText);
      }
    }
    /** @override */

  }, {
    key: "detachedCallback",
    value: function detachedCallback() {
      this.updateIsPlaying_(false);
    }
    /** @private */

  }, {
    key: "configure_",
    value: function configure_() {
      var element = this.element;

      if (!descendsFromStory(element)) {
        return;
      }

      ['i-amphtml-disable-mediasession', 'i-amphtml-poolbound'].forEach(function (className) {
        element.classList.add(className);
      });
    }
    /** @override */

  }, {
    key: "mutatedAttributesCallback",
    value: function mutatedAttributesCallback(mutations) {
      if (!this.video_) {
        return;
      }

      var element = this.element;

      if (mutations['src']) {
        var urlService = this.getUrlService_();
        urlService.assertHttpsUrl(element.getAttribute('src'), element);
        propagateAttributes(['src'], this.element, dev().assertElement(this.video_));
      }

      var attrs = ATTRS_TO_PROPAGATE.filter(function (value) {
        return mutations[value] !== undefined;
      });
      propagateAttributes(attrs, this.element, dev().assertElement(this.video_),
      /* opt_removeMissingAttrs */
      true);

      if (mutations['src']) {
        dispatchCustomEvent(element, VideoEvents.RELOAD);
      }

      if (mutations['artwork'] || mutations['poster']) {
        var artwork = element.getAttribute('artwork');
        var poster = element.getAttribute('poster');
        this.metadata_['artwork'] = [{
          'src': artwork || poster || ''
        }];
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
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      var _this3 = this;

      this.video_ = dev().assertElement(this.video_);

      if (!this.isVideoSupported_()) {
        this.toggleFallback(true);
        return _resolvedPromise();
      }

      propagateAttributes(ATTRS_TO_PROPAGATE_ON_LAYOUT, this.element, dev().assertElement(this.video_),
      /* opt_removeMissingAttrs */
      true);
      this.createPosterForAndroidBug_();
      this.onPosterLoaded_(function () {
        return _this3.hideBlurryPlaceholder_();
      });
      this.propagateCachedSources_();
      // If we are in prerender mode, only propagate cached sources and then
      // when document becomes visible propagate origin sources and other children
      // If not in prerender mode, propagate everything.
      var pendingOriginPromise;

      if (this.getAmpDoc().getVisibilityState() == VisibilityState.PRERENDER) {
        if (!this.element.hasAttribute('preload')) {
          this.video_.setAttribute('preload', 'auto');
        }

        pendingOriginPromise = this.getAmpDoc().whenFirstVisible().then(function () {
          _this3.propagateLayoutChildren_();

          // We need to yield to the event queue before listing for loadPromise
          // because this element may still be in error state from the pre-render
          // load.
          return Services.timerFor(_this3.win).promise(1).then(function () {
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
      var promise = this.loadPromise(this.video_).then(null, function (reason) {
        if (pendingOriginPromise) {
          return pendingOriginPromise;
        }

        throw reason;
      }).then(function () {
        return _this3.onVideoLoaded_();
      });

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
     */

  }, {
    key: "handleMediaError_",
    value: function handleMediaError_(event) {
      var _this4 = this;

      if (!this.video_.error || this.video_.error.code != MediaError.MEDIA_ERR_DECODE) {
        return;
      }

      // HTMLMediaElements automatically fallback to the next source if a load fails
      // but they don't try the next source upon a decode error.
      // This code does this fallback manually.
      user().error(TAG, "Decode error in " + this.video_.currentSrc, this.element);

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

      dev().assertElement(currentSource, "Can't find source element for currentSrc " + this.video_.currentSrc);
      removeElement(dev().assertElement(currentSource));
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
     */

  }, {
    key: "removeCachedSources_",
    value: function removeCachedSources_() {
      this.getCachedSources_().forEach(function (cachedSource) {
        cachedSource.setAttribute('src', cachedSource.getAttribute('amp-orig-src'));
        cachedSource.removeAttribute('amp-orig-src');
      });
    }
    /**
     * @private
     * Propagate sources that are cached by the CDN.
     */

  }, {
    key: "propagateCachedSources_",
    value: function propagateCachedSources_() {
      var _this5 = this;

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
              'amp_video_quality': quality
            });

            var currSource = _this5.createSourceElement_(cachedSource, origType, {
              'data-bitrate': AMP_VIDEO_QUALITY_BITRATES[quality],
              'i-amphtml-video-cached-source': ''
            });

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
     */

  }, {
    key: "propagateLayoutChildren_",
    value: function propagateLayoutChildren_() {
      var _this6 = this;

      devAssert(this.video_);
      var sources = toArray(childElementsByTag(this.element, 'source'));
      var element = this.element;
      var urlService = this.getUrlService_();

      // If the `src` of `amp-video` itself is NOT cached, set it on video
      if (element.hasAttribute('src') && !isCachedByCdn(element)) {
        urlService.assertHttpsUrl(element.getAttribute('src'), element);
        propagateAttributes(['src'], this.element, dev().assertElement(this.video_));
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

        insertAfterOrAtStart(dev().assertElement(_this6.video_), origSource, cachedSource);
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
     */

  }, {
    key: "createSourceElement_",
    value: function createSourceElement_(src, type, attributes) {
      if (attributes === void 0) {
        attributes = {};
      }

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
     */

  }, {
    key: "getCachedSources_",
    value: function getCachedSources_() {
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
     */

  }, {
    key: "hasAnyCachedSources_",
    value: function hasAnyCachedSources_() {
      return !!this.getCachedSources_().length;
    }
    /**
     * Sets a max bitrate if video is on the first page of an amp-story doc.
     * @return {number}
     */

  }, {
    key: "getMaxBitrate_",
    value: function getMaxBitrate_() {
      if (this.isManagedByPool_() && isExperimentOn(this.win, 'amp-story-first-page-max-bitrate') && matches(this.element, 'amp-story-page:first-of-type amp-video')) {
        Services.performanceFor(this.win).addEnabledExperiment('amp-story-first-page-max-bitrate');
        return 1000;
      }

      return Number.POSITIVE_INFINITY;
    }
    /**
     * @private
     */

  }, {
    key: "installEventHandlers_",
    value: function installEventHandlers_() {
      var _this7 = this;

      var video = dev().assertElement(this.video_);
      video.addEventListener('error', function (e) {
        return _this7.handleMediaError_(e);
      });
      this.unlisteners_.push(this.forwardEvents([VideoEvents.ENDED, VideoEvents.LOADEDMETADATA, VideoEvents.LOADEDDATA, VideoEvents.PAUSE, VideoEvents.PLAYING, VideoEvents.PLAY], video));
      this.unlisteners_.push(listen(video, 'volumechange', function () {
        var muted = _this7.video_.muted;

        if (_this7.muted_ == muted) {
          return;
        }

        _this7.muted_ = muted;
        dispatchCustomEvent(_this7.element, mutedOrUnmutedEvent(_this7.muted_));
      }));
      ['play', 'pause', 'ended'].forEach(function (type) {
        _this7.unlisteners_.push(listen(video, type, function () {
          return _this7.updateIsPlaying_(type == 'play');
        }));
      });
    }
    /** @private */

  }, {
    key: "uninstallEventHandlers_",
    value: function uninstallEventHandlers_() {
      this.updateIsPlaying_(false);

      while (this.unlisteners_.length) {
        this.unlisteners_.pop().call();
      }
    }
    /**
     * Resets the component if the underlying <video> was changed.
     * This should only be used in cases when a higher-level component manages
     * this element's DOM.
     */

  }, {
    key: "resetOnDomChange",
    value: function resetOnDomChange() {
      var _this8 = this;

      this.video_ = dev().assertElement(childElementByTag(this.element, 'video'), 'Tried to reset amp-video without an underlying <video>.');
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
      listenOncePromise(this.video_, 'loadedmetadata').then(function () {
        return _this8.onVideoLoaded_();
      });
    }
    /** @private */

  }, {
    key: "onVideoLoaded_",
    value: function onVideoLoaded_() {
      dispatchCustomEvent(this.element, VideoEvents.LOAD);
    }
    /** @override */

  }, {
    key: "pauseCallback",
    value: function pauseCallback() {
      if (this.video_) {
        this.video_.pause();
      }
    }
    /** @private */

  }, {
    key: "updateIsPlaying_",
    value: function updateIsPlaying_(isPlaying) {
      if (this.isManagedByPool_()) {
        return;
      }

      this.pauseHelper_.updatePlaying(isPlaying);
    }
    /** @private */

  }, {
    key: "isVideoSupported_",
    value: function isVideoSupported_() {
      return !!this.video_.play;
    } // VideoInterface Implementation. See ../src/video-interface.VideoInterface

    /**
     * @override
     */

  }, {
    key: "supportsPlatform",
    value: function supportsPlatform() {
      return this.isVideoSupported_();
    }
    /**
     * @override
     */

  }, {
    key: "isInteractive",
    value: function isInteractive() {
      return this.element.hasAttribute('controls');
    }
    /**
     * @override
     */

  }, {
    key: "play",
    value: function play(unusedIsAutoplay) {
      var ret = this.video_.play();

      if (ret && ret.catch) {
        ret.catch(function () {// Empty catch to prevent useless unhandled promise rejection logging.
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
     */

  }, {
    key: "createPosterForAndroidBug_",
    value: function createPosterForAndroidBug_() {
      if (!Services.platformFor(this.win).isAndroid()) {
        return;
      }

      var element = this.element;

      if (element.querySelector('i-amphtml-poster')) {
        return;
      }

      var poster = htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["<i-amphtml-poster></i-amphtml-poster>"])));
      var src = element.getAttribute('poster');
      setInitialDisplay(poster, 'block');
      setStyles(poster, {
        'background-image': "url(" + src + ")",
        'background-size': 'cover',
        'background-position': 'center'
      });
      poster.classList.add('i-amphtml-android-poster-bug');
      applyFillContent(poster);
      element.appendChild(poster);
    }
    /**
     * @override
     */

  }, {
    key: "pause",
    value: function pause() {
      this.video_.pause();
    }
    /**
     * @override
     */

  }, {
    key: "mute",
    value: function mute() {
      if (this.isManagedByPool_()) {
        return;
      }

      this.video_.muted = true;
    }
    /**
     * @override
     */

  }, {
    key: "unmute",
    value: function unmute() {
      if (this.isManagedByPool_()) {
        return;
      }

      this.video_.muted = false;
    }
    /**
     * @return {boolean}
     * @private
     */

  }, {
    key: "isManagedByPool_",
    value: function isManagedByPool_() {
      return this.element.classList.contains('i-amphtml-poolbound');
    }
    /**
     * @override
     */

  }, {
    key: "showControls",
    value: function showControls() {
      this.video_.controls = true;
    }
    /**
     * @override
     */

  }, {
    key: "hideControls",
    value: function hideControls() {
      this.video_.controls = false;
    }
    /**
     * @override
     */

  }, {
    key: "fullscreenEnter",
    value: function fullscreenEnter() {
      _fullscreenEnter(dev().assertElement(this.video_));
    }
    /**
     * @override
     */

  }, {
    key: "fullscreenExit",
    value: function fullscreenExit() {
      _fullscreenExit(dev().assertElement(this.video_));
    }
    /** @override */

  }, {
    key: "isFullscreen",
    value: function isFullscreen() {
      return isFullscreenElement(dev().assertElement(this.video_));
    }
    /** @override */

  }, {
    key: "getMetadata",
    value: function getMetadata() {
      return this.metadata_;
    }
    /** @override */

  }, {
    key: "preimplementsMediaSessionAPI",
    value: function preimplementsMediaSessionAPI() {
      return false;
    }
    /** @override */

  }, {
    key: "preimplementsAutoFullscreen",
    value: function preimplementsAutoFullscreen() {
      return false;
    }
    /** @override */

  }, {
    key: "getCurrentTime",
    value: function getCurrentTime() {
      return this.video_.currentTime;
    }
    /** @override */

  }, {
    key: "getDuration",
    value: function getDuration() {
      return this.video_.duration;
    }
    /** @override */

  }, {
    key: "getPlayedRanges",
    value: function getPlayedRanges() {
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
     */

  }, {
    key: "firstLayoutCompleted",
    value: function firstLayoutCompleted() {
      if (!this.hideBlurryPlaceholder_()) {
        this.togglePlaceholder(false);
      }

      this.removePosterForAndroidBug_();
    }
    /**
     * See `createPosterForAndroidBug_`.
     * @private
     */

  }, {
    key: "removePosterForAndroidBug_",
    value: function removePosterForAndroidBug_() {
      var poster = this.element.querySelector('i-amphtml-poster');

      if (!poster) {
        return;
      }

      removeElement(poster);
    }
    /**
     * @return {!../../../src/service/url-impl.Url}
     * @private
     */

  }, {
    key: "getUrlService_",
    value: function getUrlService_() {
      return Services.urlForDoc(this.element);
    }
    /**
     * Fades out a blurry placeholder if one currently exists.
     * @return {boolean} if there was a blurred image placeholder that was hidden.
     */

  }, {
    key: "hideBlurryPlaceholder_",
    value: function hideBlurryPlaceholder_() {
      var placeholder = this.getPlaceholder();

      // checks for the existence of a visible blurry placeholder
      if (placeholder) {
        if (placeholder.classList.contains('i-amphtml-blurry-placeholder')) {
          setImportantStyles(placeholder, {
            'opacity': 0.0
          });
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
     */

  }, {
    key: "onPosterLoaded_",
    value: function onPosterLoaded_(callback) {
      var poster = this.video_.getAttribute('poster');

      if (poster) {
        var posterImg = new Image();

        if (getMode().test) {
          this.posterDummyImageForTesting_ = posterImg;
        }

        posterImg.onload = callback;
        posterImg.src = poster;
      }
    }
    /** @override */

  }, {
    key: "seekTo",
    value: function seekTo(timeSeconds) {
      this.video_.currentTime = timeSeconds;
    }
  }], [{
    key: "prerenderAllowed",
    value:
    /**
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
     */
    function prerenderAllowed(element) {
      // Only allow prerender if video sources are cached on CDN or remote video
      // cache, or if video has a poster image.
      // Poster is available, or cache is configured.
      if (element.getAttribute('poster') || element.hasAttribute('cache')) {
        return true;
      }

      // Look for sources.
      var sources = toArray(childElementsByTag(element, 'source'));
      sources.push(element);

      for (var i = 0; i < sources.length; i++) {
        if (isCachedByCdn(sources[i], element)) {
          return true;
        }
      }

      return false;
    }
  }]);

  return AmpVideo;
}(AMP.BaseElement);

/**
 * @param {!Element} element
 * @param {!Element=} opt_videoElement
 * @return {boolean}
 * @visibleForTesting
 */
export function isCachedByCdn(element, opt_videoElement) {
  var src = element.getAttribute('src');
  var hasOrigSrcAttr = element.hasAttribute('amp-orig-src');

  if (!hasOrigSrcAttr) {
    return false;
  }

  var urlService = Services.urlForDoc(opt_videoElement || element);
  return urlService.isProxyOrigin(src);
}
AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerElement(TAG, AmpVideo);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC12aWRlby5qcyJdLCJuYW1lcyI6WyJFTVBUWV9NRVRBREFUQSIsIlBhdXNlSGVscGVyIiwiU2VydmljZXMiLCJWaWRlb0V2ZW50cyIsIlZpc2liaWxpdHlTdGF0ZSIsImFkZFBhcmFtc1RvVXJsIiwiYXBwbHlGaWxsQ29udGVudCIsImlzTGF5b3V0U2l6ZURlZmluZWQiLCJjaGlsZEVsZW1lbnQiLCJjaGlsZEVsZW1lbnRCeVRhZyIsImNoaWxkRWxlbWVudHNCeVRhZyIsIm1hdGNoZXMiLCJkZXNjZW5kc0Zyb21TdG9yeSIsImRldiIsImRldkFzc2VydCIsInVzZXIiLCJhZGRBdHRyaWJ1dGVzVG9FbGVtZW50IiwiZGlzcGF0Y2hDdXN0b21FdmVudCIsImluc2VydEFmdGVyT3JBdFN0YXJ0IiwicmVtb3ZlRWxlbWVudCIsImZldGNoQ2FjaGVkU291cmNlcyIsImZ1bGxzY3JlZW5FbnRlciIsImZ1bGxzY3JlZW5FeGl0IiwiaXNGdWxsc2NyZWVuRWxlbWVudCIsImdldEJpdHJhdGVNYW5hZ2VyIiwiZ2V0TW9kZSIsImh0bWxGb3IiLCJpbnN0YWxsVmlkZW9NYW5hZ2VyRm9yRG9jIiwiaXNFeHBlcmltZW50T24iLCJsaXN0ZW4iLCJsaXN0ZW5PbmNlUHJvbWlzZSIsIm11dGVkT3JVbm11dGVkRXZlbnQiLCJwcm9wYWdhdGVBdHRyaWJ1dGVzIiwicHJvcGFnYXRlT2JqZWN0Rml0U3R5bGVzIiwic2V0SW1wb3J0YW50U3R5bGVzIiwic2V0SW5pdGlhbERpc3BsYXkiLCJzZXRTdHlsZXMiLCJ0b0FycmF5IiwiVEFHIiwiQVRUUlNfVE9fUFJPUEFHQVRFX09OX0JVSUxEIiwiQU1QX1ZJREVPX1FVQUxJVFlfQklUUkFURVMiLCJBVFRSU19UT19QUk9QQUdBVEVfT05fTEFZT1VUIiwiQVRUUlNfVE9fUFJPUEFHQVRFIiwiY29uY2F0IiwiQW1wVmlkZW8iLCJlbGVtZW50IiwidmlkZW9fIiwibXV0ZWRfIiwibWV0YWRhdGFfIiwidW5saXN0ZW5lcnNfIiwicG9zdGVyRHVtbXlJbWFnZUZvclRlc3RpbmdfIiwiaGFzQml0cmF0ZVNvdXJjZXNfIiwicGF1c2VIZWxwZXJfIiwib3B0X29uTGF5b3V0IiwiZ2V0VmlkZW9Tb3VyY2VzRm9yUHJlY29ubmVjdF8iLCJmb3JFYWNoIiwidmlkZW9TcmMiLCJwcmVjb25uZWN0Rm9yIiwid2luIiwidXJsIiwiZ2V0QW1wRG9jIiwiZ2V0QXR0cmlidXRlIiwic3JjcyIsInNvdXJjZSIsInNyYyIsInB1c2giLCJvcmlnU3JjIiwibGF5b3V0IiwiY29uZmlndXJlXyIsIm93bmVyRG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicG9zdGVyIiwiZGV2ZWxvcG1lbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJzZXRBdHRyaWJ1dGUiLCJjaGVja0ExMXlBdHRyaWJ1dGVUZXh0XyIsImluc3RhbGxFdmVudEhhbmRsZXJzXyIsImFwcGVuZENoaWxkIiwiYXJ0aXN0IiwidGl0bGUiLCJhbGJ1bSIsImFydHdvcmsiLCJxdWVyeVNlbGVjdG9yIiwiaGFzQXR0cmlidXRlIiwiaGFzQW55Q2FjaGVkU291cmNlc18iLCJ2aWRlb01hbmFnZXJGb3JEb2MiLCJyZWdpc3RlciIsInJlbW92ZUNhY2hlZFNvdXJjZXNfIiwiZ2V0TWF4Qml0cmF0ZV8iLCJhbHRUZXh0IiwiaGFzVGl0bGUiLCJoYXNBcmlhTGFiZWwiLCJ1cGRhdGVJc1BsYXlpbmdfIiwiY2xhc3NOYW1lIiwiY2xhc3NMaXN0IiwiYWRkIiwibXV0YXRpb25zIiwidXJsU2VydmljZSIsImdldFVybFNlcnZpY2VfIiwiYXNzZXJ0SHR0cHNVcmwiLCJhc3NlcnRFbGVtZW50IiwiYXR0cnMiLCJmaWx0ZXIiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsIlJFTE9BRCIsImlzVmlkZW9TdXBwb3J0ZWRfIiwidG9nZ2xlRmFsbGJhY2siLCJjcmVhdGVQb3N0ZXJGb3JBbmRyb2lkQnVnXyIsIm9uUG9zdGVyTG9hZGVkXyIsImhpZGVCbHVycnlQbGFjZWhvbGRlcl8iLCJwcm9wYWdhdGVDYWNoZWRTb3VyY2VzXyIsInBlbmRpbmdPcmlnaW5Qcm9taXNlIiwiZ2V0VmlzaWJpbGl0eVN0YXRlIiwiUFJFUkVOREVSIiwid2hlbkZpcnN0VmlzaWJsZSIsInRoZW4iLCJwcm9wYWdhdGVMYXlvdXRDaGlsZHJlbl8iLCJ0aW1lckZvciIsInByb21pc2UiLCJpc01hbmFnZWRCeVBvb2xfIiwibG9hZFByb21pc2UiLCJyZWFzb24iLCJvblZpZGVvTG9hZGVkXyIsImV2ZW50IiwiY29kZSIsIk1lZGlhRXJyb3IiLCJNRURJQV9FUlJfREVDT0RFIiwiY3VycmVudFNyYyIsInNvdXJjZUNvdW50IiwiY3VycmVudFNvdXJjZSIsInRhZ05hbWUiLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJsb2FkIiwicGxheSIsImdldENhY2hlZFNvdXJjZXNfIiwiY2FjaGVkU291cmNlIiwicmVtb3ZlQXR0cmlidXRlIiwic291cmNlcyIsImlzQ2FjaGVkQnlDZG4iLCJ0eXBlIiwic3JjU291cmNlIiwiY3JlYXRlU291cmNlRWxlbWVudF8iLCJhbXBPcmlnU3JjIiwidW5zaGlmdCIsInJlbW92ZSIsInF1YWxpdGllcyIsIk9iamVjdCIsImtleXMiLCJvcmlnVHlwZSIsIm1heEJpdHJhdGUiLCJxdWFsaXR5IiwiaW5kZXgiLCJjdXJyU291cmNlIiwibGVuZ3RoIiwiY2hhbmdlZFNvdXJjZXMiLCJjYWNoZWQiLCJxdWVyeVNlbGVjdG9yQWxsIiwib3JpZ1NvdXJjZSIsInRyYWNrcyIsInRyYWNrIiwiYXR0cmlidXRlcyIsImNhY2hlZFNvdXJjZXMiLCJpIiwicGVyZm9ybWFuY2VGb3IiLCJhZGRFbmFibGVkRXhwZXJpbWVudCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwidmlkZW8iLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImhhbmRsZU1lZGlhRXJyb3JfIiwiZm9yd2FyZEV2ZW50cyIsIkVOREVEIiwiTE9BREVETUVUQURBVEEiLCJMT0FERUREQVRBIiwiUEFVU0UiLCJQTEFZSU5HIiwiUExBWSIsIm11dGVkIiwicG9wIiwiY2FsbCIsInVuaW5zdGFsbEV2ZW50SGFuZGxlcnNfIiwibWFuYWdlIiwicmVhZHlTdGF0ZSIsIkxPQUQiLCJwYXVzZSIsImlzUGxheWluZyIsInVwZGF0ZVBsYXlpbmciLCJ1bnVzZWRJc0F1dG9wbGF5IiwicmV0IiwiY2F0Y2giLCJwbGF0Zm9ybUZvciIsImlzQW5kcm9pZCIsImNvbnRhaW5zIiwiY29udHJvbHMiLCJjdXJyZW50VGltZSIsImR1cmF0aW9uIiwicGxheWVkIiwicmFuZ2VzIiwic3RhcnQiLCJlbmQiLCJ0b2dnbGVQbGFjZWhvbGRlciIsInJlbW92ZVBvc3RlckZvckFuZHJvaWRCdWdfIiwidXJsRm9yRG9jIiwicGxhY2Vob2xkZXIiLCJnZXRQbGFjZWhvbGRlciIsImNhbGxiYWNrIiwicG9zdGVySW1nIiwiSW1hZ2UiLCJ0ZXN0Iiwib25sb2FkIiwidGltZVNlY29uZHMiLCJBTVAiLCJCYXNlRWxlbWVudCIsIm9wdF92aWRlb0VsZW1lbnQiLCJoYXNPcmlnU3JjQXR0ciIsImlzUHJveHlPcmlnaW4iLCJleHRlbnNpb24iLCJyZWdpc3RlckVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsY0FBUjtBQUNBLFNBQVFDLFdBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsZ0JBQVIsRUFBMEJDLG1CQUExQjtBQUNBLFNBQ0VDLFlBREYsRUFFRUMsaUJBRkYsRUFHRUMsa0JBSEYsRUFJRUMsT0FKRjtBQU1BLFNBQVFDLGlCQUFSO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxTQUFiLEVBQXdCQyxJQUF4QjtBQUNBLFNBQ0VDLHNCQURGLEVBRUVDLG1CQUZGLEVBR0VDLG9CQUhGLEVBSUVDLGFBSkY7QUFNQSxTQUFRQyxr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Q0FBUDtBQUNEO0FBRURzSixHQUFHLENBQUNLLFNBQUosQ0FBY3JMLEdBQWQsRUFBbUIsS0FBbkIsRUFBMEIsVUFBQ2dMLEdBQUQsRUFBUztBQUNqQ0EsRUFBQUEsR0FBRyxDQUFDTSxlQUFKLENBQW9CdEwsR0FBcEIsRUFBeUJNLFFBQXpCO0FBQ0QsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0VNUFRZX01FVEFEQVRBfSBmcm9tICcuLi8uLi8uLi9zcmMvbWVkaWFzZXNzaW9uLWhlbHBlcic7XG5pbXBvcnQge1BhdXNlSGVscGVyfSBmcm9tICcjY29yZS9kb20vdmlkZW8vcGF1c2UtaGVscGVyJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7VmlkZW9FdmVudHN9IGZyb20gJy4uLy4uLy4uL3NyYy92aWRlby1pbnRlcmZhY2UnO1xuaW1wb3J0IHtWaXNpYmlsaXR5U3RhdGV9IGZyb20gJyNjb3JlL2NvbnN0YW50cy92aXNpYmlsaXR5LXN0YXRlJztcbmltcG9ydCB7YWRkUGFyYW1zVG9Vcmx9IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuaW1wb3J0IHthcHBseUZpbGxDb250ZW50LCBpc0xheW91dFNpemVEZWZpbmVkfSBmcm9tICcjY29yZS9kb20vbGF5b3V0JztcbmltcG9ydCB7XG4gIGNoaWxkRWxlbWVudCxcbiAgY2hpbGRFbGVtZW50QnlUYWcsXG4gIGNoaWxkRWxlbWVudHNCeVRhZyxcbiAgbWF0Y2hlcyxcbn0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7ZGVzY2VuZHNGcm9tU3Rvcnl9IGZyb20gJy4uLy4uLy4uL3NyYy91dGlscy9zdG9yeSc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0LCB1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7XG4gIGFkZEF0dHJpYnV0ZXNUb0VsZW1lbnQsXG4gIGRpc3BhdGNoQ3VzdG9tRXZlbnQsXG4gIGluc2VydEFmdGVyT3JBdFN0YXJ0LFxuICByZW1vdmVFbGVtZW50LFxufSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtmZXRjaENhY2hlZFNvdXJjZXN9IGZyb20gJy4vdmlkZW8tY2FjaGUnO1xuaW1wb3J0IHtcbiAgZnVsbHNjcmVlbkVudGVyLFxuICBmdWxsc2NyZWVuRXhpdCxcbiAgaXNGdWxsc2NyZWVuRWxlbWVudCxcbn0gZnJvbSAnI2NvcmUvZG9tL2Z1bGxzY3JlZW4nO1xuaW1wb3J0IHtnZXRCaXRyYXRlTWFuYWdlcn0gZnJvbSAnLi9mbGV4aWJsZS1iaXRyYXRlJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcbmltcG9ydCB7aW5zdGFsbFZpZGVvTWFuYWdlckZvckRvY30gZnJvbSAnI3NlcnZpY2UvdmlkZW8tbWFuYWdlci1pbXBsJztcbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cyc7XG5pbXBvcnQge2xpc3RlbiwgbGlzdGVuT25jZVByb21pc2V9IGZyb20gJy4uLy4uLy4uL3NyYy9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHttdXRlZE9yVW5tdXRlZEV2ZW50fSBmcm9tICcuLi8uLi8uLi9zcmMvaWZyYW1lLXZpZGVvJztcbmltcG9ydCB7cHJvcGFnYXRlQXR0cmlidXRlc30gZnJvbSAnI2NvcmUvZG9tL3Byb3BhZ2F0ZS1hdHRyaWJ1dGVzJztcbmltcG9ydCB7XG4gIHByb3BhZ2F0ZU9iamVjdEZpdFN0eWxlcyxcbiAgc2V0SW1wb3J0YW50U3R5bGVzLFxuICBzZXRJbml0aWFsRGlzcGxheSxcbiAgc2V0U3R5bGVzLFxufSBmcm9tICcjY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHt0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5cbmNvbnN0IFRBRyA9ICdhbXAtdmlkZW8nO1xuXG4vKiogQHByaXZhdGUgeyFBcnJheTxzdHJpbmc+fSAqL1xuY29uc3QgQVRUUlNfVE9fUFJPUEFHQVRFX09OX0JVSUxEID0gW1xuICAnYXJpYS1kZXNjcmliZWRieScsXG4gICdhcmlhLWxhYmVsJyxcbiAgJ2FyaWEtbGFiZWxsZWRieScsXG4gICdjb250cm9scycsXG4gICdjcm9zc29yaWdpbicsXG4gICdkaXNhYmxlcmVtb3RlcGxheWJhY2snLFxuICAnY29udHJvbHNMaXN0JyxcbiAgJ3RpdGxlJyxcbl07XG5cbi8qKiBAcHJpdmF0ZSB7IU1hcDxzdHJpbmcsIG51bWJlcj59IHRoZSBiaXRyYXRlIGluIEtiL3Mgb2YgYW1wX3ZpZGVvX3F1YWxpdHkgZm9yIHZpZGVvcyBpbiB0aGUgYW1wcHJvamVjdCBjZG4gKi9cbmNvbnN0IEFNUF9WSURFT19RVUFMSVRZX0JJVFJBVEVTID0ge1xuICAnaGlnaCc6IDIwMDAsXG4gICdtZWRpdW0nOiA3MjAsXG4gICdsb3cnOiA0MDAsXG59O1xuXG4vKipcbiAqIERvIG5vdCBwcm9wYWdhdGUgYGF1dG9wbGF5YC4gQXV0b3BsYXkgYmVoYXZpb3IgaXMgbWFuYWdlZCBieVxuICogICAgICAgdmlkZW8gbWFuYWdlciBzaW5jZSBhbXAtdmlkZW8gaW1wbGVtZW50cyB0aGUgVmlkZW9JbnRlcmZhY2UuXG4gKiBAcHJpdmF0ZSB7IUFycmF5PHN0cmluZz59XG4gKi9cbmNvbnN0IEFUVFJTX1RPX1BST1BBR0FURV9PTl9MQVlPVVQgPSBbJ2xvb3AnLCAncG9zdGVyJywgJ3ByZWxvYWQnXTtcblxuLyoqIEBwcml2YXRlIHshQXJyYXk8c3RyaW5nPn0gKi9cbmNvbnN0IEFUVFJTX1RPX1BST1BBR0FURSA9IEFUVFJTX1RPX1BST1BBR0FURV9PTl9CVUlMRC5jb25jYXQoXG4gIEFUVFJTX1RPX1BST1BBR0FURV9PTl9MQVlPVVRcbik7XG5cbi8qKlxuICogQGltcGxlbWVudHMgey4uLy4uLy4uL3NyYy92aWRlby1pbnRlcmZhY2UuVmlkZW9JbnRlcmZhY2V9XG4gKi9cbmV4cG9ydCBjbGFzcyBBbXBWaWRlbyBleHRlbmRzIEFNUC5CYXNlRWxlbWVudCB7XG4gIC8qKlxuICAgKiBBTVAgQ2FjaGUgbWF5IHNlbGVjdGl2ZWx5IGNhY2hlIGNlcnRhaW4gdmlkZW8gc291cmNlcyAoYmFzZWQgb24gdmFyaW91c1xuICAgKiBoZXVyaXN0aWNzIHN1Y2ggYXMgdmlkZW8gdHlwZSwgZXh0ZW5zaW9ucywgZXRjLi4uKS5cbiAgICogV2hlbiBBTVAgQ2FjaGUgZG9lcyBzbywgaXQgcmV3cml0ZXMgdGhlIGBzcmNgIGZvciBgYW1wLXZpZGVvYCBhbmRcbiAgICogYHNvdXJjZWAgY2hpbGRyZW4gdGhhdCBhcmUgY2FjaGVkIGFuZCBhZGRzIGEgYGFtcC1vcmlnLXNyY2AgYXR0cmlidXRlXG4gICAqIHBvaW50aW5nIHRvIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gICAqXG4gICAqIFRoZXJlIGFyZSB0d28gc2VwYXJhdGUgcnVudGltZSBjb25jZXJucyB0aGF0IHdlIGhhbmRsZSBoZXJlOlxuICAgKlxuICAgKiAxKSBIYW5kbGluZyA0MDRzXG4gICAqIEV2ZW50aG91Z2ggQU1QIENhY2hlIHJld3JpdGVzIHRoZSBgc3JjYCB0byBwb2ludCB0byB0aGUgQ0ROLCB0aGUgYWN0dWFsXG4gICAqIHZpZGVvIG1heSBub3QgYmUgcmVhZHkgaW4gdGhlIGNhY2hlIHlldCwgaW4gdGhvc2UgY2FzZXMgdGhlIENETiB3aWxsXG4gICAqIHJldHVybiBhIDQwNC5cbiAgICogQU1QIENhY2hlIGFsc28gcmV3cml0ZXMgVXJscyBmb3IgYWxsIHNvdXJjZXMgYW5kIHJldHVybnMgNDA0IGZvciB0eXBlc1xuICAgKiB0aGF0IGFyZSBub3Qgc3VwcG9ydGVkIHRvIGJlIGNhY2hlZC5cbiAgICpcbiAgICogUnVudGltZSBoYW5kbGVzIHRoaXMgc2l0dWF0aW9uIGJ5IGFwcGVuZGluZyBhbiBhZGRpdGlvbmFsXG4gICAqIDxzb3VyY2U+IHBvaW50aW5nIHRvIHRoZSBvcmlnaW5hbCBzcmMgQUZURVIgdGhlIGNhY2hlZCBzb3VyY2Ugc28gYnJvd3NlclxuICAgKiB3aWxsIGF1dG9tYXRpY2FsbHkgcHJvY2VlZCB0byB0aGUgbmV4dCBzb3VyY2UgaWYgb25lIGZhaWxzLlxuICAgKiBPcmlnaW5hbCBzb3VyY2VzIGFyZSBhZGRlZCBvbmx5IHdoZW4gcGFnZSBiZWNvbWVzIHZpc2libGUgYW5kIG5vdCBkdXJpbmdcbiAgICogcHJlcmVuZGVyIG1vZGUuXG4gICAqXG4gICAqIDIpIFByZXJlbmRlcmluZ1xuICAgKiBOb3cgdGhhdCBzb21lIHNvdXJjZXMgbWlnaHQgYmUgY2FjaGVkLCB3ZSBjYW4gcHJlbG9hZCB0aGVtIGR1cmluZyBwcmVyZW5kZXJcbiAgICogcGhhc2UuIFJ1bnRpbWUgaGFuZGxlcyB0aGlzIGJ5IGFkZGluZyBhbnkgY2FjaGVkIHNvdXJjZXMgdG8gdGhlIDx2aWRlbz5cbiAgICogZWxlbWVudCBkdXJpbmcgcHJlcmVuZGVyIGFuZCBhdXRvbWF0aWNhbGx5IHNldHMgdGhlIGBwcmVsb2FkYCB0byBgYXV0b2BcbiAgICogc28gYnJvd3NlcnMgKGJhc2VkIG9uIHRoZWlyIG93biBoZXVyaXN0aWNzKSBjYW4gc3RhcnQgZmV0Y2hpbmcgdGhlIGNhY2hlZFxuICAgKiB2aWRlb3MuIElmIGBwcmVsb2FkYCBpcyBzcGVjaWZpZWQgYnkgdGhlIGF1dGhvciwgdGhlbiBpdCB0YWtlcyBwcmVjZWRlbmNlLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhpcyBmbGFnIGRvZXMgbm90IGltcGFjdCBwcmVyZW5kZXJpbmcgb2YgdGhlIGBwb3N0ZXJgIGFzIHBvc3RlclxuICAgKiBpcyBmZXRjaGVkIChhbmQgaXMgYWx3YXlzIGNhY2hlZCkgZHVyaW5nIGBidWlsZENhbGxiYWNrYCB3aGljaCBpcyBub3RcbiAgICogZGVwZW5kZW50IG9uIHRoZSB2YWx1ZSBvZiBgcHJlcmVuZGVyQWxsb3dlZCgpYC5cbiAgICpcbiAgICogQG92ZXJyaWRlXG4gICAqIEBub2NvbGxhcHNlXG4gICAqL1xuICBzdGF0aWMgcHJlcmVuZGVyQWxsb3dlZChlbGVtZW50KSB7XG4gICAgLy8gT25seSBhbGxvdyBwcmVyZW5kZXIgaWYgdmlkZW8gc291cmNlcyBhcmUgY2FjaGVkIG9uIENETiBvciByZW1vdGUgdmlkZW9cbiAgICAvLyBjYWNoZSwgb3IgaWYgdmlkZW8gaGFzIGEgcG9zdGVyIGltYWdlLlxuXG4gICAgLy8gUG9zdGVyIGlzIGF2YWlsYWJsZSwgb3IgY2FjaGUgaXMgY29uZmlndXJlZC5cbiAgICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3Bvc3RlcicpIHx8IGVsZW1lbnQuaGFzQXR0cmlidXRlKCdjYWNoZScpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBMb29rIGZvciBzb3VyY2VzLlxuICAgIGNvbnN0IHNvdXJjZXMgPSB0b0FycmF5KGNoaWxkRWxlbWVudHNCeVRhZyhlbGVtZW50LCAnc291cmNlJykpO1xuICAgIHNvdXJjZXMucHVzaChlbGVtZW50KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpc0NhY2hlZEJ5Q2RuKHNvdXJjZXNbaV0sIGVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMudmlkZW9fID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLm11dGVkXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL21lZGlhc2Vzc2lvbi1oZWxwZXIuTWV0YWRhdGFEZWZ9ICovXG4gICAgdGhpcy5tZXRhZGF0YV8gPSBFTVBUWV9NRVRBREFUQTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFBcnJheTwhVW5saXN0ZW5EZWY+fSAqL1xuICAgIHRoaXMudW5saXN0ZW5lcnNfID0gW107XG5cbiAgICAvKiogQHZpc2libGVGb3JUZXN0aW5nIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnBvc3RlckR1bW15SW1hZ2VGb3JUZXN0aW5nXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9ib29sZWFufSB3aGV0aGVyIHRoZXJlIGFyZSBzb3VyY2VzIHRoYXQgd2lsbCB1c2UgYSBCaXRyYXRlTWFuYWdlciAqL1xuICAgIHRoaXMuaGFzQml0cmF0ZVNvdXJjZXNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLnBhdXNlSGVscGVyXyA9IG5ldyBQYXVzZUhlbHBlcih0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9vbkxheW91dFxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHByZWNvbm5lY3RDYWxsYmFjayhvcHRfb25MYXlvdXQpIHtcbiAgICB0aGlzLmdldFZpZGVvU291cmNlc0ZvclByZWNvbm5lY3RfKCkuZm9yRWFjaCgodmlkZW9TcmMpID0+IHtcbiAgICAgIFNlcnZpY2VzLnByZWNvbm5lY3RGb3IodGhpcy53aW4pLnVybChcbiAgICAgICAgdGhpcy5nZXRBbXBEb2MoKSxcbiAgICAgICAgdmlkZW9TcmMsXG4gICAgICAgIG9wdF9vbkxheW91dFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHshQXJyYXk8c3RyaW5nPn1cbiAgICovXG4gIGdldFZpZGVvU291cmNlc0ZvclByZWNvbm5lY3RfKCkge1xuICAgIGNvbnN0IHZpZGVvU3JjID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgaWYgKHZpZGVvU3JjKSB7XG4gICAgICByZXR1cm4gW3ZpZGVvU3JjXTtcbiAgICB9XG4gICAgY29uc3Qgc3JjcyA9IFtdO1xuICAgIHRvQXJyYXkoY2hpbGRFbGVtZW50c0J5VGFnKHRoaXMuZWxlbWVudCwgJ3NvdXJjZScpKS5mb3JFYWNoKChzb3VyY2UpID0+IHtcbiAgICAgIGNvbnN0IHNyYyA9IHNvdXJjZS5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgICAgaWYgKHNyYykge1xuICAgICAgICBzcmNzLnB1c2goc3JjKTtcbiAgICAgIH1cbiAgICAgIC8vIFdlIGFsc28gd2FudCB0byBwcmVjb25uZWN0IHRvIHRoZSBvcmlnaW4gc3JjIHRvIG1ha2UgZmFsbGJhY2sgZmFzdGVyLlxuICAgICAgY29uc3Qgb3JpZ1NyYyA9IHNvdXJjZS5nZXRBdHRyaWJ1dGUoJ2FtcC1vcmlnLXNyYycpO1xuICAgICAgaWYgKG9yaWdTcmMpIHtcbiAgICAgICAgc3Jjcy5wdXNoKG9yaWdTcmMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzcmNzO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0xheW91dFN1cHBvcnRlZChsYXlvdXQpIHtcbiAgICByZXR1cm4gaXNMYXlvdXRTaXplRGVmaW5lZChsYXlvdXQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIGNvbnN0IHtlbGVtZW50fSA9IHRoaXM7XG5cbiAgICB0aGlzLmNvbmZpZ3VyZV8oKTtcblxuICAgIHRoaXMudmlkZW9fID0gZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG5cbiAgICBjb25zdCBwb3N0ZXIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgncG9zdGVyJyk7XG4gICAgaWYgKCFwb3N0ZXIgJiYgZ2V0TW9kZSgpLmRldmVsb3BtZW50KSB7XG4gICAgICBjb25zb2xlIC8qT0sqL1xuICAgICAgICAuZXJyb3IoJ05vIFwicG9zdGVyXCIgYXR0cmlidXRlIGhhcyBiZWVuIHByb3ZpZGVkIGZvciBhbXAtdmlkZW8uJyk7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIGlubGluZSBwbGF5IGZvciBpT1MuXG4gICAgdGhpcy52aWRlb18uc2V0QXR0cmlidXRlKCdwbGF5c2lubGluZScsICcnKTtcbiAgICB0aGlzLnZpZGVvXy5zZXRBdHRyaWJ1dGUoJ3dlYmtpdC1wbGF5c2lubGluZScsICcnKTtcbiAgICAvLyBEaXNhYmxlIHZpZGVvIHByZWxvYWQgaW4gcHJlcmVuZGVyIG1vZGUuXG4gICAgdGhpcy52aWRlb18uc2V0QXR0cmlidXRlKCdwcmVsb2FkJywgJ25vbmUnKTtcbiAgICB0aGlzLmNoZWNrQTExeUF0dHJpYnV0ZVRleHRfKCk7XG4gICAgcHJvcGFnYXRlQXR0cmlidXRlcyhcbiAgICAgIEFUVFJTX1RPX1BST1BBR0FURV9PTl9CVUlMRCxcbiAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgIHRoaXMudmlkZW9fLFxuICAgICAgLyogb3B0X3JlbW92ZU1pc3NpbmdBdHRycyAqLyB0cnVlXG4gICAgKTtcbiAgICB0aGlzLmluc3RhbGxFdmVudEhhbmRsZXJzXygpO1xuICAgIGFwcGx5RmlsbENvbnRlbnQodGhpcy52aWRlb18sIHRydWUpO1xuICAgIHByb3BhZ2F0ZU9iamVjdEZpdFN0eWxlcyh0aGlzLmVsZW1lbnQsIHRoaXMudmlkZW9fKTtcblxuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy52aWRlb18pO1xuXG4gICAgLy8gR2F0aGVyIG1ldGFkYXRhXG4gICAgY29uc3QgYXJ0aXN0ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FydGlzdCcpO1xuICAgIGNvbnN0IHRpdGxlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJyk7XG4gICAgY29uc3QgYWxidW0gPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYWxidW0nKTtcbiAgICBjb25zdCBhcnR3b3JrID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FydHdvcmsnKTtcbiAgICB0aGlzLm1ldGFkYXRhXyA9IHtcbiAgICAgICd0aXRsZSc6IHRpdGxlIHx8ICcnLFxuICAgICAgJ2FydGlzdCc6IGFydGlzdCB8fCAnJyxcbiAgICAgICdhbGJ1bSc6IGFsYnVtIHx8ICcnLFxuICAgICAgJ2FydHdvcmsnOiBbeydzcmMnOiBhcnR3b3JrIHx8IHBvc3RlciB8fCAnJ31dLFxuICAgIH07XG5cbiAgICAvLyBDYWNoZWQgc28gbWVkaWFwb29sIG9wZXJhdGlvbnMgKGVnOiBzd2FwcGluZyBzb3VyY2VzKSBkb24ndCBpbnRlcmZlcmUgd2l0aCB0aGlzIGJvb2wuXG4gICAgdGhpcy5oYXNCaXRyYXRlU291cmNlc18gPVxuICAgICAgISF0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcignc291cmNlW2RhdGEtYml0cmF0ZV0nKSB8fFxuICAgICAgdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY2FjaGUnKSB8fFxuICAgICAgdGhpcy5oYXNBbnlDYWNoZWRTb3VyY2VzXygpO1xuXG4gICAgaW5zdGFsbFZpZGVvTWFuYWdlckZvckRvYyhlbGVtZW50KTtcblxuICAgIFNlcnZpY2VzLnZpZGVvTWFuYWdlckZvckRvYyhlbGVtZW50KS5yZWdpc3Rlcih0aGlzKTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdjYWNoZScpKSB7XG4gICAgICAvLyBJZiBlbmFibGVkLCBkaXNhYmxlcyBBTVAgQ2FjaGUgdmlkZW8gY2FjaGluZyAoY2RuLmFtcHByb2plY3Qub3JnKSxcbiAgICAgIC8vIG9wdGVkLWluIHRocm91Z2ggdGhlIFwiYW1wLW9yaWctc3JjXCIgYXR0cmlidXRlLlxuICAgICAgdGhpcy5yZW1vdmVDYWNoZWRTb3VyY2VzXygpO1xuICAgICAgLy8gRmV0Y2ggbmV3IHNvdXJjZXMgZnJvbSByZW1vdGUgdmlkZW8gY2FjaGUsIG9wdGVkLWluIHRocm91Z2ggdGhlIFwiY2FjaGVcIlxuICAgICAgLy8gYXR0cmlidXRlLlxuICAgICAgcmV0dXJuIGZldGNoQ2FjaGVkU291cmNlcyhcbiAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICB0aGlzLmdldEFtcERvYygpLFxuICAgICAgICB0aGlzLmdldE1heEJpdHJhdGVfKClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIE92ZXJyaWRlcyBhcmlhLWxhYmVsIHdpdGggYWx0IGlmIGFyaWEtbGFiZWwgb3IgdGl0bGUgaXMgbm90IHNwZWNpZmllZC5cbiAgICovXG4gIGNoZWNrQTExeUF0dHJpYnV0ZVRleHRfKCkge1xuICAgIGNvbnN0IGFsdFRleHQgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhbHQnKTtcbiAgICBjb25zdCBoYXNUaXRsZSA9IHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3RpdGxlJyk7XG4gICAgY29uc3QgaGFzQXJpYUxhYmVsID0gdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpO1xuICAgIGlmIChhbHRUZXh0ICYmICFoYXNUaXRsZSAmJiAhaGFzQXJpYUxhYmVsKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYWx0VGV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkZXRhY2hlZENhbGxiYWNrKCkge1xuICAgIHRoaXMudXBkYXRlSXNQbGF5aW5nXyhmYWxzZSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgY29uZmlndXJlXygpIHtcbiAgICBjb25zdCB7ZWxlbWVudH0gPSB0aGlzO1xuICAgIGlmICghZGVzY2VuZHNGcm9tU3RvcnkoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgWydpLWFtcGh0bWwtZGlzYWJsZS1tZWRpYXNlc3Npb24nLCAnaS1hbXBodG1sLXBvb2xib3VuZCddLmZvckVhY2goXG4gICAgICAoY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG11dGF0ZWRBdHRyaWJ1dGVzQ2FsbGJhY2sobXV0YXRpb25zKSB7XG4gICAgaWYgKCF0aGlzLnZpZGVvXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7ZWxlbWVudH0gPSB0aGlzO1xuICAgIGlmIChtdXRhdGlvbnNbJ3NyYyddKSB7XG4gICAgICBjb25zdCB1cmxTZXJ2aWNlID0gdGhpcy5nZXRVcmxTZXJ2aWNlXygpO1xuICAgICAgdXJsU2VydmljZS5hc3NlcnRIdHRwc1VybChlbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJyksIGVsZW1lbnQpO1xuICAgICAgcHJvcGFnYXRlQXR0cmlidXRlcyhcbiAgICAgICAgWydzcmMnXSxcbiAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMudmlkZW9fKVxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgYXR0cnMgPSBBVFRSU19UT19QUk9QQUdBVEUuZmlsdGVyKFxuICAgICAgKHZhbHVlKSA9PiBtdXRhdGlvbnNbdmFsdWVdICE9PSB1bmRlZmluZWRcbiAgICApO1xuICAgIHByb3BhZ2F0ZUF0dHJpYnV0ZXMoXG4gICAgICBhdHRycyxcbiAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy52aWRlb18pLFxuICAgICAgLyogb3B0X3JlbW92ZU1pc3NpbmdBdHRycyAqLyB0cnVlXG4gICAgKTtcbiAgICBpZiAobXV0YXRpb25zWydzcmMnXSkge1xuICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudChlbGVtZW50LCBWaWRlb0V2ZW50cy5SRUxPQUQpO1xuICAgIH1cbiAgICBpZiAobXV0YXRpb25zWydhcnR3b3JrJ10gfHwgbXV0YXRpb25zWydwb3N0ZXInXSkge1xuICAgICAgY29uc3QgYXJ0d29yayA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcnR3b3JrJyk7XG4gICAgICBjb25zdCBwb3N0ZXIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgncG9zdGVyJyk7XG4gICAgICB0aGlzLm1ldGFkYXRhX1snYXJ0d29yayddID0gW3snc3JjJzogYXJ0d29yayB8fCBwb3N0ZXIgfHwgJyd9XTtcbiAgICB9XG4gICAgaWYgKG11dGF0aW9uc1snYWxidW0nXSkge1xuICAgICAgY29uc3QgYWxidW0gPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYWxidW0nKTtcbiAgICAgIHRoaXMubWV0YWRhdGFfWydhbGJ1bSddID0gYWxidW0gfHwgJyc7XG4gICAgfVxuICAgIGlmIChtdXRhdGlvbnNbJ3RpdGxlJ10pIHtcbiAgICAgIGNvbnN0IHRpdGxlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJyk7XG4gICAgICB0aGlzLm1ldGFkYXRhX1sndGl0bGUnXSA9IHRpdGxlIHx8ICcnO1xuICAgIH1cbiAgICBpZiAobXV0YXRpb25zWydhcnRpc3QnXSkge1xuICAgICAgY29uc3QgYXJ0aXN0ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FydGlzdCcpO1xuICAgICAgdGhpcy5tZXRhZGF0YV9bJ2FydGlzdCddID0gYXJ0aXN0IHx8ICcnO1xuICAgIH1cbiAgICAvLyBUT0RPKEBhZ2hhc3NlbWksIDEwNzU2KSBFaXRoZXIgbWFrZSBtZXRhZGF0YSBvYnNlcnZhYmxlIG9yIHN1Ym1pdFxuICAgIC8vIGFuIGV2ZW50IGluZGljYXRpbmcgbWV0YWRhdGEgY2hhbmdlZCAoaW4gY2FzZSBtZXRhZGF0YSBjaGFuZ2VzXG4gICAgLy8gd2hpbGUgdGhlIHZpZGVvIGlzIHBsYXlpbmcpLlxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICB0aGlzLnZpZGVvXyA9IGRldigpLmFzc2VydEVsZW1lbnQodGhpcy52aWRlb18pO1xuXG4gICAgaWYgKCF0aGlzLmlzVmlkZW9TdXBwb3J0ZWRfKCkpIHtcbiAgICAgIHRoaXMudG9nZ2xlRmFsbGJhY2sodHJ1ZSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcHJvcGFnYXRlQXR0cmlidXRlcyhcbiAgICAgIEFUVFJTX1RPX1BST1BBR0FURV9PTl9MQVlPVVQsXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMudmlkZW9fKSxcbiAgICAgIC8qIG9wdF9yZW1vdmVNaXNzaW5nQXR0cnMgKi8gdHJ1ZVxuICAgICk7XG5cbiAgICB0aGlzLmNyZWF0ZVBvc3RlckZvckFuZHJvaWRCdWdfKCk7XG4gICAgdGhpcy5vblBvc3RlckxvYWRlZF8oKCkgPT4gdGhpcy5oaWRlQmx1cnJ5UGxhY2Vob2xkZXJfKCkpO1xuXG4gICAgdGhpcy5wcm9wYWdhdGVDYWNoZWRTb3VyY2VzXygpO1xuXG4gICAgLy8gSWYgd2UgYXJlIGluIHByZXJlbmRlciBtb2RlLCBvbmx5IHByb3BhZ2F0ZSBjYWNoZWQgc291cmNlcyBhbmQgdGhlblxuICAgIC8vIHdoZW4gZG9jdW1lbnQgYmVjb21lcyB2aXNpYmxlIHByb3BhZ2F0ZSBvcmlnaW4gc291cmNlcyBhbmQgb3RoZXIgY2hpbGRyZW5cbiAgICAvLyBJZiBub3QgaW4gcHJlcmVuZGVyIG1vZGUsIHByb3BhZ2F0ZSBldmVyeXRoaW5nLlxuICAgIGxldCBwZW5kaW5nT3JpZ2luUHJvbWlzZTtcbiAgICBpZiAodGhpcy5nZXRBbXBEb2MoKS5nZXRWaXNpYmlsaXR5U3RhdGUoKSA9PSBWaXNpYmlsaXR5U3RhdGUuUFJFUkVOREVSKSB7XG4gICAgICBpZiAoIXRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3ByZWxvYWQnKSkge1xuICAgICAgICB0aGlzLnZpZGVvXy5zZXRBdHRyaWJ1dGUoJ3ByZWxvYWQnLCAnYXV0bycpO1xuICAgICAgfVxuICAgICAgcGVuZGluZ09yaWdpblByb21pc2UgPSB0aGlzLmdldEFtcERvYygpXG4gICAgICAgIC53aGVuRmlyc3RWaXNpYmxlKClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMucHJvcGFnYXRlTGF5b3V0Q2hpbGRyZW5fKCk7XG4gICAgICAgICAgLy8gV2UgbmVlZCB0byB5aWVsZCB0byB0aGUgZXZlbnQgcXVldWUgYmVmb3JlIGxpc3RpbmcgZm9yIGxvYWRQcm9taXNlXG4gICAgICAgICAgLy8gYmVjYXVzZSB0aGlzIGVsZW1lbnQgbWF5IHN0aWxsIGJlIGluIGVycm9yIHN0YXRlIGZyb20gdGhlIHByZS1yZW5kZXJcbiAgICAgICAgICAvLyBsb2FkLlxuICAgICAgICAgIHJldHVybiBTZXJ2aWNlcy50aW1lckZvcih0aGlzLndpbilcbiAgICAgICAgICAgIC5wcm9taXNlKDEpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIERvbid0IHdhaXQgZm9yIHRoZSBzb3VyY2UgdG8gbG9hZCBpZiBtZWRpYSBwb29sIGlzIHRha2luZyBvdmVyLlxuICAgICAgICAgICAgICBpZiAodGhpcy5pc01hbmFnZWRCeVBvb2xfKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9hZFByb21pc2UodGhpcy52aWRlb18pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BhZ2F0ZUxheW91dENoaWxkcmVuXygpO1xuICAgIH1cblxuICAgIC8vIGxvYWRQcm9taXNlIGZvciBtZWRpYSBlbGVtZW50cyBsaXN0ZW5zIHRvIGBsb2FkZWRtZXRhZGF0YWAuXG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMubG9hZFByb21pc2UodGhpcy52aWRlb18pXG4gICAgICAudGhlbihudWxsLCAocmVhc29uKSA9PiB7XG4gICAgICAgIGlmIChwZW5kaW5nT3JpZ2luUHJvbWlzZSkge1xuICAgICAgICAgIHJldHVybiBwZW5kaW5nT3JpZ2luUHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5vblZpZGVvTG9hZGVkXygpKTtcblxuICAgIC8vIFJlc29sdmUgbGF5b3V0Q2FsbGJhY2sgcmlnaHQgYXdheSBpZiB0aGUgdmlkZW8gd29uJ3QgcHJlbG9hZC5cbiAgICBpZiAodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgncHJlbG9hZCcpID09PSAnbm9uZScpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZXNvbHZlIGxheW91dENhbGxiYWNrIGFzIHNvb24gYXMgYWxsIHNvdXJjZXMgYXJlIGFwcGVuZGVkIHdoZW4gd2l0aGluIGFcbiAgICAvLyBzdG9yeSwgc28gaXQgY2FuIGJlIGhhbmRsZWQgYnkgdGhlIG1lZGlhIHBvb2wgYXMgc29vbiBhcyBwb3NzaWJsZS5cbiAgICBpZiAodGhpcy5pc01hbmFnZWRCeVBvb2xfKCkpIHtcbiAgICAgIHJldHVybiBwZW5kaW5nT3JpZ2luUHJvbWlzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHcmFjZWZ1bGx5IGhhbmRsZSBtZWRpYSBlcnJvcnMgaWYgcG9zc2libGUuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKi9cbiAgaGFuZGxlTWVkaWFFcnJvcl8oZXZlbnQpIHtcbiAgICBpZiAoXG4gICAgICAhdGhpcy52aWRlb18uZXJyb3IgfHxcbiAgICAgIHRoaXMudmlkZW9fLmVycm9yLmNvZGUgIT0gTWVkaWFFcnJvci5NRURJQV9FUlJfREVDT0RFXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIEhUTUxNZWRpYUVsZW1lbnRzIGF1dG9tYXRpY2FsbHkgZmFsbGJhY2sgdG8gdGhlIG5leHQgc291cmNlIGlmIGEgbG9hZCBmYWlsc1xuICAgIC8vIGJ1dCB0aGV5IGRvbid0IHRyeSB0aGUgbmV4dCBzb3VyY2UgdXBvbiBhIGRlY29kZSBlcnJvci5cbiAgICAvLyBUaGlzIGNvZGUgZG9lcyB0aGlzIGZhbGxiYWNrIG1hbnVhbGx5LlxuICAgIHVzZXIoKS5lcnJvcihcbiAgICAgIFRBRyxcbiAgICAgIGBEZWNvZGUgZXJyb3IgaW4gJHt0aGlzLnZpZGVvXy5jdXJyZW50U3JjfWAsXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICApO1xuICAgIC8vIE5vIGZhbGxiYWNrIGF2YWlsYWJsZSBmb3IgYmFyZSBzcmMuXG4gICAgaWYgKHRoaXMudmlkZW9fLnNyYykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBGaW5kIHRoZSBzb3VyY2UgZWxlbWVudCB0aGF0IGNhdXNlZCB0aGUgZGVjb2RlIGVycm9yLlxuICAgIGxldCBzb3VyY2VDb3VudCA9IDA7XG4gICAgY29uc3QgY3VycmVudFNvdXJjZSA9IGNoaWxkRWxlbWVudCh0aGlzLnZpZGVvXywgKHNvdXJjZSkgPT4ge1xuICAgICAgaWYgKHNvdXJjZS50YWdOYW1lICE9ICdTT1VSQ0UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHNvdXJjZUNvdW50Kys7XG4gICAgICByZXR1cm4gc291cmNlLnNyYyA9PSB0aGlzLnZpZGVvXy5jdXJyZW50U3JjO1xuICAgIH0pO1xuICAgIGlmIChzb3VyY2VDb3VudCA9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICBjdXJyZW50U291cmNlLFxuICAgICAgYENhbid0IGZpbmQgc291cmNlIGVsZW1lbnQgZm9yIGN1cnJlbnRTcmMgJHt0aGlzLnZpZGVvXy5jdXJyZW50U3JjfWBcbiAgICApO1xuICAgIHJlbW92ZUVsZW1lbnQoZGV2KCkuYXNzZXJ0RWxlbWVudChjdXJyZW50U291cmNlKSk7XG4gICAgLy8gUmVzZXRzIHRoZSBsb2FkaW5nIGFuZCB3aWxsIGNhdGNoIHRoZSBuZXcgc291cmNlIGlmIGFueS5cbiAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLnZpZGVvXy5sb2FkKCk7XG4gICAgLy8gVW5mb3J0dW5hdGVseSB3ZSBkb24ndCBrbm93IGV4YWN0bHkgd2hhdCBvcGVyYXRpb24gY2F1c2VkIHRoZSBkZWNvZGUgdG9cbiAgICAvLyBmYWlsLiBCdXQgdG8gaGVscCwgd2UgbmVlZCB0byByZXRyeS4gU2luY2UgcGxheSBpcyBtb3N0IGNvbW1vbiwgd2UncmVcbiAgICAvLyBkb2luZyB0aGF0LlxuICAgIHRoaXMucGxheShmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogRGlzYWJsZXMgQU1QIENhY2hlIHZpZGVvIGNhY2hpbmcgKGNkbi5hbXBwcm9qZWN0Lm9yZyksIG9wdGVkLWluIHRocm91Z2hcbiAgICogYW1wLW9yaWctc3JjLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlQ2FjaGVkU291cmNlc18oKSB7XG4gICAgdGhpcy5nZXRDYWNoZWRTb3VyY2VzXygpLmZvckVhY2goKGNhY2hlZFNvdXJjZSkgPT4ge1xuICAgICAgY2FjaGVkU291cmNlLnNldEF0dHJpYnV0ZShcbiAgICAgICAgJ3NyYycsXG4gICAgICAgIGNhY2hlZFNvdXJjZS5nZXRBdHRyaWJ1dGUoJ2FtcC1vcmlnLXNyYycpXG4gICAgICApO1xuICAgICAgY2FjaGVkU291cmNlLnJlbW92ZUF0dHJpYnV0ZSgnYW1wLW9yaWctc3JjJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogUHJvcGFnYXRlIHNvdXJjZXMgdGhhdCBhcmUgY2FjaGVkIGJ5IHRoZSBDRE4uXG4gICAqL1xuICBwcm9wYWdhdGVDYWNoZWRTb3VyY2VzXygpIHtcbiAgICBkZXZBc3NlcnQodGhpcy52aWRlb18pO1xuXG4gICAgY29uc3Qgc291cmNlcyA9IHRvQXJyYXkoY2hpbGRFbGVtZW50c0J5VGFnKHRoaXMuZWxlbWVudCwgJ3NvdXJjZScpKTtcblxuICAgIC8vIGlmIHRoZSBgc3JjYCBvZiBgYW1wLXZpZGVvYCBpdHNlbGYgaXMgY2FjaGVkLCBtb3ZlIGl0IHRvIDxzb3VyY2U+XG4gICAgaWYgKHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3NyYycpICYmIGlzQ2FjaGVkQnlDZG4odGhpcy5lbGVtZW50KSkge1xuICAgICAgY29uc3Qgc3JjID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICBjb25zdCB0eXBlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpO1xuICAgICAgY29uc3Qgc3JjU291cmNlID0gdGhpcy5jcmVhdGVTb3VyY2VFbGVtZW50XyhzcmMsIHR5cGUpO1xuICAgICAgY29uc3QgYW1wT3JpZ1NyYyA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FtcC1vcmlnLXNyYycpO1xuICAgICAgc3JjU291cmNlLnNldEF0dHJpYnV0ZSgnYW1wLW9yaWctc3JjJywgYW1wT3JpZ1NyYyk7XG4gICAgICAvLyBBbHNvIG1ha2Ugc3VyZSBzcmMgaXMgcmVtb3ZlZCBmcm9tIGFtcC12aWRlbyBzaW5jZSBTdG9yaWVzIG1lZGlhLXBvb2xcbiAgICAgIC8vIG1heSBjb3B5IGl0IGJhY2sgZnJvbSBhbXAtdmlkZW8uXG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdzcmMnKTtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgIHNvdXJjZXMudW5zaGlmdChzcmNTb3VyY2UpO1xuICAgIH1cblxuICAgIC8vIE9ubHkgY2FjaGVkIHNvdXJjZXMgYXJlIGFkZGVkIGR1cmluZyBwcmVyZW5kZXIsIHdpdGggYWxsIHRoZSBhdmFpbGFibGVcbiAgICAvLyB0cmFuc2NvZGVzIGdlbmVyYXRlZCBieSB0aGUgY2FjaGUuXG4gICAgLy8gT3JpZ2luIHNvdXJjZXMgd2lsbCBvbmx5IGJlIGFkZGVkIHdoZW4gZG9jdW1lbnQgYmVjb21lcyB2aXNpYmxlLlxuICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICAvLyBDYWNoZWQgYnkgdGhlIEFNUCBDYWNoZSAoYW1wLXZpZGVvW2FtcC1vcmlnLXNyY10pLlxuICAgICAgaWYgKGlzQ2FjaGVkQnlDZG4oc291cmNlLCB0aGlzLmVsZW1lbnQpKSB7XG4gICAgICAgIHNvdXJjZS5yZW1vdmUoKTtcbiAgICAgICAgY29uc3QgcXVhbGl0aWVzID0gT2JqZWN0LmtleXMoQU1QX1ZJREVPX1FVQUxJVFlfQklUUkFURVMpO1xuICAgICAgICBjb25zdCBvcmlnVHlwZSA9IHNvdXJjZS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgICAgY29uc3Qgb3JpZ1NyYyA9IHNvdXJjZS5nZXRBdHRyaWJ1dGUoJ2FtcC1vcmlnLXNyYycpO1xuICAgICAgICBjb25zdCBtYXhCaXRyYXRlID0gdGhpcy5nZXRNYXhCaXRyYXRlXygpO1xuICAgICAgICBxdWFsaXRpZXMuZm9yRWFjaCgocXVhbGl0eSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAobWF4Qml0cmF0ZSA8IEFNUF9WSURFT19RVUFMSVRZX0JJVFJBVEVTW3F1YWxpdHldKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGNhY2hlZFNvdXJjZSA9IGFkZFBhcmFtc1RvVXJsKHNvdXJjZS5zcmMsIHtcbiAgICAgICAgICAgICdhbXBfdmlkZW9fcXVhbGl0eSc6IHF1YWxpdHksXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgY3VyclNvdXJjZSA9IHRoaXMuY3JlYXRlU291cmNlRWxlbWVudF8oY2FjaGVkU291cmNlLCBvcmlnVHlwZSwge1xuICAgICAgICAgICAgJ2RhdGEtYml0cmF0ZSc6IEFNUF9WSURFT19RVUFMSVRZX0JJVFJBVEVTW3F1YWxpdHldLFxuICAgICAgICAgICAgJ2ktYW1waHRtbC12aWRlby1jYWNoZWQtc291cmNlJzogJycsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gS2VlcCBzcmMgb2YgYW1wLW9yaWcgb25seSBpbiBsYXN0IG9uZSBzbyBpdCBhZGRzIHRoZSBvcmlnIHNvdXJjZSBhZnRlciBpdC5cbiAgICAgICAgICBpZiAoaW5kZXggPT09IHF1YWxpdGllcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBjdXJyU291cmNlLnNldEF0dHJpYnV0ZSgnYW1wLW9yaWctc3JjJywgb3JpZ1NyYyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudmlkZW9fLmFwcGVuZENoaWxkKGN1cnJTb3VyY2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENhY2hlZCBieSB0aGUgcmVtb3RlIHZpZGVvIGNhY2hpbmcgKGFtcC12aWRlb1tjYWNoZT0qXSkuXG4gICAgICBpZiAoc291cmNlLmhhc0F0dHJpYnV0ZSgnaS1hbXBodG1sLXZpZGVvLWNhY2hlZC1zb3VyY2UnKSkge1xuICAgICAgICB0aGlzLnZpZGVvXy5hcHBlbmRDaGlsZChzb3VyY2UpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMudmlkZW9fLmNoYW5nZWRTb3VyY2VzKSB7XG4gICAgICB0aGlzLnZpZGVvXy5jaGFuZ2VkU291cmNlcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9wYWdhdGUgb3JpZ2luIHNvdXJjZXMgYW5kIHRyYWNrc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvcGFnYXRlTGF5b3V0Q2hpbGRyZW5fKCkge1xuICAgIGRldkFzc2VydCh0aGlzLnZpZGVvXyk7XG5cbiAgICBjb25zdCBzb3VyY2VzID0gdG9BcnJheShjaGlsZEVsZW1lbnRzQnlUYWcodGhpcy5lbGVtZW50LCAnc291cmNlJykpO1xuXG4gICAgY29uc3Qge2VsZW1lbnR9ID0gdGhpcztcbiAgICBjb25zdCB1cmxTZXJ2aWNlID0gdGhpcy5nZXRVcmxTZXJ2aWNlXygpO1xuXG4gICAgLy8gSWYgdGhlIGBzcmNgIG9mIGBhbXAtdmlkZW9gIGl0c2VsZiBpcyBOT1QgY2FjaGVkLCBzZXQgaXQgb24gdmlkZW9cbiAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3NyYycpICYmICFpc0NhY2hlZEJ5Q2RuKGVsZW1lbnQpKSB7XG4gICAgICB1cmxTZXJ2aWNlLmFzc2VydEh0dHBzVXJsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSwgZWxlbWVudCk7XG4gICAgICBwcm9wYWdhdGVBdHRyaWJ1dGVzKFxuICAgICAgICBbJ3NyYyddLFxuICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy52aWRlb18pXG4gICAgICApO1xuICAgIH1cblxuICAgIHNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XG4gICAgICAvLyBDYWNoZWQgc291cmNlcyBzaG91bGQgaGF2ZSBiZWVuIG1vdmVkIGZyb20gPGFtcC12aWRlbz4gdG8gPHZpZGVvPi5cbiAgICAgIGRldkFzc2VydCghaXNDYWNoZWRCeUNkbihzb3VyY2UsIGVsZW1lbnQpKTtcbiAgICAgIHVybFNlcnZpY2UuYXNzZXJ0SHR0cHNVcmwoc291cmNlLmdldEF0dHJpYnV0ZSgnc3JjJyksIHNvdXJjZSk7XG4gICAgICB0aGlzLnZpZGVvXy5hcHBlbmRDaGlsZChzb3VyY2UpO1xuICAgIH0pO1xuXG4gICAgLy8gVG8gaGFuZGxlIGNhc2VzIHdoZXJlIGNhY2hlZCBzb3VyY2UgbWF5IDQwNCBpZiBub3QgcHJpbWVkIHlldCxcbiAgICAvLyBkdXBsaWNhdGUgdGhlIGBvcmlnaW5gIFVybHMgZm9yIGNhY2hlZCBzb3VyY2VzIGFuZCBpbnNlcnQgdGhlbSBhZnRlciBlYWNoXG4gICAgY29uc3QgY2FjaGVkID0gdG9BcnJheSh0aGlzLnZpZGVvXy5xdWVyeVNlbGVjdG9yQWxsKCdbYW1wLW9yaWctc3JjXScpKTtcbiAgICBjYWNoZWQuZm9yRWFjaCgoY2FjaGVkU291cmNlKSA9PiB7XG4gICAgICBjb25zdCBvcmlnU3JjID0gY2FjaGVkU291cmNlLmdldEF0dHJpYnV0ZSgnYW1wLW9yaWctc3JjJyk7XG4gICAgICBjb25zdCBvcmlnVHlwZSA9IGNhY2hlZFNvdXJjZS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgIGNvbnN0IG9yaWdTb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZUVsZW1lbnRfKG9yaWdTcmMsIG9yaWdUeXBlKTtcbiAgICAgIGluc2VydEFmdGVyT3JBdFN0YXJ0KFxuICAgICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMudmlkZW9fKSxcbiAgICAgICAgb3JpZ1NvdXJjZSxcbiAgICAgICAgY2FjaGVkU291cmNlXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgY29uc3QgdHJhY2tzID0gdG9BcnJheShjaGlsZEVsZW1lbnRzQnlUYWcoZWxlbWVudCwgJ3RyYWNrJykpO1xuICAgIHRyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgdGhpcy52aWRlb18uYXBwZW5kQ2hpbGQodHJhY2spO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMudmlkZW9fLmNoYW5nZWRTb3VyY2VzKSB7XG4gICAgICB0aGlzLnZpZGVvXy5jaGFuZ2VkU291cmNlcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3JjXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0ge09iamVjdD19IGF0dHJpYnV0ZXNcbiAgICogQHJldHVybiB7IUVsZW1lbnR9IHNvdXJjZSBlbGVtZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVTb3VyY2VFbGVtZW50XyhzcmMsIHR5cGUsIGF0dHJpYnV0ZXMgPSB7fSkge1xuICAgIGNvbnN0IHtlbGVtZW50fSA9IHRoaXM7XG4gICAgdGhpcy5nZXRVcmxTZXJ2aWNlXygpLmFzc2VydEh0dHBzVXJsKHNyYywgZWxlbWVudCk7XG4gICAgY29uc3Qgc291cmNlID0gZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuICAgIHNvdXJjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIHNyYyk7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIHNvdXJjZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCB0eXBlKTtcbiAgICB9XG4gICAgYWRkQXR0cmlidXRlc1RvRWxlbWVudChzb3VyY2UsIGF0dHJpYnV0ZXMpO1xuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7IUFycmF5PCFFbGVtZW50Pn1cbiAgICovXG4gIGdldENhY2hlZFNvdXJjZXNfKCkge1xuICAgIGNvbnN0IHtlbGVtZW50fSA9IHRoaXM7XG4gICAgY29uc3Qgc291cmNlcyA9IHRvQXJyYXkoY2hpbGRFbGVtZW50c0J5VGFnKGVsZW1lbnQsICdzb3VyY2UnKSk7XG4gICAgY29uc3QgY2FjaGVkU291cmNlcyA9IFtdO1xuICAgIHNvdXJjZXMucHVzaChlbGVtZW50KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpc0NhY2hlZEJ5Q2RuKHNvdXJjZXNbaV0pKSB7XG4gICAgICAgIGNhY2hlZFNvdXJjZXMucHVzaChzb3VyY2VzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlZFNvdXJjZXM7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc0FueUNhY2hlZFNvdXJjZXNfKCkge1xuICAgIHJldHVybiAhIXRoaXMuZ2V0Q2FjaGVkU291cmNlc18oKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIG1heCBiaXRyYXRlIGlmIHZpZGVvIGlzIG9uIHRoZSBmaXJzdCBwYWdlIG9mIGFuIGFtcC1zdG9yeSBkb2MuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldE1heEJpdHJhdGVfKCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuaXNNYW5hZ2VkQnlQb29sXygpICYmXG4gICAgICBpc0V4cGVyaW1lbnRPbih0aGlzLndpbiwgJ2FtcC1zdG9yeS1maXJzdC1wYWdlLW1heC1iaXRyYXRlJykgJiZcbiAgICAgIG1hdGNoZXModGhpcy5lbGVtZW50LCAnYW1wLXN0b3J5LXBhZ2U6Zmlyc3Qtb2YtdHlwZSBhbXAtdmlkZW8nKVxuICAgICkge1xuICAgICAgU2VydmljZXMucGVyZm9ybWFuY2VGb3IodGhpcy53aW4pLmFkZEVuYWJsZWRFeHBlcmltZW50KFxuICAgICAgICAnYW1wLXN0b3J5LWZpcnN0LXBhZ2UtbWF4LWJpdHJhdGUnXG4gICAgICApO1xuICAgICAgcmV0dXJuIDEwMDA7XG4gICAgfVxuICAgIHJldHVybiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGluc3RhbGxFdmVudEhhbmRsZXJzXygpIHtcbiAgICBjb25zdCB2aWRlbyA9IGRldigpLmFzc2VydEVsZW1lbnQodGhpcy52aWRlb18pO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGUpID0+IHRoaXMuaGFuZGxlTWVkaWFFcnJvcl8oZSkpO1xuXG4gICAgdGhpcy51bmxpc3RlbmVyc18ucHVzaChcbiAgICAgIHRoaXMuZm9yd2FyZEV2ZW50cyhcbiAgICAgICAgW1xuICAgICAgICAgIFZpZGVvRXZlbnRzLkVOREVELFxuICAgICAgICAgIFZpZGVvRXZlbnRzLkxPQURFRE1FVEFEQVRBLFxuICAgICAgICAgIFZpZGVvRXZlbnRzLkxPQURFRERBVEEsXG4gICAgICAgICAgVmlkZW9FdmVudHMuUEFVU0UsXG4gICAgICAgICAgVmlkZW9FdmVudHMuUExBWUlORyxcbiAgICAgICAgICBWaWRlb0V2ZW50cy5QTEFZLFxuICAgICAgICBdLFxuICAgICAgICB2aWRlb1xuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLnVubGlzdGVuZXJzXy5wdXNoKFxuICAgICAgbGlzdGVuKHZpZGVvLCAndm9sdW1lY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB7bXV0ZWR9ID0gdGhpcy52aWRlb187XG4gICAgICAgIGlmICh0aGlzLm11dGVkXyA9PSBtdXRlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm11dGVkXyA9IG11dGVkO1xuICAgICAgICBkaXNwYXRjaEN1c3RvbUV2ZW50KHRoaXMuZWxlbWVudCwgbXV0ZWRPclVubXV0ZWRFdmVudCh0aGlzLm11dGVkXykpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgWydwbGF5JywgJ3BhdXNlJywgJ2VuZGVkJ10uZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgdGhpcy51bmxpc3RlbmVyc18ucHVzaChcbiAgICAgICAgbGlzdGVuKHZpZGVvLCB0eXBlLCAoKSA9PiB0aGlzLnVwZGF0ZUlzUGxheWluZ18odHlwZSA9PSAncGxheScpKVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICB1bmluc3RhbGxFdmVudEhhbmRsZXJzXygpIHtcbiAgICB0aGlzLnVwZGF0ZUlzUGxheWluZ18oZmFsc2UpO1xuICAgIHdoaWxlICh0aGlzLnVubGlzdGVuZXJzXy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudW5saXN0ZW5lcnNfLnBvcCgpLmNhbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBjb21wb25lbnQgaWYgdGhlIHVuZGVybHlpbmcgPHZpZGVvPiB3YXMgY2hhbmdlZC5cbiAgICogVGhpcyBzaG91bGQgb25seSBiZSB1c2VkIGluIGNhc2VzIHdoZW4gYSBoaWdoZXItbGV2ZWwgY29tcG9uZW50IG1hbmFnZXNcbiAgICogdGhpcyBlbGVtZW50J3MgRE9NLlxuICAgKi9cbiAgcmVzZXRPbkRvbUNoYW5nZSgpIHtcbiAgICB0aGlzLnZpZGVvXyA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICBjaGlsZEVsZW1lbnRCeVRhZyh0aGlzLmVsZW1lbnQsICd2aWRlbycpLFxuICAgICAgJ1RyaWVkIHRvIHJlc2V0IGFtcC12aWRlbyB3aXRob3V0IGFuIHVuZGVybHlpbmcgPHZpZGVvPi4nXG4gICAgKTtcbiAgICB0aGlzLnVuaW5zdGFsbEV2ZW50SGFuZGxlcnNfKCk7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRIYW5kbGVyc18oKTtcbiAgICBpZiAodGhpcy5oYXNCaXRyYXRlU291cmNlc18pIHtcbiAgICAgIGdldEJpdHJhdGVNYW5hZ2VyKHRoaXMud2luKS5tYW5hZ2UodGhpcy52aWRlb18pO1xuICAgIH1cbiAgICAvLyBXaGVuIHNvdXJjZSBjaGFuZ2VzLCB2aWRlbyBuZWVkcyB0byB0cmlnZ2VyIGxvYWRlZCBhZ2Fpbi5cbiAgICBpZiAodGhpcy52aWRlb18ucmVhZHlTdGF0ZSA+PSAxKSB7XG4gICAgICB0aGlzLm9uVmlkZW9Mb2FkZWRfKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFZpZGVvIG1pZ2h0IG5vdCBoYXZlIHRoZSBzb3VyY2VzIHlldCwgc28gaW5zdGVhZCBvZiBsb2FkUHJvbWlzZSAod2hpY2ggd291bGQgZmFpbCksXG4gICAgLy8gd2UgbGlzdGVuIGZvciBsb2FkZWRtZXRhZGF0YS5cbiAgICBsaXN0ZW5PbmNlUHJvbWlzZSh0aGlzLnZpZGVvXywgJ2xvYWRlZG1ldGFkYXRhJykudGhlbigoKSA9PlxuICAgICAgdGhpcy5vblZpZGVvTG9hZGVkXygpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBvblZpZGVvTG9hZGVkXygpIHtcbiAgICBkaXNwYXRjaEN1c3RvbUV2ZW50KHRoaXMuZWxlbWVudCwgVmlkZW9FdmVudHMuTE9BRCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHBhdXNlQ2FsbGJhY2soKSB7XG4gICAgaWYgKHRoaXMudmlkZW9fKSB7XG4gICAgICB0aGlzLnZpZGVvXy5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICB1cGRhdGVJc1BsYXlpbmdfKGlzUGxheWluZykge1xuICAgIGlmICh0aGlzLmlzTWFuYWdlZEJ5UG9vbF8oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnBhdXNlSGVscGVyXy51cGRhdGVQbGF5aW5nKGlzUGxheWluZyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgaXNWaWRlb1N1cHBvcnRlZF8oKSB7XG4gICAgcmV0dXJuICEhdGhpcy52aWRlb18ucGxheTtcbiAgfVxuXG4gIC8vIFZpZGVvSW50ZXJmYWNlIEltcGxlbWVudGF0aW9uLiBTZWUgLi4vc3JjL3ZpZGVvLWludGVyZmFjZS5WaWRlb0ludGVyZmFjZVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHN1cHBvcnRzUGxhdGZvcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNWaWRlb1N1cHBvcnRlZF8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGlzSW50ZXJhY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2NvbnRyb2xzJyk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBwbGF5KHVudXNlZElzQXV0b3BsYXkpIHtcbiAgICBjb25zdCByZXQgPSB0aGlzLnZpZGVvXy5wbGF5KCk7XG5cbiAgICBpZiAocmV0ICYmIHJldC5jYXRjaCkge1xuICAgICAgcmV0LmNhdGNoKCgpID0+IHtcbiAgICAgICAgLy8gRW1wdHkgY2F0Y2ggdG8gcHJldmVudCB1c2VsZXNzIHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbiBsb2dnaW5nLlxuICAgICAgICAvLyBQbGF5IGNhbiBmYWlsIGZvciBtYW55IHJlYXNvbnMgc3VjaCBhcyB2aWRlbyBnZXR0aW5nIHBhdXNlZCBiZWZvcmVcbiAgICAgICAgLy8gcGxheSgpIGlzIGZpbmlzaGVkLlxuICAgICAgICAvLyBXZSB1c2UgZXZlbnRzIHRvIGtub3cgdGhlIHN0YXRlIG9mIHRoZSB2aWRlbyBhbmQgZG8gbm90IGNhcmUgYWJvdXRcbiAgICAgICAgLy8gdGhlIHN1Y2Nlc3Mgb3IgZmFpbHVyZSBvZiB0aGUgcGxheSgpJ3MgcmV0dXJuZWQgcHJvbWlzZS5cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmRyb2lkIHdpbGwgc2hvdyBhIGJsYW5rIGZyYW1lIGJldHdlZW4gdGhlIHBvc3RlciBhbmQgdGhlIGZpcnN0IGZyYW1lIGluXG4gICAqIHNvbWUgY2FzZXMuIEluIHRoZXNlIGNhc2VzLCB0aGUgdmlkZW8gZWxlbWVudCBpcyB0cmFuc3BhcmVudC4gQnkgc2V0dGluZ1xuICAgKiBhIHBvc3RlciBsYXllciB1bmRlcm5lYXRoLCB0aGUgcG9zdGVyIGlzIHN0aWxsIHNob3duIHdoaWxlIHRoZSBmaXJzdCBmcmFtZVxuICAgKiBidWZmZXJzLCBzbyBubyBGT1VDLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlUG9zdGVyRm9yQW5kcm9pZEJ1Z18oKSB7XG4gICAgaWYgKCFTZXJ2aWNlcy5wbGF0Zm9ybUZvcih0aGlzLndpbikuaXNBbmRyb2lkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge2VsZW1lbnR9ID0gdGhpcztcbiAgICBpZiAoZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpLWFtcGh0bWwtcG9zdGVyJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcG9zdGVyID0gaHRtbEZvcihlbGVtZW50KWA8aS1hbXBodG1sLXBvc3Rlcj48L2ktYW1waHRtbC1wb3N0ZXI+YDtcbiAgICBjb25zdCBzcmMgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgncG9zdGVyJyk7XG4gICAgc2V0SW5pdGlhbERpc3BsYXkocG9zdGVyLCAnYmxvY2snKTtcbiAgICBzZXRTdHlsZXMocG9zdGVyLCB7XG4gICAgICAnYmFja2dyb3VuZC1pbWFnZSc6IGB1cmwoJHtzcmN9KWAsXG4gICAgICAnYmFja2dyb3VuZC1zaXplJzogJ2NvdmVyJyxcbiAgICAgICdiYWNrZ3JvdW5kLXBvc2l0aW9uJzogJ2NlbnRlcicsXG4gICAgfSk7XG4gICAgcG9zdGVyLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1hbmRyb2lkLXBvc3Rlci1idWcnKTtcbiAgICBhcHBseUZpbGxDb250ZW50KHBvc3Rlcik7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChwb3N0ZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgcGF1c2UoKSB7XG4gICAgdGhpcy52aWRlb18ucGF1c2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIG11dGUoKSB7XG4gICAgaWYgKHRoaXMuaXNNYW5hZ2VkQnlQb29sXygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudmlkZW9fLm11dGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHVubXV0ZSgpIHtcbiAgICBpZiAodGhpcy5pc01hbmFnZWRCeVBvb2xfKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy52aWRlb18ubXV0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaXNNYW5hZ2VkQnlQb29sXygpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnaS1hbXBodG1sLXBvb2xib3VuZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgc2hvd0NvbnRyb2xzKCkge1xuICAgIHRoaXMudmlkZW9fLmNvbnRyb2xzID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGhpZGVDb250cm9scygpIHtcbiAgICB0aGlzLnZpZGVvXy5jb250cm9scyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZnVsbHNjcmVlbkVudGVyKCkge1xuICAgIGZ1bGxzY3JlZW5FbnRlcihkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMudmlkZW9fKSk7XG4gIH1cblxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBmdWxsc2NyZWVuRXhpdCgpIHtcbiAgICBmdWxsc2NyZWVuRXhpdChkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMudmlkZW9fKSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzRnVsbHNjcmVlbigpIHtcbiAgICByZXR1cm4gaXNGdWxsc2NyZWVuRWxlbWVudChkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMudmlkZW9fKSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldE1ldGFkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLm1ldGFkYXRhXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcHJlaW1wbGVtZW50c01lZGlhU2Vzc2lvbkFQSSgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHByZWltcGxlbWVudHNBdXRvRnVsbHNjcmVlbigpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLnZpZGVvXy5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0RHVyYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudmlkZW9fLmR1cmF0aW9uO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRQbGF5ZWRSYW5nZXMoKSB7XG4gICAgLy8gVE9ETyhjdmlhbGl6KTogcmVtb3ZlIHRoaXMgYmVjYXVzZSBpdCBjYW4gYmUgaW5mZXJyZWQgYnkgb3RoZXIgZXZlbnRzXG4gICAgY29uc3Qge3BsYXllZH0gPSB0aGlzLnZpZGVvXztcbiAgICBjb25zdCB7bGVuZ3RofSA9IHBsYXllZDtcbiAgICBjb25zdCByYW5nZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByYW5nZXMucHVzaChbcGxheWVkLnN0YXJ0KGkpLCBwbGF5ZWQuZW5kKGkpXSk7XG4gICAgfVxuICAgIHJldHVybiByYW5nZXM7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdmlkZW8gaXMgZmlyc3QgbG9hZGVkLlxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGZpcnN0TGF5b3V0Q29tcGxldGVkKCkge1xuICAgIGlmICghdGhpcy5oaWRlQmx1cnJ5UGxhY2Vob2xkZXJfKCkpIHtcbiAgICAgIHRoaXMudG9nZ2xlUGxhY2Vob2xkZXIoZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZVBvc3RlckZvckFuZHJvaWRCdWdfKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGBjcmVhdGVQb3N0ZXJGb3JBbmRyb2lkQnVnX2AuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW1vdmVQb3N0ZXJGb3JBbmRyb2lkQnVnXygpIHtcbiAgICBjb25zdCBwb3N0ZXIgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignaS1hbXBodG1sLXBvc3RlcicpO1xuICAgIGlmICghcG9zdGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlbW92ZUVsZW1lbnQocG9zdGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdXJsLWltcGwuVXJsfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0VXJsU2VydmljZV8oKSB7XG4gICAgcmV0dXJuIFNlcnZpY2VzLnVybEZvckRvYyh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZhZGVzIG91dCBhIGJsdXJyeSBwbGFjZWhvbGRlciBpZiBvbmUgY3VycmVudGx5IGV4aXN0cy5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gaWYgdGhlcmUgd2FzIGEgYmx1cnJlZCBpbWFnZSBwbGFjZWhvbGRlciB0aGF0IHdhcyBoaWRkZW4uXG4gICAqL1xuICBoaWRlQmx1cnJ5UGxhY2Vob2xkZXJfKCkge1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5nZXRQbGFjZWhvbGRlcigpO1xuICAgIC8vIGNoZWNrcyBmb3IgdGhlIGV4aXN0ZW5jZSBvZiBhIHZpc2libGUgYmx1cnJ5IHBsYWNlaG9sZGVyXG4gICAgaWYgKHBsYWNlaG9sZGVyKSB7XG4gICAgICBpZiAocGxhY2Vob2xkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdpLWFtcGh0bWwtYmx1cnJ5LXBsYWNlaG9sZGVyJykpIHtcbiAgICAgICAgc2V0SW1wb3J0YW50U3R5bGVzKHBsYWNlaG9sZGVyLCB7J29wYWNpdHknOiAwLjB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgY2FsbGJhY2sgd2hlbiB0aGUgcG9zdGVyIGlzIGxvYWRlZC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBleGVjdXRlcyB3aGVuIHRoZSBwb3N0ZXIgaXNcbiAgICogbG9hZGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Qb3N0ZXJMb2FkZWRfKGNhbGxiYWNrKSB7XG4gICAgY29uc3QgcG9zdGVyID0gdGhpcy52aWRlb18uZ2V0QXR0cmlidXRlKCdwb3N0ZXInKTtcbiAgICBpZiAocG9zdGVyKSB7XG4gICAgICBjb25zdCBwb3N0ZXJJbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGlmIChnZXRNb2RlKCkudGVzdCkge1xuICAgICAgICB0aGlzLnBvc3RlckR1bW15SW1hZ2VGb3JUZXN0aW5nXyA9IHBvc3RlckltZztcbiAgICAgIH1cbiAgICAgIHBvc3RlckltZy5vbmxvYWQgPSBjYWxsYmFjaztcbiAgICAgIHBvc3RlckltZy5zcmMgPSBwb3N0ZXI7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZWVrVG8odGltZVNlY29uZHMpIHtcbiAgICB0aGlzLnZpZGVvXy5jdXJyZW50VGltZSA9IHRpbWVTZWNvbmRzO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHshRWxlbWVudD19IG9wdF92aWRlb0VsZW1lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2FjaGVkQnlDZG4oZWxlbWVudCwgb3B0X3ZpZGVvRWxlbWVudCkge1xuICBjb25zdCBzcmMgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gIGNvbnN0IGhhc09yaWdTcmNBdHRyID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FtcC1vcmlnLXNyYycpO1xuICBpZiAoIWhhc09yaWdTcmNBdHRyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHVybFNlcnZpY2UgPSBTZXJ2aWNlcy51cmxGb3JEb2Mob3B0X3ZpZGVvRWxlbWVudCB8fCBlbGVtZW50KTtcbiAgcmV0dXJuIHVybFNlcnZpY2UuaXNQcm94eU9yaWdpbihzcmMpO1xufVxuXG5BTVAuZXh0ZW5zaW9uKFRBRywgJzAuMScsIChBTVApID0+IHtcbiAgQU1QLnJlZ2lzdGVyRWxlbWVudChUQUcsIEFtcFZpZGVvKTtcbn0pO1xuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-video/0.1/amp-video.js