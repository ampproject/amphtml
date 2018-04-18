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

import {listen} from '../../../../../src/event-helper';

export class ClickMonitor {
  constructor() {
    this.iframeClickMap_ = {};
    this.pageClicks_ = 0;
    this.lastSelection_ = null;
    this.win_ = null;
  }

  startForDoc(ampDoc) {
    this.win_ = ampDoc.win;
    this.lastSelection_ = this.win_.document.activeElement;

    listen(this.win_, 'blur', this.checkSelection_.bind(this));
    listen(this.win_, 'click', this.onPageClick_.bind(this));
  }

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

  onPageClick_() {
    this.pageClicks_++;
    this.lastSelection_ = this.win_.document.activeElement;
  }

  incrementFrameClick_(activeElement) {
    const trimSrc = activeElement.src.split('://').pop();

    if (!this.iframeClickMap_[trimSrc]) {
      this.iframeClickMap_[trimSrc] = 1;
    } else {
      this.iframeClickMap_[trimSrc]++;
    }
  }

  getPageClicks() {
    return this.pageClicks_;
  }

  getIframeClickString() {
    return Object.keys(this.iframeClickMap_).map(key => {
      return `${key}|${this.iframeClickMap_[key]}`;
    }).join(',');
  }
}
