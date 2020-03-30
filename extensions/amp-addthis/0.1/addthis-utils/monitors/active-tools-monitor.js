/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {RE_ALPHA} from '../../constants';

const RE_NUMDASH = /[0-9\-].*/;

export class ActiveToolsMonitor {
  /**
   * Creates an instance of ActiveToolsMonitor.
   */
  constructor() {
    this.activePcos_ = {};
  }

  /**
   * @param {*} widget
   * @return {void}
   */
  record(widget) {
    // Get the "clean" PCO (no numbers or dashes) from the widget.
    const pco = (widget.id || widget.pco || '').replace(RE_NUMDASH, '');

    // PCOs must be alpha strings, and we don't want duplicates.
    if (!pco || this.activePcos_[pco] || !RE_ALPHA.test(pco)) {
      return;
    }

    this.activePcos_[pco] = pco;
  }

  /**
   * @param {*} productCode
   * @return {void}
   */
  recordProductCode(productCode) {
    // Get the "clean" PCO (no numbers or dashes) from the widget.
    const pco = productCode;

    // PCOs must be alpha strings, and we don't want duplicates.
    if (!pco || this.activePcos_[pco] || !RE_ALPHA.test(pco)) {
      return;
    }

    this.activePcos_[pco] = pco;
  }

  /**
   * @return {!Array}
   */
  getActivePcos() {
    return Object.keys(this.activePcos_);
  }
}
