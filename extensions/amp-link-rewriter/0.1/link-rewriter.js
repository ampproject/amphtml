/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {getConfigOpts} from './config-options';
import {getDataParamsFromAttributes} from '../../../src/dom';

const WL_ANCHOR_ATTR = [
  'href',
  'id',
  'rel',
  'rev',
];
const PREFIX_DATA_ATTR = /^vars(.+)/;
const REG_DOMAIN_URL = /^https?:\/\/(www\.)?([^\/:]*)(:\d+)?(\/.*)?$/;
const PAGE_PROP_WHITELIST = {
  'SOURCE_URL': true,
  'DOCUMENT_REFERRER': true,
};

export class LinkRewriter {
  /**
   * @param {!AmpElement} ampElement
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   */
  constructor(ampElement, ampDoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = ampDoc;

    /** @private {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.ampDoc_);

    /** @private {?Event} */
    this.event_ = null;

    /** @private {?Object} */
    this.configOpts_ = getConfigOpts(ampElement);

    /** @public {string} */
    this.rewrittenUrl = this.configOpts_.output;

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ = Services.urlReplacementsForDoc(ampElement);
  }

  /**
   * @param {!Event} event
   */
  handleClick(event) {
    this.event_ = event;

    const htmlElement = this.event_.srcElement;
    const sourceTrimmedDomain = Services
        .documentInfoForDoc(this.ampDoc_)
        .sourceUrl.replace(/(www\.)?(.*)/, '$2');
    const canonicalTrimmedDomain = Services
        .documentInfoForDoc(this.ampDoc_)
        .sourceUrl.replace(/(www\.)?(.*)/, '$2');

    if (!htmlElement) {
      return;
    }

    if (this.isInternalLink_(htmlElement, sourceTrimmedDomain)
      || this.isInternalLink_(htmlElement, canonicalTrimmedDomain)) {
      return;
    }

    this.setRedirectUrl_(htmlElement);
  }

  /**
   * Check if the anchor element leads to an internal link
   * @param {?Element} htmlElement
   * @param {?string} trimmedDomain
   * @return {boolean}
   */
  isInternalLink_(htmlElement, trimmedDomain) {
    const href = htmlElement.getAttribute('href');

    return !(href && REG_DOMAIN_URL.test(href) &&
            RegExp.$2 !== trimmedDomain);
  }

  /**
   * @param {!Element} htmlElement
   * return {Promise}
   */
  setRedirectUrl_(htmlElement) {
    const oldValHref = htmlElement.getAttribute('href');

    return this.replacePageProp_().then(() => {
      const {vars} = this.configOpts_;

      if (vars instanceof Object) {
        htmlElement.href = this.replaceVars_(htmlElement, vars);
      }

      this.viewer_.win.setTimeout(() => {
        htmlElement.href = oldValHref;
      }, 500);

    });
  }

  /**
   * @return {Promise}
   */
  replacePageProp_() {
    return this.urlReplacementService_.expandUrlAsync(
        this.rewrittenUrl,
        {},
        PAGE_PROP_WHITELIST
    ).then(value => {
      this.rewrittenUrl = value;

    });
  }

  /**
   * @param {!Element} htmlElement
   * @param {!Object} vars
   * @return {string}
   */
  replaceVars_(htmlElement, vars) {
    /**
     * Merge vars with attributes of the anchor element
     */
    WL_ANCHOR_ATTR.forEach(val => {
      if (htmlElement.getAttribute(val)) {
        vars[val] = htmlElement.getAttribute(val);
      }
    });

    /**
     * Merge with vars object properties and values set on the element
     * 'data attributes' in case these have the save name that the
     * 'vars config property', 'data attributes' values will
     * overwrite 'vars config values'
     */
    const dataset = getDataParamsFromAttributes(
        htmlElement,
        /* computeParamNameFunc */ undefined,
        PREFIX_DATA_ATTR);

    Object.assign(vars, dataset);

    /** add a random value to be use in the output pattern */
    vars['random'] = Math.random().toString(32).substr(2);

    /**
     * Replace placeholders for properties of the document, anchor attributes
     * and 'vars config property' all of them merged in vars
     */
    Object.keys(vars).forEach(key => {
      if (vars[key]) {
        this.rewrittenUrl = this.rewrittenUrl.replace(
            '${' + key + '}',
            encodeURIComponent(vars[key]));
      }
    });

    /**
     * Finally to clean up we leave empty all placeholders that
     * were not replace in previous steps
     */
    this.rewrittenUrl = this.rewrittenUrl
        .replace(/\${[A-Za-z0-9]+}+/, () => {
          return '';
        });

    return this.rewrittenUrl;
  }
}
