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

import {BLANK_AUDIO_SRC, BLANK_VIDEO_SRC} from './default-media';
import {
  BlessTask,
  ELEMENT_BLESSED_PROPERTY_NAME,
  LoadTask,
  MuteTask,
  PauseTask,
  PlayTask,
  RewindTask,
  SwapIntoDomTask,
  SwapOutOfDomTask,
  UnmuteTask,
  UpdateSourcesTask,
} from './media-tasks';
import {Services} from '../../../src/services';
import {Sources} from './sources';
import {createCustomEvent} from '../../../src/event-helper';
import {dev} from '../../../src/log';
import {findIndex} from '../../../src/utils/array';
import {isConnectedNode} from '../../../src/dom';
import {listen} from '../../../src/event-helper';
import {registerServiceBuilderForDoc} from '../../../src/service';
import {toWin} from '../../../src/types';


/** @const @enum {string} */
export const MediaType = {
  UNSUPPORTED: 'unsupported',
  AUDIO: 'audio',
  VIDEO: 'video',
};


/** @enum {string} */
export const MediaPoolEvents = {
  ALLOCATED: 'amp:pool:allocated',
  DEALLOCATED: 'amp:pool:deallocated',
};


/**
 * Playback events to bubble.
 * By default, these don't bubble. We need to re-dispatch so that components
 * can listen to these events without access to the underlying media element.
 * @private @const {!Array<string>}
 */
const NON_BUBBLING_EVENTS = [
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'loadeddata',
  'loadedmetadata',
  'pause',
  'play',
  'playing',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
];


/**
 * @typedef {{
 *   duration: number,
 *   currentTime: number,
 *   paused: boolean,
 *   playedRanges: (!Array<!Array<number>>|undefined),
 * }}
 */
export let MediaInfoDef;


/**
 * Represents the distance of an element from the current place in the document.
 * @typedef {function(!HTMLMediaElement): number}
 */
export let ElementDistanceFnDef;


/**
 * Represents a task to be executed on a media element.
 * @typedef {function(!HTMLMediaElement, *): !Promise}
 */
let ElementTaskDef;


/**
 * @const {string}
 */
const DOM_MEDIA_ELEMENT_ID_PREFIX = 'i-amphtml-media-';


/**
 * @const {string}
 */
const POOL_MEDIA_ELEMENT_PROPERTY_NAME = '__AMP_MEDIA_POOL_ID__';


/**
 * @const {string}
 */
const ELEMENT_TASK_QUEUE_PROPERTY_NAME = '__AMP_MEDIA_ELEMENT_TASKS__';


/**
 * The name for a string attribute that represents the ID of a media element
 * that the element containing this attribute replaced.
 * @const {string}
 */
export const REPLACED_MEDIA_PROPERTY_NAME = 'replaced-media';


/**
 * @type {!Object<string, !MediaPool>}
 */
const instances = {};


/**
 * @type {number}
 */
let nextInstanceId = 0;


let elId = 0;


export class MediaPool {
  /**
   * @param {!Window} win The window object.
   * @param {!Object<!MediaType, number>} maxCounts The maximum amount of each
   *     media element that can be allocated by the pool.
   * @param {!ElementDistanceFnDef} distanceFn A function that, given an
   *     element, returns the distance of that element from the current position
   *     in the document.  The definition of "distance" can be implementation-
   *     dependant, as long as it is consistent between invocations.
   */
  constructor(win, maxCounts, distanceFn) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(win);

    /**
     * The function used to retrieve the distance between an element and the
     * current position in the document.
     * @private @const {!ElementDistanceFnDef}
     */
    this.distanceFn_ = distanceFn;

    /**
     * Holds all of the media elements that have been allocated.
     * @const {!Object<!MediaType, !Array<!HTMLMediaElement>>}
     * @visibleForTesting
     */
    this.allocated = {};

    /**
     * Holds all of the media elements that have not been allocated.
     * @const {!Object<!MediaType, !Array<!HTMLMediaElement>>}
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
     * @private @const {!Object<string, !HTMLMediaElement>}
     */
    this.domMediaEls_ = {};

    /**
     * Counter used to produce unique IDs for media elements.
     * @private {number}
     */
    this.idCounter_ = 0;

