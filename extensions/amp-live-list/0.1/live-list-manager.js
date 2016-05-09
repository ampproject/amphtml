/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {Poller} from './poller';
import {getService} from '../../../src/service';
import {user} from '../../../src/log';
import {viewerFor} from '../../../src/viewer';
import {whenDocumentReady} from '../../../src/document-ready';
import {xhrFor} from '../../../src/xhr';


/**
 * Manages registered AmpLiveList components.
 * Primarily handles network requests and updates the components
 * if necessary.
 *
 * @visibleForTesting
 */
export class LiveListManager {

  constructor(win) {
    this.win = win;

    /** @private @const {!Object<string, !AmpLiveList>} */
    this.liveLists_ = Object.create(null);

    /** @private @const {!Viewer} */
    this.viewer_ = viewerFor(this.win);

    /** @private {number} */
    this.interval_ = 15000;

    /** @private @const {!Array<number>} */
    this.intervals_ = [this.interval_];

    /** @private {?Poller} */
    this.poller_ = null;

    /** @private @const {string} */
    this.url_ = this.win.location.href;

    /** @private @const {function(): Promise} */
    this.work_ = this.fetchDocument_.bind(this, this.url_);

    // Only start polling when doc is ready and when the viewer is visible.
    this.whenDocReady_().then(() => {
      // Switch out the poller interval if we can find a lower one and
      // then make sure to stop polling if viewer is not visible.
      this.interval_ = Math.min.apply(Math, this.intervals_);
      this.poller_ = new Poller(this.win, this.interval_, this.work_);

      if (this.viewer_.isVisible()) {
        this.poller_.start();
      }
      this.setupVisibilityHandler_();
    });
  }

  /**
   * Makes a request to the given url for the latest document.
   *
   * @param {string} url
   * @private
   */
  fetchDocument_(url) {
    return xhrFor(this.win)
        // TODO(erwinm): add update time here when possible.
        .fetchDocument(url)
        .then(this.getLiveLists_.bind(this));
  }

  /**
   * Queries the document for all `amp-live-list` tags.
   *
   * @param {!HTMLDocument} doc
   */
  getLiveLists_(doc) {
    const lists = Array.prototype.slice.call(
        doc.getElementsByTagName('amp-live-list'));
    lists.forEach(this.updateLiveList_.bind(this));
  }

  /**
   * Updates the appropriate `amp-live-list` with its updates from the server.
   *
   * @param {!HTMLElement} liveList
   */
  updateLiveList_(liveList) {
    const id = liveList.getAttribute('id');
    user.assert(id, 'amp-live-list must have an id.');
    user.assert(id in this.liveLists_, `amp-live-ist#${id} found but did not ` +
        `exist on original page load`);
    this.liveLists_[id].update(liveList);
  }

  /**
   * Register an `amp-live-list` instance for updates.
   *
   * @param {number} id
   * @param {!AmpLiveList} liveList
   */
  register(id, liveList) {
    const isNotRegistered = !(id in this.liveLists_);
    if (isNotRegistered) {
      this.liveLists_[id] = liveList;
      this.intervals_.push(liveList.getInterval());
    }
  }

  /**
   * Returns a promise that is resolved when the document is ready.
   * @return {!Promise}
   * @private
   */
  whenDocReady_() {
    return whenDocumentReady(this.win.document);
  }

  /**
   * Listens to he viewer visibility changed event.
   * @private
   */
  setupVisibilityHandler_() {
    // Polling should always be stopped when document is no longer visible.
    this.viewer_.onVisibilityChanged(() => {
      if (this.viewer_.isVisible()) {
        // We use immediate so that the user starts getting updates
        // right away when they've switched back to the page.
        this.poller_.start(/** immediate */ true);
      } else {
        this.poller_.stop();
      }
    });
  }
}

/**
 * @param {!Window} window
 * @return {!LiveListManager}
 */
export function installLiveListManager(win) {
  return getService(win, 'liveListManager', () => {
    return new LiveListManager(win);
  });
}
