import {DomFingerprint} from '#core/dom/fingerprint';
import {getLengthNumeral} from '#core/dom/layout';
import {getPageLayoutBoxBlocking} from '#core/dom/layout/page-layout-box';
import * as mode from '#core/mode';

import {experimentToggles, isCanary} from '#experiments';

import {Services} from '#service';

import * as urls from './config/urls';
import {getModeObject} from './mode-object';

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
  attributes = attributes ? attributes : {};
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
  attributes['_context'] = {
    'ampcontextVersion': mode.version(),
    'ampcontextFilepath': `${
      urls.thirdParty
    }/${mode.version()}/ampcontext-v0.js`,
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
  };
  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes['src'] = adSrc;
  }
  return attributes;
}
