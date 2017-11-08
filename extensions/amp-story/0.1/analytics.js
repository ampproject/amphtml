/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {StateChangeType} from './navigation-state';
import {dev} from '../../../src/log';
import {map} from '../../../src/utils/object';
import {triggerAnalyticsEvent} from '../../../src/analytics';


const Events = {
  PAGE_VISIBLE: 'story-page-visible',
};


/**
 * Intermediate handler for amp-story specific analytics.
 */
export class AmpStoryAnalytics {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    this.element_ = element;

    /** @private @const {!Object<number, boolean>} */
    this.seenPagesIndices_ = map();
  }

  /**
   * @param {!./navigation-state.StateChangeEventDef} stateChangeEvent
   */
  onStateChange(stateChangeEvent) {
    switch (stateChangeEvent.type) {
      case StateChangeType.ACTIVE_PAGE:
        const {pageIndex, pageId} = stateChangeEvent.value;
        this.onActivePageChange_(
            dev().assertNumber(pageIndex),
            dev().assertString(pageId));
        break;
    }
  }

  /**
   * @param {number} pageIndex
   * @param {string} pageId
   */
  onActivePageChange_(pageIndex, pageId) {
    if (!this.seenPagesIndices_[pageIndex]) {
      this.triggerEvent_(Events.PAGE_VISIBLE, {
        'storyPageIndex': pageIndex.toString(),
        'storyPageId': pageId,
      });

      this.seenPagesIndices_[pageIndex] = true;
    }
  }

  /**
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   * @private
   */
  triggerEvent_(eventType, opt_vars) {
    triggerAnalyticsEvent(this.element_, eventType, opt_vars);
  }
}
