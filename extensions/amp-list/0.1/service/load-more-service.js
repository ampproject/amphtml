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

import {childElementByAttr} from '../../../../src/dom';
import {dev} from '../../../../src/log';
import {htmlFor} from '../../../../src/static-template';
import {setStyles} from '../../../../src/style';

export class LoadMoreService {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    /** @private {!Element} */
    this.ampListElement_ = element;
    /** @private {?Element} */
    this.loadMoreButton_ = null;
    /** @private {?Element} */
    this.loadMoreButtonClickable_ = null;
    /** @private {?Element} */
    this.loadMoreLoadingElement_ = null;
    /** @private {?Element} */
    this.loadMoreFailedElement_ = null;
    /** @private {?Element} */
    this.loadMoreFailedClickable_ = null;
    /** @private {?Element} */
    this.loadMoreEndElement_ = null;
  }

  /**
   */
  initializeLoadMore() {
    this.initializeLoadMoreButton_();
    this.initializeLoadMoreLoadingElement_();
    this.initializeLoadMoreFailedElement_();
    this.initializeLoadMoreEndElement_();
  }

  /**
   * @private
   */
  initializeLoadMoreButton_() {
    this.loadMoreButton_ = childElementByAttr(
        this.ampListElement_, 'load-more-button');

    if (this.loadMoreButton_) {
      this.loadMoreButton_.classList.add('amp-visible');
    } else {
      this.loadMoreButton_ = htmlFor(this.ampListElement_)`
        <amp-list-load-more load-more-button
          class="amp-visible i-amphtml-default-ui">
          <button load-more-clickable class="i-amphtml-list-load-more-button">
            <label>See More</label>
          </button>
        </amp-list-load-more>
      `;
    }
    // Even if it was provided by the user, we would still like to move it
    // to the end of amp-list after the container element.
    this.ampListElement_.appendChild(this.loadMoreButton_);
    // Hide this so that we can measure its height but not see it.
    setStyles(this.loadMoreButton_, {
      visibility: 'hidden',
    });
  }

  /**
   * @private
   */
  initializeLoadMoreLoadingElement_() {
    this.loadMoreLoadingElement_ = childElementByAttr(
        this.ampListElement_, 'load-more-loading');

    if (!this.loadMoreLoadingElement_) {
      this.loadMoreLoadingElement_ = htmlFor(this.ampListElement_)`
        <amp-list-load-more load-more-loading class="i-amphtml-default-ui">
          <div class="i-amphtml-list-load-more-spinner"></div>
        </amp-list-load-more>
      `;
    }
    // Even if it was provided by the user, we would still like to move it
    // to the end of amp-list after the container element.
    this.ampListElement_.appendChild(this.loadMoreLoadingElement_);
  }

  /**
   * @return {!Element}
   */
  getLoadMoreButton() {
    if (!this.loadMoreButton_) {
      this.initializeLoadMoreButton_();
    }
    return dev().assertElement(this.loadMoreButton_);
  }

  /**
   * @return {?Element}
   */
  getLoadMoreLoadingElement() {
    if (!this.loadMoreLoadingElement_) {
      this.initializeLoadMoreLoadingElement_();
    }
    return this.loadMoreLoadingElement_;
  }

  /**
   * @return {!Element}
   */
  getLoadMoreButtonClickable() {
    if (!this.loadMoreButtonClickable_) {
      const loadMoreButton = this.getLoadMoreButton();
      this.loadMoreButtonClickable_ =
        childElementByAttr(loadMoreButton, 'load-more-clickable') ||
        loadMoreButton;
    }
    return this.loadMoreButtonClickable_;
  }

  /**
   * @private
   */
  initializeLoadMoreFailedElement_() {
    this.loadMoreFailedElement_ = childElementByAttr(
        this.ampListElement_, 'load-more-failed');

    if (!this.loadMoreFailedElement_) {
      this.loadMoreFailedElement_ = htmlFor(this.ampListElement_)`
        <amp-list-load-more load-more-failed class="i-amphtml-default-ui">
          <div class="i-amphtml-list-load-more-message">
            Unable to Load More
          </div>
          <button load-more-clickable
            class="i-amphtml-list-load-more-button
                  i-amphtml-list-load-more-button-has-icon
                  i-amphtml-list-load-more-button-small"
          >
            <div class="i-amphtml-list-load-more-icon"></div>
            <label>Retry</label>
          </button>
        </amp-list-load-more>
      `;
    }

    this.ampListElement_.appendChild(this.loadMoreFailedElement_);
  }

  /**
   * @return {!Element}
   */
  getLoadMoreFailedElement() {
    if (!this.loadMoreFailedElement_) {
      this.initializeLoadMoreFailedElement_();
    }
    return dev().assertElement(this.loadMoreFailedElement_);
  }

  /**
   * @return {!Element}
   */
  getLoadMoreFailedClickable() {
    if (!this.loadMoreFailedClickable_) {
      const loadFailedElement = this.getLoadMoreFailedElement();
      this.loadMoreFailedClickable_ = childElementByAttr(
          loadFailedElement, 'load-more-clickable') ||
        loadFailedElement;
    }
    return this.loadMoreFailedClickable_;
  }

  /**
   * @private
   */
  initializeLoadMoreEndElement_() {
    if (!this.loadMoreEndElement_) {
      this.loadMoreEndElement_ = childElementByAttr(
          this.ampListElement_, 'load-more-end');
      if (this.loadMoreEndElement_) {
        this.ampListElement_.appendChild(this.loadMoreEndElement_);
      }
    }
  }

  /**
   * Not guaranteed to return an element because load-more-end elements
   * are not mandatory.
   * @return {?Element}
   */
  getLoadMoreEndElement() {
    return this.loadMoreEndElement_;
  }

  /**
   * Must be called in mutate context
   */
  setLoadMoreEnded() {
    this.getLoadMoreFailedElement().classList.toggle('amp-visible', false);
    this.getLoadMoreButton().classList.toggle('amp-visible', false);
    this.getLoadMoreLoadingElement().classList.toggle('amp-visible', false);
    const loadMoreEndElement = this.getLoadMoreEndElement();
    if (loadMoreEndElement) {
      loadMoreEndElement.classList.toggle('amp-visible', true);
    }
  }
  /**
   * Toggles the visibility of the load-more-loading element. Must be called
   * in mutate context.
   * @param {boolean} state
   */
  toggleLoadMoreLoading(state) {
    // If it's loading, then it's no longer failed or ended
    if (state) {
      this.getLoadMoreFailedElement().classList.toggle('amp-visible', false);
      const loadMoreEndElement = this.getLoadMoreEndElement();
      if (loadMoreEndElement) {
        loadMoreEndElement.classList.toggle('amp-visible', false);
      }
    }
    this.getLoadMoreButton().classList.toggle('amp-visible', !state);
    this.getLoadMoreLoadingElement().classList.toggle('amp-visible', state);
  }

  /**
   * Shows the load-more-failed element and hides the load-more-button
   * element.
   */
  setLoadMoreFailed() {
    const loadMoreFailedElement = this.getLoadMoreFailedElement();
    const loadMoreButton = this.getLoadMoreButton();
    if (!loadMoreFailedElement && !loadMoreButton) {
      return;
    }
    loadMoreFailedElement.classList.toggle('amp-visible', true);
    loadMoreButton.classList.toggle('amp-visible', false);
    this.getLoadMoreLoadingElement().classList.toggle('amp-visible', false);
  }

}
