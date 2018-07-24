import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {Deferred} from '../../../src/utils/promise';
import {whenDocumentReady} from '../../../src/document-ready';

import Tracking from './tracking';

import AffiliateLinksManager, {LINK_STATUS__NON_AFFILIATE, events as linkManagerEvents} from './affiliate-links-manager';
import DomainResolver from './affiliate-link-resolver';
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

    this.init_();
    whenDocumentReady(this.ampDoc_).then(() => {
      window.t2 = new Date().getTime();
      this.startSkimcore_();
    });
  }

  init_() {
    this.hasCalledBeacon = false;
    this.xhr_ = Services.xhrFor(this.win);
    this.ampDoc_ = this.getAmpDoc();
    this.skimOptions_ = getAmpSkimlinksOptions(this.element, this.ampDoc_.win.location);
    this.resolveSessionDataONCE_ = once(this.resolveSessionData_.bind(this));
    this.userSessionDataDeferred_ = new Deferred();
  }


  startSkimcore_() {
    const trackingService = new Tracking(this.element, this.skimOptions_);
    const domainResolverService = new DomainResolver(
        this.xhr_,
        this.skimOptions_,
        this.resolveSessionDataONCE_,
    );

    const affiliateLinksManager = this.setupAffiliateLinkManager_(trackingService, domainResolverService);

    // Fire impression tracking after we have received beaconRequest
    // TODO: Should this be fired onexit?
    this.userSessionDataDeferred_.promise.then(userSessionData => {
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

    const affiliateLinksManager = new AffiliateLinksManager(
        this.ampDoc_,
        resolveFunction,
        options
    );

    // HACK TO MAKE SURE WE ALWAYS CALL WAYPOINT in case there are no links to resolve in the page.
    affiliateLinksManager.listen(linkManagerEvents.PAGE_SCANNED, () => {
      this.callBeaconIfNotAlreadyDone_(domainResolverService);
    });

    affiliateLinksManager.listen(linkManagerEvents.CLICK, data => {
      if (data.linkStatus === LINK_STATUS__NON_AFFILIATE) {
        trackingService.sendNaClickTracking(data.anchor);
      }
    });

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
