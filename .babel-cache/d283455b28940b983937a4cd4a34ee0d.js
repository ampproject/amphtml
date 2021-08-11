function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
serializeQueryString } from "../../../src/url";


var EXTRA_URL_PARAM_VAR = '${extraUrlParams}';

/**
 * @typedef {{
 *   trigger: (string|undefined),
 *   timestamp: (number|undefined),
 *   extraUrlParams: (!JsonObject|undefined)
 * }}
 */
export var BatchSegmentDef;

/**
 * @typedef {{
 *   url: string,
 *   payload: (string|undefined),
 * }}
 */
export var RequestDef;

/**
 * The interface for all TransportSerializer to implement.
 * @interface
 */
export var TransportSerializerDef = /*#__PURE__*/function () {function TransportSerializerDef() {_classCallCheck(this, TransportSerializerDef);}_createClass(TransportSerializerDef, [{ key: "generateRequest", value:
    /**
     * @param {string} unusedBaseUrl
     * @param {!BatchSegmentDef} unusedSegment
     * @param {boolean} unusedWithPayload
     * @return {!RequestDef}
     */
    function generateRequest(unusedBaseUrl, unusedSegment, unusedWithPayload) {}

    /**
     * @param {string} unusedBaseUrl
     * @param {!Array<!BatchSegmentDef>} unusedSegments
     * @param {boolean} unusedWithPayload
     * @return {!RequestDef}
     */ }, { key: "generateBatchRequest", value:
    function generateBatchRequest(unusedBaseUrl, unusedSegments, unusedWithPayload) {} }]);return TransportSerializerDef;}();


/**
 * The default serializer.
 *
 * @implements {TransportSerializerDef}
 */var
DefaultTransportSerializer = /*#__PURE__*/function () {function DefaultTransportSerializer() {_classCallCheck(this, DefaultTransportSerializer);}_createClass(DefaultTransportSerializer, [{ key: "generateRequest", value:
    /** @override */
    function generateRequest(baseUrl, segment) {var withPayload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (withPayload) {
        return {
          url: baseUrl.replace(EXTRA_URL_PARAM_VAR, ''),
          payload: JSON.stringify(segment['extraUrlParams']) };

      }
      return {
        url: defaultSerializer(baseUrl, [segment]) };

    }

    /** @override */ }, { key: "generateBatchRequest", value:
    function generateBatchRequest(baseUrl, segments) {var withPayload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (withPayload) {
        return {
          url: baseUrl.replace(EXTRA_URL_PARAM_VAR, ''),
          payload: JSON.stringify(
          segments.map(function (segment) {return segment['extraUrlParams'];})) };


      }
      return {
        url: defaultSerializer(baseUrl, segments) };

    } }]);return DefaultTransportSerializer;}();


/**
 * Please register your serializer below.
 * Please keep the object in alphabetic order.
 *
 * @const {Object<string, TransportSerializerDef>}
 */
export var TransportSerializers = {
  'default': new DefaultTransportSerializer() };


/**
 * The default way for merging batch segments
 *
 * @param {string} baseUrl
 * @param {!Array<!BatchSegmentDef>} batchSegments
 * @return {string}
 */
export function defaultSerializer(baseUrl, batchSegments) {
  var extraUrlParamsStr = batchSegments.
  map(function (item) {return serializeQueryString(item['extraUrlParams']);}).
  filter(Boolean).
  join('&');
  var requestUrl;
  if (baseUrl.indexOf(EXTRA_URL_PARAM_VAR) >= 0) {
    requestUrl = baseUrl.replace(EXTRA_URL_PARAM_VAR, extraUrlParamsStr);
  } else {
    requestUrl = appendEncodedParamStringToUrl(baseUrl, extraUrlParamsStr);
  }
  return requestUrl;
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/transport-serializer.js