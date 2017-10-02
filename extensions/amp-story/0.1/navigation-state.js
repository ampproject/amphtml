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


/**
 * Types of state changes that can be consumed.
 * @enum {number}
 */
export const StateChangeType = {
  ACTIVE_PAGE: 0,
};


/** @typedef {{type: !StateChangeType, value: *}} */
export let StateChangeEventDef;


/**
 * State store to decouple navigation changes from consumers.
 */
export class NavigationState {
  constructor() {
    /** @private {!Observable<StateChangeEventDef>} */
    this.observable_ = new Observable();
  }

  /** @param {!function(!StateChangeEventDef):void} stateChangeFn */
  observe(stateChangeFn) {
    this.observable_.add(stateChangeFn);
  }

  /**
   * @param {number} index
   * @param {string=} opt_pageId
   */
  // TODO(alanorozco): pass whether change was automatic or on user action
  updateActivePage(index, opt_pageId) {
    const changeValue = {
      pageIndex: index,
    };

    if (opt_pageId) {
      changeValue.pageId = opt_pageId;
    }

    this.fire_(StateChangeType.ACTIVE_PAGE, changeValue);
  }

  /**
   * @param {!StateChangeType} changeType
   * @param {*} changeValue
   */
  fire_(changeType, changeValue) {
    this.observable_.fire({
      type: changeType,
      value: changeValue,
    });
  }
}
