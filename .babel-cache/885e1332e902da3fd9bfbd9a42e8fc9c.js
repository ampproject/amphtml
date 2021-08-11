import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { DEFAULT_CONFIG } from "./default-config";
import { Services } from "../../../src/service";
import { assertHttpsUrl } from "../../../src/url";
import { calculateScriptBaseUrl } from "../../../src/service/extension-script";
import { deepMerge, dict, hasOwn } from "../../../src/core/types/object";
import { dev, user, userAssert } from "../../../src/log";
import { getChildJsonConfig } from "../../../src/core/dom";
import { getMode } from "../../../src/mode";
import { isArray, isObject } from "../../../src/core/types";
import { isCanary } from "../../../src/experiments";
import { toWin } from "../../../src/core/window";
import { variableServiceForDoc } from "./variables";
var TAG = 'amp-analytics/config';
export var AnalyticsConfig = /*#__PURE__*/function () {
  /**
   * @param {!Element} element
   */
  function AnalyticsConfig(element) {
    _classCallCheck(this, AnalyticsConfig);

    /** @private {!Element} */
    this.element_ = element;

    /** @private {?Window} */
    this.win_ = null;

    /**
     * @const {!JsonObject}
     * @private
     */
    this.defaultConfig_ = DEFAULT_CONFIG || dict();

    /** @private {!JsonObject} */
    this.vendorConfig_ = dict();

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

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceForDoc(element);
  }

  /**
   * @return {!Promise<JsonObject>}
   */
  _createClass(AnalyticsConfig, [{
    key: "loadConfig",
    value: function loadConfig() {
      var _this = this;

      this.win_ = this.element_.ownerDocument.defaultView;
      this.isSandbox_ = this.element_.hasAttribute('sandbox');
      return Promise.all([this.fetchRemoteConfig_(), this.fetchVendorConfig_()]).then(this.processConfigs_.bind(this)).then(this.checkWarningMessage_.bind(this)).then(function () {
        return _this.config_;
      });
    }
    /**
     * Constructs the URL where the given vendor config is located
     * @private
     * @param {string} vendor the vendor name
     * @return {string} the URL to request the vendor config file from
     */

  }, {
    key: "getVendorUrl_",
    value: function getVendorUrl_(vendor) {
      var baseUrl = calculateScriptBaseUrl(this.win_.location, getMode().localDev);
      // bg has a special canary config
      var canary = vendor === 'bg' && isCanary(self) ? '.canary' : '';
      return baseUrl + "/rtv/" + getMode().rtvVersion + "/v0/analytics-vendors/" + vendor + canary + ".json";
    }
    /**
     * Returns a promise that resolves when vendor config is ready (or
     * immediately if no vendor config is specified)
     * @private
     * @return {!Promise<undefined>}
     */

  }, {
    key: "fetchVendorConfig_",
    value: function fetchVendorConfig_() {
      var _this2 = this;

      var type = this.element_.getAttribute('type');

      if (!type) {
        return _resolvedPromise();
      }

      var vendorUrl = this.getVendorUrl_(type);
      var TAG = this.getName_();
      dev().fine(TAG, 'Fetching vendor config', vendorUrl);
      return Services.xhrFor(toWin(this.win_)).fetchJson(vendorUrl, {
        ampCors: false
      }).then(function (res) {
        return res.json();
      }).then(function (jsonValue) {
        _this2.vendorConfig_ = jsonValue || dict();
        dev().fine(TAG, 'Vendor config loaded for ' + type, jsonValue);
      }, function (err) {
        user().error(TAG, 'Error loading vendor config: ', vendorUrl, err);
      });
    }
    /**
     * Returns a promise that resolves when remote config is ready (or
     * immediately if no remote config is specified.)
     * @private
     * @return {!Promise<undefined>}
     */

  }, {
    key: "fetchRemoteConfig_",
    value: function fetchRemoteConfig_() {
      var _this3 = this;

      var remoteConfigUrl = this.element_.getAttribute('config');

      if (!remoteConfigUrl || this.isSandbox_) {
        return _resolvedPromise2();
      }

      assertHttpsUrl(remoteConfigUrl, this.element_);
      var TAG = this.getName_();
      dev().fine(TAG, 'Fetching remote config', remoteConfigUrl);
      var fetchConfig = {};

      if (this.element_.hasAttribute('data-credentials')) {
        fetchConfig.credentials = this.element_.getAttribute('data-credentials');
      }

      return Services.urlReplacementsForDoc(this.element_).expandUrlAsync(remoteConfigUrl, this.variableService_.getMacros(this.element_)).then(function (expandedUrl) {
        remoteConfigUrl = expandedUrl;
        return Services.xhrFor(toWin(_this3.win_)).fetchJson(remoteConfigUrl, fetchConfig);
      }).then(function (res) {
        return res.json();
      }).then(function (jsonValue) {
        _this3.remoteConfig_ = jsonValue;
        dev().fine(TAG, 'Remote config loaded', remoteConfigUrl);
      }, function (err) {
        user().error(TAG, 'Error loading remote config: ', remoteConfigUrl, err);
      });
    }
    /**
     * Returns a promise that resolves when configuration is re-written if
     * configRewriter is configured by a vendor.
     * @private
     * @return {!Promise<undefined>}
     */

  }, {
    key: "processConfigs_",
    value: function processConfigs_() {
      var configRewriterUrl = this.getConfigRewriter_()['url'];
      var config = dict({});
      var inlineConfig = this.getInlineConfig_();
      this.validateTransport_(inlineConfig);
      mergeObjects(inlineConfig, config);
      mergeObjects(this.remoteConfig_, config);

      if (!configRewriterUrl || this.isSandbox_) {
        this.config_ = this.mergeConfigs_(config);
        // use default configuration merge.
        return _resolvedPromise3();
      }

      return this.handleConfigRewriter_(config, configRewriterUrl);
    }
    /**
     * Handles logic if configRewriter is enabled.
     * @param {!JsonObject} config
     * @param {string} configRewriterUrl
     * @return {!Promise<undefined>}
     */

  }, {
    key: "handleConfigRewriter_",
    value: function handleConfigRewriter_(config, configRewriterUrl) {
      var _this4 = this;

      assertHttpsUrl(configRewriterUrl, this.element_);
      var TAG = this.getName_();
      dev().fine(TAG, 'Rewriting config', configRewriterUrl);
      return this.handleVarGroups_(config).then(function () {
        var fetchConfig = {
          method: 'POST',
          body: config
        };

        if (_this4.element_.hasAttribute('data-credentials')) {
          fetchConfig.credentials = _this4.element_.getAttribute('data-credentials');
        }

        return Services.urlReplacementsForDoc(_this4.element_) // Pass bindings if requested
        .expandUrlAsync(configRewriterUrl).then(function (expandedUrl) {
          return Services.xhrFor(toWin(_this4.win_)).fetchJson(expandedUrl, fetchConfig);
        }).then(function (res) {
          return res.json();
        }).then(function (jsonValue) {
          _this4.config_ = _this4.mergeConfigs_(jsonValue);
          dev().fine(TAG, 'Configuration re-written', configRewriterUrl);
        }, function (err) {
          user().error(TAG, 'Error rewriting configuration: ', configRewriterUrl, err);
        });
      });
    }
    /**
     * Check if config has warning, display on console and
     * remove the property.
     * @private
     */

  }, {
    key: "checkWarningMessage_",
    value: function checkWarningMessage_() {
      if (this.config_['warningMessage']) {
        var _TAG = this.getName_();

        var type = this.element_.getAttribute('type');
        var remoteConfigUrl = this.element_.getAttribute('config');
        user().warn(_TAG, 'Warning from analytics vendor%s%s: %s', type ? ' ' + type : '', remoteConfigUrl ? ' with remote config url ' + remoteConfigUrl : '', String(this.config_['warningMessage']));
        delete this.config_['warningMessage'];
      }
    }
    /**
     * Check to see which varGroups are enabled, resolve and merge them into
     * vars object.
     * @param {!JsonObject} pubConfig
     * @return {!Promise}
     */

  }, {
    key: "handleVarGroups_",
    value: function handleVarGroups_(pubConfig) {
      var _this5 = this;

      var pubRewriterConfig = pubConfig['configRewriter'];
      var pubVarGroups = pubRewriterConfig && pubRewriterConfig['varGroups'];
      var vendorVarGroups = this.getConfigRewriter_()['varGroups'];

      if (!pubVarGroups && !vendorVarGroups) {
        return _resolvedPromise4();
      }

      if (pubVarGroups && !vendorVarGroups) {
        var _TAG2 = this.getName_();

        user().warn(_TAG2, 'This analytics provider does not currently support varGroups');
        return _resolvedPromise5();
      }

      // Create object that will later hold all the resolved variables, and any
      // intermediary objects as necessary.
      pubConfig['configRewriter'] = pubConfig['configRewriter'] || dict();
      var rewriterConfig = pubConfig['configRewriter'];
      rewriterConfig['vars'] = dict({});
      var allPromises = [];
      // Merge publisher && vendor varGroups to see what has been enabled.
      var mergedConfig = pubVarGroups || dict();
      deepMerge(mergedConfig, vendorVarGroups);
      Object.keys(mergedConfig).forEach(function (groupName) {
        var group = mergedConfig[groupName];

        if (!group['enabled']) {
          // Any varGroups must be explicitly enabled.
          return;
        }

        var groupPromise = _this5.shallowExpandObject(_this5.element_, group).then(function (expandedGroup) {
          // This is part of the user config and should not be sent.
          delete expandedGroup['enabled'];
          // Merge all groups into single `vars` object.
          Object.assign(rewriterConfig['vars'], expandedGroup);
        });

        allPromises.push(groupPromise);
      });
      return Promise.all(allPromises).then(function () {
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

  }, {
    key: "mergeConfigs_",
    value: function mergeConfigs_(rewrittenConfig) {
      // Initialize config with analytics related vars.
      var config = dict({
        'vars': {
          'requestCount': 0
        }
      });
      mergeObjects(expandConfigRequest(this.defaultConfig_), config);
      mergeObjects(expandConfigRequest(this.vendorConfig_), config,
      /* predefined-vendor */
      true);
      mergeObjects(expandConfigRequest(rewrittenConfig), config,
      /* predefined-vendor */
      true);
      return config;
    }
    /**
     * Reads configRewriter from a vendor config.
     * @return {!JsonObject}
     */

  }, {
    key: "getConfigRewriter_",
    value: function getConfigRewriter_() {
      return this.vendorConfig_['configRewriter'] || {};
    }
    /**
     * @private
     * @return {!JsonObject}
     */

  }, {
    key: "getInlineConfig_",
    value: function getInlineConfig_() {
      if (this.element_.CONFIG) {
        // If the analytics element is created by runtime, return cached config.
        return this.element_.CONFIG;
      }

      var inlineConfig = {};
      var TAG = this.getName_();

      try {
        var children = this.element_.children;

        if (children.length == 1) {
          inlineConfig = getChildJsonConfig(this.element_);
        } else if (children.length > 1) {
          user().error(TAG, 'The tag should contain only one <script> child.');
        }
      } catch (er) {
        user().error(TAG, er.message);
      }

      return (
        /** @type {!JsonObject} */
        inlineConfig
      );
    }
    /**
     * Validates transport configuration.
     * @param {!JsonObject} inlineConfig
     */

  }, {
    key: "validateTransport_",
    value: function validateTransport_(inlineConfig) {
      if (this.element_.getAttribute('type')) {
        // TODO(zhouyx, #7096) Track overwrite percentage. Prevent transport
        // overwriting
        if (inlineConfig['transport'] || this.remoteConfig_['transport']) {
          var _TAG3 = this.getName_();

          user().error(_TAG3, 'Inline or remote config should not ' + 'overwrite vendor transport settings');
        }
      }

      // Do NOT allow inline or remote config to use 'transport: iframe'
      if (inlineConfig['transport'] && inlineConfig['transport']['iframe']) {
        user().error(TAG, 'Inline configs are not allowed to specify transport iframe');

        if (!getMode().localDev || getMode().test) {
          inlineConfig['transport']['iframe'] = undefined;
        }
      }

      if (this.remoteConfig_['transport'] && this.remoteConfig_['transport']['iframe']) {
        user().error(TAG, 'Remote configs are not allowed to specify transport iframe');
        this.remoteConfig_['transport']['iframe'] = undefined;
      }
    }
    /**
     * @return {string} Returns a string to identify this tag. May not be unique
     * if the element id is not unique.
     * @private
     */

  }, {
    key: "getName_",
    value: function getName_() {
      return 'AmpAnalytics ' + (this.element_.getAttribute('id') || '<unknown id>');
    }
    /**
     * Expands all key value pairs asynchronously and returns a promise that will
     * resolve with the expanded object.
     * @param {!Element} element
     * @param {!Object} obj
     * @return {!Promise<!Object>}
     */

  }, {
    key: "shallowExpandObject",
    value: function shallowExpandObject(element, obj) {
      var expandedObj = dict();
      var keys = [];
      var expansionPromises = [];
      var urlReplacements = Services.urlReplacementsForDoc(element);
      var bindings = variableServiceForDoc(element).getMacros(element);
      Object.keys(obj).forEach(function (key) {
        keys.push(key);
        var expanded = urlReplacements.expandStringAsync(obj[key], bindings);
        expansionPromises.push(expanded);
      });
      return Promise.all(expansionPromises).then(function (expandedValues) {
        keys.forEach(function (key, i) {
          return expandedObj[key] = expandedValues[i];
        });
        return expandedObj;
      });
    }
  }]);

  return AnalyticsConfig;
}();

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
  userAssert(opt_predefinedVendorConfig || !from || !from['optout'] || from['optout'] == '_gaUserPrefs.ioo' || from['optoutElementId'] == '__gaOptOutExtension', 'optout property is only available to vendor config.');

  for (var property in from) {
    userAssert(opt_predefinedVendorConfig || property != 'iframePing', 'iframePing config is only available to vendor config.');

    // Only deal with own properties.
    if (hasOwn(from, property)) {
      if (isArray(from[property])) {
        if (!isArray(to[property])) {
          to[property] = [];
        }

        to[property] = mergeObjects(from[property], to[property], opt_predefinedVendorConfig);
      } else if (isObject(from[property])) {
        if (!isObject(to[property])) {
          to[property] = {};
        }

        to[property] = mergeObjects(from[property], to[property], opt_predefinedVendorConfig);
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

  for (var k in config['requests']) {
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
    'baseUrl': request
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
    var requestOrigin = config['requestOrigin'];

    for (var requestName in config['requests']) {
      // only add top level request origin into request if it doesn't have one
      if (!hasOwn(config['requests'][requestName], 'origin')) {
        config['requests'][requestName]['origin'] = requestOrigin;
      }
    }
  }

  return config;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyJdLCJuYW1lcyI6WyJERUZBVUxUX0NPTkZJRyIsIlNlcnZpY2VzIiwiYXNzZXJ0SHR0cHNVcmwiLCJjYWxjdWxhdGVTY3JpcHRCYXNlVXJsIiwiZGVlcE1lcmdlIiwiZGljdCIsImhhc093biIsImRldiIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiZ2V0Q2hpbGRKc29uQ29uZmlnIiwiZ2V0TW9kZSIsImlzQXJyYXkiLCJpc09iamVjdCIsImlzQ2FuYXJ5IiwidG9XaW4iLCJ2YXJpYWJsZVNlcnZpY2VGb3JEb2MiLCJUQUciLCJBbmFseXRpY3NDb25maWciLCJlbGVtZW50IiwiZWxlbWVudF8iLCJ3aW5fIiwiZGVmYXVsdENvbmZpZ18iLCJ2ZW5kb3JDb25maWdfIiwiY29uZmlnXyIsInJlbW90ZUNvbmZpZ18iLCJpc1NhbmRib3hfIiwidmFyaWFibGVTZXJ2aWNlXyIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsImhhc0F0dHJpYnV0ZSIsIlByb21pc2UiLCJhbGwiLCJmZXRjaFJlbW90ZUNvbmZpZ18iLCJmZXRjaFZlbmRvckNvbmZpZ18iLCJ0aGVuIiwicHJvY2Vzc0NvbmZpZ3NfIiwiYmluZCIsImNoZWNrV2FybmluZ01lc3NhZ2VfIiwidmVuZG9yIiwiYmFzZVVybCIsImxvY2F0aW9uIiwibG9jYWxEZXYiLCJjYW5hcnkiLCJzZWxmIiwicnR2VmVyc2lvbiIsInR5cGUiLCJnZXRBdHRyaWJ1dGUiLCJ2ZW5kb3JVcmwiLCJnZXRWZW5kb3JVcmxfIiwiZ2V0TmFtZV8iLCJmaW5lIiwieGhyRm9yIiwiZmV0Y2hKc29uIiwiYW1wQ29ycyIsInJlcyIsImpzb24iLCJqc29uVmFsdWUiLCJlcnIiLCJlcnJvciIsInJlbW90ZUNvbmZpZ1VybCIsImZldGNoQ29uZmlnIiwiY3JlZGVudGlhbHMiLCJ1cmxSZXBsYWNlbWVudHNGb3JEb2MiLCJleHBhbmRVcmxBc3luYyIsImdldE1hY3JvcyIsImV4cGFuZGVkVXJsIiwiY29uZmlnUmV3cml0ZXJVcmwiLCJnZXRDb25maWdSZXdyaXRlcl8iLCJjb25maWciLCJpbmxpbmVDb25maWciLCJnZXRJbmxpbmVDb25maWdfIiwidmFsaWRhdGVUcmFuc3BvcnRfIiwibWVyZ2VPYmplY3RzIiwibWVyZ2VDb25maWdzXyIsImhhbmRsZUNvbmZpZ1Jld3JpdGVyXyIsImhhbmRsZVZhckdyb3Vwc18iLCJtZXRob2QiLCJib2R5Iiwid2FybiIsIlN0cmluZyIsInB1YkNvbmZpZyIsInB1YlJld3JpdGVyQ29uZmlnIiwicHViVmFyR3JvdXBzIiwidmVuZG9yVmFyR3JvdXBzIiwicmV3cml0ZXJDb25maWciLCJhbGxQcm9taXNlcyIsIm1lcmdlZENvbmZpZyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiZ3JvdXBOYW1lIiwiZ3JvdXAiLCJncm91cFByb21pc2UiLCJzaGFsbG93RXhwYW5kT2JqZWN0IiwiZXhwYW5kZWRHcm91cCIsImFzc2lnbiIsInB1c2giLCJsZW5ndGgiLCJyZXdyaXR0ZW5Db25maWciLCJleHBhbmRDb25maWdSZXF1ZXN0IiwiQ09ORklHIiwiY2hpbGRyZW4iLCJlciIsIm1lc3NhZ2UiLCJ0ZXN0IiwidW5kZWZpbmVkIiwib2JqIiwiZXhwYW5kZWRPYmoiLCJleHBhbnNpb25Qcm9taXNlcyIsInVybFJlcGxhY2VtZW50cyIsImJpbmRpbmdzIiwia2V5IiwiZXhwYW5kZWQiLCJleHBhbmRTdHJpbmdBc3luYyIsImV4cGFuZGVkVmFsdWVzIiwiaSIsImZyb20iLCJ0byIsIm9wdF9wcmVkZWZpbmVkVmVuZG9yQ29uZmlnIiwicHJvcGVydHkiLCJrIiwiZXhwYW5kUmVxdWVzdFN0ciIsImhhbmRsZVRvcExldmVsQXR0cmlidXRlc18iLCJyZXF1ZXN0IiwicmVxdWVzdE9yaWdpbiIsInJlcXVlc3ROYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFF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QXFCb0QsQ0FBckIsQ0FBVixFQUFtQztBQUNqQ3BELE1BQUFBLE1BQU0sQ0FBQyxVQUFELENBQU4sQ0FBbUJvRCxDQUFuQixJQUF3QkMsZ0JBQWdCLENBQUNyRCxNQUFNLENBQUMsVUFBRCxDQUFOLENBQW1Cb0QsQ0FBbkIsQ0FBRCxDQUF4QztBQUNEO0FBQ0Y7O0FBRUQsU0FBT0UseUJBQXlCLENBQUN0RCxNQUFELENBQWhDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNxRCxnQkFBVCxDQUEwQkUsT0FBMUIsRUFBbUM7QUFDakMsTUFBSS9HLFFBQVEsQ0FBQytHLE9BQUQsQ0FBWixFQUF1QjtBQUNyQixXQUFPQSxPQUFQO0FBQ0Q7O0FBQ0QsU0FBTztBQUNMLGVBQVdBO0FBRE4sR0FBUDtBQUdEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTRCx5QkFBVCxDQUFtQ3RELE1BQW5DLEVBQTJDO0FBQ3pDO0FBQ0EsTUFBSS9ELE1BQU0sQ0FBQytELE1BQUQsRUFBUyxVQUFULENBQU4sSUFBOEIvRCxNQUFNLENBQUMrRCxNQUFELEVBQVMsZUFBVCxDQUF4QyxFQUFtRTtBQUNqRSxRQUFNd0QsYUFBYSxHQUFHeEQsTUFBTSxDQUFDLGVBQUQsQ0FBNUI7O0FBRUEsU0FBSyxJQUFNeUQsV0FBWCxJQUEwQnpELE1BQU0sQ0FBQyxVQUFELENBQWhDLEVBQThDO0FBQzVDO0FBQ0EsVUFBSSxDQUFDL0QsTUFBTSxDQUFDK0QsTUFBTSxDQUFDLFVBQUQsQ0FBTixDQUFtQnlELFdBQW5CLENBQUQsRUFBa0MsUUFBbEMsQ0FBWCxFQUF3RDtBQUN0RHpELFFBQUFBLE1BQU0sQ0FBQyxVQUFELENBQU4sQ0FBbUJ5RCxXQUFuQixFQUFnQyxRQUFoQyxJQUE0Q0QsYUFBNUM7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQsU0FBT3hELE1BQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0RFRkFVTFRfQ09ORklHfSBmcm9tICcuL2RlZmF1bHQtY29uZmlnJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7YXNzZXJ0SHR0cHNVcmx9IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuaW1wb3J0IHtjYWxjdWxhdGVTY3JpcHRCYXNlVXJsfSBmcm9tICcjc2VydmljZS9leHRlbnNpb24tc2NyaXB0JztcbmltcG9ydCB7ZGVlcE1lcmdlLCBkaWN0LCBoYXNPd259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2RldiwgdXNlciwgdXNlckFzc2VydH0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2dldENoaWxkSnNvbkNvbmZpZ30gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtpc0FycmF5LCBpc09iamVjdH0gZnJvbSAnI2NvcmUvdHlwZXMnO1xuaW1wb3J0IHtpc0NhbmFyeX0gZnJvbSAnI2V4cGVyaW1lbnRzJztcblxuaW1wb3J0IHt0b1dpbn0gZnJvbSAnI2NvcmUvd2luZG93JztcbmltcG9ydCB7dmFyaWFibGVTZXJ2aWNlRm9yRG9jfSBmcm9tICcuL3ZhcmlhYmxlcyc7XG5cbmNvbnN0IFRBRyA9ICdhbXAtYW5hbHl0aWNzL2NvbmZpZyc7XG5cbmV4cG9ydCBjbGFzcyBBbmFseXRpY3NDb25maWcge1xuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIC8qKiBAcHJpdmF0ZSB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG5cbiAgICAvKiogQHByaXZhdGUgez9XaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdCB7IUpzb25PYmplY3R9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRlZmF1bHRDb25maWdfID0gREVGQVVMVF9DT05GSUcgfHwgZGljdCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHshSnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLnZlbmRvckNvbmZpZ18gPSBkaWN0KCk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7SnNvbk9iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLmNvbmZpZ18gPSBkaWN0KCk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7SnNvbk9iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLnJlbW90ZUNvbmZpZ18gPSBkaWN0KCk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc1NhbmRib3hfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgeyEuL3ZhcmlhYmxlcy5WYXJpYWJsZVNlcnZpY2V9ICovXG4gICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfID0gdmFyaWFibGVTZXJ2aWNlRm9yRG9jKGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlPEpzb25PYmplY3Q+fVxuICAgKi9cbiAgbG9hZENvbmZpZygpIHtcbiAgICB0aGlzLndpbl8gPSB0aGlzLmVsZW1lbnRfLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XG4gICAgdGhpcy5pc1NhbmRib3hfID0gdGhpcy5lbGVtZW50Xy5oYXNBdHRyaWJ1dGUoJ3NhbmRib3gnKTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChbdGhpcy5mZXRjaFJlbW90ZUNvbmZpZ18oKSwgdGhpcy5mZXRjaFZlbmRvckNvbmZpZ18oKV0pXG4gICAgICAudGhlbih0aGlzLnByb2Nlc3NDb25maWdzXy5iaW5kKHRoaXMpKVxuICAgICAgLnRoZW4odGhpcy5jaGVja1dhcm5pbmdNZXNzYWdlXy5iaW5kKHRoaXMpKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5jb25maWdfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIHRoZSBVUkwgd2hlcmUgdGhlIGdpdmVuIHZlbmRvciBjb25maWcgaXMgbG9jYXRlZFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmVuZG9yIHRoZSB2ZW5kb3IgbmFtZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBVUkwgdG8gcmVxdWVzdCB0aGUgdmVuZG9yIGNvbmZpZyBmaWxlIGZyb21cbiAgICovXG4gIGdldFZlbmRvclVybF8odmVuZG9yKSB7XG4gICAgY29uc3QgYmFzZVVybCA9IGNhbGN1bGF0ZVNjcmlwdEJhc2VVcmwoXG4gICAgICB0aGlzLndpbl8ubG9jYXRpb24sXG4gICAgICBnZXRNb2RlKCkubG9jYWxEZXZcbiAgICApO1xuICAgIC8vIGJnIGhhcyBhIHNwZWNpYWwgY2FuYXJ5IGNvbmZpZ1xuICAgIGNvbnN0IGNhbmFyeSA9IHZlbmRvciA9PT0gJ2JnJyAmJiBpc0NhbmFyeShzZWxmKSA/ICcuY2FuYXJ5JyA6ICcnO1xuICAgIHJldHVybiBgJHtiYXNlVXJsfS9ydHYvJHtcbiAgICAgIGdldE1vZGUoKS5ydHZWZXJzaW9uXG4gICAgfS92MC9hbmFseXRpY3MtdmVuZG9ycy8ke3ZlbmRvcn0ke2NhbmFyeX0uanNvbmA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHZlbmRvciBjb25maWcgaXMgcmVhZHkgKG9yXG4gICAqIGltbWVkaWF0ZWx5IGlmIG5vIHZlbmRvciBjb25maWcgaXMgc3BlY2lmaWVkKVxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTx1bmRlZmluZWQ+fVxuICAgKi9cbiAgZmV0Y2hWZW5kb3JDb25maWdfKCkge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgndHlwZScpO1xuICAgIGlmICghdHlwZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IHZlbmRvclVybCA9IHRoaXMuZ2V0VmVuZG9yVXJsXyh0eXBlKTtcblxuICAgIGNvbnN0IFRBRyA9IHRoaXMuZ2V0TmFtZV8oKTtcbiAgICBkZXYoKS5maW5lKFRBRywgJ0ZldGNoaW5nIHZlbmRvciBjb25maWcnLCB2ZW5kb3JVcmwpO1xuXG4gICAgcmV0dXJuIFNlcnZpY2VzLnhockZvcih0b1dpbih0aGlzLndpbl8pKVxuICAgICAgLmZldGNoSnNvbih2ZW5kb3JVcmwsIHthbXBDb3JzOiBmYWxzZX0pXG4gICAgICAudGhlbigocmVzKSA9PiByZXMuanNvbigpKVxuICAgICAgLnRoZW4oXG4gICAgICAgIChqc29uVmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnZlbmRvckNvbmZpZ18gPSBqc29uVmFsdWUgfHwgZGljdCgpO1xuICAgICAgICAgIGRldigpLmZpbmUoVEFHLCAnVmVuZG9yIGNvbmZpZyBsb2FkZWQgZm9yICcgKyB0eXBlLCBqc29uVmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICAoZXJyKSA9PiB7XG4gICAgICAgICAgdXNlcigpLmVycm9yKFRBRywgJ0Vycm9yIGxvYWRpbmcgdmVuZG9yIGNvbmZpZzogJywgdmVuZG9yVXJsLCBlcnIpO1xuICAgICAgICB9XG4gICAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiByZW1vdGUgY29uZmlnIGlzIHJlYWR5IChvclxuICAgKiBpbW1lZGlhdGVseSBpZiBubyByZW1vdGUgY29uZmlnIGlzIHNwZWNpZmllZC4pXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHVuZGVmaW5lZD59XG4gICAqL1xuICBmZXRjaFJlbW90ZUNvbmZpZ18oKSB7XG4gICAgbGV0IHJlbW90ZUNvbmZpZ1VybCA9IHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCdjb25maWcnKTtcbiAgICBpZiAoIXJlbW90ZUNvbmZpZ1VybCB8fCB0aGlzLmlzU2FuZGJveF8pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgYXNzZXJ0SHR0cHNVcmwocmVtb3RlQ29uZmlnVXJsLCB0aGlzLmVsZW1lbnRfKTtcbiAgICBjb25zdCBUQUcgPSB0aGlzLmdldE5hbWVfKCk7XG4gICAgZGV2KCkuZmluZShUQUcsICdGZXRjaGluZyByZW1vdGUgY29uZmlnJywgcmVtb3RlQ29uZmlnVXJsKTtcbiAgICBjb25zdCBmZXRjaENvbmZpZyA9IHt9O1xuICAgIGlmICh0aGlzLmVsZW1lbnRfLmhhc0F0dHJpYnV0ZSgnZGF0YS1jcmVkZW50aWFscycpKSB7XG4gICAgICBmZXRjaENvbmZpZy5jcmVkZW50aWFscyA9IHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCdkYXRhLWNyZWRlbnRpYWxzJyk7XG4gICAgfVxuICAgIHJldHVybiBTZXJ2aWNlcy51cmxSZXBsYWNlbWVudHNGb3JEb2ModGhpcy5lbGVtZW50XylcbiAgICAgIC5leHBhbmRVcmxBc3luYyhcbiAgICAgICAgcmVtb3RlQ29uZmlnVXJsLFxuICAgICAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8uZ2V0TWFjcm9zKHRoaXMuZWxlbWVudF8pXG4gICAgICApXG4gICAgICAudGhlbigoZXhwYW5kZWRVcmwpID0+IHtcbiAgICAgICAgcmVtb3RlQ29uZmlnVXJsID0gZXhwYW5kZWRVcmw7XG4gICAgICAgIHJldHVybiBTZXJ2aWNlcy54aHJGb3IodG9XaW4odGhpcy53aW5fKSkuZmV0Y2hKc29uKFxuICAgICAgICAgIHJlbW90ZUNvbmZpZ1VybCxcbiAgICAgICAgICBmZXRjaENvbmZpZ1xuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChyZXMpID0+IHJlcy5qc29uKCkpXG4gICAgICAudGhlbihcbiAgICAgICAgKGpzb25WYWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucmVtb3RlQ29uZmlnXyA9IGpzb25WYWx1ZTtcbiAgICAgICAgICBkZXYoKS5maW5lKFRBRywgJ1JlbW90ZSBjb25maWcgbG9hZGVkJywgcmVtb3RlQ29uZmlnVXJsKTtcbiAgICAgICAgfSxcbiAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICdFcnJvciBsb2FkaW5nIHJlbW90ZSBjb25maWc6ICcsXG4gICAgICAgICAgICByZW1vdGVDb25maWdVcmwsXG4gICAgICAgICAgICBlcnJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBjb25maWd1cmF0aW9uIGlzIHJlLXdyaXR0ZW4gaWZcbiAgICogY29uZmlnUmV3cml0ZXIgaXMgY29uZmlndXJlZCBieSBhIHZlbmRvci5cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7IVByb21pc2U8dW5kZWZpbmVkPn1cbiAgICovXG4gIHByb2Nlc3NDb25maWdzXygpIHtcbiAgICBjb25zdCBjb25maWdSZXdyaXRlclVybCA9IHRoaXMuZ2V0Q29uZmlnUmV3cml0ZXJfKClbJ3VybCddO1xuXG4gICAgY29uc3QgY29uZmlnID0gZGljdCh7fSk7XG4gICAgY29uc3QgaW5saW5lQ29uZmlnID0gdGhpcy5nZXRJbmxpbmVDb25maWdfKCk7XG4gICAgdGhpcy52YWxpZGF0ZVRyYW5zcG9ydF8oaW5saW5lQ29uZmlnKTtcbiAgICBtZXJnZU9iamVjdHMoaW5saW5lQ29uZmlnLCBjb25maWcpO1xuICAgIG1lcmdlT2JqZWN0cyh0aGlzLnJlbW90ZUNvbmZpZ18sIGNvbmZpZyk7XG5cbiAgICBpZiAoIWNvbmZpZ1Jld3JpdGVyVXJsIHx8IHRoaXMuaXNTYW5kYm94Xykge1xuICAgICAgdGhpcy5jb25maWdfID0gdGhpcy5tZXJnZUNvbmZpZ3NfKGNvbmZpZyk7XG4gICAgICAvLyB1c2UgZGVmYXVsdCBjb25maWd1cmF0aW9uIG1lcmdlLlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmhhbmRsZUNvbmZpZ1Jld3JpdGVyXyhjb25maWcsIGNvbmZpZ1Jld3JpdGVyVXJsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGxvZ2ljIGlmIGNvbmZpZ1Jld3JpdGVyIGlzIGVuYWJsZWQuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gY29uZmlnUmV3cml0ZXJVcmxcbiAgICogQHJldHVybiB7IVByb21pc2U8dW5kZWZpbmVkPn1cbiAgICovXG4gIGhhbmRsZUNvbmZpZ1Jld3JpdGVyXyhjb25maWcsIGNvbmZpZ1Jld3JpdGVyVXJsKSB7XG4gICAgYXNzZXJ0SHR0cHNVcmwoY29uZmlnUmV3cml0ZXJVcmwsIHRoaXMuZWxlbWVudF8pO1xuICAgIGNvbnN0IFRBRyA9IHRoaXMuZ2V0TmFtZV8oKTtcbiAgICBkZXYoKS5maW5lKFRBRywgJ1Jld3JpdGluZyBjb25maWcnLCBjb25maWdSZXdyaXRlclVybCk7XG5cbiAgICByZXR1cm4gdGhpcy5oYW5kbGVWYXJHcm91cHNfKGNvbmZpZykudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCBmZXRjaENvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGNvbmZpZyxcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5lbGVtZW50Xy5oYXNBdHRyaWJ1dGUoJ2RhdGEtY3JlZGVudGlhbHMnKSkge1xuICAgICAgICBmZXRjaENvbmZpZy5jcmVkZW50aWFscyA9XG4gICAgICAgICAgdGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ2RhdGEtY3JlZGVudGlhbHMnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFNlcnZpY2VzLnVybFJlcGxhY2VtZW50c0ZvckRvYyh0aGlzLmVsZW1lbnRfKVxuICAgICAgICAgIC8vIFBhc3MgYmluZGluZ3MgaWYgcmVxdWVzdGVkXG4gICAgICAgICAgLmV4cGFuZFVybEFzeW5jKGNvbmZpZ1Jld3JpdGVyVXJsKVxuICAgICAgICAgIC50aGVuKChleHBhbmRlZFVybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFNlcnZpY2VzLnhockZvcih0b1dpbih0aGlzLndpbl8pKS5mZXRjaEpzb24oXG4gICAgICAgICAgICAgIGV4cGFuZGVkVXJsLFxuICAgICAgICAgICAgICBmZXRjaENvbmZpZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKChyZXMpID0+IHJlcy5qc29uKCkpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoanNvblZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuY29uZmlnXyA9IHRoaXMubWVyZ2VDb25maWdzXyhqc29uVmFsdWUpO1xuICAgICAgICAgICAgICBkZXYoKS5maW5lKFRBRywgJ0NvbmZpZ3VyYXRpb24gcmUtd3JpdHRlbicsIGNvbmZpZ1Jld3JpdGVyVXJsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICAgICAgICBUQUcsXG4gICAgICAgICAgICAgICAgJ0Vycm9yIHJld3JpdGluZyBjb25maWd1cmF0aW9uOiAnLFxuICAgICAgICAgICAgICAgIGNvbmZpZ1Jld3JpdGVyVXJsLFxuICAgICAgICAgICAgICAgIGVyclxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgY29uZmlnIGhhcyB3YXJuaW5nLCBkaXNwbGF5IG9uIGNvbnNvbGUgYW5kXG4gICAqIHJlbW92ZSB0aGUgcHJvcGVydHkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjaGVja1dhcm5pbmdNZXNzYWdlXygpIHtcbiAgICBpZiAodGhpcy5jb25maWdfWyd3YXJuaW5nTWVzc2FnZSddKSB7XG4gICAgICBjb25zdCBUQUcgPSB0aGlzLmdldE5hbWVfKCk7XG4gICAgICBjb25zdCB0eXBlID0gdGhpcy5lbGVtZW50Xy5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgIGNvbnN0IHJlbW90ZUNvbmZpZ1VybCA9IHRoaXMuZWxlbWVudF8uZ2V0QXR0cmlidXRlKCdjb25maWcnKTtcblxuICAgICAgdXNlcigpLndhcm4oXG4gICAgICAgIFRBRyxcbiAgICAgICAgJ1dhcm5pbmcgZnJvbSBhbmFseXRpY3MgdmVuZG9yJXMlczogJXMnLFxuICAgICAgICB0eXBlID8gJyAnICsgdHlwZSA6ICcnLFxuICAgICAgICByZW1vdGVDb25maWdVcmwgPyAnIHdpdGggcmVtb3RlIGNvbmZpZyB1cmwgJyArIHJlbW90ZUNvbmZpZ1VybCA6ICcnLFxuICAgICAgICBTdHJpbmcodGhpcy5jb25maWdfWyd3YXJuaW5nTWVzc2FnZSddKVxuICAgICAgKTtcbiAgICAgIGRlbGV0ZSB0aGlzLmNvbmZpZ19bJ3dhcm5pbmdNZXNzYWdlJ107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHRvIHNlZSB3aGljaCB2YXJHcm91cHMgYXJlIGVuYWJsZWQsIHJlc29sdmUgYW5kIG1lcmdlIHRoZW0gaW50b1xuICAgKiB2YXJzIG9iamVjdC5cbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gcHViQ29uZmlnXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgaGFuZGxlVmFyR3JvdXBzXyhwdWJDb25maWcpIHtcbiAgICBjb25zdCBwdWJSZXdyaXRlckNvbmZpZyA9IHB1YkNvbmZpZ1snY29uZmlnUmV3cml0ZXInXTtcbiAgICBjb25zdCBwdWJWYXJHcm91cHMgPSBwdWJSZXdyaXRlckNvbmZpZyAmJiBwdWJSZXdyaXRlckNvbmZpZ1sndmFyR3JvdXBzJ107XG4gICAgY29uc3QgdmVuZG9yVmFyR3JvdXBzID0gdGhpcy5nZXRDb25maWdSZXdyaXRlcl8oKVsndmFyR3JvdXBzJ107XG5cbiAgICBpZiAoIXB1YlZhckdyb3VwcyAmJiAhdmVuZG9yVmFyR3JvdXBzKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgaWYgKHB1YlZhckdyb3VwcyAmJiAhdmVuZG9yVmFyR3JvdXBzKSB7XG4gICAgICBjb25zdCBUQUcgPSB0aGlzLmdldE5hbWVfKCk7XG4gICAgICB1c2VyKCkud2FybihcbiAgICAgICAgVEFHLFxuICAgICAgICAnVGhpcyBhbmFseXRpY3MgcHJvdmlkZXIgZG9lcyBub3QgY3VycmVudGx5IHN1cHBvcnQgdmFyR3JvdXBzJ1xuICAgICAgKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgb2JqZWN0IHRoYXQgd2lsbCBsYXRlciBob2xkIGFsbCB0aGUgcmVzb2x2ZWQgdmFyaWFibGVzLCBhbmQgYW55XG4gICAgLy8gaW50ZXJtZWRpYXJ5IG9iamVjdHMgYXMgbmVjZXNzYXJ5LlxuICAgIHB1YkNvbmZpZ1snY29uZmlnUmV3cml0ZXInXSA9IHB1YkNvbmZpZ1snY29uZmlnUmV3cml0ZXInXSB8fCBkaWN0KCk7XG4gICAgY29uc3QgcmV3cml0ZXJDb25maWcgPSBwdWJDb25maWdbJ2NvbmZpZ1Jld3JpdGVyJ107XG4gICAgcmV3cml0ZXJDb25maWdbJ3ZhcnMnXSA9IGRpY3Qoe30pO1xuXG4gICAgY29uc3QgYWxsUHJvbWlzZXMgPSBbXTtcbiAgICAvLyBNZXJnZSBwdWJsaXNoZXIgJiYgdmVuZG9yIHZhckdyb3VwcyB0byBzZWUgd2hhdCBoYXMgYmVlbiBlbmFibGVkLlxuICAgIGNvbnN0IG1lcmdlZENvbmZpZyA9IHB1YlZhckdyb3VwcyB8fCBkaWN0KCk7XG4gICAgZGVlcE1lcmdlKG1lcmdlZENvbmZpZywgdmVuZG9yVmFyR3JvdXBzKTtcblxuICAgIE9iamVjdC5rZXlzKG1lcmdlZENvbmZpZykuZm9yRWFjaCgoZ3JvdXBOYW1lKSA9PiB7XG4gICAgICBjb25zdCBncm91cCA9IG1lcmdlZENvbmZpZ1tncm91cE5hbWVdO1xuICAgICAgaWYgKCFncm91cFsnZW5hYmxlZCddKSB7XG4gICAgICAgIC8vIEFueSB2YXJHcm91cHMgbXVzdCBiZSBleHBsaWNpdGx5IGVuYWJsZWQuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZ3JvdXBQcm9taXNlID0gdGhpcy5zaGFsbG93RXhwYW5kT2JqZWN0KHRoaXMuZWxlbWVudF8sIGdyb3VwKS50aGVuKFxuICAgICAgICAoZXhwYW5kZWRHcm91cCkgPT4ge1xuICAgICAgICAgIC8vIFRoaXMgaXMgcGFydCBvZiB0aGUgdXNlciBjb25maWcgYW5kIHNob3VsZCBub3QgYmUgc2VudC5cbiAgICAgICAgICBkZWxldGUgZXhwYW5kZWRHcm91cFsnZW5hYmxlZCddO1xuICAgICAgICAgIC8vIE1lcmdlIGFsbCBncm91cHMgaW50byBzaW5nbGUgYHZhcnNgIG9iamVjdC5cbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJld3JpdGVyQ29uZmlnWyd2YXJzJ10sIGV4cGFuZGVkR3JvdXApO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgYWxsUHJvbWlzZXMucHVzaChncm91cFByb21pc2UpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKGFsbFByb21pc2VzKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIERvbid0IHNlbmQgYW4gZW1wdHkgdmFycyBwYXlsb2FkLlxuICAgICAgaWYgKCFPYmplY3Qua2V5cyhyZXdyaXRlckNvbmZpZ1sndmFycyddKS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGRlbGV0ZSBwdWJDb25maWdbJ2NvbmZpZ1Jld3JpdGVyJ107XG4gICAgICB9XG4gICAgICAvLyBEb24ndCBzZW5kIHZhckdyb3VwcyBpbiBwYXlsb2FkIHRvIGNvbmZpZ1Jld3JpdGVyIGVuZHBvaW50LlxuICAgICAgcHViVmFyR3JvdXBzICYmIGRlbGV0ZSByZXdyaXRlckNvbmZpZ1sndmFyR3JvdXBzJ107XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHZhcmlvdXMgc291cmNlcyBvZiBjb25maWdzIGFuZCBzdG9yZXMgdGhlbSBpbiBhIG1lbWJlciB2YXJpYWJsZS5cbiAgICpcbiAgICogT3JkZXIgb2YgcHJlY2VkZW5jZSBmb3IgY29uZmlncyBmcm9tIGhpZ2hlc3QgdG8gbG93ZXN0OlxuICAgKiAtIFJlbW90ZSBjb25maWc6IHNwZWNpZmllZCB0aHJvdWdoIGFuIGF0dHJpYnV0ZSBvZiB0aGUgdGFnLlxuICAgKiAtIElubGluZSBjb25maWc6IHNwZWNpZmllZCBpbnNpemUgdGhlIHRhZy5cbiAgICogLSBQcmVkZWZpbmVkIFZlbmRvciBjb25maWc6IERlZmluZWQgYXMgcGFydCBvZiB0aGUgcGxhdGZvcm0uXG4gICAqIC0gRGVmYXVsdCBjb25maWc6IEJ1aWx0LWluIGNvbmZpZyBzaGFyZWQgYnkgYWxsIGFtcC1hbmFseXRpY3MgdGFncy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gcmV3cml0dGVuQ29uZmlnXG4gICAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICAgKi9cbiAgbWVyZ2VDb25maWdzXyhyZXdyaXR0ZW5Db25maWcpIHtcbiAgICAvLyBJbml0aWFsaXplIGNvbmZpZyB3aXRoIGFuYWx5dGljcyByZWxhdGVkIHZhcnMuXG4gICAgY29uc3QgY29uZmlnID0gZGljdCh7XG4gICAgICAndmFycyc6IHtcbiAgICAgICAgJ3JlcXVlc3RDb3VudCc6IDAsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIG1lcmdlT2JqZWN0cyhleHBhbmRDb25maWdSZXF1ZXN0KHRoaXMuZGVmYXVsdENvbmZpZ18pLCBjb25maWcpO1xuICAgIG1lcmdlT2JqZWN0cyhcbiAgICAgIGV4cGFuZENvbmZpZ1JlcXVlc3QodGhpcy52ZW5kb3JDb25maWdfKSxcbiAgICAgIGNvbmZpZyxcbiAgICAgIC8qIHByZWRlZmluZWQtdmVuZG9yICovIHRydWVcbiAgICApO1xuICAgIG1lcmdlT2JqZWN0cyhcbiAgICAgIGV4cGFuZENvbmZpZ1JlcXVlc3QocmV3cml0dGVuQ29uZmlnKSxcbiAgICAgIGNvbmZpZyxcbiAgICAgIC8qIHByZWRlZmluZWQtdmVuZG9yICovIHRydWVcbiAgICApO1xuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgY29uZmlnUmV3cml0ZXIgZnJvbSBhIHZlbmRvciBjb25maWcuXG4gICAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICAgKi9cbiAgZ2V0Q29uZmlnUmV3cml0ZXJfKCkge1xuICAgIHJldHVybiB0aGlzLnZlbmRvckNvbmZpZ19bJ2NvbmZpZ1Jld3JpdGVyJ10gfHwge307XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7IUpzb25PYmplY3R9XG4gICAqL1xuICBnZXRJbmxpbmVDb25maWdfKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfLkNPTkZJRykge1xuICAgICAgLy8gSWYgdGhlIGFuYWx5dGljcyBlbGVtZW50IGlzIGNyZWF0ZWQgYnkgcnVudGltZSwgcmV0dXJuIGNhY2hlZCBjb25maWcuXG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50Xy5DT05GSUc7XG4gICAgfVxuICAgIGxldCBpbmxpbmVDb25maWcgPSB7fTtcbiAgICBjb25zdCBUQUcgPSB0aGlzLmdldE5hbWVfKCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHtjaGlsZHJlbn0gPSB0aGlzLmVsZW1lbnRfO1xuICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIGlubGluZUNvbmZpZyA9IGdldENoaWxkSnNvbkNvbmZpZyh0aGlzLmVsZW1lbnRfKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnVGhlIHRhZyBzaG91bGQgY29udGFpbiBvbmx5IG9uZSA8c2NyaXB0PiBjaGlsZC4nKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcikge1xuICAgICAgdXNlcigpLmVycm9yKFRBRywgZXIubWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoaW5saW5lQ29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgdHJhbnNwb3J0IGNvbmZpZ3VyYXRpb24uXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGlubGluZUNvbmZpZ1xuICAgKi9cbiAgdmFsaWRhdGVUcmFuc3BvcnRfKGlubGluZUNvbmZpZykge1xuICAgIGlmICh0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICAvLyBUT0RPKHpob3V5eCwgIzcwOTYpIFRyYWNrIG92ZXJ3cml0ZSBwZXJjZW50YWdlLiBQcmV2ZW50IHRyYW5zcG9ydFxuICAgICAgLy8gb3ZlcndyaXRpbmdcbiAgICAgIGlmIChpbmxpbmVDb25maWdbJ3RyYW5zcG9ydCddIHx8IHRoaXMucmVtb3RlQ29uZmlnX1sndHJhbnNwb3J0J10pIHtcbiAgICAgICAgY29uc3QgVEFHID0gdGhpcy5nZXROYW1lXygpO1xuICAgICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgICAgVEFHLFxuICAgICAgICAgICdJbmxpbmUgb3IgcmVtb3RlIGNvbmZpZyBzaG91bGQgbm90ICcgK1xuICAgICAgICAgICAgJ292ZXJ3cml0ZSB2ZW5kb3IgdHJhbnNwb3J0IHNldHRpbmdzJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERvIE5PVCBhbGxvdyBpbmxpbmUgb3IgcmVtb3RlIGNvbmZpZyB0byB1c2UgJ3RyYW5zcG9ydDogaWZyYW1lJ1xuICAgIGlmIChpbmxpbmVDb25maWdbJ3RyYW5zcG9ydCddICYmIGlubGluZUNvbmZpZ1sndHJhbnNwb3J0J11bJ2lmcmFtZSddKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgIFRBRyxcbiAgICAgICAgJ0lubGluZSBjb25maWdzIGFyZSBub3QgYWxsb3dlZCB0byBzcGVjaWZ5IHRyYW5zcG9ydCBpZnJhbWUnXG4gICAgICApO1xuICAgICAgaWYgKCFnZXRNb2RlKCkubG9jYWxEZXYgfHwgZ2V0TW9kZSgpLnRlc3QpIHtcbiAgICAgICAgaW5saW5lQ29uZmlnWyd0cmFuc3BvcnQnXVsnaWZyYW1lJ10gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy5yZW1vdGVDb25maWdfWyd0cmFuc3BvcnQnXSAmJlxuICAgICAgdGhpcy5yZW1vdGVDb25maWdfWyd0cmFuc3BvcnQnXVsnaWZyYW1lJ11cbiAgICApIHtcbiAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgVEFHLFxuICAgICAgICAnUmVtb3RlIGNvbmZpZ3MgYXJlIG5vdCBhbGxvd2VkIHRvIHNwZWNpZnkgdHJhbnNwb3J0IGlmcmFtZSdcbiAgICAgICk7XG4gICAgICB0aGlzLnJlbW90ZUNvbmZpZ19bJ3RyYW5zcG9ydCddWydpZnJhbWUnXSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSBSZXR1cm5zIGEgc3RyaW5nIHRvIGlkZW50aWZ5IHRoaXMgdGFnLiBNYXkgbm90IGJlIHVuaXF1ZVxuICAgKiBpZiB0aGUgZWxlbWVudCBpZCBpcyBub3QgdW5pcXVlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0TmFtZV8oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICdBbXBBbmFseXRpY3MgJyArICh0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgnaWQnKSB8fCAnPHVua25vd24gaWQ+JylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIGtleSB2YWx1ZSBwYWlycyBhc3luY2hyb25vdXNseSBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsXG4gICAqIHJlc29sdmUgd2l0aCB0aGUgZXhwYW5kZWQgb2JqZWN0LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IU9iamVjdH0gb2JqXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFPYmplY3Q+fVxuICAgKi9cbiAgc2hhbGxvd0V4cGFuZE9iamVjdChlbGVtZW50LCBvYmopIHtcbiAgICBjb25zdCBleHBhbmRlZE9iaiA9IGRpY3QoKTtcbiAgICBjb25zdCBrZXlzID0gW107XG4gICAgY29uc3QgZXhwYW5zaW9uUHJvbWlzZXMgPSBbXTtcblxuICAgIGNvbnN0IHVybFJlcGxhY2VtZW50cyA9IFNlcnZpY2VzLnVybFJlcGxhY2VtZW50c0ZvckRvYyhlbGVtZW50KTtcbiAgICBjb25zdCBiaW5kaW5ncyA9IHZhcmlhYmxlU2VydmljZUZvckRvYyhlbGVtZW50KS5nZXRNYWNyb3MoZWxlbWVudCk7XG5cbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICBjb25zdCBleHBhbmRlZCA9IHVybFJlcGxhY2VtZW50cy5leHBhbmRTdHJpbmdBc3luYyhvYmpba2V5XSwgYmluZGluZ3MpO1xuICAgICAgZXhwYW5zaW9uUHJvbWlzZXMucHVzaChleHBhbmRlZCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoZXhwYW5zaW9uUHJvbWlzZXMpLnRoZW4oKGV4cGFuZGVkVmFsdWVzKSA9PiB7XG4gICAgICBrZXlzLmZvckVhY2goKGtleSwgaSkgPT4gKGV4cGFuZGVkT2JqW2tleV0gPSBleHBhbmRlZFZhbHVlc1tpXSkpO1xuICAgICAgcmV0dXJuIGV4cGFuZGVkT2JqO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogTWVyZ2VzIHR3byBvYmplY3RzLiBJZiB0aGUgdmFsdWUgaXMgYXJyYXkgb3IgcGxhaW4gb2JqZWN0LCB0aGUgdmFsdWVzIGFyZVxuICogbWVyZ2VkIG90aGVyd2lzZSB0aGUgdmFsdWUgaXMgb3ZlcndyaXR0ZW4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IGZyb20gT2JqZWN0IG9yIGFycmF5IHRvIG1lcmdlIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSB0byBPYmplY3Qgb3IgQXJyYXkgdG8gbWVyZ2UgaW50b1xuICogQHBhcmFtIHtib29sZWFuPX0gb3B0X3ByZWRlZmluZWRWZW5kb3JDb25maWdcbiAqIEByZXR1cm4geyp9IFRPRE8oIzIzNTgyKTogU3BlY2lmeSByZXR1cm4gdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPYmplY3RzKGZyb20sIHRvLCBvcHRfcHJlZGVmaW5lZFZlbmRvckNvbmZpZykge1xuICBpZiAodG8gPT09IG51bGwgfHwgdG8gPT09IHVuZGVmaW5lZCkge1xuICAgIHRvID0ge307XG4gIH1cblxuICAvLyBBc3NlcnQgdGhhdCBvcHRvdXRzIGFyZSBhbGxvd2VkIG9ubHkgaW4gcHJlZGVmaW5lZCB2ZW5kb3IgY29uZmlncy5cbiAgLy8gVGhlIGxhc3QgZXhwcmVzc2lvbiBhZGRzIGFuIGV4Y2VwdGlvbiBvZiBrbm93biwgc2FmZSBvcHRvdXQgZnVuY3Rpb25cbiAgLy8gdGhhdCBpcyBhbHJlYWR5IGJlaW5nIHVzZWQgaW4gdGhlIHdpbGQuXG4gIHVzZXJBc3NlcnQoXG4gICAgb3B0X3ByZWRlZmluZWRWZW5kb3JDb25maWcgfHxcbiAgICAgICFmcm9tIHx8XG4gICAgICAhZnJvbVsnb3B0b3V0J10gfHxcbiAgICAgIGZyb21bJ29wdG91dCddID09ICdfZ2FVc2VyUHJlZnMuaW9vJyB8fFxuICAgICAgZnJvbVsnb3B0b3V0RWxlbWVudElkJ10gPT0gJ19fZ2FPcHRPdXRFeHRlbnNpb24nLFxuICAgICdvcHRvdXQgcHJvcGVydHkgaXMgb25seSBhdmFpbGFibGUgdG8gdmVuZG9yIGNvbmZpZy4nXG4gICk7XG5cbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBmcm9tKSB7XG4gICAgdXNlckFzc2VydChcbiAgICAgIG9wdF9wcmVkZWZpbmVkVmVuZG9yQ29uZmlnIHx8IHByb3BlcnR5ICE9ICdpZnJhbWVQaW5nJyxcbiAgICAgICdpZnJhbWVQaW5nIGNvbmZpZyBpcyBvbmx5IGF2YWlsYWJsZSB0byB2ZW5kb3IgY29uZmlnLidcbiAgICApO1xuICAgIC8vIE9ubHkgZGVhbCB3aXRoIG93biBwcm9wZXJ0aWVzLlxuICAgIGlmIChoYXNPd24oZnJvbSwgcHJvcGVydHkpKSB7XG4gICAgICBpZiAoaXNBcnJheShmcm9tW3Byb3BlcnR5XSkpIHtcbiAgICAgICAgaWYgKCFpc0FycmF5KHRvW3Byb3BlcnR5XSkpIHtcbiAgICAgICAgICB0b1twcm9wZXJ0eV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0b1twcm9wZXJ0eV0gPSBtZXJnZU9iamVjdHMoXG4gICAgICAgICAgZnJvbVtwcm9wZXJ0eV0sXG4gICAgICAgICAgdG9bcHJvcGVydHldLFxuICAgICAgICAgIG9wdF9wcmVkZWZpbmVkVmVuZG9yQ29uZmlnXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGZyb21bcHJvcGVydHldKSkge1xuICAgICAgICBpZiAoIWlzT2JqZWN0KHRvW3Byb3BlcnR5XSkpIHtcbiAgICAgICAgICB0b1twcm9wZXJ0eV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB0b1twcm9wZXJ0eV0gPSBtZXJnZU9iamVjdHMoXG4gICAgICAgICAgZnJvbVtwcm9wZXJ0eV0sXG4gICAgICAgICAgdG9bcHJvcGVydHldLFxuICAgICAgICAgIG9wdF9wcmVkZWZpbmVkVmVuZG9yQ29uZmlnXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b1twcm9wZXJ0eV0gPSBmcm9tW3Byb3BlcnR5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRvO1xufVxuXG4vKipcbiAqIEV4cGFuZCBjb25maWcncyByZXF1ZXN0IHRvIG9iamVjdFxuICogQHBhcmFtIHshSnNvbk9iamVjdH0gY29uZmlnXG4gKiBAcmV0dXJuIHs/SnNvbk9iamVjdH1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kQ29uZmlnUmVxdWVzdChjb25maWcpIHtcbiAgaWYgKCFjb25maWdbJ3JlcXVlc3RzJ10pIHtcbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG4gIGZvciAoY29uc3QgayBpbiBjb25maWdbJ3JlcXVlc3RzJ10pIHtcbiAgICBpZiAoaGFzT3duKGNvbmZpZ1sncmVxdWVzdHMnXSwgaykpIHtcbiAgICAgIGNvbmZpZ1sncmVxdWVzdHMnXVtrXSA9IGV4cGFuZFJlcXVlc3RTdHIoY29uZmlnWydyZXF1ZXN0cyddW2tdKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaGFuZGxlVG9wTGV2ZWxBdHRyaWJ1dGVzXyhjb25maWcpO1xufVxuXG4vKipcbiAqIEV4cGFuZCBzaW5nbGUgcmVxdWVzdCB0byBhbiBvYmplY3RcbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHJlcXVlc3RcbiAqIEByZXR1cm4geyp9IFRPRE8oIzIzNTgyKTogU3BlY2lmeSByZXR1cm4gdHlwZVxuICovXG5mdW5jdGlvbiBleHBhbmRSZXF1ZXN0U3RyKHJlcXVlc3QpIHtcbiAgaWYgKGlzT2JqZWN0KHJlcXVlc3QpKSB7XG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICAnYmFzZVVybCc6IHJlcXVlc3QsXG4gIH07XG59XG5cbi8qKlxuICogSGFuZGxlcyB0b3AgbGV2ZWwgZmllbGRzIGluIHRoZSBnaXZlbiBjb25maWdcbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICogQHJldHVybiB7SnNvbk9iamVjdH1cbiAqL1xuZnVuY3Rpb24gaGFuZGxlVG9wTGV2ZWxBdHRyaWJ1dGVzXyhjb25maWcpIHtcbiAgLy8gaGFuZGxlIGEgdG9wIGxldmVsIHJlcXVlc3RPcmlnaW5cbiAgaWYgKGhhc093bihjb25maWcsICdyZXF1ZXN0cycpICYmIGhhc093bihjb25maWcsICdyZXF1ZXN0T3JpZ2luJykpIHtcbiAgICBjb25zdCByZXF1ZXN0T3JpZ2luID0gY29uZmlnWydyZXF1ZXN0T3JpZ2luJ107XG5cbiAgICBmb3IgKGNvbnN0IHJlcXVlc3ROYW1lIGluIGNvbmZpZ1sncmVxdWVzdHMnXSkge1xuICAgICAgLy8gb25seSBhZGQgdG9wIGxldmVsIHJlcXVlc3Qgb3JpZ2luIGludG8gcmVxdWVzdCBpZiBpdCBkb2Vzbid0IGhhdmUgb25lXG4gICAgICBpZiAoIWhhc093bihjb25maWdbJ3JlcXVlc3RzJ11bcmVxdWVzdE5hbWVdLCAnb3JpZ2luJykpIHtcbiAgICAgICAgY29uZmlnWydyZXF1ZXN0cyddW3JlcXVlc3ROYW1lXVsnb3JpZ2luJ10gPSByZXF1ZXN0T3JpZ2luO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/config.js