import {isConnectedNode} from '#core/dom';
import {matches} from '#core/dom/query';
import {findIndex} from '#core/types/array';
import {getWin} from '#core/window';

import {Services} from '#service';

import {MEDIA_LOAD_FAILURE_SRC_PROPERTY} from '#utils/event-helper';
import {dev, devAssert} from '#utils/log';

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
  UpdateSourcesTask,
} from './media-tasks';
import {Sources} from './sources';
import {ampMediaElementFor} from './utils';

import {userInteractedWith} from '../../../src/video-interface';

/** @const @enum {string|number} */
export const MediaType_Enum = {
  UNSUPPORTED: 0,
  AUDIO: 'audio',
  VIDEO: 'video',
};

/** @const @enum {string} */
const MediaElementOrigin = {
  PLACEHOLDER: 'placeholder',
  POOL: 'pool',
};

/**
 * A marker type to indicate an element that originated in the document that is
 * being swapped for an element from the pool.
 * @typedef {!Element}
 */
export let PlaceholderElementDef;

/**
 * A marker type to indicate an element that originated from the pool itself.
 * @typedef {!HTMLMediaElement}
 */
let PoolBoundElementDef;

/**
 * An element pulled from the DOM.  It is yet to be resolved into a
 * PlaceholderElement or a PoolBoundElement.
 * @typedef {!PlaceholderElementDef|!PoolBoundElementDef}
 */
export let DomElementDef;

/**
 * Represents the distance of an element from the current place in the document.
 * @typedef {function(!DomElementDef): number}
 */
export let ElementDistanceFnDef;

/**
 * Represents a task to be executed on a media element.
 * @typedef {function(!PoolBoundElementDef, *): !Promise}
 */
let ElementTask_1_0_Def; // eslint-disable-line local/camelcase

/**
 * @const {string}
 */
const PLACEHOLDER_ELEMENT_ID_PREFIX = 'i-amphtml-placeholder-media-';

/**
 * @const {string}
 */
const POOL_ELEMENT_ID_PREFIX = 'i-amphtml-pool-media-';

/**
 * @const {string}
 */
const POOL_MEDIA_ELEMENT_PROPERTY_NAME = '__AMP_MEDIA_POOL_ID__';

/**
 * @const {string}
 */
const ELEMENT_TASK_QUEUE_PROPERTY_NAME = '__AMP_MEDIA_ELEMENT_TASKS__';

/**
 * @const {string}
 */
const MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME = '__AMP_MEDIA_ELEMENT_ORIGIN__';

/**
 * The name for a string attribute that represents the ID of a media element
 * that the element containing this attribute replaced.
 * @const {string}
 */
export const REPLACED_MEDIA_PROPERTY_NAME = 'replaced-media';

/**
 * @type {!{[key: string]: !MediaPool}}
 */
const instances = {};

/**
 * @type {number}
 */
let nextInstanceId = 0;

/**
 * 🍹 MediaPool
 * Keeps a pool of N media elements to be shared across components.
 */
export class MediaPool {
  /**
   * @param {!Window} win The window object.
   * @param {!{[key: !MediaType_Enum]: number}} maxCounts The maximum amount of each
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

    /**
     * The function used to retrieve the distance between an element and the
     * current position in the document.
     * @private @const {!ElementDistanceFnDef}
     */
    this.distanceFn_ = distanceFn;

    /**
     * Holds all of the pool-bound media elements that have been allocated.
     * @const {!{[key: !MediaType_Enum]: !Array<!PoolBoundElementDef>}}
     * @visibleForTesting
     */
    this.allocated = {};

    /**
     * Holds all of the pool-bound media elements that have not been allocated.
     * @const {!{[key: !MediaType_Enum]: !Array<!PoolBoundElementDef>}}
     * @visibleForTesting
     */
    this.unallocated = {};

    /**
     * Maps a media element's ID to the object containing its sources.
     * @private @const {!{[key: string]: !Sources}}
     */
    this.sources_ = {};

