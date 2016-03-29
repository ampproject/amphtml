/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {addParamsToUrl} from '../../../src/url';
import {documentInfoFor} from '../../../src/document-info';
import {elementByTag} from '../../../src/dom';
import {getSocialConfig} from './amp-social-share-config';
import {isLayoutSizeDefined, getLengthNumeral,
  Layout} from '../../../src/layout';
import {user} from '../../../src/log';
import {CSS} from '../../../build/amp-social-share-0.1.css';

/** @const {number} */
const DEFAULT_WIDTH = 60;

/** @const {string} */
const TAG = 'AmpSocialShare';

class AmpSocialShare extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED;
  }

  /** @override */
  buildCallback() {
    /** @private @const {!Element} */
    this.type_ = user.assert(this.element.getAttribute('type'),
        'The type attribute is required. %s',
        this.element);

    /** @private @const {!Object} */
    this.typeConfig_ = getSocialConfig(this.type_);

    /** @private @const {!Object} */
    this.config_ = this.getElementConfig_();

    /** @private @const {number} */
    this.width_ = getLengthNumeral(this.element.getAttribute('width'))
        || DEFAULT_WIDTH;

    /** @private @const {number} */
    this.height_ = getLengthNumeral(this.element.getAttribute('height'));

    this.renderShare_();
  }

  /**
   * Renders the share based on the element config.
   * @return {!Element}
   */
  renderShare_() {
    const urlParams = {};

    for (const param in this.typeConfig_['params']) {
      const paramConf = this.typeConfig_['params'][param];
      let paramValue = this.config_[param] || this.getDefaultValue_(
          param, this.config_);
      user.assert(!paramConf['required'] || paramValue !== null,
          param + ' is a required attribute for ' + this.type_ + '. %s',
        this.element);
      if (paramValue == null && paramConf['type'] == 'fixed') {
        paramValue = paramConf['value'];
      }
      if ('maxlength' in paramConf) {
        const maxlength = paramConf['maxlength'];
        user.assert(!paramValue || paramValue.length < maxlength,
            param + ' cannot exceed ' + maxlength + '. %s', this.element);
      }
      if (paramValue != null) {
        urlParams[paramConf['param']] = paramValue;
      }
    }

    // Get the anchor or create one.
    let link = elementByTag(this.element, 'a');
    if (link == null) {
      link = this.getWin().document.createElement('a');
      link.textContent = this.typeConfig_['text'];
      link.setAttribute('target', '_blank');

      // Get the container or create one.
      let container = elementByTag(this.element, 'span');
      if (container == null) {
        container = this.getWin().document.createElement('span');
        container.classList.add(this.type_);

        // Only add the container to the element if it didn't exist
        this.element.appendChild(container);
      }
      container.appendChild(link);
    }

    // Set share url.
    link.setAttribute('href',
      addParamsToUrl(this.typeConfig_['url'], urlParams));
  }

  /**
   * Gets the configuration for the current social element
   * @param {!element} element
   * @return {?Object}
   */
  getElementConfig_() {
    const script = elementByTag(this.element, 'script');
    let config = {};
    if (script) {
      // Get config from script
      try {
        config = JSON.parse(script.textContent);
      } catch (e) {
        user.error(TAG, 'Malformed JSON configuration. %s', this.element);
      }
    } else {
      // Get config from attributes
      for (const param in this.typeConfig_['params']) {
        if (this.element.hasAttribute('data-' + param)) {
          config[param] = this.element.getAttribute('data-' + param);
        }
      }
    }
    return config;
  }

  /**
   * Gets the default value for a given param, if there is one.
   * Otherwise it returns null
   * @param  {!string} param
   * @param  {!Object} config
   * @return {*}
   */
  getDefaultValue_(param, config) {
    if (param in config) {
      return config[param];
    }
    switch (param) {
      case 'url':
        const info = documentInfoFor(this.getWin());
        return info.canonicalUrl;
      case 'text':
        return '';
    }
    return null;
  }
};

AMP.registerElement('amp-social-share', AmpSocialShare, CSS);
