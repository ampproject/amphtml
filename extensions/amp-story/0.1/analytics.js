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
import {hasOwn, map} from '../../../src/utils/object';
import {triggerAnalyticsEvent} from '../../../src/analytics';


const Events = {
  PAGE_VISIBLE: 'story-page-visible',
};


let triggerAnalyticsEventImpl = triggerAnalyticsEvent;


/**
 * @param {!Function} fn
 * @visibleForTesting
 */
export function setTriggerAnalyticsEventImplForTesting(fn) {
  triggerAnalyticsEventImpl = fn;
  return fn;
}


/**
 * @visibleForTesting
 */
export function resetTriggerAnalyticsEventImplForTesting() {
  triggerAnalyticsEventImpl = triggerAnalyticsEvent;
}


/**
 * Intermediate handler for amp-story specific analytics.
 * @implements {./navigation-state.ConsumerDef}
 */
export class AnalyticsTrigger {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    this.element_ = element;

    /** @private @const {!Object<string, boolean>} */
    this.pagesSeen_ = map();
  }

  /**
   * @param {!./navigation-state.StateChangeEvent} stateChangeEvent
   */
  onStateChange(stateChangeEvent) {
    switch(stateChangeEvent.type) {
      case StateChangeType.ACTIVE_PAGE:
        this.onActivePageChange_(
            dev().assertNumber(stateChangeEvent.value.pageIndex),
            dev().assertString(stateChangeEvent.value.pageId));
      break;
    }
  }

  /**
   * @param {number} pageIndex
   * @param {string} pageId
   */
  onActivePageChange_(pageIndex, pageId) {
    if (this.shouldTriggerPageVisible_(pageIndex)) {
      this.triggerEvent_(Events.PAGE_VISIBLE, {
        'pageIndex': pageIndex.toString(),
        'pageId': pageId,
      });

      this.pagesSeen_[pageIndex] = true;
    }
  }

  /**
   * @param {number} pageIndex
   * @return {boolean}
   */
  shouldTriggerPageVisible_(pageIndex) {
    return !hasOwn(this.pagesSeen_, pageIndex);
  }

  /**
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   * @private
   */
  triggerEvent_(eventType, opt_vars) {
    triggerAnalyticsEventImpl(this.element_, eventType, opt_vars);
  }
}
