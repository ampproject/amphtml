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

import {isLayoutSizeDefined} from '../../../src/layout';
import {timeago} from '../../../third_party/timeagojs/timeago';
import {userAssert} from '../../../src/log';

export class AmpTimeAgo extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.datetime_ = '';

    /** @private {string} */
    this.locale_ = '';

    /** @private {string} */
    this.title_ = '';

    /** @private {?Element} */
    this.timeElement_ = null;

    /** @private {boolean} */
    this.cutOffReached_ = false;
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.textContent.length > 0,
      'Content cannot be empty. Found in: %s',
      this.element
    );

    this.datetime_ = this.element.getAttribute('datetime');
    this.locale_ =
      this.element.getAttribute('locale') ||
      this.win.document.documentElement.lang;
    this.title_ = this.element.textContent.trim();

    this.element.title = this.title_;
    this.element.textContent = '';

    this.timeElement_ = document.createElement('time');
    this.timeElement_.setAttribute('datetime', this.datetime_);

    this.setFuzzyTimestampValue_();
    this.element.appendChild(this.timeElement_);
  }

  /** @override */
  viewportCallback(inViewport) {
    if (inViewport && !this.cutOffReached_) {
      this.setFuzzyTimestampValue_();
    }
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const datetime = mutations['datetime'];
    if (datetime !== undefined) {
      this.datetime_ = datetime;
      this.setFuzzyTimestampValue_();
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @private */
  setFuzzyTimestampValue_() {
    if (this.element.hasAttribute('cutoff')) {
      const cutoff = parseInt(this.element.getAttribute('cutoff'), 10);
      const elDate = new Date(this.datetime_);
      const secondsAgo = Math.floor((Date.now() - elDate.getTime()) / 1000);

      if (secondsAgo > cutoff) {
        this.timeElement_.textContent = this.title_;
        this.cutOffReached_ = true;
      } else {
        this.timeElement_.textContent = timeago(this.datetime_, this.locale_);
      }
    } else {
      this.timeElement_.textContent = timeago(this.datetime_, this.locale_);
    }
  }
}

AMP.extension('amp-timeago', '0.1', AMP => {
  AMP.registerElement('amp-timeago', AmpTimeAgo);
});
