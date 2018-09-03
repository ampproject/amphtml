import {parseUrlDeprecated} from '../../../src/url';
import {user} from '../../../src/log';
/**
 * Get function from an object attached with the object as its context
 * @param {*} context
 * @param {*} functionName
 */
export function getBoundFunction(context, functionName) {
  const validFunction = context[functionName] && context[functionName].bind;
  user().assert(validFunction,
      `Function '${functionName}' not found in given context.`);
  return context[functionName].bind(context);
}

/**
 * Generate random id of 32 chars.
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
 * Check if a domain is excluded, (i.e all URLs from this domains should
 * be ignored). The list of excluded was generated based on the
 * 'excluded-domains' skim-option & the internal domains.
 * (See skim-options.js)
 * @param {string} domain
 * @param {Object} skimOptions
 * @return {boolean}
 */
export function isExcludedDomain(domain, skimOptions) {
  const {excludedDomains} = skimOptions;
  if (!excludedDomains || !excludedDomains.length) {
    return false;
  }

  // TODO: Validate subdomain (*.nordstrom.com)
  if (excludedDomains.indexOf(domain) === -1) {
    return false;
  }

  return true;
}

/**
 * Check if a url belongs to an excluded domain.
 * @param {string} url
 * @param {Object} skimOptions
 * @return {boolean}
 */
export function isExcludedUrl(url, skimOptions) {
  const domain = getNormalizedHostnameFromUrl(url);
  return isExcludedDomain(domain, skimOptions);
}
