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

// Used to calculate the delay between the amp-skimlinks extension being
// loaded and the page impression tracking request.
const startTime = new Date().getTime();

export class AmpSkimlinks extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.win);

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = this.getAmpDoc();

    /** @private {!../../../src/service/document-info-impl.DocumentInfoDef} */
    this.docInfo_ = Services.documentInfoForDoc(this.ampDoc_);

    /** @private {!../../../src/service/link-rewriter/link-rewriter-manager.LinkRewriterManager} */
    this.linkRewriterService_ = Services.linkRewriterServiceForDoc(
        this.ampDoc_);

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
    this.waypoint_ = new Waypoint(this.ampDoc_, this.trackingService_);
    this.affiliateLinkResolver_ = new AffiliateLinkResolver(
        this.xhr_,
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
    this.trackingService_.sendImpressionTracking(
        this.skimlinksLinkRewriter_.getAnchorReplacementList(),
        startTime
    );
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
