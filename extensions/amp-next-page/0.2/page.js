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

import {PositionInViewportEntryDef} from '../../../src/service/position-observer/position-observer-worker';
import {RelativePositions} from '../../../src/layout-rect';
import {VisibilityState} from '../../../src/visibility-state';

/** @enum {string} */
export const PageState = {
  QUEUED: 'queued',
  FETCHING: 'fetching',
  LOADED: 'loaded',
  FAILED: 'failed',
  INSERTED: 'inserted',
};

/** @enum {string} */
export const PageRelativePos = {
  INSIDE_VIEWPORT: 'inside',
  OUTSIDE_VIEWPORT: 'outside',
  LEAVING_VIEWPORT: 'leaving',
  CONTAINS_VIEWPORT: 'contains',
};

/** @enum */
export const PageBound = {
  HEADER: 0,
  FOOTER: 1,
};

export class Page {
  /**
   * @param {!./service.NextPageService} manager
   * @param {string} url
   * @param {string} title
   * @param {string} image
   */
  constructor(manager, url, title, image) {
    /** @private {!./service.NextPageService} */
    this.manager_ = manager;
    /** @private {?../../../src/runtime.ShadowDoc} */
    this.shadowDoc_ = null;
    /** @private {!PageState} */
    this.state_ = PageState.QUEUED;
    /** @private {!Object<!PageBound, ?RelativePositions>} */
    this.boundPosition_ = {[PageBound.HEADER]: null, [PageBound.FOOTER]: null};
    /** @private {!VisibilityState} */
    this.visibilityState_ = VisibilityState.PRERENDER;

    // Public props
    /** @type {string} */
    this.title = title;
    /** @type {string} */
    this.url = url;
    /** @type {string} */
    this.image = image;
    /** @type {!PageRelativePos} */
    this.relativePos = PageRelativePos.OUTSIDE_VIEWPORT;
  }

  /**
   * @return {boolean}
   */
  isVisible() {
    return this.visibilityState_ == VisibilityState.VISIBLE;
  }

  /**
   * @return {!VisibilityState}
   * @visiblefortesting
   */
  getVisibilityState() {
    return this.visibilityState_;
  }

  /**
   * @param {boolean} visible
   */
  setVisible(visible) {
    // TODO(wassgha): Handle history manipulation
    // TODO(wassgha): Handle manual visibility management
    const visibilityState = visible
      ? VisibilityState.VISIBLE
      : VisibilityState.HIDDEN;

    // Update visibility internally and at the shadow doc level
    if (this.shadowDoc_ && visibilityState != this.visibilityState_) {
      this.shadowDoc_.setVisibilityState(visibilityState);
      this.visibilityState_ = visibilityState;
    }
  }

  /**
   * @return {boolean}
   */
  isFetching() {
    return this.state_ == PageState.FETCHING;
  }

  /**
   * @return {boolean}
   */
  isLoaded() {
    return this.state_ == PageState.LOADED || this.state_ == PageState.INSERTED;
  }

  /**
   * Asks the next-page manager to fetch the document's HTML
   * and inserts it
   * @return {!Promise}
   */
  fetch() {
    if (this.state_ == PageState.INSERTED) {
      return Promise.resolve();
    }

    this.state_ = PageState.FETCHING;

    return this.manager_
      .fetchPageDocument(this)
      .then(content => {
        this.state_ = PageState.LOADED;

        const shadowDoc = this.manager_.appendAndObservePage(this, content);
        if (shadowDoc) {
          this.shadowDoc_ = shadowDoc;
          this.manager_.setLastFetchedPage(this);
          this.state_ = PageState.INSERTED;
        } else {
          this.state_ = PageState.FAILED;
        }
      })
      .catch(() => {
        this.state_ = PageState.FAILED;
      });
  }

  /**
   * Called when a position change is detected on the injected
   * header and footer elements
   * @param {!PageBound} bound
   * @param {?PositionInViewportEntryDef} position
   */
  boundPositionChanged(bound, position) {
    const prevBoundPosition = this.boundPosition_[bound];
    if (position.relativePos === prevBoundPosition) {
      return;
    }
    this.boundPosition_[bound] = position.relativePos;
    this.updateRelativePos_();
  }

  /**
   * Calculates the position of the document relative to the viewport
   * based on the positions of the injected footer and header elements
   * @private
   */
  updateRelativePos_() {
    const header = this.boundPosition_[PageBound.HEADER];
    const footer = this.boundPosition_[PageBound.FOOTER];

    if (
      header == RelativePositions.INSIDE &&
      footer == RelativePositions.INSIDE
    ) {
      this.relativePos = PageRelativePos.INSIDE_VIEWPORT;
    } else if (
      header == RelativePositions.TOP &&
      (!footer || footer == RelativePositions.BOTTOM)
    ) {
      this.relativePos = PageRelativePos.CONTAINS_VIEWPORT;
    } else if (
      (header == RelativePositions.TOP && footer == RelativePositions.TOP) ||
      (header == RelativePositions.BOTTOM && footer == RelativePositions.BOTTOM)
    ) {
      this.relativePos = PageRelativePos.OUTSIDE_VIEWPORT;
    } else {
      this.relativePos = PageRelativePos.LEAVING_VIEWPORT;
    }
    this.manager_.updateVisibility();
  }
}
