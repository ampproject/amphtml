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
import {urls} from './config';
import {documentInfoForDoc} from './services';
import {experimentToggles, isCanary} from './experiments';
import {viewerForDoc} from './services';
import {getLengthNumeral} from './layout';
import {getModeObject} from './mode-object';
import {domFingerprint} from './utils/dom-fingerprint';

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
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

  const docInfo = documentInfoForDoc(element);
  const viewer = viewerForDoc(element);
  const referrer = viewer.getUnconfirmedReferrerUrl();

  // TODO(alanorozco): Redesign data structure so that fields not exposed by
  // AmpContext are not part of this object.
  const layoutRect = element.getPageLayoutBox();
  attributes._context = {
    ampcontextVersion: '$internalRuntimeVersion$',
    ampcontextFilepath: urls.cdn + '/$internalRuntimeVersion$' +
        '/ampcontext-v0.js',
    sourceUrl: docInfo.sourceUrl,
    referrer,
    canonicalUrl: docInfo.canonicalUrl,
    pageViewId: docInfo.pageViewId,
    location: {
      href: locationHref,
    },
    startTime,
    tagName: element.tagName,
    mode: getModeObject(),
    canary: isCanary(parentWindow),
    hidden: !viewer.isVisible(),
    initialLayoutRect: layoutRect ? {
      left: layoutRect.left,
      top: layoutRect.top,
      width: layoutRect.width,
      height: layoutRect.height,
    } : null,
    initialIntersection: element.getIntersectionChangeEntry(),
    domFingerprint: domFingerprint(element),
    experimentToggles: experimentToggles(parentWindow),
  };
  attributes._context['sentinel'] = sentinel;
  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes.src = adSrc;
  }
  return attributes;
}
