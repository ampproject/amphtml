import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {whenDocumentReady} from '../../../src/document-ready';

import Tracking from './tracking';

import {SKIMLINKS_REWRITER_ID} from './constants';
import {EVENTS as linkRewriterEvents} from '../../../src/service/link-rewrite/constants';
import AffiliateLinkResolver from './affiliate-link-resolver';
import LinkRewriterService from '../../../src/service/link-rewrite/link-rewrite-service';

import {getAmpSkimlinksOptions} from './skim-options';
import {getBoundFunction} from './utils';

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
    this.userSessionDataDeferred_ = new Deferred();
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
    this.trackingService = new Tracking(this.element, this.skimOptions_);
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
  sendImpressionTracking_(userSessionData) {
    window.t3 = new Date().getTime();
    this.trackingService.sendImpressionTracking(
        userSessionData,
        this.skimlinksLinkRewriter.getAnchorLinkReplacementMap(),
        startTime,
    );
  };

  /**
   * @param {*} twoStepsResponse
   */
  initBeaconCallbackHook_(twoStepsResponse) {
    let waitForBeaconResponse = twoStepsResponse.asyncResponse;
    // If we haven't called beacon on the first page scan (because not links were found)
    // Call it manually to get extra info like guid.
    if (!waitForBeaconResponse) {
      waitForBeaconResponse = this.domainResolverService.fetchDomainResolverApi([]);
    }

    // TODO: Make sure this is called after .then updating AnchorLinkMap.
    return waitForBeaconResponse.then(({guid}) => {
      this.sendImpressionTracking_({guid});
    });
  }

  /**
   * Initialise skimlinks link rewriter
   */
  initSkimlinksLinkRewriter() {
    const options = {
      linkSelector: this.skimOptions_.linkSelector,
    };

    this.skimlinksLinkRewriter = this.linkRewriterService.registerLinkRewriter(
        SKIMLINKS_REWRITER_ID,
        this.getResolveUnkownLinksFunction_(),
        options
    );

    this.skimlinksLinkRewriter.events.on(
        linkRewriterEvents.CLICK,
        this.onClick_.bind(this)
    );

    return this.skimlinksLinkRewriter;
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
