function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import { arrayOrSingleItemToArray } from "../types/array";

/**
 * Utility method that propagates attributes from a source element
 * to an updateable element.
 * If `opt_removeMissingAttrs` is true, then also removes any specified
 * attributes that are missing on the source element from the updateable element.
 * @param {string|!Array<string>} attributes
 * @param {!Element} sourceElement
 * @param {!Element} updateElement
 * @param {boolean=} opt_removeMissingAttrs
 */
export function propagateAttributes(attributes, sourceElement, updateElement, opt_removeMissingAttrs) {
  var attrs = arrayOrSingleItemToArray(attributes);

  for (var _iterator = _createForOfIteratorHelperLoose(attrs), _step; !(_step = _iterator()).done;) {
    var attr = _step.value;
    var val = sourceElement.getAttribute(attr);

    if (null !== val) {
      updateElement.setAttribute(attr, val);
    } else if (opt_removeMissingAttrs) {
      updateElement.removeAttribute(attr);
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb3BhZ2F0ZS1hdHRyaWJ1dGVzLmpzIl0sIm5hbWVzIjpbImFycmF5T3JTaW5nbGVJdGVtVG9BcnJheSIsInByb3BhZ2F0ZUF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVzIiwic291cmNlRWxlbWVudCIsInVwZGF0ZUVsZW1lbnQiLCJvcHRfcmVtb3ZlTWlzc2luZ0F0dHJzIiwiYXR0cnMiLCJhdHRyIiwidmFsIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSx3QkFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsbUJBQVQsQ0FDTEMsVUFESyxFQUVMQyxhQUZLLEVBR0xDLGFBSEssRUFJTEMsc0JBSkssRUFLTDtBQUNBLE1BQU1DLEtBQUssR0FBR04sd0JBQXdCLENBQUNFLFVBQUQsQ0FBdEM7O0FBQ0EsdURBQW1CSSxLQUFuQix3Q0FBMEI7QUFBQSxRQUFmQyxJQUFlO0FBQ3hCLFFBQU1DLEdBQUcsR0FBR0wsYUFBYSxDQUFDTSxZQUFkLENBQTJCRixJQUEzQixDQUFaOztBQUNBLFFBQUksU0FBU0MsR0FBYixFQUFrQjtBQUNoQkosTUFBQUEsYUFBYSxDQUFDTSxZQUFkLENBQTJCSCxJQUEzQixFQUFpQ0MsR0FBakM7QUFDRCxLQUZELE1BRU8sSUFBSUgsc0JBQUosRUFBNEI7QUFDakNELE1BQUFBLGFBQWEsQ0FBQ08sZUFBZCxDQUE4QkosSUFBOUI7QUFDRDtBQUNGO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHthcnJheU9yU2luZ2xlSXRlbVRvQXJyYXl9IGZyb20gJyNjb3JlL3R5cGVzL2FycmF5JztcblxuLyoqXG4gKiBVdGlsaXR5IG1ldGhvZCB0aGF0IHByb3BhZ2F0ZXMgYXR0cmlidXRlcyBmcm9tIGEgc291cmNlIGVsZW1lbnRcbiAqIHRvIGFuIHVwZGF0ZWFibGUgZWxlbWVudC5cbiAqIElmIGBvcHRfcmVtb3ZlTWlzc2luZ0F0dHJzYCBpcyB0cnVlLCB0aGVuIGFsc28gcmVtb3ZlcyBhbnkgc3BlY2lmaWVkXG4gKiBhdHRyaWJ1dGVzIHRoYXQgYXJlIG1pc3Npbmcgb24gdGhlIHNvdXJjZSBlbGVtZW50IGZyb20gdGhlIHVwZGF0ZWFibGUgZWxlbWVudC5cbiAqIEBwYXJhbSB7c3RyaW5nfCFBcnJheTxzdHJpbmc+fSBhdHRyaWJ1dGVzXG4gKiBAcGFyYW0geyFFbGVtZW50fSBzb3VyY2VFbGVtZW50XG4gKiBAcGFyYW0geyFFbGVtZW50fSB1cGRhdGVFbGVtZW50XG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfcmVtb3ZlTWlzc2luZ0F0dHJzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9wYWdhdGVBdHRyaWJ1dGVzKFxuICBhdHRyaWJ1dGVzLFxuICBzb3VyY2VFbGVtZW50LFxuICB1cGRhdGVFbGVtZW50LFxuICBvcHRfcmVtb3ZlTWlzc2luZ0F0dHJzXG4pIHtcbiAgY29uc3QgYXR0cnMgPSBhcnJheU9yU2luZ2xlSXRlbVRvQXJyYXkoYXR0cmlidXRlcyk7XG4gIGZvciAoY29uc3QgYXR0ciBvZiBhdHRycykge1xuICAgIGNvbnN0IHZhbCA9IHNvdXJjZUVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuICAgIGlmIChudWxsICE9PSB2YWwpIHtcbiAgICAgIHVwZGF0ZUVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIsIHZhbCk7XG4gICAgfSBlbHNlIGlmIChvcHRfcmVtb3ZlTWlzc2luZ0F0dHJzKSB7XG4gICAgICB1cGRhdGVFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/dom/propagate-attributes.js