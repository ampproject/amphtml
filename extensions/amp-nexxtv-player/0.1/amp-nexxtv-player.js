import {Deferred} from '#core/data-structures/promise';
import {removeElement} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, userAssert} from '#utils/log';

import {getConsentPolicyInfo} from '../../../src/consent';
import {
  createFrameFor,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {addParamsToUrl, assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-nexxtv-player';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpNexxtvPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /**@private {?string} */
    this.origin_ = 'https://embed.nexx.cloud/';

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.origin_,
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  playerReady_(data) {
    this.playerReadyResolver_(this.iframe_);

    dev().info(TAG, 'nexx player ready', data);
  }

  /**
   * @return {string}
   * @private
   */
  getVideoIframeSrc_(consentString) {
    const {element: el} = this;

    const {
      client,
      disableAds,
      domainId,
      exitMode,
      mediaid,
      mode,
      streamingFilter,
      streamtype,
    } = el.dataset;

    const clientId = userAssert(
      client || domainId,
      'One of data-client or data-domain-id attributes is required for <amp-nexxtv-player> %s',
      el
    );

    userAssert(
      mediaid,
      'The data-mediaid attribute is required for <amp-nexxtv-player> %s',
      el
    );

    const url =
      this.origin_ +
      [clientId, streamtype, mediaid].map(encodeURIComponent).join('/');

    return assertAbsoluteHttpOrHttpsUrl(
      addParamsToUrl(url, {
        'dataMode': mode,
        'platform': 'amp',
        'disableAds': disableAds,
        'streamingFilter': streamingFilter,
        'exitMode': exitMode,
        'consentString': consentString,
      })
    );
  }

  /**
   * Get consent data from consent module
   * @return {!Promise<string>}
   */
  getConsentPolicyInfo_() {
    const consentPolicy = this.getConsentPolicy() || 'default';
    return getConsentPolicyInfo(this.element, consentPolicy);
  }

  /** @override */
  layoutCallback() {
    return this.getConsentPolicyInfo_().then((consentString) => {
      this.iframe_ = createFrameFor(
        this,
        this.getVideoIframeSrc_(consentString)
      );
      this.unlistenMessage_ = listen(this.win, 'message', (event) => {
        this.handleNexxMessage_(event);
      });
      this.pauseHelper_.updatePlaying(true);

      return this.loadPromise(this.iframe_);
    });
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }

    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    this.pauseHelper_.updatePlaying(false);

    return true;
  }

  /**
   * @param  {string} command
   * @private
   */
  sendCommand_(command) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(
          {
            'cmd': command,
          },
          '*'
        );
      }
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleNexxMessage_(event) {
    const eventData = getData(event);
    if (!eventData || event.source !== this.iframe_.contentWindow) {
      return;
    }

    const data = objOrParseJson(eventData);
    if (data == null) {
      return;
    }

    const eventType = data['event'];
    if (!eventType) {
      return;
    }

    if (eventType === 'playerready') {
      this.playerReady_(data);
    }

    redispatch(this.element, eventType, {
      'ready': VideoEvents_Enum.LOAD,
      'play': VideoEvents_Enum.PLAYING,
      'pause': VideoEvents_Enum.PAUSE,
      'mute': VideoEvents_Enum.MUTED,
      'unmute': VideoEvents_Enum.UNMUTED,
    });
  }

  // VideoInterface Implementation

  /** @override */
  play() {
    this.sendCommand_('play');
  }

  /** @override */
  pause() {
    if (this.iframe_) {
      this.sendCommand_('pause');
    }
  }

  /** @override */
  mute() {
    this.sendCommand_('mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('unmute');
  }

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  showControls() {
    // Not implemented
  }

  /** @override */
  hideControls() {
    // Not implemented
  }

  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /** @override */
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
    return false;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
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

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpNexxtvPlayer);
});
