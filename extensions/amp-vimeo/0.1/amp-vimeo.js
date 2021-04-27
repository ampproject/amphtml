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
import {PauseHelper} from '../../../src/utils/pause-helper';
import {Services} from '../../../src/services';
import {VideoAttributes, VideoEvents} from '../../../src/video-interface';
import {addParamToUrl} from '../../../src/url';
import {
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {dict} from '../../../src/core/types/object';
import {dispatchCustomEvent, removeElement} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isAutoplaySupported} from '../../../src/utils/video';
import {isLayoutSizeDefined} from '../../../src/layout';
import {once} from '../../../src/core/types/function';
import {userAssert} from '../../../src/log';

const TAG = 'amp-vimeo';

/**
 * Get the name of the method for a given getter or setter.
 * See https://developer.vimeo.com/player/js-api
 * @param {string} prop The name of the property.
 * @param {?string} optType Either “get” or “set”.
 * @return {string}
 */
function getMethodName(prop, optType = null) {
  if (!optType) {
    return prop;
  }
  return (
    optType.toLowerCase() + prop.substr(0, 1).toUpperCase() + prop.substr(1)
  );
}

/**
 * Maps events coming from the Vimeo frame to events to be dispatched from the
 * component element.
 *
 * If the item does not have a value, the event will not be forwarded 1:1, but
 * it will be listened to.
 *
 * @private {!Object<string, ?string>}
 */
const VIMEO_EVENTS = {
  'play': VideoEvents.PLAYING,
  'pause': VideoEvents.PAUSE,
  'ended': VideoEvents.ENDED,
  'volumechange': null,
};

const DO_NOT_TRACK_ATTRIBUTE = 'do-not-track';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpVimeo extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {function():string} */
    this.setVolumeMethod_ = once(() => getMethodName('volume', 'set'));

    /** @private {function()} */
    this.onReadyOnce_ = once(() => this.onReady_());

    /** @private {boolean} */
    this.muted_ = false;

    /**
     * @param {!Event} e
     * @return {*} TODO(#23582): Specify return type
     * @private
     */
    this.boundOnMessage_ = (e) => this.onMessage_(e);

    /** @private {!UnlistenDef|null} */
    this.unlistenFrame_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /** @override */
  preconnectCallback(onLayout = false) {
    const preconnect = Services.preconnectFor(this.win);
    const ampdoc = this.getAmpDoc();
    preconnect.url(ampdoc, 'https://player.vimeo.com', onLayout);
    // Host that Vimeo uses to serve poster frames needed by player.
    preconnect.url(ampdoc, 'https://i.vimeocdn.com', onLayout);
    // Host that Vimeo uses to serve JS, CSS and other assets needed.
    preconnect.url(ampdoc, 'https://f.vimeocdn.com', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    installVideoManagerForDoc(this.getAmpDoc());
  }

  /** @override */
  layoutCallback() {
    return this.isAutoplay_().then((isAutoplay) =>
      this.buildIframe_(isAutoplay, this.isDoNotTrack_())
    );
  }

  /**
   * @param {boolean} isAutoplay
   * @param {boolean} isDoNotTrack
   * @return {!Promise}
   * @private
   */
  buildIframe_(isAutoplay, isDoNotTrack) {
    const {element} = this;
    const vidId = userAssert(
      element.getAttribute('data-videoid'),
      'The data-videoid attribute is required for <amp-vimeo> %s',
      element
    );

    // See
    // https://developer.vimeo.com/player/embedding

    let src = `https://player.vimeo.com/video/${encodeURIComponent(vidId)}`;

    if (isAutoplay) {
      // Only muted videos are allowed to autoplay
      this.muted_ = true;
      src = addParamToUrl(src, 'muted', '1');
    }

    if (isDoNotTrack) {
      src = addParamToUrl(src, 'dnt', '1');
    }

    const iframe = createFrameFor(this, src);

    this.iframe_ = iframe;
    this.unlistenFrame_ = listen(this.win, 'message', this.boundOnMessage_);

    this.sendCommand_('ping');

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    this.removeIframe_();
    this.pauseHelper_.updatePlaying(false);
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

  /**
   * @return {!Promise<boolean>}
   * @private
   */
  isAutoplay_() {
    if (!this.element.hasAttribute(VideoAttributes.AUTOPLAY)) {
      return Promise.resolve(false);
    }
    return isAutoplaySupported(this.win);
  }

  /**
   * @return {boolean}
   * @private
   */
  isDoNotTrack_() {
    return this.element.hasAttribute(DO_NOT_TRACK_ATTRIBUTE);
  }

  /** @private */
  onReady_() {
    const {element} = this;

    Object.keys(VIMEO_EVENTS).forEach((event) => {
      this.sendCommand_('addEventListener', event);
    });

    Services.videoManagerForDoc(element).register(this);

    dispatchCustomEvent(element, VideoEvents.LOAD);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onMessage_(event) {
    if (
      !originMatches(
        event,
        this.iframe_,
        /^(https?:)?\/\/((player|www)\.)?vimeo.com(?=$|\/)/
      )
    ) {
      return;
    }

    const eventData = getData(event);
    if (!isJsonOrObj(eventData)) {
      return;
    }

    const data = objOrParseJson(eventData);

    if (data == null) {
      return; // we only process valid json
    }

    if (data['event'] == 'ready' || data['method'] == 'ping') {
      this.onReadyOnce_();
      return;
    }

    const {element} = this;

    switch (data['event']) {
      case 'play':
        this.pauseHelper_.updatePlaying(true);
        break;
      case 'pause':
      case 'ended':
        this.pauseHelper_.updatePlaying(false);
        break;
    }

    if (redispatch(element, data['event'], VIMEO_EVENTS)) {
      return;
    }

    if (data['event'] == 'volumechange') {
      const volume = data['data'] && data['data']['volume'];
      if (!volume) {
        return;
      }
      const muted = volume <= 0;
      if (muted == this.muted_) {
        return;
      }
      this.muted_ = muted;
      dispatchCustomEvent(element, mutedOrUnmutedEvent(muted));
      return;
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
    if (this.muted_) {
      // We need to check if already muted to prevent an initial mute() call
      // that would disable autoplay on iOS.
      return;
    }
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
    // The Vimeo player embedded in the frame hooks into the API directly.
    return true;
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
    contentWindow./*OK*/ postMessage(
      JSON.stringify(
        dict({
          'method': method,
          'value': optParams || '',
        })
      ),
      '*'
    );
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpVimeo);
});
