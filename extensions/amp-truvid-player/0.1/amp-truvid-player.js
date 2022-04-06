import {Deferred} from '#core/data-structures/promise';
import {dispatchCustomEvent, removeElement} from '#core/dom';
import {applyFillContent, Layout_Enum} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {getConsentMetadata, getConsentPolicyInfo} from '../../../src/consent';
import {disableScrollingOnIframe} from '../../../src/iframe-helper';
import {
  addUnsafeAllowAutoplay,
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {addParamsToUrl} from '../../../src/url';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-truvid-player';

const TRUVIDPLAYER_EVENTS = {
  'playerReady': VideoEvents_Enum.LOAD,
  'onVideoPlay': VideoEvents_Enum.PLAYING,
  'onVideoPause': VideoEvents_Enum.PAUSE,
  'onVideoEnd': VideoEvents_Enum.ENDED,
  'adImpression': VideoEvents_Enum.AD_START,
  'onAdEnd': VideoEvents_Enum.AD_END,
  'onMute': VideoEvents_Enum.MUTED,
  'onUnmute': VideoEvents_Enum.UNMUTED,
};

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
export class AmpTruvidPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.widgetID_ = '';

    /** @private {string} */
    this.orgID_ = '';

    /** @private {string} */
    this.videoID_ = '';

    /** @private {string} */
    this.playlistID_ = '';

    /** @private {string} */
    this.consentString_ = '';

    /** @private {Object} */
    this.consentMetadata_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

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
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://stg.truvidplayer.com',
      opt_onLayout
    );
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://cnt.trvdp.com',
      opt_onLayout
    );
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://s.trvdp.com',
      opt_onLayout
    );
  }

  /** @override */
  getCurrentTime() {
    return null;
  }

  /** @override */
  getDuration() {
    return null;
  }

  /** @override */
  play() {
    this.sendCommand_('play');
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
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
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    this.videoID_ = element.getAttribute('data-video-id');
    this.playlistID_ = element.getAttribute('data-playlist-id');
    this.orgID_ = userAssert(
      element.getAttribute('data-org-id'),
      'the data-org-id attribute is required for <amp-truvidplayer> %s',
      element
    );
    this.widgetID_ = userAssert(
      element.getAttribute('data-widget-id'),
      'the data-widget-id attribute is required for <amp-truvidplayer> %s',
      element
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
    this.playerReadyResolver_(this.iframe_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.RESPONSIVE;
  }

  /** @override */
  layoutCallback() {
    this.getConsentData_().then(() => {
      const queryParams = {
        'consentString': this.consentString_ || undefined,
        'gdprApplies': this.consentMetadata_?.gdprApplies || undefined,
        'video_id': this.videoID_ || undefined,
        'widget_id': this.widgetID_ || undefined,
        'playlist_id': this.playlistID_ || undefined,
        'sub_user_id': this.orgID_ || undefined,
      };

      const url = 'https://stg.truvidplayer.com/services/amp/0.1/amp.php';
      const src = addParamsToUrl(url, queryParams);

      const frame = disableScrollingOnIframe(
        createFrameFor(this, src, this.element.id)
      );

      addUnsafeAllowAutoplay(frame);
      disableScrollingOnIframe(frame);
      // Subscribe to message from player

      this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handleTruvidMessages_.bind(this)
      );

      return this.mutateElement(() => {
        this.iframe_ = frame;
        applyFillContent(frame);
      }).then(() => {
        return this.playerReadyPromise_;
      });
    });
  }

  /**
   * @param {!Event|{data: !JsonObject}} event
   * @return {?JsonObject|string|undefined}
   * @private
   * */
  handleTruvidMessages_(event) {
    const message = getData(event);
    if (!isJsonOrObj(message)) {
      return;
    }
    const eventData = objOrParseJson(message);
    if (
      !eventData ||
      event.source !== (this.iframe_ && this.iframe_.contentWindow) ||
      eventData['source'] !== 'TruvidPlayer'
    ) {
      return;
    }

    const action = eventData['action'];
    if (action) {
      if (redispatch(this.element, action, TRUVIDPLAYER_EVENTS)) {
        if (action == 'onMute') {
          dispatchCustomEvent(this.element, mutedOrUnmutedEvent(true));
        } else if (action == 'onUnmute') {
          dispatchCustomEvent(this.element, mutedOrUnmutedEvent(false));
        }
      }
    }
  }

  /** @override */
  isFullscreen() {
    return false;
  }

  /**
   * @param {string} method
   * @param {number|boolean|string|Object|undefined} [optParams]
   * @private
   */
  sendCommand_(method, optParams) {
    this.playerReadyPromise_.then(() =>
      this.postCommandMessage_(method, optParams)
    );
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }

  /**
   * @param {string} method
   * @param {number|boolean|string|Object|undefined} [optParams]
   * @private
   */
  postCommandMessage_(method, optParams) {
    if (!this.iframe_ || !this.iframe_.contentWindow) {
      return;
    }

    this.iframe_.contentWindow./*OK*/ postMessage(
      JSON.stringify({
        'method': method,
        'optParams': optParams,
      }),
      '*'
    );
  }

  /**
   * @private
   * @return {Promise}
   */
  getConsentData_() {
    const self = this;
    return new Promise(function (resolve) {
      getConsentPolicyInfo(self.element).then(function (consentString) {
        self.consentString_ = consentString;
      });
      getConsentMetadata(self.element).then(function (metadata) {
        self.consentMetadata_ = metadata;
        resolve();
      });
    });
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('img');
    propagateAttributes(['aria-label'], this.element, placeholder);
    applyFillContent(placeholder);
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    if (placeholder.hasAttribute('aria-label')) {
      placeholder.setAttribute(
        'alt',
        'Loading video - ' + placeholder.getAttribute('aria-label')
      );
    } else {
      placeholder.setAttribute('alt', 'Loading video');
    }
    placeholder.setAttribute('loading', 'lazy');
    placeholder.setAttribute(
      'src',
      'https://cnt.trvdp.com/truvid_default/640X480.jpg'
    );
    return placeholder;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
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
    return true;
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /**
   * @override
   */
  fullscreenEnter() {
    return false;
  }

  /**
   * @override
   */
  fullscreenExit() {
    return false;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpTruvidPlayer);
});

export default AmpTruvidPlayer;
