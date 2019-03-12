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

import {
  CTX_ATTR_NAME,
  CTX_ATTR_VALUE,
  NS_DATA_PH,
  PREFIX_DATA_ATTR,
  WL_ANCHOR_ATTR,
} from './constants';
import {getConfigOpts} from './config-options';

export class LinkShifter {
  /**
   * @param {!AmpElement} ampElement
   * @param {?../../../src/service/viewer-impl.Viewer} viewer
   */
  constructor(ampElement, viewer) {
    /** @private {?../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewer;

    /** @private {?Event} */
    this.event_ = null;

    /** @private {?Object} */
    this.configOpts_ = getConfigOpts(ampElement);

    /** @private {boolean|number|string} */
    this.ctxAttrValue_ = CTX_ATTR_VALUE().toString();

    /** @private {?RegExp} */
    this.regexDomainUrl_ = /^https?:\/\/(www\.)?([^\/:]*)(:\d+)?(\/.*)?$/;
  }

  /**
   * @param {!Event} event
   */
  clickHandler(event) {
    this.event_ = event;
    const htmlElement = event.srcElement;
    const trimmedDomain = this.viewer_.win.document.domain
        .replace(/(www\.)?(.*)/, '$2');

    // avoid firefox to trigger the event twice (just caution)
    if ((this.event_.type !== 'contextmenu') && (this.event_.button === 2)) {
      return;
    }

    if (this.wasShifted_(htmlElement)) {
      return;
    }

    if (this.isInternalLink(htmlElement, trimmedDomain)) {
      return;
    }

    this.setTrackingUrl_(htmlElement);
  }

  /**
   * Check if the anchor element was already shifted
   * @param {?Element} htmlElement
   * @return {boolean}
   * @private
   */
  wasShifted_(htmlElement) {
    const ctxAttrValue = this.ctxAttrValue_;
    return (htmlElement.hasAttribute(CTX_ATTR_NAME)) &&
        (htmlElement.getAttribute(CTX_ATTR_NAME) === ctxAttrValue);
  }

  /**
   * Check if the anchor element leads to an internal link
   * @param {?Element} htmlElement
   * @param {?string} trimmedDomain
   * @return {boolean}
   */
  isInternalLink(htmlElement, trimmedDomain) {
    const href = htmlElement.getAttribute('href');

    if (!(href && this.regexDomainUrl_.test(href) &&
            RegExp.$2 !== trimmedDomain)
    ) {
      return true;
    }

    return false;
  }

  /**
   *
   * @param {?Element} htmlElement
   */
  setTrackingUrl_(htmlElement) {

    const oldValHref = htmlElement.getAttribute('href');

    this.viewer_.getReferrerUrl().then(referrerUrl => {
      const pageAttributes = {
        referrer: referrerUrl,
        location: this.viewer_.getResolvedViewerUrl(),
      };

      htmlElement.href = this.replacePlaceHolders(htmlElement, pageAttributes);

      // If the link has been "activated" via contextmenu,
      // we have to keep the shifting in mind
      if (this.event_.type === 'contextmenu') {
        this.ctxAttrValue_ = CTX_ATTR_VALUE().toString();
        htmlElement.setAttribute(CTX_ATTR_NAME, this.ctxAttrValue_);
      }

      this.viewer_.win.setTimeout(() => {
        htmlElement.href = oldValHref;

        if (htmlElement.hasAttribute(CTX_ATTR_NAME)) {
          htmlElement.removeAttribute(CTX_ATTR_NAME);
        }

      }, ((this.event_.type === 'contextmenu') ? 15000 : 500));
    });
  }

  /**
   * @param {?Element} htmlElement
   * @param {!Object} pageAttributes
   * @return {string}
   */
  replacePlaceHolders(htmlElement, pageAttributes) {
    const {vars} = this.configOpts_;
    let {output} = this.configOpts_;
    const data = {};

    /**
     * Replace placeholders for anchor attributes
     * defined in white list constant array
     */
    WL_ANCHOR_ATTR.forEach(val => {
      let attrValue = '';

      if (htmlElement.getAttribute(val)) {
        attrValue = htmlElement.getAttribute(val);
      }

      output = output.replace('${' + val + '}', encodeURIComponent(attrValue));
    });

    /**
     * Replace placeholders for properties of the document
     * at the moment only referrer and location
     */
    Object.keys(pageAttributes).forEach(key => {
      let propValue = '';

      if (pageAttributes[key]) {
        propValue = pageAttributes[key];
      }

      output = output.replace('${' + key + '}', encodeURIComponent(propValue));
    });

    /**
     * Set on data object properties and values defined
     * on 'vars config property'
     */
    Object.keys(vars).forEach(key => {
      let confValue = '';

      if (vars[key]) {
        confValue = vars[key];
      }

      data[key] = confValue;
    });

    /**
     * Set on data object properties and values set on the element
     * 'data attributes' in case these have the save name that the
     * 'vars config property', 'data attributes' values will
     * overwrite 'vars config values'
     */
    const {dataset} = htmlElement;
    Object.keys(dataset).forEach(key => {
      const dataValue = dataset[key];
      let dataProp = key.split(PREFIX_DATA_ATTR)[1];

      dataProp = dataProp.replace(/^[A-Z]/, match => {
        return match.toLowerCase();
      });

      data[dataProp] = dataValue;
    });

    /**
     * Replace placeholders under data namespace for values merged of
     * 'vars config property' and 'data attributes'
     */

    Object.keys(data).forEach(key => {
      const placeHoder = '${' + NS_DATA_PH + key + '}';
      output = output.replace(placeHoder, encodeURIComponent(data[key]));
    });

    /**
     * Finally to clean up we leave empty all placeholders that
     * were not replace in previous steps
     */
    output = output.replace(/\${[A-Za-z0-9]+}+/, () => {
      return '';
    });

    return output;
  }
}
