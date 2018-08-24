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
import {addParamToUrl} from '../../../src/url';
import {createLinker} from './linker';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';

const TAG = 'amp-analytics-linker';

/**
 * The name of the Google CID API as it appears in the meta tag to opt-in.
 * @const @private {string}
 */
const GOOGLE_CID_API_META_NAME = 'amp-google-client-id-api';

export class LinkerManager {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {JsonObject} config
   * @param {?string} type
   */
  constructor(ampdoc, config, type) {
    /** @private */
    this.ampdoc_ = ampdoc;

    /** @private {JsonObject} */
    this.config_ = config;

    /** @private {?string} */
    this.type_ = type;

    /** @private {!Array<Promise>} */
    this.allLinkerPromises_ = [];

    /** @private {JsonObject} */
    this.resolvedLinkers_ = dict();
  }


  /**
   * Start resolving any macros that may exist in the linker configuration
   * and register the callback with the navigation service. Since macro
   * resolution is aynchronous the callback may be looking for these values
   * before they are ready.
   */
  init() {
    if (!this.config_['linkers']) {
      return;
    }

    const linkerNames = Object.keys(this.config_['linkers']);

    // Each linker config has it's own set of macros to resolve.
    this.allLinkerPromises_ = linkerNames
        .filter(name => {
          const vendorConfig = this.config_['linkers'][name];
          const isOptIn = this.isLegacyOptIn_();

          if (!isOptIn && vendorConfig['enabled'] !== true) {
            user().info(TAG, `linker config for ${name} is not enabled and` +
                'will be ignored.');
            return false;
          }

          if (!vendorConfig['ids']) {
            user().error(TAG,
                '"ids" is a required field for use of "linkers".');
            return false;
          }

          return true;
        }).map(name => {
          const ids = this.config_['linkers'][name]['ids'];
          // Keys for linker data.
          const keys = Object.keys(ids);
          // Expand the value of each key value pair (if necessary).
          const valuePromises = keys.map(key => {
            const expansionOptions = new ExpansionOptions(this.config_['vars'],
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
          this.handleAnchorMutation.bind(this), Priority.ANALYTICS_LINKER);
    }
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

    const optInMeta = this.ampdoc_.win.document.head
        ./*OK*/querySelector(`meta[name=${GOOGLE_CID_API_META_NAME}]`);
    const isGaType = this.type_ === 'googleanalytics';

    return !!(optInMeta && isGaType);
  }

  /**
   * Called on click on any anchor element. Adds linker param if a match for
   * given linker configuration.
   * @param {!Element} element
   * @visibleForTesting
   */
  handleAnchorMutation(element) {
    if (!element.href) {
      return;
    }

    const linkerConfigs = this.config_['linkers'];
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
    // Not on proxy but proxyOnly option is set.
    const isProxyOrigin = Services.urlForDoc(this.ampdoc_)
        .isProxyOrigin(href);
    if (config['proxyOnly'] && !isProxyOrigin) {
      return;
    }

    let /** @type {Array} */ domains = config['destinationDomains'];
    // If given domains, but not in the right format.
    if (domains && !Array.isArray(domains)) {
      user().warn(TAG, `${name} destinationDomains must be an array.`);
      return;
    }

    // If no domains given, default to canonical and source.
    if (!domains) {
      const {sourceUrl, canonicalUrl} = Services.documentInfoForDoc(
          this.ampdoc_);

      domains = [sourceUrl, canonicalUrl];
    }

    // See if any domains match.
    if (domains.includes(hostname)) {
      const newUrl = addParamToUrl(href, name, this.resolvedLinkers_[name]);
      el.href = newUrl;
    }
  }
}
