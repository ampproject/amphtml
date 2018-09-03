import {parseUrlDeprecated} from '../../../src/url';
import {user} from '../../../src/log';

const errors = {
  INVALID_PUBCODE: '"publisher-code" is required.',
  INVALID_XCUST:
    '"custom-tracking-id" should be <=50 characters and only contain upper ' +
    'and lowercase characters, numbers, underscores and pipes.',
  INVALID_TRACKING_STATUS: '"tracking" possible values are "true" or "false".',
};

/**
 *
 * @param {*} condition
 * @param {*} message
 */
function assertSkimOption(condition, message) {
  user().assert(condition, `<amp-skimlinks> Invalid option => ${message}`);
}

/**
 *
 * @param {*} element
 * @param {*} docInfo
 */
export function getAmpSkimlinksOptions(element, docInfo) {
  return {
    pubcode: getPubCode_(element),
    excludedDomains: getExcludedDomains_(element, getInternalDomains_(docInfo)),
    tracking: getTrackingStatus_(element),
    customTrackingId: getCustomTrackingId_(element),
    linkSelector: getLinkSelector_(element),
  };
}

/**
 *
 * @param {*} element
 * @param {*} internalDomains
 */
function getExcludedDomains_(element, internalDomains) {
  let excludedDomains = [].concat(internalDomains);

  const excludedDomainsAttr = element.getAttribute('excluded-domains');
  if (excludedDomainsAttr) {
    excludedDomains = excludedDomainsAttr.trim().split(/\s+/);
  }

  return excludedDomains;
}

/**
 *
 * @param {*} element
 */
function getPubCode_(element) {
  const pubCode = element.getAttribute('publisher-code');
  assertSkimOption(pubCode, errors.INVALID_PUBCODE);

  return pubCode;
}

/**
 *
 * @param {*} element
 */
function getTrackingStatus_(element) {
  const tracking = element.getAttribute('tracking');
  if (tracking) {
    const isValidValue = tracking === 'true' || tracking === 'false';
    assertSkimOption(isValidValue, errors.INVALID_TRACKING_STATUS);
    return tracking === 'true';
  }

  return true;
}

/**
 *
 * @param {*} element
 */
function getCustomTrackingId_(element) {
  const customTrackingId = element.getAttribute('custom-tracking-id');
  if (customTrackingId) {
    // TODO: Check for alphanumerical + [_|] only.
    const isValidXcust = customTrackingId.length <= 50;
    assertSkimOption(isValidXcust, errors.INVALID_XCUST);
  }

  return customTrackingId;
}

/**
 *
 * @param {*} element
 */
function getLinkSelector_(element) {
  const linkSelector = element.getAttribute('link-selector');

  return linkSelector || null;
}

/**
 *
 * @param {*} docInfo
 */
function getInternalDomains_(docInfo) {
  const internalDomains = [];
  if (docInfo.canonicalUrl) {
    internalDomains.push(parseUrlDeprecated(docInfo.canonicalUrl).hostname);
  }

  if (docInfo.sourceUrl) {
    internalDomains.push(parseUrlDeprecated(docInfo.sourceUrl).hostname);
  }

  return internalDomains;
}
