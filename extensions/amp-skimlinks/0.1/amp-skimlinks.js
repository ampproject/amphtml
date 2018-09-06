/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {whenDocumentReady} from '../../../src/document-ready';

import {Tracking} from './tracking';

import {AffiliateLinkResolver} from './affiliate-link-resolver';
import {SKIMLINKS_REWRITER_ID} from './constants';
import {EVENTS as linkRewriterEvents} from '../../../src/service/link-rewriter/constants';

import {EVENT_TYPE_CONTEXT_MENU} from '../../../src/service/navigation';
import {Waypoint} from './waypoint';
import {getAmpSkimlinksOptions} from './skim-options';
import {getBoundFunction} from './utils';

export class AmpSkimlinks extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = null;

    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = null;

    /** @private {?../../../src/service/document-info-impl.DocumentInfoDef} */
    this.docInfo_ = null;

    /** @private {?../../../src/service/link-rewriter/link-rewriter-manager.LinkRewriterManager} */
    this.linkRewriterService_ = null;

    /** @private {?Object} */
    this.skimOptions_ = null;

    /** @private {?./tracking.Tracking} */
    this.trackingService_ = null;

    /** @private {?./affiliate-link-resolver.AffiliateLinkResolver} */
    this.affiliateLinkResolver_ = null;

    /** @private {?./waypoint.Waypoint} */
    this.waypoint_ = null;

    /** @private {?../../../src/service/link-rewriter/link-rewriter.LinkRewriter} */
    this.skimlinksLinkRewriter_ = null;

  }

  /** @override */
  buildCallback() {
    this.xhr_ = Services.xhrFor(this.win);
    this.ampDoc_ = this.getAmpDoc();
    this.docInfo_ = Services.documentInfoForDoc(this.ampDoc_);
    this.linkRewriterService_ = Services.linkRewriterServiceForDoc(
        this.ampDoc_);

    this.skimOptions_ = getAmpSkimlinksOptions(this.element, this.docInfo_);

    return whenDocumentReady(
        /** @type {!Document} */ (this.ampDoc_.getRootNode())
    ).then(() => {
      this.startSkimcore_();
    });
  }

  /**
   * @private
   */
  startSkimcore_() {
    this.trackingService_ = this.initTracking_();
    this.waypoint_ = new Waypoint(
        /** @type {!../../../src/service/ampdoc-impl.AmpDoc} */
        (this.ampDoc_),
        this.trackingService_
    );
    this.affiliateLinkResolver_ = new AffiliateLinkResolver(
        /** @type {!../../../src/service/xhr-impl.Xhr} */
        (this.xhr_),
        this.skimOptions_,
        this.waypoint_
    );

    this.skimlinksLinkRewriter_ = this.initSkimlinksLinkRewriter_();
  }


  /**
   * Fires impression tracking after beacon API request.
   * @param {!Object} beaconData - Json response from Beacon API.
   * @private
   */
  sendImpressionTracking_({guid}) {
    // Update tracking service with extra info.
    this.trackingService_.setTrackingInfo({guid});
    const viewer = Services.viewerForDoc(
        /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
        (this.ampDoc_)
    );
    /*
      WARNING: Up to here, the code may have been executed during page
      pre-rendering. Wait for the page to be visible in the viewer before
      sending impression tracking.
    */
    viewer.whenFirstVisible().then(() => {
      this.trackingService_.sendImpressionTracking(
          this.skimlinksLinkRewriter_.getAnchorReplacementList()
      );
    });
  }

  /**
   * Called only on the first page scan.
   * Make a fallback call to beacon if no links were founds on the page.
   * Send the impression tracking once we have the beacon API response.
   * @return {Promise}
   */
  onPageScanned_() {
    // .firstRequest may be null if the page doesn't have any non-excluded
    // links.
    const beaconApiPromise = this.affiliateLinkResolver_.firstRequest ||
        // If it's the case, fallback with manual call
        this.affiliateLinkResolver_.fetchDomainResolverApi([]);

    return beaconApiPromise.then(this.sendImpressionTracking_.bind(this));
  }

  /**
   * Initialise Skimlinks LinkRewriter
   * @return {!../../../src/service/link-rewriter/link-rewriter.LinkRewriter}
   */
  initSkimlinksLinkRewriter_() {
    const options = {
      linkSelector: this.skimOptions_.linkSelector,
    };

    const linkRewriter = this.linkRewriterService_.registerLinkRewriter(
        SKIMLINKS_REWRITER_ID,
        getBoundFunction(this.affiliateLinkResolver_, 'resolveUnknownAnchors'),
        options
    );

    // We are only interested in the first page scan.
    linkRewriter.events.on(
        linkRewriterEvents.PAGE_SCANNED,
        once(this.onPageScanned_.bind(this))
    );

    linkRewriter.events.on(
        linkRewriterEvents.CLICK,
        this.onClick_.bind(this)
    );

    return linkRewriter;
  }

  /**
   * Initialise tracking module
   * @return {!./tracking.Tracking}
   * @private
   */
  initTracking_() {
    // 'amp-analytics' API is waiting for CommonSignals.LOAD_START to be
    // triggered before sending requests.
    // Normally CommonSignals.LOAD_START is sent from layoutCallback but since
    // we are using layout = 'nodisplay', 'layoutCallback' is never called.
    // We need to call it manually to have CustomEventReporterBuilder working.
    this.signals().signal(CommonSignals.LOAD_START);
    return new Tracking(this.element, this.skimOptions_);
  }

  /**
   * A click (left or right) on an anchor has happened,
   * fire NA clicks if needed.
   * @param {!{linkRewriterId: ?string, anchor: !HTMLElement, clickType: string}} eventData - click event information
   * @private
   */
  onClick_(eventData) {
    const doClickTracking = (
      // Test two scenarios:
      //  - Link hasn't been replaced at all: eventData.linkRewriterId === null
      //  - Link has been replaced but not by Skimlinks:
      //    E.g: eventData.linkRewriterId === "awin"
      eventData.linkRewriterId !== SKIMLINKS_REWRITER_ID &&
      // Also, context menu click should not send tracking
      eventData.clickType !== EVENT_TYPE_CONTEXT_MENU
    );

    if (doClickTracking) {
      this.trackingService_.sendNaClickTracking(eventData.anchor);
    }
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }
}


AMP.extension('amp-skimlinks', '0.1', AMP => {
  AMP.registerElement('amp-skimlinks', AmpSkimlinks);
});
