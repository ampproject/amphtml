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
import {platformFor} from '../../../src/platform';
import {viewerFor} from '../../../src/viewer';
import {CSS} from '../../../build/amp-app-banner-0.1.css';
import {documentInfoForDoc} from '../../../src/document-info';
import {xhrFor} from '../../../src/xhr';
import {assertHttpsUrl} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';
import {removeElement, openWindowDialog} from '../../../src/dom';
import {storageFor} from '../../../src/storage';
import {timerFor} from '../../../src/timer';
import {parseUrl} from '../../../src/url';
import {setStyles} from '../../../src/style';
import {isProxyOrigin} from '../../../src/url';

const TAG = 'amp-app-banner';


/**
 * @private visible for testing.
 */
export class AbstractAppBanner extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @protected */
  setupOpenButton_(openButton, openInAppUrl, installAppUrl) {
    openButton.addEventListener('click', () => {
      this.openButtonClicked_(openInAppUrl, installAppUrl);
    });
  }


  /** @private */
  openButtonClicked_(openInAppUrl, installAppUrl) {
    // This redirect-after-timeout workaround will trigger if the user has not
    // been already navigated away to the app itself. This will only trigger
    // if the user doesn't have the app installed and will redirect the user
    // to the app store to install the app.
    // The 1500ms delay is very important, any smaller timeouts and Safari
    // iOS would execute the redirect without allowing the user to confirm
    // navigation to the app. That would cause the redirect to always happen
    // regardless if the user have the app installed or not.
    timerFor(this.win).delay(() => {
      this.redirectTopLocation_(installAppUrl);
    }, 1500);
    openWindowDialog(this.win, openInAppUrl, '_top');
  }


  /** @private */
  redirectTopLocation_(link) {
    this.win.top.location.assign(link);
  }

  /**
   * Creates and append a close button.
   * @protected
   */
  addDismissButton_() {
    const dismissButton = this.win.document.createElement('button');
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
   * @protected
   */
  onDismissButtonClick_() {
    this.getVsync().run({
      measure: null,
      mutate: handleDismiss,
    }, {
      element: this.element,
      viewport: this.getViewport(),
      storagePromise: storageFor(this.win),
      storageKey: this.getStorageKey_(),
    });
  }

  /** @private */
  getStorageKey_() {
    const elementId = user().assert(this.element.id,
        'amp-app-banner should have an id.');
    return 'amp-app-banner:' + elementId;
  }

  /** @protected */
  isDismissed() {
    return storageFor(this.win)
        .then(storage => storage.get(this.getStorageKey_()))
        .then(persistedValue => !!persistedValue, reason => {
          dev().error(TAG, 'Failed to read storage', reason);
          return false;
        });
  }

  /** @protected */
  checkIfDismissed_() {
    this.isDismissed().then(isDismissed => {
      if (isDismissed) {
        this.hide_();
      } else {
        setStyles(this.element, {
          visibility: '',
        });
        this.addDismissButton_();
        this.updateViewportPadding_();
      }
    });
  }

  /** @protected */
  hide_() {
    return this.getVsync().runPromise({
      measure: null,
      mutate: hideBanner,
    }, {
      element: this.element,
      viewport: this.getViewport(),
    });
  }

  /** @protected */
  updateViewportPadding_() {
    this.getVsync().run({
      measure: measureBanner,
      mutate: updateViewportPadding,
    }, {
      element: this.element,
      viewport: this.getViewport(),
    });
  }
}

/**
 * @private visible for testing.
 */
export class AmpAppBanner extends AbstractAppBanner {

  /** @override */
  upgradeCallback() {
    /** @private @const {boolean} */
    this.isExperimentOn_ = isExperimentOn(this.win, TAG);
    if (!this.isExperimentOn_) {
      return null;
    }

    const platform = platformFor(this.win);
    if (platform.isIos()) {
      return new AmpIosAppBanner(this.element);
    } else if (platform.isAndroid()) {
      return new AmpAndroidAppBanner(this.element);
    }
    return null;
  }

  /** @override */
  layoutCallback() {
    /** @private @const {boolean} */
    this.isExperimentOn_ = isExperimentOn(this.win, TAG);
    if (!this.isExperimentOn_) {
      user().warn(TAG, `Experiment ${TAG} disabled`);
      return Promise.resolve();
    }

    dev().info(TAG, 'Only iOS or Android platforms are currently supported.');
    return this.hide_();
  }
}


/**
 * @private visible for testing.
 */