    /**
     * Whether the media elements in this MediaPool instance have been "blessed"
     * for unmuted playback without user gesture.
     * @private {boolean}
     */
    this.blessed_ = false;

    /** @const {!Object<string, (function(): !HTMLMediaElement)>} */
    this.mediaFactory_ = {
      [MediaType.AUDIO]: () => {
        const audioEl = this.win_.document.createElement('audio');
        audioEl.setAttribute('muted', '');
        audioEl.muted = true;
        audioEl.classList.add('i-amphtml-pool-media');
        audioEl.classList.add('i-amphtml-pool-audio');
        return audioEl;
      },
      [MediaType.VIDEO]: () => {
        const videoEl = this.win_.document.createElement('video');
        videoEl.setAttribute('muted', '');
        videoEl.muted = true;
        videoEl.setAttribute('playsinline', '');
        videoEl.classList.add('i-amphtml-pool-media');
        videoEl.classList.add('i-amphtml-pool-video');
        return videoEl;
      },
    };

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
  initializeMediaPool_(maxCounts) {
    this.forEachMediaType_(key => {
      const type = MediaType[key];
      const count = maxCounts[type] || 0;

      if (count <= 0) {
        return;
      }

      const ctor = dev().assert(this.mediaFactory_[type],
          `Factory for media type \`${type}\` unset.`);

      // Cloning nodes is faster than building them.
      // Construct a seed media element as a small optimization.
      const mediaElSeed = ctor.call(this);

      this.allocated[type] = [];
      this.unallocated[type] = [];

      this.vsync_.mutate(() => {
        // Reverse-looping is generally faster and Closure would usually make
        // this optimization automatically. However, it skips it due to a
        // comparison with the itervar below, so we have to roll it by hand.
        for (let i = count; i > 0; i--) {
          const mediaEl = /** @type {!HTMLMediaElement} */
              // Use seed element at end of set to prevent wasting it.
              (i == 1 ? mediaElSeed : mediaElSeed.cloneNode(/* deep */ true));
          const sources = this.getDefaultSource_(type);
          this.bubbleEvents_(mediaEl);
          mediaEl.setAttribute('pool-element', elId++);
          this.enqueueMediaElementTask_(mediaEl,
              new UpdateSourcesTask(sources, this.vsync_));
          // TODO(newmuis): Check the 'error' field to see if MEDIA_ERR_DECODE
          // is returned.  If so, we should adjust the pool size/distribution
          // between media types.
          this.unallocated[type].push(mediaEl);
        }
      });
    });
  }

  /**
   * @param {!HTMLMediaElement} mediaEl
   * @private
   */
  bubbleEvents_(mediaEl) {
    // TODO(alanorozco): Keep track of unlisteners for disposal.
    const onNonBubblingEvent = this.onNonBubblingEvent_.bind(this, mediaEl);
    NON_BUBBLING_EVENTS.forEach(type =>
      listen(mediaEl, type, onNonBubblingEvent.bind(this, type)));
  }

  /**
   * @param {!HTMLMediaElement} mediaEl
   * @param {string} type
   * @param {!Event} event
   * @private
   */
  onNonBubblingEvent_(mediaEl, type, event) {
    if (event.bubbles) {
      // In case of platform differences.
      return;
    }
    const {parentNode} = mediaEl;
    if (!parentNode) {
      // Detached, can't bubble.
      return;
    }
    if (type == 'volumechange') {
      const {muted} = mediaEl;
      this.bubbleEvent_(mediaEl, type, event, /* detail */ {muted});
      return;
    }
    this.bubbleEvent_(mediaEl, type, event);
  }

  /**
   * @param {!HTMLMediaElement} mediaEl
   * @param {string} type
   * @param {!Event} sourceEvent
   * @param {?Object=} detail
   * @private
   */
  bubbleEvent_(mediaEl, type, sourceEvent, detail = null) {
    const {parentNode} = mediaEl;
    const composedDetail = Object.assign({}, sourceEvent, detail || undefined);
    const event =
        createCustomEvent(this.win_, type, composedDetail, {bubbles: true});
    parentNode.dispatchEvent(event);
  }

