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

import {Action} from '../../amp-story/1.0/amp-story-store-service';
import {map} from '../../../src/utils/object';
import {toArray} from '../../../src/types';
import {user} from '../../../src/log';

export const updateInteractiveStoreState = (storeService, interactive) => {
  const update = {
    'option': interactive.getOptionSelected(),
    'interactiveId': interactive.getInteractiveId(),
  };
  storeService.dispatch(Action.ADD_INTERACTIVE_REACT, update);
};

/** @private Whether ids are deduplicated or not */
const deduplicatedIds = false;

/**
 * Deduplicates the interactive Ids, only called once
 * @param {Element} doc
 */
export const deduplicateInteractiveIds = (doc) => {
  if (deduplicatedIds) {
    return;
  }
  deduplicatedIds = true;
  const interactiveEls = doc.querySelectorAll(
    'amp-story-interactive-binary-poll, amp-story-interactive-poll, amp-story-interactive-quiz'
  );
  const interactiveIds = toArray(interactiveEls).map(
    (el) => el.id || 'interactive-id'
  );
  const idsMap = map();
  for (let i = 0; i < interactiveIds.length; i++) {
    if (idsMap[interactiveIds[i]] === undefined) {
      idsMap[interactiveIds[i]] = 0;
    } else {
      user().error(
        'AMP-STORY-INTERACTIVE',
        `Duplicate interactive ID ${interactiveIds[i]}`
      );
      const newId = `${interactiveIds[i]}__${++idsMap[interactiveIds[i]]}`;
      interactiveEls[i].id = newId;
      interactiveIds[i] = newId;
    }
  }
};
