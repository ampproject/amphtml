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
import {Services} from '../../../src/services';
import {StateChangeType} from './navigation-state';
import {dev} from '../../../src/log';
import {map} from '../../../src/utils/object';
import {triggerAnalyticsEvent} from '../../../src/analytics';


/** @enum {string} */
const Events = {
  PAGE_VISIBLE: 'story-page-visible',
  BOOKEND_ENTER: 'story-bookend-enter',
  BOOKEND_EXIT: 'story-bookend-exit',
  STORY_MUTED: 'story-audio-muted',
  STORY_UNMUTED: 'story-audio-unmuted',
};


/**
 * Intermediate handler for amp-story specific analytics.
 */
export class AmpStoryAnalytics {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private @const {!Object<string, boolean>} */
    this.seenPagesIds_ = map();
  }

  /**
   * @param {!./navigation-state.StateChangeEventDef} stateChangeEvent
   */
  onNavigationStateChange(stateChangeEvent) {
    switch (stateChangeEvent.type) {
      case StateChangeType.ACTIVE_PAGE:
        this.triggerEvent_(Events.PAGE_VISIBLE);
        break;
      case StateChangeType.BOOKEND_ENTER:
        this.triggerEvent_(Events.BOOKEND_ENTER);
        break;
      case StateChangeType.BOOKEND_EXIT:
        this.triggerEvent_(Events.BOOKEND_EXIT);
        break;
    }
  }

  /**
   * @param {boolean} isMuted
   */
  onMutedStateChange(isMuted) {
    const event = isMuted ? Events.STORY_MUTED : Events.STORY_UNMUTED;
    this.triggerEvent_(event);
  }

  /**
   * @param {string} eventType
   * @private
   */
  triggerEvent_(eventType) {
    const variablesPromise = Services.storyVariableServiceForOrNull(this.win_);
    variablesPromise.then(
        variables => {
          triggerAnalyticsEvent(this.element_, eventType,
              /** @type {!Object<string, string>} */ (variables));
        },
        reason => {
          dev().error('AMP-STORY', 'Could not get analytics variables', reason);
        });
  }
}
