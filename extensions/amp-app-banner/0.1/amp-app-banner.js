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
import {dict} from '../../../src/utils/object';
import {user, dev, rethrowAsync} from '../../../src/log';
import {platformFor} from '../../../src/services';
import {viewerForDoc} from '../../../src/services';
import {CSS} from '../../../build/amp-app-banner-0.1.css';
import {documentInfoForDoc} from '../../../src/services';
import {xhrFor} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {removeElement, openWindowDialog} from '../../../src/dom';
import {storageForDoc} from '../../../src/services';
import {timerFor} from '../../../src/services';
import {parseUrl} from '../../../src/url';
import {isProxyOrigin, isProtocolValid} from '../../../src/url';

const TAG = 'amp-app-banner';
const OPEN_LINK_TIMEOUT = 1500;

/**
 * visible for testing.
 * @abstract
 */
export class AbstractAppBanner extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @protected {?Element} */
    this.openButton_ = null;

    /** @protected {boolean} */
    this.canShowBuiltinBanner_ = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * Subclasses should override this method to specify action when open button
   * is clicked.
   * @protected
   */
  openButtonClicked(unusedOpenInAppUrl, unusedInstallAppUrl) {
    // Subclasses may override.
  }

  /** @protected */
  setupOpenButton_(openButton, openInAppUrl, installAppUrl) {
    openButton.addEventListener('click', () => {
      this.openButtonClicked(openInAppUrl, installAppUrl);
    });
  }

  /**
   * Creates and append a close button.
   * @protected
   */
  addDismissButton_() {
    const paddingBar = this.win.document.createElement(
        'i-amphtml-app-banner-top-padding');
    this.element.appendChild(paddingBar);
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
      measure: undefined,
      mutate: handleDismiss,
    }, {
      element: this.element,
      viewport: this.getViewport(),
      storagePromise: storageForDoc(this.getAmpDoc()),
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
    return storageForDoc(this.getAmpDoc())
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
        this.addDismissButton_();
        this.updateViewportPadding_();
        this./*OK*/expand();
      }
    });
  }

  /** @protected */
  hide_() {
    return this.getVsync().runPromise({
      measure: undefined,
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

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  upgradeCallback() {
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
    user().info(TAG, 'Only iOS or Android platforms are currently supported.');
    return this.hide_();
  }
}

/**
 * @private visible for testing.
 */
export class AmpIosAppBanner extends AbstractAppBanner {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.getAmpDoc());

    /** @private {?Element} */
    this.metaTag_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    // Ensure the element is in DOM since it removes itself in some cases.
    if (!this.element.parentNode) {
      return;
    }
    this.preconnect.url('https://itunes.apple.com', opt_onLayout);
  }

  /** @override */
  buildCallback() {
    // We want to fallback to browser builtin mechanism when possible.
    const platform = platformFor(this.win);
    this.canShowBuiltinBanner_ = !this.viewer_.isEmbedded()
        && platform.isSafari();
    if (this.canShowBuiltinBanner_) {
      user().info(TAG,
          'Browser supports builtin banners. Not rendering amp-app-banner.');
      this.hide_();
      return;
    }

    if (this.viewer_.isEmbedded() &&
        !this.viewer_.hasCapability('navigateTo')) {
      this.hide_();
      return;
    }

    this.metaTag_ = this.win.document.head.querySelector(
        'meta[name=apple-itunes-app]');
    if (!this.metaTag_) {
      this.hide_();
      return;
    }

    this.openButton_ = user().assert(
        this.element.querySelector('button[open-button]'),
        '<button open-button> is required inside %s: %s', TAG, this.element);

    this.parseIosMetaContent_(this.metaTag_.getAttribute('content'));
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

    return Promise.resolve();
  }

  /** @override */
  openButtonClicked(openInAppUrl, installAppUrl) {
    if (!this.viewer_.isEmbedded()) {
      timerFor(this.win).delay(() => {
        openWindowDialog(this.win, installAppUrl, '_top');
      }, OPEN_LINK_TIMEOUT);
      openWindowDialog(this.win, openInAppUrl, '_top');
    } else {
      timerFor(this.win).delay(() => {
        this.viewer_.sendMessage('navigateTo', dict({'url': installAppUrl}));
      }, OPEN_LINK_TIMEOUT);
      this.viewer_.sendMessage('navigateTo', dict({'url': openInAppUrl}));
    }
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

    if (openUrl) {
      user().assert(isProtocolValid(openUrl),
          'The url in app-argument has invalid protocol: %s', openUrl);
    }

    const installAppUrl = `https://itunes.apple.com/us/app/id${appId}`;
    const openInAppUrl = openUrl || installAppUrl;
    this.setupOpenButton_(this.openButton_, openInAppUrl, installAppUrl);
  }
}


