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

import {GLOBAL_DOMAIN_BLACKLIST} from './constants';
import {getNormalizedHostnameFromUrl} from './utils';
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
 * @param {string} message
 */
function assertSkimOption(condition, message) {
  user().assert(condition, `<amp-skimlinks> Invalid option => ${message}`);
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
