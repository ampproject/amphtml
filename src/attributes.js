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
import {getPageViewId} from './service/document-info-impl';
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
export function getContextMetadata(parentWindow, element, sentinel) {
  const startTime = Date.now();
  const width = element.getAttribute('width');
  const height = element.getAttribute('height');
  const attributes = {};
  attributes.width = getLengthNumeral(width);
  attributes.height = getLengthNumeral(height);
  const locationHref = parentWindow.location.href;

  let canonicalUrl;
  try{
    canonicalUrl = self.document.querySelector(
        'link[rel="canonical"]').href;
  } catch(err){
    console/*OK*/.log("Could not get canonicalUrl");
  }

  attributes._context = {
    referrer: self.document.referrer,
    canonicalUrl,
    pageViewId: getPageViewId(parentWindow),
    location: {
      href: locationHref,
    },
    sentinel,
    startTime,
  };

  attributes.ampcontextVersion = (getMode().localDev ? "LOCAL" :
      $internalRuntimeVersion$ );

  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes.src = adSrc;
  }
  return attributes;
}
