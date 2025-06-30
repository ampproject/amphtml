import {Deferred} from '#core/data-structures/promise';
import {isConnectedNode} from '#core/dom';
import {tryPlay} from '#core/dom/video';

import {Sources} from './sources';

/**
 * The name for a boolean property on an element indicating whether that element
 * has already been "blessed".
 * @const {string}
 */
export const ELEMENT_BLESSED_PROPERTY_NAME = '__AMP_MEDIA_IS_BLESSED__';

/**
 * Determines whether an attribute is allowed to be removed or copied from
 * media elements.
 * @param {string} attributeName The attribute name to check.
 * @return {boolean} true, if the specified attribute is allowed to be removed
 *     or copied from media elements; false otherwise.
 * @private
 */
function isProtectedAttributeName(attributeName) {
  return (
    attributeName === 'autoplay' ||
    attributeName === 'id' ||
    attributeName === 'src'
  );
}

/**
 * @param {!Element} replaced
 * @param {!Element} inserted
 */
function swapMediaElements(replaced, inserted) {
  // 'i-amphtml-pool' is the only protected classname.
  // Restore its value after overriding the `class` attribute.
  const hasOurClassname = inserted.classList.contains('i-amphtml-pool');

  // Remove inserted element's unprotected attributes, and add those of the
  // replaced element.
  for (const attr of inserted.attributes) {
    if (!isProtectedAttributeName(attr.name)) {
      inserted.removeAttribute(attr.name);
    }
  }
  for (const attr of replaced.attributes) {
    if (!isProtectedAttributeName(attr.name)) {
      inserted.setAttribute(attr.name, attr.value);
    }
  }

  inserted.classList.toggle('i-amphtml-pool', hasOurClassname);
  replaced.parentElement.replaceChild(inserted, replaced);
}

/**
 * Base class for tasks executed in order on HTMLMediaElements.
 */
export class MediaTask {
  /**
   * @param {string} name
   * @param {!Object=} options
   */
  constructor(name, options = {}) {
    /** @private @const {string} */
    this.name_ = name;

    const deferred = new Deferred();

    /** @private @const {!Promise} */
    this.completionPromise_ = deferred.promise;

    /** @protected @const {!Object} */
    this.options = options;

    /** @private {?function()} */
    this.resolve_ = deferred.resolve;

    /** @private {?function(*)} */
    this.reject_ = deferred.reject;
  }

  /**
   * @return {string} The name of this task.
   */
  getName() {
    return this.name_;
  }

  /**
   * @return {!Promise<*>} A promise that is resolved when the task has
   *     completed execution.
   */
  whenComplete() {
    return this.completionPromise_;
  }

  /**
   * @param {!HTMLMediaElement} mediaEl The element on which this task should be
   *     executed.
   * @return {!Promise} A promise that is resolved when the task has completed
   *     execution.
   */
  execute(mediaEl) {
    return this.executeInternal(mediaEl).then(this.resolve_, this.reject_);
  }

  /**
   * @param {!HTMLMediaElement} unusedMediaEl The element on which this task
   *     should be executed.
   * @return {*} TODO(#23582): Specify return type
   * @protected
   */
  executeInternal(unusedMediaEl) {
    return Promise.resolve();
  }

  /**
   * @return {boolean} true, if this task must be executed synchronously, e.g.
   *    if it requires a user gesture.
   */
  requiresSynchronousExecution() {
    return false;
  }

  /**
   * @param {*} reason The reason for failing the task.
   * @protected
   */
  failTask(reason) {
    this.reject_(reason);
  }
}

/**
 * Plays the specified media element.
 */
export class PlayTask extends MediaTask {
  /**
   * @public
   */
  constructor() {
    super('play');
  }

  /** @override */
  executeInternal(mediaEl) {
    if (!mediaEl.paused) {
      // We do not want to invoke play() if the media element is already
      // playing, as this can interrupt playback in some browsers.
      return Promise.resolve();
    }

    return tryPlay(mediaEl);
  }
}

/**
 * Pauses the specified media element.
 */
export class PauseTask extends MediaTask {
  /**
   * @public
   */
  constructor() {
    super('pause');
  }

  /** @override */
  executeInternal(mediaEl) {
    mediaEl.pause();
    return Promise.resolve();
  }
}

/**
 * Unmutes the specified media element.
 */
