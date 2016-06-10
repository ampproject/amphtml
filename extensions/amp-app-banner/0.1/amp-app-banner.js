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
import {setStyles} from '../../../src/style';
import {user} from '../../../src/log';
import {platform} from '../../../src/platform';
import {viewerFor} from '../../../src/viewer';
import {CSS} from '../../../build/amp-app-banner-0.1.css';
import {documentInfoFor} from '../../../src/document-info';
import {xhrFor} from '../../../src/xhr';
import {assertHttpsUrl} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';

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
      user.warn(TAG, `Experiment ${TAG} disabled`);
      return;
    }

    if (!platform.isIos() && !platform.isAndroid()) {
      setStyles(this.element, {
        'display': 'none',
      });
      return;
    }

    /** @private @const {!Viewer} */
    const viewer = viewerFor(this.getWin());

    /** @private @const {!Document} */
    this.doc_ = this.getWin().document;

    /** @private @const {!Xhr} */
    this.xhr_ = xhrFor(this.getWin());

    /** @const @private {!Element} */
    this.installLink_ = this.element.querySelector('a[install-link]');
    user.assert(this.installLink_, '<a install-link> is required inside %s: %s',
        TAG, this.element);

    /** @const @private {!Element} */
    this.openLink_ = this.element.querySelector('a[open-link]');
    user.assert(this.openLink_, '<a open-link> is required inside %s: %s',
        TAG, this.element);

    if (platform.isIos()) {
      const meta = this.doc_.head.querySelector(
          'meta[name=apple-itunes-app]');
      user.assert(meta,
          '<meta name=apple-itunes-app> in <head> is required: %s',
          this.element);

      // If non-embedded document and on Safari iOS just use the native app
      // banner Safari supports if the meta tag is already setup.
      if (!viewer.isEmbedded() && platform.isSafari()) {
        setStyles(this.element, {
          'display': 'none',
        });
        return;
      }
      this.parseIosMetaContent_(meta.getAttribute('content'));
    }

    // TODO: Provide a way to dismiss the banner and persist it.
  }

  /** @override */
  layoutCallback() {
    if (!this.isExperimentOn_) {
      user.warn(TAG, `Experiment ${TAG} disabled`);
      return Promise.resolve();
    }

    if (!platform.isAndroid()) {
      return Promise.resolve();
    }

    const manifestLink = this.doc_.head.querySelector(
        'link[rel=manifest],link[rel=amp-manifest]');
    user.assert(manifestLink,
        '<link rel=manifest> in the <head> is required: %s',
        this.element);

    const manifestHref = manifestLink.getAttribute('href');
    assertHttpsUrl(manifestHref, this.element);

    return this.xhr_.fetchJson(manifestHref)
        .then(response => {
          this.parseManifest_(response);
        }).catch(unusedError => {
          // TODO: What do we do when we fail to fetch manifest.
          // Hiding it at this point might jump the page?
        });
  }

  /**
   * @param {!Object} manifestJson
   * @private
   */
  parseManifest_(manifestJson) {
    const apps = manifestJson['related_applications'];
    user.assert(apps,
        'related_applications is missing from manifest.json file: %s',
        this.element);

    const app = apps.find(app => app['platform'] == 'play');
    user.assert(app, 'Could not find a platform=play app in manifest: %s',
        this.element);
    this.installLink_.setAttribute('href',
        `https://play.google.com/store/apps/details?id=${app['id']}`);

    const url = app['url'] || documentInfoFor(this.getWin()).canonicalUrl;
    this.openLink_.setAttribute('href', url);
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
    this.installLink_.setAttribute('href',
        `https://itunes.apple.com/us/app/id${appId}`);
    const url = openUrl || documentInfoFor(this.getWin()).canonicalUrl;
    this.openLink_.setAttribute('href', url);
  }
}

AMP.registerElement('amp-app-banner', AmpAppBanner, CSS);
