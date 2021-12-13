import {tryCallback} from '#core/error';
import {arrayOrSingleItemToArray} from '#core/types/array';

const AMP_CLASS = 'i-amphtml-element';
const DEEP = true;

/** @type {function(AmpElement): Promise<void>} */
const ensureLoaded = (element) => element.ensureLoaded();

/** @type {function(AmpElement): void} */
const pause = (element) => element.pause();

/** @type {function(AmpElement): Promise<void>} */
const unmount = (element) => element.unmount();

/**
 * Ensure all elements within this container are scheduled to load.
 *
 * @param {Element|Array<Element>} containerOrContainers
 * @param {boolean=} includeSelf
 */
export function loadAll(containerOrContainers, includeSelf = true) {
  forAllWithin(containerOrContainers, includeSelf, !DEEP, ensureLoaded);
}

/**
 * Pause all elements within this container.
 *
 * @param {Element|Array<Element>} containerOrContainers
 * @param {boolean=} includeSelf
 */
export function pauseAll(containerOrContainers, includeSelf = true) {
  forAllWithin(containerOrContainers, includeSelf, DEEP, pause);
}

/**
 * Unmount all elements within this container.
 *
 * @param {Element|Array<Element>} containerOrContainers
 * @param {boolean=} includeSelf
 */
export function unmountAll(containerOrContainers, includeSelf = true) {
  forAllWithin(containerOrContainers, includeSelf, DEEP, unmount);
}

/**
 * Execute a callback for all elements within the container.
 *
 * @param {Element|Array<Element>} containerOrContainers
 * @param {boolean} includeSelf
 * @param {boolean} deep
 * @param {function(AmpElement):void} callback
 */
export function forAllWithin(
  containerOrContainers,
  includeSelf,
  deep,
  callback
) {
  const containers = arrayOrSingleItemToArray(containerOrContainers);
  for (let i = 0; i < containers.length; i++) {
    forAllWithinInternal(containers[i], includeSelf, deep, callback);
  }
}

/**
 * Execute a callback for all elements within the container.
 *
 * @param {Element} container
 * @param {boolean} includeSelf
 * @param {boolean} deep
 * @param {function(AmpElement):void} callback
 */
function forAllWithinInternal(container, includeSelf, deep, callback) {
  if (includeSelf && container.classList.contains(AMP_CLASS)) {
    const ampContainer = /** @type {AmpElement} */ (container);
    tryCallback(callback, ampContainer);
    if (!deep) {
      // Also schedule amp-element that is a placeholder for the element.
      const placeholder = ampContainer.getPlaceholder();
      if (placeholder) {
        forAllWithinInternal(
          placeholder,
          /* includeSelf */ true,
          !DEEP,
          callback
        );
      }
      return;
    }
  }

  const descendants =
    /** @type {HTMLCollection} */
    (container.getElementsByClassName(AMP_CLASS));
  /** @type {?Array<Element>} */
  let seen = null;
  for (let i = 0; i < descendants.length; i++) {
    const descendant = /** @type {AmpElement} */ (descendants[i]);
    if (deep) {
      // In deep search all elements will be covered.
      tryCallback(callback, descendant);
    } else {
      // Breadth-first search. Rely on the `getElementsByClassName` DOM order
      // to ignore DOM subtrees already covered.
      seen = seen || [];
      let covered = false;
      for (let j = 0; j < seen.length; j++) {
        if (seen[j].contains(descendant)) {
          covered = true;
          break;
        }
      }
      if (!covered) {
        seen.push(descendant);
        tryCallback(callback, descendant);
      }
    }
  }
}
