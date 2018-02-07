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

import {closestByTag} from '../dom';
import {dev} from '../log';
import {registerServiceBuilder} from '../service';
import {BLANK_AUDIO_SRC, BLANK_VIDEO_SRC} from '../default-media';



/** @const @enum {string} */
export const MediaType = {
  UNSUPPORTED: 'unsupported',
  AUDIO: 'audio',
  VIDEO: 'video',
};


/**
 * @const {string}
 */
const DOM_MEDIA_ELEMENT_ID_PREFIX = 'i-amphtml-media-';


/**
 * @const {string}
 */
const POOL_MEDIA_ELEMENT_PROPERTY_NAME = '__AMP_MEDIA_POOL_ID__';



/** @const {!Object<string, number>} */
const MAX_MEDIA_ELEMENT_COUNTS = {
  [MediaType.AUDIO]: 2,
  [MediaType.VIDEO]: 4,
};


/* @interface */
export class MediaInterface {
  /** @return {string} */
  getMediaId() {}

  /** @return {?HTMLMediaElement} */
  getResource() {}

  /** @return {!HTMLMediaElement} */
  freeResource() {}
}



/**
 * Fixed-size pool of media elements to be used by AMP media components.
 * Resources are deallocated based on a priority function.
 * This only works for media inside <amp-story>. Any element that is not a
 * descendant of <amp-story> will not have a pool.
 */
