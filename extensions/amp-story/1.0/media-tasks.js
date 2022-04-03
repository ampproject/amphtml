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

/** @typedef {(HTMLMediaElement: mediaEl) => Promise|void} */
let MediaTaskFnDef;

/** @typedef {[MediaTaskFnDef]} */
let AsyncMediaTaskDef;

/** @typedef {[MediaTaskFnDef, true]} */
let SyncMediaTaskDef;

/**
 * A task on an HTMLMediaElement that runs sequentially on a queue.
 * It must be specified as an array whose first item is a function:
 *
 *   const fn = (mediaEl) => {};
 *   const task = [fn];
 *
 * This function is executed asynchronously as a result of `setTimeout(fn, 0)`.
 *
 * If the function requires synchronous execution (for example, if it should
 * run as the result of a user gesture), the task must have a second item to
 * annotate this fact as `true`:
 *
 *   const task = [fn, /* requiresSynchronousExecution *\/ true];
 *
 * If the function requires arguments, the task must be implemented as a
 * factory (see `create*` for more examples):
 *
 *   function createTask(a, b) {
 *     const fn = (mediaEl) => {
 *       x(mediaEl, a, b);
 *     };
 *     return [fn];
 *   }
 * @typedef {AsyncMediaTaskDef|SyncMediaTaskDef}
 */
export let MediaTask;

/**
 * Plays the specified media element.
 * @param {HTMLMediaElement} mediaEl
 * @return {Promise|void}
 */
const play = (mediaEl) => {
  if (!mediaEl.paused) {
    // We do not want to invoke play() if the media element is already
    // playing, as this can interrupt playback in some browsers.
    return;
  }
  return tryPlay(mediaEl);
};

/** @const {MediaTask} */
export const PlayTask = [play];

/**
 * Pauses the specified media element.
 * @param {HTMLMediaElement} mediaEl
 */
const pause = (mediaEl) => {
  mediaEl.pause();
};

/** @const {MediaTask} */
export const PauseTask = [pause];

/**
 * Unmutes the specified media element.
 * @param {HTMLMediaElement} mediaEl
 */
const unmute = (mediaEl) => {
  mediaEl.muted = false;
  mediaEl.removeAttribute('muted');
};

/** @const {MediaTask} */
export const UnmuteTask = [unmute];

/**
 * Mutes the specified media element.
 * @param {HTMLMediaElement} mediaEl
 */
const mute = (mediaEl) => {
  mediaEl.muted = true;
  mediaEl.setAttribute('muted', '');
};

/** @const {MediaTask} */
export const MuteTask = [mute];

/**
 * Seeks the specified media element to the provided time, in seconds.
 * @param {HTMLMediaElement} mediaEl
 * @param {number} currentTime
 */
const setCurrentTime = (mediaEl, currentTime) => {
  mediaEl.currentTime = currentTime;
};

/**
 * @param {number} currentTime
 * @return {MediaTask}
 */
export function createSetCurrentTimeTask(currentTime) {
  return [
    (mediaEl) => {
      setCurrentTime(mediaEl, currentTime);
    },
  ];
}

/**
 * Loads the specified media element.
 * @param {HTMLMediaElement} mediaEl
 */
const load = (mediaEl) => {
  mediaEl.load();
};

/** @const {MediaTask} */
export const LoadTask = [
  load,
  // When recycling a media pool element, its sources are removed and the
  // LoadTask runs to reset it (buffered data, readyState, etc). It needs to
  // run synchronously so the media element can't be used in a new context
  // but with old data.
  /* requiresSynchronousExecution */ true,
];

/**
 * "Blesses" the specified media element for future playback without a user
 * gesture.  In order for this to bless the media element, this function must
 * be invoked in response to a user gesture.
 * @param {HTMLMediaElement} mediaEl
 */
const bless = (mediaEl) => {
  const isMuted = mediaEl.muted;
  mediaEl.muted = false;
  if (isMuted) {
    mediaEl.muted = true;
  }
};

/** @const {MediaTask} */
export const BlessTask = [
  bless,
  // Must be sync since it's from a user gesture
  /* requiresSynchronousExecution */ true,
];

/**
 * Updates the sources of the specified media element.
 * @param {!Window} win
 * @param {!Sources} newSources The sources to which the media element should
 *     be updated.
 * @return {MediaTask}
 */
export function createUpdateSourcesTask(win, newSources) {
  return [
    (mediaEl) => {
      Sources.removeFrom(win, mediaEl);
      newSources.applyToElement(win, mediaEl);
    },
    /* requiresSynchronousExecution */ true,
  ];
}

/**
 * Swaps a media element into the DOM, in the place of a placeholder element.
 * @param {!Element} placeholderEl The element to be replaced by the media
 *     element on which this task is executed.
 * @return {MediaTask}
 */
export function createSwapIntoDomTask(placeholderEl) {
  return [
    (mediaEl) => {
      if (!isConnectedNode(placeholderEl)) {
        return Promise.reject(
          'Cannot swap media for element that is not in DOM.'
        );
      }
      copyCssClasses(placeholderEl, mediaEl);
      copyAttributes(placeholderEl, mediaEl);
      placeholderEl.parentElement.replaceChild(mediaEl, placeholderEl);
    },
    /* requiresSynchronousExecution */ true,
  ];
}

/**
 * Swaps a media element out the DOM, replacing it with a placeholder element.
 * @param {!Element} placeholderEl The element to replace the media element on
 *     which this task is executed.
 * @return {MediaTask}
 */
export function createSwapOutOfDomTask(placeholderEl) {
  return [
    (mediaEl) => {
      copyCssClasses(mediaEl, placeholderEl);
      copyAttributes(mediaEl, placeholderEl);
      mediaEl.parentElement.replaceChild(placeholderEl, mediaEl);
    },
    /* requiresSynchronousExecution */ true,
  ];
}
