/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {rethrowAsync} from '../log';

const AMP_CLASS = 'i-amphtml-element';
const DEEP = true;

const ensureLoaded = (element) => element.ensureLoaded();
const pause = (element) => element.pause();
const unmount = (element) => element.unmount();

/**
 * Ensure all elements within this container are scheduled to load.
 *
 * @param {!Element|!Array<!Element>} containerOrContainers
 * @param {boolean=} includeSelf
 */
export function loadAll(containerOrContainers, includeSelf = true) {
  forAllWithin(containerOrContainers, includeSelf, !DEEP, ensureLoaded);
}

/**
 * Pause all elements within this container.
 *
 * @param {!Element|!Array<!Element>} containerOrContainers
 * @param {boolean=} includeSelf
 */
export function pauseAll(containerOrContainers, includeSelf = true) {
  forAllWithin(containerOrContainers, includeSelf, DEEP, pause);
}

/**
 * Unmount all elements within this container.
 *
 * @param {!Element|!Array<!Element>} containerOrContainers
 * @param {boolean=} includeSelf
 */
export function unmountAll(containerOrContainers, includeSelf = true) {
  forAllWithin(containerOrContainers, includeSelf, DEEP, unmount);
}

/**
 * Execute a callback for all elements within the container.
 *
 * @param {!Element|!Array<!Element>} containerOrContainers
 * @param {boolean} includeSelf
 * @param {boolean} deep
 * @param {function(!AmpElement)} callback
 */
export function forAllWithin(
  containerOrContainers,
  includeSelf,
  deep,
  callback
) {
  if (Array.isArray(containerOrContainers)) {
    for (let i = 0; i < containerOrContainers.length; i++) {
      forAllWithinInternal(
        containerOrContainers[i],
        includeSelf,
        deep,
        callback
      );
    }
  } else {
    forAllWithinInternal(containerOrContainers, includeSelf, deep, callback);
  }
}

/**
 * Execute a callback for all elements within the container.
 *
 * @param {!Element} container
 * @param {boolean} includeSelf
 * @param {boolean} deep
 * @param {function(!AmpElement)} callback
 */
function forAllWithinInternal(container, includeSelf, deep, callback) {
  if (includeSelf && container.classList.contains(AMP_CLASS)) {
    callCallback(callback, container);
    if (!deep) {
      // Also schedule amp-element that is a placeholder for the element.
      const placeholder = container.getPlaceholder();
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

  const descendants = container.getElementsByClassName(AMP_CLASS);
  let seen = null;
  for (let i = 0; i < descendants.length; i++) {
    const descendant = descendants[i];
    if (deep) {
      // In deep search all elements will be covered.
      callCallback(callback, descendant);
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
        callCallback(callback, descendant);
      }
    }
  }
}

/**
 * @param {function(!AmpElement)} callback
 * @param {!AmpElement} element
 */
function callCallback(callback, element) {
  try {
    callback(element);
  } catch (e) {
    rethrowAsync(e);
  }
}
