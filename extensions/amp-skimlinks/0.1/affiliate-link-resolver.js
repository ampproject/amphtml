
import {parseUrlDeprecated} from '../../../src/url';

import {DOMAIN_RESOLVER_API_URL} from './constants';
import {createAnchorReplacementTuple, createTwoStepsResponse} from '../../../src/service/link-rewrite/link-rewrite-helpers';
import {dict} from '../../../src/utils/object';

// Can be monetized
export const STATUS__AFFILIATE = 'affiliate';
// Can't be monetized but can be tracked
export const STATUS__NON_AFFILIATE = 'non-affiliate';
// Can't be monetized and can't be tracked
export const STATUS__IGNORE_LINK = 'ignore';
// We don't know yet if the link can me monitized. Will be considered as
// 'can be monetized' until we have the answer from the API.
export const STATUS__UNKNOWN = 'unknown';

export class AffiliateLinkResolver {
  /**
   *
   * @param {*} xhr
   * @param {*} skimOptions
   * @param {*} waypoint
   */
  constructor(xhr, skimOptions, waypoint) {
    this.xhr_ = xhr;
    this.skimOptions_ = skimOptions;
    this.waypoint_ = waypoint;
    this.domains_ = {};
    // Promise of the first request to beacon so we can
    // access API data outside of the linkRewriter/LinkResolver flow.

    /** @public */
    this.firstRequest = null;
  }

  /**
   *
   * @param {*} anchorList
   * @return {*}
   */
  resolveUnknownAnchors(anchorList) {
    const alreadyResolvedTupleList = this.mapToAnchorReplacementTuple_(anchorList);
    let willBeResolvedPromise = null;

    const domainsToAsk = this.getNewDomains_(anchorList);
    if (domainsToAsk.length) {
      // Set domains to STATUS__UNKNOWN to mark them as already requested.
      this.markDomainsAsUnknown(domainsToAsk);
      // Get anchors waiting for the API response to be resolved.
      const unknownAnchors = this.getUnknownAnchors_(anchorList, domainsToAsk);
      willBeResolvedPromise = this.resolvedUnknownAnchorsAsync_(unknownAnchors,
          domainsToAsk);
    }

    // Returns an object with a sync reponse and an async response.
    return createTwoStepsResponse(alreadyResolvedTupleList, willBeResolvedPromise);
  }


  /**
   * Build list of AnchorReplacementTuple
   * @param {*} anchorList
   */
  mapToAnchorReplacementTuple_(anchorList) {
    return anchorList.map(anchor => {
      let replacementUrl = null;
      const status = this.getDomainAffiliateStatus_(this.getLinkDomain(anchor));
      // Always replace unknown, we will overwrite them after asking
      // the api if needed
      if (status === STATUS__AFFILIATE || status === STATUS__UNKNOWN) {
        replacementUrl = this.waypoint_.getAffiliateUrl(anchor);
      }

      return createAnchorReplacementTuple(anchor, replacementUrl);
    });
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
   * @param {Array<string>} domains
   */
  markDomainsAsUnknown(domains) {
    domains.forEach(domain => {
      if (this.domains_[domain]) {
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
   * @param {Array<string>} domainsToAsk
   */
  getUnknownAnchors_(anchorList, domainsToAsk) {
    return anchorList.filter(anchor => {
      const anchorDomain = this.getLinkDomain(anchor);

      return domainsToAsk.indexOf(anchorDomain) !== -1;
    });
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
      this.updateDomainsStatusMap_(domainsToAsk, merchantDomains);

      return this.mapToAnchorReplacementTuple_(anchorList);
    });
  }

  /**
   * Call beacon
   * @param {*} domains
   */
  fetchDomainResolverApi(domains) {
    const data = dict({
      'pubcode': this.skimOptions_.pubcode,
      'page': '',
      'domains': domains,
    });

    const beaconUrl = `${DOMAIN_RESOLVER_API_URL}?data=${JSON.stringify(data)}`;
    const fetchOptions = {
      method: 'GET',
      // Disabling AMP CORS since API does not support it.
      requireAmpResponseSourceOrigin: false,
      ampCors: false,
      // Allowing beacon API to set cookies.
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
  updateDomainsStatusMap_(allDomains, affiliateDomains) {
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
    const {hostname} = parseUrlDeprecated(anchor.href);

    return hostname.replace(/^www\./, '');
  }

  /**
   *
   * @param {*} domain
   */
  isExcludedDomain_(domain) {
    const {excludedDomains} = this.skimOptions_;
    // TODO: Should update the isExcluded list as a side effect for caching
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
