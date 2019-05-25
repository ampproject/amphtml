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

import {ExpansionOptions, variableServiceForDoc} from './variables';
import {Priority} from '../../../src/service/navigation';
import {Services} from '../../../src/services';
import {WindowInterface} from '../../../src/window-interface';
import {addMissingParamsToUrl, addParamToUrl} from '../../../src/url';
import {createElementWithAttributes} from '../../../src/dom';
import {createLinker} from './linker';
import {dict} from '../../../src/utils/object';
import {isObject} from '../../../src/types';
import {user} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-analytics/linker-manager';

/** @const {string} */
const LINKER_CREATED = 'i-amphtml-linker-created';

export class LinkerManager {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {?string} type
   * @param {!Element} element
   */
  constructor(ampdoc, config, type, element) {
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

    /** @private {!Array<Promise>} */
    this.allLinkerPromises_ = [];

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
  }

  /**
   * Start resolving any macros that may exist in the linker configuration
   * and register the callback with the navigation service. Since macro
   * resolution is asynchronous the callback may be looking for these values
   * before they are ready.
   */
  init() {
    if (!isObject(this.config_)) {
      return;
    }

    this.config_ = this.processConfig_(
      /** @type {!JsonObject} */ (this.config_)
    );
    // Each linker config has it's own set of macros to resolve.
    this.allLinkerPromises_ = Object.keys(this.config_).map(name => {
      const ids = this.config_[name]['ids'];
      // Keys for linker data.
      const keys = Object.keys(ids);
      // Expand the value of each key value pair (if necessary).
      const valuePromises = keys.map(key => {
        const expansionOptions = new ExpansionOptions(
          this.vars_,
          /* opt_iterations */ undefined,
          /* opt_noencode */ true
        );
        return this.expandTemplateWithUrlParams_(ids[key], expansionOptions);
      });

      return Promise.all(valuePromises).then(values => {
        // Rejoin each key with its expanded value.
        const expandedIds = {};
        values.forEach((value, i) => {
          // Omit pair if value resolves to empty.
          if (value) {
            expandedIds[keys[i]] = value;
          }
        });
        this.resolvedIds_[name] = expandedIds;
      });
    });

    if (this.allLinkerPromises_.length) {
      const navigation = Services.navigationForDoc(this.ampdoc_);
      navigation.registerAnchorMutator((element, event) => {
        if (!element.href || event.type !== 'click') {
          return;
        }
        element.href = this.applyLinkers_(element.href);
      }, Priority.ANALYTICS_LINKER);
      navigation.registerNavigateToMutator(
        url => this.applyLinkers_(url),
        Priority.ANALYTICS_LINKER
      );
    }

    this.enableFormSupport_();

    return Promise.all(this.allLinkerPromises_);
  }

  /**
   * Remove any listeners created to manage form submission.
   */
  dispose() {
    if (this.formSubmitUnlistener_) {
      this.formSubmitUnlistener_();
    }
  }

