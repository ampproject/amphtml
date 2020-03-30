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

import {
  appendEncodedParamStringToUrl,
  serializeQueryString,
} from '../../../src/url';

const EXTRA_URL_PARAM_VAR = '${extraUrlParams}';

/**
 * @typedef {{
 *   trigger: (string|undefined),
 *   timestamp: (number|undefined),
 *   extraUrlParams: (!JsonObject|undefined)
 * }}
 */
export let BatchSegmentDef;

/**
 * @typedef {{
 *   url: string,
 *   payload: (string|undefined),
 * }}
 */
export let RequestDef;

/**
 * The interface for all TransportSerializer to implement.
 * @interface
 */
export class TransportSerializerDef {
  /**
   * @param {string} unusedBaseUrl
   * @param {!BatchSegmentDef} unusedSegment
   * @param {boolean} unusedWithPayload
   * @return {!RequestDef}
   */
  generateRequest(unusedBaseUrl, unusedSegment, unusedWithPayload) {}

  /**
   * @param {string} unusedBaseUrl
   * @param {!Array<!BatchSegmentDef>} unusedSegments
   * @param {boolean} unusedWithPayload
   * @return {!RequestDef}
   */
  generateBatchRequest(unusedBaseUrl, unusedSegments, unusedWithPayload) {}
}

/**
 * The default serializer.
 *
 * @implements {TransportSerializerDef}
 */
class DefaultTransportSerializer {
  /** @override */
  generateRequest(baseUrl, segment, withPayload = false) {
    if (withPayload) {
      return {
        url: baseUrl.replace(EXTRA_URL_PARAM_VAR, ''),
        payload: JSON.stringify(segment['extraUrlParams']),
      };
    }
    return {
      url: defaultSerializer(baseUrl, [segment]),
    };
  }

  /** @override */
  generateBatchRequest(baseUrl, segments, withPayload = false) {
    if (withPayload) {
      return {
        url: baseUrl.replace(EXTRA_URL_PARAM_VAR, ''),
        payload: JSON.stringify(
          segments.map(segment => segment['extraUrlParams'])
        ),
      };
    }
    return {
      url: defaultSerializer(baseUrl, segments),
    };
  }
}

/**
 * Please register your serializer below.
 * Please keep the object in alphabetic order.
 *
 * @const {Object<string, TransportSerializerDef>}
 */
export const TransportSerializers = {
  'default': new DefaultTransportSerializer(),
};

/**
 * The default way for merging batch segments
 *
 * @param {string} baseUrl
 * @param {!Array<!BatchSegmentDef>} batchSegments
 * @return {string}
 */
export function defaultSerializer(baseUrl, batchSegments) {
  const extraUrlParamsStr = batchSegments
    .map(item => serializeQueryString(item['extraUrlParams']))
    .filter(queryString => !!queryString)
    .join('&');
  let requestUrl;
  if (baseUrl.indexOf(EXTRA_URL_PARAM_VAR) >= 0) {
    requestUrl = baseUrl.replace(EXTRA_URL_PARAM_VAR, extraUrlParamsStr);
  } else {
    requestUrl = appendEncodedParamStringToUrl(baseUrl, extraUrlParamsStr);
  }
  return requestUrl;
}
