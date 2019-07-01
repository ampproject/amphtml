/**
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

import {FilterType} from './filters/filter';
import {IFRAME_TRANSPORTS} from '../../amp-analytics/0.1/iframe-transport-vendors';
import {user, userAssert} from '../../../src/log';

/**
 * @typedef {{
 *   startTimingEvent: (string|undefined)
 * }}
 */
export let AmpAdExitConfigOptions;

/**
 * @typedef {{
 *   targets: !Object<string, !NavigationTargetConfig>,
 *   filters: (!Object<string, !FilterConfig>|undefined),
 *   transport: (!Object<TransportMode, boolean>|undefined),
 *   options: (!AmpAdExitConfigOptions|undefined)
 * }}
 */
export let AmpAdExitConfig;

/**
 * @typedef {{
 *   finalUrl: string,
 *   trackingUrls: (!Array<string>|undefined),
 *   vars: (VariablesDef|undefined),
 *   filters: (!Array<string>|undefined),
 *   behaviors: (BehaviorsDef|undefined)
 * }}
 */
export let NavigationTargetConfig;

/**
 * @typedef {{
 *   defaultValue: (string|number|boolean),
 *   iframeTransportSignal: (string|undefined)
 * }}
 */
export let VariableDef;

/**
 * @typedef {!Object<string, !VariableDef>}
 */
export let VariablesDef;

/**
 * Supported Behaviors:
 *  -- clickTarget -- Specifies where to try to open the click.
 *                    Either '_blank'(default) or '_top'
 *
 * @typedef {{
 *   clickTarget: (string|undefined)
 * }}
 */
export let BehaviorsDef;

/**
 * @typedef {{
 *   type: !FilterType,
 *   delay: number,
 *   startTimingEvent: (string|undefined)
 * }}
 */
export let ClickDelayConfig;

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
export let ClickLocationConfig;

/**
 * @typedef {{
 *   type: !FilterType,
 *   selector: string
 * }}
 */
export let InactiveElementConfig;

/** @typedef {!ClickDelayConfig|!ClickLocationConfig} */
export let FilterConfig;

/** @enum {string} */
export const TransportMode = {
  BEACON: 'beacon',
  IMAGE: 'image',
};

/**
 * Checks whether the object conforms to the AmpAdExitConfig spec.
 *
 * @param {?JsonObject} config The config to validate.
 * @return {!JsonObject}
 */
export function assertConfig(config) {
  userAssert(typeof config == 'object');
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
  assertTargets(config['targets'], /** @type {!JsonObject} */ (config));
  return /** @type {!JsonObject} */ (config);
}

/**
 * Asserts a transport.
 * @param {!JsonObject} transport
 */
function assertTransport(transport) {
  for (const t in transport) {
    userAssert(
      t == TransportMode.BEACON || t == TransportMode.IMAGE,
      `Unknown transport option: '${t}'`
    );
    userAssert(typeof transport[t] == 'boolean');
  }
}

/**
 * Asserts an array of filters.
 * @param {!JsonObject} filters
 */
function assertFilters(filters) {
  const validFilters = [
    FilterType.CLICK_DELAY,
    FilterType.CLICK_LOCATION,
    FilterType.INACTIVE_ELEMENT,
  ];
  for (const name in filters) {
    userAssert(
      typeof filters[name] == 'object',
      "Filter specification '%s' is malformed",
      name
    );
    userAssert(
      validFilters.indexOf(filters[name].type) != -1,
      'Supported filters: ' + validFilters.join(', ')
    );
  }
}

/**
 * Asserts targets and its config
 *
 * @param {!JsonObject} targets
 * @param {!JsonObject} config
 */
function assertTargets(targets, config) {
  userAssert(typeof targets == 'object', "'targets' must be an object");
  for (const target in targets) {
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
    name
  );
  if (target['filters']) {
    target['filters'].forEach(filter => {
      userAssert(config['filters'][filter], "filter '%s' not defined", filter);
    });
  }
  if (target['vars']) {
    const pattern = /^_[a-zA-Z0-9_-]+$/;
    for (const variable in target['vars']) {
      userAssert(
        pattern.test(variable),
        "'%s' must match the pattern '%s'",
        variable,
        pattern
      );
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
    `Unknown or invalid vendor ${vendor}, ` +
      'note that vendor must use transport: iframe'
  );
}
