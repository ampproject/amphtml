import {TwoStepsResponse} from './link-rewriter/two-steps-response';
import {getNormalizedHostnameFromAnchor, isExcludedDomain} from './utils';

/**
 * @enum {string}
 */
export const AFFILIATE_STATUS = {
  // Can be monetized
  AFFILIATE: 'affiliate',
  // Can't be monetized but can be tracked
  NON_AFFILIATE: 'non-affiliate',
  // Can't be monetized and can't be tracked
  IGNORE: 'ignore',
  // We don't know yet if the link can me monetized. Will be considered as
  // 'can be monetized' until we have the answer from the API.
  UNKNOWN: 'unknown',
};

/**
 * The AffiliateLinkResolver class is in charge of "resolving"
 * links, in other words: determining if the URL from a link can be replaced by
 * a new Skimlinks monetizable url or not.
 *
 * The class is built around one main public method `
 * resolveUnknownAnchors(...)` which is the way for the Skimlinks LinkRewriter
 * to ask for the replacement URLs of all the links in the page.
 *
 * In order to know if a link should be replaced or not, we extract the list of
 * unique hostnames from the list of links on the page before sending it to
 * Skimlinks domain resolver API (beaconAPI). The API response contains the
 * list of domains which can be affiliated, enabling us to create a new
 * Skimlinks monetizable URL for all the links belonging to a domain present
 * in that list.
 *
 * The class implements an in-memory cache (this.domains_) so we only call the
 * domain resolver API if we encounter an new domain.
 */
export class AffiliateLinkResolver {
  /**
   * @param {!../../../src/service/xhr-impl.Xhr} xhr
   * @param {!Object} skimOptions
   * @param {!./waypoint.Waypoint} waypoint
   */
  constructor(xhr, skimOptions, waypoint) {
    /** @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = xhr;

    /** @private {!Object} */
    this.skimOptions_ = skimOptions;

    /** @private {!./waypoint.Waypoint} */
    this.waypoint_ = waypoint;

    /** @private {!JsonObject} */
    this.domains_ = {};

    /**
     * @public {?Promise}
     * Promise of the first request to beacon so we can
     * access API data outside of the linkRewriter/LinkResolver flow.
     */
    this.firstRequest = null;
  }

  /**
   * Calls the domain resolver API (Beacon) and return the API response
   * through a Promise.
   *
   * This method is public since it can also be called externally in case
   * of the "beacon fallback". (see amp-skimlinks.js)
   * @param {!Array<string>} domains
   * @return {!Promise<!JsonObject>}
   * @public
   */
  fetchDomainResolverApi(domains) {
    const data = {
      'pubcode': this.skimOptions_.pubcode,
      'page': '',
      'domains': domains,
    };
    let {beaconUrl} = this.skimOptions_.config;
    beaconUrl = `${beaconUrl}?data=${JSON.stringify(data)}`;
    const fetchOptions = {
      method: 'GET',
      // Disabling AMP CORS since API does not support it.
      ampCors: false,
      // Allowing beacon API to set cookies.
      credentials: 'include',
    };

    return this.xhr_
      .fetchJson(beaconUrl, fetchOptions)
      .then((res) => res.json());
  }

  /**
   * This is the function used by the Skimlinks LinkRewriter to determine
   * which URLs should be replaced.
   *
   * For each anchor in the list, returns as part of the synchronous or
   * asynchronous response what the url replacement should be.
   *
   * E.g: anchorList([anchor1, anchor2, anchor3])
   * => {
   *    syncResponse: [[anchor1, 'https://newurl.com'], [anchor2, null]],
   *    asyncResponse: Promise.resolve([[anchor3, 'https://newurl.com']])
   * }
   *
   * @param {!Array<!HTMLElement>} anchorList
   * @return {!./link-rewriter/two-steps-response.TwoStepsResponse}
   * @public
   */
  resolveUnknownAnchors(anchorList) {
    const alreadyResolvedResponse =
      this.associateWithReplacementUrl_(anchorList);
    let willBeResolvedPromise = null;

    const domainsToAsk = this.getNewDomains_(anchorList);
    if (domainsToAsk.length) {
      // Set domains to AFFILIATE_STATUS.UNKNOWN to mark them as already
      // requested.
      this.markDomainsAsUnknown_(domainsToAsk);
      // Get anchors waiting for the API response to be resolved.
      const unknownAnchors = this.getUnknownAnchors_(anchorList, domainsToAsk);
      willBeResolvedPromise = this.resolvedUnknownAnchorsAsync_(
        unknownAnchors,
        domainsToAsk
      );
    }

    // Returns an object containing a sync reponse and an async response.
    return new TwoStepsResponse(alreadyResolvedResponse, willBeResolvedPromise);
  }

