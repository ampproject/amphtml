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
import {getServicePromiseForDoc} from '../../../src/service';
import {toArray} from '../../../src/types';
import {pureUserAssert as userAssert} from '../../../src/core/assert';

/** @const {string} */
export const SERVICE_ID = 'liveListManager';

const TRANSFORMED_PREFIX = 'google;v=';

/**
 * Property used for storing id of custom slot. This custom slot can be used to
 * replace the default "items" and "update" slot.
 * @const {string}
 */
export const AMP_LIVE_LIST_CUSTOM_SLOT_ID = 'AMP_LIVE_LIST_CUSTOM_SLOT_ID';

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

    // Only start polling when doc is ready and when the doc is visible.
    this.whenDocReady_().then(() => {
      // Switch out the poller interval if we can find a lower one and
      // then make sure to stop polling if doc is not visible.
      this.interval_ = Math.min.apply(Math, this.intervals_);

      const initialUpdateTimes = Object.keys(this.liveLists_).map((key) =>
        this.liveLists_[key].getUpdateTime()
      );
      this.latestUpdateTime_ = Math.max.apply(Math, initialUpdateTimes);

      // For testing purposes only, we speed up the interval of the update.
      // This should NEVER be allowed in production.
      if (getMode().localDev) {
        const path = this.ampdoc.win.location.pathname;
        if (
          path.indexOf('/examples/live-list-update.amp.html') != -1 ||
          path.indexOf('/examples/live-blog.amp.html') != -1 ||
          path.indexOf('/examples/live-blog-non-floating-button.amp.html') != -1
        ) {
          this.interval_ = 5000;
        }
      }

      this.poller_ = new Poller(this.ampdoc.win, this.interval_, this.work_);

      // If no live-list is active on dom ready, we don't need to poll at all.
      if (this.ampdoc.isVisible() && this.hasActiveLiveLists_()) {
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
   * @param {!Element} element
   * @return {!Promise<!LiveListManager>}
   */
  static forDoc(element) {
    return /** @type {!Promise<!LiveListManager>} */ (getServicePromiseForDoc(
      element,
      SERVICE_ID
    ));
  }

  /**
   * Checks if any of the registered amp-live-list components is active/
   *
   * @return {boolean}
   * @private
   */
  hasActiveLiveLists_() {
    return Object.keys(this.liveLists_).some((key) => {
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
      url = addParamToUrl(
        url,
        'amp_latest_update_time',
        String(this.latestUpdateTime_)
      );
    }

    if (this.isTransformed_) {
      const urlService = Services.urlForDoc(this.ampdoc.getBody());
      url = urlService.getCdnUrlOnOrigin(url);
    }

    // TODO(erwinm): add update time here when possible.
    return fetchDocument(this.ampdoc.win, url, {}).then(
      this.updateLiveLists_.bind(this)
    );
  }

  /**
   * Gets all live lists and updates them with their corresponding counterparts.
   * Saves latest update time.
   *
   * @param {!Document} doc
   * @private
   */
  updateLiveLists_(doc) {
    this.installExtensionsForDoc_(doc);
    const allLiveLists = this.getLiveLists_(doc).concat(
      this.getCustomSlots_(doc)
    );
    const updateTimes = allLiveLists.map(this.updateLiveList_.bind(this));

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
   * Queries the document for all `amp-live-list` tags.
   *
   * @param {!Document} doc
   * @return {!Array<!Element>}
   * @private
   */
  getLiveLists_(doc) {
    return Array.prototype.slice.call(
      doc.getElementsByTagName('amp-live-list')
    );
  }

  /**
   * Queries for custom slots that will be used to host the live elements. This
   * overrides looking for live elements inside the default <amp-live-list>
   * element.
   *
   * @param {!Document} doc
   * @return {!Array<!Element>}
   * @private
   */
  getCustomSlots_(doc) {
    const liveListsWithCustomSlots = Object.keys(this.liveLists_).filter((id) =>
      this.liveLists_[id].hasCustomSlot()
    );

    return liveListsWithCustomSlots.map((id) => {
      const customSlotId = this.liveLists_[id].element[
        AMP_LIVE_LIST_CUSTOM_SLOT_ID
      ];
      return doc.getElementById(customSlotId);
    });
  }

  /**
   * Updates the appropriate `amp-live-list` with its updates from the server.
   *
   * @param {!Element} liveList Live list or custom element that built it.
   * @return {number}
   */
  updateLiveList_(liveList) {
    // amp-live-list elements can be appended dynamically in the client by
    // another component using the `i-amphtml-` + `other-component-id` +
    // `-dynamic-list` combination as the ID of the amp-live-list.
    //
    // The fact that we know how this ID is built allows us to find the
    // amp-live-list element in the server document. See live-story-manager.js
    // for an example.
    const dynamicId = 'i-amphtml-' + liveList.id + '-dynamic-list';
    const id =
      dynamicId in this.liveLists_ ? dynamicId : liveList.getAttribute('id');
    userAssert(id, 'amp-live-list must have an id.');
    userAssert(
      id in this.liveLists_,
      'amp-live-list#%s found but did not exist on original page load.',
      id
    );

    const inClientDomLiveList = this.liveLists_[id];
    inClientDomLiveList.toggle(
      !liveList.hasAttribute('disabled') &&
        // When the live list is an amp-story, we use an amp-story specific
        // attribute so publishers can disable the live story functionality.
        !liveList.hasAttribute('live-story-disabled')
    );

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
    if (id in this.liveLists_) {
      return;
    }
    this.liveLists_[id] = liveList;
    this.intervals_.push(liveList.getInterval());

    // Polling may not be started yet if no live lists were registered by
    // doc ready in LiveListManager's constructor.
    if (liveList.isEnabled() && this.poller_ && this.ampdoc.isVisible()) {
      this.poller_.start();
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
   * Listens to he doc visibility changed event.
   * @private
   */
  setupVisibilityHandler_() {
    // Polling should always be stopped when document is no longer visible.
    this.ampdoc.onVisibilityChanged(() => {
      if (this.ampdoc.isVisible() && this.hasActiveLiveLists_()) {
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
    const extensions = toArray(
      doc.querySelectorAll('script[custom-element], script[custom-template]')
    );
    extensions.forEach((script) => {
      const extensionName =
        script.getAttribute('custom-element') ||
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
  return Boolean(transformed) && transformed.startsWith(TRANSFORMED_PREFIX);
}
