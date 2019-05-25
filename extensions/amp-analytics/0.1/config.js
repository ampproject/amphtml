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
import {assertHttpsUrl} from '../../../src/url';
import {deepMerge, dict, hasOwn} from '../../../src/utils/object';
import {dev, user, userAssert} from '../../../src/log';
import {getChildJsonConfig} from '../../../src/json';
import {getMode} from '../../../src/mode';
import {isArray, isObject, toWin} from '../../../src/types';
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

    return this.fetchRemoteConfig_()
      .then(this.processConfigs_.bind(this))
      .then(this.handleTopLevelAttributes_.bind(this))
      .then(() => this.config_);
  }

  /**
   * Handles top level fields in config
   */
  handleTopLevelAttributes_() {
    // add top level request origin into request if it doesn't have one
    if (hasOwn(this.config_, 'requests') && hasOwn(this.config_, 'requestOrigin')) {
      const requestOrigin = this.config_['requestOrigin'];

      for (const requestName in this.config_['requests']) {
        if (!hasOwn(this.config_['requests'][requestName], 'requestOrigin')) {
          this.config_['requests'][requestName]['requestOrigin'] = requestOrigin;
        }
      }
    }
  }

  /**
   * Returns a promise that resolves when remote config is ready (or
   * immediately if no remote config is specified.)
   * @private
   * @return {!Promise<undefined>}
   */
  fetchRemoteConfig_() {
    let remoteConfigUrl = this.element_.getAttribute('config');
    if (!remoteConfigUrl || this.isSandbox_) {
      return Promise.resolve();
    }
    assertHttpsUrl(remoteConfigUrl, this.element_);
    const TAG = this.getName_();
    dev().fine(TAG, 'Fetching remote config', remoteConfigUrl);
    const fetchConfig = {
      requireAmpResponseSourceOrigin: false,
    };
    if (this.element_.hasAttribute('data-credentials')) {
      fetchConfig.credentials = this.element_.getAttribute('data-credentials');
    }
    return Services.urlReplacementsForDoc(this.element_)
      .expandUrlAsync(remoteConfigUrl)
      .then(expandedUrl => {
        remoteConfigUrl = expandedUrl;
        return Services.xhrFor(toWin(this.win_)).fetchJson(
          remoteConfigUrl,
          fetchConfig
        );
      })
      .then(res => res.json())
      .then(
        jsonValue => {
          this.remoteConfig_ = jsonValue;
          dev().fine(TAG, 'Remote config loaded', remoteConfigUrl);
        },
        err => {
          user().error(
            TAG,
            'Error loading remote config: ',
            remoteConfigUrl,
            err
          );
        }
      );
  }

  /**
   * Returns a promise that resolves when configuration is re-written if
   * configRewriter is configured by a vendor.
   * @private
   * @return {!Promise<undefined>}
   */
  processConfigs_() {
    const configRewriterUrl = this.getConfigRewriter_()['url'];

    const config = dict({});
    const inlineConfig = this.getInlineConfigNoInline();
    this.validateTransport_(inlineConfig);
    mergeObjects(inlineConfig, config);
    mergeObjects(this.remoteConfig_, config);

    if (!configRewriterUrl || this.isSandbox_) {
      this.config_ = this.mergeConfigs_(config);
      // use default configuration merge.
      return Promise.resolve();
    }

    return this.handleConfigRewriter_(config, configRewriterUrl);
  }

  /**
   * Handles logic if configRewriter is enabled.
   * @param {!JsonObject} config
   * @param {string} configRewriterUrl
   */
  handleConfigRewriter_(config, configRewriterUrl) {
    assertHttpsUrl(configRewriterUrl, this.element_);
    const TAG = this.getName_();
    dev().fine(TAG, 'Rewriting config', configRewriterUrl);

    return this.handleVarGroups_(config).then(() => {
      const fetchConfig = {
        method: 'POST',
        body: config,
        requireAmpResponseSourceOrigin: false,
      };
      if (this.element_.hasAttribute('data-credentials')) {
        fetchConfig.credentials = this.element_.getAttribute(
          'data-credentials'
        );
      }
      return Services.urlReplacementsForDoc(this.element_)
        .expandUrlAsync(configRewriterUrl)
        .then(expandedUrl => {
          return Services.xhrFor(toWin(this.win_)).fetchJson(
            expandedUrl,
            fetchConfig
          );
        })
        .then(res => res.json())
        .then(
          jsonValue => {
            this.config_ = this.mergeConfigs_(jsonValue);
            dev().fine(TAG, 'Configuration re-written', configRewriterUrl);
          },
          err => {
            user().error(
              TAG,
              'Error rewriting configuration: ',
              configRewriterUrl,
              err
            );
          }
        );
    });
  }

  /**
   * Check to see which varGroups are enabled, resolve and merge them into
   * vars object.
   * @param {!JsonObject} pubConfig
   * @return {!Promise}
   */
  handleVarGroups_(pubConfig) {
    const pubRewriterConfig = pubConfig['configRewriter'];
    const pubVarGroups = pubRewriterConfig && pubRewriterConfig['varGroups'];
    const vendorVarGroups = this.getConfigRewriter_()['varGroups'];

    if (!pubVarGroups && !vendorVarGroups) {
      return Promise.resolve();
    }

    if (pubVarGroups && !vendorVarGroups) {
      const TAG = this.getName_();
      user().warn(
        TAG,
        'This analytics provider does not currently support varGroups'
      );
      return Promise.resolve();
    }

    // Create object that will later hold all the resolved variables, and any
    // intermediary objects as necessary.
    pubConfig['configRewriter'] = pubConfig['configRewriter'] || dict();
    const rewriterConfig = pubConfig['configRewriter'];
    rewriterConfig['vars'] = dict({});

    const allPromises = [];
    // Merge publisher && vendor varGroups to see what has been enabled.
    const mergedConfig = pubVarGroups || dict();
    deepMerge(mergedConfig, vendorVarGroups);

    Object.keys(mergedConfig).forEach(groupName => {
      const group = mergedConfig[groupName];
      if (!group['enabled']) {
        // Any varGroups must be explicitly enabled.
        return;
      }

      const groupPromise = this.shallowExpandObject(this.element_, group).then(
        expandedGroup => {
          // This is part of the user config and should not be sent.
          delete expandedGroup['enabled'];
          // Merge all groups into single `vars` object.
          Object.assign(rewriterConfig['vars'], expandedGroup);
        }
      );
      allPromises.push(groupPromise);
    });

    return Promise.all(allPromises).then(() => {
      // Don't send an empty vars payload.
      if (!Object.keys(rewriterConfig['vars']).length) {
        return delete pubConfig['configRewriter'];
      }
      // Don't send varGroups in payload to configRewriter endpoint.
      pubVarGroups && delete rewriterConfig['varGroups'];
    });
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
      expandConfigRequest(this.getTypeConfig_()),
      config,
      /* predefined */ true
    );
    mergeObjects(
      expandConfigRequest(rewrittenConfig),
      config,
      /* predefined */ true
    );
    return config;
  }

  /**
   * Reads configRewriter from a vendor config.
   * @return {!JsonObject}
   */
  getConfigRewriter_() {
    return this.getTypeConfig_()['configRewriter'] || {};
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
   */
  getInlineConfigNoInline() {
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
   * @param {!Element|!ShadowRoot} element
   * @param {!Object} obj
   * @return {!Promise<!Object>}
   */
  shallowExpandObject(element, obj) {
    const expandedObj = dict();
    const keys = [];
    const expansionPromises = [];

    const urlReplacements = Services.urlReplacementsForDoc(element);
    const bindings = variableServiceForDoc(element).getMacros();

    Object.keys(obj).forEach(key => {
      keys.push(key);
      const expanded = urlReplacements.expandStringAsync(obj[key], bindings);
      expansionPromises.push(expanded);
    });

    return Promise.all(expansionPromises).then(expandedValues => {
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
 */
export function mergeObjects(from, to, opt_predefinedConfig) {
  if (to === null || to === undefined) {
    to = {};
  }

  // Assert that optouts are allowed only in predefined configs.
  // The last expression adds an exception of known, safe optout function
  // that is already being used in the wild.
  userAssert(
    opt_predefinedConfig ||
      !from ||
      !from['optout'] ||
      from['optout'] == '_gaUserPrefs.ioo' ||
      from['optoutElementId'] == '__gaOptOutExtension',
    'optout property is only available to vendor config.'
  );

  for (const property in from) {
    userAssert(
      opt_predefinedConfig || property != 'iframePing',
      'iframePing config is only available to vendor config.'
    );
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
  return config;
}

/**
 * Expand single request to an object
 * @param {!JsonObject} request
 */
function expandRequestStr(request) {
  if (isObject(request)) {
    return request;
  }
  return {
    'baseUrl': request,
  };
}
