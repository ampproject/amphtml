import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function LinkerManager(ampdoc, config, type, element) {_classCallCheck(this, LinkerManager);
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
   */_createClass(LinkerManager, [{ key: "init", value:
    function init() {var _this = this;
      if (!isObject(this.config_)) {
        return _resolvedPromise();
      }

      this.highestAvailableDomain_ = getHighestAvailableDomain(this.ampdoc_.win);

      this.config_ = this.processConfig_(
      /** @type {!JsonObject} */(this.config_));

      // Each linker config has it's own set of macros to resolve.
      var allLinkerPromises = Object.keys(this.config_).map(function (name) {
        var ids = _this.config_[name]['ids'];
        // Keys for linker data.
        var keys = Object.keys(ids);
        // Expand the value of each key value pair (if necessary).
        var valuePromises = keys.map(function (key) {
          var expansionOptions = new ExpansionOptions(
          _this.vars_,
          /* opt_iterations */undefined,
          /* opt_noencode */true);

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
        navigation.registerNavigateToMutator(
        function (url) {return _this.applyLinkers_(url);},
        Priority.ANALYTICS_LINKER);

      }

      this.enableFormSupport_();

      return Promise.all(allLinkerPromises);
    }

    /**
     * Remove any listeners created to manage form submission.
     */ }, { key: "dispose", value:
    function dispose() {
      if (this.formSubmitUnlistener_) {
        this.formSubmitUnlistener_();
      }
    }

    /**
     * @param {!JsonObject} config
     * @return {!JsonObject}
     * @private
     */ }, { key: "processConfig_", value:
    function processConfig_(config) {
      var processedConfig = dict();
      var defaultConfig = {
        enabled: this.isLegacyOptIn_() && this.isSafari12OrAbove_() };

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
        var mergedConfig = _objectSpread(_objectSpread({}, defaultConfig), config[name]);

        if (mergedConfig['enabled'] !== true) {
          user().info(
          TAG,
          'linker config for %s is not enabled and will be ignored.',
          name);

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
     */ }, { key: "expandTemplateWithUrlParams_", value:
    function expandTemplateWithUrlParams_(template, expansionOptions) {var _this2 = this;
      var bindings = this.variableService_.getMacros(this.element_);
      return this.variableService_.
      expandTemplate(template, expansionOptions, this.element_).
      then(function (expanded) {
        var urlReplacements = Services.urlReplacementsForDoc(_this2.element_);
        return urlReplacements.expandUrlAsync(expanded, bindings);
      });
    }

    /**
     * If the document has existing cid meta tag they do not need to explicitly
     * opt-in to use linker.
     * @return {boolean}
     * @private
     */ }, { key: "isLegacyOptIn_", value:
    function isLegacyOptIn_() {
      if (this.type_ !== 'googleanalytics') {
        return false;
      }

      if (
      this.ampdoc_.getMetaByName('amp-google-client-id-api') !==
      'googleanalytics')
      {
        return false;
      }

      return this.ampdoc_.registerSingleton(AMPDOC_SINGLETON_NAME.LINKER);
    }

    /**
     * If the browser is Safari 12 or above.
     * @return {boolean}
     * @private
     */ }, { key: "isSafari12OrAbove_", value:
    function isSafari12OrAbove_() {
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
     */ }, { key: "applyLinkers_", value:
    function applyLinkers_(url) {
      var linkerConfigs = this.config_;
      for (var linkerName in linkerConfigs) {
        // The linker param is created asynchronously. This callback should be
        // synchronous, so we skip if value is not there yet.
        if (this.resolvedIds_[linkerName]) {
          url = this.maybeAppendLinker_(
          url,
          linkerName,
          linkerConfigs[linkerName]);

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
     */ }, { key: "maybeAppendLinker_", value:
    function maybeAppendLinker_(url, name, config) {
      var location = this.urlService_.parse(url);
      if (
      this.isDomainMatch_(location, name, config) &&
      this.isProtocolMatch_(location))
      {
        var linkerValue = createLinker(
        /* version */'1',
        this.resolvedIds_[name]);

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
     */ }, { key: "isDomainMatch_", value:
    function isDomainMatch_(location, name, config) {
      var /** @type {Array} */domains = config['destinationDomains'];
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
      var _Services$documentInf = Services.documentInfoForDoc(this.ampdoc_),canonicalUrl = _Services$documentInf.canonicalUrl,sourceUrl = _Services$documentInf.sourceUrl;
      var canonicalOrigin = this.urlService_.parse(canonicalUrl).hostname;
      var isFriendlyCanonicalOrigin = areFriendlyDomains(
      canonicalOrigin,
      hostname);

      // Default to all subdomains matching (if there's one) plus canonicalOrigin

      if (this.highestAvailableDomain_) {
        var destinationDomain = [
        this.highestAvailableDomain_,
        '*' + this.highestAvailableDomain_];

        return (
        this.destinationDomainsMatch_(destinationDomain, hostname) ||
        isFriendlyCanonicalOrigin);

      }

      // In the case where highestAvailableDomain cannot be found.
      // (proxyOrigin, no <meta name='amp-cookie-scope'> found)
      // default to friendly domain matching.
      var sourceOrigin = this.urlService_.parse(sourceUrl).hostname;
      return (
      areFriendlyDomains(sourceOrigin, hostname) || isFriendlyCanonicalOrigin);

    }

    /**
     * Only matching protocols should use Linker parameters.
     * @param {Location} location
     * @return {boolean}
     */ }, { key: "isProtocolMatch_", value:
    function isProtocolMatch_(location) {
      return location.protocol === 'https:' || location.protocol === 'http:';
    }

    /**
     * Helper method to find out if hostname match the destinationDomain array.
     * @param {Array<string>} domains
     * @param {string} hostname
     * @return {boolean}
     */ }, { key: "destinationDomainsMatch_", value:
    function destinationDomainsMatch_(domains, hostname) {
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
     */ }, { key: "enableFormSupport_", value:
    function enableFormSupport_() {var _this3 = this;
      if (this.formSubmitUnlistener_) {
        return;
      }

      this.formSubmitService_.then(function (formService) {
        _this3.formSubmitUnlistener_ = formService.beforeSubmit(
        _this3.handleFormSubmit_.bind(_this3));

      });
    }

    /**
     * Check to see if any linker configs match this form's url, if so, send
     * along the resolved linker value
     * @param {!../../amp-form/0.1/form-submit-service.FormSubmitEventDef} event
     */ }, { key: "handleFormSubmit_", value:
    function handleFormSubmit_(event) {
      var actionXhrMutator = event.actionXhrMutator,form = event.form;

      for (var linkerName in this.config_) {
        var config = this.config_[linkerName];

        var url =
        form.getAttribute('action-xhr') || form.getAttribute('action');
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
     */ }, { key: "addDataToForm_", value:
    function addDataToForm_(form, actionXhrMutator, linkerName) {
      var ids = this.resolvedIds_[linkerName];
      if (!ids) {
        // Form was clicked before macros resolved.
        return;
      }

      var linkerValue = createLinker( /* version */'1', ids);

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
     */ }, { key: "addHiddenInputs_", value:
    function addHiddenInputs_(form, linkerName, linkerValue) {
      var attrs = dict({
        'type': 'hidden',
        'name': linkerName,
        'value': linkerValue });


      var inputEl = createElementWithAttributes(
      /** @type {!Document} */(form.ownerDocument),
      'input',
      attrs);

      form.appendChild(inputEl);
    } }]);return LinkerManager;}();


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
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/linker-manager.js