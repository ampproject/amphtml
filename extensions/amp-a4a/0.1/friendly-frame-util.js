import {createElementWithAttributes} from '#core/dom';
import {setStyle} from '#core/dom/style';

import {installUrlReplacementsForEmbed} from '#service/url-replacements-impl';

import {A4AVariableSource} from './a4a-variable-source';
import {getExtensionsFromMetadata} from './amp-ad-utils';

import {installFriendlyIframeEmbed} from '../../../src/friendly-iframe-embed';

/**
 * Renders a creative into a friendly iframe.
 *
 * @param {string} adUrl The ad request URL.
 * @param {!./amp-ad-type-defs.LayoutInfoDef} size The size and layout of the
 *   element.
 * @param {!Element} element The ad slot element.
 * @param {!./amp-ad-type-defs.CreativeMetaDataDef} creativeMetadata Metadata
 *   for the creative. Contains information like required extensions, fonts, and
 *   of course the creative itself.
 * @return {!Promise<!Element>} The iframe into which the creative was rendered.
 */
export function renderCreativeIntoFriendlyFrame(
  adUrl,
  size,
  element,
  creativeMetadata
) {
  // Create and setup friendly iframe.
  const iframe = /** @type {!HTMLIFrameElement} */ (
    createElementWithAttributes(
      /** @type {!Document} */ (element.ownerDocument),
      'iframe',
      {
        // NOTE: It is possible for either width or height to be 'auto',
        // a non-numeric value.
        'height': size.height,
        'width': size.width,
        'frameborder': '0',
        'allowfullscreen': '',
        'allowtransparency': '',
        'scrolling': 'no',
        'role': 'region',
        'aria-label': 'Advertisement',
        'tabindex': '0',
      }
    )
  );
  iframe.classList.add('i-amphtml-fill-content');

  const fontsArray = [];
  if (creativeMetadata.customStylesheets) {
    creativeMetadata.customStylesheets.forEach((s) => {
      const href = s['href'];
      if (href) {
        fontsArray.push(href);
      }
    });
  }

  const extensions = getExtensionsFromMetadata(creativeMetadata);
  return installFriendlyIframeEmbed(
    iframe,
    element,
    {
      host: element,
      url: /** @type {string} */ (adUrl),
      html: creativeMetadata.minifiedCreative,
      extensions,
      fonts: fontsArray,
    },
    (embedWin, ampdoc) => {
      const parentAmpdoc = element.getAmpDoc();
      installUrlReplacementsForEmbed(
        ampdoc,
        new A4AVariableSource(parentAmpdoc, embedWin)
      );
    }
  ).then((friendlyIframeEmbed) => {
    // Ensure visibility hidden has been removed (set by boilerplate).
    const frameDoc =
      friendlyIframeEmbed.iframe.contentDocument ||
      friendlyIframeEmbed.win.document;
    setStyle(frameDoc.body, 'visibility', 'visible');
    return iframe;
  });
}
