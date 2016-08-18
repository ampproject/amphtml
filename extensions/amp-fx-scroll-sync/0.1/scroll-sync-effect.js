/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

export class ScrollSyncEffect {
  constructor(element) {
    /** @private {Element} */
    this.element_ = element;
    /** @private {number} */
    this.scrollMin_ = 0;
    /** @private {number} */
    this.scrollMax_ = 0;
  }

  isDirectional() {
    return false;
  }

  measure() {

  }

  requestMeasure() {

  }

  getScrollMin() {
    return this.scrollMin_;
  }

  getScrollMax() {
    return this.scrollMax_;
  }

  transition(unusedPosition) {

  }
}
