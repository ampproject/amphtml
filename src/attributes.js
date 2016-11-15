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
    console.log("Could not get canonicalUrl");
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
