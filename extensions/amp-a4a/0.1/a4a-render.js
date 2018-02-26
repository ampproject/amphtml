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
import {
  CreativeMetaDataDef,
  LayoutInfoDef,
} from './a4a-utils';
import {
  FriendlyIframeEmbed, // eslint-disable-line no-unused-vars
  installFriendlyIframeEmbed,
  setFriendlyIframeEmbedVisible,
} from '../../../src/friendly-iframe-embed';
import {createElementWithAttributes} from '../../../src/dom';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {installUrlReplacementsForEmbed} from '../../../src/service/url-replacements-impl';
import {setStyle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {utf8Decode} from '../../../src/utils/bytes';

const TAG = 'a4a-render';

/** @typedef {{
      templateUrl: string,
      data: (JsonObject|undefined),
      analytics: (JsonObject|undefined),
    }} */
export let AmpTemplateCreativeDef;

/** @typedef {{
      creativeMetadata: !CreativeMetaDataDef,
      templateData: AmpTemplateCreativeDef,
      size: !LayoutInfoDef,
      adUrl: string,
      sentinel: ?string,
    }} */
export let RendererInputDef;

/** @typedef {{
      iframe: ?Element,
      friendlyIframeEmbed: ?Promise<!FriendlyIframeEmbed>
    }} */
export let RendererOutputDef;

/** @typedef {
      function(
        !RendererInputDef,
        !Object,
        function():boolean=): !Promise<!RendererOutputDef>
    } */
export let RendererDef;

/** @typedef {
      function(
        !ArrayBuffer,
        !Headers,
        !Object,
        function():boolean=,
        function(string):string=): !Promise<!ValidatorOutputDef>
    } */
export let ValidatorDef;

/** @typedef {{
        creative: ?string,
        templateData: (JsonObject|undefined),
        analytics: (JsonObject|undefined),
        result: !ValidatorResultType,
    }} */
export let ValidatorOutputDef;

/** @typedef {string} */
export let ValidatorResultType;

/** @enum {ValidatorResultType} */
export const ValidatorResult = {
  AMP: 'amp',
  NON_AMP: 'non-amp',
};

/** @const {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-template-amp-creative';

/** @const {string} */
export const NO_CONTENT_RESPONSE = 'NO-CONTENT-RESPONSE';

/**
 * Stores an AmpAdInstance for each network type.
 * @const {Object<string, AmpAdTemplates>}
 */
const ampAdTemplatesStore = {};


/**
 * Render a validated AMP creative directly in the parent page.
 * @param {!RendererInputDef} renderingData
 * @param {!Object} baseImpl
 * @param {function():boolean=} checkStillCurrent
 * @return {!Promise<!RendererOutputDef>}
 */
export function friendlyFrameRenderer(
  renderingData,
  baseImpl,
  checkStillCurrent = () => true) {

  const creativeMetaData = renderingData.creativeMetadata;
  const size = renderingData.size;
  const adUrl = renderingData.adUrl;

  dev().assert(creativeMetaData.minifiedCreative, 'missing minified creative');
  dev().assert(baseImpl.element.ownerDocument, 'missing owner document?!');

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
        setFriendlyIframeEmbedVisible(
            friendlyIframeEmbed, baseImpl.isInViewport());
        // Ensure visibility hidden has been removed (set by boilerplate).
        const frameDoc = friendlyIframeEmbed.iframe.contentDocument ||
            friendlyIframeEmbed.win.document;
        setStyle(frameDoc.body, 'visibility', 'visible');
        // It's enough to wait for "ini-load" signal because in a FIE case
        // we know that the embed no longer consumes significant resources
        // after the initial load.
        return friendlyIframeEmbed.whenIniLoaded()
            .then(() => {
              checkStillCurrent();
              return /** @type {!RendererOutputDef} */ ({
                iframe,
                friendlyIframeEmbed,
              });
            });
      });
}

/**
 * Render a validated AMP template.
 * @param {!RendererInputDef} renderingData
 * @param {!Object} baseImpl
 * @param {function():boolean=} checkStillCurrent
 * @return {!Promise<!RendererOutputDef>}
 * @private
 */
export function templateRenderer(
  renderingData,
  baseImpl,
  checkStillCurrent = () => true) {
  return friendlyFrameRenderer(renderingData, baseImpl, checkStillCurrent)
      .then(rendererOutput => {
        const iframe = rendererOutput.iframe;
        const templateMacroValues = renderingData.templateData &&
            renderingData.templateData.data;
        if (iframe && templateMacroValues) {
          const ampAdTemplates = getOrCreateAmpAdTemplates(baseImpl);
          ampAdTemplates.render(
              templateMacroValues,
              iframe.contentWindow.document.body)
              .then(renderedElement => {
                const templateAnalytics = renderingData.templateData &&
                    renderingData.templateData.analytics;
                if (templateAnalytics) {
                  ampAdTemplates.insertAnalytics(
                      renderedElement, templateAnalytics);
                }
                iframe.contentWindow.document.body./*OK*/innerHTML =
                    renderedElement./*OK*/innerHTML;
              });
        }
        return rendererOutput;
      });
}


/**
 * Fetches and returns the template from the given ad response, wrapped as a
 * promise, or rejects if the template cannot be fetched.
 *
 * @param {!ArrayBuffer} bytes
 * @param {!Headers} headers
 * @param {!Object} baseImpl
 * @param {function():boolean=} checkStillCurrent
 * @param {function(string):string=} parseOnFetch
 * @return {!Promise<!ValidatorOutputDef>}
 */
export function templateValidator(
  bytes,
  headers,
  baseImpl,
  checkStillCurrent = () => true,
  parseOnFetch = () => {}) {
  return Promise.resolve(utf8Decode(bytes)).then(body => {
    checkStillCurrent();
    if (headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache') {
      return /**@type {!Promise<!ValidatorOutputDef>} */ (Promise.resolve({
        creative: body,
        templateData: null,
        result: ValidatorResult.NON_AMP,
      }));
    }
    const ampCreativeJson = /** @type {!AmpTemplateCreativeDef} */
          (tryParseJson(body) || {});
    return getOrCreateAmpAdTemplates(baseImpl)
        .fetch(ampCreativeJson.templateUrl)
        .then(template => {
          return {
            templateData: {
              template: parseOnFetch ? parseOnFetch(template) : template,
              data: ampCreativeJson.data,
              analytics: ampCreativeJson.analytics,
            },
            result: ValidatorResult.AMP,
          };
        })
        .catch(error => {
          dev().warn(TAG, 'Error fetching/expanding template',
              ampCreativeJson, error);
          baseImpl.forceCollapse();
          return Promise.reject(NO_CONTENT_RESPONSE);
        });
  });
}


/**
 * @param {!Object} baseImpl AmpAdNetworkBase impl.
 */
function getOrCreateAmpAdTemplates(baseImpl) {
  const doc = baseImpl.element.ownerDocument;
  const implType = baseImpl.getAttribute('type') || 'anon';
  return ampAdTemplatesStore[implType] = ampAdTemplatesStore[implType] ||
      new AmpAdTemplates(doc.defaultView || doc.parentWindow);
}
