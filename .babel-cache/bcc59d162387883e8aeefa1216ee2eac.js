function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
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

/**
 * Vendors who have IAB viewability certification may use iframe transport
 * (see ../amp-analytics.md and ../integrating-analytics.md). In this case,
 * put only the specification of the iframe location in the object below.
 *
 * This object is separated from vendors.js to be shared with extensions
 * other than amp-analytics, for instance amp-ad-exit.
 *
 * @const {!Object}
 */
var prodConfig = {
  'bg': 'https://tpc.googlesyndication.com/b4a/b4a-runner.html',
  'moat': 'https://z.moatads.com/ampanalytics093284/iframe.html' };

/**
 * Canary config override
 *
 * @const {!Object}
 */
var canaryConfig = _objectSpread(_objectSpread({},
prodConfig), {}, {
  'bg': 'https://tpc.googlesyndication.com/b4a/experimental/b4a-runner.html' });


export var IFRAME_TRANSPORTS = /** @type {!JsonObject} */(prodConfig);
export var IFRAME_TRANSPORTS_CANARY = /** @type {!JsonObject} */(
canaryConfig);
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/iframe-transport-vendors.js