  /**
   * @param {!MediaType} mediaType The media type whose source should be
   *     retrieved.
   * @return {!Sources} The default source for the specified type of media.
   */
  getDefaultSource_(mediaType) {
    switch (mediaType) {
      case MediaType.AUDIO:
        return new Sources(BLANK_AUDIO_SRC);
      case MediaType.VIDEO:
        return new Sources(BLANK_VIDEO_SRC);
      default:
        dev().error('AMP-STORY', `No default media for type ${mediaType}.`);
        return new Sources();
    }
  }


  /**
   * Comparison function that compares the distance of each element from the
   * current position in the document.
   * @param {!HTMLMediaElement} mediaA The first element to compare.
   * @param {!HTMLMediaElement} mediaB The second element to compare.
   * @private
   */
  compareMediaDistances_(mediaA, mediaB) {
    const distanceA = this.distanceFn_(mediaA);
    const distanceB = this.distanceFn_(mediaB);
    return distanceA < distanceB ? -1 : 1;
  }


  /**
   * @return {string} A unique ID.
   * @private
   */
  createDomMediaElementId_() {
    return DOM_MEDIA_ELEMENT_ID_PREFIX + this.idCounter_++;
  }

  /**
   * Gets the media type from a given element.
   * @param {!HTMLMediaElement} mediaElement The element whose media type should
   *     be retrieved.
   * @return {!MediaType}
   * @private
   */
  getMediaType_(mediaElement) {
    const tagName = mediaElement.tagName.toLowerCase();
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
   * @return {?HTMLMediaElement} The reserved element, if one exists.
   * @private
   */
  reserveUnallocatedMediaElement_(mediaType) {
    return this.unallocated[mediaType].pop();
  }


  /**
   * Retrieves the media element from the pool that matches the specified
   * element, if one exists.
   * @param {!MediaType} mediaType The type of media element to get.
   * @param {!HTMLMediaElement} domMediaEl The element whose matching media
   *     element should be retrieved.
   * @return {?HTMLMediaElement} The media element in the pool that represents
   *     the specified media element
   */
  getMatchingMediaElementFromPool_(mediaType, domMediaEl) {
    if (this.isAllocatedMediaElement_(mediaType, domMediaEl)) {
      return domMediaEl;
    }

    const allocatedEls = this.allocated[mediaType];
    const index = findIndex(allocatedEls, poolMediaEl => {
      return poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] === domMediaEl.id;
    });

    return allocatedEls[index];
  }


  /**
   * Allocates the specified media element of the specified type.
   * @param {!MediaType} mediaType The type of media element to allocate.
   * @param {!HTMLMediaElement} poolMediaEl The element to be allocated.
   * @private
   */
  allocateMediaElement_(mediaType, poolMediaEl) {
    this.allocated[mediaType].push(poolMediaEl);

    const unallocatedEls = this.unallocated[mediaType];
    const indexToRemove = unallocatedEls.indexOf(poolMediaEl);

    if (indexToRemove >= 0) {
      unallocatedEls.splice(indexToRemove, 1);
    }
  }


  /**
   * Deallocates and returns the media element of the specified type furthest
   * from the current position in the document.
   * @param {!MediaType} mediaType The type of media element to deallocate.
   * @param {!HTMLMediaElement=} opt_elToAllocate If specified, the element that
   *     is trying to be allocated, such that another element must be evicted.
   * @return {?HTMLMediaElement} The deallocated element, if one exists.
   * @private
   */
  deallocateMediaElement_(mediaType, opt_elToAllocate) {
    const allocatedEls = this.allocated[mediaType];

    // Sort the allocated media elements by distance to ensure that we are
    // evicting the media element that is furthest from the current place in the
    // document.
    allocatedEls.sort((a, b) => this.compareMediaDistances_(a, b));

    // Do not deallocate any media elements if the element being loaded or
    // played is further than the farthest allocated element.
    if (opt_elToAllocate) {
      const furthestEl = allocatedEls[allocatedEls.length - 1];
      if (!furthestEl ||
          this.distanceFn_(furthestEl) < this.distanceFn_(opt_elToAllocate)) {
        return null;
      }
    }

    // De-allocate a media element.
    const poolMediaEl = allocatedEls.pop();

    this.unallocated[mediaType].push(poolMediaEl);

    this.triggerAllocationEvent_(poolMediaEl, /* isAllocated */ false);

    return poolMediaEl;
  }


