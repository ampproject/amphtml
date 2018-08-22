import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {whenDocumentReady} from '../../../src/document-ready';

import Tracking from './tracking';

import {SKIMLINKS_REWRITER_ID} from './constants';
import {EVENTS as linkRewriterEvents} from '../../../src/service/link-rewrite/constants';
import AffiliateLinkResolver from './affiliate-link-resolver';

import {getAmpSkimlinksOptions} from './skim-options';
import {getBoundFunction} from './utils';
import Waypoint from './waypoint';

/*** TODO:
 * - Fix issue with waypoint reporting links with macro variables.
 */

const startTime = new Date().getTime();


export class AmpSkimlinks extends AMP.BaseElement {

  /**
   * @override
   */
  buildCallback() {
    this.hasCalledBeacon = false;
    this.xhr_ = Services.xhrFor(this.win);
    this.ampDoc_ = this.getAmpDoc();
    this.docInfo_ = Services.documentInfoForDoc(this.ampDoc_);
    this.skimOptions_ = getAmpSkimlinksOptions(this.element, this.docInfo_);
    this.linkRewriterService = Services.linkRewriteServiceForDoc(this.ampDoc_);

    return whenDocumentReady(this.ampDoc_).then(() => {
      this.startSkimcore_();
    });
  }

  /**
   * Where everything start
   */
  startSkimcore_() {
    this.trackingService = this.initTracking();
    this.waypoint_ = new Waypoint(this.trackingService);
    this.affiliateLinkResolver = new AffiliateLinkResolver(
        this.xhr_,
        this.skimOptions_,
        this.waypoint_,
    );

    this.skimlinksLinkRewriter = this.initSkimlinksLinkRewriter();
  }


  /**
   *  Fires impression tracking after beacon request
   * @param {*} userSessionData
   */
  sendImpressionTracking_({guid}) {
    // Update tracking service with extra info.
    this.trackingService.setTrackingInfo({guid});
    this.trackingService.sendImpressionTracking(
        this.skimlinksLinkRewriter.getAnchorLinkReplacementMap(),
        startTime,
    );
  }

  /**
   * Called only on the first page scan.
   * Make a fallback call to beacon if no links where founds on the page.
   * Send the impression tracking once we have the beacon API response.
   */
  onPageScanned_() {
    let onBeaconApiResponse = this.affiliateLinkResolver.firstRequest;
    if (!onBeaconApiResponse) {
      onBeaconApiResponse = this.affiliateLinkResolver.fetchDomainResolverApi(
          []);
    }

    return onBeaconApiResponse.then(this.sendImpressionTracking_.bind(this));
  }

  /**
   * Initialise skimlinks link rewriter
   */
  initSkimlinksLinkRewriter() {
    const options = {
      linkSelector: this.skimOptions_.linkSelector,
    };

    const skimlinksLinkRewriter = this.linkRewriterService.registerLinkRewriter(
        SKIMLINKS_REWRITER_ID,
        getBoundFunction(this.affiliateLinkResolver, 'resolveUnknownAnchors'),
        options
    );

    // We are only interested in the first page scan.
    skimlinksLinkRewriter.events.on(
        linkRewriterEvents.PAGE_SCANNED,
        once(this.onPageScanned_.bind(this)),
    );

    skimlinksLinkRewriter.events.on(
        linkRewriterEvents.CLICK,
        this.onClick_.bind(this)
    );

    return skimlinksLinkRewriter;
  }

  /**
   * Initialise tracking module
   */
  initTracking() {
    // 'amp-analytics' api is waiting for CommonSignals.LOAD_START to be
    // triggered before sending requests.
    // Normally CommonSignals.LOAD_START is sent from layoutCallback but since
    // we are using layout = 'nodisplay', 'layoutCallback' is never called.
    // We need to call it manually to have CustomEventReporterBuilder working.
    this.signals().signal(CommonSignals.LOAD_START);
    return new Tracking(this.element, this.skimOptions_);
  }

  /**
   *
   * @param {*} eventData
   */
  onClick_(eventData) {
    // The link was not monetizable or the link was replaced
    // by an other linkRewriter.
    if (eventData.replacedBy !== SKIMLINKS_REWRITER_ID) {
      this.trackingService.sendNaClickTracking(eventData.anchor);
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
