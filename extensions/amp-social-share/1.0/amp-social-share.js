/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-social-share-1.0.css';
import {Layout} from '../../../src/layout';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {SocialShare} from './social-share';
import {addParamsToUrl, parseQueryString} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {getSocialConfig} from './social-share-config';
import {isExperimentOn} from '../../../src/experiments';
import {toggle} from '../../../src/style';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-social-share';

/**
 * @private
 * @param {string} type
 * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
 * @param {!../../../src/service/platform-impl.Platform} platform
 * @return {!JsonObject|undefined}
 */
const getTypeConfigOrUndefined = (type, viewer, platform) => {
  if (type === 'system') {
    // navigator.share unavailable
    if (!systemShareSupported(viewer, platform)) {
      return;
    }
  } else {
    // system share wants to be unique
    const systemOnly =
      systemShareSupported(viewer, platform) &&
      !!window.document.querySelector(
        'amp-social-share[type=system][data-mode=replace]'
      );
    if (systemOnly) {
      return;
    }
  }
  return /** @type {!JsonObject} */ (getSocialConfig(type)) || dict();
};

/**
 * @private
 * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
 * @param {!../../../src/service/platform-impl.Platform} platform
 * @return {boolean}
 */
const systemShareSupported = (viewer, platform) => {
  // Chrome exports navigator.share in WebView but does not implement it.
  // See https://bugs.chromium.org/p/chromium/issues/detail?id=765923
  const isChromeWebview = viewer.isWebviewEmbedded() && platform.isChrome();

  return 'share' in navigator && !isChromeWebview;
};

class AmpSocialShare extends PreactBaseElement {
  /** @override */
  init() {
    const viewer = Services.viewerForDoc(this.element);
    const platform = Services.platformFor(window);
    const type = userAssert(
      this.element.getAttribute('type'),
      'The type attribute is required. %s',
      this.element
    );
    const typeConfig = getTypeConfigOrUndefined(type, viewer, platform);
    // Hide/ignore component if typeConfig is undefined
    if (!typeConfig) {
      toggle(this.element, false);
      return;
    }

    this.element.classList.add(`amp-social-share-${type}`);
    this.renderWithHrefAndTarget_(typeConfig);
    const responsive =
      this.element.getAttribute('layout') === Layout.RESPONSIVE && '100%';
    return dict({
      'width': responsive || this.element.getAttribute('width'),
      'height': responsive || this.element.getAttribute('height'),
      'color': 'currentColor',
      'background': 'inherit',
    });
  }

  /** @override */
  isLayoutSupported() {
    userAssert(
      isExperimentOn(this.win, 'amp-social-share-bento'),
      'expected amp-social-share-bento experiment to be enabled'
    );
    return true;
  }

  /**
   * Resolves 'href' and 'target' from data-param attributes using AMP URL services.
   * Then triggers render on the Component with updated props.
   * @private
   * @param {!JsonObject} typeConfig
   */
  renderWithHrefAndTarget_(typeConfig) {
    const customEndpoint = this.element.getAttribute('data-share-endpoint');
    const shareEndpoint = customEndpoint || typeConfig['shareEndpoint'] || '';
    const urlParams = typeConfig['defaultParams'] || dict();
    Object.assign(urlParams, getDataParamsFromAttributes(this.element));
    const hrefWithVars = addParamsToUrl(shareEndpoint, urlParams);
    const urlReplacements = Services.urlReplacementsForDoc(this.element);
    const bindingVars = /** @type {?Array<string>} */ (typeConfig['bindings']);
    const bindings = {};
    if (bindingVars) {
      bindingVars.forEach((name) => {
        const bindingName = name.toUpperCase();
        bindings[bindingName] = urlParams[name];
      });
    }
    urlReplacements
      .expandUrlAsync(hrefWithVars, bindings)
      .then((expandedUrl) => {
        const {search} = Services.urlForDoc(this.element).parse(expandedUrl);
        const target = this.element.getAttribute('data-target') || '_blank';

        if (customEndpoint) {
          this.mutateProps(
            dict({
              'endpoint': expandedUrl,
              'target': target,
            })
          );
        } else {
          this.mutateProps(
            dict({
              'params': parseQueryString(search),
              'target': target,
            })
          );
        }
      });
  }
}

/** @override */
AmpSocialShare['Component'] = SocialShare;

/** @override */
AmpSocialShare['passthroughNonEmpty'] = true;

/** @override */
AmpSocialShare['props'] = {
  'tabIndex': {attr: 'tabindex'},
  'type': {attr: 'type'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSocialShare, CSS);
});
