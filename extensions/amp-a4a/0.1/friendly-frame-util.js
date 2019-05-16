/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {A4AVariableSource} from '../../amp-a4a/0.1/a4a-variable-source';
import {createElementWithAttributes} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {
  installFriendlyIframeEmbed,
  setFriendlyIframeEmbedVisible,
} from '../../../src/friendly-iframe-embed';
import {installUrlReplacementsForEmbed} from '../../../src/service/url-replacements-impl';
import {setStyle} from '../../../src/style';

/**
 * Renders a creative into a "NameFrame" iframe.
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
  const iframe = /** @type {!HTMLIFrameElement} */ (createElementWithAttributes(
    /** @type {!Document} */ (element.ownerDocument),
    'iframe',
    dict({
      // NOTE: It is possible for either width or height to be 'auto',
      // a non-numeric value.
      'height': size.height,
      'width': size.width,
      'frameborder': '0',
      'allowfullscreen': '',
      'allowtransparency': '',
      'scrolling': 'no',
    })
  ));
  // TODO(glevitzky): Ensure that applyFillContent or equivalent is called.

  const fontsArray = [];
  if (creativeMetadata.customStylesheets) {
    creativeMetadata.customStylesheets.forEach(s => {
      const href = s['href'];
      if (href) {
        fontsArray.push(href);
      }
    });
  }

  return installFriendlyIframeEmbed(
    iframe,
    element,
    {
      host: element,
      url: /** @type {string} */ (adUrl),
      html: creativeMetadata.minifiedCreative,
      extensionIds: creativeMetadata.customElementExtensions || [],
      fonts: fontsArray,
    },
    embedWin => {
      installUrlReplacementsForEmbed(
        element.getAmpDoc(),
        embedWin,
        new A4AVariableSource(element.getAmpDoc(), embedWin)
      );
    }
  ).then(friendlyIframeEmbed => {
    setFriendlyIframeEmbedVisible(friendlyIframeEmbed, element.isInViewport());
    // Ensure visibility hidden has been removed (set by boilerplate).
    const frameDoc =
      friendlyIframeEmbed.iframe.contentDocument ||
      friendlyIframeEmbed.win.document;
    setStyle(frameDoc.body, 'visibility', 'visible');
    return iframe;
  });
}
