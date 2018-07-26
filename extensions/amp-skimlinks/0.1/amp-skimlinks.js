import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {Deferred} from '../../../src/utils/promise';
import {whenDocumentReady} from '../../../src/document-ready';

import Tracking from './tracking';

import DomainResolver from './affiliate-link-resolver';
import {getAmpSkimlinksOptions} from './skim-options';
import {getBoundFunction} from './utils';
import LinkRewriterService, {events as linkRewriterEvents} from './link-rewriter';
/*** TODO:
 * - Fix issue with analytics reporting links with macro variables.
 * - Add amp-specific analytics variable (is_amp, canonical_url, original_page...)
 * - Investigate why AMP page is so slow to start (check window.t2 - window.t1)
 * - Check if win.location is correct in the context of amp served by google.co.uk
 * - Use no layout container
 */

const startTime = new Date().getTime();

const SKIMLINKS_REWRITER_ID = 'amp-skimlinks';

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
    this.resolveSessionDataONCE_ = once(this.resolveSessionData_.bind(this));
    this.userSessionDataDeferred_ = new Deferred();
    this.linkRewriterService = new LinkRewriterService(this.ampDoc_);

    whenDocumentReady(this.ampDoc_).then(() => {
      window.t2 = new Date().getTime();
      this.startSkimcore_();
    });
  }

  startSkimcore_() {
    const trackingService = new Tracking(this.element, this.skimOptions_);
    const domainResolverService = new DomainResolver(
        this.xhr_,
        this.skimOptions_,
        this.resolveSessionDataONCE_,
    );

    const skimlinksLinkRewriter = this.setupAffiliateLinkManager_(trackingService, domainResolverService);

    // Fire impression tracking after we have received beaconRequest
    // TODO: Should this be fired onexit?
    this.userSessionDataDeferred_.promise.then(userSessionData => {
      window.t3 = new Date().getTime();
      trackingService.sendImpressionTracking(
          userSessionData,
          skimlinksLinkRewriter.getAnchorLinkReplacementMap(),
          startTime,
      );
    });
  }

  resolveSessionData_(beaconData) {
    this.hasCalledBeacon = true;
    this.userSessionDataDeferred_.resolve({
      guid: beaconData.guid,
    });
  }

  callBeaconIfNotAlreadyDone_(domainResolverService) {
    if (!this.hasCalledBeacon) {
      domainResolverService.fetchDomainResolverApi([])
          .then(this.resolveSessionDataONCE_);
    }
  }

  setupAffiliateLinkManager_(trackingService, domainResolverService) {
    const resolveFunction = getBoundFunction(domainResolverService, 'resolveUnknownAnchors')
    const options = {
      linkSelector: this.skimOptions_.linkSelector,
    };

    const skimlinksLinkRewriter = this.linkRewriterService.registerLinkRewriter(
        this.element,
        SKIMLINKS_REWRITER_ID,
        resolveFunction,
        options
    );

    // HACK TO MAKE SURE WE ALWAYS CALL WAYPOINT in case there are no links to resolve in the page.
    skimlinksLinkRewriter.events.listen(linkRewriterEvents.PAGE_SCANNED, () => {
      this.callBeaconIfNotAlreadyDone_(domainResolverService);
    });

    skimlinksLinkRewriter.events.listen(linkRewriterEvents.CLICK, eventData => {
      const wasStolenFromSkim = eventData.replacedBy !== SKIMLINKS_REWRITER_ID;
      const hasAffiliated = eventData.hasReplaced;
      if (wasStolenFromSkim || !hasAffiliated) {
        trackingService.sendNaClickTracking(eventData.anchor);
      }
    });

    return skimlinksLinkRewriter;
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
