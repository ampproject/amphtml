function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { appendEncodedParamStringToUrl, serializeQueryString } from "../../../src/url";
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
export var TransportSerializerDef = /*#__PURE__*/function () {
  function TransportSerializerDef() {
    _classCallCheck(this, TransportSerializerDef);
  }

  _createClass(TransportSerializerDef, [{
    key: "generateRequest",
    value:
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
     */

  }, {
    key: "generateBatchRequest",
    value: function generateBatchRequest(unusedBaseUrl, unusedSegments, unusedWithPayload) {}
  }]);

  return TransportSerializerDef;
}();

/**
 * The default serializer.
 *
 * @implements {TransportSerializerDef}
 */
var DefaultTransportSerializer = /*#__PURE__*/function () {
  function DefaultTransportSerializer() {
    _classCallCheck(this, DefaultTransportSerializer);
  }

  _createClass(DefaultTransportSerializer, [{
    key: "generateRequest",
    value:
    /** @override */
    function generateRequest(baseUrl, segment, withPayload) {
      if (withPayload === void 0) {
        withPayload = false;
      }

      if (withPayload) {
        return {
          url: baseUrl.replace(EXTRA_URL_PARAM_VAR, ''),
          payload: JSON.stringify(segment['extraUrlParams'])
        };
      }

      return {
        url: defaultSerializer(baseUrl, [segment])
      };
    }
    /** @override */

  }, {
    key: "generateBatchRequest",
    value: function generateBatchRequest(baseUrl, segments, withPayload) {
      if (withPayload === void 0) {
        withPayload = false;
      }

      if (withPayload) {
        return {
          url: baseUrl.replace(EXTRA_URL_PARAM_VAR, ''),
          payload: JSON.stringify(segments.map(function (segment) {
            return segment['extraUrlParams'];
          }))
        };
      }

      return {
        url: defaultSerializer(baseUrl, segments)
      };
    }
  }]);

  return DefaultTransportSerializer;
}();

/**
 * Please register your serializer below.
 * Please keep the object in alphabetic order.
 *
 * @const {Object<string, TransportSerializerDef>}
 */
export var TransportSerializers = {
  'default': new DefaultTransportSerializer()
};

/**
 * The default way for merging batch segments
 *
 * @param {string} baseUrl
 * @param {!Array<!BatchSegmentDef>} batchSegments
 * @return {string}
 */
