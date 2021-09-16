/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {map} from '../../../src/utils/object';
import {user} from '../../../src/log';

/** @private Whether ids are deduplicated or not */
let deduplicatedIds = false;

/**
 * Deduplicates the interactive Ids, only called once
 * @param {!Document} doc
 */
export const deduplicateInteractiveIds = (doc) => {
  if (deduplicatedIds) {
    return;
  }
  deduplicatedIds = true;
  const interactiveEls = doc.querySelectorAll(
    'amp-story-interactive-binary-poll, amp-story-interactive-poll, amp-story-interactive-quiz'
  );
  const idsMap = map();
  for (let i = 0; i < interactiveEls.length; i++) {
    const currId = interactiveEls[i].id || 'interactive-id';
    if (idsMap[currId] === undefined) {
      idsMap[currId] = 0;
    } else {
      user().error(
        'AMP-STORY-INTERACTIVE',
        `Duplicate interactive ID ${currId}`
      );
      const newId = `${currId}__${++idsMap[currId]}`;
      interactiveEls[i].id = newId;
    }
  }
};
