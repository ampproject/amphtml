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
  closestBySelector,
  isConnectedNode,
  removeElement,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {dev} from '../../../src/log';
import {findIndex} from '../../../src/utils/array';
import {toWin} from '../../../src/types';
import {BLANK_AUDIO_SRC, BLANK_VIDEO_SRC} from './default-media';
import {listenOncePromise} from '../../../src/event-helper';
import {dispatch} from './events';



/** @const @enum {string} */
export const MediaType = {
  UNSUPPORTED: 'unsupported',
  AUDIO: 'audio',
  VIDEO: 'video',
};


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
const ELEMENT_BLESSED_PROPERTY_NAME = '__AMP_MEDIA_IS_BLESSED__';



/**
 * "Blesses" the specified media element for future playback without a user
 * gesture.  In order for this to bless the media element, this function must
 * be invoked in response to a user gesture.
 * @param {!HTMLMediaElement} mediaEl The media element to bless.
 * @return {!Promise} A promise that is resolved when blessing the media
 *     element is complete.
 */
function blessMediaElement(mediaEl) {
  console.log('blessing element', mediaEl);
  const isPaused = mediaEl.paused;
  const isMuted = mediaEl.muted;
  const currentTime = mediaEl.currentTime;

  console.log('media to be played for blessing', mediaEl.outerHTML);
  const playResult = mediaEl.play();
  console.log('media has been played for blessing', mediaEl.outerHTML, playResult);

  return Promise.resolve(playResult).then(() => {
    console.log('inner bless', mediaEl);
    mediaEl.muted = false;

    if (isPaused) {
      mediaEl.pause();
      mediaEl.currentTime = currentTime;
    }

    if (isMuted) {
      mediaEl.muted = true;
    }

    mediaEl[ELEMENT_BLESSED_PROPERTY_NAME] = true;
  }).catch(reason => {
    console.log('bless failed', mediaEl);
    dev().expectedError('AMP-STORY', 'Blessing media element failed:',
        reason, mediaEl);
  }).then(() => {
    console.log('dispatch bless', mediaEl);
    dispatch(mediaEl, 'bless', false);
  });
}


/**
 * @const {string}
 */
const REPLACED_MEDIA_ATTRIBUTE = 'replaced-media';


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


/** @const @enum {string} */
export const ElementTaskName = {
  BLESS: 'bless',
  LOAD: 'load',
  MUTE: 'mute',
  PAUSE: 'pause',
  PLAY: 'play',
  REWIND: 'rewind',
  UNMUTE: 'unmute',
  UPDATE_SRC: 'updatesrc',
};


/**
 * @const {!Object<string, !ElementTaskDef>}
 */
const ELEMENT_TASKS = {
  [ElementTaskName.BLESS]: el => blessMediaElement(el),
  [ElementTaskName.LOAD]: el => Promise.resolve(el.load()),
  [ElementTaskName.MUTE]: el => Promise.resolve(() => {
    el.muted = true;
    el.setAttribute('muted', '');
  }),
  [ElementTaskName.PAUSE]: el => Promise.resolve(el.pause()),
  [ElementTaskName.PLAY]: el => {
    if (!el.paused) {
      // We do not want to invoke play() if the media element is already
      // playing, as this can interrupt playback in some browsers.
      return Promise.resolve();
    }

    // The play() invocation is wrapped in a Promise.resolve(...) due to the
    // fact that some browsers return a promise from media elements' play()
    // function, while others return a boolean.
    return Promise.resolve(el.play());
  },
  [ElementTaskName.REWIND]: el => Promise.resolve(() => {
    el.currentTime = 0;
  }),
  [ElementTaskName.UNMUTE]: el => Promise.resolve(() => {
    el.muted = false;
    el.removeAttribute('muted');
  }),
  [ElementTaskName.UPDATE_SRC]: (el, sources) => {
    // TODO(newmuis): vsync.runPromise
    return Promise.resolve(sources.applyToElement(el));
  },
};


/**
 * @const {!ElementTaskDef}
 */
const NOOP_ELEMENT_TASK = () => Promise.resolve();


