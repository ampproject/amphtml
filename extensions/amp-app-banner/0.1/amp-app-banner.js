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
import {urlReplacementsFor} from '../../../src/url-replacements';
import {xhrFor} from '../../../src/xhr';

const TAG = 'amp-app-banner';

class AmpAppBanner extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
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
    if (!platform.isIos() && !platform.isAndroid()) {
      setStyles(this.element, {
        'display': 'none',
      });
      return;
    }

    /** @private @const {!Viewer} */
    const viewer = viewerFor(this.getWin());

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
      const meta = this.getWin().document.head.querySelector(
          'meta[name=apple-itunes-app]');
      user.assert(meta,
          '<meta name=apple-itunes-app> in document header is required: %s',
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
    if (!platform.isAndroid()) {
      return Promise.resolve();
    }

    const manifestLink = this.getWin().document.head.querySelector(
        'link[rel=manifest],link[rel=amp-manifest]');
    user.assert(manifestLink,
        '<link rel=manifest> in the document head is required: %s',
        this.element);

    return this.xhr_.fetchJson(manifestLink.getAttribute('href'))
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
    if (app['url']) {
      this.openLink_.setAttribute('href', app['url']);
    } else {
      urlReplacementsFor(this.getWin()).expand('CANONICAL_URL').then(url => {
        this.openLink_.setAttribute('href', decodeURIComponent(url));
      });
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
      const [key, value] = part.split(':');
      config[key] = value;
    });

    const appId = config['app-id'];
    const openUrl = config['app-argument'];
    this.installLink_.setAttribute('href',
        `https://itunes.apple.com/us/app/id${appId}`);
    if (openUrl) {
      this.openLink_.setAttribute('href', openUrl);
    } else {
      urlReplacementsFor(this.getWin()).expand('CANONICAL_URL').then(url => {
        this.openLink_.setAttribute('href', decodeURIComponent(url));
      });
    }
  }
}

AMP.registerElement('amp-app-banner', AmpAppBanner, CSS);
