import { resolvedPromise as _resolvedPromise15 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise14 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise13 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise12 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise11 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise10 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise9 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise8 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
BlessTask,
ELEMENT_BLESSED_PROPERTY_NAME,
LoadTask,
MuteTask,
PauseTask,
PlayTask,
SetCurrentTimeTask,
SwapIntoDomTask,
SwapOutOfDomTask,
UnmuteTask,
UpdateSourcesTask } from "./media-tasks";

import { MEDIA_LOAD_FAILURE_SRC_PROPERTY } from "../../../src/event-helper";
import { Services } from "../../../src/service";
import { Sources } from "./sources";
import { ampMediaElementFor } from "./utils";
import { dev, devAssert } from "../../../src/log";
import { findIndex } from "../../../src/core/types/array";
import { isConnectedNode } from "../../../src/core/dom";
import { matches } from "../../../src/core/dom/query";
import { toWin } from "../../../src/core/window";
import { userInteractedWith } from "../../../src/video-interface";

/** @const @enum {string} */
export var MediaType = {
  UNSUPPORTED: 'unsupported',
  AUDIO: 'audio',
  VIDEO: 'video' };


/** @const @enum {string} */
var MediaElementOrigin = {
  PLACEHOLDER: 'placeholder',
  POOL: 'pool' };


/**
 * A marker type to indicate an element that originated in the document that is
 * being swapped for an element from the pool.
 * @typedef {!Element}
 */
export var PlaceholderElementDef;

/**
 * A marker type to indicate an element that originated from the pool itself.
 * @typedef {!HTMLMediaElement}
 */
var PoolBoundElementDef;

/**
 * An element pulled from the DOM.  It is yet to be resolved into a
 * PlaceholderElement or a PoolBoundElement.
 * @typedef {!PlaceholderElementDef|!PoolBoundElementDef}
 */
export var DomElementDef;

/**
 * Represents the distance of an element from the current place in the document.
 * @typedef {function(!DomElementDef): number}
 */
export var ElementDistanceFnDef;

/**
 * Represents a task to be executed on a media element.
 * @typedef {function(!PoolBoundElementDef, *): !Promise}
 */
var ElementTask_1_0_Def; // eslint-disable-line google-camelcase/google-camelcase

/**
 * @const {string}
 */
var PLACEHOLDER_ELEMENT_ID_PREFIX = 'i-amphtml-placeholder-media-';

/**
 * @const {string}
 */
var POOL_ELEMENT_ID_PREFIX = 'i-amphtml-pool-media-';

/**
 * @const {string}
 */
var POOL_MEDIA_ELEMENT_PROPERTY_NAME = '__AMP_MEDIA_POOL_ID__';

/**
 * @const {string}
 */
var ELEMENT_TASK_QUEUE_PROPERTY_NAME = '__AMP_MEDIA_ELEMENT_TASKS__';

/**
 * @const {string}
 */
var MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME = '__AMP_MEDIA_ELEMENT_ORIGIN__';

/**
 * The name for a string attribute that represents the ID of a media element
 * that the element containing this attribute replaced.
 * @const {string}
 */
export var REPLACED_MEDIA_PROPERTY_NAME = 'replaced-media';

/**
 * @type {!Object<string, !MediaPool>}
 */
var instances = {};

/**
 * @type {number}
 */
var nextInstanceId = 0;

/**
 * 🍹 MediaPool
 * Keeps a pool of N media elements to be shared across components.
 */
