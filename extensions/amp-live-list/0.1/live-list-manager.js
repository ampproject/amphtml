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
import {addParamToUrl} from '../../../src/url';
import {getMode} from '../../../src/mode';
import {registerServiceBuilder, getService} from '../../../src/service';
import {user} from '../../../src/log';
import {viewerForDoc} from '../../../src/services';
import {whenDocumentReady} from '../../../src/document-ready';
import {xhrFor} from '../../../src/services';


/**
 * Manages registered AmpLiveList components.
 * Primarily handles network requests and updates the components
 * if necessary.
 */
export class LiveListManager {

  constructor(win) {
    this.win = win;

    /** @private @const {!Object<string, !./amp-live-list.AmpLiveList>} */
    this.liveLists_ = Object.create(null);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.win.document);

    /** @private {number} */
    this.interval_ = 15000;

    /** @private @const {!Array<number>} */
    this.intervals_ = [this.interval_];

    /** @private {?Poller} */
    this.poller_ = null;

    /** @private @const {string} */
    this.url_ = this.win.location.href;

    /** @private {time} */
    this.latestUpdateTime_ = 0;

    /** @private @const {function(): Promise} */
    this.work_ = this.fetchDocument_.bind(this);

    // Only start polling when doc is ready and when the viewer is visible.
    this.whenDocReady_().then(() => {
      // Switch out the poller interval if we can find a lower one and
      // then make sure to stop polling if viewer is not visible.
      this.interval_ = Math.min.apply(Math, this.intervals_);

      const initialUpdateTimes = Object.keys(this.liveLists_)
          .map(key => this.liveLists_[key].getUpdateTime());
      this.latestUpdateTime_ = Math.max.apply(Math, initialUpdateTimes);

      // For testing purposes only, we speed up the interval of the update.
      // This should NEVER be allowed in production.
      if (getMode().localDev && (this.win.location.pathname == '/examples' +
            '/live-list-update.amp.max.html' ||
            this.win.location.pathname == '/examples/live-blog.amp' +
            '.max.html' || this.win.location.pathname == '/examples/' +
            'live-blog-non-floating-button.amp.max.html')) {
        this.interval_ = 5000;
      }

      this.poller_ = new Poller(this.win, this.interval_, this.work_);

      // If no live-list is active on dom ready, we don't need to poll at all.
      if (this.viewer_.isVisible() && this.hasActiveLiveLists_()) {
        this.poller_.start();
      }
      this.setupVisibilityHandler_();
    });
  }

  /**
   * Checks if any of the registered amp-live-list components is active/
   *
   * @return {boolean}
   * @private
   */
  hasActiveLiveLists_() {
    return Object.keys(this.liveLists_).some(key => {
      return this.liveLists_[key].isEnabled();
    });
  }

  /**
   * Makes a request to the given url for the latest document.
   *
   * @private
   */
  fetchDocument_() {
    let url = this.url_;
    if (this.latestUpdateTime_ > 0) {
      url = addParamToUrl(url, 'amp_latest_update_time',
          String(this.latestUpdateTime_));
    }
    return xhrFor(this.win)
        // TODO(erwinm): add update time here when possible.
        .fetchDocument(url, {
          requireAmpResponseSourceOrigin: false,
        }).then(this.getLiveLists_.bind(this));
  }

  /**
   * Queries the document for all `amp-live-list` tags.
   *
   * @param {!Document} doc
   */
  getLiveLists_(doc) {
    const lists = Array.prototype.slice.call(
        doc.getElementsByTagName('amp-live-list'));
    const updateTimes = lists.map(this.updateLiveList_.bind(this));
    const latestUpdateTime = Math.max.apply(Math, [0].concat(updateTimes));
    if (latestUpdateTime > 0) {
      this.latestUpdateTime_ = latestUpdateTime;
    }
    // We need to do this after calling `updateLiveList` since that
    // would apply the disabled attribute if any exist from the server.
    if (!this.hasActiveLiveLists_()) {
      this.poller_.stop();
    }
  }

  /**
   * Updates the appropriate `amp-live-list` with its updates from the server.
   *
   * @param {!Element} liveList
   * @return {number}
   */
  updateLiveList_(liveList) {
    const id = liveList.getAttribute('id');
    user().assert(id, 'amp-live-list must have an id.');
    user().assert(id in this.liveLists_, `amp-live-list#${id} found but did ` +
        `not exist on original page load.`);
    const inClientDomLiveList = this.liveLists_[id];
    inClientDomLiveList.toggle(!liveList.hasAttribute('disabled'));

    if (inClientDomLiveList.isEnabled()) {
      return inClientDomLiveList.update(liveList);
    }
    return 0;
  }

  /**
   * Register an `amp-live-list` instance for updates.
   *
   * @param {string} id
   * @param {!./amp-live-list.AmpLiveList} liveList
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

  /**
   * Default minimum data poll interval value.
   *
   * @return {number}
   */
  static getMinDataPollInterval() {
    // TODO(erwinm): determine if value is too low
    return 15000;
  }

  /**
   * Default minimum data max items per page value.
   *
   * @return {number}
   */
  static getMinDataMaxItemsPerPage() {
    return 1;
  }
}

/**
 * @param {!Window} win
 */
export function installLiveListManager(win) {
  registerServiceBuilder(win,
      'liveListManager',
      win => new LiveListManager(win));
}

/**
 * @param {!Window} win
 * @return {!LiveListManager}
 */
export function liveListManagerFor(win) {
  installLiveListManager(win);
  return getService(win, 'liveListManager');
}
