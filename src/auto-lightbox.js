/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {ChunkPriority, chunk} from './chunk';
import {Services} from './services';
import {dev} from './log';
import {isAmphtml} from './format';
import {isStoryDocument} from './utils/story';

/** @const @enum {string} */
export const AutoLightboxEvents = {
  // Triggered when the lightbox attribute is newly set on an item in order to
  // process by the renderer extension (e.g. amp-lightbox-gallery).
  NEWLY_SET: 'amp-auto-lightbox:newly-set',
};

/**
 * Installs the amp-auto-lightbox extension.
 *
 * This extension conditionally loads amp-lightbox-gallery for images and videos
 * that fulfill a set criteria on certain documents.
 *
 * Further information on spec/auto-lightbox.md and the amp-auto-lightbox extension
 * code.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installAutoLightboxExtension(ampdoc) {
  const {win} = ampdoc;
  // Only enabled on single documents tagged as <html amp> or <html ⚡>.
  if (!isAmphtml(win.document) || !ampdoc.isSingleDoc()) {
    return;
  }
  chunk(
    ampdoc,
    () => {
      isStoryDocument(ampdoc).then((isStory) => {
        // Do not enable on amp-story documents.
        if (isStory) {
          return;
        }
        Services.extensionsFor(win).installExtensionForDoc(
          ampdoc,
          'amp-auto-lightbox'
        );
      });
    },
    ChunkPriority.LOW
  );
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
export function isActionableByTap(element) {
  if (element.tagName.toLowerCase() == 'a' && element.hasAttribute('href')) {
    return true;
  }
  if (element.querySelector('a[href]')) {
    return true;
  }
  const action = Services.actionServiceForDoc(element);
  const hasTapAction = action.hasResolvableAction(
    element,
    'tap',
    dev().assertElement(element.parentElement)
  );
  if (hasTapAction) {
    return true;
  }
  const actionables = element.querySelectorAll('[on]');
  for (let i = 0; i < actionables.length; i++) {
    const actionable = actionables[i];
    const hasTapAction = action.hasResolvableAction(
      actionable,
      'tap',
      dev().assertElement(actionable.parentElement)
    );
    if (hasTapAction) {
      return true;
    }
  }
  return false;
}
