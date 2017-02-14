/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import {documentInfoForDoc} from './document-info';
import {isExperimentOn} from './experiments';
import {viewerForDoc} from './viewer';
import {getLengthNumeral} from './layout';

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!Element} element
 * @param {!string} sentinel
 * @param {!Object<string, string>=} attributes
 * @return {!Object}
 */
export function getContextMetadata(
    parentWindow, element, sentinel, attributes) {
  const startTime = Date.now();
  const width = element.getAttribute('width');
  const height = element.getAttribute('height');
  attributes = attributes ? attributes : {};
  attributes.width = getLengthNumeral(width);
  attributes.height = getLengthNumeral(height);
  let locationHref = parentWindow.location.href;
  // This is really only needed for tests, but whatever. Children
  // see us as the logical origin, so telling them we are about:srcdoc
  // will fail ancestor checks.
  if (locationHref == 'about:srcdoc') {
    locationHref = parentWindow.parent.location.href;
  }

  const docInfo = documentInfoForDoc(parentWindow.document);

  const referrer = viewerForDoc(parentWindow.document)
      .getUnconfirmedReferrerUrl();

  const sentinelNameChange = isExperimentOn(
      parentWindow, 'sentinel-name-change');
  attributes._context = {
    ampcontextVersion: '$internalRuntimeVersion$',
    sourceUrl: docInfo.sourceUrl,
    referrer,
    canonicalUrl: docInfo.canonicalUrl,
    pageViewId: docInfo.pageViewId,
    location: {
      href: locationHref,
    },
    startTime,
  };
  attributes._context[sentinelNameChange ? 'sentinel' : 'amp3pSentinel'] =
      sentinel;
  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes.src = adSrc;
  }
  return attributes;
}

export function getNameAttribute(parentWindow, element, sentinel) {
  const attributes = getContextMetadata(parentWindow, element, sentinel);
  return encodeURIComponent(JSON.stringify(attributes));
}
