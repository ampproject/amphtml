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
import {Services} from './services';
import {experimentToggles, isCanary} from './experiments';
import {getLengthNumeral} from './layout';
import {getModeObject} from './mode-object';
import {DomFingerprint} from './utils/dom-fingerprint';
import {dict} from './utils/object.js';

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
 * @param {!string} sentinel
 * @param {!JsonObject=} attributes
 * @param {string=} opt_safeframeVersion If passed, will append fluid-related
 *    attributes.
 * @return {!JsonObject}
 */
export function getContextMetadata(
    parentWindow, element, sentinel, attributes, opt_safeframeVersion = '') {
  const startTime = Date.now();
  const width = element.getAttribute('width');
  const height = element.getAttribute('height');
  attributes = attributes ? attributes : dict();
  attributes['width'] = getLengthNumeral(width);
  attributes['height'] = getLengthNumeral(height);
  let locationHref = parentWindow.location.href;
  // This is really only needed for tests, but whatever. Children
  // see us as the logical origin, so telling them we are about:srcdoc
  // will fail ancestor checks.
  if (locationHref == 'about:srcdoc') {
    locationHref = parentWindow.parent.location.href;
  }

  const docInfo = Services.documentInfoForDoc(element);
  const viewer = Services.viewerForDoc(element);
  const referrer = viewer.getUnconfirmedReferrerUrl();

  // TODO(alanorozco): Redesign data structure so that fields not exposed by
  // AmpContext are not part of this object.
  const layoutRect = element.getPageLayoutBox();
  attributes['_context'] = dict({
    'ampcontextVersion': '$internalRuntimeVersion$',
    'ampcontextFilepath': urls.thirdParty + '/$internalRuntimeVersion$' +
        '/ampcontext-v0.js',
    'sourceUrl': docInfo.sourceUrl,
    'referrer': referrer,
    'canonicalUrl': docInfo.canonicalUrl,
    'pageViewId': docInfo.pageViewId,
    'location': {
      'href': locationHref,
    },
    'startTime': startTime,
    'tagName': element.tagName,
    'mode': getModeObject(),
    'canary': isCanary(parentWindow),
    'hidden': !viewer.isVisible(),
    'initialLayoutRect': layoutRect ? {
      'left': layoutRect.left,
      'top': layoutRect.top,
      'width': layoutRect.width,
      'height': layoutRect.height,
    } : null,
    'initialIntersection': element.getIntersectionChangeEntry(),
    'domFingerprint': DomFingerprint.generate(element),
    'experimentToggles': experimentToggles(parentWindow),
    'sentinel': sentinel,
  });
  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes['src'] = adSrc;
  }
  if (opt_safeframeVersion) {
    attributes['uid'] = 1;
    attributes['hostPeerName'] = parentWindow.location.origin;
    // The initial geometry isn't used for anything important, but it is
    // expected, so we pass this string with all zero values.
    attributes['initialGeometry'] = JSON.stringify(
        /** @type {!JsonObject} */ ({
          'windowCoords_t': 0,
          'windowCoords_r': 0,
          'windowCoords_b': 0,
          'windowCoords_l': 0,
          'frameCoords_t': 0,
          'frameCoords_r': 0,
          'frameCoords_b': 0,
          'frameCoords_l': 0,
          'styleZIndex': 'auto',
          'allowedExpansion_t': 0,
          'allowedExpansion_r': 0,
          'allowedExpansion_b': 0,
          'allowedExpansion_l': 0,
          'xInView': 0,
          'yInView': 0,
        }));
    attributes['permissions'] = JSON.stringify(
        /** @type {!JsonObject} */ ({
          expandByOverlay: false,
          expandByPush: false,
          readCookie: false,
          writeCookie: false,
        }));
    attributes['metadata'] = JSON.stringify(
        /** @type {!JsonObject} */ ({
          shared: {
            'sf_ver': opt_safeframeVersion,
            'ck_on': 1,
            'flash_ver': '26.0.0',
          },
        }));
    attributes['reportCreativeGeometry'] = true;
    attributes['isDifferentSourceWindow'] = false;
    attributes['sentinel'] = sentinel;
  }
  return attributes;
}
