/**
 * Copyright 2015 Longtail Ad Solutions Inc.
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

import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {addParamsToUrl} from '../../../src/url';
import {dashToCamelCase} from '../../../src/string';

class AmpJWPlayer extends AMP.BaseElement {

  /** @override */
  createdCallback() {
    this.preconnect.url('https://content.jwplatform.com');
    this.preconnect.url('https://p.jwpcdn.com');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const contentid = AMP.assert(
      (this.element.getAttribute('data-playlist-id') ||
      this.element.getAttribute('data-media-id')),
      'Either the data-media-id or the data-playlist-id attributes must be specified for <amp-jwplayer> %s',
      this.element);
    const playerid = AMP.assert(
      this.element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-jwplayer> %s',
      this.element);

    const iframe = document.createElement('iframe');
    let src = `https://content.jwplatform.com/players/${contentid}-${playerid}.html`;

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    iframe.width = width;
    iframe.height = height;
    this.element.appendChild(iframe);
    /** @private {?Element} */
    this.iframe_ = iframe;
    return loadPromise(iframe);
  }

  /** @override */
  documentInactiveCallback() {
    // TODO: implement inactiveCallback
    return false;
  }
};

AMP.registerElement('amp-jwplayer', AmpJWPlayer);
