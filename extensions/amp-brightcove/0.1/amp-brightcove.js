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
import {addParamsToUrl} from '../../../src/url';
import {getDataParamsFromAttributes, removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

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
  buildCallback() {
    /** @private {?Element} */
    this.iframe_ = null;
  }

  /** @override */
  layoutCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const account = user().assert(
        this.element.getAttribute('data-account'),
        'The data-account attribute is required for <amp-brightcove> %s',
        this.element);
    const playerid = (this.element.getAttribute('data-player') ||
      this.element.getAttribute('data-player-id') ||
      'default');
    const embed = (this.element.getAttribute('data-embed') || 'default');
    const iframe = this.element.ownerDocument.createElement('iframe');
    let src = `https://players.brightcove.net/${encodeURIComponent(account)}/${encodeURIComponent(playerid)}_${encodeURIComponent(embed)}/index.html`;

    if (this.element.getAttribute('data-playlist-id')) {
      src += '?playlistId=';
      src += this.encodeId_(this.element.getAttribute('data-playlist-id'));
    } else if (this.element.getAttribute('data-video-id')) {
      src += '?videoId=';
      src += this.encodeId_(this.element.getAttribute('data-video-id'));
    }

    // Pass through data-param-* attributes as params for plugin use
    src = addParamsToUrl(src, getDataParamsFromAttributes(this.element));
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
      return `ref:${encodeURIComponent(id.substring(4))}`;
    } else {
      return encodeURIComponent(id);
    }
  }

  /** @override */
  pauseCallback() {
    /*
    This stops playback with the postMessage API.
    Add this script to the player in the player configuration in the Studio
    or via the Player Management API:

    http://players.brightcove.net/906043040001/plugins/postmessage_pause.js

    It's not a 'real' video.js plugin, just a plain script running in
    the iframe so needs no configuration options.
    */
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(
          'pause', 'https://players.brightcove.net');
    }
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /**
   * To prevent improperly setup videos (do not include the pauseCallback
   * listener script) from playing after being told to pause, we destroy the
   * iframe. Once the listener script is updated to inform AMP that it is listening,
   * we can prevent the unlayout.
   *
   * See https://github.com/ampproject/amphtml/issues/2224 for information.
   * @override
   */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
};

AMP.registerElement('amp-brightcove', AmpBrightcove);
