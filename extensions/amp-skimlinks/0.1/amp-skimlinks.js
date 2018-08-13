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
    this.onBeaconCallbacknDataONCE_ = once(this.onBeaconCallback_.bind(this));
    this.userSessionDataDeferred_ = new Deferred();
    this.linkRewriterService = new LinkRewriterService(this.ampDoc_);
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
        getBoundFunction(this.trackingService, 'getTrackingInfo'),
        this.onBeaconCallbackONCE_
    );

    this.skimlinksLinkRewriter = this.initSkimlinksLinkRewriter(this.trackingService,this.domainResolverService);

    // Fire impression tracking after we have received beaconRequest
    // TODO: Should this be fired onexit?
    this.userSessionDataDeferred_.promise.then(userSessionData => {
      window.t3 = new Date().getTime();
      this.trackingService.sendImpressionTracking(
          userSessionData,
          this.skimlinksLinkRewriter.getAnchorLinkReplacementMap(),
          startTime,
      );
    });
  }

  /**
   * Resolve promise
   * @param {*} beaconData
   */
  onBeaconCallback_(beaconData) {
    this.hasCalledBeacon = true;
    this.userSessionDataDeferred_.resolve({
      guid: beaconData.guid,
    });
  }

  /**
   * Fallback
   */
  callBeaconIfNotAlreadyDone_() {
    if (!this.hasCalledBeacon) {
      this.domainResolverService.fetchDomainResolverApi([])
          .then(this.onBeaconCallbacknDataONCE_);
    }
  }

  /**
   * Initialise skimlinks link rewriter
   */
  initSkimlinksLinkRewriter() {
    const resolveFunction = getBoundFunction(this.domainResolverService, 'resolveUnknownAnchors');
    const options = {
      linkSelector: this.skimOptions_.linkSelector,
    };

    this.skimlinksLinkRewriter = this.linkRewriterService.registerLinkRewriter(
        this.element,
        SKIMLINKS_REWRITER_ID,
        resolveFunction,
        options
    );

    // HACK TO MAKE SURE WE ALWAYS CALL BEACON API in case there are no links to resolve in the page.
    this.skimlinksLinkRewriter.events.on(
        linkRewriterEvents.PAGE_SCANNED,
        this.callBeaconIfNotAlreadyDone_.bind(this)
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
    const wasStolenFromSkim = eventData.replacedBy !== SKIMLINKS_REWRITER_ID;
    const hasAffiliated = eventData.hasReplaced;
    if (wasStolenFromSkim || !hasAffiliated) {
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
