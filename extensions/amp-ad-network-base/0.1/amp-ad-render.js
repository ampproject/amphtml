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
import {AmpAdTemplates} from '../../amp-a4a/0.1/amp-ad-templates';
import {Services} from '../../../src/services';
import {Renderer, Validator, ValidatorResult} from './amp-ad-type-defs';
import {createElementWithAttributes} from '../../../src/dom';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getContextMetadata} from '../../../src/iframe-attributes';
import {getDefaultBootstrapBaseUrl} from '../../../src/3p-frame';
import {
  installFriendlyIframeEmbed,
  setFriendlyIframeEmbedVisible,
} from '../../../src/friendly-iframe-embed';
import {installUrlReplacementsForEmbed} from '../../../src/service/url-replacements-impl';
import {setStyle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';
import {utf8Decode} from '../../../src/utils/bytes';

/** @type {!Object} @private */
const SHARED_IFRAME_PROPERTIES = dict({
  'frameborder': '0',
  'allowfullscreen': '',
  'allowtransparency': '',
  'scrolling': 'no',
  'marginwidth': '0',
  'marginheight': '0',
});

/** @const {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-template-amp-creative';

/** @const {string} */
export const NO_CONTENT_RESPONSE = 'NO-CONTENT-RESPONSE';

/** @typedef {{
      minifiedCreative: string,
      customElementExtensions: !Array<string>,
      customStylesheets: !Array<{href: string}>,
      images: (Array<string>|undefined),
    }} */
export let CreativeMetaDataDef;

/** @typedef {{
      templateUrl: string,
      data: (JsonObject|undefined),
      analytics: (JsonObject|undefined),
    }} */
export let AmpTemplateCreativeDef;

/** @typedef {{
      rawCreativeBytes: !ArrayBuffer,
      additionalContextMetadata: !JsonObject,
      sentinel: string,
    }} */
export let CrossDomainDataDef;

/**
 * Render a validated AMP creative directly in the parent page.
 */
export class FriendlyFrameRenderer extends Renderer {

  constructor() {
    super();
    /** @type {?Element} */
    this.iframe = null;
  }

  /** @override */
  render(context, element, creativeData) {

    const creativeMetaData = /** @type {!CreativeMetaDataDef} */ (
      creativeData.creativeMetadata);
    const size = context.size;
    const adUrl = context.requestUrl;

    dev().assert(size, 'missing creative size');
    dev().assert(adUrl, 'missing ad request url');

    // Create and setup friendly iframe.
    this.iframe = /** @type {!HTMLIFrameElement} */(
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
    context.applyFillContent(this.iframe);

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
        this.iframe, element, {
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
}

/**
 * Render a non-AMP creative into a NameFrame.
 */
export class NameFrameRenderer extends Renderer {
  /** @override */
  render(context, element, unusedCreativeData) {
    const crossDomainData = context.crossDomainData;
    dev().assert(crossDomainData, 'CrossDomain data undefined!');
    const rawCreativeBytes = crossDomainData.rawCreativeBytes;
    const creative = utf8Decode(rawCreativeBytes);
    const srcPath =
        getDefaultBootstrapBaseUrl(context.win, 'nameframe');
    const additionalContextMetadata =
        crossDomainData.additionalContextMetadata;
    const sentinel = crossDomainData.sentinel;
    const contextMetadata = getContextMetadata(
        context.win,
        element,
        sentinel,
        additionalContextMetadata);
    contextMetadata['creative'] = creative;
    const name = JSON.stringify(contextMetadata);
    iframeRenderHelper(element, dict({'src': srcPath, 'name': name}), context);
  }
}

/**
 * Render a validated AMP template.
 */
export class TemplateRenderer extends FriendlyFrameRenderer {

  constructor() {
    super();

    /** @private {?AmpAdTemplates} */
    this.ampAdTemplates_ = null;
  }

  /** @override */
  render(context, containerElement, creativeData) {
    super.render(context, containerElement, creativeData.creativeMetadata)
        .then(() => {
          const templateData = creativeData.templateData;
          const templateMacroValues = templateData && templateData.data;
          if (this.iframe && templateMacroValues) {
            this.ampAdTemplates_ = this.ampAdTemplates_ ||
                new AmpAdTemplates(context.win);
            this.ampAdTemplates_.render(
                templateMacroValues,
                this.iframe.contentWindow.document.body)
                .then(renderedElement => {
                  const analytics = templateData && templateData.analytics;
                  if (analytics) {
                    this.ampAdTemplates_.insertAnalytics(
                        renderedElement, analytics);
                  }
                  this.iframe.contentWindow.document.body./*OK*/innerHTML =
                    renderedElement./*OK*/innerHTML;
                });
          }
        });
  }
}

/**
 * Fetches and returns the template from the given ad response, wrapped as a
 * promise, or rejects if the template cannot be fetched.
 */
export class TemplateValidator extends Validator {

  constructor() {
    super();

    /** @private {?AmpAdTemplates} */
    this.ampAdTemplates_ = null;
  }

  /**
   * @param {string} templateString
   * @param {!AmpTemplateCreativeDef} parsedResponseBody
   * @return {!CreativeMetaDataDef}
   * @private
   */
  getAmpAdMetadata_(templateString, parsedResponseBody) {
    // TODO(levitzky) The following minification is for demo purposes only. Once
    // launched this will either be performed server-side, or will be replaced
    // by more sophisticated logic.
    const minifiedCreative = templateString.replace(
        /<script async.+?<\/script>/g, '');
    const metadata = /** @type {!CreativeMetaDataDef} */ ({
      minifiedCreative,
      customElementExtensions: [],
      extensions: [],
    });
    if (parsedResponseBody.analytics) {
      pushIfNotExist(metadata['customElementExtensions'], 'amp-analytics');
    }
    pushIfNotExist(metadata['customElementExtensions'], 'amp-mustache');
    return metadata;
  }

  /**
   * @param {!CreativeMetaDataDef} metadata
   * @param {!Window} win
   * @private
   */
  processMetadata_(metadata, win) {
    const extensions = Services.extensionsFor(win);
    metadata.customElementExtensions.forEach(
        extensionId => extensions./*OK*/preloadExtension(extensionId));
    // TODO(levitzky) Add preload logic for fonts / images.
  }

  /** @override */
  validate(context, unvalidatedBytes, headers) {
    const creativeData = {};
    const body = utf8Decode(/** @type {!ArrayBuffer} */ (unvalidatedBytes));
    if (!headers ||
        headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache') {
      creativeData['creative'] = body;
      return Promise.resolve({creativeData, type: ValidatorResult.NON_AMP});
    }

    const parsedResponseBody =
        /** @type {!AmpTemplateCreativeDef} */ (
        tryParseJson(body) || {});
    this.ampAdTemplates_ = this.ampAdTemplates_ ||
        new AmpAdTemplates(context.win);
    return this.ampAdTemplates_
        .fetch(parsedResponseBody.templateUrl)
        .then(template => {
          const creativeMetadata =
              this.getAmpAdMetadata_(template, parsedResponseBody);
          this.processMetadata_(creativeMetadata, context);
          creativeData.templateData = parsedResponseBody.data;
          creativeData.creativeMetadata = creativeMetadata;
          return {creativeData, type: ValidatorResult.AMP};
        });
  }
}


/**
 * Shared functionality for cross-domain iframe-based rendering methods.
 * @param {!Object} context
 * @param {!Element} containerElement
 * @param {!JsonObject<string, string>} attributes The attributes of the iframe.
 */
function iframeRenderHelper(context, containerElement, attributes) {
  const size = context.size;
  const crossDomainData = context.crossDomainData;
  const sentinel = crossDomainData && crossDomainData.sentinel;
  const mergedAttributes = Object.assign(attributes, dict({
    'height': size.height,
    'width': size.width,
  }));
  if (sentinel) {
    mergedAttributes['data-amp-3p-sentinel'] = sentinel;
  }
  const iframe = createElementWithAttributes(
      /** @type {!Document} */ (containerElement.ownerDocument), 'iframe',
      /** @type {!JsonObject} */ (Object.assign(mergedAttributes,
          SHARED_IFRAME_PROPERTIES)));
  const crossOriginIframeHandler =
      new AMP.AmpAdXOriginIframeHandler(context.baseInstance);
  crossOriginIframeHandler.init(iframe, /* opt_isA4A */ true);
}

function pushIfNotExist(array, item) {
  if (array.indexOf(item) < 0) {
    array.push(item);
  }
}
