import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {Deferred} from '../../../src/utils/promise';

import Tracking from './tracking';

import AffiliateLinksManager from './affiliate-links-manager';
import DomainResolver from './affiliate-link-resolver';

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
    this.xhr_ = Services.xhrFor(this.win);
    this.ampDoc_ = this.getAmpDoc();

    this.skimOptions_ = this.validateOptions_();
    this.startSkimcore_();
  }

  validateOptions_() {
    // Always exclude current domains to avoid affiliating internal links.
    const excludedDomains = [this.ampDoc_.win.location.hostname];

    return {
      pubcode: '68019X1559797',
      excludedDomains,
      tracking: true,
      customTrackingId: '',
    };
  }

  startSkimcore_() {
    const trackingService = new Tracking(this.element, this.skimOptions_);
    const {
      domainResolverService,
      userSessionDataPromise,
    } = this.setupDomainResolver_();
    const affiliateLinksManager = this.setupAffiliateLinkManager_(trackingService, domainResolverService);

    // Fire impression tracking after we have received beaconRequest
    // TODO: Should this be fired onexit?
    userSessionDataPromise.then(userSessionData => {
      trackingService.sendImpressionTracking(
          userSessionData,
          affiliateLinksManager.getAnchorAffiliateMap(),
          startTime,
      );
    });
  }

  setupDomainResolver_() {
    const deferred = new Deferred();
    const userSessionDataPromise = deferred.promise;

    // Only set it the first time, ignore other calls.
    const beaconApiCallback = once(beaconData => {
      deferred.resolve({
        guid: beaconData.guid,
      });
    });

    const domainResolverService = new DomainResolver(
        this.xhr_,
        this.skimOptions_,
        beaconApiCallback,
    );

    return {
      domainResolverService,
      userSessionDataPromise,
    };
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