  /**
   * Forcibly deallocates a specific media element, regardless of its distance
   * from the current position in the document.
   * @param {!HTMLMediaElement} poolMediaEl The element to be deallocated.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has been successfully deallocated.
   */
  forceDeallocateMediaElement_(poolMediaEl) {
    const mediaType = this.getMediaType_(poolMediaEl);
    const allocatedEls = this.allocated[mediaType];
    const removeFromDom = isConnectedNode(poolMediaEl) ?
      this.swapPoolMediaElementOutOfDom_(poolMediaEl) : Promise.resolve();

    return removeFromDom.then(() => {
      const index = allocatedEls.indexOf(poolMediaEl);
      dev().assert(index >= 0, 'Cannot deallocate unallocated media element.');
      allocatedEls.splice(index, 1);
      this.unallocated[mediaType].push(poolMediaEl);
    });
  }


  /**
   * Evicts an element of the specified type, replaces it in the DOM with the
   * original media element, and returns it.
   * @param {!MediaType} mediaType The type of media element to evict.
   * @param {!HTMLMediaElement=} opt_elToAllocate If specified, the element that
   *     is trying to be allocated, such that another element must be evicted.
   * @return {?HTMLMediaElement} A media element of the specified type.
   * @private
   */
  evictMediaElement_(mediaType, opt_elToAllocate) {
    const poolMediaEl =
        this.deallocateMediaElement_(mediaType, opt_elToAllocate);
    if (!poolMediaEl) {
      return null;
    }

    this.swapPoolMediaElementOutOfDom_(poolMediaEl);
    return poolMediaEl;
  }


  /**
   * @param {!MediaType} mediaType The media type to check.
   * @param {!HTMLMediaElement} el The element to check.
   * @return {boolean} true, if the specified element has already been allocated
   *     as the specified type of media element.
   * @private
   */
  isAllocatedMediaElement_(mediaType, el) {
    return this.allocated[mediaType].indexOf(el) >= 0;
  }


  /**
   * Replaces a media element that was originally in the DOM with a media
   * element from the pool.
   * @param {!HTMLMediaElement} domMediaEl The media element originating from
   *     the DOM.
   * @param {!HTMLMediaElement} poolMediaEl The media element originating from
   *     the pool.
   * @param {!Sources} sources The sources for the media element.
   * @return {!Promise} A promise that is resolved when the media element has
   *     been successfully swapped into the DOM.
   * @private
   */
  swapPoolMediaElementIntoDom_(domMediaEl, poolMediaEl, sources) {
    poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] = domMediaEl.id;

