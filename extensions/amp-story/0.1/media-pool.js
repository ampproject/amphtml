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

import {closest, removeElement, scopedQuerySelectorAll} from '../../../src/dom';
import {dev} from '../../../src/log';



/** @const @enum {string} */
export const MediaType = {
  UNSUPPORTED: 'unsupported',
  AUDIO: 'audio',
  VIDEO: 'video',
};


/** @const {!Object<string, number>} */
const MAX_COUNT = {
  [MediaType.AUDIO]: 4,
  [MediaType.VIDEO]: 8,
};


/**
 * Represents the distance of an element from the current place in the document.
 * @typedef {function(!HTMLMediaElement): number}
 */
export let ElementDistanceFnDef;


/**
 * @const {string}
 */
const REPLACED_MEDIA_ATTRIBUTE = 'replaced-media';


/**
 * @const {string}
 */
const DOM_MEDIA_ELEMENT_ID_PREFIX = 'i-amphtml-media-';


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
  REPLACED_MEDIA_ATTRIBUTE,
];


export class MediaPool {
  /**
   * @param {!Window} win The window object.
   * @param {!ElementDistanceFnDef} distanceFn A function that, given an
   *     element, returns the distance of that element from the current position
   *     in the document.  The definition of "distance" can be implementation-
   *     dependant, as long as it is consistent between invocations.
   */
  constructor(win, distanceFn) {
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
     * @private @const {!Object<!MediaType, !Array<!HTMLMediaElement>>}
     */
    this.allocated_ = {};

    /**
     * Holds all of the media elements that have not been allocated.
     * @private @const {!Object<!MediaType, !Array<!HTMLMediaElement>>}
     */
    this.unallocated_ = {};

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

    /** @private {number} */
    this.idCounter_ = 0;

    /** @const {!Object<string, (function(): !HTMLMediaElement)>} */
    this.mediaFactory_ = {
      [MediaType.AUDIO]: () => {
        const audioEl = this.win_.document.createElement('audio');
        audioEl.setAttribute('muted', '');
        audioEl.setAttribute('autoplay', '');
        audioEl.classList.add('i-amphtml-pool-media');
        audioEl.classList.add('i-amphtml-pool-audio');
        return audioEl;
      },
      [MediaType.VIDEO]: () => {
        const videoEl = this.win_.document.createElement('video');
        videoEl.setAttribute('muted', '');
        videoEl.setAttribute('autoplay', '');
        videoEl.setAttribute('playsinline', '');
        videoEl.classList.add('i-amphtml-pool-media');
        videoEl.classList.add('i-amphtml-pool-video');
        return videoEl;
      },
    };

    this.initializeMediaPool_();
  }


  /**
   * Fills the media pool by creating the maximum number of media elements for
   * each of the types of media elements.  We need to create these eagerly so
   * that all media elements exist by the time that unmuteAll() is invoked,
   * thereby "blessing" all media elements for playback without user gesture.
   * @private
   */
  initializeMediaPool_() {
    this.forEachMediaType_(key => {
      const type = MediaType[key];
      const maxCount = MAX_COUNT[type] || 0;
      this.allocated_[type] = [];
      this.unallocated_[type] = [];
      for (let i = 0; i < maxCount; i++) {
        const mediaEl = this.mediaFactory_[type].call(this);
        this.unallocated_[type].push(mediaEl);
      }
    });
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
    return this.unallocated_[mediaType].pop();
  }


  /**
   * Allocates the specified media element of the specified type.
   * @param {!MediaType} mediaType The type of media element to allocate.
   * @param {!HTMLMediaElement} poolMediaEl The element to be allocated.
   * @private
   */
  allocateMediaElement_(mediaType, poolMediaEl) {
    this.allocated_[mediaType].push(poolMediaEl);
  }


  /**
   * Deallocates and returns the media element of the specified type furthest
   * from the current position in the document.
   * @param {!MediaType} mediaType The type of media element to deallocate.
   * @return {?HTMLMediaElement} The deallocated element, if one exists.
   * @private
   */
  deallocateMediaElement_(mediaType) {
    const allocatedEls = this.allocated_[mediaType];

    // Sort the allocated media elements by distance to ensure that we are
    // evicting the media element that is furthest from the current place in the
    // document.
    allocatedEls.sort((a, b) => this.compareMediaDistances_(a, b));

    // De-allocate a media element.
    return allocatedEls.pop();
  }


