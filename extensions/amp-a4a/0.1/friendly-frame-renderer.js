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
import {Renderer} from './amp-ad-type-defs';
import {createElementWithAttributes} from '../../../src/dom';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getDefaultBootstrapBaseUrl} from '../../../src/3p-frame';
import {
  installFriendlyIframeEmbed,
  setFriendlyIframeEmbedVisible,
} from '../../../src/friendly-iframe-embed';
import {installUrlReplacementsForEmbed} from '../../../src/service/url-replacements-impl';
import {setStyle} from '../../../src/style';

/**
 * Render a validated AMP creative directly in the parent page.
 */
export class FriendlyFrameRenderer extends Renderer {

  constructor() {
    super();

    /**
     * @type {?Element}
     * @private
     */
    this.iframe_ = null;
  }

  /** @override */
  render(context, element, creativeData) {
    const size = context.size;
    const adUrl = context.requestUrl;
    const creativeMetaData = creativeData.creativeMetaData;

    dev().assert(size, 'missing creative size');
    dev().assert(adUrl, 'missing ad request url');

    // Create and setup friendly iframe.
    this.iframe_ = /** @type {!HTMLIFrameElement} */(
      createElementWithAttributes(
          /** @type {!Document} */(element.ownerDocument),
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
          })));
    context.applyFillContent(this.iframe_);

    const fontsArray = [];
    if (creativeMetaData.customStylesheets) {
      creativeMetaData.customStylesheets.forEach(s => {
        const href = s['href'];
        if (href) {
          fontsArray.push(href);
        }
      });
    }

    return installFriendlyIframeEmbed(
        this.iframe_, element, {
          host: element,
          url: /** @type {string} */ (adUrl),
          html: creativeMetaData.minifiedCreative,
          extensionIds: creativeMetaData.customElementExtensions || [],
          fonts: fontsArray,
        }, embedWin => {
          installUrlReplacementsForEmbed(context.ampDoc, embedWin,
              new A4AVariableSource(context.ampDoc, embedWin));
        })
        .then(friendlyIframeEmbed => {
          setFriendlyIframeEmbedVisible(
              friendlyIframeEmbed, context.isInViewport());
          // Ensure visibility hidden has been removed (set by boilerplate).
          const frameDoc = friendlyIframeEmbed.iframe.contentDocument ||
              friendlyIframeEmbed.win.document;
          setStyle(frameDoc.body, 'visibility', 'visible');
        });
  }

  /** @return {!Element} */
  getIframe() {
    return this.iframe_;
  }
}
