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

/** @typedef {{
      creativeMetadata: !./amp-ad-utils.CreativeMetaDataDef,
      templateData: ?AmpTemplateCreativeDef,
      crossDomainData: ?CrossDomainDataDef,
      size: !./amp-ad-utils.LayoutInfoDef,
      adUrl: string,
    }} */
export let RendererInputDef;

/** @typedef {{
      iframe: ?Element,
      friendlyIframeEmbed: ?Promise<!../../../src/friendly-iframe-embed.FriendlyIframeEmbed>,
      crossOriginIframeHandler: ?AMP.AmpAdXOriginIframeHandler,
      frameLoadPromise: ?Promise,
    }} */
export let RendererOutputDef;

/** @typedef {
      function(
        !RendererInputDef,
        !./amp-ad-network-base.AmpAdNetworkBase,
        function():boolean=): !Promise<!RendererOutputDef>
    } */
export let RendererDef;

/** @typedef {
      function(
        !ArrayBuffer,
        !Headers,
        !./amp-ad-network-base.AmpAdNetworkBase,
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