/**
 * @private visible for testing.
 */
export class AmpAndroidAppBanner extends AbstractAppBanner {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLLinkElement} */
    this.manifestLink_ = null;

    /** @private {string} */
    this.manifestHref_ = '';

    /** @private {boolean} */
    this.missingDataSources_ = false;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    // Ensure the element is in DOM since it removes itself in some cases.
    if (!this.element.parentNode) {
      return;
    }
    this.preconnect.url('https://play.google.com', opt_onLayout);
    if (this.manifestHref_) {
      this.preconnect.preload(this.manifestHref_);
    }
  }

  /** @override */
  buildCallback() {
    const viewer = viewerForDoc(this.getAmpDoc());
    this.manifestLink_ = this.win.document.head.querySelector(
        'link[rel=manifest],link[rel=origin-manifest]');

    const platform = platformFor(this.win);
    // We want to fallback to browser builtin mechanism when possible.
    const isChromeAndroid = platform.isAndroid() && platform.isChrome();
    this.canShowBuiltinBanner_ = !isProxyOrigin(this.win.location) &&
        !viewer.isEmbedded() && isChromeAndroid;

    if (this.canShowBuiltinBanner_) {
      user().info(TAG,
          'Browser supports builtin banners. Not rendering amp-app-banner.');
      this.hide_();
      return;
    }

    this.missingDataSources_ = platform.isAndroid() && !this.manifestLink_;

    if (this.missingDataSources_) {
      this.hide_();
      return;
    }

    this.manifestHref_ = this.manifestLink_.getAttribute('href');
    assertHttpsUrl(this.manifestHref_, this.element, 'manifest href');

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

    return xhrFor(this.win).fetchJson(this.manifestHref_, {
      requireAmpResponseSourceOrigin: false,
    }).then(res => res.json())
        .then(json => this.parseManifest_(json))
        .catch(error => {
          this.hide_();
          rethrowAsync(error);
        });
  }

  /** @override */
  openButtonClicked(openInAppUrl, installAppUrl) {
    timerFor(this.win).delay(() => {
      this.redirectTopLocation_(installAppUrl);
    }, OPEN_LINK_TIMEOUT);
    openWindowDialog(this.win, openInAppUrl, '_top');
  }

  /** @private */
  redirectTopLocation_(link) {
    this.win.top.location.assign(link);
  }

  /**
   * @param {!JsonObject} manifestJson
   * @private
   */
  parseManifest_(manifestJson) {
    const apps = manifestJson['related_applications'];
    if (!apps) {
      user().warn(TAG,
          'related_applications is missing from manifest.json file: %s',
          this.element);
      return;
    }

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      if (app['platform'] == 'play') {
        const installAppUrl = 'https://play.google.com/store/apps/details' +
            `?id=${app['id']}`;
        const openInAppUrl = this.getAndroidIntentForUrl_(app['id']);
        this.setupOpenButton_(this.openButton_, openInAppUrl, installAppUrl);
        return;
      }
    }

    user().warn(TAG, 'Could not find a platform=play app in manifest: %s',
        this.element);
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
  state.bannerHeight = state.viewport.getDOMRect(state.element).height;
}


/**
 * Updates viewport padding to add padding on the bottom.
 * @param {!Object} state.
 */
function updateViewportPadding(state) {
  state.viewport.updatePaddingBottom(state.bannerHeight);
  state.viewport.addToFixedLayer(state.element);
}


AMP.registerElement('amp-app-banner', AmpAppBanner, CSS);
