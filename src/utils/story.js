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

import {closestAncestorElementBySelector, waitForChild} from '../dom';


/**
 * Checks if an element descends from `amp-story` in order to configure
 * story-specific behavior.
 *
 * This utility has a tree-scanning cost.
 * @param {!Element} element
 * @return {boolean}
 */
export function descendsFromStory(element) {
  return !!closestAncestorElementBySelector(element, 'amp-story');
}

/**
 * Returns true if the document is an amp-story.
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<boolean>}
 */
export function isStoryDocument(ampdoc) {
  return new Promise(resolve => {
    ampdoc.whenBodyAvailable().then(() => {
      const body = ampdoc.getBody();
      waitForChild(body, () => !!body.firstElementChild, () => {
        resolve(body.firstElementChild.tagName === 'AMP-STORY');
      });
    });
  });
}
