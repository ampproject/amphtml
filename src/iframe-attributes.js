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
import {DomFingerprint} from './utils/dom-fingerprint';
import {Services} from './services';
import {dict} from './utils/object.js';
import {experimentToggles, isCanary} from './experiments';
import {getLengthNumeral} from './layout';
import {getModeObject} from './mode-object';
import {internalRuntimeVersion} from './internal-version';
import {urls} from './config';
import {getViewport} from './service/document-info-impl';

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
 * @param {string} sentinel
 * @param {!JsonObject=} attributes
 * @param {!boolean} opt_preactmode
 * @return {!JsonObject}
 */
export function getContextMetadata(
  parentWindow,
  element,
  sentinel,
  attributes,
  opt_preactmode
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

  let docInfo;
  let referrer;
  if (!opt_preactmode) {
    const ampdoc = Services.ampdoc(element);
    docInfo = Services.documentInfoForDoc(element);
    const viewer = Services.viewerForDoc(element);
    referrer = viewer.getUnconfirmedReferrerUrl();
  } else {
    docInfo = {
      sourceUrl: parentWindow.location.href,
      canonicalUrl: parentWindow.location.href,
     pageViewId: Math.random().toString(),
     pageViewId64: Promise.resolve(Math.random().toString()),
     linkRels: {},
     viewport: document.head.querySelector('meta[name="viewport"]') ? document.head.querySelector('meta[name="viewport"]').getAttribute('content') : null, // (get from src/service/document-info-impl.js#L175)
     replaceParams: {},
   };
   referrer = document.referrer;
  }
  
  
  

  // TODO(alanorozco): Redesign data structure so that fields not exposed by
  // AmpContext are not part of this object.
  let layoutRect;
  if (!opt_preactmode) {
    layoutRect = element.getPageLayoutBox();
  } else {
    layoutRect = {
      left: 10,
      top: 10,
      width: 500,
      height: 500
    }
  }
  

  // Use JsonObject to preserve field names so that ampContext can access
  // values with name
  // ampcontext.js and this file are compiled in different compilation unit

  // Note: Field names can by perserved by using JsonObject, or by adding
  // perserved name to extern. We are doing both right now.
  // Please also add new introduced variable
  // name to the extern list.
  const _context = dict({
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
    // 'mode': getModeObject(opt_preactmode=true),
    'mode': {
      localDev: true,
      development: true,
      esm: false,
      minified: false,
      lite: false,
      test: false,
      log: null,
      version: null,
      rtvVersion: null,
    },
    'canary': isCanary(parentWindow),
    'hidden': opt_preactmode ? false : !ampdoc.isVisible(),
    'initialLayoutRect': layoutRect
      ? {
          'left': layoutRect.left,
          'top': layoutRect.top,
          'width': layoutRect.width,
          'height': layoutRect.height,
        }
      : null,
    // 'initialIntersection': element.getIntersectionChangeEntry(),
    'initialIntersection': {
      "time": 903.9600000032806,
      "rootBounds": {
        "left": 0,
        "top": 0,
        "width": 1680,
        "height": 948,
        "bottom": 948,
        "right": 1680,
        "x": 0,
        "y": 0
      },
      "boundingClientRect": {
        "left": 475,
        "top": 780,
        "width": 731,
        "height": 988,
        "bottom": 1768,
        "right": 1206,
        "x": 475,
        "y": 780
      },
      "intersectionRect": {
        "left": 475,
        "top": 780,
        "width": 731,
        "height": 168,
        "bottom": 948,
        "right": 1206,
        "x": 475,
        "y": 780
      },
      "intersectionRatio": 0.1700404858299595
    },
    'domFingerprint': DomFingerprint.generate(element),
    'experimentToggles': experimentToggles(parentWindow),
    'sentinel': sentinel,
    'tagName': "AMP-FACEBOOK-COMMENTS"
  });
  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes['src'] = adSrc;
  }
  attributes = {
    href: "http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html",
    width: layoutRect.width,
    height: layoutRect.height,
    type: "facebook",
    _context: JSON.parse(JSON.stringify(_context))
  };
  return attributes;
}