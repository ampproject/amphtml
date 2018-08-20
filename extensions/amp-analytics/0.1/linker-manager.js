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

import {ExpansionOptions} from './variables';
import {Priority} from '../../../src/service/navigation';
import {Services} from '../../../src/services';
import {addParamToUrl} from '../../../src/url';
import {createLinker} from './linker';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';

const TAG = 'amp-analytics-linker';

export class LinkerManager {

  /**
   * @param {./amp-analytics.AmpAnalytics} analytics
   * @param {JsonObject} config
   */
  constructor(analytics, config) {
    /** @private */
    this.analytics_ = analytics;

    /** @private {!Object} */
    this.config_ = config;

    /** @private {!Array<Promise>} @visibleForTesting */
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
    dev().assert(linkerNames.length,
        `${TAG}: use of "linkers" requires at least one name given.`);

    // Each linker config has it's own set of macros to resolve.
    this.allLinkerPromises_ = linkerNames.map(name => {
      const ids = this.config_['linkers'][name]['ids'];

      dev().assert(ids,
          `${TAG}: "ids" is a required field for use of "linkers".`);

      // Keys for linker data.
      const keys = Object.keys(ids);
      // Expand the value of each key value pair (if necessary).
      const valuePromises = keys.map(key => {
        const expansionOptions = new ExpansionOptions(this.config_['vars'],
            /* opt_iterations */ undefined,
            /* opt_noencode */ true);
        return this.analytics_.expandTemplateWithUrlParams(ids[key],
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

    const navigation = Services.navigationForDoc(this.analytics_.element);
    navigation.registerAnchorMutator(
        this.linkerCallback_.bind(this), Priority.LINKER);
  }


  /**
   * Called on click on any anchor element. Adds linker param if a match for
   * given linker configuration.
   * @param {!Element} element
   * @private
   */
  linkerCallback_(element) {
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
    const isProxyOrigin = Services.urlForDoc(this.analytics_.element)
        .isProxyOrigin(href);
    if (config['proxyOnly'] && !isProxyOrigin) {
      return;
    }

    // If no domains given, default to canonical and source.
    let domains = config['destinationDomains'];
    if (!domains) {
      const {sourceUrl, canonicalUrl} = Services.documentInfoForDoc(
          this.analytics_.element);

      domains = [sourceUrl, canonicalUrl];
    }

    // See if any domains match.
    for (let i = 0; i < domains.length; i++) {
      if (domains[i] === hostname) {
        const newUrl = addParamToUrl(href, name, this.resolvedLinkers_[name]);
        el.href = newUrl;
        // If we find a match we can quit.
        return;
      }
    }
  }
}
