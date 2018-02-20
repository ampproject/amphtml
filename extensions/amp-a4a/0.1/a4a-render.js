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

import {A4AVariableSource} from './a4a-variable-source';
import {AmpAdTemplates} from '../../amp-a4a/0.1/amp-ad-templates';
import {SizeInfoDef} from './a4a-utils';
import {createElementWithAttributes} from '../../../src/dom';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getTimingDataAsync} from '../../../src/service/variable-source';
import {
  installFriendlyIframeEmbed,
  setFriendlyIframeEmbedVisible,
} from '../../../src/friendly-iframe-embed';
import {installUrlReplacementsForEmbed} from '../../../src/service/url-replacements-impl';
import {setStyle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {utf8Decode, utf8Encode} from '../../../src/utils/bytes';

const TAG = 'a4a-render';

/** @typedef {{
      creativeMetadata: !CreativeMetaDataDef,
      size: !SizeInfoDef,
      adUrl: string,
      sentinel: ?string,
    }} */
export let RenderingDataDef;

/** @typedef {{
      templateUrl: string,
      data: (JsonObject|undefined),
    }} */
export let AmpTemplateCreativeDef;

export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-template-amp-creative';

/** @type {string} */
export const NO_CONTENT_RESPONSE = 'NO-CONTENT-RESPONSE';

/**
 * Render a validated AMP creative directly in the parent page.
 * @param {!RenderingDataDef} renderingData
 * @param {!../../amp-ad-network-base/0.1/amp-ad-network-base.AmpAdNetworkBase}
 *   baseImpl
 * @param {function(!RenderingDataDef)=} onRenderCallback
 * @param {function(?string, ?Object)=} lifecycleStageHandler
 * @return {!Promise<Element>} Whether the creative was successfully rendered.
 * @private
 */
export function friendlyFrameRenderer(
  renderingData,
  baseImpl,
  onRenderCallback = () => {},
  lifecycleStageHandler = () => {}) {

  const creativeMetaData = renderingData.creativeMetadata;
  const size = renderingData.size;
  const adUrl = renderingData.adUrl;

  dev().assert(creativeMetaData.minifiedCreative, 'missing minified creative');
  dev().assert(baseImpl.element.ownerDocument, 'missing owner document?!');

  lifecycleStageHandler('renderFriendlyStart');

  // Create and setup friendly iframe.
  const iframe = /** @type {!HTMLIFrameElement} */(
    createElementWithAttributes(
        /** @type {!Document} */(baseImpl.element.ownerDocument), 'iframe',
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
  baseImpl.applyFillContent(iframe);
  const fontsArray = [];
  if (creativeMetaData.customStylesheets) {
    creativeMetaData.customStylesheets.forEach(s => {
      const href = s['href'];
      if (href) {
        fontsArray.push(href);
      }
    });
  }
  const checkStillCurrent = this.verifyStillCurrent();
  return installFriendlyIframeEmbed(
      iframe, baseImpl.element, {
        host: baseImpl.element,
        url: adUrl,
        html: creativeMetaData.minifiedCreative,
        extensionIds: creativeMetaData.customElementExtensions || [],
        fonts: fontsArray,
      }, embedWin => {
        installUrlReplacementsForEmbed(baseImpl.getAmpDoc(), embedWin,
            new A4AVariableSource(baseImpl.getAmpDoc(), embedWin));
      })
      .then(friendlyIframeEmbed => {
        checkStillCurrent();
        //    this.friendlyIframeEmbed_ = friendlyIframeEmbed;
        setFriendlyIframeEmbedVisible(
            friendlyIframeEmbed, baseImpl.isInViewport());
        // Ensure visibility hidden has been removed (set by boilerplate).
        const frameDoc = friendlyIframeEmbed.iframe.contentDocument ||
            friendlyIframeEmbed.win.document;
        setStyle(frameDoc.body, 'visibility', 'visible');
        // Capture timing info for friendly iframe load completion.
        getTimingDataAsync(
            friendlyIframeEmbed.win,
            'navigationStart', 'loadEventEnd').then(delta => {
          checkStillCurrent();
          lifecycleStageHandler('friendlyIframeLoaded', {
            'navStartToLoadEndDelta.AD_SLOT_ID': Math.round(delta),
          });
        }).catch(err => {
          dev().error(TAG, baseImpl.element.getAttribute('type'),
              'getTimingDataAsync for renderFriendlyEnd failed: ', err);
        });
        if (onRenderCallback) {
          try {
            onRenderCallback(renderingData);
          } catch (err) {
            dev().error(TAG, 'Error executing onRenderCallback', err);
          }
        }
        // It's enough to wait for "ini-load" signal because in a FIE case
        // we know that the embed no longer consumes significant resources
        // after the initial load.
        return friendlyIframeEmbed.whenIniLoaded();
      }).then(() => {
        checkStillCurrent();
        // Capture ini-load ping.
        lifecycleStageHandler('friendlyIframeIniLoad');
      });
}


/**
 * Fetches and returns the template from the given ad response, wrapped as a
 * promise, or rejects if the template cannot be fetched
 * .
 * @param {!ArrayBuffer} bytes
 * @param {!Headers} headers
 * @param {!../../amp-ad-network-base/0.1/amp-ad-network-base.AmpAdNetworkBase}
 *   baseImpl
 * @param {function(string):string=} parseOnFetch
 * @return {!Promise<?ArrayBuffer>}
 */
export function templateValidator(
  bytes,
  headers,
  baseImpl,
  parseOnFetch = () => {}) {

  if (headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache') {
    return /**@type {!Promise<(ArrayBuffer|null)>}*/ (Promise.resolve(null));
  }
  const checkStillCurrent = () => {}; //this.verifyStillCurrent();
  return Promise.resolve(utf8Decode(bytes)).then(body => {
    checkStillCurrent();
    const ampCreativeJson = /** @type {!AmpTemplateCreativeDef} */
          (tryParseJson(body) || {});
    // TODO(levitzky) Will probably not want to create a new instance here every
    // time this is invoked.
    return new AmpAdTemplates()
        .fetch(ampCreativeJson.templateUrl)
        .then(template => {
          return utf8Encode(parseOnFetch ? parseOnFetch(template) : template);
        })
        .catch(error => {
          dev().warn(TAG, 'Error fetching/expanding template',
              ampCreativeJson, error);
          baseImpl.forceCollapse();
          return Promise.reject(NO_CONTENT_RESPONSE);
        });
  });
}

