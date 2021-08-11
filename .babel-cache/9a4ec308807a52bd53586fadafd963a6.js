function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import { useLayoutEffect, useState } from "./..";

/**
 * Runs the renderer. It's critical that the `data` argument is stable - it
 * only changes when the actual data changes. The renderer itself is resolved
 * in a layout effect and allows the result to be a promise.
 *
 * @param {?RendererFunctionType|undefined} renderer
 * @param {!JsonObject} data
 * @return {?RendererFunctionResponseType}
 */
export function useRenderer(renderer, data) {
  var _useState = useState(
  /** @type {?RendererFunctionResponseType} */(null)),_useState2 = _slicedToArray(_useState, 2),value = _useState2[0],setValue = _useState2[1];


  useLayoutEffect(function () {
    var rendered = (renderer && renderer(data)) || null;
    if (rendered && typeof rendered['then'] == 'function') {
      var canceled = false;
      rendered.then(function (result) {
        if (!canceled) {
          setValue(result);
        }
      });
      return function () {
        canceled = true;
      };
    } else {
      setValue( /** @type {?RendererFunctionResponseType} */(rendered));
    }
  }, [renderer, data]);

  return value;
}
// /Users/mszylkowski/src/amphtml/src/preact/component/renderer.js