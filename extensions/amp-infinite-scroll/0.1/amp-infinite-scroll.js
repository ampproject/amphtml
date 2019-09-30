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

import {Layout} from '../../../src/layout';
import {DEFAULT_THRESHOLD} from '../../../src/intersection-observer-polyfill';
import {userAssert} from '../../../src/log';

export class AmpInfiniteScroll extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;
    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;
    /** @private {?string} */
    this.nextPageCursor_ = null;
  }

  createIntersectionObserver_() {
    if (!this.intersectionObserver_) {
      this.intersectionObserver_ = new IntersectionObserver(
        this.onIntersect.bind(this),
        {
          rootMargin: '0px',
          threshold: DEFAULT_THRESHOLD,
        }
      );
    }
    return this.intersectionObserver_;
  }

  /** @override */
  buildCallback() {
    this.nextPageCursor_ = userAssert(
      this.element.getAttribute('next-page'),
      'The next-page attribute is required for <amp-infinite-scroll> %s',
      this.element
    );

    this.container_ = this.element.ownerDocument.createElement('div');
    this.element.appendChild(this.container_);

    const ampDoc = this.getAmpDoc();
    const observer = this.createIntersectionObserver_();

    ampDoc.whenReady().then(() => {
      observer.observe(this.container_);
    });
  }

  processPage_(data) {
    this.nextPageCursor_ = data.nextPage;
    if (!this.nextPageCursor_) {
      this.intersectionObserver_.unobserve(this.container_);
      return;
    }
    const page = new DOMParser().parseFromString(data.page, 'text/html');
    this.mutateElement(() => {
      const fragment = document.createDocumentFragment();
      Array.from(page.body.children).forEach(el => {
        fragment.appendChild(el);
      });

      this.element.parentElement.insertBefore(fragment, this.element);
      this.intersectionObserver_.observe(this.container_);
    });
  }

  fetchPage_() {
    fetch(this.nextPageCursor_)
      .then(resp => {
        return resp.json();
      })
      .then(this.processPage_.bind(this));
  }

  onIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.intersectionObserver_.unobserve(this.container_);
        this.fetchPage_();
      }
    });
  }

  /** @override */
  unlayoutCallback() {
    removeElement(this.container_);
    this.container_ = null;
    // Needs to clean up intersectionObserverApi_
    if (this.intersectionObserver_) {
      this.intersectionObserver_.disconnect();
      this.intersectionObserver_ = null;
    }
    return true;
  }
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED;
  }
}

AMP.extension('amp-infinite-scroll', '0.1', AMP => {
  AMP.registerElement('amp-infinite-scroll', AmpInfiniteScroll);
});