export function defaultSerializer(baseUrl, batchSegments) {
  var extraUrlParamsStr = batchSegments.map(function (item) {
    return serializeQueryString(item['extraUrlParams']);
  }).filter(Boolean).join('&');
  var requestUrl;

  if (baseUrl.indexOf(EXTRA_URL_PARAM_VAR) >= 0) {
    requestUrl = baseUrl.replace(EXTRA_URL_PARAM_VAR, extraUrlParamsStr);
  } else {
    requestUrl = appendEncodedParamStringToUrl(baseUrl, extraUrlParamsStr);
  }

  return requestUrl;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcG9ydC1zZXJpYWxpemVyLmpzIl0sIm5hbWVzIjpbImFwcGVuZEVuY29kZWRQYXJhbVN0cmluZ1RvVXJsIiwic2VyaWFsaXplUXVlcnlTdHJpbmciLCJFWFRSQV9VUkxfUEFSQU1fVkFSIiwiQmF0Y2hTZWdtZW50RGVmIiwiUmVxdWVzdERlZiIsIlRyYW5zcG9ydFNlcmlhbGl6ZXJEZWYiLCJ1bnVzZWRCYXNlVXJsIiwidW51c2VkU2VnbWVudCIsInVudXNlZFdpdGhQYXlsb2FkIiwidW51c2VkU2VnbWVudHMiLCJEZWZhdWx0VHJhbnNwb3J0U2VyaWFsaXplciIsImJhc2VVcmwiLCJzZWdtZW50Iiwid2l0aFBheWxvYWQiLCJ1cmwiLCJyZXBsYWNlIiwicGF5bG9hZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJkZWZhdWx0U2VyaWFsaXplciIsInNlZ21lbnRzIiwibWFwIiwiVHJhbnNwb3J0U2VyaWFsaXplcnMiLCJiYXRjaFNlZ21lbnRzIiwiZXh0cmFVcmxQYXJhbXNTdHIiLCJpdGVtIiwiZmlsdGVyIiwiQm9vbGVhbiIsImpvaW4iLCJyZXF1ZXN0VXJsIiwiaW5kZXhPZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsNkJBREYsRUFFRUMsb0JBRkY7QUFLQSxJQUFNQyxtQkFBbUIsR0FBRyxtQkFBNUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLGVBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxVQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsc0JBQWI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0UsNkJBQWdCQyxhQUFoQixFQUErQkMsYUFBL0IsRUFBOENDLGlCQUE5QyxFQUFpRSxDQUFFO0FBRW5FO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFkQTtBQUFBO0FBQUEsV0FlRSw4QkFBcUJGLGFBQXJCLEVBQW9DRyxjQUFwQyxFQUFvREQsaUJBQXBELEVBQXVFLENBQUU7QUFmM0U7O0FBQUE7QUFBQTs7QUFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNNRSwwQjs7Ozs7Ozs7QUFDSjtBQUNBLDZCQUFnQkMsT0FBaEIsRUFBeUJDLE9BQXpCLEVBQWtDQyxXQUFsQyxFQUF1RDtBQUFBLFVBQXJCQSxXQUFxQjtBQUFyQkEsUUFBQUEsV0FBcUIsR0FBUCxLQUFPO0FBQUE7O0FBQ3JELFVBQUlBLFdBQUosRUFBaUI7QUFDZixlQUFPO0FBQ0xDLFVBQUFBLEdBQUcsRUFBRUgsT0FBTyxDQUFDSSxPQUFSLENBQWdCYixtQkFBaEIsRUFBcUMsRUFBckMsQ0FEQTtBQUVMYyxVQUFBQSxPQUFPLEVBQUVDLElBQUksQ0FBQ0MsU0FBTCxDQUFlTixPQUFPLENBQUMsZ0JBQUQsQ0FBdEI7QUFGSixTQUFQO0FBSUQ7O0FBQ0QsYUFBTztBQUNMRSxRQUFBQSxHQUFHLEVBQUVLLGlCQUFpQixDQUFDUixPQUFELEVBQVUsQ0FBQ0MsT0FBRCxDQUFWO0FBRGpCLE9BQVA7QUFHRDtBQUVEOzs7O1dBQ0EsOEJBQXFCRCxPQUFyQixFQUE4QlMsUUFBOUIsRUFBd0NQLFdBQXhDLEVBQTZEO0FBQUEsVUFBckJBLFdBQXFCO0FBQXJCQSxRQUFBQSxXQUFxQixHQUFQLEtBQU87QUFBQTs7QUFDM0QsVUFBSUEsV0FBSixFQUFpQjtBQUNmLGVBQU87QUFDTEMsVUFBQUEsR0FBRyxFQUFFSCxPQUFPLENBQUNJLE9BQVIsQ0FBZ0JiLG1CQUFoQixFQUFxQyxFQUFyQyxDQURBO0FBRUxjLFVBQUFBLE9BQU8sRUFBRUMsSUFBSSxDQUFDQyxTQUFMLENBQ1BFLFFBQVEsQ0FBQ0MsR0FBVCxDQUFhLFVBQUNULE9BQUQ7QUFBQSxtQkFBYUEsT0FBTyxDQUFDLGdCQUFELENBQXBCO0FBQUEsV0FBYixDQURPO0FBRkosU0FBUDtBQU1EOztBQUNELGFBQU87QUFDTEUsUUFBQUEsR0FBRyxFQUFFSyxpQkFBaUIsQ0FBQ1IsT0FBRCxFQUFVUyxRQUFWO0FBRGpCLE9BQVA7QUFHRDs7Ozs7O0FBR0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNRSxvQkFBb0IsR0FBRztBQUNsQyxhQUFXLElBQUlaLDBCQUFKO0FBRHVCLENBQTdCOztBQUlQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTUyxpQkFBVCxDQUEyQlIsT0FBM0IsRUFBb0NZLGFBQXBDLEVBQW1EO0FBQ3hELE1BQU1DLGlCQUFpQixHQUFHRCxhQUFhLENBQ3BDRixHQUR1QixDQUNuQixVQUFDSSxJQUFEO0FBQUEsV0FBVXhCLG9CQUFvQixDQUFDd0IsSUFBSSxDQUFDLGdCQUFELENBQUwsQ0FBOUI7QUFBQSxHQURtQixFQUV2QkMsTUFGdUIsQ0FFaEJDLE9BRmdCLEVBR3ZCQyxJQUh1QixDQUdsQixHQUhrQixDQUExQjtBQUlBLE1BQUlDLFVBQUo7O0FBQ0EsTUFBSWxCLE9BQU8sQ0FBQ21CLE9BQVIsQ0FBZ0I1QixtQkFBaEIsS0FBd0MsQ0FBNUMsRUFBK0M7QUFDN0MyQixJQUFBQSxVQUFVLEdBQUdsQixPQUFPLENBQUNJLE9BQVIsQ0FBZ0JiLG1CQUFoQixFQUFxQ3NCLGlCQUFyQyxDQUFiO0FBQ0QsR0FGRCxNQUVPO0FBQ0xLLElBQUFBLFVBQVUsR0FBRzdCLDZCQUE2QixDQUFDVyxPQUFELEVBQVVhLGlCQUFWLENBQTFDO0FBQ0Q7O0FBQ0QsU0FBT0ssVUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIGFwcGVuZEVuY29kZWRQYXJhbVN0cmluZ1RvVXJsLFxuICBzZXJpYWxpemVRdWVyeVN0cmluZyxcbn0gZnJvbSAnLi4vLi4vLi4vc3JjL3VybCc7XG5cbmNvbnN0IEVYVFJBX1VSTF9QQVJBTV9WQVIgPSAnJHtleHRyYVVybFBhcmFtc30nO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHRyaWdnZXI6IChzdHJpbmd8dW5kZWZpbmVkKSxcbiAqICAgdGltZXN0YW1wOiAobnVtYmVyfHVuZGVmaW5lZCksXG4gKiAgIGV4dHJhVXJsUGFyYW1zOiAoIUpzb25PYmplY3R8dW5kZWZpbmVkKVxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBCYXRjaFNlZ21lbnREZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgdXJsOiBzdHJpbmcsXG4gKiAgIHBheWxvYWQ6IChzdHJpbmd8dW5kZWZpbmVkKSxcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgUmVxdWVzdERlZjtcblxuLyoqXG4gKiBUaGUgaW50ZXJmYWNlIGZvciBhbGwgVHJhbnNwb3J0U2VyaWFsaXplciB0byBpbXBsZW1lbnQuXG4gKiBAaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBUcmFuc3BvcnRTZXJpYWxpemVyRGVmIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bnVzZWRCYXNlVXJsXG4gICAqIEBwYXJhbSB7IUJhdGNoU2VnbWVudERlZn0gdW51c2VkU2VnbWVudFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVudXNlZFdpdGhQYXlsb2FkXG4gICAqIEByZXR1cm4geyFSZXF1ZXN0RGVmfVxuICAgKi9cbiAgZ2VuZXJhdGVSZXF1ZXN0KHVudXNlZEJhc2VVcmwsIHVudXNlZFNlZ21lbnQsIHVudXNlZFdpdGhQYXlsb2FkKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkQmFzZVVybFxuICAgKiBAcGFyYW0geyFBcnJheTwhQmF0Y2hTZWdtZW50RGVmPn0gdW51c2VkU2VnbWVudHNcbiAgICogQHBhcmFtIHtib29sZWFufSB1bnVzZWRXaXRoUGF5bG9hZFxuICAgKiBAcmV0dXJuIHshUmVxdWVzdERlZn1cbiAgICovXG4gIGdlbmVyYXRlQmF0Y2hSZXF1ZXN0KHVudXNlZEJhc2VVcmwsIHVudXNlZFNlZ21lbnRzLCB1bnVzZWRXaXRoUGF5bG9hZCkge31cbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBzZXJpYWxpemVyLlxuICpcbiAqIEBpbXBsZW1lbnRzIHtUcmFuc3BvcnRTZXJpYWxpemVyRGVmfVxuICovXG5jbGFzcyBEZWZhdWx0VHJhbnNwb3J0U2VyaWFsaXplciB7XG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2VuZXJhdGVSZXF1ZXN0KGJhc2VVcmwsIHNlZ21lbnQsIHdpdGhQYXlsb2FkID0gZmFsc2UpIHtcbiAgICBpZiAod2l0aFBheWxvYWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVybDogYmFzZVVybC5yZXBsYWNlKEVYVFJBX1VSTF9QQVJBTV9WQVIsICcnKSxcbiAgICAgICAgcGF5bG9hZDogSlNPTi5zdHJpbmdpZnkoc2VnbWVudFsnZXh0cmFVcmxQYXJhbXMnXSksXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdXJsOiBkZWZhdWx0U2VyaWFsaXplcihiYXNlVXJsLCBbc2VnbWVudF0pLFxuICAgIH07XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdlbmVyYXRlQmF0Y2hSZXF1ZXN0KGJhc2VVcmwsIHNlZ21lbnRzLCB3aXRoUGF5bG9hZCA9IGZhbHNlKSB7XG4gICAgaWYgKHdpdGhQYXlsb2FkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1cmw6IGJhc2VVcmwucmVwbGFjZShFWFRSQV9VUkxfUEFSQU1fVkFSLCAnJyksXG4gICAgICAgIHBheWxvYWQ6IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgIHNlZ21lbnRzLm1hcCgoc2VnbWVudCkgPT4gc2VnbWVudFsnZXh0cmFVcmxQYXJhbXMnXSlcbiAgICAgICAgKSxcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB1cmw6IGRlZmF1bHRTZXJpYWxpemVyKGJhc2VVcmwsIHNlZ21lbnRzKSxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogUGxlYXNlIHJlZ2lzdGVyIHlvdXIgc2VyaWFsaXplciBiZWxvdy5cbiAqIFBsZWFzZSBrZWVwIHRoZSBvYmplY3QgaW4gYWxwaGFiZXRpYyBvcmRlci5cbiAqXG4gKiBAY29uc3Qge09iamVjdDxzdHJpbmcsIFRyYW5zcG9ydFNlcmlhbGl6ZXJEZWY+fVxuICovXG5leHBvcnQgY29uc3QgVHJhbnNwb3J0U2VyaWFsaXplcnMgPSB7XG4gICdkZWZhdWx0JzogbmV3IERlZmF1bHRUcmFuc3BvcnRTZXJpYWxpemVyKCksXG59O1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHdheSBmb3IgbWVyZ2luZyBiYXRjaCBzZWdtZW50c1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVXJsXG4gKiBAcGFyYW0geyFBcnJheTwhQmF0Y2hTZWdtZW50RGVmPn0gYmF0Y2hTZWdtZW50c1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFNlcmlhbGl6ZXIoYmFzZVVybCwgYmF0Y2hTZWdtZW50cykge1xuICBjb25zdCBleHRyYVVybFBhcmFtc1N0ciA9IGJhdGNoU2VnbWVudHNcbiAgICAubWFwKChpdGVtKSA9PiBzZXJpYWxpemVRdWVyeVN0cmluZyhpdGVtWydleHRyYVVybFBhcmFtcyddKSlcbiAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgLmpvaW4oJyYnKTtcbiAgbGV0IHJlcXVlc3RVcmw7XG4gIGlmIChiYXNlVXJsLmluZGV4T2YoRVhUUkFfVVJMX1BBUkFNX1ZBUikgPj0gMCkge1xuICAgIHJlcXVlc3RVcmwgPSBiYXNlVXJsLnJlcGxhY2UoRVhUUkFfVVJMX1BBUkFNX1ZBUiwgZXh0cmFVcmxQYXJhbXNTdHIpO1xuICB9IGVsc2Uge1xuICAgIHJlcXVlc3RVcmwgPSBhcHBlbmRFbmNvZGVkUGFyYW1TdHJpbmdUb1VybChiYXNlVXJsLCBleHRyYVVybFBhcmFtc1N0cik7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RVcmw7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/transport-serializer.js