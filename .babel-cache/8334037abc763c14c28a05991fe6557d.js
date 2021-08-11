import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
import { AMPDOC_SINGLETON_NAME } from "../../../src/core/constants/enums";
import { ExpansionOptions, variableServiceForDoc } from "./variables";
import { Priority } from "../../../src/service/navigation";
import { Services } from "../../../src/service";
import { WindowInterface } from "../../../src/core/window/interface";
import { addMissingParamsToUrl, addParamToUrl } from "../../../src/url";
import { createElementWithAttributes } from "../../../src/core/dom";
import { createLinker } from "./linker";
import { dict } from "../../../src/core/types/object";
import { getHighestAvailableDomain } from "../../../src/cookies";
import { isObject } from "../../../src/core/types";
import { user } from "../../../src/log";

/** @const {string} */
var TAG = 'amp-analytics/linker-manager';
export var LinkerManager = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {?string} type
   * @param {!Element} element
   */
  function LinkerManager(ampdoc, config, type, element) {
    _classCallCheck(this, LinkerManager);

    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?JsonObject|undefined} */
    this.config_ = config['linkers'];

    /** @const @private {!JsonObject} */
    this.vars_ = config['vars'] || {};

    /** @const @private {?string} */
    this.type_ = type;

    /** @const @private {!Element} */
    this.element_ = element;

    /** @const @private {!JsonObject} */
    this.resolvedIds_ = dict();

    /** @const @private {!../../../src/service/url-impl.Url} */
    this.urlService_ = Services.urlForDoc(this.element_);

    /** @const @private {!Promise<../../amp-form/0.1/form-submit-service.FormSubmitService>} */
    this.formSubmitService_ = Services.formSubmitForDoc(ampdoc);

    /** @private {?UnlistenDef} */
    this.formSubmitUnlistener_ = null;

    /** @const @private {!./variables.VariableService} */
    this.variableService_ = variableServiceForDoc(this.ampdoc_);

    /** @private {?string} */
    this.highestAvailableDomain_ = null;
  }

  /**
   * Start resolving any macros that may exist in the linker configuration
   * and register the callback with the navigation service. Since macro
   * resolution is asynchronous the callback may be looking for these values
   * before they are ready.
   * init() is asynchronouse and non blocking.
   * Return a promise for testing only.
   * @return {!Promise}
   */
  _createClass(LinkerManager, [{
    key: "init",
    value: function init() {
      var _this = this;

      if (!isObject(this.config_)) {
        return _resolvedPromise();
      }

      this.highestAvailableDomain_ = getHighestAvailableDomain(this.ampdoc_.win);
      this.config_ = this.processConfig_(
      /** @type {!JsonObject} */
      this.config_);
      // Each linker config has it's own set of macros to resolve.
      var allLinkerPromises = Object.keys(this.config_).map(function (name) {
        var ids = _this.config_[name]['ids'];
        // Keys for linker data.
        var keys = Object.keys(ids);
        // Expand the value of each key value pair (if necessary).
        var valuePromises = keys.map(function (key) {
          var expansionOptions = new ExpansionOptions(_this.vars_,
          /* opt_iterations */
          undefined,
          /* opt_noencode */
          true);
          return _this.expandTemplateWithUrlParams_(ids[key], expansionOptions);
        });
        return Promise.all(valuePromises).then(function (values) {
          // Rejoin each key with its expanded value.
          var expandedIds = {};
          values.forEach(function (value, i) {
            // Omit pair if value resolves to empty.
            if (value) {
              expandedIds[keys[i]] = value;
            }
          });
          _this.resolvedIds_[name] = expandedIds;
          return expandedIds;
        });
      });

      if (allLinkerPromises.length) {
        var navigation = Services.navigationForDoc(this.ampdoc_);
        navigation.registerAnchorMutator(function (element, event) {
          if (!element.href || event.type !== 'click') {
            return;
          }

          element.href = _this.applyLinkers_(element.href);
        }, Priority.ANALYTICS_LINKER);
        navigation.registerNavigateToMutator(function (url) {
          return _this.applyLinkers_(url);
        }, Priority.ANALYTICS_LINKER);
      }

      this.enableFormSupport_();
      return Promise.all(allLinkerPromises);
    }
    /**
     * Remove any listeners created to manage form submission.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      if (this.formSubmitUnlistener_) {
        this.formSubmitUnlistener_();
      }
    }
    /**
     * @param {!JsonObject} config
     * @return {!JsonObject}
     * @private
     */

  }, {
    key: "processConfig_",
    value: function processConfig_(config) {
      var processedConfig = dict();
      var defaultConfig = {
        enabled: this.isLegacyOptIn_() && this.isSafari12OrAbove_()
      };
      var linkerNames = Object.keys(config).filter(function (key) {
        var value = config[key];
        var isLinkerConfig = isObject(value);

        if (!isLinkerConfig) {
          defaultConfig[key] = value;
        }

        return isLinkerConfig;
      });
      var location = WindowInterface.getLocation(this.ampdoc_.win);
      var isProxyOrigin = this.urlService_.isProxyOrigin(location);
      linkerNames.forEach(function (name) {
        var mergedConfig = _extends({}, defaultConfig, config[name]);

        if (mergedConfig['enabled'] !== true) {
          user().info(TAG, 'linker config for %s is not enabled and will be ignored.', name);
          return;
        }

        if (!isProxyOrigin && mergedConfig['proxyOnly'] !== false) {
          return;
        }

        if (!mergedConfig['ids']) {
          user().error(TAG, '"ids" is a required field for use of "linkers".');
          return;
        }

        processedConfig[name] = mergedConfig;
      });
      return processedConfig;
    }
    /**
     * Expands spec using provided expansion options and applies url replacement
     * if necessary.
     * @param {string} template Expression that needs to be expanded.
     * @param {!ExpansionOptions} expansionOptions Expansion options.
     * @return {!Promise<string>} expanded template.
     */

  }, {
    key: "expandTemplateWithUrlParams_",
    value: function expandTemplateWithUrlParams_(template, expansionOptions) {
      var _this2 = this;

      var bindings = this.variableService_.getMacros(this.element_);
      return this.variableService_.expandTemplate(template, expansionOptions, this.element_).then(function (expanded) {
        var urlReplacements = Services.urlReplacementsForDoc(_this2.element_);
        return urlReplacements.expandUrlAsync(expanded, bindings);
      });
    }
    /**
     * If the document has existing cid meta tag they do not need to explicitly
     * opt-in to use linker.
     * @return {boolean}
     * @private
     */

  }, {
    key: "isLegacyOptIn_",
    value: function isLegacyOptIn_() {
      if (this.type_ !== 'googleanalytics') {
        return false;
      }

      if (this.ampdoc_.getMetaByName('amp-google-client-id-api') !== 'googleanalytics') {
        return false;
      }

      return this.ampdoc_.registerSingleton(AMPDOC_SINGLETON_NAME.LINKER);
    }
    /**
     * If the browser is Safari 12 or above.
     * @return {boolean}
     * @private
     */

  }, {
    key: "isSafari12OrAbove_",
    value: function isSafari12OrAbove_() {
      var platform = Services.platformFor(this.ampdoc_.win);
      return platform.isSafari() && platform.getMajorVersion() >= 12;
    }
    /**
     * Apply linkers to the given url. Linker params are appended if there
     * are matching linker configs.
     *
     * @param {string} url
     * @return {string}
     * @private
     */

  }, {
    key: "applyLinkers_",
    value: function applyLinkers_(url) {
      var linkerConfigs = this.config_;

      for (var linkerName in linkerConfigs) {
        // The linker param is created asynchronously. This callback should be
        // synchronous, so we skip if value is not there yet.
        if (this.resolvedIds_[linkerName]) {
          url = this.maybeAppendLinker_(url, linkerName, linkerConfigs[linkerName]);
        }
      }

      return url;
    }
    /**
     * Appends the linker param if the given url falls within rules defined in
     * linker configuration.
     * @param {string} url
     * @param {string} name
     * @param {!Object} config
     * @return {string}
     * @private
     */

  }, {
    key: "maybeAppendLinker_",
    value: function maybeAppendLinker_(url, name, config) {
      var location = this.urlService_.parse(url);

      if (this.isDomainMatch_(location, name, config) && this.isProtocolMatch_(location)) {
        var linkerValue = createLinker(
        /* version */
        '1', this.resolvedIds_[name]);

        if (linkerValue) {
          var params = dict();
          params[name] = linkerValue;
          return addMissingParamsToUrl(url, params);
        }
      }

      return url;
    }
    /**
     * Check to see if the url is a match for the given set of domains.
     * @param {Location} location
     * @param {string} name Name given in linker config.
     * @param {!Object} config
     * @return {boolean}
     */

  }, {
    key: "isDomainMatch_",
    value: function isDomainMatch_(location, name, config) {
      var
      /** @type {Array} */
      domains = config['destinationDomains'];
      var hostname = location.hostname;
      // Don't append linker for exact domain match, relative urls, or
      // fragments.
      var winHostname = WindowInterface.getHostname(this.ampdoc_.win);
      var sameDomain = config['sameDomainEnabled'];

      if (!Boolean(sameDomain) && winHostname === hostname) {
        return false;
      }

      // If given domains, but not in the right format.
      if (domains && !Array.isArray(domains)) {
        user().warn(TAG, '%s destinationDomains must be an array.', name);
        return false;
      }

      // If destinationDomain is specified specifically, respect it.
      if (domains) {
        return this.destinationDomainsMatch_(domains, hostname);
      }

      // Fallback to default behavior
      var _Services$documentInf = Services.documentInfoForDoc(this.ampdoc_),
          canonicalUrl = _Services$documentInf.canonicalUrl,
          sourceUrl = _Services$documentInf.sourceUrl;

      var canonicalOrigin = this.urlService_.parse(canonicalUrl).hostname;
      var isFriendlyCanonicalOrigin = areFriendlyDomains(canonicalOrigin, hostname);

      // Default to all subdomains matching (if there's one) plus canonicalOrigin
      if (this.highestAvailableDomain_) {
        var destinationDomain = [this.highestAvailableDomain_, '*' + this.highestAvailableDomain_];
        return this.destinationDomainsMatch_(destinationDomain, hostname) || isFriendlyCanonicalOrigin;
      }

      // In the case where highestAvailableDomain cannot be found.
      // (proxyOrigin, no <meta name='amp-cookie-scope'> found)
      // default to friendly domain matching.
      var sourceOrigin = this.urlService_.parse(sourceUrl).hostname;
      return areFriendlyDomains(sourceOrigin, hostname) || isFriendlyCanonicalOrigin;
    }
    /**
     * Only matching protocols should use Linker parameters.
     * @param {Location} location
     * @return {boolean}
     */

  }, {
    key: "isProtocolMatch_",
    value: function isProtocolMatch_(location) {
      return location.protocol === 'https:' || location.protocol === 'http:';
    }
    /**
     * Helper method to find out if hostname match the destinationDomain array.
     * @param {Array<string>} domains
     * @param {string} hostname
     * @return {boolean}
     */

  }, {
    key: "destinationDomainsMatch_",
    value: function destinationDomainsMatch_(domains, hostname) {
      for (var i = 0; i < domains.length; i++) {
        var domain = domains[i];

        // Exact match.
        if (domain === hostname) {
          return true;
        }

        // Allow wildcard subdomain matching.
        if (domain.indexOf('*') !== -1 && isWildCardMatch(hostname, domain)) {
          return true;
        }
      }

      return false;
    }
    /**
     * Register callback that will handle form sumbits.
     */

  }, {
    key: "enableFormSupport_",
    value: function enableFormSupport_() {
      var _this3 = this;

      if (this.formSubmitUnlistener_) {
        return;
      }

      this.formSubmitService_.then(function (formService) {
        _this3.formSubmitUnlistener_ = formService.beforeSubmit(_this3.handleFormSubmit_.bind(_this3));
      });
    }
    /**
     * Check to see if any linker configs match this form's url, if so, send
     * along the resolved linker value
     * @param {!../../amp-form/0.1/form-submit-service.FormSubmitEventDef} event
     */

  }, {
    key: "handleFormSubmit_",
    value: function handleFormSubmit_(event) {
      var actionXhrMutator = event.actionXhrMutator,
          form = event.form;

      for (var linkerName in this.config_) {
        var config = this.config_[linkerName];
        var url = form.getAttribute('action-xhr') || form.getAttribute('action');
        var location = this.urlService_.parse(url);

        if (this.isDomainMatch_(location, linkerName, config)) {
          this.addDataToForm_(form, actionXhrMutator, linkerName);
        }
      }
    }
    /**
     * Add the linker data to form. If action-xhr is present we can update the
     * action-xhr, if not we fallback to adding hidden inputs.
     * @param {!Element} form
     * @param {function(string)} actionXhrMutator
     * @param {string} linkerName
     * @return {*} TODO(#23582): Specify return type
     */

  }, {
    key: "addDataToForm_",
    value: function addDataToForm_(form, actionXhrMutator, linkerName) {
      var ids = this.resolvedIds_[linkerName];

      if (!ids) {
        // Form was clicked before macros resolved.
        return;
      }

      var linkerValue = createLinker(
      /* version */
      '1', ids);
      // Runtime controls submits with `action-xhr`, so we can append the linker
      // param
      var actionXhrUrl = form.getAttribute('action-xhr');

      if (actionXhrUrl) {
        var decoratedUrl = addParamToUrl(actionXhrUrl, linkerName, linkerValue);
        return actionXhrMutator(decoratedUrl);
      }

      // If we are not using `action-xhr` it must be a GET request using the
      // standard action attribute. Browsers will not let you change this in the
      // middle of a submit, so we add the input hidden attributes.
      this.addHiddenInputs_(form, linkerName, linkerValue);
    }
    /**
     * Add the linker pairs as <input> elements to form.
     * @param {!Element} form
     * @param {string} linkerName
     * @param {string} linkerValue
     */

  }, {
    key: "addHiddenInputs_",
    value: function addHiddenInputs_(form, linkerName, linkerValue) {
      var attrs = dict({
        'type': 'hidden',
        'name': linkerName,
        'value': linkerValue
      });
      var inputEl = createElementWithAttributes(
      /** @type {!Document} */
      form.ownerDocument, 'input', attrs);
      form.appendChild(inputEl);
    }
  }]);

  return LinkerManager;
}();

