import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {whenDocumentReady} from '../../../src/document-ready';

import Tracking from './tracking';

import {SKIMLINKS_REWRITER_ID} from './constants';
import {EVENTS as linkRewriterEvents} from '../../../src/service/link-rewrite/constants';
import AffiliateLinkResolver from './affiliate-link-resolver';
import LinkRewriterService from '../../../src/service/link-rewrite/link-rewrite-service';

import {getAmpSkimlinksOptions} from './skim-options';
import {getBoundFunction, nextTick} from './utils';

/*** TODO:
 * - Fix issue with analytics reporting links with macro variables.
 * - Add amp-specific analytics variable (is_amp, canonical_url, original_page...)
 * - Investigate why AMP page is so slow to start (check window.t2 - window.t1)
 * - Check if win.location is correct in the context of amp served by google.co.uk
 * - Use no layout container
 */

const startTime = new Date().getTime();


export class AmpSkimlinks extends AMP.BaseElement {
  /**
   * @override
   */
  buildCallback() {
    window.t1 = new Date().getTime();
    this.hasCalledBeacon = false;
    this.xhr_ = Services.xhrFor(this.win);
    this.ampDoc_ = this.getAmpDoc();
    this.skimOptions_ = getAmpSkimlinksOptions(this.element, this.ampDoc_.win.location);
    this.linkRewriterService = new LinkRewriterService(this.ampDoc_.getRootNode());

    return whenDocumentReady(this.ampDoc_).then(() => {
      window.t2 = new Date().getTime();
      this.startSkimcore_();
    });
  }

  /**
   * Where everything start
   */
  startSkimcore_() {
    this.trackingService = this.initTracking();
    this.domainResolverService = new AffiliateLinkResolver(
        this.xhr_,
        this.skimOptions_,
        getBoundFunction(this.trackingService, 'getTrackingInfo')
    );

    this.skimlinksLinkRewriter = this.initSkimlinksLinkRewriter();
  }

  /**
   *
   */
  getResolveUnkownLinksFunction_() {
    const initBeaconCallbackHookONCE = once(this.initBeaconCallbackHook_.bind(this));
    return anchorList => {
      const twoStepsResponse = this.domainResolverService.resolveUnknownAnchors(anchorList);
      // Only called after the first page scan.
      initBeaconCallbackHookONCE(twoStepsResponse);

      return twoStepsResponse;
    };
  }

  /**
   *  Fires impression tracking after beacon request
   * @param {*} userSessionData
   */
  sendImpressionTracking_({guid}) {
    window.t3 = new Date().getTime();
    this.trackingService.sendImpressionTracking(
        {guid},
        this.skimlinksLinkRewriter.getAnchorLinkReplacementMap(),
        startTime,
    );
  }

  /**
   * @param {*} twoStepsResponse
   */
  initBeaconCallbackHook_(twoStepsResponse) {
    const trackFunction = this.sendImpressionTracking_.bind(this);
    // If we haven't called beacon on the first page scan (because not links were found)
    // Call it manually to get extra info like guid.
    if (!twoStepsResponse.asyncResponse) {
      return this.domainResolverService.fetchDomainResolverApi([])
          .then(trackFunction);
    }

    // 'updateAnchorMap_' from linkRewriter (link-rewriter.js) needs to be
    // updated before calling sendImpressionTracking_.
    // Since we have two ".then" branches attached to asyncResponse && the
    // ".then" in this function is declared before the .then inside
    // scanLinksOnPage_ (link-rewriter.js) => we need to delay the
    // twoStepsResponse.asyncResponse.then of this branch to the next tick
    // to ensure that twoStepsResponse.asyncResponse.then(updateAnchorMap_)
    // is executed frist.
    return nextTick().then(() => {
      return twoStepsResponse.asyncResponse.then(trackFunction);
    });

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
        this.getResolveUnkownLinksFunction_(),
        options
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
    // The link was not monetizable or the link was replaced by an other linkRewriter.
    if (eventData.replacedBy !== SKIMLINKS_REWRITER_ID) {
      this.trackingService.sendNaClickTracking(eventData.anchor);
    }
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  layoutCallback() {
    console.log('LAYOUT CALLBACK');
    // actually load your resource or render more expensive resources.
  }
}


AMP.extension('amp-skimlinks', '0.1', AMP => {
  AMP.registerElement('amp-skimlinks', AmpSkimlinks);
});
