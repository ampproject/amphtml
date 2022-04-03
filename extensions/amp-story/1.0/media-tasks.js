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
 * CSS class names that should not be removed from an element when swapping it
 * into/out of the DOM.
 * @const {!Array<string>}
 */
const PROTECTED_CSS_CLASS_NAMES = [
  'i-amphtml-pool-media',
  'i-amphtml-pool-audio',
  'i-amphtml-pool-video',
];

/**
 * Attribute names that should not be removed from an element when swapping it
 * into/out of the DOM.
 * @const {!Array<string>}
 */
const PROTECTED_ATTRIBUTES = ['id', 'src', 'class', 'autoplay'];

/**
 * Determines whether a CSS class name is allowed to be removed or copied from
 * media elements.
 * @param {string} cssClassName The CSS class name name to check.
 * @return {boolean} true, if the specified CSS class name is allowed to be
 *     removed or copied from media elements; false otherwise.
 * @private
 */
function isProtectedCssClassName(cssClassName) {
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
function isProtectedAttributeName(attributeName) {
  return PROTECTED_ATTRIBUTES.indexOf(attributeName) >= 0;
}

/**
 * Copies all unprotected CSS classes from fromEl to toEl.
 * @param {!Element} fromEl The element from which CSS classes should
 *     be copied.
 * @param {!Element} toEl The element to which CSS classes should be
 *     copied.
 * @private
 */
function copyCssClasses(fromEl, toEl) {
  // Remove all of the unprotected CSS classes from the toEl.
  for (let i = toEl.classList.length - 1; i >= 0; i--) {
    const cssClass = toEl.classList.item(i);
    if (!isProtectedCssClassName(cssClass)) {
      toEl.classList.remove(cssClass);
    }
  }

  // Copy all of the unprotected CSS classes from the fromEl to the toEl.
  for (let i = 0; i < fromEl.classList.length; i++) {
    const cssClass = fromEl.classList.item(i);
    if (!isProtectedCssClassName(cssClass)) {
      toEl.classList.add(cssClass);
    }
  }
}

/**
 * Copies all unprotected attributes from fromEl to toEl.
 * @param {!Element} fromEl The element from which attributes should
 *     be copied.
 * @param {!Element} toEl The element to which attributes should be
 *     copied.
 * @private
 */
function copyAttributes(fromEl, toEl) {
  const fromAttributes = fromEl.attributes;
  const toAttributes = toEl.attributes;

  // Remove all of the unprotected attributes from the toEl.
  for (let i = toAttributes.length - 1; i >= 0; i--) {
    const attributeName = toAttributes[i].name;
    if (!isProtectedAttributeName(attributeName)) {
      toEl.removeAttribute(attributeName);
    }
  }

  // Copy all of the unprotected attributes from the fromEl to the toEl.
  for (let i = 0; i < fromAttributes.length; i++) {
    const {name: attributeName, value: attributeValue} = fromAttributes[i];
    if (!isProtectedAttributeName(attributeName)) {
      toEl.setAttribute(attributeName, attributeValue);
    }
  }
}

/**
 * A task executed in order on HTMLMediaElements.
 * @interface
 */
export class MediaTask {
  /**
   * @param {!HTMLMediaElement} unusedMediaEl The element on which this task
   *     should be executed.
   * @return {Promise|void}
   * @protected
   */
  execute(unusedMediaEl) {}

  /**
   * @return {boolean} true, if this task must be executed synchronously, e.g.
   *    if it requires a user gesture.
   */
  sync() {}
}

/**
 * Plays the specified media element.
 * @implements {MediaTask}
 */
export class PlayTask {
  /** @override */
  execute(mediaEl) {
    if (!mediaEl.paused) {
      // We do not want to invoke play() if the media element is already
      // playing, as this can interrupt playback in some browsers.
      return;
    }
    return tryPlay(mediaEl);
  }

  /** @override */
  sync() {
    return false;
  }
}

/**
 * Pauses the specified media element.
 * @implements {MediaTask}
 */
export class PauseTask {
  /** @override */
  execute(mediaEl) {
    mediaEl.pause();
  }

  /** @override */
  sync() {
    return false;
  }
}

/**
 * Unmutes the specified media element.
 * @implements {MediaTask}
 */
export class UnmuteTask {
  /** @override */
  execute(mediaEl) {
    mediaEl.muted = false;
    mediaEl.removeAttribute('muted');
  }

  /** @override */
  sync() {
    return false;
  }
}

/**
 * Mutes the specified media element.
 * @implements {MediaTask}
 */
export class MuteTask {
  /** @override */
  execute(mediaEl) {
    mediaEl.muted = true;
    mediaEl.setAttribute('muted', '');
  }

  /** @override */
  sync() {
    return false;
  }
}

/**
 * Seeks the specified media element to the provided time, in seconds.
 * @implements {MediaTask}
 */
export class SetCurrentTimeTask {
  /**
   * @param {number} currentTime
   */
  constructor(currentTime) {
    /** @private @const {number} */
    this.currentTime_ = currentTime;
  }

  /** @override */
  execute(mediaEl) {
    mediaEl.currentTime = this.currentTime_;
  }

  /** @override */
  sync() {
    return false;
  }
}

/**
 * Loads the specified media element.
 * @implements {MediaTask}
 */
export class LoadTask {
  /** @override */
  execute(mediaEl) {
    mediaEl.load();
  }

  /** @override */
  sync() {
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
 * @implements {MediaTask}
 */
export class BlessTask {
  /** @override */
  execute(mediaEl) {
    const isMuted = mediaEl.muted;
    mediaEl.muted = false;
    if (isMuted) {
      mediaEl.muted = true;
    }
  }

  /** @override */
  sync() {
    return true;
  }
}

/**
 * Updates the sources of the specified media element.
 * @implements {MediaTask}
 */
export class UpdateSourcesTask {
  /**
   * @param {!Window} win
   * @param {!Sources} newSources The sources to which the media element should
   *     be updated.
   */
  constructor(win, newSources) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private @const {!Sources} */
    this.newSources_ = newSources;
  }

  /** @override */
  execute(mediaEl) {
    Sources.removeFrom(this.win_, mediaEl);
    this.newSources_.applyToElement(this.win_, mediaEl);
  }

  /** @override */
  sync() {
    return true;
  }
}

/**
 * Swaps a media element into the DOM, in the place of a placeholder element.
 * @implements {MediaTask}
 */
export class SwapIntoDomTask {
  /**
   * @param {!Element} placeholderEl The element to be replaced by the media
   *     element on which this task is executed.
   */
  constructor(placeholderEl) {
    /** @private @const {!Element} */
    this.placeholderEl_ = placeholderEl;
  }

  /** @override */
  execute(mediaEl) {
    if (!isConnectedNode(this.placeholderEl_)) {
      return Promise.reject(
        'Cannot swap media for element that is not in DOM.'
      );
    }

    copyCssClasses(this.placeholderEl_, mediaEl);
    copyAttributes(this.placeholderEl_, mediaEl);
    this.placeholderEl_.parentElement.replaceChild(
      mediaEl,
      this.placeholderEl_
    );
  }

  /** @override */
  sync() {
    return true;
  }
}

/**
 * Swaps a media element out the DOM, replacing it with a placeholder element.
 * @implements {MediaTask}
 */
export class SwapOutOfDomTask {
  /**
   * @param {!Element} placeholderEl The element to replace the media element on
   *     which this task is executed.
   */
  constructor(placeholderEl) {
    /** @private @const {!Element} */
    this.placeholderEl_ = placeholderEl;
  }

  /** @override */
  execute(mediaEl) {
    copyCssClasses(mediaEl, this.placeholderEl_);
    copyAttributes(mediaEl, this.placeholderEl_);
    mediaEl.parentElement.replaceChild(this.placeholderEl_, mediaEl);
  }

  /** @override */
  sync() {
    return true;
  }
}
