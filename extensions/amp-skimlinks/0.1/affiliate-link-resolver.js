import {
  LINK_STATUS__AFFILIATE, LINK_STATUS__IGNORE_LINK, LINK_STATUS__NON_AFFILIATE,
  LINK_STATUS__UNKNOWN
} from './affiliateLinks';
import {parseUrlDeprecated} from '../../../src/url';

export default class AffiliateLinkResolver {
  constructor(xhr, pubcode, excludedDomains) {
    this.xhr_ = xhr;
    this.pubcode_ = pubcode;
    this.beaconData_ = {};
    this.domains_ = {};
    this.excludedDomains_ = excludedDomains || []
  }

  // Interface
  resolveUnknownLinks(links) {
    // TODO: don't send duplicates,remove exluded domains, remove internal link.
    const domains = links.map(this.getLinkDomain);
    const data = {
      pubcode: this.pubcode_,
      page: '',
      domains,
    };

    const beaconUrl = `https://r.skimresources.com/api?data=${JSON.stringify(data)}`;
    const postReq = {
      method: 'GET',
      // Disabled AMP CORS for dev
      requireAmpResponseSourceOrigin: false,
      ampCors: false,
    };

    return this.xhr_.fetchJson(beaconUrl, postReq).then(res => {
      return res.json().then(data => {
        this.updateDomainResolverData_(domains, data);
        this.updateBeaconData_(data);
      });
    });

    //return [{ link: a, status: X}, {...}]
  }

  // Interface
  getLinkAffiliateStatus(anchor) {
    const linkDomain = this.getLinkDomain(anchor);
    if (this.isExcludedDomain_()) {
      return LINK_STATUS__IGNORE_LINK;
    }

    return this.domains_[linkDomain] || LINK_STATUS__UNKNOWN;
  }

  updateBeaconData_(beaconData) {
    // TODO: Only update missing fields
    this.beaconData_ = beaconData;
  }

  updateDomainResolverData_(domains, data) {
    console.log('data', data);

    domains.forEach(domain => {
      const isAffiliateDomain = data.merchant_domains.indexOf(domain) !== -1;
      this.domains_[domain] = isAffiliateDomain ? LINK_STATUS__AFFILIATE : LINK_STATUS__NON_AFFILIATE;
    });
  }

  getLinkDomain(anchor) {
    return parseUrlDeprecated(anchor.href).hostname;
  }

  isExcludedDomain_(domain) {
    if (!this.excludedDomains_.length) {
      return false;
    }

    // TODO: Validate subdomain (*.nordstrom.com)
    if (this.excludedDomains_.indexOf(domain) === -1) {
      return false;
    }

    return true;
  }
}
