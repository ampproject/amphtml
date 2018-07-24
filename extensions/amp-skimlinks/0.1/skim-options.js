import {user} from '../../../src/log';

const errors = {
  INVALID_PUBCODE: '"publisher-code" is required.',
  INVALID_XCUST: '"custom-tracking-id" should be <=50 characters and only contain upper and lowercase characters, numbers, underscores and pipes.',
  INVALID_TRACKING_STATUS: '"tracking" possible values are "true" or "false".',
};

function assertSkimOption(condition, message) {
  user().assert(condition, `<amp-skimlinks> Invalid option => ${message}`)
}

export function getAmpSkimlinksOptions(element, location) {
  return {
    pubcode: getPubCode_(element),
    excludedDomains: getExcludedDomains_(element, location),
    tracking: getTrackingStatus_(element),
    customTrackingId: getCustomTrackingId_(element),
  };
}

function getExcludedDomains_(element, location) {
  let excludedDomains = [];

  const excludedDomainsAttr = element.getAttribute('excluded-domains');
  if (excludedDomainsAttr) {
    excludedDomains = excludedDomainsAttr.split(',');
  }

  // Always push current domain to ignore internal links.
  excludedDomains.push(location.hostname);

  return excludedDomains;
}

function getPubCode_(element) {
  const pubCode = element.getAttribute('publisher-code');
  assertSkimOption(pubCode, errors.INVALID_PUBCODE);

}

function getTrackingStatus_(element) {
  const tracking = element.getAttribute('tracking');
  if (tracking) {
    const isValidValue = tracking === 'true' || tracking === 'false';
    assertSkimOption(isValidValue, errors.INVALID_TRACKING_STATUS);
    return tracking === 'true';
  }

  return true;
}

function getCustomTrackingId_(element) {
  const customTrackingId = element.getAttribute('custom-tracking-id');
  if (customTrackingId) {
    // TODO: Check for alphanumerical + [_|] only.
    const isValidXcust = customTrackingId.length <= 50;
    assertSkimOption(isValidXcust, errors.INVALID_XCUST);
  }

  return customTrackingId;
}
