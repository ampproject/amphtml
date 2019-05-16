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

import {addAttributesToElement} from '../../../src/dom';
import {devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {htmlFor} from '../../../src/static-template';

/**
 * Property used for storing id of custom slot. This custom slot can be used to
 * replace the default "items" and "update" slot.
 * @const {string}
 */
const AMP_LIVE_LIST_CUSTOM_SLOT_ID = 'AMP_LIVE_LIST_CUSTOM_SLOT_ID';

export class LiveStoryManager {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  constructor(ampStory) {
    this.ampStory_ = ampStory;
    this.storyEl_ = ampStory.element;
  }

  /**
   * Initializes an amp-live-list component with the story-specific
   * configuration and appends it to the DOM.
   */
  build() {
    const listId = userAssert(this.storyEl_.getAttribute('dynamic-live-list'),
        'Story must contain dynamic-live-list to build an amp-live-list');
    const liveListEl = htmlFor(this.storyEl_)`<amp-live-list></amp-live-list>`;
    addAttributesToElement(liveListEl,
        dict({
          'id': listId,
          'data-poll-interval':
            this.storyEl_.getAttribute('data-poll-interval') || 15000,
          'sort': 'ascending',
          'disable-scrolling': '',
          'disable-pagination': '',
          'auto-insert': '',
        }));
    liveListEl[AMP_LIVE_LIST_CUSTOM_SLOT_ID] = userAssert(this.storyEl_.id,
        'Story must contain id to build an amp-live-list');

    this.storyEl_.insertBefore(liveListEl, this.storyEl_.firstElementChild);
  }

  /**
   * Updates the client amp-story with the changes from the server document.
   *
   * @param {?EventTarget} updatedStoryEl
   * @param {!NodeList<!Element>} currentPages
   */
  update(updatedStoryEl, currentPages) {
    const newPageEls = devAssert(updatedStoryEl,
        'No updated story EventTarget was found.')
        .querySelectorAll('amp-story-page.amp-live-list-item-new');

    let lastPageEl = currentPages[currentPages.length - 1];

    const pageImplPromises = Array.prototype.map.call(newPageEls,
        pageEl => pageEl.getImpl());

    Promise.all(pageImplPromises).then(pages => {
      pages.forEach(page => {
        this.storyEl_.insertBefore(page.element, lastPageEl.nextElementSibling);
        this.ampStory_.addPage(page);
        this.ampStory_.insertPage(lastPageEl.id, page.element.id);
        lastPageEl = page.element;
      });
    });
  }
}

