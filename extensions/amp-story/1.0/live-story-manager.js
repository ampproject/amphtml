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

import {
  AMP_LIVE_LIST_CUSTOM_SLOT_ID,
} from '../../amp-live-list/0.1/live-list-manager';
import {AmpEvents} from '../../../src/amp-events';
import {createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {userAssert} from '../../../src/log';

export class LiveStoryManager {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  constructor(ampStory) {
    this.ampStory_ = ampStory;
  }

  /**
   * Initializes an amp-live-list component with the story-specific
   * configuration and appends it to the DOM.
   *
   * @param {string} liveListId
   */
  build(liveListId) {
    const liveListEl = createElementWithAttributes(this.ampStory_.win.document,
        'amp-live-list', dict({
          'id': liveListId,
          'data-poll-interval':
            this.ampStory_.element.getAttribute('data-poll-interval') || 15000,
          'sort': 'ascending',
          'disable-scrolling': '',
          'disable-pagination': '',
          'auto-insert': '',
        }));
    liveListEl[AMP_LIVE_LIST_CUSTOM_SLOT_ID] =
      userAssert(this.ampStory_.element.id,
          'Story must contain id to build an amp-live-list');

    this.ampStory_.element.insertBefore(liveListEl,
        this.ampStory_.element.firstElementChild);

    this.ampStory_.element.addEventListener(AmpEvents.DOM_UPDATE,
        ({target}) => {
          this.updateStory_(target);
        });
  }

  /**
   * Updates the client amp-story with the changes from the server document.
   *
   * @param {!Element} updatedStoryEl
   * @private
   */
  updateStory_(updatedStoryEl) {
    const newPages =
    ([].slice.call(updatedStoryEl.querySelectorAll('amp-story-page')))
        .filter(page => page.classList.contains('amp-live-list-item-new'));

    const currentPages =
      this.ampStory_.element.querySelectorAll('amp-story-page:not([ad])');
    let lastPage = currentPages[currentPages.length - 1];

    newPages.forEach(newPage => {
      this.ampStory_.element.insertBefore(newPage, lastPage.nextElementSibling);

      newPage.getImpl().then(page => {
        this.ampStory_.addPage(page);
        this.ampStory_.insertPage(lastPage.id, newPage.id);
      });

      lastPage = newPage;
    });
  }
}

