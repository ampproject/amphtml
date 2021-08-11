function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);} /**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import { FilterType } from "./filters/filter";
import { IFRAME_TRANSPORTS } from "../../amp-analytics/0.1/iframe-transport-vendors";
import { user, userAssert } from "../../../src/log";

/**
 * @typedef {{
 *   startTimingEvent: (string|undefined)
 * }}
 */
export var AmpAdExitConfigOptions;

/**
 * @typedef {{
 *   targets: !Object<string, !NavigationTargetConfig>,
 *   filters: (!Object<string, !FilterConfig>|undefined),
 *   transport: (!Object<TransportMode, boolean>|undefined),
 *   options: (!AmpAdExitConfigOptions|undefined)
 * }}
 */
export var AmpAdExitConfig;

/**
 * @typedef {{
 *   finalUrl: string,
 *   trackingUrls: (!Array<string>|undefined),
 *   vars: (VariablesDef|undefined),
 *   filters: (!Array<string>|undefined),
 *   behaviors: (BehaviorsDef|undefined)
 * }}
 */
export var NavigationTargetConfig;

/**
 * @typedef {{
 *   defaultValue: (string|number|boolean),
 *   iframeTransportSignal: (string|undefined)
 * }}
 */
export var VariableDef;

/**
 * @typedef {!Object<string, !VariableDef>}
 */
export var VariablesDef;

/**
 * Supported Behaviors:
 *  -- clickTarget -- Specifies where to try to open the click.
 *                    Either '_blank'(default) or '_top'
 *
 * @typedef {{
 *   clickTarget: (string|undefined)
 * }}
 */
export var BehaviorsDef;

/**
 * @typedef {{
 *   type: !FilterType,
 *   delay: number,
 *   startTimingEvent: (string|undefined)
 * }}
 */
export var ClickDelayConfig;

/**
 * @typedef {{
 *   type: !FilterType,
 *   top: (number|undefined),
 *   right: (number|undefined),
 *   bottom: (number|undefined),
 *   left: (number|undefined),
 *   relativeTo: (string|undefined)
 * }}
 */
export var ClickLocationConfig;

/**
 * @typedef {{
 *   type: !FilterType,
 *   selector: string
 * }}
 */
export var InactiveElementConfig;

/** @typedef {!ClickDelayConfig|!ClickLocationConfig} */
export var FilterConfig;

/** @enum {string} */
export var TransportMode = {
  BEACON: 'beacon',
  IMAGE: 'image' };


/**
 * Checks whether the object conforms to the AmpAdExitConfig spec.
 *
 * @param {?JsonObject} config The config to validate.
 * @return {!JsonObject}
 */
export function assertConfig(config) {
  userAssert(_typeof(config) == 'object');
  if (config['filters']) {
    assertFilters(config['filters']);
  } else {
    config['filters'] = {};
  }
  if (config['transport']) {
    assertTransport(config['transport']);
  } else {
    config['transport'] = {};
  }
  assertTargets(config['targets'], /** @type {!JsonObject} */(config));
  return (/** @type {!JsonObject} */(config));
}

/**
 * Asserts a transport.
 * @param {!JsonObject} transport
 */
function assertTransport(transport) {
  for (var t in transport) {
    userAssert(
    t == TransportMode.BEACON || t == TransportMode.IMAGE, "Unknown transport option: '".concat(
    t, "'"));

    userAssert(typeof transport[t] == 'boolean');
  }
}

/**
 * Asserts an array of filters.
 * @param {!JsonObject} filters
 */
function assertFilters(filters) {
  var validFilters = [
  FilterType.CLICK_DELAY,
  FilterType.CLICK_LOCATION,
  FilterType.INACTIVE_ELEMENT];

  for (var name in filters) {
    userAssert(
    _typeof(filters[name]) == 'object',
    "Filter specification '%s' is malformed",
    name);

    userAssert(
    validFilters.indexOf(filters[name].type) != -1,
    'Supported filters: ' + validFilters.join(', '));

  }
}

/**
 * Asserts targets and its config
 *
 * @param {!JsonObject} targets
 * @param {!JsonObject} config
 */
function assertTargets(targets, config) {
  userAssert(_typeof(targets) == 'object', "'targets' must be an object");
  for (var target in targets) {
    assertTarget(target, targets[target], config);
  }
}

/**
 * Asserts target
 *
 * @param {string} name
 * @param {!JsonObject} target
 * @param {!JsonObject} config
 */
function assertTarget(name, target, config) {
  userAssert(
  typeof target['finalUrl'] == 'string',
  "finalUrl of target '%s' must be a string",
  name);

  if (target['filters']) {
    /** @type {!Array} */(target['filters']).forEach(function (filter) {
      userAssert(config['filters'][filter], "filter '%s' not defined", filter);
    });
  }
  if (target['vars']) {
    var pattern = /^_[a-zA-Z0-9_-]+$/;
    for (var variable in target['vars']) {
      userAssert(
      pattern.test(variable),
      "'%s' must match the pattern '%s'",
      variable,
      pattern);

    }
  }
}

/**
 * Checks whether a vendor is valid (i.e. listed in vendors.js and has
 * transport/iframe defined.
 * @param {string} vendor The vendor name that should be listed in vendors.js
 * @return {string} The vendor's iframe URL
 */
export function assertVendor(vendor) {
  return user().assertString(
  IFRAME_TRANSPORTS[vendor],
  "Unknown or invalid vendor ".concat(vendor, ", ") +
  'note that vendor must use transport: iframe');

}
// /Users/mszylkowski/src/amphtml/extensions/amp-ad-exit/0.1/config.js