
import {addParamsToUrl,parseUrlDeprecated} from '../../../src/url';

import {AFFILIATION_API, DOMAIN_RESOLVER_API_URL, PLATFORM_NAME, XCUST_ATTRIBUTE_NAME} from './constants';
import {createAnchorReplacementTuple, createTwoStepsResponse} from '../../../src/service/link-rewrite/link-rewrite-helpers';

export const STATUS__AFFILIATE = 'affiliate';
export const STATUS__NON_AFFILIATE = 'non-affiliate';
export const STATUS__IGNORE_LINK = 'ignore';
export const STATUS__UNKNOWN = 'unknown';

export default class AffiliateLinkResolver {
  /**
   *
   * @param {*} xhr
   * @param {*} skimOptions
   * @param {*} getTrackingInfo
   */
  constructor(xhr, skimOptions, getTrackingInfo) {
    this.xhr_ = xhr;
    this.skimOptions_ = skimOptions;
    this.domains_ = {};
    this.getTrackingInfo_ = getTrackingInfo;
    // Promise of the first request to beacon so we can
    // access beaconData outside of the linkRewriter/LinkResolver flow.
    this.firstApiRequest = null;
  }

  /**
   *
   * @param {*} anchorList
   * @return {Promise}
   */
  resolveUnknownAnchors(anchorList) {
    const alreadyResolved = this.mapToAnchorReplacementTuple_(anchorList);
    let willBeResolvedPromise = null;

    const domainsToAsk = this.getNewDomains_(anchorList);
    if (domainsToAsk.length) {
      // Set domains to STATUS__UNKNOWN to mark them as already requested.
      this.markDomainsAsUnknown(domainsToAsk);
      // Get anchors waiting for the API response to be resolved.
      const pendingAnchors = this.getPendingAnchors_(anchorList, domainsToAsk);
      willBeResolvedPromise = this.resolvedUnknownAnchorsAsync_(pendingAnchors,
          domainsToAsk);
    }

    // Returns an object with a sync reponse and an async response.
    return new createTwoStepsResponse(alreadyResolved, willBeResolvedPromise);
  }

  /**
   * Get replacement url.
   * @param {*} anchor
   */
  getWaypointUrl_(anchor) {
    if (!anchor) {
      return null;
    }

    const {
      pubcode,
      referrer,
      externalReferrer,
      timezone,
      pageImpressionId,
      customTrackingId,
      guid,
    } = this.getTrackingInfo_();

    const xcust = anchor.getAttribute(XCUST_ATTRIBUTE_NAME) || customTrackingId;
    const queryParams = {
      id: pubcode,
      url: anchor.href,
      sref: referrer,
      pref: externalReferrer,
      xguid: guid,
      xuuid: pageImpressionId,
      xtz: timezone,
      xs: '1', // Always use source_app=1 (skimlinks)
      platform: PLATFORM_NAME,
    };
    if (xcust) {
      queryParams.xcust = xcust;
    }

    return addParamsToUrl(AFFILIATION_API, queryParams);
  }

  /**
   * Build list of AnchorReplacementTuple
   * @param {*} anchorList
   */
  mapToAnchorReplacementTuple_(anchorList) {
    const anchorListNormalised = anchorList.map(anchor => {
      const status = this.getDomainAffiliateStatus_(this.getLinkDomain(anchor));
      // Always replace unknown, we will overwrite them after asking
      // the api if needed
      if (status === STATUS__AFFILIATE || status === STATUS__UNKNOWN) {
        const replacementUrl = this.getWaypointUrl_(anchor);
        return createAnchorReplacementTuple(anchor, replacementUrl);
      }

      return createAnchorReplacementTuple(anchor, null);
    });

    return anchorListNormalised;
  }

  /**
   * Get affiliate status of one domain
   * @param {*} domain
   */
  getDomainAffiliateStatus_(domain) {
    if (this.isExcludedDomain_(domain)) {
      return STATUS__IGNORE_LINK;
    }

    return this.domains_[domain] || STATUS__UNKNOWN;
  }

