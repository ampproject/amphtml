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
import {getDataParamsFromAttributes} from '../../../src/dom';
import {getSocialConfig} from './amp-social-share-config';
import {isLayoutSizeDefined} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {openWindowDialog} from '../../../src/dom';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {CSS} from '../../../build/amp-social-share-0.1.css';

/** @const */
const TAG = 'amp-social-share';

class AmpSocialShare extends AMP.BaseElement {

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  buildCallback() {
    const typeAttr = user().assert(this.element.getAttribute('type'),
        'The type attribute is required. %s', this.element);
    const typeConfig = getSocialConfig(typeAttr) || {};

    /** @private @const {string} */
    this.shareEndpoint_ = user().assert(
        this.element.getAttribute('data-share-endpoint') ||
        typeConfig.shareEndpoint,
        'The data-share-endpoint attribute is required. %s', this.element);

    /** @private @const {!Object} */
    this.params_ = Object.assign({}, typeConfig.defaultParams,
        getDataParamsFromAttributes(this.element));

    /** @private {string} */
    this.href_ = null;
    const hrefWithVars = addParamsToUrl(this.shareEndpoint_, this.params_);
    const urlReplacements = urlReplacementsFor(this.win);
    urlReplacements.expand(hrefWithVars).then(href => {
      this.href_ = href;
    });

    this.element.setAttribute('role', 'link');
    this.element.addEventListener('click', () => this.handleClick_());
  }

  /** @private */
  handleClick_() {
    if (!this.href_) {
      dev().error(TAG, 'Clicked before href is set.');
      return;
    }
    const windowFeatures = 'resizable,scrollbars,width=640,height=480';
    openWindowDialog(this.win, this.href_, '_blank', windowFeatures);
  }

};

AMP.registerElement('amp-social-share', AmpSocialShare, CSS);
