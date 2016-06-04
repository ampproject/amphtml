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

const TAG = 'amp-app-banner';

class AmpAppBanner extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://itunes.apple.com', onLayout);
    this.preconnect.url('https://play.google.com', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    /** @private @const {!Viewer} */
    const viewer = viewerFor(this.getWin());

    // If non-embedded document and on Safari iOS just use the native app banner
    // Safari supports if the meta tag is already setup.
    if (!viewer.isEmbedded() && platform.isSafari() && platform.isIos()) {
      const meta = this.getWin().document.head.querySelector(
          'meta[name=apple-itunes-app]');
      if (meta) {
        return;
      }
    }

    const installLink = this.element.querySelector('a[install-link]');
    user.assert(installLink, '<a install-link> is required inside %s: %s',
        TAG, this.element);
    const openLink = this.element.querySelector('a[open-link]');
    user.assert(openLink, '<a open-link> is required inside %s: %s',
        TAG, this.element);

    let installUrl;
    let deepLinkUrl;
    if (platform.isIos()) {
      installUrl = this.element.getAttribute('ios-app-url');
      deepLinkUrl = this.element.getAttribute('ios-deep-link-url');
      this.element.classList.add('amp-platform-ios');
    } else if (platform.isAndroid()) {
      installUrl = this.element.getAttribute('android-app-url');
      deepLinkUrl = this.element.getAttribute('android-deep-link-url');
      this.element.classList.add('amp-platform-android');
    } else {
      // TODO: Maybe add support for windows phone links.
      setStyles(this.element, {
        'display': 'none',
      });
      return;
    }
    installLink.setAttribute('href', installUrl);
    openLink.setAttribute('href', deepLinkUrl);

    // TODO: Provide a way to dismiss the banner and persist it.
  }
}

AMP.registerElement('amp-app-banner', AmpAppBanner, CSS);
