import {BUBBLE_MESSAGE_EVENTS} from '#bento/apis/video-iframe-api';

import {Deferred} from '#core/data-structures/promise';
import {
  dispatchCustomEvent,
  getDataParamsFromAttributes,
  removeElement,
} from '#core/dom';
import {isFullscreenElement} from '#core/dom/fullscreen';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {measureIntersection} from '#core/dom/layout/intersection';
import {PauseHelper} from '#core/dom/video/pause-helper';
import {once} from '#core/types/function';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {getConsentDataToForward} from '../../../src/consent';
import {
  disableScrollingOnIframe,
  looksLikeTrackingIframe,
} from '../../../src/iframe-helper';
import {
  SandboxOptions_Enum,
  createFrameFor,
  isJsonOrObj,
  objOrParseJson,
  originMatches,
} from '../../../src/iframe-video';
import {addParamsToUrl} from '../../../src/url';
import {
  MIN_VISIBILITY_RATIO_FOR_AUTOPLAY,
  VideoEvents_Enum,
} from '../../../src/video-interface';

/** @private @const */
const TAG = 'amp-video-iframe';

/** @private @const */
const ANALYTICS_EVENT_TYPE_PREFIX = 'video-custom-';

/** @private @const */
const SANDBOX = [
  SandboxOptions_Enum.ALLOW_SCRIPTS,
  SandboxOptions_Enum.ALLOW_SAME_ORIGIN,
  SandboxOptions_Enum.ALLOW_POPUPS,
  SandboxOptions_Enum.ALLOW_POPUPS_TO_ESCAPE_SANDBOX,
  SandboxOptions_Enum.ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION,
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

/**
 * @param {!Node} root
 * @return {?JsonObject}
 */
export function getJsonLd(root) {
  const scriptTag = root.querySelector('script[type="application/ld+json"]');
  return scriptTag && tryParseJson(scriptTag.textContent);
}

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpVideoIframe extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenFrame_ = null;

    /** @private {?Deferred} */
    this.readyDeferred_ = null;

    /** @private {boolean} */
    this.canPlay_ = false;

    /**
     * @param {!Event} e
     * @return {undefined}
     * @private
     */
    this.boundOnMessage_ = (e) => this.onMessage_(e);

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
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
    const {canonicalUrl, sourceUrl} = Services.documentInfoForDoc(this.element);
    const rootNode = this.getAmpDoc().getRootNode();
    const {documentElement, title} = rootNode;

    return {
      'sourceUrl': sourceUrl,
      'canonicalUrl': canonicalUrl,
      'title': title || null,
      'lang': documentElement?.lang || null,
      'jsonLd': getJsonLd(rootNode),
    };
  }

  /** @private */
  onReady_() {
    const {element} = this;
    Services.videoManagerForDoc(element).register(this);
    dispatchCustomEvent(element, VideoEvents_Enum.LOAD);
  }

  /** @override */
  createPlaceholderCallback() {
    const {element} = this;
    const poster = element.getAttribute('poster');
    if (!poster) {
      return null;
    }
    const img = new Image();
    img.src = addDataParamsToUrl(poster, element);
    img.setAttribute('loading', 'lazy');
    img.setAttribute('placeholder', '');
    applyFillContent(img);
    return img;
  }

  /** @override */
  unlayoutCallback() {
    this.canPlay_ = false;
    this.removeIframe_();
    this.pauseHelper_.updatePlaying(false);
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
   * @return {!Promise|undefined}
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

    // Expected message format:
    //
    // @typedef {{
    //   id: number,
    //   method: (undefined|string),
    //   event: (undefined|string),
    //   analytics: (undefined|{
    //     eventType: string,
    //     vars: {[key: string]: string},
    //   }),
    // }}

    const methodReceived = data['method'];

    if (methodReceived) {
      const messageId = data['id'];
      if (methodReceived == 'getIntersection') {
        return measureIntersection(this.element).then((intersection) => {
          this.postIntersection_(messageId, intersection);
        });
      }
      if (methodReceived === 'getConsentData') {
        this.postConsentData_(messageId);
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

    switch (eventReceived) {
      case 'playing':
        this.pauseHelper_.updatePlaying(true);
        break;
      case 'pause':
      case 'ended':
        this.pauseHelper_.updatePlaying(false);
        break;
    }

    if (BUBBLE_MESSAGE_EVENTS.indexOf(eventReceived) > -1) {
      dispatchCustomEvent(this.element, eventReceived);
      return;
    }
  }

  /**
   * @param {string} eventType
   * @param {!{[key: string]: string}=} vars
   */
  dispatchCustomAnalyticsEvent_(eventType, vars = {}) {
    user().assertString(eventType, '`eventType` missing in analytics event');

    userAssert(
      getAnalyticsEventTypePrefixRegex().test(eventType),
      'Invalid analytics `eventType`. Value must start with `%s`.',
      ANALYTICS_EVENT_TYPE_PREFIX
    );

    dispatchCustomEvent(this.element, VideoEvents_Enum.CUSTOM_TICK, {
      'eventType': eventType,
      'vars': vars,
    });
  }

  /**
   * @param {number} messageId
   * @param {!IntersectionObserverEntry} intersection
   * @private
   */
  postIntersection_(messageId, intersection) {
    const {intersectionRatio, time} = intersection;

    // Only post ratio > 0 when in autoplay range to prevent internal autoplay
    // implementations that differ from ours.
    const postedRatio =
      intersectionRatio < MIN_VISIBILITY_RATIO_FOR_AUTOPLAY
        ? 0
        : intersectionRatio;

    this.postMessage_({
      'id': messageId,
      'args': {
        'intersectionRatio': postedRatio,
        'time': time,
      },
    });
  }

  /**
   * @param {number} messageId
   * @private
   */
  postConsentData_(messageId) {
    getConsentDataToForward(this.element, this.getConsentPolicy()).then(
      (consentData) => {
        this.postMessage_({'id': messageId, 'args': consentData});
      }
    );
  }

  /**
   * @param {string} method
   * @private
   */
  method_(method) {
    const {promise} = this.readyDeferred_ || {};
    if (!promise) {
      return;
    }
    promise.then(() => {
      this.postMessage_({
        'event': 'method',
        'method': method,
      });
    });
  }

  /**
   * @param {!JsonObject} message
   * @private
   */
  postMessage_(message) {
    if (!this.iframe_ || !this.iframe_.contentWindow) {
      return;
    }
    this.iframe_.contentWindow./*OK*/ postMessage(JSON.stringify(message), '*');
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