  /**
   * Map an array of anchor to an array of "replacement object" containing
   * the anchor and its associated replacement URL.
   *
   * A falsy replacement URL means the URL should not be replaced.
   *
   * The replacement URL is determined based on the affiliate status of
   * the domain of the initial URL.
   *  E.g:
   *  associateWithReplacementUrl_([anchor1, anchor2])
   *  => [
   *    {anchor1, 'https://newurl.com'},
   *    {anchor2, null},
   *  ]
   *
   * @param {!Array<!HTMLElement>} anchorList
   * @return {!./link-rewriter/link-rewriter.AnchorReplacementList}
   * @private
   */
  associateWithReplacementUrl_(anchorList) {
    return anchorList.map((anchor) => {
      let replacementUrl = null;
      const status = this.getDomainAffiliateStatus_(
        this.getAnchorDomain_(anchor)
      );
      // Always replace unknown, we will overwrite them after asking
      // the api if needed
      const shouldReplace =
        status === AFFILIATE_STATUS.AFFILIATE ||
        status === AFFILIATE_STATUS.UNKNOWN;
      if (shouldReplace) {
        replacementUrl = this.waypoint_.getAffiliateUrl(anchor);
      }

      return (
        /** @type {!./link-rewriter/link-rewriter.AnchorReplacementList} */
        ({anchor, replacementUrl})
      );
    });
  }

  /**
   * @param {string} domain
   * @return {string}
   * @private
   */
  getDomainAffiliateStatus_(domain) {
    if (isExcludedDomain(domain, this.skimOptions_)) {
      return AFFILIATE_STATUS.IGNORE;
    }

    return this.domains_[domain] || AFFILIATE_STATUS.UNKNOWN;
  }

  /**
   * From a list of anchors, extract the list of domains for which
   * we don't already have the affiliate status information. This is
   * the list of domains that will be sent to the domain resolver API
   * (beaconAPI).
   * @param {!Array<!HTMLElement>} anchorList
   * @return {!Array<string>} - List of domains
   * @private
   */
  getNewDomains_(anchorList) {
    return anchorList.reduce((acc, anchor) => {
      const domain = this.getAnchorDomain_(anchor);
      const isResolved = this.domains_[domain];
      const isExcluded = isExcludedDomain(domain, this.skimOptions_);
      const isDuplicate = acc.indexOf(domain) !== -1;

      if (!isResolved && !isExcluded && !isDuplicate) {
        acc.push(domain);
      }

      return acc;
    }, []);
  }

  /**
   * For each domain in the list, set the affiliate status to "unknown" in
   * the cache. This allows us to keep track of what domains have already been
   * sent to the API, even if the API hasn't come back yet.
   * @param {!Array<string>} domains
   * @private
   */
  markDomainsAsUnknown_(domains) {
    domains.forEach((domain) => {
      if (this.domains_[domain]) {
        return;
      }

      if (isExcludedDomain(domain, this.skimOptions_)) {
        this.domains_[domain] = AFFILIATE_STATUS.IGNORE;
      }

      this.domains_[domain] = AFFILIATE_STATUS.UNKNOWN;
    });
  }

  /**
   * Filters the list of anchors for which the domain of the href is
   * in the `unknownDomains` list.
   * @param {!Array<!HTMLElement>} anchorList
   * @param {!Array<string>} unknownDomains
   * @return {!Array<!HTMLElement>}
   * @private
   */
  getUnknownAnchors_(anchorList, unknownDomains) {
    return anchorList.filter((anchor) => {
      const anchorDomain = this.getAnchorDomain_(anchor);

      return unknownDomains.indexOf(anchorDomain) !== -1;
    });
  }

  /**
   * Creates the asyncResponse part of the 'resolveUnknownAnchors' response.
   * Fetch the domain resolver api before determining the
   * AnchorReplacementList.
   * @param {!Array<HTMLElement>} anchorList
   * @param {!Array<string>} domainsToAsk
   * @return {!Promise<!./link-rewriter/link-rewriter.AnchorReplacementList>}
   * @private
   */
  resolvedUnknownAnchorsAsync_(anchorList, domainsToAsk) {
    const promise = this.fetchDomainResolverApi(domainsToAsk);
    // We only care about the very first request.
    if (!this.firstRequest) {
      this.firstRequest = promise;
    }

    return promise.then((data) => {
      const merchantDomains = data['merchant_domains'] || [];
      this.updateDomainsStatusMap_(domainsToAsk, merchantDomains);

      return this.associateWithReplacementUrl_(anchorList);
    });
  }

  /**
   * Updates the internal affiliate status cache (this.domains_).
   * @param {!Array<string>} allDomains
   * @param {!Array<string>} affiliateDomains
   * @private
   */
  updateDomainsStatusMap_(allDomains, affiliateDomains) {
    allDomains.forEach((domain) => {
      const isAffiliateDomain = affiliateDomains.indexOf(domain) !== -1;
      this.domains_[domain] = isAffiliateDomain
        ? AFFILIATE_STATUS.AFFILIATE
        : AFFILIATE_STATUS.NON_AFFILIATE;
    });
  }

  /**
   * Extracts the domain (hostname) from an anchor.
   * @param {!HTMLElement} anchor
   * @return {string} - Hostname, without protocol, without www.
   * @private
   */
  getAnchorDomain_(anchor) {
    return getNormalizedHostnameFromAnchor(anchor);
  }
}
