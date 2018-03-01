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
import {
  CreativeMetaDataDef,
  LayoutInfoDef,
  getAmpAdMetadata, // eslint-disable-line no-unused-vars
} from './amp-ad-utils';
import {ValidatorResult} from './amp-ad-type-defs';
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


export class Renderer {
  /**
   * @param {!./amp-ad-context.AmpAdContext} context
   * @param {!./amp-ad-network-base.AmpAdNetworkBase} unusedBaseInstance
   * @return {!Promise<!./amp-ad-context.AmpAdContext>}
   */
  render(context, unusedBaseInstance) {
    return Promise.resolve(context);
  }
}

export class Validator {
  /**
   * @param {!./amp-ad-context.AmpAdContext} context
   * @return {!Promise<!./amp-ad-context.AmpAdContext>}
   */
  validate(context) {
    return Promise.resolve(context);
  }
}


/**
 * Render a validated AMP creative directly in the parent page.
 */
export class FriendlyFrameRenderer extends Renderer {

  /** @override */
  render(context, baseInstance) {

    const creativeMetaData = context.getCreativeMetadata();
    const size = context.getSize();
    const adUrl = context.getRequestUrl();

    dev().assert(creativeMetaData, 'missing creative metadata');
    dev().assert(size, 'missing creative size');
    dev().assert(adUrl, 'missing ad request url');
    dev().assert(creativeMetaData.minifiedCreative,
        'missing minified creative');
    dev().assert(baseInstance.element.ownerDocument,
        'missing owner document?!');

    // Create and setup friendly iframe.
    const iframe = /** @type {!HTMLIFrameElement} */(
      createElementWithAttributes(
          /** @type {!Document} */(baseInstance.element.ownerDocument),
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
    baseInstance.applyFillContent(iframe);

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
        iframe, baseInstance.element, {
          host: baseInstance.element,
          url: /** @type {string} */ (adUrl),
          html: creativeMetaData.minifiedCreative,
          extensionIds: creativeMetaData.customElementExtensions || [],
          fonts: fontsArray,
        }, embedWin => {
          installUrlReplacementsForEmbed(baseInstance.getAmpDoc(), embedWin,
              new A4AVariableSource(baseInstance.getAmpDoc(), embedWin));
        })
        .then(friendlyIframeEmbed => {
          setFriendlyIframeEmbedVisible(
              friendlyIframeEmbed, baseInstance.isInViewport());
          // Ensure visibility hidden has been removed (set by boilerplate).
          const frameDoc = friendlyIframeEmbed.iframe.contentDocument ||
              friendlyIframeEmbed.win.document;
          setStyle(frameDoc.body, 'visibility', 'visible');
          // It's enough to wait for "ini-load" signal because in a FIE case
          // we know that the embed no longer consumes significant resources
          // after the initial load.
          return friendlyIframeEmbed.whenIniLoaded()
              .then(() => {
                return context.setIframe(iframe)
                    .setFriendlyIframeEmbed(friendlyIframeEmbed);
              });
        });
  }
}

/**
 * Render a non-AMP creative into a NameFrame.
 */
export class NameFrameRenderer extends Renderer {
  /** @override */
  render(context, baseInstance) {
    const crossDomainData = context.getCrossDomainData();
    dev().assert(crossDomainData, 'CrossDomain data undefined!');
    const rawCreativeBytes = crossDomainData.rawCreativeBytes;
    return Promise.resolve(utf8Decode(rawCreativeBytes)).then(creative => {
      const srcPath =
          getDefaultBootstrapBaseUrl(baseInstance.win, 'nameframe');
      const additionalContextMetadata =
          crossDomainData.additionalContextMetadata;
      const sentinel = crossDomainData.sentinel;
      const contextMetadata = getContextMetadata(
          baseInstance.win,
          baseInstance.element,
          sentinel,
          additionalContextMetadata);
      contextMetadata['creative'] = creative;
      const name = JSON.stringify(contextMetadata);
      return iframeRenderHelper(
          baseInstance, dict({'src': srcPath, 'name': name}), context);
    });
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
  render(context, baseInstance) {
    return super.render(context, baseInstance)
        .then(context => {
          const iframe = context.getIframe();
          const templateData = context.getTemplateData();
          const templateMacroValues = templateData && templateData.data;
          if (iframe && templateMacroValues) {
            const ampAdTemplates = this.ampAdTemplates_ ||
              new AmpAdTemplates(baseInstance.win);
            ampAdTemplates.render(
                templateMacroValues,
                iframe.contentWindow.document.body)
                .then(renderedElement => {
                  const analytics = templateData && templateData.analytics;
                  if (analytics) {
                    ampAdTemplates.insertAnalytics(renderedElement, analytics);
                  }
                  iframe.contentWindow.document.body./*OK*/innerHTML =
                    renderedElement./*OK*/innerHTML;
                });
          }
          return context;
        });
  }
}

/**
 * Fetches and returns the template from the given ad response, wrapped as a
 * promise, or rejects if the template cannot be fetched.
 */
export class TemplateValidator extends Validator {

