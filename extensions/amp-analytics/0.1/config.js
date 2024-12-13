import {getChildJsonConfig} from '#core/dom';
import {isArray, isObject} from '#core/types';
import {deepMerge, hasOwn} from '#core/types/object';
import {toWin} from '#core/window';

import {isCanary} from '#experiments';

import {Services} from '#service';
import {calculateScriptBaseUrl} from '#service/extension-script';

import {dev, user, userAssert} from '#utils/log';

import {DEFAULT_CONFIG} from './default-config';
import {variableServiceForDoc} from './variables';

import {getMode} from '../../../src/mode';
import {assertHttpsUrl} from '../../../src/url';

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
     * @const {!JsonObject}
     * @private
     */
    this.defaultConfig_ = DEFAULT_CONFIG || {};

    /** @private {!JsonObject} */
    this.vendorConfig_ = {};

    /**
     * @private {JsonObject}
     */
    this.config_ = {};

    /**
     * @private {JsonObject}
     */
    this.remoteConfig_ = {};

    /** @private {boolean} */
    this.isSandbox_ = false;

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceForDoc(element);
  }

  /**
   * @return {!Promise<JsonObject>}
   */
  loadConfig() {
    this.win_ = this.element_.ownerDocument.defaultView;
    this.isSandbox_ = this.element_.hasAttribute('sandbox');

    return Promise.all([this.fetchRemoteConfig_(), this.fetchVendorConfig_()])
      .then(this.processConfigs_.bind(this))
      .then(this.checkWarningMessage_.bind(this))
      .then(() => this.config_);
  }

  /**
   * Constructs the URL where the given vendor config is located
   * @private
   * @param {string} vendor the vendor name
   * @return {string} the URL to request the vendor config file from
   */
  getVendorUrl_(vendor) {
    const baseUrl = calculateScriptBaseUrl(
      this.win_.location,
      getMode().localDev
    );
    // bg has a special canary config
    const canary = vendor === 'bg' && isCanary(self) ? '.canary' : '';
    return `${baseUrl}/rtv/${
      getMode().rtvVersion
    }/v0/analytics-vendors/${vendor}${canary}.json`;
  }

  /**
   * Returns a promise that resolves when vendor config is ready (or
   * immediately if no vendor config is specified)
   * @private
   * @return {!Promise<undefined>}
   */
  fetchVendorConfig_() {
    const type = this.element_.getAttribute('type');
    if (!type) {
      return Promise.resolve();
    }

    const vendorUrl = this.getVendorUrl_(type);

    const TAG = this.getName_();
    dev().fine(TAG, 'Fetching vendor config', vendorUrl);

    return Services.xhrFor(toWin(this.win_))
      .fetchJson(vendorUrl, {ampCors: false})
      .then((res) => res.json())
      .then(
        (jsonValue) => {
          this.vendorConfig_ = jsonValue || {};
          dev().fine(TAG, 'Vendor config loaded for ' + type, jsonValue);
        },
        (err) => {
          user().error(TAG, 'Error loading vendor config: ', vendorUrl, err);
        }
      );
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
    const fetchConfig = {};
    if (this.element_.hasAttribute('data-credentials')) {
      fetchConfig.credentials = this.element_.getAttribute('data-credentials');
    }
    return Services.urlReplacementsForDoc(this.element_)
      .expandUrlAsync(
        remoteConfigUrl,
        this.variableService_.getMacros(this.element_)
      )
      .then((expandedUrl) => {
        remoteConfigUrl = expandedUrl;
        return Services.xhrFor(toWin(this.win_)).fetchJson(
          remoteConfigUrl,
          fetchConfig
        );
      })
      .then((res) => res.json())
      .then(
        (jsonValue) => {
          this.remoteConfig_ = jsonValue;
          dev().fine(TAG, 'Remote config loaded', remoteConfigUrl);
        },
        (err) => {
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

    const config = {};
    const inlineConfig = this.getInlineConfig_();
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
   * @return {!Promise<undefined>}
   */
  handleConfigRewriter_(config, configRewriterUrl) {
    assertHttpsUrl(configRewriterUrl, this.element_);
    const TAG = this.getName_();
    dev().fine(TAG, 'Rewriting config', configRewriterUrl);

    return this.handleVarGroups_(config).then(() => {
      const fetchConfig = {
        method: 'POST',
        body: config,
      };
      if (this.element_.hasAttribute('data-credentials')) {
        fetchConfig.credentials =
          this.element_.getAttribute('data-credentials');
      }
      return (
        Services.urlReplacementsForDoc(this.element_)
          // Pass bindings if requested
          .expandUrlAsync(configRewriterUrl)
          .then((expandedUrl) => {
            return Services.xhrFor(toWin(this.win_)).fetchJson(
              expandedUrl,
              fetchConfig
            );
          })
          .then((res) => res.json())
          .then(
            (jsonValue) => {
              this.config_ = this.mergeConfigs_(jsonValue);
              dev().fine(TAG, 'Configuration re-written', configRewriterUrl);
            },
            (err) => {
              user().error(
                TAG,
                'Error rewriting configuration: ',
                configRewriterUrl,
                err
              );
            }
          )
      );
    });
  }

  /**
   * Check if config has warning, display on console and
   * remove the property.
   * @private
   */
  checkWarningMessage_() {
    if (this.config_['warningMessage']) {
      const TAG = this.getName_();
      const type = this.element_.getAttribute('type');
      const remoteConfigUrl = this.element_.getAttribute('config');

      user().warn(
        TAG,
        'Warning from analytics vendor%s%s: %s',
        type ? ' ' + type : '',
        remoteConfigUrl ? ' with remote config url ' + remoteConfigUrl : '',
        String(this.config_['warningMessage'])
      );
      delete this.config_['warningMessage'];
    }
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
    pubConfig['configRewriter'] = pubConfig['configRewriter'] || {};
    const rewriterConfig = pubConfig['configRewriter'];
    rewriterConfig['vars'] = {};

    const allPromises = [];
    // Merge publisher && vendor varGroups to see what has been enabled.
    const mergedConfig = pubVarGroups || {};
    deepMerge(mergedConfig, vendorVarGroups);

    Object.keys(mergedConfig).forEach((groupName) => {
      const group = mergedConfig[groupName];
      if (!group['enabled']) {
        // Any varGroups must be explicitly enabled.
        return;
      }

      const groupPromise = this.shallowExpandObject(this.element_, group).then(
        (expandedGroup) => {
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
   * - Predefined Vendor config: Defined as part of the platform.
   * - Default config: Built-in config shared by all amp-analytics tags.
   *
   * @private
   * @param {!JsonObject} rewrittenConfig
   * @return {!JsonObject}
   */
  mergeConfigs_(rewrittenConfig) {
    // Initialize config with analytics related vars.
    const config = {
      'vars': {
        'requestCount': 0,
      },
    };
    mergeObjects(expandConfigRequest(this.defaultConfig_), config);
    mergeObjects(
      expandConfigRequest(this.vendorConfig_),
      config,
      /* predefined-vendor */ true
    );
    mergeObjects(
      expandConfigRequest(rewrittenConfig),
      config,
      /* predefined-vendor */ true
    );
    return config;
  }

  /**
   * Reads configRewriter from a vendor config.
   * @return {!JsonObject}
   */
  getConfigRewriter_() {
    return this.vendorConfig_['configRewriter'] || {};
  }

  /**
   * @private
   * @return {!JsonObject}
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
    if (this.element_.getAttribute('type')) {
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
    const expandedObj = {};
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
 * @param {boolean=} opt_predefinedVendorConfig
 * @return {*} TODO(#23582): Specify return type
 */
export function mergeObjects(from, to, opt_predefinedVendorConfig) {
  if (to === null || to === undefined) {
    to = {};
  }

  // Assert that optouts are allowed only in predefined vendor configs.
  // The last expression adds an exception of known, safe optout function
  // that is already being used in the wild.
  userAssert(
    opt_predefinedVendorConfig ||
      !from ||
      !from['optout'] ||
      from['optout'] == '_gaUserPrefs.ioo' ||
      from['optoutElementId'] == '__gaOptOutExtension',
    'optout property is only available to vendor config.'
  );

  for (const property in from) {
    userAssert(
      opt_predefinedVendorConfig || property != 'iframePing',
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
          opt_predefinedVendorConfig
        );
      } else if (isObject(from[property])) {
        if (!isObject(to[property])) {
          to[property] = {};
        }
        to[property] = mergeObjects(
          from[property],
          to[property],
          opt_predefinedVendorConfig
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
