/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import { isLayoutSizeDefined } from '../../../src/layout';
import { user, dev } from '../../../src/log';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import { VideoEvents } from '../../../src/video-interface';
import { Services } from '../../../src/services';
import {
  getDataParamsFromAttributes,
  removeElement,
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '../../../src/dom';
import { addParamsToUrl } from '../../../src/url';


/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpVentunoPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.playerType_ = '';

    /** @private {string} */
    this.pubid_ = '';

    /** @private {string}  */
    this.slotid_ = '';

    /** @private {?string} */
    this.title_ = null;

    /** @private {?string} */
    this.url_ = null;

    /** @private {?string} */
    this.meta_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

  }

  /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://web.ventunotech.com', opt_onLayout);
    this.preconnect.url('https://vtnfds-a.akamaihd.net', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.playerType_ = this.getPlayerType_();

    this.pubid_ = this.getPubid_();

    this.slotid_ = this.getSlotid_();

    this.title_ = this.element.getAttribute('data-title') || '';

    this.url_ = this.element.getAttribute('data-url') || '';

    this.meta_ = this.element.getAttribute('data-meta') || '';

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const src = this.getVideoIframeSrc_();

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);

    this.iframe_ = iframe;
    this.element.appendChild(this.iframe_);

    const loaded = this.loadPromise(this.iframe_).then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
    this.playerReadyResolver_(loaded);
    return loaded;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });
    return true;  // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  getPlayerType_() {
    return user().assert(
      this.element.getAttribute('data-player'),
      'The data-player attribute is required for <amp-ventuno-player> %s',
      this.element);
  }

  getPubid_() {
    return user().assert(
      this.element.getAttribute('data-pubid'),
      'The data-pubid attribute is required for <amp-ventuno-player> %s',
      this.element);
  }

  getSlotid_() {
    return user().assert(
      this.element.getAttribute('data-slotid'),
      'The data-slotid attribute is required for <amp-ventuno-player> %s',
      this.element);
  }

  /** @return {string} */
  getVideoIframeSrc_() {
    let pubid = encodeURIComponent(this.pubid_ || ''),
      slotid = encodeURIComponent(this.slotid_ || ''),
      pType = this.playerType_ || '',
      optParams = {};

    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }
    // As of now, only the 'ep' player type will be supported
    user().assert(this.playerType_ === 'ep', 'Only Editorial Player is supported');

    dev().assert(this.pubid_);
    dev().assert(this.slotid_);

    let src = `https://venwebsecure.ventunotech.com/embed/embedPlayer.html?pFrom=amp&pType=${pType}&pubKey=${pubid}&slot=${slotid}`;

    if (this.title_) {
      optParams['pTitle'] = this.title_;
    }

    if (this.url_) {
      optParams['pUrl'] = this.url_;
    }

    if (this.meta_) {
      optParams['pMeta'] = this.meta_;
    }

    src = addParamsToUrl(src, optParams);

    return this.videoIframeSrc_ = src;
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {Array=} opt_args
   * @private
   */
  sendCommand_(command) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const message = 'vtn' + command;
        this.iframe_.contentWindow./*OK*/postMessage({
          command: message,
          from: 'amp'
        }, '*');
      }
    });
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface
  /**
   * @override
   */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /**
   * @override
   */
  play(unusedIsAutoplay) {
    this.sendCommand_('Play');
  }

  /**
   * @override
   */
  pause() {
    this.sendCommand_('Pause');
  }

  /**
   * @override
   */
  mute() {
    this.sendCommand_('Mute');
  }

  /**
   * @override
   */
  unmute() {
    this.sendCommand_('UnMute');
  }

  /**
   * @override
   */
  showControls() {
    // Not supported.
  }

  /**
   * @override
   */
  hideControls() {
    // Not supported.
  }

  /**
   * @override
   */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /**
   * @override
   */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }
    fullscreenExit(dev().assertElement(this.iframe_));
  }

  /** @override */
  isFullscreen() {
    if (!this.iframe_) {
      return false;
    }
    return isFullscreenElement(dev().assertElement(this.iframe_));
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    // Youtube already updates the Media Session so no need for the video
    // manager to update it too
    return true;
  }

  /** @override */
  getCurrentTime() {
    // Not supported.
    return 0;
  }

  /** @override */
  getDuration() {
    // Not supported.
    return 1;
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

}

AMP.extension('amp-ventuno-player', '0.1', AMP => {
  AMP.registerElement('amp-ventuno-player', AmpVentunoPlayer);
});
