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
import {
  SandboxOptions,
  createFrameFor,
  isJsonOrObj,
  objOrParseJson,
  originMatches,
} from '../../../src/iframe-video';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {disableScrollingOnIframe} from '../../../src/iframe-helper';
import {getData, listen} from '../../../src/event-helper';
import {getDataParamsFromAttributes, removeElement} from '../../../src/dom';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

/** @private @const */
const TAG = 'amp-redbull-player';

/** @private @const */
const ANALYTICS_EVENT_TYPE_PREFIX = 'video-custom-';

/** @private @const */
const SANDBOX = [
  SandboxOptions.ALLOW_SCRIPTS,
  SandboxOptions.ALLOW_SAME_ORIGIN,
  SandboxOptions.ALLOW_POPUPS,
  SandboxOptions.ALLOW_POPUPS_TO_ESCAPE_SANDBOX,
  SandboxOptions.ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION,
];

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpRedBullPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {!UnlistenDef|null} */
    this.unlistenFrame_ = null;

    /** @private {string} */
    this.tagId_ = '';

    /**
     * @param {!Event} e
     * @return {undefined}
     * @private
     */
    this.boundOnMessage_ = (e) => this.onMessage_(e);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    /*
     * Required Paramaters: data-param-videoid
     * Break creation if required parameters are missing!
     */
    userAssert(
      element.getAttribute('data-param-videoid'),
      'The data-param-videoid attribute is required for %s',
      element
    );

    this.tagId_ = element.getAttribute('id') || 'rbvideo';

    installVideoManagerForDoc(element);
  }

  /** @override */
  layoutCallback() {
    const {element} = this;

    const params = getDataParamsFromAttributes(element);
    const videoId = params['videoid'];
    const skinId = params['skinid'] || 'com';
    const locale = params['locale'] || 'global';

    const origin = 'https://player.redbull.com/amp/amp-iframe.html';

    const src = addParamsToUrl(
      origin,
      dict({
        'videoId': videoId,
        'skinId': skinId,
        'ampTagId': this.tagId_,
        'locale': locale,
      })
    );

    this.iframe_ = disableScrollingOnIframe(
      createFrameFor(this, src, '', SANDBOX)
    );

    this.unlistenFrame_ = listen(this.win, 'message', this.boundOnMessage_);
    return this.loadPromise(this.iframe_).then(() => {
      this.onReady_();
    });
  }

  /** @private */
  onReady_() {
    Services.videoManagerForDoc(this.element).register(this);
    this.iframe_.contentWindow./*OK*/ postMessage(
      JSON.stringify(
        dict({
          'msg': 'amp-loaded',
          'id': `${TAG}-${this.tagId_}`,
        })
      ),
      '*'
    );
  }

  /** @override */
  unlayoutCallback() {
    this.removeIframe_();
    return true;
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
   * @param {!Event} event
   * @private
   */
  originMatches_(event) {
    return originMatches(event, this.iframe_, /.*/);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onMessage_(event) {
    if (!this.iframe_) {
      return;
    }

    if (!this.originMatches_(event)) {
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

    if (data['id'] === `redbull-amp-video-tracking-${this.tagId_}`) {
      const type = ANALYTICS_EVENT_TYPE_PREFIX + data['type'];
      this.dispatchCustomAnalyticsEvent_(type, data);
    }
  }

  /**
   * @param {string} eventType The eventType must be prefixed with video-custom- to prevent naming collisions with other analytics event types.
   * @param {!Object<string, string>=} vars
   */
  dispatchCustomAnalyticsEvent_(eventType, vars) {
    this.element.dispatchCustomEvent(
      VideoEvents.CUSTOM_TICK,
      dict({
        'eventType': `video-custom-tracking-${this.tagId_}`,
        'vars': vars,
      })
    );
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
    return false;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    // Not supported.
    return NaN;
  }

  /** @override */
  getDuration() {
    // Not supported.
    return NaN;
  }

  /** @override */
  getMetadata() {
    // Not supported.
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /** @override */
  play(unusedIsAutoplay) {
    // Not supported
  }

  /** @override */
  pause() {
    // Not supported
  }

  /** @override */
  mute() {
    // Not supported
  }

  /** @override */
  unmute() {
    // Not supported
  }

  /** @override */
  showControls() {
    // Not supported
  }

  /** @override */
  hideControls() {
    // Not supported
  }

  /** @override */
  fullscreenEnter() {
    // Not supported
  }

  /** @override */
  fullscreenExit() {
    // Not supported
  }

  /** @override */
  isFullscreen() {
    return false;
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    // Not supported
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpRedBullPlayer);
});