  /**
   * @param {!JsonObject} config
   * @return {!JsonObject}
   * @private
   */
  processConfig_(config) {
    const processedConfig = dict();
    const defaultConfig = {
      enabled: this.isLegacyOptIn_() && this.isSafari12OrAbove_(),
    };
    const linkerNames = Object.keys(config).filter(key => {
      const value = config[key];
      const isLinkerConfig = isObject(value);
      if (!isLinkerConfig) {
        defaultConfig[key] = value;
      }
      return isLinkerConfig;
    });

    const location = WindowInterface.getLocation(this.ampdoc_.win);
    const isProxyOrigin = this.urlService_.isProxyOrigin(location);
    linkerNames.forEach(name => {
      const mergedConfig = Object.assign({}, defaultConfig, config[name]);

      if (mergedConfig['enabled'] !== true) {
        user().info(
          TAG,
          'linker config for %s is not enabled and will be ignored.',
          name
        );
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
  expandTemplateWithUrlParams_(template, expansionOptions) {
    const bindings = this.variableService_.getMacros();
    return this.variableService_
      .expandTemplate(template, expansionOptions)
      .then(expanded => {
        const urlReplacements = Services.urlReplacementsForDoc(this.element_);
        return urlReplacements.expandUrlAsync(expanded, bindings);
      });
  }

  /**
   * If the document has existing cid meta tag they do not need to explicity
   * opt-in to use linker.
   * @return {boolean}
   * @private
   */
  isLegacyOptIn_() {
    const optInMeta = this.ampdoc_.win.document.head./*OK*/ querySelector(
      'meta[name="amp-google-client-id-api"][content="googleanalytics"]'
    );
    if (
      !optInMeta ||
      optInMeta.hasAttribute(LINKER_CREATED) ||
      this.type_ !== 'googleanalytics'
    ) {
      return false;
    }

    optInMeta.setAttribute(LINKER_CREATED, '');
    return true;
  }

  /**
   * If the browser is Safari 12 or above.
   * @return {boolean}
   * @private
   */
  isSafari12OrAbove_() {
    const platform = Services.platformFor(this.ampdoc_.win);
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
  applyLinkers_(url) {
    const linkerConfigs = this.config_;
    for (const linkerName in linkerConfigs) {
      // The linker param is created asynchronously. This callback should be
      // synchronous, so we skip if value is not there yet.
      if (this.resolvedIds_[linkerName]) {
        url = this.maybeAppendLinker_(
          url,
          linkerName,
          linkerConfigs[linkerName]
        );
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
  maybeAppendLinker_(url, name, config) {
    const /** @type {Array} */ domains = config['destinationDomains'];
    if (this.isDomainMatch_(url, name, domains)) {
      const linkerValue = createLinker(
        /* version */ '1',
        this.resolvedIds_[name]
      );
      if (linkerValue) {
        const params = dict();
        params[name] = linkerValue;
        return addMissingParamsToUrl(url, params);
      }
    }
    return url;
  }

  /**
   * Check to see if the url is a match for the given set of domains.
   * @param {string} url
   * @param {string} name Name given in linker config.
   * @param {?Array} domains
   */
  isDomainMatch_(url, name, domains) {
    const {hostname} = this.urlService_.parse(url);
    // If given domains, but not in the right format.
    if (domains && !Array.isArray(domains)) {
      user().warn(TAG, '%s destinationDomains must be an array.', name);
      return false;
    }

    // If domains are given we check for exact match or wildcard match.
    if (domains) {
      for (let i = 0; i < domains.length; i++) {
        const domain = domains[i];
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

    // If no domains given, default to friendly domain matching.
    // Don't append linker for exact domain match, relative urls, or
    // fragments.
    const winHostname = WindowInterface.getHostname(this.ampdoc_.win);
    if (winHostname === hostname) {
      return false;
    }

    const {sourceUrl, canonicalUrl} = Services.documentInfoForDoc(this.ampdoc_);
    const sourceOrigin = this.urlService_.parse(sourceUrl).hostname;
    const canonicalOrigin = this.urlService_.parse(canonicalUrl).hostname;
    return (
      areFriendlyDomains(sourceOrigin, hostname) ||
      areFriendlyDomains(canonicalOrigin, hostname)
    );
  }

  /**
   * Register callback that will handle form sumbits.
   */
  enableFormSupport_() {
    if (this.formSubmitUnlistener_) {
      return;
    }

    this.formSubmitService_.then(formService => {
      this.formSubmitUnlistener_ = formService.beforeSubmit(
        this.handleFormSubmit_.bind(this)
      );
    });
  }

  /**
   * Check to see if any linker configs match this form's url, if so, send
   * along the resolved linker value
   * @param {!../../amp-form/0.1/form-submit-service.FormSubmitEventDef} event
   */
  handleFormSubmit_(event) {
    const {form, actionXhrMutator} = event;

    for (const linkerName in this.config_) {
      const config = this.config_[linkerName];
      const /** @type {Array} */ domains = config['destinationDomains'];

      const url =
        form.getAttribute('action-xhr') || form.getAttribute('action');

      if (this.isDomainMatch_(url, linkerName, domains)) {
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
   */
  addDataToForm_(form, actionXhrMutator, linkerName) {
    const ids = this.resolvedIds_[linkerName];
    if (!ids) {
      // Form was clicked before macros resolved.
      return;
    }

    const linkerValue = createLinker(/* version */ '1', ids);

    // Runtime controls submits with `action-xhr`, so we can append the linker
    // param
    const actionXhrUrl = form.getAttribute('action-xhr');
    if (actionXhrUrl) {
      const decoratedUrl = addParamToUrl(actionXhrUrl, linkerName, linkerValue);
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
  addHiddenInputs_(form, linkerName, linkerValue) {
    const attrs = dict({
      'type': 'hidden',
      'name': linkerName,
      'value': linkerValue,
    });

    const inputEl = createElementWithAttributes(
      /** @type {!Document} */ (form.ownerDocument),
      'input',
      attrs
    );
    form.appendChild(inputEl);
  }
}

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
  const escaped = regexEscape(domain);
  const regex = escaped.replace(/\*/g, '.*');
  return new RegExp('^' + regex + '$').test(hostname);
}
