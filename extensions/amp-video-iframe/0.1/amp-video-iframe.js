/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Deferred} from '../../../src/utils/promise';
import {
  MIN_VISIBILITY_RATIO_FOR_AUTOPLAY,
  VideoEvents,
} from '../../../src/video-interface';
import {
  SandboxOptions,
  createFrameFor,
  isJsonOrObj,
  objOrParseJson,
  originMatches,
} from '../../../src/iframe-video';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {
  createElementWithAttributes,
  getDataParamsFromAttributes,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  disableScrollingOnIframe,
  looksLikeTrackingIframe,
} from '../../../src/iframe-helper';
import {getData, listen} from '../../../src/event-helper';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {once} from '../../../src/utils/function';

/** @private @const */
const TAG = 'amp-video-iframe';

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

/**
 * Events allowed to be dispatched from messages.
 * @private @const
 */
export const BUBBLE_MESSAGE_EVENTS = [
  VideoEvents.PLAYING,
  VideoEvents.PAUSE,
  VideoEvents.ENDED,
  VideoEvents.MUTED,
  VideoEvents.UNMUTED,
  VideoEvents.AD_START,
  VideoEvents.AD_END,
];

/**
 * @return {!RegExp}
 * @private
 */
const getAnalyticsEventTypePrefixRegex = once(
  () => new RegExp(`^${ANALYTICS_EVENT_TYPE_PREFIX}`)
);

/**
 * @param {string} url
 * @param {!Element} element
 * @return {string}
 * @private
 */
const addDataParamsToUrl = (url, element) =>
  addParamsToUrl(url, getDataParamsFromAttributes(element));

/**
 * @param {string} src
 * @return {string}
 */
