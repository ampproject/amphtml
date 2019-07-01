/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred, tryResolve} from '../../../src/utils/promise';
import {Sources} from './sources';
import {isConnectedNode} from '../../../src/dom';

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
 * @param {!HTMLMediaElement} fromEl The element from which CSS classes should
 *     be copied.
 * @param {!HTMLMediaElement} toEl The element to which CSS classes should be
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
 * @param {!HTMLMediaElement} fromEl The element from which attributes should
 *     be copied.
 * @param {!HTMLMediaElement} toEl The element to which attributes should be
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
 * Base class for tasks executed in order on HTMLMediaElements.
 */
export class MediaTask {
  /**
   * @param {string} name
   */
  constructor(name) {
    /** @private @const {string} */
    this.name_ = name;

    const deferred = new Deferred();

    /** @private @const {!Promise} */
    this.completionPromise_ = deferred.promise;

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
   * @param {!HTMLMediaElement} mediaEl The media element on which this task
   *     should be executed.
   * @return {!Promise} A promise that is resolved when the task has completed
   *     execution.
   */
  execute(mediaEl) {
    return this.executeInternal(mediaEl).then(this.resolve_, this.reject_);
  }

  /**
   * @param {!HTMLMediaElement} unusedMediaEl The media element on which this
   *     task should be executed.
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

    // The play() invocation is wrapped in a Promise.resolve(...) due to the
    // fact that some browsers return a promise from media elements' play()
    // function, while others return a boolean.
    return tryResolve(() => mediaEl.play());
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
 * Seeks the specified media element to the beginning.
 */
export class RewindTask extends MediaTask {
  /**
   * @public
   */
  constructor() {
    super('rewind');
  }

  /** @override */
  executeInternal(mediaEl) {
    mediaEl.currentTime = 0;
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
   * @param {!Sources} newSources The sources to which the media element should
   *     be updated.
   */
  constructor(newSources) {
    super('update-src');

    /** @private @const {!Sources} */
    this.newSources_ = newSources;
  }

  /** @override */
  executeInternal(mediaEl) {
    Sources.removeFrom(mediaEl);
    this.newSources_.applyToElement(mediaEl);
    return Promise.resolve();
  }
}

/**
 * Swaps a media element into the DOM, in the place of another media element.
 */
export class SwapIntoDomTask extends MediaTask {
  /**
   * @param {!HTMLMediaElement} replacedMediaEl The element to be replaced by
   *     the media element on which this task is executed.
   */
  constructor(replacedMediaEl) {
    super('swap-into-dom');

    /** @private @const {!HTMLMediaElement} */
    this.replacedMediaEl_ = replacedMediaEl;
  }

  /** @override */
  executeInternal(mediaEl) {
    if (!isConnectedNode(this.replacedMediaEl_)) {
      this.failTask('Cannot swap media for element that is not in DOM.');
      return Promise.resolve();
    }

    copyCssClasses(this.replacedMediaEl_, mediaEl);
    copyAttributes(this.replacedMediaEl_, mediaEl);
    this.replacedMediaEl_.parentElement.replaceChild(
      mediaEl,
      this.replacedMediaEl_
    );
    return Promise.resolve();
  }
}

/**
 * Swaps a media element out the DOM, in the place of a placeholder media
 * element.
 */
export class SwapOutOfDomTask extends MediaTask {
  /**
   * @param {!HTMLMediaElement} placeholderMediaEl The element to be replaced by
   *     the media element on which this task is executed.
   */
  constructor(placeholderMediaEl) {
    super('swap-out-of-dom');

    /** @private @const {!HTMLMediaElement} */
    this.placeholderMediaEl_ = placeholderMediaEl;
  }

  /** @override */
  executeInternal(mediaEl) {
    copyCssClasses(mediaEl, this.placeholderMediaEl_);
    copyAttributes(mediaEl, this.placeholderMediaEl_);
    mediaEl.parentElement.replaceChild(this.placeholderMediaEl_, mediaEl);
    return Promise.resolve();
  }
}
