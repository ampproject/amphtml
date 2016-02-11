/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


class AmpBrightcove extends AMP.BaseElement {

  /** @override */
  createdCallback() {
    this.preconnect.url('https://players.brightcove.net');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const account = AMP.assert(
        this.element.getAttribute('data-account'),
        'The data-account attribute is required for <amp-brightcove> %s',
        this.element);
    const playerid = (this.element.getAttribute('data-player-id') || 'default');
    const embed = (this.element.getAttribute('data-embed') || 'default');
    const iframe = document.createElement('iframe');
    let src = 'https://players.brightcove.net/' + encodeURIComponent(account) + '/' + encodeURIComponent(playerid) + '_' + encodeURIComponent(embed) + '/index.html';
    if (this.element.getAttribute('data-playlist-id')) {
      src += '?playlistId=';
      src += this.encodeId_(this.element.getAttribute('data-playlist-id'));
    } else if (this.element.getAttribute('data-video-id')) {
      src += '?videoId=';
      src += this.encodeId_(this.element.getAttribute('data-video-id'));
    }
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

  /** @private */
  encodeId_(id) {
    /* id is either a Brightcove-assigned id, or a customer-generated reference id.
      reference ids are prefixed 'ref:' and the colon must be preserved unencoded */
    if (id.substring(0,4) === 'ref:') {
      return 'ref:' + encodeURIComponent(id.substring(4));
    } else {
      return encodeURIComponent(id);
    }
  }

  /** @override */
  documentInactiveCallback() {
    /*
    This stops playback with the postMessage API.
    Add this script to the player in the player configuration in the Studio
    or via the Player Management API:

    http://players.brightcove.net/906043040001/plugins/postmessage_pause.js

    It's not a 'real' video.js plugin, just a plain script running in
    the iframe so needs no configuration options.
    */
    this.iframe_.contentWindow./*OK*/postMessage('pause', 'https://players.brightcove.net');
    return false;
  }
};

AMP.registerElement('amp-brightcove', AmpBrightcove);