/**
 * @const {!Array<string>}
 */
const PROTECTED_CSS_CLASS_NAMES = [
  'i-amphtml-pool-media',
  'i-amphtml-pool-audio',
  'i-amphtml-pool-video',
];


/**
 * @const {!Array<string>}
 */
const PROTECTED_ATTRIBUTES = [
  'id',
  'src',
  'class',
  'autoplay',
  REPLACED_MEDIA_ATTRIBUTE,
];


/**
 * Finds an amp-video/amp-audio ancestor.
 * @param {!Element} el
 * @return {?AmpElement}
 */
function ampMediaElementFor(el) {
  return closestBySelector(el, 'amp-video, amp-audio');
}


/**
 * @param {!HTMLMediaElement} mediaEl The element whose task queue should be
 *     executed.
 */
function executeNextMediaElementTask(mediaEl) {
  const queue = mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME];
  if (queue.length === 0) {
    return;
  }

  const task = queue[0];

  task.call()
      .catch(reason => dev().error('AMP-STORY', reason))
      .then(() => {
        const oldTaskName = queue.shift();
        console.log('dequeue ' + oldTaskName, mediaEl);
        console.log('element task queue contains ' + JSON.stringify(queue), mediaEl);
        executeNextMediaElementTask(mediaEl);
      });
}


/**
 * @param {!HTMLMediaElement} mediaEl The element for which the specified task
 *     should be executed.
 * @param {!ElementTaskName} taskName The name of the task to execute.
 * @param {*=} opt_state An object holding state to be read by the task.
 */
