var _excluded = ["datetime", "displayIn", "locale", "localeOptions", "render"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { Wrapper, useRenderer } from "../../../src/preact/component";
import { getDate } from "../../../src/core/types/date";
import { useMemo } from "../../../src/preact";
import { useResourcesNotify } from "../../../src/preact/utils";
import { user } from "../../../src/log";

/** @const {string} */
var TAG = 'amp-date-display';

/** @const {string} */
var DEFAULT_DISPLAY_IN = 'local';

/** @const {string} */
var DEFAULT_LOCALE = 'en';

/** @const {!Object<string, *>} */
var DEFAULT_DATETIME_OPTIONS = {
  'year': 'numeric',
  'month': 'short',
  'day': 'numeric',
  'hour': 'numeric',
  'minute': 'numeric' };


/**
 * @param {!JsonObject} data
 * @return {string}
 */
var DEFAULT_RENDER = function DEFAULT_RENDER(data) {return (/** @type {string} */(data['localeString']));};

/** @typedef {{
  year: number,
  month: number,
  monthName: string,
  monthNameShort: string,
  day: number,
  dayName: string,
  dayNameShort: string,
  hour: number,
  minute: number,
  second: number,
  iso: string,
  localeString: string,
}} */
var VariablesV2Def;

/** @typedef {{
  year: number,
  month: number,
  monthName: string,
  monthNameShort: string,
  day: number,
  dayName: string,
  dayNameShort: string,
  hour: number,
  minute: number,
  second: number,
  iso: string,
  yearTwoDigit: string,
  monthTwoDigit: string,
  dayTwoDigit: string,
  hourTwoDigit: string,
  hour12: string,
  hour12TwoDigit: string,
  minuteTwoDigit: string,
  secondTwoDigit: string,
  dayPeriod: string,
 }} */
var EnhancedVariablesV2Def;

/**
 * @param {!DateDisplayDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function DateDisplay(_ref)






{var datetime = _ref.datetime,_ref$displayIn = _ref.displayIn,displayIn = _ref$displayIn === void 0 ? DEFAULT_DISPLAY_IN : _ref$displayIn,_ref$locale = _ref.locale,locale = _ref$locale === void 0 ? DEFAULT_LOCALE : _ref$locale,localeOptions = _ref.localeOptions,_ref$render = _ref.render,render = _ref$render === void 0 ? DEFAULT_RENDER : _ref$render,rest = _objectWithoutProperties(_ref, _excluded);
  var date = getDate(datetime);
  var data = useMemo(
  function () {return getDataForTemplate(new Date(date), displayIn, locale, localeOptions);},
  [date, displayIn, locale, localeOptions]);


  var rendered = useRenderer(render, data);
  var isHtml =
  rendered && _typeof(rendered) == 'object' && '__html' in rendered;

  useResourcesNotify();

  return (
    Preact.createElement(Wrapper, _objectSpread(_objectSpread({},
    rest), {}, {
      as: "div",
      datetime: data['iso'],
      dangerouslySetInnerHTML: isHtml ? rendered : null }),

    isHtml ? null : rendered));


}

/**
 * @param {!Date} date
 * @param {string} displayIn
 * @param {string} locale
 * @param {Object<string, *>} localeOptions
 * @return {!EnhancedVariablesV2Def}
 */
function getDataForTemplate(date, displayIn, locale, localeOptions) {
  var basicData =
  displayIn.toLowerCase() === 'utc' ?
  getVariablesInUTC(date, locale, localeOptions) :
  getVariablesInLocal(date, locale, localeOptions);

  return enhanceBasicVariables(basicData);
}

/**
 * @param {number} input
 * @return {string}
 */
function padStart(input) {
  if (input > 9) {
    return input.toString();
  }

  return '0' + input;
}

/**
 * @param {!VariablesV2Def} data
 * @return {!EnhancedVariablesV2Def}
 */
function enhanceBasicVariables(data) {
  var hour12 = data.hour % 12 || 12;

  // Override type since Object.assign is not understood
  return (/** @type {!EnhancedVariablesV2Def} */_objectSpread(_objectSpread({},
    data), {}, {
      'yearTwoDigit': padStart(data.year % 100),
      'monthTwoDigit': padStart(data.month),
      'dayTwoDigit': padStart(data.day),
      'hourTwoDigit': padStart(data.hour),
      'hour12': hour12,
      'hour12TwoDigit': padStart(hour12),
      'minuteTwoDigit': padStart(data.minute),
      'secondTwoDigit': padStart(data.second),
      'dayPeriod': data.hour < 12 ? 'am' : 'pm' }));

}

/**
 * @param {!Date} date
 * @param {string} locale
 * @param {?Object<string, *>} localeOptions
 * @return {string}
 * @private
 */
function getLocaleString_(date, locale, localeOptions) {
  try {
    return date.toLocaleString(locale, localeOptions);
  } catch (e) {
    user().error(TAG, 'localeOptions', e);
  }
}

/**
 * @param {!Date} date
 * @param {string} locale
 * @param {?Object<string, *>} localeOptions
 * @return {!VariablesV2Def}
 */
function getVariablesInLocal(
date,
locale)

{var localeOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_DATETIME_OPTIONS;
  return {
    'year': date.getFullYear(),
    'month': date.getMonth() + 1,
    'monthName': date.toLocaleDateString(locale, { month: 'long' }),
    'monthNameShort': date.toLocaleDateString(locale, {
      month: 'short' }),

    'day': date.getDate(),
    'dayName': date.toLocaleDateString(locale, { weekday: 'long' }),
    'dayNameShort': date.toLocaleDateString(locale, {
      weekday: 'short' }),

    'hour': date.getHours(),
    'minute': date.getMinutes(),
    'second': date.getSeconds(),
    'iso': date.toISOString(),
    'localeString': getLocaleString_(date, locale, localeOptions) };

}

/**
 * @param {!Date} date
 * @param {string} locale
 * @param {?Object<string, *>} localeOptions
 * @return {!VariablesV2Def}
 */
function getVariablesInUTC(
date,
locale)

{var localeOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_DATETIME_OPTIONS;
  var localeOptionsInUTC = _objectSpread(_objectSpread({},
  localeOptions), {}, {
    timeZone: 'UTC' });

  return {
    'year': date.getUTCFullYear(),
    'month': date.getUTCMonth() + 1,
    'monthName': date.toLocaleDateString(locale, {
      month: 'long',
      timeZone: 'UTC' }),

    'monthNameShort': date.toLocaleDateString(locale, {
      month: 'short',
      timeZone: 'UTC' }),

    'day': date.getUTCDate(),
    'dayName': date.toLocaleDateString(locale, {
      weekday: 'long',
      timeZone: 'UTC' }),

    'dayNameShort': date.toLocaleDateString(locale, {
      weekday: 'short',
      timeZone: 'UTC' }),

    'hour': date.getUTCHours(),
    'minute': date.getUTCMinutes(),
    'second': date.getUTCSeconds(),
    'iso': date.toISOString(),
    'localeString': getLocaleString_(date, locale, localeOptionsInUTC) };

}
// /Users/mszylkowski/src/amphtml/extensions/amp-date-display/1.0/component.js