    return this.enqueueMediaElementTask_(poolMediaEl,
        new SwapIntoDomTask(domMediaEl, this.vsync_))
        .then(() => {
          this.enqueueMediaElementTask_(poolMediaEl,
              new UpdateSourcesTask(sources, this.vsync_));
          this.enqueueMediaElementTask_(poolMediaEl, new LoadTask());

          this.triggerAllocationEvent_(poolMediaEl, /* isAllocated */ true);
        }, () => {
          this.forceDeallocateMediaElement_(poolMediaEl);
        });
  }

  /**
   * @param {!Element} element
   * @param {boolean} isAllocated
   */
  triggerAllocationEvent_(element, isAllocated) {
    const win = this.win_;
    const {parentNode} = element;
    const type = isAllocated ?
        MediaPoolEvents.ALLOCATED :
        MediaPoolEvents.DEALLOCATED;

    const detailOptional = !isAllocated ?
        this.getDeallocationDetail_(element) :
        null;

    const event = createCustomEvent(win, type, detailOptional, {bubbles: true});

    dev().assertElement(parentNode).dispatchEvent(event);
  }

  /**
   * Gets a snapshot of the video state on deallocation time. This is so that
   * the media pool consumer can know details of the video without access to the
   * element itself.
   * @return {!MediaInfoDef}
   */
  getDeallocationDetail_(element) {
    const {currentTime, duration, paused} = element;
    return {currentTime, duration, paused: true};
  }

  /**
   * @param {!HTMLMediaElement} poolMediaEl The element whose source should be
   *     reset.
   * @return {!Promise} A promise that is resolved when the pool media element
   *     has been reset.
   */
  resetPoolMediaElementSource_(poolMediaEl) {
    const mediaType = this.getMediaType_(poolMediaEl);
    const defaultSources = this.getDefaultSource_(mediaType);

    return this.enqueueMediaElementTask_(poolMediaEl,
        new UpdateSourcesTask(defaultSources, this.vsync_));
  }


  /**
   * Removes a pool media element from the DOM and replaces it with the video
   * that it originally replaced.
   * @param {!HTMLMediaElement} poolMediaEl The pool media element to remove
   *     from the DOM.
   * @return {!Promise} A promise that is resolved when the media element has
   *     been successfully swapped out of the DOM.
   * @private
   */
  swapPoolMediaElementOutOfDom_(poolMediaEl) {
    const oldDomMediaElId = poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME];
    const oldDomMediaEl = /** @type {!HTMLMediaElement} */ (dev().assertElement(
        this.domMediaEls_[oldDomMediaElId],
        'No media element to put back into DOM after eviction.'));

    const swapOutOfDom = this.enqueueMediaElementTask_(poolMediaEl,
        new SwapOutOfDomTask(oldDomMediaEl, this.vsync_))
        .then(() => {
          poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] = null;
        });

    this.resetPoolMediaElementSource_(poolMediaEl);
    return swapOutOfDom;
  }

  /**
   * @param {function(string)} callbackFn
   * @private
   */
  forEachMediaType_(callbackFn) {
    Object.keys(MediaType).forEach(callbackFn.bind(this));
  }

  /**
   * Invokes a function for all media managed by the media pool.
   * @param {function(!HTMLMediaElement)} callbackFn The function to be
   *     invoked.
   * @private
   */
  forEachMediaElement_(callbackFn) {
    [this.allocated, this.unallocated].forEach(mediaSet => {
      this.forEachMediaType_(key => {
        const type = MediaType[key];
        const els = mediaSet[type];
        if (!els) {
          return;
        }
        els.forEach(callbackFn.bind(this));
      });
    });
  }


  /**
   * Preloads the content of the specified media element in the DOM and returns
   * a media element that can be used in its stead for playback.
   * @param {!HTMLMediaElement} domMediaEl The media element, found in the DOM,
   *     whose content should be loaded.
   * @return {Promise<!HTMLMediaElement>} A media element from the pool that can be used
   *     to replace the specified element.
   */
  loadInternal_(domMediaEl) {
    if (!isConnectedNode(domMediaEl)) {
      // Don't handle nodes that aren't even in the document.
      return Promise.resolve();
    }

    const mediaType = this.getMediaType_(domMediaEl);
    const existingPoolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);
    if (existingPoolMediaEl) {
      // The element being loaded already has an allocated media element.
      return Promise.resolve(existingPoolMediaEl);
    }

    const sources = this.sources_[domMediaEl.id];
    dev().assert(sources instanceof Sources,
        'Cannot play unregistered element.');

    const poolMediaEl = this.reserveUnallocatedMediaElement_(mediaType) ||
        this.evictMediaElement_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      // If there is no space in the pool to allocate a new element, and no
      // element can be evicted, do not return any element.
      return Promise.resolve();
    }

    this.allocateMediaElement_(mediaType, poolMediaEl);

    return this.swapPoolMediaElementIntoDom_(domMediaEl, poolMediaEl, sources)
        .then(() => poolMediaEl);
  }


  /**
   * "Blesses" the specified media element for future playback without a user
   * gesture.  In order for this to bless the media element, this function must
   * be invoked in response to a user gesture.
   * @param {!HTMLMediaElement} poolMediaEl The media element to bless.
   * @return {!Promise} A promise that is resolved when blessing the media
   *     element is complete.
   */
  bless_(poolMediaEl) {
    if (poolMediaEl[ELEMENT_BLESSED_PROPERTY_NAME]) {
      return Promise.resolve();
    }

    return this.enqueueMediaElementTask_(poolMediaEl, new BlessTask());
  }


  /**
   * Registers the specified element to be usable by the media pool.  Elements
   * should be registered as early as possible, in order to prevent them from
   * being played while not managed by the media pool.  If the media element is
   * already registered, this is a no-op.  Registering elements from within the
   * pool is not allowed, and will also be a no-op.
   * @param {!HTMLMediaElement} domMediaEl The media element to be registered.
   * @return {!Promise} A promise that is resolved when the element has been
   *     successfully registered, or rejected otherwise.
   */
  register(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    if (this.isAllocatedMediaElement_(mediaType, domMediaEl)) {
      // This media element originated from the media pool.
      return Promise.resolve();
    }

    const id = domMediaEl.id || this.createDomMediaElementId_();
    if (this.sources_[id] && this.domMediaEls_[id]) {
      // This media element is already registered.
      return Promise.resolve();
    }

    // This media element has not yet been registered.
    domMediaEl.id = id;
    const sources = Sources.removeFrom(domMediaEl);
    this.sources_[id] = sources;
    this.domMediaEls_[id] = domMediaEl;

    domMediaEl.muted = true;
    domMediaEl.setAttribute('muted', '');
    domMediaEl.pause();

    return Promise.resolve();
  }


  /**
   * Preloads the content of the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element, found in the DOM,
   *     whose content should be loaded.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has successfully started preloading.
   */
  preload(domMediaEl) {
    // Empty then() invocation hides the value yielded by the loadInternal_
    // promise, so that we do not leak the pool media element outside of the
    // scope of the media pool.
    return this.loadInternal_(domMediaEl).then();
  }


  /**
   * Plays the specified media element in the DOM by replacing it with a media
   * element from the pool and playing that.
   * @param {!HTMLMediaElement} domMediaEl The media element to be played.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has been successfully played.
   */
  play(domMediaEl) {
    return this.loadInternal_(domMediaEl)
        .then(poolMediaEl => {
          if (!poolMediaEl) {
            return Promise.resolve();
          }

          return this.enqueueMediaElementTask_(poolMediaEl, new PlayTask());
        });
  }


  /**
   * Pauses the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element to be paused.
   * @param {boolean=} rewindToBeginning Whether to rewind the currentTime
   *     of media items to the beginning.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has been successfully paused.
   */
  pause(domMediaEl, rewindToBeginning = false) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return Promise.resolve();
    }

    return this.enqueueMediaElementTask_(poolMediaEl, new PauseTask())
        .then(() => {
          if (rewindToBeginning) {
            this.enqueueMediaElementTask_(
                /** @type {!HTMLMediaElement} */ (poolMediaEl),
                new RewindTask());
          }
        });
  }

  /**
   * Pauses the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element to be paused.
   * @param {boolean=} rewindToBeginning Whether to rewind the currentTime
   *     of media items to the beginning.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has been successfully paused.
   */
  pause(domMediaEl, rewindToBeginning = false) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return Promise.resolve();
    }

    return this.enqueueMediaElementTask_(poolMediaEl, new PauseTask())
        .then(() => {
          if (rewindToBeginning) {
            this.enqueueMediaElementTask_(
                /** @type {!HTMLMediaElement} */ (poolMediaEl),
                new RewindTask());
          }
        });
  }


  /**
   * Rewinds a specified media element in the DOM to 0.
   * @param {!HTMLMediaElement} domMediaEl The media element to be rewound.
   * @return {!Promise} A promise that is resolved when the
   *     specified media element has been successfully rewound.
   */
  rewindToBeginning(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return Promise.resolve();
    }

    return this.enqueueMediaElementTask_(poolMediaEl, new RewindTask());
  }


  /**
   * Mutes the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element to be muted.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has been successfully muted.
   */
  mute(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return Promise.resolve();
    }

    return this.enqueueMediaElementTask_(poolMediaEl, new MuteTask());
  }


  /**
   * Unmutes the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element to be unmuted.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has been successfully paused.
   */
  unmute(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return Promise.resolve();
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
  blessAll() {
    if (this.blessed_) {
      return Promise.resolve();
    }

    const blessPromises = [];
    this.forEachMediaElement_(mediaEl => {
      blessPromises.push(this.bless_(mediaEl));
    });

    return Promise.all(blessPromises)
        .then(() => {
          this.blessed_ = true;
        }).catch(reason => {
          dev().expectedError('AMP-STORY', 'Blessing all media failed: ',
              reason);
        });
  }


  /**
   * @param {!HTMLMediaElement} mediaEl The element whose task queue should be
   *     executed.
   * @private
   */
  executeNextMediaElementTask_(mediaEl) {
    const queue = mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME];
    if (queue.length === 0) {
      return;
    }

    const task = queue[0];

    const executionFn = () => {
      task.execute(mediaEl)
          .catch(reason => dev().error('AMP-STORY', reason))
          .then(() => {
            // Run regardless of success or failure of task execution.
            queue.shift();
            this.executeNextMediaElementTask_(mediaEl);
          });
    };

    if (task.requiresSynchronousExecution()) {
      executionFn.call(this);
    } else {
      this.timer_.delay(executionFn.bind(this), 0);
    }
  }


  /**
   * @param {!HTMLMediaElement} mediaEl The element for which the specified task
   *     should be executed.
   * @param {!./media-tasks.MediaTask} task The task to be executed.
   * @return {!Promise} A promise that is resolved when the specified task is
   *     completed.
   * @private
   */
  enqueueMediaElementTask_(mediaEl, task) {
    if (!mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME]) {
      mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME] = [];
    }

    const queue = mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME];
    const isQueueRunning = queue.length !== 0;

    queue.push(task);

    if (!isQueueRunning) {
      this.executeNextMediaElementTask_(mediaEl);
    }

    return task.whenComplete();
  }


  /**
   * @param {!HTMLMediaElement} mediaEl
   * @param {string} property
   * @return T
   * @template T
   */
  getMediaInfo(mediaEl, property) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    dev().assert(poolMediaEl);

    switch(property) {
      case 'currentTime': return poolMediaEl.currentTime;
      case 'duration': return poolMediaEl.duration;
      case 'paused': return poolMediaEl.paused;
      case 'playedRanges': return VideoUtils.getPlayedRanges(poolMediaEl);
    }

    dev().error('MEDIA-POOL', 'Unknown media info property', property);
  }


  /**
   * @param {!MediaPoolRoot} root
   * @return {!MediaPool}
   */
  static for(root) {
    const element = root.getElement();
    const existingId = element[POOL_MEDIA_ELEMENT_PROPERTY_NAME];
    const hasInstanceAllocated = existingId && instances[existingId];

    if (hasInstanceAllocated) {
      return instances[existingId];
    }

    const newId = String(nextInstanceId++);
    element[POOL_MEDIA_ELEMENT_PROPERTY_NAME] = newId;
    instances[newId] = new MediaPool(
        toWin(root.getElement().ownerDocument.defaultView),
        root.getMaxMediaElementCounts(),
        element => root.getElementDistance(element));

    return instances[newId];
  }
}


export class MediaPoolService {
  constructor(ampdoc) {
    this.ampdoc_ = ampdoc;
  }

  /**
   * Gets the pool associated with an element. Traverses up the DOM tree to
   * find the pool, otherwise fails.
   * @param {element} element Element that is pool-bound.
   * @return {!MediaPool}
   */
  poolFor(element) {
    const owner = closest(element, el =>
        !!el[POOL_MEDIA_ELEMENT_PROPERTY_NAME]);

    dev().assert(owner, 'Element is not bound by a media-pool');

    return owner[POOL_MEDIA_ELEMENT_PROPERTY_NAME];
  }
}


/**
 * Defines a common interface for elements that contain a MediaPool.
 *
 * @interface
 */
export class MediaPoolRoot {
  /**
   * @return {!Element} The root element of this media pool.
   */
  getElement() {}

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
  getElementDistance(unusedElement) {}


  /**
   * @return {!Object<!MediaType, number>} The maximum amount of each media
   *     type to allow within this element.
   */
  getMaxMediaElementCounts() {}
}

export function installMediaPoolServiceForDoc(nodeOrDoc) {
  registerServiceBuilderForDoc(nodeOrDoc, 'mediapool', MediaPoolService);
}
