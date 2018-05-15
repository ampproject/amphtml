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
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {dict} from '../../../src/utils/object';
import {htmlFor} from '../../../src/static-template';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {once} from '../../../src/utils/function';
import {user} from '../../../src/log';


/**
 * Get the name of the method for a given getter or setter.
 *
 * @param {string} prop The name of the property.
 * @param {?string} optType Either “get” or “set”.
 * @return {string}
 */
// See
// https://developer.vimeo.com/player/js-api
function getMethodName(prop, optType = null) {
  if (!optType) {
    return prop;
  }
  return optType.toLowerCase() + prop.substr(0, 1).toUpperCase() +
    prop.substr(1);
}


/** @implements {../../../src/video-interface.VideoInterface} */
class AmpVimeo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {function():string} */
    this.setVolume_ = once(() => getMethodName('volume', 'set'));
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://player.vimeo.com', onLayout);
    // Host that Vimeo uses to serve poster frames needed by player.
    this.preconnect.url('https://i.vimeocdn.com', onLayout);
    // Host that Vimeo uses to serve JS, CSS and other assets needed.
    this.preconnect.url('https://f.vimeocdn.com', onLayout);
  }

  /**
   * @override
   * @inheritdoc
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @override
   * @inheritdoc
   */
  buildCallback() {
    installVideoManagerForDoc(this.getAmpDoc());
  }

  /**
   * @override
   * @inheritdoc
   */
  layoutCallback() {
    const vidId = user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-vimeo> %s',
        this.element);
    // See
    // https://developer.vimeo.com/player/embedding
    const {element} = this;
    const iframe =
        htmlFor(element)`<iframe frameborder=0 alllowfullscreen></iframe>`;
    iframe.src = `https://player.vimeo.com/video/${encodeURIComponent(vidId)}`;
    this.applyFillContent(iframe);
    element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe).then(() => {
      Services.videoManagerForDoc(element).register(this);
      element.dispatchCustomEvent(VideoEvents.LOAD);
    });
  }

  /**
   * @override
   * @inheritdoc
   */
  pauseCallback() {
    this.pause();
  }

  /**
   * @override
   * @inheritdoc
   */
  pause() {
    this.sendCommand_('pause');
  }

  /**
   * @override
   * @inheritdoc
   */
  play() {
    this.sendCommand_('play');
  }

  /**
   * @override
   * @inheritdoc
   */
  mute() {
    this.sendCommand_(this.setVolume_(), '0');
  }

  /**
   * @override
   * @inheritdoc
   */
  unmute() {
    // TODO(alanorozco): Set based on volume before unmuting.
    this.sendCommand_(this.setVolume_(), '1');
  }

  /**
   * @override
   * @inheritdoc
   */
  isInteractive() {
    return true;
  }

  /**
   * @override
   * @inheritdoc
   */
  supportsPlatform() {
    return true;
  }

  /**
   * @override
   * @inheritdoc
   */
  preimplementsMediaSessionAPI() {
    // TODO(alanorozco): dis tru?
    return false;
  }

  /**
   * @override
   * @inheritdoc
   */
  preimplementsAutoFullscreen() {
    return false;
  }

  /**
   * @override
   * @inheritdoc
   */
  fullscreenEnter() {
    // NOOP. Not implemented by Vimeo.
  }

  /**
   * @override
   * @inheritdoc
   */
  fullscreenExit() {
    // NOOP. Not implemented by Vimeo.
  }

  /**
   * @override
   * @inheritdoc
   */
  isFullscreen() {
    return false;
  }

  /**
   * @override
   * @inheritdoc
   */
  showControls() {
    // Not implemented by Vimeo.
  }

  /**
   * @override
   * @inheritdoc
   */
  hideControls() {
    // Not implemented by Vimeo.
  }

  /**
   * @override
   * @inheritdoc
   */
  getMetadata() {
    // TODO(alanorozco)
  }

  /**
   * @override
   * @inheritdoc
   */
  getDuration() {
    // TODO(alanorozco)
    return 0;
  }

  /**
   * @override
   * @inheritdoc
   */
  getCurrentTime() {
    // TODO(alanorozco)
    return 0;
  }

  /**
   * @override
   * @inheritdoc
   */
  getPlayedRanges() {
    // TODO(alanorozco)
    return [];
  }

  /**
   * @param {string} method
   * @param {?Object|string=} optParams
   * @private
   */
  sendCommand_(method, optParams = null) {
    // See
    // https://developer.vimeo.com/player/js-api
    if (!this.iframe_) {
      return;
    }
    const {contentWindow} = this.iframe_;
    if (!contentWindow) {
      return;
    }
    contentWindow./*OK*/postMessage(JSON.stringify(dict({
      'method': method,
      'value': optParams || '',
    })), '*');
  }
}


AMP.extension('amp-vimeo', '0.1', AMP => {
  AMP.registerElement('amp-vimeo', AmpVimeo);
});
