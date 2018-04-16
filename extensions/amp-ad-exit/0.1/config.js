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

import {
  ANALYTICS_IFRAME_TRANSPORT_CONFIG,
} from '../../amp-analytics/0.1/vendors';
import {FilterType} from './filters/filter';
import {user} from '../../../src/log';

/**
 * @typedef {{
 *   targets: !Object<string, !NavigationTargetConfig>,
 *   filters: (!Object<string, !FilterConfig>|undefined),
 *   transport: (!Object<TransportMode, boolean>|undefined)
 * }}
 */
export let AmpAdExitConfig;

/**
 * @typedef {{
 *   finalUrl: string,
 *   trackingUrls: (!Array<string>|undefined),
 *   vars: (VariablesDef|undefined),
 *   filters: (!Array<string>|undefined)
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
 * @typedef {{
 *   type: !FilterType,
 *   delay: number
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
 * @param {*} config The config to validate.
 * @return {!./config.AmpAdExitConfig}
 */
export function assertConfig(config) {
  user().assert(typeof config == 'object');
  if (config.filters) {
    assertFilters(config.filters);
  } else {
    config.filters = {};
  }
  if (config.transport) {
    assertTransport(config.transport);
  } else {
    config.transport = {};
  }
  assertTargets(config.targets, config);
  return /** @type {!AmpAdExitConfig} */ (config);
}

function assertTransport(transport) {
  for (const t in transport) {
    user().assert(t == TransportMode.BEACON || t == TransportMode.IMAGE,
        `Unknown transport option: '${t}'`);
    user().assert(typeof transport[t] == 'boolean');
  }
}

function assertFilters(filters) {
  const validFilters = [
    FilterType.CLICK_DELAY,
    FilterType.CLICK_LOCATION,
    FilterType.INACTIVE_ELEMENT,
  ];
  for (const name in filters) {
    user().assert(typeof filters[name] == 'object',
        'Filter specification \'%s\' is malformed', name);
    user().assert(validFilters.indexOf(filters[name].type) != -1,
        'Supported filters: ' + validFilters.join(', '));
  }
}

function assertTargets(targets, config) {
  user().assert(typeof targets == 'object', '\'targets\' must be an object');
  for (const target in targets) {
    assertTarget(target, targets[target], config);
  }
}

function assertTarget(name, target, config) {
  user().assert(
      typeof target.finalUrl == 'string',
      'finalUrl of target \'%s\' must be a string', name);
  if (target.filters) {
    target.filters.forEach(filter => {
      user().assert(
          config.filters[filter], 'filter \'%s\' not defined', filter);
    });
  }
  if (target.vars) {
    const pattern = /^_[a-zA-Z0-9_-]+$/;
    for (const variable in target.vars) {
      user().assert(
          pattern.test(variable), '\'%s\' must match the pattern \'%s\'',
          variable, pattern);
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
      ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor] &&
      ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor]['transport'] &&
      ANALYTICS_IFRAME_TRANSPORT_CONFIG[vendor]['transport']['iframe'],
      `Unknown or invalid vendor ${vendor}, ` +
      'note that vendor must use transport: iframe');
}
