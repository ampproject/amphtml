import { resolvedPromise as _resolvedPromise15 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise14 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise13 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise12 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise11 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise10 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise9 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise8 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { BlessTask, ELEMENT_BLESSED_PROPERTY_NAME, LoadTask, MuteTask, PauseTask, PlayTask, SetCurrentTimeTask, SwapIntoDomTask, SwapOutOfDomTask, UnmuteTask, UpdateSourcesTask } from "./media-tasks";
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
  VIDEO: 'video'
};

/** @const @enum {string} */
var MediaElementOrigin = {
  PLACEHOLDER: 'placeholder',
  POOL: 'pool'
};

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
var ElementTask_1_0_Def;
// eslint-disable-line google-camelcase/google-camelcase

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
  function MediaPool(win, maxCounts, distanceFn) {
    var _this = this,
        _this$mediaFactory_;

    _classCallCheck(this, MediaPool);

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
    this.mediaFactory_ = (_this$mediaFactory_ = {}, _this$mediaFactory_[MediaType.AUDIO] = function () {
      var audioEl = _this.win_.document.createElement('audio');

      audioEl.setAttribute('muted', '');
      audioEl.muted = true;
      audioEl.classList.add('i-amphtml-pool-media');
      audioEl.classList.add('i-amphtml-pool-audio');
      return audioEl;
    }, _this$mediaFactory_[MediaType.VIDEO] = function () {
      var videoEl = _this.win_.document.createElement('video');

      videoEl.setAttribute('muted', '');
      videoEl.muted = true;
      videoEl.setAttribute('playsinline', '');
      videoEl.classList.add('i-amphtml-pool-media');
      videoEl.classList.add('i-amphtml-pool-video');
      return videoEl;
    }, _this$mediaFactory_);
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
   */
  _createClass(MediaPool, [{
    key: "initializeMediaPool_",
    value: function initializeMediaPool_(maxCounts) {
      var _this2 = this;

      var poolIdCounter = 0;
      this.forEachMediaType_(function (key) {
        var type = MediaType[key];
        var count = maxCounts[type] || 0;

        if (count <= 0) {
          return;
        }

        var ctor = devAssert(_this2.mediaFactory_[type], "Factory for media type `" + type + "` unset.");
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
          var mediaEl =
          /** @type {!PoolBoundElementDef} */
          i == 1 ? mediaElSeed : mediaElSeed.cloneNode(
          /* deep */
          true);
          mediaEl.addEventListener('error', _this2.onMediaError_, {
            capture: true
          });
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
     */

  }, {
    key: "onMediaError_",
    value: function onMediaError_(event) {
      var target = dev().assertElement(event.target);

      if (!matches(target, 'source:last-of-type, video[src]')) {
        return;
      }

      var media = target.tagName === 'SOURCE' ? target.parentElement : target;
      media[MEDIA_LOAD_FAILURE_SRC_PROPERTY] = media.currentSrc || true;
    }
    /**
     * @return {!Sources} The default source, empty.
     * @private
     */

  }, {
    key: "getDefaultSource_",
    value: function getDefaultSource_() {
      return new Sources();
    }
    /**
     * Comparison function that compares the distance of each element from the
     * current position in the document.
     * @param {!PoolBoundElementDef} mediaA The first element to compare.
     * @param {!PoolBoundElementDef} mediaB The second element to compare.
     * @return {number}
     * @private
     */

  }, {
    key: "compareMediaDistances_",
    value: function compareMediaDistances_(mediaA, mediaB) {
      var distanceA = this.distanceFn_(mediaA);
      var distanceB = this.distanceFn_(mediaB);
      return distanceA < distanceB ? -1 : 1;
    }
    /**
     * @return {string} A unique ID.
     * @private
     */

  }, {
    key: "createPlaceholderElementId_",
    value: function createPlaceholderElementId_() {
      return PLACEHOLDER_ELEMENT_ID_PREFIX + this.placeholderIdCounter_++;
    }
    /**
     * @param {!DomElementDef} mediaElement
     * @return {boolean}
     * @private
     */

  }, {
    key: "isPoolMediaElement_",
    value: function isPoolMediaElement_(mediaElement) {
      return mediaElement[MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME] === MediaElementOrigin.POOL;
    }
    /**
     * Gets the media type from a given element.
     * @param {!PoolBoundElementDef|!PlaceholderElementDef} mediaElement The
     *     element whose media type should be retrieved.
     * @return {!MediaType}
     * @private
     */

  }, {
    key: "getMediaType_",
    value: function getMediaType_(mediaElement) {
      var tagName = mediaElement.tagName.toLowerCase();

      switch (tagName) {
        case 'audio':
          return MediaType.AUDIO;

        case 'video':
          return MediaType.VIDEO;

        default:
          return MediaType.UNSUPPORTED;
      }
    }
    /**
     * Reserves an element of the specified type by removing it from the set of
     * unallocated elements and returning it.
     * @param {!MediaType} mediaType The type of media element to reserve.
     * @return {?PoolBoundElementDef} The reserved element, if one exists.
     * @private
     */

  }, {
    key: "reserveUnallocatedMediaElement_",
    value: function reserveUnallocatedMediaElement_(mediaType) {
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
     */

  }, {
    key: "getMatchingMediaElementFromPool_",
    value: function getMatchingMediaElementFromPool_(mediaType, domMediaEl) {
      if (this.isAllocatedMediaElement_(mediaType, domMediaEl)) {
        // The media element in the DOM was already from the pool.
        return (
          /** @type {!PoolBoundElementDef} */
          domMediaEl
        );
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
     */

  }, {
    key: "allocateMediaElement_",
    value: function allocateMediaElement_(mediaType, poolMediaEl) {
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
     */

  }, {
    key: "deallocateMediaElement_",
    value: function deallocateMediaElement_(mediaType, opt_elToAllocate) {
      var _this3 = this;

      var allocatedEls = this.allocated[mediaType];
      // Sort the allocated media elements by distance to ensure that we are
      // evicting the media element that is furthest from the current place in the
      // document.
      allocatedEls.sort(function (a, b) {
        return _this3.compareMediaDistances_(a, b);
      });

      // Do not deallocate any media elements if the element being loaded or
      // played is further than the farthest allocated element.
      if (opt_elToAllocate) {
        var furthestEl = allocatedEls[allocatedEls.length - 1];

        if (!furthestEl || this.distanceFn_(furthestEl) < this.distanceFn_(opt_elToAllocate)) {
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
     */

  }, {
    key: "forceDeallocateMediaElement_",
    value: function forceDeallocateMediaElement_(poolMediaEl) {
      var _this4 = this;

      var mediaType = this.getMediaType_(poolMediaEl);
      var allocatedEls = this.allocated[mediaType];
      var removeFromDom = isConnectedNode(poolMediaEl) ? this.swapPoolMediaElementOutOfDom_(poolMediaEl) : _resolvedPromise();
      return removeFromDom.then(function () {
        var index = allocatedEls.indexOf(poolMediaEl);
        devAssert(index >= 0, 'Cannot deallocate unallocated media element.');
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
     */

  }, {
    key: "evictMediaElement_",
    value: function evictMediaElement_(mediaType, opt_elToAllocate) {
      var poolMediaEl = this.deallocateMediaElement_(mediaType, opt_elToAllocate);

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
     */

  }, {
    key: "isAllocatedMediaElement_",
    value: function isAllocatedMediaElement_(mediaType, domMediaEl) {
      // Since we don't know whether or not the specified domMediaEl is a
      // placeholder or originated from the pool, we coerce it to a pool-bound
      // element, to check against the allocated list of pool-bound elements.
      var poolMediaEl =
      /** @type {!PoolBoundElementDef} */
      domMediaEl;
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
     */

  }, {
    key: "swapPoolMediaElementIntoDom_",
    value: function swapPoolMediaElementIntoDom_(placeholderEl, poolMediaEl, sources) {
      var _this5 = this;

      var ampMediaForPoolEl = ampMediaElementFor(poolMediaEl);
      var ampMediaForDomEl = ampMediaElementFor(placeholderEl);
      poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] = placeholderEl.id;
      return this.enqueueMediaElementTask_(poolMediaEl, new SwapIntoDomTask(placeholderEl)).then(function () {
        return Promise.all([_this5.maybeResetAmpMedia_(ampMediaForPoolEl), _this5.maybeResetAmpMedia_(ampMediaForDomEl)]);
      }).then(function () {
        return _this5.enqueueMediaElementTask_(poolMediaEl, new UpdateSourcesTask(_this5.win_, sources));
      }).then(function () {
        return _this5.enqueueMediaElementTask_(poolMediaEl, new LoadTask());
      }).catch(function () {
        _this5.forceDeallocateMediaElement_(poolMediaEl);
      });
    }
    /**
     * @param {?Element} componentEl
     * @return {!Promise}
     * @private
     */

  }, {
    key: "maybeResetAmpMedia_",
    value: function maybeResetAmpMedia_(componentEl) {
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
     */

  }, {
    key: "resetPoolMediaElementSource_",
    value: function resetPoolMediaElementSource_(poolMediaEl) {
      var _this6 = this;

      var defaultSources = this.getDefaultSource_();
      return this.enqueueMediaElementTask_(poolMediaEl, new UpdateSourcesTask(this.win_, defaultSources)).then(function () {
        return _this6.enqueueMediaElementTask_(poolMediaEl, new LoadTask());
      });
    }
    /**
     * Removes a pool media element from the DOM and replaces it with the video
     * that it originally replaced.
     * @param {!PoolBoundElementDef} poolMediaEl The pool media element to remove
     *     from the DOM.
     * @return {!Promise} A promise that is resolved when the media element has
     *     been successfully swapped out of the DOM.
     * @private
     */

  }, {
    key: "swapPoolMediaElementOutOfDom_",
    value: function swapPoolMediaElementOutOfDom_(poolMediaEl) {
      var placeholderElId = poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME];
      var placeholderEl =
      /** @type {!PlaceholderElementDef} */
      dev().assertElement(this.placeholderEls_[placeholderElId], "No media element " + placeholderElId + " to put back into DOM after" + 'eviction.');
      poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] = null;
      var swapOutOfDom = this.enqueueMediaElementTask_(poolMediaEl, new SwapOutOfDomTask(placeholderEl));
      this.resetPoolMediaElementSource_(poolMediaEl);
      return swapOutOfDom;
    }
    /**
     * @param {function(string)} callbackFn
     * @private
     */

  }, {
    key: "forEachMediaType_",
    value: function forEachMediaType_(callbackFn) {
      Object.keys(MediaType).forEach(callbackFn.bind(this));
    }
    /**
     * Invokes a function for all media managed by the media pool.
     * @param {function(!PoolBoundElementDef)} callbackFn The function to be
     *     invoked.
     * @private
     */

  }, {
    key: "forEachMediaElement_",
    value: function forEachMediaElement_(callbackFn) {
      var _this7 = this;

      [this.allocated, this.unallocated].forEach(function (mediaSet) {
        _this7.forEachMediaType_(function (key) {
          var type = MediaType[key];
          var els =
          /** @type {!Array} */
          mediaSet[type];

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
     */

  }, {
    key: "loadInternal_",
    value: function loadInternal_(domMediaEl) {
      if (!isConnectedNode(domMediaEl)) {
        // Don't handle nodes that aren't even in the document.
        return _resolvedPromise4();
      }

      var mediaType = this.getMediaType_(domMediaEl);
      var existingPoolMediaEl = this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

      if (existingPoolMediaEl) {
        // The element being loaded already has an allocated media element.
        return Promise.resolve(
        /** @type {!PoolBoundElementDef} */
        existingPoolMediaEl);
      }

      // Since this is not an existing pool media element, we can be certain that
      // it is a placeholder element.
      var placeholderEl =
      /** @type {!PlaceholderElementDef} */
      domMediaEl;
      var sources = this.sources_[placeholderEl.id];
      devAssert(sources instanceof Sources, 'Cannot play unregistered element.');
      var poolMediaEl = this.reserveUnallocatedMediaElement_(mediaType) || this.evictMediaElement_(mediaType, placeholderEl);

      if (!poolMediaEl) {
        // If there is no space in the pool to allocate a new element, and no
        // element can be evicted, do not return any element.
        return _resolvedPromise5();
      }

      this.allocateMediaElement_(mediaType, poolMediaEl);
      return this.swapPoolMediaElementIntoDom_(placeholderEl, poolMediaEl, sources).then(function () {
        return poolMediaEl;
      });
    }
    /**
     * "Blesses" the specified media element for future playback without a user
     * gesture.  In order for this to bless the media element, this function must
     * be invoked in response to a user gesture.
     * @param {!PoolBoundElementDef} poolMediaEl The media element to bless.
     * @return {!Promise} A promise that is resolved when blessing the media
     *     element is complete.
     */

  }, {
    key: "bless_",
    value: function bless_(poolMediaEl) {
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
     */

  }, {
    key: "register",
    value: function register(domMediaEl) {
      var parent = domMediaEl.parentNode;

      if (parent && parent.signals) {
        this.trackAmpElementToBless_(
        /** @type {!AmpElement} */
        parent);
      }

      if (this.isPoolMediaElement_(domMediaEl)) {
        // This media element originated from the media pool.
        return _resolvedPromise7();
      }

      // Since this is not an existing pool media element, we can be certain that
      // it is a placeholder element.
      var placeholderEl =
      /** @type {!PlaceholderElementDef} */
      domMediaEl;
      placeholderEl[MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME] = MediaElementOrigin.PLACEHOLDER;
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
     */

  }, {
    key: "trackAmpElementToBless_",
    value: function trackAmpElementToBless_(element) {
      this.ampElementsToBless_ = this.ampElementsToBless_ || [];
      this.ampElementsToBless_.push(element);
    }
    /**
     * Preloads the content of the specified media element in the DOM.
     * @param {!DomElementDef} domMediaEl The media element, found in the
     *     DOM, whose content should be loaded.
     * @return {!Promise} A promise that is resolved when the specified media
     *     element has successfully started preloading.
     */

  }, {
    key: "preload",
    value: function preload(domMediaEl) {
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
     */

  }, {
    key: "play",
    value: function play(domMediaEl) {
      var _this8 = this;

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
     */

  }, {
    key: "pause",
    value: function pause(domMediaEl, rewindToBeginning) {
      var _this9 = this;

      if (rewindToBeginning === void 0) {
        rewindToBeginning = false;
      }

      var mediaType = this.getMediaType_(domMediaEl);
      var poolMediaEl = this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

      if (!poolMediaEl) {
        return _resolvedPromise11();
      }

      return this.enqueueMediaElementTask_(poolMediaEl, new PauseTask()).then(function () {
        if (rewindToBeginning) {
          _this9.enqueueMediaElementTask_(
          /** @type {!PoolBoundElementDef} */
          poolMediaEl, new SetCurrentTimeTask({
            currentTime: 0
          }));
        }
      });
    }
    /**
     * Rewinds a specified media element in the DOM to 0.
     * @param {!DomElementDef} domMediaEl The media element to be rewound.
     * @return {!Promise} A promise that is resolved when the
     *     specified media element has been successfully rewound.
     */

  }, {
    key: "rewindToBeginning",
    value: function rewindToBeginning(domMediaEl) {
      return this.setCurrentTime(domMediaEl, 0
      /** currentTime */
      );
    }
    /**
     * Sets currentTime for a specified media element in the DOM.
     * @param {!DomElementDef} domMediaEl The media element.
     * @param {number} currentTime The time to seek to, in seconds.
     * @return {!Promise} A promise that is resolved when the
     *     specified media element has been successfully set to the given time.
     */

  }, {
    key: "setCurrentTime",
    value: function setCurrentTime(domMediaEl, currentTime) {
      var mediaType = this.getMediaType_(domMediaEl);
      var poolMediaEl = this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

      if (!poolMediaEl) {
        return _resolvedPromise12();
      }

      return this.enqueueMediaElementTask_(poolMediaEl, new SetCurrentTimeTask({
        currentTime: currentTime
      }));
    }
    /**
     * Mutes the specified media element in the DOM.
     * @param {!DomElementDef} domMediaEl The media element to be muted.
     * @return {!Promise} A promise that is resolved when the specified media
     *     element has been successfully muted.
     */

  }, {
    key: "mute",
    value: function mute(domMediaEl) {
      var mediaType = this.getMediaType_(domMediaEl);
      var poolMediaEl = this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

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
     */

  }, {
    key: "unmute",
    value: function unmute(domMediaEl) {
      var mediaType = this.getMediaType_(domMediaEl);
      var poolMediaEl = this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

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
     */

  }, {
    key: "blessAll",
    value: function blessAll() {
      var _this10 = this;

      if (this.blessed_) {
        return _resolvedPromise15();
      }

      var blessPromises = [];
      (this.ampElementsToBless_ || []).forEach(userInteractedWith);
      this.ampElementsToBless_ = null;
      // GC
      this.forEachMediaElement_(function (mediaEl) {
        blessPromises.push(_this10.bless_(mediaEl));
      });
      return Promise.all(blessPromises).then(function () {
        _this10.blessed_ = true;
      }, function (reason) {
        dev().expectedError('AMP-STORY', 'Blessing all media failed: ', reason);
      });
    }
    /**
     * @param {!PoolBoundElementDef} mediaEl The element whose task queue should
     *     be executed.
     * @private
     */

  }, {
    key: "executeNextMediaElementTask_",
    value: function executeNextMediaElementTask_(mediaEl) {
      var _this11 = this;

      var queue = mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME];

      if (queue.length === 0) {
        return;
      }

      var task = queue[0];

      var executionFn = function executionFn() {
        task.execute(mediaEl).catch(function (reason) {
          return dev().error('AMP-STORY', reason);
        }).then(function () {
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
     */

  }, {
    key: "enqueueMediaElementTask_",
    value: function enqueueMediaElementTask_(mediaEl, task) {
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
     */

  }], [{
    key: "for",
    value: function _for(root) {
      var element = root.getElement();
      var existingId = element[POOL_MEDIA_ELEMENT_PROPERTY_NAME];
      var hasInstanceAllocated = existingId && instances[existingId];

      if (hasInstanceAllocated) {
        return instances[existingId];
      }

      var newId = String(nextInstanceId++);
      element[POOL_MEDIA_ELEMENT_PROPERTY_NAME] = newId;
      instances[newId] = new MediaPool(toWin(root.getElement().ownerDocument.defaultView), root.getMaxMediaElementCounts(), function (element) {
        return root.getElementDistance(element);
      });
      return instances[newId];
    }
  }]);

  return MediaPool;
}();

/**
 * Defines a common interface for elements that contain a MediaPool.
 *
 * @interface
 */
export var MediaPoolRoot = /*#__PURE__*/function () {
  function MediaPoolRoot() {
    _classCallCheck(this, MediaPoolRoot);
  }

  _createClass(MediaPoolRoot, [{
    key: "getElement",
    value:
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
     */

  }, {
    key: "getElementDistance",
    value: function getElementDistance(unusedElement) {}
    /**
     * @return {!Object<!MediaType, number>} The maximum amount of each media
     *     type to allow within this element.
     */

  }, {
    key: "getMaxMediaElementCounts",
    value: function getMaxMediaElementCounts() {}
  }]);

  return MediaPoolRoot;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lZGlhLXBvb2wuanMiXSwibmFtZXMiOlsiQmxlc3NUYXNrIiwiRUxFTUVOVF9CTEVTU0VEX1BST1BFUlRZX05BTUUiLCJMb2FkVGFzayIsIk11dGVUYXNrIiwiUGF1c2VUYXNrIiwiUGxheVRhc2siLCJTZXRDdXJyZW50VGltZVRhc2siLCJTd2FwSW50b0RvbVRhc2siLCJTd2FwT3V0T2ZEb21UYXNrIiwiVW5tdXRlVGFzayIsIlVwZGF0ZVNvdXJjZXNUYXNrIiwiTUVESUFfTE9BRF9GQUlMVVJFX1NSQ19QUk9QRVJUWSIsIlNlcnZpY2VzIiwiU291cmNlcyIsImFtcE1lZGlhRWxlbWVudEZvciIsImRldiIsImRldkFzc2VydCIsImZpbmRJbmRleCIsImlzQ29ubmVjdGVkTm9kZSIsIm1hdGNoZXMiLCJ0b1dpbiIsInVzZXJJbnRlcmFjdGVkV2l0aCIsIk1lZGlhVHlwZSIsIlVOU1VQUE9SVEVEIiwiQVVESU8iLCJWSURFTyIsIk1lZGlhRWxlbWVudE9yaWdpbiIsIlBMQUNFSE9MREVSIiwiUE9PTCIsIlBsYWNlaG9sZGVyRWxlbWVudERlZiIsIlBvb2xCb3VuZEVsZW1lbnREZWYiLCJEb21FbGVtZW50RGVmIiwiRWxlbWVudERpc3RhbmNlRm5EZWYiLCJFbGVtZW50VGFza18xXzBfRGVmIiwiUExBQ0VIT0xERVJfRUxFTUVOVF9JRF9QUkVGSVgiLCJQT09MX0VMRU1FTlRfSURfUFJFRklYIiwiUE9PTF9NRURJQV9FTEVNRU5UX1BST1BFUlRZX05BTUUiLCJFTEVNRU5UX1RBU0tfUVVFVUVfUFJPUEVSVFlfTkFNRSIsIk1FRElBX0VMRU1FTlRfT1JJR0lOX1BST1BFUlRZX05BTUUiLCJSRVBMQUNFRF9NRURJQV9QUk9QRVJUWV9OQU1FIiwiaW5zdGFuY2VzIiwibmV4dEluc3RhbmNlSWQiLCJNZWRpYVBvb2wiLCJ3aW4iLCJtYXhDb3VudHMiLCJkaXN0YW5jZUZuIiwid2luXyIsInRpbWVyXyIsInRpbWVyRm9yIiwiZGlzdGFuY2VGbl8iLCJhbGxvY2F0ZWQiLCJ1bmFsbG9jYXRlZCIsInNvdXJjZXNfIiwicGxhY2Vob2xkZXJFbHNfIiwicGxhY2Vob2xkZXJJZENvdW50ZXJfIiwiYmxlc3NlZF8iLCJhbXBFbGVtZW50c1RvQmxlc3NfIiwibWVkaWFGYWN0b3J5XyIsImF1ZGlvRWwiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzZXRBdHRyaWJ1dGUiLCJtdXRlZCIsImNsYXNzTGlzdCIsImFkZCIsInZpZGVvRWwiLCJpbml0aWFsaXplTWVkaWFQb29sXyIsInBvb2xJZENvdW50ZXIiLCJmb3JFYWNoTWVkaWFUeXBlXyIsImtleSIsInR5cGUiLCJjb3VudCIsImN0b3IiLCJtZWRpYUVsU2VlZCIsImNhbGwiLCJpIiwibWVkaWFFbCIsImNsb25lTm9kZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbk1lZGlhRXJyb3JfIiwiY2FwdHVyZSIsImlkIiwicHVzaCIsImV2ZW50IiwidGFyZ2V0IiwiYXNzZXJ0RWxlbWVudCIsIm1lZGlhIiwidGFnTmFtZSIsInBhcmVudEVsZW1lbnQiLCJjdXJyZW50U3JjIiwibWVkaWFBIiwibWVkaWFCIiwiZGlzdGFuY2VBIiwiZGlzdGFuY2VCIiwibWVkaWFFbGVtZW50IiwidG9Mb3dlckNhc2UiLCJtZWRpYVR5cGUiLCJwb3AiLCJkb21NZWRpYUVsIiwiaXNBbGxvY2F0ZWRNZWRpYUVsZW1lbnRfIiwiYWxsb2NhdGVkRWxzIiwiaW5kZXgiLCJwb29sTWVkaWFFbCIsInVuYWxsb2NhdGVkRWxzIiwiaW5kZXhUb1JlbW92ZSIsImluZGV4T2YiLCJzcGxpY2UiLCJvcHRfZWxUb0FsbG9jYXRlIiwic29ydCIsImEiLCJiIiwiY29tcGFyZU1lZGlhRGlzdGFuY2VzXyIsImZ1cnRoZXN0RWwiLCJsZW5ndGgiLCJnZXRNZWRpYVR5cGVfIiwicmVtb3ZlRnJvbURvbSIsInN3YXBQb29sTWVkaWFFbGVtZW50T3V0T2ZEb21fIiwidGhlbiIsImRlYWxsb2NhdGVNZWRpYUVsZW1lbnRfIiwicGxhY2Vob2xkZXJFbCIsInNvdXJjZXMiLCJhbXBNZWRpYUZvclBvb2xFbCIsImFtcE1lZGlhRm9yRG9tRWwiLCJlbnF1ZXVlTWVkaWFFbGVtZW50VGFza18iLCJQcm9taXNlIiwiYWxsIiwibWF5YmVSZXNldEFtcE1lZGlhXyIsImNhdGNoIiwiZm9yY2VEZWFsbG9jYXRlTWVkaWFFbGVtZW50XyIsImNvbXBvbmVudEVsIiwiZ2V0SW1wbCIsImltcGwiLCJyZXNldE9uRG9tQ2hhbmdlIiwiZGVmYXVsdFNvdXJjZXMiLCJnZXREZWZhdWx0U291cmNlXyIsInBsYWNlaG9sZGVyRWxJZCIsInN3YXBPdXRPZkRvbSIsInJlc2V0UG9vbE1lZGlhRWxlbWVudFNvdXJjZV8iLCJjYWxsYmFja0ZuIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJiaW5kIiwibWVkaWFTZXQiLCJlbHMiLCJleGlzdGluZ1Bvb2xNZWRpYUVsIiwiZ2V0TWF0Y2hpbmdNZWRpYUVsZW1lbnRGcm9tUG9vbF8iLCJyZXNvbHZlIiwicmVzZXJ2ZVVuYWxsb2NhdGVkTWVkaWFFbGVtZW50XyIsImV2aWN0TWVkaWFFbGVtZW50XyIsImFsbG9jYXRlTWVkaWFFbGVtZW50XyIsInN3YXBQb29sTWVkaWFFbGVtZW50SW50b0RvbV8iLCJwYXJlbnQiLCJwYXJlbnROb2RlIiwic2lnbmFscyIsInRyYWNrQW1wRWxlbWVudFRvQmxlc3NfIiwiaXNQb29sTWVkaWFFbGVtZW50XyIsImNyZWF0ZVBsYWNlaG9sZGVyRWxlbWVudElkXyIsInJlbW92ZUZyb20iLCJIVE1MTWVkaWFFbGVtZW50IiwicGF1c2UiLCJlbGVtZW50IiwibG9hZEludGVybmFsXyIsInJld2luZFRvQmVnaW5uaW5nIiwiY3VycmVudFRpbWUiLCJzZXRDdXJyZW50VGltZSIsImJsZXNzUHJvbWlzZXMiLCJmb3JFYWNoTWVkaWFFbGVtZW50XyIsImJsZXNzXyIsInJlYXNvbiIsImV4cGVjdGVkRXJyb3IiLCJxdWV1ZSIsInRhc2siLCJleGVjdXRpb25GbiIsImV4ZWN1dGUiLCJlcnJvciIsInNoaWZ0IiwiZXhlY3V0ZU5leHRNZWRpYUVsZW1lbnRUYXNrXyIsInJlcXVpcmVzU3luY2hyb25vdXNFeGVjdXRpb24iLCJkZWxheSIsImlzUXVldWVSdW5uaW5nIiwid2hlbkNvbXBsZXRlIiwicm9vdCIsImdldEVsZW1lbnQiLCJleGlzdGluZ0lkIiwiaGFzSW5zdGFuY2VBbGxvY2F0ZWQiLCJuZXdJZCIsIlN0cmluZyIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsImdldE1heE1lZGlhRWxlbWVudENvdW50cyIsImdldEVsZW1lbnREaXN0YW5jZSIsIk1lZGlhUG9vbFJvb3QiLCJ1bnVzZWRFbGVtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsU0FERixFQUVFQyw2QkFGRixFQUdFQyxRQUhGLEVBSUVDLFFBSkYsRUFLRUMsU0FMRixFQU1FQyxRQU5GLEVBT0VDLGtCQVBGLEVBUUVDLGVBUkYsRUFTRUMsZ0JBVEYsRUFVRUMsVUFWRixFQVdFQyxpQkFYRjtBQWFBLFNBQVFDLCtCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxrQkFBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxlQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLEtBQVI7QUFDQSxTQUFRQyxrQkFBUjs7QUFFQTtBQUNBLE9BQU8sSUFBTUMsU0FBUyxHQUFHO0FBQ3ZCQyxFQUFBQSxXQUFXLEVBQUUsYUFEVTtBQUV2QkMsRUFBQUEsS0FBSyxFQUFFLE9BRmdCO0FBR3ZCQyxFQUFBQSxLQUFLLEVBQUU7QUFIZ0IsQ0FBbEI7O0FBTVA7QUFDQSxJQUFNQyxrQkFBa0IsR0FBRztBQUN6QkMsRUFBQUEsV0FBVyxFQUFFLGFBRFk7QUFFekJDLEVBQUFBLElBQUksRUFBRTtBQUZtQixD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RUFBZixDQUFwQjtBQUNBd0gsTUFBQUEsT0FBTyxDQUFDN0gsZ0NBQUQsQ0FBUCxHQUE0Q3NKLEtBQTVDO0FBQ0FsSixNQUFBQSxTQUFTLENBQUNrSixLQUFELENBQVQsR0FBbUIsSUFBSWhKLFNBQUosQ0FDakJ0QixLQUFLLENBQUNrSyxJQUFJLENBQUNDLFVBQUwsR0FBa0JLLGFBQWxCLENBQWdDQyxXQUFqQyxDQURZLEVBRWpCUCxJQUFJLENBQUNRLHdCQUFMLEVBRmlCLEVBR2pCLFVBQUM3QixPQUFEO0FBQUEsZUFBYXFCLElBQUksQ0FBQ1Msa0JBQUwsQ0FBd0I5QixPQUF4QixDQUFiO0FBQUEsT0FIaUIsQ0FBbkI7QUFNQSxhQUFPekgsU0FBUyxDQUFDa0osS0FBRCxDQUFoQjtBQUNEO0FBdDJCSDs7QUFBQTtBQUFBOztBQXkyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFNLGFBQWI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsMEJBQWEsQ0FBRTtBQUVmO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWZBO0FBQUE7QUFBQSxXQWdCRSw0QkFBbUJDLGFBQW5CLEVBQWtDLENBQUU7QUFFcEM7QUFDRjtBQUNBO0FBQ0E7O0FBckJBO0FBQUE7QUFBQSxXQXNCRSxvQ0FBMkIsQ0FBRTtBQXRCL0I7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBCbGVzc1Rhc2ssXG4gIEVMRU1FTlRfQkxFU1NFRF9QUk9QRVJUWV9OQU1FLFxuICBMb2FkVGFzayxcbiAgTXV0ZVRhc2ssXG4gIFBhdXNlVGFzayxcbiAgUGxheVRhc2ssXG4gIFNldEN1cnJlbnRUaW1lVGFzayxcbiAgU3dhcEludG9Eb21UYXNrLFxuICBTd2FwT3V0T2ZEb21UYXNrLFxuICBVbm11dGVUYXNrLFxuICBVcGRhdGVTb3VyY2VzVGFzayxcbn0gZnJvbSAnLi9tZWRpYS10YXNrcyc7XG5pbXBvcnQge01FRElBX0xPQURfRkFJTFVSRV9TUkNfUFJPUEVSVFl9IGZyb20gJy4uLy4uLy4uL3NyYy9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtTb3VyY2VzfSBmcm9tICcuL3NvdXJjZXMnO1xuaW1wb3J0IHthbXBNZWRpYUVsZW1lbnRGb3J9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2ZpbmRJbmRleH0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuaW1wb3J0IHtpc0Nvbm5lY3RlZE5vZGV9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge21hdGNoZXN9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge3RvV2lufSBmcm9tICcjY29yZS93aW5kb3cnO1xuaW1wb3J0IHt1c2VySW50ZXJhY3RlZFdpdGh9IGZyb20gJy4uLy4uLy4uL3NyYy92aWRlby1pbnRlcmZhY2UnO1xuXG4vKiogQGNvbnN0IEBlbnVtIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgTWVkaWFUeXBlID0ge1xuICBVTlNVUFBPUlRFRDogJ3Vuc3VwcG9ydGVkJyxcbiAgQVVESU86ICdhdWRpbycsXG4gIFZJREVPOiAndmlkZW8nLFxufTtcblxuLyoqIEBjb25zdCBAZW51bSB7c3RyaW5nfSAqL1xuY29uc3QgTWVkaWFFbGVtZW50T3JpZ2luID0ge1xuICBQTEFDRUhPTERFUjogJ3BsYWNlaG9sZGVyJyxcbiAgUE9PTDogJ3Bvb2wnLFxufTtcblxuLyoqXG4gKiBBIG1hcmtlciB0eXBlIHRvIGluZGljYXRlIGFuIGVsZW1lbnQgdGhhdCBvcmlnaW5hdGVkIGluIHRoZSBkb2N1bWVudCB0aGF0IGlzXG4gKiBiZWluZyBzd2FwcGVkIGZvciBhbiBlbGVtZW50IGZyb20gdGhlIHBvb2wuXG4gKiBAdHlwZWRlZiB7IUVsZW1lbnR9XG4gKi9cbmV4cG9ydCBsZXQgUGxhY2Vob2xkZXJFbGVtZW50RGVmO1xuXG4vKipcbiAqIEEgbWFya2VyIHR5cGUgdG8gaW5kaWNhdGUgYW4gZWxlbWVudCB0aGF0IG9yaWdpbmF0ZWQgZnJvbSB0aGUgcG9vbCBpdHNlbGYuXG4gKiBAdHlwZWRlZiB7IUhUTUxNZWRpYUVsZW1lbnR9XG4gKi9cbmxldCBQb29sQm91bmRFbGVtZW50RGVmO1xuXG4vKipcbiAqIEFuIGVsZW1lbnQgcHVsbGVkIGZyb20gdGhlIERPTS4gIEl0IGlzIHlldCB0byBiZSByZXNvbHZlZCBpbnRvIGFcbiAqIFBsYWNlaG9sZGVyRWxlbWVudCBvciBhIFBvb2xCb3VuZEVsZW1lbnQuXG4gKiBAdHlwZWRlZiB7IVBsYWNlaG9sZGVyRWxlbWVudERlZnwhUG9vbEJvdW5kRWxlbWVudERlZn1cbiAqL1xuZXhwb3J0IGxldCBEb21FbGVtZW50RGVmO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIGRpc3RhbmNlIG9mIGFuIGVsZW1lbnQgZnJvbSB0aGUgY3VycmVudCBwbGFjZSBpbiB0aGUgZG9jdW1lbnQuXG4gKiBAdHlwZWRlZiB7ZnVuY3Rpb24oIURvbUVsZW1lbnREZWYpOiBudW1iZXJ9XG4gKi9cbmV4cG9ydCBsZXQgRWxlbWVudERpc3RhbmNlRm5EZWY7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRhc2sgdG8gYmUgZXhlY3V0ZWQgb24gYSBtZWRpYSBlbGVtZW50LlxuICogQHR5cGVkZWYge2Z1bmN0aW9uKCFQb29sQm91bmRFbGVtZW50RGVmLCAqKTogIVByb21pc2V9XG4gKi9cbmxldCBFbGVtZW50VGFza18xXzBfRGVmOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGdvb2dsZS1jYW1lbGNhc2UvZ29vZ2xlLWNhbWVsY2FzZVxuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBQTEFDRUhPTERFUl9FTEVNRU5UX0lEX1BSRUZJWCA9ICdpLWFtcGh0bWwtcGxhY2Vob2xkZXItbWVkaWEtJztcblxuLyoqXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuY29uc3QgUE9PTF9FTEVNRU5UX0lEX1BSRUZJWCA9ICdpLWFtcGh0bWwtcG9vbC1tZWRpYS0nO1xuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBQT09MX01FRElBX0VMRU1FTlRfUFJPUEVSVFlfTkFNRSA9ICdfX0FNUF9NRURJQV9QT09MX0lEX18nO1xuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBFTEVNRU5UX1RBU0tfUVVFVUVfUFJPUEVSVFlfTkFNRSA9ICdfX0FNUF9NRURJQV9FTEVNRU5UX1RBU0tTX18nO1xuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBNRURJQV9FTEVNRU5UX09SSUdJTl9QUk9QRVJUWV9OQU1FID0gJ19fQU1QX01FRElBX0VMRU1FTlRfT1JJR0lOX18nO1xuXG4vKipcbiAqIFRoZSBuYW1lIGZvciBhIHN0cmluZyBhdHRyaWJ1dGUgdGhhdCByZXByZXNlbnRzIHRoZSBJRCBvZiBhIG1lZGlhIGVsZW1lbnRcbiAqIHRoYXQgdGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGlzIGF0dHJpYnV0ZSByZXBsYWNlZC5cbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgUkVQTEFDRURfTUVESUFfUFJPUEVSVFlfTkFNRSA9ICdyZXBsYWNlZC1tZWRpYSc7XG5cbi8qKlxuICogQHR5cGUgeyFPYmplY3Q8c3RyaW5nLCAhTWVkaWFQb29sPn1cbiAqL1xuY29uc3QgaW5zdGFuY2VzID0ge307XG5cbi8qKlxuICogQHR5cGUge251bWJlcn1cbiAqL1xubGV0IG5leHRJbnN0YW5jZUlkID0gMDtcblxuLyoqXG4gKiDwn425IE1lZGlhUG9vbFxuICogS2VlcHMgYSBwb29sIG9mIE4gbWVkaWEgZWxlbWVudHMgdG8gYmUgc2hhcmVkIGFjcm9zcyBjb21wb25lbnRzLlxuICovXG5leHBvcnQgY2xhc3MgTWVkaWFQb29sIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luIFRoZSB3aW5kb3cgb2JqZWN0LlxuICAgKiBAcGFyYW0geyFPYmplY3Q8IU1lZGlhVHlwZSwgbnVtYmVyPn0gbWF4Q291bnRzIFRoZSBtYXhpbXVtIGFtb3VudCBvZiBlYWNoXG4gICAqICAgICBtZWRpYSBlbGVtZW50IHRoYXQgY2FuIGJlIGFsbG9jYXRlZCBieSB0aGUgcG9vbC5cbiAgICogQHBhcmFtIHshRWxlbWVudERpc3RhbmNlRm5EZWZ9IGRpc3RhbmNlRm4gQSBmdW5jdGlvbiB0aGF0LCBnaXZlbiBhblxuICAgKiAgICAgZWxlbWVudCwgcmV0dXJucyB0aGUgZGlzdGFuY2Ugb2YgdGhhdCBlbGVtZW50IGZyb20gdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICogICAgIGluIHRoZSBkb2N1bWVudC4gIFRoZSBkZWZpbml0aW9uIG9mIFwiZGlzdGFuY2VcIiBjYW4gYmUgaW1wbGVtZW50YXRpb24tXG4gICAqICAgICBkZXBlbmRhbnQsIGFzIGxvbmcgYXMgaXQgaXMgY29uc2lzdGVudCBiZXR3ZWVuIGludm9jYXRpb25zLlxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBtYXhDb3VudHMsIGRpc3RhbmNlRm4pIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS90aW1lci1pbXBsLlRpbWVyfSAqL1xuICAgIHRoaXMudGltZXJfID0gU2VydmljZXMudGltZXJGb3Iod2luKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBmdW5jdGlvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIGFuIGVsZW1lbnQgYW5kIHRoZVxuICAgICAqIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIGRvY3VtZW50LlxuICAgICAqIEBwcml2YXRlIEBjb25zdCB7IUVsZW1lbnREaXN0YW5jZUZuRGVmfVxuICAgICAqL1xuICAgIHRoaXMuZGlzdGFuY2VGbl8gPSBkaXN0YW5jZUZuO1xuXG4gICAgLyoqXG4gICAgICogSG9sZHMgYWxsIG9mIHRoZSBwb29sLWJvdW5kIG1lZGlhIGVsZW1lbnRzIHRoYXQgaGF2ZSBiZWVuIGFsbG9jYXRlZC5cbiAgICAgKiBAY29uc3QgeyFPYmplY3Q8IU1lZGlhVHlwZSwgIUFycmF5PCFQb29sQm91bmRFbGVtZW50RGVmPj59XG4gICAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAgICovXG4gICAgdGhpcy5hbGxvY2F0ZWQgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEhvbGRzIGFsbCBvZiB0aGUgcG9vbC1ib3VuZCBtZWRpYSBlbGVtZW50cyB0aGF0IGhhdmUgbm90IGJlZW4gYWxsb2NhdGVkLlxuICAgICAqIEBjb25zdCB7IU9iamVjdDwhTWVkaWFUeXBlLCAhQXJyYXk8IVBvb2xCb3VuZEVsZW1lbnREZWY+Pn1cbiAgICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICAgKi9cbiAgICB0aGlzLnVuYWxsb2NhdGVkID0ge307XG5cbiAgICAvKipcbiAgICAgKiBNYXBzIGEgbWVkaWEgZWxlbWVudCdzIElEIHRvIHRoZSBvYmplY3QgY29udGFpbmluZyBpdHMgc291cmNlcy5cbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCAhU291cmNlcz59XG4gICAgICovXG4gICAgdGhpcy5zb3VyY2VzXyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogTWFwcyBhIG1lZGlhIGVsZW1lbnQncyBJRCB0byB0aGUgZWxlbWVudC4gIFRoaXMgaXMgbmVjZXNzYXJ5LCBhcyBlbGVtZW50c1xuICAgICAqIGFyZSBrZXB0IGluIG1lbW9yeSB3aGVuIHRoZXkgYXJlIHN3YXBwZWQgb3V0IG9mIHRoZSBET00uXG4gICAgICogQHByaXZhdGUgQGNvbnN0IHshT2JqZWN0PHN0cmluZywgIVBsYWNlaG9sZGVyRWxlbWVudERlZj59XG4gICAgICovXG4gICAgdGhpcy5wbGFjZWhvbGRlckVsc18gPSB7fTtcblxuICAgIC8qKlxuICAgICAqIENvdW50ZXIgdXNlZCB0byBwcm9kdWNlIHVuaXF1ZSBJRHMgZm9yIHBsYWNlaG9sZGVyIG1lZGlhIGVsZW1lbnRzLlxuICAgICAqIEBwcml2YXRlIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wbGFjZWhvbGRlcklkQ291bnRlcl8gPSAwO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgbWVkaWEgZWxlbWVudHMgaW4gdGhpcyBNZWRpYVBvb2wgaW5zdGFuY2UgaGF2ZSBiZWVuIFwiYmxlc3NlZFwiXG4gICAgICogZm9yIHVubXV0ZWQgcGxheWJhY2sgd2l0aG91dCB1c2VyIGdlc3R1cmUuXG4gICAgICogQHByaXZhdGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5ibGVzc2VkXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/QXJyYXk8IUFtcEVsZW1lbnQ+fSAqL1xuICAgIHRoaXMuYW1wRWxlbWVudHNUb0JsZXNzXyA9IG51bGw7XG5cbiAgICAvKiogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgKGZ1bmN0aW9uKCk6ICFQb29sQm91bmRFbGVtZW50RGVmKT59ICovXG4gICAgdGhpcy5tZWRpYUZhY3RvcnlfID0ge1xuICAgICAgW01lZGlhVHlwZS5BVURJT106ICgpID0+IHtcbiAgICAgICAgY29uc3QgYXVkaW9FbCA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuICAgICAgICBhdWRpb0VsLnNldEF0dHJpYnV0ZSgnbXV0ZWQnLCAnJyk7XG4gICAgICAgIGF1ZGlvRWwubXV0ZWQgPSB0cnVlO1xuICAgICAgICBhdWRpb0VsLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1wb29sLW1lZGlhJyk7XG4gICAgICAgIGF1ZGlvRWwuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXBvb2wtYXVkaW8nKTtcbiAgICAgICAgcmV0dXJuIGF1ZGlvRWw7XG4gICAgICB9LFxuICAgICAgW01lZGlhVHlwZS5WSURFT106ICgpID0+IHtcbiAgICAgICAgY29uc3QgdmlkZW9FbCA9IHRoaXMud2luXy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuICAgICAgICB2aWRlb0VsLnNldEF0dHJpYnV0ZSgnbXV0ZWQnLCAnJyk7XG4gICAgICAgIHZpZGVvRWwubXV0ZWQgPSB0cnVlO1xuICAgICAgICB2aWRlb0VsLnNldEF0dHJpYnV0ZSgncGxheXNpbmxpbmUnLCAnJyk7XG4gICAgICAgIHZpZGVvRWwuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLXBvb2wtbWVkaWEnKTtcbiAgICAgICAgdmlkZW9FbC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtcG9vbC12aWRlbycpO1xuICAgICAgICByZXR1cm4gdmlkZW9FbDtcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZU1lZGlhUG9vbF8obWF4Q291bnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWxscyB0aGUgbWVkaWEgcG9vbCBieSBjcmVhdGluZyB0aGUgbWF4aW11bSBudW1iZXIgb2YgbWVkaWEgZWxlbWVudHMgZm9yXG4gICAqIGVhY2ggb2YgdGhlIHR5cGVzIG9mIG1lZGlhIGVsZW1lbnRzLiAgV2UgbmVlZCB0byBjcmVhdGUgdGhlc2UgZWFnZXJseSBzb1xuICAgKiB0aGF0IGFsbCBtZWRpYSBlbGVtZW50cyBleGlzdCBieSB0aGUgdGltZSB0aGF0IGJsZXNzQWxsKCkgaXMgaW52b2tlZCxcbiAgICogdGhlcmVieSBcImJsZXNzaW5nXCIgYWxsIG1lZGlhIGVsZW1lbnRzIGZvciBwbGF5YmFjayB3aXRob3V0IHVzZXIgZ2VzdHVyZS5cbiAgICogQHBhcmFtIHshT2JqZWN0PCFNZWRpYVR5cGUsIG51bWJlcj59IG1heENvdW50cyBUaGUgbWF4aW11bSBhbW91bnQgb2YgZWFjaFxuICAgKiAgICAgbWVkaWEgZWxlbWVudCB0aGF0IGNhbiBiZSBhbGxvY2F0ZWQgYnkgdGhlIHBvb2wuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplTWVkaWFQb29sXyhtYXhDb3VudHMpIHtcbiAgICBsZXQgcG9vbElkQ291bnRlciA9IDA7XG5cbiAgICB0aGlzLmZvckVhY2hNZWRpYVR5cGVfKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IHR5cGUgPSBNZWRpYVR5cGVba2V5XTtcbiAgICAgIGNvbnN0IGNvdW50ID0gbWF4Q291bnRzW3R5cGVdIHx8IDA7XG5cbiAgICAgIGlmIChjb3VudCA8PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY3RvciA9IGRldkFzc2VydChcbiAgICAgICAgdGhpcy5tZWRpYUZhY3RvcnlfW3R5cGVdLFxuICAgICAgICBgRmFjdG9yeSBmb3IgbWVkaWEgdHlwZSBcXGAke3R5cGV9XFxgIHVuc2V0LmBcbiAgICAgICk7XG5cbiAgICAgIC8vIENsb25pbmcgbm9kZXMgaXMgZmFzdGVyIHRoYW4gYnVpbGRpbmcgdGhlbS5cbiAgICAgIC8vIENvbnN0cnVjdCBhIHNlZWQgbWVkaWEgZWxlbWVudCBhcyBhIHNtYWxsIG9wdGltaXphdGlvbi5cbiAgICAgIGNvbnN0IG1lZGlhRWxTZWVkID0gY3Rvci5jYWxsKHRoaXMpO1xuXG4gICAgICB0aGlzLmFsbG9jYXRlZFt0eXBlXSA9IFtdO1xuICAgICAgdGhpcy51bmFsbG9jYXRlZFt0eXBlXSA9IFtdO1xuXG4gICAgICAvLyBSZXZlcnNlLWxvb3BpbmcgaXMgZ2VuZXJhbGx5IGZhc3RlciBhbmQgQ2xvc3VyZSB3b3VsZCB1c3VhbGx5IG1ha2VcbiAgICAgIC8vIHRoaXMgb3B0aW1pemF0aW9uIGF1dG9tYXRpY2FsbHkuIEhvd2V2ZXIsIGl0IHNraXBzIGl0IGR1ZSB0byBhXG4gICAgICAvLyBjb21wYXJpc29uIHdpdGggdGhlIGl0ZXJ2YXIgYmVsb3csIHNvIHdlIGhhdmUgdG8gcm9sbCBpdCBieSBoYW5kLlxuICAgICAgZm9yIChsZXQgaSA9IGNvdW50OyBpID4gMDsgaS0tKSB7XG4gICAgICAgIC8vIFVzZSBzZWVkIGVsZW1lbnQgYXQgZW5kIG9mIHNldCB0byBwcmV2ZW50IHdhc3RpbmcgaXQuXG4gICAgICAgIGNvbnN0IG1lZGlhRWwgPSAvKiogQHR5cGUgeyFQb29sQm91bmRFbGVtZW50RGVmfSAqLyAoXG4gICAgICAgICAgaSA9PSAxID8gbWVkaWFFbFNlZWQgOiBtZWRpYUVsU2VlZC5jbG9uZU5vZGUoLyogZGVlcCAqLyB0cnVlKVxuICAgICAgICApO1xuICAgICAgICBtZWRpYUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5vbk1lZGlhRXJyb3JfLCB7Y2FwdHVyZTogdHJ1ZX0pO1xuICAgICAgICBtZWRpYUVsLmlkID0gUE9PTF9FTEVNRU5UX0lEX1BSRUZJWCArIHBvb2xJZENvdW50ZXIrKztcbiAgICAgICAgLy8gSW4gRmlyZWZveCwgY2xvbmVOb2RlKCkgZG9lcyBub3QgcHJvcGVybHkgY29weSB0aGUgbXV0ZWQgcHJvcGVydHlcbiAgICAgICAgLy8gdGhhdCB3YXMgc2V0IGluIHRoZSBzZWVkLiBXZSBuZWVkIHRvIHNldCBpdCBhZ2FpbiBoZXJlLlxuICAgICAgICBtZWRpYUVsLm11dGVkID0gdHJ1ZTtcbiAgICAgICAgbWVkaWFFbFtNRURJQV9FTEVNRU5UX09SSUdJTl9QUk9QRVJUWV9OQU1FXSA9IE1lZGlhRWxlbWVudE9yaWdpbi5QT09MO1xuICAgICAgICB0aGlzLnVuYWxsb2NhdGVkW3R5cGVdLnB1c2gobWVkaWFFbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBIVE1MTWVkaWFFbGVtZW50IGFuZCBjaGlsZHJlbiBIVE1MU291cmNlRWxlbWVudCBlcnJvciBldmVudHMuIE1hcmtzXG4gICAqIHRoZSBtZWRpYSBhcyBlcnJvcmVkLCBhcyB0aGVyZSBpcyBubyBvdGhlciB3YXkgdG8gY2hlY2sgaWYgdGhlIGxvYWQgZmFpbGVkXG4gICAqIHdoZW4gdGhlIG1lZGlhIGlzIHVzaW5nIEhUTUxTb3VyY2VFbGVtZW50cy5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbk1lZGlhRXJyb3JfKGV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpO1xuICAgIGlmICghbWF0Y2hlcyh0YXJnZXQsICdzb3VyY2U6bGFzdC1vZi10eXBlLCB2aWRlb1tzcmNdJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbWVkaWEgPSB0YXJnZXQudGFnTmFtZSA9PT0gJ1NPVVJDRScgPyB0YXJnZXQucGFyZW50RWxlbWVudCA6IHRhcmdldDtcbiAgICBtZWRpYVtNRURJQV9MT0FEX0ZBSUxVUkVfU1JDX1BST1BFUlRZXSA9IG1lZGlhLmN1cnJlbnRTcmMgfHwgdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshU291cmNlc30gVGhlIGRlZmF1bHQgc291cmNlLCBlbXB0eS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldERlZmF1bHRTb3VyY2VfKCkge1xuICAgIHJldHVybiBuZXcgU291cmNlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmlzb24gZnVuY3Rpb24gdGhhdCBjb21wYXJlcyB0aGUgZGlzdGFuY2Ugb2YgZWFjaCBlbGVtZW50IGZyb20gdGhlXG4gICAqIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIGRvY3VtZW50LlxuICAgKiBAcGFyYW0geyFQb29sQm91bmRFbGVtZW50RGVmfSBtZWRpYUEgVGhlIGZpcnN0IGVsZW1lbnQgdG8gY29tcGFyZS5cbiAgICogQHBhcmFtIHshUG9vbEJvdW5kRWxlbWVudERlZn0gbWVkaWFCIFRoZSBzZWNvbmQgZWxlbWVudCB0byBjb21wYXJlLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjb21wYXJlTWVkaWFEaXN0YW5jZXNfKG1lZGlhQSwgbWVkaWFCKSB7XG4gICAgY29uc3QgZGlzdGFuY2VBID0gdGhpcy5kaXN0YW5jZUZuXyhtZWRpYUEpO1xuICAgIGNvbnN0IGRpc3RhbmNlQiA9IHRoaXMuZGlzdGFuY2VGbl8obWVkaWFCKTtcbiAgICByZXR1cm4gZGlzdGFuY2VBIDwgZGlzdGFuY2VCID8gLTEgOiAxO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge3N0cmluZ30gQSB1bmlxdWUgSUQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVQbGFjZWhvbGRlckVsZW1lbnRJZF8oKSB7XG4gICAgcmV0dXJuIFBMQUNFSE9MREVSX0VMRU1FTlRfSURfUFJFRklYICsgdGhpcy5wbGFjZWhvbGRlcklkQ291bnRlcl8rKztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFEb21FbGVtZW50RGVmfSBtZWRpYUVsZW1lbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzUG9vbE1lZGlhRWxlbWVudF8obWVkaWFFbGVtZW50KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIG1lZGlhRWxlbWVudFtNRURJQV9FTEVNRU5UX09SSUdJTl9QUk9QRVJUWV9OQU1FXSA9PT1cbiAgICAgIE1lZGlhRWxlbWVudE9yaWdpbi5QT09MXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSB0eXBlIGZyb20gYSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0geyFQb29sQm91bmRFbGVtZW50RGVmfCFQbGFjZWhvbGRlckVsZW1lbnREZWZ9IG1lZGlhRWxlbWVudCBUaGVcbiAgICogICAgIGVsZW1lbnQgd2hvc2UgbWVkaWEgdHlwZSBzaG91bGQgYmUgcmV0cmlldmVkLlxuICAgKiBAcmV0dXJuIHshTWVkaWFUeXBlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0TWVkaWFUeXBlXyhtZWRpYUVsZW1lbnQpIHtcbiAgICBjb25zdCB0YWdOYW1lID0gbWVkaWFFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBzd2l0Y2ggKHRhZ05hbWUpIHtcbiAgICAgIGNhc2UgJ2F1ZGlvJzpcbiAgICAgICAgcmV0dXJuIE1lZGlhVHlwZS5BVURJTztcbiAgICAgIGNhc2UgJ3ZpZGVvJzpcbiAgICAgICAgcmV0dXJuIE1lZGlhVHlwZS5WSURFTztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBNZWRpYVR5cGUuVU5TVVBQT1JURUQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2VydmVzIGFuIGVsZW1lbnQgb2YgdGhlIHNwZWNpZmllZCB0eXBlIGJ5IHJlbW92aW5nIGl0IGZyb20gdGhlIHNldCBvZlxuICAgKiB1bmFsbG9jYXRlZCBlbGVtZW50cyBhbmQgcmV0dXJuaW5nIGl0LlxuICAgKiBAcGFyYW0geyFNZWRpYVR5cGV9IG1lZGlhVHlwZSBUaGUgdHlwZSBvZiBtZWRpYSBlbGVtZW50IHRvIHJlc2VydmUuXG4gICAqIEByZXR1cm4gez9Qb29sQm91bmRFbGVtZW50RGVmfSBUaGUgcmVzZXJ2ZWQgZWxlbWVudCwgaWYgb25lIGV4aXN0cy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlc2VydmVVbmFsbG9jYXRlZE1lZGlhRWxlbWVudF8obWVkaWFUeXBlKSB7XG4gICAgcmV0dXJuIHRoaXMudW5hbGxvY2F0ZWRbbWVkaWFUeXBlXS5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIG1lZGlhIGVsZW1lbnQgZnJvbSB0aGUgcG9vbCB0aGF0IG1hdGNoZXMgdGhlIHNwZWNpZmllZFxuICAgKiBlbGVtZW50LCBpZiBvbmUgZXhpc3RzLlxuICAgKiBAcGFyYW0geyFNZWRpYVR5cGV9IG1lZGlhVHlwZSBUaGUgdHlwZSBvZiBtZWRpYSBlbGVtZW50IHRvIGdldC5cbiAgICogQHBhcmFtIHshRG9tRWxlbWVudERlZn0gZG9tTWVkaWFFbCBUaGUgZWxlbWVudCB3aG9zZSBtYXRjaGluZyBtZWRpYVxuICAgKiAgICAgZWxlbWVudCBzaG91bGQgYmUgcmV0cmlldmVkLlxuICAgKiBAcmV0dXJuIHs/UG9vbEJvdW5kRWxlbWVudERlZn0gVGhlIG1lZGlhIGVsZW1lbnQgaW4gdGhlIHBvb2wgdGhhdFxuICAgKiAgICAgcmVwcmVzZW50cyB0aGUgc3BlY2lmaWVkIG1lZGlhIGVsZW1lbnRcbiAgICovXG4gIGdldE1hdGNoaW5nTWVkaWFFbGVtZW50RnJvbVBvb2xfKG1lZGlhVHlwZSwgZG9tTWVkaWFFbCkge1xuICAgIGlmICh0aGlzLmlzQWxsb2NhdGVkTWVkaWFFbGVtZW50XyhtZWRpYVR5cGUsIGRvbU1lZGlhRWwpKSB7XG4gICAgICAvLyBUaGUgbWVkaWEgZWxlbWVudCBpbiB0aGUgRE9NIHdhcyBhbHJlYWR5IGZyb20gdGhlIHBvb2wuXG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshUG9vbEJvdW5kRWxlbWVudERlZn0gKi8gKGRvbU1lZGlhRWwpO1xuICAgIH1cblxuICAgIGNvbnN0IGFsbG9jYXRlZEVscyA9IHRoaXMuYWxsb2NhdGVkW21lZGlhVHlwZV07XG4gICAgY29uc3QgaW5kZXggPSBmaW5kSW5kZXgoYWxsb2NhdGVkRWxzLCAocG9vbE1lZGlhRWwpID0+IHtcbiAgICAgIHJldHVybiBwb29sTWVkaWFFbFtSRVBMQUNFRF9NRURJQV9QUk9QRVJUWV9OQU1FXSA9PT0gZG9tTWVkaWFFbC5pZDtcbiAgICB9KTtcblxuICAgIHJldHVybiBhbGxvY2F0ZWRFbHNbaW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG9jYXRlcyB0aGUgc3BlY2lmaWVkIG1lZGlhIGVsZW1lbnQgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxuICAgKiBAcGFyYW0geyFNZWRpYVR5cGV9IG1lZGlhVHlwZSBUaGUgdHlwZSBvZiBtZWRpYSBlbGVtZW50IHRvIGFsbG9jYXRlLlxuICAgKiBAcGFyYW0geyFQb29sQm91bmRFbGVtZW50RGVmfSBwb29sTWVkaWFFbCBUaGUgZWxlbWVudCB0byBiZSBhbGxvY2F0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhbGxvY2F0ZU1lZGlhRWxlbWVudF8obWVkaWFUeXBlLCBwb29sTWVkaWFFbCkge1xuICAgIHRoaXMuYWxsb2NhdGVkW21lZGlhVHlwZV0ucHVzaChwb29sTWVkaWFFbCk7XG5cbiAgICBjb25zdCB1bmFsbG9jYXRlZEVscyA9IHRoaXMudW5hbGxvY2F0ZWRbbWVkaWFUeXBlXTtcbiAgICBjb25zdCBpbmRleFRvUmVtb3ZlID0gdW5hbGxvY2F0ZWRFbHMuaW5kZXhPZihwb29sTWVkaWFFbCk7XG5cbiAgICBpZiAoaW5kZXhUb1JlbW92ZSA+PSAwKSB7XG4gICAgICB1bmFsbG9jYXRlZEVscy5zcGxpY2UoaW5kZXhUb1JlbW92ZSwgMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlYWxsb2NhdGVzIGFuZCByZXR1cm5zIHRoZSBtZWRpYSBlbGVtZW50IG9mIHRoZSBzcGVjaWZpZWQgdHlwZSBmdXJ0aGVzdFxuICAgKiBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBkb2N1bWVudC5cbiAgICogQHBhcmFtIHshTWVkaWFUeXBlfSBtZWRpYVR5cGUgVGhlIHR5cGUgb2YgbWVkaWEgZWxlbWVudCB0byBkZWFsbG9jYXRlLlxuICAgKiBAcGFyYW0geyFQbGFjZWhvbGRlckVsZW1lbnREZWY9fSBvcHRfZWxUb0FsbG9jYXRlIElmIHNwZWNpZmllZCwgdGhlIGVsZW1lbnRcbiAgICogICAgIHRoYXQgaXMgdHJ5aW5nIHRvIGJlIGFsbG9jYXRlZCwgc3VjaCB0aGF0IGFub3RoZXIgZWxlbWVudCBtdXN0IGJlXG4gICAqICAgICBldmljdGVkLlxuICAgKiBAcmV0dXJuIHs/UG9vbEJvdW5kRWxlbWVudERlZn0gVGhlIGRlYWxsb2NhdGVkIGVsZW1lbnQsIGlmIG9uZSBleGlzdHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWFsbG9jYXRlTWVkaWFFbGVtZW50XyhtZWRpYVR5cGUsIG9wdF9lbFRvQWxsb2NhdGUpIHtcbiAgICBjb25zdCBhbGxvY2F0ZWRFbHMgPSB0aGlzLmFsbG9jYXRlZFttZWRpYVR5cGVdO1xuXG4gICAgLy8gU29ydCB0aGUgYWxsb2NhdGVkIG1lZGlhIGVsZW1lbnRzIGJ5IGRpc3RhbmNlIHRvIGVuc3VyZSB0aGF0IHdlIGFyZVxuICAgIC8vIGV2aWN0aW5nIHRoZSBtZWRpYSBlbGVtZW50IHRoYXQgaXMgZnVydGhlc3QgZnJvbSB0aGUgY3VycmVudCBwbGFjZSBpbiB0aGVcbiAgICAvLyBkb2N1bWVudC5cbiAgICBhbGxvY2F0ZWRFbHMuc29ydCgoYSwgYikgPT4gdGhpcy5jb21wYXJlTWVkaWFEaXN0YW5jZXNfKGEsIGIpKTtcblxuICAgIC8vIERvIG5vdCBkZWFsbG9jYXRlIGFueSBtZWRpYSBlbGVtZW50cyBpZiB0aGUgZWxlbWVudCBiZWluZyBsb2FkZWQgb3JcbiAgICAvLyBwbGF5ZWQgaXMgZnVydGhlciB0aGFuIHRoZSBmYXJ0aGVzdCBhbGxvY2F0ZWQgZWxlbWVudC5cbiAgICBpZiAob3B0X2VsVG9BbGxvY2F0ZSkge1xuICAgICAgY29uc3QgZnVydGhlc3RFbCA9IGFsbG9jYXRlZEVsc1thbGxvY2F0ZWRFbHMubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoXG4gICAgICAgICFmdXJ0aGVzdEVsIHx8XG4gICAgICAgIHRoaXMuZGlzdGFuY2VGbl8oZnVydGhlc3RFbCkgPCB0aGlzLmRpc3RhbmNlRm5fKG9wdF9lbFRvQWxsb2NhdGUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGUtYWxsb2NhdGUgYSBtZWRpYSBlbGVtZW50LlxuICAgIGNvbnN0IHBvb2xNZWRpYUVsID0gYWxsb2NhdGVkRWxzLnBvcCgpO1xuICAgIHRoaXMudW5hbGxvY2F0ZWRbbWVkaWFUeXBlXS5wdXNoKHBvb2xNZWRpYUVsKTtcbiAgICByZXR1cm4gcG9vbE1lZGlhRWw7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2libHkgZGVhbGxvY2F0ZXMgYSBzcGVjaWZpYyBtZWRpYSBlbGVtZW50LCByZWdhcmRsZXNzIG9mIGl0cyBkaXN0YW5jZVxuICAgKiBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBkb2N1bWVudC5cbiAgICogQHBhcmFtIHshUG9vbEJvdW5kRWxlbWVudERlZn0gcG9vbE1lZGlhRWwgVGhlIGVsZW1lbnQgdG8gYmUgZGVhbGxvY2F0ZWQuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBzcGVjaWZpZWQgbWVkaWFcbiAgICogICAgIGVsZW1lbnQgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGRlYWxsb2NhdGVkLlxuICAgKi9cbiAgZm9yY2VEZWFsbG9jYXRlTWVkaWFFbGVtZW50Xyhwb29sTWVkaWFFbCkge1xuICAgIGNvbnN0IG1lZGlhVHlwZSA9IHRoaXMuZ2V0TWVkaWFUeXBlXyhwb29sTWVkaWFFbCk7XG4gICAgY29uc3QgYWxsb2NhdGVkRWxzID0gdGhpcy5hbGxvY2F0ZWRbbWVkaWFUeXBlXTtcbiAgICBjb25zdCByZW1vdmVGcm9tRG9tID0gaXNDb25uZWN0ZWROb2RlKHBvb2xNZWRpYUVsKVxuICAgICAgPyB0aGlzLnN3YXBQb29sTWVkaWFFbGVtZW50T3V0T2ZEb21fKHBvb2xNZWRpYUVsKVxuICAgICAgOiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgIHJldHVybiByZW1vdmVGcm9tRG9tLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSBhbGxvY2F0ZWRFbHMuaW5kZXhPZihwb29sTWVkaWFFbCk7XG4gICAgICBkZXZBc3NlcnQoaW5kZXggPj0gMCwgJ0Nhbm5vdCBkZWFsbG9jYXRlIHVuYWxsb2NhdGVkIG1lZGlhIGVsZW1lbnQuJyk7XG4gICAgICBhbGxvY2F0ZWRFbHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMudW5hbGxvY2F0ZWRbbWVkaWFUeXBlXS5wdXNoKHBvb2xNZWRpYUVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmljdHMgYW4gZWxlbWVudCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUsIHJlcGxhY2VzIGl0IGluIHRoZSBET00gd2l0aCB0aGVcbiAgICogb3JpZ2luYWwgbWVkaWEgZWxlbWVudCwgYW5kIHJldHVybnMgaXQuXG4gICAqIEBwYXJhbSB7IU1lZGlhVHlwZX0gbWVkaWFUeXBlIFRoZSB0eXBlIG9mIG1lZGlhIGVsZW1lbnQgdG8gZXZpY3QuXG4gICAqIEBwYXJhbSB7IVBsYWNlaG9sZGVyRWxlbWVudERlZj19IG9wdF9lbFRvQWxsb2NhdGUgSWYgc3BlY2lmaWVkLCB0aGUgZWxlbWVudFxuICAgKiAgICAgdGhhdCBpcyB0cnlpbmcgdG8gYmUgYWxsb2NhdGVkLCBzdWNoIHRoYXQgYW5vdGhlciBlbGVtZW50IG11c3QgYmVcbiAgICogICAgIGV2aWN0ZWQuXG4gICAqIEByZXR1cm4gez9Qb29sQm91bmRFbGVtZW50RGVmfSBBIG1lZGlhIGVsZW1lbnQgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZXZpY3RNZWRpYUVsZW1lbnRfKG1lZGlhVHlwZSwgb3B0X2VsVG9BbGxvY2F0ZSkge1xuICAgIGNvbnN0IHBvb2xNZWRpYUVsID0gdGhpcy5kZWFsbG9jYXRlTWVkaWFFbGVtZW50XyhcbiAgICAgIG1lZGlhVHlwZSxcbiAgICAgIG9wdF9lbFRvQWxsb2NhdGVcbiAgICApO1xuICAgIGlmICghcG9vbE1lZGlhRWwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuc3dhcFBvb2xNZWRpYUVsZW1lbnRPdXRPZkRvbV8ocG9vbE1lZGlhRWwpO1xuICAgIHJldHVybiBwb29sTWVkaWFFbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFNZWRpYVR5cGV9IG1lZGlhVHlwZSBUaGUgbWVkaWEgdHlwZSB0byBjaGVjay5cbiAgICogQHBhcmFtIHshRG9tRWxlbWVudERlZn0gZG9tTWVkaWFFbCBUaGUgZWxlbWVudCB0byBjaGVjay5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSwgaWYgdGhlIHNwZWNpZmllZCBlbGVtZW50IGhhcyBhbHJlYWR5IGJlZW4gYWxsb2NhdGVkXG4gICAqICAgICBhcyB0aGUgc3BlY2lmaWVkIHR5cGUgb2YgbWVkaWEgZWxlbWVudC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzQWxsb2NhdGVkTWVkaWFFbGVtZW50XyhtZWRpYVR5cGUsIGRvbU1lZGlhRWwpIHtcbiAgICAvLyBTaW5jZSB3ZSBkb24ndCBrbm93IHdoZXRoZXIgb3Igbm90IHRoZSBzcGVjaWZpZWQgZG9tTWVkaWFFbCBpcyBhXG4gICAgLy8gcGxhY2Vob2xkZXIgb3Igb3JpZ2luYXRlZCBmcm9tIHRoZSBwb29sLCB3ZSBjb2VyY2UgaXQgdG8gYSBwb29sLWJvdW5kXG4gICAgLy8gZWxlbWVudCwgdG8gY2hlY2sgYWdhaW5zdCB0aGUgYWxsb2NhdGVkIGxpc3Qgb2YgcG9vbC1ib3VuZCBlbGVtZW50cy5cbiAgICBjb25zdCBwb29sTWVkaWFFbCA9IC8qKiBAdHlwZSB7IVBvb2xCb3VuZEVsZW1lbnREZWZ9ICovIChkb21NZWRpYUVsKTtcbiAgICByZXR1cm4gdGhpcy5hbGxvY2F0ZWRbbWVkaWFUeXBlXS5pbmRleE9mKHBvb2xNZWRpYUVsKSA+PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIGEgbWVkaWEgZWxlbWVudCB0aGF0IHdhcyBvcmlnaW5hbGx5IGluIHRoZSBET00gd2l0aCBhIG1lZGlhXG4gICAqIGVsZW1lbnQgZnJvbSB0aGUgcG9vbC5cbiAgICogQHBhcmFtIHshUGxhY2Vob2xkZXJFbGVtZW50RGVmfSBwbGFjZWhvbGRlckVsIFRoZSBwbGFjZWhvbGRlciBlbGVtZW50XG4gICAqICAgICBvcmlnaW5hdGluZyBmcm9tIHRoZSBET00uXG4gICAqIEBwYXJhbSB7IVBvb2xCb3VuZEVsZW1lbnREZWZ9IHBvb2xNZWRpYUVsIFRoZSBtZWRpYSBlbGVtZW50IG9yaWdpbmF0aW5nXG4gICAqICAgICBmcm9tIHRoZSBwb29sLlxuICAgKiBAcGFyYW0geyFTb3VyY2VzfSBzb3VyY2VzIFRoZSBzb3VyY2VzIGZvciB0aGUgbWVkaWEgZWxlbWVudC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG1lZGlhIGVsZW1lbnQgaGFzXG4gICAqICAgICBiZWVuIHN1Y2Nlc3NmdWxseSBzd2FwcGVkIGludG8gdGhlIERPTS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN3YXBQb29sTWVkaWFFbGVtZW50SW50b0RvbV8ocGxhY2Vob2xkZXJFbCwgcG9vbE1lZGlhRWwsIHNvdXJjZXMpIHtcbiAgICBjb25zdCBhbXBNZWRpYUZvclBvb2xFbCA9IGFtcE1lZGlhRWxlbWVudEZvcihwb29sTWVkaWFFbCk7XG4gICAgY29uc3QgYW1wTWVkaWFGb3JEb21FbCA9IGFtcE1lZGlhRWxlbWVudEZvcihwbGFjZWhvbGRlckVsKTtcbiAgICBwb29sTWVkaWFFbFtSRVBMQUNFRF9NRURJQV9QUk9QRVJUWV9OQU1FXSA9IHBsYWNlaG9sZGVyRWwuaWQ7XG5cbiAgICByZXR1cm4gdGhpcy5lbnF1ZXVlTWVkaWFFbGVtZW50VGFza18oXG4gICAgICBwb29sTWVkaWFFbCxcbiAgICAgIG5ldyBTd2FwSW50b0RvbVRhc2socGxhY2Vob2xkZXJFbClcbiAgICApXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgICAgdGhpcy5tYXliZVJlc2V0QW1wTWVkaWFfKGFtcE1lZGlhRm9yUG9vbEVsKSxcbiAgICAgICAgICB0aGlzLm1heWJlUmVzZXRBbXBNZWRpYV8oYW1wTWVkaWFGb3JEb21FbCksXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICB0aGlzLmVucXVldWVNZWRpYUVsZW1lbnRUYXNrXyhcbiAgICAgICAgICBwb29sTWVkaWFFbCxcbiAgICAgICAgICBuZXcgVXBkYXRlU291cmNlc1Rhc2sodGhpcy53aW5fLCBzb3VyY2VzKVxuICAgICAgICApXG4gICAgICApXG4gICAgICAudGhlbigoKSA9PiB0aGlzLmVucXVldWVNZWRpYUVsZW1lbnRUYXNrXyhwb29sTWVkaWFFbCwgbmV3IExvYWRUYXNrKCkpKVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZURlYWxsb2NhdGVNZWRpYUVsZW1lbnRfKHBvb2xNZWRpYUVsKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7P0VsZW1lbnR9IGNvbXBvbmVudEVsXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVSZXNldEFtcE1lZGlhXyhjb21wb25lbnRFbCkge1xuICAgIGlmICghY29tcG9uZW50RWwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBpZiAoY29tcG9uZW50RWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09ICdhbXAtYXVkaW8nKSB7XG4gICAgICAvLyBUT0RPKGFsYW5vcm96Y28pOiBJbXBsZW1lbnQgcmVzZXQgZm9yIGFtcC1hdWRpb1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBjb21wb25lbnRFbC5nZXRJbXBsKCkudGhlbigoaW1wbCkgPT4ge1xuICAgICAgaWYgKGltcGwucmVzZXRPbkRvbUNoYW5nZSkge1xuICAgICAgICBpbXBsLnJlc2V0T25Eb21DaGFuZ2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFQb29sQm91bmRFbGVtZW50RGVmfSBwb29sTWVkaWFFbCBUaGUgZWxlbWVudCB3aG9zZSBzb3VyY2Ugc2hvdWxkXG4gICAqICAgICBiZSByZXNldC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHBvb2wgbWVkaWEgZWxlbWVudFxuICAgKiAgICAgaGFzIGJlZW4gcmVzZXQuXG4gICAqL1xuICByZXNldFBvb2xNZWRpYUVsZW1lbnRTb3VyY2VfKHBvb2xNZWRpYUVsKSB7XG4gICAgY29uc3QgZGVmYXVsdFNvdXJjZXMgPSB0aGlzLmdldERlZmF1bHRTb3VyY2VfKCk7XG5cbiAgICByZXR1cm4gdGhpcy5lbnF1ZXVlTWVkaWFFbGVtZW50VGFza18oXG4gICAgICBwb29sTWVkaWFFbCxcbiAgICAgIG5ldyBVcGRhdGVTb3VyY2VzVGFzayh0aGlzLndpbl8sIGRlZmF1bHRTb3VyY2VzKVxuICAgICkudGhlbigoKSA9PiB0aGlzLmVucXVldWVNZWRpYUVsZW1lbnRUYXNrXyhwb29sTWVkaWFFbCwgbmV3IExvYWRUYXNrKCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgcG9vbCBtZWRpYSBlbGVtZW50IGZyb20gdGhlIERPTSBhbmQgcmVwbGFjZXMgaXQgd2l0aCB0aGUgdmlkZW9cbiAgICogdGhhdCBpdCBvcmlnaW5hbGx5IHJlcGxhY2VkLlxuICAgKiBAcGFyYW0geyFQb29sQm91bmRFbGVtZW50RGVmfSBwb29sTWVkaWFFbCBUaGUgcG9vbCBtZWRpYSBlbGVtZW50IHRvIHJlbW92ZVxuICAgKiAgICAgZnJvbSB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbWVkaWEgZWxlbWVudCBoYXNcbiAgICogICAgIGJlZW4gc3VjY2Vzc2Z1bGx5IHN3YXBwZWQgb3V0IG9mIHRoZSBET00uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzd2FwUG9vbE1lZGlhRWxlbWVudE91dE9mRG9tXyhwb29sTWVkaWFFbCkge1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyRWxJZCA9IHBvb2xNZWRpYUVsW1JFUExBQ0VEX01FRElBX1BST1BFUlRZX05BTUVdO1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyRWwgPSAvKiogQHR5cGUgeyFQbGFjZWhvbGRlckVsZW1lbnREZWZ9ICovIChcbiAgICAgIGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICAgIHRoaXMucGxhY2Vob2xkZXJFbHNfW3BsYWNlaG9sZGVyRWxJZF0sXG4gICAgICAgIGBObyBtZWRpYSBlbGVtZW50ICR7cGxhY2Vob2xkZXJFbElkfSB0byBwdXQgYmFjayBpbnRvIERPTSBhZnRlcmAgK1xuICAgICAgICAgICdldmljdGlvbi4nXG4gICAgICApXG4gICAgKTtcbiAgICBwb29sTWVkaWFFbFtSRVBMQUNFRF9NRURJQV9QUk9QRVJUWV9OQU1FXSA9IG51bGw7XG5cbiAgICBjb25zdCBzd2FwT3V0T2ZEb20gPSB0aGlzLmVucXVldWVNZWRpYUVsZW1lbnRUYXNrXyhcbiAgICAgIHBvb2xNZWRpYUVsLFxuICAgICAgbmV3IFN3YXBPdXRPZkRvbVRhc2socGxhY2Vob2xkZXJFbClcbiAgICApO1xuXG4gICAgdGhpcy5yZXNldFBvb2xNZWRpYUVsZW1lbnRTb3VyY2VfKHBvb2xNZWRpYUVsKTtcbiAgICByZXR1cm4gc3dhcE91dE9mRG9tO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nKX0gY2FsbGJhY2tGblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZm9yRWFjaE1lZGlhVHlwZV8oY2FsbGJhY2tGbikge1xuICAgIE9iamVjdC5rZXlzKE1lZGlhVHlwZSkuZm9yRWFjaChjYWxsYmFja0ZuLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZXMgYSBmdW5jdGlvbiBmb3IgYWxsIG1lZGlhIG1hbmFnZWQgYnkgdGhlIG1lZGlhIHBvb2wuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVBvb2xCb3VuZEVsZW1lbnREZWYpfSBjYWxsYmFja0ZuIFRoZSBmdW5jdGlvbiB0byBiZVxuICAgKiAgICAgaW52b2tlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZvckVhY2hNZWRpYUVsZW1lbnRfKGNhbGxiYWNrRm4pIHtcbiAgICBbdGhpcy5hbGxvY2F0ZWQsIHRoaXMudW5hbGxvY2F0ZWRdLmZvckVhY2goKG1lZGlhU2V0KSA9PiB7XG4gICAgICB0aGlzLmZvckVhY2hNZWRpYVR5cGVfKChrZXkpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZSA9IE1lZGlhVHlwZVtrZXldO1xuICAgICAgICBjb25zdCBlbHMgPSAvKiogQHR5cGUgeyFBcnJheX0gKi8gKG1lZGlhU2V0W3R5cGVdKTtcbiAgICAgICAgaWYgKCFlbHMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZWxzLmZvckVhY2goY2FsbGJhY2tGbi5iaW5kKHRoaXMpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZWxvYWRzIHRoZSBjb250ZW50IG9mIHRoZSBzcGVjaWZpZWQgbWVkaWEgZWxlbWVudCBpbiB0aGUgRE9NIGFuZCByZXR1cm5zXG4gICAqIGEgbWVkaWEgZWxlbWVudCB0aGF0IGNhbiBiZSB1c2VkIGluIGl0cyBzdGVhZCBmb3IgcGxheWJhY2suXG4gICAqIEBwYXJhbSB7IURvbUVsZW1lbnREZWZ9IGRvbU1lZGlhRWwgVGhlIG1lZGlhIGVsZW1lbnQsIGZvdW5kIGluIHRoZVxuICAgKiAgICAgRE9NLCB3aG9zZSBjb250ZW50IHNob3VsZCBiZSBsb2FkZWQuXG4gICAqIEByZXR1cm4ge1Byb21pc2U8IVBvb2xCb3VuZEVsZW1lbnREZWZ8dW5kZWZpbmVkPn0gQSBtZWRpYSBlbGVtZW50IGZyb20gdGhlIHBvb2wgdGhhdFxuICAgKiAgICAgY2FuIGJlIHVzZWQgdG8gcmVwbGFjZSB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAqL1xuICBsb2FkSW50ZXJuYWxfKGRvbU1lZGlhRWwpIHtcbiAgICBpZiAoIWlzQ29ubmVjdGVkTm9kZShkb21NZWRpYUVsKSkge1xuICAgICAgLy8gRG9uJ3QgaGFuZGxlIG5vZGVzIHRoYXQgYXJlbid0IGV2ZW4gaW4gdGhlIGRvY3VtZW50LlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IG1lZGlhVHlwZSA9IHRoaXMuZ2V0TWVkaWFUeXBlXyhkb21NZWRpYUVsKTtcbiAgICBjb25zdCBleGlzdGluZ1Bvb2xNZWRpYUVsID0gdGhpcy5nZXRNYXRjaGluZ01lZGlhRWxlbWVudEZyb21Qb29sXyhcbiAgICAgIG1lZGlhVHlwZSxcbiAgICAgIGRvbU1lZGlhRWxcbiAgICApO1xuICAgIGlmIChleGlzdGluZ1Bvb2xNZWRpYUVsKSB7XG4gICAgICAvLyBUaGUgZWxlbWVudCBiZWluZyBsb2FkZWQgYWxyZWFkeSBoYXMgYW4gYWxsb2NhdGVkIG1lZGlhIGVsZW1lbnQuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICAvKiogQHR5cGUgeyFQb29sQm91bmRFbGVtZW50RGVmfSAqLyAoZXhpc3RpbmdQb29sTWVkaWFFbClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gU2luY2UgdGhpcyBpcyBub3QgYW4gZXhpc3RpbmcgcG9vbCBtZWRpYSBlbGVtZW50LCB3ZSBjYW4gYmUgY2VydGFpbiB0aGF0XG4gICAgLy8gaXQgaXMgYSBwbGFjZWhvbGRlciBlbGVtZW50LlxuICAgIGNvbnN0IHBsYWNlaG9sZGVyRWwgPSAvKiogQHR5cGUgeyFQbGFjZWhvbGRlckVsZW1lbnREZWZ9ICovIChkb21NZWRpYUVsKTtcblxuICAgIGNvbnN0IHNvdXJjZXMgPSB0aGlzLnNvdXJjZXNfW3BsYWNlaG9sZGVyRWwuaWRdO1xuICAgIGRldkFzc2VydChzb3VyY2VzIGluc3RhbmNlb2YgU291cmNlcywgJ0Nhbm5vdCBwbGF5IHVucmVnaXN0ZXJlZCBlbGVtZW50LicpO1xuXG4gICAgY29uc3QgcG9vbE1lZGlhRWwgPVxuICAgICAgdGhpcy5yZXNlcnZlVW5hbGxvY2F0ZWRNZWRpYUVsZW1lbnRfKG1lZGlhVHlwZSkgfHxcbiAgICAgIHRoaXMuZXZpY3RNZWRpYUVsZW1lbnRfKG1lZGlhVHlwZSwgcGxhY2Vob2xkZXJFbCk7XG5cbiAgICBpZiAoIXBvb2xNZWRpYUVsKSB7XG4gICAgICAvLyBJZiB0aGVyZSBpcyBubyBzcGFjZSBpbiB0aGUgcG9vbCB0byBhbGxvY2F0ZSBhIG5ldyBlbGVtZW50LCBhbmQgbm9cbiAgICAgIC8vIGVsZW1lbnQgY2FuIGJlIGV2aWN0ZWQsIGRvIG5vdCByZXR1cm4gYW55IGVsZW1lbnQuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5hbGxvY2F0ZU1lZGlhRWxlbWVudF8obWVkaWFUeXBlLCBwb29sTWVkaWFFbCk7XG5cbiAgICByZXR1cm4gdGhpcy5zd2FwUG9vbE1lZGlhRWxlbWVudEludG9Eb21fKFxuICAgICAgcGxhY2Vob2xkZXJFbCxcbiAgICAgIHBvb2xNZWRpYUVsLFxuICAgICAgc291cmNlc1xuICAgICkudGhlbigoKSA9PiBwb29sTWVkaWFFbCk7XG4gIH1cblxuICAvKipcbiAgICogXCJCbGVzc2VzXCIgdGhlIHNwZWNpZmllZCBtZWRpYSBlbGVtZW50IGZvciBmdXR1cmUgcGxheWJhY2sgd2l0aG91dCBhIHVzZXJcbiAgICogZ2VzdHVyZS4gIEluIG9yZGVyIGZvciB0aGlzIHRvIGJsZXNzIHRoZSBtZWRpYSBlbGVtZW50LCB0aGlzIGZ1bmN0aW9uIG11c3RcbiAgICogYmUgaW52b2tlZCBpbiByZXNwb25zZSB0byBhIHVzZXIgZ2VzdHVyZS5cbiAgICogQHBhcmFtIHshUG9vbEJvdW5kRWxlbWVudERlZn0gcG9vbE1lZGlhRWwgVGhlIG1lZGlhIGVsZW1lbnQgdG8gYmxlc3MuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGJsZXNzaW5nIHRoZSBtZWRpYVxuICAgKiAgICAgZWxlbWVudCBpcyBjb21wbGV0ZS5cbiAgICovXG4gIGJsZXNzXyhwb29sTWVkaWFFbCkge1xuICAgIGlmIChwb29sTWVkaWFFbFtFTEVNRU5UX0JMRVNTRURfUFJPUEVSVFlfTkFNRV0pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lbnF1ZXVlTWVkaWFFbGVtZW50VGFza18ocG9vbE1lZGlhRWwsIG5ldyBCbGVzc1Rhc2soKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCB0byBiZSB1c2FibGUgYnkgdGhlIG1lZGlhIHBvb2wuICBFbGVtZW50c1xuICAgKiBzaG91bGQgYmUgcmVnaXN0ZXJlZCBhcyBlYXJseSBhcyBwb3NzaWJsZSwgaW4gb3JkZXIgdG8gcHJldmVudCB0aGVtIGZyb21cbiAgICogYmVpbmcgcGxheWVkIHdoaWxlIG5vdCBtYW5hZ2VkIGJ5IHRoZSBtZWRpYSBwb29sLiAgSWYgdGhlIG1lZGlhIGVsZW1lbnQgaXNcbiAgICogYWxyZWFkeSByZWdpc3RlcmVkLCB0aGlzIGlzIGEgbm8tb3AuICBSZWdpc3RlcmluZyBlbGVtZW50cyBmcm9tIHdpdGhpbiB0aGVcbiAgICogcG9vbCBpcyBub3QgYWxsb3dlZCwgYW5kIHdpbGwgYWxzbyBiZSBhIG5vLW9wLlxuICAgKiBAcGFyYW0geyFEb21FbGVtZW50RGVmfSBkb21NZWRpYUVsIFRoZSBtZWRpYSBlbGVtZW50IHRvIGJlXG4gICAqICAgICByZWdpc3RlcmVkLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgZWxlbWVudCBoYXMgYmVlblxuICAgKiAgICAgc3VjY2Vzc2Z1bGx5IHJlZ2lzdGVyZWQsIG9yIHJlamVjdGVkIG90aGVyd2lzZS5cbiAgICovXG4gIHJlZ2lzdGVyKGRvbU1lZGlhRWwpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb21NZWRpYUVsLnBhcmVudE5vZGU7XG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQuc2lnbmFscykge1xuICAgICAgdGhpcy50cmFja0FtcEVsZW1lbnRUb0JsZXNzXygvKiogQHR5cGUgeyFBbXBFbGVtZW50fSAqLyAocGFyZW50KSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNQb29sTWVkaWFFbGVtZW50Xyhkb21NZWRpYUVsKSkge1xuICAgICAgLy8gVGhpcyBtZWRpYSBlbGVtZW50IG9yaWdpbmF0ZWQgZnJvbSB0aGUgbWVkaWEgcG9vbC5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB0aGlzIGlzIG5vdCBhbiBleGlzdGluZyBwb29sIG1lZGlhIGVsZW1lbnQsIHdlIGNhbiBiZSBjZXJ0YWluIHRoYXRcbiAgICAvLyBpdCBpcyBhIHBsYWNlaG9sZGVyIGVsZW1lbnQuXG4gICAgY29uc3QgcGxhY2Vob2xkZXJFbCA9IC8qKiBAdHlwZSB7IVBsYWNlaG9sZGVyRWxlbWVudERlZn0gKi8gKGRvbU1lZGlhRWwpO1xuICAgIHBsYWNlaG9sZGVyRWxbTUVESUFfRUxFTUVOVF9PUklHSU5fUFJPUEVSVFlfTkFNRV0gPVxuICAgICAgTWVkaWFFbGVtZW50T3JpZ2luLlBMQUNFSE9MREVSO1xuXG4gICAgY29uc3QgaWQgPSBwbGFjZWhvbGRlckVsLmlkIHx8IHRoaXMuY3JlYXRlUGxhY2Vob2xkZXJFbGVtZW50SWRfKCk7XG4gICAgaWYgKHRoaXMuc291cmNlc19baWRdICYmIHRoaXMucGxhY2Vob2xkZXJFbHNfW2lkXSkge1xuICAgICAgLy8gVGhpcyBtZWRpYSBlbGVtZW50IGlzIGFscmVhZHkgcmVnaXN0ZXJlZC5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1lZGlhIGVsZW1lbnQgaGFzIG5vdCB5ZXQgYmVlbiByZWdpc3RlcmVkLlxuICAgIHBsYWNlaG9sZGVyRWwuaWQgPSBpZDtcbiAgICBjb25zdCBzb3VyY2VzID0gU291cmNlcy5yZW1vdmVGcm9tKHRoaXMud2luXywgcGxhY2Vob2xkZXJFbCk7XG4gICAgdGhpcy5zb3VyY2VzX1tpZF0gPSBzb3VyY2VzO1xuICAgIHRoaXMucGxhY2Vob2xkZXJFbHNfW2lkXSA9IHBsYWNlaG9sZGVyRWw7XG5cbiAgICBpZiAocGxhY2Vob2xkZXJFbCBpbnN0YW5jZW9mIEhUTUxNZWRpYUVsZW1lbnQpIHtcbiAgICAgIHBsYWNlaG9sZGVyRWwubXV0ZWQgPSB0cnVlO1xuICAgICAgcGxhY2Vob2xkZXJFbC5zZXRBdHRyaWJ1dGUoJ211dGVkJywgJycpO1xuICAgICAgcGxhY2Vob2xkZXJFbC5wYXVzZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0cmFja0FtcEVsZW1lbnRUb0JsZXNzXyhlbGVtZW50KSB7XG4gICAgdGhpcy5hbXBFbGVtZW50c1RvQmxlc3NfID0gdGhpcy5hbXBFbGVtZW50c1RvQmxlc3NfIHx8IFtdO1xuICAgIHRoaXMuYW1wRWxlbWVudHNUb0JsZXNzXy5wdXNoKGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZWxvYWRzIHRoZSBjb250ZW50IG9mIHRoZSBzcGVjaWZpZWQgbWVkaWEgZWxlbWVudCBpbiB0aGUgRE9NLlxuICAgKiBAcGFyYW0geyFEb21FbGVtZW50RGVmfSBkb21NZWRpYUVsIFRoZSBtZWRpYSBlbGVtZW50LCBmb3VuZCBpbiB0aGVcbiAgICogICAgIERPTSwgd2hvc2UgY29udGVudCBzaG91bGQgYmUgbG9hZGVkLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgc3BlY2lmaWVkIG1lZGlhXG4gICAqICAgICBlbGVtZW50IGhhcyBzdWNjZXNzZnVsbHkgc3RhcnRlZCBwcmVsb2FkaW5nLlxuICAgKi9cbiAgcHJlbG9hZChkb21NZWRpYUVsKSB7XG4gICAgLy8gRW1wdHkgdGhlbigpIGludm9jYXRpb24gaGlkZXMgdGhlIHZhbHVlIHlpZWxkZWQgYnkgdGhlIGxvYWRJbnRlcm5hbF9cbiAgICAvLyBwcm9taXNlLCBzbyB0aGF0IHdlIGRvIG5vdCBsZWFrIHRoZSBwb29sIG1lZGlhIGVsZW1lbnQgb3V0c2lkZSBvZiB0aGVcbiAgICAvLyBzY29wZSBvZiB0aGUgbWVkaWEgcG9vbC5cbiAgICByZXR1cm4gdGhpcy5sb2FkSW50ZXJuYWxfKGRvbU1lZGlhRWwpLnRoZW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQbGF5cyB0aGUgc3BlY2lmaWVkIG1lZGlhIGVsZW1lbnQgaW4gdGhlIERPTSBieSByZXBsYWNpbmcgaXQgd2l0aCBhIG1lZGlhXG4gICAqIGVsZW1lbnQgZnJvbSB0aGUgcG9vbCBhbmQgcGxheWluZyB0aGF0LlxuICAgKiBAcGFyYW0geyFEb21FbGVtZW50RGVmfSBkb21NZWRpYUVsIFRoZSBtZWRpYSBlbGVtZW50IHRvIGJlIHBsYXllZC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHNwZWNpZmllZCBtZWRpYVxuICAgKiAgICAgZWxlbWVudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcGxheWVkLlxuICAgKi9cbiAgcGxheShkb21NZWRpYUVsKSB7XG4gICAgcmV0dXJuIHRoaXMubG9hZEludGVybmFsXyhkb21NZWRpYUVsKS50aGVuKChwb29sTWVkaWFFbCkgPT4ge1xuICAgICAgaWYgKCFwb29sTWVkaWFFbCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVucXVldWVNZWRpYUVsZW1lbnRUYXNrXyhwb29sTWVkaWFFbCwgbmV3IFBsYXlUYXNrKCkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlcyB0aGUgc3BlY2lmaWVkIG1lZGlhIGVsZW1lbnQgaW4gdGhlIERPTS5cbiAgICogQHBhcmFtIHshRG9tRWxlbWVudERlZn0gZG9tTWVkaWFFbCBUaGUgbWVkaWEgZWxlbWVudCB0byBiZSBwYXVzZWQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHJld2luZFRvQmVnaW5uaW5nIFdoZXRoZXIgdG8gcmV3aW5kIHRoZSBjdXJyZW50VGltZVxuICAgKiAgICAgb2YgbWVkaWEgaXRlbXMgdG8gdGhlIGJlZ2lubmluZy5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHNwZWNpZmllZCBtZWRpYVxuICAgKiAgICAgZWxlbWVudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcGF1c2VkLlxuICAgKi9cbiAgcGF1c2UoZG9tTWVkaWFFbCwgcmV3aW5kVG9CZWdpbm5pbmcgPSBmYWxzZSkge1xuICAgIGNvbnN0IG1lZGlhVHlwZSA9IHRoaXMuZ2V0TWVkaWFUeXBlXyhkb21NZWRpYUVsKTtcbiAgICBjb25zdCBwb29sTWVkaWFFbCA9IHRoaXMuZ2V0TWF0Y2hpbmdNZWRpYUVsZW1lbnRGcm9tUG9vbF8oXG4gICAgICBtZWRpYVR5cGUsXG4gICAgICBkb21NZWRpYUVsXG4gICAgKTtcblxuICAgIGlmICghcG9vbE1lZGlhRWwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lbnF1ZXVlTWVkaWFFbGVtZW50VGFza18ocG9vbE1lZGlhRWwsIG5ldyBQYXVzZVRhc2soKSkudGhlbihcbiAgICAgICgpID0+IHtcbiAgICAgICAgaWYgKHJld2luZFRvQmVnaW5uaW5nKSB7XG4gICAgICAgICAgdGhpcy5lbnF1ZXVlTWVkaWFFbGVtZW50VGFza18oXG4gICAgICAgICAgICAvKiogQHR5cGUgeyFQb29sQm91bmRFbGVtZW50RGVmfSAqLyAocG9vbE1lZGlhRWwpLFxuICAgICAgICAgICAgbmV3IFNldEN1cnJlbnRUaW1lVGFzayh7Y3VycmVudFRpbWU6IDB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJld2luZHMgYSBzcGVjaWZpZWQgbWVkaWEgZWxlbWVudCBpbiB0aGUgRE9NIHRvIDAuXG4gICAqIEBwYXJhbSB7IURvbUVsZW1lbnREZWZ9IGRvbU1lZGlhRWwgVGhlIG1lZGlhIGVsZW1lbnQgdG8gYmUgcmV3b3VuZC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlXG4gICAqICAgICBzcGVjaWZpZWQgbWVkaWEgZWxlbWVudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcmV3b3VuZC5cbiAgICovXG4gIHJld2luZFRvQmVnaW5uaW5nKGRvbU1lZGlhRWwpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRDdXJyZW50VGltZShkb21NZWRpYUVsLCAwIC8qKiBjdXJyZW50VGltZSAqLyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBjdXJyZW50VGltZSBmb3IgYSBzcGVjaWZpZWQgbWVkaWEgZWxlbWVudCBpbiB0aGUgRE9NLlxuICAgKiBAcGFyYW0geyFEb21FbGVtZW50RGVmfSBkb21NZWRpYUVsIFRoZSBtZWRpYSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gY3VycmVudFRpbWUgVGhlIHRpbWUgdG8gc2VlayB0bywgaW4gc2Vjb25kcy5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlXG4gICAqICAgICBzcGVjaWZpZWQgbWVkaWEgZWxlbWVudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgc2V0IHRvIHRoZSBnaXZlbiB0aW1lLlxuICAgKi9cbiAgc2V0Q3VycmVudFRpbWUoZG9tTWVkaWFFbCwgY3VycmVudFRpbWUpIHtcbiAgICBjb25zdCBtZWRpYVR5cGUgPSB0aGlzLmdldE1lZGlhVHlwZV8oZG9tTWVkaWFFbCk7XG4gICAgY29uc3QgcG9vbE1lZGlhRWwgPSB0aGlzLmdldE1hdGNoaW5nTWVkaWFFbGVtZW50RnJvbVBvb2xfKFxuICAgICAgbWVkaWFUeXBlLFxuICAgICAgZG9tTWVkaWFFbFxuICAgICk7XG5cbiAgICBpZiAoIXBvb2xNZWRpYUVsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZW5xdWV1ZU1lZGlhRWxlbWVudFRhc2tfKFxuICAgICAgcG9vbE1lZGlhRWwsXG4gICAgICBuZXcgU2V0Q3VycmVudFRpbWVUYXNrKHtjdXJyZW50VGltZX0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdXRlcyB0aGUgc3BlY2lmaWVkIG1lZGlhIGVsZW1lbnQgaW4gdGhlIERPTS5cbiAgICogQHBhcmFtIHshRG9tRWxlbWVudERlZn0gZG9tTWVkaWFFbCBUaGUgbWVkaWEgZWxlbWVudCB0byBiZSBtdXRlZC5cbiAgICogQHJldHVybiB7IVByb21pc2V9IEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHNwZWNpZmllZCBtZWRpYVxuICAgKiAgICAgZWxlbWVudCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgbXV0ZWQuXG4gICAqL1xuICBtdXRlKGRvbU1lZGlhRWwpIHtcbiAgICBjb25zdCBtZWRpYVR5cGUgPSB0aGlzLmdldE1lZGlhVHlwZV8oZG9tTWVkaWFFbCk7XG4gICAgY29uc3QgcG9vbE1lZGlhRWwgPSB0aGlzLmdldE1hdGNoaW5nTWVkaWFFbGVtZW50RnJvbVBvb2xfKFxuICAgICAgbWVkaWFUeXBlLFxuICAgICAgZG9tTWVkaWFFbFxuICAgICk7XG5cbiAgICBpZiAoIXBvb2xNZWRpYUVsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZW5xdWV1ZU1lZGlhRWxlbWVudFRhc2tfKHBvb2xNZWRpYUVsLCBuZXcgTXV0ZVRhc2soKSk7XG4gIH1cblxuICAvKipcbiAgICogVW5tdXRlcyB0aGUgc3BlY2lmaWVkIG1lZGlhIGVsZW1lbnQgaW4gdGhlIERPTS5cbiAgICogQHBhcmFtIHshRG9tRWxlbWVudERlZn0gZG9tTWVkaWFFbCBUaGUgbWVkaWEgZWxlbWVudCB0byBiZSB1bm11dGVkLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgc3BlY2lmaWVkIG1lZGlhXG4gICAqICAgICBlbGVtZW50IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBwYXVzZWQuXG4gICAqL1xuICB1bm11dGUoZG9tTWVkaWFFbCkge1xuICAgIGNvbnN0IG1lZGlhVHlwZSA9IHRoaXMuZ2V0TWVkaWFUeXBlXyhkb21NZWRpYUVsKTtcbiAgICBjb25zdCBwb29sTWVkaWFFbCA9IHRoaXMuZ2V0TWF0Y2hpbmdNZWRpYUVsZW1lbnRGcm9tUG9vbF8oXG4gICAgICBtZWRpYVR5cGUsXG4gICAgICBkb21NZWRpYUVsXG4gICAgKTtcblxuICAgIGlmICghcG9vbE1lZGlhRWwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lbnF1ZXVlTWVkaWFFbGVtZW50VGFza18ocG9vbE1lZGlhRWwsIG5ldyBVbm11dGVUYXNrKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFwiQmxlc3Nlc1wiIGFsbCBtZWRpYSBlbGVtZW50cyBpbiB0aGUgbWVkaWEgcG9vbCBmb3IgZnV0dXJlIHBsYXliYWNrIHdpdGhvdXRcbiAgICogYSB1c2VyIGdlc3R1cmUuICBJbiBvcmRlciBmb3IgdGhpcyB0byBibGVzcyB0aGUgbWVkaWEgZWxlbWVudHMsIHRoaXNcbiAgICogZnVuY3Rpb24gbXVzdCBiZSBpbnZva2VkIGluIHJlc3BvbnNlIHRvIGEgdXNlciBnZXN0dXJlLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiBhbGwgbWVkaWEgZWxlbWVudHMgaW5cbiAgICogICAgIHRoZSBwb29sIGFyZSBibGVzc2VkLlxuICAgKi9cbiAgYmxlc3NBbGwoKSB7XG4gICAgaWYgKHRoaXMuYmxlc3NlZF8pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBibGVzc1Byb21pc2VzID0gW107XG5cbiAgICAodGhpcy5hbXBFbGVtZW50c1RvQmxlc3NfIHx8IFtdKS5mb3JFYWNoKHVzZXJJbnRlcmFjdGVkV2l0aCk7XG5cbiAgICB0aGlzLmFtcEVsZW1lbnRzVG9CbGVzc18gPSBudWxsOyAvLyBHQ1xuXG4gICAgdGhpcy5mb3JFYWNoTWVkaWFFbGVtZW50XygobWVkaWFFbCkgPT4ge1xuICAgICAgYmxlc3NQcm9taXNlcy5wdXNoKHRoaXMuYmxlc3NfKG1lZGlhRWwpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChibGVzc1Byb21pc2VzKS50aGVuKFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLmJsZXNzZWRfID0gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICAocmVhc29uKSA9PiB7XG4gICAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoJ0FNUC1TVE9SWScsICdCbGVzc2luZyBhbGwgbWVkaWEgZmFpbGVkOiAnLCByZWFzb24pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshUG9vbEJvdW5kRWxlbWVudERlZn0gbWVkaWFFbCBUaGUgZWxlbWVudCB3aG9zZSB0YXNrIHF1ZXVlIHNob3VsZFxuICAgKiAgICAgYmUgZXhlY3V0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBleGVjdXRlTmV4dE1lZGlhRWxlbWVudFRhc2tfKG1lZGlhRWwpIHtcbiAgICBjb25zdCBxdWV1ZSA9IG1lZGlhRWxbRUxFTUVOVF9UQVNLX1FVRVVFX1BST1BFUlRZX05BTUVdO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcXVldWVbMF07XG5cbiAgICBjb25zdCBleGVjdXRpb25GbiA9ICgpID0+IHtcbiAgICAgIHRhc2tcbiAgICAgICAgLmV4ZWN1dGUobWVkaWFFbClcbiAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IGRldigpLmVycm9yKCdBTVAtU1RPUlknLCByZWFzb24pKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gUnVuIHJlZ2FyZGxlc3Mgb2Ygc3VjY2VzcyBvciBmYWlsdXJlIG9mIHRhc2sgZXhlY3V0aW9uLlxuICAgICAgICAgIHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgdGhpcy5leGVjdXRlTmV4dE1lZGlhRWxlbWVudFRhc2tfKG1lZGlhRWwpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgaWYgKHRhc2sucmVxdWlyZXNTeW5jaHJvbm91c0V4ZWN1dGlvbigpKSB7XG4gICAgICBleGVjdXRpb25Gbi5jYWxsKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRpbWVyXy5kZWxheShleGVjdXRpb25Gbi5iaW5kKHRoaXMpLCAwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshUG9vbEJvdW5kRWxlbWVudERlZn0gbWVkaWFFbCBUaGUgZWxlbWVudCBmb3Igd2hpY2ggdGhlIHNwZWNpZmllZFxuICAgKiAgICAgdGFzayBzaG91bGQgYmUgZXhlY3V0ZWQuXG4gICAqIEBwYXJhbSB7IS4vbWVkaWEtdGFza3MuTWVkaWFUYXNrfSB0YXNrIFRoZSB0YXNrIHRvIGJlIGV4ZWN1dGVkLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgc3BlY2lmaWVkIHRhc2sgaXNcbiAgICogICAgIGNvbXBsZXRlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVucXVldWVNZWRpYUVsZW1lbnRUYXNrXyhtZWRpYUVsLCB0YXNrKSB7XG4gICAgaWYgKCFtZWRpYUVsW0VMRU1FTlRfVEFTS19RVUVVRV9QUk9QRVJUWV9OQU1FXSkge1xuICAgICAgbWVkaWFFbFtFTEVNRU5UX1RBU0tfUVVFVUVfUFJPUEVSVFlfTkFNRV0gPSBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBxdWV1ZSA9IG1lZGlhRWxbRUxFTUVOVF9UQVNLX1FVRVVFX1BST1BFUlRZX05BTUVdO1xuICAgIGNvbnN0IGlzUXVldWVSdW5uaW5nID0gcXVldWUubGVuZ3RoICE9PSAwO1xuXG4gICAgcXVldWUucHVzaCh0YXNrKTtcblxuICAgIGlmICghaXNRdWV1ZVJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuZXhlY3V0ZU5leHRNZWRpYUVsZW1lbnRUYXNrXyhtZWRpYUVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFzay53aGVuQ29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFNZWRpYVBvb2xSb290fSByb290XG4gICAqIEByZXR1cm4geyFNZWRpYVBvb2x9XG4gICAqL1xuICBzdGF0aWMgZm9yKHJvb3QpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gcm9vdC5nZXRFbGVtZW50KCk7XG4gICAgY29uc3QgZXhpc3RpbmdJZCA9IGVsZW1lbnRbUE9PTF9NRURJQV9FTEVNRU5UX1BST1BFUlRZX05BTUVdO1xuICAgIGNvbnN0IGhhc0luc3RhbmNlQWxsb2NhdGVkID0gZXhpc3RpbmdJZCAmJiBpbnN0YW5jZXNbZXhpc3RpbmdJZF07XG5cbiAgICBpZiAoaGFzSW5zdGFuY2VBbGxvY2F0ZWQpIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZXNbZXhpc3RpbmdJZF07XG4gICAgfVxuXG4gICAgY29uc3QgbmV3SWQgPSBTdHJpbmcobmV4dEluc3RhbmNlSWQrKyk7XG4gICAgZWxlbWVudFtQT09MX01FRElBX0VMRU1FTlRfUFJPUEVSVFlfTkFNRV0gPSBuZXdJZDtcbiAgICBpbnN0YW5jZXNbbmV3SWRdID0gbmV3IE1lZGlhUG9vbChcbiAgICAgIHRvV2luKHJvb3QuZ2V0RWxlbWVudCgpLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpLFxuICAgICAgcm9vdC5nZXRNYXhNZWRpYUVsZW1lbnRDb3VudHMoKSxcbiAgICAgIChlbGVtZW50KSA9PiByb290LmdldEVsZW1lbnREaXN0YW5jZShlbGVtZW50KVxuICAgICk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2VzW25ld0lkXTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmluZXMgYSBjb21tb24gaW50ZXJmYWNlIGZvciBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYSBNZWRpYVBvb2wuXG4gKlxuICogQGludGVyZmFjZVxuICovXG5leHBvcnQgY2xhc3MgTWVkaWFQb29sUm9vdCB7XG4gIC8qKlxuICAgKiBAcmV0dXJuIHshRWxlbWVudH0gVGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIG1lZGlhIHBvb2wuXG4gICAqL1xuICBnZXRFbGVtZW50KCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdW51c2VkRWxlbWVudCBUaGUgZWxlbWVudCB3aG9zZSBkaXN0YW5jZSBzaG91bGQgYmVcbiAgICogICAgcmV0cmlldmVkLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEEgbnVtZXJpY2FsIGRpc3RhbmNlIHJlcHJlc2VudGluZyBob3cgZmFyIHRoZSBzcGVjaWZpZWRcbiAgICogICAgIGVsZW1lbnQgaXMgZnJvbSB0aGUgdXNlcidzIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIGRvY3VtZW50LiAgVGhlXG4gICAqICAgICBhYnNvbHV0ZSBtYWduaXR1ZGUgb2YgdGhpcyBudW1iZXIgaXMgaXJyZWxldmFudDsgdGhlIHJlbGF0aXZlIG1hZ25pdHVkZVxuICAgKiAgICAgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggbWVkaWEgZWxlbWVudHMgc2hvdWxkIGJlIGV2aWN0ZWQgKGVsZW1lbnRzXG4gICAqICAgICBmdXJ0aGVzdCBmcm9tIHRoZSB1c2VyJ3MgY3VycmVudCBwb3NpdGlvbiBpbiB0aGUgZG9jdW1lbnQgYXJlIGV2aWN0ZWRcbiAgICogICAgIGZyb20gdGhlIE1lZGlhUG9vbCBmaXJzdCkuXG4gICAqL1xuICBnZXRFbGVtZW50RGlzdGFuY2UodW51c2VkRWxlbWVudCkge31cblxuICAvKipcbiAgICogQHJldHVybiB7IU9iamVjdDwhTWVkaWFUeXBlLCBudW1iZXI+fSBUaGUgbWF4aW11bSBhbW91bnQgb2YgZWFjaCBtZWRpYVxuICAgKiAgICAgdHlwZSB0byBhbGxvdyB3aXRoaW4gdGhpcyBlbGVtZW50LlxuICAgKi9cbiAgZ2V0TWF4TWVkaWFFbGVtZW50Q291bnRzKCkge31cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/media-pool.js