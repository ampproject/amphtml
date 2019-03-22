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

import {listen} from '../../../../../src/event-helper';

export class ClickMonitor {
  /**
   * Creates an instance of ClickMonitor.
   */
  constructor() {
    this.iframeClickMap_ = {};
    this.pageClicks_ = 0;
    this.lastSelection_ = null;
    this.win_ = null;
  }

  /**
   * Adds event listener to ampdoc
   *
   * @param {!../../../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   */
  startForDoc(ampDoc) {
    this.win_ = ampDoc.win;
    this.lastSelection_ = this.win_.document.activeElement;

    listen(this.win_, 'blur', this.checkSelection_.bind(this));
    listen(this.win_, 'click', this.onPageClick_.bind(this));
  }

  /**
   * Checks for the last elected element
   */
  checkSelection_() {
    const {activeElement} = this.win_.document;

    if (!activeElement) {
      return;
    }

    const changeOccurred = activeElement !== this.lastSelection_;

    if (activeElement.tagName === 'IFRAME' && changeOccurred) {
      this.incrementFrameClick_(activeElement);
    }

    this.lastSelection_ = activeElement;
  }

  /**
   * Listener for clicks on window,
   * Set the last selected element.
   *
   */
  onPageClick_() {
    this.pageClicks_++;
    this.lastSelection_ = this.win_.document.activeElement;
  }

  /**
   * Increases a click count for the iframe
   *
   * @param {Element} activeElement
   */
  incrementFrameClick_(activeElement) {
    const trimSrc = activeElement.src.split('://').pop();

    if (!this.iframeClickMap_[trimSrc]) {
      this.iframeClickMap_[trimSrc] = 1;
    } else {
      this.iframeClickMap_[trimSrc]++;
    }
  }

  /**
   * Returns the number of page clicks
   *
   * @return {number}
   */
  getPageClicks() {
    return this.pageClicks_;
  }

  /**
   * Returns array of clicked iframes
   *
   * @return {string}
   */
  getIframeClickString() {
    return Object.keys(this.iframeClickMap_).map(key => {
      return `${key}|${this.iframeClickMap_[key]}`;
    }).join(',');
  }
}
