import { $button as _$button } from "./component.jss";var _excluded = ["background", "children", "color", "endpoint", "height", "params", "style", "tabIndex", "target", "type", "width"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { Keys } from "../../../src/core/constants/key-codes";
import { SocialShareIcon } from "./social-share-svgs";
import { Wrapper } from "../../../src/preact/component";
import { addParamsToUrl } from "../../../src/url";
import { dict } from "../../../src/core/types/object";
import { getSocialConfig } from "./social-share-config";
import { openWindowDialog } from "../../../src/open-window-dialog";
import { parseQueryString } from "../../../src/core/types/string/url";
import { useResourcesNotify } from "../../../src/preact/utils";
import { useStyles } from "./component.jss";

var NAME = 'SocialShare';
var DEFAULT_WIDTH = 60;
var DEFAULT_HEIGHT = 44;
var DEFAULT_TARGET = '_blank';
var WINDOW_FEATURES = 'resizable,scrollbars,width=640,height=480';

/**
 * @param {!SocialShareDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function SocialShare(_ref)












{var background = _ref.background,children = _ref.children,color = _ref.color,endpoint = _ref.endpoint,height = _ref.height,params = _ref.params,style = _ref.style,_ref$tabIndex = _ref.tabIndex,tabIndex = _ref$tabIndex === void 0 ? 0 : _ref$tabIndex,target = _ref.target,type = _ref.type,width = _ref.width,rest = _objectWithoutProperties(_ref, _excluded);
  useResourcesNotify();

  var checkPropsReturnValue = checkProps(
  type,
  endpoint,
  target,
  width,
  height,
  params);


  // Early exit if checkProps did not pass
  if (!checkPropsReturnValue) {
    return null;
  }

  var checkedHeight =
  checkPropsReturnValue.checkedHeight,checkedTarget = checkPropsReturnValue.checkedTarget,checkedWidth = checkPropsReturnValue.checkedWidth,finalEndpoint = checkPropsReturnValue.finalEndpoint;

  return (
    Preact.createElement(Wrapper, _objectSpread(_objectSpread({},
    rest), {}, {
      role: "button",
      tabindex: tabIndex,
      onKeyDown: function onKeyDown(e) {return handleKeyPress(e, finalEndpoint, checkedTarget);},
      onClick: function onClick() {return handleActivation(finalEndpoint, checkedTarget);},
      wrapperStyle: _objectSpread({
        width: checkedWidth,
        height: checkedHeight },
      style),

      part: "button",
      wrapperClassName: _$button }),

    processChildren(
    /** @type {string} */((type)),
    children,
    color,
    background)));



}

/**
 * If children exist, render the children instead of the icon.  Otherwise,
 * render the icon associated with the specified type with specified color
 * and background (or defaults if not specified).
 * @param {string} type
 * @param {?PreactDef.Renderable|undefined} children
 * @param {string|undefined} color
 * @param {string|undefined} background
 * @return {PreactDef.Renderable}
 */
function processChildren(type, children, color, background) {
  if (children) {
    return children;
  } else {
    var typeConfig = getSocialConfig(type) || {};
    var iconStyle = dict({
      'color': color || typeConfig.defaultColor,
      'backgroundColor': background || typeConfig.defaultBackgroundColor });

    return (
      Preact.createElement(SocialShareIcon, {
        style: _objectSpread(_objectSpread({},
        iconStyle), {}, {
          width: '100%',
          height: '100%' }),

        type: type.toUpperCase() }));


  }
}

/**
 * Verify required props and throw error if necessary.  Set default values
 * for optional props if no value specified.
 * @param {string|undefined} type
 * @param {string|undefined} endpoint
 * @param {string|undefined} target
 * @param {number|string|undefined} width
 * @param {number|string|undefined} height
 * @param {JsonObject|Object|undefined} params
 * @return {?{
 *   finalEndpoint: string,
 *   checkedWidth: (number|string),
 *   checkedHeight: (number|string),
 *   checkedTarget: string,
 * }}
 */
function checkProps(type, endpoint, target, width, height, params) {
  // User must provide endpoint if they choose a type that is not
  // pre-configured, early exit if not provided
  var typeConfig = getSocialConfig( /** @type {string} */(type)) || {};
  var baseEndpoint = endpoint || typeConfig.shareEndpoint;
  if (baseEndpoint === undefined) {
    displayWarning("An endpoint is required if not using a pre-configured type. ".concat(
    NAME));

    return null;
  }

  // Special case when type is 'email'
  if (type === 'email' && !endpoint) {
    baseEndpoint = "mailto:".concat((params && params['recipient']) || '');
  }

  // Add params to baseEndpoint
  var finalEndpoint = addParamsToUrl(
  /** @type {string} */(baseEndpoint),
  /** @type {!JsonObject} */(params));


  // Defaults
  var checkedWidth = width || DEFAULT_WIDTH;
  var checkedHeight = height || DEFAULT_HEIGHT;
  var checkedTarget = target || DEFAULT_TARGET;

  return {
    finalEndpoint: finalEndpoint,
    checkedWidth: checkedWidth,
    checkedHeight: checkedHeight,
    checkedTarget: checkedTarget };

}

/**
 * @param {?string} message
 */
function displayWarning(message) {
  console /*OK*/.
  warn(message);
}

/**
 * Opens a new window with the fully processed endpoint
 * @param {?string} finalEndpoint
 * @param {string} target
 */
function handleActivation(finalEndpoint, target) {
  var protocol = finalEndpoint.split(':', 1)[0];

  if (protocol === 'navigator-share') {
    if (window && window.navigator && window.navigator.share) {
      var data = parseQueryString(
      /** @type {string} */(getQueryString(finalEndpoint)));

      window.navigator.share(data).catch(function (e) {
        displayWarning("".concat(e.message, ". ").concat(NAME));
      });
    } else {
      displayWarning("Could not complete system share.  Navigator unavailable. ".concat(
      NAME));

    }
  } else if (protocol === 'sms' || protocol === 'mailto') {
    openWindowDialog(
    window,
    protocol === 'sms' ? finalEndpoint.replace('?', '?&') : finalEndpoint,
    isIos() ? '_top' : target,
    WINDOW_FEATURES);

  } else {
    openWindowDialog(window, finalEndpoint, target, WINDOW_FEATURES);
  }
}

/**
 * Returns the Query String of a full url, will not include # parameters
 * @param {?string} endpoint
 * @return {?string}
 */
function getQueryString(endpoint) {
  var q = endpoint.indexOf('?');
  var h = endpoint.indexOf('#');
  q = q === -1 ? endpoint.length : q;
  h = h === -1 ? endpoint.length : h;
  return endpoint.slice(q, h);
}

/**
 * Checks whether or not the userAgent of the current device indicates that
 * this is an Ios device.  Checked for 'mailto:' and 'sms:' protocols which
 * break when opened in _blank on iOS Safari.
 * @return {boolean}
 */
function isIos() {
  return (/** @type {boolean} */(
    window &&
    window.navigator &&
    window.navigator.userAgent &&
    window.navigator.userAgent.search(/iPhone|iPad|iPod/i) >= 0));

}

/**
 * @param {!Event} event
 * @param {?string} finalEndpoint
 * @param {string} target
 */
function handleKeyPress(event, finalEndpoint, target) {
  var key = event.key;
  if (key == Keys.SPACE || key == Keys.ENTER) {
    event.preventDefault();
    handleActivation(finalEndpoint, target);
  }
}
// /Users/mszylkowski/src/amphtml/extensions/amp-social-share/1.0/component.js