/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {userAssert} from '../../../src/log';

/**
 * Get the config values from the tag on the amp page
 * @param {!Element} element
 * @return {!Object}
 */
export function getConfigOptions(element) {
  return {
    nrtvSlug: getNrtvAccountName_(element),
    linkmateEnabled: getLinkmateFlag_(element),
    exclusiveLinks: getExclusiveLinksFlag_(element),
    linkAttribute: getLinkAttribute_(element),
    linkSelector: getLinkSelector_(element),
  };
}

/**
 * The slug used to distinguish Narrativ accounts.
 * @param {!Element} element
 * @return {?string}
 */
function getNrtvAccountName_(element) {
  const nrtvSlug = element.getAttribute('nrtv-account-name');
  userAssert(nrtvSlug,
      'amp-smartlinks: nrtv-account-name is a required field');

  return nrtvSlug ? nrtvSlug.toLowerCase() : null;
}

/**
 * Flag to specify if we are to run our Linkmate service.
 * @param {!Element} element
 * @return {boolean}
 */
function getLinkmateFlag_(element) {
  const linkmateEnabled = element.getAttribute('linkmate').toLowerCase();
  userAssert(linkmateEnabled,
      'amp-smartlinks: linkmate is a required field');

  return linkmateEnabled === 'true';
}

/**
 * Flag to mark links as exlusive or not.
 * @param {!Element} element
 * @return {boolean}
 */
function getExclusiveLinksFlag_(element) {
  const exclusiveLinks = element.getAttribute('exclusive-links').toLowerCase();

  return exclusiveLinks === 'true';
}

/**
 * What attribute the outbound link variable is stored in an anchor.
 * @param {!Element} element
 * @return {?string}
 */
function getLinkAttribute_(element) {
  const linkAttribute = element.getAttribute('link-attribute');

  return linkAttribute ? linkAttribute.toLowerCase() : 'href';
}

/**
 * Selector used to get all links that are meant to be monetized.
 * @param {!Element} element
 * @return {?string}
 */
function getLinkSelector_(element) {
  const linkSelector = element.getAttribute('link-selector');

  return linkSelector ? linkSelector.toLowerCase() : 'a';
}