    /**
     * The audio context.
     * @private {?AudioContext}
     */
    this.audioContext_ = null;

    /**
     * Maps a media element's ID to its audio gain node.
     * @private @const {!{[key: string]: !MediaElementAudioSourceNode}}
     */
    this.audioGainNodes_ = {};

    /**
     * Maps a media element's ID to the element.  This is necessary, as elements
     * are kept in memory when they are swapped out of the DOM.
     * @private @const {!{[key: string]: !PlaceholderElementDef}}
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

    /** @const {!{[key: string]: (function(): !PoolBoundElementDef)}} */
    this.mediaFactory_ = {
      [MediaType_Enum.AUDIO]: () => {
        const audioEl = this.win_.document.createElement('audio');
        audioEl.setAttribute('muted', '');
        audioEl.muted = true;
        audioEl.classList.add('i-amphtml-pool-media');
        audioEl.classList.add('i-amphtml-pool-audio');
        return audioEl;
      },
      [MediaType_Enum.VIDEO]: () => {
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
   * @param {!{[key: !MediaType_Enum]: number}} maxCounts The maximum amount of each
   *     media element that can be allocated by the pool.
   * @private
   */
  initializeMediaPool_(maxCounts) {
    let poolIdCounter = 0;

    for (const type in maxCounts) {
      const count = maxCounts[type];

      const ctor = devAssert(
        this.mediaFactory_[type],
        `Factory for media type \`${type}\` unset.`
      );

      // Cloning nodes is faster than building them.
      // Construct a seed media element as a small optimization.
      const mediaElSeed = ctor();

      this.allocated[type] = [];
      this.unallocated[type] = [];

      // Reverse-looping is generally faster and Closure would usually make
      // this optimization automatically. However, it skips it due to a
      // comparison with the itervar below, so we have to roll it by hand.
      for (let i = count; i > 0; i--) {
        // Use seed element at end of set to prevent wasting it.
        const mediaEl = /** @type {!PoolBoundElementDef} */ (
          i == 1 ? mediaElSeed : mediaElSeed.cloneNode(/* deep */ true)
        );
        mediaEl.addEventListener('error', this.onMediaError_, {capture: true});
        mediaEl.id = POOL_ELEMENT_ID_PREFIX + poolIdCounter++;
        // In Firefox, cloneNode() does not properly copy the muted property
        // that was set in the seed. We need to set it again here.
        mediaEl.muted = true;
        mediaEl[MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME] = MediaElementOrigin.POOL;
        this.unallocated[type].push(mediaEl);
      }
    }
  }

  /**
   * Handles HTMLMediaElement and children HTMLSourceElement error events. Marks
   * the media as errored, as there is no other way to check if the load failed
   * when the media is using HTMLSourceElements.
   * @param {!Event} event
   * @private
   */
  onMediaError_(event) {
    const target = dev().assertElement(event.target);
    if (!matches(target, 'source:last-of-type, video[src]')) {
      return;
    }
    const media = target.tagName === 'SOURCE' ? target.parentElement : target;
    media[MEDIA_LOAD_FAILURE_SRC_PROPERTY] = media.currentSrc || true;
  }

  /**
   * @return {!Sources} The default source, empty.
   * @private
   */
  getDefaultSource_() {
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
  compareMediaDistances_(mediaA, mediaB) {
    const distanceA = this.distanceFn_(mediaA);
    const distanceB = this.distanceFn_(mediaB);
    return distanceA < distanceB ? -1 : 1;
  }

  /**
   * @return {string} A unique ID.
   * @private
   */
  createPlaceholderElementId_() {
    return PLACEHOLDER_ELEMENT_ID_PREFIX + this.placeholderIdCounter_++;
  }

  /**
   * @param {!DomElementDef} mediaElement
   * @return {boolean}
   * @private
   */
  isPoolMediaElement_(mediaElement) {
    return (
      mediaElement[MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME] ===
      MediaElementOrigin.POOL
    );
  }

  /**
   * Gets the media type from a given element.
   * @param {!PoolBoundElementDef|!PlaceholderElementDef} mediaElement The
   *     element whose media type should be retrieved.
   * @return {!MediaType_Enum}
   * @private
   */
  getMediaType_(mediaElement) {
    const tagName = mediaElement.tagName.toLowerCase();
    switch (tagName) {
      case 'audio':
        return MediaType_Enum.AUDIO;
      case 'video':
        return MediaType_Enum.VIDEO;
      default:
        return MediaType_Enum.UNSUPPORTED;
    }
  }

  /**
   * Reserves an element of the specified type by removing it from the set of
   * unallocated elements and returning it.
   * @param {!MediaType_Enum} mediaType The type of media element to reserve.
   * @return {?PoolBoundElementDef} The reserved element, if one exists.
   * @private
   */
  reserveUnallocatedMediaElement_(mediaType) {
    return this.unallocated[mediaType].pop();
  }

  /**
   * Retrieves the media element from the pool that matches the specified
   * element, if one exists.
   * @param {!MediaType_Enum} mediaType The type of media element to get.
   * @param {!DomElementDef} domMediaEl The element whose matching media
   *     element should be retrieved.
   * @return {?PoolBoundElementDef} The media element in the pool that
   *     represents the specified media element
   */
  getMatchingMediaElementFromPool_(mediaType, domMediaEl) {
    if (this.isAllocatedMediaElement_(mediaType, domMediaEl)) {
      // The media element in the DOM was already from the pool.
      return /** @type {!PoolBoundElementDef} */ (domMediaEl);
    }

    const allocatedEls = this.allocated[mediaType];
    const index = findIndex(allocatedEls, (poolMediaEl) => {
      return poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] === domMediaEl.id;
    });

    return allocatedEls[index];
  }

  /**
   * Allocates the specified media element of the specified type.
   * @param {!MediaType_Enum} mediaType The type of media element to allocate.
   * @param {!PoolBoundElementDef} poolMediaEl The element to be allocated.
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
   * @param {!MediaType_Enum} mediaType The type of media element to deallocate.
   * @param {!PlaceholderElementDef=} opt_elToAllocate If specified, the element
   *     that is trying to be allocated, such that another element must be
   *     evicted.
   * @return {?PoolBoundElementDef} The deallocated element, if one exists.
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
      if (
        !furthestEl ||
        this.distanceFn_(furthestEl) < this.distanceFn_(opt_elToAllocate)
      ) {
        return null;
      }
    }

    // De-allocate a media element.
    const poolMediaEl = allocatedEls.pop();
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
  forceDeallocateMediaElement_(poolMediaEl) {
    const mediaType = this.getMediaType_(poolMediaEl);
    const allocatedEls = this.allocated[mediaType];
    const removeFromDom = isConnectedNode(poolMediaEl)
      ? this.swapPoolMediaElementOutOfDom_(poolMediaEl)
      : Promise.resolve();

    return removeFromDom.then(() => {
      const index = allocatedEls.indexOf(poolMediaEl);
      devAssert(index >= 0, 'Cannot deallocate unallocated media element.');
      allocatedEls.splice(index, 1);
      this.unallocated[mediaType].push(poolMediaEl);
    });
  }

  /**
   * Evicts an element of the specified type, replaces it in the DOM with the
   * original media element, and returns it.
   * @param {!MediaType_Enum} mediaType The type of media element to evict.
   * @param {!PlaceholderElementDef=} opt_elToAllocate If specified, the element
   *     that is trying to be allocated, such that another element must be
   *     evicted.
   * @return {?PoolBoundElementDef} A media element of the specified type.
   * @private
   */
  evictMediaElement_(mediaType, opt_elToAllocate) {
    const poolMediaEl = this.deallocateMediaElement_(
      mediaType,
      opt_elToAllocate
    );
    if (!poolMediaEl) {
      return null;
    }

    this.swapPoolMediaElementOutOfDom_(poolMediaEl);
    return poolMediaEl;
  }

  /**
   * @param {!MediaType_Enum} mediaType The media type to check.
   * @param {!DomElementDef} domMediaEl The element to check.
   * @return {boolean} true, if the specified element has already been allocated
   *     as the specified type of media element.
   * @private
   */
  isAllocatedMediaElement_(mediaType, domMediaEl) {
    // Since we don't know whether or not the specified domMediaEl is a
    // placeholder or originated from the pool, we coerce it to a pool-bound
    // element, to check against the allocated list of pool-bound elements.
    const poolMediaEl = /** @type {!PoolBoundElementDef} */ (domMediaEl);
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
  swapPoolMediaElementIntoDom_(placeholderEl, poolMediaEl, sources) {
    const ampMediaForPoolEl = ampMediaElementFor(poolMediaEl);
    const ampMediaForDomEl = ampMediaElementFor(placeholderEl);
    poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] = placeholderEl.id;

    return this.enqueueMediaElementTask_(
      poolMediaEl,
      new SwapIntoDomTask(placeholderEl)
    )
      .then(() =>
        Promise.all([
          this.maybeResetAmpMedia_(ampMediaForPoolEl),
          this.maybeResetAmpMedia_(ampMediaForDomEl),
        ])
      )
      .then(() =>
        this.enqueueMediaElementTask_(
          poolMediaEl,
          new UpdateSourcesTask(this.win_, sources)
        )
      )
      .then(() => this.enqueueMediaElementTask_(poolMediaEl, new LoadTask()))
      .catch(() => {
        this.forceDeallocateMediaElement_(poolMediaEl);
      });
  }

  /**
   * @param {?Element} componentEl
   * @return {!Promise}
   * @private
   */
  maybeResetAmpMedia_(componentEl) {
    if (!componentEl) {
      return Promise.resolve();
    }

    if (componentEl.tagName.toLowerCase() == 'amp-audio') {
      // TODO(alanorozco): Implement reset for amp-audio
      return Promise.resolve();
    }

    if (this.audioGainNodes_[componentEl.id]) {
      this.setVolume_(componentEl, 1);
    }

    return componentEl.getImpl().then((impl) => {
      if (impl.resetOnDomChange) {
        impl.resetOnDomChange();
      }
    });
  }

  /**
   * @param {!PoolBoundElementDef} poolMediaEl The element whose source should
   *     be reset.
   * @param {!Sources=} sources Optional sources for the media element.
   * @return {!Promise} A promise that is resolved when the pool media element
   *     has been reset.
   */
  resetPoolMediaElementSource_(
    poolMediaEl,
    sources = this.getDefaultSource_()
  ) {
    return this.enqueueMediaElementTask_(
      poolMediaEl,
      new UpdateSourcesTask(this.win_, sources)
    ).then(() => this.enqueueMediaElementTask_(poolMediaEl, new LoadTask()));
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
  swapPoolMediaElementOutOfDom_(poolMediaEl) {
    const placeholderElId = poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME];
    const placeholderEl = /** @type {!PlaceholderElementDef} */ (
      dev().assertElement(
        this.placeholderEls_[placeholderElId],
        `No media element ${placeholderElId} to put back into DOM after` +
          'eviction.'
      )
    );
    poolMediaEl[REPLACED_MEDIA_PROPERTY_NAME] = null;

    const swapOutOfDom = this.enqueueMediaElementTask_(
      poolMediaEl,
      new SwapOutOfDomTask(placeholderEl)
    );

    this.resetPoolMediaElementSource_(poolMediaEl);
    return swapOutOfDom;
  }

  /**
   * Preloads the content of the specified media element in the DOM and returns
   * a media element that can be used in its stead for playback.
   * @param {!DomElementDef} domMediaEl The media element, found in the
   *     DOM, whose content should be loaded.
   * @return {Promise<!PoolBoundElementDef|undefined>} A media element from the pool that
   *     can be used to replace the specified element.
   */
  loadInternal_(domMediaEl) {
    if (!isConnectedNode(domMediaEl)) {
      // Don't handle nodes that aren't even in the document.
      return Promise.resolve();
    }

    const mediaType = this.getMediaType_(domMediaEl);
    const existingPoolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl
    );
    if (existingPoolMediaEl) {
      // The element being loaded already has an allocated media element.
      return Promise.resolve(
        /** @type {!PoolBoundElementDef} */ (existingPoolMediaEl)
      );
    }

    // Since this is not an existing pool media element, we can be certain that
    // it is a placeholder element.
    const placeholderEl = /** @type {!PlaceholderElementDef} */ (domMediaEl);

    const sources = this.sources_[placeholderEl.id];
    devAssert(sources instanceof Sources, 'Cannot play unregistered element.');

    const poolMediaEl =
      this.reserveUnallocatedMediaElement_(mediaType) ||
      this.evictMediaElement_(mediaType, placeholderEl);

    if (!poolMediaEl) {
      // If there is no space in the pool to allocate a new element, and no
      // element can be evicted, do not return any element.
      return Promise.resolve();
    }

    this.allocateMediaElement_(mediaType, poolMediaEl);

    return this.swapPoolMediaElementIntoDom_(
      placeholderEl,
      poolMediaEl,
      sources
    ).then(() => poolMediaEl);
  }

  /**
   * "Blesses" the specified media element for future playback without a user
   * gesture.  In order for this to bless the media element, this function must
   * be invoked in response to a user gesture.
   * @param {!PoolBoundElementDef} poolMediaEl The media element to bless.
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
   * Reregisters the specified element to be usable by the media pool. This
   * is useful in cases where the element's sources have updated since the
   * previous registration and a reload of the element using these new sources
   * is desired.
   * @param {!DomElementDef} domMediaEl The media element to be reregistered.
   * @return {!Promise} A promise that is resolved when the element has been
   *     successfully reregistered, or rejected otherwise.
   */
  reregister(domMediaEl) {
    return this.register(domMediaEl, true /** isReregistration */);
  }

  /**
   * Registers the specified element to be usable by the media pool.  Elements
   * should be registered as early as possible, in order to prevent them from
   * being played while not managed by the media pool. Registering elements
   * from within the pool is not allowed, and will also be a no-op.
   *
   * If the media element is already registered and `isReregistration` is true,
   * then the media element will be loaded. However, if the element is
   * registered and `isReregistration` is false, then this is a no-op.
   * @param {!DomElementDef} domMediaEl The media element to be
   *     registered.
   * @param {boolean=} isReregistration Whether the given element has already
   *     been registered.
   * @return {!Promise} A promise that is resolved when the element has been
   *     successfully registered, or rejected otherwise.
   */
  register(domMediaEl, isReregistration = false) {
    const parent = domMediaEl.parentNode;
    if (parent && parent.signals) {
      this.trackAmpElementToBless_(/** @type {!AmpElement} */ (parent));
    }

    if (this.isPoolMediaElement_(domMediaEl)) {
      // In the case of a reregistration, `UpdateSourcesTask` and `LoadTask`
      // are used to load the element using its sources (which may have changed
      // since the previous registration).
      if (isReregistration) {
        const sources = Sources.removeFrom(this.win_, domMediaEl);
        this.sources_[domMediaEl.id] = sources;
        return this.resetPoolMediaElementSource_(domMediaEl, sources);
      }

      // This media element originated from the media pool.
      return Promise.resolve();
    }

    // Since this is not an existing pool media element, we can be certain that
    // it is a placeholder element.
    const placeholderEl = /** @type {!PlaceholderElementDef} */ (domMediaEl);
    placeholderEl[MEDIA_ELEMENT_ORIGIN_PROPERTY_NAME] =
      MediaElementOrigin.PLACEHOLDER;

    const id = placeholderEl.id || this.createPlaceholderElementId_();
    if (this.sources_[id] && this.placeholderEls_[id]) {
      // This media element is already registered.
      return Promise.resolve();
    }

    // This media element has not yet been registered.
    placeholderEl.id = id;
    const sources = Sources.removeFrom(this.win_, placeholderEl);
    this.sources_[id] = sources;
    this.placeholderEls_[id] = placeholderEl;

    if (placeholderEl instanceof HTMLMediaElement) {
      placeholderEl.muted = true;
      placeholderEl.setAttribute('muted', '');
      placeholderEl.pause();
    }

    return Promise.resolve();
  }

  /**
   * @param {!AmpElement} element
   * @private
   */
  trackAmpElementToBless_(element) {
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
  preload(domMediaEl) {
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
  play(domMediaEl) {
    return this.loadInternal_(domMediaEl).then((poolMediaEl) => {
      if (!poolMediaEl) {
        return Promise.resolve();
      }

      return this.enqueueMediaElementTask_(poolMediaEl, new PlayTask());
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
  pause(domMediaEl, rewindToBeginning = false) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl
    );

    if (!poolMediaEl) {
      return Promise.resolve();
    }

    return this.enqueueMediaElementTask_(poolMediaEl, new PauseTask()).then(
      () => {
        if (rewindToBeginning) {
          // TODO: https://github.com/ampproject/amphtml/issues/38595 implement
          // proper fix to frame management.
          // We add a 100 second delay to rewinding as sometimes this causes an
          // interlacing/glitch/frame jump when a new video is starting to play.
          // A 0 delay isn't enough as we need to push the "seeking" event
          // to the next tick of the event loop.
          // NOTE: Please note that this is not an ideal solution and a bit hacky.
          // The more ideal fix would be to fix the the navigations animation frames.
          // See https://github.com/ampproject/amphtml/issues/38531
          this.timer_.delay(() => {
            this.enqueueMediaElementTask_(
              /** @type {!PoolBoundElementDef} */ (poolMediaEl),
              new SetCurrentTimeTask({currentTime: 0})
            );
          }, 100);
        }
      }
    );
  }

  /**
   * Rewinds a specified media element in the DOM to 0.
   * @param {!DomElementDef} domMediaEl The media element to be rewound.
   * @return {!Promise} A promise that is resolved when the
   *     specified media element has been successfully rewound.
   */
  rewindToBeginning(domMediaEl) {
    return this.setCurrentTime(domMediaEl, 0 /** currentTime */);
  }

  /**
   * Sets currentTime for a specified media element in the DOM.
   * @param {!DomElementDef} domMediaEl The media element.
   * @param {number} currentTime The time to seek to, in seconds.
   * @return {!Promise} A promise that is resolved when the
   *     specified media element has been successfully set to the given time.
   */
  setCurrentTime(domMediaEl, currentTime) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl
    );

    if (!poolMediaEl) {
      return Promise.resolve();
    }

    return this.enqueueMediaElementTask_(
      poolMediaEl,
      new SetCurrentTimeTask({currentTime})
    );
  }

  /**
   * Mutes the specified media element in the DOM.
   * @param {!DomElementDef} domMediaEl The media element to be muted.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has been successfully muted.
   */
  mute(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl
    );

    if (!poolMediaEl) {
      return Promise.resolve();
    }

    const audioGainNode = this.audioGainNodes_[domMediaEl.id];
    if (audioGainNode) {
      audioGainNode.gain.value = 0;
    }

    return this.enqueueMediaElementTask_(poolMediaEl, new MuteTask());
  }

  /**
   * Unmutes the specified media element in the DOM.
   * @param {!DomElementDef} domMediaEl The media element to be unmuted.
   * @return {!Promise} A promise that is resolved when the specified media
   *     element has been successfully unmuted.
   */
  unmute(domMediaEl) {
    const mediaType = this.getMediaType_(domMediaEl);
    const poolMediaEl = this.getMatchingMediaElementFromPool_(
      mediaType,
      domMediaEl
    );

    if (!poolMediaEl) {
      return Promise.resolve();
    }

    if (mediaType == MediaType_Enum.VIDEO) {
      const ampVideoEl = domMediaEl.parentElement;
      if (ampVideoEl) {
        const volume = parseFloat(ampVideoEl.getAttribute('volume'));
        const isMuted = volume <= 0 || ampVideoEl.hasAttribute('noaudio');
        if (isMuted) {
          return Promise.resolve();
        }
        if (volume < 1) {
          this.setVolume_(domMediaEl, volume);
        }
      }
    }

    return this.enqueueMediaElementTask_(poolMediaEl, new UnmuteTask());
  }

  /**
   * Updates the volume of the provided media element.
   * @param {!DomElementDef} domMediaEl The media element whose volume will be set.
   * @param {number} volume The volume to be applied to the media element.
   * @private
   */
  setVolume_(domMediaEl, volume) {
    // Handle cross-browser differences (see https://googlechrome.github.io/samples/webaudio-method-chaining/).
    if (typeof AudioContext === 'function') {
      this.audioContext_ = this.audioContext_ || new AudioContext();
    } else if (typeof webkitAudioContext === 'function') {
      this.audioContext_ =
        this.audioContext_ || new global.webkitAudioContext();
    }

    if (this.audioContext_) {
      if (!this.audioGainNodes_[domMediaEl.id]) {
        const audioSource =
          this.audioContext_.createMediaElementSource(domMediaEl);
        const audioGainNode = this.audioContext_.createGain();
        this.audioGainNodes_[domMediaEl.id] = audioGainNode;
        audioSource
          .connect(audioGainNode)
          .connect(this.audioContext_.destination);
      }
      this.audioGainNodes_[domMediaEl.id].gain.value = volume;
    }
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

    (this.ampElementsToBless_ || []).forEach(userInteractedWith);

    this.ampElementsToBless_ = null; // GC

    const elements = [
      ...this.allocated[MediaType_Enum.AUDIO],
      ...this.unallocated[MediaType_Enum.VIDEO],
      ...this.allocated[MediaType_Enum.AUDIO],
      ...this.unallocated[MediaType_Enum.VIDEO],
    ];

    const blessPromises = elements.map((element) => this.bless_(element));
    return Promise.all(blessPromises).then(
      () => {
        this.blessed_ = true;
      },
      (reason) => {
        dev().expectedError('AMP-STORY', 'Blessing all media failed: ', reason);
      }
    );
  }

  /**
   * @param {!PoolBoundElementDef} mediaEl The element whose task queue should
   *     be executed.
   * @private
   */
  executeNextMediaElementTask_(mediaEl) {
    const queue = mediaEl[ELEMENT_TASK_QUEUE_PROPERTY_NAME];
    if (queue.length === 0) {
      return;
    }

    const task = queue[0];

    const executionFn = () => {
      task
        .execute(mediaEl)
        .catch((reason) => dev().error('AMP-STORY', reason))
        .then(() => {
          // Run regardless of success or failure of task execution.
          queue.shift();
          this.executeNextMediaElementTask_(mediaEl);
        });
    };

    if (task.requiresSynchronousExecution()) {
      executionFn();
    } else {
      this.timer_.delay(executionFn, 0);
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
      getWin(root.getElement()),
      root.getMaxMediaElementCounts(),
      (element) => root.getElementDistance(element)
    );

    return instances[newId];
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
   * @return {!{[key: !MediaType_Enum]: number}} The maximum amount of each media
   *     type to allow within this element.
   */
  getMaxMediaElementCounts() {}
}
