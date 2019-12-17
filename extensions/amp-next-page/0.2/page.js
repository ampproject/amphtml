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
import {devAssert} from '../../../src/log';

/** @enum {number} */
export const PageState = {
  QUEUED: 0,
  FETCHING: 1,
  LOADED: 2,
  FAILED: 3,
  INSERTED: 4,
};

/** @enum {number} */
export const PageRelativePos = {
  INSIDE_VIEWPORT: 0,
  OUTSIDE_VIEWPORT: 1,
  LEAVING_VIEWPORT: 2,
  CONTAINS_VIEWPORT: 3,
};

export class Page {
  /**
   * @param {!./service.NextPageService} manager
   * @param {{ url: string, title: string, image: string }} meta
   * @param {!PageState=} initState
   * @param {!VisibilityState=} initVisibility
   */
  constructor(
    manager,
    meta,
    initState = PageState.QUEUED,
    initVisibility = VisibilityState.PRERENDER
  ) {
    /** @private @const {!./service.NextPageService} */
    this.manager_ = manager;
    /** @private @const {string} */
    this.title_ = meta.title;
    /** @private {string} */
    this.url_ = meta.url;
    /** @private @const {string} */
    this.image_ = meta.image;

    /** @private {?../../../src/runtime.ShadowDoc} */
    this.shadowDoc_ = null;
    /** @private {!PageState} */
    this.state_ = initState;
    /** @private {?RelativePositions} */
    this.headerPosition_ = null;
    /** @private {?RelativePositions} */
    this.footerPosition_ = null;
    /** @private {!VisibilityState} */
    this.visibilityState_ = initVisibility;
    /** @private {!PageRelativePos} */
    this.relativePos_ = PageRelativePos.OUTSIDE_VIEWPORT;
  }

  /** @return {string} */
  get url() {
    return this.url_;
  }

  /**
   * @param {string} url
   */
  set url(url) {
    this.url_ = url;
  }

  /** @return {string} */
  get image() {
    return this.image_;
  }

  /** @return {string} */
  get title() {
    return this.title_;
  }

  /** @return {!PageRelativePos} */
  get relativePos() {
    return this.relativePos_;
  }

  /**
   * @return {boolean}
   */
  isVisible() {
    return this.visibilityState_ === VisibilityState.VISIBLE;
  }

  /**
   * @return {!VisibilityState}
   * @visibleForTesting
   */
  getVisibilityState() {
    return this.visibilityState_;
  }

  /**
   * @param {VisibilityState} visibilityState
   */
  setVisibility(visibilityState) {
    if (visibilityState == this.visibilityState_) {
      return;
    }
    // Update visibility internally and at the shadow doc level
    this.visibilityState_ = visibilityState;
    if (this.shadowDoc_) {
      this.shadowDoc_.setVisibilityState(visibilityState);
    }

    // Switch the title and url of the page to reflect this page
    if (visibilityState === VisibilityState.VISIBLE) {
      this.manager_.setTitlePage(this);
    }
  }

  /**
   * @return {boolean}
   */
  isFetching() {
    return this.state_ === PageState.FETCHING;
  }

  /**
   * @return {boolean}
   */
  isLoaded() {
    return (
      this.state_ === PageState.LOADED || this.state_ === PageState.INSERTED
    );
  }

  /**
   * Asks the next-page manager to fetch the document's HTML
   * and inserts it
   * @return {!Promise}
   */
  fetch() {
    // TOOD(wassgha): Should we re-fetch on failure? or show a failed state?
    // or skip to the next available document? (currently breaks silently)
    if (
      this.state_ === PageState.INSERTED ||
      this.state_ === PageState.FETCHING ||
      this.state_ === PageState.FAILED
    ) {
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
   * header element
   * @param {?PositionInViewportEntryDef} position
   */
  headerPositionChanged(position) {
    const prevHeaderPosition = this.headerPosition_;
    if (position.relativePos === prevHeaderPosition) {
      return;
    }
    this.headerPosition_ = position.relativePos;
    this.updateRelativePos_();
  }

  /**
   * Called when a position change is detected on the injected
   * footer element
   * @param {?PositionInViewportEntryDef} position
   */
  footerPositionChanged(position) {
    const prevFooterPosition = this.headerPosition_;
    if (position.relativePos === prevFooterPosition) {
      return;
    }
    this.footerPosition_ = position.relativePos;
    this.updateRelativePos_();
  }

  /**
   * Calculates the position of the document relative to the viewport
   * based on the positions of the injected footer and header elements
   * @private
   */
  updateRelativePos_() {
    const {headerPosition_: header, footerPosition_: footer} = this;
    const {INSIDE, TOP, BOTTOM} = RelativePositions;

    devAssert(
      header || footer,
      'next-page scroll triggered without a header or footer position'
    );

    if (header === INSIDE && footer === INSIDE) {
      // Both the header and footer are within the viewport bounds
      // meaning that the document is short enough to be
      // contained inside the viewport
      this.relativePos_ = PageRelativePos.INSIDE_VIEWPORT;
    } else if ((!header || header === TOP) && (!footer || footer === BOTTOM)) {
      // The head of the document is above the viewport and the
      // footer of the document is below it, meaning that the viewport
      // is looking at a section of the document
      this.relativePos_ = PageRelativePos.CONTAINS_VIEWPORT;
    } else if (
      ((!header || header === TOP) && footer === TOP) ||
      (header === BOTTOM && (!footer || footer === BOTTOM))
    ) {
      // Both the header and the footer of the document are either
      // above or below the document meaning that the viewport hasn't
      // reached the document yet or has passed it
      this.relativePos_ = PageRelativePos.OUTSIDE_VIEWPORT;
    } else {
      // The remaining case is the case where the document is halfway
      // through being scrolling into/out of the viewport in which case
      // we don't need to update the visibility
      this.relativePos_ = PageRelativePos.LEAVING_VIEWPORT;
      return;
    }

    this.manager_.updateVisibility();
  }
}