/**
 * Domains are considered to be friends if they are identical
 * after removing these prefixes: m. www. amp.
 * URL scheme & port are not taken into consideration.
 *
 * Note that this algorithm will break corner cases like
 *   www.com vs amp.com vs m.com
 * Or
 *   amp.wordpress.com vs www.wordpress.com
 *
 * @param {string} domain1
 * @param {string} domain2
 * @return {boolean}
 * @visibleForTesting
 */
export function areFriendlyDomains(domain1, domain2) {
  return getBaseDomain(domain1) === getBaseDomain(domain2);
}

/**
 * Strips out all prefixing m. www. amp. from a domain name.
 * @param {string} domain
 * @return {string}
 */
function getBaseDomain(domain) {
  return domain.replace(/^(?:www\.|m\.|amp\.)+/, '');
}

/**
 * Escape any regex flags other than `*`
 * @param {string} str
 * @return {*} TODO(#23582): Specify return type
 */
function regexEscape(str) {
  return str.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
}

/**
 * Allows specified wildcard matching of domains.
 * Example:
 *    `*.foo.com` matches `amp.foo.com`
 *    `*.foo.com*` matches `amp.foo.com.uk`
 * @param {string} hostname
 * @param {string} domain
 * @return {boolean}
 * @visibleForTesting
 */
