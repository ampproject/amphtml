var _excluded = ["datetime", "whenEnded", "locale", "biggestUnit", "countUp", "render"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

import * as Preact from "../../../src/preact";
import { Wrapper, useRenderer } from "../../../src/preact/component";
import { dict } from "../../../src/core/types/object";
import { getDate } from "../../../src/core/types/date";
import { getLocaleStrings } from "./messages";
import { useAmpContext } from "../../../src/preact/context";
import { useEffect, useMemo, useRef, useState } from "../../../src/preact";
import { useResourcesNotify } from "../../../src/preact/utils";

var NAME = 'DateCountdown';

// Constants
/** @const {number} */
var MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

/** @const {number} */
var MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

/** @const {number} */
var MILLISECONDS_IN_MINUTE = 60 * 1000;

/** @const {number} */
var MILLISECONDS_IN_SECOND = 1000;

/** @const {number} */
var DELAY = 1000;

/** @const {Object<string, number>} */
var TimeUnit = {
  DAYS: 1,
  HOURS: 2,
  MINUTES: 3,
  SECONDS: 4 };


// Default prop values
var DEFAULT_LOCALE = 'en';
var DEFAULT_WHEN_ENDED = 'stop';
var DEFAULT_BIGGEST_UNIT = 'DAYS';
var DEFAULT_COUNT_UP = false;

/**
 * @param {!JsonObject} data
 * @return {string}
 */
var DEFAULT_RENDER = function DEFAULT_RENDER(data) {return (
    /** @type {string} */(
    "".concat(data['days'], " ").concat(data['dd'], ", ") + "".concat(
    data['hours'], " ").concat(data['hh'], ", ") + "".concat(
    data['minutes'], " ").concat(data['mm'], ", ") + "".concat(
    data['seconds'], " ").concat(data['ss'])));};


/**
 * @param {!DateCountdownPropsDef} props
 * @return {PreactDef.Renderable}
 */
export function DateCountdown(_ref)







{var datetime = _ref.datetime,_ref$whenEnded = _ref.whenEnded,whenEnded = _ref$whenEnded === void 0 ? DEFAULT_WHEN_ENDED : _ref$whenEnded,_ref$locale = _ref.locale,locale = _ref$locale === void 0 ? DEFAULT_LOCALE : _ref$locale,_ref$biggestUnit = _ref.biggestUnit,biggestUnit = _ref$biggestUnit === void 0 ? DEFAULT_BIGGEST_UNIT : _ref$biggestUnit,_ref$countUp = _ref.countUp,countUp = _ref$countUp === void 0 ? DEFAULT_COUNT_UP : _ref$countUp,_ref$render = _ref.render,render = _ref$render === void 0 ? DEFAULT_RENDER : _ref$render,rest = _objectWithoutProperties(_ref, _excluded);
  useResourcesNotify();
  var _useAmpContext = useAmpContext(),playable = _useAmpContext.playable;

  // Compute these values once
  var epoch = useMemo(function () {return getDate(datetime);}, [datetime]);
  var localeStrings = useMemo(
  function () {return getLocaleWord( /** @type {string} */(locale));},
  [locale]);


  // timeleft is updated on each interval callback
  var _useState = useState(epoch - Date.now() + DELAY),_useState2 = _slicedToArray(_useState, 2),timeleft = _useState2[0],setTimeleft = _useState2[1];

  // Only update data when timeleft (or other dependencies) are updated
  // Does not update on 2nd render triggered by useRenderer
  var data = useMemo(
  function () {return getDataForTemplate(timeleft, biggestUnit, localeStrings, countUp);},
  [timeleft, biggestUnit, localeStrings, countUp]);


  // Reference to DOM element to get access to correct window
  var rootRef = useRef(null);

  useEffect(function () {
    if (!playable || !rootRef.current) {
      return;
    }
    var win = rootRef.current.ownerDocument.defaultView;
    var interval = win.setInterval(function () {
      var newTimeleft = epoch - Date.now() + DELAY;
      setTimeleft(newTimeleft);
      if (whenEnded === DEFAULT_WHEN_ENDED && newTimeleft < 1000) {
        win.clearInterval(interval);
      }
    }, DELAY);
    return function () {return win.clearInterval(interval);};
  }, [playable, epoch, whenEnded]);

  var rendered = useRenderer(render, data);
  var isHtml =
  rendered && _typeof(rendered) == 'object' && '__html' in rendered;

  return (
    Preact.createElement(Wrapper, _objectSpread(_objectSpread({},
    rest), {}, {
      ref: rootRef,
      dangerouslySetInnerHTML: isHtml ? rendered : null }),

    isHtml ? null : rendered));


}

/**
 * @param {number} timeleft
 * @param {string|undefined} biggestUnit
 * @param {!JsonObject} localeStrings
 * @param {boolean} countUp
 * @return {!JsonObject}
 */
function getDataForTemplate(timeleft, biggestUnit, localeStrings, countUp) {
  return (/** @type {!JsonObject} */_objectSpread(_objectSpread({},
    getYDHMSFromMs(timeleft, /** @type {string} */(biggestUnit), countUp)),
    localeStrings));

}

/**
 * Return an object with a label for 'years', 'months', etc. based on the
 * user provided locale string.
 * @param {string} locale
 * @return {!JsonObject}
 */
function getLocaleWord(locale) {
  if (getLocaleStrings(locale) === undefined) {
    displayWarning("Invalid locale ".concat(
    locale, ", defaulting to ").concat(DEFAULT_LOCALE, ". ").concat(NAME));

    locale = DEFAULT_LOCALE;
  }
  var localeWordList = getLocaleStrings(locale);
  return dict({
    'years': localeWordList[0],
    'months': localeWordList[1],
    'days': localeWordList[2],
    'hours': localeWordList[3],
    'minutes': localeWordList[4],
    'seconds': localeWordList[5] });

}

/**
 * Converts a time represented in milliseconds (ms) into a representation with
 * days, hours, minutes, etc. and returns formatted strings in an object.
 * @param {number} ms
 * @param {string} biggestUnit
 * @param {boolean} countUp
 * @return {JsonObject}
 */
function getYDHMSFromMs(ms, biggestUnit, countUp) {
  // If 'count-up' prop is true, we return the negative of what
  // we would originally return since we are counting time-elapsed from a
  // set time instead of time until that time
  if (countUp) {
    ms *= -1;
  }

  //Math.trunc is used instead of Math.floor to support negative past date
  var d =
  TimeUnit[biggestUnit] == TimeUnit.DAYS ?
  supportBackDate(Math.floor(ms / MILLISECONDS_IN_DAY)) :
  0;
  var h =
  TimeUnit[biggestUnit] == TimeUnit.HOURS ?
  supportBackDate(Math.floor(ms / MILLISECONDS_IN_HOUR)) :
  TimeUnit[biggestUnit] < TimeUnit.HOURS ?
  supportBackDate(
  Math.floor((ms % MILLISECONDS_IN_DAY) / MILLISECONDS_IN_HOUR)) :

  0;
  var m =
  TimeUnit[biggestUnit] == TimeUnit.MINUTES ?
  supportBackDate(Math.floor(ms / MILLISECONDS_IN_MINUTE)) :
  TimeUnit[biggestUnit] < TimeUnit.MINUTES ?
  supportBackDate(
  Math.floor((ms % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE)) :

  0;
  var s =
  TimeUnit[biggestUnit] == TimeUnit.SECONDS ?
  supportBackDate(Math.floor(ms / MILLISECONDS_IN_SECOND)) :
  supportBackDate(
  Math.floor((ms % MILLISECONDS_IN_MINUTE) / MILLISECONDS_IN_SECOND));


  return dict({
    'd': d,
    'dd': padStart(d),
    'h': h,
    'hh': padStart(h),
    'm': m,
    'mm': padStart(m),
    's': s,
    'ss': padStart(s) });

}

/**
 * Format a number for output to the template.  Adds a leading zero if the
 * input is only one digit and a negative sign for inputs less than 0.
 * @param {number} input
 * @return {string}
 */
function padStart(input) {
  if (input < -9 || input > 9) {
    return String(input);
  } else if (input >= -9 && input < 0) {
    return '-0' + -input;
  }
  return '0' + input;
}

/**
 * @param {number} input
 * @return {number}
 */
function supportBackDate(input) {
  if (input < 0) {
    return input + 1;
  }
  return input;
}

/**
 * @param {?string} message
 */
function displayWarning(message) {
  console /*OK*/.
  warn(message);
}
// /Users/mszylkowski/src/amphtml/extensions/amp-date-countdown/1.0/component.js