  /** @param {function(string):string=} parseOnFetch */
  constructor(parseOnFetch = tmpl => tmpl) {
    super();

    /** @const @private {function(string):string} */
    this.parseOnFetch_ = parseOnFetch;

    /** @private {?AmpAdTemplates} */
    this.ampAdTemplates_ = null;
  }

  /** @override */
  validate(context) {
    const unvalidatedBytes = context.getUnvalidatedBytes();
    dev().assert(unvalidatedBytes, 'no bytes available for validation');
    const body = utf8Decode(/** @type {!ArrayBuffer} */ (unvalidatedBytes));
    const headers = context.getHeaders();
    if (!headers ||
        headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache') {
      context.setCreative(body)
          .setValidatorResult(ValidatorResult.NON_AMP);
      return Promise.resolve(context);
    }

    const templateCreative =
        /** @type {!./amp-ad-type-defs.AmpTemplateCreativeDef} */ (
        tryParseJson(body) || {});
    context.setCreativeMetadata(getAmpAdMetadataMock(body, '', ''));
    context.setTemplateData(templateCreative);
    return this.ampAdTemplates_
        .fetch(templateCreative.templateUrl)
        .then(template => {
          return context
              .setTemplateData(templateCreative)
              .setCreative(this.parseOnFetch_(template))
              .setValidatorResult(ValidatorResult.AMP);
        });
  }
}

export class TestValidator extends Validator {
  /** @override */
  validate(context) {
    return Promise.resolve(context
        .setCreative(utf8Decode(/** @type {!ArrayBuffer} */ (
          context.getUnvalidatedBytes())))
        .setValidatorResult(ValidatorResult.AMP));
  }
}

export class TestRenderer extends TemplateRenderer {
  render(context, unusedBaseInstance) {
    dev().info('TEST', context.getCreativeMetadata().minifiedCreative);
    return super.render(context, unusedBaseInstance);
  }
}

function getAmpAdMetadataMock(creative, unusedTag, unusedType) {
  return {
    minifiedCreative: creative,
    customElementExtensions: [],
    extensions: [],
  };
}


/**
 * Shared functionality for cross-domain iframe-based rendering methods.
 * @param {!./amp-ad-network-base.AmpAdNetworkBase} baseInstance
 * @param {!JsonObject<string, string>} attributes The attributes of the iframe.
 * @param {!./amp-ad-context.AmpAdContext} context
 * @return {!./amp-ad-context.AmpAdContext}
 */
function iframeRenderHelper(baseInstance, attributes, context) {
  const size = context.getSize();
  const crossDomainData = context.getCrossDomainData();
  const sentinel = crossDomainData && crossDomainData.sentinel;
  const mergedAttributes = Object.assign(attributes, dict({
    'height': size.height,
    'width': size.width,
  }));
  if (sentinel) {
    mergedAttributes['data-amp-3p-sentinel'] = sentinel;
  }
  const iframe = createElementWithAttributes(
      /** @type {!Document} */ (baseInstance.element.ownerDocument), 'iframe',
      /** @type {!JsonObject} */ (Object.assign(mergedAttributes,
          SHARED_IFRAME_PROPERTIES)));
  const crossOriginIframeHandler =
      new AMP.AmpAdXOriginIframeHandler(baseInstance);
  // Iframe is appended to element as part of xorigin frame handler init.
  // Executive onCreativeRender after init to ensure it can get reference
  // to frame but prior to load to allow for earlier access.
  const frameLoadPromise =
      crossOriginIframeHandler.init(iframe, /* opt_isA4A */ true);
  return context.setFrameLoadPromise(frameLoadPromise)
      .setIframe(iframe)
      .setCrossOriginIframeHandler(crossOriginIframeHandler);
}