export class UnmuteTask extends MediaTask {
  /**
   * @public
   */
  constructor() {
    super('unmute');
  }

  /** @override */
  executeInternal(mediaEl) {
    mediaEl.muted = false;
    mediaEl.removeAttribute('muted');
    return Promise.resolve();
  }
}

/**
 * Mutes the specified media element.
 */
export class MuteTask extends MediaTask {
  /**
   * @public
   */
  constructor() {
    super('mute');
  }

  /** @override */
  executeInternal(mediaEl) {
    mediaEl.muted = true;
    mediaEl.setAttribute('muted', '');
    return Promise.resolve();
  }
}

/**
 * Seeks the specified media element to the provided time, in seconds.
 */
export class SetCurrentTimeTask extends MediaTask {
  /**
   * @param {!Object=} options
   */
  constructor(options = {currentTime: 0}) {
    super('setCurrentTime', options);
  }

  /** @override */
  executeInternal(mediaEl) {
    mediaEl.currentTime = this.options.currentTime;
    return Promise.resolve();
  }
}

/**
 * Loads the specified media element.
 */
export class LoadTask extends MediaTask {
  /**
   * @public
   */
  constructor() {
    super('load');
  }

  /** @override */
  executeInternal(mediaEl) {
    mediaEl.load();
    return Promise.resolve();
  }

  /** @override */
  requiresSynchronousExecution() {
    // When recycling a media pool element, its sources are removed and the
    // LoadTask runs to reset it (buffered data, readyState, etc). It needs to
    // run synchronously so the media element can't be used in a new context
    // but with old data.
    return true;
  }
}

/**
 * "Blesses" the specified media element for future playback without a user
 * gesture.  In order for this to bless the media element, this function must
 * be invoked in response to a user gesture.
 */
export class BlessTask extends MediaTask {
  /**
   * @public
   */
  constructor() {
    super('bless');
  }

  /** @override */
  requiresSynchronousExecution() {
    return true;
  }

  /** @override */
  executeInternal(mediaEl) {
    const isMuted = mediaEl.muted;
    mediaEl.muted = false;
    if (isMuted) {
      mediaEl.muted = true;
    }
    return Promise.resolve();
  }
}

/**
 * Updates the sources of the specified media element.
 */
export class UpdateSourcesTask extends MediaTask {
  /**
   * @param {!Window} win
   * @param {!Sources} newSources The sources to which the media element should
   *     be updated.
   */
  constructor(win, newSources) {
    super('update-src');

    /** @private {!Window} */
    this.win_ = win;

    /** @private @const {!Sources} */
    this.newSources_ = newSources;
  }

  /** @override */
  executeInternal(mediaEl) {
    Sources.removeFrom(this.win_, mediaEl);
    this.newSources_.applyToElement(this.win_, mediaEl);
    return Promise.resolve();
  }

  /** @override */
  requiresSynchronousExecution() {
    return true;
  }
}

/**
 * Swaps a media element into the DOM, in the place of a placeholder element.
 */
export class SwapIntoDomTask extends MediaTask {
  /**
   * @param {!Element} placeholderEl The element to be replaced by the media
   *     element on which this task is executed.
   */
  constructor(placeholderEl) {
    super('swap-into-dom');

    /** @private @const {!Element} */
    this.placeholderEl_ = placeholderEl;
  }

  /** @override */
  executeInternal(mediaEl) {
    if (!isConnectedNode(this.placeholderEl_)) {
      this.failTask('Cannot swap media for element that is not in DOM.');
      return Promise.resolve();
    }
    swapMediaElements(this.placeholderEl_, mediaEl);
    return Promise.resolve();
  }

  /** @override */
  requiresSynchronousExecution() {
    return true;
  }
}

/**
 * Swaps a media element out the DOM, replacing it with a placeholder element.
 */
export class SwapOutOfDomTask extends MediaTask {
  /**
   * @param {!Element} placeholderEl The element to replace the media element on
   *     which this task is executed.
   */
  constructor(placeholderEl) {
    super('swap-out-of-dom');

    /** @private @const {!Element} */
    this.placeholderEl_ = placeholderEl;
  }

  /** @override */
  executeInternal(mediaEl) {
    swapMediaElements(mediaEl, this.placeholderEl_);
    return Promise.resolve();
  }

  /** @override */
  requiresSynchronousExecution() {
    return true;
  }
}
