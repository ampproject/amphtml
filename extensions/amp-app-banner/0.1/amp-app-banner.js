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

import {Layout} from '../../../src/layout';
import {user, dev, rethrowAsync} from '../../../src/log';
import {platform} from '../../../src/platform';
import {viewerFor} from '../../../src/viewer';
import {viewportFor} from '../../../src/viewport';
import {vsyncFor} from '../../../src/vsync';
import {CSS} from '../../../build/amp-app-banner-0.1.css';
import {documentInfoFor} from '../../../src/document-info';
import {xhrFor} from '../../../src/xhr';
import {assertHttpsUrl} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';
import {removeElement, openWindowDialog} from '../../../src/dom';
import {storageFor} from '../../../src/storage';
import {timer} from '../../../src/timer';
import {parseUrl} from '../../../src/url';

const TAG = 'amp-app-banner';

class AmpAppBanner extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    if (!this.isExperimentOn_) {
      user.warn(TAG, `Experiment ${TAG} disabled`);
      return;
    }

    if (platform.isIos()) {
      this.preconnect.url('https://itunes.apple.com', onLayout);
    } else if (platform.isAndroid()) {
      this.preconnect.url('https://play.google.com', onLayout);
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    /** @private @const {boolean} */
    this.isExperimentOn_ = isExperimentOn(this.getWin(), TAG);
    if (!this.isExperimentOn_) {
      this.element.classList.add('experiment-disabled');
      user.warn(TAG, `Experiment ${TAG} disabled`);
      return;
    }

    /** @private @const {!../../../src/service/viewport-impl.Viewport} */
    this.viewport_ = viewportFor(this.getWin());

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(this.getWin());

    /** @private @const {!Xhr} */
    this.xhr_ = xhrFor(this.getWin());

    /** @private @const {!../../../src/service/storage-impl.Storage} */
    this.storagePromise_ = /*REVIEW*/storageFor(this.getWin());

    /** @private @const {boolean} */
    this.platformSupported_ = platform.isIos() || platform.isAndroid();

    if (!this.platformSupported_) {
      dev.info(TAG,
          'Only iOS or Android platforms are currently supported.');
      this.hide_();
      return;
    }

    /** @private @const {!Document} */
    this.doc_ = this.getWin().document;

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerFor(this.getWin());

    /** @private @const {?Element} */
    this.manifestLink_ = this.doc_.head.querySelector(
        'link[rel=manifest],link[rel=amp-manifest]');

    /** @private @const {?Element} */
    this.metaTag_ = this.doc_.head.querySelector('meta[name=apple-itunes-app]');

    // We want to fallback to browser builtin mechanism when possible.
    const isChromeAndroid = platform.isAndroid() && platform.isChrome();
    const isSafariIos = platform.isIos() && platform.isSafari();
    /** @private @const {boolean} */
    this.canShowBuiltinBanner_ = !this.viewer_.isEmbedded() && (
            isChromeAndroid || isSafariIos);

    if (this.canShowBuiltinBanner_) {
      dev.info(TAG,
          'Browser supports builtin banners. Not rendering amp-app-banner.');
      this.hide_();
      return;
    }

    /** @private @const {boolean} */
    this.missingDataSources_ = ((platform.isAndroid() && !this.manifestLink_) ||
        (platform.isIos() && !this.metaTag_));

    if (platform.isAndroid()) {
      /** @private @const {string} */
      this.manifestHref_ = this.manifestLink_.getAttribute('href');
      assertHttpsUrl(this.manifestHref_, this.element, 'manifest href');
    }

    if (this.missingDataSources_) {
      this.hide_();
      return;
    }

    /** @private @const {string} */
    this.elementId_ = user.assert(this.element.id,
        'amp-app-banner should have an id.');

    /** @private @const {string} */
    this.storageKey_ = 'amp-app-banner:' + this.elementId_;

    /** @private @const {!Storage} */
    this.storagePromise_ = storageFor(this.getWin());

    /** @const @private {!Element} */
    this.openLink_ = this.element.querySelector('a[open-link]');
    user.assert(this.openLink_, '<a open-link> is required inside %s: %s',
        TAG, this.element);

    this.isDismissed().then(isDismissed => {
      if (isDismissed) {
        this.hide_();
      } else {
        this.addDismissButton_();
        this.updateViewportPadding_();
      }
    });
  }

  /** @override */
  layoutCallback() {
    if (!this.isExperimentOn_) {
      user.warn(TAG, `Experiment ${TAG} disabled`);
      return Promise.resolve();
    }

    if (!this.platformSupported_) {
      return Promise.resolve();
    }

    if (this.missingDataSources_) {
      return Promise.resolve();
    }

    if (this.canShowBuiltinBanner_) {
      return Promise.resolve();
    }

    if (platform.isIos()) {
      return this.layoutForIos_();
    } else if (platform.isAndroid()) {
      return this.layoutForAndroid_();
    }
    return this.hide_();
  }

  /** @private */
  hide_() {
    return this.vsync_.runPromise({
      measure: null,
      mutate: hideBanner,
    }, {
      element: this.element,
      viewport: this.viewport_,
    });
  }

  updateViewportPadding_() {
    this.vsync_.run({
      measure: measureBanner,
      mutate: updateViewportPadding,
    }, {
      element: this.element,
      viewport: this.viewport_,
    });
  }

  /** @private */
  layoutForAndroid_() {
    return this.xhr_.fetchJson(this.manifestHref_)
        .then(response => this.parseManifest_(response))
        .catch(error => {
          this.hide_();
          rethrowAsync(error);
        });
  }

  /**
   * @param {!Object} manifestJson
   * @private
   */
  parseManifest_(manifestJson) {
    const apps = manifestJson['related_applications'];
    if (!apps) {
      dev.warn(TAG,
          'related_applications is missing from manifest.json file: %s',
          this.element);
      return;
    }

    const app = apps.find(app => app['platform'] == 'play');
    if (!app) {
      dev.warn(app, 'Could not find a platform=play app in manifest: %s',
          this.element);
      return;
    }

    const installAppUrl = (
        `https://play.google.com/store/apps/details?id=${app['id']}`);
    const openInAppUrl = this.getAndroidIntentForUrl_(app['id']);
    this.setupOpenLink_(openInAppUrl, installAppUrl);
  }

  /** @private */
  getAndroidIntentForUrl_(appId) {
    const canonicalUrl = documentInfoFor(this.getWin()).canonicalUrl;
    const parsedUrl = parseUrl(canonicalUrl);
    const cleanProtocol = parsedUrl.protocol.replace(':', '');
    const pathname = parsedUrl.pathname;
    return `android-app://${appId}/${cleanProtocol}/${pathname}`;
  }

  /** @private */
  setupOpenLink_(openInAppUrl, installAppUrl) {
    this.openLink_.addEventListener('click', () => {
      timer.delay(() => {
        top.location.replace(installAppUrl);
      }, 1500);
      openWindowDialog(this.getWin(), openInAppUrl, '_top');
    });
  }

  /** @private */
  layoutForIos_() {
    this.parseIosMetaContent_(this.metaTag_.getAttribute('content'));
    return Promise.resolve();
  }

  /**
   * @param {string} metaContent
   * @private
   */
  parseIosMetaContent_(metaContent) {
    const parts = metaContent.replace(/\s/,'').split(',');
    const config = {};
    parts.forEach(part => {
      const keyValuePair = part.split('=');
      config[keyValuePair[0]] = keyValuePair[1];
    });

    const appId = config['app-id'];
    const openUrl = config['app-argument'];
    const installAppUrl = `https://itunes.apple.com/us/app/id${appId}`;
    const openInAppUrl = openUrl || installAppUrl;
    this.setupOpenLink_(openInAppUrl, installAppUrl);
  }

  /**
   * Creates and append a close button.
   * @private
   */
  addDismissButton_() {
    const dismissButton = this.doc_.createElement('button');
    dismissButton.classList.add('amp-app-banner-dismiss-button');
    dismissButton.setAttribute('aria-label',
        this.element.getAttribute('data-dismiss-button-aria-label') ||
        'Dismiss');
    const boundOnDismissButtonClick = this.onDismissButtonClick_.bind(this);
    dismissButton.addEventListener('click', boundOnDismissButtonClick);
    this.element.appendChild(dismissButton);
  }

  /**
   * Dismisses the app banner and persist it.
   * @private
   */
  onDismissButtonClick_() {
    this.vsync_.run({
      measure: null,
      mutate: handleDismiss,
    }, {
      element: this.element,
      viewport: this.viewport_,
      storagePromise: this.storagePromise_,
      storageKey: this.storageKey_,
    });
  }

  /** @override */
  isDismissed() {
    return this.storagePromise_
        .then(storage => storage.get(this.storageKey_))
        .then(persistedValue => !!persistedValue, reason => {
          dev.error(TAG, 'Failed to read storage', reason);
          return false;
        });
  }

}


/**
 * Dismisses the app banner and persist dismissal.
 * @param {!Object} state
 */
function handleDismiss(state) {
  hideBanner(state);
  state.storagePromise.then(storage => {
    storage.set(state.storageKey, true);
  });
}


/**
 * Hides the app banner.
 * @param {!Object} state
 */
function hideBanner(state) {
  state.viewport.removeFromFixedLayer(state.element);
  removeElement(state.element);
  state.viewport.updatePaddingBottom(0);
}


/**
 * Measures banner layout rectangle and sets it on the state.
 * @param {!Object} state
 */
function measureBanner(state) {
  state.bannerRect = state.viewport.getLayoutRect(state.element);
}


/**
 * Updates viewport padding to add padding on the bottom.
 * @param {!Object} state.
 */
function updateViewportPadding(state) {
  state.viewport.updatePaddingBottom(state.bannerRect.height);
  state.viewport.addToFixedLayer(state.element);
}


AMP.registerElement('amp-app-banner', AmpAppBanner, CSS);