function enqueueMediaElementTask(mediaEl, taskName, opt_state) {
  if (!mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME]) {
    mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME] = [];
  }

  const queue = mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME];
  const state = opt_state || {};
  const task = ELEMENT_TASKS[taskName] || NOOP_ELEMENT_TASK;
  const boundTask = task.bind(this, mediaEl, state);

  queue.push(boundTask);
  console.log('enqueue ' + taskName, mediaEl);
  console.log('element task queue contains ' + JSON.stringify(queue), mediaEl);

  if (queue.length === 1) {
    executeNextMediaElementTask(mediaEl);
  }
}


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
      this.allocated[type] = [];
      this.unallocated[type] = [];
      for (let i = 0; i < count; i++) {
        const mediaEl = this.mediaFactory_[type].call(this);
        mediaEl.setAttribute('pool-element', elId++);
        mediaEl.src = this.getDefaultSource_(type, mediaEl);
        // TODO(newmuis): Check the 'error' field to see if MEDIA_ERR_DECODE is
        // returned.  If so, we should adjust the pool size/distribution between
        // media types.
        this.unallocated[type].push(mediaEl);
      }
    });
  }


  /**
   * @param {!MediaType} mediaType The media type whose source should be
   *     retrieved.
   * @return {string} The default source for the specified type of media.
   */
  getDefaultSource_(mediaType) {
    switch (mediaType) {
      case MediaType.AUDIO:
        return BLANK_AUDIO_SRC;
      case MediaType.VIDEO:
        return BLANK_VIDEO_SRC;
      default:
        dev().error('AMP-STORY', `No default media for type ${mediaType}.`);
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
      return poolMediaEl.getAttribute(REPLACED_MEDIA_ATTRIBUTE) ===
          domMediaEl.id;
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
    return allocatedEls.pop();
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
   * Determines whether a CSS class name is allowed to be removed or copied from
   * media elements.
   * @param {string} cssClassName The CSS class name name to check.
   * @return {boolean} true, if the specified CSS class name is allowed to be
   *     removed or copied from media elements; false otherwise.
   * @private
   */
  isProtectedCssClassName_(cssClassName) {
    return PROTECTED_CSS_CLASS_NAMES.indexOf(cssClassName) >= 0;
  }


  /**
   * Determines whether an attribute is allowed to be removed or copied from
   * media elements.
   * @param {string} attributeName The attribute name to check.
   * @return {boolean} true, if the specified attribute is allowed to be removed
   *     or copied from media elements; false otherwise.
   * @private
   */
  isProtectedAttributeName_(attributeName) {
    return PROTECTED_ATTRIBUTES.indexOf(attributeName) >= 0;
  }


  /**
   * Replaces a media element that was originally in the DOM with a media
   * element from the pool.
   * @param {!HTMLMediaElement} domMediaEl The media element originating from
   *     the DOM.
   * @param {!HTMLMediaElement} poolMediaEl The media element originating from
   *     the pool.
   * @param {!Sources} sources The sources for the media element.
   * @private
   */
  swapPoolMediaElementIntoDom_(domMediaEl, poolMediaEl, sources) {
    const ampMediaForPoolEl = ampMediaElementFor(poolMediaEl);
    const ampMediaForDomEl = ampMediaElementFor(domMediaEl);

    this.copyCssClasses_(domMediaEl, poolMediaEl);
    this.copyAttributes_(domMediaEl, poolMediaEl);
    enqueueMediaElementTask(poolMediaEl, ElementTaskName.UPDATE_SRC, sources);
    enqueueMediaElementTask(poolMediaEl, ElementTaskName.LOAD);
    poolMediaEl.setAttribute(REPLACED_MEDIA_ATTRIBUTE, domMediaEl.id);
    domMediaEl.parentElement.replaceChild(poolMediaEl, domMediaEl);

    this.maybeResetAmpMedia_(ampMediaForPoolEl);
    this.maybeResetAmpMedia_(ampMediaForDomEl);
  }


  /**
   * @param {?Element} componentEl
   * @private
   */
  maybeResetAmpMedia_(componentEl) {
    if (!componentEl) {
      return;
    }

    if (componentEl.tagName.toLowerCase() == 'amp-audio') {
      // TODO(alanorozco): Implement reset for amp-audio
      return;
    }

    componentEl.getImpl().then(impl => impl.resetOnDomChange());
  }


  /**
   * @param {!HTMLMediaElement} poolMediaEl The element whose source should be
   *     reset.
   */
  resetPoolMediaElementSource_(poolMediaEl) {
    console.log('resetting source for element', poolMediaEl);
    const mediaType = this.getMediaType_(poolMediaEl);
    Sources.removeFrom(poolMediaEl);
    poolMediaEl.src = this.getDefaultSource_(mediaType);
  }


  /**
   * Removes a pool media element from the DOM and replaces it with the video
   * that it originally replaced.
   * @param {!HTMLMediaElement} poolMediaEl The pool media element to remove
   *     from the DOM.
   * @private
   */
  swapPoolMediaElementOutOfDom_(poolMediaEl) {
    const oldDomMediaElId = poolMediaEl.getAttribute(REPLACED_MEDIA_ATTRIBUTE);
    const oldDomMediaEl = /** @type {!HTMLMediaElement} */ (dev().assertElement(
        this.domMediaEls_[oldDomMediaElId],
        'No media element to put back into DOM after eviction.'));
    this.copyCssClasses_(poolMediaEl, oldDomMediaEl);
    this.copyAttributes_(poolMediaEl, oldDomMediaEl);
    poolMediaEl.parentElement.replaceChild(oldDomMediaEl, poolMediaEl);
    poolMediaEl.removeAttribute(REPLACED_MEDIA_ATTRIBUTE);
    this.resetPoolMediaElementSource_(poolMediaEl);
  }


  /**
   * Copies all unprotected CSS classes from fromEl to toEl.
   * @param {!HTMLMediaElement} fromEl The element from which CSS classes should
   *     be copied.
   * @param {!HTMLMediaElement} toEl The element to which CSS classes should be
   *     copied.
   * @private
   */
  copyCssClasses_(fromEl, toEl) {
    // Remove all of the unprotected CSS classes from the toEl.
    for (let i = toEl.classList.length - 1; i >= 0; i--) {
      const cssClass = toEl.classList.item(i);
      if (!this.isProtectedCssClassName_(cssClass)) {
        toEl.classList.remove(cssClass);
      }
    }

    // Copy all of the unprotected CSS classes from the fromEl to the toEl.
    for (let i = 0; i < fromEl.classList.length; i++) {
      const cssClass = fromEl.classList.item(i);
      if (!this.isProtectedCssClassName_(cssClass)) {
        toEl.classList.add(cssClass);
      }
    }
  }


  /**
   * Copies all unprotected attributes from fromEl to toEl.
   * @param {!HTMLMediaElement} fromEl The element from which attributes should
   *     be copied.
   * @param {!HTMLMediaElement} toEl The element to which attributes should be
   *     copied.
   * @private
   */
  copyAttributes_(fromEl, toEl) {
    const fromAttributes = fromEl.attributes;
    const toAttributes = toEl.attributes;

    // Remove all of the unprotected attributes from the toEl.
    for (let i = toAttributes.length - 1; i >= 0; i--) {
      const attributeName = toAttributes[i].name;
      if (!this.isProtectedAttributeName_(attributeName)) {
        toEl.removeAttribute(attributeName);
      }
    }

    // Copy all of the unprotected attributes from the fromEl to the toEl.
    for (let i = 0; i < fromAttributes.length; i++) {
      const attributeName = fromAttributes[i].name;
      const attributeValue = fromAttributes[i].value;
      if (!this.isProtectedAttributeName_(attributeName)) {
        toEl.setAttribute(attributeName, attributeValue);
      }
    }
  }

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
    this.forEachMediaType_(key => {
      const type = MediaType[key];
      const allocatedEls = this.allocated[type];
      allocatedEls.forEach(callbackFn.bind(this));
    });

    this.forEachMediaType_(key => {
      const type = MediaType[key];
      const unallocatedEls = this.unallocated[type];
      unallocatedEls.forEach(callbackFn.bind(this));
    });
  }


  /**
   * Preloads the content of the specified media element in the DOM and returns
   * a media element that can be used in its stead for playback.
   * @param {!HTMLMediaElement} domMediaEl The media element, found in the DOM,
   *     whose content should be loaded.
   * @return {?HTMLMediaElement} A media element from the pool that can be used
   *     to replace the specified element.
   */
  loadInternal_(domMediaEl) {
    if (!isConnectedNode(domMediaEl)) {
      // Don't handle nodes that aren't even in the document.
      return null;
    }

    const mediaType = this.getMediaType_(domMediaEl);
    if (this.getMatchingMediaElementFromPool_(mediaType, domMediaEl)) {
      // The element being loaded is already an allocated media element.
      return domMediaEl;
    }

    const sources = this.sources_[domMediaEl.id];
    dev().assert(sources instanceof Sources,
        'Cannot play unregistered element.');

    const poolMediaEl = this.reserveUnallocatedMediaElement_(mediaType) ||
        this.evictMediaElement_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      // If there is no space in the pool to allocate a new element, and no
      // element can be evicted, do not return any element.
      return null;
    }

    this.swapPoolMediaElementIntoDom_(domMediaEl, poolMediaEl, sources);
    this.allocateMediaElement_(mediaType, poolMediaEl);
    return poolMediaEl;
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

    const blessPromise = listenOncePromise(poolMediaEl, ElementTaskName.BLESS, {
      capture: true,
    }).then(() => console.log('bless complete for', poolMediaEl));

    enqueueMediaElementTask(poolMediaEl, ElementTaskName.BLESS);

    return blessPromise;
  }


  /**
   * Registers the specified element to be usable by the media pool.  Elements
   * should be registered as early as possible, in order to prevent them from
   * being played while not managed by the media pool.  If the media element is
   * already registered, this is a no-op.  Registering elements from within the
   * pool is not allowed, and will also be a no-op.
   * @param {!HTMLMediaElement} domMediaEl The media element to be registered.
   */
  register(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    if (this.isAllocatedMediaElement_(mediaType, domMediaEl)) {
      // This media element originated from the media pool.
      return;
    }

    const id = domMediaEl.id || this.createDomMediaElementId_();
    if (this.sources_[id] && this.domMediaEls_[id]) {
      // This media element is already registered.
      return;
    }

    // This media element has not yet been registered.
    domMediaEl.id = id;
    const sources = Sources.removeFrom(domMediaEl);
    this.sources_[id] = sources;
    this.domMediaEls_[id] = domMediaEl;

    domMediaEl.muted = true;
    domMediaEl.setAttribute('muted', '');
    domMediaEl.pause();
  }


  /**
   * Preloads the content of the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element, found in the DOM,
   *     whose content should be loaded.
   */
  preload(domMediaEl) {
    this.loadInternal_(domMediaEl);
  }


  /**
   * Plays the specified media element in the DOM by replacing it with a media
   * element from the pool and playing that.
   * @param {!HTMLMediaElement} domMediaEl The media element to be played.
   */
  play(domMediaEl) {
    const poolMediaEl = this.loadInternal_(domMediaEl);

    if (!poolMediaEl) {
      return;
    }

    enqueueMediaElementTask(poolMediaEl, ElementTaskName.PLAY);
  }


  /**
   * Pauses the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element to be paused.
   * @param {boolean=} opt_rewindToBeginning Whether to rewind the currentTime
   *     of media items to the beginning.
   */
  pause(domMediaEl, opt_rewindToBeginning) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return;
    }

    enqueueMediaElementTask(poolMediaEl, ElementTaskName.PAUSE);

    if (opt_rewindToBeginning) {
      enqueueMediaElementTask(poolMediaEl, ElementTaskName.REWIND);
    }
  }


  /**
   * Rewinds a specified media element in the DOM to 0.
   * @param {!HTMLMediaElement} domMediaEl The media element to be paused.
   */
  rewindToBeginning(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return;
    }

    enqueueMediaElementTask(poolMediaEl, ElementTaskName.REWIND);
  }


  /**
   * Mutes the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element to be muted.
   */
  mute(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return;
    }

    enqueueMediaElementTask(poolMediaEl, ElementTaskName.MUTE);
  }


  /**
   * Unmutes the specified media element in the DOM.
   * @param {!HTMLMediaElement} domMediaEl The media element to be unmuted.
   */
  unmute(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl =
        this.getMatchingMediaElementFromPool_(mediaType, domMediaEl);

    if (!poolMediaEl) {
      return;
    }

    enqueueMediaElementTask(poolMediaEl, ElementTaskName.UNMUTE);
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
          console.log('all blessed');
          this.blessed_ = true;
        }).catch(reason => {
          dev().expectedError('AMP-STORY', 'Blessing all media failed: ',
              reason);
        });
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


