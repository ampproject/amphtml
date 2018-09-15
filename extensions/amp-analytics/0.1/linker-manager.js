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

import {ExpansionOptions, variableServiceFor} from './variables';
import {Priority} from '../../../src/service/navigation';
import {Services} from '../../../src/services';
import {WindowInterface} from '../../../src/window-interface';
import {addParamToUrl} from '../../../src/url';
import {createLinker} from './linker';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {isObject} from '../../../src/types';
import {user} from '../../../src/log';

const TAG = 'amp-analytics/linker-manager';

export class LinkerManager {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {?string} type
   */
  constructor(ampdoc, config, type) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?JsonObject|undefined} */
    this.config_ = config['linkers'];

    /** @private {!JsonObject} */
    this.vars_ = config['vars'] || {};

    /** @private {?string} */
    this.type_ = type;

    /** @private {!Array<Promise>} */
    this.allLinkerPromises_ = [];

    /** @private {!JsonObject} */
    this.resolvedLinkers_ = dict();

    this.urlService_ = Services.urlForDoc(this.ampdoc_);
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

    this.config_ = this.processConfig_(/** @type {!JsonObject} */(this.config_));
    // Each linker config has it's own set of macros to resolve.
    this.allLinkerPromises_ = Object.keys(this.config_).map(name => {
      const ids = this.config_[name]['ids'];
      // Keys for linker data.
      const keys = Object.keys(ids);
      // Expand the value of each key value pair (if necessary).
      const valuePromises = keys.map(key => {
        const expansionOptions = new ExpansionOptions(this.vars_,
            /* opt_iterations */ undefined,
            /* opt_noencode */ true);
        return this.expandTemplateWithUrlParams_(ids[key],
            expansionOptions);
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
        this.resolvedLinkers_[name] =
            createLinker(/* version */ '1', expandedIds);
      });
    });

    if (this.allLinkerPromises_.length) {
      const navigation = Services.navigationForDoc(this.ampdoc_);
      navigation.registerAnchorMutator(
          this.handleAnchorMutation_.bind(this), Priority.ANALYTICS_LINKER);
    }

    return Promise.all(this.allLinkerPromises_);
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
    const isProxyOrigin =
        this.urlService_.isProxyOrigin(location);
    linkerNames.forEach(name => {
      const mergedConfig =
          Object.assign({}, defaultConfig, config[name]);

      if (mergedConfig['enabled'] !== true) {
        user().info(TAG, `linker config for ${name} is not enabled and` +
            'will be ignored.');
        return;
      }

      if (!isProxyOrigin && mergedConfig['proxyOnly'] !== false) {
        return;
      }

      if (!mergedConfig['ids']) {
        user().error(TAG,
            '"ids" is a required field for use of "linkers".');
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
    return variableServiceFor(this.ampdoc_.win)
        .expandTemplate(template, expansionOptions)
        .then(expanded => Services.urlReplacementsForDoc(
            this.ampdoc_).expandUrlAsync(expanded));
  }


  /**
   * If the document has existing cid meta tag they do not need to explicity
   * opt-in to use linker.
   * @return {boolean}
   * @private
   */
  isLegacyOptIn_() {
    if (!isExperimentOn(this.ampdoc_.win, 'linker-meta-opt-in')) {
      return false;
    }

    const optInMeta = this.ampdoc_.win.document.head./*OK*/querySelector(
        'meta[name="amp-google-client-id-api"][content="googleanalytics"]');
    const isGaType = this.type_ === 'googleanalytics';

    return !!(optInMeta && isGaType);
  }

  /**
   * If the browser is Safari 12 or above.
   * @return {boolean}
   * @private
   */
  isSafari12OrAbove_() {
    const platform = Services.platformFor(this.ampdoc_.win);
    return platform.isSafari() && (platform.getMajorVersion() >= 12);
  }

  /**
   * Called on click on any anchor element. Adds linker param if a match for
   * given linker configuration.
   * @param {!Element} element
   * @private
   */
  handleAnchorMutation_(element) {
    if (!element.href) {
      return;
    }

    const linkerConfigs = this.config_;
    for (const linkerName in linkerConfigs) {
      // The linker param is created asynchronously. This callback should be
      // synchronous, so we skip if value is not there yet.
      if (this.resolvedLinkers_[linkerName]) {
        this.maybeAppendLinker_(element, linkerName, linkerConfigs[linkerName]);
      }
    }
  }


  /**
   * Appends the linker param if the given url falls within rules defined in
   * linker configuration.
   * @param {!Element} el
   * @param {string} name
   * @param {!Object} config
   * @private
   */
  maybeAppendLinker_(el, name, config) {
    const {href, hostname} = el;

    const /** @type {Array} */ domains = config['destinationDomains'];
    // If given domains, but not in the right format.
    if (domains && !Array.isArray(domains)) {
      user().warn(TAG, `${name} destinationDomains must be an array.`);
      return;
    }

    // See if any domains match.
    if (domains && !domains.includes(hostname)) {
      return;
    }

    // If no domains given, default to friendly domain matching.
    if (!domains) {
      const {sourceUrl, canonicalUrl} =
          Services.documentInfoForDoc(this.ampdoc_);
      const sourceOrigin = this.urlService_.parse(sourceUrl).hostname;
      const canonicalOrigin = this.urlService_.parse(canonicalUrl).hostname;
      if (!areFriendlyDomains(sourceOrigin, hostname)
          && !areFriendlyDomains(canonicalOrigin, hostname)) {
        return;
      }
    }

    el.href = addParamToUrl(href, name, this.resolvedLinkers_[name]);
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
