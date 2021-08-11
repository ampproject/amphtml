var _excluded = ["cutoff", "datetime", "locale", "placeholder"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from "../../../src/preact";
import { Wrapper } from "../../../src/preact/component";
import { format, getLocale } from "./locales";
import { getDate } from "../../../src/core/types/date";
import { toWin } from "../../../src/core/window";
import { useEffect, useRef, useState } from "../../../src/preact";
import { useResourcesNotify } from "../../../src/preact/utils";

/** @const {string} */
var DEFAULT_LOCALE = 'en_US';

/** @const {!Object<string, *>} */
var DEFAULT_DATETIME_OPTIONS = {
  'year': 'numeric',
  'month': 'short',
  'day': 'numeric',
  'hour': 'numeric',
  'minute': 'numeric' };


/** @const {!Object<string, *>} */
var DEFAULT_TIME_OPTIONS = { 'hour': 'numeric', 'minute': 'numeric' };

/**
 * @param {!TimeagoProps} props
 * @return {PreactDef.Renderable}
 */
export function Timeago(_ref)





{var cutoff = _ref.cutoff,datetime = _ref.datetime,localeProp = _ref.locale,placeholder = _ref.placeholder,rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(placeholder || ''),_useState2 = _slicedToArray(_useState, 2),timestamp = _useState2[0],setTimestamp = _useState2[1];
  var ref = useRef(null);

  var date = getDate(datetime);

  useEffect(function () {
    var node = ref.current;
    var win = node && toWin(node.ownerDocument.defaultView);
    if (!win) {
      return undefined;
    }
    var observer = new win.IntersectionObserver(function (entries) {
      var lang = node.ownerDocument.documentElement.lang;
      if (lang === 'unknown') {var _win$navigator;
        lang = (((_win$navigator = win.navigator) === null || _win$navigator === void 0) ? (void 0) : _win$navigator.language) || DEFAULT_LOCALE;
      }
      var locale = getLocale(localeProp || lang);
      var last = entries[entries.length - 1];
      if (last.isIntersecting) {
        setTimestamp(
        getFuzzyTimestampValue(new Date(date), locale, cutoff, placeholder));

      }
    });
    observer.observe(node);
    return function () {return observer.disconnect();};
  }, [date, localeProp, cutoff, placeholder]);

  useResourcesNotify();

  return (
    Preact.createElement(Wrapper, _objectSpread(_objectSpread({},
    rest), {}, {
      as: "time",
      ref: ref,
      datetime: new Date(date).toISOString() }),

    timestamp));


}

/**
 * @param {!Date} date
 * @param {string} locale
 * @param {number|undefined} cutoff
 * @param {string|!PreactDef.VNode|null|undefined} placeholder
 * @return {string|!PreactDef.VNode}
 */
function getFuzzyTimestampValue(date, locale, cutoff, placeholder) {
  if (!cutoff) {
    return format(date, locale);
  }
  var secondsAgo = Math.floor((Date.now() - date.getTime()) / 1000);

  if (secondsAgo > cutoff) {
    return placeholder ? placeholder : getDefaultPlaceholder(date, locale);
  }
  return format(date, locale);
}

/**
 * @param {Date} date
 * @param {string} locale
 * @return {string}
 */
function getDefaultPlaceholder(date, locale) {
  if (date.toLocaleDateString() == new Date().toLocaleDateString()) {
    // Same date: time is enough.
    return date.toLocaleTimeString(locale, DEFAULT_TIME_OPTIONS);
  }
  return date.toLocaleString(locale, DEFAULT_DATETIME_OPTIONS);
}
// /Users/mszylkowski/src/amphtml/extensions/amp-timeago/1.0/component.js