class Sources {
  /**
   * @param {string} srcAttr The 'src' attribute of the media element.
   * @param {!IArrayLike<!Element>} srcEls Any child <source> tags of the media
   *     element.
   */
  constructor(srcAttr, srcEls) {
    /** @private @const {?string} */
    this.srcAttr_ = srcAttr && srcAttr.length ? srcAttr : null;

    /** @private @const {!IArrayLike<!Element>} */
    this.srcEls_ = srcEls;
  }


  /**
   * Applies the src attribute and source tags to a specified element.
   * @param {!HTMLMediaElement} element The element to adopt the sources
   *     represented by this object.
   */
  applyToElement(element) {
    Sources.removeFrom(element);

    if (!this.srcAttr_) {
      element.removeAttribute('src');
    } else {
      element.setAttribute('src', this.srcAttr_);
    }

    Array.prototype.forEach.call(this.srcEls_,
        srcEl => element.appendChild(srcEl));
  }


  /**
   * Removes and returns the sources from a specified element.
   * @param {!Element} element The element whose sources should be removed and
   *     returned.
   * @return {!Sources} An object representing the sources of the specified
   *     element.
   */
  static removeFrom(element) {
    const elementToUse = ampMediaElementFor(element) || element;
    const srcAttr = elementToUse.getAttribute('src');
    elementToUse.removeAttribute('src');
    const srcEls = scopedQuerySelectorAll(elementToUse, 'source');
    Array.prototype.forEach.call(srcEls, srcEl => removeElement(srcEl));

    return new Sources(srcAttr, srcEls);
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
