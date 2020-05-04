/**
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

import {ANALYTICS_CONFIG} from './vendors';
import {Services} from '../../../src/services';
import {dict, hasOwn} from '../../../src/utils/object';
import { user} from '../../../src/log';
import {getChildJsonConfig} from '../../../src/json';
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {variableServiceForDoc} from './variables';

const TAG = 'amp-analytics/config';

export class AnalyticsConfig {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    /** @private {!Element} */
    this.element_ = element;

    /** @private {?Window} */
    this.win_ = null;

    /**
     * @const {!JsonObject} Copied here for tests.
     * @private
     */
    this.predefinedConfig_ = ANALYTICS_CONFIG;

    /**
     * @private {JsonObject}
     */
    this.config_ = dict();

    /**
     * @private {JsonObject}
     */
    this.remoteConfig_ = dict();

    /** @private {boolean} */
    this.isSandbox_ = false;
  }

  /**
   * @return {!Promise<JsonObject>}
   */
  loadConfig() {
    this.win_ = this.element_.ownerDocument.defaultView;
    this.isSandbox_ = this.element_.hasAttribute('sandbox');

    return this.processConfigs_()
      .then(() => this.config_);
  }

  /**
   * Returns a promise that resolves when configuration is re-written if
   * configRewriter is configured by a vendor.
   * @private
   * @return {!Promise<undefined>}
   */
  processConfigs_() {
    const config = dict({});
    const inlineConfig = this.getInlineConfig_();
    this.validateTransport_(inlineConfig);
    mergeObjects(inlineConfig, config);
    this.config_ = this.mergeConfigs_(config);
      // use default configuration merge.
    return Promise.resolve();
  }

  /**
   * Merges various sources of configs and stores them in a member variable.
   *
   * Order of precedence for configs from highest to lowest:
   * - Remote config: specified through an attribute of the tag.
   * - Inline config: specified insize the tag.
   * - Predefined config: Defined as part of the platform.
   * - Default config: Built-in config shared by all amp-analytics tags.
   *
   * @private
   * @param {!JsonObject} rewrittenConfig
   * @return {!JsonObject}
   */
  mergeConfigs_(rewrittenConfig) {
    // Initialize config with analytics related vars.
    const config = dict({
      'vars': {
        'requestCount': 0,
      },
    });
    const defaultConfig = this.predefinedConfig_['default'] || {};
    mergeObjects(expandConfigRequest(defaultConfig), config);
    mergeObjects(
      expandConfigRequest(rewrittenConfig),
      config,
      /* predefined */ true
    );
    return config;
  }

  /**
   * Reads a vendor configuration.
   * @return {!JsonObject}
   */
  getTypeConfig_() {
    const type = this.element_.getAttribute('type');
    return this.predefinedConfig_[type] || {};
  }

  /**
   * @private
   * @return {!JsonObject}
   * @noinline
   */
  getInlineConfig_() {
    if (this.element_.CONFIG) {
      // If the analytics element is created by runtime, return cached config.
      return this.element_.CONFIG;
    }
    let inlineConfig = {};
    const TAG = this.getName_();
    try {
      const {children} = this.element_;
      if (children.length == 1) {
        inlineConfig = getChildJsonConfig(this.element_);
      } else if (children.length > 1) {
        user().error(TAG, 'The tag should contain only one <script> child.');
      }
    } catch (er) {
      user().error(TAG, er.message);
    }
    return /** @type {!JsonObject} */ (inlineConfig);
  }

  /**
   * Validates transport configuration.
   * @param {!JsonObject} inlineConfig
   */
  validateTransport_(inlineConfig) {
    const type = this.element_.getAttribute('type');
    if (this.predefinedConfig_[type]) {
      // TODO(zhouyx, #7096) Track overwrite percentage. Prevent transport
      // overwriting
      if (inlineConfig['transport'] || this.remoteConfig_['transport']) {
        const TAG = this.getName_();
        user().error(
          TAG,
          'Inline or remote config should not ' +
            'overwrite vendor transport settings'
        );
      }
    }

    // Do NOT allow inline or remote config to use 'transport: iframe'
    if (inlineConfig['transport'] && inlineConfig['transport']['iframe']) {
      user().error(
        TAG,
        'Inline configs are not allowed to specify transport iframe'
      );
      if (!getMode().localDev || getMode().test) {
        inlineConfig['transport']['iframe'] = undefined;
      }
    }

    if (
      this.remoteConfig_['transport'] &&
      this.remoteConfig_['transport']['iframe']
    ) {
      user().error(
        TAG,
        'Remote configs are not allowed to specify transport iframe'
      );
      this.remoteConfig_['transport']['iframe'] = undefined;
    }
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  getName_() {
    return (
      'AmpAnalytics ' + (this.element_.getAttribute('id') || '<unknown id>')
    );
  }

  /**
   * Expands all key value pairs asynchronously and returns a promise that will
   * resolve with the expanded object.
   * @param {!Element} element
   * @param {!Object} obj
   * @return {!Promise<!Object>}
   */
  shallowExpandObject(element, obj) {
    const expandedObj = dict();
    const keys = [];
    const expansionPromises = [];

    const urlReplacements = Services.urlReplacementsForDoc(element);
    const bindings = variableServiceForDoc(element).getMacros(element);

    Object.keys(obj).forEach((key) => {
      keys.push(key);
      const expanded = urlReplacements.expandStringAsync(obj[key], bindings);
      expansionPromises.push(expanded);
    });

    return Promise.all(expansionPromises).then((expandedValues) => {
      keys.forEach((key, i) => (expandedObj[key] = expandedValues[i]));
      return expandedObj;
    });
  }
}