function maybeAddAmpFragment(src) {
  if (src.indexOf('#') > -1) {
    return src;
  }
  return `${src}#amp=1`;
}

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpVideoIframe extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {!UnlistenDef|null} */
    this.unlistenFrame_ = null;

    /** @private {?Deferred} */
    this.readyDeferred_ = null;

    /** @private {boolean} */
    this.canPlay_ = false;

    /**
     * @param {!Event} e
     * @return {*} TODO(#23582): Specify return type
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
    installVideoManagerForDoc(this.element);
  }

  /** @override */
  layoutCallback() {
    this.user().assert(
      !looksLikeTrackingIframe(this.element),
      '<amp-video-iframe> does not allow tracking iframes. ' +
        'Please use amp-analytics instead.'
    );

    const name = JSON.stringify(this.getMetadata_());

    this.iframe_ = disableScrollingOnIframe(
      createFrameFor(this, this.getSrc_(), name, SANDBOX)
    );

    this.unlistenFrame_ = listen(this.win, 'message', this.boundOnMessage_);
    return this.createReadyPromise_().then(() => this.onReady_());
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (mutations['src']) {
      this.updateSrc_();
    }
  }

  /** @private */
  updateSrc_() {
    const iframe = this.iframe_;

    if (!iframe || iframe.src == this.getSrc_()) {
      return;
    }

    iframe.src = this.getSrc_();
  }

  /**
   * @return {!JsonObject}
   * @private
   */
  getMetadata_() {
    const {sourceUrl, canonicalUrl} = Services.documentInfoForDoc(this.element);

    return dict({
      'sourceUrl': sourceUrl,
      'canonicalUrl': canonicalUrl,
    });
  }

  /** @private */
  onReady_() {
    const {element} = this;
    Services.videoManagerForDoc(element).register(this);
    element.dispatchCustomEvent(VideoEvents.LOAD);
  }

  /** @override */
  createPlaceholderCallback() {
    const {element} = this;
    const src = addDataParamsToUrl(
      user().assertString(element.getAttribute('poster')),
      element
    );
    return createElementWithAttributes(
      devAssert(element.ownerDocument),
      'amp-img',
      dict({
        'src': src,
        'layout': 'fill',
        'placeholder': '',
      })
    );
  }

  /** @override */
  unlayoutCallback() {
    this.canPlay_ = false;
    this.removeIframe_();
    return true; // layout again.
  }

  /** @private */
  removeIframe_() {
    this.canPlay_ = false;

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
  getSrc_() {
    const {element} = this;
    const urlService = Services.urlForDoc(element);
    const src = element.getAttribute('src');

    if (urlService.getSourceOrigin(src) === urlService.getWinOrigin(this.win)) {
      user().warn(
        TAG,
        'Origins of document inside amp-video-iframe and the host are the ' +
          'same, which allows for same-origin behavior. However in AMP ' +
          "cache, origins won't match. Please ensure you do not rely on any " +
          'same-origin privileges.',
        element
      );
    }

    return maybeAddAmpFragment(addDataParamsToUrl(src, element));
  }

  /**
   * @return {!Promise}
   * @private
   */
  createReadyPromise_() {
    this.readyDeferred_ = new Deferred();
    return this.readyDeferred_.promise;
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

    const messageId = data['id'];
    const methodReceived = data['method'];

    if (methodReceived) {
      if (methodReceived == 'getIntersection') {
        this.postIntersection_(messageId);
        return;
      }
      userAssert(false, 'Unknown method `%s`.', methodReceived);
      return;
    }

    const eventReceived = data['event'];
    const isCanPlayEvent = eventReceived == 'canplay';

    this.canPlay_ = this.canPlay_ || isCanPlayEvent;

    const {reject, resolve} = devAssert(this.readyDeferred_);

    if (isCanPlayEvent) {
      return resolve();
    }

    if (eventReceived == 'error' && !this.canPlay_) {
      return reject('Received `error` event.');
    }

    if (eventReceived == 'analytics') {
      const spec = devAssert(data['analytics']);
      this.dispatchCustomAnalyticsEvent_(spec['eventType'], spec['vars']);
      return;
    }

    if (BUBBLE_MESSAGE_EVENTS.indexOf(eventReceived) > -1) {
      this.element.dispatchCustomEvent(eventReceived);
      return;
    }
  }

  /**
   * @param {string} eventType
   * @param {!Object<string, string>=} vars
   */
  dispatchCustomAnalyticsEvent_(eventType, vars = {}) {
    user().assertString(eventType, '`eventType` missing in analytics event');

    userAssert(
      getAnalyticsEventTypePrefixRegex().test(eventType),
      'Invalid analytics `eventType`. Value must start with `%s`.',
      ANALYTICS_EVENT_TYPE_PREFIX
    );

    this.element.dispatchCustomEvent(
      VideoEvents.CUSTOM_TICK,
      dict({
        'eventType': eventType,
        'vars': vars,
      })
    );
  }

  /**
   * @param {number} messageId
   * @private
   */
  postIntersection_(messageId) {
    const {time, intersectionRatio} = this.element.getIntersectionChangeEntry();

    // Only post ratio > 0 when in autoplay range to prevent internal autoplay
    // implementations that differ from ours.
    const postedRatio =
      intersectionRatio < MIN_VISIBILITY_RATIO_FOR_AUTOPLAY
        ? 0
        : intersectionRatio;

    this.postMessage_(
      dict({
        'id': messageId,
        'args': {
          'intersectionRatio': postedRatio,
          'time': time,
        },
      })
    );
  }

  /**
   * @param {string} method
   * @private
   */
  method_(method) {
    this.postMessage_(
      dict({
        'event': 'method',
        'method': method,
      })
    );
  }

  /**
   * @param {!JsonObject} message
   * @private
   */
  postMessage_(message) {
    const promise = this.readyDeferred_ && this.readyDeferred_.promise;
    if (!promise) {
      return;
    }
    promise.then(() => {
      if (!this.iframe_ || !this.iframe_.contentWindow) {
        return;
      }
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify(message),
        '*'
      );
    });
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  pause() {
    this.method_('pause');
  }

  /** @override */
  play() {
    this.method_('play');
  }

  /** @override */
  mute() {
    this.method_('mute');
  }

  /** @override */
  unmute() {
    this.method_('unmute');
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
    return this.element.hasAttribute('implements-media-session');
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return this.element.hasAttribute('implements-rotate-to-fullscreen');
  }

  /** @override */
  fullscreenEnter() {
    this.method_('fullscreenenter');
  }

  /** @override */
  fullscreenExit() {
    this.method_('fullscreenexit');
  }

  /** @override */
  isFullscreen() {
    // TODO(alanorozco): Make this accurate on iOS (i.e. async API).
    if (!this.iframe_) {
      return false;
    }
    return isFullscreenElement(dev().assertElement(this.iframe_));
  }

  /** @override */
  showControls() {
    this.method_('showcontrols');
  }

  /** @override */
  hideControls() {
    this.method_('hidecontrols');
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

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpVideoIframe);
});
