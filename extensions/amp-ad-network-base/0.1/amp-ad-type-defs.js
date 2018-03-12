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

/** @typedef {{width: string, height: string}} */
export let LayoutInfoDef;

/** @typedef {string} */
export let FailureType;

/** @enum {FailureType} */
export const FailureTypes = {
  SENDXHR: 'SENDXHR',
  NO_RESPONSE: 'NO_RESPONSE',
  EMPTY_RESPONSE: 'EMPTY_RESPONSE',
  VALIDATOR_ERROR: 'VALIDATOR_ERROR',
  RENDERER_ERROR: 'RENDERER_ERROR',
};

/** @typedef {string} */
export let RecoveryModeType;

/** @typedef {{
      type: !RecoveryModeType,
      retryTimer: (number|undefined),
      fallback: (string|undefined),
    }} */
export let RecoveryMode;

/** @enum {RecoveryModeType} */
export const RecoveryModeTypes = {
  COLLAPSE: 'COLLAPSE',
  RETRY: 'RETRY',
  VALIDATOR_FALLBACK: 'VALIDATOR_FALLBACK',
  FORCE_RENDERER: 'FORCE_RENDERER',
  RENDERER_FALLBACK: 'RENDERER_FALLBACK',
};

/** @type {Object<FailureType, !Array<!RecoveryMode>>} */
export const ValidRecoveryModeTypes = {
  SENDXHR: [RecoveryModeTypes.RETRY, RecoveryModeTypes.COLLAPSE],
  NO_RESPONSE: [RecoveryModeTypes.RETRY, RecoveryModeTypes.COLLAPSE],
  EMPTY_RESPONSE: [RecoveryModeTypes.RETRY, RecoveryModeTypes.COLLAPSE],
  VALIDATOR_ERROR: [RecoveryModeTypes.VALIDATOR_FALLBACK,
    RecoveryModeTypes.FORCE_RENDERER,
    RecoveryModeTypes.COLLAPSE],
  RENDERER_FALLBACK: [RecoveryModeTypes.RENDERER_FALLBACK,
    RecoveryModeTypes.COLLAPSE],
};

/** @typedef {string} */
export let ValidatorResultType;

/** @enu, {ValidatorResultType} */
export const ValidatorResult = {
  AMP: 'amp',
  NON_AMP: 'non_amp',
};


