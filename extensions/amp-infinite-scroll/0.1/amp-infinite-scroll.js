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

import {
  DEFAULT_THRESHOLD,
  IntersectionObserverPolyfill,
  nativeIntersectionObserverSupported,
} from '../../../src/intersection-observer-polyfill';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setStyle} from '../../../src/style';
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
    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = null;
  }

  /** @override */
  buildCallback() {
    this.nextPageCursor_ = userAssert(
      this.element.getAttribute('next-page'),
      'The next-page attribute is required for <amp-infinite-scroll> %s',
      this.element
    );

    this.container_ = this.createContainer_();
    this.element.appendChild(this.container_);

    this.ampDoc_ = this.getAmpDoc();
    const observer = this.createIntersectionObserver_();

    this.ampDoc_.whenReady().then(() => {
      observer.observe(this.container_);
    });
  }

  /** @override */
  unlayoutCallback() {
    this.removeElement(this.container_);
    this.container_ = null;
    if (this.intersectionObserver_) {
      this.intersectionObserver_.disconnect();
      this.intersectionObserver_ = null;
    }
    return true;
  }
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @private
   * @return {IntersectionObserver|../../../src/intersection-observer-polyfill.IntersectionObserverPolyfill}
   */
  getIntersectionObserverImplementation_() {
    if (nativeIntersectionObserverSupported(this.ampDoc_.win)) {
      return IntersectionObserver;
    } else {
      return IntersectionObserverPolyfill;
    }
  }

  /**
   * @private
   * @return {IntersectionObserver}
   */
  createIntersectionObserver_() {
    const ObserverImplementation = this.getIntersectionObserverImplementation_();
    if (!this.intersectionObserver_) {
      this.intersectionObserver_ = new ObserverImplementation(
        this.intersectCallback_.bind(this),
        {
          rootMargin: '0px',
          threshold: DEFAULT_THRESHOLD,
        }
      );
    }
    return this.intersectionObserver_;
  }

  /**
   * @private
   * @return {Element}
   */
  createContainer_() {
    const container = this.element.ownerDocument.createElement('div');
    setStyle(container, 'height', '1px');
    setStyle(container, 'width', '1px');
    return container;
  }

  /**
   * @private
   * @param {{page: string, nextPage: string}} data
   */
  processPage_(data) {
    this.togglePlaceholder(false);
    this.nextPageCursor_ = data.page ? data.nextPage : null;
    const page = new DOMParser().parseFromString(data.page, 'text/html');
    this.mutateElement(() => {
      const fragment = this.element.ownerDocument.createDocumentFragment();
      Array.from(page.body.children).forEach(el => {
        fragment.appendChild(el);
      });
      this.element.parentElement.insertBefore(fragment, this.element);
      this.intersectionObserver_.observe(this.container_);
    });
  }

  /**
   * @private
   */
  processError_() {
    this.togglePlaceholder(false);
    this.toggleFallback(true);
  }

  /**
   * @private
   * @return {Promise}
   * */
  fetchPage_() {
    return fetch(this.nextPageCursor_).then(resp => {
      return resp.json();
    });
  }

  /**
   * @private
   * @param {IntersectionObserverEntry} entries
   * @private
   * */
  intersectCallback_(entries) {
    const intersectEl = entries.find(entry => entry.isIntersecting);
    if (intersectEl) {
      this.fireLoad_();
    }
  }

  /**
   * @private
   * @return {!Promise}
   */
  fireLoad_() {
    this.intersectionObserver_.unobserve(this.container_);
    if (this.nextPageCursor_) {
      this.togglePlaceholder(true);
      return this.fetchPage_()
        .then(this.processPage_.bind(this))
        .catch(this.processError_.bind(this));
    } else {
      return Promise.resolve(null);
    }
  }
}

AMP.extension('amp-infinite-scroll', '0.1', AMP => {
  AMP.registerElement('amp-infinite-scroll', AmpInfiniteScroll);
});
