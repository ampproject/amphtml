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

import {addParamsToUrl, parseUrl} from '../../../src/url';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {getSocialConfig} from './amp-social-share-config';
import {isLayoutSizeDefined} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {openWindowDialog} from '../../../src/dom';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {CSS} from '../../../build/amp-social-share-0.1.css';
import {platformFor} from '../../../src/platform';

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
    user().assert(!/\s/.test(typeAttr),
        'Space characters are not allowed in type attribute value. %s',
        this.element);
    const typeConfig = getSocialConfig(typeAttr) || {};

    /** @private @const {string} */
    this.shareEndpoint_ = user().assert(
        this.element.getAttribute('data-share-endpoint') ||
        typeConfig.shareEndpoint,
        'The data-share-endpoint attribute is required. %s', this.element);

    /** @private @const {!Object} */
    this.params_ = Object.assign({}, typeConfig.defaultParams,
        getDataParamsFromAttributes(this.element));

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = platformFor(this.win);

    /** @private {string} */
    this.href_ = null;

    /** @private {string} */
    this.target_ = null;

    const hrefWithVars = addParamsToUrl(this.shareEndpoint_, this.params_);
    const urlReplacements = urlReplacementsFor(this.win);
    urlReplacements.expandAsync(hrefWithVars).then(href => {
      this.href_ = href;
      // mailto: protocol breaks when opened in _blank on iOS Safari.
      const isMailTo = /^mailto:$/.test(parseUrl(href).protocol);
      const isIosSafari = this.platform_.isIos() && this.platform_.isSafari();
      this.target_ = (isIosSafari && isMailTo) ? '_self' : '_blank';
    });

    this.element.setAttribute('role', 'link');
    this.element.addEventListener('click', () => this.handleClick_());
    this.element.classList.add(`amp-social-share-${typeAttr}`);
  }

  /** @private */
  handleClick_() {
    if (!this.href_) {
      dev().error(TAG, 'Clicked before href is set.');
      return;
    }
    const windowFeatures = 'resizable,scrollbars,width=640,height=480';

    openWindowDialog(this.win, this.href_, this.target_, windowFeatures);
  }

};

AMP.registerElement('amp-social-share', AmpSocialShare, CSS);