export var MediaPool = /*#__PURE__*/function () {
  /**
   * @param {!Window} win The window object.
   * @param {!Object<!MediaType, number>} maxCounts The maximum amount of each
   *     media element that can be allocated by the pool.
   * @param {!ElementDistanceFnDef} distanceFn A function that, given an
   *     element, returns the distance of that element from the current position
   *     in the document.  The definition of "distance" can be implementation-
   *     dependant, as long as it is consistent between invocations.
   */
  function MediaPool(win, maxCounts, distanceFn) {var _this = this,_this$mediaFactory_;_classCallCheck(this, MediaPool);
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /**
     * The function used to retrieve the distance between an element and the
     * current position in the document.
     * @private @const {!ElementDistanceFnDef}
     */
    this.distanceFn_ = distanceFn;

    /**
     * Holds all of the pool-bound media elements that have been allocated.
     * @const {!Object<!MediaType, !Array<!PoolBoundElementDef>>}
     * @visibleForTesting
     */
    this.allocated = {};

    /**
     * Holds all of the pool-bound media elements that have not been allocated.
     * @const {!Object<!MediaType, !Array<!PoolBoundElementDef>>}
     * @visibleForTesting
     */
    this.unallocated = {};

    /**
     * Maps a media element's ID to the object containing its sources.
     * @private @const {!Object<string, !Sources>}
     */
    this.sources_ = {};

    /**
     * Maps a media element's ID to the element.  This is necessary, as elements
     * are kept in memory when they are swapped out of the DOM.
     * @private @const {!Object<string, !PlaceholderElementDef>}
     */
    this.placeholderEls_ = {};

    /**
     * Counter used to produce unique IDs for placeholder media elements.
     * @private {number}
     */
    this.placeholderIdCounter_ = 0;

    /**
     * Whether the media elements in this MediaPool instance have been "blessed"
     * for unmuted playback without user gesture.
     * @private {boolean}
     */
    this.blessed_ = false;

    /** @private {?Array<!AmpElement>} */
    this.ampElementsToBless_ = null;

    /** @const {!Object<string, (function(): !PoolBoundElementDef)>} */
    this.mediaFactory_ = (_this$mediaFactory_ = {}, _defineProperty(_this$mediaFactory_,
    MediaType.AUDIO, function () {
      var audioEl = _this.win_.document.createElement('audio');
      audioEl.setAttribute('muted', '');
      audioEl.muted = true;
      audioEl.classList.add('i-amphtml-pool-media');
      audioEl.classList.add('i-amphtml-pool-audio');
      return audioEl;
    }), _defineProperty(_this$mediaFactory_,
    MediaType.VIDEO, function () {
      var videoEl = _this.win_.document.createElement('video');
      videoEl.setAttribute('muted', '');
      videoEl.muted = true;
      videoEl.setAttribute('playsinline', '');
      videoEl.classList.add('i-amphtml-pool-media');
      videoEl.classList.add('i-amphtml-pool-video');
      return videoEl;
    }), _this$mediaFactory_);


    this.initializeMediaPool_(maxCounts);
  }

  /**
   * Fills the media pool by creating the maximum number of media elements for
   * each of the types of media elements.  We need to create these eagerly so
   * that all media elements exist by the time that blessAll() is invoked,
   * thereby "blessing" all media elements for playback without user gesture.
   * @param {!Object<!MediaType, number>} maxCounts The maximum amount of each
   *     media element that can be allocated by the pool.
   * @private
   */_createClass(MediaPool, [{ key: "initializeMediaPool_", value:
    function initializeMediaPool_(maxCounts) {var _this2 = this;
      var poolIdCounter = 0;

      this.forEachMediaType_(function (key) {
        var type = MediaType[key];
        var count = maxCounts[type] || 0;

        if (count <= 0) {
          return;
        }

        var ctor = devAssert(
        _this2.mediaFactory_[type]);



        // Cloning nodes is faster than building them.
        // Construct a seed media element as a small optimization.
        var mediaElSeed = ctor.call(_this2);

        _this2.allocated[type] = [];
        _this2.unallocated[type] = [];

        // Reverse-looping is generally faster and Closure would usually make
        // this optimization automatically. However, it skips it due to a
        // comparison with the itervar below, so we have to roll it by hand.
        for (var i = count; i > 0; i--) {
          // Use seed element at end of set to prevent wasting it.
          var mediaEl = /** @type {!PoolBoundElementDef} */(
          i == 1 ? mediaElSeed : mediaElSeed.cloneNode( /* deep */true));

          mediaEl.addEventListener('error', _this2.onMediaError_, { capture: true });
          mediaEl.id = POOL_ELEMENT_ID_PREFIX + poolIdCounter++;
          // In Firefox, cloneNode() does not properly copy the muted property
          // that was set in the seed. We need to set it again here.
          mediaEl.muted = true;
          mediaEl[MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME] = MediaElementOrigin.POOL;
          _this2.unallocated[type].push(mediaEl);
        }
      });
    }

    /**
     * Handles HTMLMediaElement and children HTMLSourceElement error events. Marks
     * the media as errored, as there is no other way to check if the load failed
     * when the media is using HTMLSourceElements.
     * @param {!Event} event
     * @private
     */ }, { key: "onMediaError_", value:
    function onMediaError_(event) {
      var target = /** @type {!Element} */(event.target);
      if (!matches(target, 'source:last-of-type, video[src]')) {
        return;
      }
      var media = target.tagName === 'SOURCE' ? target.parentElement : target;
      media[MEDIA_LOAD_FAILURE_SRC_PROPERTY] = media.currentSrc || true;
    }

    /**
     * @return {!Sources} The default source, empty.
     * @private
     */ }, { key: "getDefaultSource_", value:
    function getDefaultSource_() {
      return new Sources();
    }

    /**
     * Comparison function that compares the distance of each element from the
     * current position in the document.
     * @param {!PoolBoundElementDef} mediaA The first element to compare.
     * @param {!PoolBoundElementDef} mediaB The second element to compare.
     * @return {number}
     * @private
     */ }, { key: "compareMediaDistances_", value:
    function compareMediaDistances_(mediaA, mediaB) {
      var distanceA = this.distanceFn_(mediaA);
      var distanceB = this.distanceFn_(mediaB);
      return distanceA < distanceB ? -1 : 1;
    }

    /**
     * @return {string} A unique ID.
     * @private
     */ }, { key: "createPlaceholderElementId_", value:
    function createPlaceholderElementId_() {
      return PLACEHOLDER_ELEMENT_ID_PREFIX + this.placeholderIdCounter_++;
    }

    /**
     * @param {!DomElementDef} mediaElement
     * @return {boolean}
     * @private
     */ }, { key: "isPoolMediaElement_", value:
    function isPoolMediaElement_(mediaElement) {
      return (
      mediaElement[MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME] ===
      MediaElementOrigin.POOL);

    }

    /**
     * Gets the media type from a given element.
     * @param {!PoolBoundElementDef|!PlaceholderElementDef} mediaElement The
     *     element whose media type should be retrieved.
     * @return {!MediaType}
     * @private
     */ }, { key: "getMediaType_", value:
    function getMediaType_(mediaElement) {
      var tagName = mediaElement.tagName.toLowerCase();
      switch (tagName) {
        case 'audio':
          return MediaType.AUDIO;
        case 'video':
          return MediaType.VIDEO;
        default:
          return MediaType.UNSUPPORTED;}

    }

    /**
     * Reserves an element of the specified type by removing it from the set of
     * unallocated elements and returning it.
     * @param {!MediaType} mediaType The type of media element to reserve.
     * @return {?PoolBoundElementDef} The reserved element, if one exists.
     * @private
     */ }, { key: "reserveUnallocatedMediaElement_", value:
    function reserveUnallocatedMediaElement_(mediaType) {
      return this.unallocated[mediaType].pop();
    }

    /**
     * Retrieves the media element from the pool that matches the specified
     * element, if one exists.
     * @param {!MediaType} mediaType The type of media element to get.
     * @param {!DomElementDef} domMediaEl The element whose matching media
     *     element should be retrieved.
     * @return {?PoolBoundElementDef} The media element in the pool that
     *     represents the specified media element
     */ }, { key: "getMatchingMediaElementFromPool_", value:
    function getMatchingMediaElementFromPool_(mediaType, domMediaEl) {
      if (this.isAllocatedMediaElement_(mediaType, domMediaEl)) {
        // The media element in the DOM was already from the pool.
        return (/** @type {!PoolBoundElementDef} */(domMediaEl));
      }

      var allocatedEls = this.allocated[mediaType];
      var index = findIndex(allocatedEls, function (poolMediaEl) {
        return poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] === domMediaEl.id;
      });

      return allocatedEls[index];
    }

    /**
     * Allocates the specified media element of the specified type.
     * @param {!MediaType} mediaType The type of media element to allocate.
     * @param {!PoolBoundElementDef} poolMediaEl The element to be allocated.
     * @private
     */ }, { key: "allocateMediaElement_", value:
    function allocateMediaElement_(mediaType, poolMediaEl) {
      this.allocated[mediaType].push(poolMediaEl);

      var unallocatedEls = this.unallocated[mediaType];
      var indexToRemove = unallocatedEls.indexOf(poolMediaEl);

      if (indexToRemove >= 0) {
        unallocatedEls.splice(indexToRemove, 1);
      }
    }

    /**
     * Deallocates and returns the media element of the specified type furthest
     * from the current position in the document.
     * @param {!MediaType} mediaType The type of media element to deallocate.
     * @param {!PlaceholderElementDef=} opt_elToAllocate If specified, the element
     *     that is trying to be allocated, such that another element must be
     *     evicted.
     * @return {?PoolBoundElementDef} The deallocated element, if one exists.
     * @private
     */ }, { key: "deallocateMediaElement_", value:
    function deallocateMediaElement_(mediaType, opt_elToAllocate) {var _this3 = this;
      var allocatedEls = this.allocated[mediaType];

      // Sort the allocated media elements by distance to ensure that we are
      // evicting the media element that is furthest from the current place in the
      // document.
      allocatedEls.sort(function (a, b) {return _this3.compareMediaDistances_(a, b);});

      // Do not deallocate any media elements if the element being loaded or
      // played is further than the farthest allocated element.
      if (opt_elToAllocate) {
        var furthestEl = allocatedEls[allocatedEls.length - 1];
        if (
        !furthestEl ||
        this.distanceFn_(furthestEl) < this.distanceFn_(opt_elToAllocate))
        {
          return null;
        }
      }

      // De-allocate a media element.
      var poolMediaEl = allocatedEls.pop();
      this.unallocated[mediaType].push(poolMediaEl);
      return poolMediaEl;
    }

    /**
     * Forcibly deallocates a specific media element, regardless of its distance
     * from the current position in the document.
     * @param {!PoolBoundElementDef} poolMediaEl The element to be deallocated.
     * @return {!Promise} A promise that is resolved when the specified media
     *     element has been successfully deallocated.
     */ }, { key: "forceDeallocateMediaElement_", value:
    function forceDeallocateMediaElement_(poolMediaEl) {var _this4 = this;
      var mediaType = this.getMediaType_(poolMediaEl);
      var allocatedEls = this.allocated[mediaType];
      var removeFromDom = isConnectedNode(poolMediaEl) ?
      this.swapPoolMediaElementOutOfDom_(poolMediaEl) :
      _resolvedPromise();

      return removeFromDom.then(function () {
        var index = allocatedEls.indexOf(poolMediaEl);
        devAssert(index >= 0);
        allocatedEls.splice(index, 1);
        _this4.unallocated[mediaType].push(poolMediaEl);
      });
    }

    /**
     * Evicts an element of the specified type, replaces it in the DOM with the
     * original media element, and returns it.
     * @param {!MediaType} mediaType The type of media element to evict.
     * @param {!PlaceholderElementDef=} opt_elToAllocate If specified, the element
     *     that is trying to be allocated, such that another element must be
     *     evicted.
     * @return {?PoolBoundElementDef} A media element of the specified type.
     * @private
     */ }, { key: "evictMediaElement_", value:
    function evictMediaElement_(mediaType, opt_elToAllocate) {
      var poolMediaEl = this.deallocateMediaElement_(
      mediaType,
      opt_elToAllocate);

      if (!poolMediaEl) {
        return null;
      }

      this.swapPoolMediaElementOutOfDom_(poolMediaEl);
      return poolMediaEl;
    }

    /**
     * @param {!MediaType} mediaType The media type to check.
     * @param {!DomElementDef} domMediaEl The element to check.
     * @return {boolean} true, if the specified element has already been allocated
     *     as the specified type of media element.
     * @private
     */ }, { key: "isAllocatedMediaElement_", value:
    function isAllocatedMediaElement_(mediaType, domMediaEl) {
      // Since we don't know whether or not the specified domMediaEl is a
      // placeholder or originated from the pool, we coerce it to a pool-bound
      // element, to check against the allocated list of pool-bound elements.
      var poolMediaEl = /** @type {!PoolBoundElementDef} */(domMediaEl);
      return this.allocated[mediaType].indexOf(poolMediaEl) >= 0;
    }

    /**
     * Replaces a media element that was originally in the DOM with a media
     * element from the pool.
     * @param {!PlaceholderElementDef} placeholderEl The placeholder element
     *     originating from the DOM.
     * @param {!PoolBoundElementDef} poolMediaEl The media element originating
     *     from the pool.
     * @param {!Sources} sources The sources for the media element.
     * @return {!Promise} A promise that is resolved when the media element has
     *     been successfully swapped into the DOM.
     * @private
     */ }, { key: "swapPoolMediaElementIntoDom_", value:
    function swapPoolMediaElementIntoDom_(placeholderEl, poolMediaEl, sources) {var _this5 = this;
      var ampMediaForPoolEl = ampMediaElementFor(poolMediaEl);
      var ampMediaForDomEl = ampMediaElementFor(placeholderEl);
      poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] = placeholderEl.id;

      return this.enqueueMediaElementTask_(
      poolMediaEl,
      new SwapIntoDomTask(placeholderEl)).

      then(function () {return (
          Promise.all([
          _this5.maybeResetAmpMedia_(ampMediaForPoolEl),
          _this5.maybeResetAmpMedia_(ampMediaForDomEl)]));}).


      then(function () {return (
          _this5.enqueueMediaElementTask_(
          poolMediaEl,
          new UpdateSourcesTask(_this5.win_, sources)));}).


      then(function () {return _this5.enqueueMediaElementTask_(poolMediaEl, new LoadTask());}).
      catch(function () {
        _this5.forceDeallocateMediaElement_(poolMediaEl);
      });
    }

    /**
     * @param {?Element} componentEl
     * @return {!Promise}
     * @private
     */ }, { key: "maybeResetAmpMedia_", value:
    function maybeResetAmpMedia_(componentEl) {
      if (!componentEl) {
        return _resolvedPromise2();
      }

      if (componentEl.tagName.toLowerCase() == 'amp-audio') {
        // TODO(alanorozco): Implement reset for amp-audio
        return _resolvedPromise3();
      }

      return componentEl.getImpl().then(function (impl) {
        if (impl.resetOnDomChange) {
          impl.resetOnDomChange();
        }
      });
    }

    /**
     * @param {!PoolBoundElementDef} poolMediaEl The element whose source should
     *     be reset.
     * @return {!Promise} A promise that is resolved when the pool media element
     *     has been reset.
     */ }, { key: "resetPoolMediaElementSource_", value:
    function resetPoolMediaElementSource_(poolMediaEl) {var _this6 = this;
      var defaultSources = this.getDefaultSource_();

      return this.enqueueMediaElementTask_(
      poolMediaEl,
      new UpdateSourcesTask(this.win_, defaultSources)).
      then(function () {return _this6.enqueueMediaElementTask_(poolMediaEl, new LoadTask());});
    }

    /**
     * Removes a pool media element from the DOM and replaces it with the video
     * that it originally replaced.
     * @param {!PoolBoundElementDef} poolMediaEl The pool media element to remove
     *     from the DOM.
     * @return {!Promise} A promise that is resolved when the media element has
     *     been successfully swapped out of the DOM.
     * @private
     */ }, { key: "swapPoolMediaElementOutOfDom_", value:
    function swapPoolMediaElementOutOfDom_(poolMediaEl) {
      var placeholderElId = poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME];
      var placeholderEl = /** @type {!Element} */ /** @type {!PlaceholderElementDef} */(

      this.placeholderEls_[placeholderElId]);




      poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] = null;

      var swapOutOfDom = this.enqueueMediaElementTask_(
      poolMediaEl,
      new SwapOutOfDomTask(placeholderEl));


      this.resetPoolMediaElementSource_(poolMediaEl);
      return swapOutOfDom;
    }

    /**
     * @param {function(string)} callbackFn
     * @private
     */ }, { key: "forEachMediaType_", value:
    function forEachMediaType_(callbackFn) {
      Object.keys(MediaType).forEach(callbackFn.bind(this));
    }

    /**
     * Invokes a function for all media managed by the media pool.
     * @param {function(!PoolBoundElementDef)} callbackFn The function to be
     *     invoked.
     * @private
     */ }, { key: "forEachMediaElement_", value:
    function forEachMediaElement_(callbackFn) {var _this7 = this;
      [this.allocated, this.unallocated].forEach(function (mediaSet) {
        _this7.forEachMediaType_(function (key) {
          var type = MediaType[key];
          var els = /** @type {!Array} */(mediaSet[type]);
          if (!els) {
            return;
          }
          els.forEach(callbackFn.bind(_this7));
        });
      });
    }

    /**
     * Preloads the content of the specified media element in the DOM and returns
     * a media element that can be used in its stead for playback.
     * @param {!DomElementDef} domMediaEl The media element, found in the
     *     DOM, whose content should be loaded.
     * @return {Promise<!PoolBoundElementDef|undefined>} A media element from the pool that
     *     can be used to replace the specified element.
     */ }, { key: "loadInternal_", value:
    function loadInternal_(domMediaEl) {
      if (!isConnectedNode(domMediaEl)) {
        // Don't handle nodes that aren't even in the document.
        return _resolvedPromise4();
      }

      var mediaType = this.getMediaType_(domMediaEl);
      var existingPoolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl);

      if (existingPoolMediaEl) {
        // The element being loaded already has an allocated media element.
        return Promise.resolve(
        /** @type {!PoolBoundElementDef} */(existingPoolMediaEl));

      }

      // Since this is not an existing pool media element, we can be certain that
      // it is a placeholder element.
      var placeholderEl = /** @type {!PlaceholderElementDef} */(domMediaEl);

      var sources = this.sources_[placeholderEl.id];
      devAssert(sources instanceof Sources);

      var poolMediaEl =
      this.reserveUnallocatedMediaElement_(mediaType) ||
      this.evictMediaElement_(mediaType, placeholderEl);

      if (!poolMediaEl) {
        // If there is no space in the pool to allocate a new element, and no
        // element can be evicted, do not return any element.
        return _resolvedPromise5();
      }

      this.allocateMediaElement_(mediaType, poolMediaEl);

      return this.swapPoolMediaElementIntoDom_(
      placeholderEl,
      poolMediaEl,
      sources).
      then(function () {return poolMediaEl;});
    }

    /**
     * "Blesses" the specified media element for future playback without a user
     * gesture.  In order for this to bless the media element, this function must
     * be invoked in response to a user gesture.
     * @param {!PoolBoundElementDef} poolMediaEl The media element to bless.
     * @return {!Promise} A promise that is resolved when blessing the media
     *     element is complete.
     */ }, { key: "bless_", value:
    function bless_(poolMediaEl) {
      if (poolMediaEl[ELEMENT_BLESSED_PROPERTY_NAME]) {
        return _resolvedPromise6();
      }

      return this.enqueueMediaElementTask_(poolMediaEl, new BlessTask());
    }

    /**
     * Registers the specified element to be usable by the media pool.  Elements
     * should be registered as early as possible, in order to prevent them from
     * being played while not managed by the media pool.  If the media element is
     * already registered, this is a no-op.  Registering elements from within the
     * pool is not allowed, and will also be a no-op.
     * @param {!DomElementDef} domMediaEl The media element to be
     *     registered.
     * @return {!Promise} A promise that is resolved when the element has been
     *     successfully registered, or rejected otherwise.
     */ }, { key: "register", value:
    function register(domMediaEl) {
      var parent = domMediaEl.parentNode;
      if (parent && parent.signals) {
        this.trackAmpElementToBless_( /** @type {!AmpElement} */(parent));
      }

      if (this.isPoolMediaElement_(domMediaEl)) {
        // This media element originated from the media pool.
        return _resolvedPromise7();
      }

      // Since this is not an existing pool media element, we can be certain that
      // it is a placeholder element.
      var placeholderEl = /** @type {!PlaceholderElementDef} */(domMediaEl);
      placeholderEl[MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME] =
      MediaElementOrigin.PLACEHOLDER;

      var id = placeholderEl.id || this.createPlaceholderElementId_();
      if (this.sources_[id] && this.placeholderEls_[id]) {
        // This media element is already registered.
        return _resolvedPromise8();
      }

      // This media element has not yet been registered.
      placeholderEl.id = id;
      var sources = Sources.removeFrom(this.win_, placeholderEl);
      this.sources_[id] = sources;
      this.placeholderEls_[id] = placeholderEl;

      if (placeholderEl instanceof HTMLMediaElement) {
        placeholderEl.muted = true;
        placeholderEl.setAttribute('muted', '');
        placeholderEl.pause();
      }

      return _resolvedPromise9();
    }

    /**
     * @param {!AmpElement} element
     * @private
     */ }, { key: "trackAmpElementToBless_", value:
    function trackAmpElementToBless_(element) {
      this.ampElementsToBless_ = this.ampElementsToBless_ || [];
      this.ampElementsToBless_.push(element);
    }

    /**
     * Preloads the content of the specified media element in the DOM.
     * @param {!DomElementDef} domMediaEl The media element, found in the
     *     DOM, whose content should be loaded.
     * @return {!Promise} A promise that is resolved when the specified media
     *     element has successfully started preloading.
     */ }, { key: "preload", value:
    function preload(domMediaEl) {
      // Empty then() invocation hides the value yielded by the loadInternal_
      // promise, so that we do not leak the pool media element outside of the
      // scope of the media pool.
      return this.loadInternal_(domMediaEl).then();
    }

    /**
     * Plays the specified media element in the DOM by replacing it with a media
     * element from the pool and playing that.
     * @param {!DomElementDef} domMediaEl The media element to be played.
     * @return {!Promise} A promise that is resolved when the specified media
     *     element has been successfully played.
     */ }, { key: "play", value:
    function play(domMediaEl) {var _this8 = this;
      return this.loadInternal_(domMediaEl).then(function (poolMediaEl) {
        if (!poolMediaEl) {
          return _resolvedPromise10();
        }

        return _this8.enqueueMediaElementTask_(poolMediaEl, new PlayTask());
      });
    }

    /**
     * Pauses the specified media element in the DOM.
     * @param {!DomElementDef} domMediaEl The media element to be paused.
     * @param {boolean=} rewindToBeginning Whether to rewind the currentTime
     *     of media items to the beginning.
     * @return {!Promise} A promise that is resolved when the specified media
     *     element has been successfully paused.
     */ }, { key: "pause", value:
    function pause(domMediaEl) {var _this9 = this;var rewindToBeginning = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var mediaType = this.getMediaType_(domMediaEl);
      var poolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl);


      if (!poolMediaEl) {
        return _resolvedPromise11();
      }

      return this.enqueueMediaElementTask_(poolMediaEl, new PauseTask()).then(
      function () {
        if (rewindToBeginning) {
          _this9.enqueueMediaElementTask_(
          /** @type {!PoolBoundElementDef} */(poolMediaEl),
          new SetCurrentTimeTask({ currentTime: 0 }));

        }
      });

    }

    /**
     * Rewinds a specified media element in the DOM to 0.
     * @param {!DomElementDef} domMediaEl The media element to be rewound.
     * @return {!Promise} A promise that is resolved when the
     *     specified media element has been successfully rewound.
     */ }, { key: "rewindToBeginning", value:
    function rewindToBeginning(domMediaEl) {
      return this.setCurrentTime(domMediaEl, 0 /** currentTime */);
    }

    /**
     * Sets currentTime for a specified media element in the DOM.
     * @param {!DomElementDef} domMediaEl The media element.
     * @param {number} currentTime The time to seek to, in seconds.
     * @return {!Promise} A promise that is resolved when the
     *     specified media element has been successfully set to the given time.
     */ }, { key: "setCurrentTime", value:
    function setCurrentTime(domMediaEl, currentTime) {
      var mediaType = this.getMediaType_(domMediaEl);
      var poolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl);


      if (!poolMediaEl) {
        return _resolvedPromise12();
      }

      return this.enqueueMediaElementTask_(
      poolMediaEl,
      new SetCurrentTimeTask({ currentTime: currentTime }));

    }

    /**
     * Mutes the specified media element in the DOM.
     * @param {!DomElementDef} domMediaEl The media element to be muted.
     * @return {!Promise} A promise that is resolved when the specified media
     *     element has been successfully muted.
     */ }, { key: "mute", value:
    function mute(domMediaEl) {
      var mediaType = this.getMediaType_(domMediaEl);
      var poolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl);


      if (!poolMediaEl) {
        return _resolvedPromise13();
      }

      return this.enqueueMediaElementTask_(poolMediaEl, new MuteTask());
    }

    /**
     * Unmutes the specified media element in the DOM.
     * @param {!DomElementDef} domMediaEl The media element to be unmuted.
     * @return {!Promise} A promise that is resolved when the specified media
     *     element has been successfully paused.
     */ }, { key: "unmute", value:
    function unmute(domMediaEl) {
      var mediaType = this.getMediaType_(domMediaEl);
      var poolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl);


      if (!poolMediaEl) {
        return _resolvedPromise14();
      }

      return this.enqueueMediaElementTask_(poolMediaEl, new UnmuteTask());
    }

    /**
     * "Blesses" all media elements in the media pool for future playback without
     * a user gesture.  In order for this to bless the media elements, this
     * function must be invoked in response to a user gesture.
     * @return {!Promise} A promise that is resolved when all media elements in
     *     the pool are blessed.
     */ }, { key: "blessAll", value:
    function blessAll() {var _this10 = this;
      if (this.blessed_) {
        return _resolvedPromise15();
      }

      var blessPromises = [];

      (this.ampElementsToBless_ || []).forEach(userInteractedWith);

      this.ampElementsToBless_ = null; // GC

      this.forEachMediaElement_(function (mediaEl) {
        blessPromises.push(_this10.bless_(mediaEl));
      });

      return Promise.all(blessPromises).then(
      function () {
        _this10.blessed_ = true;
      },
      function (reason) {
        dev().expectedError('AMP-STORY', 'Blessing all media failed: ', reason);
      });

    }

    /**
     * @param {!PoolBoundElementDef} mediaEl The element whose task queue should
     *     be executed.
     * @private
     */ }, { key: "executeNextMediaElementTask_", value:
    function executeNextMediaElementTask_(mediaEl) {var _this11 = this;
      var queue = mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME];
      if (queue.length === 0) {
        return;
      }

      var task = queue[0];

      var executionFn = function executionFn() {
        task.
        execute(mediaEl).
        catch(function (reason) {return dev().error('AMP-STORY', reason);}).
        then(function () {
          // Run regardless of success or failure of task execution.
          queue.shift();
          _this11.executeNextMediaElementTask_(mediaEl);
        });
      };

      if (task.requiresSynchronousExecution()) {
        executionFn.call(this);
      } else {
        this.timer_.delay(executionFn.bind(this), 0);
      }
    }

    /**
     * @param {!PoolBoundElementDef} mediaEl The element for which the specified
     *     task should be executed.
     * @param {!./media-tasks.MediaTask} task The task to be executed.
     * @return {!Promise} A promise that is resolved when the specified task is
     *     completed.
     * @private
     */ }, { key: "enqueueMediaElementTask_", value:
    function enqueueMediaElementTask_(mediaEl, task) {
      if (!mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME]) {
        mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME] = [];
      }

      var queue = mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME];
      var isQueueRunning = queue.length !== 0;

      queue.push(task);

      if (!isQueueRunning) {
        this.executeNextMediaElementTask_(mediaEl);
      }

      return task.whenComplete();
    }

    /**
     * @param {!MediaPoolRoot} root
     * @return {!MediaPool}
     */ }], [{ key: "for", value:
    function _for(root) {
      var element = root.getElement();
      var existingId = element[POOL_MEDIA_ELEMENT_PROPERTY_NAME];
      var hasInstanceAllocated = existingId && instances[existingId];

      if (hasInstanceAllocated) {
        return instances[existingId];
      }

      var newId = String(nextInstanceId++);
      element[POOL_MEDIA_ELEMENT_PROPERTY_NAME] = newId;
      instances[newId] = new MediaPool(
      toWin(root.getElement().ownerDocument.defaultView),
      root.getMaxMediaElementCounts(),
      function (element) {return root.getElementDistance(element);});


      return instances[newId];
    } }]);return MediaPool;}();


/**
 * Defines a common interface for elements that contain a MediaPool.
 *
 * @interface
 */
export var MediaPoolRoot = /*#__PURE__*/function () {function MediaPoolRoot() {_classCallCheck(this, MediaPoolRoot);}_createClass(MediaPoolRoot, [{ key: "getElement", value:
    /**
     * @return {!Element} The root element of this media pool.
     */
    function getElement() {}

    /**
     * @param {!Element} unusedElement The element whose distance should be
     *    retrieved.
     * @return {number} A numerical distance representing how far the specified
     *     element is from the user's current position in the document.  The
     *     absolute magnitude of this number is irrelevant; the relative magnitude
     *     is used to determine which media elements should be evicted (elements
     *     furthest from the user's current position in the document are evicted
     *     from the MediaPool first).
     */ }, { key: "getElementDistance", value:
    function getElementDistance(unusedElement) {}

    /**
     * @return {!Object<!MediaType, number>} The maximum amount of each media
     *     type to allow within this element.
     */ }, { key: "getMaxMediaElementCounts", value:
    function getMaxMediaElementCounts() {} }]);return MediaPoolRoot;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/media-pool.js