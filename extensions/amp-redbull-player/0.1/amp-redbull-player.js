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
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
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
    this.tagId_ = null;

    /** @private {string} */
    this.locale_ = null;

    /**
     * @param {!Event} e
     * @return {undefined}
     * @private
     */
    this.boundOnMessage_ = e => this.onMessage_(e);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    /*
     * Required Paramaters: data-video-id, data-skin
     * Break creation if required parameters are missing!
     */
    userAssert(
      element.getAttribute('data-videoid'),
      'The data-videoid attribute is required for %s',
      element
    );

    this.tagId_ = element.getAttribute('id') || 'rbvideo';
    this.locale_ = element.getAttribute('data-locale') || 'global';

    installVideoManagerForDoc(element);
  }

  /** @override */
  layoutCallback() {
    const {element} = this;

    const origin = 'https://player.redbull.com/amp/amp-iframe.html';
    const params = Object.assign(dict({}), element.dataset);
    params['ampTagId'] = this.tagId_;
    params['locale'] = this.locale_;
    const src = addParamsToUrl(origin, params);

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
    this.sendCommand_({msg: 'amp-loaded'});
    this.element.dispatchCustomEvent(VideoEvents.LOAD);
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {Object} command
   * @private
   */
  sendCommand_(command) {
    if (this.iframe_ && this.iframe_.contentWindow) {
      if (!command.id) {
        command.id = `${TAG}-${this.tagId_}`;
      }
      this.postMessage_(command);
    }
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

    if (data.id === `redbull-amp-video-tracking-${this.tagId_}`) {
      const type = ANALYTICS_EVENT_TYPE_PREFIX + data[type];
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

  /**
   * @param {!JsonObject} message
   * @private
   */
  postMessage_(message) {
    this.iframe_.contentWindow./*OK*/ postMessage(JSON.stringify(message), '*');
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
    return null;
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpRedBullPlayer);
});
