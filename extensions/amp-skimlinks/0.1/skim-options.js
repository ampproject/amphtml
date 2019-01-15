/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {getChildJsonConfig} from '../../../src/json';
import {getNormalizedHostnameFromUrl} from './utils';
import {userAssert} from '../../../src/log';

import {
  DEFAULT_CONFIG,
  GLOBAL_DOMAIN_BLACKLIST,
} from './constants';

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
 * @param {string} message
 */
function assertSkimOption(condition, message) {
  userAssert(condition, `<amp-skimlinks> Invalid option => ${message}`);
}

/**
 *
 * @param {!Element} element
 * @param {?../../../src/service/document-info-impl.DocumentInfoDef} docInfo
 * @return {!Object}
 */
export function getAmpSkimlinksOptions(element, docInfo) {
  return {
    pubcode: getPubCode_(element),
    excludedDomains: getExcludedDomains_(element, getInternalDomains_(docInfo)),
    tracking: getTrackingStatus_(element),
    customTrackingId: getCustomTrackingId_(element),
    linkSelector: getLinkSelector_(element),
    config: getConfig_(element),
  };
}

/**
 *
 * @param {!Element} element
 * @param {!Array<string>} internalDomains
 */
function getExcludedDomains_(element, internalDomains) {
  let excludedDomains = []
      .concat(internalDomains)
      .concat(GLOBAL_DOMAIN_BLACKLIST);

  const excludedDomainsAttr = element.getAttribute('excluded-domains');
  if (excludedDomainsAttr) {
    excludedDomains = excludedDomains.concat(
        excludedDomainsAttr
            .trim()
            .split(/\s+/)
            .map(domain => domain.replace(/^www\./, ''))
    );
  }

  return excludedDomains;
}

/**
 *
 * @param {!Element} element
 * @return {string}
 */
function getPubCode_(element) {
  const pubCode = element.getAttribute('publisher-code');
  assertSkimOption(pubCode, errors.INVALID_PUBCODE);

  return pubCode;
}

/**
 *
 * @param {!Element} element
 * @return {boolean}
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
 * @param {!Element} element
 * @return {?string}
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
 * @param {!Element} element
 * @return {?string}
 */
function getLinkSelector_(element) {
  const linkSelector = element.getAttribute('link-selector');

  return linkSelector || null;
}

/**
 *
 * @param {?../../../src/service/document-info-impl.DocumentInfoDef} docInfo
 * @return {!Array<string>}
 */
function getInternalDomains_(docInfo) {
  const internalDomains = [];
  if (docInfo.canonicalUrl) {
    internalDomains.push(getNormalizedHostnameFromUrl(docInfo.canonicalUrl));
  }

  if (docInfo.sourceUrl) {
    internalDomains.push(getNormalizedHostnameFromUrl(docInfo.sourceUrl));
  }

  return internalDomains;
}

/**
 * @param {!Element} element
 * @return {!Object}
 */
function getConfig_(element) {
  try {
    // Custom config is only used for e2e tests.
    const customConfigJson = getChildJsonConfig(element);
    // Warning: getChildJsonConfig returns an JSON object while
    // DEFAULT_CONFIG is a normal object with keys that can be renamed
    // by google closure compiler on the production build. Therefore, we
    // are converting here the JSON object keys to the internal object keys.
    return {
      pageTrackingUrl: customConfigJson['pageTrackingUrl'] ||
        DEFAULT_CONFIG.pageTrackingUrl,
      linksTrackingUrl: customConfigJson['linksTrackingUrl'] ||
        DEFAULT_CONFIG.linksTrackingUrl,
      nonAffiliateTrackingUrl: customConfigJson['nonAffiliateTrackingUrl'] ||
        DEFAULT_CONFIG.nonAffiliateTrackingUrl,
      waypointUrl: customConfigJson['waypointUrl'] ||
        DEFAULT_CONFIG.waypointUrl,
      beaconUrl: customConfigJson['beaconUrl'] ||
        DEFAULT_CONFIG.beaconUrl,
    };
  } catch (err) {
    return DEFAULT_CONFIG;
  }
}
