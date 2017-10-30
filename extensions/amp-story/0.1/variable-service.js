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


/**
 * Variable service for amp-story.
 * Used for URL replacement service. See usage in src/url-replacements-impl.
 */
export class AmpStoryVariableService {
  constructor() {
    /** @private {?string} */
    this.pageIndex_ = null;

    /** @private {?number} */
    this.pageId_ = null;
  }

  /**
   * @param {!./navigation-state.StateChangeEventDef} stateChangeEvent
   */
  onStateChange(stateChangeEvent) {
    switch (stateChangeEvent.type) {
      case StateChangeType.ACTIVE_PAGE:
        const {pageIndex, pageId} = stateChangeEvent.value;
        this.pageIndex_ = pageIndex;
        this.pageId_ = pageId;
        break;
    }
  }

  /**
   * @return {number}
   */
  get pageIndex() {
    return dev().assertNumber(this.pageIndex_);
  }

  /**
   * @return {string}
   */
  get pageId() {
    return dev().assertString(this.pageId_);
  }
}
