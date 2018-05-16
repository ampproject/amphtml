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
import {getData, listen} from '../../../src/event-helper';
import {htmlFor} from '../../../src/static-template';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isObject} from '../../../src/types';
import {once} from '../../../src/utils/function';
import {removeElement} from '../../../src/dom';
import {startsWith} from '../../../src/string';
import {tryParseJson} from '../../../src/json';
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


/**
 * @param {string} url
 * @return {boolean}
 */
export function isVimeoUrl(url) {
  return (/^(https?:)?\/\/((player|www).)?vimeo.com(?=$|\/)/).test(url);
}


/**
 * @param {?} anything
 * @return {boolean}
 */
function isJsonOrObj(anything) {
  return anything && (
    isObject(anything) || startsWith(/** @type {string} */ (anything), '{'));
}


/** @private {!Object<string, string>} */
const VIMEO_EVENTS = {
  'play': VideoEvents.PLAYING,
  'pause': VideoEvents.PAUSED,
  'ended': VideoEvents.ENDED,
};


/** @implements {../../../src/video-interface.VideoInterface} */
class AmpVimeo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {function():string} */
    this.setVolumeMethod_ = once(() => getMethodName('volume', 'set'));

    /**
     * @param {!Event} e
     * @private
     */
    this.boundOnMessage_ = e => this.onMessage_(e);

    /** @private {!UnlistenDef|null} */
    this.unlistenFrame_ = null;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    const {preconnect} = this;
    preconnect.url('https://player.vimeo.com', onLayout);
    // Host that Vimeo uses to serve poster frames needed by player.
    preconnect.url('https://i.vimeocdn.com', onLayout);
    // Host that Vimeo uses to serve JS, CSS and other assets needed.
    preconnect.url('https://f.vimeocdn.com', onLayout);
  }

  /**
   * @override
   * @inheritdoc
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    installVideoManagerForDoc(this.getAmpDoc());
  }

  /** @override */
  layoutCallback() {
    const {element} = this;
    const vidId = user().assert(
        element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-vimeo> %s',
        element);

    // See
    // https://developer.vimeo.com/player/embedding
    const iframe =
        htmlFor(element)`<iframe frameborder=0 alllowfullscreen></iframe>`;

    iframe.src = `https://player.vimeo.com/video/${encodeURIComponent(vidId)}`;

    this.applyFillContent(iframe);
    element.appendChild(iframe);

    this.iframe_ = iframe;
    this.unlistenFrame_ = listen(this.win, 'message', this.boundOnMessage_);

    this.sendCommand_('ping');

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    this.removeIframe_();
    return true; // layout again.
  }

  /** @private */
  removeIframe_() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlistenFrame_) {
      this.unlistenFrame_();
      this.unlistenFrame_ = null;
    }
  }

  /** @private */
  onReady_() {
    const {element} = this;

    Services.videoManagerForDoc(element).register(this);
    element.dispatchCustomEvent(VideoEvents.LOAD);

    [Object.keys(VIMEO_EVENTS)].forEach(event =>
      this.sendCommand_('addEventListener', event));
  }

  /**
   * @param {!Event} event
   * @private
   */
  onMessage_(event) {
    if (!isVimeoUrl(event.origin)) {
      return;
    }

    if (event.source !== this.iframe_.contentWindow) {
      return;
    }

    const eventData = getData(event);

    if (!isJsonOrObj(eventData)) {
      return;
    }

    const data = /** @type {?JsonObject} */ (
      isObject(eventData) ? eventData : tryParseJson(eventData));

    if (data['event'] == 'ready' || data['method'] == 'ping') {
      this.onReady_();
      return;
    }

    const {element} = this;

    const eventToDispatch = VIMEO_EVENTS[data['event']];
    if (eventToDispatch) {
      element.dispatchCustomEvent(eventToDispatch);
    }
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  play() {
    this.sendCommand_('play');
  }

  /** @override */
  mute() {
    this.sendCommand_(this.setVolumeMethod_(), '0');
  }

  /** @override */
  unmute() {
    // TODO(alanorozco): Set based on volume before unmuting.
    this.sendCommand_(this.setVolumeMethod_(), '1');
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    // TODO(alanorozco): dis tru?
    return false;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  fullscreenEnter() {
    // NOOP. Not implemented by Vimeo.
  }

  /** @override */
  fullscreenExit() {
    // NOOP. Not implemented by Vimeo.
  }

  /** @override */
  isFullscreen() {
    return false;
  }

  /** @override */
  showControls() {
    // NOOP. Not implemented by Vimeo.
  }

  /** @override */
  hideControls() {
    // NOOP. Not implemented by Vimeo.
  }

  /** @override */
  getMetadata() {
    // TODO(alanorozco)
  }

  /** @override */
  getDuration() {
    // TODO(alanorozco)
    return 0;
  }

  /** @override */
  getCurrentTime() {
    // TODO(alanorozco)
    return 0;
  }

  /** @override */
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
