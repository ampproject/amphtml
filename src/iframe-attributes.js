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
import {DomFingerprint} from './core/dom/fingerprint';
import {Services} from './services';
import {dict} from './core/types/object';
import {experimentToggles, isCanary} from './experiments';
import {getLengthNumeral} from './layout';
import {getModeObject} from './mode-object';
import {getPageLayoutBoxBlocking} from './utils/page-layout-box';
import {internalRuntimeVersion} from './internal-version';
import {urls} from './config';

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
 * @param {string} sentinel
 * @param {!JsonObject=} attributes
 * @return {!JsonObject}
 */
export function getContextMetadata(
  parentWindow,
  element,
  sentinel,
  attributes
) {
  const startTime = Date.now();
  const width = element.getAttribute('width');
  const height = element.getAttribute('height');
  attributes = attributes ? attributes : dict();
  attributes['width'] = getLengthNumeral(width);
  attributes['height'] = getLengthNumeral(height);
  if (element.getAttribute('title')) {
    attributes['title'] = element.getAttribute('title');
  }
  let locationHref = parentWindow.location.href;
  // This is really only needed for tests, but whatever. Children
  // see us as the logical origin, so telling them we are about:srcdoc
  // will fail ancestor checks.
  if (locationHref == 'about:srcdoc') {
    locationHref = parentWindow.parent.location.href;
  }

  const ampdoc = Services.ampdoc(element);
  const docInfo = Services.documentInfoForDoc(element);
  const viewer = Services.viewerForDoc(element);
  const referrer = viewer.getUnconfirmedReferrerUrl();

  const layoutRect = getPageLayoutBoxBlocking(element);

  // Use JsonObject to preserve field names so that ampContext can access
  // values with name
  // ampcontext.js and this file are compiled in different compilation unit

  // Note: Field names can by perserved by using JsonObject, or by adding
  // perserved name to extern. We are doing both right now.
  // Please also add new introduced variable
  // name to the extern list.
  attributes['_context'] = dict({
    'ampcontextVersion': internalRuntimeVersion(),
    'ampcontextFilepath': `${
      urls.thirdParty
    }/${internalRuntimeVersion()}/ampcontext-v0.js`,
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
    'hidden': !ampdoc.isVisible(),
    'initialLayoutRect': layoutRect
      ? {
          'left': layoutRect.left,
          'top': layoutRect.top,
          'width': layoutRect.width,
          'height': layoutRect.height,
        }
      : null,
    'domFingerprint': DomFingerprint.generate(element),
    'experimentToggles': experimentToggles(parentWindow),
    'sentinel': sentinel,
  });
  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes['src'] = adSrc;
  }
  return attributes;
}
