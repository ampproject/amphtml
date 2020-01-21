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

import {ViewportRelativePos} from './visibility-observer';
import {VisibilityState} from '../../../src/visibility-state';

/** @enum {number} */
export const PageState = {
  QUEUED: 0,
  FETCHING: 1,
  LOADED: 2,
  FAILED: 3,
  INSERTED: 4,
};

const VISIBLE_DOC_CLASS = 'amp-next-page-document-visible';

export class Page {
  /**
   * @param {!./service.NextPageService} manager
   * @param {{ url: string, title: string, image: string }} meta
   */
  constructor(manager, meta) {
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
    this.state_ = PageState.QUEUED;
    /** @private {!VisibilityState} */
    this.visibilityState_ = VisibilityState.PRERENDER;
    /** @private {!ViewportRelativePos} */
    this.relativePos_ = ViewportRelativePos.OUTSIDE_VIEWPORT;
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

  /** @return {!ViewportRelativePos} */
  get relativePos() {
    return this.relativePos_;
  }

  /** @return {!Document|undefined} */
  get document() {
    if (!this.shadowDoc_) {
      return;
    }
    return /** @type {!Document} */ (this.shadowDoc_.ampdoc.getRootNode());
  }

  /** @param {!ViewportRelativePos} position */
  set relativePos(position) {
    this.relativePos_ = position;
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
      this.shadowDoc_.ampdoc
        .getBody()
        .classList.toggle(VISIBLE_DOC_CLASS, this.isVisible());
    }

    // Switch the title and url of the page to reflect this page
    if (this.isVisible()) {
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
}

export class HostPage extends Page {
  /**
   * @param {!./service.NextPageService} manager
   * @param {{ url: string, title: string, image: string }} meta
   * @param {!PageState} initState
   * @param {!VisibilityState} initVisibility
   * @param {!Document} initDoc
   */
  constructor(manager, meta, initState, initVisibility, initDoc) {
    super(manager, meta);
    /** @override */
    this.state_ = initState;
    /** @override */
    this.visibilityState_ = initVisibility;
    /** @private {!Document} */
    this.document_ = initDoc;
  }

  /** @override */
  get document() {
    return this.document_;
  }
}