  /**
   * Evicts an element of the specified type, replaces it in the DOM with the
   * original media element, and returns it.
   * @param {!MediaType} mediaType The type of media element to evict.
   * @return {?HTMLMediaElement} A media element of the specified type.
   * @private
   */
  evictMediaElement_(mediaType) {
    const poolMediaEl = this.deallocateMediaElement_(mediaType);
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
    return this.allocated_[mediaType].indexOf(el) >= 0;
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
   * @private
   */
  swapPoolMediaElementIntoDom_(domMediaEl, poolMediaEl) {
    const sources = this.sources_[domMediaEl.id];

    dev().assert(sources instanceof Sources,
        'Cannot play unregistered element.');

    this.copyCssClasses_(domMediaEl, poolMediaEl);
    this.copyAttributes_(domMediaEl, poolMediaEl);
    sources.applyToElement(poolMediaEl);
    poolMediaEl.setAttribute(REPLACED_MEDIA_ATTRIBUTE, domMediaEl.id);
    domMediaEl.parentElement.replaceChild(poolMediaEl, domMediaEl);
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
    const oldDomMediaEl = this.domMediaEls_[oldDomMediaElId];
    poolMediaEl.parentElement.replaceChild(oldDomMediaEl, poolMediaEl);
    poolMediaEl.removeAttribute(REPLACED_MEDIA_ATTRIBUTE);
    Sources.removeFrom(poolMediaEl);
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
   * @param {!function(HTMLMediaElement)} callbackFn The function to be invoked.
   * @private
   */
  forEachMediaElement_(callbackFn) {
    this.forEachMediaType_(key => {
      const type = MediaType[key];
      const allocatedEls = this.allocated_[type];
      allocatedEls.forEach(callbackFn.bind(this));
    });

    this.forEachMediaType_(key => {
      const type = MediaType[key];
      const unallocatedEls = this.unallocated_[type];
      unallocatedEls.forEach(callbackFn.bind(this));
    });
  }


  /**
   * Registers the specified element to be usable by the media pool.  Elements
   * should be registered as early as possible, in order to prevent them from
   * being played while not managed by the media pool.
   * @param {!HTMLMediaElement} domMediaEl The media element to be registered.
   */
  register(domMediaEl) {
    const id = domMediaEl.id || this.createDomMediaElementId_();
    domMediaEl.id = id;

    const sources = Sources.removeFrom(domMediaEl);
    this.sources_[id] = sources;
    this.domMediaEls_[id] = domMediaEl;
  }


  /**
   * Plays the specified media element in the DOM by replacing it with a media
   * element from the pool and playing that.
   * @param {!HTMLMediaElement} domMediaEl The media element to be played.
   */
  play(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    if (this.isAllocatedMediaElement_(mediaType, domMediaEl)) {
      // The element being played is already an allocated media element.  All we
      // need to do is actually play the element.
      domMediaEl.play();
      return;
    }

    const reservedEl = this.reserveUnallocatedMediaElement_(mediaType) ||
        this.evictMediaElement_(mediaType);

    const poolMediaEl = /** @type {!HTMLMediaElement} */ (dev().assertElement(
        reservedEl, `There were no ${mediaType} elements in the pool.`));
    this.swapPoolMediaElementIntoDom_(domMediaEl, poolMediaEl);
    this.allocateMediaElement_(mediaType, poolMediaEl);
    poolMediaEl.play();
  }


  /**
   * Mutes all media elements in the media pool.
   */
  muteAll() {
    this.forEachMediaElement_(mediaEl => {
      mediaEl.muted = true;
    });
  }


  /**
   * Unmutes all media elements in the media pool.
   */
  unmuteAll() {
    this.forEachMediaElement_(mediaEl => {
      mediaEl.muted = false;
    });
  }
}


class Sources {
  /**
   * @param {string} srcAttr The 'src' attribute of the media element.
   * @param {!IArrayLike<!Element>} srcEls Any child <source> tags of the media
   *     element.
   */
  constructor(srcAttr, srcEls) {
    /** @private @const {string} */
    this.srcAttr_ = srcAttr || '';

    /** @private @const {!IArrayLike<!Element>} */
    this.srcEls_ = srcEls;
  }


  /**
   * Applies the src attribute and source tags to a specified element.
   * @param {!Element} element The element to adopt the sources represented by
   *     this object.
   */
  applyToElement(element) {
    Sources.removeFrom(element);
    element.setAttribute('src', this.srcAttr_);
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
    const ampMediaEl = closest(element, el => {
      const tagName = el.tagName.toLowerCase();
      return tagName === 'amp-audio' || tagName === 'amp-video';
    });

    const elementToUse = ampMediaEl || element;
    const srcAttr = elementToUse.getAttribute('src');
    elementToUse.removeAttribute('src');
    const srcEls = scopedQuerySelectorAll(elementToUse, 'source');
    Array.prototype.forEach.call(srcEls, srcEl => removeElement(srcEl));

    return new Sources(srcAttr, srcEls);
  }
}
