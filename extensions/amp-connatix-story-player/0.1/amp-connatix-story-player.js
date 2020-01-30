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

import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {getData} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';
import {userAssert} from '../../../src/log';

export class AmpConnatixStoryPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.playerId_ = '';

    /** @private {string} */
    this.orientation_ = '';

    /** @private {string} */
    this.storyId_ = '';

    /** @private {string} */
    this.iframeDomain_ = 'https://cds.connatix.com';

    /** @private {string} */
    this.iframePath_ = '/p/plugins/connatix.playspace.embed.html';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /**
   * Sends a post message to the iframe where the connatix player
   * is embedded. Used for giving external commands to the player
   * (play/pause etc)
   * @private
   * @param {string} command
   */
  sendCommand_(command) {
    if (this.iframe_ && this.iframe_.contentWindow) {
      // Send message to the player
      this.iframe_.contentWindow./*OK*/ postMessage(
        command,
        this.iframeDomain_
      );
    }
  }

  /**
   * Binds to player events from iframe. In this case
   * it is used for binding to the close event which
   * triggers when a user clicks on the close button
   * on the player
   * @private
   */
  bindToPlayerCommands_() {
    this.win.addEventListener('message', e => {
      if (!this.iframe_ || e.source !== this.iframe_.contentWindow) {
        // Ignore messages from other iframes.
        return;
      }
      // Player wants to close because the user interracted on its close button
      if (getData(e) === 'cnx_close') {
        this.destroyPlayerFrame_();
        this.attemptCollapse();
      }
    });
  }

  /**
   * Removes the player iframe
   * @private
   */
  destroyPlayerFrame_() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.win) {
      this.win.removeEventListener('resize', this.sendCommand_);
    }
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    // Player id is mandatory
    this.playerId_ = userAssert(
      element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-connatix-story-player> %s',
      element
    );

    // Orientation is mandatory
    this.orientation_ = userAssert(
      element.getAttribute('data-orientation'),
      'The data-orientation attribute is required for <amp-connatix-story-player> %s',
      element
    );
    userAssert(
      this.orientation_.toLowerCase() === 'landscape' ||
        this.orientation_.toLowerCase() === 'portrait',
      'Wrong orientation value. Possible orientation values: portrait or landscape'
    );

    userAssert(
      this.layout_ === Layout.RESPONSIVE,
      'Only responsive layout is supported'
    );

    // Story id is optional
    this.storyId_ = element.getAttribute('data-story-id') || '';

    this.bindToPlayerCommands_();
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // Serves the player assets
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.iframeDomain_,
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.RESPONSIVE;
  }

  /** @override */
  layoutCallback() {
    const {element} = this;
    // Url Params for iframe source
    const urlParams = dict({
      'playerId': this.playerId_ || undefined,
      'orientation': this.orientation_ || undefined,
      'storyId': this.storyId_ || undefined,
    });
    const iframeUrl = this.iframeDomain_ + this.iframePath_;
    const src = addParamsToUrl(iframeUrl, urlParams);

    const iframe = element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;

    // applyFillContent so that frame covers the entire component.
    this.applyFillContent(iframe, /* replacedContent */ true);

    element.appendChild(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    this.win.addEventListener('resize', e =>
      this.sendCommand_({
        eventName: 'cnx_viewport_resize',
        viewportWidth: e.target.innerWidth,
        viewportHeight: e.target.innerHeight,
      })
    );
    // Return a load promise for the frame so the runtime knows when the
    // component is ready.
    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    this.sendCommand_('pause');
  }

  /** @override */
  unlayoutCallback() {
    this.destroyPlayerFrame_();
    return true;
  }
}

AMP.extension('amp-connatix-story-player', '0.1', AMP => {
  AMP.registerElement('amp-connatix-story-player', AmpConnatixStoryPlayer);
});