  /**
   * Get list of domains we don't have information about from a list of anchor.
   * @param {*} anchorList
   */
  getNewDomains_(anchorList) {
    const domains = anchorList.map(this.getLinkDomain);

    return domains.reduce(((acc, domain) => {
      const isResolved = this.domains_[domain];
      const isExcluded = this.isExcludedDomain_(domain);
      const isDuplicate = acc.indexOf(domain) !== -1;

      if (!isResolved && !isExcluded && !isDuplicate) {
        acc.push(domain);
      }

      return acc;
    }), []);
  }

  /**
   * Save domains as unknown status in the internal state.
   * @param {string[]} domains
   */
  markDomainsAsUnknown(domains) {
    domains.forEach(domain => {
      const domainStatus = this.domains_[domain];
      if (domainStatus && domainStatus !== STATUS__UNKNOWN) {
        return;
      }

      if (this.isExcludedDomain_(domain)) {
        this.domains_[domain] = STATUS__IGNORE_LINK;
      }

      this.domains_[domain] = STATUS__UNKNOWN;
    });
  }

  /**
   * Get the list of anchors for which the domain of the href is
   * in the `domainsToAsk` list.
   * @param {*} anchorList
   * @param {string[]} domainsToAsk
   */
  getPendingAnchors_(anchorList, domainsToAsk) {
    return anchorList.reduce((acc, anchor) => {
      const anchorDomain = this.getLinkDomain(anchor);
      if (domainsToAsk.indexOf(anchorDomain) !== -1) {
        acc.push(anchor);
      }

      return acc;
    }, []);
  }

  /**
   * Resolve in an asynchronous way.
   * @param {*} anchorList
   * @param {*} domainsToAsk
   */
  resolvedUnknownAnchorsAsync_(anchorList, domainsToAsk) {
    const promise = this.fetchDomainResolverApi(domainsToAsk);
    if (!this.firstRequest) {
      this.firstRequest = promise;
    }

    return promise.then(data => {
      const merchantDomains = data.merchant_domains || [];
      this.updateDomainsStatusMapPostFetch_(domainsToAsk, merchantDomains);

      return this.mapToAnchorReplacementTuple_(anchorList);
    });
  }

  /**
   * Call beacon
   * @param {*} domains
   */
  fetchDomainResolverApi(domains) {
    const data = {
      pubcode: this.skimOptions_.pubcode,
      page: '',
      domains,
    };

    const beaconUrl = `${DOMAIN_RESOLVER_API_URL}?data=${JSON.stringify(data)}`;
    const fetchOptions = {
      method: 'GET',
      // Disabled AMP CORS for dev
      requireAmpResponseSourceOrigin: false,
      ampCors: false,
      // Allow beacon API to set cookies
      credentials: 'include',
    };

    return this.xhr_.fetchJson(beaconUrl, fetchOptions).then(res => {
      return res.json();
    });
  }

  /**
   *
   * @param {*} allDomains
   * @param {*} affiliateDomains
   */
  updateDomainsStatusMapPostFetch_(allDomains, affiliateDomains) {
    allDomains.forEach(domain => {
      const isAffiliateDomain = affiliateDomains.indexOf(domain) !== -1;
      this.domains_[domain] = isAffiliateDomain ?
        STATUS__AFFILIATE :
        STATUS__NON_AFFILIATE;
    });
  }

  /**
   *
   * @param {*} anchor
   */
  getLinkDomain(anchor) {
    let {hostname} = parseUrlDeprecated(anchor.href);
    if (hostname.indexOf('www.') === 0) {
      hostname = hostname.replace('www.', '');
    }

    return hostname;
  }

  /**
   *
   * @param {*} domain
   */
  isExcludedDomain_(domain) {
    const {excludedDomains} = this.skimOptions_;
    // Should update the isExcluded list as a side effect for caching
    if (!excludedDomains || !excludedDomains.length) {
      return false;
    }

    // TODO: Validate subdomain (*.nordstrom.com)
    if (excludedDomains.indexOf(domain) === -1) {
      return false;
    }

    return true;
  }
}
