/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {removeElement} from '../../../src/dom';
import {userAssert} from '../../../src/log';
import {getData} from '../../../src/event-helper';

export class AmpConnatixPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.playerId_ = '';


    /** @private {string} */
    this.mediaId_ = '';


    /** @private {string} */
    this.iframeDomain_ = 'https://cds.connatix.com';


    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /**
   * Sends a post message to the iframe where the connatix player
   * is embedded. Used for giving external commands to the player (play/pause etc)
   * @private
   * @param {string} command
   */
  sendCommand(command) {
    if (this.iframe_ && this.iframe_.contentWindow) {
      // Send message to the player
      this.iframe_.contentWindow./*OK*/postMessage(command,
          this.iframeDomain_);
    }
  }

  /**
   * Sends a post message to the iframe where the connatix player
   * is embedded. Used for giving external commands to the player (play/pause etc)
   * @private
   */
  bindToPlayerCommands() {
    this.win.addEventListener('message', e => {
      if (!this.iframe_ || e.source !== this.iframe_.contentWindow) {
        // Ignore messages from other iframes.
        return;
      }
      // Player wants to close because the user interracted on its close button
      if (getData(e) === 'cnx_close') {
        this.destroyPlayerFrame();
        this.attemptCollapse();
      }
    });
  }

  /**
   * Removes the player iframe
   * @private
   */
  destroyPlayerFrame() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    // Player id is mandatory
    this.playerId_ = userAssert(
      element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-connatix-player> %s',
      element);

    // Media id is optional
    this.mediaId_ = element.getAttribute('data-media-id') ||
        '';

    this.bindToPlayerCommands();
  }

    /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // Serves the player assets
    this.preconnect.url(this.iframeDomain_, onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const {element} = this;
    // Url Params for iframe source
    const urlParams = dict({
      'playerId' : this.playerId_ || undefined,
      'mediaId' : this.mediaId_ || undefined
    });
    const iframeUrl = this.iframeDomain_ + '/embed/index.html';
    const src = addParamsToUrl(iframeUrl, urlParams);

    const iframe = element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;

    // applyFillContent so that frame covers the entire component.
    this.applyFillContent(iframe, /* replacedContent */ true);

    element.appendChild(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    // Return a load promise for the frame so the runtime knows when the
    // component is ready.
    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    sendCommand('pause');
  }

  /** @override */
  unlayoutCallback() {
    this.destroyPlayerFrame();
    return true;
  }
}

AMP.extension('amp-connatix-player', '0.1', AMP => {
  AMP.registerElement('amp-connatix-player', AmpConnatixPlayer);
});
