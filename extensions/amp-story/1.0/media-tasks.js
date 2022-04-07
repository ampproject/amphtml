import {tryPlay} from '#core/dom/video';

import {Sources} from './sources';
import {getAmpVideoParent} from './utils';

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
 * @param {!Element} replaced
 * @param {!Element} inserted
 * @return {MediaTask}
 */
export function swapMediaElements(replaced, inserted) {
  copyCssClasses(replaced, inserted);
  copyAttributes(replaced, inserted);
  replaced.parentElement.replaceChild(inserted, replaced);
}

/**
 * @param {HTMLMediaElement} mediaEl
 */
export function play(mediaEl) {
  // We do not want to invoke play() if the media element is already
  // playing, as this can interrupt playback in some browsers.
  if (mediaEl.paused) {
    tryPlay(mediaEl);
  }
}

/** @param {HTMLMediaElement} mediaEl */
export function unmute(mediaEl) {
  mediaEl.muted = false;
  mediaEl.removeAttribute('muted');
}

/** @param {HTMLMediaElement} mediaEl */
export function mute(mediaEl) {
  mediaEl.muted = true;
  mediaEl.setAttribute('muted', '');
}

/**
 * "Blesses" the specified media element for future playback without a user
 * gesture.  In order for this to bless the media element, this function must
 * be invoked in response to a user gesture.
 * @param {HTMLMediaElement} mediaEl
 */
export function bless(mediaEl) {
  const isMuted = mediaEl.muted;
  mediaEl.muted = false;
  if (isMuted) {
    mediaEl.muted = true;
  }
}

/**
 * Updates the sources of the specified media element.
 * @param {!Window} win
 * @param {!HTMLMediaElement} mediaEl
 * @param {!Sources} newSources The sources to which the media element should
 *     be updated.
 * @return {MediaTask}
 */
export function updateSources(win, mediaEl, newSources) {
  Sources.removeFrom(win, mediaEl);
  newSources.applyToElement(win, mediaEl);
}

/**
 * @param {?Element|undefined} element
 * @return {undefined | Promise<void>}
 */
export function resetAmpMediaOnDomChange(element) {
  return getAmpVideoParent(element)
    ?.getImpl()
    .then((impl) => {
      impl.resetOnDomChange?.();
    });
}
