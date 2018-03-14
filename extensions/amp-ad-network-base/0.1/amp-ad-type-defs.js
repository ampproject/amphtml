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

/** @typedef {{width: string, height: string}} */
export let LayoutInfoDef;

/** @enum {string} */
export const FailureType = {
  REQUEST_ERROR: 'REQUEST_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  EMPTY_RESPONSE: 'EMPTY_RESPONSE',
  VALIDATOR_ERROR: 'VALIDATOR_ERROR',
  RENDERER_ERROR: 'RENDERER_ERROR',
};

/** @enum {string} */
export const RecoveryModeType = {
  COLLAPSE: 'COLLAPSE',
  RETRY: 'RETRY',
};

/** @enum {string} */
export const ValidatorResult = {
  AMP: 'AMP',
  NON_AMP: 'NON_AMP',
};

/** @typedef {{
      type: !ValidatorResult,
      creativeData: !Object,
    }} */
export let ValidatorOutput;

/**
 * @abstract
 */
export class Validator {
  /**
   * @param {!Object} unusedContext
   * @param {!ArrayBuffer} unusedUnvalidatedBytes
   * @param {!../../../src/service/xhr-impl.FetchResponseHeaders} unusedHeaders
   * @return {!Promise<!ValidatorResult>}
   * @abstract
   */
  validate(unusedContext, unusedUnvalidatedBytes, unusedHeaders) {}
}

/**
 * @abstract
 */
export class Renderer {
  /**
   * @param {!Object} unusedContext
   * @param {!Element} containerElement
   * @param {!Object} creativeData
   * @return {!Promise}
   * @abstract
   */
  render(unusedContext) {}
}
