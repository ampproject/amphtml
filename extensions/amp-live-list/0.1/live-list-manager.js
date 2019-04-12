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
import {Services} from '../../../src/services';
import {addParamToUrl} from '../../../src/url';
import {fetchDocument} from '../../../src/document-fetcher';
import {getMode} from '../../../src/mode';
import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service';
import {startsWith} from '../../../src/string';
import {toArray} from '../../../src/types';
import {userAssert} from '../../../src/log';

const SERVICE_ID = 'liveListManager';

const TRANSFORMED_PREFIX = 'google;v=';

/**
 * Manages registered AmpLiveList components.
 * Primarily handles network requests and updates the components
 * if necessary.
 * @implements {../../../src/service.Disposable}
 */
export class LiveListManager {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @private @const {!Object<string, !./amp-live-list.AmpLiveList>} */
    this.liveLists_ = Object.create(null);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc);

    /** @private @const {!../../../src/service/extensions-impl.Extensions} */
    this.extensions_ = Services.extensionsFor(this.ampdoc.win);

    /** @private {number} */
    this.interval_ = 15000;

    /** @private @const {!Array<number>} */
    this.intervals_ = [this.interval_];

    /** @private {?Poller} */
    this.poller_ = null;

    /** @private @const {string} */
    this.url_ = this.ampdoc.getUrl();

    /** @private {time} */
    this.latestUpdateTime_ = 0;

    /** @private @const {function(): Promise} */
    this.work_ = this.fetchDocument_.bind(this);

    /** @private @const {boolean} */
    this.isTransformed_ = isDocTransformed(ampdoc.getRootNode());

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
      if (getMode().localDev) {
        const path = this.ampdoc.win.location.pathname;
        if (path.indexOf('/examples/live-list-update.amp.html') != -1 ||
            path.indexOf('/examples/live-blog.amp.html') != -1 ||
            path.indexOf(
                '/examples/live-blog-non-floating-button.amp.html') != -1) {
          this.interval_ = 5000;
        }
      }

      this.poller_ = new Poller(this.ampdoc.win, this.interval_, this.work_);

      // If no live-list is active on dom ready, we don't need to poll at all.
      if (this.viewer_.isVisible() && this.hasActiveLiveLists_()) {
        this.poller_.start();
      }
      this.setupVisibilityHandler_();
    });
  }

  /** @override */
  dispose() {
    this.poller_.stop();
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

    if (this.isTransformed_) {
      const urlService = Services.urlForDoc(this.ampdoc.getBody());
      url = urlService.getCdnUrlOnOrigin(url);
    }

    // TODO(erwinm): add update time here when possible.
    return fetchDocument(this.ampdoc.win, url, {
      requireAmpResponseSourceOrigin: false,
    }).then(doc => {
      this.getLiveLists_(doc);
      this.getDynamicLiveLists_(doc);
    });
  }

  /**
    * Queries for dynamically added `amp-live-lists`.
    * @param {!Document} doc
    */
  getDynamicLiveLists_(doc) {
    const dynamicListsIds = Object.keys(this.liveLists_).filter(id =>
      this.liveLists_[id].element.hasAttribute('custom-container')
    );
    dynamicListsIds.forEach(this.updateCustomContainer_.bind(this, doc));
  }

  /**
   * Queries the document for all `amp-live-list` tags.
   *
   * @param {!Document} doc
   */
  getLiveLists_(doc) {
    this.installExtensionsForDoc_(doc);
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
    userAssert(id, 'amp-live-list must have an id.');
    userAssert(id in this.liveLists_,
        'amp-live-list#%s found but did not exist on original page load.', id);
    const inClientDomLiveList = this.liveLists_[id];
    inClientDomLiveList.toggle(!liveList.hasAttribute('disabled'));

    if (inClientDomLiveList.isEnabled()) {
      return inClientDomLiveList.update(liveList);
    }
    return 0;
  }

  /**
   * Updates the appropriate `custom-container` with its updates from the server.
   *
   * @param {!Document} doc
   * @param {string} inClientDomLiveListId
   */
  updateCustomContainer_(doc, inClientDomLiveListId) {
    userAssert(inClientDomLiveListId in this.liveLists_,
        'custom-container#%s found but did not exist on original page load.',
        inClientDomLiveListId);

    const inClientDomLiveList = this.liveLists_[inClientDomLiveListId];
    const containerId = inClientDomLiveList.element
        .getAttribute('custom-container');
    const serverContainer = doc.getElementById(containerId);

    return inClientDomLiveList.update(serverContainer);
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
    return this.ampdoc.whenReady();
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
   * @param {!Document} doc
   */
  installExtensionsForDoc_(doc) {
    const extensions = toArray(doc
        .querySelectorAll('script[custom-element], script[custom-template]'));
    extensions.forEach(script => {
      const extensionName = script.getAttribute('custom-element') ||
          script.getAttribute('custom-template');
      // This is a cheap operation if extension is already installed so no need
      // to over optimize checks.
      this.extensions_.installExtensionForDoc(this.ampdoc, extensionName);
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
 * Detects if a document has had transforms applied
 * e.g. by a domain with signed exchange domain enabled.
 * @param {!Document|!ShadowRoot} root
 * @return {boolean}
 */
function isDocTransformed(root) {
  if (!root.ownerDocument) {
    return false;
  }
  const {documentElement} = root.ownerDocument;
  const transformed = documentElement.getAttribute('transformed');
  return Boolean(transformed) && startsWith(transformed, TRANSFORMED_PREFIX);
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
function installLiveListManager(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      SERVICE_ID,
      LiveListManager,
      /* instantiate */ true);
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!LiveListManager}
 */
export function liveListManagerForDoc(ampdoc) {
  installLiveListManager(ampdoc);
  return getServiceForDoc(ampdoc, SERVICE_ID);
}
