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
import {Observable} from '../../../src/observable';
import {StateProperty, getStoreService} from './amp-story-store-service';

/**
 * Types of state changes that can be consumed.
 * @enum {number}
 */
export const StateChangeType = {
  ACTIVE_PAGE: 0,
  BOOKEND_ENTER: 1,
  BOOKEND_EXIT: 2,
  END: 3,
};

/** @typedef {{type: !StateChangeType, value: *}} */
export let StateChangeEventDef;

/**
 * State store to decouple navigation changes from consumers.
 */
export class NavigationState {
  /**
   * @param {!Window} win
   * @param {function():Promise<boolean>} hasBookend
   */
  constructor(win, hasBookend) {
    /** @private @const {!function():Promise<boolean>} */
    this.hasBookend_ = hasBookend;

    /** @private {!Observable<StateChangeEventDef>} */
    this.observable_ = new Observable();

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    this.initializeListeners_();
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.BOOKEND_STATE, isActive => {
      if (isActive) {
        this.fire_(StateChangeType.BOOKEND_ENTER);
        this.fire_(StateChangeType.END);
      }

      if (!isActive) {
        this.fire_(StateChangeType.BOOKEND_EXIT);
      }
    });
  }

  /**
   * @param {function(!StateChangeEventDef):void} stateChangeFn
   */
  observe(stateChangeFn) {
    this.observable_.add(stateChangeFn);
  }

  /**
   * @param {number} pageIndex
   * @param {number} totalPages
   * @param {string} pageId
   * @param {?string} previousPageId
   * @param {boolean} isFinalPage
   * TODO(alanorozco): pass whether change was automatic or on user action.
   */
  updateActivePage(pageIndex, totalPages, pageId, previousPageId, isFinalPage) {
    const changeValue = {
      pageIndex,
      pageId,
      totalPages,
      previousPageId,
      storyProgress: pageIndex / totalPages,
    };

    this.fire_(StateChangeType.ACTIVE_PAGE, changeValue);

    if (isFinalPage) {
      this.hasBookend_().then(hasBookend => {
        if (!hasBookend) {
          this.fire_(StateChangeType.END);
        }
      });
    }
  }

  /**
   * @param {!StateChangeType} type
   * @param {*=} opt_changeValue
   */
  fire_(type, opt_changeValue) {
    this.observable_.fire({type, value: opt_changeValue});
  }
}