class MediaPool {
  /**
   * @param {!Window} win The window object.
   * @param {!Object<!MediaType, number>} maxCounts The maximum amount of each
   *     media element that can be allocated by the pool.
   */
  constructor(win, maxCounts) {
    /** @private @const {!Window} */
    this.win_ = win;

    /**
     * Holds all of the media elements that have an element that has been
     * allocated.
     * @const {!Object<!MediaType, !Array<!MediaInterface>>}
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
        audioEl.setAttribute('src', BLANK_AUDIO_SRC);
        audioEl.setAttribute('muted', '');
        audioEl.muted = true;
        audioEl.classList.add('i-amphtml-pool-media');
        audioEl.classList.add('i-amphtml-pool-audio');
        return audioEl;
      },
      [MediaType.VIDEO]: () => {
        const videoEl = this.win_.document.createElement('video');
        videoEl.setAttribute('src', BLANK_VIDEO_SRC);
        videoEl.setAttribute('playsinline', '');
        videoEl.classList.add('i-amphtml-pool-media');
        videoEl.classList.add('i-amphtml-pool-video');
        videoEl.muted = true;
        return videoEl;
      },
    };

    this.initializeMediaPool_(maxCounts);
  }


  /**
   * Calculates the distance value for an element using the pool or requesting
   * to be allocated. Lower result means higher priority.
   * @param {!Element}
   * @return {number}
   * @private
   */
  distance_(element) {
    // TODO(alanorozco): Generalize.
    const ampStoryPage = closestByTag(element, 'amp-story-page');
    if (!ampStoryPage || !ampStoryPage.hasAttribute('distance')) {
      return Infinity;
    }
    return parseInt(ampStoryPage.getAttribute('distance'), 10);
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
    this.forEachMediaType_(type => {
      const count = maxCounts[type] || 0;
      this.allocated[type] = [];
      this.unallocated[type] = [];
      for (let i = 0; i < count; i++) {
        const mediaEl = this.mediaFactory_[type].call(this);
        // TODO(newmuis): Check the 'error' field to see if MEDIA_ERR_DECODE is
        // returned.  If so, we should adjust the pool size/distribution between
        // media types.
        this.unallocated[type].push(mediaEl);
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
  compareElementDistances_(mediaA, mediaB) {
    const distanceA = this.distance_(mediaA);
    const distanceB = this.distance_(mediaB);
    return distanceA < distanceB ? -1 : 1;
  }


  /** @return {string} A unique ID. */
  createMediaId() {
    return DOM_MEDIA_ELEMENT_ID_PREFIX + this.idCounter_++;
  }


  /**
   * Deallocates and returns the media element of the specified type furthest
   * from the current position in the document.
   * @param {!MediaType} mediaType The type of media element to deallocate.
   * @param {!MediaInterface} opt_mediaToAllocate If specified, the element that
   *     is trying to be allocated, such that another element must be evicted.
   * @return {?HTMLMediaElement} The deallocated element, if one exists.
   * @private
   */
  freeResourceFor_(mediaType, mediaToAllocate) {
    const allocatedEls = this.allocated[mediaType];

    // Sort the allocated media elements by distance to ensure that we are
    // evicting the media element that is furthest from the current place in the
    // document.
    allocatedEls.sort((a, b) =>
      this.compareElementDistances_(a.element, b.element));

    // Do not deallocate any media elements if the element being loaded or
    // played is further than the farthest allocated element.
    if (mediaToAllocate) {
      if (allocatedEls.length <= 0) {
        return null;
      }
      const allocatedMedia = allocatedEls[allocatedEls.length - 1];
      if (this.distance_(allocatedMedia.element)
            < this.distance_(mediaToAllocate.element)) {
        console.log('distance with allocated');
        return null;
      }
    }

    // De-allocate a media element.
    const resource = allocatedEls.pop().freeResource();
    resource.id = mediaToAllocate.getMediaId();
    return resource;
  }

  forEachMediaType_(callbackFn) {
    Object.keys(MediaType).forEach(key => callbackFn(MediaType[key]));
  }


  /**
   * Invokes a function for all media managed by the media pool.
   * @param {function(!HTMLMediaElement)} callbackFn The function to be
   *     invoked.
   * @private
   */
  forEachMediaElement_(callbackFn) {
    this.forEachMediaType_(type => {
      const allocatedMedia = this.allocated[type];
      allocatedMedia.forEach(media => callbackFn(media.getResource()));
    });

    this.forEachMediaType_(type => {
      const unallocatedEls = this.unallocated[type];
      unallocatedEls.forEach(el => callbackFn(el));
    });
  }

  /**
   * Preloads the content of the specified media element in the DOM and returns
   * a media element that can be used in its stead for playback.
   * @param {!MediaType} mediaType
   * @param {!MediaInterface} component The media element, found in the DOM,
   *     whose content should be loaded.
   * @return {?HTMLMediaElement} A media element from the pool that can be used
   *     to replace the specified element.
   */
  requestResource(mediaType, component) {
    const poolMediaEl = this.unallocated[mediaType].pop() ||
        this.freeResourceFor_(mediaType, component);

    if (!poolMediaEl) {
      return null;
    }

    this.allocated[mediaType].push(component);

    return poolMediaEl;
  }


  /**
   * "Blesses" the specified media element for future playback without a user
   * gesture.  In order for this to bless the media element, this function must
   * be invoked in response to a user gesture.
   * @param {!HTMLMediaElement} mediaEl The media element to bless.
   * @return {!Promise} A promise that is resolved when blessing the media
   *     element is complete.
   */
  bless_(mediaEl) {
    const isPaused = mediaEl.paused;
    const isMuted = mediaEl.muted;
    const currentTime = mediaEl.currentTime;

    // If the video is already playing, we do not want to call play again, as it
    // can interrupt the video playback.  Instead, we do a no-op.
    const playFn = () => {
      if (isPaused) {
        mediaEl.play();
      }
    };

    return Promise.resolve().then(() => playFn()).then(() => {
      mediaEl.muted = false;

      if (isPaused) {
        mediaEl.pause();
        mediaEl.currentTime = currentTime;
      }

      if (isMuted) {
        mediaEl.muted = true;
      }
    }).catch(reason => {
      dev().expectedError('AMP-STORY', 'Blessing media element failed:',
          reason);
    });
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
}


/** Service for requesting media pools */
class MediaPoolService {
  /** @param {!Window} win */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Object<string, !MediaPool>} */
    this.instances_ = {};

    /** @private {number} */
    this.nextInstanceId_ = 0;
  }

  /**
   * Instantiate or retrieve the pool that a media element should use.
   * Elements outside of <amp-story> requesting a pool will fail.
   * @param {!Element} element
   * @return {!MediaPool}
   */
  for(element) {
    const container = this.containerFor_(element);

    dev().assertElement(container);

    const existingId = container[POOL_MEDIA_ELEMENT_PROPERTY_NAME];
    const hasInstanceAllocated = existingId && this.instances_[existingId];

    if (hasInstanceAllocated) {
      return this.instances_[existingId];
    }

    const newId = String(this.nextInstanceId_++);
    container[POOL_MEDIA_ELEMENT_PROPERTY_NAME] = newId;
    this.instances_[newId] = new MediaPool(this.win_, MAX_MEDIA_ELEMENT_COUNTS);

    return this.instances_[newId];
  }

  /**
   * @param {!Element}
   * @return {boolean}
   */
  hasMediaPool(element) {
    return !!this.containerFor_(element);
  }

  /**
   * @param {!Element}
   * @return {?Element}
   * @private
   */
  containerFor_(element) {
    return closestByTag(element, 'amp-story');
  }
}


/** @param {!Window} win */
export function installMediaPoolService(win) {
  registerServiceBuilder(win, 'mediapool', MediaPoolService);
}
