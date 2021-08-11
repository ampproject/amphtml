var _excluded = ["color", "playlistId", "secretToken", "trackId", "visual"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

import * as Preact from "../../../src/preact";
import { IframeEmbed } from "../../../src/preact/component/iframe";
import { dict } from "../../../src/core/types/object";
import { useEffect, useRef } from "../../../src/preact";

/**
 * @param {!SoundcloudDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Soundcloud(_ref)






{var color = _ref.color,playlistId = _ref.playlistId,secretToken = _ref.secretToken,trackId = _ref.trackId,_ref$visual = _ref.visual,visual = _ref$visual === void 0 ? false : _ref$visual,rest = _objectWithoutProperties(_ref, _excluded);
  // Property and Reference Variables
  var iframeRef = useRef(null);

  useEffect(function () {
    /** Unmount Procedure */
    return function () {var _iframeRef$current, _iframeRef$current$co;
      // Pause widget
      ((_iframeRef$current = iframeRef.current) === null || _iframeRef$current === void 0) ? (void 0) : ((_iframeRef$current$co = _iframeRef$current.contentWindow) === null || _iframeRef$current$co === void 0) ? (void 0) : _iframeRef$current$co. /*OK*/postMessage(
      JSON.stringify(dict({ 'method': 'pause' })),
      'https://w.soundcloud.com');


      // Release iframe resources
      iframeRef.current = null;
    };
  }, []);

  // Checking for valid props
  if (!checkProps(trackId, playlistId)) {
    return null;
  }

  // Build Base URL
  var url =
  'https://api.soundcloud.com/' + (
  trackId != undefined ? 'tracks' : 'playlists') +
  '/';

  // Extract Media ID
  var mediaId = trackId !== null && trackId !== void 0 ? trackId : playlistId;

  // Prepare Soundcloud Widget URL for iFrame
  var iframeSrc =
  'https://w.soundcloud.com/player/?' +
  'url=' +
  encodeURIComponent(url + mediaId);

  if (secretToken) {
    // It's very important the entire thing is encoded, since it's part of
    // the `url` query param added above.
    iframeSrc += encodeURIComponent('?secret_token=' + secretToken);
  }

  if (visual) {
    iframeSrc += '&visual=true';
  } else if (color) {
    iframeSrc += '&color=' + encodeURIComponent(color);
  }

  return (
    Preact.createElement(IframeEmbed, _objectSpread({
      allow: "autoplay",
      frameborder: "no",
      ref: iframeRef,
      scrolling: "no",
      src: iframeSrc,
      title: 'Soundcloud Widget - ' + mediaId },
    rest)));


}

/**
 * Verify required props and throw error if necessary.
 * @param {string|undefined} trackId
 * @param {string|undefined} playlistId
 * @return {boolean} true on valid
 */
function checkProps(trackId, playlistId) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (playlistId == undefined && trackId === undefined) {
    displayWarning(
    'data-trackid or data-playlistid is required for <amp-soundcloud>');

    return false;
  }
  return true;
}

/**
 * @param {?string} message
 */
function displayWarning(message) {
  console /*OK*/.
  warn(message);
}
// /Users/mszylkowski/src/amphtml/extensions/amp-soundcloud/1.0/component.js