export class AmpIosAppBanner extends AbstractAppBanner {

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://itunes.apple.com', onLayout);
  }

  /** @override */
  buildCallback() {
    // To allow layout to be scheduled.
    setStyles(this.element, {
      display: '',
      visibility: 'hidden',
    });

    // We want to fallback to browser builtin mechanism when possible.
    const platform = platformFor(this.win);
    const viewer = viewerFor(this.win);
    /** @private @const {boolean} */
    this.canShowBuiltinBanner_ = !viewer.isEmbedded() && platform.isSafari();
    if (this.canShowBuiltinBanner_) {
      dev().info(TAG,
          'Browser supports builtin banners. Not rendering amp-app-banner.');
      this.hide_();
      return;
    }

    /** @private @const {?Element} */
    this.metaTag_ = this.win.document.head.querySelector(
        'meta[name=apple-itunes-app]');
    if (!this.metaTag_) {
      this.hide_();
      return;
    }

    /** @private @const {!Element} */
    this.openButton_ = user().assert(
        this.element.querySelector('button[open-button]'),
        '<button open-button> is required inside %s: %s', TAG, this.element);

    this.checkIfDismissed_();
  }

  /** @override */
  layoutCallback() {
    if (!this.metaTag_) {
      return Promise.resolve();
    }

    if (this.canShowBuiltinBanner_) {
      return Promise.resolve();
    }

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
    this.setupOpenButton_(this.openButton_, openInAppUrl, installAppUrl);
  }
}


/**
 * @private visible for testing.
 */
export class AmpAndroidAppBanner extends AbstractAppBanner {

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://play.google.com', onLayout);
    if (this.manifestHref_) {
      this.preconnect.preload(this.manifestHref_);
    }
  }

  /** @override */
  buildCallback() {
    // To allow layout to be scheduled.
    setStyles(this.element, {
      display: '',
      visibility: 'hidden',
    });

    const viewer = viewerFor(this.win);
    /** @private @const {?Element} */
    this.manifestLink_ = this.win.document.head.querySelector(
        'link[rel=manifest],link[rel=amp-manifest]');

    const platform = platformFor(this.win);
    // We want to fallback to browser builtin mechanism when possible.
    const isChromeAndroid = platform.isAndroid() && platform.isChrome();
    /** @private @const {boolean} */
    this.canShowBuiltinBanner_ = !isProxyOrigin(this.win.location) &&
        !viewer.isEmbedded() && isChromeAndroid;

    if (this.canShowBuiltinBanner_) {
      dev().info(TAG,
          'Browser supports builtin banners. Not rendering amp-app-banner.');
      this.hide_();
      return;
    }

    /** @private @const {boolean} */
    this.missingDataSources_ = platform.isAndroid() && !this.manifestLink_;

    if (this.missingDataSources_) {
      this.hide_();
      return;
    }

    /** @private @const {string} */
    this.manifestHref_ = this.manifestLink_.getAttribute('href');
    assertHttpsUrl(this.manifestHref_, this.element, 'manifest href');

    /** @private @const {!Element} */
    this.openButton_ = user().assert(
        this.element.querySelector('button[open-button]'),
        '<button open-button> is required inside %s: %s', TAG, this.element);

    this.checkIfDismissed_();
  }

  /** @override */
  layoutCallback() {
    if (this.missingDataSources_) {
      return Promise.resolve();
    }

    if (this.canShowBuiltinBanner_) {
      return Promise.resolve();
    }

    return xhrFor(this.win).fetchJson(this.manifestHref_)
        .then(response => this.parseManifest_(response))
        .catch(error => {
          this.hide_();
          rethrowAsync(error);
        });
  }

  /**
   * @param {!JSONObject} manifestJson
   * @private
   */
  parseManifest_(manifestJson) {
    const apps = manifestJson['related_applications'];
    if (!apps) {
      dev().warn(TAG,
          'related_applications is missing from manifest.json file: %s',
          this.element);
      return;
    }

    const app = apps.find(app => app['platform'] == 'play');
    if (!app) {
      dev().warn(app, 'Could not find a platform=play app in manifest: %s',
          this.element);
      return;
    }

    const installAppUrl = (
        `https://play.google.com/store/apps/details?id=${app['id']}`);
    const openInAppUrl = this.getAndroidIntentForUrl_(app['id']);
    this.setupOpenButton_(this.openButton_, openInAppUrl, installAppUrl);
  }

  /** @private */
  getAndroidIntentForUrl_(appId) {
    const canonicalUrl = documentInfoForDoc(this.element).canonicalUrl;
    const parsedUrl = parseUrl(canonicalUrl);
    const cleanProtocol = parsedUrl.protocol.replace(':', '');
    const host = parsedUrl.host;
    const pathname = parsedUrl.pathname;
    return `android-app://${appId}/${cleanProtocol}/${host}${pathname}`;
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