export function isWildCardMatch(hostname, domain) {
  var escaped = regexEscape(domain);
  var regex = escaped.replace(/\*/g, '.*');
  return new RegExp('^' + regex + '$').test(hostname);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlci1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIkFNUERPQ19TSU5HTEVUT05fTkFNRSIsIkV4cGFuc2lvbk9wdGlvbnMiLCJ2YXJpYWJsZVNlcnZpY2VGb3JEb2MiLCJQcmlvcml0eSIsIlNlcnZpY2VzIiwiV2luZG93SW50ZXJmYWNlIiwiYWRkTWlzc2luZ1BhcmFtc1RvVXJsIiwiYWRkUGFyYW1Ub1VybCIsImNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyIsImNyZWF0ZUxpbmtlciIsImRpY3QiLCJnZXRIaWdoZXN0QXZhaWxhYmxlRG9tYWluIiwiaXNPYmplY3QiLCJ1c2VyIiwiVEFHIiwiTGlua2VyTWFuYWdlciIsImFtcGRvYyIsImNvbmZpZyIsInR5cGUiLCJlbGVtZW50IiwiYW1wZG9jXyIsImNvbmZpZ18iLCJ2YXJzXyIsInR5cGVfIiwiZWxlbWVudF8iLCJyZXNvbHZlZElkc18iLCJ1cmxTZXJ2aWNlXyIsInVybEZvckRvYyIsImZvcm1TdWJtaXRTZXJ2aWNlXyIsImZvcm1TdWJtaXRGb3JEb2MiLCJmb3JtU3VibWl0VW5saXN0ZW5lcl8iLCJ2YXJpYWJsZVNlcnZpY2VfIiwiaGlnaGVzdEF2YWlsYWJsZURvbWFpbl8iLCJ3aW4iLCJwcm9jZXNzQ29uZmlnXyIsImFsbExpbmtlclByb21pc2VzIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsIm5hbWUiLCJpZHMiLCJ2YWx1ZVByb21pc2VzIiwia2V5IiwiZXhwYW5zaW9uT3B0aW9ucyIsInVuZGVmaW5lZCIsImV4cGFuZFRlbXBsYXRlV2l0aFVybFBhcmFtc18iLCJQcm9taXNlIiwiYWxsIiwidGhlbiIsInZhbHVlcyIsImV4cGFuZGVkSWRzIiwiZm9yRWFjaCIsInZhbHVlIiwiaSIsImxlbmd0aCIsIm5hdmlnYXRpb24iLCJuYXZpZ2F0aW9uRm9yRG9jIiwicmVnaXN0ZXJBbmNob3JNdXRhdG9yIiwiZXZlbnQiLCJocmVmIiwiYXBwbHlMaW5rZXJzXyIsIkFOQUxZVElDU19MSU5LRVIiLCJyZWdpc3Rlck5hdmlnYXRlVG9NdXRhdG9yIiwidXJsIiwiZW5hYmxlRm9ybVN1cHBvcnRfIiwicHJvY2Vzc2VkQ29uZmlnIiwiZGVmYXVsdENvbmZpZyIsImVuYWJsZWQiLCJpc0xlZ2FjeU9wdEluXyIsImlzU2FmYXJpMTJPckFib3ZlXyIsImxpbmtlck5hbWVzIiwiZmlsdGVyIiwiaXNMaW5rZXJDb25maWciLCJsb2NhdGlvbiIsImdldExvY2F0aW9uIiwiaXNQcm94eU9yaWdpbiIsIm1lcmdlZENvbmZpZyIsImluZm8iLCJlcnJvciIsInRlbXBsYXRlIiwiYmluZGluZ3MiLCJnZXRNYWNyb3MiLCJleHBhbmRUZW1wbGF0ZSIsImV4cGFuZGVkIiwidXJsUmVwbGFjZW1lbnRzIiwidXJsUmVwbGFjZW1lbnRzRm9yRG9jIiwiZXhwYW5kVXJsQXN5bmMiLCJnZXRNZXRhQnlOYW1lIiwicmVnaXN0ZXJTaW5nbGV0b24iLCJMSU5LRVIiLCJwbGF0Zm9ybSIsInBsYXRmb3JtRm9yIiwiaXNTYWZhcmkiLCJnZXRNYWpvclZlcnNpb24iLCJsaW5rZXJDb25maWdzIiwibGlua2VyTmFtZSIsIm1heWJlQXBwZW5kTGlua2VyXyIsInBhcnNlIiwiaXNEb21haW5NYXRjaF8iLCJpc1Byb3RvY29sTWF0Y2hfIiwibGlua2VyVmFsdWUiLCJwYXJhbXMiLCJkb21haW5zIiwiaG9zdG5hbWUiLCJ3aW5Ib3N0bmFtZSIsImdldEhvc3RuYW1lIiwic2FtZURvbWFpbiIsIkJvb2xlYW4iLCJBcnJheSIsImlzQXJyYXkiLCJ3YXJuIiwiZGVzdGluYXRpb25Eb21haW5zTWF0Y2hfIiwiZG9jdW1lbnRJbmZvRm9yRG9jIiwiY2Fub25pY2FsVXJsIiwic291cmNlVXJsIiwiY2Fub25pY2FsT3JpZ2luIiwiaXNGcmllbmRseUNhbm9uaWNhbE9yaWdpbiIsImFyZUZyaWVuZGx5RG9tYWlucyIsImRlc3RpbmF0aW9uRG9tYWluIiwic291cmNlT3JpZ2luIiwicHJvdG9jb2wiLCJkb21haW4iLCJpbmRleE9mIiwiaXNXaWxkQ2FyZE1hdGNoIiwiZm9ybVNlcnZpY2UiLCJiZWZvcmVTdWJtaXQiLCJoYW5kbGVGb3JtU3VibWl0XyIsImJpbmQiLCJhY3Rpb25YaHJNdXRhdG9yIiwiZm9ybSIsImdldEF0dHJpYnV0ZSIsImFkZERhdGFUb0Zvcm1fIiwiYWN0aW9uWGhyVXJsIiwiZGVjb3JhdGVkVXJsIiwiYWRkSGlkZGVuSW5wdXRzXyIsImF0dHJzIiwiaW5wdXRFbCIsIm93bmVyRG9jdW1lbnQiLCJhcHBlbmRDaGlsZCIsImRvbWFpbjEiLCJkb21haW4yIiwiZ2V0QmFzZURvbWFpbiIsInJlcGxhY2UiLCJyZWdleEVzY2FwZSIsInN0ciIsImVzY2FwZWQiLCJyZWdleCIsIlJlZ0V4cCIsInRlc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxxQkFBUjtBQUNBLFNBQVFDLGdCQUFSLEVBQTBCQyxxQkFBMUI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxxQkFBUixFQUErQkMsYUFBL0I7QUFDQSxTQUFRQywyQkFBUjtBQUNBLFNBQVFDLFlBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMseUJBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsSUFBUjs7QUFFQTtBQUNBLElBQU1DLEdBQUcsR0FBRyw4QkFBWjtBQUVBLFdBQWFDLGFBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRSx5QkFBWUMsTUFBWixFQUFvQkMsTUFBcEIsRUFBNEJDLElBQTVCLEVBQWtDQyxPQUFsQyxFQUEyQztBQUFBOztBQUN6QztBQUNBLFNBQUtDLE9BQUwsR0FBZUosTUFBZjs7QUFFQTtBQUNBLFNBQUtLLE9BQUwsR0FBZUosTUFBTSxDQUFDLFNBQUQsQ0FBckI7O0FBRUE7QUFDQSxTQUFLSyxLQUFMLEdBQWFMLE1BQU0s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QUFiLEtBQTJCRSxhQUFhLENBQUNELE9BQUQsQ0FBL0M7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsYUFBVCxDQUF1QnBCLE1BQXZCLEVBQStCO0FBQzdCLFNBQU9BLE1BQU0sQ0FBQ3FCLE9BQVAsQ0FBZSx1QkFBZixFQUF3QyxFQUF4QyxDQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLFdBQVQsQ0FBcUJDLEdBQXJCLEVBQTBCO0FBQ3hCLFNBQU9BLEdBQUcsQ0FBQ0YsT0FBSixDQUFZLHVCQUFaLEVBQXFDLE1BQXJDLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU25CLGVBQVQsQ0FBeUJwQixRQUF6QixFQUFtQ2tCLE1BQW5DLEVBQTJDO0FBQ2hELE1BQU13QixPQUFPLEdBQUdGLFdBQVcsQ0FBQ3RCLE1BQUQsQ0FBM0I7QUFDQSxNQUFNeUIsS0FBSyxHQUFHRCxPQUFPLENBQUNILE9BQVIsQ0FBZ0IsS0FBaEIsRUFBdUIsSUFBdkIsQ0FBZDtBQUNBLFNBQU8sSUFBSUssTUFBSixDQUFXLE1BQU1ELEtBQU4sR0FBYyxHQUF6QixFQUE4QkUsSUFBOUIsQ0FBbUM3QyxRQUFuQyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtBTVBET0NfU0lOR0xFVE9OX05BTUV9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9lbnVtcyc7XG5pbXBvcnQge0V4cGFuc2lvbk9wdGlvbnMsIHZhcmlhYmxlU2VydmljZUZvckRvY30gZnJvbSAnLi92YXJpYWJsZXMnO1xuaW1wb3J0IHtQcmlvcml0eX0gZnJvbSAnI3NlcnZpY2UvbmF2aWdhdGlvbic7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1dpbmRvd0ludGVyZmFjZX0gZnJvbSAnI2NvcmUvd2luZG93L2ludGVyZmFjZSc7XG5pbXBvcnQge2FkZE1pc3NpbmdQYXJhbXNUb1VybCwgYWRkUGFyYW1Ub1VybH0gZnJvbSAnLi4vLi4vLi4vc3JjL3VybCc7XG5pbXBvcnQge2NyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlc30gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7Y3JlYXRlTGlua2VyfSBmcm9tICcuL2xpbmtlcic7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2dldEhpZ2hlc3RBdmFpbGFibGVEb21haW59IGZyb20gJy4uLy4uLy4uL3NyYy9jb29raWVzJztcbmltcG9ydCB7aXNPYmplY3R9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7dXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdhbXAtYW5hbHl0aWNzL2xpbmtlci1tYW5hZ2VyJztcblxuZXhwb3J0IGNsYXNzIExpbmtlck1hbmFnZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gY29uZmlnXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MsIGNvbmZpZywgdHlwZSwgZWxlbWVudCkge1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2NfID0gYW1wZG9jO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/SnNvbk9iamVjdHx1bmRlZmluZWR9ICovXG4gICAgdGhpcy5jb25maWdfID0gY29uZmlnWydsaW5rZXJzJ107XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshSnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLnZhcnNfID0gY29uZmlnWyd2YXJzJ10gfHwge307XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHs/c3RyaW5nfSAqL1xuICAgIHRoaXMudHlwZV8gPSB0eXBlO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IUVsZW1lbnR9ICovXG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshSnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLnJlc29sdmVkSWRzXyA9IGRpY3QoKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvc2VydmljZS91cmwtaW1wbC5Vcmx9ICovXG4gICAgdGhpcy51cmxTZXJ2aWNlXyA9IFNlcnZpY2VzLnVybEZvckRvYyh0aGlzLmVsZW1lbnRfKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFQcm9taXNlPC4uLy4uL2FtcC1mb3JtLzAuMS9mb3JtLXN1Ym1pdC1zZXJ2aWNlLkZvcm1TdWJtaXRTZXJ2aWNlPn0gKi9cbiAgICB0aGlzLmZvcm1TdWJtaXRTZXJ2aWNlXyA9IFNlcnZpY2VzLmZvcm1TdWJtaXRGb3JEb2MoYW1wZG9jKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1VubGlzdGVuRGVmfSAqL1xuICAgIHRoaXMuZm9ybVN1Ym1pdFVubGlzdGVuZXJfID0gbnVsbDtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuL3ZhcmlhYmxlcy5WYXJpYWJsZVNlcnZpY2V9ICovXG4gICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfID0gdmFyaWFibGVTZXJ2aWNlRm9yRG9jKHRoaXMuYW1wZG9jXyk7XG5cbiAgICAvKiogQHByaXZhdGUgez9zdHJpbmd9ICovXG4gICAgdGhpcy5oaWdoZXN0QXZhaWxhYmxlRG9tYWluXyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcmVzb2x2aW5nIGFueSBtYWNyb3MgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGxpbmtlciBjb25maWd1cmF0aW9uXG4gICAqIGFuZCByZWdpc3RlciB0aGUgY2FsbGJhY2sgd2l0aCB0aGUgbmF2aWdhdGlvbiBzZXJ2aWNlLiBTaW5jZSBtYWNyb1xuICAgKiByZXNvbHV0aW9uIGlzIGFzeW5jaHJvbm91cyB0aGUgY2FsbGJhY2sgbWF5IGJlIGxvb2tpbmcgZm9yIHRoZXNlIHZhbHVlc1xuICAgKiBiZWZvcmUgdGhleSBhcmUgcmVhZHkuXG4gICAqIGluaXQoKSBpcyBhc3luY2hyb25vdXNlIGFuZCBub24gYmxvY2tpbmcuXG4gICAqIFJldHVybiBhIHByb21pc2UgZm9yIHRlc3Rpbmcgb25seS5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBpbml0KCkge1xuICAgIGlmICghaXNPYmplY3QodGhpcy5jb25maWdfKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuaGlnaGVzdEF2YWlsYWJsZURvbWFpbl8gPSBnZXRIaWdoZXN0QXZhaWxhYmxlRG9tYWluKHRoaXMuYW1wZG9jXy53aW4pO1xuXG4gICAgdGhpcy5jb25maWdfID0gdGhpcy5wcm9jZXNzQ29uZmlnXyhcbiAgICAgIC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovICh0aGlzLmNvbmZpZ18pXG4gICAgKTtcbiAgICAvLyBFYWNoIGxpbmtlciBjb25maWcgaGFzIGl0J3Mgb3duIHNldCBvZiBtYWNyb3MgdG8gcmVzb2x2ZS5cbiAgICBjb25zdCBhbGxMaW5rZXJQcm9taXNlcyA9IE9iamVjdC5rZXlzKHRoaXMuY29uZmlnXykubWFwKChuYW1lKSA9PiB7XG4gICAgICBjb25zdCBpZHMgPSB0aGlzLmNvbmZpZ19bbmFtZV1bJ2lkcyddO1xuICAgICAgLy8gS2V5cyBmb3IgbGlua2VyIGRhdGEuXG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoaWRzKTtcbiAgICAgIC8vIEV4cGFuZCB0aGUgdmFsdWUgb2YgZWFjaCBrZXkgdmFsdWUgcGFpciAoaWYgbmVjZXNzYXJ5KS5cbiAgICAgIGNvbnN0IHZhbHVlUHJvbWlzZXMgPSBrZXlzLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IGV4cGFuc2lvbk9wdGlvbnMgPSBuZXcgRXhwYW5zaW9uT3B0aW9ucyhcbiAgICAgICAgICB0aGlzLnZhcnNfLFxuICAgICAgICAgIC8qIG9wdF9pdGVyYXRpb25zICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAvKiBvcHRfbm9lbmNvZGUgKi8gdHJ1ZVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcy5leHBhbmRUZW1wbGF0ZVdpdGhVcmxQYXJhbXNfKGlkc1trZXldLCBleHBhbnNpb25PcHRpb25zKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwodmFsdWVQcm9taXNlcykudGhlbigodmFsdWVzKSA9PiB7XG4gICAgICAgIC8vIFJlam9pbiBlYWNoIGtleSB3aXRoIGl0cyBleHBhbmRlZCB2YWx1ZS5cbiAgICAgICAgY29uc3QgZXhwYW5kZWRJZHMgPSB7fTtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goKHZhbHVlLCBpKSA9PiB7XG4gICAgICAgICAgLy8gT21pdCBwYWlyIGlmIHZhbHVlIHJlc29sdmVzIHRvIGVtcHR5LlxuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgZXhwYW5kZWRJZHNba2V5c1tpXV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlc29sdmVkSWRzX1tuYW1lXSA9IGV4cGFuZGVkSWRzO1xuICAgICAgICByZXR1cm4gZXhwYW5kZWRJZHM7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlmIChhbGxMaW5rZXJQcm9taXNlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG5hdmlnYXRpb24gPSBTZXJ2aWNlcy5uYXZpZ2F0aW9uRm9yRG9jKHRoaXMuYW1wZG9jXyk7XG4gICAgICBuYXZpZ2F0aW9uLnJlZ2lzdGVyQW5jaG9yTXV0YXRvcigoZWxlbWVudCwgZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFlbGVtZW50LmhyZWYgfHwgZXZlbnQudHlwZSAhPT0gJ2NsaWNrJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmhyZWYgPSB0aGlzLmFwcGx5TGlua2Vyc18oZWxlbWVudC5ocmVmKTtcbiAgICAgIH0sIFByaW9yaXR5LkFOQUxZVElDU19MSU5LRVIpO1xuICAgICAgbmF2aWdhdGlvbi5yZWdpc3Rlck5hdmlnYXRlVG9NdXRhdG9yKFxuICAgICAgICAodXJsKSA9PiB0aGlzLmFwcGx5TGlua2Vyc18odXJsKSxcbiAgICAgICAgUHJpb3JpdHkuQU5BTFlUSUNTX0xJTktFUlxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLmVuYWJsZUZvcm1TdXBwb3J0XygpO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKGFsbExpbmtlclByb21pc2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW55IGxpc3RlbmVycyBjcmVhdGVkIHRvIG1hbmFnZSBmb3JtIHN1Ym1pc3Npb24uXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLmZvcm1TdWJtaXRVbmxpc3RlbmVyXykge1xuICAgICAgdGhpcy5mb3JtU3VibWl0VW5saXN0ZW5lcl8oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gY29uZmlnXG4gICAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvY2Vzc0NvbmZpZ18oY29uZmlnKSB7XG4gICAgY29uc3QgcHJvY2Vzc2VkQ29uZmlnID0gZGljdCgpO1xuICAgIGNvbnN0IGRlZmF1bHRDb25maWcgPSB7XG4gICAgICBlbmFibGVkOiB0aGlzLmlzTGVnYWN5T3B0SW5fKCkgJiYgdGhpcy5pc1NhZmFyaTEyT3JBYm92ZV8oKSxcbiAgICB9O1xuICAgIGNvbnN0IGxpbmtlck5hbWVzID0gT2JqZWN0LmtleXMoY29uZmlnKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBjb25maWdba2V5XTtcbiAgICAgIGNvbnN0IGlzTGlua2VyQ29uZmlnID0gaXNPYmplY3QodmFsdWUpO1xuICAgICAgaWYgKCFpc0xpbmtlckNvbmZpZykge1xuICAgICAgICBkZWZhdWx0Q29uZmlnW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc0xpbmtlckNvbmZpZztcbiAgICB9KTtcblxuICAgIGNvbnN0IGxvY2F0aW9uID0gV2luZG93SW50ZXJmYWNlLmdldExvY2F0aW9uKHRoaXMuYW1wZG9jXy53aW4pO1xuICAgIGNvbnN0IGlzUHJveHlPcmlnaW4gPSB0aGlzLnVybFNlcnZpY2VfLmlzUHJveHlPcmlnaW4obG9jYXRpb24pO1xuICAgIGxpbmtlck5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIGNvbnN0IG1lcmdlZENvbmZpZyA9IHsuLi5kZWZhdWx0Q29uZmlnLCAuLi5jb25maWdbbmFtZV19O1xuXG4gICAgICBpZiAobWVyZ2VkQ29uZmlnWydlbmFibGVkJ10gIT09IHRydWUpIHtcbiAgICAgICAgdXNlcigpLmluZm8oXG4gICAgICAgICAgVEFHLFxuICAgICAgICAgICdsaW5rZXIgY29uZmlnIGZvciAlcyBpcyBub3QgZW5hYmxlZCBhbmQgd2lsbCBiZSBpZ25vcmVkLicsXG4gICAgICAgICAgbmFtZVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNQcm94eU9yaWdpbiAmJiBtZXJnZWRDb25maWdbJ3Byb3h5T25seSddICE9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghbWVyZ2VkQ29uZmlnWydpZHMnXSkge1xuICAgICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnXCJpZHNcIiBpcyBhIHJlcXVpcmVkIGZpZWxkIGZvciB1c2Ugb2YgXCJsaW5rZXJzXCIuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcHJvY2Vzc2VkQ29uZmlnW25hbWVdID0gbWVyZ2VkQ29uZmlnO1xuICAgIH0pO1xuICAgIHJldHVybiBwcm9jZXNzZWRDb25maWc7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyBzcGVjIHVzaW5nIHByb3ZpZGVkIGV4cGFuc2lvbiBvcHRpb25zIGFuZCBhcHBsaWVzIHVybCByZXBsYWNlbWVudFxuICAgKiBpZiBuZWNlc3NhcnkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZW1wbGF0ZSBFeHByZXNzaW9uIHRoYXQgbmVlZHMgdG8gYmUgZXhwYW5kZWQuXG4gICAqIEBwYXJhbSB7IUV4cGFuc2lvbk9wdGlvbnN9IGV4cGFuc2lvbk9wdGlvbnMgRXhwYW5zaW9uIG9wdGlvbnMuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59IGV4cGFuZGVkIHRlbXBsYXRlLlxuICAgKi9cbiAgZXhwYW5kVGVtcGxhdGVXaXRoVXJsUGFyYW1zXyh0ZW1wbGF0ZSwgZXhwYW5zaW9uT3B0aW9ucykge1xuICAgIGNvbnN0IGJpbmRpbmdzID0gdGhpcy52YXJpYWJsZVNlcnZpY2VfLmdldE1hY3Jvcyh0aGlzLmVsZW1lbnRfKTtcbiAgICByZXR1cm4gdGhpcy52YXJpYWJsZVNlcnZpY2VfXG4gICAgICAuZXhwYW5kVGVtcGxhdGUodGVtcGxhdGUsIGV4cGFuc2lvbk9wdGlvbnMsIHRoaXMuZWxlbWVudF8pXG4gICAgICAudGhlbigoZXhwYW5kZWQpID0+IHtcbiAgICAgICAgY29uc3QgdXJsUmVwbGFjZW1lbnRzID0gU2VydmljZXMudXJsUmVwbGFjZW1lbnRzRm9yRG9jKHRoaXMuZWxlbWVudF8pO1xuICAgICAgICByZXR1cm4gdXJsUmVwbGFjZW1lbnRzLmV4cGFuZFVybEFzeW5jKGV4cGFuZGVkLCBiaW5kaW5ncyk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgZG9jdW1lbnQgaGFzIGV4aXN0aW5nIGNpZCBtZXRhIHRhZyB0aGV5IGRvIG5vdCBuZWVkIHRvIGV4cGxpY2l0bHlcbiAgICogb3B0LWluIHRvIHVzZSBsaW5rZXIuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc0xlZ2FjeU9wdEluXygpIHtcbiAgICBpZiAodGhpcy50eXBlXyAhPT0gJ2dvb2dsZWFuYWx5dGljcycpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLmFtcGRvY18uZ2V0TWV0YUJ5TmFtZSgnYW1wLWdvb2dsZS1jbGllbnQtaWQtYXBpJykgIT09XG4gICAgICAnZ29vZ2xlYW5hbHl0aWNzJ1xuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmFtcGRvY18ucmVnaXN0ZXJTaW5nbGV0b24oQU1QRE9DX1NJTkdMRVRPTl9OQU1FLkxJTktFUik7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIGJyb3dzZXIgaXMgU2FmYXJpIDEyIG9yIGFib3ZlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaXNTYWZhcmkxMk9yQWJvdmVfKCkge1xuICAgIGNvbnN0IHBsYXRmb3JtID0gU2VydmljZXMucGxhdGZvcm1Gb3IodGhpcy5hbXBkb2NfLndpbik7XG4gICAgcmV0dXJuIHBsYXRmb3JtLmlzU2FmYXJpKCkgJiYgcGxhdGZvcm0uZ2V0TWFqb3JWZXJzaW9uKCkgPj0gMTI7XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgbGlua2VycyB0byB0aGUgZ2l2ZW4gdXJsLiBMaW5rZXIgcGFyYW1zIGFyZSBhcHBlbmRlZCBpZiB0aGVyZVxuICAgKiBhcmUgbWF0Y2hpbmcgbGlua2VyIGNvbmZpZ3MuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHlMaW5rZXJzXyh1cmwpIHtcbiAgICBjb25zdCBsaW5rZXJDb25maWdzID0gdGhpcy5jb25maWdfO1xuICAgIGZvciAoY29uc3QgbGlua2VyTmFtZSBpbiBsaW5rZXJDb25maWdzKSB7XG4gICAgICAvLyBUaGUgbGlua2VyIHBhcmFtIGlzIGNyZWF0ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FsbGJhY2sgc2hvdWxkIGJlXG4gICAgICAvLyBzeW5jaHJvbm91cywgc28gd2Ugc2tpcCBpZiB2YWx1ZSBpcyBub3QgdGhlcmUgeWV0LlxuICAgICAgaWYgKHRoaXMucmVzb2x2ZWRJZHNfW2xpbmtlck5hbWVdKSB7XG4gICAgICAgIHVybCA9IHRoaXMubWF5YmVBcHBlbmRMaW5rZXJfKFxuICAgICAgICAgIHVybCxcbiAgICAgICAgICBsaW5rZXJOYW1lLFxuICAgICAgICAgIGxpbmtlckNvbmZpZ3NbbGlua2VyTmFtZV1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIHRoZSBsaW5rZXIgcGFyYW0gaWYgdGhlIGdpdmVuIHVybCBmYWxscyB3aXRoaW4gcnVsZXMgZGVmaW5lZCBpblxuICAgKiBsaW5rZXIgY29uZmlndXJhdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0geyFPYmplY3R9IGNvbmZpZ1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZUFwcGVuZExpbmtlcl8odXJsLCBuYW1lLCBjb25maWcpIHtcbiAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMudXJsU2VydmljZV8ucGFyc2UodXJsKTtcbiAgICBpZiAoXG4gICAgICB0aGlzLmlzRG9tYWluTWF0Y2hfKGxvY2F0aW9uLCBuYW1lLCBjb25maWcpICYmXG4gICAgICB0aGlzLmlzUHJvdG9jb2xNYXRjaF8obG9jYXRpb24pXG4gICAgKSB7XG4gICAgICBjb25zdCBsaW5rZXJWYWx1ZSA9IGNyZWF0ZUxpbmtlcihcbiAgICAgICAgLyogdmVyc2lvbiAqLyAnMScsXG4gICAgICAgIHRoaXMucmVzb2x2ZWRJZHNfW25hbWVdXG4gICAgICApO1xuICAgICAgaWYgKGxpbmtlclZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IGRpY3QoKTtcbiAgICAgICAgcGFyYW1zW25hbWVdID0gbGlua2VyVmFsdWU7XG4gICAgICAgIHJldHVybiBhZGRNaXNzaW5nUGFyYW1zVG9VcmwodXJsLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHRvIHNlZSBpZiB0aGUgdXJsIGlzIGEgbWF0Y2ggZm9yIHRoZSBnaXZlbiBzZXQgb2YgZG9tYWlucy5cbiAgICogQHBhcmFtIHtMb2NhdGlvbn0gbG9jYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBnaXZlbiBpbiBsaW5rZXIgY29uZmlnLlxuICAgKiBAcGFyYW0geyFPYmplY3R9IGNvbmZpZ1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNEb21haW5NYXRjaF8obG9jYXRpb24sIG5hbWUsIGNvbmZpZykge1xuICAgIGNvbnN0IC8qKiBAdHlwZSB7QXJyYXl9ICovIGRvbWFpbnMgPSBjb25maWdbJ2Rlc3RpbmF0aW9uRG9tYWlucyddO1xuICAgIGNvbnN0IHtob3N0bmFtZX0gPSBsb2NhdGlvbjtcbiAgICAvLyBEb24ndCBhcHBlbmQgbGlua2VyIGZvciBleGFjdCBkb21haW4gbWF0Y2gsIHJlbGF0aXZlIHVybHMsIG9yXG4gICAgLy8gZnJhZ21lbnRzLlxuICAgIGNvbnN0IHdpbkhvc3RuYW1lID0gV2luZG93SW50ZXJmYWNlLmdldEhvc3RuYW1lKHRoaXMuYW1wZG9jXy53aW4pO1xuICAgIGNvbnN0IHNhbWVEb21haW4gPSBjb25maWdbJ3NhbWVEb21haW5FbmFibGVkJ107XG4gICAgaWYgKCFCb29sZWFuKHNhbWVEb21haW4pICYmIHdpbkhvc3RuYW1lID09PSBob3N0bmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIGdpdmVuIGRvbWFpbnMsIGJ1dCBub3QgaW4gdGhlIHJpZ2h0IGZvcm1hdC5cbiAgICBpZiAoZG9tYWlucyAmJiAhQXJyYXkuaXNBcnJheShkb21haW5zKSkge1xuICAgICAgdXNlcigpLndhcm4oVEFHLCAnJXMgZGVzdGluYXRpb25Eb21haW5zIG11c3QgYmUgYW4gYXJyYXkuJywgbmFtZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgZGVzdGluYXRpb25Eb21haW4gaXMgc3BlY2lmaWVkIHNwZWNpZmljYWxseSwgcmVzcGVjdCBpdC5cbiAgICBpZiAoZG9tYWlucykge1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdGluYXRpb25Eb21haW5zTWF0Y2hfKGRvbWFpbnMsIGhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICAvLyBGYWxsYmFjayB0byBkZWZhdWx0IGJlaGF2aW9yXG4gICAgY29uc3Qge2Nhbm9uaWNhbFVybCwgc291cmNlVXJsfSA9IFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmFtcGRvY18pO1xuICAgIGNvbnN0IGNhbm9uaWNhbE9yaWdpbiA9IHRoaXMudXJsU2VydmljZV8ucGFyc2UoY2Fub25pY2FsVXJsKS5ob3N0bmFtZTtcbiAgICBjb25zdCBpc0ZyaWVuZGx5Q2Fub25pY2FsT3JpZ2luID0gYXJlRnJpZW5kbHlEb21haW5zKFxuICAgICAgY2Fub25pY2FsT3JpZ2luLFxuICAgICAgaG9zdG5hbWVcbiAgICApO1xuICAgIC8vIERlZmF1bHQgdG8gYWxsIHN1YmRvbWFpbnMgbWF0Y2hpbmcgKGlmIHRoZXJlJ3Mgb25lKSBwbHVzIGNhbm9uaWNhbE9yaWdpblxuXG4gICAgaWYgKHRoaXMuaGlnaGVzdEF2YWlsYWJsZURvbWFpbl8pIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9uRG9tYWluID0gW1xuICAgICAgICB0aGlzLmhpZ2hlc3RBdmFpbGFibGVEb21haW5fLFxuICAgICAgICAnKicgKyB0aGlzLmhpZ2hlc3RBdmFpbGFibGVEb21haW5fLFxuICAgICAgXTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuZGVzdGluYXRpb25Eb21haW5zTWF0Y2hfKGRlc3RpbmF0aW9uRG9tYWluLCBob3N0bmFtZSkgfHxcbiAgICAgICAgaXNGcmllbmRseUNhbm9uaWNhbE9yaWdpblxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBJbiB0aGUgY2FzZSB3aGVyZSBoaWdoZXN0QXZhaWxhYmxlRG9tYWluIGNhbm5vdCBiZSBmb3VuZC5cbiAgICAvLyAocHJveHlPcmlnaW4sIG5vIDxtZXRhIG5hbWU9J2FtcC1jb29raWUtc2NvcGUnPiBmb3VuZClcbiAgICAvLyBkZWZhdWx0IHRvIGZyaWVuZGx5IGRvbWFpbiBtYXRjaGluZy5cbiAgICBjb25zdCBzb3VyY2VPcmlnaW4gPSB0aGlzLnVybFNlcnZpY2VfLnBhcnNlKHNvdXJjZVVybCkuaG9zdG5hbWU7XG4gICAgcmV0dXJuIChcbiAgICAgIGFyZUZyaWVuZGx5RG9tYWlucyhzb3VyY2VPcmlnaW4sIGhvc3RuYW1lKSB8fCBpc0ZyaWVuZGx5Q2Fub25pY2FsT3JpZ2luXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPbmx5IG1hdGNoaW5nIHByb3RvY29scyBzaG91bGQgdXNlIExpbmtlciBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0ge0xvY2F0aW9ufSBsb2NhdGlvblxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNQcm90b2NvbE1hdGNoXyhsb2NhdGlvbikge1xuICAgIHJldHVybiBsb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHBzOicgfHwgbG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwOic7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIG1ldGhvZCB0byBmaW5kIG91dCBpZiBob3N0bmFtZSBtYXRjaCB0aGUgZGVzdGluYXRpb25Eb21haW4gYXJyYXkuXG4gICAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZG9tYWluc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gaG9zdG5hbWVcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGRlc3RpbmF0aW9uRG9tYWluc01hdGNoXyhkb21haW5zLCBob3N0bmFtZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZG9tYWlucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZG9tYWluID0gZG9tYWluc1tpXTtcbiAgICAgIC8vIEV4YWN0IG1hdGNoLlxuICAgICAgaWYgKGRvbWFpbiA9PT0gaG9zdG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICAvLyBBbGxvdyB3aWxkY2FyZCBzdWJkb21haW4gbWF0Y2hpbmcuXG4gICAgICBpZiAoZG9tYWluLmluZGV4T2YoJyonKSAhPT0gLTEgJiYgaXNXaWxkQ2FyZE1hdGNoKGhvc3RuYW1lLCBkb21haW4pKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgY2FsbGJhY2sgdGhhdCB3aWxsIGhhbmRsZSBmb3JtIHN1bWJpdHMuXG4gICAqL1xuICBlbmFibGVGb3JtU3VwcG9ydF8oKSB7XG4gICAgaWYgKHRoaXMuZm9ybVN1Ym1pdFVubGlzdGVuZXJfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5mb3JtU3VibWl0U2VydmljZV8udGhlbigoZm9ybVNlcnZpY2UpID0+IHtcbiAgICAgIHRoaXMuZm9ybVN1Ym1pdFVubGlzdGVuZXJfID0gZm9ybVNlcnZpY2UuYmVmb3JlU3VibWl0KFxuICAgICAgICB0aGlzLmhhbmRsZUZvcm1TdWJtaXRfLmJpbmQodGhpcylcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgdG8gc2VlIGlmIGFueSBsaW5rZXIgY29uZmlncyBtYXRjaCB0aGlzIGZvcm0ncyB1cmwsIGlmIHNvLCBzZW5kXG4gICAqIGFsb25nIHRoZSByZXNvbHZlZCBsaW5rZXIgdmFsdWVcbiAgICogQHBhcmFtIHshLi4vLi4vYW1wLWZvcm0vMC4xL2Zvcm0tc3VibWl0LXNlcnZpY2UuRm9ybVN1Ym1pdEV2ZW50RGVmfSBldmVudFxuICAgKi9cbiAgaGFuZGxlRm9ybVN1Ym1pdF8oZXZlbnQpIHtcbiAgICBjb25zdCB7YWN0aW9uWGhyTXV0YXRvciwgZm9ybX0gPSBldmVudDtcblxuICAgIGZvciAoY29uc3QgbGlua2VyTmFtZSBpbiB0aGlzLmNvbmZpZ18pIHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnX1tsaW5rZXJOYW1lXTtcblxuICAgICAgY29uc3QgdXJsID1cbiAgICAgICAgZm9ybS5nZXRBdHRyaWJ1dGUoJ2FjdGlvbi14aHInKSB8fCBmb3JtLmdldEF0dHJpYnV0ZSgnYWN0aW9uJyk7XG4gICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMudXJsU2VydmljZV8ucGFyc2UodXJsKTtcbiAgICAgIGlmICh0aGlzLmlzRG9tYWluTWF0Y2hfKGxvY2F0aW9uLCBsaW5rZXJOYW1lLCBjb25maWcpKSB7XG4gICAgICAgIHRoaXMuYWRkRGF0YVRvRm9ybV8oZm9ybSwgYWN0aW9uWGhyTXV0YXRvciwgbGlua2VyTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgbGlua2VyIGRhdGEgdG8gZm9ybS4gSWYgYWN0aW9uLXhociBpcyBwcmVzZW50IHdlIGNhbiB1cGRhdGUgdGhlXG4gICAqIGFjdGlvbi14aHIsIGlmIG5vdCB3ZSBmYWxsYmFjayB0byBhZGRpbmcgaGlkZGVuIGlucHV0cy5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZm9ybVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZyl9IGFjdGlvblhock11dGF0b3JcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxpbmtlck5hbWVcbiAgICogQHJldHVybiB7Kn0gVE9ETygjMjM1ODIpOiBTcGVjaWZ5IHJldHVybiB0eXBlXG4gICAqL1xuICBhZGREYXRhVG9Gb3JtXyhmb3JtLCBhY3Rpb25YaHJNdXRhdG9yLCBsaW5rZXJOYW1lKSB7XG4gICAgY29uc3QgaWRzID0gdGhpcy5yZXNvbHZlZElkc19bbGlua2VyTmFtZV07XG4gICAgaWYgKCFpZHMpIHtcbiAgICAgIC8vIEZvcm0gd2FzIGNsaWNrZWQgYmVmb3JlIG1hY3JvcyByZXNvbHZlZC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5rZXJWYWx1ZSA9IGNyZWF0ZUxpbmtlcigvKiB2ZXJzaW9uICovICcxJywgaWRzKTtcblxuICAgIC8vIFJ1bnRpbWUgY29udHJvbHMgc3VibWl0cyB3aXRoIGBhY3Rpb24teGhyYCwgc28gd2UgY2FuIGFwcGVuZCB0aGUgbGlua2VyXG4gICAgLy8gcGFyYW1cbiAgICBjb25zdCBhY3Rpb25YaHJVcmwgPSBmb3JtLmdldEF0dHJpYnV0ZSgnYWN0aW9uLXhocicpO1xuICAgIGlmIChhY3Rpb25YaHJVcmwpIHtcbiAgICAgIGNvbnN0IGRlY29yYXRlZFVybCA9IGFkZFBhcmFtVG9VcmwoYWN0aW9uWGhyVXJsLCBsaW5rZXJOYW1lLCBsaW5rZXJWYWx1ZSk7XG4gICAgICByZXR1cm4gYWN0aW9uWGhyTXV0YXRvcihkZWNvcmF0ZWRVcmwpO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGFyZSBub3QgdXNpbmcgYGFjdGlvbi14aHJgIGl0IG11c3QgYmUgYSBHRVQgcmVxdWVzdCB1c2luZyB0aGVcbiAgICAvLyBzdGFuZGFyZCBhY3Rpb24gYXR0cmlidXRlLiBCcm93c2VycyB3aWxsIG5vdCBsZXQgeW91IGNoYW5nZSB0aGlzIGluIHRoZVxuICAgIC8vIG1pZGRsZSBvZiBhIHN1Ym1pdCwgc28gd2UgYWRkIHRoZSBpbnB1dCBoaWRkZW4gYXR0cmlidXRlcy5cbiAgICB0aGlzLmFkZEhpZGRlbklucHV0c18oZm9ybSwgbGlua2VyTmFtZSwgbGlua2VyVmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgbGlua2VyIHBhaXJzIGFzIDxpbnB1dD4gZWxlbWVudHMgdG8gZm9ybS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZm9ybVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGlua2VyTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGlua2VyVmFsdWVcbiAgICovXG4gIGFkZEhpZGRlbklucHV0c18oZm9ybSwgbGlua2VyTmFtZSwgbGlua2VyVmFsdWUpIHtcbiAgICBjb25zdCBhdHRycyA9IGRpY3Qoe1xuICAgICAgJ3R5cGUnOiAnaGlkZGVuJyxcbiAgICAgICduYW1lJzogbGlua2VyTmFtZSxcbiAgICAgICd2YWx1ZSc6IGxpbmtlclZhbHVlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgaW5wdXRFbCA9IGNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyhcbiAgICAgIC8qKiBAdHlwZSB7IURvY3VtZW50fSAqLyAoZm9ybS5vd25lckRvY3VtZW50KSxcbiAgICAgICdpbnB1dCcsXG4gICAgICBhdHRyc1xuICAgICk7XG4gICAgZm9ybS5hcHBlbmRDaGlsZChpbnB1dEVsKTtcbiAgfVxufVxuXG4vKipcbiAqIERvbWFpbnMgYXJlIGNvbnNpZGVyZWQgdG8gYmUgZnJpZW5kcyBpZiB0aGV5IGFyZSBpZGVudGljYWxcbiAqIGFmdGVyIHJlbW92aW5nIHRoZXNlIHByZWZpeGVzOiBtLiB3d3cuIGFtcC5cbiAqIFVSTCBzY2hlbWUgJiBwb3J0IGFyZSBub3QgdGFrZW4gaW50byBjb25zaWRlcmF0aW9uLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGFsZ29yaXRobSB3aWxsIGJyZWFrIGNvcm5lciBjYXNlcyBsaWtlXG4gKiAgIHd3dy5jb20gdnMgYW1wLmNvbSB2cyBtLmNvbVxuICogT3JcbiAqICAgYW1wLndvcmRwcmVzcy5jb20gdnMgd3d3LndvcmRwcmVzcy5jb21cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZG9tYWluMVxuICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbjJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFyZUZyaWVuZGx5RG9tYWlucyhkb21haW4xLCBkb21haW4yKSB7XG4gIHJldHVybiBnZXRCYXNlRG9tYWluKGRvbWFpbjEpID09PSBnZXRCYXNlRG9tYWluKGRvbWFpbjIpO1xufVxuXG4vKipcbiAqIFN0cmlwcyBvdXQgYWxsIHByZWZpeGluZyBtLiB3d3cuIGFtcC4gZnJvbSBhIGRvbWFpbiBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpblxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRCYXNlRG9tYWluKGRvbWFpbikge1xuICByZXR1cm4gZG9tYWluLnJlcGxhY2UoL14oPzp3d3dcXC58bVxcLnxhbXBcXC4pKy8sICcnKTtcbn1cblxuLyoqXG4gKiBFc2NhcGUgYW55IHJlZ2V4IGZsYWdzIG90aGVyIHRoYW4gYCpgXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAqL1xuZnVuY3Rpb24gcmVnZXhFc2NhcGUoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvWy1cXC9cXFxcXiQrPy4oKXxbXFxde31dL2csICdcXFxcJCYnKTtcbn1cblxuLyoqXG4gKiBBbGxvd3Mgc3BlY2lmaWVkIHdpbGRjYXJkIG1hdGNoaW5nIG9mIGRvbWFpbnMuXG4gKiBFeGFtcGxlOlxuICogICAgYCouZm9vLmNvbWAgbWF0Y2hlcyBgYW1wLmZvby5jb21gXG4gKiAgICBgKi5mb28uY29tKmAgbWF0Y2hlcyBgYW1wLmZvby5jb20udWtgXG4gKiBAcGFyYW0ge3N0cmluZ30gaG9zdG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzV2lsZENhcmRNYXRjaChob3N0bmFtZSwgZG9tYWluKSB7XG4gIGNvbnN0IGVzY2FwZWQgPSByZWdleEVzY2FwZShkb21haW4pO1xuICBjb25zdCByZWdleCA9IGVzY2FwZWQucmVwbGFjZSgvXFwqL2csICcuKicpO1xuICByZXR1cm4gbmV3IFJlZ0V4cCgnXicgKyByZWdleCArICckJykudGVzdChob3N0bmFtZSk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/linker-manager.js