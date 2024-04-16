import {parseUrlDeprecated} from '../../../src/url';

/**
 * Generate random id of 32 chars.
 * @return {string}
 */
export function generatePageImpressionId() {
  let str = '';
  for (let i = 0; i < 8; i++) {
    str += Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return str;
}

/**
 * @param {string} url
 * @return {string}
 */
export function getNormalizedHostnameFromUrl(url) {
  const {hostname} = parseUrlDeprecated(url);

  return hostname.replace(/^www\./, '');
}

/**
 * @param {!HTMLElement} anchor
 * @return {string}
 */
export function getNormalizedHostnameFromAnchor(anchor) {
  if (!anchor) {
    return '';
  }

  return anchor.hostname.replace(/^www\./, '');
}

/**
 * Check if a domain is excluded, (i.e all URLs from this domains should
 * be ignored). The list of excluded was generated based on the
 * 'excluded-domains' skim-option & the internal domains.
 * (See skim-options.js)
 * @param {string} domain
 * @param {!Object} skimOptions
 * @return {boolean}
 */
export function isExcludedDomain(domain, skimOptions) {
  const {excludedDomains} = skimOptions;

  return excludedDomains && excludedDomains.indexOf(domain) !== -1;
}

/**
 * Check if a url belongs to an excluded domain.
 * @param {!HTMLElement} anchor
 * @param {!Object} skimOptions
 * @return {boolean}
 */
export function isExcludedAnchorUrl(anchor, skimOptions) {
  const domain = getNormalizedHostnameFromAnchor(anchor);
  return isExcludedDomain(domain, skimOptions);
}
