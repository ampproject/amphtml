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
import {Layout} from '../../../src/layout';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {SocialShare} from './social-share';
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {getSocialConfig} from './amp-social-share-config';
import {isExperimentOn} from '../../../src/experiments';
import {toggle} from '../../../src/style';
import {user, userAssert} from '../../../src/log';

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
  const typeConfig = getSocialConfig(type) || dict();
  if (typeConfig['obsolete']) {
    user().warn(TAG, `Skipping obsolete share button ${type}`);
    return;
  }
  return typeConfig;
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
    userAssert(
      !/\s/.test(type),
      'Space characters are not allowed in type attribute value. %s',
      this.element
    );
    const typeConfig = getTypeConfigOrUndefined(type, viewer, platform);
    // Hide/ignore component if typeConfig is undefined
    if (!typeConfig) {
      toggle(this.element, false);
      user().warn(TAG, `Skipping obsolete share button ${type}`);
      return;
    }
    this.renderWithHrefAndTarget_(typeConfig, platform);
    const responsive =
      this.element.getAttribute('layout') === Layout.RESPONSIVE && '100%';
    return dict({
      'width': responsive || this.element.getAttribute('width'),
      'height': responsive || this.element.getAttribute('height'),
      'href': null,
      'target': null,
    });
  }

  /** @override */
  isLayoutSupported() {
    userAssert(
      isExperimentOn(this.win, 'amp-social-share-v2'),
      'expected amp-social-share-v2 experiment to be enabled'
    );
    return true;
  }

  /**
   * Resolves 'href' and 'target' from data-param attributes using AMP URL services.
   * Then triggers render on the Component with updated props.
   * @private
   * @param {!JsonObject} typeConfig
   * @param {!../../../src/service/platform-impl.Platform} platform
   */
  renderWithHrefAndTarget_(typeConfig, platform) {
    const shareEndpoint = user().assertString(
      this.element.getAttribute('data-share-endpoint') ||
        typeConfig['shareEndpoint'],
      'The data-share-endpoint attribute is required. %s'
    );
    const urlParams = getDataParamsFromAttributes(this.element);
    Object.assign(urlParams, typeConfig['defaultParams']);
    const hrefWithVars = addParamsToUrl(shareEndpoint, urlParams);
    const urlReplacements = Services.urlReplacementsForDoc(this.element);
    const bindingVars = typeConfig['bindings'];
    const bindings = {};
    if (bindingVars) {
      /** @type {!Array} */ (bindingVars).forEach((name) => {
        const bindingName = name.toUpperCase();
        bindings[bindingName] = urlParams[name];
      });
    }
    urlReplacements.expandUrlAsync(hrefWithVars, bindings).then((result) => {
      let href = result;
      // mailto:, sms: protocols breaks when opened in _blank on iOS Safari
      const {protocol} = Services.urlForDoc(this.element).parse(href);
      const isMailTo = protocol === 'mailto:';
      const isSms = protocol === 'sms:';
      const target =
        platform.isIos() && (isMailTo || isSms)
          ? '_top'
          : this.element.getAttribute('data-target') || '_blank';
      if (isSms) {
        // http://stackoverflow.com/a/19126326
        // This code path seems to be stable for both iOS and Android.
        href = href.replace('?', '?&');
      }
      this.mutateProps(dict({'href': href, 'target': target}));
    });
  }
}

/** @override */
AmpSocialShare['Component'] = SocialShare;

/** @override */
AmpSocialShare['props'] = {
  'tabIndex': {attr: 'tabindex'},
  'type': {attr: 'type'},
};

AMP.extension(TAG, '0.2', (AMP) => {
  AMP.registerElement(TAG, AmpSocialShare);
});
