import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {Deferred} from '../../../src/utils/promise';
import {whenDocumentReady} from '../../../src/document-ready';

import Tracking from './tracking';

import AffiliateLinksManager, {events as linkManagerEvents} from './affiliate-links-manager';
import DomainResolver from './affiliate-link-resolver';
import {getAmpSkimlinksOptions} from './skim-options';


/*** TODO:
 * - Fix issue with analytics reporting links with macro variables.
 * - Add amp-specific analytics variable (is_amp, canonical_url, original_page...)
 * - Investigate why AMP page is so slow to start (check window.t2 - window.t1)
 * - Check if win.location is correct in the context of amp served by google.co.uk
 * - Use no layout container
 */


function getBoundFunction(context, functionName) {
  // TODO: throw error if function doesn't exist?
  return context[functionName].bind(context);
}

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

    whenDocumentReady(this.ampDoc_).then(() => {
      window.t2 = new Date().getTime();
      this.startSkimcore_();
    });
  }


  startSkimcore_() {
    this.userSessionDataDeferred = new Deferred();
    this.resolveSessionDataONCE_ = once(this.resolveSessionData_);
    const trackingService = new Tracking(this.element, this.skimOptions_);
    const domainResolverService = this.setupDomainResolver_();
    const affiliateLinksManager = this.setupAffiliateLinkManager_(trackingService, domainResolverService);

    // HACK TO MAKE SURE WE ALWAYS CALL WAYPOINT in case there are no links to resolve in the page.
    affiliateLinksManager.listen(linkManagerEvents.PAGE_ANALYSED, () => {
      this.callBeaconIfNotAlreadyDone_(domainResolverService);
    });

    // Fire impression tracking after we have received beaconRequest
    // TODO: Should this be fired onexit?
    this.userSessionDataDeferred.promise.then(userSessionData => {
      window.t3 = new Date().getTime();
      trackingService.sendImpressionTracking(
          userSessionData,
          affiliateLinksManager.getAnchorAffiliateMap(),
          startTime,
      );
    });
  }

  resolveSessionData_(beaconData) {
    this.hasCalledBeacon = true;
    this.userSessionDataDeferred.resolve({
      guid: beaconData.guid,
    });
  }

  callBeaconIfNotAlreadyDone_(domainResolverService) {
    if (!this.hasCalledBeacon) {
      domainResolverService.fetchDomainResolverApi([])
          .then(this.resolveSessionDataONCE_);
    }
  }

  setupDomainResolver_() {
    // Only set it the first time, ignore other calls.
    const domainResolverService = new DomainResolver(
        this.xhr_,
        this.skimOptions_,
        this.resolveSessionDataONCE_,
    );

    return domainResolverService;
  }

  setupAffiliateLinkManager_(trackingService, domainResolverService) {
    const affiliateLinkManagerOptions = {
      onNonAffiliate: getBoundFunction(trackingService, 'sendNaClickTracking'),
    };

    const affiliateLinksManager = new AffiliateLinksManager(
        this.ampDoc_,
        getBoundFunction(domainResolverService, 'resolveUnknownAnchors'),
        affiliateLinkManagerOptions
    );

    return affiliateLinksManager;
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
