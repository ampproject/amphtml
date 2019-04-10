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

import {CSS} from '../../../build/amp-social-share-0.1.css';
import {Keys} from '../../../src/utils/key-codes';
import {Services} from '../../../src/services';
import {addParamsToUrl, parseQueryString} from '../../../src/url';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getDataParamsFromAttributes, openWindowDialog} from '../../../src/dom';
import {getSocialConfig} from './amp-social-share-config';
import {toggle} from '../../../src/style';


class AmpSocialShare extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {?string} */
    this.shareEndpoint_ = null;

    /** @private @const {!JsonObject} */
    this.params_ = dict();

    /** @private {?../../../src/service/platform-impl.Platform} */
    this.platform_ = null;

    /** @private {?../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = null;

    /** @private {?string} */
    this.href_ = null;

    /** @private {?string} */
    this.target_ = null;
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    const typeAttr = userAssert(element.getAttribute('type'),
        'The type attribute is required. %s', element);
    userAssert(!/\s/.test(typeAttr),
        'Space characters are not allowed in type attribute value. %s',
        element);

    this.platform_ = Services.platformFor(this.win);
    this.viewer_ = Services.viewerForDoc(element);

    if (typeAttr === 'system') {
      // Hide/ignore system component if navigator.share unavailable
      if (!this.systemShareSupported_()) {
        toggle(element, false);
        return;
      }
    } else {
      // Hide/ignore non-system component if system share wants to be unique
      const systemOnly = this.systemShareSupported_() &&
        !!this.win.document.querySelectorAll(
            'amp-social-share[type=system][data-mode=replace]').length;
      if (systemOnly) {
        toggle(element, false);
        return;
      }
    }
    const typeConfig = getSocialConfig(typeAttr) || dict();
    this.shareEndpoint_ = userAssert(
        element.getAttribute('data-share-endpoint') ||
        typeConfig['shareEndpoint'],
        'The data-share-endpoint attribute is required. %s', element);
    Object.assign(this.params_, typeConfig['defaultParams'],
        getDataParamsFromAttributes(element));

    const hrefWithVars = addParamsToUrl(
        dev().assertString(this.shareEndpoint_), this.params_);
    const urlReplacements = Services.urlReplacementsForDoc(this.element);
    const bindingVars = typeConfig['bindings'];
    const bindings = {};
    if (bindingVars) {
      bindingVars.forEach(name => {
        const bindingName = name.toUpperCase();
        bindings[bindingName] = this.params_[name];
      });
    }

    urlReplacements.expandUrlAsync(hrefWithVars, bindings).then(href => {
      this.href_ = href;
      // mailto:, sms: protocols breaks when opened in _blank on iOS Safari
      const {protocol} = Services.urlForDoc(element).parse(href);
      const isMailTo = protocol === 'mailto:';
      const isSms = protocol === 'sms:';
      const isIosSafari = this.platform_.isIos() && this.platform_.isSafari();
      this.target_ = (isIosSafari && (isMailTo || isSms))
        ? '_top' : (this.element.hasAttribute('data-target') ?
          this.element.getAttribute('data-target') : '_blank');
      if (isSms) {
        // http://stackoverflow.com/a/19126326
        // This code path seems to be stable for both iOS and Android.
        this.href_ = this.href_.replace('?', '?&');
      }
    });

    element.setAttribute('role', 'button');
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    element.addEventListener('click', () => this.handleClick_());
    element.addEventListener('keydown', this.handleKeyPress_.bind(this));
    element.classList.add(`amp-social-share-${typeAttr}`);
  }

  /**
   * Handle key presses on the element.
   * @param {!Event} event
   * @private
   */
  handleKeyPress_(event) {
    const {key} = event;
    if (key == Keys.SPACE || key == Keys.ENTER) {
      event.preventDefault();
      this.handleActivation_();
    }
  }

  /**
   * Handle clicks on the element.
   * @private
   */
  handleClick_() {
    this.handleActivation_();
  }

  /** @private */
  handleActivation_() {
    userAssert(this.href_ && this.target_, 'Clicked before href is set.');
    const href = dev().assertString(this.href_);
    const target = dev().assertString(this.target_);
    if (this.shareEndpoint_ === 'navigator-share:') {
      devAssert(navigator.share !== undefined,
          'navigator.share disappeared.');
      // navigator.share() fails 'gulp check-types' validation on Travis
      navigator['share'](parseQueryString(href.substr(href.indexOf('?'))));
    } else {
      const windowFeatures = 'resizable,scrollbars,width=640,height=480';
      openWindowDialog(this.win, href, target, windowFeatures);
    }
  }

  /** @private */
  systemShareSupported_() {
    // Chrome exports navigator.share in WebView but does not implement it.
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
    const isChromeWebview = this.viewer_.isWebviewEmbedded() &&
        this.platform_.isChrome();

    return ('share' in navigator) && !isChromeWebview;
  }
}

AMP.extension('amp-social-share', '0.1', AMP => {
  AMP.registerElement('amp-social-share', AmpSocialShare, CSS);
});