/**
 * Merges two objects. If the value is array or plain object, the values are
 * merged otherwise the value is overwritten.
 *
 * @param {Object|Array} from Object or array to merge from
 * @param {Object|Array} to Object or Array to merge into
 * @param {boolean=} opt_predefinedConfig
 * @return {*} TODO(#23582): Specify return type
 */
export function mergeObjects(from, to, opt_predefinedConfig) {
  if (to === null || to === undefined) {
    to = {};
  }


  for (const property in from) {
    // Only deal with own properties.
    if (hasOwn(from, property)) {
      if (isArray(from[property])) {
        if (!isArray(to[property])) {
          to[property] = [];
        }
        to[property] = mergeObjects(
          from[property],
          to[property],
          opt_predefinedConfig
        );
      } else if (isObject(from[property])) {
        if (!isObject(to[property])) {
          to[property] = {};
        }
        to[property] = mergeObjects(
          from[property],
          to[property],
          opt_predefinedConfig
        );
      } else {
        to[property] = from[property];
      }
    }
  }
  return to;
}

/**
 * Expand config's request to object
 * @param {!JsonObject} config
 * @return {?JsonObject}
 * @visibleForTesting
 */
export function expandConfigRequest(config) {
  if (!config['requests']) {
    return config;
  }
  for (const k in config['requests']) {
    if (hasOwn(config['requests'], k)) {
      config['requests'][k] = expandRequestStr(config['requests'][k]);
    }
  }

  return handleTopLevelAttributes_(config);
}

/**
 * Expand single request to an object
 * @param {!JsonObject} request
 * @return {*} TODO(#23582): Specify return type
 */
function expandRequestStr(request) {
  if (isObject(request)) {
    return request;
  }
  return {
    'baseUrl': request,
  };
}

/**
 * Handles top level fields in the given config
 * @param {!JsonObject} config
 * @return {JsonObject}
 */
function handleTopLevelAttributes_(config) {
  // handle a top level requestOrigin
  if (hasOwn(config, 'requests') && hasOwn(config, 'requestOrigin')) {
    const requestOrigin = config['requestOrigin'];

    for (const requestName in config['requests']) {
      // only add top level request origin into request if it doesn't have one
      if (!hasOwn(config['requests'][requestName], 'origin')) {
        config['requests'][requestName]['origin'] = requestOrigin;
      }
    }
  }

  return config;
}
