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
import {documentInfoForDoc} from './document-info.js';
import {viewerForDoc} from '../src/viewer';
import {getLengthNumeral} from '../src/layout';
import {getMode} from './mode';

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!Element} element
 * @return {!Object} Contains
 *       precedence over the data- attributes.
 *     - data-* attributes of the <amp-ad> tag with the "data-" removed.
 *     - A _context object for internal use.
 */
export function getContextMetadata(parentWindow, element, sentinel, opt_attributes) {
  const startTime = Date.now();
  const width = element.getAttribute('width');
  const height = element.getAttribute('height');
  const attributes = opt_attributes ? opt_attributes : {};
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

  attributes._context = {
    ampcontextVersion : (getMode().localDev ? 'LOCAL' :
        '$internalRuntimeVersion$'),
    sourceUrl: docInfo.sourceUrl,
    referrer,
    canonicalUrl: docInfo.canonicalUrl,
    pageViewId: docInfo.pageViewId,
    location: {
      href: locationHref,
    },
    sentinel,
    startTime,
  };

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
